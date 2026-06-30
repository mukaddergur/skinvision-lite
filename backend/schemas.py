from typing import Literal

from pydantic import BaseModel, Field

SeverityLevel = Literal["low", "medium", "high"]
SkinType = Literal["dry", "oily", "combination", "normal", "sensitive"]
PrimaryConcern = Literal["redness", "spots", "acne"]


class AnalysisScores(BaseModel):
    redness_score: int = Field(ge=0, le=100)
    spot_score: int = Field(ge=0, le=100)
    acne_score: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)


class SeverityLevels(BaseModel):
    redness: SeverityLevel
    spots: SeverityLevel
    acne: SeverityLevel


class DetectedRegions(BaseModel):
    redness_count: int
    spot_count: int
    acne_count: int


class ProductCard(BaseModel):
    name: str
    category: str
    benefit: str
    for_concern: str
    ingredient: str
    icon: str
    color: str
    image_url: str = ""


class MLInsights(BaseModel):
    summary: str
    confidence_percent: int
    method: str
    dominant_concern: str
    opencv_scores: AnalysisScores | None = None
    ml_scores: AnalysisScores | None = None


class ZoneResult(BaseModel):
    zone_id: str
    label: str
    redness_score: int
    spot_score: int
    acne_score: int
    primary_concern: PrimaryConcern
    severity: SeverityLevel
    explanation: str


class ZoneAnalysis(BaseModel):
    zones: list[ZoneResult]


class RoutineStep(BaseModel):
    order: int
    step: str
    product: str
    note: str


class PersonalizedRoutine(BaseModel):
    skin_type: str
    summary: str
    skin_type_tip: str
    morning_routine: list[RoutineStep]
    evening_routine: list[RoutineStep]
    focus_areas: list[str]


class AnalysisConfidence(BaseModel):
    level: Literal["educational", "moderate"]
    message: str
    comparison_note: str


class Recommendations(BaseModel):
    products: list[str]
    actions: list[str]
    product_cards: list[ProductCard] = []
    see_doctor: bool
    doctor_reason: str | None = None


class AnalysisResponse(BaseModel):
    success: bool
    scores: AnalysisScores
    severity: SeverityLevels
    detected_regions: DetectedRegions
    zone_analysis: ZoneAnalysis
    output_image_url: str
    zone_image_url: str | None = None
    original_image_url: str | None = None
    report_url: str | None = None
    recommendations: Recommendations
    personalized_routine: PersonalizedRoutine
    confidence: AnalysisConfidence
    ml_insights: MLInsights | None = None
    disclaimer: str
    saved_analysis_id: int | None = None
