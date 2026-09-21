/* =====================================================================
   THE APP — TIER 1

   Wiring only. Every decision about what is true lives in world.js,
   rules.js, traffic.js, adversary.js and objectives.js; this file
   renders them and turns clicks into calls. Nothing here decides
   anything, which is why nothing here needs to be trusted.

   ---------------------------------------------------------------------
   THE CLOCK RUNS WHETHER OR NOT ANYBODY IS WATCHING

   The adversary is advanced on every tick, on every pane. If it only
   ran while the log was open, a student could avoid being broken into
   by not looking — which is the exact opposite of the lesson.

   ---------------------------------------------------------------------
   THE LOG ACCUMULATES, IT IS NOT REGENERATED

   Lines are generated once, judged once, and kept. A verdict records
   what the router decided AT THE TIME. So a student who adds a deny
   rule sees new lines dropped and old lines unchanged — which is how a
   log works, and which quietly teaches that a rule is not retroactive.

   ---------------------------------------------------------------------
   AN "ATTEMPT" ON THE HINT LADDER

   A change made to the world while an objective is unmet, or a press of
   the hint button. Both advance the ladder, because somebody fiddling
   deserves help at the same point as somebody who asks.

   A change only counts against the objectives it could plausibly have
   been aimed at. Closing a port forward is not an attempt at the
   password objective, and counting it as one would hand somebody a
   rung-2 hint on all six after four clicks.
   ===================================================================== */

import { makeWorld, device, setPassword, factoryReset, setForward,
         addSegment, removeSegment, addRule, removeRule, moveRule,
         moveDevice, renameSegment, setRuleEnabled, editRule,
         markLooked } from "./world.js";
import { makeRule } from "./rules.js";
import { makeAdversary } from "./adversary.js";
import { makeObjectives } from "./objectives.js";
import { clockOf } from "./traffic.js";
import { drawMap, deviceList, esc } from "./map.js";
import { deviceConsole, segmentConsole } from "./console.js";
import { lines, logPane, applyFilter, destinations, verdictBoard } from "./log.js";
import * as Verdict from "./verdict.js";
import { vooPane } from "./voo.js";
import { instructorPane, tryPin, close as closeInstructor, setClassUrl } from "./instructor.js";
import * as Save from "./save.js";
import { SCENARIOS, buildWorld, scenario } from "./scenarios.js";
import * as AAR from "./aar.js";
import * as C from "./campaign.js";

const MIN = 60000;
const ARRIVE = 20 * 60 * MIN;      /* the student sits down at 20:00 */
const BACKLOG = 45 * MIN;          /* how far back they can read */
const TICK_MS = 1000;
const SIM_PER_TICK = 4000;         /* one real second is four simulated */
const MAX_ROWS = 700;

/* Which objectives a change could have been aimed at.
   "you-know-what-is-happening" is on every one of them because it is
   the summative one — any change is an attempt at it. */
const AIMED_AT = {
  forward:  ["no-way-in", "you-know-what-is-happening"],
  password: ["no-factory-passwords", "you-know-what-is-happening"],
  segment:  ["cameras-cannot-reach-family", "you-know-what-is-happening"],
  rule:     ["rules-do-what-you-think", "you-know-what-is-happening"],
  verdict:  ["you-know-what-is-happening"]
};

const state = {
  world: null,
  adversary: null,
  objectives: null,
  rows: [],
  tab: "house",
  openDevice: "router",
  filter: {},
  hints: {},          /* objective id -> the hint text showing right now */
  navOpen: false,     /* only means anything on a phone; the rail is always there */
  editingRule: null,  /* which rule has its editor open, if any */
  campaign: null,     /* the record that outlives a tier */
  message: null,
  lastGenerated: 0
};

/* ---------------------------------------------------------------------
   SETUP
   --------------------------------------------------------------------- */
