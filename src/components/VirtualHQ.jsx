"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

/*
  MAGNA GROUP — Digital Headquarters (cinematic scroll walkthrough).
  "The website is a film": one continuous camera move — the door opens, then the
  camera dollies forward through Lobby → Atrium → collection rooms → Sky Lounge.
  Engine: scroll progress drives per-scene opacity (long cross-dissolves) and a
  continuous forward zoom (Ken-Burns dolly). Imperative rAF writes = GPU-fast.
*/

const ROOMS = [
  { cat: "office", scene: "executive", name: { uz: "Executive Collection", ru: "Executive Collection", en: "Executive Collection" }, sub: { uz: "Rahbar mebeli", ru: "Мебель для руководителей", en: "Executive furniture" }, models: ["Paris", "Riyadh", "Chicago", "Venice", "Eternal"] },
  { cat: "staff", scene: "workspace", name: { uz: "Workspace Collection", ru: "Workspace Collection", en: "Workspace Collection" }, sub: { uz: "Xodimlar mebeli", ru: "Мебель для персонала", en: "Staff furniture" }, models: ["Milano", "Miami", "Mercedis", "New York", "Pittsburgh"] },
  { cat: "conference", scene: "meeting", name: { uz: "Meeting Collection", ru: "Meeting Collection", en: "Meeting Collection" }, sub: { uz: "Muzokara stollari", ru: "Переговорные столы", en: "Conference tables" }, models: ["Boardroom", "Conference"] },
  { cat: "storage", scene: "storage", name: { uz: "Storage Collection", ru: "Storage Collection", en: "Storage Collection" }, sub: { uz: "Shkaf, tumba, stellaj", ru: "Шкафы и стеллажи", en: "Cabinets & shelving" }, models: [] },
  { cat: "seating", scene: "seating", name: { uz: "Seating Collection", ru: "Seating Collection", en: "Seating Collection" }, sub: { uz: "Stullar va kreslolar", ru: "Стулья и кресла", en: "Chairs & armchairs" }, models: [] },
  { cat: "tables", scene: "workspace", name: { uz: "Desk Collection", ru: "Desk Collection", en: "Desk Collection" }, sub: { uz: "Ish stollari", ru: "Рабочие столы", en: "Work desks" }, models: [] },
  { cat: "medical", scene: "medical", name: { uz: "Medical Collection", ru: "Medical Collection", en: "Medical Collection" }, sub: { uz: "Tibbiy mebel", ru: "Медицинская мебель", en: "Medical furniture" }, models: [] },
  { cat: "student", scene: "student", name: { uz: "Education Collection", ru: "Education Collection", en: "Education Collection" }, sub: { uz: "O'quvchi mebeli", ru: "Ученическая мебель", en: "School furniture" }, models: [] },
  { cat: "children", scene: "children", name: { uz: "Kids Collection", ru: "Kids Collection", en: "Kids Collection" }, sub: { uz: "Bolalar mebeli", ru: "Детская мебель", en: "Children's furniture" }, models: [] },
];

const UI = {
  scroll: { uz: "Binoga kirish uchun pastga suring", ru: "Прокрутите вниз, чтобы войти", en: "Scroll to enter the building" },
  view: { uz: "Ko'rish", ru: "Смотреть", en: "View" },
  atrium: { uz: "Grand Atrium", ru: "Grand Atrium", en: "Grand Atrium" },
  atriumSub: { uz: "Binoning yuragi", ru: "Сердце здания", en: "The heart of the building" },
  sky: { uz: "Sky Lounge", ru: "Sky Lounge", en: "Sky Lounge" },
  enter: { uz: "Katalogga kirish", ru: "Войти в каталог", en: "Enter the catalog" },
  hq: { uz: "Digital Headquarters", ru: "Digital Headquarters", en: "Digital Headquarters" },
  begin: { uz: "Katalogdan boshlang", ru: "Начните с каталога", en: "Begin with the catalog" },
  philosophy: { uz: "Qarorlarni shakllantiruvchi makonlar", ru: "Пространства, формирующие решения", en: "Designing spaces that shape decisions" },
  lobbyPhil: { uz: "Bu yerda mahsulot emas — falsafa boshlanadi", ru: "Здесь начинается философия, а не товар", en: "Here begins philosophy, not product" },
  tagline: {
    uz: "Katta g'oyalar uchun keng yechimlar. Ofis, konferentsiya va xodimlar mebellari loyihalari.",
    ru: "Широкие решения для больших идей. Проекты офисной, конференц- и корпоративной мебели.",
    en: "Broad solutions for big ideas. Office, conference and staff furniture projects.",
  },
};

