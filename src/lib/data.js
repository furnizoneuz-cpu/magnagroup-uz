import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

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

export function getProducts() {
  return readCatalog().products;
}

export function getVisibleProducts() {
  return readCatalog().products.filter((p) => !p.hidden);
}

export function getCategories() {
  return readCatalog().categories;
}

export function getBrand() {
  return readCatalog().brand;
}

export function getProduct(article) {
  return getProducts().find((p) => p.article === article) || null;
}

export function updateProduct(article, patch) {
  const catalog = readCatalog();
  const idx = catalog.products.findIndex((p) => p.article === article);
  if (idx === -1) return null;
  catalog.products[idx] = { ...catalog.products[idx], ...patch };
  writeCatalog(catalog);
  return catalog.products[idx];
}

export function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function addOrder(order) {
  const orders = readOrders();
  const number = "MG-" + String(1000 + orders.length + 1);
  const record = { number, createdAt: new Date().toISOString(), status: "new", ...order };
  orders.push(record);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  return record;
}
