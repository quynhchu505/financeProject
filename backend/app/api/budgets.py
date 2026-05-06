from calendar import monthrange
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.core.security import verify_password
from app.models.models import Budget, BudgetPeriod, Category, Transaction, TransactionType, User
from app.schemas.schemas import BudgetCreate, BudgetProgress, BudgetResponse, BudgetUpdate
from app.services.email import send_activity_email

router = APIRouter(prefix="/budgets", tags=["Budgets"])
logger = get_logger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_period_range(period: BudgetPeriod | str, reference_date: datetime | None = None):
    reference_date = reference_date or utcnow()
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


def build_budget_progress(db: Session, current_user: User, budget: Budget) -> BudgetProgress:
    start, end = get_period_range(budget.period)
    spent = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == budget.category_id,
            Transaction.transaction_type == TransactionType.EXPENSE.value,
            Transaction.deleted_at.is_(None),
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .with_entities(Transaction.amount)
        .all()
    )
    total_spent = sum(s[0] for s in spent)
    remaining = max(0, budget.amount - total_spent)
    percentage = (total_spent / budget.amount * 100) if budget.amount > 0 else 0
    return BudgetProgress(
        budget=BudgetResponse.model_validate(budget),
        spent=round(total_spent, 2),
        remaining=round(remaining, 2),
        percentage=round(percentage, 1),
    )


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == data.category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    duplicated = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category_id == data.category_id,
            Budget.period == data.period.value,
        )
        .first()
    )
    if duplicated:
        raise HTTPException(status_code=400, detail="Ngân sách cho danh mục và kỳ này đã tồn tại")

    budget = Budget(
        user_id=current_user.id,
        category_id=data.category_id,
        amount=data.amount,
        period=data.period.value,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    logger.info(
        "Budget created",
        extra={"extra_data": {"user_id": current_user.id, "budget_id": budget.id, "category_id": budget.category_id}},
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã tạo ngân sách mới",
        action="TẠO NGÂN SÁCH MỚI",
        details=[
            ("Danh mục", category.name),
            ("Số tiền giới hạn", f"{data.amount:,.0f} VND".replace(",", ".")),
            ("Kỳ", data.period.value),
        ],
    )
    return budget


@router.get("/", response_model=List[BudgetProgress])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.created_at.desc())
        .all()
    )
    return [build_budget_progress(db, current_user, budget) for budget in budgets]


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")

    payload = data.model_dump(exclude_unset=True)
    if "period" in payload and isinstance(payload["period"], BudgetPeriod):
        duplicated = (
            db.query(Budget)
            .filter(
                Budget.user_id == current_user.id,
                Budget.category_id == budget.category_id,
                Budget.period == payload["period"].value,
                Budget.id != budget_id,
            )
            .first()
        )
        if duplicated:
            raise HTTPException(status_code=400, detail="Ngân sách cho kỳ này đã tồn tại")
        payload["period"] = payload["period"].value

    for field, value in payload.items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    logger.info(
        "Budget updated",
        extra={"extra_data": {"user_id": current_user.id, "budget_id": budget.id}},
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã cập nhật ngân sách",
        action="CẬP NHẬT NGÂN SÁCH",
        details=[
            ("Danh mục", budget.category.name if budget.category else str(budget.category_id)),
            ("Số tiền giới hạn", f"{budget.amount:,.0f} VND".replace(",", ".")),
            ("Kỳ", budget.period),
        ],
    )
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    password: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    if not verify_password(password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")

    category_name = budget.category.name if budget.category else "Unknown"
    amount = budget.amount
    db.delete(budget)
    db.commit()
    logger.info(
        "Budget deleted",
        extra={"extra_data": {"user_id": current_user.id, "budget_id": budget_id}},
    )

    send_activity_email(
        to_email=current_user.email,
        user_name=current_user.name,
        subject="Thông báo: Đã xóa ngân sách",
        action="XÓA NGÂN SÁCH",
        details=[
            ("Danh mục", category_name),
            ("Số tiền giới hạn (đã xóa)", f"{amount:,.0f} VND".replace(",", ".")),
        ],
    )
