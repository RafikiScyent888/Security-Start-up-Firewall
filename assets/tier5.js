/* =====================================================================
   TIER 5 — CORIAKIN

   Three years. A SOC, a team, a board, and J. Fenty Jr School about to
   sign — a welding trade school, "forging veterans into welders", with
   FERPA, GLBA and workshop kit that puts ICS/OT on the table.

   THE THIRD INSIDER, named from Narnia on purpose. The student spends
   two tiers learning that the odd-one-out names mean trouble, and then
   the pattern breaks exactly when the stakes are highest.

   WHY THIS ONE DEFEATS EVERYTHING ALREADY BUILT:

     Sam and Pippin each CREATED an unauthorised path — a mis-sent
     mail, a forwarding rule. Something existed that should not have.
     Coriakin uses the access he was given, correctly, for the wrong
     purpose. Nothing is out of policy. No rule is broken. Every
     technical control is looking for the wrong thing, and this time
     that is the nature of the threat rather than a gap in the build.

   THE BEHAVIOURAL INDICATORS OF AN INSIDER ARE IDENTICAL TO THE
   INDICATORS OF YOUR BEST EMPLOYEE. He volunteers for on-call. He
   takes the client with the difficult network. He does the
   documentation nobody wants. Every one is a red flag; every one is
   what you would want in a hire. He passes the interview and the
   background check, because he is good at the job. The competence is
   the cover.

   TWO THINGS FOLLOW FROM "PLANTED FROM DAY ONE":

     1. Behavioural analytics cannot catch him. UEBA works by spotting
        deviation from a person's own baseline, and his first week is
        already the compromised behaviour. There is no clean "before".
        This is why DLP is the correct detector — it watches CONTENT
        LEAVING, not behaviour changing
     2. The student's hiring process goes on trial

   THE IRONY, BUILT DELIBERATELY: the control that catches him was
   installed for a completely different reason — the student tightened
   DLP to look good for J. Fenty. A sales decision catches a spy. And
   if they never tightened it, he is not caught at all.
   ===================================================================== */

export const ID = 5;
export const NAME = "Coriakin";
export const MONTHS = 36;
export const BLURB =
  "A SOC, a team and a board. Somebody who has worked for you since the first day, who " +
  "volunteers for on-call and writes the documentation nobody wants, is working for a " +
  "competitor — and every control you own is looking for the wrong thing.";

export const TAKEN = { general: 12, clients: 6, total: 18 };
export const RETENTION_DAYS = 60;
export const INVESTIGATION_DAYS = 45;

export const CAST = [
  { name: "Nari Motor Tools", role: "A rival of Motorpool — not a rival MSP. They want " +
      "Motorpool's business, and they are running industrial espionage on a competitor through " +
      "that competitor's IT provider." },
  { name: "Igol Tech Keepers", role: "Innocent. A legitimate IT firm Nari gave the inside track " +
      "to. They approach Motorpool with a proposal that is oddly specific about their setup, and " +
      "never ask where the brief came from. That approach is the foreshadowing." },
  { name: "Glimfeather", role: "Runs the investigation, quietly, after hours. He knows what he " +
      "is doing — he did this in uniform. Coriakin does not know who he is being watched by." }
];

/* ---------------------------------------------------------------------
   PICKS
   --------------------------------------------------------------------- */
