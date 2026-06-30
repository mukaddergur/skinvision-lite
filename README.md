# SkinVision Lite

Yapay zeka destekli **cilt görüntü analizi** web uygulaması. Kullanıcı cilt tipini seçer, kısa anket doldurur, yüz fotoğrafı yükler; sistem OpenCV ve hibrit ML ile kızarıklık, leke ve akne benzeri bölgeleri analiz eder, skor ve kişisel bakım önerileri sunar.

> **Uyarı:** Bu proje eğitim ve bitirme projesi amaçlıdır. Tıbbi teşhis veya tedavi önerisi sunmaz. Cilt sağlığınız için dermatoloğa danışın.

---

## İçindekiler

1. [Proje özeti](#proje-özeti)
2. [Nasıl çalışır?](#nasıl-çalışır)
3. [Teknolojiler](#teknolojiler)
4. [Kurulum](#kurulum)
5. [Sayfalar ve kullanıcı akışı](#sayfalar-ve-kullanıcı-akışı)
6. [Özellikler](#özellikler)
7. [Analiz süreci (teknik)](#analiz-süreci-teknik)
8. [Skorlar ne anlama gelir?](#skorlar-ne-anlama-gelir)
9. [Veritabanı](#veritabanı)
10. [API referansı](#api-referansı)
11. [Klasör yapısı](#klasör-yapısı)
12. [GitHub](#github)
13. [Sık sorunlar](#sık-sorunlar)
14. [Sunum notları](#sunum-notları)

---

## Proje özeti

| | |
|--|--|
| **Proje adı** | SkinVision Lite |
| **Tür** | Full-stack web uygulaması |
| **Frontend** | React 19 + Vite + Tailwind CSS |
| **Backend** | Python FastAPI |
| **Veritabanı** | SQLite |
| **Analiz** | OpenCV + MediaPipe + hibrit ML (`weights.json`) |

Proje tek bir klasörde toplanmıştır: `backend/` (Python API) ve `frontend/` (React arayüz) aynı repoda durur.

---

## Nasıl çalışır?

```
Kullanıcı → React arayüzü → FastAPI backend → OpenCV/ML analiz → JSON sonuç → Ekranda skor + öneri
```

**Adım adım:**

1. Kullanıcı ana sayfaya girer, **Cildinizi tarayın** veya **Analiz** sayfasına gider.
2. **Cilt tipi** seçilir (normal, kuru, yağlı, karma, hassas).
3. **Kısa anket** cevaplanır (cilt hissi, öncelikli ihtiyaç vb.).
4. **Fotoğraf** yüklenir veya **kamera** ile çekilir (yüz oval çerçeveye hizalanır).
5. Backend fotoğrafı alır:
   - Yüz tespiti (MediaPipe)
   - Cilt maskesi oluşturma
   - Kızarıklık, leke, akne benzeri bölge tespiti
   - Bölgesel analiz (alın, yanak, burun, çene…)
   - Skor hesaplama
6. Frontend **sonuç sayfasında** skorları, bölgesel açıklamaları, etken madde önerilerini ve PDF rapor linkini gösterir.
7. Kullanıcı **giriş yapmışsa** analiz SQLite veritabanına kaydedilir; panelden geçmiş görülebilir.

---

## Teknolojiler

### Frontend

| Araç | Görevi |
|------|--------|
| **React 19** | Sayfa ve bileşenler |
| **Vite** | Geliştirme sunucusu, derleme |
| **Tailwind CSS** | Tasarım (renk, boşluk, responsive) |
| **React Router** | Sayfa yönlendirme (`/`, `/analiz`, `/panel`…) |
| **Axios** | Backend API istekleri |

### Backend

| Araç | Görevi |
|------|--------|
| **FastAPI** | REST API, dosya yükleme, JSON cevap |
| **Uvicorn** | API sunucusunu çalıştırma |
| **OpenCV** | Görüntü işleme, renk/yoğunluk analizi |
| **MediaPipe** | Yüz tespiti |
| **NumPy** | Sayısal hesaplamalar |
| **ReportLab** | PDF rapor üretimi |
| **python-jose + bcrypt** | JWT oturum, şifre hash |
| **SQLite** | Kullanıcı ve analiz kayıtları |

### ML (hibrit model)

Tam derin öğrenme modeli yerine **özellik çıkarımı + ağırlıklı skor** kullanılır. Ağırlıklar `backend/ml_model/weights.json` dosyasındadır; `predict.py` bu dosyayı okuyarak skor üretir.

> **Not:** `npm` ve Node.js yalnızca frontend içindir. Analiz kodu **Python** ile yazılmıştır.

---

## Kurulum

### Gereksinimler

- Windows 10/11 (veya macOS / Linux)
- **Python 3.10+**
- **Node.js 18+**
- İnternet (ilk `pip install` ve `npm install` için)

### 1. Projeyi indirin

```powershell
git clone https://github.com/KULLANICI_ADINIZ/skinvision-lite.git
cd skinvision-lite
```

### 2. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Kontrol:

- http://localhost:8000/health → `{"status":"ok"}` benzeri cevap
- http://localhost:8000/docs → Swagger (tüm API’ler)

**Önemli:** `backend/models/blaze_face_short_range.tflite` yüz tespiti için gereklidir; repoda mevcuttur.

### 3. Frontend (yeni terminal)

```powershell
cd frontend
npm install
npm run dev
```

Tarayıcı: **http://localhost:5173**

Her iki sunucu da açık olmalıdır. Backend kapalıysa analiz çalışmaz.

---

## Sayfalar ve kullanıcı akışı

| Rota | Sayfa | Açıklama |
|------|-------|----------|
| `/` | Ana sayfa | Hero, analiz başlat, bölgesel analiz önizlemesi, kişisel rutin tanıtımı, **etken madde rehberi** |
| `/analiz` | Analiz | Anket → fotoğraf yükleme / kamera |
| `/sonuclar` | Sonuçlar | Skorlar, bölgesel detay, PDF, kişisel rutin modal |
| `/giris` | Giriş | Kayıt ol / giriş yap |
| `/panel` | Kullanıcı paneli | Geçmiş, karşılaştırma, ürünler, rutin takvimi |
| `/admin` | Admin | Kullanıcı listesi, istatistikler |

### Header menüsü

- Giriş yokken: **Giriş**
- Giriş varken: kullanıcı adı, **Panelim**, **Admin** (yalnızca admin), **Çıkış**
- Alt sayfalarda: **Ana sayfa**, sonuçlarda **Yeni Analiz**

---

## Özellikler

### Cilt analizi

- 5 cilt tipi seçimi
- Caudalie tarzı kısa anket (cilt hissi, öncelik)
- Fotoğraf yükleme veya canlı kamera
- Fotoğraf kuralları modalı (makyajsız, iyi ışık, tam yüz)
- Yüz tespiti ve cilt maskesi
- Kızarıklık, leke, akne benzeri bölge işaretleme
- Kalibre edilmiş sağlık skorları
- Bölgesel kartlar: alın, yanak, burun/T bölgesi, çene, göz altı, kızarıklık
- Kişiselleştirilmiş sabah / akşam rutini
- PDF rapor indirme

### Etken madde rehberi (ana sayfa)

Ana sayfada **“Hangi madde ne için kullanılır?”** bölümünde kartlar halinde:

| Madde | Kısa fayda |
|-------|------------|
| Hyaluronik Asit | Nem, kuru cilt |
| Salisilik Asit | Gözenek, akne eğilimi |
| Niacinamide | Bariyer, kızarıklık, gözenek |
| Retinol | Hücre yenilenmesi, gece bakımı |
| Glikolik Asit (AHA) | Ölü hücre arındırma |
| C Vitamini | Antioksidan, aydınlatma |

### Kullanıcı hesabı

- Kayıt / giriş (JWT)
- Giriş yapılınca analizler otomatik kaydedilir
- **Panel:** analiz geçmişi, 2 analizi karşılaştırma, ürün takibi, rutin takvimi
- Rutin takvimi: sabah (sarı), akşam (mor), yüz yıkama (mavi) yuvarlak işaretler

### Admin paneli

İlk backend açılışında oluşturulur:

| Alan | Değer |
|------|--------|
| Kullanıcı adı | `admin` |
| Şifre | `admin123` |

Admin: toplam kullanıcı, analiz, ürün, rutin sayıları; kullanıcı listesi ve analiz geçmişi.

---

## Analiz süreci (teknik)

Backend `POST /analyze` çağrıldığında sıra kabaca şöyledir:

1. **Yükleme** — Fotoğraf `uploads/` klasörüne kaydedilir.
2. **Yüz tespiti** — MediaPipe ile yüz kutusu bulunur; bulunamazsa hata döner.
3. **Cilt maskesi** — Yüz bölgesinde cilt pikselleri ayrılır.
4. **Tespit modülleri**
   - `redness_detection.py` — kızarıklık
   - `spot_detection.py` — leke / pigmentasyon
   - `acne_detection.py` — akne benzeri bölgeler
5. **Bölgesel analiz** — `zone_analysis.py` ile alın, yanak vb.
6. **ML skor** — `ml_model/predict.py` + `weights.json`
7. **Kalibrasyon** — `utils.py` içinde skorlar kullanıcı dostu aralığa çekilir
8. **Çıktı** — İşaretli görsel `outputs/`, PDF rapor, öneriler ve rutin metinleri JSON olarak döner

---

## Skorlar ne anlama gelir?

### Backend (yoğunluk skoru)

| Skor alanı | Anlamı |
|------------|--------|
| `redness_score` | Kızarıklık yoğunluğu |
| `spot_score` | Leke yoğunluğu |
| `acne_score` | Akne benzeri bölge yoğunluğu |
| `overall_score` | Genel yoğunluk |

**0–100 arası; yüksek = daha belirgin sorun sinyali.**

### Frontend (sağlık skoru)

Ekranda gördüğünüz skor:

```
Sağlık skoru = 100 - yoğunluk skoru
```

Yüksek sağlık skoru = daha iyi görünüm. Sağlıklı cilt fotoğraflarında genelde **80+** hedeflenir (kalibrasyon ile).

### Şiddet seviyeleri

`low` / `medium` / `high` — yoğunluğa göre otomatik atanır.

---

## Veritabanı

Dosya: `backend/skinvision.db` (ilk çalıştırmada otomatik oluşur, GitHub’a gitmez).

| Tablo | Alanlar (özet) |
|-------|----------------|
| `users` | id, username, email, password_hash, is_admin, created_at |
| `analyses` | user_id, skin_type, skorlar, result_json, image_url, created_at |
| `user_products` | name, category, ingredient, started_at, notes |
| `routine_logs` | log_date, morning_done, evening_done, face_wash_done |

Giriş yapmadan yapılan analizler **kaydedilmez**; yalnızca sonuç sayfasında görünür.

---

## API referansı

Swagger: http://localhost:8000/docs

### Genel

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/health` | Sunucu durumu |
| POST | `/analyze` | Fotoğraf analizi (`file`, `skin_type`) |

### Kimlik doğrulama — `/auth`

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/auth/register` | Kayıt (username, email, password) |
| POST | `/auth/login` | Giriş → JWT token |
| GET | `/auth/me` | Oturum bilgisi (Bearer token) |

### Panel — `/panel` (giriş gerekli)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/panel/analyses` | Analiz geçmişi |
| GET | `/panel/analyses/{id}` | Tek analiz detayı |
| GET / POST | `/panel/products` | Ürün listesi / ekleme |
| DELETE | `/panel/products/{id}` | Ürün sil |
| GET / PUT | `/panel/routine` | Rutin takvimi (`?month=2026-06`) |

### Admin — `/admin` (admin gerekli)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/admin/stats` | İstatistikler |
| GET | `/admin/users` | Kullanıcı listesi |
| GET | `/admin/users/{id}/analyses` | Kullanıcının analizleri |

### Örnek analiz cevabı (kısaltılmış)

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
  "report_url": "/outputs/report_abc123.pdf",
  "personalized_routine": { },
  "saved_analysis_id": 5
}
```

`saved_analysis_id` yalnızca giriş yapılmışsa gelir.

---

## Klasör yapısı

```
skinvision-lite/
├── .gitignore
├── README.md
│
├── backend/
│   ├── main.py                 # FastAPI giriş, /analyze
│   ├── auth.py                 # JWT, şifre
│   ├── database.py             # SQLite
│   ├── schemas.py              # Pydantic modelleri
│   ├── requirements.txt
│   ├── skinvision.db           # (yerel, gitignore)
│   │
│   ├── routers/
│   │   ├── auth_routes.py
│   │   ├── panel_routes.py
│   │   └── admin_routes.py
│   │
│   ├── image_processing/
│   │   ├── pipeline.py         # Ana analiz akışı
│   │   ├── face_detection.py
│   │   ├── skin_mask.py
│   │   ├── redness_detection.py
│   │   ├── spot_detection.py
│   │   ├── acne_detection.py
│   │   ├── zone_analysis.py
│   │   └── utils.py            # Skor kalibrasyonu
│   │
│   ├── ml_model/
│   │   ├── weights.json        # ML ağırlıkları
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
│   └── outputs/                # Sonuç görselleri, PDF (gitignore)
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── public/                 # Görseller, yüz modeli fotoğrafı
    └── src/
        ├── App.jsx             # Rotalar
        ├── pages/              # Home, Analiz, Sonuçlar, Giriş, Panel, Admin
        ├── components/         # UI bileşenleri
        ├── api/                # skinApi, authApi, panelApi
        ├── context/            # AuthContext
        └── data/               # ingredients.js, skinQuestions.js
```

---

## GitHub

### Repoya dahil olmayanlar

`.gitignore` sayesinde:

- `backend/venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- `backend/skinvision.db`
- `backend/uploads/*` (`.gitkeep` hariç)
- `backend/outputs/*` (`.gitkeep` hariç)
- `.env` dosyaları

### VS Code ile yükleme

1. GitHub’da boş repo oluşturun (README eklemeyin).
2. VS Code → Source Control → **Publish to GitHub**.
3. Repoyu seçin, public/private belirleyin.

### Terminal ile

```powershell
git remote add origin https://github.com/KULLANICI_ADINIZ/skinvision-lite.git
git push -u origin main
```

---

## Sık sorunlar

| Sorun | Olası neden | Çözüm |
|-------|-------------|--------|
| Analiz butonu çalışmıyor | Backend kapalı | `uvicorn main:app --reload --port 8000` |
| CORS / ağ hatası | Yanlış port | Backend 8000, frontend 5173 |
| Yüz bulunamadı | Kötü fotoğraf | Yüz net, iyi ışık, makyajsız |
| Panel boş | Giriş yok veya kayıt yok | Giriş yapıp tekrar analiz yapın |
| `pip install` hata | Eski Python | Python 3.10+ kullanın |
| `npm install` hata | Eski Node | Node 18+ kullanın |
| Admin menüsü yok | Normal kullanıcı | `admin` / `admin123` ile giriş |

---

## Sunum notları

### 30 saniyelik tanıtım

> “SkinVision Lite, kullanıcının yüz fotoğrafını analiz eden bir web uygulamasıdır. React ile arayüz, Python FastAPI ile API geliştirdik. OpenCV ve MediaPipe ile yüz ve cilt bölgelerini tespit ediyoruz; skorlar hibrit ML modeliyle hesaplanıyor. Kullanıcılar kayıt olup analiz geçmişini, ürünlerini ve günlük rutinlerini panelden takip edebiliyor.”

### Demo sırası önerisi

1. Ana sayfa → etken maddeler, bölgesel analiz kartları
2. Analiz akışı → anket + fotoğraf
3. Sonuç sayfası → skorlar, PDF
4. Kayıt / giriş → panel → geçmiş karşılaştırma
5. (İsteğe bağlı) Admin paneli
6. Swagger (`/docs`) — API’yi göstermek için

### Sınırlılıklar (dürüstçe söyleyin)

- Eğitim amaçlı; klinik dermatoloji sistemi değil
- Işık, makyaj ve kamera kalitesi sonucu etkiler
- Gerçek hastalık teşhisi için uzman gerekir

---

## Lisans ve sorumluluk

Bu yazılım demo ve eğitim amaçlıdır. Üretim ortamında tıbbi karar desteği olarak kullanılmamalıdır.
