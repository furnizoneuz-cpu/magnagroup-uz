import { getVisibleProducts as getProducts, getCategories } from "@/lib/data";
import VirtualHQ from "@/components/VirtualHQ";
import Pavilions from "@/components/Pavilions";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export default function Home({ params }) {
  const { lang } = params;
  const categories = getCategories();
  const products = getProducts();
  const counts = Object.fromEntries(categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length]));

  return (
    <div>
      <VirtualHQ lang={lang} counts={counts} />
      <Pavilions lang={lang} />
      <section className="container-x py-16">
        <Reveal><LeadForm lang={lang} /></Reveal>
      </section>
    </div>
  );
}
