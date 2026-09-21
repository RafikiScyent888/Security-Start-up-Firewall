/* =====================================================================
   THE SPINE — the order a professional works the problem

   ---------------------------------------------------------------------
   WHERE THIS CAME FROM

   Instructor feedback, 21 September:

     "The guide would be something like First step: Understanding the
      topology of the network and what the main issue is. Second step:
      Determine if this network would benefit from having some of these
      devices segmented. And then so on so forth until the end of the
      lab. So not technically giving them the answers but helping guide
      them through completing it."

   Read his second step again: "Determine IF this network would benefit
   from having some of these devices segmented." Not "segment the
   cameras." The step names the judgment; the student still makes it.
   That is the whole method, and it is the line every step here holds.

   ---------------------------------------------------------------------
   THIS IS NOT THE HINT LADDER

   The ladder is a RESCUE: three wrong attempts, one objective, and
   only for somebody who is failing. A student who never guesses wrong
   never sees a single rung — and before this existed, that student was
   handed six objectives as a flat list with nothing saying where to
   start.

   The spine is a METHOD. There from the first second, covering the
   whole tier, triggered by nothing.

   ---------------------------------------------------------------------
   SETTLED WITH THE OWNER

     ADVISORY, never gating. A step you cannot finish must never hide
     the step after it.

     IT LIVES WITH THE OBJECTIVES, so the exam labels are reinforced in
     the same place the work is done.

     ONE SPINE FOR ALL SIX HOUSES at Tier 1. The method is what
     transfers, and that is exactly what makes house five and house six
     instructive — the same steps, and neither can be solved by finding
     an open port.

     UNFOLDS ONE STEP AT A TIME, because a wall of text is no use to a
     slower learner.

     EVERY TIER HAS ONE, and every one of them ends with WRITE IT UP.
     That step is not decoration: reporting and communication is where
     the skill actually lives, and it is the part students skip.

   ---------------------------------------------------------------------
   THE RULE THAT CONSTRAINS EVERY WORD BELOW

   **No step may assert that a fault exists.** The same spine runs the
   house where nothing is forwarded and the house that is genuinely
   clean. "Something out there can reach in" would be a lie in two
   houses out of six — and in the other four it hands over a finding
   the tier exists to make them earn. Every step is a question, and
   "if anything" does real work.

   verify/spine.mjs holds this file to it, and to the rule that no step
   ever names a device, a port or a credential.
   ===================================================================== */

/* The last step of every tier. Observable, because the campaign record
   holds the student's own words — so "write it up" is a thing the
   engine can actually see rather than a polite suggestion. */
const WRITE_UP = {
  id: "writeup",
  title: "Write it up",
  ask: "If somebody who was not here read only what you wrote, would they know what happened and why?",
  body: "Go to the AAR and put it in your own words: what was supposed to happen, what actually " +
        "happened, why there is a difference, and what you would sustain or improve. Say plainly " +
        "what you can evidence and what you are inferring — those are different claims, and " +
        "mixing them is what costs people their credibility.",
  done: ctx => !!ctx.wroteUp,
  labels: ["Security operations — incident response (documentation)",
           "Security program management — compliance and reporting",
           "Security program management — security awareness (reporting)"],
  why: "Every incident you will ever work ends in a document somebody else has to act on. This " +
       "is the part that gets skipped, and it is the part that decides whether the work counted."
};

/* ---------------------------------------------------------------------
   TIER 1 — a network you walked into
   --------------------------------------------------------------------- */
