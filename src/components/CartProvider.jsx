"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext(null);
const KEY = "magna_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.article === product.article);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [
        ...prev,
        {
          article: product.article,
          name: product.name,
          price: product.price ?? null,
          image: product.image ?? null,
          category: product.category,
          qty,
        },
      ];
    });
  }, []);

  const setQty = useCallback((article, qty) => {
    setItems((prev) =>
      prev
        .map((x) => (x.article === article ? { ...x, qty: Math.max(1, qty) } : x))
        .filter((x) => x.qty > 0)
    );
  }, []);

  const remove = useCallback((article) => {
    setItems((prev) => prev.filter((x) => x.article !== article));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = items.reduce((s, x) => s + (Number(x.price) || 0) * x.qty, 0);
  const hasPrices = items.some((x) => Number(x.price) > 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total, hasPrices, ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
