"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

/*
  MAGNA GROUP — entrance sequence (scroll-driven).
  Closed door → doors swing open → reception with the MAGNA GROUP wall + tagline.
  Engine: scroll progress drives per-scene opacity (cross-dissolve) and a gentle
  forward dolly. Imperative rAF writes = GPU-fast.
*/

const UI = {
  scroll: { uz: "Binoga kirish uchun pastga suring", ru: "Прокрутите вниз, чтобы войти", en: "Scroll to enter the building" },
  enter: { uz: "Katalogga kirish", ru: "Войти в каталог", en: "Enter the catalog" },
  tagline: {
    uz: "Katta g'oyalar uchun keng yechimlar. Ofis, konferentsiya va xodimlar mebellari loyihalari.",
    ru: "Широкие решения для больших идей. Проекты офисной, конференц- и корпоративной мебели.",
    en: "Broad solutions for big ideas. Office, conference and staff furniture projects.",
  },
};

const BASE = 2; // 0 = closed door, 1 = reception

export default function VirtualHQ({ lang = "uz" }) {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const doorWrap = useRef(null);
  const sceneRefs = useRef([]);
  const imgRefs = useRef([]);
  const hintRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current, wrap = wrapRef.current;
    if (!root) return;
    let raf = 0;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

    function render() {
      const total = root.offsetHeight - wrap.offsetHeight;
      const p = total > 0 ? clamp(-root.getBoundingClientRect().top / total) : 0;
      const seg = 1 / BASE;

      // Entrance sequence (exact reference frames): closed door → open door → reception.
      const dOpen = ss(seg * 0.4, seg * 0.95, p);
      const dGone = ss(seg * 1.05, seg * 1.55, p);
      if (doorWrap.current) {
        doorWrap.current.style.opacity = String(clamp(dOpen * (1 - dGone)));
        doorWrap.current.style.transform = `scale(${1 + dOpen * 0.10})`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - ss(0, seg * 0.5, p) * 1.8));

      for (let i = 0; i < BASE; i++) {
        const el = sceneRefs.current[i], img = imgRefs.current[i];
        if (!el) continue;
        const center = (i + 0.5) * seg;
        const d = Math.abs((p - center) / seg);
        const op = i === 0 ? (1 - ss(seg * 0.5, seg * 0.95, p)) : (1 - ss(0.32, 0.8, d));
        el.style.opacity = String(clamp(op));
        el.style.pointerEvents = op > 0.6 ? "auto" : "none";
        if (img) {
          const lp = clamp((p - i * seg) / seg);
          img.style.transform = `scale(${1.02 + lp * 0.10})`;
        }
      }
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", render);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", render); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const Scene = ({ i, sceneName, children, overlay = "from-black/80 via-black/25 to-black/50" }) => (
    <div ref={(el) => (sceneRefs.current[i] = el)} style={{ opacity: 0 }} className="absolute inset-0">
      <div ref={(el) => (imgRefs.current[i] = el)} className="absolute inset-0 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/scenes/${sceneName}.jpg`} alt="" className="absolute inset-0 h-full w-full bg-white object-contain md:object-cover" />
      </div>
      <div className={"absolute inset-0 bg-gradient-to-r " + overlay} />
      <div className="container-x relative flex h-full items-center">{children}</div>
    </div>
  );

  return (
    <section ref={rootRef} className="relative bg-black" style={{ height: `${BASE * 100}vh` }}>
      <div ref={wrapRef} className="sticky top-0 h-screen w-full overflow-hidden" style={{ perspective: "1400px" }}>

        {/* Scene 0: CLOSED DOOR */}
        <Scene i={0} sceneName="door_closed" overlay="from-transparent via-transparent to-transparent" />

        {/* Scene 1: RECEPTION — MAGNA GROUP + tagline (switches with language) + CTA */}
        <Scene i={1} sceneName="lobby" overlay="from-black/75 via-black/25 to-black/10">
          <div className="max-w-3xl text-white">
            <div className="font-head text-5xl font-extrabold drop-shadow-2xl md:text-7xl">MAGNA <span className="text-brand">GROUP</span></div>
            <div className="mt-4 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow-lg">{UI.tagline[lang]}</div>
            <Link href={`/${lang}/catalog`} className="mt-8 inline-block rounded-md bg-brand px-8 py-4 text-base font-bold text-white shadow-xl transition hover:scale-105 hover:bg-brand-dark">{UI.enter[lang]} →</Link>
          </div>
        </Scene>

        {/* THE OPEN DOOR — fades in over the closed door, then fades out into the reception. */}
        <div ref={doorWrap} className="absolute inset-0 z-20 will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/scenes/door_open.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        {/* cinematic letterbox + vignette */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[4vh] bg-black" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[4vh] bg-black" />
        <div className="pointer-events-none absolute inset-0 z-20" style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.55)" }} />

        {/* scroll hint */}
        <div ref={hintRef} className="absolute inset-x-0 bottom-[7vh] z-30 flex flex-col items-center gap-2 text-white/85">
          <span className="text-xs font-medium uppercase tracking-widest">{UI.scroll[lang]}</span>
          <svg className="h-5 w-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </section>
  );
}
