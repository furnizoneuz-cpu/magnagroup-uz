"use client";
import { useEffect, useRef, useState } from "react";

const LABEL = {
  uz: "Katta ko'rish",
  ru: "Увеличить",
  en: "Inspect",
};

/*
  Fullscreen detail inspector: opens the full-resolution photo in an overlay —
  wheel/pinch zoom up to 5x, drag to pan, double-click toggles 1x/3x, Esc closes.
  With the upscaled (~2800px) photos this gives pixel-free close inspection of
  edges, stitching and finishes.
*/
export default function ProductZoom({ src, alt = "", lang = "uz" }) {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const st = useRef({ dragging: false, lx: 0, ly: 0, pinch: 0 });

  useEffect(() => {
    if (!open) return;
    function key(e) { if (e.key === "Escape") setOpen(false); }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!src) return null;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function wheel(e) {
    e.preventDefault();
    setT((p) => {
      const s = clamp(p.s - e.deltaY * 0.002, 1, 5);
      return s === 1 ? { s: 1, x: 0, y: 0 } : { ...p, s };
    });
  }
  function down(e) {
    const s = st.current;
    if (e.touches && e.touches.length === 2) {
      s.pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      return;
    }
    const p = e.touches ? e.touches[0] : e;
    s.dragging = true; s.lx = p.clientX; s.ly = p.clientY;
  }
  function move(e) {
    const s = st.current;
    if (e.touches && e.touches.length === 2 && s.pinch) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setT((p) => ({ ...p, s: clamp(p.s * (d / s.pinch), 1, 5) }));
      s.pinch = d;
      e.preventDefault();
      return;
    }
    if (!s.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    setT((prev) => ({ ...prev, x: prev.x + (p.clientX - s.lx), y: prev.y + (p.clientY - s.ly) }));
    s.lx = p.clientX; s.ly = p.clientY;
    if (e.cancelable) e.preventDefault();
  }
  function up() { st.current.dragging = false; st.current.pinch = 0; }
  function dbl() { setT((p) => (p.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 3, x: 0, y: 0 })); }

  return (
    <>
      <button onClick={() => { setT({ s: 1, x: 0, y: 0 }); setOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-gold">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4M11 8v6M8 11h6" strokeLinecap="round" />
        </svg>
        {LABEL[lang] || LABEL.uz} · 5x
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90"
          onWheel={wheel} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up} onDoubleClick={dbl}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} draggable={false}
            className="h-full w-full cursor-grab select-none object-contain active:cursor-grabbing"
            style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: st.current.dragging ? "none" : "transform 120ms ease-out" }} />
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {Math.round(t.s * 100)}% · {lang === "ru" ? "колесо — зум, тяните — панорама" : lang === "en" ? "wheel to zoom, drag to pan" : "g'ildirak — zoom, torting — surish"}
          </div>
          <button onClick={() => setOpen(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
