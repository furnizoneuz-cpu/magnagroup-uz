import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getVisibleProducts as getProducts, getCategories } from "@/lib/data";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ProductStage from "@/components/ProductStage";
import ProductMaterials from "@/components/ProductMaterials";
import ProductZoom from "@/components/ProductZoom";
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
  if (!product) notFound();

  const categories = getCategories();
  const cat = categories.find((c) => c.id === product.category);
  const price = formatPrice(product.price, lang);
  const related = (await getProducts())
    .filter((p) => p.category === product.category && p.article !== product.article)
    .slice(0, 5);

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
      availability: Number(product.stock) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      ...(product.price ? { price: String(product.price), priceCurrency: "UZS" } : {}),
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* cinematic scroll stage */}
      <ProductStage product={product} lang={lang} />

      {/* info */}
      <div className="container-x -mt-2 py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-black/45">
          <Link href={`/${lang}`} className="hover:text-gold-dark">{t(lang, "nav_home")}</Link>
          <span>/</span>
          <Link href={`/${lang}/catalog`} className="hover:text-gold-dark">{t(lang, "nav_catalog")}</Link>
          <span>/</span>
          <Link href={`/${lang}/catalog?cat=${product.category}`} className="hover:text-gold-dark">{cat?.name[lang]}</Link>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                {t(lang, "article")}: {product.article}
              </span>
              {product.image && <ProductZoom src={product.image} alt={product.name[lang]} lang={lang} />}
            </div>
            <h2 className="text-2xl font-extrabold leading-tight text-ink sm:text-3xl">{product.name[lang]}</h2>
            <dl className="mt-6 space-y-3 border-y border-black/5 py-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-black/50">{t(lang, "category")}</dt>
                <dd className="font-medium text-ink">{cat?.name[lang]}</dd>
              </div>
              {product.dimensions && (
                <div className="flex justify-between">
                  <dt className="text-black/50">{t(lang, "dimensions")}</dt>
                  <dd className="font-medium text-ink">{product.dimensions}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="md:pt-2">
            <div className="mb-3">
              {Number(product.stock) > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                  ● {t(lang, "in_stock")}: {product.stock} {lang === "ru" ? "шт" : lang === "en" ? "pcs" : "dona"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  {t(lang, "on_order")}
                </span>
              )}
            </div>
            <div className="mb-4 text-2xl font-extrabold text-ink">
              {price || <span className="text-lg font-semibold text-black/45">{t(lang, "price_on_request")}</span>}
            </div>
            <div className="max-w-xs">
              <AddToCartButton product={product} lang={lang} full />
            </div>
            {!price && (
              <p className="mt-3 text-xs text-black/45">
                {lang === "ru" ? "Добавьте в корзину и оставьте заявку — мы сообщим цену." :
                 lang === "en" ? "Add to cart and send a request — we'll quote the price." :
                 "Savatga qo'shing va so'rov qoldiring — narxni xabar qilamiz."}
              </p>
            )}
          </div>
        </div>

        <ProductMaterials product={product} lang={lang} />

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-extrabold text-ink">{cat?.name[lang]}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((p) => (
                <ProductCard key={p.article} product={p} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
