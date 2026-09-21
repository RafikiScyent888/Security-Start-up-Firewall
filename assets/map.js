/* =====================================================================
   THE MAP

   What the house looks like. Two representations, and they do different
   jobs rather than duplicating each other:

     the drawing   shows SHAPE — what is attached to what, which links
                   the firewall never sees, where the segment boundaries
                   are. It is a picture, and it is not clickable.

     the list      is the INVENTORY. It is what you click, it is what a
                   screen reader gets, and on a phone it is the whole
                   interface.

   ---------------------------------------------------------------------
   WHAT THE MAP IS ALLOWED TO KNOW

   Only what the student could work out themselves:

     reachable from the internet   — yes. The forwarding table is right
                                     there in the console; this just
                                     saves them cross-referencing it
     factory password              — yes. The console shows it
     which segment                 — yes. They drew them
     COMPROMISED                   — NO. Never. Not here, not anywhere
                                     outside the log

   That last one is the whole tier. A device that has been taken does
   not light up, does not turn red, and does not announce itself. It
   carries on looking exactly like it did yesterday, because that is
   what actually happens to people.

   ---------------------------------------------------------------------
   IT SCROLLS, IT DOES NOT SHRINK

   An earlier build put a fixed 1000-unit viewBox inside a 350px phone
   and painted five-pixel labels. For students with damaged sight that
   is not a small bug. The viewBox here is sized so that one unit is
   roughly one CSS pixel at desk width, the stylesheet gives the drawing
   a minimum width and lets it scroll sideways, and the list below it
   never needed the drawing in the first place.
   ===================================================================== */

import { segmentOf } from "./world.js";
import { reachable } from "./rules.js";
import { portName } from "./world.js";

/* One unit is one CSS pixel, because the stylesheet gives the drawing
   a minimum width equal to this. So a font-size here is the size it
   actually paints at, and NOTHING ON THE MAP IS BELOW 12. */
const W = 680;
const COLS = 4;
const BOX_W = 132, BOX_H = 62, GAP_X = 20, GAP_Y = 30;
const TOP = 250;

/* Escaped everywhere a name reaches markup. Nothing here is attacker
   controlled today, and at Tier 2 the student names their own segments,
   so the habit is cheaper to keep than to retrofit. */
export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------------
   THE DRAWING
   --------------------------------------------------------------------- */
export function drawMap(world) {
  const devices = world.devices.filter(d => d.kind !== "router");
  const open = reachable(world);
  const isOpen = id => open.some(o => o.dev.id === id);

  /* Group by segment so the boxes drawn round them are contiguous. A
     segment drawn round devices scattered across the grid is a diagram
     nobody can read. */
  const order = [];
  world.segments.forEach(s => {
    devices.filter(d => s.members.indexOf(d.id) >= 0).forEach(d => order.push(d));
  });
  devices.filter(d => order.indexOf(d) < 0).forEach(d => order.push(d));

  const rows = Math.ceil(order.length / COLS);
  const height = TOP + rows * (BOX_H + GAP_Y) + 40;
  const at = i => ({
    x: 26 + (i % COLS) * (BOX_W + GAP_X),
    y: TOP + Math.floor(i / COLS) * (BOX_H + GAP_Y)
  });

  const parts = [];

  /* --- the internet, the line down to the house, and the router ----- */
  parts.push(
    `<rect class="node-box" x="250" y="14" width="180" height="48" rx="10"/>`,
    `<text x="340" y="38" text-anchor="middle" font-size="15" font-weight="700">The internet</text>`,
    `<text x="340" y="54" text-anchor="middle" font-size="12" fill="var(--ink-dim)">${esc(world.wan)}</text>`,
    `<line class="link" x1="340" y1="62" x2="340" y2="150"/>`,
    `<rect class="node-box" x="250" y="150" width="180" height="56" rx="10"/>`,
    `<text x="340" y="174" text-anchor="middle" font-size="15" font-weight="700">Router</text>`,
    `<text x="340" y="192" text-anchor="middle" font-size="12" fill="var(--ink-dim)">${esc(world.gateway)}</text>`
  );

  /* The one label on the drawing that teaches rather than describes. */
  const doors = open.length;
  parts.push(
    `<text x="340" y="228" text-anchor="middle" font-size="13" font-weight="700" fill="${doors ? "var(--red)" : "var(--green)"}">` +
    (doors
      ? esc(doors + (doors === 1 ? " way in from outside" : " ways in from outside"))
      : "nothing reaches in from outside") +
    `</text>`
  );

  /* --- segment boxes, behind the devices ---------------------------- */
  world.segments.forEach(s => {
    const idx = order.map((d, i) => (s.members.indexOf(d.id) >= 0 ? i : -1)).filter(i => i >= 0);
    if (!idx.length) return;
    const pts = idx.map(at);
    const x1 = Math.min(...pts.map(p => p.x)) - 10;
    const y1 = Math.min(...pts.map(p => p.y)) - 24;
    const x2 = Math.max(...pts.map(p => p.x)) + BOX_W + 10;
    const y2 = Math.max(...pts.map(p => p.y)) + BOX_H + 10;
    parts.push(
      `<rect class="seg-box" x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="12"/>`,
      `<text class="seg-label" x="${x1 + 8}" y="${y1 - 6}" font-size="12">${esc(s.name)}</text>`
    );
  });

  /* --- the devices -------------------------------------------------- */
  order.forEach((d, i) => {
    const p = at(i);
    const seg = segmentOf(world, d.id);
    /* A link the firewall never sees is drawn as a dashed line, because
       that is the fact segmentation is about: same segment, no
       inspection, no rule, no record. */
    parts.push(
      `<line class="link${seg ? "" : " uninspected"}" x1="340" y1="206" x2="${p.x + BOX_W / 2}" y2="${p.y}"/>`,
      `<rect class="node-box${isOpen(d.id) ? " exposed" : ""}" x="${p.x}" y="${p.y}" width="${BOX_W}" height="${BOX_H}" rx="10"/>`,
      `<text x="${p.x + BOX_W / 2}" y="${p.y + 24}" text-anchor="middle" font-size="13" font-weight="700">${esc(short(d.name))}</text>`,
      `<text x="${p.x + BOX_W / 2}" y="${p.y + 42}" text-anchor="middle" font-size="12" fill="var(--ink-dim)">${esc(d.ip)}</text>`
    );
    if (isOpen(d.id)) {
      parts.push(
        `<text x="${p.x + BOX_W / 2}" y="${p.y + 56}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--red)">reachable from outside</text>`
      );
    }
  });

  const summary = describe(world);

  return `<div class="map-wrap">
  <svg class="map" viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(summary)}">
    <title>${esc(summary)}</title>
    ${parts.join("\n    ")}
  </svg>
</div>
<p class="lede">${esc(summary)}</p>`;
}

