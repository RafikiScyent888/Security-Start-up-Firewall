/* =====================================================================
   THE RULES ENGINE, PROVED.

   Pure logic, so no browser is needed and this runs in under a second.
   That matters: a check that takes a minute gets run once a day, and a
   check that takes a second gets run after every edit.

   Twelve claims. The ones that matter most:

     - an inbound packet with no forward is UNDELIVERABLE, not denied
     - FIRST match wins, so rule order is a security control
     - an inbound rule matches the TRANSLATED destination, not the WAN
       address — which is the surprise that catches everybody
     - different segments default to NO

   ---------------------------------------------------------------------
   CALIBRATION

     node verify/rules.mjs --plant

   Five sabotaged copies of the engine, one defect each. Every one has to
   be caught. A --plant run that passes is reported as a failure, because
   a check that cannot fail is not a check.
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

/* --------------------------------------------------------------------
   THE PLANTS — each one a real mistake somebody could actually make,
   not a nonsense edit. A plant that breaks the file in an obvious way
   proves nothing.
   -------------------------------------------------------------------- */
const PLANTS = {
  lastmatch: {
    file: "assets/rules.js",
    catches: "first match wins",
    /* Walk the rules backwards: last match wins instead of first. */
    fn: s => s.replace("  for (let i = 0; i < rules.length; i++) {\n    const r = rules[i];",
                       "  for (let i = rules.length - 1; i >= 0; i--) {\n    const r = rules[i];")
  },
  natopen: {
    file: "assets/rules.js",
    catches: "NAT drops the undeliverable",
    /* NAT stops checking WHICH port was forwarded and hands every
       inbound packet to the first open door. That is the real shape of
       this bug — the first version of this plant dereferenced null and
       crashed, which proved nothing except that the harness was fragile. */
    fn: s => s.replace("  return reachable(world).filter(r => r.forward.wanPort === wanPort)[0] || null;",
                       "  return reachable(world)[0] || null;")
  },
  untranslated: {
    file: "assets/rules.js",
    catches: "inbound matches the translated address",
    /* Match the student's rules against the WAN address rather than the
       inside device — the mistake everybody makes reading their own
       ruleset. */
    fn: s => s.replace("const translated = Object.assign({}, flow, { dstIp: door.dev.ip });",
                       "const translated = Object.assign({}, flow);")
  },
  segopen: {
    file: "assets/rules.js",
    catches: "segments default to no",
    /* Segments separate visually and permit everything. */
    fn: s => s.replace("      if (sa && sb && sa !== sb) {", "      if (false) {")
  },
  cidr: {
    file: "assets/rules.js",
    catches: "CIDR matching",
    /* Off-by-one on the mask: /24 behaves like /16. */
    fn: s => s.replace("const mask = (0xffffffff << (32 - bits)) >>> 0;",
                       "const mask = (0xffffffff << (32 - Math.max(0, bits - 8))) >>> 0;")
  }
};

/* Load the engine, optionally sabotaged, from a throwaway directory so
   nothing on disk is ever touched. */
async function load(plant) {
  if (!plant) {
    return {
      R: await import(pathToFileURL(join(ROOT, "assets/rules.js")).href),
      W: await import(pathToFileURL(join(ROOT, "assets/world.js")).href)
    };
  }
  const dir = mkdtempSync(join(tmpdir(), "fw-plant-"));
  for (const f of ["assets/rules.js", "assets/world.js"]) {
    const src = readFileSync(join(ROOT, f), "utf8");
    let out = src;
    if (f === plant.file) {
      out = plant.fn(src);
      if (out === src) throw new Error("plant did not apply to " + f + " — it is testing nothing");
    }
    const dst = join(dir, f.split("/").pop());
    writeFileSync(dst, out.replace('from "./traffic.js"', 'from "./traffic.js"'));
  }
  return {
    R: await import(pathToFileURL(join(dir, "rules.js")).href + "?t=" + Date.now()),
    W: await import(pathToFileURL(join(dir, "world.js")).href + "?t=" + Date.now())
  };
}

