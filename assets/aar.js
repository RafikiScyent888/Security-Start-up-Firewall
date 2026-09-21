/* =====================================================================
   THE AAR

   Not "the final report". An **After Action Review**, because that is
   what it is and because every veteran in the room has sat in one.
   Four questions, no rank, no blame:

     what was supposed to happen · what actually happened · why the
     difference · what do we sustain and what do we improve

   That format already is how a security incident review works, which
   is the programme's whole pitch landing one more time: your MOS
   transfers. It also solves the grading problem for free, because the
   fourth question is sustain-and-improve rather than a mark out of ten.

   ---------------------------------------------------------------------
   IT RUNS, AND IT DISCLOSES NOTHING

   The AAR is open from the first minute of Tier 1. It contains **what
   the student has done and what they have already established** — their
   changes, their reasons, their verdicts, their closed findings.

   It never contains what the engine knows and they do not. A running
   AAR that named tonight's compromise would be the alert this whole
   build exists to prove you do not get, with a clipboard.

   ---------------------------------------------------------------------
   NOBODY FAILS

   There is no grade, no letter, no percentage, and no failure
   language anywhere in this file. Two things sit side by side
   instead: **where the business ended up**, and **which exam domains
   were actually exercised**. The second is the genuinely useful number
   before a test, and it is coverage rather than score.

   A run that went badly is written up as what it cost and what would
   have prevented it, in the AAR's own voice, and it points at keeping
   the business afloat. These are people learning this for the first
   time.

   ---------------------------------------------------------------------
   HALF OF IT IS THEIRS

   Every tier has a box the student writes in. Their words are what
   they will defend in class, and it is the difference between a report
   about them and a report by them.
   ===================================================================== */

import { esc } from "./map.js";
import { reachable, review } from "./rules.js";
import { segmentOf } from "./world.js";
import { clockOf } from "./traffic.js";
import { scenario } from "./scenarios.js";
import { settled, struck, answer, NONE } from "./verdict.js";
import { LABELS, BITES, DOMAINS } from "./debrief.js";
import * as C from "./campaign.js";

const TIERS = [
  { n: 1, name: "The house", sub: "Home network only. The guard is the firewall." },
  { n: 2, name: "The business starts", sub: "Six months on. The same house, and a client's data in it." },
  { n: 3, name: "Growth", sub: "Eighteen months. Three hires, three clients, and other people's mistakes." },
  { n: 4, name: "The office", sub: "Two years. A building, field techs, six remote, and regulated data." },
  { n: 5, name: "The SOC", sub: "Three years. A team, and somebody in it who should not be." }
];

/* =====================================================================
   WHAT THEY DID — good, bad and ugly

   Three honest angles on ONE run, which is what was asked for. Not
   three alternative paths shown side by side: what they actually did,
   looked at three ways.

   Everything here is computed from the world and the record. Nothing
   is a stored score.
   ===================================================================== */
