# MagnaGroup — Enterprise B2B Platform Master Spec (Roadmap)

> Manba: Islom aka bergan to'liq spetsifikatsiya (2026-07-13).
> Bu hujjat — yo'l xaritasi. "Holat" ustuni real bajarilishni ko'rsatadi.

## Tamoyil
Har bir mahsulot sahifasi — oddiy kartochka emas, **raqamli showroom**.
Namuna daraja: Apple Store / Tesla Configurator / Herman Miller / IKEA Interactive.

## 1. Product Visualization

| Talab | Holat | Izoh |
|---|---|---|
| Ultra HD rasmlar (har mahsulot) | ✅ Qisman | 172 real foto Real-ESRGAN bilan ~1850–2800px ga ko'tarildi. 8K uchun: rasmiy manba yoki pullik AI kerak |
| Rasmiy manbadan qidirish (manufacturer/catalog) | 🔜 | OEM kodlar (MG…, GA…, SF…) bo'yicha ishonchli rasmiy manba aniqlanmagan; noto'g'ri mahsulot xavfi bor — ehtiyotkor qidiruv kerak |
| Ko'p burchak (front/45°/side/rear/top) | 🔜 | Real burchaklar uchun showroomda 3–4 tomondan suratga olish KERAK (eng arzon va halol yo'l) yoki pullik AI multi-angle |
| Interactive 360° viewer (drag/zoom/inertia) | ✅ | Scroll-turntable + drag-rotate + wheel/pinch zoom + inersiya + dbl-click reset |
| Real 3D (GLB/GLTF/USDZ) | 🔜 | Higgsfield image→3D (kredit kerak) yoki foto-skanerlash. Kredit kelganda flagman modellardan boshlaymiz |
| Product animation (eshik/tortma ochilishi) | 🔜 | Video yoki 3D kerak — resursga bog'liq |
| Infinite zoom detail viewer | ✅ | Katta rasm ustida modal zoom (4x gacha, pan bilan) |
| Gallery (hero/lifestyle/o'lchov/exploded) | 🔜 Qisman | Hozir 1 real foto/mahsulot; qo'shimcha rakurslar kelsa avtomatik galereya |
| WebP + thumbnails + mobile versiya | ✅ | Avtomatik pipeline (upscale → webp thumb) |
| Lazy/progressive loading, caching | ✅ | Next.js + Netlify CDN + lazy img |

## 2. Asset pipeline (joriy, bepul)
1. ASTATKA Excel → rasm + ma'lumot ekstraksiya (`scripts/extract_astatka.py`)
2. Real-ESRGAN 4x×N upscale (`scripts/upscale_real.py`)
3. WebP thumbnail generatsiya (`scripts/gen_thumbs.py`)
4. Baza yig'ish (`scripts/build_real_catalog.py`)

## 3. Ma'lumot tuzilmasi (products.json)
Hozir: article(SKU), category, name(uz/ru/en), description, dimensions, color,
stock, image, hidden, _costUSD (ichki), _src.
Admin (Blobs): price, stock, hidden, image.
Kengaytirish rejasi: barcode, series, material, finish, weight, package, MOQ,
lead time, warranty, certificates, datasheet, CAD/BIM fayllar — **ma'lumot paydo
bo'lganda** (bo'sh maydonlarni oldindan qo'shmaymiz).

## 4. Keyingi modullar (resurs/qaror talab qiladi)
- PIM/DAM, AI Search & Semantic Discovery, Recommendation, Cross-sell
- CPQ + 3D Konfigurator, AR/VR (USDZ/WebXR), BIM/CAD integratsiya
- RFQ/Tender workflow, ko'p til (✅ uz/ru/en bor), SEO (✅ asosi bor)
- AI crawling & enrichment

## Kerakli resurslar (userdan)
- Showroom mahsulotlarini 3–4 rakursdan suratga olish (360/gallery uchun)
- Higgsfield yoki shunga o'xshash kredit (real 3D/video uchun)
- Domen + rasmiy akkauntlar; Payme/Click merchant
