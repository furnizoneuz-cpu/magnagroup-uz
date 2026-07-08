"use client";
import { useEffect, useState, useRef } from "react";

const KEY = "magna_gift_v1";

const PRIZES = [
  { label: { uz: "-5%", ru: "-5%", en: "-5%" }, code: "MAGNA5", color: "#c6a15b" },
  { label: { uz: "-10%", ru: "-10%", en: "-10%" }, code: "MAGNA10", color: "#14130f" },
  { label: { uz: "Bepul\nyetkazish", ru: "Беспл.\nдоставка", en: "Free\ndelivery" }, code: "FREEDELIVERY", color: "#4e8a8f" },
  { label: { uz: "-7%", ru: "-7%", en: "-7%" }, code: "MAGNA7", color: "#a9843d" },
  { label: { uz: "-15%", ru: "-15%", en: "-15%" }, code: "MAGNA15", color: "#b07c3a" },
  { label: { uz: "Sovg'a\n🎁", ru: "Подарок\n🎁", en: "Gift\n🎁" }, code: "MAGNAGIFT", color: "#c56b4a" },
  { label: { uz: "-12%", ru: "-12%", en: "-12%" }, code: "MAGNA12", color: "#5f6e86" },
  { label: { uz: "-20%", ru: "-20%", en: "-20%" }, code: "MAGNA20", color: "#7a6a55" },
];

const TXT = {
  uz: { open: "Sovg'a", title: "Omadingizni sinang!", spin: "Aylantirish", won: "Siz yutdingiz:", promo: "Promo-kod", copy: "Nusxa olish", copied: "Nusxa olindi!", use: "Buyurtmada shu kodni ayting", close: "Yopish" },
  ru: { open: "Подарок", title: "Испытайте удачу!", spin: "Крутить", won: "Вы выиграли:", promo: "Промокод", copy: "Копировать", copied: "Скопировано!", use: "Назовите этот код при заказе", close: "Закрыть" },
  en: { open: "Gift", title: "Try your luck!", spin: "Spin", won: "You won:", promo: "Promo code", copy: "Copy", copied: "Copied!", use: "Mention this code with your order", close: "Close" },
};

export default function GiftWheel({ lang = "uz" }) {
  const t = TXT[lang] || TXT.uz;
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setResult(JSON.parse(saved));
    } catch {}
  }, []);

  const seg = 360 / PRIZES.length;
  const gradient = PRIZES.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(", ");

  function spin() {
    if (spinning || result) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * PRIZES.length);
    const turns = 5;
    // pointer at top (0deg). land center of idx under pointer.
    const target = turns * 360 + (360 - (idx * seg + seg / 2));
    setAngle(target);
    setTimeout(() => {
      const prize = PRIZES[idx];
      const won = { label: prize.label[lang], code: prize.code };
      setResult(won);
      try { localStorage.setItem(KEY, JSON.stringify(won)); } catch {}
      setSpinning(false);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2600);
    }, 4200);
  }

  function copy() {
    try { navigator.clipboard.writeText(result.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-gold-dark px-4 py-3 text-sm font-bold text-white shadow-lg shadow-gold/40 transition hover:scale-105 active:scale-95 floaty"
        aria-label={t.open}
      >
        <span className="text-lg">🎁</span>
        <span className="hidden sm:inline">{t.open}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="pop relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-4 top-4 text-black/30 hover:text-black" onClick={() => setOpen(false)}>✕</button>
            <h3 className="text-xl font-extrabold text-ink">{t.title}</h3>

            <div className="relative mx-auto my-6 h-64 w-64">
              {/* pointer */}
              <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
                <div style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "20px solid #14130f" }} />
              </div>
              {/* wheel */}
              <div
                ref={wheelRef}
                className="h-64 w-64 rounded-full border-8 border-ink shadow-xl"
                style={{
                  background: `conic-gradient(${gradient})`,
                  transform: `rotate(${angle}deg)`,
                  transition: spinning ? "transform 4s cubic-bezier(0.12,0.7,0.12,1)" : "none",
                }}
              >
                {PRIZES.map((p, i) => (
                  <div key={i} className="absolute left-1/2 top-1/2 origin-left text-[11px] font-bold leading-tight text-white"
                    style={{ transform: `rotate(${i * seg + seg / 2}deg) translateX(38px)`, whiteSpace: "pre" }}>
                    {p.label[lang]}
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-white" />
            </div>

            {result ? (
              <div className="pop">
                <div className="text-sm text-black/50">{t.won}</div>
                <div className="my-1 text-2xl font-extrabold text-gold-dark">{result.label}</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <code className="rounded-lg bg-sand px-4 py-2 font-mono text-lg font-bold tracking-wider text-ink">{result.code}</code>
                  <button onClick={copy} className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-gold-dark">
                    {copied ? t.copied : t.copy}
                  </button>
                </div>
                <p className="mt-3 text-xs text-black/45">{t.use}</p>
              </div>
            ) : (
              <button onClick={spin} disabled={spinning}
                className="w-full rounded-xl bg-ink px-6 py-3.5 text-base font-bold text-white transition hover:bg-gold-dark disabled:opacity-60">
                {spinning ? "…" : t.spin}
              </button>
            )}
          </div>

          {confetti && (
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
              {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} className="absolute block h-2.5 w-2.5"
                  style={{
                    left: Math.random() * 100 + "%",
                    top: "-5vh",
                    background: PRIZES[i % PRIZES.length].color,
                    borderRadius: i % 2 ? "50%" : "2px",
                    animation: `confetti-fall ${2 + Math.random() * 1.6}s linear ${Math.random() * 0.6}s forwards`,
                  }} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
