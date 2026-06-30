# SkinVision Lite

**Yapay zeka destekli cilt görüntü analizi** web uygulaması.

Kullanıcı cilt tipini seçer, kısa anket doldurur, yüz fotoğrafı yükler. Sistem fotoğrafı analiz ederek kızarıklık, leke ve akne benzeri bölgeleri tespit eder; skor, kişisel bakım önerisi ve PDF rapor sunar. Giriş yapan kullanıcılar analiz geçmişini panelden takip edebilir.

> **Önemli:** Bu proje eğitim ve bitirme projesi amaçlıdır. Tıbbi teşhis veya tedavi önerisi **sunmaz**. Cilt sağlığınız için dermatoloğa danışın.

---

## İçindekiler

1. [Genel bakış](#genel-bakış)
2. [Özellikler](#özellikler)
3. [Sistem mimarisi](#sistem-mimarisi)
4. [Kullanılan teknolojiler](#kullanılan-teknolojiler)
5. [Backend — ne yaptık?](#backend--ne-yaptık)
6. [Frontend — ne yaptık?](#frontend--ne-yaptık)
7. [Veritabanı](#veritabanı)
8. [Skorlar nasıl hesaplanır?](#skorlar-nasıl-hesaplanır)
9. [API referansı](#api-referansı)
10. [Kurulum](#kurulum)
11. [Kullanım kılavuzu](#kullanım-kılavuzu)
12. [Klasör yapısı](#klasör-yapısı)
13. [GitHub'a yükleme](#githuba-yükleme)
14. [Sık karşılaşılan sorunlar](#sık-karşılaşılan-sorunlar)
15. [Sunum notları](#sunum-notları)

---

## Genel bakış

SkinVision Lite, **full-stack** bir web uygulamasıdır:

| Katman | Teknoloji | Görev |
|--------|-----------|-------|
| Arayüz | React + Vite | Kullanıcının gördüğü sayfalar, formlar, kartlar |
| API | Python FastAPI | Fotoğraf alma, analiz, kullanıcı işlemleri |
| Analiz | OpenCV + MediaPipe | Yüz ve cilt bölgesi tespiti |
| ML | Hibrit model | `weights.json` ile skor hesaplama |
| Veri | SQLite | Kullanıcı, analiz, ürün, rutin kayıtları |

Proje tek repoda toplanmıştır: `backend/` (Python) ve `frontend/` (React) birlikte çalışır.

**Çalışma mantığı:**

```
Kullanıcı (tarayıcı)
    ↓  fotoğraf + cilt tipi
React Frontend  →  POST /analyze  →  FastAPI Backend
                                          ↓
                              OpenCV pipeline + ML skor
                                          ↓
                              JSON sonuç + işaretli görsel + PDF
    ↓
Sonuç sayfası (skorlar, öneriler, rutin)
    ↓  (giriş yapılmışsa)
SQLite veritabanına kayıt → Kullanıcı paneli
```

---

## Özellikler

### Cilt analizi
- 5 cilt tipi: normal, kuru, yağlı, karma, hassas
- Çok adımlı anket (cilt hissi, öncelikli ihtiyaç)
- Fotoğraf yükleme veya canlı kamera (oval yüz rehberi)
- Fotoğraf kuralları onayı (makyajsız, iyi ışık, tam yüz)
- MediaPipe ile yüz tespiti
- Kızarıklık, leke, akne benzeri bölge tespiti ve görsel işaretleme
- Bölgesel analiz: alın, yanak, burun/T bölgesi, çene, göz altı, kızarıklık
- Kalibre edilmiş skorlar (sağlıklı cilt görünümü ~80+ hedeflenir)
- Kişiselleştirilmiş sabah / akşam rutin önerisi
- PDF rapor indirme

### Ana sayfa
- Hero bölümü ve analiz başlatma
- Bölgesel analiz önizleme kartları (6 bölge)
- Kişisel rutin tanıtımı (sabah / akşam görselleri)
- Etken madde rehberi: Hyaluronik Asit, Salisilik Asit, Niacinamide, Retinol, Glikolik Asit, C Vitamini

### Kullanıcı sistemi
- Kayıt ve giriş (JWT token)
- Giriş yapılınca analizler otomatik kaydedilir
- **Panel:** analiz geçmişi, iki analizi karşılaştırma, ürün takibi, aylık rutin takvimi
- Rutin takvimi: sabah (sarı), akşam (mor), yüz yıkama (mavi) işaretçileri

### Admin paneli
- Toplam kullanıcı, analiz, ürün ve rutin kayıt sayıları
- Kullanıcı listesi ve kullanıcı bazlı analiz geçmişi
- Varsayılan hesap: `admin` / `admin123` (ilk backend açılışında oluşur)

---

## Sistem mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  Home │ Analiz │ Sonuçlar │ Giriş │ Panel │ Admin       │
│         skinApi.js │ authApi.js │ panelApi.js           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (localhost:5173 → :8000)
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│  main.py ── /analyze, /health                           │
│  auth_routes │ panel_routes │ admin_routes               │
│  database.py (SQLite)                                    │
├─────────────────────────────────────────────────────────┤
│              image_processing/ (OpenCV)                  │
│  face_detection → skin_mask → redness/spot/acne          │
│  zone_analysis → pipeline.py                            │
├─────────────────────────────────────────────────────────┤
│  ml_model/ (weights.json + predict.py)                   │
│  services/ (öneriler, rutin)                             │
│  reports/ (PDF)                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Kullanılan teknolojiler

### Backend (`requirements.txt`)

| Paket | Kullanım |
|-------|----------|
| fastapi | REST API framework |
| uvicorn | ASGI sunucu |
| opencv-python | Görüntü işleme |
| mediapipe | Yüz tespiti |
| numpy | Dizi hesaplamaları |
| pillow | Görsel işlemleri |
| python-multipart | Dosya yükleme |
| reportlab | PDF rapor |
| python-jose | JWT token |
| bcrypt | Şifre hash |
| email-validator | E-posta doğrulama |

### Frontend (`package.json`)

| Paket | Kullanım |
|-------|----------|
| react 19 | UI bileşenleri |
| react-router-dom | Sayfa yönlendirme |
| vite 8 | Build ve dev sunucu |
| tailwindcss 4 | CSS stilleri |
| axios | HTTP istekleri |
| recharts | Grafik (panel için hazır) |

---

## Backend — ne yaptık?

Tüm analiz ve veri işlemleri `backend/` klasöründe Python ile yazıldı.

### API giriş noktası

**`main.py`**
- FastAPI uygulamasını başlatır
- CORS: frontend (`localhost:5173`) erişimine izin verir
- `POST /analyze`: fotoğraf + `skin_type` alır, pipeline çalıştırır, JSON döner
- `GET /health`: sunucu durumu
- `/outputs` ve `/uploads` klasörlerini statik olarak sunar
- Giriş yapılmışsa analizi veritabanına kaydeder (`saved_analysis_id`)
- Startup'ta veritabanı oluşturur ve admin hesabı yoksa ekler

**`schemas.py`**
- API cevap modelleri: `AnalysisScores`, `SeverityLevels`, `ZoneAnalysis`, `PersonalizedRoutine`, `Recommendations`, `MLInsights` vb.

**`auth.py`**
- JWT access token üretimi ve doğrulama
- bcrypt ile şifre hash / doğrulama
- `get_optional_user`: analiz endpoint'inde opsiyonel giriş kontrolü

### Görüntü işleme modülleri (`image_processing/`)

| Dosya | Görev |
|-------|--------|
| `pipeline.py` | Ana analiz akışını yönetir; OpenCV + ML skorlarını birleştirir |
| `face_detection.py` | MediaPipe BlazeFace modeli ile yüz kutusu bulur |
| `skin_mask.py` | Yüz bölgesinde cilt maskesi oluşturur |
| `redness_detection.py` | Kızarıklık bölgelerini tespit eder, kırmızı daire çizer |
| `spot_detection.py` | Leke / pigmentasyon tespiti |
| `acne_detection.py` | Akne benzeri bölge tespiti |
| `zone_analysis.py` | Alın, yanak, burun, çene için ayrı skor ve açıklama |
| `utils.py` | Yoğunluk skoru hesabı, kalibrasyon, şiddet seviyesi |

**Pipeline adımları (`pipeline.run`):**
1. Yüz kırpılır (`crop_face_region`)
2. Cilt maskesi oluşturulur
3. Kızarıklık, leke, akne modülleri sırayla çalışır
4. OpenCV skorları ile ML skorları harmanlanır (`blend_with_opencv`)
5. Skorlar kalibre edilir (`calibrate_intensity_score`)
6. Bölgesel analiz ve zone overlay görseli üretilir
7. Güven mesajı ve ML insights eklenir

### ML modülü (`ml_model/`)

| Dosya | Görev |
|-------|--------|
| `weights.json` | Özellik ağırlıkları (hibrit yaklaşım) |
| `predict.py` | `SkinMLPredictor` — görüntüden özellik çıkarır, skor üretir, OpenCV ile harmanlar |

> Tam eğitilmiş derin öğrenme modeli yerine özellik çıkarımı + ağırlıklı skor kullanıldı. Bu eğitim projesi için daha hafif ve anlaşılır bir yaklaşımdır.

### İş mantığı (`services/`)

| Dosya | Görev |
|-------|--------|
| `recommendations.py` | Skor ve şiddete göre ürün kartları, aksiyon önerileri, doktora yönlendirme kararı |
| `routine_generator.py` | Cilt tipi ve bölgesel sonuçlara göre sabah/akşam rutin metinleri |

### Rapor (`reports/`)

| Dosya | Görev |
|-------|--------|
| `report_generator.py` | ReportLab ile PDF rapor: skorlar, öneriler, uyarı metni |

### Router'lar (`routers/`)

| Dosya | Endpoint grubu |
|-------|----------------|
| `auth_routes.py` | `/auth/register`, `/auth/login`, `/auth/me` |
| `panel_routes.py` | `/panel/analyses`, `/panel/products`, `/panel/routine` |
| `admin_routes.py` | `/admin/stats`, `/admin/users` |

### Veritabanı (`database.py`)

SQLite ile CRUD işlemleri: kullanıcı oluşturma, analiz kaydetme, ürün ve rutin log yönetimi.

---

## Frontend — ne yaptık?

Tüm arayüz `frontend/src/` altında React bileşenleri olarak yazıldı.

### Sayfa yapısı (`pages/`)

| Dosya | Rota | Açıklama |
|-------|------|----------|
| `Home.jsx` | `/` | Ana sayfa: hero, analiz bölümü, bölgesel kartlar, rutin, etken maddeler |
| `AnalysisPage.jsx` | `/analiz` | Tam ekran analiz akışı |
| `ResultsPage.jsx` | `/sonuclar` | Skorlar, detay kartları, PDF, rutin modal |
| `LoginPage.jsx` | `/giris` | Kayıt / giriş formu |
| `PanelPage.jsx` | `/panel` | Geçmiş, karşılaştırma, ürünler, rutin takvimi |
| `AdminPage.jsx` | `/admin` | Yönetici istatistikleri ve kullanıcı listesi |

Rotalar `App.jsx` içinde `react-router-dom` ile tanımlıdır.

### API katmanı (`api/`)

| Dosya | Görev |
|-------|--------|
| `skinApi.js` | `POST /analyze` — `FormData` ile fotoğraf ve `skin_type` gönderir; giriş varsa `Authorization` header ekler |
| `authApi.js` | Kayıt, giriş; token'ı `localStorage`'a yazar |
| `panelApi.js` | Panel ve admin endpoint çağrıları |

### Analiz akışı bileşenleri

| Bileşen | Görev |
|---------|--------|
| `AnalysisFlowSection.jsx` | Intro → anket → fotoğraf adımları; `navigate('/sonuclar')` ile sonuç aktarımı |
| `SkinQuestionnaire.jsx` | Adım adım anket, ilerleme çubuğu, geri/devam butonları |
| `SkinTypeSelector.jsx` | 5 cilt tipi kartı; `FaceRegionPhoto` ile bölge halkaları |
| `PhotoGuidelinesModal.jsx` | Fotoğraf öncesi kurallar modalı |
| `ImageUploader.jsx` | Sürükle-bırak veya tıklayarak yükleme |
| `CameraCapture.jsx` | `getUserMedia` ile kamera; oval rehber; çek ve analiz et |
| `ModeSelector.jsx` | Yükleme / kamera sekmeleri |

### Sonuç ekranı bileşenleri

| Bileşen | Görev |
|---------|--------|
| `buildConcernInsights.js` | Backend cevabını UI formatına çevirir; `100 - yoğunluk` = sağlık skoru |
| `ScoreCircleNav.jsx` | Dikey skor navigasyonu; tıklanınca ilgili karta kaydırır |
| `ConcernAnalysisCard.jsx` | Her konu (kızarıklık, leke, akne) için skor kartı ve öneri |
| `ReportDownload.jsx` | PDF indirme linki |
| `PersonalizedRoutineModal.jsx` | Sabah/akşam rutin popup |
| `AccuracyBanner.jsx` | Analiz güven seviyesi uyarısı |

### Ana sayfa ve ortak bileşenler

| Bileşen | Görev |
|---------|--------|
| `AppHeader.jsx` | Logo, Giriş / Panelim / Admin / Çıkış / Ana sayfa menüsü |
| `HeroSection.jsx` | Üst tanıtım, analiz başlat butonu, hızlı linkler |
| `HeroVisual.jsx` | Hero görseli |
| `RegionalAnalysisPreview.jsx` | 6 bölgesel analiz kartı (yatay kaydırma) |
| `FaceRegionPhoto.jsx` | Yüz fotoğrafı üzerinde renkli bölge halkaları |
| `PersonalRoutinePreview.jsx` | Sabah/akşam rutin tanıtım görselleri |
| `IngredientCarousel.jsx` | Etken madde kartları carousel |

### Oturum yönetimi

**`AuthContext.jsx`**
- `user`, `login`, `register`, `logout` fonksiyonları
- Token ve kullanıcı bilgisi tüm uygulamada paylaşılır
- Giriş gerektiren sayfalar (`PanelPage`, `AdminPage`) yönlendirme yapar

### Veri dosyaları (`data/`)

| Dosya | İçerik |
|-------|--------|
| `skinQuestions.js` | Anket soruları, seçenekler, cilt tipi türetme mantığı |
| `ingredients.js` | Etken madde kartları: başlık, açıklama, görsel, gradient |

---

## Veritabanı

Dosya: `backend/skinvision.db` (ilk backend açılışında otomatik oluşur, GitHub'a gitmez)

### Tablolar

**`users`**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Birincil anahtar |
| username | TEXT | Benzersiz kullanıcı adı |
| email | TEXT | Benzersiz e-posta |
| password_hash | TEXT | bcrypt hash |
| is_admin | INTEGER | 0 = normal, 1 = admin |
| created_at | TEXT | Kayıt tarihi (UTC) |

**`analyses`**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Birincil anahtar |
| user_id | INTEGER | Hangi kullanıcı |
| skin_type | TEXT | normal, dry, oily, combination, sensitive |
| overall_score | INTEGER | Genel yoğunluk skoru |
| redness_score | INTEGER | Kızarıklık skoru |
| spot_score | INTEGER | Leke skoru |
| acne_score | INTEGER | Akne skoru |
| result_json | TEXT | Tam API cevabı (JSON) |
| image_url | TEXT | Yüklenen fotoğraf yolu |
| created_at | TEXT | Analiz tarihi |

**`user_products`**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Birincil anahtar |
| user_id | INTEGER | Kullanıcı |
| name | TEXT | Ürün adı |
| category | TEXT | Kategori (serum, temizleyici vb.) |
| ingredient | TEXT | Etken madde |
| started_at | TEXT | Kullanmaya başlama tarihi |
| notes | TEXT | Notlar |

**`routine_logs`**
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | INTEGER | Birincil anahtar |
| user_id | INTEGER | Kullanıcı |
| log_date | TEXT | Gün (YYYY-MM-DD) |
| morning_done | INTEGER | Sabah rutini (0/1) |
| evening_done | INTEGER | Akşam rutini (0/1) |
| face_wash_done | INTEGER | Yüz yıkama (0/1) |
| notes | TEXT | Notlar |

---

## Skorlar nasıl hesaplanır?

### Backend — yoğunluk skoru

OpenCV modülleri ham yoğunluk üretir → ML ile harmanlanır → `calibrate_intensity_score` ile kullanıcı dostu aralığa çekilir.

| Alan | Anlam |
|------|--------|
| `redness_score` | Kızarıklık yoğunluğu (0–100) |
| `spot_score` | Leke yoğunluğu |
| `acne_score` | Akne benzeri bölge yoğunluğu |
| `overall_score` | Üç skorun ortalaması |

**Yüksek yoğunluk = daha belirgin sorun sinyali.**

### Frontend — sağlık skoru

Ekranda gösterilen skor:

```
Sağlık skoru = 100 - yoğunluk skoru
```

Örnek: backend `redness_score: 20` → ekranda kızarıklık sağlığı **80/100**.

### Şiddet seviyeleri

| Değer | Yoğunluk aralığı |
|-------|------------------|
| `low` | Düşük |
| `medium` | Orta |
| `high` | Yüksek |

---

## API referansı

Canlı dokümantasyon: **http://localhost:8000/docs**

### Genel

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/health` | `{"status": "ok"}` |
| POST | `/analyze` | Fotoğraf analizi |

**`POST /analyze` parametreleri:**
- `file` — görsel dosyası (JPG/PNG)
- `skin_type` — `normal`, `dry`, `oily`, `combination`, `sensitive`
- Header (opsiyonel): `Authorization: Bearer <token>`

### Kimlik doğrulama — `/auth`

| Metot | Endpoint | Body |
|-------|----------|------|
| POST | `/auth/register` | `username`, `email`, `password` |
| POST | `/auth/login` | `username`, `password` |
| GET | `/auth/me` | Bearer token gerekli |

### Panel — `/panel` (giriş gerekli)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/panel/analyses` | Kullanıcının analiz geçmişi |
| GET | `/panel/analyses/{id}` | Tek analiz detayı |
| GET | `/panel/products` | Ürün listesi |
| POST | `/panel/products` | Ürün ekle |
| DELETE | `/panel/products/{id}` | Ürün sil |
| GET | `/panel/routine?month=2026-06` | Aylık rutin logları |
| PUT | `/panel/routine` | Rutin günü kaydet/güncelle |

### Admin — `/admin` (admin gerekli)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/admin/stats` | Kullanıcı, analiz, ürün, rutin sayıları |
| GET | `/admin/users` | Tüm kullanıcılar |
| GET | `/admin/users/{id}/analyses` | Kullanıcının analizleri |

### Örnek analiz cevabı

```json
{
  "success": true,
  "scores": {
    "redness_score": 19,
    "spot_score": 11,
    "acne_score": 17,
    "overall_score": 16
  },
  "severity": {
    "redness": "low",
    "spots": "low",
    "acne": "low"
  },
  "detected_regions": {
    "redness_count": 3,
    "spot_count": 1,
    "acne_count": 2
  },
  "output_image_url": "/outputs/result_abc123.png",
  "zone_image_url": "/outputs/zones_abc123.png",
  "report_url": "/outputs/report_abc123.pdf",
  "personalized_routine": { },
  "saved_analysis_id": 5
}
```

---

## Kurulum

### Gereksinimler

- **Python 3.10+**
- **Node.js 18+**
- İnternet (ilk kurulum için)

### Adım 1 — Projeyi indirin

```powershell
git clone https://github.com/KULLANICI_ADINIZ/skinvision-lite.git
cd skinvision-lite
```

### Adım 2 — Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Kontrol:
- http://localhost:8000/health
- http://localhost:8000/docs

> `backend/models/blaze_face_short_range.tflite` yüz tespiti için gereklidir; repoda mevcuttur.

### Adım 3 — Frontend (yeni terminal)

```powershell
cd frontend
npm install
npm run dev
```

Tarayıcı: **http://localhost:5173**

> **Not:** Node.js yalnızca React geliştirmesi içindir. Analiz kodu tamamen **Python** ile yazılmıştır.

---

## Kullanım kılavuzu

### İlk analiz (giriş yapmadan)

1. http://localhost:5173 adresine gidin
2. **Cildinizi tarayın** veya `/analiz` sayfasına geçin
3. Cilt tipinizi seçin
4. Anketi tamamlayın
5. Fotoğraf kurallarını onaylayın
6. Fotoğraf yükleyin veya kamerayı kullanın
7. Sonuç sayfasında skorları ve önerileri inceleyin
8. İsterseniz PDF raporu indirin

### Kayıt ve panel

1. `/giris` sayfasından kayıt olun
2. Giriş yapın
3. Tekrar analiz yapın — bu sefer sonuç veritabanına kaydedilir
4. `/panel` sayfasından geçmiş analizleri görün
5. İki analiz seçerek skorları karşılaştırın
6. Kullandığınız ürünleri ekleyin
7. Rutin takviminde günlük işaretlemeleri yapın

### Admin

1. `admin` / `admin123` ile giriş yapın
2. `/admin` sayfasına gidin
3. İstatistikleri ve kullanıcı listesini inceleyin

---

## Klasör yapısı

```
skinvision-lite/
├── README.md
├── .gitignore
│
├── backend/
│   ├── main.py                    # FastAPI giriş, /analyze
│   ├── auth.py                    # JWT, bcrypt
│   ├── database.py                # SQLite
│   ├── schemas.py                 # Pydantic modelleri
│   ├── requirements.txt
│   ├── skinvision.db              # (yerel, gitignore)
│   │
│   ├── routers/
│   │   ├── auth_routes.py
│   │   ├── panel_routes.py
│   │   └── admin_routes.py
│   │
│   ├── image_processing/
│   │   ├── pipeline.py            # Ana analiz akışı
│   │   ├── face_detection.py
│   │   ├── skin_mask.py
│   │   ├── redness_detection.py
│   │   ├── spot_detection.py
│   │   ├── acne_detection.py
│   │   ├── zone_analysis.py
│   │   └── utils.py
│   │
│   ├── ml_model/
│   │   ├── weights.json
│   │   └── predict.py
│   │
│   ├── services/
│   │   ├── recommendations.py
│   │   └── routine_generator.py
│   │
│   ├── reports/
│   │   └── report_generator.py
│   │
│   ├── models/
│   │   └── blaze_face_short_range.tflite
│   │
│   ├── uploads/                   # (gitignore)
│   └── outputs/                   # (gitignore)
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    ├── public/                    # Görseller, yüz modeli fotoğrafı
    │   ├── faces/
    │   ├── hero/
    │   ├── ingredients/
    │   └── backgrounds/
    │
    └── src/
        ├── App.jsx                # Rotalar
        ├── main.jsx
        ├── index.css
        │
        ├── pages/
        │   ├── Home.jsx
        │   ├── AnalysisPage.jsx
        │   ├── ResultsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── PanelPage.jsx
        │   └── AdminPage.jsx
        │
        ├── components/            # UI bileşenleri
        ├── api/                     # skinApi, authApi, panelApi
        ├── context/                 # AuthContext
        ├── data/                    # ingredients, skinQuestions
        └── utils/                   # buildConcernInsights, scroll
```

---

## GitHub'a yükleme

### Public repo uyarısı

**Public** seçerseniz tüm kod, README ve görseller **herkese açık** olur.

### Repoya gitmeyenler (`.gitignore`)

| Dosya / klasör | Neden |
|----------------|-------|
| `backend/venv/` | Herkes kendi ortamında kurar |
| `frontend/node_modules/` | `npm install` ile gelir |
| `backend/skinvision.db` | Kullanıcı verileri |
| `backend/uploads/`, `backend/outputs/` | Yüklenen fotoğraflar ve PDF'ler |
| `.env` | Gizli anahtarlar |

### VS Code ile yükleme

1. Sol menü → **Source Control**
2. **Publish Branch** veya **Publish to GitHub**
3. Repo adı: `skinvision-lite`
4. **Public** veya **Private** seçin
5. Onaylayın

### Terminal ile

```powershell
git remote add origin https://github.com/KULLANICI_ADINIZ/skinvision-lite.git
git push -u origin main
```

---

## Sık karşılaşılan sorunlar

| Sorun | Olası neden | Çözüm |
|-------|-------------|--------|
| Analiz çalışmıyor | Backend kapalı | `uvicorn main:app --reload --port 8000` |
| Network / CORS hatası | Port uyumsuzluğu | Backend 8000, frontend 5173 |
| Yüz bulunamadı | Kötü fotoğraf | Net yüz, iyi ışık, makyajsız |
| Cilt bölgesi tespit edilemedi | Karanlık / düşük çözünürlük | Daha aydınlık ortam |
| Panel boş | Giriş yapılmamış | Önce kayıt/giriş, sonra analiz |
| Analiz kaydedilmiyor | Giriş yok | Giriş yapmadan analiz kaydedilmez |
| Admin menüsü görünmüyor | Normal kullanıcı | `admin` / `admin123` |
| `pip install` hata | Eski Python | Python 3.10+ |
| Kamera açılmıyor | Tarayıcı izni | HTTPS veya localhost, kamera izni verin |

---

## Sunum notları

### 30 saniyelik tanıtım

> "SkinVision Lite, kullanıcının yüz fotoğrafını analiz eden bir full-stack web uygulamasıdır. React ile arayüz, Python FastAPI ile API geliştirdik. OpenCV ve MediaPipe ile yüz ve cilt bölgelerini tespit ediyoruz; skorlar hibrit ML modeliyle hesaplanıyor. Kullanıcılar kayıt olup analiz geçmişini, ürünlerini ve günlük rutinlerini panelden takip edebiliyor."

### Demo sırası

1. Ana sayfa — hero, bölgesel kartlar, etken maddeler
2. Analiz — anket + fotoğraf yükleme
3. Sonuçlar — skorlar, PDF, rutin modal
4. Kayıt / giriş — panel, geçmiş karşılaştırma
5. (İsteğe bağlı) Admin paneli
6. Swagger (`/docs`) — API gösterimi

### Proje sınırlılıkları (dürüstçe belirtin)

- Eğitim amaçlı; klinik dermatoloji sistemi değil
- Işık, makyaj ve kamera kalitesi sonuçları etkiler
- Demo admin şifresi (`admin123`) gerçek ortamda değiştirilmeli
- Gerçek hastalık şüphesinde dermatoloğa başvurulmalı

---

## Lisans ve sorumluluk

Bu yazılım demo ve eğitim amaçlıdır. Tıbbi karar desteği veya teşhis aracı olarak kullanılmamalıdır.
