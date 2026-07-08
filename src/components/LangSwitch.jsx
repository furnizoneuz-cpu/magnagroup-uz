"use client";
import { usePathname, useRouter } from "next/navigation";
import { LANGS, LANG_SHORT } from "@/lib/i18n";

export default function LangSwitch({ lang }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next) {
    const parts = pathname.split("/");
    if (LANGS.includes(parts[1])) parts[1] = next;
    else parts.splice(1, 0, next);
    const q = typeof window !== "undefined" ? window.location.search : "";
    // scroll: false → language changes in place, keeping the current scroll position.
    router.push((parts.join("/") || `/${next}`) + q, { scroll: false });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-black/5 p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={
            "rounded-md px-2 py-1 text-xs font-semibold transition " +
            (l === lang ? "bg-ink text-white" : "text-black/60 hover:text-ink")
          }
        >
          {LANG_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
