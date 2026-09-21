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
import { reachable, explain, review, evaluate } from "./rules.js";
import { esc } from "./map.js";

/* ---------------------------------------------------------------------
   ONE DEVICE
   --------------------------------------------------------------------- */
export function deviceConsole(world, id, editingRule) {
  const d = device(world, id) || device(world, "router");
  if (!d) return `<p class="lede">Nothing is open.</p>`;

  const open = reachable(world).filter(o => o.dev.id === d.id);
  const seg = segmentOf(world, d.id);

  const bits = [];

  /* THE SWITCHER, AND WHY IT IS HERE.

     Without it this pane showed whatever device was opened last and
     offered no way to any other — so a student who opened the printer
     could not get back to the router's firewall without going to The
     house, scrolling past the map, and finding it in the inventory.
     There was no route at all from this pane. That is a dead end, and
     the build's own rule is that nothing a student does may strand
     them.

     The router is first and says what it carries, because somebody
     looking for "the firewall settings" will not guess that they are
     behind a button marked Console. */
  bits.push(deviceSwitcher(world, d));

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

  if (d.id === "router") bits.push(routerConsole(world, editingRule));

  return bits.join("\n");
}

/** Every device, one click away, with where you are marked. */
function deviceSwitcher(world, current) {
  const order = world.devices.slice().sort((a, b) =>
    (a.kind === "router" ? -1 : 0) - (b.kind === "router" ? -1 : 0));
  return `<nav class="switcher" aria-label="Device">
    ${order.map(d => {
      const isHere = d.id === current.id;
      const label = d.kind === "router"
        ? "Router — firewall, forwarding and rules"
        : d.name;
      return `<button type="button" data-open-device="${esc(d.id)}"
        ${isHere ? 'aria-current="true"' : ""}>${esc(label)}</button>`;
    }).join("")}
  </nav>`;
}

/* ---------------------------------------------------------------------
   THE ROUTER — NAT, then rules, then the review
   --------------------------------------------------------------------- */
function routerConsole(world, editing) {
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
      bits.push(`<div class="rule" data-action="${esc(r.action)}"${r.enabled === false ? ' data-off="true"' : ""}>
        <span class="n">${i + 1}</span>
        <span class="said"><strong>${esc(explain(r, ip => nameFor(world, ip)))}</strong>
          ${r.enabled === false ? '<span class="flag neutral">switched off — never consulted</span>' : ""}<br>
          <span class="lede mono">${esc(r.dir)} &middot; src ${esc(r.srcIp)} &middot; dst ${esc(r.dstIp)}:${esc(String(r.dstPort))} &middot; ${esc(r.proto)}</span>
          ${r.note ? `<br><span class="lede">${esc(r.note)}</span>` : ""}</span>
        <span class="ops">
          <button type="button" data-move-rule="${esc(r.id)}" data-delta="-1" aria-label="Move rule ${i + 1} up">&uarr;</button>
          <button type="button" data-move-rule="${esc(r.id)}" data-delta="1" aria-label="Move rule ${i + 1} down">&darr;</button>
          <button type="button" data-toggle-rule="${esc(r.id)}" data-on="${r.enabled === false ? "1" : "0"}">
            ${r.enabled === false ? "Switch on" : "Switch off"}</button>
          <button type="button" data-edit-rule="${esc(r.id)}">Edit</button>
          <button type="button" data-drop-rule="${esc(r.id)}" aria-label="Remove rule ${i + 1}">&times;</button>
        </span>
      </div>`);
      /* The editor opens in place, prefilled, so changing a port does
         not mean deleting a rule and retyping it from memory — and
         editing never moves it, because its position IS the control. */
      if (editing === r.id) bits.push(ruleForm(world, r));
    });
  }

  if (!editing) bits.push(ruleForm(world, null));

  bits.push(packetTester(world, world.test));

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

/** One form, used to write a rule and to change one. Prefilled when
    editing, because retyping six fields to fix a port is how a
    student stops experimenting. */
