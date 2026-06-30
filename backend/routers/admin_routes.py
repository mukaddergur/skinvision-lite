from fastapi import APIRouter, Depends

import auth
import database as db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_admin: dict = Depends(auth.require_admin)):
    return db.admin_stats()


@router.get("/users")
def admin_users(_admin: dict = Depends(auth.require_admin)):
    return {"users": db.list_users()}


@router.get("/users/{user_id}/analyses")
def admin_user_analyses(user_id: int, _admin: dict = Depends(auth.require_admin)):
    return {"analyses": db.list_analyses(user_id)}
