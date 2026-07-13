"use client";
import { useEffect, useRef, useState } from "react";

/*
  360° sprite spin — rotates through a sequence of real photos (e.g. 36 frames
  shot on a turntable in the showroom). Drag to spin (with inertia), works with
  touch. No AI, no 3D engine — just real photos, which reads as the most honest
  "hold it in your hands" experience.
  Usage: <Spin360 frames={["/products/spin/GA91/01.webp", ...]} alt="..." />
*/
export default function Spin360({ frames = [], alt = "", className = "" }) {
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const st = useRef({ dragging: false, lx: 0, acc: 0, v: 0, raf: 0 });

  // preload all frames once
  useEffect(() => {
    let loaded = 0;
    frames.forEach((src) => {
      const im = new Image();
      im.onload = im.onerror = () => {
        loaded += 1;
        if (loaded === frames.length) setReady(true);
      };
      im.src = src;
    });
  }, [frames]);

  useEffect(() => {
    const s = st.current;
    function step(d) {
      // ~6px of drag per frame step
      s.acc += d;
      const n = Math.trunc(s.acc / 6);
      if (n !== 0) {
        s.acc -= n * 6;
        setIdx((i) => (((i + n) % frames.length) + frames.length) % frames.length);
      }
    }
    function down(e) {
      const t = e.touches ? e.touches[0] : e;
      s.dragging = true; s.lx = t.clientX; s.v = 0;
      if (s.raf) cancelAnimationFrame(s.raf);
    }
    function move(e) {
      if (!s.dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - s.lx;
      s.lx = t.clientX; s.v = dx;
      step(dx);
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      if (!s.dragging) return;
      s.dragging = false;
      const glide = () => {
        if (s.dragging || Math.abs(s.v) < 0.3) return;
        step(s.v);
        s.v *= 0.93;
        s.raf = requestAnimationFrame(glide);
      };
      glide();
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    const el = document.getElementById("spin360-surface");
    el?.addEventListener("mousedown", down);
    el?.addEventListener("touchstart", down, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      el?.removeEventListener("mousedown", down);
      el?.removeEventListener("touchstart", down);
      if (s.raf) cancelAnimationFrame(s.raf);
    };
  }, [frames.length]);

  if (!frames.length) return null;
  return (
    <div id="spin360-surface" className={"relative cursor-grab select-none active:cursor-grabbing " + className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frames[idx]} alt={alt} draggable={false}
        className="h-full w-full object-contain" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-semibold text-ink/50">
          360° yuklanmoqda…
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">
        ⟲ 360°
      </div>
    </div>
  );
}