export function assess(w, c) {
  const good = [], bad = [], ugly = [];
  const open = reachable(w);
  const factory = w.devices.filter(d => d.creds && (d.creds.factory || d.creds.reused));
  const taken = w.devices.filter(d => d.compromised);
  const hist = w.history || [];
  const closedAt = hist.filter(h => h.what === "forward.closed").map(h => h.t);
  const brokeAt = taken.length ? (taken[0].compromisedAt || 0) : null;

  /* --- the way in ------------------------------------------------- */
  if (!open.length && brokeAt != null && closedAt.some(t => t < brokeAt)) {
    good.push("You closed the way in before anybody came through it. That is prevention, and it is " +
              "the only one of these that stops the story before it starts.");
  } else if (!open.length && brokeAt != null) {
    bad.push("You closed the way in, and you closed it late. It stops the next arrival and does " +
             "nothing about the one already inside — which is the difference between containment " +
             "and prevention, and it is the most expensive sentence in this tier.");
  } else if (!open.length) {
    good.push("Nothing on the inside is reachable from the internet. An unsolicited packet arriving " +
              "here now has no host it belongs to, so it is undeliverable rather than denied.");
  } else {
    ugly.push(open.length + " " + (open.length === 1 ? "device is" : "devices are") +
              " still reachable from the internet. Whatever else was done, that hole is what the " +
              "next six months walk through.");
  }

  /* --- credentials ------------------------------------------------- */
  if (!factory.length) {
    good.push("No device is still on a password that somebody can look up. A published credential " +
              "is not a weak password, it is a known one, and the attack against it is typing.");
  } else if (factory.length <= 2) {
    bad.push(factory.length + " " + (factory.length === 1 ? "device is" : "devices are") +
             " still on a credential that is on a list somewhere. Most of them were done, which is " +
             "the part worth keeping; the ones left are the ones that get used.");
  } else {
    ugly.push(factory.length + " devices are still on credentials that are published or reused. " +
              "Fixing one of a set changes nothing when they all share it.");
  }

  /* --- segmentation ------------------------------------------------ */
  const cams = w.devices.filter(d => d.kind === "camera");
  const fam = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");
  const split = cams.length && fam.length &&
    cams.every(cm => segmentOf(w, cm.id)) && fam.every(f => segmentOf(w, f.id)) &&
    cams.every(cm => fam.every(f => segmentOf(w, cm.id).id !== segmentOf(w, f.id).id));
  if (split) {
    good.push("The cameras cannot reach the family's devices. That does not stop one being taken — " +
              "it stops a taken one being useful, which is the whole of what segmentation buys.");
  } else if (w.segments.length) {
    bad.push("Segments were drawn and the line does not hold yet: something the household relies on " +
             "is still reachable from something nobody can patch.");
  } else {
    bad.push("The house is still one flat network. Every device can reach every other device " +
             "directly, the switch handles it, and the firewall never sees the packet — so the " +
             "firewall cannot stop any of it.");
  }

  /* --- looking ----------------------------------------------------- */
  if (w.looked) {
    good.push("You opened the log. Nothing in this house was ever going to interrupt you, and the " +
              "only reason you know anything at all is that you went and looked.");
  } else {
    ugly.push("The log was never opened. Nothing here announces itself, so not looking is the same " +
              "as not knowing — and it is the habit rather than the evening that matters.");
  }

  /* --- the ruleset -------------------------------------------------- */
  const notes = review(w);
  if (w.firewall.rules.length && !notes.length) {
    good.push("Every rule you wrote can actually fire. Nothing above any of them was already " +
              "catching what they were written for.");
  } else if (notes.length) {
    bad.push(notes.length + " of your rules cannot do what they look like they do. A rule that is " +
             "never consulted is worse than no rule, because it looks like protection.");
  }

  /* --- the verdict -------------------------------------------------- */
  const wrong = struck(w).length;
  if (settled(w) && !wrong) {
    good.push("You named it first time, from the log, with nothing pointing at it.");
  } else if (settled(w)) {
    good.push("You worked it out by elimination — " + wrong + " ruled out with a reason before you " +
              "settled. That is the job; the board was doing the remembering so you did not have to.");
  } else {
    bad.push("No verdict was given. Reading the log is half of it; committing to what it means is " +
             "the half that people find hard, and it is the half a SOC pays for.");
  }

  /* --- the things that only show up in the history ------------------ */
  if (hist.some(h => h.what === "device.factoryReset" && /still compromised/.test(h.why || ""))) {
    ugly.push("A device that was already taken got factory reset. It came back on the password " +
              "printed in the manual and whoever was inside it never left. A reset is not a cleanup.");
  }
  if (c && C.countOf(c, 1, "campaign.restored")) {
    bad.push("A saved copy was loaded back in during this tier. That is recovery and it is allowed " +
             "— it is in here because an AAR that tidies up is worth nothing.");
  }

  return { good: good, bad: bad, ugly: ugly };
}

/* =====================================================================
   DOMAIN COVERAGE — the half of the side-by-side that is useful
   before an exam
   ===================================================================== */
export function coverage(prog) {
  const out = DOMAINS.map(d => ({ domain: d, exercised: 0, total: 0 }));
  prog.forEach(p => {
    (LABELS[p.id] || []).forEach(label => {
      const dom = out.filter(x => label.indexOf(x.domain) === 0)[0];
      if (!dom) return;
      dom.total += 1;
      if (p.met) dom.exercised += 1;
    });
  });
  return out;
}

/* =====================================================================
   THE DOCUMENT
   ===================================================================== */
/** The first sentence of a finding, for the roll-up. The full one
    with its reasoning is in the tier section; here it only has to be
    recognisable. */
function firstSentence(t) {
  const m = /^(.+?[.!?])(\s|$)/.exec(String(t));
  return m ? m[1] : String(t);
}

