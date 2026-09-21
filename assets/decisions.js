/* =====================================================================
   THE DECISION SET — six options, one correct, five wrong

   ---------------------------------------------------------------------
   Tier 1 asks exactly one question and computes its board from the
   network (assets/verdict.js). Every tier after it asks many, and the
   answers are authored rather than computed, because "should you tell
   both clients or only the one holding the document" is not a fact
   about a router.

   So this is the same contract, driven by content instead of world
   state. The rules it enforces are the owner's, verbatim:

     - SIX options. One correct, five wrong. Hard numbers, and
       `check()` refuses a set that is not shaped that way rather than
       quietly rendering five or seven
     - A wrong pick goes red and STAYS red until they solve it or
       reset it. The board is their working memory
     - Red is never the only signal. Every struck option is marked at
       least three ways — the colour, an inset rule and a strike, and
       the words "Ruled out" with the reason after them. That is the
       renderer's job, and verify/decisions.mjs holds it to it
     - Every wrong option is a near miss: a real mistake a real
       technician makes, close enough to the right answer that the way
       through is to hunt the key words in the brief
     - Unlimited tries. Nothing ever locks anybody out

   THE HINT LADDER, also verbatim:

     guesses 1-2  nothing. Let them think
     guess 3      rung 1 — where to look. Point at the evidence,
                  never at what is in it
     guess 4      rung 2 — the principle that decides it, stated
                  generally, with the specific case left to them
     guess 5+     rung 3, for ever — the field narrowed, with a reason
                  attached to each option removed

   There is no rung that says the answer, however many times they ask.
   Rung 3 repeats indefinitely and must always leave at least TWO live
   options, or it has handed the answer over by elimination. `narrow()`
   enforces that, and a plant that lets it strike down to one is caught.
   ===================================================================== */

/* ---------------------------------------------------------------------
   SHAPE
   --------------------------------------------------------------------- */

/** Six options, one correct. Anything else is a content bug and is
    worth failing loudly for, because a five-option board silently
    renders and a student never knows they were shortchanged. */
export function check(set) {
  const faults = [];
  if (!set || !set.id) return ["a decision set with no id"];
  const opts = set.options || [];
  if (opts.length !== 6) {
    faults.push(set.id + ": " + opts.length + " options, and the rule is six");
  }
  const right = opts.filter(o => o.correct);
  if (right.length !== 1) {
    faults.push(set.id + ": " + right.length + " correct options, and the rule is exactly one");
  }
  for (const o of opts) {
    if (!o.id) faults.push(set.id + ": an option with no id");
    if (!o.label) faults.push(set.id + ": " + o.id + " has no label");
    /* Every wrong option carries the reason it is wrong, because rung
       3 strikes options WITH a reason each and cannot do that from a
       bare label. */
    if (!o.correct && !o.reason) {
      faults.push(set.id + ": the wrong option " + o.id + " has no reason, so it cannot be struck with one");
    }
  }
  const ids = opts.map(o => o.id);
  if (new Set(ids).size !== ids.length) faults.push(set.id + ": two options share an id");
  if (!set.question) faults.push(set.id + ": no question");
  if (!set.brief) faults.push(set.id + ": no brief — the discriminating detail has nowhere to hide");
  const hints = set.hints || [];
  if (hints.length < 2) {
    faults.push(set.id + ": " + hints.length + " hints, and rungs 1 and 2 are both required");
  }
  return faults;
}

/* ---------------------------------------------------------------------
   STATE

   Kept on a plain object the tier owns, so a decision's working-out
   saves and restores with everything else and never lives in a module
   the way a singleton would.
   --------------------------------------------------------------------- */
export function ensure(store, id) {
  if (!store.decisions) store.decisions = {};
  if (!store.decisions[id]) store.decisions[id] = { wrong: [], settled: false, attempts: 0 };
  const d = store.decisions[id];
  if (!d.wrong) d.wrong = [];
  if (typeof d.attempts !== "number") d.attempts = 0;
  return d;
}

export function settled(store, id) { return !!ensure(store, id).settled; }
export function struck(store, id) { return ensure(store, id).wrong.slice(); }
export function attempts(store, id) { return ensure(store, id).attempts; }

/** The options not yet ruled out. Never fewer than one while the
    question is open, and the correct one is in here by construction
    because `pick` refuses to strike it. */
