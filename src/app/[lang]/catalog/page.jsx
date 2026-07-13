import { Suspense } from "react";
import CatalogView from "@/components/CatalogView";
import { getVisibleProducts as getProducts, getCategories } from "@/lib/data";
import { t } from "@/lib/i18n";

export const revalidate = 60;

const META = {
  uz: { title: "Katalog — Magna Group | Ofis, tibbiyot, ta'lim mebeli", description: "Magna Group to'liq mahsulot katalogi — ofis, konferensiya, tibbiyot, ta'lim va bolalar muassasalari uchun mebel." },
  ru: { title: "Каталог — Magna Group | Мебель для офиса, медицины, образования", description: "Полный каталог продукции Magna Group — мебель для офиса, конференций, медицины, образования и детских учреждений." },
  en: { title: "Catalog — Magna Group | Office, medical, education furniture", description: "Full Magna Group product catalog — furniture for offices, conference rooms, medical and educational institutions." },
};

export function generateMetadata({ params }) {
  return META[params.lang] || META.uz;
}

export default async function CatalogPage({ params }) {
  const { lang } = params;
  const products = await getProducts();
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
