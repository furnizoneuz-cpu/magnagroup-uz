import Link from "next/link";
import { getVisibleProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";

export const revalidate = 60;

const META = {
  uz: { title: "Magna Group — Ofis va muassasalar uchun mebel ishlab chiqarish", description: "Magna Group — ofis, konferensiya, tibbiyot, ta'lim va bolalar muassasalari uchun professional mebel ishlab chiqaruvchi. 160+ mahsulot." },
  ru: { title: "Magna Group — Производство мебели для офиса и учреждений", description: "Magna Group — производитель мебели для офиса, конференц-залов, медицинских, образовательных и детских учреждений. 160+ изделий." },
  en: { title: "Magna Group — Furniture manufacturing for offices & institutions", description: "Magna Group manufactures furniture for offices, conference rooms, medical, educational and childcare institutions. 160+ products." },
};

export function generateMetadata({ params }) {
  return META[params.lang] || META.uz;
}

const COPY = {
  uz: {
    eyebrow: "Magna Group — ishlab chiqaruvchidan to'g'ridan-to'g'ri",
    hero: "ISH JOYINGIZ YANGI DARAJADA",
    sub: "Ofis, konferensiya va xodimlar mebeli. Showroomda jonli ko'ring — ombordan darhol yetkazamiz.",
    cta: "Katalogni ko'rish",
    cta2: "Sotuvda borlari",
    featured: "Ombordagi mahsulotlar",
    cats: "Kategoriyalar bo'yicha",
    banner: "SHOWROOMGA KELING",
    bannerSub: "Toshkent, Alfraganus savdo majmuasi, 2-qavat — mahsulotlarni jonli ko'ring va sinab ko'ring.",
    bannerCta: "Manzilni ochish",
    all: "Hammasini ko'rish",
  },
  ru: {
    eyebrow: "Magna Group — напрямую от производителя",
    hero: "РАБОЧЕЕ ПРОСТРАНСТВО НОВОГО УРОВНЯ",
    sub: "Мебель для офиса, переговорных и персонала. Смотрите вживую в шоу-руме — доставим со склада сразу.",
    cta: "Смотреть каталог",
    cta2: "В наличии",
    featured: "Товары на складе",
    cats: "По категориям",
    banner: "ПРИХОДИТЕ В ШОУ-РУМ",
    bannerSub: "Ташкент, ТЦ Alfraganus, 2 этаж — посмотрите и опробуйте мебель вживую.",
    bannerCta: "Открыть адрес",
    all: "Смотреть все",
  },
  en: {
    eyebrow: "Magna Group — straight from the manufacturer",
    hero: "YOUR WORKSPACE. NEXT LEVEL.",
    sub: "Office, conference and staff furniture. See it live at our showroom — in-stock items ship immediately.",
    cta: "Browse catalog",
    cta2: "In stock now",
    featured: "In-stock products",
    cats: "Shop by category",
    banner: "VISIT THE SHOWROOM",
    bannerSub: "Tashkent, Alfraganus trade center, 2nd floor — see and try the furniture in person.",
    bannerCta: "Open address",
    all: "View all",
  },
};

export default async function Home({ params }) {
  const { lang } = params;
  const c = COPY[lang] || COPY.uz;
  const products = await getVisibleProducts();
  const categories = getCategories();

  const inStock = products.filter((p) => Number(p.stock) > 0 && p.image);
  const featured = inStock.slice(0, 8);
  const hero = inStock.find((p) => p.category === "office") || inStock[0];

  // one representative image per category (only categories that have visible products)
  const catTiles = categories
    .map((cat) => {
      const sample = products.find((p) => p.category === cat.id && p.image);
      const count = products.filter((p) => p.category === cat.id).length;
      return sample ? { ...cat, image: sample.thumb || sample.image, count } : null;
    })
    .filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="tile">
        <div className="container-x grid items-center gap-6 py-10 md:grid-cols-2 md:py-16">
          <div className="order-2 md:order-1">
            <div className="text-sm font-semibold text-[#111]">{c.eyebrow}</div>
            <h1 className="display-head mt-3 text-5xl text-[#111] md:text-7xl">{c.hero}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#555]">{c.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${lang}/catalog`} className="btn-pill">{c.cta}</Link>
              <Link href={`/${lang}/catalog`} className="btn-pill-outline">{c.cta2}</Link>
            </div>
          </div>
          {hero && (
            <div className="order-1 md:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image} alt={hero.name[lang]}
                className="mx-auto max-h-[420px] w-auto object-contain mix-blend-multiply" />
            </div>
          )}
        </div>
      </section>

      {/* FEATURED SHELF */}
      {featured.length > 0 && (
        <section className="container-x py-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111]">{c.featured}</h2>
            <Link href={`/${lang}/catalog`} className="text-sm font-semibold text-[#111] hover:underline">{c.all}</Link>
          </div>
          <div className="no-scrollbar -mx-1.5 flex snap-x gap-4 overflow-x-auto px-1.5 pb-2">
            {featured.map((p) => (
              <div key={p.article} className="w-64 shrink-0 snap-start sm:w-72">
                <ProductCard product={p} lang={lang} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORY TILES */}
      <section className="container-x py-6">
        <h2 className="mb-5 text-xl font-bold text-[#111]">{c.cats}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {catTiles.map((cat) => (
            <Link key={cat.id} href={`/${lang}/catalog?cat=${cat.id}`} className="group">
              <div className="tile relative w-full overflow-hidden" style={{ paddingTop: "100%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.name[lang]} loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-6 mix-blend-multiply" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#111] shadow-sm">
                    {cat.name[lang]} · {cat.count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SHOWROOM BANNER */}
      <section className="container-x py-12">
        <div className="bg-[#111] px-6 py-14 text-center text-white md:py-20">
          <h2 className="display-head text-4xl md:text-6xl">{c.banner}</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/70">{c.bannerSub}</p>
          <a href="https://maps.google.com/?q=41.289941,69.296108" target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#111] transition hover:bg-white/85">
            {c.bannerCta}
          </a>
        </div>
      </section>

      {/* LEAD */}
      <section className="container-x pb-4 pt-2">
        <LeadForm lang={lang} />
      </section>
    </div>
  );
}