export const PICKS = [
  {
    id: "t5-retention",
    question: "How long do you keep logs?",
    brief:
      "This is a budget line and nobody will ever thank you for it. It is also the single " +
      "decision that determines whether there is a case at the end of this tier. Coriakin has " +
      "been running for months.",
    options: [
      { id: "30", label: "30 days", cost: 3000, strength: 0,
        consequence: "You cannot build a 45-day case out of 30 days of logs. No pattern, no " +
          "case, and the best available outcome is a quiet settlement with an NDA — after which " +
          "he does it to somebody else." },
      { id: "60", label: "60 days", cost: 5200, strength: 2,
        consequence: "You can prove the last 60 days and you cannot prove the first six months. " +
          "Enough for a referral, and the uncertainty is itself part of the damage." },
      { id: "180", label: "180 days", cost: 11000, strength: 4,
        consequence: "Most of his run is inside the window. The figure you give Motorpool is " +
          "evidenced rather than estimated, which is a different conversation entirely." },
      { id: "365", label: "One year", cost: 19000, strength: 5,
        consequence: "Everything. Also a storage bill you will be asked to justify every quarter " +
          "by people who have never needed it." }
    ]
  },
  {
    id: "t5-dlp",
    question: "J. Fenty's questionnaire is coming. Do you tighten outbound DLP?",
    brief:
      "This is a compliance uplift for a prospect. It costs money, it will generate false " +
      "positives, and it will annoy people. Nobody is asking you to do it for a security reason.",
    options: [
      { id: "no", label: "Not yet — answer the questionnaire with what you have", cost: 0, strength: 0,
        consequence: "Coriakin is not caught. He is still there at the end of this tier, and " +
          "everything he takes after today is taken because of this decision." },
      { id: "minimal", label: "Tighten it enough to answer the question honestly", cost: 2000, strength: 2,
        consequence: "Catches volume anomalies eventually. Slower, and by then the trade secrets " +
          "are closer to the door." },
      { id: "full", label: "Tighten it properly — content inspection and volume baselines by peer group",
        cost: 6000, strength: 5,
        consequence: "This is what catches him, and you did it to look good for a prospect. " +
          "Peer-group comparison is the key: individual-baseline analytics fail on somebody " +
          "planted from day one, because his first week is already the compromised behaviour. " +
          "Colleagues in the same role have clean histories even though he does not." }
    ]
  }
];

/* ---------------------------------------------------------------------
   SETS
   --------------------------------------------------------------------- */
