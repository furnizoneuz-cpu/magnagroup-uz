"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";
import { t } from "@/lib/i18n";

export default function Header({ lang }) {
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function submitSearch(e) {
    e.preventDefault();
    router.push(`/${lang}/catalog?q=${encodeURIComponent(q)}`);
  }

  const nav = [
    { href: `/${lang}`, label: t(lang, "nav_home") },
    { href: `/${lang}/catalog`, label: t(lang, "nav_catalog") },
    { href: `/${lang}/flipbook`, label: t(lang, "nav_flipbook") },
    { href: `/${lang}/about`, label: t(lang, "nav_about") },
    { href: `/${lang}/delivery`, label: t(lang, "nav_delivery") },
    { href: `/${lang}/contact`, label: t(lang, "nav_contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="container-x flex items-center gap-4 py-3">
        <Link href={`/${lang}`} className="flex shrink-0 items-center">
          <Logo variant="dark" markClass="h-9" />
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(lang, "search_ph")}
              className="w-full rounded-full border border-black/10 bg-sand px-5 py-2.5 pr-11 text-sm outline-none focus:border-gold"
            />
            <button className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-white" aria-label="search">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <LangSwitch lang={lang} />
          <Link id="cart-btn" href={`/${lang}/cart`} className="relative grid h-10 w-10 place-items-center rounded-lg bg-sand hover:bg-gold-light">
            <svg className="h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="20" r="1.6" /><circle cx="18" cy="20" r="1.6" />
              <path d="M2 3h3l2.5 12h10L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-gold-dark px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-lg bg-sand md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-black/5 md:block">
        <div className="container-x flex gap-6 py-2 text-sm font-medium text-black/70">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-gold-dark">{n.label}</Link>
          ))}
        </div>
      </nav>

      {open && (
        <div className="border-t border-black/5 md:hidden">
          <form onSubmit={submitSearch} className="p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(lang, "search_ph")}
              className="w-full rounded-full border border-black/10 bg-sand px-4 py-2 text-sm outline-none focus:border-gold"
            />
          </form>
          <div className="flex flex-col gap-1 px-3 pb-3 text-sm font-medium">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-2 py-2 hover:bg-sand" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
