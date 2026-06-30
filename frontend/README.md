# SkinVision Lite — Frontend (Arayüz)

Bu klasör projenin **React arayüz** kısmıdır. Kullanıcının gördüğü tüm sayfalar burada kodlanmıştır.

Ana proje dokümantasyonu için kök dizindeki dosyaya bakın: [../README.md](../README.md)

---

## Bu klasörde ne var?

| Klasör / dosya | Açıklama |
|----------------|----------|
| `src/pages/` | Sayfalar: ana sayfa, analiz, sonuçlar, giriş, panel, admin |
| `src/components/` | Tekrar kullanılan parçalar (header, kartlar, anket vb.) |
| `src/api/` | Backend’e istek atan dosyalar (`skinApi`, `authApi`, `panelApi`) |
| `src/context/` | Giriş yapmış kullanıcı bilgisi (`AuthContext`) |
| `public/` | Sabit görseller (yüz fotoğrafı, hero, etken madde resimleri) |

---

## Nasıl çalıştırılır?

```powershell
cd frontend
npm install
npm run dev
```

Tarayıcı: http://localhost:5173

**Backend de açık olmalıdır** (port 8000). Aksi halde analiz çalışmaz.

---

## Kullanılan kütüphaneler

- **React** — arayüz bileşenleri
- **Vite** — hızlı geliştirme sunucusu ve derleme
- **Tailwind CSS** — stil (renk, boşluk, responsive tasarım)
- **React Router** — sayfa geçişleri (`/`, `/analiz`, `/panel` vb.)

---

## Backend ile nasıl konuşur?

`src/api/skinApi.js` dosyası fotoğrafı `POST http://localhost:8000/analyze` adresine gönderir.

Giriş yapılmışsa `Authorization: Bearer ...` başlığı eklenir; analiz veritabanına kaydedilir.

---

Detaylı anlatım, API listesi ve veritabanı bilgisi için: **[../README.md](../README.md)**