/* -------------------------------------------------------------------- */
async function run(plant) {
  const fails = [];
  const fail = (what, detail) => fails.push(what + " — " + detail);

  /* An engine that THROWS is an engine that failed. Without this, one
     bad plant took the whole run down with a stack trace and the
     remaining checks never got to speak. */
  const check = (label, fn) => {
    try { fn(); }
    catch (e) { fail(label, "the engine threw: " + e.message); }
  };
  const { R, W } = await load(plant);

  const w = W.makeWorld(1);
  const cam1 = W.device(w, "cam1");
  const laptop = W.device(w, "laptop");
  const tv = W.device(w, "tv");

  const inbound = (port, src) => ({
    dir: "inbound", srcIp: src || "192.0.2.14", dstIp: w.wan, dstPort: port, proto: "tcp"
  });

  /* ---- 1. the undeliverable packet ------------------------------- */
  check("NAT drops the undeliverable", () => {
    const v = R.evaluate(w, inbound(22));
    if (v.allow) fail("NAT drops the undeliverable", "port 22 was accepted with no forward pointing at it");
    if (v.by !== "nat") fail("NAT drops the undeliverable", "dropped by " + v.by + ", not by NAT — the reason matters as much as the verdict");
  });

  /* ---- 2. the one door that is open ------------------------------ */
  check("the forward delivers", () => {
    const v = R.evaluate(w, inbound(8080));
    if (!v.allow) fail("the forward delivers", "port 8080 is forwarded to the camera and was refused anyway");
  });

  /* ---- 3. closing the forward closes the door -------------------- */
  check("closing the forward", () => {
    W.setForward(w, "fw-cam", false);
    const v = R.evaluate(w, inbound(8080));
    if (v.allow) fail("closing the forward", "the forward was disabled and port 8080 still got in");
    if (v.by !== "nat") fail("closing the forward", "refused by " + v.by + " rather than becoming undeliverable");
    W.setForward(w, "fw-cam", true);
  });

  /* ---- 4. first match wins --------------------------------------- */
  check("first match wins", () => {
    const w2 = W.makeWorld(1);
    w2.firewall.rules = [
      R.makeRule({ dir: "inbound", dstPort: 8080, action: "deny",  note: "first" }),
      R.makeRule({ dir: "inbound", dstPort: 8080, action: "allow", note: "second" })
    ];
    const v = R.evaluate(w2, inbound(8080));
    if (v.allow) fail("first match wins", "a deny sat above an allow and the allow won");
    if (v.index !== 0) fail("first match wins", "matched rule " + v.index + " rather than the first");
  });

  /* ---- 5. ...and order is therefore a control -------------------- */
  check("rule order matters", () => {
    const w3 = W.makeWorld(1);
    w3.firewall.rules = [
      R.makeRule({ dir: "inbound", dstPort: 8080, action: "allow", note: "first" }),
      R.makeRule({ dir: "inbound", dstPort: 8080, action: "deny",  note: "second" })
    ];
    const v = R.evaluate(w3, inbound(8080));
    if (!v.allow) fail("rule order matters", "swapping the same two rules did not change the verdict");
  });

  /* ---- 6. inbound rules see the TRANSLATED destination ----------- */
  check("inbound matches the translated address", () => {
    const w4 = W.makeWorld(1);
    w4.firewall.rules = [
      R.makeRule({ dir: "inbound", dstIp: cam1.ip, dstPort: 8080, action: "deny" })
    ];
    const v = R.evaluate(w4, inbound(8080));
    if (v.allow) {
      fail("inbound matches the translated address",
           "a rule written against the camera's own address (" + cam1.ip +
           ") did not match, so the student's rule silently did nothing");
    }
  });

  /* ---- 7. outbound is open by default ---------------------------- */
  check("outbound default", () => {
    const v = R.evaluate(w, { dir: "outbound", srcIp: cam1.ip, dstIp: "192.0.2.77", dstPort: 8443, proto: "tcp" });
    if (!v.allow) fail("outbound default", "a home router blocked outbound traffic by default — it does not");
    if (v.by !== "default") fail("outbound default", "allowed by " + v.by + " rather than by default");
  });

  /* ---- 8. a flat house lets devices talk ------------------------- */
  check("flat network", () => {
    const v = R.evaluate(w, { dir: "internal", srcIp: cam1.ip, dstIp: laptop.ip, dstPort: 445, proto: "tcp" });
    if (!v.allow) fail("flat network", "two devices on a flat network could not reach each other");
  });

  /* ---- 9. segments default to NO --------------------------------- */
  check("segments default to no", () => {
    const w5 = W.makeWorld(1);
    W.addSegment(w5, "Cameras and IoT", ["cam1", "cam2", "cam3", "cam4", "tv", "speaker", "printer"]);
    W.addSegment(w5, "Family", ["laptop", "phone"]);
    const v = R.evaluate(w5, { dir: "internal", srcIp: cam1.ip, dstIp: laptop.ip, dstPort: 445, proto: "tcp" });
    if (v.allow) fail("segments default to no", "a camera reached the laptop across two segments with no rule permitting it");
    if (v.by !== "segment") fail("segments default to no", "refused by " + v.by + " rather than by the segment boundary");

    /* ...and inside one segment, traffic still flows */
    const v2 = R.evaluate(w5, { dir: "internal", srcIp: cam1.ip, dstIp: tv.ip, dstPort: 80, proto: "tcp" });
    if (!v2.allow) fail("same segment", "two devices inside one segment could not reach each other");
  });

  /* ---- 10. CIDR --------------------------------------------------- */
  check("CIDR matching", () => {
    if (!R.matchIp("192.168.1.0/24", "192.168.1.50")) fail("CIDR matching", "192.168.1.50 was not inside 192.168.1.0/24");
    if (R.matchIp("192.168.1.0/24", "192.168.2.50"))  fail("CIDR matching", "192.168.2.50 matched 192.168.1.0/24");
    if (!R.matchIp("any", "203.0.113.9"))             fail("CIDR matching", "'any' failed to match");
    if (R.matchIp("192.168.1.0/24", "10.0.0.1"))      fail("CIDR matching", "10.0.0.1 matched a 192.168 network");
  });

  /* ---- 11. the review finds what reading cannot ------------------ */
  check("review finds shadowed rules", () => {
    const w6 = W.makeWorld(1);
    w6.firewall.rules = [
      R.makeRule({ dir: "outbound", action: "allow" }),                                  /* allow any */
      R.makeRule({ dir: "outbound", dstIp: "192.0.2.77", action: "deny" })               /* never reached */
    ];
    const notes = R.review(w6);
    if (!notes.some(n => n.kind === "shadowed")) fail("review finds shadowed rules", "a rule that can never fire was not reported");
    if (!notes.some(n => n.kind === "broad"))    fail("review finds broad allows", "allow-any-to-any was not reported");
  });

  /* ---- 12. explain() reads the right way round ------------------- */
  check("explain reads forwards", () => {
    const allow = R.explain(R.makeRule({ action: "allow", srcIp: "192.168.1.10", dstIp: "any" }));
    const deny  = R.explain(R.makeRule({ action: "deny",  srcIp: "any", dstIp: "192.168.1.50" }));
    if (!/^Let /.test(allow)) fail("explain reads forwards", "an allow rule read: " + JSON.stringify(allow));
    if (!/^Stop /.test(deny))  fail("explain reads backwards", "a deny rule read: " + JSON.stringify(deny));
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
  console.log("\nall five plants caught. the engine check measures what it claims to.");
  process.exit(0);
}

const fails = await run(null);
if (!fails.length) { console.log("rules engine: 12 checks pass"); process.exit(0); }
console.log(fails.length + " FAILURE(S):\n");
fails.forEach(f => console.log("  " + f));
process.exit(1);
