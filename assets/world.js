/* =====================================================================
   THE WORLD — TIER 1

   One house, one router, and the devices a family actually owns. This is
   the single source of truth. The map draws it, the console edits it,
   the rules engine judges against it, the adversary reads it, and the
   objectives are computed from it.

   NOTHING ELSE HOLDS STATE. The moment a second copy of "is the camera
   compromised" exists anywhere, the map starts telling a student
   something the engine disagrees with.

   ---------------------------------------------------------------------
   WHY THESE DEVICES

   Every one is here to teach something, and none of them is filler:

     - the CAMERAS are the lesson. Somebody bought a four-pack, wanted to
       watch them from work, and followed a forum post that said "forward
       port 8080". The factory password is still on them.
     - the PRINTER is the thing nobody thinks about that talks to the
       internet constantly.
     - the TV and the SPEAKER are what "IoT" actually means to a family —
       devices you cannot patch, cannot log into, and cannot remove.
     - the LAPTOP is the only device with anything valuable on it, and it
       is the one nobody attacks directly.
     - the PHONE comes and goes, which is what makes DHCP leases and
       device inventory real rather than theoretical.

   ---------------------------------------------------------------------
   ADDRESSES

   RFC 5737 documentation ranges throughout, so nothing here can ever
   point at a real host: 203.0.113.0/24 is the ISP side, 192.0.2.0/24 is
   where the adversary lives, 198.51.100.0/24 is legitimate internet.
   The LAN is ordinary private space because that is what a house has.
   ===================================================================== */

export const LAN = "192.168.1.0/24";
export const WAN_IP = "203.0.113.2";
export const GATEWAY = "192.168.1.1";

/* The ports a home actually uses, named, because "8080" means nothing to
   somebody three weeks into studying and "the camera's web page" means
   everything. */
export const PORTS = {
  22:   { name: "SSH",    note: "remote command line" },
  23:   { name: "Telnet", note: "remote command line, unencrypted — obsolete and still shipping on cheap hardware" },
  53:   { name: "DNS",    note: "turning names into addresses" },
  80:   { name: "HTTP",   note: "web, unencrypted" },
  443:  { name: "HTTPS",  note: "web, encrypted" },
  445:  { name: "SMB",    note: "Windows file sharing" },
  554:  { name: "RTSP",   note: "video streaming — how cameras send pictures" },
  1900: { name: "SSDP",   note: "how devices announce themselves on a home network" },
  3389: { name: "RDP",    note: "remote desktop" },
  5353: { name: "mDNS",   note: "how phones and printers find each other" },
  8080: { name: "HTTP-alt", note: "a second web port, the usual choice when somebody forwards something" },
  8443: { name: "HTTPS-alt", note: "a second encrypted web port" },
  9100: { name: "RAW",    note: "printing" }
};

export function portName(p) {
  return PORTS[p] ? PORTS[p].name : String(p);
}

/* ---------------------------------------------------------------------
   THE STARTING HOUSE

   Deliberately NOT a clean slate. The student inherits a network that
   somebody else set up badly, which is what walking into any real job
   feels like. The port forward is already there. The factory password is
   already there. Nobody did anything malicious; somebody wanted to check
   the cameras from work.
   --------------------------------------------------------------------- */
