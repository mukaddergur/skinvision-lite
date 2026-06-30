# SkinVision Lite

Eğitim amaçlı **cilt görüntü analizi** web uygulaması. Kullanıcı cilt tipini seçer, anket doldurur, yüz fotoğrafı yükler; sistem kızarıklık, leke ve akne benzeri bölgeleri analiz eder, skor ve kişisel bakım önerileri sunar.

> Bu proje bitirme / demo amaçlıdır. **Tıbbi teşhis veya tedavi önerisi sunmaz.**

---

## Proje özeti

| | |
|--|--|
| **Tür** | Full-stack web uygulaması |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router |
| **Backend** | Python, FastAPI, Uvicorn |
| **Görüntü işleme** | OpenCV, MediaPipe |
| **ML** | Hibrit model (`weights.json` + özellik çıkarımı) |
| **Veritabanı** | SQLite |
| **Kimlik doğrulama** | JWT + bcrypt |

Proje iki ana klasörden oluşur: `backend/` (Python API ve analiz) ve `frontend/` (React arayüz).

---

## Backend'de ne yaptık?

Python **FastAPI** ile REST API kurduk. Fotoğraf alınıyor, işleniyor, skor ve öneriler JSON olarak dönüyor.

### 1. API katmanı

- **`main.py`** — Uygulama giriş noktası. `GET /health` sağlık kontrolü, `POST /analyze` fotoğraf analizi. CORS ayarı (frontend port 5173). `/outputs` ve `/uploads` statik dosya sunumu.
- **`schemas.py`** — Pydantic modelleri: skorlar, şiddet seviyeleri, bölgesel analiz, ürün önerileri, kişisel rutin.
- **`auth.py`** — JWT token üretimi, bcrypt ile şifre hash, giriş doğrulama.

### 2. Görüntü işleme (OpenCV + MediaPipe)

| Modül | Görev |
|-------|--------|
| `pipeline.py` | Tüm analiz akışını birleştirir |
| `face_detection.py` | MediaPipe ile yüz tespiti (`.tflite` model) |
| `skin_mask.py` | Yüzde cilt bölgesi maskesi |
| `redness_detection.py` | Kızarıklık tespiti, kırmızı daire ile işaretleme |
| `spot_detection.py` | Leke / pigmentasyon tespiti |
| `acne_detection.py` | Akne benzeri bölge tespiti |
| `zone_analysis.py` | Alın, yanak, burun, çene için ayrı skor |
| `utils.py` | Yoğunluk skoru + kalibrasyon (sağlıklı cilt ~80+ hedefi) |

**Analiz sırası:** Fotoğraf kaydedilir → yüz bulunur → maske oluşur → kızarıklık/leke/akne taranır → bölgesel skorlar hesaplanır → ML skoru eklenir → işaretli görsel ve PDF üretilir.

### 3. ML (hibrit model)

Tam eğitilmiş derin öğrenme modeli yerine **özellik çıkarımı + ağırlıklı skor** kullanıldı:

- `ml_model/weights.json` — Ağırlık değerleri
- `ml_model/predict.py` — Skor hesaplama

### 4. Öneri ve rapor

- `services/recommendations.py` — Skora göre ürün / etken madde önerileri, uyarı metinleri
- `services/routine_generator.py` — Cilt tipine göre sabah ve akşam rutin metinleri
- `reports/report_generator.py` — ReportLab ile PDF rapor

### 5. Kullanıcı sistemi ve veritabanı

- `database.py` — SQLite tabloları: `users`, `analyses`, `user_products`, `routine_logs`
- `routers/auth_routes.py` — Kayıt, giriş, oturum bilgisi
- `routers/panel_routes.py` — Analiz geçmişi, ürün ekleme/silme, rutin takvimi
- `routers/admin_routes.py` — İstatistikler, kullanıcı listesi

**Davranışlar:**
- Giriş yapılmışsa analiz otomatik veritabanına kaydedilir
- İlk çalıştırmada admin hesabı oluşur: `admin` / `admin123`
- `skinvision.db` yerelde oluşur, GitHub'a gitmez

---

## Frontend'de ne yaptık?

**React 19 + Vite + Tailwind CSS** ile tek sayfa uygulama (SPA). Kullanıcının gördüğü tüm ekranlar `frontend/src/` altında.

### 1. Sayfalar

| Rota | Dosya | İçerik |
|------|-------|--------|
| `/` | `Home.jsx` | Hero, analiz başlat, bölgesel kartlar, rutin tanıtımı, etken maddeler |
| `/analiz` | `AnalysisPage.jsx` | Anket + fotoğraf yükleme / kamera |
| `/sonuclar` | `ResultsPage.jsx` | Skorlar, detay kartları, PDF, rutin modal |
| `/giris` | `LoginPage.jsx` | Kayıt ol / giriş yap |
| `/panel` | `PanelPage.jsx` | Geçmiş, karşılaştırma, ürünler, rutin takvimi |
| `/admin` | `AdminPage.jsx` | Kullanıcı ve istatistik paneli |

### 2. Backend bağlantısı (`src/api/`)

| Dosya | Görev |
|-------|--------|
| `skinApi.js` | `POST /analyze` — fotoğraf gönderir, sonucu alır |
| `authApi.js` | Kayıt, giriş, token saklama |
| `panelApi.js` | Panel ve admin API çağrıları |

### 3. Analiz akışı bileşenleri