/* `continuing` is true only on boot, when there is no saved world.

   That case is somebody opening the page again, and it is NOT a new
   attempt. If an attempt for this tier is still open, carry on with
   it — same house, same seed, so closing the tab and coming back does
   not silently deal a different world either.

   Everything else that calls fresh() — a new night, another house,
   loading a copy — IS a deliberate new attempt and says so by leaving
   this off. */
function fresh(seed, scenarioId, continuing) {
  if (!state.campaign) state.campaign = C.load() || C.makeCampaign("");

  const open = continuing ? C.openTier(state.campaign, 1) : null;
  if (open) { scenarioId = open.scenario; seed = open.seed; }

  const w = buildWorld(scenarioId || "four-pack",
                       seed == null ? Math.floor(Math.random() * 100000) : seed);
  w.now = ARRIVE;
  const adv = makeAdversary({ seed: w.seed, armAt: ARRIVE });

  /* The three quarters of an hour before they sat down. It contains the
     scanning and the probing — both real — and cannot contain the
     break-in, because the grace period is armed at arrival. */
  const rows = lines(w, adv, ARRIVE - BACKLOG, ARRIVE);

  state.world = w;
  state.adversary = adv;
  state.objectives = makeObjectives(1);
  state.rows = rows;
  state.lastGenerated = ARRIVE;

  if (!open) C.startTier(state.campaign, 1, w.scenario, w.seed);
  C.save(state.campaign);
}

function restore(saved) {
  state.world = saved.world;
  state.adversary = makeAdversary({ seed: saved.world.seed, armAt: ARRIVE });
  state.objectives = makeObjectives(1).restore(saved.objectives);
  /* A save from before scenarios existed is the original house. */
  if (!state.world.scenario) state.world.scenario = "four-pack";

  const now = saved.world.now;
  state.rows = lines(saved.world, state.adversary, Math.max(ARRIVE - BACKLOG, now - BACKLOG), now);
  /* Regenerating a window ran the adversary over time that has already
     happened, which may have moved its per-door clocks. Put the saved
     ones back, AFTER, or a reload quietly hands out a fresh eight
     minutes of grace and the break-in becomes something you can dodge
     with F5. */
  state.adversary.restore(saved.adversary);
  state.lastGenerated = now;
  state.campaign = C.load() || C.makeCampaign("");
  if (!state.campaign.tiers.length) C.startTier(state.campaign, 1, state.world.scenario, state.world.seed);
}

/* ---------------------------------------------------------------------
   THE CLOCK
   --------------------------------------------------------------------- */
function tick() {
  const w = state.world;
  const from = w.now;
  const to = from + SIM_PER_TICK;
  w.now = to;

  const fresh = lines(w, state.adversary, from, to);
  if (fresh.length) {
    state.rows = state.rows.concat(fresh);
    if (state.rows.length > MAX_ROWS) state.rows = state.rows.slice(-MAX_ROWS);
  }
  state.lastGenerated = to;

  paintClock();

  /* Repaint the live panes, but never while somebody is typing in one.
     A filter box that empties itself every four seconds is unusable. */
  const focused = document.activeElement;
  const typing = focused && /^(INPUT|SELECT|TEXTAREA)$/.test(focused.tagName);
  if (!typing && (state.tab === "log" || state.tab === "voo" || state.tab === "objectives" ||
                  state.tab === "aar")) {
    renderPane();
  }
}

function paintClock() {
  const c = clockOf(state.world.now);
  const el = document.getElementById("clock");
  if (el) el.textContent = "Day " + c.day + " · " + c.time;
}

/* ---------------------------------------------------------------------
   RENDER
   --------------------------------------------------------------------- */
const TABS = [
  ["house", "The house"],
  ["console", "Console"],
  ["log", "The log"],
  ["voo", "VOO"],
  ["objectives", "Objectives"],
  ["aar", "AAR"],
  ["notes", "Notes"]
];