function ruleForm(world, r) {
  const sel = (v, want) => (String(v) === String(want) ? " selected" : "");
  const opts = world.devices.map(d =>
    `<option value="${esc(d.ip)}"${r ? sel(r.srcIp, d.ip) : ""}>${esc(d.name)} (${esc(d.ip)})</option>`).join("");
  const optd = world.devices.map(d =>
    `<option value="${esc(d.ip)}"${r ? sel(r.dstIp, d.ip) : ""}>${esc(d.name)} (${esc(d.ip)})</option>`).join("");
  const ports = Object.keys(PORTS).map(p =>
    `<option value="${p}"${r ? sel(r.dstPort, p) : ""}>${p} — ${esc(PORTS[p].name)}</option>`).join("");

  return `<form data-form="rule" ${r ? `data-edit="${esc(r.id)}"` : ""} class="card" style="background:var(--surface-2)">
    <h3 style="margin-top:0">${r ? "Change this rule" : "Write a rule"}</h3>
    <div class="log-controls">
      <label class="sr-only" for="r-dir">Direction</label>
      <select id="r-dir" name="dir">
        <option value="inbound"${r ? sel(r.dir, "inbound") : ""}>inbound — from the internet</option>
        <option value="outbound"${r ? sel(r.dir, "outbound") : ""}>outbound — to the internet</option>
        <option value="internal"${r ? sel(r.dir, "internal") : ""}>internal — device to device</option>
      </select>
      <label class="sr-only" for="r-action">Action</label>
      <select id="r-action" name="action">
        <option value="deny"${r ? sel(r.action, "deny") : ""}>deny</option>
        <option value="allow"${r ? sel(r.action, "allow") : ""}>allow</option>
      </select>
      <label class="sr-only" for="r-src">Source</label>
      <select id="r-src" name="srcIp">
        <option value="any"${r ? sel(r.srcIp, "any") : ""}>from anywhere</option>${opts}</select>
      <label class="sr-only" for="r-dst">Destination</label>
      <select id="r-dst" name="dstIp">
        <option value="any"${r ? sel(r.dstIp, "any") : ""}>to anywhere</option>${optd}</select>
      <label class="sr-only" for="r-port">Port</label>
      <select id="r-port" name="dstPort">
        <option value="any"${r ? sel(r.dstPort, "any") : ""}>any port</option>${ports}</select>
    </div>
    <div class="log-controls">
      <label class="sr-only" for="r-note">Why</label>
      <input id="r-note" name="note" type="text" style="flex:1 1 18rem"
             placeholder="Why this rule exists — the next person will need it"
             value="${r ? esc(r.note || "") : ""}">
      <button class="btn-primary" type="submit">${r ? "Save the change" : "Add it to the bottom"}</button>
      ${r ? `<button type="button" class="btn-quiet" data-edit-rule="">Cancel</button>` : ""}
    </div>
    <p class="lede">${r
      ? "Changing a rule does not move it. Where it sits in the order is a separate decision, and it is the one that decides what actually happens."
      : "It goes on the end, which means it is only ever consulted if every rule above it failed to match. Move it if that is not what you meant."}</p>
  </form>`;
}

/* ---------------------------------------------------------------------
   THE PACKET TESTER

   Ask the ruleset a question and get the same answer the router would
   give, from the same function that judges every packet in the log.

   This is what a real firewall gives you — PAN-OS calls it
   test security-policy-match — and it is the fastest way to find out
   that the rule you are proud of is never consulted. Reading a ruleset
   top to bottom in your head is exactly the skill nobody has yet.
   --------------------------------------------------------------------- */
