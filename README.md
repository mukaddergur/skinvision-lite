# SkinVision Lite

**Yapay zeka destekli cilt analizi** yapan bir web uygulamasıdır. Kullanıcı cilt tipini seçer, kısa soruları yanıtlar, yüz fotoğrafı yükler; sistem fotoğrafı analiz edip skor ve bakım önerileri sunar.

> Bu proje **eğitim ve bitirme projesi** amaçlıdır. Tıbbi teşhis veya tedavi yerine geçmez.

---

## Bu proje ne yapıyor? (Kısaca)

1. Kullanıcı siteye girer, **cilt tipini** seçer (kuru, yağlı, karma vb.)
2. Birkaç **soru** cevaplar
3. **Yüz fotoğrafı** yükler veya kameradan çeker
4. **Backend (Python)** fotoğrafı işler: yüz bulur, kızarıklık/leke/akne benzeri bölgeleri tarar
5. **Frontend (React)** sonuçları güzel bir sayfada gösterir: skorlar, öneriler, PDF rapor
6. **Giriş yapmış** kullanıcılar için sonuçlar **veritabanına** kaydedilir; panelden geçmiş, ürün ve rutin takibi yapılır

---

## Hangi teknolojiler kullanıldı?

| Bölüm | Ne işe yarar? | Kullandığımız araçlar |
|--------|----------------|------------------------|
| **Arayüz (gördüğünüz sayfalar)** | Butonlar, formlar, kartlar | React, Vite, Tailwind CSS |
| **Sunucu (arka plan)** | Fotoğraf alır, analiz eder, JSON döner | Python, FastAPI |
| **Görüntü analizi** | Yüz ve cilt bölgelerini bulur | OpenCV, MediaPipe |
| **Yapay zeka (basit)** | Skorları hesaplar | `weights.json` + özellik çıkarımı |
| **Veritabanı** | Kullanıcı, analiz, ürün, rutin kayıtları | SQLite |
| **Giriş sistemi** | Kayıt, giriş, oturum | JWT + bcrypt |

**Önemli:** Node.js burada sadece React projesini çalıştırmak için kullanılır (`npm run dev`). Asıl analiz kodu **Python** ile yazılmıştır; yani backend Node değil.

---

## Bilgisayarda ne olmalı?

- **Python 3.10** veya üzeri
- **Node.js 18** veya üzeri (frontend için)

---

## Projeyi nasıl çalıştırırım?

İki terminal açmanız gerekir: biri backend, biri frontend.

### 1. Backend (API sunucusu)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Başarılı olunca tarayıcıda şunları açabilirsiniz:

- http://localhost:8000 — API çalışıyor mu
- http://localhost:8000/docs — Tüm endpoint’leri görebileceğiniz Swagger sayfası (sunuma çok yardımcı)

> `backend/models/blaze_face_short_range.tflite` dosyası yüz tespiti için şarttır; projede vardır.

### 2. Frontend (web arayüzü)

Yeni bir terminal:

```powershell
cd frontend
npm install
npm run dev
```

Tarayıcıda: **http://localhost:5173**

---

## Sitedeki sayfalar

| Adres | Ne var? |
|-------|---------|
| `/` | Ana sayfa: tanıtım, analiz başlat, bölgesel analiz kartları, etken maddeler |
| `/analiz` | Sorular + fotoğraf yükleme |
| `/sonuclar` | Analiz sonuçları, skorlar, rapor indirme |
| `/giris` | Kayıt ol / giriş yap |
| `/panel` | Kişisel panel: geçmiş analizler, ürünler, rutin takvimi |
| `/admin` | Yönetici paneli |

---

## Özellikler (sunumda anlatabileceğiniz başlıklar)

### Cilt analizi
- 5 cilt tipi (normal, kuru, yağlı, karma, hassas)
- Anket ile kişiselleştirme
- Fotoğraf veya kamera
- Kızarıklık, leke, akne benzeri bölge tespiti
- 6 bölgesel kart: alın, yanak, burun, çene, göz altı, kızarıklık
- Sağlık skoru (yüksek skor = daha iyi görünüm)
- Kişisel sabah/akşam rutini önerisi
- PDF rapor indirme

### Kullanıcı paneli (giriş gerekir)
- Analiz geçmişi ve iki analizi karşılaştırma
- Kullandığınız ürünleri kaydetme
- Rutin takvimi (sabah / akşam / yüz yıkama — yuvarlak işaretlerle)

### Veritabanı
Backend ilk açıldığında `backend/skinvision.db` dosyası **otomatik oluşur**.

