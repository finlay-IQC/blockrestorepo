/* =========================================================
   Block Restoration — funnel behaviour
   Vanilla JS. No dependencies.
   - UTM / click-id capture + preservation across the funnel
   - Sticky mobile CTA after the hero
   - FAQ accordion
   - Footer year
   ========================================================= */
(function () {
  "use strict";

  var TRACK_KEYS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "fbclid", "gclid", "ttclid", "msclkid"
  ];
  var STORAGE_KEY = "br_tracking";

  /* ---------- 1. Capture + persist tracking params ---------- */
  function captureTracking() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { stored = {}; }

    var params = new URLSearchParams(window.location.search);
    var changed = false;
    TRACK_KEYS.forEach(function (key) {
      var val = params.get(key);
      if (val) { stored[key] = val; changed = true; }
    });

    if (changed) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); }
      catch (e) { /* storage unavailable — ignore */ }
    }
    return stored;
  }

  function toQueryString(obj) {
    var parts = [];
    Object.keys(obj).forEach(function (k) {
      if (obj[k]) parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
    });
    return parts.join("&");
  }

  /* Append tracking to internal .html links so params survive navigation. */
  function decorateInternalLinks(tracking) {
    var qs = toQueryString(tracking);
    if (!qs) return;
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      // internal same-site page links only (skip anchors, tel:, mailto:, external)
      if (/^(#|tel:|mailto:|https?:|\/\/)/i.test(href)) return;
      if (!/\.html(\?|$)/i.test(href)) return;
      a.setAttribute("href", href + (href.indexOf("?") === -1 ? "?" : "&") + qs);
    });
  }

  /* Pass tracking into the embedded GHL form via its iframe query string.
     GoHighLevel prefills matching hidden fields from URL params. */
  function decorateFormIframe(tracking) {
    var qs = toQueryString(tracking);
    if (!qs) return;
    var frames = document.querySelectorAll('iframe[src*="leadconnectorhq.com"]');
    frames.forEach(function (frame) {
      var src = frame.getAttribute("src");
      if (!src) return;
      frame.setAttribute("src", src + (src.indexOf("?") === -1 ? "?" : "&") + qs);
    });
  }

  /* ---------- 2. Sticky mobile CTA after hero ---------- */
  function initStickyCta() {
    var sticky = document.getElementById("stickyCta");
    var hero = document.querySelector(".hero, .ty-hero");
    if (!sticky || !hero) return;

    function onScroll() {
      var past = hero.getBoundingClientRect().bottom < 0;
      sticky.classList.toggle("show", past);
      sticky.setAttribute("aria-hidden", past ? "false" : "true");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3. FAQ accordion ---------- */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      var ans = item.querySelector(".faq-a");
      if (!btn || !ans) return;
      btn.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : null;
      });
    });
  }

  /* ---------- 4. Footer year ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- init ---------- */
  function init() {
    var tracking = captureTracking();
    decorateInternalLinks(tracking);
    decorateFormIframe(tracking);
    initStickyCta();
    initFaq();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
