import cv2
import numpy as np

from .utils import INTENSITY_MULTIPLIERS, compute_intensity_score


def detect_spots(image: np.ndarray, skin_mask: np.ndarray) -> tuple[np.ndarray, int, int]:
   
    output = image.copy()
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]

    blurred = cv2.GaussianBlur(l_channel, (5, 5), 0)
    mean_val = cv2.mean(blurred, mask=skin_mask)[0]
    threshold = max(45, mean_val - 18)

    _, spot_mask = cv2.threshold(blurred, threshold, 255, cv2.THRESH_BINARY_INV)
    spot_mask = cv2.bitwise_and(spot_mask, skin_mask)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    spot_mask = cv2.morphologyEx(spot_mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(spot_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 40:
            continue
        (cx, cy), radius = cv2.minEnclosingCircle(cnt)
        if radius < 4:
            continue
        count += 1
        cv2.circle(output, (int(cx), int(cy)), int(radius) + 2, (80, 80, 80), 2)

    skin_pixels = max(1, cv2.countNonZero(skin_mask))
    spot_pixels = cv2.countNonZero(spot_mask)
    score = compute_intensity_score(spot_pixels, skin_pixels, multiplier=INTENSITY_MULTIPLIERS["spots"])

    return output, count, score
