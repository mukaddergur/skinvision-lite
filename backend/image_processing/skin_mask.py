import cv2
import numpy as np


def create_skin_mask(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)

    lower_hsv = np.array([0, 20, 60], dtype=np.uint8)
    upper_hsv = np.array([25, 180, 255], dtype=np.uint8)
    hsv_mask = cv2.inRange(hsv, lower_hsv, upper_hsv)

    lower_ycrcb = np.array([0, 133, 77], dtype=np.uint8)
    upper_ycrcb = np.array([255, 173, 127], dtype=np.uint8)
    ycrcb_mask = cv2.inRange(ycrcb, lower_ycrcb, upper_ycrcb)

    combined = cv2.bitwise_and(hsv_mask, ycrcb_mask)
    center = (w // 2, h // 2)
    axes = (int(w * 0.42), int(h * 0.48))
    cv2.ellipse(mask, center, axes, 0, 0, 360, 255, -1)

    skin = cv2.bitwise_and(combined, mask)

    eye_y = int(h * 0.35)
    eye_h = int(h * 0.12)
    cv2.rectangle(skin, (int(w * 0.15), eye_y), (int(w * 0.85), eye_y + eye_h), 0, -1)
    mouth_y = int(h * 0.72)
    mouth_h = int(h * 0.15)
    cv2.rectangle(skin, (int(w * 0.25), mouth_y), (int(w * 0.75), mouth_y + mouth_h), 0, -1)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, kernel)
    skin = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, kernel)

    return skin
