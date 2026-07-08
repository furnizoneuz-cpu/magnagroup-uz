import { Suspense } from "react";
import CatalogView from "@/components/CatalogView";
import { getVisibleProducts as getProducts, getCategories } from "@/lib/data";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export default function CatalogPage({ params }) {
  const { lang } = params;
  const products = getProducts();
  const categories = getCategories();
  return (
    <div>
      <div className="border-b border-black/5 bg-sand">
        <div className="container-x py-8">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{t(lang, "nav_catalog")}</h1>
        </div>
      </div>
      <Suspense fallback={<div className="container-x py-10 text-black/40">…</div>}>
        <CatalogView lang={lang} products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
