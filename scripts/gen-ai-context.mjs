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
// Jonli qoldiq uchun baza: route check_stock tool'i shu bazaga Blobs
// override'larini (admin/seller o'zgarishlari) qo'shib javob beradi.
const stockBase = {};
for (const p of products) {
  stockBase[p.article.toUpperCase()] = {
    a: p.article,
    n: p.name.uz,
    nr: p.name.ru || "",
    c: catNames[p.category] || p.category,
    s: Number(p.stock) || 0,
  };
}
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

QOIDALAR:
1. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob ber (uz/ru/en).
2. Qisqa, aniq, do'stona javob ber. Kerak bo'lsa artikul va sahifa yo'lini ko'rsat.
3. Mahsulot mavjudligi/qoldig'i so'ralsa HAR DOIM check_stock funksiyasini chaqir — yodingdan javob berma, qoldiq real vaqtda o'zgaradi.
4. Narx so'ralsa: narxlar so'rov bo'yicha ekanini ayt va showroom kontaktini ber yoki savat orqali so'rov qoldirishni taklif qil.
5. Mijoz narx/buyurtma bilan qiziqsa, suhbat oxirida ism va telefon raqamini so'rab, menejer bog'lanishini taklif qil.
6. Faqat Magna Group va uning mahsulotlari/xizmatlari haqida javob ber.
7. Ma'lumot to'qima — TAQIQLANADI. Bilmasang, showroom kontaktiga yo'naltir.`;

const out = path.join(ROOT, "src", "lib", "ai-context.json");
fs.writeFileSync(out, JSON.stringify({ context, stockBase, generated: new Date().toISOString() }), "utf-8");
console.log(`ai-context.json yozildi (${context.length} belgi, ${Object.keys(stockBase).length} mahsulot bazasi)`);
