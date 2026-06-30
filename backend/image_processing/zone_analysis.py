import cv2
import numpy as np

from schemas import ZoneAnalysis, ZoneResult

from .utils import INTENSITY_MULTIPLIERS, calibrate_intensity_score, compute_intensity_score, score_to_severity

ZONE_DEFINITIONS = {
    "forehead": {
        "label": "Alın Bölgesi",
        "bounds": lambda h, w: (int(0.15 * w), 0, int(0.85 * w), int(0.28 * h)),
        "focus": "İnce çizgiler ve kızarıklık",
    },
    "left_cheek": {
        "label": "Sol Yanak",
        "bounds": lambda h, w: (int(0.05 * w), int(0.32 * h), int(0.45 * w), int(0.68 * h)),
        "focus": "Leke ve akne benzeri bölgeler",
    },
    "right_cheek": {
        "label": "Sağ Yanak",
        "bounds": lambda h, w: (int(0.55 * w), int(0.32 * h), int(0.95 * w), int(0.68 * h)),
        "focus": "Leke ve akne benzeri bölgeler",
    },
    "nose": {
        "label": "Burun / T Bölgesi",
        "bounds": lambda h, w: (int(0.38 * w), int(0.32 * h), int(0.62 * w), int(0.72 * h)),
        "focus": "Gözenek ve yağlanma",
    },
    "chin": {
        "label": "Çene Bölgesi",
        "bounds": lambda h, w: (int(0.25 * w), int(0.68 * h), int(0.75 * w), int(0.95 * h)),
        "focus": "Akne benzeri yoğunluk",
    },
}

EXPLANATIONS = {
    "redness": {
        "low": "Bu bölgede belirgin kızarıklık sinyali düşük. Cilt bariyeri genel olarak dengeli görünüyor.",
        "medium": "Bu bölgede hafif kızarıklık yoğunluğu var. Yatıştırıcı ve nemlendirici içerikler faydalı olabilir.",
        "high": "Bu bölgede belirgin kızarıklık yoğunluğu tespit edildi. Hassas cilt bakımı ve SPF önerilir.",
    },
    "spots": {
        "low": "Leke benzeri koyu alan yoğunluğu düşük. Düzenli SPF kullanımı koruyucu olacaktır.",
        "medium": "Bu bölgede leke benzeri alanlar görülüyor. C vitamini ve güneş koruyucu rutine eklenebilir.",
        "high": "Belirgin leke yoğunluğu var. Aydınlatıcı serum ve günlük SPF önem kazanır.",
    },
    "acne": {
        "low": "Akne benzeri bölge yoğunluğu düşük. Nazik temizlik yeterli olabilir.",
        "medium": "Bu bölgede akne benzeri alanlar mevcut. Salisilik asit içerikli temizleyici düşünülebilir.",
        "high": "Yoğun akne benzeri sinyal var. Yağsız nemlendirici ve dermatolog görüşü önerilir.",
    },
}


def _zone_mask(h: int, w: int, skin_mask: np.ndarray, zone_id: str) -> np.ndarray:
    x1, y1, x2, y2 = ZONE_DEFINITIONS[zone_id]["bounds"](h, w)
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255
    return cv2.bitwise_and(mask, skin_mask)


def _redness_mask(image: np.ndarray, skin_mask: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower1 = np.array([0, 40, 60], dtype=np.uint8)
    upper1 = np.array([12, 255, 255], dtype=np.uint8)
    lower2 = np.array([168, 40, 60], dtype=np.uint8)
    upper2 = np.array([180, 255, 255], dtype=np.uint8)
    red = cv2.bitwise_or(cv2.inRange(hsv, lower1, upper1), cv2.inRange(hsv, lower2, upper2))
    return cv2.bitwise_and(red, skin_mask)


def _spot_mask(image: np.ndarray, skin_mask: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]
    blurred = cv2.GaussianBlur(l_channel, (5, 5), 0)
    mean_val = cv2.mean(blurred, mask=skin_mask)[0]
    threshold = max(40, mean_val - 25)
    _, spot = cv2.threshold(blurred, threshold, 255, cv2.THRESH_BINARY_INV)
    return cv2.bitwise_and(spot, skin_mask)


def _acne_mask(image: np.ndarray, skin_mask: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    diff = cv2.absdiff(gray, blurred)
    diff = cv2.bitwise_and(diff, diff, mask=skin_mask)
    _, acne = cv2.threshold(diff, 18, 255, cv2.THRESH_BINARY)
    return acne


def _dominant_concern(redness: int, spots: int, acne: int) -> str:
    scores = {"redness": redness, "spots": spots, "acne": acne}
    return max(scores, key=scores.get)


def _build_explanation(zone_id: str, concern: str, severity: str) -> str:
    base = EXPLANATIONS[concern][severity]
    focus = ZONE_DEFINITIONS[zone_id]["focus"]
    return f"{ZONE_DEFINITIONS[zone_id]['label']}: {focus} açısından değerlendirildi. {base}"


def analyze_zones(image: np.ndarray, skin_mask: np.ndarray) -> list[ZoneResult]:
    h, w = image.shape[:2]
    red_full = _redness_mask(image, skin_mask)
    spot_full = _spot_mask(image, skin_mask)
    acne_full = _acne_mask(image, skin_mask)

    zones: list[ZoneResult] = []
    for zone_id, meta in ZONE_DEFINITIONS.items():
        zmask = _zone_mask(h, w, skin_mask, zone_id)
        pixels = max(1, cv2.countNonZero(zmask))
        if pixels < 80:
            continue

        redness = compute_intensity_score(
            cv2.countNonZero(cv2.bitwise_and(red_full, zmask)), pixels, INTENSITY_MULTIPLIERS["redness"]
        )
        spots = compute_intensity_score(
            cv2.countNonZero(cv2.bitwise_and(spot_full, zmask)), pixels, INTENSITY_MULTIPLIERS["spots"]
        )
        acne = compute_intensity_score(
            cv2.countNonZero(cv2.bitwise_and(acne_full, zmask)), pixels, INTENSITY_MULTIPLIERS["acne"]
        )

        redness = calibrate_intensity_score(redness)
        spots = calibrate_intensity_score(spots)
        acne = calibrate_intensity_score(acne)

        concern = _dominant_concern(redness, spots, acne)
        concern_score = {"redness": redness, "spots": spots, "acne": acne}[concern]
        severity = score_to_severity(concern_score)

        zones.append(
            ZoneResult(
                zone_id=zone_id,
                label=meta["label"],
                redness_score=redness,
                spot_score=spots,
                acne_score=acne,
                primary_concern=concern,
                severity=severity,
                explanation=_build_explanation(zone_id, concern, severity),
            )
        )

    return zones


def draw_zone_overlays(image: np.ndarray) -> np.ndarray:
    output = image.copy()
    h, w = image.shape[:2]
    colors = {
        "forehead": (255, 200, 100),
        "left_cheek": (100, 200, 255),
        "right_cheek": (100, 200, 255),
        "nose": (200, 150, 255),
        "chin": (150, 255, 150),
    }
    for zone_id, meta in ZONE_DEFINITIONS.items():
        x1, y1, x2, y2 = meta["bounds"](h, w)
        cv2.rectangle(output, (x1, y1), (x2, y2), colors.get(zone_id, (255, 255, 255)), 1)
        cv2.putText(
            output,
            meta["label"][:8],
            (x1 + 4, y1 + 16),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            colors.get(zone_id, (255, 255, 255)),
            1,
            cv2.LINE_AA,
        )
    return output