/* The AAR is open from the first minute, because it is running. What
   keeps that safe is not hiding the pane — it is that the AAR only
   ever contains what the student has DONE or already ESTABLISHED.
   Tonight's undiscovered finding is not in there. */
function tabsNow() { return TABS; }

function renderTabs() {
  const done = state.objectives.done(state.world);
  const total = state.objectives.total();
  const tabs = document.getElementById("tabs");

  tabs.innerHTML = tabsNow().map(([id, label]) =>
    `<button type="button" role="tab" data-tab="${id}" aria-selected="${state.tab === id}"
       aria-controls="pane">${esc(label)}` +
    (id === "objectives" ? `<span class="badge">${done}/${total}</span>` : "") +
    `</button>`).join("");

  /* On a phone this is what opens and closes the drawer. On a desk the
     stylesheet ignores it and shows the rail regardless, so the rail
     can never end up hidden behind a button that is not on screen. */
  tabs.setAttribute("data-open", String(state.navOpen));

  const toggle = document.getElementById("nav-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", String(state.navOpen));
  const where = document.getElementById("nav-where");
  if (where) {
    const here = tabsNow().filter(t => t[0] === state.tab)[0];
    where.textContent = here ? here[1] : "";
  }
}

function renderPane() {
  const w = state.world;
  const host = document.getElementById("pane");
  let html = "";

  if (state.message) {
    html += `<div class="msg" data-ok="${state.message.ok !== false}" role="status">${esc(state.message.msg)}</div>`;
  }

  if (state.tab === "house") {
    html += `<div class="card"><h2>The house</h2>
      <p>You have moved in and inherited the network. Nobody did anything malicious — somebody wanted to
      check the cameras from work, followed a forum post, and never thought about it again. Walking into
      a network somebody else set up badly is what every job actually feels like.</p>
      ${drawMap(w)}
      <p><button type="button" class="btn-primary" data-open-device="router">
        Open the firewall &mdash; port forwarding and rules</button></p></div>`;
    html += `<div class="card"><h3>Everything on it</h3>${deviceList(w)}</div>`;
    html += `<div class="card">${segmentConsole(w)}</div>`;
  }

  if (state.tab === "console") {
    html += `<div class="card">${deviceConsole(w, state.openDevice, state.editingRule)}</div>`;
  }

  if (state.tab === "log") {
    const all = state.rows;
    const shown = applyFilter(all, state.filter);
    state.filter.destinations = destinations(all);
    /* Newest last, the way a log reads. Capped so a phone is not asked
       to lay out seven hundred rows. */
    html += `<div class="card">${logPane(w, shown.slice(-250), state.filter)}</div>`;
    html += `<div class="card">${verdictBoard(w, Verdict)}</div>`;
  }

  if (state.tab === "voo") html += `<div class="card">${vooPane(w)}</div>`;
  if (state.tab === "aar") {
    html += `<div class="card">${AAR.render({
      world: w, campaign: state.campaign, objectives: state.objectives,
      instructor: instructorOpen()
    })}</div>`;
    html += `<div class="card"><h3>Keep a copy</h3>
      <p>One file. Open it and it is your report — readable offline, and it still honours the
        reading settings, which a PDF cannot because a PDF freezes the type size the moment it is
        made. <strong>It is also your save.</strong> Loading it back returns you to the start of a
        tier you had already finished.</p>
      <p><button type="button" class="btn-primary" data-save-copy>Save a copy</button></p>
      <p class="lede">To hand it in, open the saved file and press <strong>Save as PDF</strong>.
        Send the PDF rather than the file itself — an HTML attachment is a standard phishing
        delivery method and a security professional is right to be wary of one.</p>
      <h3>Load a copy back</h3>
      <p>Recovery, for a browser that has lost its data. It returns you to the start of the tier you
        had finished — not to five minutes ago, because an undo would cancel every consequence in
        this build.</p>
      <p><input type="file" accept=".html,text/html" data-load-copy
         style="font:inherit;color:var(--ink)"></p>
    </div>`;
  }
  if (state.tab === "objectives") html += objectivesPane();
  if (state.tab === "notes") html += `<div class="card">${instructorPane(w)}</div>`;

  host.innerHTML = html;
  state.message = null;
  renderTabs();
}

