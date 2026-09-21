/* =====================================================================
   THE OBJECTIVES AND THE HINT LADDER, PROVED.

   Seventeen claims. Six of them are about whether an objective is
   true; the rest are about whether the help a student gets is honest,
   which is the harder half and the half nobody usually checks.

   The claims that matter most:

     - every objective is FALSE in the house as inherited, and turns
       true only when the thing it names is actually true
     - an objective can go BACKWARDS. Nothing is ticked
     - THE ENGINE NEVER DISCLOSES THE COMPROMISE. What the objectives
       say about a house that was taken is word for word what they say
       about one that was not
     - the ladder fires at three, four, and five-and-for-ever
     - NO RUNG NAMES THE ANSWER, at any rung, however many times asked
     - rung 3 always leaves at least two alive, and gives a reason for
       every option it strikes
     - A HINT DOES NOT LIE. If a hint says a choice is the student's,
       the engine must accept both answers
     - NO CHANGE IS A DEAD END. Every setting has an inverse, so a
       student cannot strand themselves — which is what the rung 0 text
       promises, so the promise is checked rather than assumed
     - and a compromise is NOT reversible, which is the one thing that
       is not undoable and is the whole point of the tier

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/objectives.mjs --plant

   Ten sabotaged copies, one defect each. Every one has to be caught.
   A --plant run that passes is reported as a failure, because a check
   that cannot fail is not a check.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const FILES = ["assets/objectives.js", "assets/world.js", "assets/rules.js", "assets/traffic.js",
               "assets/verdict.js"];

/* --------------------------------------------------------------------
   THE PLANTS

   Every one is a mistake somebody could actually make while editing
   this file in good faith. Three of them are mistakes that were in it.
   -------------------------------------------------------------------- */
const PLANTS = {
  tattle: {
    file: "assets/objectives.js",
    catches: "the engine never discloses the compromise",
    /* THE REGRESSION THIS FILE EXISTS TO STOP. Put the count back in
       the status line and the objectives pane becomes the
       you-have-been-compromised panel the tier is built to prove you
       do not get. It was really in the file. */
    fn: s => s.replace('      if (v.settled) return "You gave a verdict and it was right.";',
      '      if (v.settled) return "You gave a verdict and it was right.";\n' +
      '      if (w.devices.filter(d => d.compromised).length) return w.devices.filter(d => d.compromised).length + " device(s) are compromised.";')
  },
  ticked: {
    file: "assets/objectives.js",
    catches: "objectives can go backwards",
    /* Remember that an objective was once met. The single most tempting
       change in the file, and it quietly turns the grade from "the state
       of the network" into "a checklist somebody ticked". */
    fn: s => s
      .replace("  const attempts = {};", "  const attempts = {}; const sticky = {};")
      .replace("        met: !!o.test(w),", "        met: (sticky[o.id] = sticky[o.id] || !!o.test(w)),")
  },

  wrongsettles: {
    file: "assets/verdict.js",
    catches: "the verdict board never locks them out",
    /* A wrong answer ends the exercise. The most ordinary way a board
       like this gets built, and it breaks the rule the whole build
       runs on: unlimited tries, nothing ever locks them out. */
    fn: s => s.replace("  v.wrong.push(id);", "  v.wrong.push(id);\n  v.settled = true;")
  },

  resettoomuch: {
    file: "assets/verdict.js",
    catches: "the verdict board never locks them out",
    /* Clearing the working out also clears the work. A student who
       wants to start their reasoning again loses the hardening they
       already got right, which is the opposite of "reset to the last
       part they got correct". */
    fn: s => s.replace("  v.wrong = [];\n  v.settled = false;",
                       "  v.wrong = [];\n  v.settled = false;\n  w.firewall.forwards.forEach(f => { f.enabled = true; });")
  },

  rungoff: {
    file: "assets/objectives.js",
    catches: "the ladder fires where it should",
    /* Every rung one guess early. Help at the second wrong answer,
       before they have had a chance to think. */
    fn: s => s.replace("  if (attempts < 3) return 0;\n  if (attempts === 3) return 1;\n  if (attempts === 4) return 2;",
                       "  if (attempts < 2) return 0;\n  if (attempts === 2) return 1;\n  if (attempts === 3) return 2;")
  },

  answergiven: {
    file: "assets/objectives.js",
    catches: "no hint names the answer",
    /* Name the one device that is still reachable. Reads like a
       kindness and ends the exercise. */
    fn: s => s.replace('(live.length > 1 ? "these: " + live.join(", ") : "what the router is still pointed at") +',
                       '"these: " + live.join(", ") +')
  },

  onelive: {
    file: "assets/objectives.js",
    catches: "rung 3 leaves at least two alive",
    /* Strike every device the student has already dealt with. Helpful
       early, and by the time one is left it has narrowed the field to
       exactly that one. */
    fn: s => s.replace("        const noLogin = w.devices.filter(d => !d.creds).slice(0, 2);",
                       "        const noLogin = w.devices.filter(d => !d.creds || !d.creds.factory);")
  },

  rungbare: {
    file: "assets/objectives.js",
    catches: "rung 3 gives a reason for every strike",
    /* Tidy the reasons out of rung 3 and leave the list. Shorter,
       scans better, teaches nothing — a student is told an option is
       gone and never finds out why. */
    fn: s => s.replace('const lines = safe.map(d => "It is not the " + d.name + " — nothing is pointed at it.");',
                       'const lines = safe.map(d => "It is not the " + d.name + ".");')
  },

  hintlies: {
    file: "assets/objectives.js",
    catches: "a hint does not lie",
    /* Require the unpatchable IoT devices on the camera side — while
       rung 3 still tells the student the placement is theirs to argue.
       This was really in the file. */
    fn: s => s.replace('      const cams = w.devices.filter(d => d.kind === "camera");\n' +
                       '      const family = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");\n' +
                       '      if (!cams.length',
                       '      const cams = w.devices.filter(d => d.kind === "camera" || d.kind === "iot");\n' +
                       '      const family = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");\n' +
                       '      if (!cams.length')
  },

  deadend: {
    file: "assets/world.js",
    catches: "no change is a dead end",
    /* Dissolving a segment stops dissolving it. One badly drawn
       segment then strands the student for the rest of the run. This
       was really in the file too — there was no removeSegment at all. */
    fn: s => s.replace("  const s = w.segments.splice(i, 1)[0];", "  const s = w.segments[i];")
  }
};

