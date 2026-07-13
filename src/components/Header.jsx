"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import LangSwitch from "@/components/LangSwitch";
import { t } from "@/lib/i18n";

export default function Header({ lang }) {
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function submitSearch(e) {
    e.preventDefault();
    router.push(`/${lang}/catalog?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  const nav = [
    { href: `/${lang}/catalog`, label: t(lang, "nav_catalog") },
    { href: `/${lang}/catalog?cat=office`, label: lang === "ru" ? "Кабинет" : lang === "en" ? "Executive" : "Rahbar" },
    { href: `/${lang}/catalog?cat=seating`, label: lang === "ru" ? "Кресла" : lang === "en" ? "Seating" : "Kreslolar" },
    { href: `/${lang}/catalog?cat=conference`, label: lang === "ru" ? "Переговорные" : lang === "en" ? "Conference" : "Muzokara" },
    { href: `/${lang}/about`, label: t(lang, "nav_about") },
    { href: `/${lang}/contact`, label: t(lang, "nav_contact") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* thin utility bar */}
      <div className="hidden bg-[#f5f5f5] md:block">
        <div className="container-x flex items-center justify-end gap-4 py-1.5 text-xs font-medium text-[#111]">
          <a href="tel:+998991725050" className="link-hover">+998 99 172 50 50</a>
          <span className="h-3 w-px bg-black/20" />
          <Link href={`/${lang}/delivery`} className="link-hover">{t(lang, "nav_delivery")}</Link>
          <span className="h-3 w-px bg-black/20" />
          <LangSwitch lang={lang} />
        </div>
      </div>

      {/* main bar */}
      <div className="container-x flex items-center gap-4 py-2.5">
        <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2.5" aria-label="Magna Group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="Magna Group" className="h-9 w-auto" />
          <span className="font-head text-xl font-extrabold lowercase leading-none tracking-tight">
            <span className="text-[#111]">magna</span>
            <span className="text-brand"> group</span>
          </span>
        </Link>

        {/* centered nav */}
        <nav className="mx-auto hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className="border-b-2 border-transparent pb-0.5 text-[15px] font-semibold text-[#111] transition hover:border-[#111]">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* search pill */}
          <form onSubmit={submitSearch} className="hidden items-center rounded-full bg-[#f5f5f5] transition focus-within:bg-[#e5e5e5] hover:bg-[#e5e5e5] lg:flex">
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#d8d8d8]" aria-label="search">
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
              </svg>
            </button>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "search_ph")}
              className="w-40 bg-transparent pr-4 text-sm outline-none placeholder:text-black/50" />
          </form>

          {/* cart */}
          <Link id="cart-btn" href={`/${lang}/cart`} aria-label="cart"
            className="relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#e5e5e5]">
            <svg className="h-[22px] w-[22px] text-[#111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" />
              <path d="M4.5 9h15l-1 11a1.8 1.8 0 0 1-1.8 1.6H7.3A1.8 1.8 0 0 1 5.5 20l-1-11Z" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#111] px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {/* mobile menu */}
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#e5e5e5] md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white md:hidden">
          <form onSubmit={submitSearch} className="p-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "search_ph")}
              className="w-full rounded-full bg-[#f5f5f5] px-4 py-2.5 text-sm outline-none" />
          </form>
          <div className="flex flex-col px-3 pb-4">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="border-b border-black/5 py-3 text-base font-semibold">
                {n.label}
              </Link>
            ))}
            <div className="pt-3"><LangSwitch lang={lang} /></div>
          </div>
        </div>
      )}
    </header>
  );
}
