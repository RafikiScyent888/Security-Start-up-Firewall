/* =====================================================================
   RENDERING TIERS 2 TO 5

   The markup deliberately reuses Tier 1's `.options` / `.option`
   classes, because those have already been measured on painted pixels
   in both themes, both reading modes, phone and desk. A second set of
   option styles would be a second thing to prove and a second thing to
   get wrong.

   A struck option is marked THREE ways, never colour alone:
     1. the colour               (data-state="wrong")
     2. an inset rule and strike (the stylesheet, on the same attribute)
     3. the words                ("Ruled out", then the reason)

   Students here have damaged sight. Colour is never the only signal.
   ===================================================================== */

import * as D from "./decisions.js";
import * as Tiers from "./tiers.js";

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------------
   ONE DECISION SET
   --------------------------------------------------------------------- */
export function decisionCard(state, set) {
  const out = D.struck(state, set.id);
  const done = D.settled(state, set.id);
  const hint = D.hintFor(state, set);
  const n = D.attempts(state, set.id);

  /* Rung 3 strikes options FOR the student, with a reason each. Those
     are shown struck on the board as well, so the narrowing is
     visible rather than something they have to hold in their head. */
  const hinted = (hint && hint.struck) ? hint.struck.map(s => s.id) : [];

  const items = set.options.map(o => {
    const isOut = out.indexOf(o.id) >= 0;
    const isHinted = hinted.indexOf(o.id) >= 0 && !isOut;
    const isRight = done && o.correct;
    const st = isRight ? "right" : ((isOut || isHinted) ? "wrong" : "");
    return `<li><button type="button" class="option"
        ${st ? `data-state="${st}"` : ""}
        ${(isOut || done) ? "disabled" : ""}
        data-decide="${esc(set.id)}" data-option="${esc(o.id)}">
      ${st ? `<span class="mark">${isRight ? "Correct" : (isHinted ? "Narrowed out" : "Ruled out")}</span>` : ""}
      <span class="label">${esc(o.label)}</span>
      ${(isOut || isHinted) ? `<span class="reason">${esc(o.reason)}</span>` : ""}
    </button></li>`;
  });

  const right = set.options.filter(o => o.correct)[0];

  return `<div class="card" id="${esc(set.id)}">
    <h3>${esc(set.title)}</h3>
    <p class="brief">${esc(set.brief)}</p>
    <p><strong>${esc(set.question)}</strong></p>
    <p class="lede">Six options, one of them right. Unlimited tries and unlimited hints — a wrong
      answer stays on the board with the reason it is out, so you never have to hold five
      eliminations in your head.</p>
    <ul class="options">${items.join("")}</ul>
    ${done
      ? `<div class="msg" data-ok="true" role="status">${esc(right && right.why ? right.why : "Settled.")}</div>`
      : `<p>
           <button type="button" data-hint-decide="${esc(set.id)}">${n >= 3 ? "Another hint" : "I am stuck"}</button>
           <button type="button" class="btn-quiet" data-reset-decide="${esc(set.id)}">Clear the board</button>
         </p>`}
    ${(!done && hint) ? `<div class="hint"><span class="rung">Hint ${hint.rung} of 3</span>
      <p>${esc(hint.text)}</p></div>` : ""}
    ${(!done && !hint && n > 0)
      ? `<p class="lede">${n} ${n === 1 ? "try" : "tries"} so far. Hints start on the third.</p>` : ""}
  </div>`;
}

/* ---------------------------------------------------------------------
   A MULTI SET — six options, three correct
   --------------------------------------------------------------------- */
