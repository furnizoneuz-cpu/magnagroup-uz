"use client";
import { useEffect, useState, useMemo } from "react";

const KEY = "magna_admin_key";

export default function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("products");

  useEffect(() => {
    // 1) try a logged-in session (admin/seller) via cookie; 2) fall back to saved key
    (async () => {
      const me = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
      if (me.user && (me.user.role === "admin" || me.user.role === "seller")) {
        setRole(me.user.role); setAuthed(true); return;
      }
      const k = localStorage.getItem(KEY);
      if (k) { setKey(k); tryAuth(k); }
    })();
  }, []);

  async function tryAuth(k) {
    const res = await fetch("/api/products", { headers: k ? { "x-admin-key": k } : {} });
    if (res.ok) { setAuthed(true); setRole((r) => r || "admin"); if (k) localStorage.setItem(KEY, k); }
    else { setAuthed(false); }
    return res.ok;
  }

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand p-4">
        <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-extrabold text-ink">Magna Admin</h1>
          <p className="mb-5 text-sm text-black/50">Boshqaruv paneli</p>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
            placeholder="Parol" className="w-full rounded-lg border border-black/12 px-4 py-2.5 text-sm outline-none focus:border-[#111]"
            onKeyDown={(e) => e.key === "Enter" && tryAuth(key)} />
          <button onClick={() => tryAuth(key)} className="mt-3 w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3a3a3a]">
            Kirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <span className="text-lg font-extrabold text-ink">MAGNA <span className="text-[#111]">admin</span></span>
          <nav className="ml-4 flex flex-wrap gap-1">
            {["products", "orders", "leads", "ai", ...(role === "admin" ? ["users"] : [])].map((tb) => (
              <button key={tb} onClick={() => setTab(tb)}
                className={"rounded-lg px-3 py-1.5 text-sm font-semibold " + (tab === tb ? "bg-ink text-white" : "text-black/60 hover:bg-sand")}>
                {tb === "products" ? "Mahsulotlar" : tb === "orders" ? "Buyurtmalar" : tb === "leads" ? "Murojaatlar" : tb === "ai" ? "AI suhbatlar" : "Foydalanuvchilar"}
              </button>
            ))}
          </nav>
          <button onClick={() => { localStorage.removeItem(KEY); setAuthed(false); }} className="ml-auto text-sm font-medium text-red-500 hover:underline">
            Chiqish
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "products" ? <Products adminKey={key} /> : tab === "orders" ? <Orders adminKey={key} /> : tab === "leads" ? <Leads adminKey={key} /> : tab === "ai" ? <AiLogs adminKey={key} /> : <Users />}
      </main>
    </div>
  );
}

