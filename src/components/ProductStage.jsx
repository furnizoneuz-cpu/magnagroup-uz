"use client";
import { useEffect, useRef } from "react";
import { CATEGORY_ACCENT } from "@/lib/format";

/*
  Scroll-driven cinematic product stage.
  As the user scrolls, the product (on an obsidian stage) scales up, mist drifts,
  and labeled "part" callouts fan out one-by-one — and, when an exploded image is
  provided, the assembled shot cross-fades into the exploded (parts-apart) shot.
  Smooth & fast: scroll → rAF → imperative style writes (no per-frame React state).
*/

// Positions around the product (used by index) — supports up to 8 callouts.
const POS = [
  { x: 19, y: 22 }, { x: 81, y: 27 }, { x: 15, y: 44 }, { x: 85, y: 49 },
  { x: 18, y: 66 }, { x: 82, y: 70 }, { x: 30, y: 85 }, { x: 70, y: 86 },
];

// Granular part / material breakdown per category (uz/ru/en).
const PARTS = {
  office: [
    { uz: "Ish yuzasi — LDSP 25mm", ru: "Столешница — ЛДСП 25мм", en: "Tabletop — 25mm board" },
    { uz: "Tortmali tumba", ru: "Тумба с ящиками", en: "Drawer pedestal" },
    { uz: "Metall karkas (po'lat)", ru: "Металлокаркас (сталь)", en: "Steel frame" },
    { uz: "ABS qirra 2mm", ru: "ABS-кромка 2мм", en: "2mm ABS edge" },
    { uz: "Blum furnitura", ru: "Фурнитура Blum", en: "Blum hardware" },
    { uz: "Kabel kanali", ru: "Кабель-канал", en: "Cable channel" },
    { uz: "Kukun bo'yoq", ru: "Порошковая окраска", en: "Powder coating" },
    { uz: "Pardoz laki", ru: "Лаковая отделка", en: "Lacquer finish" },
  ],
  staff: [
    { uz: "Ish stoli — LDSP", ru: "Рабочий стол — ЛДСП", en: "Work desk — board" },
    { uz: "To'siq panel", ru: "Перегородка", en: "Partition" },
    { uz: "Metall oyoq", ru: "Металлические опоры", en: "Metal legs" },
    { uz: "ABS qirra", ru: "ABS-кромка", en: "ABS edge" },
    { uz: "Ko'chma tumba", ru: "Мобильная тумба", en: "Mobile pedestal" },
    { uz: "Furnitura", ru: "Фурнитура", en: "Hardware" },
    { uz: "Kukun bo'yoq", ru: "Порошковая окраска", en: "Powder coating" },
  ],
  conference: [
    { uz: "Stol yuzasi — LDSP", ru: "Столешница — ЛДСП", en: "Table top — board" },
    { uz: "Massiv oyoq tirgak", ru: "Массивные опоры", en: "Solid supports" },
    { uz: "Metall poydevor", ru: "Металлическая база", en: "Metal base" },
    { uz: "ABS qirra 2mm", ru: "ABS-кромка 2мм", en: "2mm ABS edge" },
    { uz: "Kabel kanali", ru: "Кабель-канал", en: "Cable channel" },
    { uz: "Shpon / lak", ru: "Шпон / лак", en: "Veneer / lacquer" },
  ],
  storage: [
    { uz: "Eshiklar", ru: "Дверцы", en: "Doors" },
    { uz: "Kaleng shisha", ru: "Закалённое стекло", en: "Tempered glass" },
    { uz: "Rostlanadigan javonlar", ru: "Регулируемые полки", en: "Adjustable shelves" },
    { uz: "Korpus — LDSP 16mm", ru: "Корпус — ЛДСП 16мм", en: "Body — 16mm board" },
    { uz: "ABS qirra", ru: "ABS-кромка", en: "ABS edge" },
    { uz: "Metall dastalar", ru: "Металлические ручки", en: "Metal handles" },
    { uz: "Blum petlalari", ru: "Петли Blum", en: "Blum hinges" },
  ],
  tables: [
    { uz: "Ish yuzasi — LDSP", ru: "Столешница — ЛДСП", en: "Tabletop — board" },
    { uz: "Metall/LDSP oyoq", ru: "Опоры", en: "Legs" },
    { uz: "Tortma", ru: "Ящик", en: "Drawer" },
    { uz: "ABS qirra 2mm", ru: "ABS-кромка 2мм", en: "2mm ABS edge" },
    { uz: "Yo'naltirgichlar", ru: "Направляющие", en: "Slides" },
    { uz: "Pardoz laki", ru: "Лаковая отделка", en: "Lacquer finish" },
  ],
  seating: [
    { uz: "Suyanchiq", ru: "Спинка", en: "Backrest" },
    { uz: "Ekokoja / teri", ru: "Экокожа / кожа", en: "Eco-leather / leather" },
    { uz: "Yuqori zichlik gubka", ru: "Плотный поролон", en: "High-density foam" },
    { uz: "O'tirgich", ru: "Сиденье", en: "Seat" },
    { uz: "Tirsak tayanchi (yog'och)", ru: "Подлокотники (дерево)", en: "Wooden armrests" },
    { uz: "Xrom asos", ru: "Хромированная база", en: "Chrome base" },
    { uz: "Klass-4 gaz-lift", ru: "Газлифт класс-4", en: "Class-4 gas lift" },
    { uz: "Silliq g'ildiraklar", ru: "Ролики", en: "Smooth casters" },
  ],
  medical: [
    { uz: "Ish yuzasi", ru: "Рабочая поверхность", en: "Work surface" },
    { uz: "Zanglamas po'lat", ru: "Нержавеющая сталь", en: "Stainless steel" },
    { uz: "Antibakterial qoplama", ru: "Антибактериальное покрытие", en: "Antibacterial coating" },
    { uz: "Kukun bo'yoqli karkas", ru: "Окрашенный каркас", en: "Coated frame" },
    { uz: "Silliq g'ildiraklar", ru: "Колёса с фиксатором", en: "Locking wheels" },
    { uz: "Meditsina plastigi", ru: "Медицинский пластик", en: "Medical-grade plastic" },
  ],
  student: [
    { uz: "Parta yuzasi — LDSP", ru: "Столешница — ЛДСП", en: "Desktop — board" },
    { uz: "Ergonomik o'tirgich", ru: "Эргономичное сиденье", en: "Ergonomic seat" },
    { uz: "Po'lat karkas", ru: "Стальной каркас", en: "Steel frame" },
    { uz: "Kukun bo'yoq", ru: "Порошковая окраска", en: "Powder coating" },
    { uz: "Kitob javoni", ru: "Полка для книг", en: "Book shelf" },
    { uz: "Xavfsiz qirralar", ru: "Безопасные кромки", en: "Safe edges" },
  ],
  children: [
    { uz: "Korpus — E1 LDSP", ru: "Корпус — ЛДСП E1", en: "Body — E1 board" },
    { uz: "Ekologik xavfsiz", ru: "Экобезопасность", en: "Eco-safe" },
    { uz: "Javonlar", ru: "Полки", en: "Shelves" },
    { uz: "Yumaloq qirralar", ru: "Скруглённые кромки", en: "Rounded edges" },
    { uz: "Suvli bo'yoq", ru: "Краска на водной основе", en: "Water-based paint" },
    { uz: "Yorqin dekor", ru: "Яркий декор", en: "Bright decor" },
  ],
};

