import { t } from "@/lib/i18n";

const BODY = {
  uz: [
    "«Magna Group» — ofis, uy, bolalar bog'chalari, tibbiy va o'quv muassasalari uchun mebel ishlab chiqaruvchi kompaniya.",
    "Ishlab chiqarish sexlarimiz Germaniya, Italiya va Xitoy jihozlari bilan jihozlangan. Biznesimiz falsafasi uchta qadriyatga asoslanadi: aniqlik, sifat va tezkorlik.",
    "Biz mahsulotni kelishilgan muddatda ishlab chiqarish, yetkazib berish va yig'ib berishni kafolatlaymiz. Har bir mijoz — bizning do'stimiz.",
  ],
  ru: [
    "«Magna Group» — производитель мебели для офиса, дома, детских садов, медицинских и учебных заведений.",
    "Производственные цеха укомплектованы оборудованием из Германии, Италии и Китая. Философия нашего бизнеса основана на трёх ценностях: пунктуальность, качество и быстрота.",
    "Мы гарантируем изготовление, доставку и сборку в строго оговорённые сроки. Каждый клиент — наш друг.",
  ],
  en: [
    "Magna Group manufactures furniture for offices, homes, kindergartens, medical and educational institutions.",
    "Our production workshops are equipped with machinery from Germany, Italy and China. Our business philosophy rests on three values: punctuality, quality and speed.",
    "We guarantee manufacturing, delivery and assembly within strictly agreed deadlines. Every client is our friend.",
  ],
};

export default function AboutPage({ params }) {
  const { lang } = params;
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-6 text-3xl font-extrabold text-ink">{t(lang, "about_title")}</h1>
      <div className="space-y-4 text-black/70 leading-relaxed">
        {BODY[lang].map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
