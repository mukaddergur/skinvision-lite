from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np

WEIGHTS_PATH = Path(__file__).resolve().parent / "weights.json"


class SkinMLPredictor:
    def __init__(self):
        with open(WEIGHTS_PATH, encoding="utf-8") as f:
            self.config = json.load(f)

    def _masked_stats(self, channel: np.ndarray, mask: np.ndarray) -> tuple[float, float]:
        pixels = channel[mask > 0]
        if pixels.size == 0:
            return 0.0, 0.0
        return float(np.mean(pixels)), float(np.std(pixels))

    def extract_features(self, image: np.ndarray, skin_mask: np.ndarray) -> dict[str, float]:
        h, w = image.shape[:2]
        pixels = max(1, cv2.countNonZero(skin_mask))

        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        h_ch, s_ch, v_ch = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
        l_ch, a_ch, b_ch = lab[:, :, 0], lab[:, :, 1], lab[:, :, 2]

        red1 = cv2.inRange(hsv, np.array([0, 50, 70]), np.array([10, 255, 255]))
        red2 = cv2.inRange(hsv, np.array([170, 50, 70]), np.array([180, 255, 255]))
        red_mask = cv2.bitwise_and(cv2.bitwise_or(red1, red2), skin_mask)

        l_blur = cv2.GaussianBlur(l_ch, (5, 5), 0)
        l_mean, _ = self._masked_stats(l_blur, skin_mask)
        _, dark_mask = cv2.threshold(l_blur, max(45, l_mean - 18), 255, cv2.THRESH_BINARY_INV)
        dark_mask = cv2.bitwise_and(dark_mask, skin_mask)

        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        diff = cv2.absdiff(gray, blur)
        _, hf_mask = cv2.threshold(diff, 22, 255, cv2.THRESH_BINARY)
        hf_mask = cv2.bitwise_and(hf_mask, skin_mask)

        lap = cv2.Laplacian(gray, cv2.CV_64F)
        texture_var = float(np.var(lap[skin_mask > 0])) if pixels > 0 else 0.0

        a_mean, a_std = self._masked_stats(a_ch, skin_mask)
        s_mean, s_std = self._masked_stats(s_ch, skin_mask)
        l_std = self._masked_stats(l_ch, skin_mask)[1]

        hist = cv2.calcHist([gray], [0], skin_mask, [32], [0, 256])
        hist = hist / max(1, hist.sum())
        entropy = float(-np.sum(hist * np.log2(hist + 1e-8)))

        contours, _ = cv2.findContours(hf_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        blob_count = sum(1 for c in contours if 15 < cv2.contourArea(c) < 800)

        red_overlap = cv2.countNonZero(cv2.bitwise_and(hf_mask, red_mask))

        return {
            "red_ratio": cv2.countNonZero(red_mask) / pixels,
            "a_channel_mean": a_mean / 255.0,
            "red_std": a_std / 255.0,
            "saturation_mean": s_mean / 255.0,
            "dark_ratio": cv2.countNonZero(dark_mask) / pixels,
            "l_channel_std": l_std / 255.0,
            "contrast": (float(gray[skin_mask > 0].max()) - float(gray[skin_mask > 0].min())) / 255.0
            if pixels > 1
            else 0.0,
            "entropy": entropy / 5.0,
            "high_freq_ratio": cv2.countNonZero(hf_mask) / pixels,
            "local_contrast": float(np.mean(diff[skin_mask > 0])) / 255.0,
            "red_spot_overlap": red_overlap / pixels,
            "blob_count_norm": min(1.0, blob_count / 25.0),
            "texture_var": min(1.0, texture_var / 500.0),
        }

    def _score_from_features(self, concern: str, features: dict[str, float]) -> int:
        cfg = self.config[concern]
        raw = cfg["bias"]
        for key, weight in cfg["weights"].items():
            raw += features.get(key, 0.0) * weight
        return int(min(100, max(0, round(raw))))

    def predict(self, image: np.ndarray, skin_mask: np.ndarray) -> dict:
        features = self.extract_features(image, skin_mask)
        redness = self._score_from_features("redness", features)
        spots = self._score_from_features("spots", features)
        acne = self._score_from_features("acne", features)
        overall = int(round((redness + spots + acne) / 3))

        consistency = 1.0 - abs(features["red_ratio"] - features["high_freq_ratio"])
        confidence = int(min(92, max(58, 65 + consistency * 25)))

        dominant = max(
            [("kızarıklık", redness), ("leke", spots), ("akne benzeri", acne)],
            key=lambda x: x[1],
        )

        summary = (
            f"ML modeli cilt bölgesinde en belirgin sinyali '{dominant[0]}' olarak "
            f"değerlendirdi (skor: {dominant[1]}/100). "
            f"Doku analizi ve renk histogramı birleştirilerek hesaplandı."
        )

        return {
            "scores": {
                "redness_score": redness,
                "spot_score": spots,
                "acne_score": acne,
                "overall_score": overall,
            },
            "confidence_percent": confidence,
            "method": "Hibrit özellik çıkarımı + ağırlıklı skorlama (weights.json)",
            "summary": summary,
            "dominant_concern": dominant[0],
        }

    def blend_with_opencv(
        self,
        opencv_scores: dict[str, int],
        ml_scores: dict[str, int],
    ) -> dict[str, int]:
        ow = self.config["blend"]["opencv_weight"]
        mw = self.config["blend"]["ml_weight"]
        blended = {}
        for key in ("redness_score", "spot_score", "acne_score"):
            blended[key] = int(round(opencv_scores[key] * ow + ml_scores[key] * mw))
        blended["overall_score"] = int(
            round((blended["redness_score"] + blended["spot_score"] + blended["acne_score"]) / 3)
        )
        return blended
