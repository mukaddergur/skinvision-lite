# SkinVision Lite

SkinVision Lite, yüz görüntülerinden OpenCV ve görüntü işleme teknikleri kullanarak cilt analizi (kızarıklık, leke, akne yoğunluğu) yapan, kullanıcı dostu bir Web uygulamasıdır.

Kullanıcı cilt tipini seçer, kısa anket doldurur, yüz fotoğrafı yükler veya kameradan çeker. Sistem fotoğrafı analiz ederek skor, kişisel bakım önerisi ve PDF rapor sunar. Giriş yapan kullanıcılar analiz geçmişini, ürünlerini ve günlük rutinlerini panelden takip edebilir.

Alt klasör özetleri: [backend/README.md](backend/README.md) · [frontend/README.md](frontend/README.md)

---

## 🚀 Proje Hakkında

Bu proje, kullanıcının yüklediği fotoğrafları analiz ederek cilt sağlığı üzerine görselleştirilmiş veriler sunar. Kullanıcı geçmişini takip edebilir, analiz raporlarını görüntüleyebilir; yönetici paneli üzerinden tüm sistem verileri izlenebilir.

**Çalışma akışı:**

```
Kullanıcı (tarayıcı) → React Frontend → POST /analyze → FastAPI Backend
                                                              ↓
                                    OpenCV pipeline + MediaPipe + ML skor
                                                              ↓
                                    JSON sonuç + işaretli görsel + PDF
         ↓
Sonuç sayfası  →  (giriş yapılmışsa) SQLite veritabanına kayıt → Kullanıcı paneli
```

Proje **full-stack** yapıdadır: `backend/` (Python) ve `frontend/` (React) aynı repoda birlikte çalışır.

---

## 🛠 Kullanılan Teknolojiler

### Frontend

| | |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Stil** | Tailwind CSS 4 |
| **Sayfa yönlendirme** | React Router 7 |
| **İstek yönetimi** | Axios (panel / admin), Fetch (`skinApi` — analiz) |
| **Grafikler** | Recharts |

### Backend

| | |
|---|---|
| **API** | FastAPI (Python 3.10+) |
| **Görüntü işleme** | OpenCV, MediaPipe, NumPy, Pillow |
| **ML** | Hibrit skor modeli (`ml_model/weights.json` + `predict.py`) |
| **Veri yönetimi** | SQLite (`database.py` — sqlite3) |
| **Kimlik doğrulama** | JWT (`python-jose`), şifre hash (`bcrypt`) |
| **Raporlama** | ReportLab |

> **Not:** Projede SQLAlchemy kullanılmaz; veritabanı işlemleri doğrudan `sqlite3` modülü ile `database.py` içinde yapılır.

---

## 📂 Klasör Yapısı

```
skinvision-lite/
├── README.md
├── .gitignore
│
├── backend/                    # FastAPI & Görüntü İşleme
│   ├── main.py                 # API endpoint'leri (/analyze, /health)
│   ├── auth.py                 # JWT, bcrypt
│   ├── database.py             # SQLite veritabanı bağlantısı ve CRUD
│   ├── schemas.py              # Pydantic response modelleri
│   ├── requirements.txt
│   │
│   ├── routers/
│   │   ├── auth_routes.py      # /auth/register, login, me
│   │   ├── panel_routes.py     # /panel/analyses, products, routine
│   │   └── admin_routes.py     # /admin/stats, users
│   │
│   ├── image_processing/       # OpenCV modülleri
│   │   ├── pipeline.py         # Ana analiz akışı
│   │   ├── face_detection.py   # MediaPipe yüz tespiti
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
│   ├── uploads/                # Yüklenen fotoğraflar (gitignore)
│   └── outputs/                # İşlenmiş görseller ve raporlar (gitignore)
│
└── frontend/                   # React + Vite Arayüzü
    ├── package.json
    ├── vite.config.js
    │
    ├── public/                 # Sabit görseller (yüz, hero, etken maddeler)
    │
    └── src/
        ├── App.jsx             # Rotalar
        ├── main.jsx
        ├── index.css           # Global stiller (.btn-pill)
        │
        ├── api/                # API servisleri (skinApi, authApi, panelApi)
        ├── components/         # Yeniden kullanılabilir bileşenler
        ├── pages/              # Home, Analiz, Sonuçlar, Giriş, Panel, Admin
        ├── context/            # AuthContext
        ├── data/               # Anket soruları, etken madde kartları
        └── utils/                # Skor dönüşümü, kaydırma yardımcıları
```

---

## ⚙️ Kurulum ve Çalıştırma

### Gereksinimler

- Python 3.10+
- Node.js 18+

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Linux / macOS:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API, **http://localhost:8000** adresinde çalışacaktır.

- Sağlık kontrolü: http://localhost:8000/health
- Swagger dokümantasyonu: http://localhost:8000/docs

İlk açılışta `skinvision.db` oluşur; admin hesabı yoksa otomatik eklenir: `admin` / `admin123`

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Arayüz, **http://localhost:5173** adresinde çalışacaktır.

