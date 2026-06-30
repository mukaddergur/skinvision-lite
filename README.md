# SkinVision Lite

Yapay zeka destekli cilt görüntü analizi web uygulaması. Kullanıcı anket doldurur, yüz fotoğrafı yükler; sistem kızarıklık, leke ve akne benzeri bölgeleri analiz eder, skor ve bakım önerileri sunar.

> **Uyarı:** Eğitim / bitirme projesidir. Tıbbi teşhis veya tedavi yerine geçmez.

---

## Backend'de ne yaptık?

Python **FastAPI** ile REST API kurduk. Tüm analiz mantığı `backend/` klasöründe.

### API ve giriş noktası

| Dosya | Ne yapıyor? |
|-------|-------------|
| `main.py` | Uygulama girişi. `POST /analyze` fotoğraf alır, pipeline'ı çalıştırır, JSON döner. CORS, statik dosya (`/outputs`, `/uploads`) |
| `schemas.py` | API cevap modelleri (skorlar, öneriler, rutin, bölgesel analiz) |
| `auth.py` | JWT token üretimi, şifre hash (bcrypt), oturum doğrulama |

### Görüntü işleme (OpenCV + MediaPipe)

| Dosya | Ne yapıyor? |
|-------|-------------|
| `image_processing/pipeline.py` | Ana akış: yüz bul → maske oluştur → tespit modüllerini çalıştır → skorları birleştir |
| `face_detection.py` | MediaPipe ile yüz tespiti; yüz yoksa hata |
| `skin_mask.py` | Yüz bölgesinde cilt maskesi |
| `redness_detection.py` | Kızarıklık bölgeleri (kırmızı dairelerle işaretleme) |
| `spot_detection.py` | Leke / pigmentasyon tespiti |
| `acne_detection.py` | Akne benzeri bölge tespiti |
| `zone_analysis.py` | Bölgesel skor: alın, yanak, burun, çene |
| `utils.py` | Yoğunluk skoru hesabı ve kalibrasyon (sağlıklı cilt ~80+ hedefi) |

### ML (hibrit model)

| Dosya | Ne yapıyor? |
|-------|-------------|
| `ml_model/weights.json` | Özellik ağırlıkları (eğitilmiş tam model yerine hibrit yaklaşım) |
| `ml_model/predict.py` | Ağırlıkları okuyup skor üretir |

### İş mantığı ve rapor

| Dosya | Ne yapıyor? |
|-------|-------------|
| `services/recommendations.py` | Skora göre ürün / etken madde önerileri, doktor yönlendirme metni |
| `services/routine_generator.py` | Cilt tipine göre sabah / akşam rutin metinleri |
| `reports/report_generator.py` | ReportLab ile PDF rapor oluşturma |

### Kullanıcı sistemi ve veritabanı

| Dosya | Ne yapıyor? |
|-------|-------------|
| `database.py` | SQLite: `users`, `analyses`, `user_products`, `routine_logs` tabloları |
| `routers/auth_routes.py` | Kayıt, giriş, `/auth/me` |
| `routers/panel_routes.py` | Analiz geçmişi, ürün takibi, rutin takvimi |
| `routers/admin_routes.py` | Admin istatistikleri ve kullanıcı listesi |

**Önemli davranışlar:**
- Giriş yapılmışsa analiz otomatik `analyses` tablosuna kaydedilir
- İlk açılışta `admin` / `admin123` hesabı oluşur
- `skinvision.db` yerelde oluşur, GitHub'a gitmez

---

## Frontend'de ne yaptık?

**React 19 + Vite + Tailwind CSS** ile tek sayfa uygulama (SPA). Tüm arayüz `frontend/src/` altında.

### Sayfalar (`src/pages/`)

| Sayfa | Rota | Ne yapıyor? |
|-------|------|-------------|
| `Home.jsx` | `/` | Hero, bölgesel analiz kartları, rutin önizleme, etken madde carousel |
| `AnalysisPage.jsx` | `/analiz` | Tam analiz akışı |
| `ResultsPage.jsx` | `/sonuclar` | Skorlar, bölgesel detay, PDF indirme, rutin modal |
| `LoginPage.jsx` | `/giris` | Kayıt / giriş formu |
| `PanelPage.jsx` | `/panel` | Geçmiş, karşılaştırma, ürünler, rutin takvimi |
| `AdminPage.jsx` | `/admin` | Yönetici paneli |

### API bağlantıları (`src/api/`)

| Dosya | Ne yapıyor? |
|-------|-------------|
| `skinApi.js` | `POST /analyze` — fotoğraf gönderir, sonuç alır |
| `authApi.js` | Kayıt, giriş, token yönetimi |
| `panelApi.js` | Panel ve admin endpoint'leri |

### Analiz akışı bileşenleri

| Bileşen | Ne yapıyor? |
|---------|-------------|
| `AnalysisFlowSection.jsx` | Ankete yönlendirme, fotoğraf adımı, API çağrısı |
| `SkinQuestionnaire.jsx` | Çok adımlı anket (cilt hissi, öncelik vb.) |
| `SkinTypeSelector.jsx` | 5 cilt tipi kartı (yüz fotoğrafı + bölge halkaları) |
| `PhotoGuidelinesModal.jsx` | Fotoğraf kuralları (makyajsız, iyi ışık) |
| `ImageUploader.jsx` | Sürükle-bırak fotoğraf yükleme |
| `CameraCapture.jsx` | Canlı kamera + oval yüz rehberi |

