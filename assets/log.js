/* =====================================================================
   THE LOG — the only place the truth is written

   Nothing in this house will tell a student it has gone wrong. There is
   no alert, no banner, no warning light. The evidence is here, in among
   several hundred lines of traffic that are completely ordinary, and a
   student who never opens this pane never finds out.

   That is not a design flourish. It is what actually happens to people.

   ---------------------------------------------------------------------
   NOTHING IS HIGHLIGHTED

   The adversary's lines are not coloured, not flagged, not sorted to
   the top, and not shaped any differently from legitimate ones. They
   come through the same generator, get judged by the same engine, and
   print through the same function.

   If the attack had its own look, a student would learn to spot the
   look. The skill this tier is trying to build is knowing WHERE each
   device normally talks, and noticing one that has started talking
   somewhere else. The cameras phone home to their vendor all day long;
   the beacon differs from a keep-alive by its destination and nothing
   else.

   The verdict column IS coloured — accept green, drop red — because
   that is the router's decision rather than a judgement about whether
   the traffic is good, and reading it is the point of the exercise.

   ---------------------------------------------------------------------
   THE FILTERS ARE THE INVESTIGATION

   "Show me everything this camera did" and "show me everything that
   went to this address" are the two questions that solve it. They are
   the same two questions a SIEM gets asked on a real Tuesday, which is
   why they are the filters rather than a search box.
   ===================================================================== */

import { flows, humanBytes, clockOf, DESTS } from "./traffic.js";
import { evaluate } from "./rules.js";
import { esc } from "./map.js";

/** Everything that happened in a window, legitimate and otherwise,
    already judged. One list, one sort, no separation anywhere. */
export function lines(world, adversary, from, to) {
  const all = flows(world, from, to).concat(adversary.flows(world, from, to));
  all.sort((a, b) => a.t - b.t);
  return all.map(f => {
    const verdict = evaluate(world, {
      dir: f.where === "external" ? "outbound" : (f.where === "inbound" ? "inbound" : "internal"),
      srcIp: f.srcIp, dstIp: f.dstIp, dstPort: f.dstPort, proto: f.proto
    });
    return { flow: f, verdict: verdict };
  });
}

/* The destinations a student can look up. Deliberately does NOT include
   the adversary's address — working out that 192.0.2.77 is not on this
   list is the whole exercise, and putting it here with a name would
   hand over the answer. */
const KNOWN = {};
Object.keys(DESTS).forEach(k => { KNOWN[DESTS[k].ip] = DESTS[k].name; });

export function nameOfDest(world, ip) {
  if (KNOWN[ip]) return KNOWN[ip];
  const d = world.devices.filter(x => x.ip === ip)[0];
  if (d) return d.name;
  if (ip === "224.0.0.251") return "everything on this network";
  /* Unknown, and it stays unknown. A label here would be the alert. */
  return "";
}

export function logPane(world, rows, filter) {
  const bits = [];

  bits.push(`<h2>The log</h2>`);
  bits.push(`<p>Every packet this router made a decision about. Most of it is ordinary — every device in ` +
    `this house talks to the internet constantly and almost all of it is the product working. ` +
    `<strong>You cannot recognise abnormal until you know normal</strong>, so the first job is not to find ` +
    `something. It is to find out what ordinary looks like here.</p>`);

  bits.push(filters(world, filter));

  if (!rows.length) {
    bits.push(`<p class="lede">Nothing matches that. Widen it.</p>`);
    return bits.join("\n");
  }

  const head = `<thead><tr>
    <th scope="col">Time</th><th scope="col">From</th><th scope="col">To</th>
    <th scope="col">Port</th><th scope="col">Bytes</th><th scope="col">Result</th>
  </tr></thead>`;

  const body = rows.map(r => {
    const f = r.flow, v = r.verdict;
    const c = clockOf(f.t);
    const from = f.src === "wan" ? f.srcIp + " (" + f.geo + ")" : srcName(world, f);
    const known = nameOfDest(world, f.dstIp);
    return `<tr data-action="${esc(v.action)}">
      <td class="t" data-label="Time">d${c.day} ${esc(c.time)}</td>
      <td data-label="From">${esc(from)}</td>
      <td data-label="To"><span class="mono">${esc(f.dstIp)}</span>${known ? "<br><span class=\"lede\">" + esc(known) + "</span>" : ""}</td>
      <td class="t" data-label="Port">${esc(String(f.dstPort))}/${esc(f.proto)}</td>
      <td class="bytes" data-label="Bytes">${esc(humanBytes(f.bytes))}</td>
      <td data-label="Result"><span class="verdict">${v.action === "accept" ? "ACCEPT" : "DROP"}</span>
        <br><span class="why">${esc(v.why)}</span></td>
    </tr>`;
  }).join("");

  bits.push(`<table class="log">${head}<tbody>${body}</tbody></table>`);
  bits.push(`<p class="lede">${rows.length} line(s).</p>`);
  return bits.join("\n");
}

