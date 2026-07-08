"use client";
import { useEffect, useRef } from "react";

// Lightweight scroll-reveal wrapper (IntersectionObserver, GPU transforms only).
export default function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const d = delay ? ` d${delay}` : "";
  return (
    <Tag ref={ref} className={`reveal${d} ${className}`}>
      {children}
    </Tag>
  );
}
