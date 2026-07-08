# Magna Group — "Obsidian" mahsulot rasm uslubi (master prompt)

Manba: `Katalog/…mp4` videosidagi "The Obsidian Polo" sayti uslubi.
Har mahsulot rasmini shu uslubda generatsiya qilish uchun quyidagi promptdan foydalaning.
`{PRODUCT}` o'rniga mahsulotning inglizcha tavsifini qo'ying.

## Master prompt (image model uchun)

```
Ultra-premium cinematic product photograph of {PRODUCT}, floating and centered
in a pitch-black obsidian void, single dramatic top-down spotlight with soft rim
light tracing every edge, volumetric smoke and low-lying mist swirling around the
base, deep chiaroscuro shadows, matte black and charcoal palette with subtle warm
gold highlights, glossy reflective dark floor with a faint mirror reflection,
luxury editorial advertising campaign, "tailored from shadow" mood, ultra-detailed
materials and texture, photorealistic, 8k, studio product photography, shot on
Phase One, f/8, elegant, mysterious, minimalist, high-end brand key visual.
No text, no watermark, no people, no bright background, no clutter.
```

Tavsiya etilgan parametrlar: `model: nano_banana_pro`, `aspect_ratio: 1:1`,
`resolution: 2k` (yoki 1k tejamkorlik uchun).

## {PRODUCT} — kategoriya bo'yicha tavsif shabloni

- **office** — "a modern executive office desk set in dark walnut and matte black, L-shaped desk with cabinet"
- **staff** — "a modern open-plan staff workstation desk in light oak and graphite"
- **conference** — "a long modern conference meeting table in dark wood and black"
- **storage** — "a tall office bookcase / cabinet in dark wood with glass doors"
- **tables** — "a minimalist office desk in warm wood"
- **seating** — "a high-back executive leather office chair in black" / "a modern visitor chair"
- **medical** — "a clean white medical cabinet / examination couch, clinical stainless steel"
- **student** — "a modern school student desk and chair set in light wood and metal"
- **children** — "a colorful playful kindergarten furniture piece" (ESLATMA: bolalar mebeli
  yorqin — obsidian qorong'i uslub bilan ziddiyatli; ular uchun yumshoqroq, kamroq qorong'i
  fon tavsiya etiladi)

## Har mahsulot uchun to'liq prompt qanday tuziladi

`{PRODUCT}` = kategoriya shabloni + mahsulot nomi (en) + o'lchami.
Masalan MGW114 (Bookcase, L80×W38×H180):
> "...cinematic product photograph of a tall office bookcase in dark wood,
> proportions 80×38×180 cm, floating and centered in a pitch-black obsidian void..."

## Eslatma
166 mahsulot × 2 kredit = ~332 kredit. Bepul rejada 10 kredit bor.
To'liq partiya uchun Higgsfield pullik rejasi kerak. Prompt tayyor —
kredit bo'lgach `scripts/generate-images` orqali hammasi partiya bilan chiqariladi.
