# SkinVision Lite — Frontend

React arayüzü. Sayfalar, formlar ve backend istekleri burada.

**Tam dokümantasyon:** [../README.md](../README.md) (kurulum, API, veritabanı, sunum)

---

## Çalıştırma

```powershell
cd frontend
npm install
npm run dev
```

→ http://localhost:5173 — Backend de açık olmalı (port **8000**).

---

## Ne nerede?

| Klasör | İçerik |
|--------|--------|
| `src/pages/` | Sayfalar (ana sayfa, analiz, sonuç, giriş, panel, admin) |
| `src/components/` | Header, anket, kamera, kartlar vb. |
| `src/api/` | `skinApi`, `authApi`, `panelApi` |
| `src/context/` | Giriş yapmış kullanıcı (`AuthContext`) |
| `public/` | Görseller (yüz, hero, etken maddeler) |

**Teknoloji:** React 19 · Vite · Tailwind CSS · React Router

---

## Sayfalar

| Rota | Sayfa |
|------|-------|
| `/` | Ana sayfa |
| `/analiz` | Cilt analizi akışı |
| `/sonuclar` | Skorlar ve öneriler |
| `/giris` | Kayıt / giriş |
| `/panel` | Geçmiş, ürünler, rutin |
| `/admin` | Yönetici paneli |

Analiz sonucu backend’e `POST /analyze` ile gider; hesaplama Python tarafında yapılır.

---

Detaylı bileşen listesi, skor mantığı ve sorun giderme → **[../README.md](../README.md)**
