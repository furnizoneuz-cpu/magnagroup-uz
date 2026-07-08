import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";

export default function ProductCard({ product, lang }) {
  const price = formatPrice(product.price, lang);
  return (
    <div className="lift group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <Link href={`/${lang}/product/${encodeURIComponent(product.article)}`} className="zoomimg block">
        <ProductImage product={product} lang={lang} />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gold-dark">
          {product.article}
        </div>
        <Link
          href={`/${lang}/product/${encodeURIComponent(product.article)}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink hover:text-gold-dark"
        >
          {product.name[lang]}
        </Link>
        {product.dimensions && (
          <div className="mt-1 text-xs text-black/50">{product.dimensions}</div>
        )}
        <div className="mt-auto pt-3">
          <div className="mb-2 text-sm font-bold text-ink">
            {price || <span className="font-medium text-black/45">{t(lang, "price_on_request")}</span>}
          </div>
          <AddToCartButton product={product} lang={lang} full />
        </div>
      </div>
    </div>
  );
}
