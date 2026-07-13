import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Footer({ lang, brand, categories }) {
  const L = (uz, ru, en) => (lang === "ru" ? ru : lang === "en" ? en : uz);

  return (
    <footer className="mt-20 border-t border-black/10 bg-white text-[#111]">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 text-sm font-bold uppercase tracking-wide">{t(lang, "nav_catalog")}</div>
          <ul className="space-y-2.5 text-sm text-[#757575]">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/${lang}/catalog?cat=${c.id}`} className="transition hover:text-[#111]">{c.name[lang]}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-sm font-bold uppercase tracking-wide">{L("Yordam", "Помощь", "Help")}</div>
          <ul className="space-y-2.5 text-sm text-[#757575]">
            <li><Link href={`/${lang}/delivery`} className="transition hover:text-[#111]">{t(lang, "nav_delivery")}</Link></li>
            <li><Link href={`/${lang}/about`} className="transition hover:text-[#111]">{t(lang, "nav_about")}</Link></li>
            <li><Link href={`/${lang}/contact`} className="transition hover:text-[#111]">{t(lang, "nav_contact")}</Link></li>
            <li><Link href={`/${lang}/flipbook`} className="transition hover:text-[#111]">{t(lang, "nav_flipbook")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-4 text-sm font-bold uppercase tracking-wide">{t(lang, "nav_contact")}</div>
          <ul className="space-y-2.5 text-sm text-[#757575]">
            <li>{(brand.showroom?.address[lang]) || brand.address[lang]}</li>
            {brand.phones.map((p) => (
              <li key={p}><a href={`tel:${p.replace(/[^+\d]/g, "")}`} className="transition hover:text-[#111]">{p}</a></li>
            ))}
            <li><a href={`mailto:${brand.email}`} className="transition hover:text-[#111]">{brand.email}</a></li>
          </ul>
        </div>

        <div>
          <div className="mb-4 text-sm font-bold uppercase tracking-wide">Social</div>
          <ul className="space-y-2.5 text-sm text-[#757575]">
            <li><a href={`https://t.me/${brand.telegram}`} className="transition hover:text-[#111]">Telegram</a></li>
            <li><a href={`https://instagram.com/${brand.instagram}`} className="transition hover:text-[#111]">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/10">
        <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2 py-5 text-xs text-[#757575]">
          <span className="inline-flex items-center gap-2 font-semibold text-[#111]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" className="h-5 w-auto" />
            © {new Date().getFullYear()} {brand.legal_name || "Magna Group"}
          </span>
          <span>{t(lang, "footer_rights")}</span>
          <span className="ml-auto">{L("O'zbekiston", "Узбекистан", "Uzbekistan")}</span>
        </div>
      </div>
    </footer>
  );
}