export default function VirtualHQ({ lang = "uz", counts = {} }) {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const doorL = useRef(null);
  const doorR = useRef(null);
  const doorWrap = useRef(null);
  const sceneRefs = useRef([]);
  const imgRefs = useRef([]);
  const hintRef = useRef(null);
  const railRef = useRef(null);

  // scene order: 0 arrival, 1 lobby, 2 atrium, 3..(rooms), last sky
  const BASE = 3 + ROOMS.length + 1;

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
      // door_open frame fades in over the closed door, then fades out into the reception,
      // with a gentle forward zoom = stepping through the doorway.
      const dOpen = ss(seg * 0.4, seg * 0.95, p);   // open-door frame fades in
      const dGone = ss(seg * 1.05, seg * 1.55, p);  // fades out into reception
      if (doorWrap.current) {
        doorWrap.current.style.opacity = String(clamp(dOpen * (1 - dGone)));
        doorWrap.current.style.transform = `scale(${1 + dOpen * 0.10})`;   // step forward
      }
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - ss(0, seg * 0.5, p) * 1.8));

      // Base scenes: long cross-dissolve + continuous forward dolly.
      for (let i = 0; i < BASE; i++) {
        const el = sceneRefs.current[i], img = imgRefs.current[i];
        if (!el) continue;
        const center = (i + 0.5) * seg;
        const d = Math.abs((p - center) / seg);
        // scene 0 (closed door) is full from the very start, fades out as the open door covers it.
        const op = i === 0 ? (1 - ss(seg * 0.5, seg * 0.95, p)) : (1 - ss(0.32, 0.8, d));
        el.style.opacity = String(clamp(op));
        el.style.pointerEvents = op > 0.6 ? "auto" : "none";
        if (img) {
          const lp = clamp((p - i * seg) / seg);          // 0..1 within this scene
          img.style.transform = `scale(${1.02 + lp * 0.10})`; // dolly forward
        }
      }
      if (railRef.current) railRef.current.style.setProperty("--rail", String(p));
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", render);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", render); if (raf) cancelAnimationFrame(raf); };
  }, [BASE]);

  // scene layer: image (dolly) + gradient + content (fades with layer)
  const Scene = ({ i, sceneName, children, overlay = "from-black/80 via-black/25 to-black/50", real = false }) => (
    <div ref={(el) => (sceneRefs.current[i] = el)} style={{ opacity: 0 }} className="absolute inset-0">
      <div ref={(el) => (imgRefs.current[i] = el)} className="absolute inset-0 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/scenes/${sceneName}.jpg`} alt="" className={"absolute inset-0 h-full w-full " + (real ? "bg-white object-contain md:object-cover" : "object-cover")} />
      </div>
      <div className={"absolute inset-0 bg-gradient-to-r " + overlay} />
      <div className="container-x relative flex h-full items-center">{children}</div>
    </div>
  );

  return (
    <section ref={rootRef} className="relative bg-black" style={{ height: `${BASE * 100}vh` }}>
      <div ref={wrapRef} className="sticky top-0 h-screen w-full overflow-hidden" style={{ perspective: "1400px" }}>

        {/* Scene 0: CLOSED DOOR — exact reference frame (MA · G · NA baked in) */}
        <Scene i={0} sceneName="door_closed" real overlay="from-transparent via-transparent to-transparent" />

        {/* Scene 1: RECEPTION — text-free reference look; MAGNA GROUP + tagline live (switch language) */}
        <Scene i={1} sceneName="lobby" real overlay="from-black/75 via-black/25 to-black/10">
          <div className="max-w-3xl text-white">
            <div className="font-head text-5xl font-extrabold drop-shadow-2xl md:text-7xl">MAGNA <span className="text-brand">GROUP</span></div>
            <div className="mt-4 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow-lg">{UI.tagline[lang]}</div>
          </div>
        </Scene>

        {/* Scene 2: ATRIUM */}
        <Scene i={2} sceneName="atrium" overlay="from-black/60 via-transparent to-black/40">
          <div className="w-full text-center text-white">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">{UI.atriumSub[lang]}</div>
            <div className="font-head text-5xl font-extrabold drop-shadow-lg md:text-7xl">{UI.atrium[lang]}</div>
          </div>
        </Scene>

        {/* Rooms */}
        {ROOMS.map((r, k) => (
          <Scene key={r.cat} i={3 + k} sceneName={r.scene}>
            <div className="max-w-xl text-white">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">{r.sub[lang]}</div>
              <div className="font-head text-4xl font-extrabold drop-shadow-lg md:text-6xl">{r.name[lang]}</div>
              {r.models.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.models.map((m) => <span key={m} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm text-white/85 backdrop-blur">{m}</span>)}
                </div>
              )}
              <div className="mt-6 flex items-center gap-4">
                <Link href={`/${lang}/catalog?cat=${r.cat}`} className="rounded-md bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brand-dark">{UI.view[lang]} →</Link>
                {counts[r.cat] ? <span className="text-sm text-white/55">{counts[r.cat]} model</span> : null}
              </div>
            </div>
          </Scene>
        ))}

        {/* Last: SKY LOUNGE */}
        <Scene i={BASE - 1} sceneName="skylounge" overlay="from-black/55 via-black/25 to-black/55">
          <div className="w-full text-center text-white">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-brand-light">{UI.sky[lang]}</div>
            <div className="font-head text-4xl font-extrabold drop-shadow-lg md:text-6xl">{UI.begin[lang]}</div>
            <Link href={`/${lang}/catalog`} className="mt-8 inline-block rounded-md bg-brand px-8 py-4 text-base font-bold text-white shadow-xl transition hover:scale-105 hover:bg-brand-dark">{UI.enter[lang]} →</Link>
          </div>
        </Scene>

        {/* THE OPEN DOOR — exact reference frame (doors swung open, reception visible);
            fades in over the closed door, then fades out into the reception scene. */}
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