export const SETS = [
  {
    id: "t5-first-alert",
    tier: 5,
    title: "The first alert",
    question: "DLP flags Coriakin moving an unusual volume of Motorpool documentation. What do you do?",
    brief:
      "It is one alert. He is on the Motorpool account, he is on call this week, and he has a " +
      "legitimate reason to touch every file it names. The volume is at the top of the range for " +
      "his role — high, not impossible. He has been here since the first day, he volunteers for " +
      "the difficult clients, and he wrote the runbook you are reading this alert in. Your " +
      "honest first thought is that the threshold is too tight.",
    options: [
      { id: "dismiss", label: "Dismiss it — the threshold is new and this is a false positive",
        reason: "The single most expensive click in the tier. Thresholds start loose and tighten " +
          "over months, so an early alert looks like noise by design. Dismiss this and he runs " +
          "another four to six months: 18% becomes 40%, and the trade secrets go with it." },
      { id: "confront", label: "Ask him about it — he will have a reasonable explanation",
        reason: "He will, and it will be excellent, and then he goes quiet and deletes what he " +
          "can. You have no case, no evidence, and an employee who may now sue you over the " +
          "accusation." },
      { id: "soc-queue", label: "Escalate it into the SOC queue for the team to triage",
        reason: "The suspect is in the SOC. Put an insider alert in the team's queue and he reads " +
          "it — possibly before anybody else does, since he is on call. This is why insider " +
          "investigations run outside normal channels: the subject has access to the normal ones." },
      { id: "quietly", label: "Say nothing, keep the alert to yourself, and start comparing him against his peers over time",
        correct: true,
        why: "Right, and the two halves are both load-bearing. Saying nothing, because the " +
          "suspect is on the team and every normal channel runs past him. And comparing him " +
          "against PEERS rather than against himself, because he was planted from day one — " +
          "there is no clean 'before' in his own history to deviate from, which is precisely why " +
          "behavioural analytics were never going to catch him. His colleagues in the same role " +
          "do have clean histories. One alert is not a case; the pattern only exists looking " +
          "backwards, in aggregate, which is how these are actually found.",
        reason: "" },
      { id: "revoke", label: "Quietly remove his access to Motorpool",
        reason: "Anybody good enough to do this checks their access. Lose a client environment " +
          "overnight and he knows — and you have acted on a single alert with nothing to show " +
          "for it afterwards." },
      { id: "police", label: "Report it to the police now",
        reason: "You have one alert and no pattern. You report on reasonable suspicion, not " +
          "certainty — and you are not there yet. Counsel comes first, and counsel calls law " +
          "enforcement when there is credible evidence of a crime." }
    ],
    hints: [
      "Two facts in the brief matter more than the alert does. One is where this person sits. " +
      "The other is how long they have been here.",
      "Detection built on deviation needs a clean baseline to deviate from. If somebody's " +
      "earliest recorded behaviour is already the behaviour you are hunting, comparing them to " +
      "their own history proves nothing — you have to compare them to somebody else doing the " +
      "same job. And any escalation path that the subject can see is not a path.",
      "Of what is left, one tells him directly, one tells him by taking something away, and one " +
      "goes to the authorities without a pattern to show them."
    ]
  },

  {
    id: "t5-evidence",
    tier: 5,
    title: "Manufacturing the evidence you are short of",
    question: "You have a volume pattern and no proof of intent. How do you get it?",
    brief:
      "Peer comparison shows him at the top of the range, occasionally over, never twice in a " +
      "row — each crossing looks like a busy day. It is only visible in aggregate, looking " +
      "backwards. That is enough to be sure and nowhere near enough for an employment tribunal, " +
      "let alone a criminal referral. He has got lazy: he stopped double-checking months ago, " +
      "after getting away with it for so long.",
    options: [
      { id: "wait", label: "Keep watching until he makes a clear mistake",
        reason: "He has been careful for a year and the clock is not on your side — your log " +
          "retention is finite, and every week you wait, the earliest evidence falls out of the " +
          "window you can still prove." },
      { id: "remove-all", label: "Remove his access to everything he is not actively working on",
        reason: "Sound instinct, wrong sequencing. Anybody good enough to do this checks their " +
          "access, and a change that applies only to him is a message. Start with what is " +
          "already dormant, wait for cover — a rotation that applies to everybody is invisible — " +
          "and monitor rather than remove wherever you can." },
      { id: "honeytokens", label: "Plant honeytokens — credentials, a document, a fake client record: attractive, worthless, and watched",
        correct: true,
        why: "Right, and it solves the actual bottleneck. Removing access limits damage; " +
          "honeytokens MANUFACTURE the evidence you are short of. Something touched means proof " +
          "of intent, without waiting for him to slip — and a man careless enough to take the " +
          "bait is careless enough to believe he is being promoted. This is deception " +
          "technology, sitting in the objectives beside zero trust. Set by the owner, not by the " +
          "team, for the same reason the alerts do not go in the queue.",
        reason: "" },
      { id: "keylogger", label: "Put monitoring software on his workstation to capture what he does",
        reason: "Heavier, more intrusive and far more contestable — and the AUP's monitoring " +
          "notice covers company systems in general, not necessarily this. Evidence gathered in " +
          "a way a tribunal dislikes is evidence you may not get to use." },
      { id: "interview", label: "Have HR interview him about his workload",
        reason: "A pretext interview conducted by somebody who does not know what it is for, " +
          "with a subject who is better at this than they are. He learns that somebody is " +
          "looking." },
      { id: "colleagues", label: "Quietly ask his colleagues whether they have noticed anything",
        reason: "Now several people know there is an investigation, one of whom may be helping " +
          "him, and none of whom can un-know it. You have also started a rumour about somebody " +
          "you cannot yet prove anything against." }
    ],
    hints: [
      "You do not have an evidence problem in general. You have a specific gap: you can show " +
      "what moved and you cannot show why. Ask which option produces THAT.",
      "When the evidence you need does not exist yet, you can either wait for the adversary to " +
      "create it or create a situation where any action they take is itself evidence. The second " +
      "is faster, cleaner, and does not depend on them making a mistake.",
      "Of what is left, one waits on a clock that is running against you, one changes his access " +
      "in a way he will notice, and one tells other people there is an investigation."
    ]
  },

  {
    id: "t5-counsel",
    tier: 5,
    title: "When counsel comes in",
    question: "The honeytoken has been touched. When do you involve a lawyer?",
    brief:
      "You now have the pattern and an act of intent. Glimfeather has been working after hours " +
      "for three weeks. J. Fenty is being onboarded at the same time, so people walking in and " +
      "out of meetings is entirely normal this month. Your instinct is to finish building the " +
      "case and hand over something complete.",
    options: [
      { id: "after", label: "When the investigation is finished and you know what you have",
        reason: "Forty-five days of evidence gathered outside privilege, with a chain of custody " +
          "nobody supervised. The criminal referral is weakened and your own internal notes are " +
          "discoverable. This is the most common and most expensive mistake here." },
      { id: "now", label: "Now — the case is built under their direction from this point on",
        correct: true,
        why: "Right, and there are three reasons. Privilege: work done under counsel's direction " +
          "is protected, and the notes you write tomorrow are the ones you will least enjoy " +
          "reading out later. Admissibility: chain of custody supervised from the start survives " +
          "contact with a court, and reconstructed afterwards it does not. And the decision to " +
          "call law enforcement is theirs to advise on — you report on reasonable suspicion, not " +
          "on certainty, because proving it is the police's job and waiting for proof means " +
          "running a criminal investigation yourself, unqualified, very likely contaminating " +
          "evidence. The cover is free: with J. Fenty onboarding, lawyers in the building look " +
          "like contract work.",
        reason: "" },
      { id: "dismiss-first", label: "Dismiss him first, then hand the file to a lawyer",
        reason: "Backwards, and it conflates two different standards. Dismissal runs on the " +
          "balance of probabilities; a conviction needs far more. Acting on the employment side " +
          "first, unadvised, is how a wrongful dismissal claim starts — and it destroys the " +
          "criminal timeline." },
      { id: "police-first", label: "Go to the police and let them tell you what they need",
        reason: "Not wrong so much as out of order. Counsel is what stops you handing over " +
          "something that compromises your own position, breaches confidentiality to Motorpool, " +
          "or defames him before anything is proven." },
      { id: "board", label: "Take it to the board first — it is their company too",
        reason: "The board will be told, and widening the circle before it is privileged means " +
          "more people holding unprotected knowledge of an unproven allegation. Counsel first, " +
          "then the board, with advice about what may be said." },
      { id: "insurer", label: "Notify the insurer first — they may run the response",
        reason: "The insurer does need notifying, and their panel firm may well do the work. " +
          "Getting your own counsel engaged is still the step that protects YOUR position, and " +
          "it is an hour's difference." }
    ],
    hints: [
      "Ask what happens to everything Glimfeather has already written down, and everything he " +
      "writes tomorrow, depending on who is directing the work.",
      "Two things separate an investigation that survives a courtroom from one that does not: " +
      "whether the work was privileged, and whether the chain of custody was supervised from the " +
      "beginning. Neither can be applied retrospectively.",
      "Of what is left, one acts on the employment side before anybody has advised on it, one " +
      "goes to the authorities unadvised, and one widens the circle before it is protected."
    ]
  },

  {
    id: "t5-questionnaire",
    tier: 5,
    title: "The J. Fenty questionnaire",
    question: "Question 15 asks whether you have had a reportable security incident in the last 24 months, and whether you are aware of any ongoing ones. The investigation is live. What do you write?",
    brief:
      "This is a contractual document and it is the gate to the tier. You are not allowed to " +
      "discuss an ongoing investigation — naming Coriakin would defame him before anything is " +
      "proven, law enforcement may restrict disclosure, and confidentiality to Motorpool limits " +
      "what you can say about their data. And procurement timelines do not wait.",
    options: [
      { id: "no", label: "Answer no — you cannot discuss an ongoing investigation anyway",
        reason: "Declining to discuss is honest and standard. Writing 'no' is not declining, it " +
          "is an affirmative false statement in a contractual document — a material " +
          "misrepresentation that can void the contract later. And it will surface, probably " +
          "through Igol." },
      { id: "truthful", label: "Answer truthfully at a level of generality: an active internal matter under legal counsel, here is our incident response process and our controls, and we will update you as we are able",
        correct: true,
        why: "Right. Every word of it is true, none of it names him, none of it compromises the " +
          "case, and it breaches nothing you owe Motorpool. Some prospects walk. Some respect it " +
          "more than a clean sheet — and here is the part worth sitting with: once the arrest is " +
          "made and it can be discussed, you are a firm that DETECTED A PLANTED INSIDER using " +
          "controls it had just installed. That is a better reference than a clean sheet, " +
          "because a clean sheet only means nothing has been found yet.",
        reason: "" },
      { id: "full", label: "Disclose in full, including that a staff member is under investigation",
        reason: "Compromises a criminal case, defames him before proof, and breaches your " +
          "confidentiality to Motorpool about their data. Honesty does not require naming a " +
          "suspect." },
      { id: "withdraw", label: "Withdraw from the bid until it is resolved",
        reason: "Honourable, and it costs you the client and the tier — and they will wonder why " +
          "you ran. There is no general legal bar on telling a prospect you have an ongoing " +
          "internal matter." },
      { id: "delay", label: "Delay returning it until after the arrest",
        reason: "Procurement timelines do not wait, and stalling reads as evasion. You will be " +
          "asked why, and the honest answer is the one you were avoiding giving." },
      { id: "nda", label: "Have them sign an NDA first, then tell them everything",
        reason: "An NDA does not cure disclosing a criminal investigation, and it drags a " +
          "prospect into your problem before they have even signed. It also does nothing about " +
          "what you owe Motorpool." }
    ],
    hints: [
      "There are three different things here: what you are legally barred from saying, what you " +
      "are contractually required to answer, and what you would simply rather not discuss. " +
      "Separate them before you write anything.",
      "Declining to give details is honest and standard practice. Writing a false statement in a " +
      "contractual document is neither — and the two are not on the same spectrum, however " +
      "similar they feel while you are holding the pen.",
      "Of what is left, one names a suspect, one walks away from the client, one stalls, and one " +
      "asks a prospect to take on your confidentiality problem."
    ]
  },

  {
    id: "t5-removal",
    tier: 5,
    title: "The day",
    question: "Removal and reveal happen on the same day. What is the sequence?",
    brief:
      "He is brought in early — an hour before the staff arrive — for \"training for a new " +
      "position we are creating; you are one of two we picked\". No audience, no scene, no " +
      "phones out. Law enforcement may or may not control the timing. Worth sitting with before " +
      "you answer: you are running a pretext on him, exactly as he ran one on you for a year. It " +
      "is legitimate, it is necessary, and it should still feel like something.",
    options: [
      { id: "night-before", label: "Disable his accounts the night before so he arrives with nothing",
        reason: "He logs in from home, finds himself locked out at 21:00, and destroys whatever " +
          "he still can before morning." },
      { id: "work-morning", label: "Let him work the morning normally and remove access after he leaves",
        reason: "He leaves with whatever he takes that morning — and this is the morning he is " +
          "most likely to take something, because he has been told he is being promoted." },
      { id: "simultaneous", label: "Preserve everything, revoke every access simultaneously at the moment he is in the room, collect the devices, rotate every credential he had knowledge of, and then notify",
        correct: true,
        why: "Right, and the timing is the whole thing: simultaneous, while he is in the room and " +
          "away from a keyboard. Preserve first — the same rule as Pippin, and it has not " +
          "changed. Collect the devices in the room, because the device IS the evidence and " +
          "'bring it in tomorrow' means a wiped machine. Rotate everything he had KNOWLEDGE of, " +
          "not merely everything issued to him — a shared credential he memorised is still live. " +
          "Then Motorpool in person the same day, then J. Fenty, who have already signed and " +
          "should hear it from you.",
        reason: "" },
      { id: "devices-later", label: "Revoke access in the room and let him return the devices later",
        reason: "The device is the evidence. Anything that leaves the building with him may come " +
          "back wiped, and you will never be able to say whether it was." },
      { id: "passwords", label: "Change the passwords he used, and deal with certificates and tokens over the next few days",
        reason: "Pippin's lesson, unlearned. Certificates, tokens, app passwords and SSH keys do " +
          "not care that a password changed, and 'over the next few days' is several nights " +
          "during which they all still work." },
      { id: "walk-out", label: "Walk him out first and sort the technical side afterwards",
        reason: "The humane instinct and the most expensive one. Minutes matter, he has a phone " +
          "in his pocket, and the gap between the conversation and the revocation is the window " +
          "he has been waiting a year for." }
    ],
    hints: [
      "Write down the exact minute at which he first learns something is wrong, and then ask " +
      "what is still reachable in the minutes either side of it.",
      "Everything in a removal is about the gap between the subject knowing and the access " +
      "ending. Any sequence with a gap — a night, a morning, a few days, a walk to the car — is " +
      "a window, and the person on the other side of it has a phone.",
      "Of what is left, one lets the evidence leave the building, one leaves the non-password " +
      "credentials live, and one closes the gap in the wrong order."
    ]
  },

  {
    id: "t5-motorpool",
    tier: 5,
    title: "Telling Motorpool",
    question: "You caused their problem. What do you actually say, and how?",
    brief:
      "About 18% of what he could reach has gone — 12% general business data, and 6% is " +
      "Motorpool's own bigger clients' information. That 6% means Motorpool now has its own " +
      "notification problem, caused by you. Your log retention decides how much of that you can " +
      "evidence and how much is a reasoned estimate. \"We were hacked\" invites sympathy; " +
      "everyone gets hacked. \"Our employee stole from you\" is a failure of your judgement.",
    options: [
      { id: "email-detail", label: "Send a detailed written report so they have everything in one place",
        reason: "This conversation does not go in an email first. They are going to ask you " +
          "questions you would rather answer in person, and a document arriving cold reads as " +
          "distancing yourself from it." },
      { id: "name-him", label: "Tell them in person, name him, and explain exactly what he did",
        reason: "His name does not appear. Until it is proven, 'unauthorised access originating " +
          "from within our organisation' is all you can say without defamation exposure — and " +
          "counsel will have agreed that wording in advance." },
      { id: "in-person-range", label: "In person, one client at a time, stating what you can evidence, characterising what you cannot, committing to update — and offering to go with them to their own customers",
        correct: true,
        why: "Right, and the last part is the one that matters most. State what you can " +
          "evidence, characterise what you cannot, and never give a bare precise number you " +
          "cannot support — a figure revised upward later destroys credibility and creates " +
          "liability. 'We do not know, and here is exactly why' is a professional answer; " +
          "students think admitting uncertainty is weakness and it is the opposite. Then going " +
          "WITH them to their customers: you caused their problem, you help carry it. Counsel " +
          "wants you to say as little as possible because you are acknowledging fault in front " +
          "of third parties; the relationship says show up. You square it by agreeing the " +
          "wording in advance and not departing from it.",
        reason: "" },
      { id: "precise", label: "Give them a precise figure — 18% — so they know exactly where they stand",
        reason: "You can prove the last " + RETENTION_DAYS + " days and not the first six months. " +
          "A bare precise number you cannot support is the one they will quote back to you, and " +
          "if it later proves higher you have already given them a figure." },
      { id: "group-event", label: "Hold one event for all clients so everybody hears the same thing",
        reason: "Clients talk to each other and one nervous question can start a stampede. " +
          "One-on-ones first, event second — so the room confirms what each of them already " +
          "heard privately." },
      { id: "wait-conviction", label: "Wait until he is convicted, so you are on firm ground",
        reason: "Years away, and Motorpool has a notification duty of its own running right now " +
          "because of that 6%. Waiting for a criminal standard before telling a client is not " +
          "caution, it is concealment with a rationale." }
    ],
    hints: [
      "Two things constrain what you can say: what you can actually evidence, and what has not " +
      "been proven about a person. Work out what each of those rules out.",
      "In a disclosure you state what you can evidence, characterise what you cannot, and commit " +
      "to updating. A number you cannot support is worse than an honest range, and a name you " +
      "cannot prove is worse than a description — both of them create a liability that did not " +
      "exist a moment earlier.",
      "Of what is left, one arrives cold in writing, one puts every nervous client in one room, " +
      "and one waits for a standard that takes years."
    ]
  }
];

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
export function makeState() {
  return { tier: 5, decisions: {}, picks: {}, multi: {}, month: 0, notes: {} };
}