export const STEPS = [
  {
    id: "orient",
    title: "Walk the ground",
    ask: "What is on this network, and what does each thing actually do?",
    body: "Before you change anything, find out what you have inherited. Open the house, read " +
          "the inventory, and go device by device: what is it, what is it for, who put it there, " +
          "and does it need to be here at all. You are building the picture you will judge " +
          "everything else against.",
    objective: null,
    labels: ["Security operations — asset management",
             "Security architecture — enterprise infrastructure"],
    why: "Every technician who skips this spends the next hour fixing the wrong thing. You cannot " +
         "say what is out of place until you know what the place looks like."
  },
  {
    id: "inbound",
    title: "What, if anything, can be reached from outside",
    ask: "Can anything out on the internet start a conversation with something in this house?",
    body: "Unsolicited traffic cannot reach a house at all unless somebody has told the router " +
          "where to send it. So the question is not \"is the firewall on\" — it is whether the " +
          "router has been given a destination for anything arriving unasked. Look at what the " +
          "router has been told to deliver inward, and for each one ask who asked for it and why.",
    objective: "no-way-in",
    labels: ["Security architecture — enterprise infrastructure",
             "Threats, vulnerabilities and mitigations — mitigation techniques",
             "General security concepts — security controls"],
    why: "This is the difference between a packet being denied and a packet being undeliverable, " +
         "and it is the single idea the whole tier is built on."
  },
  {
    id: "credentials",
    title: "What is behind the door",
    ask: "For anything that can be reached — who can log into it, and with what?",
    body: "A way in only matters if there is something to walk into. For every device, ask what " +
          "it would take to log into it: is the password the one it was sold with, is it one " +
          "somebody reused from somewhere else, and would either of those be typed in from a " +
          "list rather than guessed?",
    objective: "no-factory-passwords",
    labels: ["General security concepts — identity and access management",
             "Threats, vulnerabilities and mitigations — threat vectors",
             "Security operations — hardening"],
    why: "Default credentials are not a secret. They are printed in the manual and identical on " +
         "every unit of that model — and one reused from a site that has been breached is no " +
         "better, because both are typed in rather than guessed."
  },
  {
    id: "separate",
    title: "Whether this network would benefit from separating some of these devices",
    ask: "Which of these things have no business being able to talk to each other?",
    body: "Go back to your inventory and sort it by trust rather than by type. Which devices can " +
          "be updated and which cannot? Which hold something worth taking? Which are cheap, " +
          "always on, and never looked at? Then decide whether any of them belong apart — and be " +
          "able to say why, because a segment drawn for no reason is just more to maintain.",
    objective: "cameras-cannot-reach-family",
    labels: ["Security architecture — enterprise infrastructure",
             "Threats, vulnerabilities and mitigations — mitigation techniques (segmentation)",
             "General security concepts — security controls"],
    why: "Segmentation does not stop a device being compromised. It stops a compromised device " +
         "being useful — a different promise, and the one that holds when the first one fails."
  },
  {
    id: "rules",
    title: "Read your own rules the way the router reads them",
    ask: "Does your ruleset do what you think it does?",
    body: "Start at the top and work down, the way the router does. First match wins — so a rule " +
          "is only ever consulted if every rule above it failed to match. Ask of each one: could " +
          "anything above this already have matched? If so, this rule is never asked, however " +
          "correct it is. The review under the ruleset will tell you what it sees, and the " +
          "packet tester will tell you what would actually happen.",
    objective: "rules-do-what-you-think",
    labels: ["Security architecture — enterprise infrastructure",
             "General security concepts — change management",
             "Security operations — hardening and secure baselines"],
    why: "Rule order is a security control. A broad allow sitting above a narrow deny does the " +
         "opposite of what was intended while looking entirely reasonable on the page."
  },
  {
    id: "normal",
    title: "Find out what normal sounds like",
    ask: "What does this house do when nothing is wrong?",
    body: "Open the log and read it — not hunting for something, but learning the shape of an " +
          "ordinary evening. Every device here talks to the internet constantly and almost all " +
          "of it is routine. Go source by source and write down where each one reaches. The " +
          "skill being built is knowing which conversations belong.",
    objective: "you-have-looked",
    labels: ["Security operations — alerting and monitoring",
             "Security operations — data sources",
             "Security program management — security awareness (anomalous behaviour recognition)"],
    why: "You cannot recognise abnormal until you know normal. Nothing in this house will " +
         "interrupt you, and nothing will ever tell you it has gone wrong."
  },
  {
    id: "commit",
    title: "Say what is happening",
    ask: "Which of these, if any, is talking somewhere it has no business talking to?",
    body: "Take the list of addresses you built in the last step and go through it. For each " +
          "conversation, can you put a name to the other end and account for why it is " +
          "happening? Then commit to an answer. Being right that a house is quiet counts for " +
          "exactly as much as being right that it is not — in a real job, the person who cannot " +
          "say \"this is fine\" escalates everything.",
    objective: "you-know-what-is-happening",
    labels: ["Security operations — incident response",
             "Security operations — data sources",
             "Security program management — security awareness (reporting)"],
    why: "Nothing here is going to tell you. There is no alert, no banner and no warning light, " +
         "and there never will be, because nothing in this house is watching."
  },
  WRITE_UP
];

