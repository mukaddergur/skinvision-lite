import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
INGREDIENTS_DIR = ROOT / "frontend" / "public" / "ingredients"
W, H = 500, 360


def _gradient(c1, c2):
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(H - 1, 1)
        draw.line([(0, y), (W, y)], fill=tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)))
    return img, ImageDraw.Draw(img)


def texture_glycolic(path: Path):
    img, draw = _gradient((235, 225, 210), (200, 185, 160))
    random.seed(21)
    for _ in range(14):
        x, y = random.randint(40, W - 40), random.randint(40, H - 40)
        r = random.randint(22, 55)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 240, 200))
        draw.ellipse([x - r + 8, y - r + 6, x - r + 22, y - r + 18], fill=(255, 255, 255))
    img.filter(ImageFilter.GaussianBlur(0.6)).save(path, quality=93)


def texture_vitamin_c(path: Path):
    img, draw = _gradient((255, 248, 235), (255, 220, 170))
    random.seed(33)
    for _ in range(35):
        x, y = random.randint(0, W), random.randint(0, H)
        r = random.randint(4, 18)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 200, 100))
    for _ in range(6):
        x, y = random.randint(60, W - 60), random.randint(50, H - 50)
        r = random.randint(28, 48)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 180, 60))
        draw.ellipse([x - r + 6, y - r + 5, x - r + 16, y - r + 14], fill=(255, 255, 255))
    img.filter(ImageFilter.GaussianBlur(0.5)).save(path, quality=93)


if __name__ == "__main__":
    INGREDIENTS_DIR.mkdir(parents=True, exist_ok=True)
    texture_glycolic(INGREDIENTS_DIR / "texture-glycolic.jpg")
    texture_vitamin_c(INGREDIENTS_DIR / "texture-vitamin-c.jpg")
    print("Created texture-glycolic.jpg + texture-vitamin-c.jpg")
