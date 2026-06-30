# SkinVision Lite — Backend

Python API ve cilt analiz motoru.

**Tam dokümantasyon:** [../README.md](../README.md) (kurulum, API, veritabanı, sunum)

---

## Çalıştırma

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

→ http://localhost:8000/docs (Swagger) · İlk açılışta admin: `admin` / `admin123`

---

## Ne nerede?

| Klasör / dosya | İçerik |
|----------------|--------|
| `main.py` | API girişi, `/analyze`, `/health` |
| `image_processing/` | Yüz tespiti, kızarıklık, leke, akne (OpenCV + MediaPipe) |
| `ml_model/` | Skor hesaplama (`weights.json`, `predict.py`) |
| `routers/` | Auth, panel, admin endpoint’leri |
| `database.py` | SQLite |
| `services/` | Öneriler ve rutin metinleri |
| `reports/` | PDF rapor |

**Teknoloji:** FastAPI · OpenCV · MediaPipe · SQLite · JWT

---

## Kısa notlar

- Analiz: fotoğraf al → pipeline çalıştır → JSON + işaretli görsel + PDF döndür
- Giriş yapılmışsa analiz veritabanına kaydedilir
- Skorlar backend’de **yoğunluk**; frontend ekranda `100 - yoğunluk` gösterir

Detaylı pipeline, API listesi ve veritabanı → **[../README.md](../README.md)**
