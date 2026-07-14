"use client";
import { useState } from "react";

/*
  Floating quick-contact: opens a panel listing BOTH showroom contacts.
  For each contact the visitor can Call, WhatsApp or Telegram that specific
  person at that showroom — so picking a channel routes to the chosen contact.
*/
const LABEL = {
  uz: { open: "Tezkor aloqa", call: "Qo'ng'iroq", wa: "WhatsApp", tg: "Telegram", pick: "Kim bilan bog'lanasiz?" },
  ru: { open: "Быстрая связь", call: "Звонок", wa: "WhatsApp", tg: "Telegram", pick: "С кем связаться?" },
  en: { open: "Quick contact", call: "Call", wa: "WhatsApp", tg: "Telegram", pick: "Who to contact?" },
};

export default function QuickContact({ lang = "uz", contacts = [] }) {
  const [open, setOpen] = useState(false);
  const l = LABEL[lang] || LABEL.uz;
  const list = contacts.filter((c) => c && c.phone);
  if (!list.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[19rem] rounded-2xl border border-black/10 bg-white p-3 shadow-2xl">
          <div className="px-1 pb-2 text-sm font-bold text-[#111]">{l.pick}</div>
          <div className="space-y-3">
            {list.map((c, i) => {
              const wa = (c.phone || "").replace(/[^\d]/g, "");
              const tel = (c.phone || "").replace(/[^+\d]/g, "");
              return (
                <div key={i} className="rounded-xl bg-[#f5f5f5] p-3">
                  <div className="text-sm font-bold text-[#111]">{c.name}</div>
                  <div className="text-xs text-[#757575]">{c.label?.[lang] || c.role?.[lang]}</div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <a href={`tel:${tel}`} className="flex flex-col items-center gap-1 rounded-lg bg-[#111] py-2 text-[11px] font-semibold text-white transition hover:bg-[#3a3a3a]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6A2 2 0 0 1 22 16.9Z" strokeLinejoin="round"/></svg>
                      {l.call}
                    </a>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-lg bg-[#25D366] py-2 text-[11px] font-semibold text-white transition hover:brightness-95">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M17.6 6.3A8.8 8.8 0 0 0 12 3.6 8.87 8.87 0 0 0 3.6 12a8.7 8.7 0 0 0 1.18 4.42L3.5 20.5l4.2-1.24A8.85 8.85 0 0 0 12 20.4a8.87 8.87 0 0 0 8.86-8.87 8.8 8.8 0 0 0-3.26-5.23Zm-5.57 13.6a7.36 7.36 0 0 1-3.75-1.03l-.27-.16-2.5.74.74-2.43-.18-.28a7.36 7.36 0 1 1 13.6-3.94 7.37 7.37 0 0 1-7.64 7.1Zm4-5.5c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.16-.48.05a6 6 0 0 1-1.78-1.1 6.7 6.7 0 0 1-1.23-1.54c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.4.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.4-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43c-.15 0-.4.06-.6.28-.2.22-.79.77-.79 1.87s.81 2.17.92 2.32c.11.15 1.6 2.44 3.87 3.42.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.07 1.3-.53 1.49-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26Z"/></svg>
                      {l.wa}
                    </a>
                    {c.telegram ? (
                      <a href={`https://t.me/${c.telegram}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-lg bg-[#229ED9] py-2 text-[11px] font-semibold text-white transition hover:brightness-95">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white"><path d="M21.6 4.4 3.4 11.5c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.8 5.4c.2.6.4.8.9.8s.7-.2.9-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.7l3-13.9c.3-1.2-.4-1.7-1.2-1.3Z"/></svg>
                        {l.tg}
                      </a>
                    ) : <span />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-label={l.open}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#111] text-white shadow-2xl transition hover:scale-105">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>
    </div>
  );
}
