import { getBrand } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata = { title: "Aloqa | Magna Group" };

export default function ContactPage({ params }) {
  const { lang } = params;
  const brand = getBrand();
  const L = (uz, ru, en) => (lang === "ru" ? ru : lang === "en" ? en : uz);
  const showrooms = brand.showrooms || (brand.showroom ? [brand.showroom] : []);

  return (
    <div className="container-x py-10">
      <h1 className="display-head mb-8 text-4xl text-[#111] md:text-5xl">{t(lang, "contact_title")}</h1>

      {/* quick contact strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="tile rounded-2xl p-6">
          <div className="text-sm font-bold text-[#111]">{t(lang, "phone_label")}</div>
          {brand.phones.map((p) => (
            <a key={p} href={`tel:${p.replace(/[^+\d]/g, "")}`} className="mt-1 block text-[15px] text-[#111] hover:underline">{p}</a>
          ))}
        </div>
        <div className="tile rounded-2xl p-6">
          <div className="text-sm font-bold text-[#111]">{t(lang, "email_label")}</div>
          <a href={`mailto:${brand.email}`} className="mt-1 block text-[15px] text-[#111] hover:underline">{brand.email}</a>
        </div>
        <div className="tile rounded-2xl p-6">
          <div className="text-sm font-bold text-[#111]">Social</div>
          <a href={`https://t.me/${brand.telegram}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[15px] text-[#111] hover:underline">Telegram</a>
          <a href={`https://instagram.com/${brand.instagram}`} target="_blank" rel="noopener noreferrer" className="block text-[15px] text-[#111] hover:underline">Instagram</a>
        </div>
      </div>

      {/* showrooms */}
      <h2 className="mb-4 mt-12 text-xl font-bold text-[#111]">
        {L("Ko'rgazma zallari", "Шоу-румы", "Showrooms")}
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {showrooms.map((s, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="p-6">
              <div className="text-sm font-bold uppercase tracking-wide text-[#111]">
                {s.label?.[lang] || L("Ko'rgazma zali", "Шоу-рум", "Showroom")}
              </div>
              <div className="mt-1 text-[15px] text-[#111]">{s.address[lang]}</div>
              {s.hours && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#757575]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>
                  {s.hours[lang]}
                </div>
              )}
              {s.contact && (
                <div className="mt-4 rounded-xl bg-[#f5f5f5] p-4">
                  <div className="text-sm font-bold text-[#111]">{s.contact.name}</div>
                  <div className="text-xs text-[#757575]">{s.contact.role?.[lang]}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={`tel:${s.contact.phone.replace(/[^+\d]/g, "")}`} className="btn-pill gap-2 !py-2 text-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6A2 2 0 0 1 22 16.9Z" strokeLinejoin="round"/></svg>
                      {s.contact.phone}
                    </a>
                    {s.contact.telegram && (
                      <a href={`https://t.me/${s.contact.telegram}`} target="_blank" rel="noopener noreferrer" className="btn-pill-outline gap-2 !py-2 text-sm">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M21.6 4.4 3.4 11.5c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.8 5.4c.2.6.4.8.9.8s.7-.2.9-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.7l3-13.9c.3-1.2-.4-1.7-1.2-1.3Z"/></svg>
                        @{s.contact.telegram}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {s.lat && s.lng && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                    target="_blank" rel="noopener noreferrer" className="btn-pill gap-2 !py-2.5 text-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M3 11l19-9-9 19-2-8-8-2Z" strokeLinejoin="round"/></svg>
                    {L("Yo'l ko'rsatish", "Построить маршрут", "Get directions")}
                  </a>
                  <a href={`https://yandex.com/maps/?rtext=~${s.lat},${s.lng}&rtt=auto`}
                    target="_blank" rel="noopener noreferrer" className="btn-pill-outline !py-2.5 text-sm">
                    Yandex
                  </a>
                </div>
              )}
            </div>
            {s.lat && s.lng && (
              <iframe title={`Magna Group showroom ${i + 1}`} className="h-64 w-full border-0" loading="lazy"
                src={`https://maps.google.com/maps?q=${s.lat},${s.lng}&z=16&output=embed`} />
            )}
          </div>
        ))}
      </div>

      {/* legal */}
      {brand.legal_name && (
        <div className="mt-12 rounded-2xl border border-black/10 bg-white p-6">
          <div className="mb-4 text-sm font-bold uppercase tracking-wide text-[#111]">
            {L("Rekvizitlar", "Реквизиты", "Company details")}
          </div>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {[
              [L("Tashkilot", "Организация", "Entity"), brand.legal_name],
              ["Direktor", brand.director],
              ["STIR", brand.stir],
              [L("QQS kodi", "Код НДС", "VAT code"), brand.qqs],
              ["IFUT", brand.ifut],
              [L("H/R", "Р/с", "Account"), brand.bank?.account],
              ["MFO", brand.bank?.mfo],
              [L("Bank", "Банк", "Bank"), brand.bank?.name],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-black/5 py-1.5">
                <dt className="text-black/50">{k}</dt>
                <dd className="text-right font-medium text-[#111]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
