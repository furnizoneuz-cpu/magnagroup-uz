import Reveal from "@/components/Reveal";

// Realistic CSS texture swatches — no images needed.
const SWATCH = {
  board: "repeating-linear-gradient(87deg, #b98d5a, #b98d5a 4px, #a97e4d 4px, #a97e4d 7px), linear-gradient(#b98d5a,#8f6438)",
  wood: "repeating-linear-gradient(88deg, #6f4a2c, #6f4a2c 3px, #5d3d24 3px, #5d3d24 6px)",
  metal: "linear-gradient(135deg,#8a9096 0%,#cfd4d8 40%,#7c8288 60%,#aeb4ba 100%)",
  chrome: "linear-gradient(135deg,#eef2f5,#a9b1b8 45%,#eef2f5 70%,#c3cace)",
  black: "linear-gradient(135deg,#2b2b2b,#131313)",
  leather: "radial-gradient(circle at 30% 25%, #43352d, #241a15 70%)",
  fabric: "repeating-linear-gradient(45deg,#4a4f57,#4a4f57 2px,#3c414a 2px,#3c414a 4px)",
  glass: "linear-gradient(135deg, rgba(178,206,214,0.85), rgba(120,150,160,0.55) 60%, rgba(200,220,226,0.8))",
  foam: "linear-gradient(135deg,#f0e8d7,#e2d6bd)",
  gold: "linear-gradient(135deg,#e9cd82,#a9843d)",
  paint: "conic-gradient(from 0deg,#e05a4a,#e0a54a,#4ea36e,#4e7ea3,#8a5fa3,#e05a4a)",
};

const CASE = [
  { k: "board", n: { uz: "Laminatlangan LDSP", ru: "Ламинированная ЛДСП", en: "Laminated board" }, s: { uz: "16–25mm, namlik va tirnalishga chidamli, 200+ dekor", ru: "16–25мм, влаго- и износостойкая, 200+ декоров", en: "16–25mm, moisture & scratch resistant, 200+ decors" } },
  { k: "black", n: { uz: "ABS himoya qirrasi", ru: "ABS-кромка", en: "ABS edge banding" }, s: { uz: "2mm, zarbaga chidamli, xavfsiz yumaloq", ru: "2мм, ударопрочная, безопасная", en: "2mm, impact-resistant, safe" } },
  { k: "metal", n: { uz: "Po'lat karkas", ru: "Стальной каркас", en: "Steel frame" }, s: { uz: "Kukun bo'yoqli, mustahkam va uzoq muddatli", ru: "С порошковой окраской, прочный", en: "Powder-coated, durable" } },
  { k: "gold", n: { uz: "Blum / Hettich furnitura", ru: "Фурнитура Blum / Hettich", en: "Blum / Hettich hardware" }, s: { uz: "Silliq, shovqinsiz yopilish", ru: "Плавное, бесшумное закрывание", en: "Soft, silent closing" } },
];

