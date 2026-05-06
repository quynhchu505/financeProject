from calendar import monthrange
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.core.metrics import TRANSACTION_CREATED_TOTAL
from app.models.models import (
    Alert,
    Account,
    Budget,
    BudgetPeriod,
    Category,
    MLLog,
    Transaction,
    TransactionType,
    User,
)
from app.schemas.schemas import (
    PaginatedTransactionsResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)
from app.services.email import send_activity_email, send_budget_alert_email

router = APIRouter(prefix="/transactions", tags=["Transactions"])
logger = get_logger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_period_range(period: BudgetPeriod | str, reference_date: datetime):
    if period == BudgetPeriod.WEEKLY.value or period == BudgetPeriod.WEEKLY:
        start = reference_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7)
    elif period == BudgetPeriod.MONTHLY.value or period == BudgetPeriod.MONTHLY:
        start = reference_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        _, last_day = monthrange(reference_date.year, reference_date.month)
        end = reference_date.replace(day=last_day, hour=23, minute=59, second=59, microsecond=0)
    else:
        start = reference_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = reference_date.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=0)
    return start, end


def balance_effect(transaction_type: TransactionType | str, amount: float) -> float:
    tx_type = transaction_type.value if isinstance(transaction_type, TransactionType) else transaction_type
    if tx_type == TransactionType.INCOME.value:
        return amount
    if tx_type == TransactionType.EXPENSE.value:
        return -amount
    return 0.0


def ensure_category(
    db: Session,
    current_user: User,
    category_id: Optional[int],
) -> Optional[Category]:
    if category_id is None:
        return None
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def create_budget_alerts(db: Session, user: User, transaction: Transaction):
    if transaction.transaction_type != TransactionType.EXPENSE.value or transaction.category_id is None:
        return

    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == user.id, Budget.category_id == transaction.category_id)
        .all()
    )
    if not budgets:
        return

    for budget in budgets:
        start, end = get_period_range(budget.period, transaction.date)
        spent = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.category_id == transaction.category_id,
                Transaction.transaction_type == TransactionType.EXPENSE.value,
                Transaction.deleted_at.is_(None),
                Transaction.date >= start,
                Transaction.date <= end,
            )
            .scalar()
        )
        percentage = (float(spent) / budget.amount * 100) if budget.amount > 0 else 0
        if percentage < 80:
            continue

        severity = "high" if percentage >= 100 else "medium"
        title = f"Cảnh báo ngân sách {budget.category.name}"
        message = (
            f"Danh mục {budget.category.name} đã sử dụng {percentage:.1f}% ngân sách "
            f"({float(spent):,.0f}/{budget.amount:,.0f} VND)."
        )
        existing = (
            db.query(Alert)
            .filter(
                Alert.user_id == user.id,
                Alert.budget_id == budget.id,
                Alert.alert_type.in_(["budget_warning", "budget_exceeded"]),
                Alert.is_resolved.is_(False),
            )
            .first()
        )
        alert_type = "budget_exceeded" if percentage >= 100 else "budget_warning"
        if existing:
            existing.severity = severity
            existing.alert_type = alert_type
            existing.title = title
            existing.message = message
        else:
            db.add(
                Alert(
                    user_id=user.id,
                    transaction_id=transaction.id,
                    budget_id=budget.id,
                    alert_type=alert_type,
                    severity=severity,
                    title=title,
                    message=message,
                )
            )
        logger.warning(
            "Budget threshold reached",
            extra={
                "extra_data": {
                    "user_id": user.id,
                    "budget_id": budget.id,
                    "category_id": transaction.category_id,
                    "percentage": round(percentage, 1),
                    "severity": severity,
                }
            },
        )

        send_budget_alert_email(
            user_email=user.email,
            user_name=user.name,
            category_name=budget.category.name,
            budget_amount=budget.amount,
            spent_amount=float(spent),
            percentage=percentage,
        )


