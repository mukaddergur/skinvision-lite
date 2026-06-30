import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
INGREDIENTS_DIR = ROOT / "frontend" / "public" / "ingredients"
W, H = 500, 360


def _rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def _surface() -> Image.Image:
    img = Image.new("RGB", (W, H), _rgb("#f4f1ec"))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(H - 1, 1)
        c = int(244 - t * 18)
        draw.line([(0, y), (W, y)], fill=(c, c - 2, c - 6))
    random.seed(3)
    for _ in range(80):
        x, y = random.randint(0, W), random.randint(0, H)
        s = random.randint(1, 3)
        draw.ellipse([x, y, x + s, y + s], fill=(230, 226, 220))
    return img.filter(ImageFilter.GaussianBlur(0.4))


def _shadow(draw: ImageDraw.ImageDraw, box: list[int], spread: int = 12):
    x1, y1, x2, y2 = box
    draw.ellipse([x1 - spread, y2 - 8, x2 + spread, y2 + 18], fill=(40, 35, 30))


def _tube(draw, cx, cy, body, cap, label=None):
    w, h = 90, 200
    x1, y1 = cx - w // 2, cy - h // 2
    x2, y2 = cx + w // 2, cy + h // 2
    _shadow(draw, [x1, y1, x2, y2])
    draw.rounded_rectangle([x1, y1 + 30, x2, y2], radius=18, fill=body, outline=(255, 255, 255))
    draw.rounded_rectangle([x1 + 8, y1 + 45, x2 - 8, y2 - 15], radius=12, fill=tuple(min(255, c + 25) for c in body))
    draw.rounded_rectangle([x1 + 15, y1, x2 - 15, y1 + 35], radius=8, fill=cap)
    if label:
        draw.rectangle([x1 + 18, cy - 10, x2 - 18, cy + 30], fill=(255, 255, 255, 180))
        draw.text((cx, cy + 10), label, fill=(60, 60, 60), anchor="mm")


def _dropper(draw, cx, cy, liquid, glass=(180, 160, 140)):
    _shadow(draw, [cx - 55, cy - 90, cx + 55, cy + 95], 14)
    draw.rounded_rectangle([cx - 38, cy - 20, cx + 38, cy + 95], radius=12, fill=glass)
    draw.rounded_rectangle([cx - 30, cy + 10, cx + 30, cy + 88], radius=8, fill=liquid)
    draw.rectangle([cx - 8, cy - 75, cx + 8, cy - 20], fill=(90, 80, 70))
    draw.ellipse([cx - 22, cy - 95, cx + 22, cy - 58], fill=(70, 60, 50))


def _jar(draw, cx, cy, cream, lid):
    _shadow(draw, [cx - 70, cy - 40, cx + 70, cy + 80], 16)
    draw.ellipse([cx - 72, cy - 35, cx + 72, cy + 25], fill=lid)
    draw.rounded_rectangle([cx - 68, cy - 10, cx + 68, cy + 78], radius=20, fill=(255, 255, 255))
    draw.ellipse([cx - 58, cy + 5, cx + 58, cy + 55], fill=cream)
    draw.arc([cx - 58, cy + 20, cx + 58, cy + 70], 200, 340, fill=(240, 230, 220), width=6)


def _cream_dollop(draw, x, y, color):
    draw.ellipse([x - 35, y - 20, x + 35, y + 25], fill=color)
    draw.ellipse([x - 22, y - 32, x + 28, y + 5], fill=tuple(min(255, c + 15) for c in color))


def _spf_tube(draw, cx, cy):
    _shadow(draw, [cx - 45, cy - 70, cx + 45, cy + 100])
    draw.rounded_rectangle([cx - 42, cy - 50, cx + 42, cy + 95], radius=14, fill=(255, 255, 255))
    draw.rounded_rectangle([cx - 34, cy - 35, cx + 34, cy + 80], radius=10, fill=(254, 243, 199))
    draw.rectangle([cx - 20, cy - 68, cx + 20, cy - 50], fill=(251, 191, 36))
    draw.text((cx, cy + 15), "SPF 50", fill=(180, 120, 20), anchor="mm")


PRODUCTS = {
    "niacinamide.jpg": lambda d: (_tube(d, 220, 185, (186, 160, 210), (140, 110, 170)), _cream_dollop(d, 340, 220, (255, 248, 252))),
    "retinol.jpg": lambda d: _dropper(d, 250, 175, (160, 100, 55), (150, 130, 110)),
    "vitamin-c.jpg": lambda d: (_dropper(d, 230, 180, (255, 180, 50), (200, 160, 80)), _cream_dollop(d, 350, 230, (255, 220, 120))),
    "salicylic.jpg": lambda d: _tube(d, 250, 185, (200, 230, 245), (100, 160, 200), "BHA"),
    "hyaluronic.jpg": lambda d: _dropper(d, 250, 180, (180, 220, 255), (190, 200, 210)),
    "spf.jpg": lambda d: _spf_tube(d, 250, 175),
    "centella.jpg": lambda d: _jar(d, 250, 190, (200, 235, 210), (120, 175, 140)),
}


def create_product_photo(path: Path, draw_fn):
    img = _surface()
    draw = ImageDraw.Draw(img)
    result = draw_fn(draw)
    if isinstance(result, tuple):
        pass
    img.save(path, quality=93)


if __name__ == "__main__":
    INGREDIENTS_DIR.mkdir(parents=True, exist_ok=True)
    for fname, fn in PRODUCTS.items():
        create_product_photo(INGREDIENTS_DIR / fname, fn)
        print(f"Created {fname}")
    print("Done — 7 product-style ingredient images.")
