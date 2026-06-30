import cv2
import numpy as np

from .utils import INTENSITY_MULTIPLIERS, compute_intensity_score


def detect_redness(image: np.ndarray, skin_mask: np.ndarray) -> tuple[np.ndarray, int, int]:
    output = image.copy()
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    lower1 = np.array([0, 50, 70], dtype=np.uint8)
    upper1 = np.array([10, 255, 255], dtype=np.uint8)
    lower2 = np.array([170, 50, 70], dtype=np.uint8)
    upper2 = np.array([180, 255, 255], dtype=np.uint8)

    red_mask = cv2.bitwise_or(
        cv2.inRange(hsv, lower1, upper1),
        cv2.inRange(hsv, lower2, upper2),
    )
    red_mask = cv2.bitwise_and(red_mask, skin_mask)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    red_mask = cv2.morphologyEx(red_mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 30:
            continue
        (cx, cy), radius = cv2.minEnclosingCircle(cnt)
        if radius < 3:
            continue
        count += 1
        cv2.circle(output, (int(cx), int(cy)), int(radius) + 2, (0, 0, 255), 2)

    skin_pixels = max(1, cv2.countNonZero(skin_mask))
    red_pixels = cv2.countNonZero(red_mask)
    score = compute_intensity_score(red_pixels, skin_pixels, multiplier=INTENSITY_MULTIPLIERS["redness"])

    return output, count, score
