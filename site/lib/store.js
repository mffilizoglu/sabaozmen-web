"use strict";

/* Editable content store.
   Team members and events live in JSON files rather than in data.js so the
   admin panel can rewrite them. Reads are cached and invalidated by mtime, so
   editing a file by hand while the server runs is picked up without a restart.
   Writes go to a temp file and are renamed into place, so a crash mid-write
   cannot leave a truncated file behind. */

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "content");
const cache = new Map();

function file(name) {
  return path.join(DIR, name + ".json");
}

function read(name, fallback) {
  const f = file(name);
  let st;
  try {
    st = fs.statSync(f);
  } catch (e) {
    return JSON.parse(JSON.stringify(fallback));
  }
  const hit = cache.get(name);
  if (hit && hit.mtime === st.mtimeMs) return hit.data;
  let data;
  try {
    data = JSON.parse(fs.readFileSync(f, "utf8"));
  } catch (e) {
    console.error("  ! %s.json is not valid JSON (%s) — using last good copy", name, e.message);
    return hit ? hit.data : JSON.parse(JSON.stringify(fallback));
  }
  cache.set(name, { mtime: st.mtimeMs, data });
  return data;
}

function write(name, data) {
  const f = file(name);
  const tmp = f + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1), "utf8");
  fs.renameSync(tmp, f);
  cache.delete(name);
  return data;
}

/* ------------------------------------------------------------------ team */
const team = {
  all() {
    const d = read("team", { team: [] });
    return (d.team || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  published() {
    return team.all().filter((m) => m.published !== false);
  },
  bySlug(slug) {
    return team.all().find((m) => m.slug === slug) || null;
  },
  save(list) {
    return write("team", { team: list });
  },
};

/* ---------------------------------------------------------------- events */
const EVENT_TYPES = ["tv", "konferans", "kongre", "etkinlik"];

const events = {
  all() {
    const d = read("events", { events: [] });
    return (d.events || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  },
  published() {
    return events.all().filter((e) => e.published !== false);
  },
  bySlug(slug) {
    return events.all().find((e) => e.slug === slug) || null;
  },
  save(list) {
    return write("events", { events: list });
  },
};

/* ----------------------------------------------------------------- utils */
const TR_MAP = {
  "ı": "i", "İ": "i", "ş": "s", "Ş": "s", "ğ": "g", "Ğ": "g",
  "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c", "â": "a", "î": "i", "û": "u",
};

function slugify(s, maxLen) {
  const out = String(s || "")
    .split("").map((c) => (TR_MAP[c] !== undefined ? TR_MAP[c] : c)).join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return out.slice(0, maxLen || 70).replace(/-+$/, "") || "kayit";
}

/** Make `slug` unique against `taken`, ignoring `selfSlug` (for edits). */
function uniqueSlug(slug, taken, selfSlug) {
  const set = new Set(taken.filter((s) => s !== selfSlug));
  if (!set.has(slug)) return slug;
  let n = 2;
  while (set.has(slug + "-" + n)) n++;
  return slug + "-" + n;
}

module.exports = { team, events, EVENT_TYPES, slugify, uniqueSlug, read, write };
