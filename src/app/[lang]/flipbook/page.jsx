"use client";
import { useState } from "react";
import { t } from "@/lib/i18n";

const PAGES = Array.from({ length: 64 }, (_, i) => `/catalog/p${String(i + 1).padStart(2, "0")}.jpg`);

export default function FlipbookPage({ params }) {
  const { lang } = params;
  const [open, setOpen] = useState(null);

  return (
    <div className="container-x py-10">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{t(lang, "flipbook_title")}</h1>
      <p className="mt-1 mb-8 text-black/55">{t(lang, "flipbook_sub")}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {PAGES.map((src, i) => (
          <button key={src} onClick={() => setOpen(i)}
            className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Katalog ${i + 1}`} loading="lazy" className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]" />
            <div className="py-1 text-center text-[11px] text-black/40">{i + 1}</div>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" onClick={() => setOpen(null)}>✕</button>
          {open > 0 && (
            <button className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white" onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }}>‹</button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PAGES[open]} alt={`Katalog ${open + 1}`} className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          {open < PAGES.length - 1 && (
            <button className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white" onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }}>›</button>
          )}
        </div>
      )}
    </div>
  );
}
