"use client";
import { useCart } from "@/components/CartProvider";
import { t } from "@/lib/i18n";
import { useState } from "react";

export default function AddToCartButton({ product, lang, full = false }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={(e) => {
        add(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
        try {
          window.dispatchEvent(
            new CustomEvent("magna:fly", { detail: { x: e.clientX, y: e.clientY } })
          );
        } catch {}
      }}
      className={
        (full ? "w-full " : "") +
        "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark active:scale-95"
      }
    >
      {added ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t(lang, "in_cart")}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="20" r="1.6" /><circle cx="18" cy="20" r="1.6" />
            <path d="M2 3h3l2.5 12h10L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t(lang, "add_to_cart")}
        </>
      )}
    </button>
  );
}
