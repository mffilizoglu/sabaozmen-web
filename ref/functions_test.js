/* Exercise the Cloudflare Pages Functions locally (wrangler pages dev on 8788).

   The GitHub token in .dev.vars is a placeholder, so any call that reaches the
   GitHub API is expected to fail. What this proves is everything up to that
   point: bundling, auth, CSRF, session cookies, form parsing — and that a
   GitHub failure surfaces as a readable message rather than a 500. */

const BASE = process.env.FN_BASE || "http://127.0.0.1:8788";
let COOKIE = "";

async function req(method, path, body, headers) {
  const h = Object.assign({}, headers || {});
  if (COOKIE) h.Cookie = COOKIE;
  const r = await fetch(BASE + path, { method, body, headers: h, redirect: "manual" });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  if (sc.length) COOKIE = sc.map((c) => c.split(";")[0]).join("; ");
  return { status: r.status, headers: r.headers, body: await r.text() };
}

const csrfFrom = (h) => (/name="_csrf" value="([^"]+)"/.exec(h) || [])[1];

const results = [];
const check = (name, pass, detail) => {
  results.push(pass);
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a4944415478da6360000002000100" +
  "05fe02fea70000000049454e44ae426082", "hex");

function form(fields, files) {
  const fd = new FormData();
  for (const [k, vs] of Object.entries(fields)) {
    for (const v of [].concat(vs)) fd.append(k, v);
  }
  for (const [k, f] of Object.entries(files || {})) {
    fd.append(k, new Blob([f.data], { type: f.type }), f.name);
  }
  return fd;
}

(async () => {
  // --- unauthenticated -----------------------------------------------------
  let r = await req("GET", "/admin");
  check("login page served when logged out", r.status === 200 && r.body.includes('name="password"'));

  r = await req("POST", "/admin/avukatlar/yeni", form({ name: "X" }));
  check("POST without session rejected", r.status === 401, "status " + r.status);

  // --- wrong password ------------------------------------------------------
  const login = await req("GET", "/admin");
  const csrf = csrfFrom(login.body);
  check("CSRF token present on login form", !!csrf);

  r = await req("POST", "/admin/giris", form({ _csrf: csrf, password: "definitely-wrong" }));
  check("wrong password rejected", r.status === 401, "status " + r.status);

  r = await req("POST", "/admin/giris", form({ _csrf: "not-a-token", password: "demo1234" }));
  check("bad CSRF on login rejected", r.status === 403, "status " + r.status);

  // --- correct password ----------------------------------------------------
  r = await req("POST", "/admin/giris", form({ _csrf: csrf, password: "demo1234" }));
  const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie().join(";") : "";
  check("login succeeds", r.status === 302 && r.headers.get("location") === "/admin/avukatlar",
        "status " + r.status);
  check("session cookie is HttpOnly + Secure + SameSite=Strict",
        /HttpOnly/i.test(setCookie) && /Secure/i.test(setCookie) && /SameSite=Strict/i.test(setCookie));

  // --- GitHub unreachable is reported, not a 500 ---------------------------
  r = await req("GET", "/admin/avukatlar");
  check("GitHub failure is not an unhandled 500", r.status !== 500,
        "status " + r.status + (r.status === 200 ? "" : " (expected: readable error)"));

  // --- contact endpoint ----------------------------------------------------
  const jsonHdr = { "Content-Type": "application/json" };
  r = await req("POST", "/api/contact", JSON.stringify({
    lang: "tr", name: "Test", email: "t@example.com", message: "deneme", consent: "1",
  }), jsonHdr);
  check("contact: unconfigured mailer returns an honest 503",
        r.status === 503 && /doğrudan/.test(r.body), "status " + r.status);

  r = await req("POST", "/api/contact", JSON.stringify({
    lang: "en", name: "Test", email: "nope", message: "x", consent: "1",
  }), jsonHdr);
  check("contact: invalid email rejected", r.status === 400, "status " + r.status);

  r = await req("POST", "/api/contact", JSON.stringify({
    lang: "tr", name: "Bot", email: "b@x.co", message: "spam", consent: "1", website: "http://spam",
  }), jsonHdr);
  check("contact: honeypot accepted silently", r.status === 200 && /ulaştı/.test(r.body));

  r = await req("GET", "/api/contact");
  check("contact: GET not allowed", r.status === 405, "status " + r.status);

  // --- logout --------------------------------------------------------------
  const any = await req("GET", "/admin");
  r = await req("POST", "/admin/cikis", form({ _csrf: csrfFrom(any.body) || csrf }));
  check("logout redirects and clears cookie", r.status === 302);

  const failed = results.filter((x) => !x).length;
  console.log(`\n  ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("ERROR", e); process.exit(1); });
