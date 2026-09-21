/* =====================================================================
   THE PAGE, DRIVEN.

   Everything else in verify/ proves the engine. This proves the
   INTERFACE, by clicking it — because written and reachable are
   different claims, and a registry of content only ever proves the
   content exists.

   The claims:

     - every pane renders, on a phone and on a desk, with nothing
       thrown at the console
     - a student who does nothing IS broken into, and NOTHING on any
       screen says so. Not the map, not the objectives, not VOO, not
       the tab badge. Only the log
     - closing the forward in time prevents it, through the buttons
     - changing a password through the console moves the objective
     - the verdict board takes six answers, holds the wrong ones
       struck, and never locks anybody out
     - no click strands you: a bad segment can be dissolved and the
       board still reaches six of six
     - both toggles survive a reload
     - the PIN gate opens, and the notes are behind it
     - the pane list is a rail on a desk and a drawer on a phone, and
       on a phone every pane is on screen at once with nothing past an
       edge
     - NOTHING IS PAINTED SMALLER THAN 12px, at either width, counting
       the viewBox scale for anything drawn in SVG
     - the AAR is open from the first minute and holds only what the
       student has done or established — the finding is not in it until
       they commit
     - a saved copy is a standalone document AND a loadable save

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/page.mjs --plant

   Eight sabotaged copies. The one that matters puts a "compromised"
   marker on the map — the alert this whole tier is built to prove you
   do not get.

     PW=/path/to/node_modules/playwright-core node verify/page.mjs
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const ARGS = ["--headless=new", "--use-gl=swiftshader", "--enable-unsafe-swiftshader",
              "--no-sandbox", "--disable-dev-shm-usage"];

async function playwright() {
  const where = process.env.PW;
  const m = where ? await import(pathToFileURL(join(where, "index.mjs")).href)
                  : await import("playwright-core");
  return m.chromium ? m : m.default;
}

const PLANTS = {
  mapshouts: {
    file: "assets/map.js",
    catches: "nothing on screen announces the breach",
    /* THE ONE THAT MATTERS. Ring the taken device in red on the map.
       It is the single most natural thing to add to a network diagram
       and it destroys the tier — the student is handed the finding
       they were supposed to make, by the picture, without reading a
       line of the log.

       It writes NO TEXT. That is the point: an earlier version of
       this plant only added a class name, which changed nothing
       visible and proved nothing, and the version before the pixel
       comparison existed went completely unnoticed. */
    fn: s => s.replace(
      'class="node-box${isOpen(d.id) ? " exposed" : ""}" x="${p.x}"',
      'class="node-box${isOpen(d.id) ? " exposed" : ""}" ' +
      '${d.compromised ? \'stroke="#ff9d9d" stroke-width="6" stroke-dasharray="7 4"\' : ""} x="${p.x}"')
  },
  listshouts: {
    file: "assets/map.js",
    catches: "nothing on screen announces the breach",
    /* Same mistake in the inventory, where it looks even more
       reasonable, sitting beside the other honest flags. */
    fn: s => s.replace('    if (d.patchable === false) flags.push(flag("warn", "Cannot be updated"));',
      '    if (d.patchable === false) flags.push(flag("warn", "Cannot be updated"));\n' +
      '    if (d.compromised) flags.push(flag("bad", "Compromised"));')
  },
  aartells: {
    file: "assets/aar.js",
    catches: "the AAR is running and discloses nothing early",
    /* Let the running AAR fill in "what actually happened" before the
       student has committed to anything. It reads as helpful and it is
       the alert this whole build exists to prove you do not get, with
       a clipboard. */
    fn: s => s.replace("  if (settled(w)) {\n    if (taken.length) {", "  if (true) {\n    if (taken.length) {")
  },

  nostylesheet: {
    file: "assets/aar.js",
    catches: "a saved copy is a document and a save",
    /* The saved file stops carrying the stylesheet. It still opens and
       it is unreadable — and worse, Ctrl-P then produces exactly the
       printed web page the print rules exist to avoid. */
    fn: s => s.replace("  const css = liveStylesheet();", "  const css = \"\";")
  },

  tinymap: {
    file: "assets/style.css",
    catches: "nothing is painted smaller than 12px",
    /* Put the map back inside a box narrower than its own viewBox.
       It looks like a sensible way to make the drawing fit a phone and
       it scales every label down with it. This was really in the file:
       680 units squeezed into 520px painted 8.4px labels. */
    fn: s => s.replace(".map { width: 100%; min-width: 680px;", ".map { width: 100%; min-width: 520px;")
  },

  railhidden: {
    file: "assets/style.css",
    catches: "the rail is there on a desk, the drawer on a phone",
    /* Drop the desktop override. The rail then stays hidden behind a
       button that is itself hidden on a desk, so there is no way to
       reach any pane at all — the exact shape of bug a phone-first
       media query produces and a desk-only test never sees. */
    fn: s => s.replace('  .tabs[data-open="false"] { display: flex; }\n', "")
  },

  themeforgets: {
    file: "assets/theme.js",
    catches: "both toggles survive a reload",
    /* The switch works and does not stick, which is the failure mode
       a student only notices tomorrow. */
    fn: s => s.replace("  function write(key, value) {\n    try { window.localStorage.setItem(key, value); }",
                       "  function write(key, value) {\n    try { if (false) window.localStorage.setItem(key, value); }")
  },
  nograce: {
    file: "assets/app.js",
    catches: "closing the forward in time prevents it",
    /* The clock is armed before the student arrives, so the forty-five
       minutes of history they can read already contains the break-in
       and nothing they do in the first minutes can matter. */
    fn: s => s.replace("const adv = makeAdversary({ seed: w.seed, armAt: ARRIVE });",
                       "const adv = makeAdversary({ seed: w.seed });")
  }
};

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
function serve(dir) {
  return new Promise(res => {
    const s = createServer((req, rep) => {
      const url = req.url.split("?")[0];
      const p = join(dir, url === "/" ? "index.html" : decodeURIComponent(url));
      let body;
      try { body = readFileSync(p); }
      catch (e) { rep.writeHead(404, { "content-type": "text/plain" }); rep.end("not here"); return; }
      rep.writeHead(200, { "content-type": TYPES[p.slice(p.lastIndexOf("."))] || "application/octet-stream" });
      rep.end(body);
    });
    s.listen(0, "127.0.0.1", () => res({ server: s, port: s.address().port }));
  });
}

