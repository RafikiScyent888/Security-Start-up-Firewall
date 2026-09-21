/* =====================================================================
   OBJECTIVES — TIER 1

   Six of them. Every one is COMPUTED from world state, every time it is
   asked. None of them is ticked by anything. There is no "completed"
   flag anywhere in this file, and that is deliberate:

     - a student cannot satisfy an objective by doing the right thing
       once and then undoing it
     - an objective can go BACKWARDS, which is honest, and which teaches
       that security is a state rather than an achievement
     - and the grade is the state of the network, which is the promise
       the whole build rests on

   ---------------------------------------------------------------------
   THE HINT LADDER

   Unlimited tries, unlimited hints, and NO RUNG EVER GIVES THE ANSWER.

     attempts 1–2   nothing. Let them think.
     attempt  3     rung 1 — where to look. The pane, never the thing.
     attempt  4     rung 2 — the principle that decides it, stated
                    generally, with the specific case left to them.
     attempt  5+    rung 3 — the field narrowed, a reason attached to
                    each option removed, and AT LEAST TWO LEFT ALIVE.
                    Repeats for ever.

   Rung 3 is the last rung. If a student cannot get there from two live
   options and a stated principle, that is a content problem — they need
   a better view of the mechanism above the question, not a bigger hint.

   An "attempt" is a change made to the world while an objective is
   unmet, or a press of the hint button. Both advance the ladder,
   because a student who is fiddling deserves help at the same point as
   a student who asks for it.
   ===================================================================== */

import { reachable } from "./rules.js";
import { review } from "./rules.js";
import { segmentOf } from "./world.js";
import { live } from "./verdict.js";

/* ---------------------------------------------------------------------
   THE SIX
   --------------------------------------------------------------------- */
