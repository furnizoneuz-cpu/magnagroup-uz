// Product photo when available; otherwise a clean, light studio placeholder
// (white/neutral background, soft shadow, thin line-art glyph) — B2B minimal style.
export default function ProductImage({ product, lang = "uz", className = "", ratio = "square" }) {
  const pad = ratio === "wide" ? "56.25%" : "100%";

  return (
    <div className={"relative w-full overflow-hidden bg-white " + className} style={{ paddingTop: pad }}>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.thumb || product.image}
          alt={product.name?.[lang] || product.article}
          loading="lazy"
          className="absolute inset-0 h-full w-full bg-white object-contain"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #ffffff 0%, #f1f3f6 100%)" }}>
          {/* soft shadow ellipse */}
          <div className="absolute bottom-[16%] left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] blur-md" style={{ background: "rgba(30,34,41,0.10)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-brand/60" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="6" y="16" width="36" height="20" rx="2" />
              <path d="M6 22h36M10 36v4M38 36v4M14 16v-4h20v4" strokeLinecap="round" />
            </svg>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/40">{product.article}</div>
          </div>
        </div>
      )}
    </div>
  );
}
