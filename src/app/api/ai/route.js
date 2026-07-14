import { NextResponse } from "next/server";
import ctx from "@/lib/ai-context.json";
import { notifyLead } from "@/lib/notify";

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

/* ---------- qo'shimcha tool'lar ---------- */
function searchCatalog(query, category) {
  const ql = String(query || "").trim().toLowerCase();
  const cl = String(category || "").trim().toLowerCase();
  const hits = [];
  for (const base of Object.values(STOCK)) {
    const okQ = !ql || base.n.toLowerCase().includes(ql) || (base.nr || "").toLowerCase().includes(ql) || base.a.toLowerCase().includes(ql);
    const okC = !cl || base.c.toLowerCase().includes(cl);
    if (okQ && okC) {
      hits.push({ article: base.a, name: base.n, category: base.c, availability: base.s > 0 ? `sotuvda (${base.s} dona)` : "buyurtma asosida" });
      if (hits.length >= 8) break;
    }
  }
  return hits.length ? { found: true, results: hits, note: "To'liq katalog: /uz/catalog" } : { found: false };
}

async function createLead({ name, phone, interest }) {
  if (!phone || String(phone).replace(/\D/g, "").length < 7) return { ok: false, reason: "telefon noto'g'ri" };
  const rec = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    name: String(name || "Mijoz (AI chat)").slice(0, 120),
    phone: String(phone).slice(0, 40),
    message: `[Magna AI] ${String(interest || "").slice(0, 300)}`,
  };
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "catalog", consistency: "strong" });
    const leads = (await store.get("leads", { type: "json" })) || [];
    leads.push(rec);
    await store.setJSON("leads", leads);
  } catch { return { ok: false, reason: "saqlash xatosi" }; }
  // Bot guruhga yuboradi + sotuvchiga yo'naltirish tugmalari (showroom mas'ullari)
  const sellers = (ctx.showrooms || [])
    .filter((s) => s.telegram)
    .map((s) => ({ name: s.contact, telegram: s.telegram, showroom: s.label }));
  await notifyLead({ name: rec.name, phone: rec.phone, interest }, sellers).catch(() => {});
  return { ok: true, message: "Lead qabul qilindi, menejer tez orada bog'lanadi" };
}

const TOOLS = [{
  functionDeclarations: [
    {
      name: "check_stock",
      description: "Magna Group omboridagi JONLI qoldiqni tekshiradi. Mahsulot mavjudligi, soni yoki narxi so'ralganda chaqir. query = artikul (masalan GA91) yoki nom qismi.",
      parameters: { type: "OBJECT", properties: { query: { type: "STRING", description: "Artikul yoki nom qidiruvi" } }, required: ["query"] },
    },
    {
      name: "search_catalog",
      description: "Katalogdan mahsulot qidiradi (sotuvda bo'lmaganlarni ham, ular buyurtma asosida). Mijoz turkum yoki tur bo'yicha nimadir izlasa chaqir.",
      parameters: { type: "OBJECT", properties: { query: { type: "STRING", description: "Nom/artikul qidiruvi" }, category: { type: "STRING", description: "Kategoriya nomi (ixtiyoriy): ofis, kreslo, divan, tibbiy, o'quvchi, bolalar, shkaf, stol" } } },
    },
    {
      name: "get_showroom",
      description: "Showroomlar (manzil, ish vaqti, mas'ul shaxs, telefon, xarita havolasi) haqida aniq ma'lumot qaytaradi.",
      parameters: { type: "OBJECT", properties: {} },
    },
    {
      name: "create_lead",
      description: "Mijoz ism va telefonini qoldirsa CHAQIR — buyurtma so'rovini menejerga yuboradi. Avval mijozdan ism/telefonni so'ra, keyin chaqir.",
      parameters: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Mijoz ismi" },
          phone: { type: "STRING", description: "Telefon raqami" },
          interest: { type: "STRING", description: "Nimaga qiziqyapti (artikul/mahsulot/izoh)" },
        },
        required: ["phone"],
      },
    },
  ],
}];

async function runTool(name, args) {
  if (name === "check_stock") return checkStock(args?.query);
  if (name === "search_catalog") return searchCatalog(args?.query, args?.category);
  if (name === "get_showroom") return { showrooms: ctx.showrooms || [] };
  if (name === "create_lead") return createLead(args || {});
  return { error: "unknown_tool" };
}

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
    /* --- staff: tool'larni to'g'ridan-to'g'ri sinash (LLM'siz) --- */
    if (body.task === "tool_test") {
      if (req.headers.get("x-admin-key") !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const result = await runTool(body.tool, body.args || {});
      return NextResponse.json({ ok: true, tool: body.tool, result });
    }

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
      const fcs = parts.filter((p) => p.functionCall);
      if (fcs.length) {
        // model javobini ASL holicha qaytaramiz (thoughtSignature saqlanishi shart)
        contents.push(content);
        const responses = [];
        for (const p of fcs) {
          const { name, args } = p.functionCall;
          toolUsed = `${name}(${JSON.stringify(args || {}).slice(0, 80)})`;
          responses.push({ functionResponse: { name, response: await runTool(name, args) } });
        }
        contents.push({ role: "user", parts: responses });
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
