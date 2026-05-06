from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.logging import get_logger
from app.core.rate_limit import rate_limit
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.models import Category, RefreshToken, User
from app.schemas.schemas import (
    LogoutRequest,
    RefreshRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)

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


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def normalize_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def persist_refresh_token(db: Session, user_id: int, raw_token: str) -> RefreshToken:
    token = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(token)
    db.flush()
    return token


def build_token_response(db: Session, user: User) -> Token:
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    persist_refresh_token(db, user.id, refresh_token)
    db.commit()
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit(10, 60))])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name.strip(),
    )
    db.add(user)
    db.flush()

    for cat_data in DEFAULT_CATEGORIES:
        db.add(
            Category(
                user_id=user.id,
                name=cat_data["name"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_system=True,
            )
        )

    db.commit()
    db.refresh(user)
    logger.info("User registered", extra={"extra_data": {"user_id": user.id}})
    return user


@router.post("/login", response_model=Token, dependencies=[Depends(rate_limit(5, 60))])
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        logger.warning("Login failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    logger.info("User logged in", extra={"extra_data": {"user_id": user.id}})
    return build_token_response(db, user)


@router.post("/refresh", response_model=Token, dependencies=[Depends(rate_limit(10, 60))])
def refresh_tokens(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token, expected_type="refresh")
    if payload is None or payload.get("sub") is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == user.id,
            RefreshToken.token_hash == hash_token(data.refresh_token),
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )
    if stored_token is None or normalize_utc(stored_token.expires_at) <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")

    stored_token.revoked_at = utcnow()
    db.flush()
    logger.info("Refresh token rotated", extra={"extra_data": {"user_id": user.id}})
    return build_token_response(db, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    refresh_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == current_user.id,
            RefreshToken.token_hash == hash_token(data.refresh_token),
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )
    if refresh_token:
        refresh_token.revoked_at = utcnow()
        db.commit()
        logger.info("User logged out", extra={"extra_data": {"user_id": current_user.id}})


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    (
        db.query(RefreshToken)
        .filter(RefreshToken.user_id == current_user.id, RefreshToken.revoked_at.is_(None))
        .update({"revoked_at": utcnow()}, synchronize_session=False)
    )
    db.commit()
    logger.info("User logged out from all sessions", extra={"extra_data": {"user_id": current_user.id}})


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
