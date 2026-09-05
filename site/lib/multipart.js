"use strict";

/* Minimal multipart/form-data parser — the admin panel uploads portraits and
   event posters, and the server has no dependencies.

   Works on the raw Buffer rather than a string: converting binary image data
   through UTF-8 would corrupt it. Only what the panel actually needs is
   supported (no nested multipart, no chunked transfer-encoding). */

const MAX_BYTES = 8 * 1024 * 1024;      // 8 MB per request
const MAX_FILE = 6 * 1024 * 1024;       // 6 MB per file

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const cap = limit || MAX_BYTES;
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > cap) {
        reject(new Error("too-large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function indexOfBuf(hay, needle, from) {
  return hay.indexOf(needle, from);
}

/**
 * @returns {{fields: Object, files: Object}} fields are strings (repeated names
 * become arrays); files are {filename, type, data}.
 */
function parse(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || "");
  if (!m) throw new Error("no-boundary");
  const boundary = Buffer.from("--" + (m[1] || m[2]).trim());

  const fields = {};
  const files = {};

  let pos = indexOfBuf(buf, boundary, 0);
  if (pos === -1) throw new Error("bad-multipart");
  pos += boundary.length;

  while (pos < buf.length) {
    if (buf[pos] === 0x2d && buf[pos + 1] === 0x2d) break;          // closing "--"
    if (buf[pos] === 0x0d && buf[pos + 1] === 0x0a) pos += 2;       // CRLF after boundary

    const headEnd = indexOfBuf(buf, Buffer.from("\r\n\r\n"), pos);
    if (headEnd === -1) break;
    const head = buf.slice(pos, headEnd).toString("utf8");

    let next = indexOfBuf(buf, boundary, headEnd);
    if (next === -1) next = buf.length;
    // strip the CRLF that precedes the boundary
    let bodyEnd = next - 2;
    if (bodyEnd < headEnd + 4) bodyEnd = headEnd + 4;
    const body = buf.slice(headEnd + 4, bodyEnd);

    const nameM = /name="([^"]*)"/i.exec(head);
    const fileM = /filename="([^"]*)"/i.exec(head);
    const typeM = /Content-Type:\s*([^\r\n]+)/i.exec(head);

    if (nameM) {
      const name = nameM[1];
      if (fileM) {
        if (fileM[1] && body.length) {
          if (body.length > MAX_FILE) throw new Error("file-too-large");
          files[name] = {
            filename: fileM[1],
            type: (typeM ? typeM[1] : "application/octet-stream").trim(),
            data: body,
          };
        }
      } else {
        const v = body.toString("utf8");
        if (Object.prototype.hasOwnProperty.call(fields, name)) {
          if (!Array.isArray(fields[name])) fields[name] = [fields[name]];
          fields[name].push(v);
        } else {
          fields[name] = v;
        }
      }
    }
    pos = next + boundary.length;
  }
  return { fields, files };
}

/** Parse a urlencoded body into the same {fields} shape. */
function parseUrlEncoded(buf) {
  const fields = {};
  new URLSearchParams(buf.toString("utf8")).forEach((v, k) => {
    if (Object.prototype.hasOwnProperty.call(fields, k)) {
      if (!Array.isArray(fields[k])) fields[k] = [fields[k]];
      fields[k].push(v);
    } else {
      fields[k] = v;
    }
  });
  return { fields, files: {} };
}

async function parseRequest(req) {
  const ct = req.headers["content-type"] || "";
  const buf = await readBody(req);
  if (ct.startsWith("multipart/form-data")) return parse(buf, ct);
  return parseUrlEncoded(buf);
}

/* Image sniffing: trust the bytes, not the supplied Content-Type or extension. */
const SIGS = [
  { ext: ".jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: ".png", type: "image/png", test: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: ".gif", type: "image/gif", test: (b) => b.slice(0, 6).toString("latin1").match(/^GIF8[79]a$/) },
  { ext: ".webp", type: "image/webp", test: (b) => b.slice(0, 4).toString("latin1") === "RIFF" && b.slice(8, 12).toString("latin1") === "WEBP" },
];

function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  for (const s of SIGS) if (s.test(buf)) return s;
  return null;
}

module.exports = { parseRequest, parse, sniffImage, MAX_FILE };
