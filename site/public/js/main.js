/* Saba Özmen — interaction layer.
   Everything degrades gracefully: without JS the site is fully readable. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Header: solid-on-scroll, hide-on-scroll-down
     --------------------------------------------------------- */
  var hdr = document.querySelector(".hdr");
  var hero = document.querySelector(".hero, .phero");
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      var overPoint = hero ? Math.max(hero.offsetHeight - 120, 80) : 40;
      var solid = y > 24;
      hdr.classList.toggle("hdr--solid", solid);
      // keep the light-on-dark treatment only while genuinely over the hero
      hdr.classList.toggle("hdr--over", !!hero && y < overPoint && !solid);

      if (!document.body.classList.contains("menu-open")) {
        var down = y > lastY && y > 400;
        hdr.classList.toggle("hdr--hide", down);
      }
    }

    // parallax on the hero image
    if (!reduced) {
      var bg = document.querySelector(".hero__bg img");
      if (bg && y < window.innerHeight * 1.2) {
        bg.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0) scale(" + (1 + y * 0.00012).toFixed(4) + ")";
      }
    }

    // reading progress
    var bar = document.querySelector(".progress");
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? ((y / h) * 100).toFixed(2) + "%" : "0%";
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  var revealables = document.querySelectorAll(".rv");
  if (revealables.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

      // stagger siblings inside a shared container
      var groups = {};
      revealables.forEach(function (el) {
        var p = el.parentNode;
        // Landing part-way down the page (refresh, anchor, back button): anything
        // already scrolled past is shown at once rather than left invisible.
        if (window.scrollY > 0 && el.getBoundingClientRect().bottom < 0) {
          el.classList.add("is-in");
          return;
        }
        if (!el.style.getPropertyValue("--d")) {
          var key = p.__rvKey || (p.__rvKey = "g" + Math.random().toString(36).slice(2));
          groups[key] = (groups[key] || 0);
          if (el.dataset.stagger !== "off") {
            el.style.setProperty("--d", Math.min(groups[key] * 70, 420) + "ms");
          }
          groups[key]++;
        }
        io.observe(el);
      });
    }
  }

  /* Hero entrance on load */
  var heroEl = document.querySelector(".hero");
  if (heroEl) {
    heroEl.querySelectorAll(".rv-h").forEach(function (el, i) {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i * 110) + "ms");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroEl.classList.add("is-ready"); });
    });
  }

  /* ---------------------------------------------------------
     Mobile drawer
     --------------------------------------------------------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && hdr) hdr.classList.remove("hdr--hide");
    });
    document.querySelectorAll(".drawer a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Language menu
     --------------------------------------------------------- */
  var lang = document.querySelector(".lang");
  if (lang) {
    var lbtn = lang.querySelector(".lang__btn");
    lbtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = lang.classList.toggle("is-open");
      lbtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function () {
      lang.classList.remove("is-open");
      lbtn.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.body.classList.remove("menu-open");
    if (lang) lang.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  });

  /* ---------------------------------------------------------
     Article archive: search + topic filter + year filter
     --------------------------------------------------------- */
  var list = document.querySelector("[data-archive]");
  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll(".art-item"));
    var input = document.querySelector("[data-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-topic]"));
    var countEl = document.querySelector("[data-count]");
    var emptyEl = document.querySelector("[data-empty]");
    var activeTopic = "";

    function norm(s) {
      return (s || "").toLocaleLowerCase("tr")
        .replace(/[ıİ]/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g")
        .replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[çÇ]/g, "c")
        .replace(/[âÂ]/g, "a");
    }

    function apply() {
      var q = norm(input ? input.value.trim() : "");
      var shown = 0;
      items.forEach(function (li) {
        var hay = norm(li.dataset.search || "");
        var topics = (li.dataset.topics || "").split(" ");
        var okQ = !q || hay.indexOf(q) !== -1;
        var okT = !activeTopic || topics.indexOf(activeTopic) !== -1;
        var vis = okQ && okT;
        li.classList.toggle("is-out", !vis);
        if (vis) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (emptyEl) emptyEl.hidden = shown !== 0;
    }

    if (input) {
      var t;
      input.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(apply, 120);
      });
    }

    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var v = c.dataset.topic;
        activeTopic = (activeTopic === v) ? "" : v;
        chips.forEach(function (o) {
          o.setAttribute("aria-pressed", o.dataset.topic === activeTopic ? "true" : "false");
        });
        apply();
      });
    });

    apply();
  }

  /* ---------------------------------------------------------
     Cookie consent — genuine choice, stored per visitor
     --------------------------------------------------------- */
  var cookie = document.querySelector(".cookie");
  if (cookie) {
    var KEY = "so_consent_v1";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }

    if (!stored) {
      setTimeout(function () { cookie.classList.add("is-in"); }, 900);
    } else {
      cookie.remove();
    }

    cookie.addEventListener("click", function (e) {
      var b = e.target.closest("[data-consent]");
      if (!b) return;
      try { localStorage.setItem(KEY, b.dataset.consent); } catch (err) { /* ignore */ }
      cookie.classList.remove("is-in");
      setTimeout(function () { cookie.remove(); }, 700);
    });
  }

  /* ---------------------------------------------------------
     Contact form — validate, then POST as JSON
     --------------------------------------------------------- */
  var form = document.querySelector("[data-contact]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var bad = !f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        if (f.type === "checkbox") bad = !f.checked;
        var wrap = f.closest(".field") || f.closest(".consent");
        if (wrap) wrap.classList.toggle("is-bad", bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var out = document.querySelector("[data-formmsg]");
      var btn = form.querySelector("button[type=submit]");
      var body = {};
      new FormData(form).forEach(function (v, k) { body[k] = v; });
      if (btn) { btn.disabled = true; btn.dataset.was = btn.textContent; btn.textContent = form.dataset.sending || "…"; }

      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (r) { return r.json(); })
        .then(function (d) {
          if (out) {
            out.className = "form-msg " + (d.ok ? "form-msg--ok" : "form-msg--bad");
            out.textContent = d.message;
            out.hidden = false;
          }
          if (d.ok) form.reset();
        })
        .catch(function () {
          if (out) {
            out.className = "form-msg form-msg--bad";
            out.textContent = form.dataset.error || "Bir hata oluştu.";
            out.hidden = false;
          }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.was; }
        });
    });
  }

  /* ---------------------------------------------------------
     Archive filters: collapsed on small screens so the article
     list is reachable without scrolling past nineteen chips.
     Rendered open, so it still works with JS disabled.
     --------------------------------------------------------- */
  var filterBox = document.querySelector("[data-filterbox]");
  if (filterBox) {
    var narrow = window.matchMedia("(max-width: 760px)");
    var applyFilterBox = function (m) {
      if (m.matches) filterBox.removeAttribute("open");
      else filterBox.setAttribute("open", "");
    };
    applyFilterBox(narrow);
    (narrow.addEventListener ? narrow.addEventListener("change", applyFilterBox)
                             : narrow.addListener(applyFilterBox));
  }

  /* ---------------------------------------------------------
     Dropdown on touch: there is no hover, so the first tap opens
     --------------------------------------------------------- */
  if (window.matchMedia("(hover: none)").matches) {
    document.querySelectorAll(".nav__item").forEach(function (item) {
      var menu = item.querySelector(".nav__menu");
      var trigger = item.querySelector(".nav__link");
      if (!menu || !trigger) return;
      trigger.addEventListener("click", function (e) {
        if (!item.classList.contains("is-open")) {
          e.preventDefault();
          document.querySelectorAll(".nav__item.is-open").forEach(function (o) { o.classList.remove("is-open"); });
          item.classList.add("is-open");
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav__item")) {
        document.querySelectorAll(".nav__item.is-open").forEach(function (o) { o.classList.remove("is-open"); });
      }
    });
  }

  /* ---------------------------------------------------------
     Events: filter by type
     --------------------------------------------------------- */
  var evGrid = document.querySelector("[data-evgrid]");
  if (evGrid) {
    var cards = Array.prototype.slice.call(evGrid.querySelectorAll(".ev-card"));
    var evChips = Array.prototype.slice.call(document.querySelectorAll("[data-evtype]"));
    var evCount = document.querySelector("[data-evcount]");
    var evEmpty = document.querySelector("[data-evempty]");
    var activeType = "";
    evChips.forEach(function (c) {
      c.addEventListener("click", function () {
        var v = c.dataset.evtype;
        activeType = (activeType === v) ? "" : v;
        evChips.forEach(function (o) {
          o.setAttribute("aria-pressed", o.dataset.evtype === activeType ? "true" : "false");
        });
        var shown = 0;
        cards.forEach(function (card) {
          var vis = !activeType || card.dataset.evtype === activeType;
          card.classList.toggle("is-out", !vis);
          if (vis) shown++;
        });
        if (evCount) evCount.textContent = shown;
        if (evEmpty) evEmpty.hidden = shown !== 0;
      });
    });
  }

  /* ---------------------------------------------------------
     Count-up for statistics
     --------------------------------------------------------- */
  var nums = document.querySelectorAll("[data-countto]");
  if (nums.length && !reduced && "IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = parseInt(el.dataset.countto, 10), start = null;
        var suffix = el.dataset.suffix || "";
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(to * eased) + (p === 1 ? suffix : "");
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        nio.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { nio.observe(n); });
  }
})();
