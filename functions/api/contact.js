/* Cloudflare Pages Function — contact form endpoint.
   Path: /api/contact  (Pages maps functions/api/contact.js automatically)

   The public site is static (GitHub Pages at sabaozmen.av.tr), so its form
   posts here, cross-origin, and this function sends the enquiry by e-mail
   through Resend. Same request and response shape as the dev server's handler.

   Configure in the Pages project (secrets):
     RESEND_API_KEY   https://resend.com — free tier
     CONTACT_TO       where enquiries go   (default sabaozmen@sabaozmen.av.tr)
     CONTACT_FROM     verified sender      (default form@sabaozmen.av.tr —
                      only works once the domain is verified in Resend)

   Without RESEND_API_KEY the function answers 503; the site's script then
   falls back to opening the visitor's mail client, so no enquiry is lost.
*/

const MSG = {
  ok: {
    tr: "Mesajınız tarafımıza ulaştı. En kısa sürede dönüş yapacağız.",
    en: "Your message has reached us. We will respond as soon as possible.",
    de: "Ihre Nachricht ist bei uns eingegangen. Wir melden uns so bald wie möglich.",
  },
  err: {
    tr: "Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta yazın.",
    en: "The message could not be sent. Please try again or write to us directly.",
    de: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt.",
  },
  unconfigured: {
    tr: "Form şu anda kullanılamıyor. Lütfen doğrudan sabaozmen@sabaozmen.av.tr adresine yazın.",
    en: "The form is unavailable right now. Please write directly to sabaozmen@sabaozmen.av.tr.",
    de: "Das Formular ist derzeit nicht verfügbar. Bitte schreiben Sie direkt an sabaozmen@sabaozmen.av.tr.",
  },
};

/* Only the firm's own sites may post here from a browser. */
const ORIGINS = [
  "https://sabaozmen.av.tr",
  "https://www.sabaozmen.av.tr",
  "https://sabaozmen.pages.dev",
];

function cors(request, env) {
  // CONTACT_ORIGINS (comma-separated) adds origins, e.g. for local testing
  const allow = ORIGINS.concat(String(env.CONTACT_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean));
  const o = request.headers.get("Origin");
  if (!o) return { allowed: true, headers: {} };            // same-origin or non-browser
  if (!allow.includes(o)) return { allowed: false, headers: {} };
  return {
    allowed: true,
    headers: {
      "Access-Control-Allow-Origin": o,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  };
}

const json = (body, status, extra) =>
  new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, extra || {}),
  });

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function handlePost(request, env, h) {
  let d = {};
  try {
    d = await request.json();
  } catch (e) {
    return json({ ok: false, message: MSG.err.tr }, 400, h);
  }

  const lang = ["tr", "en", "de"].includes(d.lang) ? d.lang : "tr";

  // honeypot — accept without storing or sending
  if (d.website) return json({ ok: true, message: MSG.ok[lang] }, 200, h);

  const valid =
    d.name && d.email && d.message && d.consent &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email)) &&
    String(d.message).length <= 5000 &&
    String(d.name).length <= 200 &&
    String(d.subject || "").length <= 300 &&
    String(d.phone || "").length <= 50;

  if (!valid) return json({ ok: false, message: MSG.err[lang] }, 400, h);

  // Strip a byte-order mark and whitespace: a key pasted through a Windows
  // pipe arrived as "﻿re_…", and Resend rejects the header outright.
  const key = String(env.RESEND_API_KEY || "").replace(/^﻿/, "").trim();
  if (!key) {
    console.log("contact: RESEND_API_KEY not set — enquiry not delivered");
    return json({ ok: false, message: MSG.unconfigured[lang] }, 503, h);
  }

  const to = env.CONTACT_TO || "sabaozmen@sabaozmen.av.tr";
  const from = env.CONTACT_FROM || "Saba Özmen Web Sitesi <form@sabaozmen.av.tr>";

  const rows = [
    ["Ad Soyad", d.name],
    ["E-posta", d.email],
    ["Telefon", d.phone || "—"],
    ["Konu", d.subject || "—"],
    ["Dil", lang.toUpperCase()],
  ];

  const html =
    `<h2 style="font-family:Georgia,serif">Web sitesinden yeni mesaj</h2>` +
    `<table style="font-family:system-ui;font-size:14px;border-collapse:collapse">` +
    rows.map(([k, v]) =>
      `<tr><td style="padding:4px 12px 4px 0;color:#777">${esc(k)}</td>` +
      `<td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`).join("") +
    `</table><hr style="border:0;border-top:1px solid #ddd;margin:16px 0">` +
    `<p style="font-family:system-ui;font-size:14px;white-space:pre-wrap">${esc(d.message)}</p>` +
    `<p style="font-family:system-ui;font-size:12px;color:#999">Yanıtla'ya bastığınızda cevabınız doğrudan gönderene gider.</p>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], reply_to: String(d.email),
        subject: `Web formu — ${String(d.subject || d.name).slice(0, 80)}`,
        html,
      }),
    });
    if (!r.ok) {
      console.log("contact: resend returned", r.status, await r.text());
      return json({ ok: false, message: MSG.err[lang] }, 502, h);
    }
  } catch (e) {
    console.log("contact: send failed —", e && e.message);
    return json({ ok: false, message: MSG.err[lang] }, 502, h);
  }

  return json({ ok: true, message: MSG.ok[lang] }, 200, h);
}

export async function onRequest({ request, env }) {
  const c = cors(request, env);
  if (!c.allowed) return new Response("Forbidden", { status: 403 });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: c.headers });
  if (request.method === "POST") return handlePost(request, env, c.headers);
  return new Response("Method Not Allowed", { status: 405, headers: Object.assign({ Allow: "POST, OPTIONS" }, c.headers) });
}
