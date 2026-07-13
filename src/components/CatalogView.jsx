"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { t } from "@/lib/i18n";

export default function CatalogView({ lang, products, categories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [cat, setCat] = useState(searchParams.get("cat") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [stockOnly, setStockOnly] = useState(false);

  useEffect(() => {
    setCat(searchParams.get("cat") || "");
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  function updateUrl(nextCat, nextQ) {
    const p = new URLSearchParams();
    if (nextCat) p.set("cat", nextCat);
    if (nextQ) p.set("q", nextQ);
    router.replace(`${pathname}${p.toString() ? "?" + p.toString() : ""}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (stockOnly && !(Number(p.stock) > 0)) return false;
      if (!needle) return true;
      const hay = [p.article, p.name.uz, p.name.ru, p.name.en, p.dimensions || ""].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [products, cat, q, stockOnly]);

  const activeCat = categories.find((c) => c.id === cat);

  return (
    <div className="container-x py-6">
      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-[#111] sm:text-2xl">
          {activeCat ? activeCat.name[lang] : t(lang, "all_categories")}
          <span className="ml-2 font-normal text-[#757575]">({filtered.length})</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setStockOnly((v) => !v)}
            className={"rounded-full border px-4 py-1.5 text-sm font-semibold transition " +
              (stockOnly ? "border-[#111] bg-[#111] text-white" : "border-[#cacacb] bg-white text-[#111] hover:border-[#111]")}>
            {t(lang, "in_stock")}
          </button>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); updateUrl(cat, e.target.value); }}
            placeholder={t(lang, "search_ph")}
            className="w-44 rounded-full bg-[#f5f5f5] px-4 py-1.5 text-sm outline-none transition focus:bg-[#e5e5e5] sm:w-64"
          />
        </div>
      </div>

      {/* category rail */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setCat(""); updateUrl("", q); }}
          className={"shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition " +
            (!cat ? "bg-[#111] text-white" : "bg-[#f5f5f5] text-[#111] hover:bg-[#e5e5e5]")}>
          {t(lang, "all_categories")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { const nc = cat === c.id ? "" : c.id; setCat(nc); updateUrl(nc, q); }}
            className={"shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition " +
              (cat === c.id ? "bg-[#111] text-white" : "bg-[#f5f5f5] text-[#111] hover:bg-[#e5e5e5]")}>
            {c.name[lang]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-[#757575]">{t(lang, "no_results")}</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.article} product={p} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