function when(ms) {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}

export function render(opts) {
  const w = opts.world, c = opts.campaign, o = opts.objectives;
  const forPrint = !!opts.standalone;
  const instructor = !!opts.instructor;

  const prog = o.progress(w);
  const done = prog.filter(p => p.met).length;
  const here = scenario(w.scenario);
  const bits = [];

  /* --- the front matter -------------------------------------------- */
  /* The saved file's own shell already carries the title, and a
     document that says its own name twice in the first inch reads as
     something nobody proofread. */
  if (!forPrint) bits.push(`<h2>After Action Review</h2>`);
  bits.push(`<div class="card" style="background:var(--surface-2)">
    <p><strong>${esc(c.student.name || "Unnamed")}</strong></p>
    <p class="lede">Started ${esc(when(c.student.startedAt))} &middot;
      ${c.student.completedAt ? "Completed " + esc(when(c.student.completedAt))
                              : "In progress, as at " + esc(when(Date.now()))}<br>
      Tier 1 &middot; ${esc(here.name)} &middot; seed <span class="mono">${esc(String(w.seed))}</span>
      &middot; attempt ${C.attemptOf(c, 1) || 1}</p>
  </div>`);

  if (!forPrint) {
    bits.push(`<form class="log-controls" data-form="aar-name">
      <label class="sr-only" for="aar-name">Your name</label>
      <input id="aar-name" name="name" type="text" value="${esc(c.student.name)}"
             placeholder="Your name, for the top of this document" style="flex:1 1 16rem">
      <button class="btn-primary" type="submit">Save it</button>
    </form>`);
  }

  /* --- the four questions ------------------------------------------ */
  bits.push(`<p>This is an After Action Review, in the format you already know. Four questions, and
    nobody in the room outranks anybody:</p>
  <ol>
    <li>What was supposed to happen</li>
    <li>What actually happened</li>
    <li>Why there was a difference</li>
    <li>What we sustain, and what we improve</li>
  </ol>
  <p class="lede">There is no grade in this document and there is no pass mark. What is here instead
    is where the business ended up and which parts of the exam you actually exercised.</p>`);

  /* --- SIDE BY SIDE ------------------------------------------------- */
  bits.push(`<h3>Where it stands</h3>`);
  bits.push(`<div class="grid two">`);

  /* left: the business */
  const open = reachable(w);
  const taken = w.devices.filter(d => d.compromised);
  bits.push(`<div class="card">
    <h3 style="margin-top:0">The business</h3>
    <p class="lede">There is no business yet — Tier 1 is the house you will start it in. What
      matters here is the state of the network you hand forward.</p>
    <ul>
      <li>${done} of ${prog.length} objectives met at the state the network is in now</li>
      <li>${open.length ? esc(open.length + " way(s) in from the internet, still open")
                        : "Nothing reachable from the internet"}</li>
      <li>${settled(w)
             ? (taken.length ? "A device is carrying a foothold into Tier 2"
                             : "Nothing in the house is compromised, and you established that")
             : "No verdict given yet, so the state of the house is still an open question"}</li>
    </ul>
  </div>`);

  /* right: coverage */
  const cov = coverage(prog);
  bits.push(`<div class="card">
    <h3 style="margin-top:0">Exam coverage</h3>
    <p class="lede">Which parts of the certification you actually exercised, at domain and bullet
      level. Coverage, not a score.</p>
    <ul>${cov.map(d => `<li><strong>${esc(d.domain)}</strong> — ${d.exercised} of ${d.total}
      ${d.total === 1 ? "bullet" : "bullets"} exercised${d.exercised === 0 ? " <em>(not touched)</em>" : ""}</li>`).join("")}</ul>
  </div>`);
  bits.push(`</div>`);

  /* --- THE SPINE ---------------------------------------------------- */
  bits.push(`<h3>The spine, start to finish</h3>`);

  TIERS.forEach(t => {
    if (t.n !== 1) {
      /* Said plainly, as asked. Not hidden, not dressed up. */
      bits.push(`<div class="objective" data-met="false">
        <div class="head"><span class="state">not reached</span>
          <span class="title">Tier ${t.n} — ${esc(t.name)}</span></div>
        <p class="status">${esc(t.sub)}</p>
        <p class="why">Not reached. Nothing here is a mark against anybody — it is the road ahead.</p>
      </div>`);
      return;
    }
    bits.push(tierOne(w, c, o, prog, forPrint));
  });

  /* --- money, as stated averages ------------------------------------ */
  bits.push(moneySection());

  /* --- question four: sustain and improve ---------------------------
     A ROLL-UP, NOT A REPRINT. The tier sections above already carry
     the good, the bad and the ugly in full. Repeating them verbatim
     at the end made the document say everything twice, which is the
     fastest way to have a reader stop believing any of it.

     So this is the short version: what to keep doing, what to change,
     capped, and pointed forward. It is the last thing anybody reads
     and it should fit on one screen. */
  bits.push(`<h3>Sustain and improve</h3>`);
  const a = assess(w, c);
  const top = (list, n) => list.slice(0, n).map(x => `<li>${esc(firstSentence(x))}</li>`).join("");

  bits.push(`<p class="lede">Drawn from the tiers above, shortest first. The full account of each
    one is in its own section.</p>`);
  bits.push(`<p><strong>Sustain.</strong></p><ul>${
    a.good.length ? top(a.good, 3)
                  : "<li>Nothing to keep yet — come back once you have changed something.</li>"}</ul>`);

  const work = a.ugly.concat(a.bad);
  bits.push(`<p><strong>Improve.</strong></p><ul>${
    work.length ? top(work, 4)
                : "<li>Nothing outstanding. That is a real result and it is rarer than you would think.</li>"}</ul>`);
  if (work.length > 4) {
    bits.push(`<p class="lede">${work.length - 4} more in the tier sections above.</p>`);
  }
  bits.push(`<p>Nothing here is a mark against anybody. The business is still standing and the next
    tier starts from wherever you left this one — which is the whole reason to run a house twice.</p>`);

  bits.push(nextSteps(w, c, prog, forPrint));

  if (instructor) bits.push(instructorSection(w, c, o, prog));

  /* --- the disclaimers a reviewer will look for ---------------------- */
  bits.push(disclaimers());

  return bits.join("\n");
}

