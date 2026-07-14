"use client";
import { useEffect, useRef, useState } from "react";

/*
  Magna AI — saytga o'rnatilgan AI-maslahatchi (chap-pastdagi tugma).
  Kompaniya va katalogni to'liq biladi (server /api/ai kontekst beradi):
  mahsulot tanlash, mavjudlik, buyurtma tartibi, showroom ma'lumotlari.
*/
const T = {
  uz: { title: "Magna AI", hello: "Salom! Men Magna AI — mahsulot tanlash, narx so'rovi va buyurtma bo'yicha yordam beraman. Nima izlayapsiz?", ph: "Savolingizni yozing…", err: "Xatolik — qayta urinib ko'ring" },
  ru: { title: "Magna AI", hello: "Здравствуйте! Я Magna AI — помогу выбрать мебель, узнать наличие и оформить заказ. Что вы ищете?", ph: "Напишите вопрос…", err: "Ошибка — попробуйте ещё раз" },
  en: { title: "Magna AI", hello: "Hi! I'm Magna AI — I can help you choose furniture, check availability and place an order. What are you looking for?", ph: "Type your question…", err: "Error — please try again" },
};

export default function MagnaAI({ lang = "uz" }) {
  const t = T[lang] || T.uz;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ role: "ai", text: t.hello }]);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m.text !== t.hello), lang }),
      });
      const d = await r.json();
      setMsgs((m) => [...m, { role: "ai", text: d.ok ? d.reply : t.err }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: t.err }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl sm:w-[22rem]">
          <div className="flex items-center gap-2 bg-[#111] px-4 py-3 text-white">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#22A836] text-[11px] font-black">AI</span>
            <span className="text-sm font-bold">{t.title}</span>
            <button onClick={() => setOpen(false)} className="ml-auto grid h-7 w-7 place-items-center rounded-full hover:bg-white/15" aria-label="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div ref={boxRef} className="flex-1 space-y-2.5 overflow-y-auto bg-[#fafafa] p-3">
            {msgs.map((m, i) => (
              <div key={i} className={"max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed " +
                (m.role === "ai" ? "bg-white text-[#111] shadow-sm" : "ml-auto bg-[#12801F] text-white")}>
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="w-14 rounded-2xl bg-white px-3.5 py-2 shadow-sm">
                <span className="inline-flex gap-1">
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:120ms]" />
                  <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:240ms]" />
                </span>
              </div>
            )}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-black/10 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.ph}
              className="w-full rounded-full bg-[#f0f0f0] px-4 py-2 text-sm outline-none" />
            <button disabled={busy || !input.trim()} aria-label="send"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#12801F] text-white disabled:opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 11l19-9-9 19-2-8-8-2Z" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-label="Magna AI"
        className="flex h-14 items-center gap-2 rounded-full bg-[#111] pl-3 pr-5 text-white shadow-2xl transition hover:scale-105">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#22A836] text-xs font-black">AI</span>
        <span className="text-sm font-bold">Magna AI</span>
      </button>
    </div>
  );
}