async function load(plant) {
  if (!plant) {
    return {
      O: await import(pathToFileURL(join(ROOT, "assets/objectives.js")).href),
      W: await import(pathToFileURL(join(ROOT, "assets/world.js")).href),
      R: await import(pathToFileURL(join(ROOT, "assets/rules.js")).href),
      V: await import(pathToFileURL(join(ROOT, "assets/verdict.js")).href)
    };
  }
  const dir = mkdtempSync(join(tmpdir(), "obj-plant-"));
  for (const f of FILES) {
    const src = readFileSync(join(ROOT, f), "utf8");
    let out = src;
    if (f === plant.file) {
      out = plant.fn(src);
      if (out === src) throw new Error("plant did not apply to " + f + " — it is testing nothing");
    }
    writeFileSync(join(dir, f.split("/").pop()), out);
  }
  const bust = "?t=" + Date.now() + Math.random();
  return {
    O: await import(pathToFileURL(join(dir, "objectives.js")).href + bust),
    W: await import(pathToFileURL(join(dir, "world.js")).href + bust),
    R: await import(pathToFileURL(join(dir, "rules.js")).href + bust),
    V: await import(pathToFileURL(join(dir, "verdict.js")).href + bust)
  };
}

/* --------------------------------------------------------------------
   WHAT COUNTS AS "THE ANSWER"

   For each objective, the specific things a student has to find. A hint
   may point at the pane, state the principle, and strike options with a
   reason — it may never contain one of these.

   Two objectives have an empty set, and both are deliberate:

     you-have-looked      — there is no choice to make and nothing to
                            get wrong. Rung 1's whole contract is to
                            name the pane, and withholding "open the
                            log" from somebody who has asked three times
                            would be obstruction, not teaching.

     cameras-...-family   — the answer is a partition, not a thing, and
                            rung 3 is supposed to name the family's
                            devices in order to hand back the argument
                            about the rest. That one is covered by the
                            "a hint does not lie" check instead.
   -------------------------------------------------------------------- */