/* ---------------------------------------------------------------------
   TIERS 2 TO 5

   Same shape every time: orient, the six graded steps in the order a
   professional takes them, then write it up. The shape repeating is
   the point — by Tier 5 a student should recognise the method before
   they have read a word of the incident.

   Where a step has an objective, its exam labels come from that
   objective rather than being restated here, so the two can never
   drift apart.
   --------------------------------------------------------------------- */
const TIER2 = [
  { id: "t2-orient", title: "Work out what has changed", objective: null,
    ask: "What is different now that somebody is paying you?",
    body: "The house has not changed. The network has not changed. What has changed is that " +
          "somebody else's information is now on your machine, and you have signed something " +
          "about it. Go and read what you signed before you do anything else.",
    labels: ["Security program management — governance",
             "Security architecture — data types and classifications"],
    why: "The line you draw here between business and personal is the exact rule an employee " +
         "breaks two tiers from now, at much greater cost." },
  { id: "t2-s-promises", title: "Check that you can keep what you promised", objective: "t2-promises",
    ask: "Could you honour that response time alone, on your worst week?",
    body: "Read the number you committed to and imagine the week you had flu. An agreement is a " +
          "promise with a consequence attached.",
    why: "The right number is the slowest the client will accept AND the fastest you can hit " +
         "every single time. Where those overlap is the answer." },
  { id: "t2-s-identity", title: "Find out what holds the keys", objective: "t2-identity",
    ask: "If somebody took your personal mail today, what could they do to the business?",
    body: "Trace every path that could restore access to the business account, and for each one " +
          "ask what it would let somebody else do instead of you.",
    why: "Anything that can restore your access can grant somebody else's. A recovery path is a " +
         "way in, not only a way back." },
  { id: "t2-s-mfa", title: "Decide what stops a stolen password", objective: "t2-mfa",
    ask: "If the password alone were known to somebody else, what would still stand in the way?",
    body: "Look at the real options and their real weaknesses. None of them is free of a " +
          "downside; the question is which downside you can live with.",
    why: "Month three is a convincing copy of your own sign-in page." },
  { id: "t2-s-separation", title: "Work out what can reach the work", objective: "t2-separation",
    ask: "What else on this network can reach the machine the client's files are on?",
    body: "List everything on the network and ask of each: does it need to reach the machine the " +
          "client's work is on? Filing the data differently and encrypting its journey both " +
          "leave that answer unchanged.",
    why: "A problem on the cheapest device on a flat network is a problem everywhere." },
  { id: "t2-s-copy", title: "Find out what survives the building", objective: "t2-copy",
    ask: "If this house burned down tonight, what would you still have?",
    body: "For each copy you keep, ask where it physically is and what it is plugged into. Then " +
          "ask how long it would take to get the data back, and what you are not earning meanwhile.",
    why: "The local copy is convenience. The offsite copy is survival." },
  { id: "t2-s-handled", title: "Decide the order before you need it", objective: "t2-handled",
    ask: "When something does happen, what do you do first, and what does that make impossible?",
    body: "Go through the possible first moves and ask of each what it destroys, what it alerts, " +
          "and what it can no longer be done after. Then read your own agreement for the clock.",
    why: "Contain, understand, notify, recover. Steps out of that order do not merely go slower " +
         "— several of them destroy what the next step needed." },
  WRITE_UP
];

