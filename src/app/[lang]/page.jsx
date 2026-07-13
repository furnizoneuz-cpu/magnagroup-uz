import VirtualHQ from "@/components/VirtualHQ";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

const META = {
  uz: { title: "Magna Group — Ofis va muassasalar uchun mebel ishlab chiqarish", description: "Magna Group — ofis, konferensiya, tibbiyot, ta'lim va bolalar muassasalari uchun professional mebel ishlab chiqaruvchi. 200+ mahsulot." },
  ru: { title: "Magna Group — Производство мебели для офиса и учреждений", description: "Magna Group — производитель мебели для офиса, конференц-залов, медицинских, образовательных и детских учреждений. 200+ изделий." },
  en: { title: "Magna Group — Furniture manufacturing for offices & institutions", description: "Magna Group manufactures furniture for offices, conference rooms, medical, educational and childcare institutions. 200+ products." },
};

export function generateMetadata({ params }) {
  return META[params.lang] || META.uz;
}

export default function Home({ params }) {
  const { lang } = params;

  return (
    <div>
      <VirtualHQ lang={lang} />
      <section className="container-x py-16">
        <Reveal><LeadForm lang={lang} /></Reveal>
      </section>
    </div>
  );
}