const HINT = {
  uz: "Suring — aylantirish uchun torting, zoom uchun g'ildirak",
  ru: "Листайте — тяните для вращения, колесо для зума",
  en: "Scroll — drag to rotate, wheel to zoom",
};

export default function ProductStage({ product, lang }) {
  const accent = "#0F4C81"; // brand blue — consistent B2B accent
  const parts = PARTS[product.category] || PARTS.office;
  const exploded = product.imageExploded || null;

  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const glareRef = useRef(null);
  const expRef = useRef(null);
  const mistRef = useRef(null);
  const hintRef = useRef(null);
  const barRef = useRef(null);
  const partRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    if (!root || !wrap) return;
    let raf = 0;

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, x) => {
      const t = clamp((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };

    // user interaction state: drag adds yaw/pitch, wheel/pinch zooms, all with inertia
    const ui = { yaw: 0, pitch: 0, zoom: 1, vyaw: 0, dragging: false, lx: 0, ly: 0, pinch: 0 };

    function render() {
      const total = root.offsetHeight - wrap.offsetHeight;
      const p = total > 0 ? clamp(-root.getBoundingClientRect().top / total) : 0;

      // 3D turntable: scroll sweeps the product through a perspective rotation,
      // and the visitor can grab it — drag to rotate, wheel/pinch to zoom.
      const yaw = clamp(-28 + p * 56 + ui.yaw, -75, 75);
      const pitch = clamp(6 - p * 9 + ui.pitch, -25, 25);
      const sc = (1 + smooth(0, 1, p) * 0.28) * ui.zoom;
      if (imgRef.current) {
        imgRef.current.style.transform =
          `perspective(1200px) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${sc})`;
        imgRef.current.style.opacity = exploded ? String(1 - smooth(0.25, 0.6, p)) : "1";
      }
      if (glareRef.current) {
        // moving highlight tracks the rotation → reads as real light on a turning object
        const gx = 50 - yaw * 1.4;
        glareRef.current.style.background =
          `linear-gradient(${105 + yaw}deg, transparent ${gx - 22}%, rgba(255,255,255,0.35) ${gx}%, transparent ${gx + 22}%)`;
      }
      if (expRef.current) {
        expRef.current.style.opacity = String(smooth(0.3, 0.65, p));
        expRef.current.style.transform = `perspective(1200px) rotateY(${yaw * 0.6}deg) scale(${1 + p * 0.12})`;
      }
      if (mistRef.current) {
        mistRef.current.style.opacity = String(0.35 + 0.5 * Math.sin(p * Math.PI));
        mistRef.current.style.transform = `translateX(${-50 + yaw * 0.9}%) scaleX(${1 + Math.abs(yaw) / 90})`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - p * 6));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      const start = 0.2, span = 0.075;
      partRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = smooth(start + i * span, start + i * span + 0.14, p);
        el.style.opacity = String(local);
        el.style.transform = `translateX(${(1 - local) * ((POS[i] || POS[0]).x < 50 ? -24 : 24)}px)`;
      });
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; render(); });
    }

    /* -------- grab / spin / zoom (mouse + touch), with inertia -------- */
    function onDown(e) {
      if (e.touches && e.touches.length === 2) {
        ui.pinch = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        return;
      }
      const t = e.touches ? e.touches[0] : e;
      ui.dragging = true; ui.vyaw = 0; ui.lx = t.clientX; ui.ly = t.clientY;
    }
    function onMove(e) {
      if (e.touches && e.touches.length === 2 && ui.pinch) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        ui.zoom = clamp(ui.zoom * (d / ui.pinch), 1, 3);
        ui.pinch = d; onScroll(); e.preventDefault();
        return;
      }
      if (!ui.dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - ui.lx, dy = t.clientY - ui.ly;
      ui.yaw += dx * 0.35; ui.vyaw = dx * 0.35;
      ui.pitch = clamp(ui.pitch - dy * 0.12, -25, 25);
      ui.lx = t.clientX; ui.ly = t.clientY;
      onScroll();
      if (e.cancelable) e.preventDefault();
    }
    function onUp() {
      ui.dragging = false; ui.pinch = 0;
      // inertia: the spin keeps gliding, slowly braking
      function glide() {
        if (ui.dragging || Math.abs(ui.vyaw) < 0.05) return;
        ui.yaw += ui.vyaw; ui.vyaw *= 0.94;
        render();
        requestAnimationFrame(glide);
      }
      glide();
    }
    function onWheel(e) {
      // zoom only while holding over the stage; keep page scroll natural otherwise
      if (ui.zoom === 1 && e.deltaY > 0) return;
      ui.zoom = clamp(ui.zoom - e.deltaY * 0.0016, 1, 3);
      onScroll();
      if (ui.zoom > 1) e.preventDefault();
    }
    function onDbl() { ui.yaw = 0; ui.pitch = 0; ui.zoom = 1; ui.vyaw = 0; onScroll(); }

    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", render);
    wrap.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    wrap.addEventListener("touchstart", onDown, { passive: true });
    wrap.addEventListener("touchmove", onMove, { passive: false });
    wrap.addEventListener("touchend", onUp);
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("dblclick", onDbl);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", render);
      wrap.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      wrap.removeEventListener("touchstart", onDown);
      wrap.removeEventListener("touchmove", onMove);
      wrap.removeEventListener("touchend", onUp);
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("dblclick", onDbl);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [exploded, parts]);

  return (
    <section ref={rootRef} className="relative" style={{ height: "300vh" }}>
      <div ref={wrapRef} className="sticky top-0 h-screen w-full cursor-grab overflow-hidden border-b border-black/5 active:cursor-grabbing"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f1f3f6 55%, #e7eaef 100%)", touchAction: "pan-y" }}>
        {/* soft top light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3" style={{ background: "radial-gradient(55% 70% at 50% 0%, rgba(255,255,255,0.9), transparent 70%)" }} />
        {/* soft floor shadow — shifts with the rotation */}
        <div ref={mistRef} className="pointer-events-none absolute bottom-[14%] left-1/2 h-8 w-[55%] rounded-[50%] blur-xl will-change-transform"
          style={{ background: "rgba(30,34,41,0.12)", transform: "translateX(-50%)" }} />

        {/* product images */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative h-[68vh] w-[68vh] max-w-[90vw]">
            {product.image ? (
              <div ref={imgRef} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name[lang]}
                  className="absolute inset-0 h-full w-full object-contain" />
                {/* rotating light sweep */}
                <div ref={glareRef} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
              </div>
            ) : (
              <div ref={imgRef} className="absolute inset-0 flex items-center justify-center will-change-transform">
                <svg viewBox="0 0 48 48" className="h-40 w-40 text-brand/50" fill="none" stroke="currentColor" strokeWidth="1.1">
                  <rect x="6" y="16" width="36" height="20" rx="2" /><path d="M6 22h36M10 36v5M38 36v5M14 16v-4h20v4" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {exploded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={expRef} src={exploded} alt="" style={{ opacity: 0 }}
                className="absolute inset-0 h-full w-full object-contain will-change-transform" />
            )}
          </div>
        </div>

        {/* part callouts */}
        {parts.map((pt, i) => {
          const pos = POS[i] || POS[0];
          return (
            <div key={i} ref={(el) => (partRefs.current[i] = el)}
              className="pointer-events-none absolute z-10 will-change-transform" style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0 }}>
              <div className={"flex items-center gap-2 " + (pos.x < 50 ? "" : "flex-row-reverse")}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: accent }}>{i + 1}</span>
                <span className="whitespace-nowrap rounded-lg border border-black/5 bg-white px-3 py-1.5 text-sm font-semibold text-ink shadow-sm">
                  {pt[lang]}
                </span>
              </div>
            </div>
          );
        })}

        {/* title + hint */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-6 md:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{product.article}</div>
          <h1 className="mt-2 max-w-xl text-3xl font-extrabold text-ink md:text-5xl">{product.name[lang]}</h1>
        </div>
        <div ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-ink/50">
          <span className="text-xs font-medium uppercase tracking-widest">{HINT[lang]}</span>
          <svg className="h-5 w-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {/* progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 origin-left" ref={barRef} style={{ background: accent, transform: "scaleX(0)" }} />
      </div>
    </section>
  );
}
