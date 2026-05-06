from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Budget, Category, Transaction, User
from app.schemas.schemas import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])

DEFAULT_CATEGORIES = [
    {"name": "Ăn uống", "icon": "utensils", "color": "#ef4444"},
    {"name": "Di chuyển", "icon": "car", "color": "#3b82f6"},
    {"name": "Mua sắm", "icon": "shopping-bag", "color": "#8b5cf6"},
    {"name": "Giải trí", "icon": "gamepad-2", "color": "#ec4899"},
    {"name": "Nhà cửa", "icon": "home", "color": "#f59e0b"},
    {"name": "Y tế", "icon": "heart-pulse", "color": "#10b981"},
    {"name": "Giáo dục", "icon": "graduation-cap", "color": "#6366f1"},
    {"name": "Tiết kiệm", "icon": "piggy-bank", "color": "#14b8a6"},
    {"name": "Lương", "icon": "wallet", "color": "#22c55e"},
    {"name": "Đầu tư", "icon": "trending-up", "color": "#eab308"},
    {"name": "Khác", "icon": "more-horizontal", "color": "#6b7280"},
]


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Category)
        .filter(Category.user_id == current_user.id, Category.name == data.name.strip())
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Tên danh mục đã tồn tại")

    if data.parent_id is not None:
        parent = (
            db.query(Category)
            .filter(Category.id == data.parent_id, Category.user_id == current_user.id)
            .first()
        )
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent category not found")

    category = Category(
        user_id=current_user.id,
        name=data.name.strip(),
        icon=data.icon,
        color=data.color,
        parent_id=data.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/init-default", response_model=List[CategoryResponse])
def init_default_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Category)
        .filter(Category.user_id == current_user.id, Category.is_system.is_(True))
        .all()
    )
    if existing:
        return existing

    categories = []
    for cat_data in DEFAULT_CATEGORIES:
        cat = Category(
            user_id=current_user.id,
            name=cat_data["name"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            is_system=True,
        )
        db.add(cat)
        categories.append(cat)
    db.commit()
    for cat in categories:
        db.refresh(cat)
    return categories


@router.get("/", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Category)
        .filter(Category.user_id == current_user.id)
        .order_by(Category.name)
        .all()
    )


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    payload = data.model_dump(exclude_unset=True)
    if "name" in payload:
        duplicated = (
            db.query(Category)
            .filter(
                Category.user_id == current_user.id,
                Category.name == payload["name"].strip(),
                Category.id != category_id,
            )
            .first()
        )
        if duplicated:
            raise HTTPException(status_code=400, detail="Tên danh mục đã tồn tại")
        payload["name"] = payload["name"].strip()

    if "parent_id" in payload and payload["parent_id"] is not None:
        parent = (
            db.query(Category)
            .filter(Category.id == payload["parent_id"], Category.user_id == current_user.id)
            .first()
        )
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent category not found")

    for field, value in payload.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    linked_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == category_id,
            Transaction.deleted_at.is_(None),
        )
        .count()
    )
    linked_budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.category_id == category_id).count()
    if linked_transactions or linked_budgets:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa danh mục đang liên kết với giao dịch hoặc ngân sách",
        )

    db.delete(category)
    db.commit()