const TIER3 = [
  { id: "t3-orient", title: "Work out what changed when you hired", objective: null,
    ask: "Who can make a mistake that costs you a client now?",
    body: "You are no longer the only person with access, and everything you do about the first " +
          "mistake teaches everybody else whether it is safe to report their own.",
    labels: ["Security program management — governance",
             "General security concepts — identity and access management"],
    why: "One tier from now, somebody who watched how this was handled decides not to come forward." },
  { id: "t3-s-told", title: "Work out who was actually harmed", objective: "t3-told-both",
    ask: "Two companies are involved — what did each of them lose, and what is each now holding?",
    body: "Separate the party whose information was exposed from the party who received it. They " +
          "have different claims on you and different things they need from the conversation.",
    why: "Answering for only one of them is answering half the question." },
  { id: "t3-s-cause", title: "Find the cause, not the culprit", objective: "t3-root-cause",
    ask: "What made the mistake possible, as opposed to who made it?",
    body: "Ask what would have had to be different for this to be impossible. Then look at each " +
          "candidate control and ask whether it removes the cause, catches the error as it " +
          "happens, or merely records that a risk exists.",
    why: "Documenting a risk and controlling one are different things, and the second is the job." },
  { id: "t3-s-consequence", title: "Weigh what the consequence teaches", objective: "t3-proportionate",
    ask: "What does each possible outcome teach the next person deciding whether to tell you something?",
    body: "A consequence has to be proportionate to what was done, leave a record you could show " +
          "a client, and not make the next person hide their mistake.",
    why: "An option that fails the third test costs you more than the incident did." },
  { id: "t3-s-access", title: "Work out what you can still revoke", objective: "t3-access-not-device",
    ask: "You cannot reach the hardware — so what can that hardware still get into?",
    body: "Stop thinking about the device and write down everything it currently has access to. " +
          "Then ask which of those things are yours to take away.",
    why: "When you cannot control the endpoint, you control the access." },
  { id: "t3-s-availability", title: "Deal with the outage nobody stole anything in", objective: "t3-availability",
    ask: "Where is the constraint, and is your fix on the right side of it?",
    body: "Follow the traffic and find the narrowest point it passes through. Then ask where any " +
          "control you are considering actually sits relative to that point.",
    why: "Nothing was taken, decrypted or altered, and a client still could not trade." },
  { id: "t3-s-risk", title: "Name the risks you are keeping", objective: "t3-risk-named",
    ask: "Which risks are you carrying on purpose, and could you say so out loud?",
    body: "Go through the things you decided not to buy and write down why, and what you would " +
          "lose if that decision turned out to be wrong.",
    why: "Documented risk acceptance is a legitimate position. Undocumented is hoping." },
  WRITE_UP
];

