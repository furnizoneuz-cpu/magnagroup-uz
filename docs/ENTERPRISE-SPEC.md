# MagnaGroup Enterprise B2B+B2C — Master Roadmap

> Manba: Islom aka bergan enterprise spetsifikatsiya (2026-07-13).
> Bu — ko'p oylik, modul-modul quriladigan platforma yo'l xaritasi. Har modul
> alohida ishlab chiqiladi, sinaladi, kengaytiriladi (Alibaba/Amazon uslubi).
> "Holat": ✅ bor · 🟡 qisman · 🔜 rejada.

## Hozir qurilgan poydevor (bu sessiya)
- **Identity & Auth (#1)** 🟡: email ro'yxat/kirish, scrypt hash, HMAC-imzolangan
  session cookie (HttpOnly/SameSite/Secure), Facebook OAuth (env-gated).
  `src/lib/auth.js`, `/api/auth/*`.
- **Authorization / rollar (#2)** 🟡: visitor < customer < seller < admin.
  Rol-gated API (`/api/products`, `/api/users`), admin panelда rol boshqaruvi.
- Ma'lumot saqlash: Netlify Blobs (users/orders/leads/overrides/images).

## To'liq spec — modullar va holat

| # | Modul | Holat | Izoh |
|---|---|---|---|
| 1 | Identity & Authentication | 🟡 | email+FB bor; telefon/SMS, 2FA, refresh token — 🔜 |
| 2 | Authorization (RBAC) | 🟡 | 4 rol bor; 12+ rol (ombor/moliya/moderator/support/security) — 🔜 |
| 3 | Marketplace workflow (ko'p sotuvchi) | 🔜 | hozir bitta sotuvchi (Magna) |
| 4 | Payment & Escrow | 🔜 | Payme/Click/Uzum/Visa + escrow — merchant shartnoma kerak |
| 5 | Seller portal | 🟡 | admin panel (narx/qoldiq/foto) bor; to'liq portal — 🔜 |
| 6 | Buyer portal (B2C/B2B) | 🟡 | savat/buyurtma bor; RFQ/wishlist/kredit limit/invoice — 🔜 |
| 7 | Company management (CEO→xodim) | 🔜 | kompaniya akkaunt + ichki rollar |
| 8 | Admin panel | 🟡 | mahsulot/buyurtma/lead/user bor |
| 9 | AI services (tavsif/SEO/tarjima/narx) | 🟡 | tavsif+SEO+rasm generatsiya bor; enrichment — 🔜 |
| 10 | Logistics | 🔜 | yetkazish/tracking integratsiya |
| 11 | Inventory (multi-warehouse/QR/reorder) | 🟡 | stock bor; batch/serial/multi-WH — 🔜 |
| 12 | Analytics | 🔜 | GA/Clarity + ichki dashboard |
| 13 | Notifications (email/SMS/push) | 🔜 | |
| 14 | Security (Argon2/JWT/CSRF/WAF/DDoS/audit) | 🟡 | scrypt hash, HTTPS, HttpOnly cookie; qolgani — 🔜 |
| 15 | API & integrations (ERP/1C/SAP/Shopify) | 🔜 | |
| 16 | Compliance (soliq/ko'p davlat) | 🔜 | |
| 17 | Audit log (kim/qachon/IP/eski→yangi) | 🔜 | |
| 18 | Monitoring | 🔜 | |
| 19 | Performance (CDN/cache/LOD) | 🟡 | Netlify CDN, webp, lazy — bor |
| 20 | Disaster recovery / backup | 🔜 | |
| 21 | Fraud detection (fake/bot/card-testing) | 🔜 | |

## Halol baho
Bu — bitta prompt bilan emas, **alohida jamoa + oylar + server/DB byudjeti** bilan
quriladigan tizim. Netlify Free + Blobs poydevor sifatida ishlaydi, lekin
escrow/multi-tenant marketplace/audit/WAF darajasi uchun keyinchalik to'liq
backend (Postgres/Supabase yoki shunga o'xshash) + to'lov shartnomalari kerak.

**Tavsiya qilingan tartib (biznes qiymati bo'yicha):**
1. To'lov (Payme/Click) — real savdo
2. Buyer/Seller portal to'ldirish + buyurtma holati
3. Notifications (email/SMS)
4. Analytics
5. Keyin: multi-seller marketplace, escrow, audit, fraud.