function srcName(world, f) {
  const d = world.devices.filter(x => x.id === f.src)[0];
  return d ? d.name : f.srcIp;
}

function filters(world, filter) {
  filter = filter || {};
  const devs = world.devices.map(d =>
    `<option value="${esc(d.id)}"${filter.device === d.id ? " selected" : ""}>${esc(d.name)}</option>`).join("");

  /* Every destination that actually appears, named where it is known
     and bare where it is not. The bare one is the exercise. */
  const dests = (filter.destinations || []).map(ip => {
    const n = nameOfDest(world, ip);
    return `<option value="${esc(ip)}"${filter.dest === ip ? " selected" : ""}>${esc(ip)}${n ? " — " + esc(n) : ""}</option>`;
  }).join("");

  return `<form class="log-controls" data-form="log-filter">
    <label class="sr-only" for="lf-dev">Device</label>
    <select id="lf-dev" name="device">
      <option value="">every device</option>${devs}
    </select>
    <label class="sr-only" for="lf-dest">Destination</label>
    <select id="lf-dest" name="dest">
      <option value="">every destination</option>${dests}
    </select>
    <label class="sr-only" for="lf-dir">Direction</label>
    <select id="lf-dir" name="where">
      <option value=""${!filter.where ? " selected" : ""}>any direction</option>
      <option value="inbound"${filter.where === "inbound" ? " selected" : ""}>from the internet</option>
      <option value="external"${filter.where === "external" ? " selected" : ""}>out to the internet</option>
      <option value="internal"${filter.where === "internal" ? " selected" : ""}>inside the house</option>
    </select>
    <button type="submit" class="btn-primary">Filter</button>
    <button type="button" class="btn-quiet" data-clear-filter>Clear</button>
  </form>`;
}

/** Apply a filter to already-judged rows. */
export function applyFilter(rows, filter) {
  filter = filter || {};
  return rows.filter(r => {
    const f = r.flow;
    if (filter.device && f.src !== filter.device) return false;
    if (filter.dest && f.dstIp !== filter.dest) return false;
    if (filter.where && f.where !== filter.where) return false;
    return true;
  });
}

/** Every destination that appears in a set of rows, most-seen first —
    which is how a real analyst finds the odd one, by looking at what a
    device talks to rather than at individual packets. */
export function destinations(rows) {
  const seen = {};
  rows.forEach(r => { seen[r.flow.dstIp] = (seen[r.flow.dstIp] || 0) + 1; });
  return Object.keys(seen).sort((a, b) => seen[b] - seen[a]);
}

/* ---------------------------------------------------------------------
   THE VERDICT BOARD

   Lives under the log, because that is the only place the evidence is
   and the two should never be on different screens. Six options, one
   correct, five wrong, and a wrong pick stays struck.

   Three signals on a struck option, never colour alone: the red, the
   inset rule and the line through the label, and the word "Ruled out"
   with the reason after it. The reason stays readable — nothing here
   is dimmed to show it is gone, because the reason is the teaching.
   --------------------------------------------------------------------- */
export function verdictBoard(world, V) {
  const opts = V.options(world);
  const out = V.struck(world);
  const done = V.settled(world);
  const right = V.answer(world);

  const items = opts.map(o => {
    const isOut = out.indexOf(o.id) >= 0;
    const isRight = done && o.id === right;
    const state = isRight ? "right" : (isOut ? "wrong" : "");
    return `<li><button type="button" class="option"
        ${state ? `data-state="${state}"` : ""}
        ${(isOut || done) ? "disabled" : ""}
        data-verdict="${esc(o.id)}">
      ${state ? `<span class="mark">${isRight ? "Correct" : "Ruled out"}</span>` : ""}
      <span class="label">${esc(o.label)}</span>
      ${isOut ? `<span class="reason">${esc(o.reason)}</span>` : ""}
    </button></li>`;
  });

  return `<h2>Your verdict</h2>
  <p>Nothing in this house is going to tell you the answer, so the finding has to be yours.
    <strong>Which of these, if any, is talking somewhere it has no business talking to?</strong></p>
  <p class="lede">Unlimited tries. A wrong answer stays on the board with the reason it is out,
    so you are never asked to hold five eliminations in your head — and you can clear the board and
    start the reasoning again without undoing anything you configured.</p>
  <ul class="options">${items.join("")}</ul>
  ${done
    ? `<div class="msg" role="status">Settled. ${right === "none"
        ? "Nothing here was out of place, and you established that yourself."
        : "And nothing warned you. Nothing would have."}</div>`
    : `<p><button type="button" class="btn-quiet" data-verdict-reset>Clear the board</button></p>`}`;
}
