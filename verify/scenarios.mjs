/* =====================================================================
   THE SIX HOUSES, PROVED.

   The standing rule says five more scenarios go on top of whatever was
   built. Five more is five more chances for one of them to be
   unwinnable, unanswerable, or accidentally a repeat of another — and
   none of that shows up by reading them.

   The claims:

     - all six build, and all six are DIFFERENT. No two have the same
       fault
     - **at most one device is ever taken** in any of them, which is
       what lets the verdict board have one correct answer
     - every one is WINNABLE: six of six reachable using only the
       functions the interface calls
     - every one is LOSEABLE: leave it alone and the house that is
       meant to be taken is taken
     - the two that break the pattern really do break it — one is
       clean at the start and dirty anyway, one is genuinely clean
     - nothing a student reads BEFORE playing names the device that
       gets taken. Not the name, not the blurb, not what it teaches
     - the verdict board is six options with exactly one correct, in
       every scenario, at the start and after the break-in
     - determinism holds per scenario
     - every objective is labelled against the exam at bullet level,
       every domain is reachable, and no sub-objective number is
       invented — the first thing a peer reviewer checks

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/scenarios.mjs --plant

   Seven sabotaged copies. Every one has to be caught.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const FILES = ["scenarios.js", "world.js", "rules.js", "traffic.js", "adversary.js",
               "verdict.js", "objectives.js", "debrief.js", "map.js", "aar.js", "campaign.js"];
const MIN = 60000;
const ARRIVE = 20 * 60 * MIN;

const PLANTS = {
  bothweak: {
    file: "scenarios.js",
    catches: "at most one device is ever taken",
    /* Leave the second camera on its factory password in the
       two-doors house. Both get taken, two of the six options on the
       verdict board become correct, and the board can only celebrate
       one of them — so a student who picks the other is told they are
       wrong about a device that really is compromised. */
    fn: s => s.replace('      harden(w, "cam3", "garage-2019-keypad");\n', "")
  },
  reusedignored: {
    file: "adversary.js",
    catches: "every scenario can be lost",
    /* A reused password stops counting as weak, so the remote-desktop
       house can never be broken into and its whole lesson —
       credential stuffing, and why a longer password would not have
       helped — silently stops happening. */
    fn: s => s.replace("weak: !!(d.dev.creds && (d.dev.creds.factory || d.dev.creds.reused))",
                       "weak: !!(d.dev.creds && d.dev.creds.factory)")
  },
  cleanisdirty: {
    file: "scenarios.js",
    catches: "the quiet house is genuinely quiet",
    /* Give the clean house "something to do" — leave the camera
       forward open and that camera on its factory password. It is the
       most natural edit in the world and it destroys the one scenario
       whose entire point is being right that nothing is wrong.

       The first version of this plant only left a factory password
       behind, which produced no defect at all: a weak credential
       with nothing forwarded to it is not a way in, and the house
       stayed clean. The plant was wrong, not the check. */
    fn: s => s.replace(
      '      setForward(w, "fw-cam", false);\n' +
      '      w.devices.forEach(d => { if (d.creds) harden(w, d.id, "set-properly-in-2024"); });',
      '      w.devices.forEach(d => { if (d.creds && d.id !== "cam1") harden(w, d.id, "set-properly-in-2024"); });')
  },
  blurbtells: {
    file: "scenarios.js",
    catches: "nothing said before play names the answer",
    /* Name the device in the blurb. Reads like helpful signposting
       and hands over the finding before the student opens anything. */
    fn: s => s.replace('blurb: "The previous owner closed everything before they moved out. They were a year too late."',
                       'blurb: "The previous owner closed everything, but the Smart Speaker never stopped talking."')
  },
  labelnumbers: {
    file: "debrief.js",
    catches: "every objective is labelled against the exam",
    /* Invent a sub-objective number. It reads as more rigorous and it
       is a claim about an official document nobody gave us — the
       first thing a peer reviewer checks, and the fastest way to have
       a handout sent back. */
    fn: s => s.replace('"Security operations — data sources: log data"',
                       '"Security operations — 4.9 data sources: log data"')
  },

  labelgone: {
    file: "debrief.js",
    catches: "every objective is labelled against the exam",
    /* Strip an objective's labels. The AAR then prints its heading
       with an empty list underneath, and the one job the document
       exists for — naming what they just did so they recognise it on
       the paper — quietly stops happening for that objective. */
    fn: s => s.replace('    "Security operations — data sources: log data",\n', "")
                .replace('    "Security operations — monitoring computing resources",\n', "")
                .replace('    "General security concepts — security controls: detective"\n', "")
  },

  unwinnable: {
    file: "world.js",
    catches: "every scenario can be won",
    /* Segments can be made and never dissolved, so the already-inside
       house — where the student has nothing to close and segmentation
       is most of the remaining work — can be stranded by one bad
       draw. */
    fn: s => s.replace("  const s = w.segments.splice(i, 1)[0];", "  const s = w.segments[i];")
  }
};