| Tablo | Ne tutar? |
|-------|-----------|
| `users` | Kayıtlı kullanıcılar |
| `analyses` | Yapılan analizler (giriş yapılmışsa) |
| `user_products` | Kullanıcının ürünleri |
| `routine_logs` | Günlük rutin işaretleri |

**Not:** Giriş yapmadan analiz yaparsanız sonuç ekranda görünür ama veritabanına **kaydedilmez**.

### Admin
İlk çalıştırmada hazır admin hesabı:

| | |
|--|--|
| Kullanıcı adı | `admin` |
| Şifre | `admin123` |

---

## API nasıl çalışıyor?

En önemli endpoint:

```
POST /analyze
```

- **Gönderilen:** fotoğraf dosyası + cilt tipi (`skin_type`)
- **Dönen:** skorlar, şiddet seviyeleri, işaretli görsel URL’leri, rutin önerileri, PDF linki

Giriş yapılmışsa istekte şu başlık olur:

```
Authorization: Bearer <token>
```

Bu durumda analiz ayrıca veritabanına kaydedilir (`saved_analysis_id` döner).

Diğer endpoint grupları:
- `/auth` — kayıt, giriş
- `/panel` — kullanıcı paneli verileri
- `/admin` — yönetici istatistikleri

Detay için: http://localhost:8000/docs

### Skorlar nasıl okunur?

- Backend **yoğunluk skoru** verir (0–100, yüksek = daha fazla sorun sinyali)
- Ekranda gördüğünüz **sağlık skoru** = `100 - yoğunluk` (yüksek = daha iyi)

---

## Klasör yapısı (projeyi anlamak için)

```
skinvision-lite/
├── backend/                 ← Python API (analiz burada yapılır)
│   ├── main.py              ← Uygulamanın giriş kapısı, /analyze burada
│   ├── database.py          ← SQLite veritabanı işlemleri
│   ├── auth.py              ← Giriş / JWT
│   ├── routers/             ← auth, panel, admin yolları
│   ├── image_processing/    ← OpenCV ile fotoğraf işleme
│   ├── ml_model/            ← weights.json, skor hesaplama
│   ├── services/            ← ürün önerisi, rutin metinleri
│   ├── reports/             ← PDF oluşturma
│   └── models/              ← MediaPipe yüz modeli (.tflite)
│
├── frontend/                ← React arayüz (kullanıcının gördüğü kısım)
│   ├── src/pages/           ← Sayfalar (Ana sayfa, Panel, Giriş...)
│   ├── src/components/      ← Kartlar, header, anket vb.
│   ├── src/api/             ← Backend’e istek atan dosyalar
│   └── public/              ← Fotoğraflar, ikonlar
│
└── README.md                ← Bu dosya
```

---

## GitHub’a yüklerken

Tek repo yeterli; backend ve frontend birlikte gider.

**Yüklenmeyenler** (`.gitignore` sayesinde):
- `backend/venv/` — herkes kendi bilgisayarında kurar
- `frontend/node_modules/` — `npm install` ile gelir
- `backend/skinvision.db` — her bilgisayarda backend açılınca yeniden oluşur
- `backend/uploads/`, `backend/outputs/` — yüklenen fotoğraflar

```powershell
git init
git add .
git commit -m "SkinVision Lite: cilt analizi projesi"
git remote add origin https://github.com/KULLANICI_ADINIZ/skinvision-lite.git
git push -u origin main
```

Başka bilgisayarda: `git clone` → yukarıdaki kurulum adımlarını tekrarlayın.

---

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|-------|--------|
| Analiz çalışmıyor | Backend açık mı? `http://localhost:8000/health` kontrol edin |
| “Giriş yapmanız gerekiyor” | Panel için önce `/giris` sayfasından kayıt olun |
| Analiz kaydedilmiyor | Giriş yapmadan analiz yaptıysanız normal; önce giriş yapın |
| Yüz bulunamadı hatası | Yüz net görünsün, iyi ışık, makyajsız fotoğraf deneyin |

---

## Sunum için kısa cümle örneği

> “Frontend’i React ile, backend’i Python FastAPI ile geliştirdik. Fotoğraf OpenCV ve MediaPipe ile işleniyor; skorlar hibrit ML modeliyle hesaplanıyor. Kullanıcı verileri SQLite veritabanında tutuluyor; panelden aylık karşılaştırma ve rutin takibi yapılabiliyor.”

---

## Uyarı

Bu uygulama **demo / eğitim** amaçlıdır. Gerçek cilt hastalığı şüphesinde mutlaka bir dermatoloğa başvurun.

---

## İleride eklenebilecekler

- Aylık skor grafiği
- Ürün kullanımı ile skor karşılaştırması
- E-posta ile şifre sıfırlama
- Canlı internete yayınlama (deploy)
