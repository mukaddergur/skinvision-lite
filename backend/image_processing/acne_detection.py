import cv2
import numpy as np

from .utils import INTENSITY_MULTIPLIERS, compute_intensity_score


def detect_acne(image: np.ndarray, skin_mask: np.ndarray) -> tuple[np.ndarray, int, int]:
    output = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    diff = cv2.absdiff(gray, blurred)
    diff = cv2.bitwise_and(diff, diff, mask=skin_mask)

    _, acne_mask = cv2.threshold(diff, 22, 255, cv2.THRESH_BINARY)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    red_bump = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([15, 255, 255]))
    red_bump = cv2.bitwise_and(red_bump, skin_mask)
    acne_mask = cv2.bitwise_or(acne_mask, red_bump)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    acne_mask = cv2.morphologyEx(acne_mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(acne_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 15 or area > 800:
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        if w < 3 or h < 3:
            continue
        count += 1
        cv2.rectangle(output, (x - 1, y - 1), (x + w + 1, y + h + 1), (0, 140, 255), 2)

    skin_pixels = max(1, cv2.countNonZero(skin_mask))
    acne_pixels = cv2.countNonZero(acne_mask)
    score = compute_intensity_score(acne_pixels, skin_pixels, multiplier=INTENSITY_MULTIPLIERS["acne"])

    return output, count, score
