import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const OVERRIDES_FILE = path.join(DATA_DIR, "overrides.json");

let _cache = null;
let _mtime = 0;

export function readCatalog() {
  // In-memory cache keyed by file mtime: near-zero cost on every request,
  // re-parses only when products.json actually changes. Never blocks the event loop.
  try {
    const st = fs.statSync(PRODUCTS_FILE);
    if (_cache && st.mtimeMs === _mtime) return _cache;
    const parsed = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
    _cache = parsed;
    _mtime = st.mtimeMs;
    return parsed;
  } catch (e) {
    if (_cache) return _cache; // mid-write / transient: serve last good
    throw e;
  }
}

export function writeCatalog(catalog) {
  const tmp = PRODUCTS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(catalog, null, 2), "utf-8");
  fs.renameSync(tmp, PRODUCTS_FILE); // atomic swap
}

/* ---------------- Admin overrides (price/hidden/stock/image) ----------------
   The deployed filesystem on Netlify is read-only, so admin edits are stored
   as an overrides map { [article]: patch } in Netlify Blobs (production) or
   data/overrides.json (local dev), merged over the base catalog at read time. */

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
let _ov = { data: null, ts: 0 };
const OV_TTL_MS = 5000;

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "catalog", consistency: "strong" });
}

export async function readOverrides() {
  const now = Date.now();
  if (_ov.data && now - _ov.ts < OV_TTL_MS) return _ov.data;
  let data = {};
  try {
    if (onNetlify()) {
      const store = await blobStore();
      data = (await store.get("overrides", { type: "json" })) || {};
    } else {
      data = JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf-8"));
    }
  } catch {
    data = {};
  }
  _ov = { data, ts: now };
  return data;
}

async function saveOverride(article, patch) {
  const data = { ...(await readOverrides()) };
  data[article] = { ...(data[article] || {}), ...patch };
  if (onNetlify()) {
    const store = await blobStore();
    await store.setJSON("overrides", data);
  } else {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(data, null, 2), "utf-8");
  }
  _ov = { data, ts: Date.now() };
  return data[article];
}

/* ---------------- Catalog accessors (override-merged) ---------------- */

export async function getProducts() {
  const base = readCatalog().products;
  const ov = await readOverrides();
  if (!Object.keys(ov).length) return base;
  return base.map((p) => (ov[p.article] ? { ...p, ...ov[p.article] } : p));
}

export async function getVisibleProducts() {
  return (await getProducts()).filter((p) => !p.hidden);
}

export function getCategories() {
  return readCatalog().categories;
}

export function getBrand() {
  return readCatalog().brand;
}

export async function getProduct(article) {
  return (await getProducts()).find((p) => p.article === article) || null;
}

export async function updateProduct(article, patch) {
  const exists = readCatalog().products.some((p) => p.article === article);
  if (!exists) return null;
  await saveOverride(article, patch);
  return getProduct(article);
}

/* ---------------- Simple JSON lists (orders / leads) ----------------
   Same storage rule as overrides: Netlify Blobs in production (the deployed
   filesystem is read-only there), local JSON files in development. */

async function readList(key, file) {
  try {
    if (onNetlify()) {
      const store = await blobStore();
      return (await store.get(key, { type: "json" })) || [];
    }
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

async function writeList(key, file, list) {
  if (onNetlify()) {
    const store = await blobStore();
    await store.setJSON(key, list);
    return;
  }
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf-8");
  fs.renameSync(tmp, file);
}

export async function readOrders() {
  return readList("orders", ORDERS_FILE);
}

export async function addOrder(order) {
  const orders = await readOrders();
  const number = "MG-" + String(1000 + orders.length + 1);
  const record = { number, createdAt: new Date().toISOString(), status: "new", ...order };
  orders.push(record);
  await writeList("orders", ORDERS_FILE, orders);
  return record;
}

const LEADS_FILE = path.join(DATA_DIR, "leads.json");

export async function readLeads() {
  return readList("leads", LEADS_FILE);
}

export async function addLead(lead) {
  const leads = await readLeads();
  const record = { id: leads.length + 1, createdAt: new Date().toISOString(), ...lead };
  leads.push(record);
  await writeList("leads", LEADS_FILE, leads);
  return record;
}
