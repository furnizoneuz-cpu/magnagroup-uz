"use client";
import { useEffect, useRef } from "react";

/*
  Scroll-scrub cinematic sequence — sticky canvas draws image frames synced to
  scroll position (same idea as scroll-video, but with a preloaded image sequence
  so it stays fast: bitmaps decoded once, redraw on rAF only while scrolling).

  props:
    count   - number of frames
    src     - (i) => url, i is 1-based
    height  - spacer height in vh (scroll length). default 320
    fitWide - "cover" on desktop, "contain" on mobile
    overlay - optional React node rendered above the canvas (sticky)
*/
export default function ScrollSequence({
  count,
  dir = "/seq",
  prefix = "f",
  pad = 3,
  ext = "jpg",
  heightVh = 320,
  children,
}) {
  const src = (i) => `${dir}/${prefix}${String(i).padStart(pad, "0")}.${ext}`;
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const loadRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    const loading = loadRef.current;
    if (!root || !cv) return;

    const ctx = cv.getContext("2d", { alpha: false });
    const frames = new Array(count).fill(null);
    let iw = 0, ih = 0, drawn = -1, ready = false, started = false;
    let raf = 0;

    const fit = () => (window.innerWidth > 1024 ? "cover" : "contain");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(wrap.clientWidth * dpr);
      cv.height = Math.round(wrap.clientHeight * dpr);
      drawn = -1;
    }

    function draw(i) {
      const b = frames[i];
      if (!b) return;
      const cw = cv.width, ch = cv.height;
      const mode = fit();
      const s = mode === "cover" ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
      const dw = iw * s, dh = ih * s;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.fillStyle = "#14130f";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(b, dx, dy, dw, dh);
      drawn = i;
    }

    function render() {
      if (!ready) return;
      const spacerH = root.offsetHeight;
      const wrapH = wrap.offsetHeight;
      const total = spacerH - wrapH;
      const rect = root.getBoundingClientRect();
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      const i = Math.round(p * (count - 1));
      if (i !== drawn) draw(i);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; render(); });
    }

    function loadImg(url) {
      return new Promise((res) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = url;
      });
    }

    async function preload() {
      if (started) return;
      started = true;
      // first frame first for instant paint
      const first = await loadImg(src(1));
      if (first) {
        iw = first.naturalWidth; ih = first.naturalHeight;
        frames[0] = first;
        resize(); draw(0);
      }
      // rest in parallel-ish batches
      const rest = [];
      for (let i = 2; i <= count; i++) rest.push(i);
      await Promise.all(
        rest.map(async (i) => { frames[i - 1] = await loadImg(src(i)); })
      );
      ready = true;
      loading && loading.classList.add("vs-loaded");
      render();
    }

    // Lazy start: only preload when the section is near the viewport.
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { preload(); io.disconnect(); } },
      { rootMargin: "600px 0px" }
    );
    io.observe(root);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { resize(); render(); });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, dir, prefix, pad, ext]);

  return (
    <section ref={rootRef} className="vs-spacer" style={{ height: `${heightVh}vh` }}>
      <div ref={wrapRef} className="vs-cv-wrap">
        <canvas ref={canvasRef} className="vs-cv" />
        <div ref={loadRef} className="vs-loading" />
        {children}
      </div>
    </section>
  );
}