function objectivesPane() {
  const w = state.world;
  const prog = state.objectives.progress(w);
  const done = prog.filter(p => p.met).length;
  const pct = Math.round((done / prog.length) * 100);

  let html = `<div class="card">
    <h2>Objectives</h2>
    <div class="progress">
      <span class="count">${done}<span class="lede" style="font-size:1rem">/${prog.length}</span></span>
      <span class="bar"><span style="width:${pct}%"></span></span>
    </div>
    <p class="lede">None of these is ticked by anything. Every one is worked out from the state of the
      network right now, which means they can go backwards. Security is a state, not an achievement.</p>
  </div>`;

  html += prog.map(p => {
    const hint = state.hints[p.id];
    return `<div class="objective" data-met="${p.met}">
      <div class="head">
        <span class="state">${p.met ? "done" : "not yet"}</span>
        <span class="title">${esc(p.title)}</span>
      </div>
      <p class="status">${esc(p.status)}</p>
      <p class="why">${esc(p.why)}</p>
      ${p.met ? "" : `<p><button type="button" data-hint="${esc(p.id)}">
        ${hint ? "Another hint" : "I am stuck"}</button></p>`}
      ${hint ? `<div class="hint"><span class="rung">${hint.rung
          ? "Hint " + hint.rung + " of 3"
          : "Before you ask"}</span><p>${esc(hint.text)}</p></div>` : ""}
    </div>`;
  }).join("");

  const here = scenario(w.scenario);
  /* THE GATE, where they will actually be looking. The AAR carries the
     full version; this is the one line that stops six-of-six being a
     dead end on the pane that shows the score. */
  if (done >= prog.length - 1) {
    html += `<div class="card">
      <h3>${done === prog.length ? "Tier 1 is complete" : "Five of six — you may move on"}</h3>
      <p>${done === prog.length
        ? "Six of six, and the last one you established yourself rather than being told."
        : "That is a rule rather than a mercy: in a real job you move on with things outstanding."}
        <strong>Tier 2 is designed and not built yet</strong>, so the way forward for now is another
        of the six houses, or this one again on a new seed.</p>
      <p><button type="button" class="btn-primary" data-go="aar">Read the AAR</button>
         <button type="button" data-save-copy>Save a copy</button></p>
    </div>`;
  }

  html += `<div class="card"><h3>This world</h3>
    <p><strong>${esc(here.name)}</strong> — ${esc(here.blurb)}</p>
    <p class="lede">Seed <span class="mono">${esc(String(w.seed))}</span>. Same seed, same minute, same
      traffic, on every machine — so your instructor can send the whole room to one moment.</p>
    <p><button type="button" data-save>Save</button>
       <button type="button" class="btn-quiet" data-new-night>A new night — same house, new seed</button></p>
  </div>`;

  /* START OVER.

     There was no way to do this, which is why clearing the browser
     cache looked like the only option and did nothing — the cache
     holds FILES, and everything this build remembers is site data in
     a different box. Nothing in a cache clear ever touched it.

     Kept apart from "a new night" on purpose, and worded so nobody
     presses it expecting a new night: a new night keeps the record,
     and this ends it. */
  html += `<div class="card">
    <h3>Start over</h3>
    <p>A new night keeps your record — every house you have played, every attempt, and
      everything the AAR says about them. That is the point of it.</p>
    <p><strong>This clears all of it</strong> and returns this browser to a first visit:
      the campaign record, the AAR, your name and start date, and tonight's house.
      It cannot be undone from here.</p>
    <p class="lede">Clearing your browser cache will not do this. A cache holds the site's
      files; your progress is stored separately, which is why it kept coming back.</p>
    <p><button type="button" class="btn-quiet" data-start-over>Start over — clear everything in this browser</button></p>
  </div>`;

  /* SIX HOUSES. Listed plainly, with what each one is about, because
     the student is meant to work through all of them and an instructor
     is meant to be able to say "do the printer one".

     What each scenario TEACHES is shown before it is played and not
     hidden as a reward. Nothing in these blurbs names the device that
     was taken, and verify/scenarios.mjs holds them to that. */
  html += `<div class="card"><h3>The other houses</h3>
    <p>Six of them. Same lesson, six different faults, and every one is a network somebody else
      set up for a reason that made sense at the time.</p>
    ${SCENARIOS.map(sc => `<div class="objective" data-met="${sc.id === w.scenario}">
      <div class="head">
        <span class="state">${sc.id === w.scenario ? "playing" : "not yet"}</span>
        <span class="title">${esc(sc.name)}</span>
      </div>
      <p class="status">${esc(sc.blurb)}</p>
      <p class="why">${esc(sc.teaches)}</p>
      ${sc.id === w.scenario ? "" :
        `<p><button type="button" data-scenario="${esc(sc.id)}">Play this one</button></p>`}
    </div>`).join("")}
  </div>`;
  return html;
}

