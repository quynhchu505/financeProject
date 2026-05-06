import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12, deprecated="auto")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def create_token(
    subject: str | Any,
    token_type: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    if expires_delta:
        expire = _utcnow() + expires_delta
    else:
        if token_type == "refresh":
            expire = _utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            expire = _utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": token_type,
    }
    if token_type == "refresh":
        to_encode["jti"] = secrets.token_urlsafe(24)
    if extra_claims:
        to_encode.update(extra_claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    return create_token(subject=subject, token_type="access", expires_delta=expires_delta)


def create_refresh_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    return create_token(subject=subject, token_type="refresh", expires_delta=expires_delta)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def decode_token(token: str, expected_type: Optional[str] = None) -> Optional[dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if expected_type and payload.get("type") != expected_type:
            return None
        return payload
    except JWTError:
        return None


def get_token_subject(token: str, expected_type: Optional[str] = None) -> Optional[str]:
    payload = decode_token(token, expected_type=expected_type)
    if payload is None:
        return None
    return payload.get("sub")


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
