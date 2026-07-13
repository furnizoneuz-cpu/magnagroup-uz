import crypto from "crypto";
import fs from "fs";
import path from "path";

/*
  Lightweight auth: users in Netlify Blobs (production) or a local JSON file
  (dev). Passwords hashed with scrypt. Sessions are HMAC-signed cookies — no
  external dependencies, works on Netlify serverless.

  Roles: visitor (anonymous, default) < customer < seller < admin.
*/

export const ROLES = ["visitor", "customer", "seller", "admin"];
export const roleRank = (r) => Math.max(0, ROLES.indexOf(r));
export const COOKIE = "mg_session";
const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "magna-dev-secret-change-me";
const SESSION_DAYS = 30;

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "users", consistency: "strong" });
}

async function readUsers() {
  try {
    if (onNetlify()) {
      const store = await blobStore();
      return (await store.get("users", { type: "json" })) || {};
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeUsers(users) {
  if (onNetlify()) {
    const store = await blobStore();
    await store.setJSON("users", users);
    return;
  }
  const tmp = USERS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2), "utf-8");
  fs.renameSync(tmp, USERS_FILE);
}

/* ---------------- password hashing ---------------- */
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}
export function verifyPassword(password, salt, hash) {
  if (!salt || !hash) return false;
  const h = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(h), b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------------- session tokens ---------------- */
export function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifySession(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expect = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (!sig || sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(payload) {
  const token = signSession({ ...payload, exp: Date.now() + SESSION_DAYS * 864e5 });
  const attrs = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DAYS * 86400}`,
  ];
  if (onNetlify()) attrs.push("Secure");
  return attrs.join("; ");
}
export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/* ---------------- user operations ---------------- */
const normEmail = (e) => String(e || "").trim().toLowerCase();
const publicUser = (u) => u && ({ email: u.email, name: u.name, role: u.role, provider: u.provider || "email" });

export async function getUserByEmail(email) {
  const users = await readUsers();
  return users[normEmail(email)] || null;
}

export async function createUser({ email, password, name, role = "customer", provider = "email" }) {
  email = normEmail(email);
  if (!email || !email.includes("@")) return { error: "invalid_email" };
  const users = await readUsers();
  if (users[email]) return { error: "exists" };

  // First ever account, or one matching ADMIN_EMAIL, becomes admin.
  const adminEmail = normEmail(process.env.ADMIN_EMAIL);
  if ((adminEmail && email === adminEmail) || Object.keys(users).length === 0) role = "admin";

  const rec = { email, name: name || email.split("@")[0], role, provider, createdAt: new Date().toISOString() };
  if (provider === "email") {
    if (!password || String(password).length < 6) return { error: "weak_password" };
    const { salt, hash } = hashPassword(password);
    rec.salt = salt; rec.hash = hash;
  }
  users[email] = rec;
  await writeUsers(users);
  return { user: publicUser(rec) };
}

// The designated ADMIN_EMAIL is always an admin, even if the account was
// created before that env var was set — promote on the way in.
async function ensureDesignatedAdmin(u) {
  const adminEmail = normEmail(process.env.ADMIN_EMAIL);
  if (adminEmail && u && u.email === adminEmail && u.role !== "admin") {
    return await setUserRole(u.email, "admin");
  }
  return publicUser(u);
}

export async function authenticate(email, password) {
  const u = await getUserByEmail(email);
  if (!u || u.provider !== "email") return null;
  if (!verifyPassword(password, u.salt, u.hash)) return null;
  return await ensureDesignatedAdmin(u);
}

// For OAuth (e.g. Facebook): find or create, never needs a password.
export async function upsertOAuthUser({ email, name, provider }) {
  email = normEmail(email);
  const existing = await getUserByEmail(email);
  if (existing) return await ensureDesignatedAdmin(existing);
  const res = await createUser({ email, name, provider, role: "customer" });
  return res.user || null;
}

export async function setUserRole(email, role) {
  if (!ROLES.includes(role)) return null;
  const users = await readUsers();
  const u = users[normEmail(email)];
  if (!u) return null;
  u.role = role;
  await writeUsers(users);
  return publicUser(u);
}

export async function listUsers() {
  const users = await readUsers();
  return Object.values(users).map(publicUser);
}

/* ---------------- request helpers ---------------- */
export function readSessionFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const m = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="));
  if (!m) return null;
  return verifySession(m.slice(COOKIE.length + 1));
}

export function currentUser(req) {
  return readSessionFromCookieHeader(req.headers.get("cookie"));
}

export function hasRole(req, minRole) {
  const s = currentUser(req);
  return !!s && roleRank(s.role) >= roleRank(minRole);
}