/* =====================================================================
   THE GATE — what happens when a tier is finished with

   Settled long ago: **a tier completes at 6 of 6, and at 5 of 6 they
   may move on** with the build explaining what they left and how it
   bites later.

   Neither of those was anywhere in the interface. A student who
   reached six of six was told "Tier 1 complete" and then given
   nothing — a dead end at the exact moment they succeeded, which is
   the worst place in the whole build to put one.

   ---------------------------------------------------------------------
   AND IT DOES NOT PRETEND TIER 2 EXISTS

   Tier 2 is designed and not built. So there is no button for it,
   because a button that does nothing is worse than no button: it
   teaches a student that this thing lies to them, and then they have
   no reason to believe the parts that do not.

   What is here instead is the honest version — what Tier 2 will be,
   what they are carrying into it, and the things they genuinely can
   do now.
   ===================================================================== */
function nextSteps(w, c, prog, forPrint) {
  const done = prog.filter(p => p.met).length;
  const total = prog.length;
  const missed = prog.filter(p => !p.met);
  const taken = w.devices.filter(d => d.compromised);
  const bits = [];

  bits.push(`<h3>What happens next</h3>`);

  if (done === total) {
    bits.push(`<div class="msg" role="status"><strong>Tier 1 is complete.</strong> Six of six, and the
      last one you established yourself rather than being told.</div>`);
  } else if (done === total - 1) {
    bits.push(`<div class="note"><strong>Five of six — you may move on.</strong> That is a deliberate
      rule rather than a mercy: in a real job you move on with things outstanding, and knowing which
      bill is coming is worth more than a clean sheet you got by grinding.</div>`);
  } else {
    bits.push(`<p>${done} of ${total}. The tier is not finished, and nothing is lost or locked —
      carry on whenever you like. What is left is listed above with what each one costs later.</p>`);
  }

  if (missed.length && done >= total - 1) {
    bits.push(`<p><strong>What you are carrying into Tier 2:</strong></p>
      <ul>${missed.map(p => `<li><strong>${esc(p.title)}</strong> — ${esc(BITES[p.id] || "")}</li>`).join("")}</ul>`);
  }
  /* ONLY AFTER THEY HAVE COMMITTED. This section named the taken
     device before the verdict in its first version, and the checks
     caught it in the same minute — which is the whole reason they
     compare the two worlds word for word and pixel for pixel. A
     "what happens next" panel is exactly where a leak like this hides,
     because it reads as forward-looking rather than as a finding. */
  if (settled(w) && taken.length) {
    bits.push(`<div class="note"><strong>And a foothold.</strong> The ${esc(taken[0].name)} goes into
      Tier 2 still compromised. For six months there is nothing on this network worth taking — and
      then a business starts, and there is.</div>`);
  }

  /* --- Tier 2, honestly ------------------------------------------- */
  bits.push(`<h3>Tier 2 — the business starts</h3>`);
  bits.push(`<p class="lede"><strong>Not built yet.</strong> It is designed in full and there is
    nothing to play. Rather than a button that does nothing, here is what it is:</p>`);
  bits.push(`<p>Six months on. The same house, the same network, the same laptop — and a first client,
    so for the first time there is something here worth taking. You draw the line between the business
    and the personal, which is the exact rule an employee breaks two tiers later. Three things happen:
    the camera from tonight, a lookalike email, and ransomware. They are connected.</p>`);

  /* --- what they can actually do now ------------------------------- */
  if (!forPrint) {
    bits.push(`<h3>What you can do now</h3>
      <ul>
        <li><strong>Play another of the six houses.</strong> Same lesson, a different fault, and the
          verdict is a different answer each time. They are listed on the Objectives pane.</li>
        <li><strong>Run this one again on a new seed</strong> — same house, different traffic, and you
          already know what to look for. That is brushing up, not starting over.</li>
        <li><strong>Save a copy.</strong> It is this document and it is your way back in. Do it at the
          end of every tier, because clearing your browser deletes everything else.</li>
      </ul>
      <p><button type="button" class="btn-primary" data-save-copy>Save a copy</button>
         <button type="button" data-go="objectives">Pick another house</button></p>`);
  }

  return bits.join("\n");
}

