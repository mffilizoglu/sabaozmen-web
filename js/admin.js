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
})();
