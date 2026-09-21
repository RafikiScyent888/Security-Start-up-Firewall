/* =====================================================================
   TRAFFIC — what a house sounds like when nothing is wrong

   This exists so that "abnormal" has something to be abnormal against.
   A student handed a log containing only an attack learns to spot an
   attack in a log containing only an attack, which is a skill with no
   customers.

   ---------------------------------------------------------------------
   THE POINT THAT MAKES TIER 1 WORK

   **The cameras phone home legitimately.** Every one of them talks to
   its vendor's cloud, all day, unprompted. So "a camera is sending data
   to the internet" is not suspicious — it is the product working.

   Which means the beacon the adversary plants cannot be found by
   noticing that a camera is talking. It can only be found by knowing
   WHERE a camera normally talks, and spotting one that has started
   talking somewhere else.

   That is the whole skill, and it is why this file has to be good. If
   the legitimate traffic is thin or fake, the attack stands out for the
   wrong reason and the student learns nothing transferable.

   ---------------------------------------------------------------------
   DETERMINISM

   Nothing here calls Math.random. Same world, same seed, same minute,
   same traffic — so an instructor can send a whole class to 03:14 and
   every screen shows the same lines. Flows are computed from the clock
   rather than accumulated, so a replay cannot drift.

   ---------------------------------------------------------------------
   ADDRESSES

   Legitimate internet lives in 198.51.100.0/24 and 203.0.113.0/24.
   The adversary lives in 192.0.2.0/24. All three are RFC 5737
   documentation ranges, so nothing in this simulation can ever point at
   a real host. A student who works out that one of those ranges is not
   their CDN has done the work.
   ===================================================================== */

/* ---------------------------------------------------------------------
   DETERMINISTIC RANDOM

   mulberry32. Small, fast, good enough, and — the only property that
   matters here — identical every time for a given seed.
   --------------------------------------------------------------------- */
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "90s", "5m", "2h" → milliseconds. Written out longhand because
    `everyMs("5m")` reads as intent and `300000` reads as a typo waiting
    to happen. */
export function everyMs(spec) {
  const m = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)$/.exec(String(spec).trim());
  if (!m) return Number(spec) || 0;
  const n = parseFloat(m[1]);
  const mult = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
  return Math.round(n * mult);
}

/* ---------------------------------------------------------------------
   THE ROUTE A PACKET TAKES

   Recorded on every flow so the map can light up the hops and a student
   can see that traffic to the internet passes the firewall and traffic
   between two devices on a flat network does not. That second fact is
   the one that makes segmentation click: your firewall never sees it,
   so your firewall cannot stop it.
   --------------------------------------------------------------------- */
export function pathOf(world, dev, where, dstIp) {
  if (where === "internal") {
    const seg = segOf(world, dev.id);
    const other = world.devices.filter(d => d.ip === dstIp)[0];
    const segB = other ? segOf(world, other.id) : null;
    if (seg && segB && seg !== segB) {
      return [
        { via: dev.id, from: dev.ip, to: world.gateway, inspected: false },
        { via: "gateway", from: world.gateway, to: dstIp, inspected: true }
      ];
    }
    /* Same segment, or a flat house: the switch handles it and the
       firewall never sees a packet. */
    return [{ via: dev.id, from: dev.ip, to: dstIp, inspected: false }];
  }
  return [
    { via: dev.id, from: dev.ip, to: world.gateway, inspected: false },
    { via: "gateway", from: world.wan, to: dstIp, inspected: true }
  ];
}

function segOf(world, id) {
  for (let i = 0; i < world.segments.length; i++) {
    if (world.segments[i].members.indexOf(id) >= 0) return world.segments[i].id;
  }
  return null;
}

/* ---------------------------------------------------------------------
   WHERE LEGITIMATE THINGS TALK

   Every one of these is somewhere a real household device really does
   connect to, wearing a documentation address. The camera vendor is the
   important one: it is the address a student must learn by heart,
   because recognising it is what makes the beacon visible.
   --------------------------------------------------------------------- */
export const DESTS = {
  camVendor:  { ip: "203.0.113.90",  name: "camera vendor cloud",  geo: "US" },
  tvCdn:      { ip: "198.51.100.20", name: "streaming CDN",        geo: "US" },
  speakerHome:{ ip: "198.51.100.35", name: "speaker vendor",       geo: "US" },
  printerHome:{ ip: "198.51.100.44", name: "printer vendor",       geo: "DE" },
  dns:        { ip: "198.51.100.1",  name: "DNS resolver",         geo: "US" },
  updates:    { ip: "198.51.100.60", name: "OS update service",    geo: "US" },
  web:        { ip: "198.51.100.77", name: "the web",              geo: "US" }
};

/* ---------------------------------------------------------------------
   THE FLOWS FOR A WINDOW OF TIME

   Give it a window, get back everything legitimate that happened in it.
   The adversary uses the same contract and produces flows of the same
   shape, so nothing in the log is distinguishable by its structure —
   only by its content. If the attack had its own shape a student would
   learn to spot the shape, which teaches exactly the wrong skill.
   --------------------------------------------------------------------- */