export function choose(state, pickId, optionId) {
  const p = PICKS.filter(x => x.id === pickId)[0];
  if (!p) return { ok: false, msg: "No such choice." };
  const opt = p.options.filter(o => o.id === optionId)[0];
  if (!opt) return { ok: false, msg: "That is not one of the options." };
  state.picks[pickId] = optionId;
  return { ok: true, msg: opt.consequence, option: opt };
}

export function pickOf(state, pickId) {
  const p = PICKS.filter(x => x.id === pickId)[0];
  if (!p) return null;
  const id = state.picks[pickId];
  return id ? p.options.filter(o => o.id === id)[0] || null : null;
}

/** Whether he is caught at all, and what can be proved about it. The
    business does not die here — the worst case is badly damaged and
    survivable, and every line of it traces to a decision. */
export function outcome(state) {
  const dlp = pickOf(state, "t5-dlp");
  const ret = pickOf(state, "t5-retention");
  const caught = dlp ? dlp.strength >= 2 : false;
  const provable = ret ? ret.strength : 0;

  if (!caught) {
    return { band: "undetected", headline: "He is not caught.",
      detail: "The DLP tightening was the only control looking at content leaving, and it was " +
        "never done. Coriakin is still on the payroll at the end of this tier, still on the " +
        "Motorpool account, and everything he takes from here is taken because of a decision " +
        "that looked like a compliance expense." };
  }
  if (provable <= 0) {
    return { band: "no-case", headline: "Caught, and unprovable.",
      detail: "You know. You cannot show it. Thirty days of logs cannot carry a 45-day " +
        "investigation, so there is no pattern to put in front of anybody. The best available " +
        "outcome is a quiet settlement with an NDA — and he does it to somebody else." };
  }
  if (provable >= 4) {
    return { band: "strong", headline: "Caught, and the case holds.",
      detail: "Most of his run is inside the window you kept, so the figure you give Motorpool " +
        "is evidenced rather than estimated. A referral that survives contact with a court, and " +
        "a client conversation where you are not saying 'about'." };
  }
  return { band: "partial", headline: "Caught, and you can prove the last " + RETENTION_DAYS + " days.",
    detail: "You can evidence the recent months and not the first six. About 18% is a reasoned " +
      "estimate built from what he had access to, what the honeytokens revealed about his " +
      "method, and the volume pattern that survives. Motorpool will ask 'about?' — and the " +
      "uncertainty is itself part of the damage." };
}

