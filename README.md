# Kolvo — Interaktiv 3D kimyo platformasi

Interaktiv 3D kimyo platformasi: har bir elementning atom modeli va moddaning realistik 3D ko'rinishi, uch tilda (O'zbek / English / Русский) ma'lumotlar, Mendeleyev va davriy jadval haqida bo'lim.

**Muallif:** Nihona Najmiddinova Irshodovna

**Sayt:** https://najmiddinovanihona-hub.github.io/kolvo3D/

Har bir elementning o'z havolasi bor, masalan: [#Au](https://najmiddinovanihona-hub.github.io/kolvo3D/#Au) (oltin), [#26](https://najmiddinovanihona-hub.github.io/kolvo3D/#26) (temir), [#mendeleyev](https://najmiddinovanihona-hub.github.io/kolvo3D/#mendeleyev).

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
chem-visuals.js     — kimyo darslari uchun 3D, animatsiya, diagramma, grafik va kalkulyatorlar
lab.js              — virtual laboratoriya (#lab): eruvchanlik jadvalidagi barcha kislota, asos va tuzlar (272 reaktiv), reaksiyalar mexanizmi, qizdirish, bug'lanish, termik parchalanish
apparatus.js        — kimyoviy asboblar (#asboblar): 38 ta laboratoriya asbobining 3D modeli
data/
  elements.js       — 118 element ma'lumotlari
  descriptions.js   — element tavsiflari
  facts.js          — qo'llanilishi va qiziqarli faktlar
  uzbekistan.js     — O'zbekistonda qazib olinadigan / ishlab chiqariladigan elementlar
  mendeleev.js      — «Mendeleyev haqida» sahifasi: xronologiya, bo'limlar, bashoratlar, rasmlar (Wikimedia Commons)
  chemistry.js      — «Umumiy kimyo»: Birinchi qism (6 bob, 53 mavzu), Ikkinchi qism (5 bob, 42 mavzu) Uchinchi qism (4 bob, 39 mavzu) To'rtinchi qism — organik kimyo (4 bob, 35 mavzu) va Beshinchi qism (8 bob, 33 mavzu), 3 tilda, test savollari
  apparatus.js      — asboblar haqida ma'lumot: vazifasi, materiali, ishlatilishi, ixtirochisi, tarixi (3 tilda)
  details.js        — batafsil bo'limlar (tarix, tarqalishi, olinishi, kimyosi, biologiyasi, izotoplari) va qo'shimcha fizik xossalar
assets/
  intro-bg.png      — kirish ekrani foni
  app-bg.png        — asosiy ekran foni
```

## Texnologiyalar

- Three.js (r128) — 3D atom va modda modellari
- React 18 (`support.js` sahifa ochilganda CDN'dan yuklaydi)
- Vanilla JavaScript

Internet aloqasi talab qilinadi (Three.js va React CDN'dan yuklanadi).
