/* Cloudflare Pages Function — contact form endpoint.
   Path: /api/contact  (Pages maps functions/api/contact.js automatically)

   The static site has no Node server, so the dev server's handler is replaced
   here. Same request and response shape, so public/js/main.js is unchanged.

   Configure in the Pages project (Settings → Environment variables):
     RESEND_API_KEY   secret — https://resend.com free tier: 100 mails/day
     CONTACT_TO       where enquiries go   (default sabaozmen@sabaozmen.av.tr)
     CONTACT_FROM     verified sender      (default onboarding@resend.dev)

   Without RESEND_API_KEY nothing is silently swallowed: the visitor is told
   plainly to write to the firm directly, and the attempt is logged.
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

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function onRequestPost({ request, env }) {
  let d = {};
  try {
    d = await request.json();
  } catch (e) {
    return json({ ok: false, message: MSG.err.tr }, 400);
  }

  const lang = ["tr", "en", "de"].includes(d.lang) ? d.lang : "tr";

  // honeypot — accept without storing or sending
  if (d.website) return json({ ok: true, message: MSG.ok[lang] });

  const valid =
    d.name && d.email && d.message && d.consent &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email)) &&
    String(d.message).length <= 5000 &&
    String(d.name).length <= 200;

  if (!valid) return json({ ok: false, message: MSG.err[lang] }, 400);

  const key = env.RESEND_API_KEY;
  if (!key) {
    console.log("contact: RESEND_API_KEY not set — enquiry from", d.email, "not delivered");
    return json({ ok: false, message: MSG.unconfigured[lang] }, 503);
  }

  const to = env.CONTACT_TO || "sabaozmen@sabaozmen.av.tr";
  const from = env.CONTACT_FROM || "Saba Özmen Web <onboarding@resend.dev>";

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
    `<p style="font-family:system-ui;font-size:14px;white-space:pre-wrap">${esc(d.message)}</p>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], reply_to: String(d.email),
        subject: `Web formu — ${String(d.name).slice(0, 80)}`,
        html,
      }),
    });
    if (!r.ok) {
      console.log("contact: resend returned", r.status, await r.text());
      return json({ ok: false, message: MSG.err[lang] }, 502);
    }
  } catch (e) {
    console.log("contact: send failed —", e && e.message);
    return json({ ok: false, message: MSG.err[lang] }, 502);
  }

  return json({ ok: true, message: MSG.ok[lang] });
}

/* Anything other than POST */
export async function onRequest({ request }) {
  if (request.method === "POST") return onRequestPost(arguments[0]);
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}
