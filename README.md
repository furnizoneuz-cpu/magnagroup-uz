# Magna Group — internet-do'kon

IKEA uslubidagi uch tilli (o'zbek / rus / ingliz) mebel internet-do'koni.
Next.js 14 + Tailwind CSS. Ma'lumotlar `data/products.json` da (166 mahsulot, 9 kategoriya).

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
```

Ishlab chiqarish uchun:
```bash
npm run build
npm start
```

## Tuzilma

- `/` → avtomatik `/uz` ga yo'naltiradi. Tillar: `/uz`, `/ru`, `/en`.
- Sahifalar: bosh sahifa, `/catalog` (qidiruv + kategoriya filtri), `/product/<artikul>`,
  `/cart`, `/checkout`, `/flipbook` (64 sahifalik bosma katalog), `/about`, `/delivery`, `/contact`.
- **Adminka:** `/admin` — parol `.env.local` dagi `ADMIN_PASSWORD` (hozir: `magna2026`).

## Boshqaruvchi nima qiladi (adminka)

`/admin` ga kiring → parol. Ikki bo'lim:
1. **Mahsulotlar** — har mahsulotga **narx** kiritish (so'm), **foto yuklash**, va **faol/yashirin** qilish.
   Narx kiritilmagan mahsulot saytda "Narx so'rov bo'yicha" bo'lib ko'rinadi.
2. **Buyurtmalar** — saytdan tushgan buyurtmalar (ism, telefon, manzil, to'lov usuli, mahsulotlar).

Narxlar to'liq kiritilib bo'lgach — hammasi avtomatik saytda ko'rinadi. Kod o'zgartirish shart emas.

## Muhim izohlar

- **Tarjima:** kategoriya va mahsulot nomlari uch tilda `products.json` da. Tilni almashtirsangiz
  hamma matn o'zgaradi. Nomlar ruschadan avtomatik tarjima qilingan — kerak bo'lsa `products.json`
  ichida `name.uz` / `name.en` ni qo'lda tuzatish mumkin.
- **Fotolar:** hozircha mahsulotlarda toza foto yo'q (katalogda faqat rus matnli sahifalar bor edi).
  Boshqaruvchi adminka orqali har mahsulotga foto yuklaydi. Bosma katalog `/flipbook` da to'liq bor.
- **To'lov:** checkout'da Payme / Click / Uzum tugmalari bor, lekin haqiqiy to'lov shlyuzi hali ulanmagan
  (kalitlar kelgach ulanadi). Hozir buyurtma "so'rov" sifatida qabul qilinadi, operator bog'lanadi.
- **Ma'lumot fayllari:** `data/products.json` (mahsulotlar, adminka tahrirlaydi), `data/orders.json` (buyurtmalar).

## Keyingi bosqichlar (ixtiyoriy)

- Payme/Click/Uzum haqiqiy integratsiyasi (merchant kalitlari kerak).
- Mahsulot fotolarini yuklash.
- Domen `magnagroup.uz` ga deploy (Vercel yoki VPS).