async function load(plant) {
  const dir = mkdtempSync(join(tmpdir(), "fw-scen-"));
  for (const f of FILES) {
    const src = readFileSync(join(ROOT, "assets", f), "utf8");
    let out = src;
    if (plant && plant.file === f) {
      out = plant.fn(src);
      if (out === src) throw new Error("plant did not apply to " + f + " — it is testing nothing");
    }
    writeFileSync(join(dir, f), out);
  }
  const q = "?t=" + Date.now() + Math.random();
  const im = n => import(pathToFileURL(join(dir, n)).href + q);
  return {
    S: await im("scenarios.js"), W: await im("world.js"), R: await im("rules.js"),
    T: await im("traffic.js"), A: await im("adversary.js"), V: await im("verdict.js"),
    O: await im("objectives.js"), D: await im("debrief.js")
  };
}

/* -------------------------------------------------------------------- */
async function run(plant) {
  const fails = [];
  const fail = (what, detail) => fails.push(what + " — " + detail);
  const check = (label, fn) => {
    try { fn(); } catch (e) { fail(label, "it threw: " + e.message); }
  };
  const { S, W, R, T, A, V, O, D } = await load(plant);

  /* Leave the house completely alone for `minutes`, the way a student
     who wandered off would. */
  function idle(w, minutes) {
    const adv = A.makeAdversary({ seed: w.seed, armAt: ARRIVE });
    w.now = ARRIVE;
    for (let i = 0; i < minutes; i++) {
      T.flows(w, w.now, w.now + MIN);
      adv.flows(w, w.now, w.now + MIN);
      w.now += MIN;
    }
    return w;
  }

  /* Everything a student can do, through the same functions the
     console calls — nothing reaches into the world directly. */
  function harden(w) {
    w.firewall.forwards.forEach(f => W.setForward(w, f.id, false));
    w.devices.filter(d => d.creds).forEach(d => W.setPassword(w, d.id, "h0useHold-2026"));
    W.addSegment(w, "Cameras", w.devices.filter(d => d.kind === "camera").map(d => d.id));
    W.addSegment(w, "Family", ["laptop", "phone"]);
    W.markLooked(w);
    W.addRule(w, R.makeRule({ dir: "inbound", dstPort: 23, action: "deny" }));
    const right = V.options(w).filter(o => o.correct)[0];
    V.pick(w, right.id);
    return w;
  }

  /* ---- 1. six of them, and no two the same --------------------- */
  check("six houses, none a repeat", () => {
    if (S.SCENARIOS.length !== 6) fail("six houses, none a repeat", "there are " + S.SCENARIOS.length);
    const shapes = new Set();
    S.SCENARIOS.forEach(sc => {
      const w = S.buildWorld(sc.id, 1);
      const shape = JSON.stringify({
        doors: R.reachable(w).map(d => d.forward.wanPort + "->" + d.dev.id).sort(),
        weak: w.devices.filter(d => d.creds && (d.creds.factory || d.creds.reused)).map(d => d.id).sort(),
        taken: w.devices.filter(d => d.compromised).map(d => d.id).sort()
      });
      if (shapes.has(shape)) fail("six houses, none a repeat", sc.id + " is the same house as one before it");
      shapes.add(shape);
      if (w.scenario !== sc.id) fail("six houses, none a repeat", sc.id + " does not stamp which scenario it is");
      if (!sc.teaches || sc.teaches.length < 80) fail("six houses, none a repeat", sc.id + " does not say what it teaches");
    });
  });

  /* ---- 2. AT MOST ONE DEVICE IS EVER TAKEN --------------------- */
  check("at most one device is ever taken", () => {
    S.SCENARIOS.forEach(sc => {
      const w = idle(S.buildWorld(sc.id, 1), 180);
      const taken = w.devices.filter(d => d.compromised);
      if (taken.length > 1) {
        fail("at most one device is ever taken",
             sc.id + " took " + taken.length + " (" + taken.map(d => d.id).join(", ") +
             "), so two options on a six-option board are correct and only one can be celebrated");
      }
      /* ...and the board agrees with the world, exactly once. */
      const correct = V.options(w).filter(o => o.correct);
      if (correct.length !== 1) {
        fail("at most one device is ever taken",
             sc.id + " has " + correct.length + " correct options on the board after three hours");
      }
      if (V.options(w).length !== 6) fail("at most one device is ever taken", sc.id + " board has " + V.options(w).length + " options");
    });
  });

  /* ---- 3. every scenario can be won ---------------------------- */
  check("every scenario can be won", () => {
    S.SCENARIOS.forEach(sc => {
      const w = idle(S.buildWorld(sc.id, 1), 60);
      harden(w);
      const o = O.makeObjectives(1);
      const missing = o.progress(w).filter(p => !p.met);
      if (missing.length) {
        fail("every scenario can be won",
             sc.id + " cannot reach six of six: " + missing.map(p => p.id + " (" + p.status + ")").join("; "));
      }
    });
  });

  /* ---- 4. every scenario can be lost --------------------------- */
  check("every scenario can be lost", () => {
    /* Four of the six punish being left alone. Two do not, and both
       of those are deliberate — named here so that a scenario which
       quietly stopped biting cannot hide among them. */
    const noBite = { "already-inside": "taken before the student arrived", "actually-fine": "nothing to take" };
    S.SCENARIOS.forEach(sc => {
      const w = idle(S.buildWorld(sc.id, 1), 60);
      const taken = w.devices.filter(d => d.compromised).length;
      if (noBite[sc.id]) return;
      if (!taken) {
        fail("every scenario can be lost",
             sc.id + " was left alone for an hour with a way in and a weak credential and nothing happened");
      }
    });
    /* The one that is dirty on arrival is dirty on arrival. */
    const inside = S.buildWorld("already-inside", 1);
    if (!inside.devices.some(d => d.compromised)) {
      fail("every scenario can be lost", "the house that is supposed to already be taken is clean");
    }
    if (R.reachable(inside).length) {
      fail("every scenario can be lost", "the house with nothing open has something open");
    }
  });

  /* ---- 5. the quiet house is genuinely quiet ------------------- */
  check("the quiet house is genuinely quiet", () => {
    const w = idle(S.buildWorld("actually-fine", 1), 240);
    const bad = w.devices.filter(d => d.compromised);
    if (bad.length) {
      fail("the quiet house is genuinely quiet",
           "after four hours the clean house had " + bad.map(d => d.id).join(", ") + " taken");
    }
    const right = V.options(w).filter(o => o.correct)[0];
    if (!right || right.id !== V.NONE) {
      fail("the quiet house is genuinely quiet",
           "the correct verdict is " + (right ? right.label : "nothing") + ', not "nothing is out of place"');
    }
    /* And it must be possible to be WRONG about it, or it is not a
       question. */
    const wrongOnes = V.options(w).filter(o => !o.correct);
    if (wrongOnes.length !== 5) fail("the quiet house is genuinely quiet", "it offers " + wrongOnes.length + " wrong answers");
  });

  /* ---- 6. nothing said before play names the answer ------------ */
  check("nothing said before play names the answer", () => {
    S.SCENARIOS.forEach(sc => {
      const w = idle(S.buildWorld(sc.id, 1), 60);
      const taken = w.devices.filter(d => d.compromised);
      if (!taken.length) return;
      const said = [sc.name, sc.blurb, sc.teaches].join(" ");
      taken.forEach(d => {
        [d.name, d.id].forEach(t => {
          if (said.indexOf(t) >= 0) {
            fail("nothing said before play names the answer",
                 sc.id + ' says "' + t + '" before the student has opened anything');
          }
        });
      });
    });
  });

  /* ---- 7. determinism, per scenario ---------------------------- */
  check("determinism", () => {
    S.SCENARIOS.forEach(sc => {
      const a = idle(S.buildWorld(sc.id, 9), 90);
      const b = idle(S.buildWorld(sc.id, 9), 90);
      const print = w => JSON.stringify({
        taken: w.devices.filter(d => d.compromised).map(d => d.id + "@" + d.compromisedAt).sort(),
        board: V.options(w).map(o => o.id + (o.correct ? "*" : ""))
      });
      if (print(a) !== print(b)) fail("determinism", sc.id + " ran differently twice with the same seed");
    });
  });

  /* ---- 8. no scenario strands anybody -------------------------- */
  check("every scenario can be won", () => {
    /* The mistake, made in every house: one box round a camera and
       the laptop. It has to be undoable everywhere, not just in the
       one that was tested by hand. */
    S.SCENARIOS.forEach(sc => {
      const w = S.buildWorld(sc.id, 1);
      const bad = W.addSegment(w, "Everything", ["cam1", "laptop"]);
      if (!bad.ok) { fail("every scenario can be won", sc.id + ": could not even make the mistake"); return; }
      const undo = W.removeSegment(w, "everything");
      if (!undo.ok) { fail("every scenario can be won", sc.id + ": the segment could not be dissolved"); return; }
      harden(idle(w, 60));
      const o = O.makeObjectives(1);
      if (o.done(w) !== o.total()) {
        fail("every scenario can be won",
             sc.id + ": after a bad segment and its undo only " + o.done(w) + " of " + o.total() + " could be reached");
      }
    });
  });

  /* ---- 9. the objective labelling, which is what the AAR runs on */
  check("every objective is labelled against the exam", () => {
    /* The AAR renders these, so this proves the data behind it has
       not rotted. An objective with no labels gives the document a
       heading with an empty list under it, which reads as an
       oversight because it is one. */
    O.TIER1.forEach(obj => {
      const labels = D.LABELS[obj.id];
      if (!labels || labels.length < 2) {
        fail("every objective is labelled against the exam",
             obj.id + " has " + ((labels && labels.length) || 0) + " exam label(s)");
        return;
      }
      labels.forEach(l => {
        if (!D.DOMAINS.some(dom => l.indexOf(dom) === 0)) {
          fail("every objective is labelled against the exam",
               obj.id + ' has a label under no known domain: "' + l + '"');
        }
        /* NO SUB-OBJECTIVE NUMBERS. The supplied text is domain and
           bullet level, and claiming a number nobody gave us is the
           first thing a peer reviewer will check. */
        if (/\d\.\d/.test(l)) {
          fail("every objective is labelled against the exam",
               obj.id + ' claims a sub-objective number: "' + l + '"');
        }
      });
      if (!D.BITES[obj.id] || D.BITES[obj.id].length < 60) {
        fail("every objective is labelled against the exam",
             obj.id + " does not say what leaving it undone costs later");
      }
    });

    /* All five domains reachable, or a student could finish the tier
       with a coverage column that is structurally blank. */
    const all = Object.keys(D.LABELS).reduce((a, k) => a.concat(D.LABELS[k]), []);
    D.DOMAINS.forEach(dom => {
      if (!all.some(l => l.indexOf(dom) === 0)) {
        fail("every objective is labelled against the exam", "no objective reaches " + dom);
      }
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
    console.log((caught ? "  caught  " : "  MISSED  ") + name.padEnd(14) +
                ' (expected "' + plant.catches + '") — ' + fails.length + " failure(s)");
    if (!caught) { allCaught = false; fails.forEach(f => console.log("            " + f)); }
  }
  if (!allCaught) { console.log("\nA PLANT WENT UNNOTICED. The check is not trustworthy."); process.exit(1); }
  console.log("\nall seven plants caught. the six houses are six houses.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("the six scenarios and the objective labelling: 9 checks pass"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
fails.forEach(f => console.log("  " + f));
process.exit(1);
