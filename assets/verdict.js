/* =====================================================================
   THE VERDICT — the only place the student is asked to commit

   ---------------------------------------------------------------------
   WHY THIS EXISTS AT ALL

   The sixth objective used to be computed: "the house is clean — and
   you checked", true when nothing was compromised and the student had
   opened the log. Driving the finished page exposed what that actually
   did. Its status line read **"1 device(s) are compromised"**.

   That is a you-have-been-compromised panel. It is the one thing this
   entire tier is built to prove you do not get. A student could open
   the log for one second, never read a line of it, and be told the
   answer by the objectives pane.

   So the engine says nothing, and the student says something instead.
   They read the log, they form a view, and they commit to it. The
   objective is met when their verdict is right — which is the skill,
   and which works identically whether the house was taken or not.

   ---------------------------------------------------------------------
   SIX OPTIONS. ONE CORRECT. FIVE WRONG.

   A wrong pick goes red and STAYS red until they reset it, marked
   three ways — the colour, an inset rule and a strike, and the words.
   The board is their working memory; they should not have to hold five
   eliminations in their head.

   Every wrong option is a near miss. They are the other three cameras,
   which are the same model out of the same box talking to the same
   vendor all day; the printer, which also phones a manufacturer nobody
   thinks about; and "nothing here is out of place", which is the
   honest answer in a house that was never taken and the tempting one
   in a house that was.

   No reason attached to a wrong pick ever says which option is right.
   They say why THAT one is accounted for, and the field narrows.
   ===================================================================== */

import { rng } from "./traffic.js";
import { record } from "./world.js";

export const NONE = "none";

/** Which device, if any, is talking somewhere it has no business
    talking to. Computed from the world, never stored — a second copy
    of "who is compromised" is how the board ends up disagreeing with
    the engine. */
export function answer(w) {
  const bad = w.devices.filter(d => d.compromised);
  return bad.length ? bad[0].id : NONE;
}

/* The five wrong ones. Compromised devices always make the board, or
   the correct answer would not be on it. After that: the cameras,
   because they are indistinguishable from each other; then the
   printer; then anything else with a vendor to phone. */
function candidates(w) {
  const order = [];
  const push = d => { if (d && d.kind !== "router" && order.indexOf(d) < 0) order.push(d); };
  w.devices.filter(d => d.compromised).forEach(push);
  w.devices.filter(d => d.kind === "camera").forEach(push);
  w.devices.filter(d => d.kind === "iot").forEach(push);
  w.devices.filter(d => d.kind !== "router").forEach(push);
  return order.slice(0, 5);
}

export function options(w) {
  const right = answer(w);
  /* `correct` is "is this device actually compromised", not "is this
     the one `answer` happened to name first". Scenarios are designed
     so at most one ever is — verify/scenarios.mjs proves it — but if
     that ever stopped being true, a student who picked a genuinely
     compromised device must not be told they are wrong. */
  const list = candidates(w).map(d => ({
    id: d.id,
    label: d.name,
    correct: !!d.compromised,
    reason: reasonFor(w, d)
  }));

  list.push({
    id: NONE,
    label: "Nothing here is out of place",
    correct: right === NONE,
    reason: "Every conversation in that log is one of these devices talking to somebody it has " +
            "always talked to. Before you settle on this, go device by device and write down every " +
            "address each one reaches. Then ask which of those addresses you can put a name to."
  });

  /* Deterministic shuffle. Same seed, same board, so an instructor can
     say "option four" to a room — and the correct answer is not always
     sitting in the same slot. */
  const r = rng((w.seed || 1) + 55001);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list;
}

/* Why a device is accounted for. Says what that device does and why it
   looks the way it does — never what any other device is doing. */
function reasonFor(w, d) {
  if (d.kind === "computer" || d.kind === "mobile") {
    return "Its traffic is yours — name lookups, browsing, an update service, and whatever you were " +
           "doing this evening. Everywhere it reaches is somewhere you can account for.";
  }
  if (d.kind === "camera") {
    return "It has talked to " + d.vendor + " and nothing else, every two minutes, since long " +
           "before you sat down — the same address all four of them use, because they are the same " +
           "model out of the same box. Constant traffic from a camera is the product working.";
  }
  if (d.id === "printer") {
    return "It shouts at the local network every few minutes so phones and laptops can find it, " +
           "and it asks its manufacturer about firmware nobody will ever install. Noisy, pointless, " +
           "and exactly what it has always done.";
  }
  if (d.kind === "iot") {
    return "It talks to its manufacturer constantly. That is not a fault, it is the product — and " +
           "it is the same manufacturer, on the same port, as it was an hour ago.";
  }
  if (d.kind === "mobile") {
    return "It leaves the house every morning and comes back. Its traffic is yours, and it is only " +
           "here for some of the day, which is why its address keeps changing.";
  }
  return "Its traffic is yours — name lookups, browsing, and an update service. Nothing it reaches " +
         "is anywhere you cannot account for.";
}

/* ---------------------------------------------------------------------
   PICKING

   Unlimited tries. Nothing ever locks them out, a wrong pick is
   remembered so the board stays struck, and the exercise can be reset
   back to a clean board whenever they want to start the reasoning
   again.
   --------------------------------------------------------------------- */
export function ensure(w) {
  if (!w.verdict) w.verdict = { wrong: [], settled: false };
  if (!w.verdict.wrong) w.verdict.wrong = [];
  return w.verdict;
}

export function settled(w) { return !!ensure(w).settled; }
export function struck(w) { return ensure(w).wrong.slice(); }

export function pick(w, id) {
  const v = ensure(w);
  if (v.settled) return { ok: true, msg: "You have already settled this one.", correct: true };
  const opt = options(w).filter(o => o.id === id)[0];
  if (!opt) return { ok: false, msg: "That is not one of the options." };
  if (v.wrong.indexOf(id) >= 0) {
    return { ok: false, msg: "You have already ruled that one out, and the reason is still on the board." };
  }

  if (opt.correct) {
    v.settled = true;
    record(w, "verdict.correct", "named " + opt.label, "read the log and accounted for what leaves the house");
    return {
      ok: true, correct: true,
      msg: id === NONE
        ? "Right. Nothing in this house is talking anywhere it should not be — and you know that " +
          "because you checked, not because anything told you."
        : "Right. And notice what did NOT happen: nothing warned you, nothing turned red, and " +
          "nothing would have. Closing the door it came through stops the next one getting in and " +
          "does nothing about this one."
    };
  }

  v.wrong.push(id);
  record(w, "verdict.wrong", "ruled out " + opt.label, "");
  return { ok: true, correct: false, msg: opt.label + " is ruled out. " + opt.reason };
}

/** Back to a clean board. Nothing else in the world is touched — a
    student resetting their reasoning has not un-hardened the network,
    and must not be made to redo work they got right. */
export function reset(w) {
  const v = ensure(w);
  v.wrong = [];
  v.settled = false;
  record(w, "verdict.reset", "the board was cleared", "starting the reasoning again");
  return { ok: true, msg: "Cleared. Nothing you configured has changed — only your working out." };
}

/** The options still alive, for the hint ladder. Never fewer than two
    while the question is open, because the last rung narrows the field
    and must never narrow it to one. */
export function live(w) {
  const out = struck(w);
  return options(w).filter(o => out.indexOf(o.id) < 0);
}
