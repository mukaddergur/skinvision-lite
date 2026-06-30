from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

import auth
import database as db

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=32)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


def _public_user(user: dict) -> UserPublic:
    return UserPublic(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        is_admin=user["is_admin"],
    )


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    if db.get_user_by_username(body.username):
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor.")
    if db.get_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı.")

    user = db.create_user(
        username=body.username.strip(),
        email=body.email,
        password_hash=auth.hash_password(body.password),
    )
    token = auth.create_access_token(user["id"], user["username"], user["is_admin"])
    return AuthResponse(access_token=token, user=_public_user(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    user = db.get_user_by_username(body.username.strip())
    if not user or not auth.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı.")

    token = auth.create_access_token(user["id"], user["username"], user["is_admin"])
    return AuthResponse(access_token=token, user=_public_user(user))


@router.get("/me", response_model=UserPublic)
def me(user: dict = Depends(auth.get_current_user)):
    return _public_user(user)