- `AnalysisFlowSection.jsx` — Ankete geçiş, fotoğraf adımı, API çağrısı
- `SkinQuestionnaire.jsx` — Adım adım anket (ilerleme çubuğu, geri/devam)
- `SkinTypeSelector.jsx` — 5 cilt tipi kartı (yüz fotoğrafı + bölge halkaları)
- `PhotoGuidelinesModal.jsx` — Fotoğraf kuralları onayı
- `ImageUploader.jsx` — Sürükle-bırak yükleme
- `CameraCapture.jsx` — Canlı kamera, oval yüz rehberi

### 4. Sonuç ekranı

- `buildConcernInsights.js` — Backend yoğunluğunu sağlık skoruna çevirir (`100 - skor`)
- `ScoreCircleNav.jsx` — Dikey skor listesi (tıklanınca ilgili karta kayar)
- `ConcernAnalysisCard.jsx` — Kızarıklık, leke, akne için ayrı kart + öneri
- `ReportDownload.jsx` — PDF indirme
- `PersonalizedRoutineModal.jsx` — Sabah / akşam rutin popup

### 5. Ana sayfa bileşenleri

- `HeroSection.jsx` — Üst tanıtım ve analiz butonu
- `RegionalAnalysisPreview.jsx` — 6 bölge: alın, yanak, burun, çene, göz altı, kızarıklık
- `FaceRegionPhoto.jsx` — Kartlardaki yüz fotoğrafı ve renkli bölge halkaları
- `IngredientCarousel.jsx` — Etken madde kartları (Hyaluronik Asit, Niacinamide, Retinol vb.)
- `PersonalRoutinePreview.jsx` — Sabah / akşam rutin görsel tanıtımı
- `AppHeader.jsx` — Logo, Giriş, Panelim, Admin, Çıkış, Ana sayfa

### 6. Oturum ve veri

- `AuthContext.jsx` — Giriş durumu tüm uygulamada paylaşılır
- `data/skinQuestions.js` — Anket soruları
- `data/ingredients.js` — Etken madde başlık ve açıklamaları

---

## Kullanıcı akışı

```
Ana sayfa → Analiz → Anket → Fotoğraf → Backend → Sonuçlar
                                           ↓
                              (giriş varsa) Panel'e kayıt
```

1. Cilt tipi seçilir, anket tamamlanır
2. Fotoğraf yüklenir veya kameradan çekilir
3. Frontend backend'e istek atar
4. Sonuç sayfasında skorlar, öneriler ve PDF gösterilir
5. Giriş yapılmışsa analiz panelde saklanır

### Panel özellikleri

- **Analiz geçmişi** — Tarih ve skor listesi
- **Karşılaştırma** — İki analiz seçip skorları yan yana görme
- **Ürün takibi** — Kullanılan ürün, etken madde, başlangıç tarihi
- **Rutin takvimi** — Günlük sabah (sarı), akşam (mor), yıkama (mavi) işaretleme

---

## Kurulum

**Gereksinimler:** Python 3.10+, Node.js 18+

İki terminal açın.

### Backend (port 8000)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- http://localhost:8000/health
- http://localhost:8000/docs (Swagger — tüm endpoint'ler)

### Frontend (port 5173)

```powershell
cd frontend
npm install
npm run dev
```

- http://localhost:5173

> Node.js yalnızca React için kullanılır. Analiz kodu **Python** ile yazılmıştır.

---

## Skorlar

| | Açıklama |
|--|----------|
| **Backend yoğunluk** | 0–100, yüksek = daha belirgin sorun sinyali |
| **Ekran sağlık skoru** | `100 - yoğunluk`, yüksek = daha iyi görünüm |
| **Şiddet** | `low` / `medium` / `high` |

---

## API özeti

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/health` | Sunucu kontrolü |
| POST | `/analyze` | Fotoğraf analizi |
| POST | `/auth/register` | Kayıt |
| POST | `/auth/login` | Giriş |
| GET | `/auth/me` | Oturum bilgisi |
| GET | `/panel/analyses` | Analiz geçmişi |
| GET/POST | `/panel/products` | Ürünler |
| GET/PUT | `/panel/routine` | Rutin takvimi |
| GET | `/admin/stats` | Admin istatistikleri |

Detay: http://localhost:8000/docs

---

## GitHub'a yükleme (public)

**Public** repo seçerseniz kod ve README **herkese açık** olur.

`.gitignore` ile repoya **gitmeyenler:**
- `backend/venv/`, `frontend/node_modules/`
- `backend/skinvision.db`
- `backend/uploads/`, `backend/outputs/`
- `.env`

**VS Code:** Source Control → Publish to GitHub → `skinvision-lite` → **Public**

---

## Sık sorunlar

| Sorun | Çözüm |
|-------|--------|
| Analiz çalışmıyor | Backend açık mı? Port 8000 |
| Yüz bulunamadı | Net yüz, iyi ışık, makyajsız fotoğraf |
| Panel boş | Önce giriş yap, sonra analiz yap |
| Admin yok | `admin` / `admin123` |

---

## Sunum için

> “React ile arayüz, Python FastAPI ile API geliştirdik. OpenCV ve MediaPipe ile cilt analizi yapıyoruz; skorlar hibrit ML ile hesaplanıyor. Kullanıcılar panelden geçmiş analizlerini, ürünlerini ve rutin takvimlerini yönetebiliyor.”

Eğitim amaçlıdır. Cilt sağlığı için dermatoloğa danışın.