/* ---------------------------------------------------------------------
   TIER 1'S SECTION — the old debrief, folded in
   --------------------------------------------------------------------- */
function tierOne(w, c, o, prog, forPrint) {
  const done = prog.filter(p => p.met).length;
  const here = scenario(w.scenario);
  const taken = w.devices.filter(d => d.compromised);
  const open = reachable(w);
  const a = assess(w, c);
  const bits = [];

  bits.push(`<div class="objective" data-met="${done === prog.length}">
    <div class="head">
      <span class="state">${done === prog.length ? "complete" : done + " of " + prog.length}</span>
      <span class="title">Tier 1 — The house &middot; ${esc(here.name)}</span>
    </div>
    <p class="status">${esc(here.blurb)}</p>`);

  /* WHAT ACTUALLY HAPPENED — only once they have committed. Before
     that this section is about what they DID, never what is true. */
  if (settled(w)) {
    if (taken.length) {
      const t = taken[0];
      const c1 = t.compromisedAt ? clockOf(t.compromisedAt) : null;
      bits.push(`<p><strong>What actually happened.</strong> The ${esc(t.name)} was taken` +
        (c1 && t.compromisedAt ? ` at ${esc(c1.time)} on day ${c1.day}` : `, before you arrived`) +
        `. Somebody reached it from the internet and logged in with a credential they did not have
        to guess. It has been talking to an address no device in this house had ever used since.</p>`);
      if (!open.length) {
        bits.push(`<p><strong>Why there was a difference.</strong> The hole is shut now, and it is
          still talking. Closing a hole stops the <em>next</em> arrival and does nothing about the
          one already inside.</p>`);
      }
    } else {
      bits.push(`<p><strong>What actually happened.</strong> Nothing in this house was taken — and
        the only reason you know that is that you checked. Nothing would have told you either way.</p>`);
    }
  } else {
    bits.push(`<p><strong>What actually happened.</strong> Still open. Give a verdict on the log and
      this section fills in — saying it before you have committed would be handing you the answer.</p>`);
  }

  /* GOOD, BAD AND UGLY — three angles on the one run. */
  bits.push(`<p><strong>How it was handled.</strong></p>`);
  [["The good", a.good, "green"], ["The bad", a.bad, "yellow"], ["The ugly", a.ugly, "red"]]
    .forEach(([label, list]) => {
      bits.push(`<p style="margin-bottom:.2em"><strong>${label}</strong></p>`);
      bits.push(list.length
        ? `<ul>${list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`
        : `<p class="lede">Nothing under this heading, which is worth noticing either way.</p>`);
    });

  /* THE OBJECTIVES, NAMED. */
  bits.push(`<p><strong>What you were actually learning.</strong> Every one of these is on the exam,
    and you have been doing them all evening under different words.</p>`);
  prog.forEach(p => {
    bits.push(`<p style="margin-bottom:.2em"><strong>${p.met ? "✓" : "—"} ${esc(p.title)}</strong></p>`);
    bits.push(`<ul>${(LABELS[p.id] || []).map(l => `<li>${esc(l)}</li>`).join("")}</ul>`);
    if (!p.met && BITES[p.id]) {
      bits.push(`<p class="why"><strong>Left open.</strong> ${esc(BITES[p.id])}</p>`);
    }
  });

  /* THEIR HALF. */
  const mine = C.getNotes(c, 1, "tier");
  bits.push(`<p><strong>Your own account.</strong> What you thought at the time, and what you would
    do differently. This is the half of the review that is yours, and it is the part you will be
    asked about in class.</p>`);
  if (forPrint) {
    bits.push(mine ? `<blockquote>${esc(mine)}</blockquote>`
                   : `<p class="lede">[left blank]</p>`);
  } else {
    bits.push(`<form data-form="aar-note" data-tier="1" data-key="tier">
      <label class="sr-only" for="note-1">Your account of Tier 1</label>
      <textarea id="note-1" name="text" rows="6" style="width:100%;font:inherit;color:var(--ink);
        background:var(--surface-2);border:1px solid var(--edge);border-radius:var(--round);
        padding:.6rem">${esc(mine)}</textarea>
      <button class="btn-primary" type="submit">Save my account</button>
    </form>`);
  }

  bits.push(`</div>`);
  return bits.join("\n");
}

