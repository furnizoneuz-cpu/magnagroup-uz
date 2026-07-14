import { NextResponse } from "next/server";
import ctx from "@/lib/ai-context.json";

/*
  Magna AI (edge) — tool calling bilan:
   - check_stock: JONLI qoldiq (build bazasi + Blobs override'lar, 60s kesh)
   - har suhbat Blobs'ga loglanadi (savol/javob/til/sessiya) — admin ko'radi
   - oddiy per-IP rate limit (daqiqasiga 10 xabar, isolate-lokal)
*/
export const runtime = "edge";

// Asosiy model band (429) bo'lsa zaxira modelga o'tamiz — kvotalari alohida.
const MODELS = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const STOCK = ctx.stockBase || {};

/* ---------- jonli qoldiq: Blobs override kesh (60s) ---------- */
let _ov = { data: {}, ts: 0 };
async function overrides() {
  const now = Date.now();
  if (now - _ov.ts < 60000) return _ov.data;
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "catalog", consistency: "strong" });
    _ov = { data: (await store.get("overrides", { type: "json" })) || {}, ts: now };
  } catch {
    _ov = { data: {}, ts: now };
  }
  return _ov.data;
}

async function checkStock(query) {
  const q = String(query || "").trim().toUpperCase();
  if (!q) return { found: false };
  const ov = await overrides();
  const live = (art, base) => {
    const o = ov[base.a] || ov[art] || {};
    return {
      article: base.a,
      name: base.n,
      category: base.c,
      stock: "stock" in o ? Number(o.stock) || 0 : base.s,
      hidden: "hidden" in o ? !!o.hidden : false,
      price: o.price ? `${Number(o.price).toLocaleString("ru-RU")} so'm` : "so'rov bo'yicha",
    };
  };
  // 1) aniq artikul
  if (STOCK[q]) {
    const r = live(q, STOCK[q]);
    return r.hidden ? { found: false } : { found: true, results: [r] };
  }
  // 2) qismli artikul yoki nom bo'yicha (max 5)
  const ql = q.toLowerCase();
  const hits = [];
  for (const [art, base] of Object.entries(STOCK)) {
    if (art.includes(q) || base.n.toLowerCase().includes(ql) || (base.nr || "").toLowerCase().includes(ql)) {
      const r = live(art, base);
      if (!r.hidden) hits.push(r);
      if (hits.length >= 5) break;
    }
  }
  return hits.length ? { found: true, results: hits } : { found: false };
}

/* ---------- loglar (Blobs, kunlik ro'yxat) ---------- */
async function logChat(entry) {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "ailogs", consistency: "strong" });
    const day = new Date().toISOString().slice(0, 10);
    const list = (await store.get(day, { type: "json" })) || [];
    list.push(entry);
    await store.setJSON(day, list.slice(-500));
  } catch {}
}

/* ---------- rate limit (isolate-lokal, best-effort) ---------- */
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 2000) hits.clear();
  return arr.length > 10;
}

const TOOLS = [{
  functionDeclarations: [{
    name: "check_stock",
    description: "Magna Group omboridagi JONLI qoldiqni tekshiradi. Mahsulot mavjudligi, soni yoki narxi so'ralganda chaqir. query = artikul (masalan GA91) yoki nom qismi (masalan 'kreslo', 'divan').",
    parameters: { type: "OBJECT", properties: { query: { type: "STRING", description: "Artikul yoki nom qidiruvi" } }, required: ["query"] },
  }],
}];

async function callOne(key, model, contents, useTools) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          ...(useTools ? { tools: TOOLS } : {}),
          generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
        }),
        signal: ctrl.signal,
      }
    );
  } finally {
    clearTimeout(timer);
  }
}

// 429 bo'lsa navbatdagi modelga o'tadi
async function callGemini(key, contents, useTools) {
  let last;
  for (const model of MODELS) {
    last = await callOne(key, model, contents, useTools);
    if (last.status !== 429) return last;
  }
  return last;
}

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }

  try {
    /* --- admin tavsif generatori --- */
    if (body.task === "describe") {
      const p = body.product || {};
      const contents = [{
        role: "user",
        parts: [{ text: `Mebel do'koni uchun qisqa (2-3 jumla), sotuvga undaydigan, faktlarga asoslangan mahsulot tavsifini O'ZBEK tilida yoz. To'qima xususiyat qo'shma.\nNomi: ${p.name || ""}\nArtikul: ${p.article || ""}\nKategoriya: ${p.category || ""}\nO'lcham: ${p.dimensions || "noma'lum"}` }],
      }];
      const r = await callGemini(key, contents, false);
      if (!r.ok) return NextResponse.json({ error: "ai_unavailable", status: r.status }, { status: 502 });
      const d = await r.json();
      const text = d?.candidates?.[0]?.content?.parts?.map((x) => x.text).join("") || "";
      return text
        ? NextResponse.json({ ok: true, reply: text.trim() })
        : NextResponse.json({ error: "empty_reply" }, { status: 502 });
    }

    /* --- chat (tool calling sikli) --- */
    const msgs = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    if (!msgs.length) return NextResponse.json({ error: "empty" }, { status: 400 });

    const contents = [
      { role: "user", parts: [{ text: ctx.context }] },
      { role: "model", parts: [{ text: "Tushundim. Men Magna AI man — Magna Group bo'yicha yordam beraman." }] },
      ...msgs.map((m) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: String(m.text || "").slice(0, 1500) }],
      })),
    ];

    let toolUsed = null;
    let reply = "";
    for (let round = 0; round < 3; round++) {
      const r = await callGemini(key, contents, true);
      if (!r.ok) {
        const detail = body.debug ? (await r.text()).slice(0, 300) : undefined;
        return NextResponse.json({ error: "ai_unavailable", status: r.status, detail }, { status: 502 });
      }
      const d = await r.json();
      const content = d?.candidates?.[0]?.content;
      const parts = content?.parts || [];
      const fc = parts.find((p) => p.functionCall);
      if (fc && fc.functionCall.name === "check_stock") {
        toolUsed = fc.functionCall.args?.query || "";
        const result = await checkStock(toolUsed);
        // model javobini ASL holicha qaytaramiz (thoughtSignature saqlanishi shart)
        contents.push(content);
        contents.push({ role: "user", parts: [{ functionResponse: { name: "check_stock", response: result } }] });
        continue;
      }
      reply = parts.map((p) => p.text || "").join("").trim();
      break;
    }

    if (!reply) return NextResponse.json({ error: "empty_reply" }, { status: 502 });

    // log (kutmaymiz — javob tezligi uchun; edge'da waitUntil bo'lmasa ham await qisqa)
    await logChat({
      t: new Date().toISOString(),
      sid: String(body.sid || "").slice(0, 40),
      lang: body.lang || "?",
      q: String(msgs[msgs.length - 1]?.text || "").slice(0, 300),
      a: reply.slice(0, 500),
      tool: toolUsed,
    });

    return NextResponse.json({ ok: true, reply });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
