from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

import database as db

SECRET_KEY = os.getenv("SKINVISION_SECRET_KEY", "skinvision-lite-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 14

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: int, username: str, is_admin: bool) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "username": username,
        "is_admin": is_admin,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş oturum.",
        ) from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Giriş yapmanız gerekiyor.",
        )
    payload = decode_token(credentials.credentials)
    user = db.get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı.")
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return db.get_user_by_id(int(payload["sub"]))
    except HTTPException:
        return None


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yönetici yetkisi gerekli.")
    return user
