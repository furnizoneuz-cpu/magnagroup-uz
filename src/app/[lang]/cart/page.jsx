"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";

export default function CartPage({ params }) {
  const { lang } = params;
  const { items, setQty, remove, total, hasPrices } = useCart();

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-[#111] sm:text-3xl">{t(lang, "cart_title")}</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 py-20 text-center">
          <p className="text-black/40">{t(lang, "cart_empty")}</p>
          <Link href={`/${lang}/catalog`} className="mt-4 inline-block rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3a3a3a]">
            {t(lang, "continue_shopping")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-black/5 rounded-2xl border border-black/5">
              {items.map((it) => {
                const price = formatPrice(it.price, lang);
                return (
                  <div key={it.article} className="flex gap-4 p-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                      <ProductImage product={it} lang={lang} />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <Link href={`/${lang}/product/${encodeURIComponent(it.article)}`} className="text-sm font-semibold text-[#111] hover:text-[#111]">
                        {it.name[lang]}
                      </Link>
                      <div className="text-xs text-black/45">{t(lang, "article")}: {it.article}</div>
                      <div className="mt-1 text-sm font-bold text-[#111]">
                        {price || <span className="font-medium text-black/40">{t(lang, "price_on_request")}</span>}
                      </div>
                      <div className="mt-auto flex items-center gap-3 pt-2">
                        <div className="flex items-center rounded-lg border border-black/10">
                          <button onClick={() => setQty(it.article, it.qty - 1)} className="grid h-8 w-8 place-items-center text-lg">−</button>
                          <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                          <button onClick={() => setQty(it.article, it.qty + 1)} className="grid h-8 w-8 place-items-center text-lg">+</button>
                        </div>
                        <button onClick={() => remove(it.article)} className="text-xs font-medium text-red-500 hover:underline">
                          {t(lang, "cart_remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-black/5 bg-[#f5f5f5] p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-black/60">{t(lang, "cart_total")}</span>
                <span className="text-xl font-extrabold text-[#111]">
                  {hasPrices ? formatPrice(total, lang) : t(lang, "price_on_request")}
                </span>
              </div>
              <Link href={`/${lang}/checkout`} className="block rounded-lg bg-[#111] px-6 py-3 text-center text-sm font-bold text-white hover:bg-[#3a3a3a]">
                {t(lang, "cart_checkout")}
              </Link>
              <Link href={`/${lang}/catalog`} className="mt-2 block text-center text-sm font-medium text-[#111] hover:underline">
                {t(lang, "continue_shopping")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
