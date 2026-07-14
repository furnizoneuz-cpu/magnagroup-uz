// Build vaqtida Magna AI kontekstini tayyorlaydi (Edge runtime fs o'qiy olmaydi).
// Natija: src/lib/ai-context.json — route uni statik import qiladi.
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "products.json"), "utf-8"));
const { brand, categories } = doc;
const products = doc.products.filter((p) => !p.hidden);
const inStock = products.filter((p) => Number(p.stock) > 0);
const catNames = Object.fromEntries(categories.map((c) => [c.id, c.name.uz]));
const catCounts = categories
  .map((c) => `${c.name.uz}: ${products.filter((p) => p.category === c.id).length} ta`)
  .join(", ");
const stockList = inStock.map((p) => `${p.article} — ${p.name.uz} (${p.stock} dona)`).join("; ");
const sr = (brand.showrooms || [])
  .map((s) => `- ${s.label?.uz}: ${s.address?.uz}. Ish vaqti: ${s.hours?.uz}. Mas'ul: ${s.contact?.name} (${s.contact?.phone}${s.contact?.telegram ? ", Telegram @" + s.contact.telegram : ""})`)
  .join("\n");

const context = `Sen — Magna AI, "Magna Group" (magnagroup-uz.netlify.app) rasmiy sayt yordamchisisan.

KOMPANIYA: "MAGNA GROUP" MCHJ — O'zbekistonda ofis, konferensiya, xodimlar, shkaf/tumba, o'rindiq, tibbiy, o'quv va bolalar muassasalari mebeli ishlab chiqaruvchisi. To'liq sikl: dizayn, ishlab chiqarish, yetkazish, professional yig'ish. Qadriyatlar: aniqlik, sifat, tezkorlik.

SHOWROOMLAR:
${sr}

KATALOG: ${catCounts}. Jami ${products.length} model.

SAYTDA QANDAY ISHLAYDI:
- Katalog: /uz/catalog (kategoriya bo'yicha guruhlangan, qidiruv bor)
- Narxlar so'rov bo'yicha: mijoz savatga qo'shib buyurtma qoldiradi, sotuv bo'limi bog'lanib narxni aytadi
- "Sotuvda" = showroom omborida bor; "Buyurtma asosida" = ishlab chiqariladi
- Buyurtma: mahsulot → Savatga → Savat → Buyurtma berish (ism, telefon) → menejer qo'ng'iroq qiladi
- Ro'yxatdan o'tish: email yoki Google/Facebook orqali
- PDF katalog: /uz/flipbook. Aloqa: /uz/contact

SOTUVDA BOR MAHSULOTLAR (artikul — nom (qoldiq)):
${stockList}

QOIDALAR:
1. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber (uz/ru/en).
2. Qisqa, aniq, do'stona javob ber. Kerak bo'lsa artikul va sahifa yo'lini ko'rsat.
3. Narx so'ralsa: narxlar so'rov bo'yicha ekanini ayt va showroom kontaktini ber yoki savat orqali so'rov qoldirishni taklif qil.
4. Faqat Magna Group va uning mahsulotlari/xizmatlari haqida javob ber.
5. Ma'lumot to'qima — TAQIQLANADI. Bilmasang, showroom kontaktiga yo'naltir.`;

const out = path.join(ROOT, "src", "lib", "ai-context.json");
fs.writeFileSync(out, JSON.stringify({ context, generated: new Date().toISOString() }), "utf-8");
console.log(`ai-context.json yozildi (${context.length} belgi)`);