export function live(store, set) {
  const out = struck(store, set.id);
  return set.options.filter(o => out.indexOf(o.id) < 0);
}

/* ---------------------------------------------------------------------
   PICKING
   --------------------------------------------------------------------- */
export function pick(store, set, optionId) {
  const d = ensure(store, set.id);
  if (d.settled) {
    return { ok: true, correct: true, already: true, msg: "You have already settled this one." };
  }
  const opt = set.options.filter(o => o.id === optionId)[0];
  if (!opt) return { ok: false, msg: "That is not one of the options." };
  if (d.wrong.indexOf(optionId) >= 0) {
    return { ok: false, already: true,
             msg: "You have already ruled that one out, and the reason is still on the board." };
  }

  d.attempts += 1;

  if (opt.correct) {
    d.settled = true;
    return { ok: true, correct: true, option: opt,
             msg: opt.why || "Right.", attempts: d.attempts };
  }

  d.wrong.push(optionId);
  return { ok: true, correct: false, option: opt,
           msg: opt.label + " is ruled out. " + opt.reason, attempts: d.attempts };
}

/** Clear the working out. Nothing a student CONFIGURED is touched —
    resetting your reasoning has not un-hardened anything, and making
    somebody redo work they got right is how you teach them not to
    experiment. */
export function reset(store, set) {
  const d = ensure(store, set.id);
  d.wrong = [];
  d.settled = false;
  /* Attempts deliberately survive. Somebody on their eighth guess who
     clears the board is still on their eighth guess, and dropping
     them back to "no hints yet" would take away the help they have
     earned at exactly the moment they asked for a clean start. */
  return { ok: true, msg: "Cleared. Only your working out — nothing you set up has changed." };
}

/* ---------------------------------------------------------------------
   THE LADDER
   --------------------------------------------------------------------- */
export function rungFor(n) {
  if (n < 3) return 0;
  if (n === 3) return 1;
  if (n === 4) return 2;
  return 3;
}

/** Rung 3: the field narrowed, a reason attached to each option
    removed — and never down to one.

    With six options and five wrong, an unaided rung 3 could strike
    four and leave the answer standing alone. So it strikes at most
    down to TWO live options, picking from the wrong ones the student
    has not already ruled out. */
export function narrow(store, set) {
  const alive = live(store, set);
  const wrongAlive = alive.filter(o => !o.correct);
  const room = alive.length - 2;              /* never below two */
  const take = Math.max(0, Math.min(room, wrongAlive.length));
  return wrongAlive.slice(0, take);
}

/** What to show for the number of guesses made so far. Returns null
    below rung 1, so guesses one and two genuinely get nothing. */
export function hintFor(store, set) {
  const n = attempts(store, set.id);
  const rung = rungFor(n);
  if (!rung) return null;

  const hints = set.hints || [];
  if (rung === 1) return { rung: 1, text: hints[0] || "Read the brief again, slowly." };
  if (rung === 2) return { rung: 2, text: hints[1] || hints[0] };

  /* Rung 3, for ever. */
  const cut = narrow(store, set);
  if (!cut.length) {
    /* Already down to two. There is nowhere left to narrow to, so the
       principle is restated rather than inventing a fourth rung. */
    return { rung: 3, text: hints[2] || hints[1] || hints[0], struck: [] };
  }
  return {
    rung: 3,
    text: hints[2] || hints[1] || hints[0],
    struck: cut.map(o => ({ id: o.id, label: o.label, reason: o.reason }))
  };
}

/* ---------------------------------------------------------------------
   PROGRESS
   --------------------------------------------------------------------- */
export function allSettled(store, sets) {
  return sets.every(s => settled(store, s.id));
}

export function countSettled(store, sets) {
  return sets.filter(s => settled(store, s.id)).length;
}

/* =====================================================================
   MULTI — six options, THREE correct, choose three

   Sam's control decision is authored this way in the build document,
   and it is not a deviation from the six-option rule but an extension
   of it. Choosing a coherent SET of controls is a different skill from
   choosing the single right action: the wrong answers here are all
   individually sensible, and two of them are things the student will
   correctly buy at a later tier. What is being tested is whether they
   can tell a control from a piece of documentation, and whether they
   can spend nothing.

   Same contract otherwise. Wrong picks stay struck with a reason,
   unlimited tries, and the ladder never narrows below the number they
   still have to find.
   ===================================================================== */

