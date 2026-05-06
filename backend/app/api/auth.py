import json
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, status
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
from app.models.models import Category, LoginHistory, RefreshToken, User
from app.schemas.schemas import (
    AccountDeleteRequest,
    EmailChangeRequest,
    LoginHistoryItem,
    LogoutRequest,
    NotificationPrefs,
    PasswordChange,
    ProfileUpdate,
    RefreshRequest,
    SessionItem,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_AVATAR_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB

DEFAULT_NOTIFICATION_PREFS = NotificationPrefs().model_dump()

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


def get_client_meta(request: Request | None) -> tuple[str | None, str | None]:
    if request is None:
        return None, None
    ua = request.headers.get("user-agent")
    fwd = request.headers.get("x-forwarded-for")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else None)
    return ua, ip


def persist_refresh_token(
    db: Session,
    user_id: int,
    raw_token: str,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> RefreshToken:
    token = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_address=ip_address,
        last_used_at=utcnow(),
    )
    db.add(token)
    db.flush()
    return token


def build_token_response(
    db: Session,
    user: User,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> Token:
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    persist_refresh_token(db, user.id, refresh_token, user_agent=user_agent, ip_address=ip_address)
    db.commit()
    return Token(access_token=access_token, refresh_token=refresh_token)


def record_login(
    db: Session,
    user_id: int,
    request: Request | None,
    success: bool,
    failure_reason: str | None = None,
) -> None:
    ua, ip = get_client_meta(request)
    db.add(
        LoginHistory(
            user_id=user_id,
            ip_address=ip,
            user_agent=ua,
            status="success" if success else "failure",
            failure_reason=failure_reason,
        )
    )
    db.commit()


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
def login(user_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        logger.warning("Login failed")
        if user:
            record_login(db, user.id, request, success=False, failure_reason="Invalid password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        record_login(db, user.id, request, success=False, failure_reason="Inactive")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    ua, ip = get_client_meta(request)
    record_login(db, user.id, request, success=True)
    logger.info("User logged in", extra={"extra_data": {"user_id": user.id}})
    return build_token_response(db, user, user_agent=ua, ip_address=ip)


@router.post("/refresh", response_model=Token, dependencies=[Depends(rate_limit(10, 60))])
def refresh_tokens(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
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
    ua, ip = get_client_meta(request)
    logger.info("Refresh token rotated", extra={"extra_data": {"user_id": user.id}})
    return build_token_response(db, user, user_agent=ua, ip_address=ip)


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


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = data.model_dump(exclude_unset=True)
    if "name" in payload and payload["name"] is not None:
        payload["name"] = payload["name"].strip()
    for field, value in payload.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    logger.info("Profile updated", extra={"extra_data": {"user_id": current_user.id}})
    return current_user


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_AVATAR_EXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Định dạng không được hỗ trợ. Cho phép: {', '.join(sorted(ALLOWED_AVATAR_EXT))}",
        )

    contents = await file.read()
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh quá lớn (tối đa 5MB)",
        )

    # Remove old avatar file if local
    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
        old_path = UPLOAD_DIR / Path(current_user.avatar_url).name
        if old_path.exists():
            try:
                old_path.unlink()
            except OSError:
                pass

    fname = f"u{current_user.id}_{uuid.uuid4().hex[:12]}{ext}"
    fpath = UPLOAD_DIR / fname
    fpath.write_bytes(contents)

    current_user.avatar_url = f"/uploads/avatars/{fname}"
    db.commit()
    db.refresh(current_user)
    logger.info("Avatar updated", extra={"extra_data": {"user_id": current_user.id}})
    return current_user


@router.delete("/avatar", response_model=UserResponse)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
        old_path = UPLOAD_DIR / Path(current_user.avatar_url).name
        if old_path.exists():
            try:
                old_path.unlink()
            except OSError:
                pass
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/email", response_model=UserResponse)
def change_email(
    data: EmailChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mật khẩu không đúng")
    if data.new_email == current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email mới trùng email hiện tại")
    existing = db.query(User).filter(User.email == data.new_email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email đã được sử dụng")
    current_user.email = data.new_email
    db.commit()
    db.refresh(current_user)
    logger.info("Email changed", extra={"extra_data": {"user_id": current_user.id}})
    return current_user


@router.put("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mật khẩu hiện tại không đúng")
    current_user.password_hash = get_password_hash(data.new_password)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked_at.is_(None),
    ).update({"revoked_at": utcnow()}, synchronize_session=False)
    db.commit()
    logger.info("Password changed", extra={"extra_data": {"user_id": current_user.id}})


@router.get("/login-history", response_model=list[LoginHistoryItem])
def get_login_history(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(LoginHistory)
        .filter(LoginHistory.user_id == current_user.id)
        .order_by(LoginHistory.created_at.desc())
        .limit(min(max(limit, 1), 100))
        .all()
    )
    return rows


@router.get("/sessions", response_model=list[SessionItem])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = utcnow()
    rows = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
        .order_by(RefreshToken.last_used_at.desc().nullslast(), RefreshToken.created_at.desc())
        .all()
    )
    return rows


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.id == session_id,
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phiên không tồn tại")
    token.revoked_at = utcnow()
    db.commit()


@router.get("/notification-prefs", response_model=NotificationPrefs)
def get_notification_prefs(current_user: User = Depends(get_current_user)):
    if not current_user.notification_prefs:
        return NotificationPrefs()
    try:
        data = json.loads(current_user.notification_prefs)
    except (ValueError, TypeError):
        return NotificationPrefs()
    merged = {**DEFAULT_NOTIFICATION_PREFS, **(data if isinstance(data, dict) else {})}
    return NotificationPrefs(**merged)


@router.put("/notification-prefs", response_model=NotificationPrefs)
def update_notification_prefs(
    data: NotificationPrefs,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.notification_prefs = json.dumps(data.model_dump())
    db.commit()
    return data


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    data: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mật khẩu không đúng")
    if data.confirmation.strip().lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Xác nhận không khớp — vui lòng nhập email của bạn",
        )
    db.delete(current_user)
    db.commit()
    logger.warning("Account deleted", extra={"extra_data": {"user_id": current_user.id}})