const TIER4 = [
  { id: "t4-orient", title: "Notice what did not fail", objective: null,
    ask: "Which of your technical controls actually failed here?",
    body: "Go through them one at a time — the firewall, the VPN, device management, the mail " +
          "filtering, the logging. Establish what worked before you start looking for what broke.",
    labels: ["General security concepts — security controls",
             "Security operations — monitoring"],
    why: "Every technical control did its job and the business still lost twenty-one thousand " +
         "dollars. That is the tier." },
  { id: "t4-s-preserve", title: "Decide what cannot be done later", objective: "t4-preserved",
    ask: "Of everything you could do right now, which can only be done right now?",
    body: "Take each possible first action and ask what it destroys, who it alerts, and whether " +
          "it would still be available to you in an hour.",
    why: "Preservation never feels urgent and is always first, because every other action is " +
         "still there afterwards and this one is not." },
  { id: "t4-s-bec", title: "Work out what was actually forged", objective: "t4-bec",
    ask: "Which part of that message was fake, and which part was entirely genuine?",
    body: "Read the sending domain one character at a time, then ask what your authentication " +
          "checks actually prove and what they say nothing about.",
    why: "Authentication proves a message came from the domain it claims. It cannot tell you " +
         "the domain is the one you meant." },
  { id: "t4-s-cover", title: "Read what your cover forbids", objective: "t4-cover",
    ask: "What are you not allowed to do before you have asked?",
    body: "Go and read the policy you bought, not the headline number. Then decide what you owe " +
          "the client in speed, and whether that has to be the money or can be the honesty.",
    why: "The humane act and the costly act can be the same act." },
  { id: "t4-s-clock", title: "Find out whose clock you are on", objective: "t4-covered-entity",
    ask: "Who has to be told, how fast, and in what form?",
    body: "Read the agreement that governs this relationship and find the notification clause. " +
          "Note what it says about content and form, not only timing.",
    why: "A verbal briefing is not a breach notification, and the obligation runs to the party " +
         "the agreement names rather than to whoever feels most affected." },
  { id: "t4-s-blast", title: "Work out how far one action travels", objective: "t4-blast-radius",
    ask: "When you press deploy, how many places does that reach before a human looks?",
    body: "Trace the path from your management tool to a client endpoint and count the points " +
          "where somebody could stop it. Then ask what a signature actually proves.",
    /* Deliberately NOT the sentence the correct option uses. The
       check caught this quoting that option word for word, which is
       the guide handing over the answer while looking like a note. */
    why: "The same property that lets twelve people manage forty clients is the property " +
         "somebody else inherits the moment they reach the tool." },
  { id: "t4-s-deprov", title: "Find what still works after the account is off", objective: "t4-deprovisioning",
    ask: "What can authenticate without a person being present?",
    body: "List every credential issued in somebody's name that is not their password, and ask " +
          "of each whether disabling the account touches it at all.",
    why: "Disabling an identity stops that identity signing in. It does nothing to a secret " +
         "designed so no human has to be there." },
  WRITE_UP
];

