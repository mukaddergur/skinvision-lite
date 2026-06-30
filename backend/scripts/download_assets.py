import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INGREDIENTS_DIR = ROOT / "frontend" / "public" / "ingredients"
BG_DIR = ROOT / "frontend" / "public" / "backgrounds"

DOWNLOADS = {
    INGREDIENTS_DIR / "niacinamide.jpg": "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "retinol.jpg": "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "vitamin-c.jpg": "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "salicylic.jpg": "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "spf.jpg": "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "hyaluronic.jpg": "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    INGREDIENTS_DIR / "centella.jpg": "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=500&h=360&fit=crop",
    BG_DIR / "ingredients-bg.jpg": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&h=600&fit=crop&q=85",
}
HERO_DIR = ROOT / "frontend" / "public" / "hero"
HERO_DOWNLOADS = {
    HERO_DIR / "hero-face-bright.jpg": "https://images.pexels.com/photos/5069607/pexels-photo-5069607.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
}

if __name__ == "__main__":
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    all_downloads = {**DOWNLOADS, **HERO_DOWNLOADS}
    for path, url in all_downloads.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            data = urllib.request.urlopen(req, context=ctx, timeout=20).read()
            path.write_bytes(data)
            print(f"OK  {path.name} ({len(data)} bytes)")
        except Exception as e:
            print(f"ERR {path.name}: {e}")
    print("Done.")
