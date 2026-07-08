"use client";
import { useState } from "react";

const T = {
  uz: { title: "Narxlar ro'yxatini oling", sub: "Ism va telefoningizni qoldiring — menejerimiz ulgurji narxlar bilan bog'lanadi.", name: "Ismingiz", phone: "Telefon raqami", send: "Yuborish", ok: "Rahmat! Tez orada bog'lanamiz.", err: "Ism va telefonni kiriting" },
  ru: { title: "Получите прайс-лист", sub: "Оставьте имя и телефон — менеджер свяжется с оптовыми ценами.", name: "Ваше имя", phone: "Номер телефона", send: "Отправить", ok: "Спасибо! Мы скоро свяжемся.", err: "Введите имя и телефон" },
  en: { title: "Get the price list", sub: "Leave your name and phone — our manager will reach out with wholesale prices.", name: "Your name", phone: "Phone number", send: "Send", ok: "Thank you! We'll contact you shortly.", err: "Enter name and phone" },
};

export default function LeadForm({ lang = "uz" }) {
  const t = T[lang] || T.uz;
  const [f, setF] = useState({ name: "", phone: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) { setErr(t.err); return; }
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if ((await r.json()).ok) setDone(true);
    } catch {}
    setBusy(false);
  }

  const inp = "w-full rounded-md border border-black/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand";

  return (
    <div className="grid items-center gap-8 rounded-2xl border border-black/5 bg-white p-8 shadow-sm lg:grid-cols-2 md:p-10">
      <div>
        <h2 className="text-2xl font-extrabold text-ink md:text-3xl">{t.title}</h2>
        <p className="mt-2 text-black/55">{t.sub}</p>
      </div>
      {done ? (
        <div className="flex items-center gap-3 rounded-xl bg-brand-light px-5 py-6 text-brand-dark">
          <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="font-semibold">{t.ok}</span>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className={inp} placeholder={t.name} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={inp} placeholder={t.phone + " — +998 __ ___ __ __"} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          {err && <div className="text-sm text-red-500">{err}</div>}
          <button disabled={busy} className="w-full rounded-md bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-50">
            {busy ? "..." : t.send}
          </button>
        </form>
      )}
    </div>
  );
}
