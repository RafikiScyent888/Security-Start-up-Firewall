/* =====================================================================
   CONTRAST, MEASURED ON PAINTED PIXELS

   These students have eye damage from military service. Contrast here
   is a medical accommodation, not a preference, and the floor is WCAG
   **AAA**: 7:1 for body text, 4.5:1 for large text (>=24px, or
   >=18.66px bold).

   ---------------------------------------------------------------------
   WHY THIS DOES NOT READ THE CASCADE

   Because reading the cascade lies. A checker that walks up the DOM
   looking for a background-color finds nothing on an element whose
   background came from a `background-image` gradient, keeps walking,
   reaches a white ancestor, and reports white text on white as a clean
   pass — on a page that is completely unreadable.

   So this does what the eye does:

     1. hide every glyph, leaving the grounds they are painted on
     2. screenshot
     3. for each run of text, sample the pixels the glyphs WOULD have
        been painted on
     4. compare those against the computed colour
     5. take the style tag back out, or the next measurement reads 1:1

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/contrast.mjs --plant

   Three sabotaged stylesheets. One of them is the gradient trap above,
   which a cascade-reading checker passes and this one must fail — that
   plant is the entire reason this file works the way it does.

   ---------------------------------------------------------------------
   RUNNING IT

   Needs playwright-core and the Chromium already in this container.
   Point PW at the playwright-core install if it is not resolvable:

     PW=/path/to/node_modules/playwright-core node verify/contrast.mjs
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const CHROME = process.env.CHROME ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const ARGS = ["--headless=new", "--use-gl=swiftshader", "--enable-unsafe-swiftshader",
              "--no-sandbox", "--disable-dev-shm-usage"];

async function playwright() {
  const where = process.env.PW;
  /* index.mjs, not index.js. The CommonJS entry puts everything on
     `default` when it is imported as a module, so `chromium` comes back
     undefined and the failure looks like a broken browser rather than a
     wrong path. */
  const m = where
    ? await import(pathToFileURL(join(where, "index.mjs")).href)
    : await import("playwright-core");
  return m.chromium ? m : m.default;
}

/* --------------------------------------------------------------------
   THE PLANTS
   -------------------------------------------------------------------- */
const PLANTS = {
  gradient: {
    catches: "AAA on painted pixels",
    /* THE ONE THAT MATTERS. A gradient in background-image, no
       background-color anywhere, and light ink on it. Every checker
       that walks the DOM for a colour passes this. The page is
       unreadable. */
    fn: s => s + `
      .card { background-image: linear-gradient(180deg, #ffffff, #f2f2f2); background-color: transparent; }
      .card, .card p, .card .lede { color: #eef3f9; }`
  },
  dimmed: {
    catches: "AAA on painted pixels",
    /* The most tempting mistake in the file: quieten the secondary text
       by fading it, which is exactly what the standing rules forbid —
       "never dim something into uselessness". */
    fn: s => s.replace("  --ink-dim:   #c3ced9;", "  --ink-dim:   #5b6774;")
  },
  lightink: {
    catches: "AAA on painted pixels",
    /* Light theme regressed. Dark mode still passes, so a check that
       only ever looked at one theme would report everything fine. */
    fn: s => s.replace('  --ink:       #161b22;', '  --ink:       #7b8391;')
  }
};

/* --------------------------------------------------------------------
   SERVE
   ES modules need a real origin. Opening index.html from disk fails.
   -------------------------------------------------------------------- */
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
function serve(dir) {
  return new Promise(res => {
    const s = createServer((req, rep) => {
      const p = join(dir, decodeURIComponent(req.url.split("?")[0]) === "/" ? "index.html"
                                                                           : req.url.split("?")[0]);
      /* Read BEFORE writing the header. The other way round, a missing
         file throws after the 200 has already gone out and the whole
         run dies with ERR_HTTP_HEADERS_SENT instead of a 404. */
      let body;
      try { body = readFileSync(p); }
      catch (e) { rep.writeHead(404, { "content-type": "text/plain" }); rep.end("not here"); return; }
      const ext = p.slice(p.lastIndexOf("."));
      rep.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream" });
      rep.end(body);
    });
    s.listen(0, "127.0.0.1", () => res({ server: s, port: s.address().port }));
  });
}

