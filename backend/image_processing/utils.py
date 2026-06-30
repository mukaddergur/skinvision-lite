DISCLAIMER = (
    "Bu analiz yalnızca eğitim ve görüntü işleme amaçlıdır. "
    "Tıbbi teşhis veya tedavi önerisi sunmaz. "
    "Cilt sağlığınız için bir dermatoloğa danışın."
)


def score_to_severity(score: int) -> str:
    if score <= 33:
        return "low"
    if score <= 66:
        return "medium"
    return "high"


def compute_intensity_score(detected_pixels: int, total_pixels: int, multiplier: float = 5.0) -> int:
    ratio = detected_pixels / max(1, total_pixels)
    scaled = (ratio ** 0.72) * multiplier * 38
    return int(min(100, max(0, round(scaled))))


def calibrate_intensity_score(raw: int) -> int:
    x = max(0, min(100, raw))
    if x <= 35:
        return int(round(x * 0.32))
    if x <= 60:
        return int(round(11 + (x - 35) * 0.36))
    if x <= 80:
        return int(round(20 + (x - 60) * 1.1))
    return int(round(42 + (x - 80) * 2.9))


INTENSITY_MULTIPLIERS = {
    "redness": 3.5,
    "spots": 2.8,
    "acne": 4.0,
}
