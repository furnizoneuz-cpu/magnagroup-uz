"use client";
import { useState } from "react";

/*
  Real showroom photo gallery — a horizontal scroll strip of actual showroom
  interior photos (from the Magna Group Telegram channel). Click opens a
  fullscreen lightbox. No motion, real photos only.
*/
export default function ShowroomGallery({ images = [], lang = "uz" }) {
  const [open, setOpen] = useState(-1);
  if (!images.length) return null;
  const title = { uz: "Bizning showroom", ru: "Наш шоу-рум", en: "Our showroom" }[lang] || "Showroom";

  return (
    <section className="container-x py-12">
      <h2 className="mb-5 text-xl font-bold text-[#111]">{title}</h2>
      <div className="no-scrollbar -mx-1.5 flex snap-x gap-3 overflow-x-auto px-1.5 pb-2">
        {images.map((src, i) => (
          <button key={src} onClick={() => setOpen(i)}
            className="relative aspect-[4/3] w-72 shrink-0 snap-start overflow-hidden rounded-xl bg-[#f6f6f6] sm:w-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
          </button>
        ))}
      </div>

      {open >= 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(-1)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[open]} alt="" className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain" />
          <button onClick={() => setOpen(-1)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
          {open > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }} className="absolute left-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
          {open < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }} className="absolute right-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
