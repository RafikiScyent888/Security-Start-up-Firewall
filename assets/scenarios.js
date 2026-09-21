/* =====================================================================
   THE SCENARIOS — six houses, one lesson, six different faults

   The standing rule: every time something new is added, five more
   scenarios go on top of what is already built. This is that five,
   plus the original.

   ---------------------------------------------------------------------
   WHAT MAKES THEM A SET RATHER THAN A LIST

   Every one is a house somebody else set up, and in every one the
   mistake was made for a reason that made sense at the time. Nobody in
   any of these did anything malicious. That is not softening — it is
   the single most transferable fact in the tier, because it is what a
   student will actually walk into.

   And every one is answered the same way: read the log, find out where
   each device normally talks, and notice the one that has started
   talking somewhere else.

   ---------------------------------------------------------------------
   TWO OF THEM BREAK THE PATTERN ON PURPOSE

   By scenario four a student has learned "find the open port, close
   it, done".

     FIVE has nothing open at all, and the house is still dirty. The
     hole was closed by somebody else months ago and whoever came
     through it never left. There is no configuration mistake to find.
     Containment is not prevention, arriving from the other side.

     SIX is genuinely clean. Nothing is forwarded, every password has
     been changed, nothing is talking anywhere it should not be — and
     the correct verdict is to say so. A student who cannot bring
     themselves to answer "nothing is wrong" will hunt for ever, and
     in a SOC that is the person who escalates every false positive.

   **Being right about a quiet house counts for as much as being right
   about a loud one.** Neither of those two can be solved by pattern
   matching on the previous four, which is exactly why they are here.

   ---------------------------------------------------------------------
   WHAT A BLURB MAY SAY

   A scenario is chosen from a list, so each one has to say enough to
   be worth choosing. The line is: **the blurb describes what somebody
   DID and why it made sense; it never names the device that was
   taken.** verify/scenarios.mjs fails the build if it ever does, and
   it has already caught one — the printer house used to say "it is a
   printer" and hand over the finding before anything was opened.

   Narrowing is unavoidable and fine. "Somebody forwarded remote
   desktop" tells a student it is not one of the cameras, the same way
   a real ticket would. Naming it is not fine, because then there is
   nothing left to read the log for.

   ---------------------------------------------------------------------
   THE DESIGN CONSTRAINT, ENFORCED BY A CHECK

   **At most one device is ever taken in a Tier 1 scenario.** The
   verdict board is one correct answer and five wrong ones, and two
   compromised devices would make two of the six correct while the
   board could only celebrate one. So where a scenario has two ways in,
   only one of them is weak. verify/scenarios.mjs runs every scenario
   forward untouched and fails if that is ever not true.
   ===================================================================== */

import { makeWorld, device, addForward, setForward } from "./world.js";

/* A device's password is "weak" to the adversary if it shipped that way
   OR if the owner reused one that is already on a breach list. Both are
   typed in from a list rather than guessed, and neither is fixed by
   making the password longer. */
function reuse(w, id, user, pass, why) {
  const d = device(w, id);
  d.creds = { user: user, pass: pass, factory: false, reused: true };
  d.credsNote = why;
  return d;
}

function harden(w, id, pass) {
  const d = device(w, id);
  if (d && d.creds) { d.creds.pass = pass; d.creds.factory = false; d.creds.reused = false; }
  return d;
}

/* Somebody was already inside before the student arrived. Used only by
   scenario five, and it sets nothing the interface can see — which is
   the point. */
function alreadyTaken(w, id, whenMs) {
  const d = device(w, id);
  d.compromised = true;
  d.compromisedAt = whenMs;
  w.history.push({
    t: 0, what: "adversary.foothold",
    detail: d.name + " was already talking to somebody before you moved in",
    why: "the hole it came through was closed months ago, and this did not leave with it"
  });
  return d;
}

