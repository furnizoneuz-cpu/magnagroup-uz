import { t } from "@/lib/i18n";

const BODY = {
  uz: {
    d: ["Butun O'zbekiston bo'ylab yetkazib berish.", "Toshkent shahri bo'yicha o'lchov uchun mutaxassis chiqadi.", "Yig'ish va o'rnatish xizmati mavjud."],
    p: ["Naqd pul (yetkazishda).", "Bank o'tkazmasi (yuridik shaxslar uchun shartnoma bilan).", "Payme / Click / Uzum — onlayn to'lov ulanmoqda."],
  },
  ru: {
    d: ["Доставка по всему Узбекистану.", "По Ташкенту выезжает специалист для замера.", "Доступна сборка и установка."],
    p: ["Наличные (при доставке).", "Банковский перевод (для юрлиц по договору).", "Payme / Click / Uzum — онлайн-оплата подключается."],
  },
  en: {
    d: ["Delivery across Uzbekistan.", "In Tashkent a specialist comes for on-site measuring.", "Assembly and installation available."],
    p: ["Cash (on delivery).", "Bank transfer (for legal entities by contract).", "Payme / Click / Uzum — online payment is being connected."],
  },
};

export default function DeliveryPage({ params }) {
  const { lang } = params;
  const b = BODY[lang];
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">{t(lang, "delivery_title")}</h1>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold text-gold-dark">{t(lang, "nav_delivery")}</h2>
          <ul className="space-y-2 text-sm text-black/70">{b.d.map((x, i) => <li key={i}>• {x}</li>)}</ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-bold text-gold-dark">{t(lang, "co_payment")}</h2>
          <ul className="space-y-2 text-sm text-black/70">{b.p.map((x, i) => <li key={i}>• {x}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