export function flows(world, from, to) {
  const out = [];
  const seed = world.seed || 1;

  world.devices.forEach((dev, di) => {
    if (dev.kind === "router") return;
    const r = rng(seed + di * 104729);

    switch (dev.kind) {
      case "camera":
        /* Constant, quiet keep-alive to the vendor. THIS is the line a
           student has to learn, because the beacon looks just like it
           apart from where it goes. */
        periodic(out, from, to, everyMs("2m"), r, t =>
          external(world, dev, DESTS.camVendor, 443, t, 800 + Math.floor(r() * 1200),
                   "keep-alive to the vendor's cloud — every camera does this, all day"));
        /* And a burst of footage when something moves. */
        periodic(out, from, to, everyMs("23m"), r, t =>
          external(world, dev, DESTS.camVendor, 443, t, 400000 + Math.floor(r() * 900000),
                   "motion clip uploaded to the vendor"));
        break;

      case "iot":
        if (dev.id === "tv") {
          periodic(out, from, to, everyMs("45m"), r, t =>
            external(world, dev, DESTS.tvCdn, 443, t, 9000000 + Math.floor(r() * 40000000),
                     "streaming — big, boring, and completely normal"));
          periodic(out, from, to, everyMs("11m"), r, t =>
            external(world, dev, DESTS.dns, 53, t, 90 + Math.floor(r() * 120), "name lookup"));
        } else if (dev.id === "speaker") {
          periodic(out, from, to, everyMs("90s"), r, t =>
            external(world, dev, DESTS.speakerHome, 443, t, 200 + Math.floor(r() * 400),
                     "talking to its manufacturer — this is the product, not a fault"));
        } else if (dev.id === "printer") {
          periodic(out, from, to, everyMs("6h"), r, t =>
            external(world, dev, DESTS.printerHome, 443, t, 5000 + Math.floor(r() * 20000),
                     "checking for firmware nobody will ever install"));
          /* Printers shout on the local network constantly. */
          periodic(out, from, to, everyMs("4m"), r, t =>
            internal(world, dev, "224.0.0.251", 5353, t, 120 + Math.floor(r() * 80),
                     "announcing itself to anything that will listen"));
        }
        break;

      case "computer":
        periodic(out, from, to, everyMs("3m"), r, t =>
          external(world, dev, DESTS.dns, 53, t, 80 + Math.floor(r() * 150), "name lookup"));
        periodic(out, from, to, everyMs("7m"), r, t =>
          external(world, dev, DESTS.web, 443, t, 20000 + Math.floor(r() * 400000), "browsing"));
        periodic(out, from, to, everyMs("9h"), r, t =>
          external(world, dev, DESTS.updates, 443, t, 2000000 + Math.floor(r() * 60000000),
                   "operating system updates"));
        break;

      case "mobile":
        /* The phone is only here some of the time, which is what makes
           an inventory worth keeping. */
        periodic(out, from, to, everyMs("5m"), r, t => {
          const hour = Math.floor(t / 3600000) % 24;
          if (hour >= 9 && hour < 17) return null;      /* out of the house */
          return external(world, dev, DESTS.web, 443, t, 10000 + Math.floor(r() * 200000), "apps");
        });
        break;
    }
  });

  return out.filter(Boolean).sort((a, b) => a.t - b.t);
}

/** Schedule something on a fixed period with a per-device offset, so
    every device is not synchronised to the top of the minute. Computed
    from the window rather than counted, so replays never drift. */
function periodic(out, from, to, period, r, make) {
  if (period <= 0) return;
  const offset = Math.floor(r() * period);
  const first = Math.ceil((from - offset) / period) * period + offset;
  for (let t = first; t < to; t += period) {
    if (t < from) continue;
    out.push(make(t));
  }
}

function external(world, dev, dest, port, t, bytes, why) {
  return {
    t: t, src: dev.id, srcIp: dev.ip, srcMac: dev.mac,
    dstName: dest.name, dstIp: dest.ip, dstPort: port, proto: "tcp",
    where: "external", geo: dest.geo, why: why, bytes: bytes,
    legit: true,
    path: pathOf(world, dev, "external", dest.ip)
  };
}

function internal(world, dev, dstIp, port, t, bytes, why) {
  return {
    t: t, src: dev.id, srcIp: dev.ip, srcMac: dev.mac,
    dstName: "local network", dstIp: dstIp, dstPort: port, proto: "udp",
    where: "internal", geo: "-", why: why, bytes: bytes,
    legit: true,
    path: pathOf(world, dev, "internal", dstIp)
  };
}

/* ---------------------------------------------------------------------
   FORMATTING

   The log is the whole interface at Tier 1, so it has to read like a
   real one — fixed columns, sortable, scannable — while staying
   legible for somebody with damaged sight. Bytes in particular: "4.2 MB"
   is readable at a glance and "4404019" is not.
   --------------------------------------------------------------------- */
export function humanBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1048576).toFixed(1) + " MB";
  return (n / 1073741824).toFixed(2) + " GB";
}

export function clockOf(ms) {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    day: d + 1,
    time: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"),
    short: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
  };
}