/* ---------------------------------------------------------------------
   ACTIONS
   --------------------------------------------------------------------- */
function bump(kind) {
  const ids = AIMED_AT[kind] || [];
  const prog = state.objectives.progress(state.world);
  ids.forEach(id => {
    const p = prog.filter(x => x.id === id)[0];
    if (p && !p.met) state.objectives.countAttempt(id);
  });
}

function act(kind, result) {
  state.message = result;
  if (result && result.ok) {
    bump(kind);
    /* Onto the campaign record as it happens, so the AAR is running
       rather than assembled at the end from a world that is about to
       be thrown away. */
    if (kind !== "verdict") {
      C.note(state.campaign, 1, "change." + kind, result.msg.slice(0, 160), null);
      C.save(state.campaign);
    }
  }
  autosave();
  renderPane();
}

/* What Tier 1 wants the AAR to still be able to say in three years. */
function tierSummary() {
  const w = state.world;
  const prog = state.objectives.progress(w);
  return {
    scenario: w.scenario,
    seed: w.seed,
    met: prog.filter(p => p.met).map(p => p.id),
    missed: prog.filter(p => !p.met).map(p => p.id),
    openWays: reachableCount(),
    taken: w.devices.filter(d => d.compromised).map(d => d.id),
    ruledOut: Verdict.struck(w).length,
    looked: !!w.looked
  };
}
function reachableCount() {
  return state.world.firewall.forwards.filter(f => f.enabled).length;
}

function instructorOpen() {
  try { return window.localStorage.getItem("cwp:instructor") === "1"; } catch (e) { return false; }
}

function downloadCopy() {
  const html = AAR.standalone({
    world: state.world, campaign: state.campaign, objectives: state.objectives
  });
  const name = (state.campaign.student.name || "cyber-warrior")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cyber-warrior";
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aar-" + name + "-tier1.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  /* Let the download start before the handle goes. */
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { ok: true, msg: "Saved. Keep that file — it is your report and your way back in." };
}

function autosave() {
  Save.save({
    world: state.world,
    adversary: state.adversary.state(),
    objectives: state.objectives.state()
  });
}

/* ---------------------------------------------------------------------
   EVENTS
   --------------------------------------------------------------------- */
