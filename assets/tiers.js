/* =====================================================================
   THE FIVE TIERS

   Tier 1 is a network simulation and does not look like the others —
   it has a world, a map, a log and an adversary, and its single
   question is computed from the state of a router. Tiers 2 to 5 are
   incident-response tiers: authored decisions, product choices with
   consequences, and objectives worked out from what was decided.

   That difference is real and it is not a seam to be hidden. A student
   at Tier 1 is configuring a box. A student at Tier 4 is deciding what
   to tell a dental surgery. The interface should look different,
   because the job is different.

   WHAT IS SHARED: the six-option contract, the hint ladder, the rule
   that nothing is ticked by a script, the campaign record, and the
   AAR.
   ===================================================================== */

import * as T2 from "./tier2.js";
import * as T3 from "./tier3.js";
import * as T4 from "./tier4.js";
import * as T5 from "./tier5.js";
import * as D from "./decisions.js";

export const TIERS = [T2, T3, T4, T5];

export function tier(id) {
  return TIERS.filter(t => t.ID === Number(id))[0] || null;
}

/** Tier 1 is deliberately absent from TIERS — it has its own engine.
    This is the whole spine, for anything that needs to talk about all
    five, such as the AAR. */
export const SPINE = [
  { id: 1, name: "The house", months: 0, playable: true,
    blurb: "A home network you have just inherited. No business, nothing to lose yet, and " +
      "something already inside." },
  { id: 2, name: T2.NAME, months: T2.MONTHS, playable: true, blurb: T2.BLURB },
  { id: 3, name: T3.NAME, months: T3.MONTHS, playable: true, blurb: T3.BLURB },
  { id: 4, name: T4.NAME, months: T4.MONTHS, playable: true, blurb: T4.BLURB },
  { id: 5, name: T5.NAME, months: T5.MONTHS, playable: true, blurb: T5.BLURB }
];

/* ---------------------------------------------------------------------
   PROGRESS

   Same contract as Tier 1: every objective is computed, none is
   ticked, and they can go backwards if somebody changes their mind.
   --------------------------------------------------------------------- */
export function progress(mod, state) {
  return (mod.OBJECTIVES || []).map(o => ({
    id: o.id,
    title: o.title,
    why: o.why,
    domains: o.domains || [],
    met: !!o.test(state),
    status: o.status(state)
  }));
}

export function doneCount(mod, state) {
  return progress(mod, state).filter(p => p.met).length;
}

/** A tier completes at 6 of 6. At 5 of 6 they may move on, and the
    build explains what they left. Settled long ago, and the same rule
    for every tier. */
export function complete(mod, state) {
  const p = progress(mod, state);
  return p.length > 0 && p.every(x => x.met);
}

export function mayMoveOn(mod, state) {
  const p = progress(mod, state);
  return p.length > 0 && p.filter(x => x.met).length >= p.length - 1;
}

/* ---------------------------------------------------------------------
   EVERY AUTHORED QUESTION, for the verifier and the AAR
   --------------------------------------------------------------------- */
export function allSets() {
  const out = [];
  for (const t of TIERS) for (const s of (t.SETS || [])) out.push({ tier: t.ID, set: s });
  return out;
}

export function allMulti() {
  const out = [];
  for (const t of TIERS) for (const m of (t.MULTI || [])) out.push({ tier: t.ID, set: m });
  return out;
}

export function allPicks() {
  const out = [];
  for (const t of TIERS) for (const p of (t.PICKS || [])) out.push({ tier: t.ID, pick: p });
  return out;
}

/** Everything wrong with the authored content, as a flat list. An
    empty array is the only acceptable answer and verify/tiers.mjs
    fails the build otherwise. */
export function contentFaults() {
  const faults = [];
  for (const { tier, set } of allSets()) {
    for (const f of D.check(set)) faults.push("tier " + tier + ": " + f);
  }
  for (const { tier, set } of allMulti()) {
    for (const f of D.checkMulti(set)) faults.push("tier " + tier + ": " + f);
  }
  for (const t of TIERS) {
    const objs = t.OBJECTIVES || [];
    if (objs.length !== 6) {
      faults.push("tier " + t.ID + ": " + objs.length + " objectives, and every tier has six");
    }
    for (const o of objs) {
      if (!o.domains || !o.domains.length) {
        faults.push("tier " + t.ID + ": objective " + o.id + " carries no exam labels");
      }
      if (typeof o.test !== "function" || typeof o.status !== "function") {
        faults.push("tier " + t.ID + ": objective " + o.id + " is not computed from state");
      }
      /* NO SUB-OBJECTIVE NUMBERS. None were ever supplied, so any
         label that looks like "1.2" or "4.3.1" has been invented, and
         a student would carry that into an exam. */
      for (const d of (o.domains || [])) {
        if (/\b\d+\.\d+/.test(d)) {
          faults.push("tier " + t.ID + ": objective " + o.id +
                      " claims a sub-objective number (\"" + d + "\") and none were supplied");
        }
      }
    }
  }
  return faults;
}

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
export function makeState(tierId) {
  const m = tier(tierId);
  return m ? m.makeState() : null;
}

export function setById(mod, id) {
  return (mod.SETS || []).filter(s => s.id === id)[0] ||
         (mod.MULTI || []).filter(s => s.id === id)[0] || null;
}

export function isMulti(mod, id) {
  return (mod.MULTI || []).some(s => s.id === id);
}