export function makeWorld(seed) {
  const w = {
    seed: seed == null ? 1 : seed,
    tier: 1,
    wan: WAN_IP,
    gateway: GATEWAY,

    /* Minutes of simulated time since the world began. The clock drives
       traffic generation and the adversary; it is not wall time. */
    now: 0,

    /* Has the student ever opened the log? Used by the "nothing is
       wrong" objective, which must not read as a clean bill of health
       before anybody has looked at anything. */
    looked: false,

    devices: [
      {
        id: "router", name: "Router", kind: "router",
        ip: GATEWAY, mac: "00:1d:cf:2a:7b:04",
        zone: "infra", patchable: true, patched: false,
        creds: { user: "admin", pass: "admin", factory: true },
        note: "The guard. Everything in and out of this house goes through it."
      },
      {
        id: "laptop", name: "Laptop", kind: "computer",
        ip: "192.168.1.10", mac: "3c:22:fb:11:0a:81",
        zone: "trusted", patchable: true, patched: true,
        note: "Banking, email, photographs. The only device here with anything worth stealing — and nothing attacks it directly."
      },
      {
        id: "phone", name: "Phone", kind: "mobile",
        ip: "192.168.1.11", mac: "a4:83:e7:5c:9d:2f",
        zone: "trusted", patchable: true, patched: true, transient: true,
        note: "Leaves the house every day and comes back. Its lease expires; its address changes."
      },
      {
        id: "tv", name: "Smart TV", kind: "iot",
        ip: "192.168.1.20", mac: "d4:9a:20:63:11:c7",
        zone: "trusted", patchable: false, patched: false,
        note: "Last firmware update was three years ago. There will not be another one."
      },
      {
        id: "speaker", name: "Smart Speaker", kind: "iot",
        ip: "192.168.1.21", mac: "f0:81:73:2e:55:19",
        zone: "trusted", patchable: false, patched: false,
        note: "Talks to its manufacturer constantly. That is not a fault, it is the product."
      },
      {
        id: "printer", name: "Printer", kind: "iot",
        ip: "192.168.1.30", mac: "00:15:99:c4:7a:03",
        zone: "trusted", patchable: true, patched: false,
        creds: { user: "admin", pass: "admin", factory: true },
        note: "Nobody has ever logged into it. Its web page has no password worth the name."
      },
      /* THE FOUR CAMERAS. One of them is reachable from the internet,
         and all four have the same factory password, because they came
         in one box. */
      cam("cam1", "Front Door Camera", "192.168.1.50", "b8:27:eb:04:1f:22", true),
      cam("cam2", "Back Door Camera",  "192.168.1.51", "b8:27:eb:04:1f:23", false),
      cam("cam3", "Garage Camera",     "192.168.1.52", "b8:27:eb:04:1f:24", false),
      cam("cam4", "Driveway Camera",   "192.168.1.53", "b8:27:eb:04:1f:25", false)
    ],

    /* The firewall. `forwards` is NAT — whether a packet from outside has
       anywhere to go at all. `rules` is the student's ruleset, evaluated
       first-match-wins. They are different things and conflating them is
       the single most common beginner error, so they are separate here. */
    firewall: {
      forwards: [
        {
          id: "fw-cam",
          wanPort: 8080, toDevice: "cam1", toPort: 80, proto: "tcp",
          enabled: true,
          why: "Added so the cameras could be checked from work. Nobody has thought about it since."
        }
      ],
      rules: []
    },

    /* Segments the student can create. A house starts flat, because
       houses are flat. */
    segments: [],

    /* Everything that has ever changed, with a reason. The instructor can
       read it; the verifier can prove the engine believes what the log
       says; and a student can see their own history. */
    history: []
  };
  return w;
}

function cam(id, name, ip, mac, exposed) {
  return {
    id: id, name: name, kind: "camera",
    ip: ip, mac: mac,
    zone: "trusted",
    patchable: true, patched: false,
    creds: { user: "admin", pass: "admin", factory: true },
    services: [
      { port: 80,  proto: "tcp", name: "web interface", exposed: !!exposed },
      { port: 554, proto: "tcp", name: "video stream",  exposed: false }
    ],
    vendor: "203.0.113.90",
    note: "Four came in one box. They share a password that is printed in the manual and published online."
  };
}

/* ---------------------------------------------------------------------
   LOOKUPS
   --------------------------------------------------------------------- */
export function device(w, id) {
  for (let i = 0; i < w.devices.length; i++) if (w.devices[i].id === id) return w.devices[i];
  return null;
}

export function deviceByIp(w, ip) {
  for (let i = 0; i < w.devices.length; i++) if (w.devices[i].ip === ip) return w.devices[i];
  return null;
}

/** Devices in the same segment, or all of them if the house is still
    flat. This is what "segmentation" actually means to a packet. */
export function neighbours(w, dev) {
  const seg = segmentOf(w, dev.id);
  if (!seg) return w.devices.filter(d => d.id !== dev.id && !segmentOf(w, d.id));
  return w.devices.filter(d => d.id !== dev.id && segmentOf(w, d.id) === seg);
}

export function segmentOf(w, id) {
  for (let i = 0; i < w.segments.length; i++) {
    if (w.segments[i].members.indexOf(id) >= 0) return w.segments[i];
  }
  return null;
}

/* ---------------------------------------------------------------------
   CHANGES — every one recorded, with a reason

   The reason is not decoration. A student who cannot say why they made
   a change has not learned anything, and an instructor reading the
   history needs to see intent, not just diffs.
   --------------------------------------------------------------------- */
export function record(w, what, detail, why) {
  w.history.push({ t: w.now, what: what, detail: detail, why: why || "" });
  return w;
}

/** The student opened the log. Recorded, because "did they ever look"
    is an objective and an instructor reading the history should be able
    to see the moment it happened. Never unset — you cannot un-know what
    a network sounds like. */
