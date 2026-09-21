/* =====================================================================
   THE ADVERSARY, PROVED.

   This is the most important check in the build, because the
   adversary's behaviour IS the lesson. If it is wrong, the game teaches
   something false and does it convincingly.

   The claim that matters most:

     **Closing the forward after the break-in does NOT stop the beacon.**

   An earlier build had stage 5 inside the `if (door)` block, so closing
   the hole silenced the beacon. A student who fixed it late watched the
   traffic stop and concluded they had cleaned up. They had not. That is
   the opposite of the intended lesson, delivered persuasively, and no
   check existed that would have noticed.

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/adversary.mjs --plant

   Seven sabotaged copies, one defect each — including that exact
   historical bug. Every one has to be caught.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, mkdirSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const FILES = ["world.js", "rules.js", "traffic.js", "adversary.js"];

const PLANTS = {
  armlate: {
    file: "adversary.js",
    catches: "the backlog cannot break in",
    /* Let a door's clock start wherever the window happens to start.
       Generating the forty-five minutes of history a student arrives
       to then breaks into the house before they have sat down, and
       the first thing they ever see is a consequence they could not
       have prevented. */
    fn: s => s.replace("A.eligible[devId] = Math.max(from, ARM);", "A.eligible[devId] = from;")
  },
  beaconcaged: {
    file: "adversary.js",
    catches: "the beacon survives the fix",
    /* THE HISTORICAL BUG, reproduced exactly: stage 5 moved inside the
       door check, so closing the forward silences the beacon. */
    fn: s => s.replace(
      "    world.devices.filter(x => x.compromised).forEach((dev, di) => {",
      "    if (!doors.length) return out.sort((a, b) => a.t - b.t);\n    world.devices.filter(x => x.compromised).forEach((dev, di) => {")
  },
  instantbreak: {
    file: "adversary.js",
    catches: "the grace period is real",
    /* Break in the moment the world becomes breakable, giving the
       student no window to prevent it. */
    fn: s => s.replace("if (to - A.eligible[devId] >= BREAK_IN_MS && !d.dev.compromised) {",
                       "if (to - A.eligible[devId] >= 0 && !d.dev.compromised) {")
  },
  noreset: {
    file: "adversary.js",
    catches: "the clock restarts for a new hole",
    /* Changing the password no longer resets the countdown, so a fix
       inside the window does not save them. */
    fn: s => s.replace("        delete A.eligible[devId];", "        /* clock not reset */")
  },
  beaconhome: {
    file: "adversary.js",
    catches: "the beacon goes somewhere new",
    /* The beacon goes to the vendor's own cloud, so it is
       indistinguishable from legitimate camera traffic and the lesson
       becomes unlearnable. */
    fn: s => s.replace('const C2 = { ip: "192.0.2.77", port: 8443, geo: "NL" };',
                       'const C2 = { ip: "203.0.113.90", port: 443, geo: "US" };')
  },
  nonoise: {
    file: "adversary.js",
    catches: "background noise is always there",
    /* No background scanning, so the only inbound traffic in the log is
       the attack and "hits from the internet" becomes alarming — which
       teaches a false instinct. */
    fn: s => s.replace("    SCANNERS.forEach((s, si) => {", "    [].forEach((s, si) => {")
  },
  nondeterministic: {
    file: "traffic.js",
    catches: "determinism",
    /* Math.random in the generator, so no two students ever see the
       same thing and an instructor cannot send a class to one moment. */
    fn: s => s.replace("    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;", "    return Math.random();")
  }
};

async function load(plant) {
  const dir = mkdtempSync(join(tmpdir(), "fw-adv-"));
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
  return {
    W: await import(pathToFileURL(join(dir, "world.js")).href + q),
    R: await import(pathToFileURL(join(dir, "rules.js")).href + q),
    T: await import(pathToFileURL(join(dir, "traffic.js")).href + q),
    A: await import(pathToFileURL(join(dir, "adversary.js")).href + q)
  };
}

const MIN = 60000;

