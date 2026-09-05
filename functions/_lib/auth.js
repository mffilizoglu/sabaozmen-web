/* Admin authentication for the Cloudflare Workers runtime.

   The Node version uses node:crypto (scrypt, timingSafeEqual); neither exists
   here, so this is the Web Crypto equivalent:

     password  — compared in constant time against the ADMIN_PASSWORD secret.
                 Cloudflare encrypts environment secrets at rest and does not
                 display them again after they are set, so the secret store is
                 the security boundary; there is no hash to steal from the repo.
     session   — HMAC-SHA256 signed cookie, no server-side session table.
     csrf      — HMAC of the current day, so tokens rotate daily on their own.
*/

const COOKIE = "so_admin";
const MAX_AGE = 8 * 60 * 60;

const enc = new TextEncoder();

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64url = (s) =>
  atob(s.replace(/-/g, "+").replace(/_/g, "/"));

/** Constant-time string compare — Workers has no timingSafeEqual. */
export function safeEqual(a, b) {
  a = String(a == null ? "" : a);
  b = String(b == null ? "" : b);
  // Compare a fixed number of bytes so length alone does not leak via timing.
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
}

async function hmac(secret, data) {
  const key = await hmacKey(secret);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/* ------------------------------------------------------------- sessions */
export async function sign(secret, payload) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return body + "." + (await hmac(secret, body));
}

export async function unsign(secret, token) {
  if (!token || token.indexOf(".") === -1) return null;
  const i = token.lastIndexOf(".");
  const body = token.slice(0, i);
  const mac = token.slice(i + 1);
  if (!safeEqual(mac, await hmac(secret, body))) return null;
  try {
    const payload = JSON.parse(fromB64url(body));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export function cookies(request) {
  const out = {};
  (request.headers.get("cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

export async function isAuthed(request, env) {
  if (!env.SESSION_SECRET) return false;
  return !!(await unsign(env.SESSION_SECRET, cookies(request)[COOKIE]));
}

export async function loginCookie(env) {
  const token = await sign(env.SESSION_SECRET, {
    ok: 1, exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function logoutCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/* ----------------------------------------------------------------- csrf */
export async function csrfToken(env) {
  const day = Math.floor(Date.now() / 86400000);
  return (await hmac(env.SESSION_SECRET, "csrf" + day)).slice(0, 32);
}

export async function csrfOk(env, token) {
  if (!token) return false;
  // accept yesterday's token too, so a form left open overnight still submits
  const day = Math.floor(Date.now() / 86400000);
  for (const d of [day, day - 1]) {
    const want = (await hmac(env.SESSION_SECRET, "csrf" + d)).slice(0, 32);
    if (safeEqual(token, want)) return true;
  }
  return false;
}

export function verifyPassword(env, given) {
  if (!env.ADMIN_PASSWORD) return false;
  return safeEqual(given, env.ADMIN_PASSWORD);
}

export { COOKIE, MAX_AGE };