const MATERIALS = {
  office: CASE, staff: CASE, conference: CASE, tables: CASE, student: CASE,
  storage: [
    ...CASE.slice(0, 3),
    { k: "glass", n: { uz: "Kaleng shisha", ru: "Закалённое стекло", en: "Tempered glass" }, s: { uz: "4mm, xavfsiz va shaffof", ru: "4мм, безопасное и прозрачное", en: "4mm, safe and clear" } },
    CASE[3],
  ],
  seating: [
    { k: "leather", n: { uz: "Ekokoja / tabiiy teri", ru: "Экокожа / кожа", en: "Eco-leather / leather" }, s: { uz: "Nafas oladi, oson tozalanadi", ru: "Дышит, легко чистится", en: "Breathable, easy to clean" } },
    { k: "fabric", n: { uz: "Nafas oluvchi to'r mato", ru: "Дышащая сетка", en: "Breathable mesh" }, s: { uz: "Issiqda ham qulay", ru: "Комфорт даже в жару", en: "Comfortable even in heat" } },
    { k: "foam", n: { uz: "Yuqori zichlik gubka", ru: "Плотный поролон", en: "High-density foam" }, s: { uz: "35+ kg/m³, shaklini yo'qotmaydi", ru: "35+ кг/м³, держит форму", en: "35+ kg/m³, keeps shape" } },
    { k: "chrome", n: { uz: "Xrom metall asos", ru: "Хромированная база", en: "Chrome base" }, s: { uz: "150 kg gacha, klass-4 gaz-lift", ru: "до 150 кг, газлифт класс-4", en: "up to 150kg, class-4 gas lift" } },
  ],
  medical: [
    { k: "chrome", n: { uz: "Zanglamas po'lat AISI 304", ru: "Нержавеющая сталь AISI 304", en: "Stainless steel AISI 304" }, s: { uz: "Gigiyenik, korroziyaga chidamli", ru: "Гигиеничная, антикоррозийная", en: "Hygienic, corrosion-proof" } },
    { k: "glass", n: { uz: "Antibakterial qoplama", ru: "Антибактериальное покрытие", en: "Antibacterial coating" }, s: { uz: "Mikroblarga qarshi poroshkovaya", ru: "Антимикробное покрытие", en: "Antimicrobial finish" } },
    { k: "foam", n: { uz: "Meditsina plastigi", ru: "Медицинский пластик", en: "Medical-grade plastic" }, s: { uz: "Oson dezinfeksiya qilinadi", ru: "Легко дезинфицируется", en: "Easy to disinfect" } },
    { k: "black", n: { uz: "Kukun bo'yoqli karkas", ru: "Окрашенный каркас", en: "Coated frame" }, s: { uz: "Mustahkam, silliq g'ildiraklar", ru: "Прочный, с колёсами", en: "Sturdy, with casters" } },
  ],
  children: [
    { k: "board", n: { uz: "Ekologik LDSP (E1)", ru: "Экологичная ЛДСП (E1)", en: "Eco board (E1)" }, s: { uz: "Bolalar uchun xavfsiz — E1 klass", ru: "Безопасно для детей — класс E1", en: "Child-safe — class E1" } },
    { k: "paint", n: { uz: "Suvli bo'yoq", ru: "Краска на водной основе", en: "Water-based paint" }, s: { uz: "Zararsiz, yorqin va bardoshli", ru: "Безвредная, яркая, стойкая", en: "Non-toxic, bright, durable" } },
    { k: "foam", n: { uz: "Yumaloq xavfsiz qirralar", ru: "Скруглённые кромки", en: "Rounded safe edges" }, s: { uz: "Jarohatsiz, o'tkir burchaksiz", ru: "Без острых углов", en: "No sharp corners" } },
    { k: "gold", n: { uz: "Bolalarbop furnitura", ru: "Детская фурнитура", en: "Child-friendly hardware" }, s: { uz: "Barmoq qisilishidan himoya", ru: "Защита от защемления", en: "Anti-pinch protection" } },
  ],
};

const TITLE = { uz: "Xom ashyo va sifat", ru: "Материалы и качество", en: "Materials & quality" };
const SUB = {
  uz: "Har bir mahsulot yuqori sifatli, sertifikatlangan materiallardan ishlab chiqariladi.",
  ru: "Каждое изделие произведено из качественных сертифицированных материалов.",
  en: "Every product is made from high-quality, certified materials.",
};

export default function ProductMaterials({ product, lang }) {
  const list = MATERIALS[product.category] || CASE;
  return (
    <section className="mt-14 border-t border-black/5 pt-12">
      <Reveal>
        <h2 className="text-2xl font-extrabold text-ink">{TITLE[lang]}</h2>
        <p className="mt-1 max-w-xl text-black/55">{SUB[lang]}</p>
      </Reveal>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((m, i) => (
          <Reveal key={i} delay={(i % 4) + 1}>
            <div className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="relative h-28 w-full" style={{ background: SWATCH[m.k] }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)" }} />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="font-bold text-ink">{m.n[lang]}</div>
                <div className="mt-1 text-sm text-black/55">{m.s[lang]}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
