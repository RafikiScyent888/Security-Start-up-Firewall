/* =====================================================================
   THE RULES ENGINE

   Two separate things happen to an inbound packet, and telling them
   apart is the whole of Tier 1:

     1. NAT decides whether the packet has anywhere to GO.
     2. The firewall ruleset decides whether it is ALLOWED to go there.

   Step 1 happens first and it is not a rule. A packet arriving at the
   house from the internet, addressed to the WAN address, on a port
   nobody has forwarded, is not "denied" — it is *undeliverable*. There
   is no inside host it belongs to. The router drops it because it has
   no idea what else to do with it.

   That is why an open port forward is such a big deal. It is not "one
   more service". It is the single hole in an otherwise solid wall, and
   until a student can say that in their own words they have not
   understood what a home router actually does.

   ---------------------------------------------------------------------
   FIRST MATCH WINS

   Rules are evaluated top to bottom and the first one that matches
   decides. Not the most specific, not the strictest — the first. Which
   means rule ORDER is a security control, and a student who puts a
   broad allow above a narrow deny has built something that does the
   opposite of what they intended while looking perfectly reasonable.

   Every verdict carries `why` in plain words, because "DENY" on its own
   teaches nothing.
   ===================================================================== */

/* ---------------------------------------------------------------------
   ADDRESS MATCHING
   --------------------------------------------------------------------- */
function ipToInt(ip) {
  const p = String(ip).split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const o = parseInt(p[i], 10);
    if (isNaN(o) || o < 0 || o > 255) return null;
    n = (n * 256) + o;
  }
  return n;
}

/** Does `ip` fall inside `spec`? Accepts "any", a bare address, or CIDR.
    Returns false rather than throwing on nonsense, because a malformed
    rule should fail closed and be visible, not crash the game. */
