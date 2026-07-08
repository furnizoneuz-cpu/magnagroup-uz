// Magna Group logo: extracted green mark (transparent PNG) + wordmark.
// variant "dark"  → for light backgrounds (header)
// variant "light" → for dark backgrounds (footer/hero)
export default function Logo({ variant = "dark", className = "", markClass = "h-9" }) {
  const magna = variant === "light" ? "text-white" : "text-ink";
  return (
    <span className={"inline-flex items-center gap-2.5 " + className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="Magna Group" className={markClass + " w-auto"} />
      <span className="font-head text-xl font-extrabold lowercase leading-none tracking-tight">
        <span className={magna}>magna</span>
        <span className="text-brand"> group</span>
      </span>
    </span>
  );
}