/* ---------------------------------------------------------------------
   OBJECTIVES
   --------------------------------------------------------------------- */
import * as D from "./decisions.js";

export const OBJECTIVES = [
  {
    id: "t5-baseline",
    title: "You compared him to his peers, not to himself",
    domains: ["Security operations — alerting and monitoring",
              "Security program management — security awareness (anomalous behaviour recognition)",
              "Threats, vulnerabilities and mitigations — insider threat, espionage"],
    why: "Behavioural analytics work by spotting deviation from a person's own baseline. A " +
         "planted insider's first week is already the compromised behaviour, so there is no " +
         "clean before. Colleagues in the same role do have clean histories — and the limitation " +
         "to teach is that peer analysis needs peers.",
    test: s => D.settled(s, "t5-first-alert"),
    status: s => D.settled(s, "t5-first-alert")
      ? "Kept to yourself, and built from peer comparison over time."
      : "The first alert has not been dealt with."
  },
  {
    id: "t5-deception",
    title: "You manufactured the evidence instead of waiting for it",
    domains: ["General security concepts — fundamental concepts (deception technology)",
              "Security operations — threat hunting",
              "Security operations — digital forensics"],
    why: "Removing access limits damage. Honeytokens manufacture the proof of intent you are " +
         "short of, which is the actual bottleneck — and they do not depend on the adversary " +
         "making a mistake.",
    test: s => D.settled(s, "t5-evidence"),
    status: s => D.settled(s, "t5-evidence")
      ? "Honeytokens set, and touching one is proof rather than suspicion."
      : "You have a volume pattern and no evidence of intent."
  },
  {
    id: "t5-privilege",
    title: "The case was built under direction from the start",
    domains: ["Security operations — incident response",
              "Security program management — governance",
              "Security operations — digital forensics (chain of custody)"],
    why: "Privilege and chain of custody cannot be applied retrospectively. And the standards " +
         "differ: dismissal runs on the balance of probabilities, a conviction needs far more — " +
         "you do not have to win a criminal case to fire somebody.",
    test: s => D.settled(s, "t5-counsel"),
    status: s => D.settled(s, "t5-counsel")
      ? "Counsel engaged on discovery day, so the work is privileged and the evidence survives."
      : "The investigation is running without legal direction."
  },
  {
    id: "t5-attestation",
    title: "You answered the questionnaire truthfully without compromising the case",
    domains: ["Security program management — third-party risk (vendor questionnaires)",
              "Security program management — audits and assessments (attestation)",
              "Security program management — compliance and reporting"],
    why: "Declining to give details is honest and standard. Writing a false statement in a " +
         "contractual document is a material misrepresentation that can void it later — and the " +
         "two are not on the same spectrum, however similar they feel while you are holding the pen.",
    test: s => D.settled(s, "t5-questionnaire"),
    status: s => D.settled(s, "t5-questionnaire")
      ? "True at a level of generality, naming nobody, compromising nothing."
      : "Question 15 has not been answered."
  },
  {
    id: "t5-gap",
    title: "There was no gap between him knowing and his access ending",
    domains: ["Security operations — identity and access management",
              "Security operations — incident response",
              "General security concepts — identity and access management (privileged access)"],
    why: "Everything in a removal is the gap between the subject knowing and the access ending. " +
         "A night, a morning, a few days, a walk to the car — each of them is a window, and the " +
         "person on the other side has a phone.",
    test: s => D.settled(s, "t5-removal"),
    status: s => D.settled(s, "t5-removal")
      ? "Simultaneous, in the room, devices collected, everything he knew rotated."
      : "The removal has not been sequenced."
  },
  {
    id: "t5-carried",
    title: "You helped Motorpool carry the problem you caused",
    domains: ["Security operations — incident response (communication)",
              "Security program management — compliance and reporting",
              "Security architecture — data types and classifications"],
    why: "State what you can evidence, characterise what you cannot, commit to updating. Never " +
         "a bare precise number you cannot support. And going with them to their own customers " +
         "is automatic — you caused their problem, you help carry it.",
    test: s => D.settled(s, "t5-motorpool"),
    status: s => D.settled(s, "t5-motorpool")
      ? "Told in person, one at a time, in evidenced terms — and you are going with them."
      : "Motorpool has not been told."
  }
];
