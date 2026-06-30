import uuid
from pathlib import Path

import cv2
import numpy as np
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import get_optional_user, hash_password
import database as db
from image_processing.face_detection import FaceNotFoundError
from image_processing.pipeline import AnalysisPipeline
from reports.report_generator import generate_report
from routers import admin_routes, auth_routes, panel_routes
from schemas import AnalysisResponse, SkinType
from services.recommendations import DISCLAIMER, generate_recommendations
from services.routine_generator import generate_personalized_routine

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"

UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="SkinVision Lite API",
    description="Eğitim amaçlı cilt görüntü analizi API'si",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

pipeline = AnalysisPipeline()

VALID_SKIN_TYPES: set[str] = {"dry", "oily", "combination", "normal", "sensitive"}


@app.on_event("startup")
def on_startup():
    db.init_db()
    if db.get_user_by_username("admin") is None:
        db.create_user(
            username="admin",
            email="admin@skinvision.local",
            password_hash=hash_password("admin123"),
            is_admin=True,
        )


app.include_router(auth_routes.router)
app.include_router(panel_routes.router)
app.include_router(admin_routes.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "skinvision-lite", "version": "1.2.0"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_skin(
    file: UploadFile = File(...),
    skin_type: SkinType = Form(default="normal"),
    current_user: dict | None = Depends(get_optional_user),
):
    if skin_type not in VALID_SKIN_TYPES:
        skin_type = "normal"

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen geçerli bir görsel dosyası yükleyin.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Dosya boş.")

    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Görsel okunamadı. JPG veya PNG formatı kullanın.")

    analysis_id = uuid.uuid4().hex[:12]
    upload_path = UPLOADS_DIR / f"upload_{analysis_id}.jpg"
    output_path = OUTPUTS_DIR / f"result_{analysis_id}.png"
    zone_path = OUTPUTS_DIR / f"zones_{analysis_id}.png"
    report_path = OUTPUTS_DIR / f"report_{analysis_id}.pdf"

    cv2.imwrite(str(upload_path), image)

    try:
        result = pipeline.run(image)
    except FaceNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    cv2.imwrite(str(output_path), result["output_image"])
    cv2.imwrite(str(zone_path), result["zone_image"])

    recommendations = generate_recommendations(result["scores"], result["severity"])
    routine = generate_personalized_routine(
        result["scores"],
        result["severity"],
        result["zone_analysis"].zones,
        skin_type=skin_type,
    )

    response = AnalysisResponse(
        success=True,
        scores=result["scores"],
        severity=result["severity"],
        detected_regions=result["detected_regions"],
        zone_analysis=result["zone_analysis"],
        output_image_url=f"/outputs/result_{analysis_id}.png",
        zone_image_url=f"/outputs/zones_{analysis_id}.png",
        original_image_url=f"/uploads/upload_{analysis_id}.jpg",
        recommendations=recommendations,
        personalized_routine=routine,
        confidence=result["confidence"],
        ml_insights=result["ml_insights"],
        disclaimer=DISCLAIMER,
    )

    try:
        generate_report(response, report_path, UPLOADS_DIR, OUTPUTS_DIR)
        report_url = f"/outputs/report_{analysis_id}.pdf"
    except Exception:
        report_url = None

    saved_id = None
    if current_user:
        payload = response.model_dump(mode="json")
        saved = db.save_analysis(
            user_id=current_user["id"],
            skin_type=skin_type,
            scores=payload["scores"],
            result_json=payload,
            image_url=payload.get("original_image_url"),
        )
        saved_id = saved["id"]

    return response.model_copy(update={"report_url": report_url, "saved_analysis_id": saved_id})
