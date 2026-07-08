"use client";
import { useEffect, useRef } from "react";

/*
  HeroFluid — a lightweight "flowing light" backdrop for the hero.

  It simulates a few soft light bodies (orbs) drifting on smooth harmonic paths
  and blends them additively so overlaps read as brighter light — evoking fluid
  dynamics, light play and gentle refraction without a heavy WebGL fluid solver.

  Performance notes:
    • Pure 2D canvas, ~6 orbs, additive ("lighter") compositing — cheap on GPU.
    • Device pixel ratio capped at 1.5 to limit fill cost on hi-dpi screens.
    • ~40 fps frame cap; animation pauses when the tab is hidden or the hero
      scrolls out of view (IntersectionObserver) so it never wastes cycles.
    • Honors prefers-reduced-motion (renders a single static frame).
*/
export default function HeroFluid({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Light bodies: hue + orbital parameters (amplitude, angular frequency, phase).
    // Positions are expressed in normalized [0..1] space and mapped to pixels each frame.
    const orbs = [
      { hue: "34,168,54", ax: 0.22, ay: 0.16, wx: 0.10, wy: 0.14, px: 0.0, py: 1.1, cx: 0.30, cy: 0.45, r: 0.55 },
      { hue: "18,128,31", ax: 0.28, ay: 0.20, wx: 0.08, wy: 0.11, px: 2.1, py: 0.4, cx: 0.72, cy: 0.35, r: 0.62 },
      { hue: "120,200,120", ax: 0.18, ay: 0.24, wx: 0.13, wy: 0.09, px: 4.0, py: 3.2, cx: 0.55, cy: 0.65, r: 0.42 },
      { hue: "40,180,90", ax: 0.30, ay: 0.14, wx: 0.07, wy: 0.16, px: 1.0, py: 2.6, cx: 0.85, cy: 0.60, r: 0.50 },
      { hue: "200,230,205", ax: 0.16, ay: 0.18, wx: 0.15, wy: 0.12, px: 5.2, py: 1.7, cx: 0.15, cy: 0.72, r: 0.34 },
    ];

    let w = 0, h = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    function frame(t) {
      // Graphite base wash (slightly transparent for soft trailing of the light).
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#14130f";
      ctx.fillRect(0, 0, w, h);

      // Additive light: overlapping orbs sum toward white → a refraction-like bloom.
      ctx.globalCompositeOperation = "lighter";
      const time = t * 0.001;
      const base = Math.min(w, h);
      for (const o of orbs) {
        // Harmonic drift — position = centre + amplitude * sin(freq * time + phase).
        const x = (o.cx + o.ax * Math.sin(o.wx * time + o.px)) * w;
        const y = (o.cy + o.ay * Math.sin(o.wy * time + o.py)) * h;
        const rad = o.r * base;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(${o.hue},0.42)`);
        g.addColorStop(0.4, `rgba(${o.hue},0.14)`);
        g.addColorStop(1, `rgba(${o.hue},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let raf = 0, last = 0, running = true;
    const FRAME_MS = 1000 / 40;
    function loop(t) {
      if (!running) return;
      if (t - last >= FRAME_MS) { last = t; frame(t); }
      raf = requestAnimationFrame(loop);
    }

    if (reduce) {
      frame(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    // Pause when hidden or scrolled away.
    const io = new IntersectionObserver((e) => {
      running = e[0].isIntersecting && !document.hidden;
      if (running && !reduce) { last = 0; raf = requestAnimationFrame(loop); }
    }, { threshold: 0 });
    io.observe(canvas);

    function onVis() {
      running = !document.hidden;
      if (running && !reduce) { last = 0; raf = requestAnimationFrame(loop); }
    }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={"absolute inset-0 h-full w-full " + className} aria-hidden="true" />;
}
