import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
PRODUCTS_DIR = ROOT / "frontend" / "public" / "products"
INGREDIENTS_DIR = ROOT / "frontend" / "public" / "ingredients"


def _hex_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def _gradient(size: tuple[int, int], c1: str, c2: str) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    r1, g1, b1 = _hex_rgb(c1)
    r2, g2, b2 = _hex_rgb(c2)
    for y in range(h):
        t = y / max(1, h - 1)
        draw.line([(0, y), (w, y)], fill=(
            int(r1 + (r2 - r1) * t),
            int(g1 + (g2 - g1) * t),
            int(b1 + (b2 - b1) * t),
        ))
    return img


def _draw_bottle(draw: ImageDraw.ImageDraw, cx: int, cy: int):
    draw.rounded_rectangle([cx - 55, cy - 70, cx + 55, cy + 60], radius=20, fill=(255, 255, 255))
    draw.rounded_rectangle([cx - 20, cy - 95, cx + 20, cy - 70], radius=6, fill=(255, 255, 255))


def create_product_image(path: Path, color: str, title: str, subtitle: str):
    img = _gradient((400, 300), color, "#1e293b")
    draw = ImageDraw.Draw(img)
    _draw_bottle(draw, 200, 140)
    draw.text((200, 235), title, fill="white", anchor="mm")
    draw.text((200, 260), subtitle, fill=(220, 220, 220), anchor="mm")
    img.save(path, quality=92)


def _draw_droplets(draw, w, h, color, count=18):
    random.seed(42)
    for _ in range(count):
        x, y = random.randint(20, w - 20), random.randint(20, h - 40)
        r = random.randint(8, 22)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color, outline=(255, 255, 255, 80))


def _draw_cream_smear(draw, w, h):
    draw.ellipse([w // 4, h // 3, w * 3 // 4, h * 2 // 3], fill=(255, 230, 240))
    draw.arc([w // 3, h // 2, w * 2 // 3, h], 0, 180, fill=(250, 200, 210), width=8)


def _draw_clay_texture(draw, w, h, base, accent):
    random.seed(7)
    for _ in range(120):
        x, y = random.randint(0, w), random.randint(0, h)
        s = random.randint(2, 8)
        draw.ellipse([x, y, x + s, y + s], fill=accent if random.random() > 0.5 else base)


def create_ingredient_texture(path: Path, style: str):
    w, h = 400, 280
    if style == "droplets":
        img = _gradient((w, h), "#e2e8f0", "#94a3b8")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (200, 220, 255, 180))
    elif style == "golden":
        img = _gradient((w, h), "#fef3c7", "#d97706")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (255, 220, 100, 200), 14)
    elif style == "citrus":
        img = _gradient((w, h), "#fef9c3", "#facc15")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (255, 240, 150, 200), 12)
    elif style == "clay":
        img = Image.new("RGB", (w, h), (134, 180, 140))
        draw = ImageDraw.Draw(img)
        _draw_clay_texture(draw, w, h, (120, 160, 130), (160, 200, 160))
    elif style == "water":
        img = _gradient((w, h), "#e0f2fe", "#38bdf8")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (180, 230, 255, 160), 20)
    elif style == "cream":
        img = Image.new("RGB", (w, h), (252, 250, 248))
        draw = ImageDraw.Draw(img)
        _draw_cream_smear(draw, w, h)
        draw.rectangle([w - 60, 30, w - 20, 120], outline=(200, 200, 200), width=2)
    elif style == "lavender":
        img = _gradient((w, h), "#ede9fe", "#a78bfa")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (220, 200, 255, 180), 10)
    else:  
        img = _gradient((w, h), "#d1fae5", "#34d399")
        draw = ImageDraw.Draw(img)
        _draw_droplets(draw, w, h, (150, 230, 180, 160), 15)

    img.save(path, quality=92)


PRODUCTS = [
    ("cleanser_salicylic.jpg", "#ea580c", "Salisilik Asit", "Temizleyici"),
    ("moisturizer_oil_free.jpg", "#0284c7", "Hyaluronik Asit", "Nemlendirici"),
    ("serum_niacinamide.jpg", "#e11d48", "Niacinamide %5", "Serum"),
    ("serum_vitamin_c.jpg", "#d97706", "C Vitamini", "Serum"),
    ("spf50.jpg", "#7c3aed", "SPF 50+", "Güneş Koruyucu"),
    ("soothing.jpg", "#059669", "Centella", "Yatıştırıcı"),
    ("basic_cleanser.jpg", "#64748b", "Nazik Jel", "Temizleyici"),
    ("basic_moisturizer.jpg", "#2563eb", "Hafif Nem", "Nemlendirici"),
]

INGREDIENTS = [
    ("niacinamide.jpg", "droplets"),
    ("retinol.jpg", "golden"),
    ("vitamin-c.jpg", "citrus"),
    ("salicylic.jpg", "clay"),
    ("hyaluronic.jpg", "water"),
    ("spf.jpg", "lavender"),
    ("centella.jpg", "green"),
]


if __name__ == "__main__":
    PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)
    INGREDIENTS_DIR.mkdir(parents=True, exist_ok=True)
    BG_DIR = ROOT / "frontend" / "public" / "backgrounds"
    BG_DIR.mkdir(parents=True, exist_ok=True)

    for fname, color, title, sub in PRODUCTS:
        create_product_image(PRODUCTS_DIR / fname, color, title, sub)
    for fname, style in INGREDIENTS:
        create_ingredient_texture(INGREDIENTS_DIR / fname, style)

    def _water_bg(path, c1, c2, bubbles=True):
        img = _gradient((1200, 600), c1, c2)
        draw = ImageDraw.Draw(img)
        if bubbles:
            random.seed(99)
            for _ in range(40):
                x, y = random.randint(0, 1200), random.randint(0, 600)
                r = random.randint(15, 80)
                draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 30), outline=(255, 255, 255, 60))
        img.save(path, quality=90)

    _water_bg(BG_DIR / "hero-water.jpg", "#bae6fd", "#38bdf8")
    _water_bg(BG_DIR / "routine-morning.jpg", "#fde68a", "#fb923c", bubbles=False)
    _water_bg(BG_DIR / "routine-evening.jpg", "#ddd6fe", "#818cf8", bubbles=False)
    _water_bg(BG_DIR / "ingredients-bg.jpg", "#fff1f2", "#fecdd3", bubbles=True)

    print(f"Created {len(PRODUCTS)} products + {len(INGREDIENTS)} ingredients + 4 backgrounds")