function wire() {
  /* Escape closes it, the way every drawer anybody has used does. */
  document.addEventListener("keydown", ev => {
    if (ev.key !== "Escape" || !state.navOpen) return;
    state.navOpen = false;
    renderTabs();
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.focus();
  });

  document.addEventListener("click", ev => {
    const t = ev.target.closest ? ev.target : null;
    if (!t) return;

    if (t.closest("#nav-toggle")) {
      state.navOpen = !state.navOpen;
      renderTabs();
      if (state.navOpen) {
        const first = document.querySelector('#tabs button[aria-selected="true"]') ||
                      document.querySelector("#tabs button");
        if (first) first.focus();
      }
      return;
    }

    const tab = t.closest("[data-tab]");
    if (tab) {
      state.tab = tab.getAttribute("data-tab");
      /* Picking a pane closes the drawer and puts the reader at the top
         of what they asked for, rather than leaving them scrolled to a
         list that is no longer the point. */
      state.navOpen = false;
      if (state.tab === "log" && !state.world.looked) {
        /* Opening the log is itself the objective. It is recorded here
           rather than in the log module, because the log module renders
           and does not decide. */
        markLooked(state.world);
        autosave();
      }
      renderPane();
      const pane = document.getElementById("pane");
      if (pane) { pane.focus(); pane.scrollIntoView({ block: "start" }); }
      return;
    }

    const dev = t.closest("[data-open-device]");
    if (dev) {
      state.openDevice = dev.getAttribute("data-open-device");
      state.tab = "console";
      renderPane();
      return;
    }

    const reset = t.closest("[data-reset-device]");
    if (reset) { act("password", factoryReset(state.world, reset.getAttribute("data-reset-device"))); return; }

    const fwd = t.closest("[data-forward]");
    if (fwd) {
      act("forward", setForward(state.world, fwd.getAttribute("data-forward"),
                                fwd.getAttribute("data-enable") === "1"));
      return;
    }

    const mv = t.closest("[data-move-rule]");
    if (mv) {
      act("rule", moveRule(state.world, mv.getAttribute("data-move-rule"),
                           parseInt(mv.getAttribute("data-delta"), 10)));
      return;
    }

    const dr = t.closest("[data-drop-rule]");
    if (dr) { act("rule", removeRule(state.world, dr.getAttribute("data-drop-rule"))); return; }

    const md = t.closest("[data-move-device]");
    if (md) {
      act("segment", moveDevice(state.world, md.getAttribute("data-move-device"),
                                md.getAttribute("data-to") || null));
      return;
    }

    const tr = t.closest("[data-toggle-rule]");
    if (tr) {
      act("rule", setRuleEnabled(state.world, tr.getAttribute("data-toggle-rule"),
                                 tr.getAttribute("data-on") === "1"));
      return;
    }

    const er = t.closest("[data-edit-rule]");
    if (er) {
      /* An empty value is Cancel. Opening an editor changes nothing in
         the world, so it does not go through act() and does not count
         against the hint ladder — thinking about a rule is not an
         attempt at anything. */
      const id = er.getAttribute("data-edit-rule");
      state.editingRule = id || null;
      renderPane();
      return;
    }

    const ds = t.closest("[data-drop-segment]");
    if (ds) { act("segment", removeSegment(state.world, ds.getAttribute("data-drop-segment"))); return; }

    const hint = t.closest("[data-hint]");
    if (hint) {
      const id = hint.getAttribute("data-hint");
      state.hints[id] = state.objectives.hint(state.world, id);
      C.note(state.campaign, 1, "hint",
             "rung " + state.hints[id].rung + " on " + id, { objective: id, rung: state.hints[id].rung });
      C.save(state.campaign);
      autosave();
      renderPane();
      return;
    }

    const vp = t.closest("[data-verdict]");
    if (vp) {
      const before = Verdict.settled(state.world);
      const r = Verdict.pick(state.world, vp.getAttribute("data-verdict"));
      C.note(state.campaign, 1, r.correct ? "verdict.correct" : "verdict.wrong",
             r.msg.slice(0, 160), { option: vp.getAttribute("data-verdict") });
      act("verdict", r);
      /* The tier's one moment of arrival. Earned it just now, so go
         there rather than leaving it to be noticed. */
      if (!before && Verdict.settled(state.world)) {
        C.closeTier(state.campaign, 1, tierSummary());
        C.save(state.campaign);
        state.tab = "aar";
        renderPane();
        const pane = document.getElementById("pane");
        if (pane) { pane.focus(); pane.scrollIntoView({ block: "start" }); }
      }
      return;
    }
    if (t.closest("[data-verdict-reset]")) {
      act("verdict", Verdict.reset(state.world));
      /* Withdrawing the verdict withdraws the finding with it. The AAR
         itself stays — it is running, and it still holds what they did. */
      if (state.tab === "aar") { state.tab = "log"; renderPane(); }
      return;
    }

    const go = t.closest("[data-go]");
    if (go) {
      state.tab = go.getAttribute("data-go");
      renderPane();
      const pane = document.getElementById("pane");
      if (pane) { pane.focus(); pane.scrollIntoView({ block: "start" }); }
      return;
    }

    if (t.closest("[data-save-copy]")) { state.message = downloadCopy(); renderPane(); return; }

    if (t.closest("[data-clear-filter]")) { state.filter = {}; renderPane(); return; }
    if (t.closest("[data-save]")) { state.message = Save.save({
      world: state.world, adversary: state.adversary.state(), objectives: state.objectives.state()
    }); renderPane(); return; }

    if (t.closest("[data-new-night]")) {
      if (window.confirm("Start a new night? The same house, a new seed, and tonight is gone.")) {
        const same = state.world.scenario;
        Save.clear();
        fresh(null, same);
        state.hints = {};
        state.tab = "house";
        renderPane();
      }
      return;
    }

    if (t.closest("[data-start-over]")) {
      if (window.confirm(
            "Start over?\n\nThis clears the campaign record, the AAR, your name and start "
          + "date, and tonight's house. Everything goes back to a first visit.\n\n"
          + "This cannot be undone. If you want a clean run WITHOUT losing your record, "
          + "use “A new night” instead.")) {
        Save.clear();
        C.clear();
        state.campaign = null;
        fresh(null, "four-pack");
        state.hints = {};
        state.tab = "house";
        state.openDevice = "router";
        state.filter = {};
        state.editingRule = null;
        state.message = { ok: true, msg: "Cleared. This browser is back to a first visit." };
        renderPane();
      }
      return;
    }

    const sc = t.closest("[data-scenario]");
    if (sc) {
      const id = sc.getAttribute("data-scenario");
      if (window.confirm("Move to \u201c" + scenario(id).name + "\u201d? Tonight is gone.")) {
        Save.clear();
        fresh(null, id);
        state.hints = {};
        state.tab = "house";
        state.openDevice = "router";
        state.filter = {};
        renderPane();
      }
      return;
    }

    if (t.closest("[data-close-instructor]")) { closeInstructor(); renderPane(); return; }
  });

  /* RECOVERY ONLY. A copy is written at tier close, so loading one
     returns somebody to the start of a tier they had already finished
     — never to five minutes ago. An undo would cancel every
     consequence this build spends five tiers making real. */
  document.addEventListener("change", ev => {
    const input = ev.target.closest ? ev.target.closest("[data-load-copy]") : null;
    if (!input || !input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      const got = AAR.readSaved(String(reader.result || ""));
      if (!got) {
        state.message = { ok: false, msg: "That file does not carry a campaign record. It needs to be a copy saved from here." };
        renderPane();
        return;
      }
      state.campaign = got.campaign;
      C.noteRestore(state.campaign, 1);
      C.save(state.campaign);
      Save.clear();
      /* Back to the START of the tier, on its own scenario and seed —
         not to the moment the copy was written. */
      const t = C.currentTier(state.campaign);
      fresh(t ? t.seed : null, t ? t.scenario : "four-pack");
      state.hints = {};
      state.tab = "aar";
      state.message = { ok: true, msg: "Loaded. You are back at the start of that tier, and the record says so." };
      renderPane();
    };
    reader.readAsText(input.files[0]);
  });

  document.addEventListener("submit", ev => {
    const f = ev.target;
    const kind = f.getAttribute("data-form");
    if (!kind) return;
    ev.preventDefault();
    const data = new FormData(f);

    if (kind === "password") {
      act("password", setPassword(state.world, f.getAttribute("data-device"), data.get("pass")));
    } else if (kind === "rule") {
      const fields = {
        dir: data.get("dir"),
        srcIp: data.get("srcIp"),
        dstIp: data.get("dstIp"),
        dstPort: data.get("dstPort"),
        action: data.get("action"),
        note: data.get("note") || ""
      };
      const editId = f.getAttribute("data-edit");
      if (editId) {
        state.editingRule = null;
        act("rule", editRule(state.world, editId, fields));
      } else {
        act("rule", addRule(state.world, makeRule(fields), fields.note || "written by the owner"));
      }
    } else if (kind === "rename-segment") {
      act("segment", renameSegment(state.world, f.getAttribute("data-segment"), data.get("name")));
    } else if (kind === "test") {
      /* Read-only. It asks the ruleset a question and changes nothing,
         so it is kept off the record and off the hint ladder — and it
         is stored on the world only so the answer survives the
         repaint. */
      state.world.test = {
        dir: data.get("dir"),
        srcIp: data.get("srcIp"),
        dstIp: data.get("dstIp"),
        dstPort: parseInt(data.get("dstPort"), 10),
        proto: "tcp"
      };
      renderPane();
    } else if (kind === "segment") {
      act("segment", addSegment(state.world, data.get("name"), data.getAll("member")));
    } else if (kind === "log-filter") {
      state.filter = {
        device: data.get("device") || "",
        dest: data.get("dest") || "",
        where: data.get("where") || ""
      };
      renderPane();
    } else if (kind === "pin") {
      state.message = tryPin(data.get("pin"))
        ? { ok: true, msg: "Open." }
        : { ok: false, msg: "That is not the PIN." };
      renderPane();
    } else if (kind === "aar-name") {
      C.setName(state.campaign, data.get("name"));
      C.save(state.campaign);
      state.message = { ok: true, msg: "Saved. It goes at the top of the document." };
      renderPane();
    } else if (kind === "aar-note") {
      C.setNotes(state.campaign, parseInt(f.getAttribute("data-tier"), 10),
                 f.getAttribute("data-key"), data.get("text"));
      C.save(state.campaign);
      state.message = { ok: true, msg: "Saved. That is your half of the review." };
      renderPane();
    } else if (kind === "classurl") {
      setClassUrl(data.get("url"));
      state.message = { ok: true, msg: "Saved in this browser." };
      renderPane();
    }
  });
}

/* ---------------------------------------------------------------------
   GO
   --------------------------------------------------------------------- */
const saved = Save.load();
if (saved) restore(saved); else fresh(null, "four-pack", true);
wire();
renderTabs();
renderPane();
paintClock();
let beat = window.setInterval(tick, TICK_MS);

/* Exposed so the page can be driven from a verifier. Nothing in the
   interface reads it — a check that can only test what it can reach
   through the interface leaves defensive branches unverifiable, and
   this build has been bitten by that three times. */
window.FIREWALL = {
  state: state,
  tick: tick,
  render: renderPane,
  go: id => { state.tab = id; renderPane(); },
  /* Stop the clock. A check that wants to ask "does this screen read
     any differently when a device has been taken" has to be able to
     clear the flag and look, without the adversary quietly setting it
     again between the two readings and turning a real leak into a
     pass. */
  pause: () => { if (beat) { window.clearInterval(beat); beat = null; } },
  standalone: () => AAR.standalone({
    world: state.world, campaign: state.campaign, objectives: state.objectives
  }),
  readSaved: AAR.readSaved,
  resume: () => { if (!beat) beat = window.setInterval(tick, TICK_MS); }
};