/* --------------------------------------------------------------------
   THE MEASUREMENT
   -------------------------------------------------------------------- */
const HIDE_ID = "cwp-contrast-hide";

/* Every run of text on the page, with the colour it is painted in and
   the points its glyphs occupy. Ranges rather than elements, so a
   paragraph with a coloured span inside it is measured as two things
   rather than one. */
function COLLECT() {
  const out = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.99) continue;
    if (el.closest(".sr-only")) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    /* Only what is actually on screen right now, in viewport
       coordinates. The page is measured a screenful at a time — a
       fullPage screenshot of the log comes back part black once the
       page is tall enough, and every sample after that point is taken
       from the wrong pixels. */
    const rects = [...r.getClientRects()].filter(b =>
      b.width > 2 && b.height > 2 &&
      b.top >= 0 && b.left >= 0 &&
      b.bottom <= window.innerHeight && b.right <= window.innerWidth);
    if (!rects.length) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const pts = [];
    rects.slice(0, 3).forEach(b => {
      const y = b.top + b.height / 2;
      for (let f = 0.15; f <= 0.85; f += 0.35) pts.push([Math.round(b.left + b.width * f), Math.round(y)]);
    });
    out.push({
      text: text.slice(0, 70),
      color: cs.color,
      size: size,
      weight: weight,
      large: size >= 24 || (size >= 18.66 && weight >= 700),
      /* getAttribute, not el.className — on an SVG element className is
         an SVGAnimatedString and stringifies to "[object ...]". */
      tag: el.tagName.toLowerCase() +
           ((el.getAttribute && el.getAttribute("class")) ? "." + el.getAttribute("class").split(" ")[0] : ""),
      pts: pts
    });
  }
  return out;
}

/* Sample a screenshot the page draws onto a canvas for us, so nothing
   here has to decode a PNG. */
async function SAMPLE([b64, items]) {
  const img = new Image();
  await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = "data:image/png;base64," + b64; });
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  return items.map(it => ({
    ...it,
    grounds: it.pts
      .filter(p => p[0] >= 0 && p[1] >= 0 && p[0] < c.width && p[1] < c.height)
      .map(p => { const d = g.getImageData(p[0], p[1], 1, 1).data; return [d[0], d[1], d[2]]; })
  }));
}

const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function parseColor(css) {
  const m = /rgba?\(([^)]+)\)/.exec(css);
  if (!m) return null;
  const p = m[1].split(",").map(s => parseFloat(s));
  if (p.length > 3 && p[3] < 0.99) return { alpha: p[3], rgb: [p[0], p[1], p[2]] };
  return { alpha: 1, rgb: [p[0], p[1], p[2]] };
}

/* A probe carrying every state the stylesheet can paint, including the
   ones Tier 1 has no content for yet. The six-option board arrives with
   the decision sets; its colours are proved before it does, because a
   rule nothing renders is a rule nobody has checked. */
const PROBE = `
<div class="card" id="cwp-probe">
  <h2>Probe</h2>
  <ul class="options">
    <li><button class="option" data-state="wrong"><span class="mark">Ruled out</span>
      <span class="label">A wrong option that stays red</span>
      <span class="reason">With the reason it was ruled out, which still has to be readable.</span></button></li>
    <li><button class="option" data-state="right"><span class="mark">Correct</span>
      <span class="label">The right one</span>
      <span class="reason">And why it is right.</span></button></li>
    <li><button class="option"><span class="label">Untouched</span>
      <span class="reason">Not picked yet.</span></button></li>
  </ul>
  <div class="note">A note in yellow.</div>
  <div class="msg">A message in blue.</div>
  <div class="msg" data-ok="false">A failure message in red.</div>
  <div class="hint"><span class="rung">Hint 3 of 3</span><p>A rung three hint.</p></div>
  <p><span class="flag bad">bad flag</span><span class="flag warn">warn flag</span>
     <span class="flag ok">ok flag</span><span class="flag neutral">neutral flag</span></p>
  <div class="objective" data-met="false"><div class="head"><span class="state">not yet</span>
    <span class="title">An objective</span></div><p class="status">Its status line.</p></div>
  <div class="objective" data-met="true"><div class="head"><span class="state">done</span>
    <span class="title">A finished objective</span></div><p class="status">Its status line.</p></div>
  <div class="rule" data-action="allow"><span class="n">1</span><span class="said">An allow rule.</span></div>
  <div class="rule" data-action="deny"><span class="n">2</span><span class="said">A deny rule.</span></div>
</div>`;

