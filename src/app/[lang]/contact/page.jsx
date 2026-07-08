import { getBrand } from "@/lib/data";
import { t } from "@/lib/i18n";

export default function ContactPage({ params }) {
  const { lang } = params;
  const brand = getBrand();
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-extrabold text-ink">{t(lang, "contact_title")}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-sand p-6">
          <div className="text-sm font-semibold text-gold-dark">{t(lang, "address_label")}</div>
          <div className="mt-1 text-ink">{brand.address[lang]}</div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-sand p-6">
          <div className="text-sm font-semibold text-gold-dark">{t(lang, "phone_label")}</div>
          {brand.phones.map((p) => (
            <div key={p}><a href={`tel:${p.replace(/[^+\d]/g, "")}`} className="text-ink hover:text-gold-dark">{p}</a></div>
          ))}
        </div>
        <div className="rounded-2xl border border-black/5 bg-sand p-6">
          <div className="text-sm font-semibold text-gold-dark">{t(lang, "email_label")}</div>
          <a href={`mailto:${brand.email}`} className="mt-1 block text-ink hover:text-gold-dark">{brand.email}</a>
        </div>
        <div className="rounded-2xl border border-black/5 bg-sand p-6">
          <div className="text-sm font-semibold text-gold-dark">Social</div>
          <a href={`https://t.me/${brand.telegram}`} className="mt-1 block text-ink hover:text-gold-dark">Telegram: @{brand.telegram}</a>
          <a href={`https://instagram.com/${brand.instagram}`} className="block text-ink hover:text-gold-dark">Instagram: @{brand.instagram}</a>
        </div>
      </div>

      {/* Yuridik rekvizitlar */}
      {brand.legal_name && (
        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
          <div className="mb-4 text-sm font-bold uppercase tracking-wide text-gold-dark">
            {lang === "ru" ? "Реквизиты" : lang === "en" ? "Company details" : "Rekvizitlar"}
          </div>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {[
              [lang === "ru" ? "Организация" : lang === "en" ? "Entity" : "Tashkilot", brand.legal_name],
              ["Direktor", brand.director],
              ["STIR", brand.stir],
              [lang === "ru" ? "Код НДС" : "QQS kodi", brand.qqs],
              ["IFUT", brand.ifut],
              [lang === "ru" ? "Р/с" : "H/R", brand.bank?.account],
              ["MFO", brand.bank?.mfo],
              [lang === "ru" ? "Банк" : "Bank", brand.bank?.name],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-black/5 py-1.5">
                <dt className="text-black/50">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