/* ---------------------------------------------------------------------
   MONEY — stated averages, so the shape of the business is understood

   Not a running balance and not a scoreboard. General facts, clearly
   marked as illustrative, so that "we could not afford it yet" is a
   real constraint rather than a line of dialogue.
   --------------------------------------------------------------------- */
function moneySection() {
  return `<h3>What this costs in the real world</h3>
  <p>None of this is your balance — there is no business yet. These are the ordinary numbers for a
    firm of the size you are about to build, so that later on, when something is too expensive, you
    know what too expensive means.</p>
  <ul>
    <li><strong>What a small managed-service firm bills.</strong> Break-fix work runs roughly
      $95–150 an hour. Managed contracts run a few thousand a month for a ten-to-thirty device
      client. Five clients of that size is somewhere near $10,000 a month.</li>
    <li><strong>Where the money actually is.</strong> Hardware resale turns over the largest number
      and keeps the smallest slice — thirty laptops bought at $1,200 and sold at $1,350 is $40,500
      of revenue and $4,500 of margin. Reselling cloud is similar. <strong>The recurring managed
      work is the smallest number on the page and the profitable one</strong>, which surprises
      nearly everybody.</li>
    <li><strong>Staff.</strong> The rule of thumb is $150–200k of revenue per employee. That is why
      a twelve-person firm cannot be run on $120,000 a year, and why the business has to grow
      before the headcount can.</li>
    <li><strong>What incidents cost.</strong> A business email compromise of the ordinary kind takes
      $20–40k out of somebody. Outside forensics is $10–30k, breach counsel $5–15k. A regulated
      breach at a firm this size reaches six figures once notification and a settlement are in.</li>
    <li><strong>What the controls cost.</strong> The ones that would have stopped most of the above
      cost nothing: turning on an alert, changing a password, closing a port, reading a log. The
      expensive controls are rarely the ones that save you.</li>
  </ul>
  <p class="lede">Illustrative ranges, built from the shape of real pricing and real enforcement.
    Not quotations, and not predictions.</p>`;
}

/* ---------------------------------------------------------------------
   THE INSTRUCTOR'S HALF — behind the PIN

   The student's document is an AAR. This is the marking sheet, and the
   seminar notes.
   --------------------------------------------------------------------- */