/* "Front Door Camera" does not fit in a box this size, and shrinking the
   type to make it fit is exactly the thing this file exists not to do. */
function short(name) {
  return name.replace(/^Smart /, "").replace(/ Camera$/, " Cam");
}

/** One sentence a screen reader, or a student who cannot see the
    drawing, gets instead of it. */
export function describe(world) {
  const open = reachable(world);
  const bits = [world.devices.length + " devices on one router"];
  bits.push(world.segments.length
    ? world.segments.length + " segments: " + world.segments.map(s => s.name).join(", ")
    : "no segments, so every device can reach every other device directly");
  bits.push(open.length
    ? open.length + " reachable from the internet: " + open.map(o => o.dev.name + " on port " + o.forward.wanPort).join(", ")
    : "nothing reachable from the internet");
  return bits.join(". ") + ".";
}

/* ---------------------------------------------------------------------
   THE INVENTORY

   Every device, what is true about it, and a button to open it. The
   flags are the three things a student can actually establish, each
   said in words and marked with a shape as well as a colour.
   --------------------------------------------------------------------- */
export function deviceList(world) {
  const open = reachable(world);
  const rows = world.devices.map(d => {
    const door = open.filter(o => o.dev.id === d.id)[0];
    const seg = segmentOf(world, d.id);
    const flags = [];

    if (door) {
      flags.push(flag("bad", "Reachable from the internet — port " +
        door.forward.wanPort + " arrives here as " + portName(door.port)));
    }
    if (d.creds && d.creds.factory) {
      flags.push(flag("warn", "Still on the password it shipped with"));
    } else if (d.creds) {
      flags.push(flag("ok", "Password changed"));
    }
    flags.push(flag("neutral", seg ? "Segment: " + seg.name : "No segment — reaches everything"));
    if (d.patchable === false) flags.push(flag("warn", "Cannot be updated"));

    return `<li>
      <button type="button" data-open-device="${esc(d.id)}">
        <span class="label">${esc(d.name)}</span>
        <span class="mono" style="color:var(--ink-dim)"> ${esc(d.ip)}</span>
        <span class="flags">${flags.join("")}</span>
      </button>
    </li>`;
  });
  return `<ul class="device-list">${rows.join("")}</ul>`;
}

function flag(kind, text) {
  return `<span class="flag ${kind}">${esc(text)}</span>`;
}
