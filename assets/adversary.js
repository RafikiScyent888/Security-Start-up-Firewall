/* =====================================================================
   THE ADVERSARY — TIER 1

   It runs from the first minute and it says NOTHING. No alert, no
   banner, no red box, no "you have been compromised" panel. The only
   evidence anywhere is lines in the log. A student who never looks
   never knows — and that is the lesson, because it is what actually
   happens to people.

   ---------------------------------------------------------------------
   IT READS THE WORLD, IT DOES NOT READ A SCRIPT

   Every stage below is gated on what is TRUE right now, recomputed from
   `world` on every call. Close the port forward and the knocking stops.
   Kill the factory password and the door never opens. That is the
   promise the whole build rests on: the grade is the state of the
   network, not a checklist somebody ticked.

   And it cuts the other way, which is the harder half. A foothold does
   not disappear because the hole was closed afterwards. Once the camera
   is theirs, closing the forward stops new arrivals and does nothing
   about the one already inside — the beacon keeps going.

   **Containment and prevention are different things**, and this is
   where a student learns it: by doing the right fix a day late.

   That single rule is why stage 5 lives outside the `if (door)` block
   below. In an earlier build it was inside, and closing the forward
   silenced the beacon too — so a student who fixed the hole late saw
   the traffic stop and concluded they had cleaned up. They had not.

   ---------------------------------------------------------------------
   NAT IS THE FIRST FIREWALL, AND NOBODY TELLS BEGINNERS THIS

   Unsolicited traffic from the internet does not reach a house at all,
   because there is nowhere for it to go. That is why an open port
   forward is such a big deal: it is not "one more service", it is the
   single hole in an otherwise solid wall. The log shows the difference
   plainly — DROP after DROP against the WAN address, then ACCEPT after
   ACCEPT against the one port somebody opened for convenience.

   ---------------------------------------------------------------------
   DETERMINISM

   Same world, same seed, same minute, same attack. Nothing here calls
   Math.random, and nothing accumulates a counter a replay would have to
   re-run: the break-in happens a fixed interval after the world FIRST
   became breakable, so it is a function of the student's actions and
   the clock, not of how many frames the browser managed to render.
   ===================================================================== */

import { rng, everyMs, pathOf } from "./traffic.js";
import { reachable, delivered } from "./rules.js";

/* TEST-NET-1. Legitimate traffic in this world uses TEST-NET-2 and
   TEST-NET-3, so the adversary is separable by eye once a student knows
   to look — and nothing anywhere labels it. A student who has not
   worked out that 192.0.2.0/24 is not their CDN has not done the work
   yet, and telling them would remove the only lesson here. */
const SCANNERS = [
  { ip: "192.0.2.14",  geo: "NL" },
  { ip: "192.0.2.51",  geo: "SG" },
  { ip: "192.0.2.88",  geo: "BR" },
  { ip: "192.0.2.120", geo: "RO" }
];

const C2 = { ip: "192.0.2.77", port: 8443, geo: "NL" };

/* A scanner's MAC is the ROUTER'S OWN upstream gateway, because that is
   what a router actually records for anything arriving on the WAN — the
   layer 2 address of the last hop, not of whoever sent it. A student who
   tries to identify an attacker by MAC has to find out why that does not
   work, and the log is where they find out. */
const UPSTREAM_MAC = "00:1d:cf:2a:7b:04";

/* How long the world must stay breakable before it is broken. Eight
   simulated minutes: long enough that a student who spots the knocking
   and closes the forward has genuinely prevented it, short enough that
   one who wanders off comes back to a different network. */
export const BREAK_IN_MS = 8 * 60000;

