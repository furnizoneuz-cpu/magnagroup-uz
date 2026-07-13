"use client";
import { useState } from "react";

/* Minimal accordion: thin top borders, plus/minus toggle, no animation flourishes. */
export default function Accordion({ items = [] }) {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="divide-y divide-black/10 border-y border-black/10">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(open ? -1 : i)}
              className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold text-[#111]">
              {it.title}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                className={"h-4 w-4 transition-transform " + (open ? "rotate-180" : "")}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && (
              <div className="whitespace-pre-line pb-4 text-[14px] leading-relaxed text-[#555]">{it.body}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
