import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartFx from "@/components/CartFx";
import QuickContact from "@/components/QuickContact";
import { LANGS } from "@/lib/i18n";
import { getBrand, getCategories } from "@/lib/data";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default function LangLayout({ children, params }) {
  const { lang } = params;
  if (!LANGS.includes(lang)) notFound();
  const brand = getBrand();
  const categories = getCategories();
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} brand={brand} categories={categories} />
      <CartFx />
      <QuickContact lang={lang} phone={brand.phones[0]} telegram={brand.telegram} />
    </div>
  );
}