const TIER5 = [
  { id: "t5-orient", title: "Notice that nothing is out of policy", objective: null,
    ask: "What rule has actually been broken here?",
    body: "Go looking for the violation and find that there is not one. The access was granted, " +
          "the use was permitted, and every control is watching for something else.",
    labels: ["Threats, vulnerabilities and mitigations — insider threat",
             "General security concepts — fundamental concepts (zero trust)"],
    why: "The behavioural indicators of an insider are identical to the indicators of your best " +
         "employee. That is the nature of this threat, not a gap in your controls." },
  { id: "t5-s-baseline", title: "Find something to compare against", objective: "t5-baseline",
    ask: "If his own history is already the behaviour you are hunting, what is left to compare him to?",
    body: "Ask when the earliest record of this person's activity begins, and whether there is " +
          "any period in it you would call clean. Then look for somebody else doing the same job.",
    why: "Detection built on deviation needs a clean baseline to deviate from." },
  { id: "t5-s-evidence", title: "Work out what you cannot yet show", objective: "t5-deception",
    ask: "You can show what moved. How do you show why?",
    body: "Separate what you can evidence from what you believe. Then ask what could be put in " +
          "place such that any action taken against it is itself proof of intent.",
    why: "Removing access limits damage. It does not manufacture the evidence you are short of." },
  { id: "t5-s-privilege", title: "Decide who is directing the work", objective: "t5-privilege",
    ask: "What happens to everything already written down, depending on who asked for it?",
    body: "Ask which of your protections can be applied retrospectively and which cannot. Then " +
          "ask what standard the employment decision runs on, and what standard a court does.",
    why: "You do not have to win a criminal case to dismiss somebody, and neither privilege nor " +
         "chain of custody can be added afterwards." },
  { id: "t5-s-attest", title: "Separate what you may not say from what you would rather not", objective: "t5-attestation",
    ask: "Which of these is a legal bar, and which is discomfort?",
    body: "Take the question in front of you and split it three ways: what you are barred from " +
          "disclosing, what you are contractually required to answer, and what is merely " +
          "awkward. They are not the same and they do not get the same treatment.",
    why: "Declining to give details is honest and standard. A false statement in a contractual " +
         "document is neither, however similar they feel while you are holding the pen." },
  { id: "t5-s-gap", title: "Find the gap", objective: "t5-gap",
    ask: "Between the moment he knows and the moment his access ends, how long is it?",
    body: "Write out the sequence minute by minute and mark the point at which he first learns " +
          "something is wrong. Then look at what is still reachable either side of that mark.",
    why: "Every removal is about that gap, and the person on the other side of it has a phone." },
  { id: "t5-s-carried", title: "Work out what you can actually evidence", objective: "t5-carried",
    ask: "What can you prove, what can you only characterise, and how will you say the difference?",
    body: "Check how far back your records go against how long this ran. Then decide how to " +
          "describe the part you cannot see without either guessing or hiding it.",
    why: "A figure revised upward later destroys credibility and creates liability. \"We do not " +
         "know, and here is exactly why\" is a professional answer." },
  WRITE_UP
];

export const TIER_SPINES = { 2: TIER2, 3: TIER3, 4: TIER4, 5: TIER5 };

/** Tier 1's own spine, or a later tier's. */
export function spineFor(tier) {
  return Number(tier) === 1 ? STEPS : (TIER_SPINES[Number(tier)] || STEPS);
}

/* ---------------------------------------------------------------------
   PROGRESS THROUGH THE GUIDE
   --------------------------------------------------------------------- */

/** ctx: { progress: [{id, met}], wroteUp: bool } */
export function isDone(step, ctx) {
  if (typeof step.done === "function") return !!step.done(ctx);
  const prog = (ctx && ctx.progress) || [];
  if (step.objective) return prog.some(p => p.id === step.objective && p.met);

  /* THE TRAP, and the first version fell straight into it. An
     orienting step has no objective, because "walk the ground" is not
     something the engine can observe. A leading-run loop that demands
     one breaks on step one immediately, the counter stays at zero for
     ever, and the guide never advances no matter how much work gets
     done. Driving it is what found that; reading the function did not.

     So an unobservable step is passed once the student has met
     ANYTHING — they have demonstrably started, which is the only
     evidence of orienting there is. Before that it still blocks, so a
     first visit shows exactly one step. */
  return prog.some(p => p.met);
}

/** How many steps are showing. `manual` is how many the student has
    asked to see; it never goes backwards and it is the reason nobody
    can be stranded behind a step they cannot finish. */
export function revealed(ctx, manual, tier) {
  const steps = spineFor(tier || 1);
  let done = 0;
  for (const s of steps) {
    if (isDone(s, ctx)) { done += 1; continue; }
    break;
  }
  const auto = Math.min(done + 1, steps.length);
  return Math.max(1, Math.min(steps.length, Math.max(auto, manual || 1)));
}

export function stateOf(step, ctx) {
  return isDone(step, ctx) ? "done" : "open";
}

/** A step's exam labels. Where it points at an objective, they come
    from that objective rather than being restated, so the guide and
    the scoreboard can never drift apart. */
export function labelsFor(step, objectives) {
  if (step.labels && step.labels.length) return step.labels;
  if (!step.objective || !objectives) return [];
  const o = objectives.filter(x => x.id === step.objective)[0];
  return (o && (o.domains || o.labels)) || [];
}
