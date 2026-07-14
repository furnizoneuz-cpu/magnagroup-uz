import { getBrand } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata = { title: "Biz haqimizda | Magna Group" };

const C = {
  uz: {
    lead: "Magna Group — ofis, konferensiya, tibbiyot, ta'lim va bolalar muassasalari uchun professional mebel ishlab chiqaruvchi O'zbekiston kompaniyasi.",
    body: [
      "Kompaniyamiz to'liq ishlab chiqarish sikliga ega: dizayn, ishlab chiqarish, yetkazib berish va professional yig'ish. Ishlab chiqarish sexlarimiz Germaniya, Italiya va Xitoyning yuqori texnologik jihozlari bilan jihozlangan.",
      "Biznesimiz falsafasi uchta qadriyatga asoslanadi — aniqlik, sifat va tezkorlik. Har bir buyurtmani kelishilgan muddatda ishlab chiqarish, yetkazib berish va yig'ib berishni kafolatlaymiz.",
      "Mahsulotlarimiz E1 klassidagi ekologik xavfsiz materiallardan, chidamli metall karkaslardan va sifatli furnituradan tayyorlanadi. Biz uchun har bir mijoz — uzoq muddatli hamkor.",
    ],
    valuesTitle: "Qadriyatlarimiz",
    values: [["Aniqlik", "Kelishilgan muddat va o'lchamlarga qat'iy rioya"], ["Sifat", "E1 material, chidamli karkas, ishonchli furnitura"], ["Tezkorlik", "Ishlab chiqarish, yetkazish va yig'ish — bir joydan"]],
    scopeTitle: "Yo'nalishlarimiz",
    scope: ["Rahbar va ofis mebeli", "Muzokara va konferensiya stollari", "Xodimlar ish o'rinlari", "Shkaf, tumba va stellajlar", "O'rindiq va kreslolar", "Tibbiy muassasa mebeli", "O'quv muassasa mebeli", "Bolalar bog'chasi mebeli"],
    showroomTitle: "Ko'rgazma zallarimiz",
  },
  ru: {
    lead: "Magna Group — узбекская компания-производитель профессиональной мебели для офисов, конференц-залов, медицинских, образовательных и детских учреждений.",
    body: [
      "У компании полный производственный цикл: дизайн, производство, доставка и профессиональная сборка. Цеха оснащены высокотехнологичным оборудованием из Германии, Италии и Китая.",
      "Философия бизнеса основана на трёх ценностях — пунктуальность, качество и быстрота. Гарантируем изготовление, доставку и сборку каждого заказа в оговорённые сроки.",
      "Продукция изготавливается из экологически безопасных материалов класса E1, прочных металлокаркасов и качественной фурнитуры. Каждый клиент для нас — долгосрочный партнёр.",
    ],
    valuesTitle: "Наши ценности",
    values: [["Пунктуальность", "Строгое соблюдение сроков и размеров"], ["Качество", "Материал E1, прочный каркас, надёжная фурнитура"], ["Быстрота", "Производство, доставка и сборка — из одних рук"]],
    scopeTitle: "Направления",
    scope: ["Мебель для руководителей и офиса", "Столы для переговоров и конференций", "Рабочие места персонала", "Шкафы, тумбы и стеллажи", "Стулья и кресла", "Мебель для медучреждений", "Мебель для учебных заведений", "Мебель для детских садов"],
    showroomTitle: "Наши шоу-румы",
  },
  en: {
    lead: "Magna Group is an Uzbek manufacturer of professional furniture for offices, conference rooms, medical, educational and childcare institutions.",
    body: [
      "We run a full production cycle: design, manufacturing, delivery and professional assembly. Our workshops are equipped with high-tech machinery from Germany, Italy and China.",
      "Our philosophy rests on three values — punctuality, quality and speed. We guarantee manufacturing, delivery and assembly of every order within the agreed deadlines.",
      "Products are made of eco-safe E1-class materials, durable metal frames and quality hardware. Every client is a long-term partner to us.",
    ],
    valuesTitle: "Our values",
    values: [["Punctuality", "Strict adherence to deadlines and dimensions"], ["Quality", "E1 material, durable frame, reliable hardware"], ["Speed", "Manufacturing, delivery and assembly — from one hand"]],
    scopeTitle: "What we make",
    scope: ["Executive & office furniture", "Meeting & conference tables", "Staff workstations", "Cabinets & shelving", "Chairs & armchairs", "Medical furniture", "Educational furniture", "Kindergarten furniture"],
    showroomTitle: "Our showrooms",
  },
};

export default function AboutPage({ params }) {
  const { lang } = params;
  const c = C[lang] || C.uz;
  const brand = getBrand();
  const showrooms = brand.showrooms || [];
  const stats = [
    ["250+", lang === "ru" ? "моделей" : lang === "en" ? "models" : "model"],
    ["8", lang === "ru" ? "направлений" : lang === "en" ? "categories" : "yo'nalish"],
    ["2", lang === "ru" ? "шоу-рума" : lang === "en" ? "showrooms" : "showroom"],
    ["100%", lang === "ru" ? "свой цикл" : lang === "en" ? "own cycle" : "o'z sikli"],
  ];

  return (
    <div className="container-x py-10">
      <h1 className="display-head text-4xl text-[#111] md:text-5xl">{t(lang, "about_title")}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#333]">{c.lead}</p>

      <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-[#555]">
        {c.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([n, lbl]) => (
          <div key={lbl} className="tile rounded-2xl p-6 text-center">
            <div className="display-head text-3xl text-[#111]">{n}</div>
            <div className="mt-1 text-sm text-[#757575]">{lbl}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-bold text-[#111]">{c.valuesTitle}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {c.values.map(([tt, d]) => (
          <div key={tt} className="rounded-2xl border border-black/10 p-6">
            <div className="text-lg font-bold text-[#111]">{tt}</div>
            <div className="mt-1 text-sm text-[#555]">{d}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-bold text-[#111]">{c.scopeTitle}</h2>
      <div className="flex flex-wrap gap-2">
        {c.scope.map((s) => (
          <span key={s} className="rounded-full bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#111]">{s}</span>
        ))}
      </div>

      {showrooms.length > 0 && (
        <>
          <h2 className="mt-12 mb-4 text-xl font-bold text-[#111]">{c.showroomTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {showrooms.map((s, i) => (
              <div key={i} className="rounded-2xl border border-black/10 p-6">
                <div className="text-sm font-bold uppercase tracking-wide text-[#111]">{s.label?.[lang]}</div>
                <div className="mt-1 text-[15px] text-[#333]">{s.address?.[lang]}</div>
                {s.hours && <div className="mt-1 text-sm text-[#757575]">{s.hours[lang]}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
