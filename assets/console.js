/* =====================================================================
   THE CONSOLE — where the student actually changes things

   Everything here goes through world.js. Nothing in this file edits a
   device, a forward, a segment or a rule directly, because every change
   has to be recorded with a reason and every change has to have an
   inverse. A single line of "dev.creds.pass = x" in the interface would
   put a change in the world that the history never saw.

   ---------------------------------------------------------------------
   THE ROUTER IS A DEVICE, AND IT IS ALSO THE FIREWALL

   Opening the router gets you three extra sections the other devices do
   not have — the forwarding table, the ruleset, and the review. They
   are kept visibly apart from each other, in that order, because the
   single most common beginner error is thinking a port forward is a
   firewall rule. It is not. One decides whether a packet has ANYWHERE
   TO GO; the other decides whether it is ALLOWED to go there. The
   layout says so before the words do.
   ===================================================================== */

import { device, segmentOf, portName, PORTS } from "./world.js";
import { reachable, explain, review } from "./rules.js";
import { esc } from "./map.js";

/* ---------------------------------------------------------------------
   ONE DEVICE
   --------------------------------------------------------------------- */
export function deviceConsole(world, id) {
  const d = device(world, id);
  if (!d) return `<p class="lede">Nothing is open. Pick a device from the inventory.</p>`;

  const open = reachable(world).filter(o => o.dev.id === d.id);
  const seg = segmentOf(world, d.id);

  const bits = [];
  bits.push(`<h2>${esc(d.name)}</h2>`);
  bits.push(`<p class="lede mono">${esc(d.ip)} &middot; ${esc(d.mac)}</p>`);
  bits.push(`<p>${esc(d.note || "")}</p>`);

  /* --- what can reach it ------------------------------------------- */
  bits.push(`<h3>From the internet</h3>`);
  if (open.length) {
    bits.push(`<div class="note"><strong>Anyone can reach this device.</strong> ` +
      open.map(o => "Port " + o.forward.wanPort + " on the outside of the house is delivered here, to " +
        portName(o.port) + " on port " + o.port + ". " + esc(o.forward.why || "")).join(" ") +
      ` The forwarding table is on the Router.</div>`);
  } else {
    bits.push(`<p>Nothing from the internet is delivered here. A packet addressed to this house on a port ` +
      `nobody has forwarded has no inside host it belongs to, so the router drops it — not because a rule ` +
      `says no, but because there is nowhere to put it.</p>`);
  }

  /* --- credentials -------------------------------------------------- */
  bits.push(`<h3>Login</h3>`);
  if (!d.creds) {
    bits.push(`<p>This device has no web login to change.</p>`);
  } else if (d.creds.factory) {
    bits.push(`<div class="note"><strong>Still on the password it shipped with.</strong> ` +
      `Username <span class="mono">${esc(d.creds.user)}</span>, password ` +
      `<span class="mono">${esc(d.creds.pass)}</span>. This is not a weak password — it is a published one. ` +
      `It is printed in the manual, it is on the internet, and it is the same on every unit of this model.</div>`);
  } else {
    bits.push(`<p>Username <span class="mono">${esc(d.creds.user)}</span>. ` +
      `The password has been changed off the factory default.</p>`);
  }
  if (d.creds) {
    bits.push(`<form data-form="password" data-device="${esc(d.id)}">
      <label for="pw-${esc(d.id)}">New password</label><br>
      <input id="pw-${esc(d.id)}" name="pass" type="text" autocomplete="off" spellcheck="false"
             style="font-family:var(--font-mono)" placeholder="at least eight characters">
      <button class="btn-primary" type="submit">Change it</button>
      <button type="button" class="btn-quiet" data-reset-device="${esc(d.id)}">Factory reset</button>
    </form>`);
  }

  /* --- services ----------------------------------------------------- */
  if (d.services && d.services.length) {
    bits.push(`<h3>What it is listening on</h3><ul>`);
    d.services.forEach(s => {
      bits.push(`<li><span class="mono">${s.port}/${esc(s.proto)}</span> — ${esc(s.name)}` +
        (s.exposed
          ? ` <span class="flag bad">reachable from outside</span>`
          : ` <span class="flag neutral">inside the house only</span>`) + `</li>`);
    });
    bits.push(`</ul>`);
  }

  /* --- where it sits ------------------------------------------------ */
  bits.push(`<h3>Where it sits</h3>`);
  bits.push(seg
    ? `<p>In the <strong>${esc(seg.name)}</strong> segment. Traffic between this device and anything in ` +
      `another segment is the firewall's decision.</p>`
    : `<p>Not in any segment. On a flat network this device reaches every other device directly — ` +
      `the switch handles it and <strong>the firewall never sees the packet</strong>, so the firewall ` +
      `cannot stop it.</p>`);

  if (d.patchable === false) {
    bits.push(`<div class="note">There will not be another firmware update for this. Whatever is wrong with ` +
      `it is wrong with it for good, which is an argument about where it belongs rather than an argument ` +
      `about patching it.</div>`);
  }

  if (d.id === "router") bits.push(routerConsole(world));

  return bits.join("\n");
}