function Products({ adminKey }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  async function load() {
    const res = await fetch("/api/products", { headers: { "x-admin-key": adminKey } });
    const data = await res.json();
    setProducts(data.products || []);
    setCategories(data.categories || []);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return products.filter((p) =>
      (!cat || p.category === cat) &&
      (!n || (p.article + " " + p.name.uz + " " + p.name.ru).toLowerCase().includes(n))
    );
  }, [products, q, cat]);

  const withPrice = products.filter((p) => p.price != null).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..."
          className="rounded-lg border border-black/12 bg-white px-4 py-2 text-sm outline-none focus:border-[#111]" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-black/12 bg-white px-3 py-2 text-sm">
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name.uz}</option>)}
        </select>
        <span className="ml-auto text-sm text-black/50">Narx kiritilgan: <b>{withPrice}</b> / {products.length}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left text-xs uppercase text-black/50">
            <tr>
              <th className="p-3">Rasm</th>
              <th className="p-3">Artikul</th>
              <th className="p-3">Nomi (uz)</th>
              <th className="p-3">Narx (so'm)</th>
              <th className="p-3">Qoldiq</th>
              <th className="p-3">Ko'rinish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filtered.map((p) => (
              <Row key={p.article} p={p} adminKey={adminKey} onSaved={load} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const UPLOAD_HINT = `RASM YUKLASH TALABLARI:
• Format: JPG, PNG yoki WebP
• O'lcham: kamida 1000×1000 px, tavsiya 1500–2500 px (kvadratga yaqin)
• Hajm: 4 MB dan oshmasin (tavsiya 300 KB – 1.5 MB)
• Fon: oq/och, mahsulot markazda, yaxshi yorug'lik
• Suv belgisi/matn bo'lmasin — sayt tezligi uchun ortiqcha katta fayl yuklamang`;

const CATS = [
  ["office", "Ofis"], ["staff", "Xodimlar"], ["conference", "Muzokara"],
  ["storage", "Shkaf/tumba"], ["tables", "Stollar"], ["seating", "O'rindiqlar"],
  ["medical", "Tibbiy"], ["student", "O'quvchi"], ["children", "Bolalar"],
];

function Row({ p, adminKey, onSaved }) {
  const [price, setPrice] = useState(p.price ?? "");
  const [stock, setStock] = useState(p.stock ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [img, setImg] = useState(p.image);
  const [hidden, setHidden] = useState(!!p.hidden);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    nameUz: p.name?.uz || "", nameRu: p.name?.ru || "", nameEn: p.name?.en || "",
    desc: p.description?.uz || "", dimensions: p.dimensions || "", category: p.category,
  });
  const [uploadErr, setUploadErr] = useState("");

  async function save(patch) {
    setSaving(true);
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ article: p.article, patch }),
    });
    setSaving(false);
    if (res.ok) { setSavedFlag(true); setTimeout(() => setSavedFlag(false), 1200); onSaved && onSaved(); }
  }

  async function saveFull() {
    await save({
      name: { uz: form.nameUz, ru: form.nameRu || form.nameUz, en: form.nameEn || form.nameUz },
      description: { uz: form.desc, ru: p.description?.ru || form.desc, en: p.description?.en || form.desc },
      dimensions: form.dimensions,
      category: form.category,
    });
    setEdit(false);
  }

  async function upload(file) {
    setUploadErr("");
    if (file.size > 4 * 1024 * 1024) { setUploadErr("Fayl 4 MB dan katta!"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadErr("Faqat JPG/PNG/WebP!"); return; }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("article", p.article);
    const res = await fetch("/api/upload", { method: "POST", headers: { "x-admin-key": adminKey }, body: fd });
    const data = await res.json();
    if (data.ok) { setImg(data.path); await save({ image: data.path }); }
    else setUploadErr(data.error === "too_large" ? "Fayl juda katta" : "Yuklash xatosi");
  }

  return (
    <>
    <tr className={hidden ? "opacity-50" : ""}>
      <td className="p-2">
        <label className="block h-12 w-12 cursor-pointer overflow-hidden rounded bg-sand" title={UPLOAD_HINT}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-[10px] text-black/40">+ foto</span>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
        </label>
        {uploadErr && <div className="mt-1 w-24 text-[10px] font-semibold text-red-600">{uploadErr}</div>}
      </td>
      <td className="p-3 font-mono text-xs font-semibold text-[#111]">{p.article}</td>
      <td className="p-3 max-w-xs">
        {p.name.uz}{p.dimensions ? <span className="block text-xs text-black/40">{p.dimensions}</span> : null}
        <button onClick={() => setEdit((v) => !v)} className="mt-1 text-xs font-semibold text-[#12801F] hover:underline">
          {edit ? "Yopish" : "✎ Tahrirlash"}
        </button>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number"
            className="w-32 rounded border border-black/12 px-2 py-1 text-sm outline-none focus:border-[#111]" placeholder="—" />
          <button onClick={() => save({ price, stock })} disabled={saving}
            className="rounded bg-ink px-3 py-1 text-xs font-semibold text-white hover:bg-[#3a3a3a] disabled:opacity-50">
            {savedFlag ? "✓" : "Saqlash"}
          </button>
        </div>
      </td>
      <td className="p-3">
        <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0"
          className="w-16 rounded border border-black/12 px-2 py-1 text-sm outline-none focus:border-[#111]" placeholder="0" />
      </td>
      <td className="p-3">
        <button onClick={() => { const nv = !hidden; setHidden(nv); save({ hidden: nv }); }}
          className={"rounded px-2 py-1 text-xs font-semibold " + (hidden ? "bg-black/10 text-black/50" : "bg-green-100 text-green-700")}>
          {hidden ? "Yashirin" : "Faol"}
        </button>
      </td>
    </tr>
    {edit && (
      <tr className="bg-[#fafafa]">
        <td colSpan={6} className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-semibold text-black/60">Nomi (uz)
              <input value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-black/60">Название (ru)
              <input value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-black/60">Name (en)
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-black/60 md:col-span-2">Tavsif (uz)
              <textarea value={form.desc} rows={2} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal" />
              <button type="button" onClick={async () => {
                const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ task: "describe", product: { name: form.nameUz, article: p.article, category: form.category, dimensions: form.dimensions } }) });
                const d = await r.json();
                if (d.ok) setForm((f) => ({ ...f, desc: d.reply }));
              }} className="mt-1 rounded bg-[#111] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#3a3a3a]">
                ✨ Magna AI tavsif yozsin
              </button>
            </label>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-black/60">O'lcham (mm)
                <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="1800×800×750" className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal" />
              </label>
              <label className="block text-xs font-semibold text-black/60">Kategoriya
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded border border-black/12 px-2 py-1.5 text-sm font-normal">
                  {CATS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={saveFull} disabled={saving}
              className="rounded bg-[#12801F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0d5f17] disabled:opacity-50">
              To'liq saqlash
            </button>
            <pre className="whitespace-pre-wrap text-[10px] leading-tight text-black/45">{UPLOAD_HINT}</pre>
          </div>
        </td>
      </tr>
    )}
    </>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const ROLES = ["visitor", "customer", "seller", "admin"];
  async function load() {
    const d = await fetch("/api/users", { cache: "no-store" }).then((r) => r.json());
    setUsers(d.users || []);
  }
  useEffect(() => { load(); }, []);
  async function change(email, role) {
    await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    load();
  }
  if (users.length === 0) return <div className="rounded-xl border border-dashed border-black/15 py-16 text-center text-black/40">Foydalanuvchilar yo'q</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-black/5 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-sand text-left text-xs uppercase text-black/50">
          <tr><th className="p-3">Ism</th><th className="p-3">Email</th><th className="p-3">Manba</th><th className="p-3">Rol</th></tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {users.map((u) => (
            <tr key={u.email}>
              <td className="p-3 font-semibold text-ink">{u.name}</td>
              <td className="p-3 text-black/60">{u.email}</td>
              <td className="p-3 text-black/50">{u.provider}</td>
              <td className="p-3">
                <select value={u.role} onChange={(e) => change(u.email, e.target.value)}
                  className="rounded border border-black/12 px-2 py-1 text-sm">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiLogs({ adminKey }) {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    fetch("/api/ai/logs", { headers: { "x-admin-key": adminKey } })
      .then((r) => r.json()).then((d) => setLogs(d.logs || []));
  }, []);
  if (logs === null) return <div className="py-16 text-center text-black/40">Yuklanmoqda…</div>;
  if (logs.length === 0) return <div className="rounded-xl border border-dashed border-black/15 py-16 text-center text-black/40">Hali suhbatlar yo'q</div>;
  return (
    <div className="space-y-2">
      <div className="text-sm text-black/50">Oxirgi 7 kun · {logs.length} ta xabar</div>
      {logs.map((l, i) => (
        <div key={i} className="rounded-xl border border-black/5 bg-white p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-black/45">
            <span>{new Date(l.t).toLocaleString()}</span>
            <span className="rounded bg-[#e5e5e5] px-1.5 py-0.5 font-semibold">{l.lang}</span>
            {l.tool && <span className="rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-700">🔍 {l.tool}</span>}
            <span className="ml-auto font-mono">{(l.sid || "").slice(0, 8)}</span>
          </div>
          <div className="mt-1.5"><b>Mijoz:</b> {l.q}</div>
          <div className="mt-1 text-black/70"><b>AI:</b> {l.a}</div>
        </div>
      ))}
    </div>
  );
}

function Leads({ adminKey }) {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    fetch("/api/lead", { headers: { "x-admin-key": adminKey } })
      .then((r) => r.json()).then((d) => setLeads(d.leads || []));
  }, []);
  if (leads.length === 0) return <div className="rounded-xl border border-dashed border-black/15 py-16 text-center text-black/40">Murojaatlar yo'q</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-black/5 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-sand text-left text-xs uppercase text-black/50">
          <tr><th className="p-3">Sana</th><th className="p-3">Ism</th><th className="p-3">Telefon</th><th className="p-3">Xabar</th></tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {leads.map((l) => (
            <tr key={l.id}>
              <td className="p-3 text-black/50">{new Date(l.createdAt).toLocaleString()}</td>
              <td className="p-3 font-semibold text-ink">{l.name}</td>
              <td className="p-3"><a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`} className="text-brand hover:underline">{l.phone}</a></td>
              <td className="p-3 text-black/60">{l.message || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_UZ = { new: "Yangi", processing: "Jarayonda", delivering: "Yetkazilmoqda", done: "Bajarildi", cancelled: "Bekor" };
const STATUS_COLOR = { new: "bg-blue-100 text-blue-700", processing: "bg-amber-100 text-amber-700", delivering: "bg-purple-100 text-purple-700", done: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-600" };

function Orders({ adminKey }) {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState(["new", "processing", "delivering", "done", "cancelled"]);
  function load() {
    fetch("/api/orders", { headers: { "x-admin-key": adminKey } })
      .then((r) => r.json()).then((d) => { setOrders(d.orders || []); if (d.statuses) setStatuses(d.statuses); });
  }
  useEffect(() => { load(); }, []);
  async function setStatus(number, status) {
    await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ number, status }) });
    load();
  }

  if (orders.length === 0) return <div className="rounded-xl border border-dashed border-black/15 py-16 text-center text-black/40">Buyurtmalar yo'q</div>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.number} className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-ink">{o.number}</span>
            <span className={"rounded px-2 py-0.5 text-xs font-semibold " + (STATUS_COLOR[o.status] || "bg-[#e5e5e5] text-[#111]")}>{STATUS_UZ[o.status] || o.status}</span>
            <select value={o.status} onChange={(e) => setStatus(o.number, e.target.value)}
              className="rounded border border-black/12 px-2 py-1 text-xs">
              {statuses.map((s) => <option key={s} value={s}>{STATUS_UZ[s] || s}</option>)}
            </select>
            <span className="rounded bg-[#e5e5e5] px-2 py-0.5 text-xs font-semibold text-[#111]">{o.customer.payment}</span>
            <span className="text-sm text-black/50">{new Date(o.createdAt).toLocaleString()}</span>
            <span className="ml-auto font-bold text-ink">{o.total ? o.total.toLocaleString("ru-RU") + " so'm" : "narx so'rovi"}</span>
          </div>
          <div className="mt-2 text-sm text-black/70">
            <b>{o.customer.name}</b> · {o.customer.phone} {o.customer.address ? "· " + o.customer.address : ""}
          </div>
          {o.customer.comment ? <div className="mt-1 text-sm text-black/50">💬 {o.customer.comment}</div> : null}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-black/60">
            {o.items.map((it) => (
              <span key={it.article} className="rounded bg-sand px-2 py-1">{it.article} × {it.qty}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
