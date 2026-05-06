from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.models import Account, Transaction, TransactionType, User
from app.schemas.schemas import (
    AccountCreate,
    AccountResponse,
    AccountUpdate,
    TransferCreate,
    TransferResponse,
)

router = APIRouter(prefix="/accounts", tags=["Accounts"])
logger = get_logger(__name__)

ALLOWED_ACCOUNT_TYPES = {"checking", "savings", "credit", "cash"}


def validate_account_type(account_type: str):
    if account_type not in ALLOWED_ACCOUNT_TYPES:
        raise HTTPException(status_code=400, detail="Loại tài khoản không hợp lệ")


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_account_type(data.account_type)

    existing = (
        db.query(Account)
        .filter(Account.user_id == current_user.id, Account.name == data.name.strip())
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Tên tài khoản đã tồn tại")

    account = Account(
        user_id=current_user.id,
        name=data.name.strip(),
        account_type=data.account_type,
        balance=0.0,
        currency=data.currency,
        icon=data.icon,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    logger.info("Account created", extra={"extra_data": {"user_id": current_user.id, "account_id": account.id}})
    return account


@router.get("/", response_model=List[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Account).filter(Account.user_id == current_user.id).order_by(Account.created_at.desc()).all()


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    payload = data.model_dump(exclude_unset=True)
    if "account_type" in payload:
        validate_account_type(payload["account_type"])
    if "name" in payload:
        payload["name"] = payload["name"].strip()
        duplicated = (
            db.query(Account)
            .filter(
                Account.user_id == current_user.id,
                Account.name == payload["name"],
                Account.id != account_id,
            )
            .first()
        )
        if duplicated:
            raise HTTPException(status_code=400, detail="Tên tài khoản đã tồn tại")

    for field, value in payload.items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    logger.info("Account updated", extra={"extra_data": {"user_id": current_user.id, "account_id": account.id}})
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    active_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.account_id == account_id,
            Transaction.user_id == current_user.id,
            Transaction.deleted_at.is_(None),
        )
        .count()
    )
    if active_transactions:
        raise HTTPException(status_code=400, detail="Không thể xóa tài khoản đang có giao dịch")

    db.delete(account)
    db.commit()
    logger.info("Account deleted", extra={"extra_data": {"user_id": current_user.id, "account_id": account_id}})


@router.post("/transfer", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def transfer_between_accounts(
    data: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from_acc = db.query(Account).filter(Account.id == data.from_account_id, Account.user_id == current_user.id).first()
    if not from_acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tài khoản nguồn không tìm thấy")

    to_acc = db.query(Account).filter(Account.id == data.to_account_id, Account.user_id == current_user.id).first()
    if not to_acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tài khoản đích không tìm thấy")

    if data.from_account_id == data.to_account_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản nguồn và đích không được trùng nhau")

    if from_acc.balance < data.amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Số dư không đủ")

    tx_from = Transaction(
        user_id=current_user.id,
        account_id=from_acc.id,
        amount=data.amount,
        transaction_type=TransactionType.TRANSFER.value,
        description=f"Chuyển sang {to_acc.name}" + (f" - {data.description}" if data.description else ""),
        date=data.date,
    )

    tx_to = Transaction(
        user_id=current_user.id,
        account_id=to_acc.id,
        amount=data.amount,
        transaction_type=TransactionType.TRANSFER.value,
        description=f"Nhận từ {from_acc.name}" + (f" - {data.description}" if data.description else ""),
        date=data.date,
    )

    from_acc.balance -= data.amount
    to_acc.balance += data.amount

    db.add(tx_from)
    db.add(tx_to)
    db.commit()
    db.refresh(tx_from)
    db.refresh(tx_to)
    logger.info(
        "Transfer completed",
        extra={
            "extra_data": {
                "user_id": current_user.id,
                "from_account_id": from_acc.id,
                "to_account_id": to_acc.id,
                "amount": data.amount,
            }
        },
    )

    return TransferResponse(from_transaction=tx_from, to_transaction=tx_to)