export function makeAdversary(opts) {
  opts = opts || {};
  const seed = opts.seed == null ? 424242 : opts.seed;

  /* THE EARLIEST A DOOR'S CLOCK MAY START.

     The student sits down at a particular minute, and the log they can
     scroll back through covers the three quarters of an hour before
     that. Generating those forty-five minutes has to produce the
     background scanning and the probing — both of which have genuinely
     been going on, and both of which belong in "what normal looks
     like" — without also handing them a house that was broken into
     before they arrived.

     So the eight minutes of grace begin when they sit down. Everything
     before that is history they can read; nothing before that is a
     consequence they could have prevented. Defaults to zero, which is
     no constraint at all. */
  const ARM = opts.armAt == null ? 0 : opts.armAt;

  const A = {
    /* State that is ABOUT THE ATTACK rather than about the network.
       Anything that is a fact about the network — which device is
       compromised — is written onto the world, because world.js is the
       single source of truth and a second copy here is how the map ends
       up telling a student something the engine disagrees with.

       Keyed BY DEVICE, not a single value. The first version held one
       timestamp for "the" door, and a verifier caught what that meant:
       harden the one device the adversary happened to pick and it gave
       up on every other open hole. A student could secure the front
       door camera, leave three more exposed with the same factory
       password, and be told the house was clean.

       Every reachable door now has its own clock. */
    eligible: {}
  };

  /* EVERY DOOR THAT IS OPEN RIGHT NOW, and whether each one is weak.
     Recomputed from the world every call. Never cached — a cached
     answer is a fix that appears not to have worked. */
  function doorsNow(world) {
    return reachable(world).map(d => ({
      door: d,
      /* FACTORY **OR** REUSED. A password that shipped with the
         hardware and a password the owner also used on a site that
         has been breached are the same thing to an attacker: both are
         typed in from a list, neither is guessed, and neither is
         fixed by making it longer. Only the first of those looks
         wrong to a student, which is why the second is in here. */
      weak: !!(d.dev.creds && (d.dev.creds.factory || d.dev.creds.reused))
    }));
  }

  /* -------------------------------------------------------------------
     THE FLOWS FOR A WINDOW OF TIME

     Same contract as traffic.flows — give it a window, get back flows,
     which the engine judges and turns into log exactly like every other
     flow. The adversary gets no special path into the log. If it did, a
     student could learn to spot it by its shape rather than by its
     behaviour, which teaches the wrong skill entirely.
     ------------------------------------------------------------------- */
  A.flows = function (world, from, to) {
    const out = [];
    const doors = doorsNow(world);
    const wan = world.wan;

    /* --- STAGE 1: the background noise of the internet ---------------
       Constant, unstoppable, and almost entirely meaningless. It exists
       so a student learns the shape of normal before being asked to
       spot abnormal — and so that "there are hits from the internet in
       my log" is not, by itself, alarming. It is not. */
    SCANNERS.forEach((s, si) => {
      const period = everyMs("90s");
      const r = rng(seed + si * 7919);
      const offset = Math.floor(r() * period);
      const ports = [22, 23, 80, 443, 445, 3389, 8080, 8443];
      for (let t = Math.ceil((from - offset) / period) * period + offset; t < to; t += period) {
        if (t < from) continue;
        out.push(inbound(s, wan, ports[Math.floor(r() * ports.length)], t,
                         60 + Math.floor(r() * 120), "internet background scanning"));
      }
    });

    /* STAGES 2 TO 4 NEED A DOOR. STAGE 5 DOES NOT.

       Every open door is worked independently. Hardening one changes
       nothing about the others, which is the honest behaviour and also
       the only behaviour that lets a student find out they fixed one of
       four. */
    doors.forEach((entry, di) => {
      const d = entry.door;
      const devId = d.dev.id;

      /* --- STAGE 2: the door gets found -----------------------------
         An open forward is found in minutes, not months. Once it exists,
         a scanner starts coming back to that exact port — the first
         thing in the log that is about THIS house rather than about the
         internet in general. */
      const found = rng(seed + 31 + di * 1013);
      const p2 = everyMs("40s");
      const off2 = Math.floor(found() * p2);
      for (let t = Math.ceil((from - off2) / p2) * p2 + off2; t < to; t += p2) {
        if (t < from) continue;
        out.push(inbound(SCANNERS[di % SCANNERS.length], wan, d.forward.wanPort, t,
                         200 + Math.floor(found() * 300), "probing the forwarded port"));
      }

      if (entry.weak) {
        /* --- STAGE 3: the published password ------------------------
           These are the same credentials on every unit of that model,
           and they are on the internet. Not a brute force in any
           meaningful sense — somebody typing in the default from a list. */
        if (A.eligible[devId] == null) A.eligible[devId] = Math.max(from, ARM);

        const cred = rng(seed + 77 + di * 2027);
        const p3 = everyMs("20s");
        const off3 = Math.floor(cred() * p3);
        for (let t = Math.ceil((from - off3) / p3) * p3 + off3; t < to; t += p3) {
          if (t < from) continue;
          out.push(inbound(SCANNERS[(di + 1) % SCANNERS.length], wan, d.forward.wanPort, t,
                           400 + Math.floor(cred() * 400),
                           d.dev.creds && d.dev.creds.reused
                             ? "trying passwords from a breach list"
                             : "trying the model's factory credentials"));
        }

        /* --- STAGE 4: in --------------------------------------------
           A fixed interval after THIS door first became breakable, so a
           student who closes the forward or changes the password inside
           that window has genuinely prevented it. */
        if (to - A.eligible[devId] >= BREAK_IN_MS && !d.dev.compromised) {
          d.dev.compromised = true;
          d.dev.compromisedAt = A.eligible[devId] + BREAK_IN_MS;
          world.history.push({
            t: d.dev.compromisedAt,
            what: "adversary.foothold",
            detail: d.dev.name + " accepted a login from " + SCANNERS[(di + 1) % SCANNERS.length].ip,
            why: (d.dev.creds && d.dev.creds.reused ? "a password already on a breach list" : "factory credentials") +
                 ", reachable from the internet"
          });
        }
      } else {
        /* Password changed: this door's clock resets. If it is ever
           exposed again with a weak credential, the student gets the
           full window back rather than being taken instantly because of
           a hole they already fixed. */
        delete A.eligible[devId];
      }
    });

    /* A door that has been closed stops counting. Without this, closing
       a forward and reopening it later would resume an old countdown
       and the grace period would silently stop existing. */
    Object.keys(A.eligible).forEach(id => {
      if (!doors.some(e => e.door.dev.id === id)) delete A.eligible[id];
    });

    /* --- STAGE 5: the beacon -----------------------------------------
       THIS IS THE ONE THAT SURVIVES THE FIX. It runs off
       `dev.compromised`, which is world state and does not un-set itself
       when the forward closes.

       A camera that has never spoken to anything but its vendor's cloud
       is now calling somewhere else, every five minutes, for ever — and
       the only way a student finds it is by knowing what that camera's
       normal looks like. */
    world.devices.filter(x => x.compromised).forEach((dev, di) => {
      const b = rng(seed + 991 + di);
      const start = dev.compromisedAt || 0;

      const p5 = everyMs("5m");
      const off5 = Math.floor(b() * p5);
      for (let t = Math.ceil((from - off5) / p5) * p5 + off5; t < to; t += p5) {
        if (t < from || t < start) continue;
        out.push(outbound(world, dev, t, 300 + Math.floor(b() * 200),
                          "beacon to an address this device has never used before"));
      }

      /* And occasionally something much bigger goes out. Footage. */
      const p6 = everyMs("30m");
      const off6 = Math.floor(b() * p6);
      for (let t = Math.ceil((from - off6) / p6) * p6 + off6; t < to; t += p6) {
        if (t < from || t < start) continue;
        out.push(outbound(world, dev, t, 2000000 + Math.floor(b() * 3000000),
                          "a great deal of data leaving a camera"));
      }
    });

    return out.sort((a, b) => a.t - b.t);
  };

  A.state = () => ({ eligible: Object.assign({}, A.eligible) });

  /* Restored from a save. How long the house has been breakable is part
     of the campaign: without it, closing the tab would hand back a fresh
     eight minutes of grace every time, and a break-in a student can
     postpone for ever by reloading is a loophole rather than a
     consequence. */
  A.restore = function (st) {
    if (st && st.eligible) A.eligible = Object.assign({}, st.eligible);
    /* Saves written by the single-clock version carried one timestamp
       and no device. Honour it by applying it to whatever is currently
       exposed, rather than silently handing back a fresh window. */
    else if (st && st.eligibleSince != null) A.eligible = { __legacy: st.eligibleSince };
    return A;
  };

  return A;
}

/* An inbound flow, shaped exactly like a legitimate one. `where` is
   "inbound", which is the only thing that distinguishes it, and that is
   a fact about direction rather than a label saying "attack". */
function inbound(scanner, wanIp, port, t, bytes, why) {
  return {
    t: t, src: "wan", srcIp: scanner.ip, srcMac: UPSTREAM_MAC,
    dstName: "this house", dstIp: wanIp, dstPort: port, proto: "tcp",
    where: "inbound", geo: scanner.geo, why: why, bytes: bytes,
    legit: false,
    path: [{ via: "gateway", from: "wan", to: null, inspected: true }]
  };
}

function outbound(world, dev, t, bytes, why) {
  return {
    t: t, src: dev.id, srcIp: dev.ip, srcMac: dev.mac,
    dstName: "unknown host", dstIp: C2.ip, dstPort: C2.port, proto: "tcp",
    where: "external", geo: C2.geo, why: why, bytes: bytes,
    legit: false,
    path: pathOf(world, dev, "external", C2.ip)
  };
}

export { C2, SCANNERS };
