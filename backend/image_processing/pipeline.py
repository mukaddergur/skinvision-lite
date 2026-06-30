import cv2
import numpy as np

from image_processing.utils import calibrate_intensity_score

from ml_model.predict import SkinMLPredictor
from schemas import AnalysisConfidence, AnalysisScores, DetectedRegions, MLInsights, SeverityLevels, ZoneAnalysis

from .acne_detection import detect_acne
from .face_detection import FaceNotFoundError, crop_face_region
from .redness_detection import detect_redness
from .skin_mask import create_skin_mask
from .spot_detection import detect_spots
from .utils import score_to_severity
from .zone_analysis import analyze_zones, draw_zone_overlays

_ml_predictor = SkinMLPredictor()

CONFIDENCE = AnalysisConfidence(
    level="moderate",
    message=(
        "Bu analiz OpenCV + hibrit ML modeli ile yapılır. Skorlar görüntü yoğunluğunu yansıtır; "
        "tıbbi teşhis değildir. Işık, makyaj ve kamera kalitesi sonuçları etkiler."
    ),
    comparison_note=(
        "Profesyonel sistemler (ör. L'Oréal Skin Genius) 10.000+ klinik görüntü ve "
        "dermatolog onaylı derin öğrenme kullanır. Bu sistem eğitim/demo amaçlıdır."
    ),
)


class AnalysisPipeline:
    def run(self, image: np.ndarray) -> dict:
        face_crop, _bbox = crop_face_region(image)
        skin_mask = create_skin_mask(face_crop)

        if cv2.countNonZero(skin_mask) < 500:
            raise FaceNotFoundError("Cilt bölgesi yeterince tespit edilemedi. Daha iyi aydınlatmada tekrar deneyin.")

        output = face_crop.copy()
        output, redness_count, cv_redness = detect_redness(output, skin_mask)
        output, spot_count, cv_spots = detect_spots(output, skin_mask)
        output, acne_count, cv_acne = detect_acne(output, skin_mask)

        cv_scores = {
            "redness_score": cv_redness,
            "spot_score": cv_spots,
            "acne_score": cv_acne,
        }

        ml_result = _ml_predictor.predict(face_crop, skin_mask)
        blended = _ml_predictor.blend_with_opencv(cv_scores, ml_result["scores"])

        redness_score = calibrate_intensity_score(blended["redness_score"])
        spot_score = calibrate_intensity_score(blended["spot_score"])
        acne_score = calibrate_intensity_score(blended["acne_score"])
        overall = int(round((redness_score + spot_score + acne_score) / 3))

        zone_output = draw_zone_overlays(output.copy())
        zones = analyze_zones(face_crop, skin_mask)

        ml_insights = MLInsights(
            summary=ml_result["summary"],
            confidence_percent=ml_result["confidence_percent"],
            method=ml_result["method"],
            dominant_concern=ml_result["dominant_concern"],
            opencv_scores=AnalysisScores(
                redness_score=cv_redness,
                spot_score=cv_spots,
                acne_score=cv_acne,
                overall_score=int(round((cv_redness + cv_spots + cv_acne) / 3)),
            ),
            ml_scores=AnalysisScores(
                redness_score=ml_result["scores"]["redness_score"],
                spot_score=ml_result["scores"]["spot_score"],
                acne_score=ml_result["scores"]["acne_score"],
                overall_score=ml_result["scores"]["overall_score"],
            ),
        )

        return {
            "output_image": output,
            "zone_image": zone_output,
            "face_crop": face_crop,
            "scores": AnalysisScores(
                redness_score=redness_score,
                spot_score=spot_score,
                acne_score=acne_score,
                overall_score=overall,
            ),
            "severity": SeverityLevels(
                redness=score_to_severity(redness_score),
                spots=score_to_severity(spot_score),
                acne=score_to_severity(acne_score),
            ),
            "detected_regions": DetectedRegions(
                redness_count=redness_count,
                spot_count=spot_count,
                acne_count=acne_count,
            ),
            "zone_analysis": ZoneAnalysis(zones=zones),
            "confidence": CONFIDENCE,
            "ml_insights": ml_insights,
        }