### Sonuç ve skor ekranı

| Bileşen | Ne yapıyor? |
|---------|-------------|
| `buildConcernInsights.js` | Backend skorunu sağlık skoruna çevirir (`100 - yoğunluk`) |
| `ScoreCircleNav.jsx` | Dikey skor navigasyonu (genel, kızarıklık, leke, akne) |
| `ConcernAnalysisCard.jsx` | Her konu için kart + etken madde önerisi |
| `ReportDownload.jsx` | PDF rapor indirme linki |
| `PersonalizedRoutineModal.jsx` | Kişisel sabah / akşam rutini popup |

### Ana sayfa ve görsel bileşenler

| Bileşen | Ne yapıyor? |
|---------|-------------|
| `HeroSection.jsx` | Üst tanıtım alanı, analiz başlat butonu |
| `RegionalAnalysisPreview.jsx` | 6 bölgesel kart: alın, yanak, burun, çene, göz altı, kızarıklık |
| `FaceRegionPhoto.jsx` | Yüz fotoğrafı üzerinde bölge halkaları |
| `IngredientCarousel.jsx` | Etken madde rehberi (Hyaluronik Asit, Niacinamide vb.) |
| `PersonalRoutinePreview.jsx` | Sabah / akşam rutin tanıtım kartları |
| `AppHeader.jsx` | Logo, Giriş / Panelim / Admin / Çıkış menüsü |

### Oturum yönetimi

| Dosya | Ne yapıyor? |
|-------|-------------|
| `AuthContext.jsx` | Giriş durumu, token, kullanıcı bilgisi (tüm sayfalarda) |

### Veri dosyaları (`src/data/`)

| Dosya | Ne yapıyor? |
|-------|-------------|
| `skinQuestions.js` | Anket soruları ve cevapları |
| `ingredients.js` | Etken madde kartları (başlık, açıklama, görsel) |

---

## Nasıl çalışır? (kısa akış)

```
Ana sayfa → Analiz → Anket → Fotoğraf → Backend analiz → Sonuç sayfası
                                              ↓
                                    (giriş varsa) SQLite kayıt → Panel
```

1. Kullanıcı cilt tipi seçer, anketi doldurur
2. Fotoğraf yükler veya kameradan çeker
3. Frontend `skinApi.js` ile backend'e gönderir
4. Backend yüz bulur, bölgeleri tarar, skor hesaplar
5. Sonuç ekranında sağlık skorları, öneriler ve PDF gösterilir

---

## Kurulum

**Gereksinimler:** Python 3.10+, Node.js 18+

### Backend (port 8000)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Dokümantasyon: http://localhost:8000/docs

### Frontend (port 5173)

```powershell
cd frontend
npm install
npm run dev
```

- Uygulama: http://localhost:5173

> Node.js sadece frontend içindir. Analiz kodu **Python** ile yazılmıştır.

---

## Skorlar

| Taraf | Anlam |
|-------|--------|
| Backend | **Yoğunluk skoru** (0–100, yüksek = daha belirgin sorun) |
| Ekran | **Sağlık skoru** = `100 - yoğunluk` (yüksek = daha iyi görünüm) |

---

## GitHub (public repo)

Bu proje **public** olarak yayınlanırsa kod ve README herkes tarafından görülebilir.

**Repoya gitmeyenler** (`.gitignore`):
- `backend/venv/`, `frontend/node_modules/`
- `backend/skinvision.db` (kullanıcı verileri)
- `backend/uploads/`, `backend/outputs/` (yüklenen fotoğraflar)
- `.env` dosyaları

**Public yapmadan önce kontrol edin:**
- Gerçek kullanıcı fotoğrafları repoda olmamalı
- `.env` veya gizli anahtar commit edilmemeli
- Demo admin şifresi (`admin123`) production'da değiştirilmeli

### Yükleme (VS Code)

1. Source Control → **Publish to GitHub**
2. Repo adı: `skinvision-lite`
3. **Public** seçin
4. Onaylayın

---

## Sık sorunlar

| Sorun | Çözüm |
|-------|--------|
| Analiz çalışmıyor | Backend açık mı? `http://localhost:8000/health` |
| Yüz bulunamadı | Net yüz, iyi ışık, makyajsız fotoğraf |
| Panel boş | Önce giriş yapın, sonra analiz yapın |
| Admin görünmüyor | `admin` / `admin123` ile giriş |

---

## Sunum cümlesi

> “React ile arayüz, Python FastAPI ile API geliştirdik. OpenCV ve MediaPipe ile yüz ve cilt analizi yapıyoruz; skorlar hibrit ML ile hesaplanıyor. Kullanıcılar panelden geçmiş analizlerini, ürünlerini ve rutin takvimlerini yönetebiliyor.”

---

Eğitim amaçlıdır. Cilt sağlığı şüphesinde dermatoloğa başvurun.