/* ---------------------------------------------------------------------
   THE ROUTER — NAT, then rules, then the review
   --------------------------------------------------------------------- */
function routerConsole(world) {
  const bits = [];

  /* --- 1. NAT ------------------------------------------------------- */
  bits.push(`<h3>Port forwarding <span class="flag neutral">this is not a firewall rule</span></h3>`);
  bits.push(`<p>Each line here says: a packet arriving from the internet on <em>this</em> port belongs to ` +
    `<em>that</em> device. Without a line, an unsolicited packet has no destination at all and the router ` +
    `drops it. This is the wall. Every line is a hole in it.</p>`);

  if (!world.firewall.forwards.length) {
    bits.push(`<p class="lede">Nothing is forwarded.</p>`);
  } else {
    world.firewall.forwards.forEach(f => {
      const dev = device(world, f.toDevice);
      bits.push(`<div class="rule" data-action="${f.enabled ? "allow" : "deny"}">
        <span class="n">${f.wanPort}</span>
        <span class="said">Port <span class="mono">${f.wanPort}</span> from the internet &rarr;
          <strong>${esc(dev ? dev.name : f.toDevice)}</strong> port <span class="mono">${f.toPort}</span>
          (${esc(portName(f.toPort))}).<br>
          <span class="lede">${esc(f.why || "")}</span></span>
        <span class="ops">
          <button type="button" data-forward="${esc(f.id)}" data-enable="${f.enabled ? "0" : "1"}">
            ${f.enabled ? "Close it" : "Open it"}
          </button>
        </span>
      </div>`);
    });
  }

  /* --- 2. the ruleset ----------------------------------------------- */
  bits.push(`<h3>Firewall rules <span class="flag neutral">first match wins</span></h3>`);
  bits.push(`<p>Read top to bottom. The <strong>first</strong> rule that matches decides — not the most ` +
    `specific one, not the strictest one. Which makes the order a security control, and makes a broad allow ` +
    `sitting above a narrow deny into something that does the opposite of what you intended while looking ` +
    `perfectly reasonable.</p>`);
  bits.push(`<p class="lede">One thing that catches everybody: an inbound rule is matched against the ` +
    `<strong>inside</strong> address the packet was translated to, not against this house's outside address. ` +
    `A rule written against ${esc(world.wan)} will never fire on inbound traffic.</p>`);

  if (!world.firewall.rules.length) {
    bits.push(`<p class="lede">No rules yet. Everything that has somewhere to go, goes.</p>`);
  } else {
    world.firewall.rules.forEach((r, i) => {
      bits.push(`<div class="rule" data-action="${esc(r.action)}">
        <span class="n">${i + 1}</span>
        <span class="said"><strong>${esc(explain(r, ip => nameFor(world, ip)))}</strong><br>
          <span class="lede mono">${esc(r.dir)} &middot; src ${esc(r.srcIp)} &middot; dst ${esc(r.dstIp)}:${esc(String(r.dstPort))} &middot; ${esc(r.proto)}</span>
          ${r.note ? `<br><span class="lede">${esc(r.note)}</span>` : ""}</span>
        <span class="ops">
          <button type="button" data-move-rule="${esc(r.id)}" data-delta="-1" aria-label="Move up">&uarr;</button>
          <button type="button" data-move-rule="${esc(r.id)}" data-delta="1" aria-label="Move down">&darr;</button>
          <button type="button" data-drop-rule="${esc(r.id)}" aria-label="Remove this rule">&times;</button>
        </span>
      </div>`);
    });
  }

  bits.push(newRuleForm(world));

  /* --- 3. the review ------------------------------------------------ */
  const notes = review(world);
  bits.push(`<h3>What this ruleset actually does</h3>`);
  if (!world.firewall.rules.length) {
    bits.push(`<p class="lede">Nothing to review yet.</p>`);
  } else if (!notes.length) {
    bits.push(`<p>Every rule here can fire. Nothing above any of them already caught everything they ` +
      `would have caught.</p>`);
  } else {
    notes.forEach(n => bits.push(`<div class="note">${esc(n.text)}</div>`));
  }

  return bits.join("\n");
}