async function run(plant) {
  const fails = [];
  const fail = (what, detail) => fails.push(what + " — " + detail);
  const check = (label, fn) => {
    try { fn(); } catch (e) { fail(label, "threw: " + e.message); }
  };

  const { W, R, T, A } = await load(plant);

  /* Run the world forward in one-minute steps, the way the app will. */
  function advance(world, adv, minutes) {
    const all = [];
    for (let i = 0; i < minutes; i++) {
      const from = world.now, to = world.now + MIN;
      all.push(...T.flows(world, from, to), ...adv.flows(world, from, to));
      world.now = to;
    }
    return all;
  }

  /* ---- 1. the internet is always knocking ------------------------ */
  check("background noise is always there", () => {
    const w = W.makeWorld(1);
    W.setForward(w, "fw-cam", false);              /* no door at all */
    const adv = A.makeAdversary({ seed: 7 });
    const log = advance(w, adv, 20);
    const noise = log.filter(f => f.where === "inbound");
    if (!noise.length) {
      fail("background noise is always there",
           "no inbound scanning with the forward closed — a student would learn that any internet hit is alarming, which is false");
    }
  });

  /* ---- 2. a door gets found, and knocked on ---------------------- */
  check("the door gets found", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    const log = advance(w, adv, 20);
    const probes = log.filter(f => f.where === "inbound" && /probing the forwarded port/.test(f.why));
    const creds = log.filter(f => /factory credentials/.test(f.why));
    if (!probes.length) fail("the door gets found", "an open forward attracted no targeted probing");
    if (!creds.length) fail("the door gets found", "factory credentials were never tried against an exposed camera");
  });

  /* ---- 3. the grace period is real ------------------------------- */
  check("the grace period is real", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    advance(w, adv, 5);                            /* 5 min < 8 min */
    if (W.device(w, "cam1").compromised) {
      fail("the grace period is real",
           "broken into after 5 minutes — the 8-minute window a student needs in order to prevent it does not exist");
    }
    advance(w, adv, 6);                            /* now past 8 */
    if (!W.device(w, "cam1").compromised) {
      fail("the grace period is real", "still not compromised after 11 minutes of an open door and a factory password");
    }
  });

  /* ---- 4. closing the forward in time PREVENTS it ---------------- */
  check("closing the forward prevents it", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    advance(w, adv, 4);
    W.setForward(w, "fw-cam", false);
    advance(w, adv, 30);
    if (W.device(w, "cam1").compromised) {
      fail("closing the forward prevents it", "the forward was closed inside the window and the break-in happened anyway");
    }
  });

  /* ---- 5. changing the password in time PREVENTS it -------------- */
  check("changing the password prevents it", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    advance(w, adv, 4);
    W.setPassword(w, "cam1", "correct-horse-battery");
    advance(w, adv, 30);
    if (W.device(w, "cam1").compromised) {
      fail("changing the password prevents it",
           "the factory password was changed inside the window and the break-in happened anyway");
    }
  });

  /* ---- 5b. THE FACTORY RESET THAT UNDOES THE FIX -----------------
     The reachable path to the per-door clock reset, and a real lesson
     in its own right: somebody resets a misbehaving camera with a
     paperclip and silently puts the manual's password back on it.

     The clock for that door must START AGAIN. If a stale timestamp
     survives, the student is taken instantly for a hole they had
     already fixed once — and the grace period quietly stops existing
     for anyone who has ever hardened anything.

     Two earlier versions of this check missed the plant: the first
     because the break-in test sits inside the `weak` branch, so simply
     changing a password makes the reset unreachable; the second
     because moving to a per-device clock meant a different device got
     a fresh timestamp anyway. Only the same device, weak again, tests
     it. */
  check("the clock restarts for a new hole", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });

    advance(w, adv, 4);
    W.setPassword(w, "cam1", "correct-horse-battery");   /* clock should clear */
    advance(w, adv, 10);                                  /* well past 8 minutes */
    if (W.device(w, "cam1").compromised) {
      fail("the clock restarts for a new hole", "harness: hardened and still taken, so nothing below was tested");
      return;
    }

    W.factoryReset(w, "cam1");                            /* weak again */
    advance(w, adv, 3);                                   /* only 3 minutes of THIS exposure */
    if (W.device(w, "cam1").compromised) {
      fail("the clock restarts for a new hole",
           "taken 3 minutes after a factory reset, because a stale countdown survived from before the password was ever changed");
    }

    advance(w, adv, 8);
    if (!W.device(w, "cam1").compromised) {
      fail("the clock restarts for a new hole",
           "the reset camera was never taken at all — the clock restarted and then never fired");
    }
  });

  /* ---- 6. THE ONE THAT MATTERS -----------------------------------
     Fix it too late and the beacon keeps going. Containment is not
     prevention. */
  check("the beacon survives the fix", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    advance(w, adv, 12);                           /* compromised by now */
    if (!W.device(w, "cam1").compromised) {
      fail("the beacon survives the fix", "harness: the camera was never compromised, so nothing was tested");
      return;
    }
    W.setForward(w, "fw-cam", false);              /* the late fix */
    W.setPassword(w, "cam1", "correct-horse-battery");
    const after = advance(w, adv, 30);
    const beacons = after.filter(f => f.dstIp === "192.0.2.77");
    if (!beacons.length) {
      fail("the beacon survives the fix",
           "closing the forward and changing the password silenced the beacon — which teaches that a late fix undoes a breach. It does not.");
    }
  });

  /* ---- 7. the beacon goes somewhere the camera never went -------- */
  check("the beacon goes somewhere new", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    const log = advance(w, adv, 40);
    const camFlows = log.filter(f => f.src === "cam1" && f.where === "external");
    const legit = camFlows.filter(f => f.legit).map(f => f.dstIp);
    const bad = camFlows.filter(f => !f.legit).map(f => f.dstIp);
    if (!legit.length) fail("the beacon goes somewhere new", "the camera never made any legitimate outbound traffic to compare against");
    if (!bad.length) fail("the beacon goes somewhere new", "no beacon traffic at all after 40 minutes");
    if (bad.length && legit.length && bad.every(ip => legit.indexOf(ip) >= 0)) {
      fail("the beacon goes somewhere new",
           "the beacon goes to the same address as the legitimate traffic (" + bad[0] + "), so it is invisible and the lesson is unlearnable");
    }
  });

  /* ---- 8. it looks like everything else in the log ---------------- */
  check("the attack has no special shape", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    const log = advance(w, adv, 40);
    const keysOf = f => Object.keys(f).sort().join(",");
    const legit = log.filter(f => f.legit)[0];
    const bad = log.filter(f => !f.legit)[0];
    if (!legit || !bad) { fail("the attack has no special shape", "harness: needed one of each and did not get both"); return; }
    if (keysOf(legit) !== keysOf(bad)) {
      fail("the attack has no special shape",
           "attack flows carry different fields to legitimate ones, so a student could spot them by structure rather than behaviour");
    }
  });

  /* ---- 9. determinism -------------------------------------------- */
  check("determinism", () => {
    const sig = () => {
      const w = W.makeWorld(1);
      const adv = A.makeAdversary({ seed: 7 });
      return advance(w, adv, 25).map(f => f.t + "|" + f.srcIp + "|" + f.dstIp + "|" + f.dstPort + "|" + f.bytes).join("\n");
    };
    if (sig() !== sig()) {
      fail("determinism", "two identical runs produced different traffic — an instructor cannot send a class to the same moment");
    }
  });

  /* ---- 10. no compromise, no beacon ------------------------------ */
  check("no compromise no beacon", () => {
    const w = W.makeWorld(1);
    W.setForward(w, "fw-cam", false);
    W.setPassword(w, "cam1", "correct-horse-battery");
    const adv = A.makeAdversary({ seed: 7 });
    const log = advance(w, adv, 60);
    if (log.some(f => f.dstIp === "192.0.2.77")) {
      fail("no compromise no beacon", "a clean house produced beacon traffic");
    }
  });

  /* ---- 11. the world records it, silently ------------------------ */
  check("the world records the foothold", () => {
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7 });
    advance(w, adv, 12);
    const note = w.history.filter(h => h.what === "adversary.foothold")[0];
    if (!note) fail("the world records the foothold", "nothing was written to history, so an instructor cannot see what happened");
  });

  /* ---- 12. the backlog cannot break in --------------------------- */
  check("the backlog cannot break in", () => {
    /* The student sits down at 20:00 and can scroll back through the
       previous forty-five minutes. Generating that history has to show
       the scanning and the probing — both real, both part of what
       normal looks like here — without handing them a house that was
       taken before they arrived. Their eight minutes start when they
       sit down. */
    const ARRIVE = 20 * 60 * MIN;
    const w = W.makeWorld(1);
    const adv = A.makeAdversary({ seed: 7, armAt: ARRIVE });

    const back = adv.flows(w, ARRIVE - 45 * MIN, ARRIVE);
    if (w.devices.some(d => d.compromised)) {
      fail("the backlog cannot break in",
           "generating the log the student arrives to broke into the house before they had sat down");
    }
    if (!back.length) {
      fail("the backlog cannot break in", "the forty-five minutes before they arrive produced no traffic at all");
    }
    if (!back.some(f => f.dstPort === 8080)) {
      fail("the backlog cannot break in",
           "the open door had not been probed at all in forty-five minutes, so the history teaches nothing");
    }

    /* ...and the clock really does run from the moment they arrive. */
    w.now = ARRIVE;
    advance(w, adv, 10);
    if (!w.devices.some(d => d.compromised)) {
      fail("the backlog cannot break in",
           "arming the clock at arrival postponed the break-in for ever instead of by forty-five minutes");
    }
  });

  return fails;
}

/* -------------------------------------------------------------------- */
if (process.argv.includes("--plant")) {
  let allCaught = true;
  for (const [name, plant] of Object.entries(PLANTS)) {
    let fails;
    try { fails = await run(plant); }
    catch (e) { console.log("  ERROR   " + name.padEnd(17) + e.message); allCaught = false; continue; }
    const caught = fails.some(f => f.startsWith(plant.catches));
    console.log((caught ? "  caught  " : "  MISSED  ") + name.padEnd(17) +
                '(expected "' + plant.catches + '") — ' + fails.length + " failure(s)");
    if (!caught) { allCaught = false; fails.forEach(f => console.log("            " + f)); }
  }
  if (!allCaught) { console.log("\nA PLANT WENT UNNOTICED. The check is not trustworthy."); process.exit(1); }
  console.log("\nall seven plants caught, including the historical beacon bug.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("adversary: 12 checks pass"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
fails.forEach(f => console.log("  " + f));
process.exit(1);
