import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getVisibleProducts as getProducts, getCategories } from "@/lib/data";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import Accordion from "@/components/Accordion";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang, article } = params;
  const product = await getProduct(decodeURIComponent(article));
  if (!product) return {};
  const name = product.name[lang] || product.name.uz;
  return {
    title: `${name} — ${product.article} | Magna Group`,
    description: product.description?.[lang] || `${name} — Magna Group. Artikul: ${product.article}.`,
  };
}

export default async function ProductPage({ params }) {
  const { lang, article } = params;
  const product = await getProduct(decodeURIComponent(article));
  if (!product || product.hidden) notFound();

  const categories = getCategories();
  const cat = categories.find((c) => c.id === product.category);
  const price = formatPrice(product.price, lang);
  const inStock = Number(product.stock) > 0;
  const related = (await getProducts())
    .filter((p) => p.category === product.category && p.article !== product.article)
    .slice(0, 4);
  const L = (uz, ru, en) => (lang === "ru" ? ru : lang === "en" ? en : uz);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[lang] || product.name.uz,
    sku: product.article,
    image: product.image ? `https://magnagroup.uz${product.image}` : undefined,
    description: product.description?.[lang] || undefined,
    brand: { "@type": "Brand", name: "Magna Group" },
    offers: {
      "@type": "Offer",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      ...(product.price ? { price: String(product.price), priceCurrency: "UZS" } : {}),
    },
  };

  const accordionItems = [
    product.description?.[lang]
      ? { title: L("Tavsif", "Описание", "Description"), body: product.description[lang] }
      : null,
    {
      title: L("Xususiyatlar", "Характеристики", "Details"),
      body: [
        `${t(lang, "article")}: ${product.article}`,
        cat ? `${t(lang, "category")}: ${cat.name[lang]}` : null,
        product.dimensions ? `${t(lang, "dimensions")}: ${product.dimensions}` : null,
        inStock
          ? `${t(lang, "in_stock")}: ${product.stock} ${lang === "ru" ? "шт" : lang === "en" ? "pcs" : "dona"}`
          : t(lang, "on_order"),
      ].filter(Boolean).join("\n"),
    },
    {
      title: t(lang, "nav_delivery"),
      body: L(
        "Toshkent bo'ylab yetkazib berish va professional yig'ish xizmati mavjud. Muddat va narx buyurtma hajmiga bog'liq — menejer aniqlashtiradi.",
        "Доставка по Ташкенту и профессиональная сборка. Сроки и стоимость зависят от объёма заказа — уточнит менеджер.",
        "Delivery across Tashkent with professional assembly. Timing and cost depend on order size — our manager will confirm."
      ),
    },
    {
      title: L("Showroom", "Шоу-рум", "Showroom"),
      body: L(
        "Mahsulotni jonli ko'rish: Toshkent, Mirobod tumani, Tong Yulduzi ko'chasi, Alfraganus savdo majmuasi, 2-qavat (Atlas mebel ichida).",
        "Посмотреть вживую: Ташкент, Мирабадский район, ул. Тонг Юлдузи, ТЦ Alfraganus, 2 этаж (внутри Atlas mebel).",
        "See it in person: Tashkent, Mirobod district, Tong Yulduzi street, Alfraganus trade center, 2nd floor (inside Atlas mebel)."
      ),
    },
  ].filter(Boolean);

  return (
    <div className="container-x py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-[#757575]">
        <Link href={`/${lang}`} className="hover:text-[#111]">{t(lang, "nav_home")}</Link>
        <span>/</span>
        <Link href={`/${lang}/catalog`} className="hover:text-[#111]">{t(lang, "nav_catalog")}</Link>
        <span>/</span>
        <Link href={`/${lang}/catalog?cat=${product.category}`} className="hover:text-[#111]">{cat?.name[lang]}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* gallery */}
        <ProductGallery product={product} lang={lang} />

        {/* right rail */}
        <div>
          <div className={"text-[15px] font-semibold " + (inStock ? "text-green-700" : "text-[#9E3500]")}>
            {inStock
              ? `${t(lang, "in_stock")} · ${product.stock} ${lang === "ru" ? "шт" : lang === "en" ? "pcs" : "dona"}`
              : t(lang, "on_order")}
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-[#111]">{product.name[lang]}</h1>
          <div className="mt-1 text-[15px] text-[#757575]">{cat?.name[lang]} · {product.article}</div>

          <div className="mt-4 text-xl font-semibold text-[#111]">
            {price || <span className="text-[#757575]">{t(lang, "price_on_request")}</span>}
          </div>

          <div className="mt-6 space-y-3">
            <AddToCartButton product={product} lang={lang} full pill />
            <a href="tel:+998991725050" className="btn-pill-outline w-full">
              {L("Qo'ng'iroq qilish", "Позвонить", "Call us")}
            </a>
          </div>

          {!price && (
            <p className="mt-3 text-[13px] text-[#757575]">
              {L(
                "Savatga qo'shing va so'rov qoldiring — narxni tez orada xabar qilamiz.",
                "Добавьте в корзину и оставьте заявку — мы быстро сообщим цену.",
                "Add to cart and send a request — we'll quote the price shortly."
              )}
            </p>
          )}

          <div className="mt-8">
            <Accordion items={accordionItems} />
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-xl font-bold text-[#111]">
            {L("Sizga ham yoqishi mumkin", "Вам также может понравиться", "You might also like")}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.article} product={p} lang={lang} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