function newRuleForm(world) {
  const opts = world.devices.map(d =>
    `<option value="${esc(d.ip)}">${esc(d.name)} (${esc(d.ip)})</option>`).join("");
  const ports = Object.keys(PORTS).map(p =>
    `<option value="${p}">${p} — ${esc(PORTS[p].name)}</option>`).join("");
  return `<form data-form="rule" class="card" style="background:var(--surface-2)">
    <h3 style="margin-top:0">Write a rule</h3>
    <div class="log-controls">
      <label class="sr-only" for="r-dir">Direction</label>
      <select id="r-dir" name="dir">
        <option value="inbound">inbound — from the internet</option>
        <option value="outbound">outbound — to the internet</option>
        <option value="internal">internal — device to device</option>
      </select>
      <label class="sr-only" for="r-action">Action</label>
      <select id="r-action" name="action">
        <option value="deny">deny</option>
        <option value="allow">allow</option>
      </select>
      <label class="sr-only" for="r-src">Source</label>
      <select id="r-src" name="srcIp"><option value="any">from anywhere</option>${opts}</select>
      <label class="sr-only" for="r-dst">Destination</label>
      <select id="r-dst" name="dstIp"><option value="any">to anywhere</option>${opts}</select>
      <label class="sr-only" for="r-port">Port</label>
      <select id="r-port" name="dstPort"><option value="any">any port</option>${ports}</select>
      <button class="btn-primary" type="submit">Add it to the bottom</button>
    </div>
    <p class="lede">It goes on the end, which means it is only ever consulted if every rule above it
      failed to match. Move it if that is not what you meant.</p>
  </form>`;
}

function nameFor(world, ip) {
  const d = world.devices.filter(x => x.ip === ip)[0];
  return d ? d.name : ip;
}

/* ---------------------------------------------------------------------
   SEGMENTS
   --------------------------------------------------------------------- */
export function segmentConsole(world) {
  const bits = [];
  bits.push(`<h2>Segments</h2>`);
  bits.push(`<p>A house starts flat, because houses are flat. Everything can reach everything, the switch ` +
    `handles it, and the firewall never sees a packet — so the firewall cannot stop any of it.</p>`);
  bits.push(`<p>Separating devices does not stop one being compromised. It stops a compromised one being ` +
    `<em>useful</em>.</p>`);

  if (!world.segments.length) {
    bits.push(`<p class="lede">No segments yet.</p>`);
  } else {
    world.segments.forEach(s => {
      const names = s.members.map(id => (device(world, id) || { name: id }).name);
      bits.push(`<div class="rule" data-action="allow">
        <span class="said"><strong>${esc(s.name)}</strong><br>
          <span class="lede">${esc(names.join(", "))}</span></span>
        <span class="ops">
          <button type="button" data-drop-segment="${esc(s.id)}">Dissolve</button>
        </span>
      </div>`);
    });
  }

  const free = world.devices.filter(d => d.kind !== "router" && !segmentOf(world, d.id));
  bits.push(`<form data-form="segment" class="card" style="background:var(--surface-2)">
    <h3 style="margin-top:0">Draw a segment</h3>
    <label for="seg-name">Call it</label><br>
    <input id="seg-name" name="name" type="text" placeholder="Cameras" autocomplete="off">
    <fieldset style="border:1px solid var(--line);border-radius:var(--round);margin:.7rem 0">
      <legend>What goes in it</legend>
      ${free.length
        ? free.map(d => `<label style="display:block;padding:.2rem 0">
            <input type="checkbox" name="member" value="${esc(d.id)}"> ${esc(d.name)}
            <span class="lede mono">${esc(d.ip)}</span></label>`).join("")
        : `<p class="lede">Every device is already in a segment. Dissolve one to move things about.</p>`}
    </fieldset>
    <button class="btn-primary" type="submit">Create it</button>
    <p class="lede">A device belongs to one segment at a time, the same way a switch port belongs to one
      VLAN. Nothing here is permanent — dissolve a segment and its devices go back on the flat network.</p>
  </form>`);

  return bits.join("\n");
}
