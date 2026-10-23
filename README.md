# Mendeleyev 3D — Interaktiv davriy jadval

Interaktiv 3D kimyo platformasi: har bir elementning atom modeli va moddaning realistik 3D ko'rinishi, uch tilda (O'zbek / English / Русский) ma'lumotlar, Mendeleyev va davriy jadval haqida bo'lim.

**Muallif:** Nihona Najmiddinova Irshodovna

## Ishga tushirish (lokal)

Bu statik sayt. Fayllarni brauzerda ochish uchun oddiy server kifoya:

```bash
# Python 3
python -m http.server 8000
# keyin brauzerda oching: http://localhost:8000
```

> Eslatma: `index.html` ni to'g'ridan-to'g'ri ikki marta bosib ochish ham mumkin, lekin ba'zi brauzerlarda lokal fayllar uchun cheklov bo'lishi mumkin — shuning uchun yuqoridagi server tavsiya etiladi.

## GitHub Pages'ga joylash

1. Yangi repozitoriy yarating va shu papkadagi barcha fayllarni yuklang.
2. Repozitoriy → **Settings → Pages**.
3. **Source**: `Deploy from a branch`, branch: `main`, papka: `/ (root)`.
4. Saqlang — bir necha daqiqadan so'ng sayt `https://<foydalanuvchi>.github.io/<repo>/` manzilida ochiladi.

## Fayllar tuzilishi

```
index.html          — asosiy ilova
support.js          — ishlash uchun zarur kutubxona
data/
  elements.js       — 118 element ma'lumotlari
  descriptions.js   — element tavsiflari
  facts.js          — qo'llanilishi va qiziqarli faktlar
assets/
  intro-bg.png      — kirish ekrani foni
  app-bg.png        — asosiy ekran foni
```

## Texnologiyalar

- Three.js (r128) — 3D atom va modda modellari
- Vanilla JavaScript

Internet aloqasi talab qilinadi (Three.js CDN'dan yuklanadi).
