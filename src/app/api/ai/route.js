import { NextResponse } from "next/server";
import ctx from "@/lib/ai-context.json";

/*
  Magna AI — saytga o'rnatilgan maslahatchi. Edge runtime (tez tarmoq, uzun
  limit); kontekst build vaqtida tayyorlanadi (scripts/gen-ai-context.mjs),
  Gemini kaliti faqat serverda. task="describe" — admin uchun tavsif yozadi.
*/
export const runtime = "edge";

const MODEL = "gemini-flash-latest";

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }

  try {
    let contents;
    if (body.task === "describe") {
      const p = body.product || {};
      contents = [{
        role: "user",
        parts: [{ text: `Mebel do'koni uchun qisqa (2-3 jumla), sotuvga undaydigan, faktlarga asoslangan mahsulot tavsifini O'ZBEK tilida yoz. To'qima xususiyat qo'shma.\nNomi: ${p.name || ""}\nArtikul: ${p.article || ""}\nKategoriya: ${p.category || ""}\nO'lcham: ${p.dimensions || "noma'lum"}` }],
      }];
    } else {
      const msgs = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
      if (!msgs.length) return NextResponse.json({ error: "empty" }, { status: 400 });
      contents = [
        { role: "user", parts: [{ text: ctx.context }] },
        { role: "model", parts: [{ text: "Tushundim. Men Magna AI man — Magna Group bo'yicha yordam beraman." }] },
        ...msgs.map((m) => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: String(m.text || "").slice(0, 1500) }],
        })),
      ];
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 22000);
    let r;
    try {
      r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 400, temperature: 0.4 } }),
          signal: ctrl.signal,
        }
      );
    } catch {
      clearTimeout(timer);
      return NextResponse.json({ error: "timeout" }, { status: 504 });
    }
    clearTimeout(timer);

    if (!r.ok) {
      const detail = body.debug ? (await r.text()).slice(0, 300) : undefined;
      return NextResponse.json({ error: "ai_unavailable", status: r.status, detail }, { status: 502 });
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    if (!text) return NextResponse.json({ error: "empty_reply" }, { status: 502 });
    return NextResponse.json({ ok: true, reply: text.trim() });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
