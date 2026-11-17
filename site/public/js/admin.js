/* Admin panel behaviour: confirm destructive actions, filter the article
   pickers, preview a chosen image before saving. */
(function () {
  "use strict";

  /* Delete buttons ask first. */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-confirm]");
    if (!b) return;
    if (!window.confirm(b.dataset.confirm)) e.preventDefault();
  });

  /* Turkish-aware fold so "muge" matches "Müge". */
  function norm(s) {
    return (s || "").toLocaleLowerCase("tr")
      .replace(/[ıİ]/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g")
      .replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[çÇ]/g, "c")
      .replace(/[âÂ]/g, "a");
  }

  document.querySelectorAll("[data-filter]").forEach(function (input) {
    var list = document.querySelector(input.dataset.filter);
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".ad-pick, [data-text]"));
    input.addEventListener("input", function () {
      var q = norm(input.value.trim());
      items.forEach(function (li) {
        li.classList.toggle("is-out", !!q && norm(li.dataset.text).indexOf(q) === -1);
      });
    });
  });

  /* Catch an oversized file before a long upload that would only be refused,
     and show that a large upload is in progress. */
  document.querySelectorAll("form.ad-form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      var big = Array.prototype.filter.call(f.querySelectorAll("input[type=file][data-maxmb]"), function (i) {
        return i.files && i.files[0] && i.files[0].size > Number(i.dataset.maxmb) * 1024 * 1024;
      })[0];
      if (big) {
        e.preventDefault();
        window.alert("Dosya çok büyük (en fazla " + big.dataset.maxmb + " MB). Lütfen küçültüp tekrar deneyin.");
        return;
      }
      var btn = e.submitter;
      if (btn && !btn.formAction.match(/\/sil$/)) { btn.textContent = "Kaydediliyor…"; }
      f.classList.add("ad-busy");
    });
  });

  /* Show the picked file straight away rather than after a save. */
  document.querySelectorAll('input[type=file]').forEach(function (input) {
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var wrap = input.closest(".ad-photo");
      var prev = wrap && wrap.querySelector(".ad-photo__prev");
      if (!prev) return;
      var url = URL.createObjectURL(f);
      prev.innerHTML = '<img alt=""><span class="ad-small ad-muted">Yüklenecek: ' +
        f.name.replace(/[<>&]/g, "") + "</span>";
      prev.querySelector("img").src = url;
    });
  });

  /* Warn before leaving a form with unsaved edits. */
  var form = document.querySelector(".ad-form");
  if (form) {
    var dirty = false;
    form.addEventListener("input", function () { dirty = true; });
    form.addEventListener("submit", function () { dirty = false; });
    window.addEventListener("beforeunload", function (e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    });
  }
  /* ---------------------------------------------------------------
     Profile text editor. Each <textarea class="ad-rte-src"> becomes a
     formatting editor; the textarea stays as the form field and is kept
     in sync. The server cleans the HTML again on save (sanitizeRich), so
     this only has to produce the same small set of tags and classes:
     p h2 h3 strong em u br ul ol li a · al-* fs-* lh-*
     --------------------------------------------------------------- */
  var CLASS_GROUPS = {
    al: ["al-left", "al-center", "al-right", "al-justify"],
    fs: ["fs-sm", "fs-lg"],
    lh: ["lh-tight", "lh-loose"]
  };
  var ALLOWED_CLASSES = CLASS_GROUPS.al.concat(CLASS_GROUPS.fs, CLASS_GROUPS.lh);
  var MAP = { B: "strong", STRONG: "strong", I: "em", EM: "em", U: "u", P: "p", DIV: "p",
    H1: "h2", H2: "h2", H3: "h3", H4: "h3", H5: "h3", H6: "h3", UL: "ul", OL: "ol", LI: "li", A: "a" };
  var BLOCKS = { p: 1, h2: 1, h3: 1, li: 1 };
  var SKIP = /^(SCRIPT|STYLE|HEAD|TITLE|META|LINK|XML|TEMPLATE|IFRAME|OBJECT|SVG|NOSCRIPT)$/;

  /* Pasted HTML (Word, web pages) reduced to the whitelist, keeping
     headings, bold, italic, underline, lists and alignment. */
  function cleanNode(src, doc) {
    var frag = doc.createDocumentFragment();
    Array.prototype.forEach.call(src.childNodes, function (n) {
      if (n.nodeType === 3) { frag.appendChild(doc.createTextNode(n.nodeValue.replace(/\s+/g, " "))); return; }
      if (n.nodeType !== 1 || SKIP.test(n.nodeName) || /^O:|^W:|^V:/.test(n.nodeName)) return;
      if (n.nodeName === "BR") { frag.appendChild(doc.createElement("br")); return; }
      var tag = MAP[n.nodeName], st = (n.getAttribute("style") || "").toLowerCase(), el = null, inner = el;
      if (tag === "a") {
        var href = n.getAttribute("href") || "";
        if (/^(https?:|mailto:)/i.test(href)) { el = doc.createElement("a"); el.setAttribute("href", href); }
      } else if (tag) {
        el = doc.createElement(tag);
        if (BLOCKS[tag]) {
          var al = /text-align\s*:\s*(left|center|right|justify)/.exec(st) || /^(left|center|right|justify)$/i.exec(n.getAttribute("align") || "");
          if (al) el.className = "al-" + al[1].toLowerCase();
          (n.className || "").toString().split(/\s+/).forEach(function (c) {
            if (ALLOWED_CLASSES.indexOf(c) !== -1) el.classList.add(c);
          });
        }
      }
      inner = el;
      // Word marks bold / italic / underline with styles on spans
      ["strong", "em", "u"].forEach(function (w) {
        var on = w === "strong" ? /font-weight\s*:\s*(bold|[6-9]00)/.test(st)
          : w === "em" ? /font-style\s*:\s*italic/.test(st) : /text-decoration[^;]*underline/.test(st);
        if (on && tag !== w) {
          var x = doc.createElement(w);
          if (inner) inner.appendChild(x); else el = x;
          inner = x;
        }
      });
      var kids = cleanNode(n, doc);
      if (inner) { inner.appendChild(kids); frag.appendChild(el); } else frag.appendChild(kids);
    });
    return frag;
  }
  function cleanHtml(html) {
    var parsed = new DOMParser().parseFromString(html, "text/html");
    var box = document.createElement("div");
    box.appendChild(cleanNode(parsed.body, document));
    return box.innerHTML.replace(/<(p|h2|h3|li)[^>]*>(\s|&nbsp;|<br>)*<\/\1>/g, "");
  }
  function textToHtml(t) {
    return t.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var d = document.createElement("p"); d.textContent = l; return d.outerHTML;
    }).join("");
  }

  function makeEditor(src) {
    var wrap = document.createElement("div");
    wrap.className = "ad-rte";
    var B = function (cmd, label, title, extra) {
      return '<button type="button" class="ad-rte__b" data-cmd="' + cmd + '"' + (extra || "") +
        ' title="' + title + '" aria-label="' + title + '">' + label + "</button>";
    };
    var S = function (cmd, title, opts) {
      return '<label class="ad-rte__sel" title="' + title + '"><select data-cmd="' + cmd + '" aria-label="' + title + '">' +
        opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("") + "</select></label>";
    };
    wrap.innerHTML =
      '<div class="ad-rte__bar" role="toolbar" aria-label="Biçimlendirme">' +
        S("block", "Paragraf stili", [["p", "Paragraf"], ["h2", "Başlık"], ["h3", "Alt başlık"]]) +
        '<span class="ad-rte__sep"></span>' +
        B("bold", "<b>K</b>", "Kalın (Ctrl+B)") + B("italic", "<i>İ</i>", "İtalik (Ctrl+I)") + B("underline", "<u>A</u>", "Altı çizili (Ctrl+U)") +
        '<span class="ad-rte__sep"></span>' +
        B("al-left", ico("left"), "Sola yasla") + B("al-center", ico("center"), "Ortala") +
        B("al-right", ico("right"), "Sağa yasla") + B("al-justify", ico("justify"), "İki yana yasla") +
        '<span class="ad-rte__sep"></span>' +
        B("insertUnorderedList", ico("ul"), "Madde işaretli liste") + B("insertOrderedList", ico("ol"), "Numaralı liste") +
        '<span class="ad-rte__sep"></span>' +
        S("fs", "Yazı boyutu", [["", "Boyut: Normal"], ["fs-sm", "Boyut: Küçük"], ["fs-lg", "Boyut: Büyük"]]) +
        S("lh", "Satır aralığı", [["", "Satır aralığı: Normal"], ["lh-tight", "Satır aralığı: Dar"], ["lh-loose", "Satır aralığı: Geniş"]]) +
        '<span class="ad-rte__sep"></span>' +
        B("clear", "Biçimi temizle", "Seçili metnin biçimini temizle", ' data-wide="1"') +
      "</div>" +
      '<div class="ad-rte__ed bio" contenteditable="true" spellcheck="true"></div>';
    src.parentNode.insertBefore(wrap, src);
    src.hidden = true;
    var ed = wrap.querySelector(".ad-rte__ed");
    ed.setAttribute("lang", (src.name.split("_")[1] || "tr"));
    ed.innerHTML = src.value.trim() || "<p><br></p>";

    var sync = function () {
      var html = ed.innerHTML.replace(/<p><br><\/p>$/, "");
      if (src.value !== html) { src.value = html; src.dispatchEvent(new Event("input", { bubbles: true })); }
    };
    var exec = function (cmd, val) {
      ed.focus();
      try { document.execCommand("styleWithCSS", false, false); } catch (e) { /* older browsers */ }
      document.execCommand(cmd, false, val || null);
      sync(); refresh();
    };
    var blocks = function () {
      var sel = window.getSelection();
      if (!sel.rangeCount || !ed.contains(sel.anchorNode)) return [];
      var r = sel.getRangeAt(0);
      var found = Array.prototype.filter.call(ed.querySelectorAll("p, h2, h3, li"), function (el) { return r.intersectsNode(el); });
      // innermost only: a paragraph inside a list item is styled, not both
      return found.filter(function (el) { return !found.some(function (o) { return o !== el && el.contains(o); }); });
    };
    var setClass = function (group, cls) {
      var bs = blocks();
      if (!bs.length) { exec("formatBlock", "p"); bs = blocks(); }
      bs.forEach(function (el) {
        CLASS_GROUPS[group].forEach(function (c) { el.classList.remove(c); });
        if (cls) el.classList.add(cls);
        if (!el.className) el.removeAttribute("class");
      });
      sync(); refresh();
    };
    var refresh = function () {
      ["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"].forEach(function (c) {
        var b = wrap.querySelector('[data-cmd="' + c + '"]');
        var on = false; try { on = document.queryCommandState(c); } catch (e) { /* ignore */ }
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var first = blocks()[0];
      CLASS_GROUPS.al.forEach(function (c) {
        wrap.querySelector('[data-cmd="' + c + '"]').setAttribute("aria-pressed", first && first.classList.contains(c) ? "true" : "false");
      });
      var blk = wrap.querySelector('[data-cmd="block"]');
      blk.value = first && /^H[23]$/.test(first.nodeName) ? first.nodeName.toLowerCase() : "p";
      ["fs", "lh"].forEach(function (g) {
        var s = wrap.querySelector('[data-cmd="' + g + '"]');
        s.value = first ? (CLASS_GROUPS[g].filter(function (c) { return first.classList.contains(c); })[0] || "") : "";
      });
    };

    wrap.querySelector(".ad-rte__bar").addEventListener("mousedown", function (e) {
      if (e.target.closest("button")) e.preventDefault();        // keep the text selection
    });
    wrap.querySelector(".ad-rte__bar").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cmd]");
      if (!b) return;
      var c = b.dataset.cmd;
      if (c.indexOf("al-") === 0) setClass("al", b.getAttribute("aria-pressed") === "true" ? "" : c);
      else if (c === "clear") {
        exec("removeFormat");
        blocks().forEach(function (el) { el.removeAttribute("class"); });
        exec("formatBlock", "p");
      } else exec(c);
    });
    wrap.querySelector(".ad-rte__bar").addEventListener("change", function (e) {
      var s = e.target.closest("select[data-cmd]");
      if (!s) return;
      if (s.dataset.cmd === "block") exec("formatBlock", s.value);
      else setClass(s.dataset.cmd, s.value);
      ed.focus();
    });
    ed.addEventListener("input", sync);
    ed.addEventListener("keyup", refresh);
    ed.addEventListener("mouseup", refresh);
    ed.addEventListener("focus", function () {
      try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) { /* ignore */ }
    });
    ed.addEventListener("paste", function (e) {
      var cd = e.clipboardData;
      if (!cd) return;
      e.preventDefault();
      var html = cd.getData("text/html");
      var out = html ? cleanHtml(html) : textToHtml(cd.getData("text/plain"));
      document.execCommand("insertHTML", false, out);
      sync();
    });
    src.form && src.form.addEventListener("submit", sync);
  }

  function ico(k) {
    var lines = {
      left: [[2, 14], [2, 10], [2, 14], [2, 8]], center: [[2, 14], [4, 12], [2, 14], [5, 11]],
      right: [[2, 14], [6, 14], [2, 14], [8, 14]], justify: [[2, 14], [2, 14], [2, 14], [2, 14]]
    }[k];
    if (lines) {
      return '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' + lines.map(function (l, i) {
        return '<line x1="' + l[0] + '" x2="' + l[1] + '" y1="' + (3 + i * 3.3) + '" y2="' + (3 + i * 3.3) + '" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
      }).join("") + "</svg>";
    }
    var mark = k === "ul"
      ? '<circle cx="3" cy="4" r="1.3"/><circle cx="3" cy="8" r="1.3"/><circle cx="3" cy="12" r="1.3"/>'
      : '<text x="0.5" y="5.6" font-size="5" font-family="sans-serif">1</text><text x="0.5" y="9.6" font-size="5" font-family="sans-serif">2</text><text x="0.5" y="13.6" font-size="5" font-family="sans-serif">3</text>';
    return '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">' + mark +
      '<line x1="6.5" x2="14.5" y1="4" y2="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="6.5" x2="14.5" y1="8" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="6.5" x2="14.5" y1="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  document.querySelectorAll("textarea.ad-rte-src").forEach(makeEditor);
})();