export function markLooked(w) {
  if (w.looked) return w;
  w.looked = true;
  record(w, "log.opened", "the log was read for the first time",
         "you cannot recognise abnormal until you know normal");
  return w;
}

export function setPassword(w, id, pass) {
  const d = device(w, id);
  if (!d || !d.creds) return { ok: false, msg: "That device has no login to change." };
  if (!pass || pass.length < 8) {
    return { ok: false, msg: "Eight characters minimum. A four-character password is a formality, not a control." };
  }
  if (pass.toLowerCase() === "admin" || pass.toLowerCase() === "password") {
    return { ok: false, msg: "That is on every default-credential list ever published. Pick something else." };
  }
  const wasFactory = d.creds.factory;
  const wasReused = d.creds.reused;
  d.creds.pass = pass;
  d.creds.factory = false;
  /* A reused password is only fixed by not reusing it. Clearing this
     here, rather than only clearing `factory`, is what makes changing
     it actually change anything. */
  d.creds.reused = false;
  record(w, "creds.changed", d.name + " password changed",
         wasFactory ? "was still on the password it shipped with"
                    : (wasReused ? "was a password the owner used somewhere else that has been breached"
                                 : "rotated"));
  return { ok: true, msg: d.name + " will now refuse the published password." };
}

/** Hold the little button in with a paperclip.

    This is here because it is what people actually do when a device
    misbehaves, and because it **silently undoes their own hardening**.
    The camera works again, and the password is back to the one printed
    in the manual. Nobody thinks of a factory reset as a security event.
    It is one. */
export function factoryReset(w, id) {
  const d = device(w, id);
  if (!d) return { ok: false, msg: "No such device." };
  if (!d.creds) return { ok: false, msg: "Nothing to reset on that one." };

  d.creds.pass = "admin";
  d.creds.factory = true;
  d.creds.reused = false;
  d.patched = false;

  /* A reset does NOT clean a compromise. Whoever is already inside a
     device is not evicted by the device forgetting its password — and a
     student who resets a beaconing camera expecting it to go quiet
     needs to find that out. */
  record(w, "device.factoryReset", d.name + " reset to factory settings",
         "back on the password printed in the manual" +
         (d.compromised ? ", and still compromised — a reset is not a cleanup" : ""));
  return {
    ok: true,
    msg: d.name + " is working again, and its password is back to the one in the manual."
  };
}

export function setForward(w, id, enabled) {
  const f = w.firewall.forwards.filter(x => x.id === id)[0];
  if (!f) return { ok: false, msg: "No such port forward." };
  f.enabled = !!enabled;
  const dev = device(w, f.toDevice);
  if (dev && dev.services) {
    dev.services.forEach(s => { if (s.port === f.toPort) s.exposed = !!enabled; });
  }
  record(w, enabled ? "forward.opened" : "forward.closed",
         "port " + f.wanPort + " → " + (dev ? dev.name : f.toDevice) + ":" + f.toPort,
         enabled ? "opened deliberately" : "closed — nothing outside needs to reach it");
  return {
    ok: true,
    msg: enabled
      ? "Port " + f.wanPort + " now delivers to " + (dev ? dev.name : f.toDevice) + ". Anyone on the internet can reach it."
      : "Closed. Unsolicited traffic from the internet now has nowhere to go."
  };
}

/** Open a new hole deliberately. The student will need this at Tier 2,
    when they forward a port so they can reach the house from a client's
    site — the same mistake as the camera, made for a better reason. */
export function addForward(w, wanPort, toDevice, toPort, why) {
  const port = parseInt(wanPort, 10);
  const inner = parseInt(toPort, 10);
  if (!port || port < 1 || port > 65535) return { ok: false, msg: "That is not a port number." };
  if (w.firewall.forwards.some(f => f.wanPort === port && f.enabled)) {
    return { ok: false, msg: "Port " + port + " is already forwarded somewhere." };
  }
  const dev = device(w, toDevice);
  if (!dev) return { ok: false, msg: "No such device." };

  const f = {
    id: "fw-" + port + "-" + toDevice,
    wanPort: port, toDevice: toDevice, toPort: inner, proto: "tcp",
    enabled: true, why: why || "opened by the owner"
  };
  w.firewall.forwards.push(f);
  if (dev.services) {
    const svc = dev.services.filter(s => s.port === inner)[0];
    if (svc) svc.exposed = true;
    else dev.services.push({ port: inner, proto: "tcp", name: "forwarded service", exposed: true });
  } else {
    dev.services = [{ port: inner, proto: "tcp", name: "forwarded service", exposed: true }];
  }
  record(w, "forward.opened", "port " + port + " → " + dev.name + ":" + inner, why || "opened by the owner");
  return {
    ok: true,
    msg: "Port " + port + " now delivers to " + dev.name + ". Anyone on the internet can reach it, " +
         "and it will be found within minutes."
  };
}