function instructorSection(w, c, o, prog) {
  const bits = [];
  bits.push(`<h3>Instructor view</h3>`);
  bits.push(`<div class="instructor"><p>Not part of the student's document. Behind the PIN because
    it contains the decision trail and the questions to put to them, not because anything here
    would do harm in front of them.</p></div>`);

  /* The decision trail. */
  bits.push(`<h3>Decision trail</h3>`);
  const hist = (w.history || []).slice();
  if (!hist.length) {
    bits.push(`<p class="lede">Nothing changed yet.</p>`);
  } else {
    bits.push(`<table class="log"><thead><tr><th scope="col">When</th><th scope="col">What</th>
      <th scope="col">Their reason</th></tr></thead><tbody>`);
    hist.forEach(h => {
      const k = clockOf(h.t);
      bits.push(`<tr><td class="t" data-label="When">d${k.day} ${esc(k.time)}</td>
        <td data-label="What">${esc(h.detail)}</td>
        <td data-label="Their reason"><span class="why">${esc(h.why || "—")}</span></td></tr>`);
    });
    bits.push(`</tbody></table>`);
  }

  /* How much help they needed, and where. */
  bits.push(`<h3>Where they needed help</h3>`);
  const rungs = prog.map(p => `<li>${esc(p.title)} — ${p.attempts} attempt(s), reached rung ${p.rung} of 3</li>`);
  bits.push(`<ul>${rungs.join("")}</ul>`);
  bits.push(`<p class="lede">Rung 3 repeating is not a problem. A student sitting on rung 3 for a
    long time on one objective and rung 0 on the rest is telling you exactly which mechanism they
    have not got yet.</p>`);

  /* THE SEMINAR. Generated from this run, not generic. */
  bits.push(`<h3>Questions to put to them</h3>`);
  const qs = prompts(w, c, prog);
  bits.push(`<ol>${qs.map(q => `<li>${esc(q)}</li>`).join("")}</ol>`);
  bits.push(`<p class="lede">Generated from what this student actually did. Two students will not
    get the same list, which is what makes the comparison in class worth having.</p>`);

  return bits.join("\n");
}

/** Discussion prompts, built from this run. Open questions — none of
    them has a one-word answer, and none of them can be answered by
    somebody who was not paying attention. */
export function prompts(w, c, prog) {
  const out = [];
  const open = reachable(w);
  const taken = w.devices.filter(d => d.compromised);
  const hist = w.history || [];
  const closedAt = hist.filter(h => h.what === "forward.closed").map(h => h.t);
  const credAt = hist.filter(h => h.what === "creds.changed").map(h => h.t);
  const brokeAt = taken.length ? (taken[0].compromisedAt || 0) : null;

  if (closedAt.length && credAt.length && Math.min(...closedAt) < Math.min(...credAt)) {
    out.push("You closed the port forward before you changed any password. Talk us through why that " +
             "order — and would it have mattered the other way round?");
  } else if (credAt.length && closedAt.length) {
    out.push("You changed a password before you closed the way in. What were you protecting against " +
             "in those minutes, and what were you still exposed to?");
  }
  if (brokeAt != null && closedAt.some(t => t > brokeAt)) {
    out.push("The house was already taken when you closed the hole. What did closing it actually " +
             "achieve, and what did it not?");
  }
  if (!open.length && brokeAt == null) {
    out.push("Nothing got in. Convince the room that was your doing rather than luck — what would " +
             "you point at?");
  }
  if (!w.segments.length) {
    out.push("You did not segment anything. Make the case for leaving a house flat — there is a real " +
             "one, and then tell us what it costs.");
  } else {
    out.push("Where did you draw the line between the cameras and everything else, and which device " +
             "was the argument?");
  }
  if (struck(w).length >= 3) {
    out.push("You ruled out " + struck(w).length + " before you settled. Which elimination were you " +
             "least sure about, and what would have made you sure?");
  }
  if (settled(w) && answer(w) === NONE) {
    out.push("You said nothing was out of place, and you were right. How long did it take you to be " +
             "comfortable saying that, and what would it take to say it at work?");
  }
  if (!w.looked) {
    out.push("You never opened the log. What were you going on instead — and what would have had to " +
             "happen for you to go and look?");
  }
  const stuck = prog.filter(p => p.rung >= 3);
  if (stuck.length) {
    out.push("You went to the last hint on " + stuck.map(p => '"' + p.title + '"').join(" and ") +
             ". What was the sentence that finally made it click, and what should have been said sooner?");
  }
  out.push("Nothing in this house warned you about anything all evening. What would you have had to " +
           "build for it to warn you, and what would that have cost?");
  return out;
}

