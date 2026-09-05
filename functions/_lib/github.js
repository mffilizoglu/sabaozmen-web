/* GitHub Contents API — the admin panel's storage.

   Why the repo rather than KV: the public pages are pre-rendered at build time.
   If content lived in KV the build could not see it without its own credentials,
   and the alternative (rendering those pages in Workers) would mean porting the
   whole template layer. Committing to the repo instead makes the existing,
   already-tested build the single renderer, gives every content change a version
   history, and costs only the ~60–90s a Pages rebuild takes.

   Needs a fine-grained token with Contents: read and write on this repo, set as
   the GITHUB_TOKEN secret in the Pages project.
*/

const API = "https://api.github.com";

function headers(env) {
  return {
    Authorization: "Bearer " + env.GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // GitHub rejects API requests without a User-Agent
    "User-Agent": "sabaozmen-admin",
  };
}

export function repoConfig(env) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  if (!owner || !repo || !env.GITHUB_TOKEN) return null;
  return { owner, repo, branch };
}

/** Read a file. Returns {json|text, sha} or null when the file does not exist. */
export async function getFile(env, path) {
  const c = repoConfig(env);
  if (!c) throw new Error("GitHub is not configured");
  const url = `${API}/repos/${c.owner}/${c.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(c.branch)}`;
  const r = await fetch(url, { headers: headers(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub read failed (${r.status}): ${await r.text()}`);
  const d = await r.json();
  // content is base64 with newlines
  const bytes = Uint8Array.from(atob(d.content.replace(/\n/g, "")), (ch) => ch.charCodeAt(0));
  return { bytes, text: new TextDecoder().decode(bytes), sha: d.sha };
}

export async function getJson(env, path, fallback) {
  const f = await getFile(env, path);
  if (!f) return { data: fallback, sha: null };
  try {
    return { data: JSON.parse(f.text), sha: f.sha };
  } catch (e) {
    throw new Error(`${path} is not valid JSON: ${e.message}`);
  }
}

function toBase64(bytes) {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

/**
 * Create or update a file.
 * @param {Uint8Array|string} content
 * @param {string|null} sha  required by GitHub when replacing an existing file
 */
export async function putFile(env, path, content, message, sha) {
  const c = repoConfig(env);
  if (!c) throw new Error("GitHub is not configured");
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const url = `${API}/repos/${c.owner}/${c.repo}/contents/${encodeURI(path)}`;
  const body = {
    message,
    content: toBase64(bytes),
    branch: c.branch,
    committer: { name: "Saba Özmen Yönetim", email: "noreply@sabaozmen.av.tr" },
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, { method: "PUT", headers: headers(env), body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    // 409 means someone else committed between our read and write
    if (r.status === 409) throw new Error("conflict");
    throw new Error(`GitHub write failed (${r.status}): ${t}`);
  }
  return r.json();
}

export async function deleteFile(env, path, message, sha) {
  const c = repoConfig(env);
  if (!c || !sha) return;
  const url = `${API}/repos/${c.owner}/${c.repo}/contents/${encodeURI(path)}`;
  await fetch(url, {
    method: "DELETE",
    headers: headers(env),
    body: JSON.stringify({ message, sha, branch: c.branch }),
  });
}

/** Commit several files in one commit, via the git data API. */
export async function commitFiles(env, files, message) {
  const c = repoConfig(env);
  if (!c) throw new Error("GitHub is not configured");
  const base = `${API}/repos/${c.owner}/${c.repo}`;
  const h = headers(env);
  const j = async (r) => {
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
    return r.json();
  };

  const ref = await j(await fetch(`${base}/git/ref/heads/${c.branch}`, { headers: h }));
  const headSha = ref.object.sha;
  const headCommit = await j(await fetch(`${base}/git/commits/${headSha}`, { headers: h }));

  const tree = [];
  for (const f of files) {
    if (f.delete) {
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const bytes = typeof f.content === "string" ? new TextEncoder().encode(f.content) : f.content;
    const blob = await j(await fetch(`${base}/git/blobs`, {
      method: "POST", headers: h,
      body: JSON.stringify({ content: toBase64(bytes), encoding: "base64" }),
    }));
    tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const newTree = await j(await fetch(`${base}/git/trees`, {
    method: "POST", headers: h,
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  }));

  const commit = await j(await fetch(`${base}/git/commits`, {
    method: "POST", headers: h,
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  }));

  await j(await fetch(`${base}/git/refs/heads/${c.branch}`, {
    method: "PATCH", headers: h,
    body: JSON.stringify({ sha: commit.sha }),
  }));

  return commit.sha;
}