export function checkMulti(set) {
  const faults = [];
  if (!set || !set.id) return ["a multi set with no id"];
  const opts = set.options || [];
  if (opts.length !== 6) faults.push(set.id + ": " + opts.length + " options, and the rule is six");
  const right = opts.filter(o => o.correct);
  const need = set.choose || 0;
  if (!need) faults.push(set.id + ": does not say how many to choose");
  if (right.length !== need) {
    faults.push(set.id + ": " + right.length + " correct options but asks for " + need);
  }
  for (const o of opts) {
    if (!o.reason) faults.push(set.id + ": " + o.id + " has no reason");
  }
  if (!set.brief) faults.push(set.id + ": no brief");
  if ((set.hints || []).length < 2) faults.push(set.id + ": needs at least rungs 1 and 2");
  return faults;
}

export function ensureMulti(store, id) {
  if (!store.multi) store.multi = {};
  if (!store.multi[id]) store.multi[id] = { got: [], wrong: [], attempts: 0, settled: false };
  const m = store.multi[id];
  if (!m.got) m.got = [];
  if (!m.wrong) m.wrong = [];
  if (typeof m.attempts !== "number") m.attempts = 0;
  return m;
}

export function multiSettled(store, id) { return !!ensureMulti(store, id).settled; }
export function multiGot(store, id) { return ensureMulti(store, id).got.slice(); }
export function multiStruck(store, id) { return ensureMulti(store, id).wrong.slice(); }

export function pickMulti(store, set, optionId) {
  const m = ensureMulti(store, set.id);
  if (m.settled) return { ok: true, correct: true, already: true, msg: "You have already settled this one." };
  const opt = set.options.filter(o => o.id === optionId)[0];
  if (!opt) return { ok: false, msg: "That is not one of the options." };
  if (m.got.indexOf(optionId) >= 0 || m.wrong.indexOf(optionId) >= 0) {
    return { ok: false, already: true, msg: "That one is already decided, and it is still on the board." };
  }

  m.attempts += 1;

  if (opt.correct) {
    m.got.push(optionId);
    if (m.got.length >= (set.choose || 3)) {
      m.settled = true;
      return { ok: true, correct: true, complete: true, option: opt,
               msg: set.done || "That is the set. Every one of them acts at the moment of the mistake, and none of them costs anything." };
    }
    return { ok: true, correct: true, option: opt,
             msg: opt.label + " — yes. " + opt.reason + " " +
                  ((set.choose || 3) - m.got.length) + " to go." };
  }

  m.wrong.push(optionId);
  return { ok: true, correct: false, option: opt, msg: opt.label + " is ruled out. " + opt.reason };
}

export function resetMulti(store, set) {
  const m = ensureMulti(store, set.id);
  m.got = []; m.wrong = []; m.settled = false;
  return { ok: true, msg: "Cleared. Only your working out." };
}

export function liveMulti(store, set) {
  const m = ensureMulti(store, set.id);
  return set.options.filter(o => m.got.indexOf(o.id) < 0 && m.wrong.indexOf(o.id) < 0);
}

/** Rung 3 for a multi set. It must never narrow so far that the
    remaining live options are exactly the ones still needed — that is
    handing over the answer by elimination. So it leaves at least one
    more live option than there are picks outstanding. */
export function narrowMulti(store, set) {
  const m = ensureMulti(store, set.id);
  const alive = liveMulti(store, set);
  const outstanding = (set.choose || 3) - m.got.length;
  const wrongAlive = alive.filter(o => !o.correct);
  const floor = outstanding + 1;
  const room = alive.length - floor;
  return wrongAlive.slice(0, Math.max(0, Math.min(room, wrongAlive.length)));
}

export function hintForMulti(store, set) {
  const m = ensureMulti(store, set.id);
  const rung = rungFor(m.attempts);
  if (!rung) return null;
  const hints = set.hints || [];
  if (rung === 1) return { rung: 1, text: hints[0] };
  if (rung === 2) return { rung: 2, text: hints[1] || hints[0] };
  const cut = narrowMulti(store, set);
  return { rung: 3, text: hints[2] || hints[1] || hints[0],
           struck: cut.map(o => ({ id: o.id, label: o.label, reason: o.reason })) };
}
