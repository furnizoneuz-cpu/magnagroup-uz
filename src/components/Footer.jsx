import Link from "next/link";
import Logo from "@/components/Logo";
import { t } from "@/lib/i18n";

export default function Footer({ lang, brand, categories }) {
  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3">
            <Logo variant="light" markClass="h-9" />
          </div>
          <p className="text-sm leading-relaxed text-white/60">{t(lang, "brandTagline")}</p>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">{t(lang, "nav_catalog")}</div>
          <ul className="space-y-1.5 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/${lang}/catalog?cat=${c.id}`} className="text-white/60 hover:text-gold">{c.name[lang]}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">{t(lang, "nav_contact")}</div>
          <ul className="space-y-1.5 text-sm text-white/60">
            <li>{brand.address[lang]}</li>
            {brand.phones.map((p) => (
              <li key={p}><a href={`tel:${p.replace(/[^+\d]/g, "")}`} className="hover:text-gold">{p}</a></li>
            ))}
            <li><a href={`mailto:${brand.email}`} className="hover:text-gold">{brand.email}</a></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Social</div>
          <ul className="space-y-1.5 text-sm text-white/60">
            <li><a href={`https://t.me/${brand.telegram}`} className="hover:text-gold">Telegram: @{brand.telegram}</a></li>
            <li><a href={`https://instagram.com/${brand.instagram}`} className="hover:text-gold">Instagram: @{brand.instagram}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Magna Group. {t(lang, "footer_rights")}.
        </div>
      </div>
    </footer>
  );
}
