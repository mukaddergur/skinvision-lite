from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

import auth
import database as db

router = APIRouter(prefix="/panel", tags=["panel"])


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = ""
    ingredient: str = ""
    started_at: str
    notes: str = ""


class RoutineLogUpdate(BaseModel):
    log_date: str
    morning_done: bool = False
    evening_done: bool = False
    face_wash_done: bool = False
    notes: str = ""


@router.get("/analyses")
def list_my_analyses(user: dict = Depends(auth.get_current_user)):
    return {"analyses": db.list_analyses(user["id"])}


@router.get("/analyses/{analysis_id}")
def get_my_analysis(analysis_id: int, user: dict = Depends(auth.get_current_user)):
    item = db.get_analysis_by_id(analysis_id, user["id"])
    if not item:
        raise HTTPException(status_code=404, detail="Analiz bulunamadı.")
    return item


@router.get("/products")
def list_my_products(user: dict = Depends(auth.get_current_user)):
    return {"products": db.list_products(user["id"])}


@router.post("/products")
def add_my_product(body: ProductCreate, user: dict = Depends(auth.get_current_user)):
    product = db.add_product(
        user_id=user["id"],
        name=body.name,
        category=body.category,
        ingredient=body.ingredient,
        started_at=body.started_at,
        notes=body.notes,
    )
    return product


@router.delete("/products/{product_id}")
def remove_my_product(product_id: int, user: dict = Depends(auth.get_current_user)):
    if not db.delete_product(product_id, user["id"]):
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    return {"success": True}


@router.get("/routine")
def get_routine_logs(month: str, user: dict = Depends(auth.get_current_user)):
    try:
        year_s, month_s = month.split("-")
        year, mon = int(year_s), int(month_s)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="month YYYY-MM formatında olmalı.") from exc
    return {"logs": db.list_routine_logs(user["id"], year, mon)}


@router.put("/routine")
def save_routine_log(body: RoutineLogUpdate, user: dict = Depends(auth.get_current_user)):
    log = db.upsert_routine_log(
        user_id=user["id"],
        log_date=body.log_date,
        morning_done=body.morning_done,
        evening_done=body.evening_done,
        face_wash_done=body.face_wash_done,
        notes=body.notes,
    )
    return log