async function measure(page) {
  const vh = page.viewportSize().height;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);

  /* A screenful at a time. The first six cover every distinct piece of
     styling on any pane — the log's rows repeat after that — and the
     last stop is always the bottom, so the footer is never skipped.
     Stated plainly because it IS a cap: a defect introduced only in the
     three-hundredth identical log row would not be caught here, and
     would be caught by the token arithmetic instead. */
  const step = Math.floor(vh * 0.9);
  const bottom = Math.max(0, total - vh);
  const stops = [];
  for (let y = 0; y < total && stops.length < 6; y += step) stops.push(Math.min(y, bottom));
  if (stops[stops.length - 1] !== bottom) stops.push(bottom);

  const out = [];
  for (const y of [...new Set(stops)]) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);

    /* Colours first, while the text still has some. */
    const items = await page.evaluate(COLLECT);
    if (!items.length) continue;

    await page.evaluate(id => {
      const s = document.createElement("style");
      s.id = id;
      /* `color` alone is not enough. SVG text is painted with `fill`, so
         a colour-only rule leaves every label on the map still drawn —
         and the sampler then reads anti-aliased glyph pixels and reports
         1:1 against the ink itself. That was a real bug in this file, and
         it is exactly the sort of thing the plants exist to expose. Only
         svg TEXT is cleared; the boxes keep their fill, because the boxes
         are the grounds being measured. */
      s.textContent =
        "*, *::before, *::after { color: transparent !important; " +
        "text-shadow: none !important; text-decoration-color: transparent !important; " +
        "caret-color: transparent !important; }\n" +
        "svg text, svg tspan { fill: transparent !important; stroke: none !important; }";
      document.head.appendChild(s);
    }, HIDE_ID);

    const shot = (await page.screenshot()).toString("base64");

    /* TAKE IT BACK OUT. Leaving it in makes the next measurement read
       transparent against transparent, which is 1:1, which is a pass
       that means nothing. */
    await page.evaluate(id => { const s = document.getElementById(id); if (s) s.remove(); }, HIDE_ID);
    const stuck = await page.evaluate(id => !!document.getElementById(id), HIDE_ID);
    if (stuck) throw new Error("the hiding style survived the measurement");

    const sampled = await page.evaluate(SAMPLE, [shot, items]);
    out.push(...sampled);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return out;
}

function judge(sampled, where, fails) {
  sampled.forEach(it => {
    const fg = parseColor(it.color);
    if (!fg || !it.grounds.length) return;
    /* Semi-transparent text is composited onto whatever is behind it,
       so measure what the eye gets rather than what was declared. */
    it.grounds.forEach(bg => {
      const eff = fg.alpha >= 0.99 ? fg.rgb
        : fg.rgb.map((c, i) => c * fg.alpha + bg[i] * (1 - fg.alpha));
      const r = ratio(eff, bg);
      const need = it.large ? 4.5 : 7;
      if (r < need - 0.005) {
        fails.push(`AAA on painted pixels — ${where}: ${it.tag} at ${r.toFixed(2)}:1, needs ${need}:1 ` +
                   `(${it.size}px${it.weight >= 700 ? " bold" : ""}, ink ${it.color}, ` +
                   `ground rgb(${bg.join(",")})) — "${it.text}"`);
      }
    });
  });
}