export const SCENARIOS = [
  {
    id: "four-pack",
    name: "The four-pack",
    blurb: "Somebody bought four cameras in one box and wanted to watch them from work.",
    teaches: "An open port forward is not one more service. It is the single hole in an otherwise solid wall — and four devices out of one box share one published password, so closing the hole and fixing one camera is fixing neither.",
    build(seed) {
      /* The house exactly as world.js inherits it. */
      return makeWorld(seed);
    }
  },

  {
    id: "two-doors",
    name: "Two doors, one password",
    blurb: "The forum post said forward 8080. A year later somebody forwarded 8081 as well.",
    teaches: "Two ways in, and they are not the same risk. One camera is still on the password printed in its manual; the other was changed by whoever set it up. Both holes should close, and only one of them was ever going to be walked through.",
    build(seed) {
      const w = makeWorld(seed);
      addForward(w, 8081, "cam3", 80,
        "Added later so the garage could be checked from the same phone. Nobody wrote it down.");
      harden(w, "cam3", "garage-2019-keypad");
      return w;
    }
  },

  {
    id: "remote-desktop",
    name: "The remote desktop",
    blurb: "Somebody worked from home for one weekend and opened a way back in. That was three years ago.",
    teaches: "The password on the far side of this one is not a factory default. It is a real password, a decent length, with a number and a punctuation mark — and the owner also uses it on four other sites, one of which has been in a breach dump since 2021. A longer password would not have helped. Nobody guessed it; they typed it in from a list.",
    build(seed) {
      const w = makeWorld(seed);
      setForward(w, "fw-cam", false);
      addForward(w, 3389, "laptop", 3389,
        "Opened for one weekend of working from home in 2023. Never closed.");
      reuse(w, "laptop", "truman", "Sunflower77!",
        "The same password as an old forum account, a shopping site and an email address. " +
        "One of those has been in a breach dump since 2021.");
      return w;
    }
  },

  {
    id: "always-on",
    name: "The one nobody thinks about",
    blurb: "Somebody needed to send a document to the house from the office, so they opened a way in for it.",
    teaches: "Nothing valuable lives on the thing at the far end of that hole, which is exactly why nobody has ever looked at it. It has a web page with the password it shipped with, it sits on the same flat network as everything else, and it meets a foothold's only real requirement: it is always on and nobody is watching it.",
    build(seed) {
      const w = makeWorld(seed);
      setForward(w, "fw-cam", false);
      addForward(w, 9100, "printer", 9100,
        "Forwarded so a document could be sent to it from the office. It worked once.");
      return w;
    }
  },

  {
    id: "already-inside",
    name: "Nothing is open",
    blurb: "The previous owner closed everything before they moved out. They were a year too late.",
    teaches: "There is no configuration mistake to find here. Nothing is forwarded, the wall is solid, and something in this house has been talking to a stranger since before you arrived. Closing a hole stops the next arrival and does nothing about the one already inside — and this is that sentence from the other end.",
    build(seed) {
      const w = makeWorld(seed);
      setForward(w, "fw-cam", false);
      w.devices.forEach(d => { if (d.creds) harden(w, d.id, "changed-by-the-last-owner"); });
      /* Taken long before the student sat down, so nothing they could
         have done would have prevented it. That is the scenario. */
      alreadyTaken(w, "speaker", 0);
      return w;
    }
  },

  {
    id: "actually-fine",
    name: "Somebody who knew what they were doing",
    blurb: "You have inherited a house from someone careful. Prove it.",
    teaches: "Nothing is wrong here, and the only way to know that is to check. A student who cannot bring themselves to answer 'nothing is out of place' will keep hunting, and in a real job that is the person who escalates every false positive until nobody reads their tickets. Being right about a quiet house is a skill and it is graded like one.",
    build(seed) {
      const w = makeWorld(seed);
      setForward(w, "fw-cam", false);
      w.devices.forEach(d => { if (d.creds) harden(w, d.id, "set-properly-in-2024"); });
      return w;
    }
  }
];

export function scenario(id) {
  return SCENARIOS.filter(s => s.id === id)[0] || SCENARIOS[0];
}

/** Build a world for a scenario, stamped with which one it is so a
    reload comes back to the same house rather than the default. */
export function buildWorld(id, seed) {
  const s = scenario(id);
  const w = s.build(seed);
  w.scenario = s.id;
  return w;
}