**Backend de açık olmalıdır** — aksi halde analiz çalışmaz.

Opsiyonel ortam değişkeni (`frontend/.env`):

```
VITE_API_URL=http://localhost:8000
```

---

## 🔑 Uygulama Özellikleri

### Akıllı Analiz

- Yüklenen fotoğraf üzerinden MediaPipe ile yüz algılama ve cilt maskeleme
- 5 cilt tipi: normal, kuru, yağlı, karma, hassas
- Çok adımlı anket (cilt hissi, öncelikli ihtiyaç)
- Fotoğraf yükleme veya canlı kamera (oval yüz rehberi)
- OpenCV pipeline + hibrit ML skor (`weights.json`)

### Görsel İşaretleme

- Tespit edilen problemli bölgelerin (akne, leke, kızarıklık vb.) orijinal görsel üzerinde işaretlenmesi
- Bölgesel analiz görseli: alın, yanak, burun/T bölgesi, çene, göz altı

### Kişiselleştirilmiş Skorlar

- Kızarıklık, leke ve akne için ayrı ayrı yoğunluk skorları (backend, 0–100)
- Frontend ekranda sağlık skoru: `100 - yoğunluk skoru`
- Şiddet seviyeleri: `low`, `medium`, `high`
- Kişiselleştirilmiş sabah / akşam rutin önerisi

### PDF Raporlama

- Analiz sonuçlarını içeren profesyonel PDF çıktısı (ReportLab)
- Sonuç sayfasından indirilebilir

### Kullanıcı Paneli

- Geçmiş analizlerin listelenmesi ve yönetimi
- İki analizi karşılaştırma (skor farkları)
- Kullanılan ürünleri ekleme / silme
- Aylık rutin takvimi (sabah, akşam, yüz yıkama işaretleri)

### Admin Paneli

- Toplam kullanıcı, analiz, ürün ve rutin kayıt sayıları
- Tüm sistem kullanıcılarının listelenmesi
- Kullanıcı bazlı analiz geçmişine erişim

### Ana Sayfa

- Hero bölümü ve analiz başlatma
- Bölgesel analiz önizleme kartları (6 bölge)
- Kişisel rutin tanıtımı
- Etken madde rehberi: Hyaluronik Asit, Salisilik Asit, Niacinamide, Retinol, Glikolik Asit, C Vitamini

---

## 📡 API Özeti

Canlı liste: **http://localhost:8000/docs**

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/health` | Sunucu durumu |
| POST | `/analyze` | Fotoğraf analizi (`file`, `skin_type`) |
| POST | `/auth/register` | Kayıt |
| POST | `/auth/login` | Giriş (JWT token) |
| GET | `/auth/me` | Oturum bilgisi |
| GET | `/panel/analyses` | Analiz geçmişi (giriş gerekli) |
| GET | `/panel/products` | Ürün listesi |
| GET | `/admin/stats` | Sistem istatistikleri (admin) |
| GET | `/admin/users` | Kullanıcı listesi (admin) |

Giriş yapılmış analiz isteklerinde `Authorization: Bearer <token>` header'ı gönderilir; analiz veritabanına kaydedilir (`saved_analysis_id`).

---

## 🗄️ Veritabanı

Dosya: `backend/skinvision.db` (otomatik oluşur, GitHub'a gitmez)

| Tablo | İçerik |
|-------|--------|
| `users` | Kullanıcı adı, e-posta, şifre hash, `is_admin` |
| `analyses` | Skorlar, tam JSON sonuç, görsel yolu |
| `user_products` | Kullanıcının takip ettiği ürünler |
| `routine_logs` | Günlük rutin işaretleri |

---

## 🛡️ Yasal Uyarı

**Önemli:** Bu proje eğitim ve görüntü işleme prototipi amacıyla geliştirilmiştir. Tıbbi bir teşhis aracı değildir. Cilt sorunlarınız için lütfen bir dermatoloğa danışın.

---

## Geliştirici Notları

- Admin paneli route korumalıdır; yalnızca `is_admin: true` olan kullanıcılar `/admin` sayfasına erişebilir ve admin API endpoint'lerini kullanabilir.
- Varsayılan admin: `admin` / `admin123` — gerçek ortamda mutlaka değiştirilmelidir.
- Analiz sırasında görüntü OpenCV ile decode edilir; yüz bölgesi kırpılır ve pipeline modülleri üzerinde işlenir.
- Giriş yapılmadan analiz yapılabilir; ancak sonuç veritabanına **kaydedilmez**.
- Repoya gitmeyenler: `backend/venv/`, `frontend/node_modules/`, `backend/skinvision.db`, `backend/uploads/`, `backend/outputs/`, `.env`

---

## GitHub'a yükleme

1. VS Code → **Source Control** → **Publish to GitHub**
2. Repo adı: `skinvision-lite`
3. **Public** veya **Private** seçin

**Public** seçerseniz tüm kod ve README herkese açık olur.