export const TIER1 = [
  {
    id: "no-way-in",
    title: "Nothing reaches in that shouldn't",
    why: "Unsolicited traffic from the internet cannot reach a house at all unless " +
         "somebody has told the router where to send it. That is not a firewall rule — " +
         "it is whether the packet has a destination. An open forward is not one more " +
         "service; it is the single hole in an otherwise solid wall.",

    test(w) {
      return reachable(w).length === 0;
    },

    status(w) {
      const open = reachable(w);
      if (!open.length) return "Nothing on the inside is reachable from the internet.";
      return open.length + " " + (open.length === 1 ? "device is" : "devices are") +
             " reachable from the internet.";
    },

    hints: [
      "Something in this house can be reached from the internet, and it is not an accident — " +
      "somebody set it up on purpose, for a reason that made sense at the time. " +
      "The router's own settings will tell you what it has been told to deliver inward.",

      "A home router drops unsolicited traffic by default, because it has nowhere to put it. " +
      "The only way in is a translation somebody configured: this port on the outside goes to " +
      "that device on the inside. Anything configured stays configured until somebody unconfigures it. " +
      "Ask what has been told, not what is allowed.",

      (w) => {
        const open = reachable(w);
        const safe = w.devices.filter(d =>
          d.kind !== "router" && !open.some(o => o.dev.id === d.id)).slice(0, 3);
        const lines = safe.map(d => "It is not the " + d.name + " — nothing is pointed at it.");
        const live = open.map(o => o.dev.name);
        return lines.join(" ") + " That leaves " +
               (live.length > 1 ? "these: " + live.join(", ") : "what the router is still pointed at") +
               ". Something is reaching them, and you decide whether it should.";
      }
    ]
  },

  {
    id: "no-factory-passwords",
    title: "No device still uses the password it shipped with",
    why: "Default credentials are not a secret. They are printed in the manual, published " +
         "online, and identical on every unit of that model. An attacker does not brute " +
         "force them — they type them in from a list.",

    test(w) {
      return w.devices.every(d => !d.creds || !d.creds.factory);
    },

    status(w) {
      const bad = w.devices.filter(d => d.creds && d.creds.factory);
      if (!bad.length) return "Every device has been changed off its factory password.";
      return bad.length + " " + (bad.length === 1 ? "device is" : "devices are") +
             " still on the password printed in the manual.";
    },

    hints: [
      "Some of these devices have a login, and some of those logins have never been touched. " +
      "Open a device and look at its credentials — the console tells you which are still " +
      "as they came out of the box.",

      "A password that shipped with the hardware is known to everybody who owns that model " +
      "and to everybody who has read the manual online. It is not a weak password; it is a " +
      "published one. And devices that arrive in a multipack arrive with the same one.",

      (w) => {
        const bad = w.devices.filter(d => d.creds && d.creds.factory);
        const noLogin = w.devices.filter(d => !d.creds).slice(0, 2);
        const lines = noLogin.map(d => "The " + d.name + " has no login to change.");
        if (bad.length === 1) {
          lines.push("One device is still on its factory credentials. It is not the ones you have already done.");
        } else {
          lines.push("There are " + bad.length + " still on factory credentials — " +
                     "and if several arrived in one box, they share it.");
        }
        return lines.join(" ");
      }
    ]
  },

  {
    id: "cameras-cannot-reach-family",
    title: "The cameras can't reach the family's devices",
    why: "A flat network means a problem on the cheapest device on it is a problem " +
         "everywhere. Segmentation does not stop a device being compromised — it stops " +
         "a compromised device being useful.",

    /* CAMERAS AND FAMILY. The TV, the speaker and the printer are NOT in
       this test, and that is deliberate.

       Rung 3 below hands the student the argument about where the
       unpatchable IoT devices belong — "decide where each belongs and
       why". An earlier version of this test required them on the camera
       side, which meant the hint offered a choice the engine had already
       made. A student who put the TV with the family would have been
       told to think about it and then marked wrong for thinking about
       it.

       **A hint must never state as open a question the engine treats as
       closed.** The title is the contract: the cameras cannot reach the
       family's devices. */
    test(w) {
      const cams = w.devices.filter(d => d.kind === "camera");
      const family = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");
      if (!cams.length || !family.length) return false;
      const camSegs = cams.map(d => segmentOf(w, d.id));
      const famSegs = family.map(d => segmentOf(w, d.id));
      if (camSegs.some(s => !s) || famSegs.some(s => !s)) return false;
      return camSegs.every(cs => famSegs.every(fs => cs.id !== fs.id));
    },

    status(w) {
      if (!w.segments.length) return "The house is one flat network. Everything can reach everything.";

      const cams = w.devices.filter(d => d.kind === "camera");
      const family = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");
      const loose = cams.concat(family).filter(d => !segmentOf(w, d.id));
      if (loose.length) {
        return loose.length + " of the devices this objective is about " +
               (loose.length === 1 ? "is" : "are") + " still outside any segment.";
      }
      const shared = cams.some(c => family.some(f => segmentOf(w, c.id).id === segmentOf(w, f.id).id));
      if (shared) return "A camera is still sharing a segment with a device the family uses.";

      /* Where the arguable ones landed — reported, never graded. */
      const iot = w.devices.filter(d => d.kind === "iot").filter(d => {
        const s = segmentOf(w, d.id);
        return s && family.some(f => segmentOf(w, f.id).id === s.id);
      });
      return "The cameras and the family's devices are separated." +
             (iot.length
               ? " " + iot.length + " device(s) nobody can patch are on the family's side. " +
                 "That is your call — be able to say why."
               : "");
    },

    hints: [
      "Everything in this house is currently on one network, which means every device can " +
      "reach every other device directly — the router never even sees that traffic. " +
      "The map shows you what is next to what.",

      "Separation is not about trusting devices. It is about limiting what a device can " +
      "reach if it turns out you were wrong to trust it. The question to ask of each device " +
      "is not 'is this safe' but 'what could this talk to if it were not'.",

      (w) => {
        const cams = w.devices.filter(d => d.kind === "camera");
        const iot = w.devices.filter(d => d.kind === "iot");
        const fam = w.devices.filter(d => d.kind === "computer" || d.kind === "mobile");
        return "The " + fam.map(d => d.name).join(" and the ") + " hold everything worth stealing, " +
               "so they are one side of the line. The " + cams.length + " cameras cannot be patched " +
               "and cannot be logged into properly, so they are not on that side. " +
               "The " + iot.map(d => d.name).join(", ") + " are the ones people argue about — " +
               "decide where each belongs and why.";
      }
    ]
  },

  {
    id: "you-have-looked",
    title: "You know what normal looks like",
    why: "Nothing in this house will tell you it has gone wrong. There is no alert, " +
         "no banner and no warning light. The only place the truth is written is the log, " +
         "and a student who never opens it never finds out.",

    test(w) {
      return !!w.looked;
    },

    status(w) {
      return w.looked
        ? "You have read the log and you know what this house sounds like."
        : "You have not looked at the log yet.";
    },

    hints: [
      "Nothing here is going to interrupt you. Open the log and read it — " +
      "not to find something, but to find out what ordinary looks like.",

      "You cannot recognise abnormal until you know normal. Every device in this house " +
      "talks to the internet constantly and almost all of it is entirely routine. " +
      "The skill is knowing which conversations belong.",

      "Read it. That is the whole of this one — there is nothing to configure and nothing " +
      "to get wrong. The only way to fail it is not to look."
    ]
  },

  {
    id: "rules-do-what-you-think",
    title: "Your rules do what you think they do",
    why: "Rules are read top to bottom and the FIRST match decides — not the most " +
         "specific, not the strictest. Which makes rule order a security control, and " +
         "makes a broad allow above a narrow deny into something that does the opposite " +
         "of what you intended while looking perfectly reasonable.",

    test(w) {
      if (!w.firewall.rules.length) return false;
      return review(w).length === 0;
    },

    status(w) {
      if (!w.firewall.rules.length) return "There are no rules yet.";
      const notes = review(w);
      if (!notes.length) return "Every rule you have written can actually fire.";
      return notes.length + " rule(s) do not do what they appear to.";
    },

    hints: [
      "Write down what you want the firewall to do, then read your own list from the top " +
      "the way the router reads it. The review under the ruleset will tell you what it sees.",

      "First match wins. A rule is consulted only if every rule above it failed to match, " +
      "so a rule that sits below something broader is never consulted at all. " +
      "It is not wrong. It is simply never asked — which is worse, because it looks like protection.",

      (w) => {
        const notes = review(w);
        if (!notes.length) return "Write at least one rule, then read your list from the top the way the router does.";
        const shadowed = notes.filter(n => n.kind === "shadowed");
        const broad = notes.filter(n => n.kind === "broad");
        const parts = [];
        if (broad.length) parts.push("One of your rules permits everything from everywhere — everything below it is decoration.");
        if (shadowed.length) parts.push(shadowed.length + " rule(s) can never fire because something above already matches.");
        parts.push("The order is the thing to change, not the rules themselves.");
        return parts.join(" ");
      }
    ]
  },

  {
    id: "you-know-what-is-happening",
    title: "You can say what is happening in this house",
    why: "Nothing here will tell you. There is no alert, no banner and no warning light, " +
         "and there never will be, because nothing in this house is watching. So the " +
         "finding has to be yours: read the log, work out which conversations you can " +
         "account for, and commit to an answer. Being right about a quiet house counts " +
         "for exactly as much as being right about a loud one.",

    /* THIS OBJECTIVE IS THE STUDENT'S CLAIM, NOT THE ENGINE'S.

       It used to be computed — "the house is clean AND you looked" —
       and its status line read "1 device(s) are compromised". That is
       a you-have-been-compromised panel, which is the one thing this
       tier exists to prove you do not get. A student could open the
       log for a second, read nothing, and be handed the answer.

       Now the engine stays silent and the student commits. Nothing in
       `status` below discloses anything they have not established
       themselves. */
    test(w) {
      return !!(w.verdict && w.verdict.settled);
    },

    status(w) {
      const v = w.verdict || { wrong: [] };
      if (v.settled) return "You gave a verdict and it was right.";
      if (!w.looked) return "You have not opened the log, so there is nothing to give a verdict on yet.";
      if (v.wrong && v.wrong.length) {
        return "You have ruled out " + v.wrong.length + " and the board is holding them for you.";
      }
      return "You have read the log. Nothing here is going to tell you what it means.";
    },

    hints: [
      "Filter the log by one device at a time and write down every address it reaches. " +
      "Do that for all of them. You are not looking for something alarming — you are " +
      "building a list of who talks to whom.",

      "Every device here talks to the internet constantly, and almost all of it is the " +
      "product working. So 'it is sending data out' proves nothing. What you can use is " +
      "this: a device of a given kind has a place it has always talked to. The question " +
      "is never whether something is talking. It is whether you can put a name to the " +
      "address it is talking to.",

      /* Built from the board, so it narrows exactly the options that
         are still alive and never contradicts what is on screen. Every
         strike carries the reason that option is accounted for, and it
         stops with two left. */
      (w) => {
        const alive = live(w);
        if (alive.length <= 2) {
          return "You are down to " + alive.length + " and the reasons for everything else are on " +
                 "the board. This is as far as narrowing takes you — the rest is the log. " +
                 "Go back and name the addresses.";
        }
        /* Strike enough to leave two, and never the correct one. */
        const strikeable = alive.filter(o => !o.correct);
        const toStrike = strikeable.slice(0, Math.max(0, alive.length - 2));
        if (!toStrike.length) {
          return "Two are still live and both are arguable from what is in the log. Read it again " +
                 "and decide which address you cannot put a name to.";
        }
        return toStrike.map(o => "It is not " + o.label.toLowerCase() + " — " +
               o.reason.charAt(0).toLowerCase() + o.reason.slice(1)).join(" ") +
               " That leaves two. Both are still on the board, and the log settles it.";
      }
    ]
  }
];

