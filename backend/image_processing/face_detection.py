import cv2
import numpy as np
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import FaceDetector, FaceDetectorOptions, RunningMode
from mediapipe import Image as MpImage, ImageFormat
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "blaze_face_short_range.tflite"


class FaceNotFoundError(Exception):
    pass


_options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path=str(MODEL_PATH)),
    running_mode=RunningMode.IMAGE,
    min_detection_confidence=0.5,
)
_detector = FaceDetector.create_from_options(_options)


def detect_face(image: np.ndarray) -> tuple[int, int, int, int]:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    mp_image = MpImage(image_format=ImageFormat.SRGB, data=rgb)
    results = _detector.detect(mp_image)

    if not results.detections:
        raise FaceNotFoundError("Yüz tespit edilemedi. Lütfen yüzünüzün görünür olduğu bir fotoğraf kullanın.")

    h, w = image.shape[:2]
    best = max(results.detections, key=lambda d: d.categories[0].score if d.categories else 0)
    bbox = best.bounding_box

    x = max(0, bbox.origin_x)
    y = max(0, bbox.origin_y)
    bw = min(w - x, bbox.width)
    bh = min(h - y, bbox.height)

    if bw < 20 or bh < 20:
        raise FaceNotFoundError("Yüz bölgesi çok küçük. Daha yakın veya net bir fotoğraf deneyin.")

    return x, y, bw, bh


def crop_face_region(image: np.ndarray, padding: float = 0.15) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    x, y, bw, bh = detect_face(image)
    h, w = image.shape[:2]

    pad_x = int(bw * padding)
    pad_y = int(bh * padding)

    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + bw + pad_x)
    y2 = min(h, y + bh + pad_y)

    return image[y1:y2, x1:x2].copy(), (x1, y1, x2 - x1, y2 - y1)
