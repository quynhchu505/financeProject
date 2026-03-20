from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from calendar import monthrange
from app.core.database import get_db
from app.models.models import User, Budget, Category, Transaction, BudgetPeriod, TransactionType
from app.schemas.schemas import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetProgress
from app.api.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])


def get_period_range(period: BudgetPeriod, reference_date: datetime = None):
    if reference_date is None:
        reference_date = datetime.utcnow()
    if period == BudgetPeriod.WEEKLY:
        start = reference_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7)
    elif period == BudgetPeriod.MONTHLY:
        start = reference_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        _, last_day = monthrange(reference_date.year, reference_date.month)
        end = reference_date.replace(day=last_day, hour=23, minute=59, second=59)
    else:
        start = reference_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = reference_date.replace(month=12, day=31, hour=23, minute=59, second=59)
    return start, end


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify category ownership
    category = (
        db.query(Category)
        .filter(Category.id == data.category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    budget = Budget(
        user_id=current_user.id,
        category_id=data.category_id,
        amount=data.amount,
        period=data.period,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
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
        .all()
    )

    now = datetime.utcnow()
    results = []
    for budget in budgets:
        start, end = get_period_range(budget.period, now)
        spent = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.category_id == budget.category_id,
                Transaction.transaction_type == TransactionType.EXPENSE,
                Transaction.date >= start,
                Transaction.date <= end,
            )
            .with_entities(Transaction.amount)
            .all()
        )
        total_spent = sum(s[0] for s in spent)
        remaining = max(0, budget.amount - total_spent)
        percentage = (total_spent / budget.amount * 100) if budget.amount > 0 else 0

        results.append(
            BudgetProgress(
                budget=BudgetResponse.model_validate(budget),
                spent=round(total_spent, 2),
                remaining=round(remaining, 2),
                percentage=round(percentage, 1),
            )
        )
    return results


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
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
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
    db.delete(budget)
    db.commit()
