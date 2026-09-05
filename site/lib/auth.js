"use strict";

/* Admin authentication.

   The password is never stored in plain text: only a scrypt hash with a random
   per-install salt, in content/admin.json (which is git-ignored). On first run,
   if no password is configured, one is generated, printed once to the console
   and stored hashed.

   Sessions are HMAC-signed cookies — no server-side session table, so a restart
   does not log anyone out, and a stolen cookie expires on its own. */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "content", "admin.json");
const MAX_AGE = 8 * 60 * 60;          // 8 hours
const COOKIE = "so_admin";

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (e) {
    return null;
  }
}

function save(cfg) {
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 1), "utf8");
  try { fs.chmodSync(FILE, 0o600); } catch (e) { /* best effort on Windows */ }
}

function hash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString("hex");
}

/** Returns the config, creating it (and a random password) on first run. */
function init() {
  let cfg = load();
  if (cfg && cfg.hash && cfg.salt && cfg.secret) return cfg;

  const salt = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  const supplied = process.env.ADMIN_PASSWORD;
  const password = supplied || crypto.randomBytes(9).toString("base64url");

  cfg = { salt, secret, hash: hash(password, salt), created: new Date().toISOString() };
  save(cfg);

  console.log("");
  console.log("  ┌─ Yönetim paneli / admin panel ────────────────────");
  console.log("  │  /admin");
  if (supplied) {
    console.log("  │  Parola: ADMIN_PASSWORD ortam değişkeninden alındı.");
  } else {
    console.log("  │  Parola (yalnızca bir kez gösterilir):  " + password);
    console.log("  │  Değiştirmek için content/admin.json dosyasını silin");
    console.log("  │  ve ADMIN_PASSWORD=... ile yeniden başlatın.");
  }
  console.log("  └───────────────────────────────────────────────────");
  return cfg;
}

function verify(password) {
  const cfg = init();
  const given = Buffer.from(hash(password, cfg.salt), "hex");
  const want = Buffer.from(cfg.hash, "hex");
  if (given.length !== want.length) return false;
  return crypto.timingSafeEqual(given, want);
}

/* ------------------------------------------------------------- sessions */
function sign(payload) {
  const cfg = init();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", cfg.secret).update(body).digest("base64url");
  return body + "." + mac;
}

function unsign(token) {
  if (!token || token.indexOf(".") === -1) return null;
  const cfg = init();
  const [body, mac] = token.split(".");
  const want = crypto.createHmac("sha256", cfg.secret).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function isAuthed(req) {
  return !!unsign(cookies(req)[COOKIE]);
}

function loginCookie() {
  const token = sign({ ok: 1, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

function logoutCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

/** CSRF token bound to the session secret, so forms cannot be posted cross-site. */
function csrfToken() {
  const cfg = init();
  const day = Math.floor(Date.now() / 86400000);
  return crypto.createHmac("sha256", cfg.secret).update("csrf" + day).digest("base64url").slice(0, 32);
}

function csrfOk(token) {
  const want = csrfToken();
  if (!token || token.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(want));
}

module.exports = { init, verify, isAuthed, loginCookie, logoutCookie, csrfToken, csrfOk, COOKIE };
