import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
BG_DIR = ROOT / "frontend" / "public" / "backgrounds"
INGREDIENTS_DIR = ROOT / "frontend" / "public" / "ingredients"


def _gradient(w, h, c1, c2):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    r1, g1, b1 = tuple(int(c1[i : i + 2], 16) for i in (1, 3, 5))
    r2, g2, b2 = tuple(int(c2[i : i + 2], 16) for i in (1, 3, 5))
    for y in range(h):
        t = y / max(h - 1, 1)
        draw.line([(0, y), (w, y)], fill=(
            int(r1 + (r2 - r1) * t), int(g1 + (g2 - g1) * t), int(b1 + (b2 - b1) * t),
        ))
    return img, draw


def create_sunrise(path: Path):
    w, h = 900, 500
    img, draw = _gradient(w, h, "#ff7e5f", "#feb47b")
    draw.ellipse([w // 2 - 80, h - 180, w // 2 + 80, h - 20], fill="#fff4a3", outline="#ffd54f")
    for i in range(12):
        angle = math.radians(i * 30)
        x1 = w // 2 + int(math.cos(angle) * 100)
        y1 = h - 100 + int(math.sin(angle) * 40)
        x2 = w // 2 + int(math.cos(angle) * 200)
        y2 = h - 100 + int(math.sin(angle) * 80)
        draw.line([(x1, y1), (x2, y2)], fill="#fff8e1", width=4)
    for cx in [150, 350, 650, 780]:
        draw.ellipse([cx - 60, 80, cx + 60, 140], fill=(255, 255, 255, 180))
        draw.ellipse([cx - 30, 60, cx + 90, 130], fill=(255, 255, 255, 150))
    img.save(path, quality=92)


def create_starry_night(path: Path):
    w, h = 900, 500
    img, draw = _gradient(w, h, "#0f172a", "#312e81")
    random.seed(42)
    for _ in range(120):
        x, y = random.randint(0, w), random.randint(0, h - 80)
        r = random.choice([1, 1, 2, 2, 3])
        brightness = random.randint(180, 255)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(brightness, brightness, 255))
    draw.ellipse([w - 150, 60, w - 50, 160], fill="#fef9c3", outline="#fde68a")
    draw.ellipse([w - 130, 55, w - 60, 145], fill="#312e81")
    img.save(path, quality=92)


def create_serum_photo(path: Path, liquid_color, bottle_tint):
    w, h = 500, 360
    img, draw = _gradient(w, h, "#f8fafc", "#e2e8f0")
    draw.rounded_rectangle([180, 80, 320, 280], radius=15, fill=(255, 255, 255), outline="#cbd5e1")
    draw.rectangle([235, 50, 265, 85], fill=bottle_tint)
    draw.rounded_rectangle([195, 140, 305, 265], radius=10, fill=liquid_color)
    random.seed(11)
    for _ in range(8):
        x, y = random.randint(50, 450), random.randint(50, 300)
        r = random.randint(6, 18)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=liquid_color)
    img.save(path, quality=92)


if __name__ == "__main__":
    BG_DIR.mkdir(parents=True, exist_ok=True)
    INGREDIENTS_DIR.mkdir(parents=True, exist_ok=True)

    morning = BG_DIR / "routine-morning.jpg"
    evening = BG_DIR / "routine-evening.jpg"
    if not morning.exists() or morning.stat().st_size < 5000:
        create_sunrise(morning)
        print("Created sunrise")
    if not evening.exists() or evening.stat().st_size < 5000:
        create_starry_night(evening)
        print("Created starry night")
    fallbacks = {
        "niacinamide.jpg": ((200, 220, 255), (148, 163, 184)),
        "vitamin-c.jpg": ((255, 220, 100), (251, 191, 36)),
        "spf.jpg": ((255, 240, 200), (253, 186, 116)),
    }
    for fname, (liq, tint) in fallbacks.items():
        p = INGREDIENTS_DIR / fname
        if not p.exists() or p.stat().st_size < 3000:
            create_serum_photo(p, liq, tint)
            print(f"Created {fname}")

    print("Done.")