/* ---------------------------------------------------------------------
   THE LADDER
   --------------------------------------------------------------------- */
export function makeObjectives(tier) {
  const list = tier === 1 ? TIER1 : TIER1;
  const attempts = {};               /* objective id -> count */

  const O = {
    list: list,

    /** Every objective, with its live state. Computed, never stored. */
    progress(w) {
      return list.map(o => ({
        id: o.id,
        title: o.title,
        why: o.why,
        met: !!o.test(w),
        status: o.status(w),
        attempts: attempts[o.id] || 0,
        rung: rungFor(attempts[o.id] || 0)
      }));
    },

    done(w) { return list.filter(o => o.test(w)).length; },
    total() { return list.length; },

    /** A change was made while this objective was unmet, or the student
        asked. Both advance the ladder — somebody fiddling deserves help
        at the same point as somebody who asks. */
    countAttempt(id) {
      attempts[id] = (attempts[id] || 0) + 1;
      return attempts[id];
    },

    /** The hint they are entitled to right now. Never the answer, at any
        rung, however many times it is asked. */
    hint(w, id) {
      const o = list.filter(x => x.id === id)[0];
      if (!o) return null;
      if (o.test(w)) return { rung: 0, text: "This one is already done." };

      const n = O.countAttempt(id);
      const rung = rungFor(n);
      if (rung === 0) {
        /* This sentence is a PROMISE, and verify/objectives.mjs holds it
           to it: every setting in this house has an inverse, so no
           change a student makes can strand them.

           The second half is not softening. It is true, it is the point
           of the tier, and it would be dishonest to say "nothing here
           can be broken" to somebody whose camera is already being
           beaconed out of. */
        return {
          rung: 0,
          text: "Have a go first. Every setting in this house can be changed back — " +
                "though not everything that happens while you are thinking can be undone."
        };
      }
      const h = o.hints[rung - 1];
      return { rung: rung, text: typeof h === "function" ? h(w) : h };
    },

    state() { return { attempts: Object.assign({}, attempts) }; },
    restore(st) {
      if (st && st.attempts) Object.assign(attempts, st.attempts);
      return O;
    }
  };

  return O;
}

/** attempts → rung. 1–2 nothing, 3 is rung 1, 4 is rung 2,
    5 and every attempt after that for ever is rung 3. */
export function rungFor(attempts) {
  if (attempts < 3) return 0;
  if (attempts === 3) return 1;
  if (attempts === 4) return 2;
  return 3;
}