export function matchIp(spec, ip) {
  if (!spec || spec === "any" || spec === "*") return true;
  if (spec.indexOf("/") < 0) return spec === ip;
  const parts = spec.split("/");
  const base = ipToInt(parts[0]);
  const bits = parseInt(parts[1], 10);
  const test = ipToInt(ip);
  if (base == null || test == null || isNaN(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return ((base & mask) >>> 0) === ((test & mask) >>> 0);
}

export function matchPort(spec, port) {
  if (spec == null || spec === "any" || spec === "*") return true;
  const s = String(spec);
  if (s.indexOf("-") > 0) {
    const a = parseInt(s.split("-")[0], 10), b = parseInt(s.split("-")[1], 10);
    return port >= a && port <= b;
  }
  return parseInt(s, 10) === port;
}

function matchProto(spec, proto) {
  if (!spec || spec === "any") return true;
  return String(spec).toLowerCase() === String(proto).toLowerCase();
}

/* ---------------------------------------------------------------------
   A RULE

   Deliberately shaped like a real firewall rule and not like a toy:
   direction, source, destination, port, protocol, action. A student who
   learns this shape can read an iptables line or an ACL and recognise
   the same six fields.
   --------------------------------------------------------------------- */
export function makeRule(o) {
  return {
    id: o.id || ("r" + Math.random().toString(36).slice(2, 8)),
    dir: o.dir || "outbound",          /* inbound | outbound | internal */
    srcIp: o.srcIp || "any",
    dstIp: o.dstIp || "any",
    dstPort: o.dstPort == null ? "any" : o.dstPort,
    proto: o.proto || "any",
    action: o.action === "allow" ? "allow" : "deny",
    note: o.note || "",
    enabled: o.enabled !== false
  };
}

/** Plain English for a rule, read in the direction that makes sense.

    An ALLOW reads forwards — "let the laptop reach the internet".
    A DENY reads backwards — "stop anything reaching the cameras".

    Getting that the wrong way round produced sentences like "silently
    drop 192.168.1.0/24 reach anywhere", which is how this function
    earned its comment. */
export function explain(rule, nameFor) {
  const who = rule.srcIp === "any" ? "anything" : (nameFor ? nameFor(rule.srcIp) : rule.srcIp);
  const to  = rule.dstIp === "any" ? "anywhere" : (nameFor ? nameFor(rule.dstIp) : rule.dstIp);
  const port = (rule.dstPort === "any" || rule.dstPort == null) ? "" : " on port " + rule.dstPort;
  const proto = rule.proto === "any" ? "" : " over " + rule.proto.toUpperCase();
  if (rule.action === "allow") {
    return "Let " + who + " reach " + to + port + proto + ".";
  }
  return "Stop " + who + " reaching " + to + port + proto + ".";
}

/* ---------------------------------------------------------------------
   NAT — does this packet have anywhere to go?
   --------------------------------------------------------------------- */

/** Every (device, port) an enabled forward actually delivers to. Empty
    for a house nobody has meddled with, which is the correct and boring
    answer — and exactly why the one entry that IS there matters. */
export function reachable(world) {
  const out = [];
  world.firewall.forwards.forEach(f => {
    if (!f.enabled) return;
    const dev = world.devices.filter(d => d.id === f.toDevice)[0];
    if (dev) out.push({ forward: f, dev: dev, port: f.toPort });
  });
  return out;
}

/** Does NAT deliver a packet arriving on `wanPort` anywhere at all?
    This runs BEFORE any rule the student wrote, because it is not a
    rule — it is whether the packet has a destination. */
export function delivered(world, wanPort) {
  return reachable(world).filter(r => r.forward.wanPort === wanPort)[0] || null;
}

/* ---------------------------------------------------------------------
   THE VERDICT
   --------------------------------------------------------------------- */

/**
 * Judge one flow against the world.
 *
 * `flow` is { dir, srcIp, dstIp, dstPort, proto }, where dir is
 * "inbound" (internet → house), "outbound" (house → internet) or
 * "internal" (house → house).
 *
 * Returns { allow, action, by, rule, why }.
 *   by: "nat" | "rule" | "default" | "segment"
 */
export function evaluate(world, flow) {
  /* --- INBOUND: NAT first, and usually last ------------------------ */
  if (flow.dir === "inbound") {
    const door = delivered(world, flow.dstPort);
    if (!door) {
      return {
        allow: false, action: "drop", by: "nat", rule: null,
        why: "Nothing on the inside is mapped to port " + flow.dstPort +
             ". There is no host this packet belongs to, so the router drops it."
      };
    }
    /* There IS a door. Now the student's rules get a say — against the
       translated destination, which is the inside device, not the WAN
       address. Students expect their rule to match the WAN address; it
       does not, and that surprise is worth having. */
    const translated = Object.assign({}, flow, { dstIp: door.dev.ip });
    const verdict = walk(world, translated);
    if (verdict) return verdict;
    return {
      allow: true, action: "accept", by: "nat", rule: null,
      why: "Port " + flow.dstPort + " is forwarded to " + door.dev.name +
           " and no rule says otherwise. It goes through."
    };
  }

  /* --- INTERNAL: segmentation, then rules -------------------------- */
  if (flow.dir === "internal") {
    const a = world.devices.filter(d => d.ip === flow.srcIp)[0];
    const b = world.devices.filter(d => d.ip === flow.dstIp)[0];
    if (a && b) {
      const sa = segOf(world, a.id), sb = segOf(world, b.id);
      if (sa && sb && sa !== sb) {
        const verdict = walk(world, flow);
        if (verdict) return verdict;
        return {
          allow: false, action: "drop", by: "segment", rule: null,
          why: a.name + " and " + b.name + " are in different segments and no rule permits it. " +
               "Separation only means something if the default between segments is no."
        };
      }
    }
  }

  /* --- OUTBOUND and same-segment INTERNAL -------------------------- */
  const verdict = walk(world, flow);
  if (verdict) return verdict;

  return {
    allow: true, action: "accept", by: "default", rule: null,
    why: flow.dir === "outbound"
      ? "Nothing here stops it. A home router lets everything out by default — which is why a compromised device can talk to whoever it likes."
      : "Same segment, no rule. On a flat network devices reach each other freely."
  };
}

/** First match wins. Returns null if no rule matched. */
function walk(world, flow) {
  const rules = world.firewall.rules;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    if (!r.enabled) continue;
    if (r.dir !== "any" && r.dir !== flow.dir) continue;
    if (!matchIp(r.srcIp, flow.srcIp)) continue;
    if (!matchIp(r.dstIp, flow.dstIp)) continue;
    if (!matchPort(r.dstPort, flow.dstPort)) continue;
    if (!matchProto(r.proto, flow.proto)) continue;
    return {
      allow: r.action === "allow",
      action: r.action === "allow" ? "accept" : "drop",
      by: "rule", rule: r, index: i,
      why: "Rule " + (i + 1) + " matched first: " + explain(r) +
           (i > 0 ? " Rules above it did not match." : "")
    };
  }
  return null;
}

function segOf(world, id) {
  for (let i = 0; i < world.segments.length; i++) {
    if (world.segments[i].members.indexOf(id) >= 0) return world.segments[i].id;
  }
  return null;
}

/* ---------------------------------------------------------------------
   RULESET REVIEW

   Finds the mistakes that are invisible when you read a ruleset top to
   bottom and obvious the moment somebody points at them. Returns notes
   rather than errors, because none of these stops the rule working —
   they stop it working the way the student thought.
   --------------------------------------------------------------------- */
export function review(world) {
  const notes = [];
  const rules = world.firewall.rules;

  rules.forEach((r, i) => {
    if (!r.enabled) return;

    /* Shadowed: an earlier rule already catches everything this one
       would. The rule is not wrong. It is simply never consulted, which
       is worse, because it looks like protection. */
    for (let j = 0; j < i; j++) {
      const e = rules[j];
      if (!e.enabled) continue;
      if (e.dir !== r.dir && e.dir !== "any") continue;
      if (covers(e, r)) {
        notes.push({
          kind: "shadowed", index: i,
          text: "Rule " + (i + 1) + " can never fire. Rule " + (j + 1) +
                " above it already matches everything this one would. It looks like protection and it is decoration."
        });
        break;
      }
    }

    /* An allow-any is not automatically wrong — but it is almost never
       what somebody meant to write. */
    if (r.action === "allow" && r.srcIp === "any" && r.dstIp === "any" &&
        (r.dstPort === "any" || r.dstPort == null)) {
      notes.push({
        kind: "broad", index: i,
        text: "Rule " + (i + 1) + " allows anything from anywhere to anywhere. Every rule below it that denies something is now decorative."
      });
    }
  });

  return notes;
}

/** Does rule `a` match everything rule `b` would? */
function covers(a, b) {
  const ipCovers = (x, y) => x === "any" || x === y || (x.indexOf("/") > 0 && y.indexOf("/") < 0 && matchIp(x, y));
  const portCovers = (x, y) => x === "any" || x == null || String(x) === String(y);
  const protoCovers = (x, y) => x === "any" || x === y;
  return ipCovers(a.srcIp, b.srcIp) && ipCovers(a.dstIp, b.dstIp) &&
         portCovers(a.dstPort, b.dstPort) && protoCovers(a.proto, b.proto);
}