function answerTokens(id, w, R, V) {
  switch (id) {
    case "no-way-in":
      return R.reachable(w).reduce((a, o) =>
        a.concat([o.dev.name, o.dev.id, String(o.forward.wanPort)]), []);
    case "no-factory-passwords":
      return w.devices.filter(d => d.creds && d.creds.factory)
                      .reduce((a, d) => a.concat([d.name, d.id]), []);
    case "you-know-what-is-happening": {
      /* The answer is the option the board is waiting for. No rung may
         contain its name — not the device's, not "nothing here is out
         of place" when that is the right call. */
      const right = V.options(w).filter(o => o.correct)[0];
      return right ? [right.label, right.id === "none" ? "ZZZnever" : right.id] : [];
    }
    case "rules-do-what-you-think":
      return R.review(w).map(n => "Rule " + (n.index + 1));
    default:
      return [];
  }
}

/* A reason connector. Counted rather than parsed, because the claim is
   only ever "this strike came with something after it", and anything
   cleverer would just be matching prose I wrote myself. */
const REASON = /—|because|since|has no|nothing is|that is the product|traffic is yours|cannot be/g;

/* --------------------------------------------------------------------- */
async function run(plant) {
  const fails = [];
  const fail = (what, detail) => fails.push(what + " — " + detail);
  const check = (label, fn) => {
    try { fn(); }
    catch (e) { fail(label, "it threw: " + e.message); }
  };

  const { O, W, R, V } = await load(plant);

  /* Ask for the hint a student would get on their Nth attempt, from a
     ladder that has seen nothing else. */
  const hintAt = (w, id, n) => {
    const o = O.makeObjectives(1);
    let h = null;
    for (let i = 0; i < n; i++) h = o.hint(w, id);
    return h;
  };
  const metIn = (w, id) => {
    const o = O.makeObjectives(1);
    return o.progress(w).filter(p => p.id === id)[0].met;
  };

  /* A fully hardened house, reached only through the same functions the
     interface uses. If a state cannot be reached this way, a student
     cannot reach it either. */
  const harden = (w) => {
    W.setForward(w, "fw-cam", false);
    w.devices.filter(d => d.creds).forEach(d => W.setPassword(w, d.id, "h0useHold-2026"));
    W.addSegment(w, "Cameras", ["cam1", "cam2", "cam3", "cam4"]);
    W.addSegment(w, "Family", ["laptop", "phone"]);
    W.markLooked(w);
    W.addRule(w, R.makeRule({ dir: "inbound", dstPort: 23, action: "deny", note: "no telnet, ever" }));
    V.pick(w, V.options(w).filter(o => o.correct)[0].id);
    return w;
  };

  /* ---- 1. the house as inherited fails all six ------------------- */
  check("all six start false", () => {
    const w = W.makeWorld(1);
    const p = O.makeObjectives(1).progress(w);
    if (p.length !== 6) fail("all six start false", "there are " + p.length + " objectives, not six");
    p.filter(x => x.met).forEach(x =>
      fail("all six start false", '"' + x.id + '" was already satisfied in a house nobody has touched'));
  });

  /* ---- 2. ...and all six can be satisfied ------------------------ */
  check("all six can be satisfied", () => {
    const w = harden(W.makeWorld(1));
    const o = O.makeObjectives(1);
    o.progress(w).filter(x => !x.met).forEach(x =>
      fail("all six can be satisfied", '"' + x.id + '" is still unmet in a hardened house: ' + x.status));
    if (o.done(w) !== o.total()) fail("all six can be satisfied", "done() says " + o.done(w) + " of " + o.total());
  });

  /* ---- 3. each objective tracks its own condition ---------------- */
  check("each objective tracks its own condition", () => {
    const one = (id, change) => {
      const w = W.makeWorld(1);
      if (metIn(w, id)) fail("each objective tracks its own condition", id + " was true before the change");
      change(w);
      if (!metIn(w, id)) fail("each objective tracks its own condition", id + " is still false after the change that should satisfy it");
    };
    one("no-way-in", w => W.setForward(w, "fw-cam", false));
    one("no-factory-passwords", w => w.devices.filter(d => d.creds).forEach(d => W.setPassword(w, d.id, "h0useHold-2026")));
    one("cameras-cannot-reach-family", w => {
      W.addSegment(w, "Cameras", ["cam1", "cam2", "cam3", "cam4"]);
      W.addSegment(w, "Family", ["laptop", "phone"]);
    });
    one("you-have-looked", w => W.markLooked(w));
    one("rules-do-what-you-think", w => W.addRule(w, R.makeRule({ dir: "inbound", dstPort: 23, action: "deny" })));
    one("you-know-what-is-happening", w => {
      W.markLooked(w);
      V.pick(w, V.options(w).filter(o => o.correct)[0].id);
    });
  });

  /* ---- 4. a shadowed ruleset fails the ruleset objective --------- */
  check("a ruleset that lies fails", () => {
    const w = W.makeWorld(1);
    W.addRule(w, R.makeRule({ dir: "outbound", action: "allow" }));
    W.addRule(w, R.makeRule({ dir: "outbound", dstIp: "192.0.2.77", action: "deny" }));
    if (metIn(w, "rules-do-what-you-think")) {
      fail("a ruleset that lies fails", "an allow-any above a deny was accepted as a ruleset that does what it looks like");
    }
  });

  /* ---- 5. THE ENGINE NEVER TELLS THEM ---------------------------- */
  check("the engine never discloses the compromise", () => {
    /* The single most important check in this file. The sixth
       objective used to be computed, and its status line read
       "1 device(s) are compromised" — a you-have-been-compromised
       panel, in the tier built to prove you do not get one. A student
       could open the log for a second, read nothing, and be handed
       the answer.

       So: with a camera taken, NOTHING any objective says — status,
       reason, title, or any rung of any hint — may name it. */
    const w = W.makeWorld(1);
    W.markLooked(w);
    const taken = W.device(w, "cam1");
    taken.compromised = true;

    /* Compared against the same house, untouched, rather than matched
       against words. Any DIFFERENCE between what the objectives say
       about a house that was taken and what they say about one that
       was not IS the disclosure — whatever wording it arrives in.
       Matching on the word "compromised" would only have flagged the
       phrasing, and the segmentation objective uses it perfectly
       properly to state a general principle. */
    const twin = W.makeWorld(1);
    W.markLooked(twin);

    const shape = world => O.makeObjectives(1).progress(world)
      .map(p => [p.id, p.title, p.why, p.status].join(" | "));

    const a = shape(w), b = shape(twin);
    a.forEach((line, i) => {
      if (line !== b[i]) {
        fail("the engine never discloses the compromise",
             "the objectives read differently in a house that was taken:\n            taken: " +
             JSON.stringify(line.slice(0, 160)) + "\n            clean: " + JSON.stringify(b[i].slice(0, 160)));
      }
    });

    /* Belt and braces: the taken device is never named anywhere a
       student reads before they have committed to an answer. */
    const said = [];
    O.makeObjectives(1).progress(w).forEach(p => said.push(p.status, p.title, p.why));
    O.TIER1.forEach(obj => {
      if (obj.test(w)) return;
      [1, 3, 4, 5, 9].forEach(n => said.push(hintAt(w, obj.id, n).text));
    });
    const text = said.join(" \n ");
    [taken.name, taken.id].forEach(t => {
      if (text.indexOf(t) >= 0) {
        fail("the engine never discloses the compromise",
             'the objectives name "' + t + '", which is the finding the student is supposed to make');
      }
    });

    /* And a clean house is not announced as clean either, or the
       absence of the announcement becomes the announcement. */
    const clean = W.makeWorld(1);
    W.markLooked(clean);
    const cleanText = O.makeObjectives(1).progress(clean).map(p => p.status).join(" ");
    if (/compromis|nothing is wrong|all clear/i.test(cleanText)) {
      fail("the engine never discloses the compromise",
           "a clean house was declared clean before the student gave a verdict: " + JSON.stringify(cleanText));
    }
  });

  /* ---- 5b. the verdict is the student's, and it is unlimited ----- */
  check("the verdict board never locks them out", () => {
    const w = W.makeWorld(1);
    W.device(w, "cam1").compromised = true;
    const opts = V.options(w);
    if (opts.length !== 6) fail("the verdict board never locks them out", "the board has " + opts.length + " options, not six");
    if (opts.filter(o => o.correct).length !== 1) {
      fail("the verdict board never locks them out", "the board has " + opts.filter(o => o.correct).length + " correct answers");
    }
    opts.filter(o => !o.correct).forEach(o => {
      if (!o.reason || o.reason.length < 40) {
        fail("the verdict board never locks them out", '"' + o.label + '" is wrong with no reason worth reading');
      }
    });

    /* Rule every wrong one out, one at a time, and it must still be
       answerable — nothing ever ends the exercise but the right answer. */
    opts.filter(o => !o.correct).forEach(o => {
      const r = V.pick(w, o.id);
      if (!r.ok || r.correct) fail("the verdict board never locks them out", "ruling out " + o.label + " did not behave");
      if (V.settled(w)) fail("the verdict board never locks them out", "a wrong answer settled the question");
    });
    if (V.struck(w).length !== 5) fail("the verdict board never locks them out", "wrong picks did not stay struck");
    const fin = V.pick(w, V.options(w).filter(o => o.correct)[0].id);
    if (!fin.correct) fail("the verdict board never locks them out", "the right answer was refused after five wrong ones");

    /* ...and clearing the board undoes the working out and nothing else. */
    const w2 = W.makeWorld(1);
    W.setForward(w2, "fw-cam", false);
    V.pick(w2, V.options(w2).filter(o => !o.correct)[0].id);
    V.reset(w2);
    if (V.struck(w2).length) fail("the verdict board never locks them out", "clearing the board left strikes on it");
    if (R.reachable(w2).length) fail("the verdict board never locks them out", "clearing the board undid the student's configuration");
  });

  /* ---- 6. objectives go backwards -------------------------------- */
  check("objectives can go backwards", () => {
    const w = W.makeWorld(1);
    const o = O.makeObjectives(1);
    const met = id => o.progress(w).filter(p => p.id === id)[0].met;

    W.setForward(w, "fw-cam", false);
    if (!met("no-way-in")) { fail("objectives can go backwards", "closing the forward did not satisfy no-way-in"); return; }
    W.setForward(w, "fw-cam", true);
    if (met("no-way-in")) fail("objectives can go backwards", "the forward was reopened and the objective stayed satisfied");

    W.setPassword(w, "cam2", "h0useHold-2026");
    W.factoryReset(w, "cam2");
    if (W.device(w, "cam2").creds.factory !== true) {
      fail("objectives can go backwards", "a factory reset did not put the published password back");
    }
  });

  /* ---- 7. the ladder fires where it should ----------------------- */
  check("the ladder fires where it should", () => {
    const want = [0, 0, 0, 1, 2, 3, 3, 3, 3, 3];
    want.forEach((r, n) => {
      if (O.rungFor(n) !== r) fail("the ladder fires where it should", "attempt " + n + " gave rung " + O.rungFor(n) + ", not " + r);
    });
    const w = W.makeWorld(1);
    [1, 2].forEach(n => {
      if (hintAt(w, "no-way-in", n).rung !== 0) fail("the ladder fires where it should", "guess " + n + " was given a hint");
    });
    if (hintAt(w, "no-way-in", 3).rung !== 1) fail("the ladder fires where it should", "guess 3 did not give rung 1");
    if (hintAt(w, "no-way-in", 4).rung !== 2) fail("the ladder fires where it should", "guess 4 did not give rung 2");
    [5, 9, 40].forEach(n => {
      if (hintAt(w, "no-way-in", n).rung !== 3) fail("the ladder fires where it should", "guess " + n + " did not give rung 3");
    });
  });

  /* ---- 8. asking about something finished costs nothing ---------- */
  check("a hint on a finished objective costs nothing", () => {
    const w = W.makeWorld(1);
    W.setForward(w, "fw-cam", false);
    const o = O.makeObjectives(1);
    for (let i = 0; i < 5; i++) o.hint(w, "no-way-in");
    if ((o.state().attempts["no-way-in"] || 0) !== 0) {
      fail("a hint on a finished objective costs nothing",
           "five hints on a satisfied objective burned " + o.state().attempts["no-way-in"] + " attempts off the ladder");
    }
  });

  /* ---- 9. NO RUNG NAMES THE ANSWER ------------------------------- */
  check("no hint names the answer", () => {
    const worlds = [W.makeWorld(1), W.makeWorld(1), W.makeWorld(1)];
    /* a mid-run world: some work done, some not */
    ["router", "printer", "cam2", "cam3", "cam4"].forEach(id => W.setPassword(worlds[1], id, "h0useHold-2026"));
    /* a breached world */
    W.markLooked(worlds[2]);
    W.device(worlds[2], "cam3").compromised = true;
    W.addRule(worlds[2], R.makeRule({ dir: "outbound", action: "allow" }));
    W.addRule(worlds[2], R.makeRule({ dir: "outbound", dstIp: "192.0.2.77", action: "deny" }));

    worlds.forEach((w, wi) => {
      O.TIER1.forEach(obj => {
        if (obj.test(w)) return;
        const tokens = answerTokens(obj.id, w, R, V);
        [3, 4, 5, 12].forEach(n => {
          const h = hintAt(w, obj.id, n);
          tokens.filter(t => t && h.text.indexOf(t) >= 0).forEach(t =>
            fail("no hint names the answer",
                 'world ' + wi + ', "' + obj.id + '" rung ' + h.rung + ' contains "' + t + '", which is the thing they are looking for'));
        });
      });
    });
  });

  /* ---- 10. rung 3 leaves at least two alive ---------------------- */
  check("rung 3 leaves at least two alive", () => {
    /* Only for the objectives whose answer is "which device". The other
       three are not a field of options and counting them would be
       arithmetic dressed up as a check. */
    const cases = [
      { id: "no-way-in", w: W.makeWorld(1) },
      { id: "no-factory-passwords", w: W.makeWorld(1) },
      { id: "no-factory-passwords", w: W.makeWorld(1) },
      { id: "you-know-what-is-happening", w: W.makeWorld(1) }
    ];
    /* the second password case is a student five devices in — the state
       where a strike list that grows with progress narrows to one */
    ["router", "printer", "cam2", "cam3", "cam4"].forEach(id => W.setPassword(cases[2].w, id, "h0useHold-2026"));
    W.markLooked(cases[3].w);
    W.device(cases[3].w, "cam1").compromised = true;

    cases.forEach(c => {
      const h = hintAt(c.w, c.id, 6);
      const struck = c.w.devices.filter(d => h.text.indexOf(d.name) >= 0);
      const live = c.w.devices.length - struck.length;
      if (live < 2) {
        fail("rung 3 leaves at least two alive",
             '"' + c.id + '" struck ' + struck.length + " of " + c.w.devices.length + ", leaving " + live);
      }
    });
  });

  /* ---- 11. ...and gives a reason for each strike ----------------- */
  check("rung 3 gives a reason for every strike", () => {
    const w = W.makeWorld(1);
    W.markLooked(w);
    W.device(w, "cam1").compromised = true;
    ["no-way-in", "no-factory-passwords"].forEach(id => {
      const h = hintAt(w, id, 6);
      const struck = w.devices.filter(d => h.text.indexOf(d.name) >= 0).length;
      const reasons = (h.text.match(REASON) || []).length;
      if (struck && reasons < struck) {
        fail("rung 3 gives a reason for every strike",
             '"' + id + '" struck ' + struck + " option(s) and gave " + reasons + " reason(s) — a student is told an option is gone and never finds out why");
      }
    });
  });

  /* ---- 12. A HINT DOES NOT LIE ----------------------------------- */
  check("a hint does not lie", () => {
    /* Rung 3 tells the student the unpatchable IoT devices "are the
       ones people argue about — decide where each belongs and why". So
       both placements have to be accepted, or the hint is inviting them
       into a choice that has already been made for them. */
    const w = W.makeWorld(1);
    const h = hintAt(w, "cameras-cannot-reach-family", 5);
    const iot = w.devices.filter(d => d.kind === "iot");
    iot.filter(d => h.text.indexOf(d.name) < 0).forEach(d =>
      fail("a hint does not lie", "rung 3 offers the IoT argument but never names the " + d.name));

    const withCams = W.makeWorld(1);
    W.addSegment(withCams, "Untrusted", ["cam1", "cam2", "cam3", "cam4", "tv", "speaker", "printer"]);
    W.addSegment(withCams, "Family", ["laptop", "phone"]);
    if (!metIn(withCams, "cameras-cannot-reach-family")) {
      fail("a hint does not lie", "putting the IoT devices with the cameras was refused, and rung 3 said it was a judgement call");
    }

    const withFamily = W.makeWorld(1);
    W.addSegment(withFamily, "Cameras", ["cam1", "cam2", "cam3", "cam4"]);
    W.addSegment(withFamily, "Family", ["laptop", "phone", "tv", "speaker", "printer"]);
    if (!metIn(withFamily, "cameras-cannot-reach-family")) {
      fail("a hint does not lie",
           "putting the IoT devices with the family was marked wrong, and rung 3 told the student it was theirs to decide");
    }
  });

  /* ---- 13. every setting can be changed back --------------------- */
  check("every setting can be changed back", () => {
    /* Which is what the rung 0 text promises, in those words. */
    const print = w => JSON.stringify({
      fw: w.firewall.forwards.map(f => f.id + ":" + (f.enabled ? 1 : 0)),
      creds: w.devices.map(d => d.id + ":" + (d.creds ? (d.creds.factory ? "F" : "x") + d.creds.pass : "-")),
      segs: w.segments.map(s => s.id + "[" + s.members.join(",") + "]"),
      rules: w.firewall.rules.map(r => r.id).join(","),
      svc: w.devices.map(d => (d.services || []).map(s => d.id + s.port + (s.exposed ? 1 : 0)).join("|")).join("/")
    });

    const pairs = [
      ["a forward can be closed and reopened", w => { W.setForward(w, "fw-cam", false); }, w => { W.setForward(w, "fw-cam", true); }],
      ["a password change can be undone", w => { W.setPassword(w, "cam1", "h0useHold-2026"); }, w => { W.factoryReset(w, "cam1"); }],
      ["a segment can be dissolved", w => { W.addSegment(w, "Cameras", ["cam1", "cam2"]); }, w => { W.removeSegment(w, "cameras"); }],
      ["a rule can be taken back out", w => { W.addRule(w, R.makeRule({ id: "tmp", dir: "inbound", dstPort: 23, action: "deny" })); }, w => { W.removeRule(w, "tmp"); }],
      ["a rule can be moved back", w => {
        W.addRule(w, R.makeRule({ id: "a", dir: "outbound", action: "allow" }));
        W.addRule(w, R.makeRule({ id: "b", dir: "outbound", action: "deny" }));
        W.moveRule(w, "a", 1);
      }, w => { W.moveRule(w, "a", -1); }]
    ];

    pairs.forEach(([label, doIt, undoIt]) => {
      const w = W.makeWorld(1);
      /* the rule pair needs its own baseline, taken after the rules exist */
      if (label === "a rule can be moved back") {
        W.addRule(w, R.makeRule({ id: "a", dir: "outbound", action: "allow" }));
        W.addRule(w, R.makeRule({ id: "b", dir: "outbound", action: "deny" }));
        const before = print(w);
        W.moveRule(w, "a", 1);
        if (print(w) === before) { fail("every setting can be changed back", label + ": the change did nothing, so the undo proves nothing"); return; }
        W.moveRule(w, "a", -1);
        if (print(w) !== before) fail("every setting can be changed back", label + ": it did not come back");
        return;
      }
      const before = print(w);
      doIt(w);
      if (print(w) === before) { fail("every setting can be changed back", label + ": the change did nothing, so the undo proves nothing"); return; }
      undoIt(w);
      if (print(w) !== before) fail("every setting can be changed back", label + ": it did not come back");
    });

    const h = O.makeObjectives(1).hint(W.makeWorld(1), "no-way-in");
    if (!/changed back/.test(h.text)) {
      fail("every setting can be changed back", "the first thing a student is told no longer promises it");
    }
  });

  /* ---- 14. NO CHANGE IS A DEAD END ------------------------------- */
  check("no change is a dead end", () => {
    const w = W.makeWorld(1);
    /* The mistake: one box round a camera and the laptop. Plausible —
       it is what "let me segment this" looks like on the first go. */
    const bad = W.addSegment(w, "Everything", ["cam1", "laptop"]);
    if (!bad.ok) { fail("no change is a dead end", "the student could not even make the mistake: " + bad.msg); return; }
    if (metIn(w, "cameras-cannot-reach-family")) {
      fail("no change is a dead end", "a camera and the laptop in one segment was accepted as separation");
    }
    const undo = W.removeSegment(w, "everything");
    if (!undo.ok) { fail("no change is a dead end", "the segment could not be dissolved: " + undo.msg); return; }

    const a = W.addSegment(w, "Cameras", ["cam1", "cam2", "cam3", "cam4"]);
    const b = W.addSegment(w, "Family", ["laptop", "phone"]);
    if (!a.ok || !b.ok) {
      fail("no change is a dead end", "after dissolving the bad segment the devices were still spoken for: " + (a.msg || b.msg));
      return;
    }
    if (!metIn(w, "cameras-cannot-reach-family")) {
      fail("no change is a dead end", "one badly drawn segment left the objective unreachable for the rest of the run");
    }

    /* And the whole board recovers, not just the one objective. */
    const w2 = W.makeWorld(1);
    W.addSegment(w2, "Everything", ["cam1", "laptop"]);
    W.removeSegment(w2, "everything");
    const o = O.makeObjectives(1);
    harden(w2);
    if (o.done(w2) !== o.total()) {
      fail("no change is a dead end", "after a mistake and its undo, only " + o.done(w2) + " of " + o.total() + " could still be reached");
    }
  });

  /* ---- 15. a compromise is NOT a setting ------------------------- */
  check("a compromise is not undoable", () => {
    const w = W.makeWorld(1);
    W.markLooked(w);
    const cam = W.device(w, "cam1");
    cam.compromised = true;
    W.setForward(w, "fw-cam", false);
    if (!cam.compromised) fail("a compromise is not undoable", "closing the forward cleaned the camera — containment is not prevention");
    W.factoryReset(w, "cam1");
    if (!cam.compromised) fail("a compromise is not undoable", "a factory reset cleaned a compromised camera, which is the misconception this tier exists to break");
    W.setPassword(w, "cam1", "h0useHold-2026");
    if (!cam.compromised) fail("a compromise is not undoable", "changing the password evicted somebody who was already inside");
    if (V.answer(w) !== "cam1") fail("a compromise is not undoable", "the board stopped pointing at the device that was taken");
  });

  /* ---- 16. every objective says something at every state --------- */
  check("every objective explains itself", () => {
    [W.makeWorld(1), harden(W.makeWorld(1))].forEach((w, i) => {
      O.makeObjectives(1).progress(w).forEach(p => {
        if (!p.title || !p.why) fail("every objective explains itself", p.id + " has no title or no reason");
        if (!p.status || p.status.length < 10) fail("every objective explains itself", p.id + ' status in world ' + i + ' reads "' + p.status + '"');
        if (/undefined|NaN|\[object/.test(p.status)) fail("every objective explains itself", p.id + ' status in world ' + i + ' reads "' + p.status + '"');
      });
      O.TIER1.forEach(obj => {
        [3, 4, 5].forEach(n => {
          const h = hintAt(w, obj.id, n);
          if (/undefined|NaN|\[object/.test(h.text)) fail("every objective explains itself", obj.id + " rung " + h.rung + ' reads "' + h.text + '"');
        });
      });
    });
  });

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
  console.log("\nall ten plants caught. the objectives check measures what it claims to.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("objectives and the hint ladder: 17 checks pass"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
fails.forEach(f => console.log("  " + f));
process.exit(1);