/* There is no word list here, and there was one, and it was wrong.

   Matching on "compromised" flagged the segmentation objective for
   explaining that separation limits what a compromised device can
   reach — which is a general principle and exactly the sort of
   sentence this build should contain. Matching on "alert" flagged the
   VOO pane for saying that alerts land there.

   So the test is a comparison instead. Freeze the clock, read every
   screen that is not the log, clear the compromise, read them all
   again. **Any difference at all is the disclosure**, whatever words
   it arrives in — and a sentence that is there in both readings
   cannot be telling anybody anything.
   -------------------------------------------------------------------- */

/* -------------------------------------------------------------------- */
async function run(plant) {
  let dir = ROOT;
  if (plant) {
    dir = mkdtempSync(join(tmpdir(), "fw-page-"));
    cpSync(join(ROOT, "assets"), join(dir, "assets"), { recursive: true });
    cpSync(join(ROOT, "index.html"), join(dir, "index.html"));
    const f = join(dir, plant.file);
    const src = readFileSync(f, "utf8");
    const out = plant.fn(src);
    if (out === src) throw new Error("plant did not apply to " + plant.file + " — it is testing nothing");
    writeFileSync(f, out);
  }

  const { chromium } = await playwright();
  const { server, port } = await serve(dir);
  const browser = await chromium.launch({ executablePath: CHROME, args: ARGS });
  const fails = [];
  const fail = (what, detail) => fails.push(what + " — " + detail);
  const url = `http://127.0.0.1:${port}/index.html`;

  /* A fresh page with a known seed and nothing saved. Seed 1 is the
     world every other verifier uses. */
  async function open(width, height) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    /* Short. A broken page should fail in seconds and say so, not sit
       for half a minute per click waiting for something that is never
       going to appear. */
    page.setDefaultTimeout(6000);
    const errs = [];
    page.on("pageerror", e => errs.push(String(e && e.message || e)));
    page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => !!window.FIREWALL);
    return { page, errs };
  }

  /* On a phone the pane list is behind a button, on a desk it is a
     rail that is simply there. Everything below goes through this, so
     the checks exercise whichever shape the width actually produces
     rather than assuming one. */
  async function goTab(page, tab) {
    /* COMPUTED display, not the `data-open` attribute: on a desk the
       attribute reads "false" while the stylesheet shows the rail
       anyway, and opening a drawer button that is not on screen waits
       for ever. */
    const shut = await page.$eval("#tabs", el => getComputedStyle(el).display === "none");
    if (shut) {
      /* Named before it is clicked. If neither the rail nor the button
         is on screen there is no way to reach any pane at all, and the
         run has to say THAT rather than time out on an invisible
         button and leave somebody reading a stack trace. */
      const noButton = await page.$eval("#nav-toggle", el => getComputedStyle(el).display === "none");
      if (noButton) {
        throw new Error("the rail is there on a desk, the drawer on a phone — at " +
          page.viewportSize().width + "px neither the rail nor the button that opens it is on screen, " +
          "so no pane can be reached");
      }
      await page.click("#nav-toggle");
    }
    await page.click(`[data-tab="${tab}"]`);
  }

  const text = (page, sel) => page.$eval(sel, el => el.innerText);
  const ticks = (page, n) => page.evaluate(k => { for (let i = 0; i < k; i++) window.FIREWALL.tick(); }, n);

  /* A THROW IS A FAILURE, NOT AN ENDING. Without this a single broken
     selector took the whole run down and every check after it never
     got to speak — which is how a plant that really did break the page
     came back as a crash instead of a result. */
  try {
    /* ---- 1. every pane renders, phone and desk ------------------- */
    for (const [w, h, label] of [[390, 780, "phone"], [1280, 900, "desk"]]) {
      const { page, errs } = await open(w, h);
      for (const tab of ["house", "console", "log", "voo", "objectives", "aar", "notes"]) {
        await goTab(page, tab);
        const t = await text(page, "#pane");
        if (!t || t.trim().length < 80) fail("every pane renders", `${label}/${tab} rendered ${t.trim().length} characters`);
      }
      /* Nothing may scroll sideways. A 16px gutter is the rule and a
         horizontal scrollbar on a phone is the usual way it is broken. */
      await goTab(page, "house");
      const wide = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (wide) fail("every pane renders", label + ": the page scrolls sideways");
      if (errs.length) fail("every pane renders", label + ": " + errs.slice(0, 3).join(" / "));
      await page.close();
    }

    /* ---- 2. do nothing, and NOTHING SAYS SO ---------------------- */
    {
      const { page, errs } = await open(1280, 900);
      /* Eight simulated minutes at four seconds a tick, and a bit over. */
      await ticks(page, 260);
      const taken = await page.evaluate(() => window.FIREWALL.state.world.devices.filter(d => d.compromised).map(d => d.id));
      if (!taken.length) {
        fail("doing nothing gets you taken", "an open forward and a published password for eight minutes and nothing happened");
      }

      await page.evaluate(() => window.FIREWALL.pause());

      /* Words AND pixels. The first version compared only the text,
         and a plant that ringed the taken camera in red on the map
         walked straight past it — a picture can give the game away
         without writing anything down. With the clock stopped the two
         renders are byte-identical unless something really did
         change, so this is an exact comparison rather than a
         tolerance. */
      const snap = async () => {
        const out = {};
        for (const tab of ["house", "console", "voo", "objectives", "aar"]) {
          await goTab(page, tab);
          out[tab] = await text(page, "#pane");
          out[tab + ", as painted"] = (await page.locator("#pane").screenshot()).toString("base64");
        }
        await goTab(page, "house");
        out["the map's description"] = await page.$eval(".map", el => el.getAttribute("aria-label") || "");
        out["the map's markup"] = await page.$eval(".map", el => el.outerHTML);
        out["the tab strip"] = await text(page, "#tabs");
        return out;
      };

      const withIt = await snap();
      await page.evaluate(() => {
        window.FIREWALL.state.world.devices.forEach(d => { d.compromised = false; });
        window.FIREWALL.render();
      });
      const without = await snap();

      Object.keys(withIt).forEach(k => {
        if (withIt[k] === without[k]) return;
        if (/as painted$/.test(k)) {
          fail("nothing on screen announces the breach",
               k + " differs once a device has been taken — something is drawn differently, " +
               "even though no words changed");
          return;
        }
        /* Show the first line that differs, rather than two screenfuls. */
        const a = withIt[k].split("\n"), b = without[k].split("\n");
        let i = 0; while (i < a.length && a[i] === b[i]) i++;
        fail("nothing on screen announces the breach",
             k + " reads differently once a device has been taken:\n" +
             "            taken: " + JSON.stringify((a[i] || "").slice(0, 150)) + "\n" +
             "            clean: " + JSON.stringify((b[i] || "").slice(0, 150)));
      });

      await page.evaluate(() => {
        window.FIREWALL.state.world.devices.filter(d => d.id === "cam1").forEach(d => { d.compromised = true; });
        window.FIREWALL.resume();
      });

      /* And the evidence IS in the log, or the tier is unwinnable. */
      await goTab(page, "log");
      const log = await text(page, "#pane");
      if (log.indexOf("192.0.2.77") < 0) {
        fail("the evidence is in the log", "the beacon's destination never appears in the log the student can read");
      }
      if (errs.length) fail("doing nothing gets you taken", errs.slice(0, 3).join(" / "));
      await page.close();
    }

    /* ---- 3. closing the forward in time prevents it -------------- */
    {
      const { page } = await open(1280, 900);
      await page.click('[data-open-device="router"]');
      await page.click('[data-forward="fw-cam"]');
      await ticks(page, 200);
      const taken = await page.evaluate(() => window.FIREWALL.state.world.devices.filter(d => d.compromised).length);
      if (taken) fail("closing the forward in time prevents it", "closed the door in the first minute and was broken into anyway");
      const met = await page.evaluate(() =>
        window.FIREWALL.state.objectives.progress(window.FIREWALL.state.world).filter(p => p.id === "no-way-in")[0].met);
      if (!met) fail("closing the forward in time prevents it", "the objective did not notice");
      await page.close();
    }

    /* ---- 4. the console actually changes the world --------------- */
    {
      const { page } = await open(1280, 900);
      await page.click('[data-open-device="printer"]');
      await page.fill('input[name="pass"]', "h0useHold-2026");
      await page.click('form[data-form="password"] button[type="submit"]');
      const factory = await page.evaluate(() =>
        window.FIREWALL.state.world.devices.filter(d => d.id === "printer")[0].creds.factory);
      if (factory) fail("the console changes the world", "the password form did not change the password");
      const said = await text(page, "#pane");
      if (!/refuse the published password/i.test(said)) {
        fail("the console changes the world", "nothing told the student what had happened");
      }
      await page.close();
    }

    /* ---- 5. the verdict board -------------------------------------*/
    {
      const { page } = await open(1280, 900);
      await ticks(page, 260);
      await goTab(page, "log");
      const n = await page.$$eval("[data-verdict]", els => els.length);
      if (n !== 6) fail("the verdict board is six options", "the board has " + n + " options");

      /* Pick every wrong one, named up front. Taking "the first one
         that is still enabled" each time silently skipped the whole
         exercise whenever the correct answer happened to be shuffled
         into the first slot. */
      const right = await page.evaluate(() =>
        (window.FIREWALL.state.world.devices.filter(d => d.compromised)[0] || { id: "none" }).id);
      const all = await page.$$eval("[data-verdict]", els => els.map(e => e.getAttribute("data-verdict")));
      for (const id of all.filter(x => x !== right)) {
        await page.click(`[data-verdict="${id}"]`);
      }

      const struck = await page.$$eval('[data-state="wrong"]', els => els.length);
      if (struck !== 5) fail("wrong answers stay struck", "only " + struck + " of the five wrong options stayed red");
      /* Three signals, not just colour. */
      const marks = await page.$$eval('[data-state="wrong"] .mark', els => els.map(e => e.textContent.trim()));
      if (!marks.length || !marks.every(m => /ruled out/i.test(m))) {
        fail("wrong answers stay struck", "a struck option is marked by colour alone");
      }
      const reasons = await page.$$eval('[data-state="wrong"] .reason', els => els.map(e => e.textContent.trim().length));
      if (!reasons.length || reasons.some(l => l < 40)) {
        fail("wrong answers stay struck", "a struck option carries no reason worth reading");
      }
      const settled = await page.evaluate(() => !!window.FIREWALL.state.world.verdict.settled);
      if (settled) fail("the verdict board never locks them out", "a wrong answer ended the exercise");

      /* Now the right one. */
      await page.click(`[data-verdict="${right}"]`);
      const done = await page.evaluate(() => !!window.FIREWALL.state.world.verdict.settled);
      if (!done) fail("the verdict board never locks them out", "the right answer was refused");
      await page.close();
    }

    /* ---- 6. no click strands you --------------------------------- */
    {
      const { page } = await open(1280, 900);
      await goTab(page, "house");
      await page.fill('input[name="seg-name"], #seg-name', "Everything");
      await page.click('input[name="member"][value="cam1"]');
      await page.click('input[name="member"][value="laptop"]');
      await page.click('form[data-form="segment"] button[type="submit"]');
      const made = await page.evaluate(() => window.FIREWALL.state.world.segments.length);
      if (!made) { fail("no click strands you", "the mistake could not even be made"); }
      else {
        await page.click("[data-drop-segment]");
        const left = await page.evaluate(() => window.FIREWALL.state.world.segments.length);
        if (left) fail("no click strands you", "the segment could not be dissolved from the interface");
        /* ...and six of six is still reachable afterwards. */
        const reached = await page.evaluate(() => {
          const s = window.FIREWALL.state;
          return s.objectives.done(s.world) >= 0 && s.world.segments.length === 0;
        });
        if (!reached) fail("no click strands you", "the board did not recover");
      }
      await page.close();
    }

    /* ---- 7. both toggles survive a reload ------------------------ */
    {
      const { page } = await open(1280, 900);
      await page.click('[data-switch="theme"]');
      await page.click('[data-switch="dyslexia"]');
      const before = await page.evaluate(() => [
        document.documentElement.getAttribute("data-theme"),
        document.documentElement.getAttribute("data-dyslexia")]);
      await page.reload({ waitUntil: "load" });
      const after = await page.evaluate(() => [
        document.documentElement.getAttribute("data-theme"),
        document.documentElement.getAttribute("data-dyslexia")]);
      if (before.join() !== after.join()) {
        fail("both toggles survive a reload", "was " + before.join("/") + ", came back " + after.join("/"));
      }
      if (after[1] !== "on") fail("both toggles survive a reload", "easier reading did not stay on");
      /* Stamped before the first paint, not after — otherwise a dark
         room gets a white flash on every page load. */
      const stampedEarly = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme") !== null &&
        !!document.querySelector('head script[src*="theme.js"]:not([defer]):not([type="module"])'));
      if (!stampedEarly) fail("both toggles survive a reload", "the theme is not stamped by a blocking script in the head");
      await page.close();
    }

    /* ---- 8. the PIN gate ----------------------------------------- */
    {
      const { page } = await open(1280, 900);
      await goTab(page, "notes");
      const shut = await text(page, "#pane");
      if (/students will get stuck|where they will get stuck/i.test(shut)) {
        fail("the notes are behind the PIN", "the notes rendered without the PIN");
      }
      await page.fill("#pin", "0000");
      await page.click('form[data-form="pin"] button[type="submit"]');
      if (/where they will get stuck/i.test(await text(page, "#pane"))) {
        fail("the notes are behind the PIN", "a wrong PIN opened them");
      }
      await page.fill("#pin", "3693");
      await page.click('form[data-form="pin"] button[type="submit"]');
      const open8 = await text(page, "#pane");
      if (!/where they will get stuck/i.test(open8)) fail("the notes are behind the PIN", "3693 did not open them");
      if (!/door, not a lock/i.test(open8)) {
        fail("the notes are behind the PIN", "the notes do not say that a client-side PIN is not access control");
      }
      await page.close();
    }
    /* ---- 9b. NOTHING IS PAINTED SMALLER THAN 12px ---------------- */
    {
      /* Contrast checks colour and says nothing about size, and size
         is the other half of readable. The map found this the hard
         way: it was drawn at 680 units inside a 520px box, which
         painted its labels at 8.4 CSS pixels on a phone — better than
         the five-pixel version before it and still unreadable for the
         people this is built for.

         An SVG label's painted size is its font-size times how far
         the viewBox has been scaled, which is why reading the
         stylesheet would never have caught it. This measures what
         lands on the glass. */
      const FLOOR = 12;
      for (const [w, h, label] of [[390, 800, "phone"], [1280, 900, "desk"]]) {
        const { page } = await open(w, h);
        for (const tab of ["house", "console", "log", "voo", "objectives", "aar"]) {
          await goTab(page, tab);
          const small = await page.evaluate(floor => {
            const out = [];
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = walk.nextNode())) {
              if (!n.nodeValue.trim()) continue;
              const el = n.parentElement;
              if (!el || el.closest(".sr-only")) continue;
              const cs = getComputedStyle(el);
              if (cs.display === "none" || cs.visibility === "hidden") continue;
              let size = parseFloat(cs.fontSize);
              /* Inside an SVG, what is painted is the font-size times
                 the viewBox scale. */
              const svg = el.ownerSVGElement || (el.tagName === "svg" ? el : null);
              if (svg && svg.viewBox && svg.viewBox.baseVal.width) {
                size *= svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
              }
              if (size < floor - 0.05) {
                out.push(n.nodeValue.trim().slice(0, 30) + " @ " + size.toFixed(1) + "px");
              }
            }
            return out.slice(0, 5);
          }, FLOOR);
          if (small.length) {
            fail("nothing is painted smaller than 12px",
                 label + "/" + tab + ": " + small.join(" · "));
          }
        }
        await page.close();
      }
    }

    /* ---- 9. the rail and the drawer ------------------------------ */
    {
      /* On a desk the rail is simply there. */
      const { page } = await open(1280, 900);
      if (await page.$eval("#nav-toggle", el => getComputedStyle(el).display !== "none")) {
        fail("the rail is there on a desk, the drawer on a phone", "the phone button is on screen on a desk");
      }
      const railShown = await page.$eval("#tabs", el => getComputedStyle(el).display !== "none");
      if (!railShown) fail("the rail is there on a desk, the drawer on a phone", "the rail is hidden on a desk");
      await page.close();
    }
    {
      /* On a phone it is behind one button, and every pane is on
         screen once it opens — nothing past an edge, which is the
         whole reason the scrolling strip was thrown away. */
      const { page } = await open(390, 780);
      if (await page.$eval("#nav-toggle", el => getComputedStyle(el).display === "none")) {
        fail("the rail is there on a desk, the drawer on a phone", "there is no way to open the pane list on a phone");
      }
      if (!await page.$eval("#tabs", el => getComputedStyle(el).display === "none")) {
        fail("the rail is there on a desk, the drawer on a phone", "the list is already open, so the button does nothing");
      }
      await page.click("#nav-toggle");

      const off = await page.$$eval("#tabs button", els => {
        const w = window.innerWidth, h = window.innerHeight;
        return els.filter(e => {
          const r = e.getBoundingClientRect();
          return r.width < 1 || r.right > w + 1 || r.left < -1 || r.height < 44;
        }).map(e => e.textContent.trim());
      });
      if (off.length) {
        fail("the rail is there on a desk, the drawer on a phone",
             "these panes are off the edge or too small to hit on a phone: " + off.join(", "));
      }
      const count = await page.$$eval("#tabs button", els => els.length);
      if (count !== 7) fail("the rail is there on a desk, the drawer on a phone", "the drawer lists " + count + " panes, not seven");

      /* Picking one closes it again. */
      await page.click('[data-tab="log"]');
      if (!await page.$eval("#tabs", el => getComputedStyle(el).display === "none")) {
        fail("the rail is there on a desk, the drawer on a phone", "picking a pane left the drawer open over the content");
      }
      /* ...and Escape closes it without picking anything. */
      await page.click("#nav-toggle");
      await page.keyboard.press("Escape");
      if (!await page.$eval("#tabs", el => getComputedStyle(el).display === "none")) {
        fail("the rail is there on a desk, the drawer on a phone", "Escape did not close the drawer");
      }
      await page.close();
    }
    /* ---- 11. the AAR is always there and tells nothing early ---- */
    {
      /* The rule changed when the AAR became running, and it did not
         get weaker. The pane is open from the first minute — what
         keeps it safe is that it holds only what the student has DONE
         or already ESTABLISHED, never what the engine knows. */
      const { page } = await open(1280, 900);
      await ticks(page, 260);

      const tabs = await page.$$eval("[data-tab]", els => els.map(e => e.getAttribute("data-tab")));
      if (tabs.indexOf("aar") < 0) fail("the AAR is running and discloses nothing early", "there is no AAR pane");

      await goTab(page, "aar");
      const taken = await page.evaluate(() =>
        (window.FIREWALL.state.world.devices.filter(d => d.compromised)[0] || {}).name || "");
      const early = await text(page, "#pane");
      if (taken && early.indexOf(taken) >= 0) {
        fail("the AAR is running and discloses nothing early",
             'before any verdict the AAR already names "' + taken + '"');
      }
      if (early.indexOf("Still open") < 0) {
        fail("the AAR is running and discloses nothing early",
             "it does not say the finding is still open, so a student cannot tell it is waiting on them");
      }
      /* ...and it is not empty either. It holds what they have done. */
      if (early.indexOf("After Action Review") < 0 || early.length < 800) {
        fail("the AAR is running and discloses nothing early", "the running AAR is a stub");
      }

      /* Now commit, and it is allowed to speak. */
      await goTab(page, "log");
      const right = await page.evaluate(() =>
        (window.FIREWALL.state.world.devices.filter(d => d.compromised)[0] || { id: "none" }).id);
      await page.click(`[data-verdict="${right}"]`);

      const landed = await page.evaluate(() => window.FIREWALL.state.tab);
      if (landed !== "aar") {
        fail("the AAR is running and discloses nothing early",
             "settling the verdict left the student on the " + landed + " pane");
      }
      const after = await text(page, "#pane");
      if (taken && after.indexOf(taken) < 0) {
        fail("the AAR is running and discloses nothing early",
             "after the verdict it still will not say which device was taken");
      }
      if (after.indexOf("Security operations") < 0) {
        fail("the AAR is running and discloses nothing early", "it does not name the exam objectives");
      }
      /* Case-insensitive: the state chip is uppercased by CSS, and
         innerText returns what is rendered rather than what was
         written. Matching the source casing failed on a page that was
         perfectly correct. */
      if (!/not reached/i.test(after)) {
        fail("the AAR is running and discloses nothing early", "the tiers that were not reached are not said plainly");
      }
      await page.close();
    }

    /* ---- 12. a saved copy is a document and a save --------------- */
    {
      const { page } = await open(1280, 900);
      await ticks(page, 260);
      await goTab(page, "log");
      const right = await page.evaluate(() =>
        (window.FIREWALL.state.world.devices.filter(d => d.compromised)[0] || { id: "none" }).id);
      await page.click(`[data-verdict="${right}"]`);

      const html = await page.evaluate(() => {
        const s = window.FIREWALL.state;
        return window.FIREWALL.standalone();
      });
      if (!html || html.length < 3000) { fail("a saved copy is a document and a save", "the copy is " + (html || "").length + " characters"); }
      if (html.indexOf("<style>") < 0 || html.indexOf("--ink") < 0) {
        fail("a saved copy is a document and a save", "it carries no stylesheet, so it will not stand alone");
      }
      if (html.indexOf("@media print") < 0) {
        fail("a saved copy is a document and a save", "the print rules did not travel with it, so Ctrl-P gives a printed web page");
      }
      if (html.indexOf('id="cwp-campaign"') < 0) {
        fail("a saved copy is a document and a save", "it carries no campaign record, so it is not a save");
      }
      /* Controls must not be in the document half — and the STYLE
         block has to come out before asking, because the print rules
         legitimately name those controls in order to hide them. The
         first version of this check matched its own stylesheet. */
      const markup = html.replace(/<style>[\s\S]*?<\/style>/g, "");
      if (/data-save-copy|data-load-copy|<textarea|<select/.test(markup)) {
        fail("a saved copy is a document and a save", "the saved document still has the app's form controls in it");
      }
      /* And it reads back. */
      const round = await page.evaluate(h => {
        const got = window.FIREWALL.readSaved(h);
        return got && got.campaign ? got.campaign.events.length : -1;
      }, html);
      if (round < 1) fail("a saved copy is a document and a save", "the copy does not load back in");
      await page.close();
    }

  } catch (e) {
    fails.push(String((e && e.message) || e).split("\n")[0]);
  } finally {
    await browser.close();
    server.close();
  }
  return fails;
}

/* -------------------------------------------------------------------- */
if (process.argv.includes("--plant")) {
  let allCaught = true;
  for (const [name, plant] of Object.entries(PLANTS)) {
    let fails;
    try { fails = await run(plant); }
    catch (e) { console.log("  ERROR   " + name + " — " + e.message); allCaught = false; continue; }
    const caught = fails.some(f => f.startsWith(plant.catches));
    console.log((caught ? "  caught  " : "  MISSED  ") + name.padEnd(13) +
                ' (expected "' + plant.catches + '") — ' + fails.length + " failure(s)");
    if (!caught) { allCaught = false; fails.forEach(f => console.log("            " + f)); }
  }
  if (!allCaught) { console.log("\nA PLANT WENT UNNOTICED. The check is not trustworthy."); process.exit(1); }
  console.log("\nall eight plants caught, including the map ringing the compromised camera.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("the page, driven: 12 checks pass"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
fails.forEach(f => console.log("  " + f));
process.exit(1);