/* ---------------------------------------------------------------------
   THE DISCLAIMERS

   On the page, not in a footnote. A peer reviewer looks for exactly
   these four and their absence is what gets a document sent back.
   --------------------------------------------------------------------- */
function disclaimers() {
  return `<h3>About this document</h3>
  <div class="note">
    <p>Objectives are labelled at <strong>domain and bullet level</strong> against the SY0-701 text
      supplied by the instructor. No official sub-objective numbers are claimed.</p>
    <p>Costs are <strong>illustrative ranges</strong> built from the shape of real pricing and real
      enforcement. They are not quotations and not predictions.</p>
    <p>Regulatory and contractual content is <strong>general education, not legal advice</strong>.</p>
    <p>This describes performance in a simulation. It is <strong>not a statement of certification
      readiness</strong> and does not predict an exam result.</p>
  </div>
  <p class="lede">Cyber Warrior Program — built by an instructor, for students, to make certification
    study more interactive. For educational purposes only. Not affiliated with, endorsed by, or
    sponsored by CompTIA®. All trademarks belong to their respective owners.</p>`;
}

/* =====================================================================
   SAVE A COPY

   One HTML file that is both the document and the restore point. It
   opens by double-clicking, offline, and it still honours the reading
   accommodations — which a PDF cannot, because a PDF freezes the type
   size and the colours at the moment it was made.

   When a PDF is wanted, Ctrl-P from this file produces a good one,
   because the print stylesheet travels inside it.

   **It is the save, and it is not for emailing.** An HTML attachment
   is a standard phishing delivery method and a security professional
   is right to hesitate over one. The PDF is the thing that gets sent.
   ===================================================================== */
export function standalone(opts) {
  const body = render(Object.assign({}, opts, { standalone: true, instructor: false }));
  const c = opts.campaign;
  const css = liveStylesheet();
  const payload = JSON.stringify({ campaign: c, world: opts.world, saved: Date.now() })
    .replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en" data-theme="${esc(document.documentElement.getAttribute("data-theme") || "dark")}"
      data-dyslexia="${esc(document.documentElement.getAttribute("data-dyslexia") || "off")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AAR — ${esc(c.student.name || "Cyber Warrior Program")}</title>
<style>${css}</style>
</head>
<body>
<div class="shell">
<header class="topbar">
  <h1>After Action Review</h1>
  <span class="tier">Cyber Warrior Program</span>
  <div class="switches">
    <button type="button" onclick="document.documentElement.setAttribute('data-theme',
      document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')">Switch theme</button>
    <button type="button" onclick="document.documentElement.setAttribute('data-dyslexia',
      document.documentElement.getAttribute('data-dyslexia')==='on'?'off':'on')">Easier reading</button>
    <button type="button" onclick="window.print()">Save as PDF</button>
  </div>
</header>
<main>${body}</main>
<footer class="site-footer">
  <p><strong>This file is your save as well as your report.</strong> Keep it. Loading it back into
    the simulation returns you to the start of the tier you had finished — which is what it is for
    if this browser ever loses its data.</p>
  <p>To hand it in, press <strong>Save as PDF</strong> above, or Ctrl-P. Send the PDF rather than
    this file: an HTML attachment is a standard phishing delivery method and a security professional
    is right to be wary of one.</p>
</footer>
</div>
<script type="application/json" id="cwp-campaign">${payload}</script>
</body>
</html>`;
}

/** Our own stylesheet, read back out of the document. Same origin, so
    no fetch and nothing to go wrong offline — and no second copy of
    the palette to drift out of step with the first. */
function liveStylesheet() {
  const out = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    let rules;
    try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }
    if (!rules) continue;
    for (let j = 0; j < rules.length; j++) out.push(rules[j].cssText);
  }
  return out.join("\n");
}

/** Pull a campaign back out of a saved file. Recovery only — it
    returns you to the start of a tier you had already finished, never
    to five minutes ago. */
export function readSaved(text) {
  const m = /<script type="application\/json" id="cwp-campaign">([\s\S]*?)<\/script>/.exec(text);
  if (!m) return null;
  let data;
  try { data = JSON.parse(m[1].replace(/\\u003c/g, "<")); } catch (e) { return null; }
  if (!data || !data.campaign) return null;
  const c = C.adopt(data.campaign);
  return c ? { campaign: c, world: data.world || null } : null;
}