export function multiCard(state, set) {
  const got = D.multiGot(state, set.id);
  const out = D.multiStruck(state, set.id);
  const done = D.multiSettled(state, set.id);
  const hint = D.hintForMulti(state, set);
  const n = D.ensureMulti(state, set.id).attempts;
  const hinted = (hint && hint.struck) ? hint.struck.map(s => s.id) : [];
  const need = set.choose || 3;

  const items = set.options.map(o => {
    const isGot = got.indexOf(o.id) >= 0;
    const isOut = out.indexOf(o.id) >= 0;
    const isHinted = hinted.indexOf(o.id) >= 0 && !isOut && !isGot;
    const st = isGot ? "right" : ((isOut || isHinted) ? "wrong" : "");
    return `<li><button type="button" class="option"
        ${st ? `data-state="${st}"` : ""}
        ${(isGot || isOut || done) ? "disabled" : ""}
        data-multi="${esc(set.id)}" data-option="${esc(o.id)}">
      ${st ? `<span class="mark">${isGot ? "In" : (isHinted ? "Narrowed out" : "Ruled out")}</span>` : ""}
      <span class="label">${esc(o.label)}</span>
      ${(isGot || isOut || isHinted) ? `<span class="reason">${esc(o.reason)}</span>` : ""}
    </button></li>`;
  });

  return `<div class="card" id="${esc(set.id)}">
    <h3>${esc(set.title)}</h3>
    <p class="brief">${esc(set.brief)}</p>
    <p><strong>${esc(set.question)}</strong></p>
    <p class="lede">Six options and ${need} of them are right. ${got.length} of ${need} chosen.
      Unlimited tries.</p>
    <ul class="options">${items.join("")}</ul>
    ${done
      ? `<div class="msg" data-ok="true" role="status">That is the set. All three cost nothing,
          and every one of them acts at the moment the mistake is being made.</div>`
      : `<p>
           <button type="button" data-hint-multi="${esc(set.id)}">${n >= 3 ? "Another hint" : "I am stuck"}</button>
           <button type="button" class="btn-quiet" data-reset-multi="${esc(set.id)}">Clear the board</button>
         </p>`}
    ${(!done && hint) ? `<div class="hint"><span class="rung">Hint ${hint.rung} of 3</span>
      <p>${esc(hint.text)}</p></div>` : ""}
  </div>`;
}

/* ---------------------------------------------------------------------
   A PRODUCT CHOICE — no correct answer, real consequences
   --------------------------------------------------------------------- */
export function pickCard(state, pick) {
  const chosen = state.picks ? state.picks[pick.id] : null;
  const items = pick.options.map(o => {
    const is = chosen === o.id;
    return `<li><button type="button" class="option" ${is ? 'data-state="chosen"' : ""}
        data-pick="${esc(pick.id)}" data-option="${esc(o.id)}">
      ${is ? `<span class="mark">Chosen</span>` : ""}
      <span class="label">${esc(o.label)}</span>
      ${is ? `<span class="reason">${esc(o.consequence)}</span>` : ""}
    </button></li>`;
  });
  return `<div class="card" id="${esc(pick.id)}">
    <h3>${esc(pick.question)}</h3>
    <p class="brief">${esc(pick.brief)}</p>
    <p class="lede"><strong>There is no correct answer here.</strong> These are real products with
      real trade-offs, and what you choose decides what happens later. You can change it while the
      tier is open.</p>
    <ul class="options">${items.join("")}</ul>
  </div>`;
}

/* ---------------------------------------------------------------------
   THE TIER
   --------------------------------------------------------------------- */
