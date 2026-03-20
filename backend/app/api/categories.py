from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, Category
from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_user

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
    category = Category(
        user_id=current_user.id,
        name=data.name,
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
    existing = db.query(Category).filter(Category.user_id == current_user.id, Category.is_system == True).all()
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
    categories = (
        db.query(Category)
        .filter(Category.user_id == current_user.id)
        .order_by(Category.name)
        .all()
    )
    return categories


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
    for field, value in data.model_dump(exclude_unset=True).items():
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
    db.delete(category)
    db.commit()
