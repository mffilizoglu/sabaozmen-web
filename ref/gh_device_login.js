/* GitHub device-flow login.

   `gh auth login` needs an interactive terminal, which this session does not
   have. The device flow is what gh itself uses underneath: we ask GitHub for a
   short code, the user types it into one page in their browser, and we poll
   until they approve. Same OAuth app as the GitHub CLI.

   Usage:
     node gh_device_login.js start   -> prints the URL and code
     node gh_device_login.js poll    -> waits for approval, saves the token
*/

const fs = require("fs");
const path = require("path");

const CLIENT_ID = "178c6fc778ccc68e1d6a";            // GitHub CLI's public OAuth app
const SCOPES = "repo read:org workflow";
const STATE = path.join(__dirname, ".gh_device.json");
const TOKEN = path.join(__dirname, ".gh_token");      // git-ignored

async function start() {
  const r = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPES }),
  });
  const d = await r.json();
  if (!d.device_code) throw new Error("device code request failed: " + JSON.stringify(d));
  fs.writeFileSync(STATE, JSON.stringify(d), "utf8");
  console.log("URL :", d.verification_uri);
  console.log("CODE:", d.user_code);
  console.log("expires in", Math.round(d.expires_in / 60), "minutes");
}

async function poll() {
  const d = JSON.parse(fs.readFileSync(STATE, "utf8"));
  const deadline = Date.now() + (d.expires_in || 900) * 1000;
  let interval = (d.interval || 5) * 1000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, interval));
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: d.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });
    const j = await r.json();
    if (j.access_token) {
      fs.writeFileSync(TOKEN, j.access_token, "utf8");
      try { fs.chmodSync(TOKEN, 0o600); } catch (e) { /* best effort on Windows */ }
      // who did we just authenticate as?
      const me = await fetch("https://api.github.com/user", {
        headers: { Authorization: "Bearer " + j.access_token, "User-Agent": "sabaozmen-setup" },
      }).then((x) => x.json());
      console.log("AUTHORISED as", me.login, "(" + (me.name || "") + ")");
      fs.unlinkSync(STATE);
      return;
    }
    if (j.error === "authorization_pending") continue;
    if (j.error === "slow_down") { interval += 5000; continue; }
    if (j.error === "expired_token") throw new Error("code expired — run start again");
    if (j.error === "access_denied") throw new Error("access denied in the browser");
    throw new Error("unexpected: " + JSON.stringify(j));
  }
  throw new Error("timed out waiting for approval");
}

const cmd = process.argv[2];
(cmd === "poll" ? poll() : start()).catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
