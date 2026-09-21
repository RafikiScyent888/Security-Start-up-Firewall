/* =====================================================================
   THEME AND READING MODE

   Two switches, both of them accommodations rather than preferences:

     cwp:theme      light | dark
     cwp:dyslexia   on | off

   ---------------------------------------------------------------------
   WHY THIS IS NOT A MODULE

   A module is deferred. Deferred means the page paints first and the
   theme arrives afterwards, which is a white flash in a dark room for
   somebody whose eyes are already damaged. This file is a plain script
   loaded in the head, synchronously, so the attributes are on <html>
   before the first pixel.

   The keys are shared with every other site in the programme, on
   purpose. A student who turns dyslexia mode on at the acronym site
   should find it on here.

   ---------------------------------------------------------------------
   DYSLEXIA MODE, HONESTLY

   There is no build step and nothing is fetched at runtime, so there is
   no OpenDyslexic to load. What this does instead is everything that is
   known to help and does not need a font file: a humanist sans with a
   large x-height and unambiguous letterforms, more space between the
   letters, more between the words, more between the lines, a shorter
   measure, and no justified text. The font swap alone is the smallest
   part of it — the spacing does most of the work.
   ===================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "cwp:theme";
  var DYS_KEY = "cwp:dyslexia";

  /* localStorage throws in some privacy modes. A theme is not worth a
     blank page, so every read and write is guarded and the failure mode
     is "the switch works but does not stick". */
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* not fatal */ }
  }

  function preferredTheme() {
    var saved = read(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    } catch (e) { /* older browser */ }
    return "dark";
  }

  function stamp() {
    var el = document.documentElement;
    el.setAttribute("data-theme", preferredTheme());
    el.setAttribute("data-dyslexia", read(DYS_KEY) === "on" ? "on" : "off");
  }

  /* Runs NOW, in the head, before anything is painted. */
  stamp();

  var CWP = {
    theme: function () { return document.documentElement.getAttribute("data-theme"); },
    dyslexia: function () { return document.documentElement.getAttribute("data-dyslexia") === "on"; },

    setTheme: function (t) {
      var v = t === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", v);
      write(THEME_KEY, v);
      CWP.refresh();
      return v;
    },

    setDyslexia: function (on) {
      var v = on ? "on" : "off";
      document.documentElement.setAttribute("data-dyslexia", v);
      write(DYS_KEY, v);
      CWP.refresh();
      return v;
    },

    toggleTheme: function () { return CWP.setTheme(CWP.theme() === "dark" ? "light" : "dark"); },
    toggleDyslexia: function () { return CWP.setDyslexia(!CWP.dyslexia()); },

    /* Put every switch on the page into the state the document is
       actually in. Called after any change, so two switches on two
       panes can never disagree with each other. */
    refresh: function () {
      var dark = CWP.theme() === "dark";
      var dys = CWP.dyslexia();
      [].forEach.call(document.querySelectorAll("[data-switch='theme']"), function (b) {
        b.setAttribute("aria-pressed", String(dark));
        /* The label says what you will GET, not what you have. A button
           reading "Dark" while the page is already dark is the oldest
           confusing control there is. */
        b.textContent = dark ? "Light mode" : "Dark mode";
        b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      });
      [].forEach.call(document.querySelectorAll("[data-switch='dyslexia']"), function (b) {
        b.setAttribute("aria-pressed", String(dys));
        b.textContent = dys ? "Standard text" : "Easier reading";
        b.setAttribute("aria-label", dys ? "Turn easier reading off" : "Turn easier reading on");
      });
    },

    mount: function () {
      document.addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest("[data-switch]") : null;
        if (!b) return;
        if (b.getAttribute("data-switch") === "theme") CWP.toggleTheme();
        if (b.getAttribute("data-switch") === "dyslexia") CWP.toggleDyslexia();
      });
      CWP.refresh();
    }
  };

  /* Another tab changed it. Follow along rather than letting two open
     windows disagree. */
  window.addEventListener("storage", function (e) {
    if (e.key === THEME_KEY || e.key === DYS_KEY) { stamp(); CWP.refresh(); }
  });

  window.CWP = CWP;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", CWP.mount);
  } else {
    CWP.mount();
  }
}());