function packetTester(world, test) {
  const optAll = world.devices.map(d =>
    `<option value="${esc(d.ip)}"${test && test.srcIp === d.ip ? " selected" : ""}>${esc(d.name)}</option>`).join("");
  const optDst = world.devices.map(d =>
    `<option value="${esc(d.ip)}"${test && test.dstIp === d.ip ? " selected" : ""}>${esc(d.name)}</option>`).join("");
  const ports = Object.keys(PORTS).map(p =>
    `<option value="${p}"${test && String(test.dstPort) === p ? " selected" : ""}>${p} — ${esc(PORTS[p].name)}</option>`).join("");

  let verdict = "";
  if (test) {
    const v = evaluate(world, test);
    verdict = `<div class="msg" data-ok="${v.allow}" role="status">
      <strong>${v.action === "accept" ? "ACCEPT" : "DROP"}</strong> — decided by ${esc(v.by)}.<br>
      ${esc(v.why)}</div>`;
  }

  return `<h3>Try a packet</h3>
  <p>Ask the router what it would do, and it answers with the same code that judges every line in
    the log. The quickest way to find out that a rule you are proud of is never consulted.</p>
  <form data-form="test" class="card" style="background:var(--surface-2)">
    <div class="log-controls">
      <label class="sr-only" for="t-dir">Direction</label>
      <select id="t-dir" name="dir">
        <option value="inbound"${test && test.dir === "inbound" ? " selected" : ""}>from the internet</option>
        <option value="outbound"${test && test.dir === "outbound" ? " selected" : ""}>out to the internet</option>
        <option value="internal"${test && test.dir === "internal" ? " selected" : ""}>device to device</option>
      </select>
      <label class="sr-only" for="t-src">From</label>
      <select id="t-src" name="srcIp">
        <option value="192.0.2.14">somebody on the internet</option>${optAll}</select>
      <label class="sr-only" for="t-dst">To</label>
      <select id="t-dst" name="dstIp">
        <option value="${esc(world.wan)}">this house from outside</option>${optDst}</select>
      <label class="sr-only" for="t-port">Port</label>
      <select id="t-port" name="dstPort">${ports}</select>
      <button class="btn-primary" type="submit">What happens?</button>
    </div>
  </form>
  ${verdict}`;
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
    /* EVERY SEGMENT IS EDITABLE IN PLACE.

       It used to be create-or-dissolve and nothing between, so moving
       one camera meant tearing down a whole segment and rebuilding it
       from nothing. Nobody has ever changed a VLAN that way — you
       assign the port to the new one and it leaves the old one. */
    world.segments.forEach(sg => {
      bits.push(`<div class="card" style="background:var(--surface-2)">
        <div class="rule" data-action="allow" style="background:transparent;border:0;padding:0">
          <span class="said"><strong>${esc(sg.name)}</strong>
            <span class="lede">&middot; ${sg.members.length} device(s)</span></span>
          <span class="ops">
            <button type="button" data-drop-segment="${esc(sg.id)}">Dissolve</button>
          </span>
        </div>
        <form data-form="rename-segment" data-segment="${esc(sg.id)}" class="log-controls">
          <label class="sr-only" for="rn-${esc(sg.id)}">Rename ${esc(sg.name)}</label>
          <input id="rn-${esc(sg.id)}" name="name" type="text" value="${esc(sg.name)}" style="flex:1 1 12rem">
          <button type="submit">Rename</button>
        </form>
        <ul class="device-list">
          ${sg.members.map(id => {
            const d = device(world, id);
            if (!d) return "";
            return `<li><div class="rule" data-action="allow" style="background:transparent">
              <span class="said">${esc(d.name)} <span class="lede mono">${esc(d.ip)}</span></span>
              <span class="ops">${moveMenu(world, d, sg.id)}</span>
            </div></li>`;
          }).join("")}
        </ul>
      </div>`);
    });
  }

  /* Anything not in a segment yet, with the same one-click move. */
  const free = world.devices.filter(d => d.kind !== "router" && !segmentOf(world, d.id));
  if (free.length && world.segments.length) {
    bits.push(`<h3>Not in any segment</h3>
      <p class="lede">These reach everything, and everything reaches them.</p>
      <ul class="device-list">${free.map(d => `<li><div class="rule" data-action="deny" style="background:transparent">
        <span class="said">${esc(d.name)} <span class="lede mono">${esc(d.ip)}</span></span>
        <span class="ops">${moveMenu(world, d, null)}</span>
      </div></li>`).join("")}</ul>`);
  }

  bits.push(`<form data-form="segment" class="card" style="background:var(--surface-2)">
    <h3 style="margin-top:0">Draw a segment</h3>
    <label for="seg-name">Call it</label><br>
    <input id="seg-name" name="name" type="text" placeholder="Cameras" autocomplete="off">
    <fieldset style="border:1px solid var(--line);border-radius:var(--round);margin:.7rem 0">
      <legend>What goes in it</legend>
      ${world.devices.filter(d => d.kind !== "router").map(d => {
        const sg = segmentOf(world, d.id);
        return `<label style="display:block;padding:.2rem 0">
          <input type="checkbox" name="member" value="${esc(d.id)}"> ${esc(d.name)}
          <span class="lede mono">${esc(d.ip)}</span>
          ${sg ? `<span class="flag neutral">currently in ${esc(sg.name)}</span>` : ""}</label>`;
      }).join("")}
    </fieldset>
    <button class="btn-primary" type="submit">Create it</button>
    <p class="lede">A device belongs to one segment at a time, the same way a switch port belongs to
      one VLAN. Anything already in another segment is <strong>moved</strong> into this one — and a
      segment left with nothing in it is gone, because an empty one separates nothing.</p>
  </form>`);

  return bits.join("\n");
}

/** Where else this device could go, one click each. */
function moveMenu(world, d, currentId) {
  const others = world.segments.filter(sg => sg.id !== currentId);
  const bits = others.map(sg =>
    `<button type="button" data-move-device="${esc(d.id)}" data-to="${esc(sg.id)}">&rarr; ${esc(sg.name)}</button>`);
  if (currentId) {
    bits.push(`<button type="button" class="btn-quiet" data-move-device="${esc(d.id)}" data-to="">Take it out</button>`);
  }
  return bits.length ? bits.join("") : `<span class="lede">nowhere else to put it yet</span>`;
}