export function tierPane(mod, state) {
  const prog = Tiers.progress(mod, state);
  const done = prog.filter(p => p.met).length;
  const pct = Math.round((done / prog.length) * 100);

  let html = `<div class="card">
    <h2>Tier ${mod.ID} &mdash; ${esc(mod.NAME)}</h2>
    <div class="progress">
      <span class="count">${done}<span class="lede" style="font-size:1rem">/${prog.length}</span></span>
      <span class="bar"><span style="width:${pct}%"></span></span>
    </div>
    <p>${esc(mod.BLURB)}</p>
    <p class="lede">Nothing here is ticked by a script. Every objective is worked out from what you
      have actually decided, which means they can go backwards if you change your mind.</p>
  </div>`;

  if (mod.CLIENTS && mod.CLIENTS.length) {
    html += `<div class="card"><h3>Who you work for now</h3>${
      mod.CLIENTS.map(c => `<div class="objective">
        <div class="head"><span class="state">${esc(c.regime)}</span>
        <span class="title">${esc(c.name)}</span></div>
        <p class="status">${esc(c.rate)} &mdash; ${esc(c.note)}</p></div>`).join("")}</div>`;
  }
  if (mod.STAFF && mod.STAFF.length) {
    html += `<div class="card"><h3>Who works for you</h3>${
      mod.STAFF.map(s => `<div class="objective">
        <div class="head"><span class="title">${esc(s.name)}</span></div>
        <p class="status">${esc(s.role)}</p></div>`).join("")}</div>`;
  }
  if (mod.CAST && mod.CAST.length) {
    html += `<div class="card"><h3>Around the edges</h3>${
      mod.CAST.map(s => `<div class="objective">
        <div class="head"><span class="title">${esc(s.name)}</span></div>
        <p class="status">${esc(s.role)}</p></div>`).join("")}</div>`;
  }

  /* Choices before questions, because several of the questions only
     make sense once the student has decided what they own. */
  if (mod.PICKS && mod.PICKS.length) {
    html += `<div class="card"><h3>What you buy</h3>
      <p>These are not questions with a right answer. They are the decisions a real owner makes
        with a real budget, and they decide what the incidents below are able to do.</p></div>`;
    html += mod.PICKS.map(p => pickCard(state, p)).join("");
  }

  html += `<div class="card"><h3>What happens</h3>
    <p>Work them in order. Each one is a real situation with one right answer and five that a real
      technician has actually chosen.</p></div>`;
  html += (mod.SETS || []).map(s => decisionCard(state, s)).join("");
  html += (mod.MULTI || []).map(s => multiCard(state, s)).join("");

  /* Outcomes, only once the relevant choices exist. Nothing here
     discloses an answer to a question still open. */
  if (mod.ID === 2 && state.picks["t2-backup"]) {
    const o = mod.ransomwareOutcome(state);
    html += `<div class="card"><h3>Month five, given what you built</h3>
      <p><strong>${esc(o.headline)}</strong></p><p>${esc(o.detail)}</p></div>`;
  }
  if (mod.ID === 4 && state.picks["t4-detection"]) {
    const o = mod.detectionOutcome(state);
    html += `<div class="card"><h3>When Pippin is caught, given what you bought</h3>
      <p><strong>${esc(o.headline)}</strong></p><p>${esc(o.detail)}</p></div>`;
  }
  if (mod.ID === 5 && state.picks["t5-dlp"] && state.picks["t5-retention"]) {
    const o = mod.outcome(state);
    html += `<div class="card"><h3>How this ends, given what you bought</h3>
      <p><strong>${esc(o.headline)}</strong></p><p>${esc(o.detail)}</p></div>`;
  }

  /* Objectives last: they are the scoreboard, not the briefing. */
  html += `<div class="card"><h3>Objectives</h3>
    <p class="lede">Named at domain and bullet level against the supplied SY0-701 text. No
      sub-objective numbers are claimed, because none were supplied.</p></div>`;
  html += prog.map(p => `<div class="objective" data-met="${p.met}">
    <div class="head">
      <span class="state">${p.met ? "done" : "not yet"}</span>
      <span class="title">${esc(p.title)}</span>
    </div>
    <p class="status">${esc(p.status)}</p>
    <p class="why">${esc(p.why)}</p>
    <p class="why"><em>${p.domains.map(esc).join(" &middot; ")}</em></p>
  </div>`).join("");

  if (Tiers.mayMoveOn(mod, state)) {
    const missed = prog.filter(p => !p.met);
    html += `<div class="card">
      <h3>${done === prog.length ? "Tier " + mod.ID + " is complete" : "Five of six — you may move on"}</h3>
      <p>${done === prog.length
        ? "Six of six."
        : "That is a rule rather than a mercy: in a real job you move on with things outstanding. " +
          "The one still open is <strong>" + esc(missed.map(m => m.title).join(", ")) + "</strong>."}</p>
      ${mod.ID < 5
        ? `<p><button type="button" class="btn-primary" data-go-tier="${mod.ID + 1}">
             Go to Tier ${mod.ID + 1}</button>
           <button type="button" data-go="aar">Read the AAR</button></p>`
        : `<p><strong>That is the whole spine.</strong> Five tiers, from a home network you
             inherited to a SOC that detected a planted insider. Your AAR covers all of it.</p>
           <p><button type="button" class="btn-primary" data-go="aar">Read the AAR</button></p>`}
    </div>`;
  }

  return html;
}
