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
      if (!needle) return true;
      const hay = [
        p.article,
        p.name.uz, p.name.ru, p.name.en,
        p.dimensions || "",
      ].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [products, cat, q]);

  return (
    <div className="container-x py-8">
      {/* search */}
      <div className="mb-5">
        <div className="relative max-w-xl">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); updateUrl(cat, e.target.value); }}
            placeholder={t(lang, "search_ph")}
            className="w-full rounded-full border border-black/10 bg-sand px-5 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setCat(""); updateUrl("", q); }}
          className={"rounded-full px-4 py-1.5 text-sm font-semibold transition " + (!cat ? "bg-ink text-white" : "bg-sand text-black/70 hover:bg-gold-light")}
        >
          {t(lang, "all_categories")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { const nc = cat === c.id ? "" : c.id; setCat(nc); updateUrl(nc, q); }}
            className={"rounded-full px-4 py-1.5 text-sm font-semibold transition " + (cat === c.id ? "bg-ink text-white" : "bg-sand text-black/70 hover:bg-gold-light")}
          >
            {c.name[lang]}
          </button>
        ))}
      </div>

      <div className="mb-4 text-sm text-black/50">
        {filtered.length} {t(lang, "catalog_count")}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 py-20 text-center text-black/40">
          {t(lang, "no_results")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard key={p.article} product={p} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
