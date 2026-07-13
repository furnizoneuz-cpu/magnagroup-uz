import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";

/*
  Minimal commerce card: product photo on a light gray tile, status line,
  bold name, gray category, price. Fully static — no motion, no buttons;
  the whole card links to the product page.
*/
export default function ProductCard({ product, lang, categories = null }) {
  const price = formatPrice(product.price, lang);
  const inStock = Number(product.stock) > 0;

  return (
    <Link href={`/${lang}/product/${encodeURIComponent(product.article)}`} className="group block">
      <div className="tile relative w-full overflow-hidden" style={{ paddingTop: "100%" }}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumb || product.image}
            alt={product.name?.[lang] || product.article}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-4 mix-blend-multiply"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/30">{product.article}</span>
          </div>
        )}
      </div>

      <div className="pt-3">
        <div className={"text-[13px] font-semibold " + (inStock ? "text-green-700" : "text-[#9E3500]")}>
          {inStock
            ? `${t(lang, "in_stock")} · ${product.stock} ${lang === "ru" ? "шт" : lang === "en" ? "pcs" : "dona"}`
            : t(lang, "on_order")}
        </div>
        <div className="mt-0.5 text-[15px] font-semibold leading-snug text-[#111] group-hover:underline">
          {product.name[lang]}
        </div>
        <div className="mt-0.5 text-[13px] text-[#757575]">{product.article}{product.dimensions ? ` · ${product.dimensions}` : ""}</div>
        <div className="mt-1.5 text-[15px] font-semibold text-[#111]">
          {price || <span className="text-[#757575]">{t(lang, "price_on_request")}</span>}
        </div>
      </div>
    </Link>
  );
}
