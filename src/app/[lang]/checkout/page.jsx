"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";

export default function CheckoutPage({ params }) {
  const { lang } = params;
  const { items, total, hasPrices, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", comment: "", payment: "cash" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.phone.trim()) { setErr(t(lang, "required")); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: { ...form, lang }, items }),
      });
      const data = await res.json();
      if (data.ok) { setDone(data.number); clear(); }
      else setErr("Error");
    } catch { setErr("Error"); }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="container-x py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#111]">{t(lang, "co_success")}</h1>
        <p className="mt-2 text-black/55">{t(lang, "co_order_no")}: <b>{done}</b></p>
        <Link href={`/${lang}/catalog`} className="mt-6 inline-block rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3a3a3a]">
          {t(lang, "continue_shopping")}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center text-black/40">
        {t(lang, "cart_empty")}
        <div><Link href={`/${lang}/catalog`} className="mt-4 inline-block rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold text-white">{t(lang, "continue_shopping")}</Link></div>
      </div>
    );
  }

  const inp = "w-full rounded-lg border border-black/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#111]";

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-[#111] sm:text-3xl">{t(lang, "checkout_title")}</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={submit} className="space-y-4 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">{t(lang, "co_name")} *</label>
            <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">{t(lang, "co_phone")} *</label>
            <input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 __ ___ __ __" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">{t(lang, "co_address")}</label>
            <input className={inp} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">{t(lang, "co_comment")}</label>
            <textarea className={inp} rows={3} value={form.comment} onChange={(e) => set("comment", e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black/60">{t(lang, "co_payment")}</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "cash", label: t(lang, "co_pay_cash") },
                { id: "transfer", label: t(lang, "co_pay_transfer") },
                { id: "payme", label: "Payme" },
                { id: "click", label: "Click" },
                { id: "uzum", label: "Uzum" },
              ].map((p) => (
                <button type="button" key={p.id} onClick={() => set("payment", p.id)}
                  className={"rounded-lg border px-4 py-2 text-sm font-semibold transition " + (form.payment === p.id ? "border-[#111] bg-[#111] text-white" : "border-black/12 text-black/60 hover:border-[#111]")}>
                  {p.label}
                </button>
              ))}
            </div>
            {["payme", "click", "uzum"].includes(form.payment) && (
              <p className="mt-2 text-xs text-black/45">
                {lang === "ru" ? "Онлайн-оплата подключается — оператор свяжется для оплаты." :
                 lang === "en" ? "Online payment is being connected — an operator will contact you." :
                 "Onlayn to'lov ulanmoqda — operator to'lov uchun bog'lanadi."}
              </p>
            )}
          </div>
          {err && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{err}</div>}
          <button disabled={busy} className="w-full rounded-lg bg-[#111] px-6 py-3 text-sm font-bold text-white hover:bg-[#3a3a3a] disabled:opacity-50 sm:w-auto">
            {busy ? "..." : t(lang, "co_submit")}
          </button>
        </form>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/5 bg-[#f5f5f5] p-5">
            <div className="mb-3 text-sm font-bold text-[#111]">{t(lang, "cart_title")} · {items.length} {t(lang, "items")}</div>
            <div className="space-y-2 text-sm">
              {items.map((it) => (
                <div key={it.article} className="flex justify-between gap-2">
                  <span className="text-black/60">{it.name[lang]} × {it.qty}</span>
                  <span className="shrink-0 font-medium">{formatPrice(it.price, lang) || "—"}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-black/10 pt-3">
              <span className="font-semibold">{t(lang, "cart_total")}</span>
              <span className="font-extrabold text-[#111]">{hasPrices ? formatPrice(total, lang) : t(lang, "price_on_request")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