export function addSegment(w, name, members) {
  const key = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!key) return { ok: false, msg: "Give the segment a name." };
  if (w.segments.some(s => s.id === key)) return { ok: false, msg: "There is already a segment called that." };
  if (!members || !members.length) return { ok: false, msg: "A segment with nothing in it separates nothing." };

  const unknown = members.filter(id => !device(w, id));
  if (unknown.length) return { ok: false, msg: "There is no device called " + unknown[0] + "." };

  /* ONE DEVICE, ONE SEGMENT — the same way a switch port belongs to one
     VLAN and not to two. Without this, a device could sit in two
     segments at once, `segmentOf` would return whichever was created
     first, and the student would be looking at a map that disagreed with
     the engine. */
  const clash = members.map(id => ({ id: id, seg: segmentOf(w, id) })).filter(x => x.seg)[0];
  if (clash) {
    return {
      ok: false,
      msg: device(w, clash.id).name + " is already in " + clash.seg.name +
           ". A device belongs to one segment at a time, the same way a switch port belongs to one VLAN. " +
           "Dissolve that segment first if you want to move it."
    };
  }

  w.segments.push({ id: key, name: name, members: members.slice() });
  record(w, "segment.created", name + " — " + members.length + " device(s)",
         "separated so a problem on one cannot reach the others");
  return { ok: true, msg: name + " created. Traffic between segments is now the firewall's decision, not a free ride." };
}

/** Dissolve a segment and put its devices back on the flat network.

    This exists because of a property the build has to keep: **nothing a
    student does can strand them.** Without it, one badly drawn segment —
    a camera and the laptop in the same box — was permanent, and the
    segmentation objective became impossible to satisfy for the rest of
    the run. The hint promises every setting can be changed back; this is
    part of keeping that promise. */
export function removeSegment(w, id) {
  const i = w.segments.map(s => s.id).indexOf(id);
  if (i < 0) return { ok: false, msg: "No such segment." };
  const s = w.segments.splice(i, 1)[0];
  record(w, "segment.removed", s.name + " dissolved",
         "its devices are back on the same network as everything else");
  return {
    ok: true,
    msg: s.name + " is gone. Its " + s.members.length + " device(s) are back on the flat network, " +
         "and traffic between them is nobody's decision again."
  };
}

/* ---------------------------------------------------------------------
   THE RULESET

   Through functions rather than by splicing the array from the
   interface, so that every change is recorded with a reason — and so
   that every change has an inverse. A student who writes a rule that
   breaks something has to be able to take it back out.
   --------------------------------------------------------------------- */
export function addRule(w, rule, why) {
  if (!rule || !rule.action) return { ok: false, msg: "That is not a rule." };
  w.firewall.rules.push(rule);
  record(w, "rule.added", rule.action + " " + rule.dir + " → " + rule.dstIp + ":" + rule.dstPort,
         why || "added by the owner");
  return {
    ok: true,
    msg: "Added at position " + w.firewall.rules.length +
         ". It is only consulted if every rule above it failed to match."
  };
}

export function removeRule(w, id) {
  const i = w.firewall.rules.map(r => r.id).indexOf(id);
  if (i < 0) return { ok: false, msg: "No such rule." };
  w.firewall.rules.splice(i, 1);
  record(w, "rule.removed", "rule " + (i + 1) + " removed", "taken back out by the owner");
  return {
    ok: true,
    msg: "Rule " + (i + 1) + " is gone. Everything below it has moved up, so it is all read earlier now."
  };
}

/** Move a rule up or down. Order is the control, so this is not a
    cosmetic operation and the message says so. */
export function moveRule(w, id, delta) {
  const rules = w.firewall.rules;
  const i = rules.map(r => r.id).indexOf(id);
  if (i < 0) return { ok: false, msg: "No such rule." };
  const j = Math.max(0, Math.min(rules.length - 1, i + (delta || 0)));
  if (j === i) {
    return { ok: false, msg: i === 0 ? "That rule is already read first." : "That rule is already read last." };
  }
  rules.splice(j, 0, rules.splice(i, 1)[0]);
  record(w, "rule.moved", "rule " + (i + 1) + " → position " + (j + 1),
         "the first rule that matches decides, so the order is the control");
  return { ok: true, msg: "Moved to position " + (j + 1) + ". That changes what the router actually does." };
}