def maybe_apply_ai_category(
    db: Session,
    current_user: User,
    data: TransactionCreate,
) -> tuple[Optional[int], bool, Optional[float], Optional[MLLog]]:
    if data.category_id is not None or not data.description:
        return data.category_id, data.is_ai_categorized, data.ai_confidence, None

    from app.ai.transaction_classifier import TransactionClassifier

    classifier = TransactionClassifier(current_user.id)
    predicted_id, confidence = classifier.predict(data.description)
    if predicted_id == 0:
        return None, False, None, None

    category = (
        db.query(Category)
        .filter(Category.id == predicted_id, Category.user_id == current_user.id)
        .first()
    )
    if category is None:
        return None, False, None, None

    should_autofill = confidence >= 0.65
    chosen_category_id = predicted_id if should_autofill else None
    log = MLLog(
        user_id=current_user.id,
        model_type="classifier",
        input_text=data.description,
        predicted_category_id=predicted_id,
        confidence_score=confidence,
        is_correct=None,
    )
    return chosen_category_id, should_autofill, confidence, log


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.transaction_type == TransactionType.TRANSFER:
        raise HTTPException(status_code=400, detail="Use /accounts/transfer for transfer transactions")

    account = db.query(Account).filter(Account.id == data.account_id, Account.user_id == current_user.id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    ai_category_id, is_ai_categorized, ai_confidence, ml_log = maybe_apply_ai_category(db, current_user, data)
    chosen_category_id = data.category_id if data.category_id is not None else ai_category_id
    ensure_category(db, current_user, chosen_category_id)

    transaction = Transaction(
        user_id=current_user.id,
        account_id=data.account_id,
        category_id=chosen_category_id,
        amount=data.amount,
        transaction_type=data.transaction_type.value,
        description=data.description,
        date=data.date,
        is_ai_categorized=data.is_ai_categorized or is_ai_categorized,
        ai_confidence=data.ai_confidence if data.ai_confidence is not None else ai_confidence,
    )
    account.balance += balance_effect(data.transaction_type, data.amount)
    db.add(transaction)
    db.flush()

    if ml_log is not None:
        ml_log.transaction_id = transaction.id
        ml_log.actual_category_id = chosen_category_id
        ml_log.is_correct = chosen_category_id == ml_log.predicted_category_id if chosen_category_id else None
        db.add(ml_log)

    create_budget_alerts(db, current_user, transaction)
    db.commit()
    db.refresh(transaction)
    TRANSACTION_CREATED_TOTAL.inc()
    logger.info(
        "Transaction created",
        extra={
            "extra_data": {
                "user_id": current_user.id,
                "transaction_id": transaction.id,
                "account_id": transaction.account_id,
                "transaction_type": transaction.transaction_type,
                "amount": transaction.amount,
            }
        },
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã thêm giao dịch mới",
        action="TẠO GIAO DỊCH MỚI",
        details=[
            ("Loại", "Thu nhập" if transaction.transaction_type == "income" else "Chi tiêu"),
            ("Số tiền", f"{transaction.amount:,.0f} VND".replace(",", ".")),
            ("Mô tả", transaction.description or "Không có"),
            ("Ngày", transaction.date.strftime("%d/%m/%Y %H:%M")),
        ],
    )

    return transaction


@router.get("/", response_model=PaginatedTransactionsResponse)
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    transaction_type: Optional[TransactionType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    sort_by: str = Query("date"),
    sort_dir: str = Query("desc"),
):
    query = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == current_user.id, Transaction.deleted_at.is_(None))
    )

    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type.value)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(or_(Transaction.description.ilike(pattern), Transaction.transaction_type.ilike(pattern)))

    total = query.count()

    sortable_columns = {
        "date": Transaction.date,
        "amount": Transaction.amount,
        "created_at": Transaction.created_at,
    }
    sort_column = sortable_columns.get(sort_by, Transaction.date)
    order = desc(sort_column) if sort_dir.lower() != "asc" else sort_column.asc()

    items = query.order_by(order).offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size if total else 0

    return PaginatedTransactionsResponse(
        items=[TransactionResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
        )
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
        )
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    payload = data.model_dump(exclude_unset=True)
    if "transaction_type" in payload and payload["transaction_type"] == TransactionType.TRANSFER:
        raise HTTPException(status_code=400, detail="Transfer transactions cannot be updated here")

    old_account = db.query(Account).filter(Account.id == transaction.account_id, Account.user_id == current_user.id).first()
    if old_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    new_account_id = payload.get("account_id", transaction.account_id)
    new_account = db.query(Account).filter(Account.id == new_account_id, Account.user_id == current_user.id).first()
    if new_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    if "category_id" in payload:
        ensure_category(db, current_user, payload["category_id"])

    old_effect = balance_effect(transaction.transaction_type, transaction.amount)
    old_account.balance -= old_effect

    new_amount = payload.get("amount", transaction.amount)
    new_type = payload.get("transaction_type", TransactionType(transaction.transaction_type))
    if isinstance(new_type, TransactionType):
        new_type_value = new_type.value
    else:
        new_type_value = str(new_type)

    for field, value in payload.items():
        if field == "transaction_type" and isinstance(value, TransactionType):
            setattr(transaction, field, value.value)
        else:
            setattr(transaction, field, value)

    new_effect = balance_effect(new_type_value, new_amount)
    new_account.balance += new_effect

    db.commit()
    db.refresh(transaction)
    logger.info(
        "Transaction updated",
        extra={
            "extra_data": {
                "user_id": current_user.id,
                "transaction_id": transaction.id,
                "account_id": transaction.account_id,
                "transaction_type": transaction.transaction_type,
                "amount": transaction.amount,
            }
        },
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã cập nhật giao dịch",
        action="CẬP NHẬT GIAO DỊCH",
        details=[
            ("Mô tả", transaction.description or "Không có"),
            ("Số tiền", f"{transaction.amount:,.0f} VND".replace(",", ".")),
            ("Ngày", transaction.date.strftime("%d/%m/%Y %H:%M")),
        ],
    )
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
        )
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    account = db.query(Account).filter(Account.id == transaction.account_id, Account.user_id == current_user.id).first()
    if account:
        account.balance -= balance_effect(transaction.transaction_type, transaction.amount)

    transaction.deleted_at = utcnow()
    db.commit()
    logger.info(
        "Transaction deleted",
        extra={
            "extra_data": {
                "user_id": current_user.id,
                "transaction_id": transaction.id,
                "account_id": transaction.account_id,
                "transaction_type": transaction.transaction_type,
                "amount": transaction.amount,
            }
        },
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã xóa giao dịch",
        action="XÓA GIAO DỊCH",
        details=[
            ("Số tiền (đã xóa)", f"{transaction.amount:,.0f} VND".replace(",", ".")),
            ("Mô tả", transaction.description or "Không có mô tả"),
        ],
    )