/* -------------------------------------------------------------------- */
async function run(plant) {
  let dir = ROOT;
  if (plant) {
    dir = mkdtempSync(join(tmpdir(), "fw-css-"));
    cpSync(join(ROOT, "assets"), join(dir, "assets"), { recursive: true });
    cpSync(join(ROOT, "index.html"), join(dir, "index.html"));
    const css = join(dir, "assets/style.css");
    const src = readFileSync(css, "utf8");
    const out = plant.fn(src);
    if (out === src) throw new Error("plant did not apply — it is testing nothing");
    writeFileSync(css, out);
  }

  const { chromium } = await playwright();
  const { server, port } = await serve(dir);
  const browser = await chromium.launch({ executablePath: CHROME, args: ARGS });
  const fails = [];
  let sampledAnything = 0;

  try {
    /* Every pane, both themes, both reading modes, and two widths —
       a phone and a desk, because the layout genuinely differs. */
    for (const [w, h, label] of [[390, 780, "phone"], [1280, 900, "desk"]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "load" });
      await page.evaluate(() => {
        try { localStorage.clear(); } catch (e) {}
        try { localStorage.setItem("cwp:instructor", "1"); } catch (e) {}
      });
      await page.reload({ waitUntil: "load" });

      for (const theme of ["dark", "light"]) {
        for (const dys of [false, true]) {
          await page.evaluate(([t, d]) => { window.CWP.setTheme(t); window.CWP.setDyslexia(d); }, [theme, dys]);
          for (const tab of ["house", "console", "log", "voo", "objectives", "notes"]) {
            await page.evaluate(t => window.FIREWALL.go(t), tab);
            /* Give the hint ladder something to paint, and the probe
               the states Tier 1 has no content for yet. */
            if (tab === "objectives") {
              await page.evaluate(() => {
                const s = window.FIREWALL.state;
                ["no-way-in", "no-factory-passwords"].forEach(id => {
                  for (let i = 0; i < 6; i++) s.hints[id] = s.objectives.hint(s.world, id);
                });
                window.FIREWALL.render();
              });
            }
            /* OPEN THE DRAWER. On a phone the pane list is behind a
               button, so leaving it shut means the one piece of
               navigation a phone user actually reads never gets
               measured at all. */
            await page.evaluate(() => {
              const tabs = document.getElementById("tabs");
              if (tabs && getComputedStyle(tabs).display === "none") {
                const b = document.getElementById("nav-toggle");
                if (b) b.click();
              }
            });

            await page.evaluate(p => {
              const old = document.getElementById("cwp-probe");
              if (old) old.remove();
              document.getElementById("pane").insertAdjacentHTML("beforeend", p);
            }, PROBE);

            const sampled = await measure(page);
            sampledAnything += sampled.length;
            judge(sampled, `${label}/${theme}${dys ? "/easier" : ""}/${tab}`, fails);
          }
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (sampledAnything < 200) {
    fails.push("the check measured almost nothing — " + sampledAnything +
               " runs of text across 48 screens, so a pass here means the harness is broken, not that the page is readable");
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
    console.log((caught ? "  caught  " : "  MISSED  ") + name.padEnd(10) + " — " + fails.length + " failure(s)");
    if (!caught) allCaught = false;
  }
  if (!allCaught) { console.log("\nA PLANT WENT UNNOTICED. The check is not trustworthy."); process.exit(1); }
  console.log("\nall three plants caught, including the gradient a cascade-reading checker passes.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("contrast: AAA on painted pixels, every pane, both themes, both reading modes, phone and desk"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
/* One line per distinct problem — the same token failing on forty
   screens is one bug, and printing it forty times buries the others. */
const seen = new Set();
fails.forEach(f => {
  const key = f.replace(/^AAA on painted pixels — [^:]+: /, "").replace(/ — ".*$/, "");
  if (seen.has(key)) return;
  seen.add(key);
  console.log("  " + f);
});
console.log("\n(" + fails.length + " total, " + seen.size + " distinct)");
process.exit(1);
