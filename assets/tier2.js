/* =====================================================================
   TIER 2 — THE BUSINESS STARTS

   Six months. Claw Perfect Trim and Cleaning signs at $95/hr. The same
   house, the same network, the same laptop, the same phone, the same
   person — and now client data lives where personal files live.

   THE THEME: drawing the line between business and personal. The line
   a student draws here is the exact rule Pippin breaks two tiers
   later, which is why this tier is worth playing slowly.

   THREE INCIDENTS, and two of them are connected:

     month 1   the camera, inherited from Tier 1, found only by looking
     month 3   credential phishing — a LOOKALIKE email from Claw, which
               plants the homoglyph skill two tiers before Pippin's BEC
               uses it for real
     month 5   ransomware — the climax, and not a new incident at all.
               It is the Tier 1 negligence accruing interest, and the
               bill arriving the moment there is something worth taking

   TWO KINDS OF DECISION, deliberately kept apart:

     SETS   questions with one correct answer and five near misses.
            The six-option rule applies to every one of them
     PICKS  product choices with no single right answer — MFA, the
            backup regime. The owner settled these as real-world
            options where "picking wrong has real consequences", so
            forcing a correct answer onto them would teach a fact that
            is not true. They are recorded, and they decide what the
            incidents do
   ===================================================================== */

export const ID = 2;
export const NAME = "The business starts";
export const MONTHS = 6;
export const CLIENT = "Claw Perfect Trim and Cleaning";
export const BLURB =
  "Six months on. The same house and the same network, and a first client — so for the first " +
  "time there is something here worth taking. You draw the line between the business and the " +
  "personal, and three things happen: the camera from tonight, a lookalike email, and ransomware.";

/* The data weight mechanic, settled: data has size, and size drives
   restore time. 102GB over a residential upload is a day or more of
   unbillable downtime with a client waiting. */
export const DATA_GB = 102;
export const RANSOM = 8000;

/* ---------------------------------------------------------------------
   PICKS — real choices, real consequences, no "correct"
   --------------------------------------------------------------------- */
export const PICKS = [
  {
    id: "t2-mfa",
    question: "What second factor goes on the business account?",
    brief:
      "You are one person with no budget and a client who expects you to answer the phone. " +
      "Every one of these is something a real small business actually runs. None of them is " +
      "free of a downside, and the one you choose decides what the phishing email in month 3 " +
      "is able to do.",
    options: [
      { id: "none", label: "No second factor — a long password is enough",
        cost: 0, strength: 0,
        consequence: "A password is one secret. When it is typed into a convincing copy of a " +
          "login page, the person reading it has everything. This is exactly how Pippin's " +
          "personal account falls two tiers from now." },
      { id: "sms", label: "A code by text message",
        cost: 0, strength: 1,
        consequence: "Better than nothing and beaten by a SIM swap — your mobile carrier's " +
          "support desk is now part of your security, and you have never met them." },
      { id: "email", label: "A code to your email",
        cost: 0, strength: 1,
        consequence: "If the mailbox falls, the second factor falls with it. It is protecting " +
          "the account with a copy of the account." },
      { id: "totp", label: "A code from an authenticator app",
        cost: 0, strength: 2,
        consequence: "Real protection against a stolen password, and still relayable: a " +
          "convincing fake page can ask for the code and use it while it is live." },
      { id: "push", label: "Push approval with number matching",
        cost: 0, strength: 3,
        consequence: "Holds against someone spamming you with prompts at three in the morning, " +
          "because you have to type a number you can only see on the real screen." },
      { id: "key", label: "A hardware security key",
        cost: 50, strength: 4,
        consequence: "Phishing-resistant — the key checks the site's real address before it will " +
          "answer, so a lookalike domain gets nothing. Costs money you do not have yet, and " +
          "losing it is its own problem." }
    ]
  },

  {
    id: "t2-backup",
    question: "You are responsible for " + DATA_GB + "GB. How is it backed up?",
    brief:
      "Some of this is yours and some of it is Claw's. A residential connection uploads slowly, " +
      "so the size of this number is not trivia — it is how long you are not earning while you " +
      "put it back. Month 5 is going to test whichever of these you choose.",
    options: [
      { id: "none", label: "No backup — the laptop is the copy",
        cost: 0, strength: 0,
        consequence: "One copy is not a backup, it is a single point of failure you have named " +
          "something reassuring." },
      { id: "local", label: "An external drive on the desk",
        cost: 80, strength: 1,
        consequence: "Fast to restore and it is in the same house, on the same network, plugged " +
          "into the machine it is protecting. Whatever reaches the laptop reaches it." },
      { id: "sync", label: "Cloud sync — the folder mirrors automatically",
        cost: 120, strength: 1,
        consequence: "Sync is not backup. It is very good at making sure that whatever happens " +
          "to your copy happens to the other copy, promptly and without being asked." },
      { id: "offsite", label: "An encrypted drive that leaves the house",
        cost: 140, strength: 3,
        consequence: "Survives anything that happens to this building, including the thing that " +
          "happens in month 5. Slow to restore, and only as good as the last time you swapped it." },
      { id: "both", label: "A drive on the desk AND an encrypted one offsite",
        cost: 220, strength: 4,
        consequence: "The local copy is convenience and the offsite copy is survival. Restore " +
          "fast when you can, and still have something when you cannot." },
      { id: "immutable", label: "Offsite, encrypted, and a copy that cannot be overwritten",
        cost: 340, strength: 5,
        consequence: "The professional answer, and more than a one-person business can usually " +
          "justify. It is what you will be buying at Tier 3, after this tier teaches you why." }
    ]
  }
];

/* ---------------------------------------------------------------------
   SETS — six options, one correct, five near misses
   --------------------------------------------------------------------- */
export const SETS = [
  {
    id: "t2-sla",
    tier: 2,
    title: "The response time you sign up to",
    question: "Claw's agreement needs a response time in it. What do you commit to?",
    brief:
      "You are one person. You sleep, you drive between jobs, and you have no cover. Claw is a " +
      "one-van cleaning business — when their laptop dies they cannot invoice, but nobody is in " +
      "danger and nothing is on fire at 2am. The agreement is the first thing you will be held " +
      "to, and it is the first thing a bigger client will ask to see.",
    options: [
      { id: "4h-24x7", label: "Four-hour response, 24 hours a day, seven days a week",
        reason: "You are one person with no cover. The first time this lands at 3am on a Sunday " +
          "while you are asleep you are in breach of your own agreement, and you wrote it." },
      { id: "1h", label: "One-hour response, because fast service wins the account",
        reason: "It wins the account and loses it again. A promise you cannot keep is worse than " +
          "a slower one you can, because the client plans around it." },
      { id: "nbd-business", label: "Next business day, during business hours, with the hours written down",
        correct: true,
        why: "Right — and the reason is not that it is slow. It is that you can actually do it, " +
          "every time, alone, including the week you have flu. An agreement is a promise with a " +
          "consequence attached, and the only good number is one you can hit on your worst day. " +
          "Notice also what you just wrote down: response is not resolution.",
        reason: "" },
      { id: "best-effort", label: "Best effort — no times, so nothing can be breached",
        reason: "Nothing to breach and nothing to sell. The client cannot plan around it, and the " +
          "first serious prospect who reads it will ask what it actually means." },
      { id: "resolution", label: "Next business day RESOLUTION, to keep it simple",
        reason: "Response and resolution are different promises and this one signs up to the " +
          "harder of the two. Some faults take a week and a part from a supplier — you have just " +
          "guaranteed a fix you do not control." },
      { id: "tiered-unstaffed", label: "Four hours for critical, next day for everything else, around the clock",
        reason: "The tiering is right and the coverage is not. Splitting by severity is exactly " +
          "how real agreements work, but every one of those tiers still lands on one person with " +
          "no night cover." }
    ],
    hints: [
      "Do not start with what sounds impressive. Start with the week you had flu, and ask which " +
      "of these you could have honoured that week, alone.",
      "An agreement is a promise with a consequence attached. The right number is not the fastest " +
      "one you can imagine — it is the slowest one the client will accept AND the fastest one you " +
      "can hit every single time, including on your worst day. Where those two overlap is the answer.",
      "Two things separate these. One is whether anybody is awake to honour it. The other is " +
      "whether you have promised to ANSWER or promised to FIX — and those are not the same promise."
    ]
  },

  {
    id: "t2-recovery",
    tier: 2,
    title: "The account that owns the business",
    question: "What is the recovery address on the business account?",
    brief:
      "You are setting up rafikisITS@gmail.com. It will own the domain, the invoicing, the client " +
      "files and eventually the password manager. Somewhere in the setup it asks for a recovery " +
      "address — where to send a reset link if you are ever locked out. Your personal address, " +
      "truman@gmail.com, is already typed into the box as a suggestion.",
    options: [
      { id: "personal", label: "Your personal Gmail — you will always have access to it",
        reason: "And so will anybody who takes it. Whoever controls the recovery address controls " +
          "the account, which means your personal mail is now the master key to the business. " +
          "That is the single hole you are trying to close this tier." },
      { id: "same", label: "The business account itself, so it is self-contained",
        reason: "A recovery address that lives inside the account it recovers is not a recovery " +
          "address. If you are locked out of the mailbox, that is precisely when you need it." },
      { id: "phone-only", label: "No recovery address — just your mobile number",
        reason: "A number that can be moved to somebody else's SIM with a phone call to your " +
          "carrier, and that you will replace when you change handsets. Better than nothing, and " +
          "not a foundation." },
      { id: "separate", label: "A separate recovery mailbox that does nothing else, with its own strong second factor",
        correct: true,
        why: "Right. It is boring, it is free, and it is the whole idea: the thing that can " +
          "recover the business is not the thing you use every day, so compromising your daily " +
          "mail does not compromise the company. Write down where it is — an account you never " +
          "sign into is an account you will forget the details of.",
        reason: "" },
      { id: "spouse", label: "A family member's address, so somebody else can always get you in",
        reason: "Now a person outside the business can take control of it, and their security is " +
          "your security. Kind, practical, and it hands the keys to someone who never signed " +
          "anything." },
      { id: "client", label: "Your client's address, so the business survives if something happens to you",
        reason: "The continuity instinct is sound and this is the wrong instrument entirely. Claw " +
          "can now reset your company's password, read whatever they like, and you have handed a " +
          "customer administrative control of your business." }
    ],
    hints: [
      "Look at what the recovery address is actually FOR, and then ask what somebody could do " +
      "with it if they had it instead of you.",
      "The principle is that a recovery path is a way IN, not just a way back. Anything that can " +
      "restore your access can grant somebody else's. So the question is not 'which address will " +
      "I always have' — it is 'which address, if taken, does the least damage'.",
      "Some of these put the key in something you use all day. Some put it in somebody else's " +
      "hands. What is left is the one where the key does nothing except be a key."
    ]
  },

  {
    id: "t2-network",
    tier: 2,
    title: "Where the client's work lives",
    question: "Claw's files are on your laptop, on the network you inherited. What do you do about it?",
    brief:
      "The house has a television, a games console, a printer, a speaker and four cameras on it — " +
      "one of which you may or may not have dealt with tonight. The laptop you invoice from is on " +
      "the same flat network as all of it. You have a consumer router and no budget.",
    options: [
      { id: "nothing", label: "Nothing — it is your house and you are the only person in it",
        reason: "The number of people is not the risk. The television and the cameras are on that " +
          "network too, they take updates from vendors you have never heard of, and one of them " +
          "may already be talking to somebody." },
      { id: "folder", label: "Put the client's files in a separate folder with a password on it",
        reason: "That is filing, not separation. Everything on that network can still reach the " +
          "machine, and a password on a folder does nothing about the machine being taken." },
      { id: "guest-devices", label: "Move the laptop onto the router's guest network",
        reason: "Closer than it looks and backwards. Guest networks are built to isolate the " +
          "GUEST from your things — you have put the valuable machine in the isolated pen and " +
          "left the cameras with the run of the house." },
      { id: "second-ssid", label: "A separate network for the business, with the household kit on the other one",
        correct: true,
        why: "Right. The client's work sits on its own network, and the television, the console, " +
          "the printer and every camera sit on the other one where they cannot reach it. This is " +
          "the first real segmentation you have done and the idea does not change for the rest of " +
          "the programme — it just gets more zones and better enforcement.",
        reason: "" },
      { id: "vpn", label: "Run a VPN on the laptop so the traffic is encrypted",
        reason: "Encrypts the traffic on its way out and changes nothing about what is sitting " +
          "next to it. The threat here is the device on the other side of the room, and it is " +
          "inside the tunnel with you." },
      { id: "new-laptop", label: "Buy a second laptop that is only ever used for the business",
        reason: "Genuinely helps and does not answer the question. A separate machine on the same " +
          "flat network is still reachable by everything on that network — you have bought a " +
          "second thing to protect rather than protecting it." }
    ],
    hints: [
      "The question is not how to protect the files. It is what else is able to reach the machine " +
      "the files are on. Go and list what is on that network.",
      "Separation is about what can REACH what, not about where things are filed or how the " +
      "traffic is encrypted on its way out of the building. If two things share a network, a " +
      "problem on the cheap one is a problem on the expensive one.",
      "Some of these protect the data and leave the neighbours alone. Some encrypt a journey that " +
      "was never the problem. The one you want changes which devices can talk to the laptop at all."
    ]
  },

  {
    id: "t2-phish",
    tier: 2,
    title: "The email from Claw",
    question: "An email arrives from Claw asking you to sign in and review an invoice. What do you do?",
    brief:
      "It is month three. The mail says: \"Hi — the invoice portal is asking me to re-approve " +
      "your access before I can pay this month. Can you log in and confirm? Sorry for the " +
      "hassle.\" It is signed the way Dana always signs off. The sender reads dana@clawperfecttrim.com. " +
      "You have had eleven mails from Claw this year and they all looked like this. The link goes " +
      "to a page that looks exactly like your sign-in page. You are between jobs and it is raining.",
    options: [
      { id: "signin", label: "Sign in and approve it — it is your client and they are waiting to pay you",
        reason: "This is the one the tier is built around. Everything about it is convincing " +
          "because it was made to be, and the pressure to be helpful about an invoice is the " +
          "whole mechanism. Your password is now somebody else's." },
      { id: "reply", label: "Reply to the email and ask Dana if it is genuine",
        reason: "You have just asked the attacker whether the attacker is genuine, down the same " +
          "channel they control. They will say yes, warmly, and sound exactly like Dana." },
      { id: "forward", label: "Forward it to a colleague to check before you act",
        reason: "There is no colleague. And forwarding it moves the problem rather than answering " +
          "the only question that matters, which is whether that address is really theirs." },
      { id: "hover", label: "Ring Dana on the number you already had, and look hard at the sender's domain",
        correct: true,
        why: "Right, and both halves matter. Ringing the number you ALREADY had — not one from " +
          "the email — verifies out of band, down a channel the attacker does not control. And " +
          "reading the domain character by character is how you find it: clawperfecttrim.com is " +
          "the real one, and this came from c1awperfecttrim.com. A one for an l. Learn this now. " +
          "Two tiers from now somebody registers rafikislTS.com and takes $21,000 off a charity " +
          "with it, and the mail will pass every authentication check there is — because it will " +
          "genuinely have come from the attacker's own legitimate domain.",
        reason: "" },
      { id: "spam", label: "Mark it as spam and get on with your day",
        reason: "Protects you and nobody else. You have not found out whether Claw is being " +
          "impersonated to their other suppliers, and you have not told them. The next invoice " +
          "may be the real one, and you have trained yourself to bin it." },
      { id: "checkspf", label: "Check that the mail passed SPF, DKIM and DMARC, and trust it if it did",
        reason: "The most dangerous wrong answer here, because it is a real control used " +
          "correctly and it still gets you. Those checks prove the mail genuinely came from the " +
          "domain it says — they say nothing at all about whether that domain is the one you " +
          "think. A lookalike domain passes them perfectly." }
    ],
    hints: [
      "Everything you need is in the brief and none of it is in the wording of the message. Look " +
      "at the address it came from, one character at a time.",
      "The principle is verification out of band: when a message asks you to do something, " +
      "confirm it through a channel that message did not choose. Anything you check by replying, " +
      "clicking, or trusting the mail's own credentials is still inside the attacker's reach.",
      "Two of the remaining options confirm the mail using the mail. One protects you and leaves " +
      "your client exposed. The one you want uses something you already had before this arrived."
    ]
  },

  {
    id: "t2-ransom",
    tier: 2,
    title: "Month five",
    question: "Everything is encrypted and the note wants $" + RANSOM.toLocaleString() + ". What do you do first?",
    brief:
      "You sat down this morning to a note on the desktop. Claw's files, your invoices, your " +
      "photographs — all of it. " + DATA_GB + "GB. The number is $" + RANSOM.toLocaleString() +
      ", which is painful and, just about, affordable. That is not an accident; it is priced to " +
      "be paid. Claw has a job booked for Thursday and needs their system. The clock in your " +
      "agreement started the moment you became aware.",
    options: [
      { id: "pay", label: "Pay the $" + RANSOM.toLocaleString() + " — it is cheaper than the downtime",
        reason: "You are paying a criminal for a tool they wrote in a hurry. What comes back is a " +
          "broken decryptor: some files open, some are corrupted, and you restore from backup " +
          "anyway — having now also funded the next one and marked yourself as somebody who pays." },
      { id: "wipe", label: "Wipe the machine immediately and start clean",
        reason: "Fast, decisive, and it destroys the evidence of how they got in — so you cannot " +
          "tell Claw what happened, cannot tell whether their data left, and cannot stop it " +
          "recurring. You have also destroyed any chance of decrypting later." },
      { id: "isolate", label: "Disconnect the affected machines from everything, then work out what you have",
        correct: true,
        why: "Right. Containment before anything else, and notice it is the same instinct as " +
          "Tier 1: stop the bleeding, then find out what you are dealing with. Pulling it off the " +
          "network stops it reaching your backup drive and anything else still clean — and it " +
          "leaves the machine intact, so you can still learn how it got in and still tell Claw " +
          "something true. Then you find out whether your backup survived, which is the question " +
          "this whole tier has been asking since month zero.",
        reason: "" },
      { id: "restore-now", label: "Start restoring from backup straight away — speed is everything",
        reason: "The right destination and the wrong first step. Restore onto a machine that is " +
          "still infected, or while it is still connected to what encrypted it, and you have " +
          "just fed your last clean copy into the same fire." },
      { id: "tell-claw", label: "Ring Claw first — they have a right to know immediately",
        reason: "Honest, and premature by about an hour. You cannot yet tell them what was " +
          "affected or whether their data left, and a notification you have to correct three " +
          "times does more damage than one that comes ninety minutes later and is right. " +
          "Contain first. Then ring them, inside the window you signed up to." },
      { id: "antivirus", label: "Run a full antivirus scan and let it clean the infection",
        reason: "It will find and remove the program, and your files stay encrypted, because " +
          "removing the burglar does not unlock the door they locked. Meanwhile it is still on " +
          "the network reaching everything else." }
    ],
    hints: [
      "Before you decide anything about the money or the client, ask what is still spreading, and " +
      "what is still plugged in that you would very much like to keep.",
      "In every incident the order is the same: contain, then understand, then notify, then " +
      "recover. Steps taken out of that order are not just slower — several of them destroy the " +
      "thing the next step needed.",
      "Of what is left, one option destroys the evidence, one risks your last clean copy, and " +
      "one is the right call made an hour too early. The one you want does nothing irreversible."
    ]
  },

  {
    id: "t2-notify",
    tier: 2,
    title: "Telling the client",
    question: "You have contained it and you know Claw's files were encrypted. What do you tell them?",
    brief:
      "This is the first client notification you have ever made, and the agreement you signed in " +
      "month zero says you tell them within 48 hours of becoming aware. You do not yet know " +
      "whether anything was copied out — only that it was encrypted. You have an offsite copy or " +
      "you do not, depending on what you chose. Dana has a job on Thursday.",
    options: [
      { id: "wait", label: "Wait until you have restored everything, then tell them it is all fixed",
        reason: "You have blown a contractual deadline to deliver better news. If Dana finds out " +
          "later that you knew on Monday and told her on Friday, the thing she stops trusting is " +
          "not your security — it is you." },
      { id: "everything-fine", label: "Tell them there was an issue but their data was never at risk",
        reason: "You do not know that. It is the sentence every organisation regrets, and you " +
          "have to take it back in writing once you find out otherwise. Never say 'no data was " +
          "affected' before you can evidence it." },
      { id: "plain", label: "Tell them today: what happened, what you know, what you do not know yet, and when you will update them",
        correct: true,
        why: "Right, and the part students skip is the third one. Saying plainly what you do NOT " +
          "yet know is not weakness — it is what stops you having to revise the story later, " +
          "which is the thing that actually destroys trust. You are inside the window you signed " +
          "up to, Dana can make her own decisions about Thursday, and every update from here adds " +
          "rather than corrects. This is the dry run for Sam next tier, and for a much worse " +
          "conversation two tiers after that.",
        reason: "" },
      { id: "technical", label: "Send a full technical write-up of the infection and the indicators",
        reason: "Thorough, and aimed at the wrong person. Dana cleans carpets. She needs to know " +
          "what it means for Thursday and for her data, not which file extension was appended." },
      { id: "blame", label: "Explain that it came in through a device you inherited and was not your fault",
        reason: "It may even be true, and it is the wrong first sentence. You are the one holding " +
          "their data. Leading with fault instead of facts reads as positioning, and it is the " +
          "thing they will remember." },
      { id: "verbal", label: "Ring her, explain it properly, and leave it at that",
        reason: "The call is right and stopping there is not. A verbal briefing is not a " +
          "notification — there is no record of what you told her or when, which matters to both " +
          "of you the moment anybody disagrees about it. Ring, then put it in writing." }
    ],
    hints: [
      "Read your own agreement again — the one you wrote in month zero. Then ask what you can " +
      "actually evidence right now, as opposed to what you hope.",
      "A notification has three jobs: be inside the window, be true, and be updatable. Anything " +
      "that trades one of those for a better-sounding story costs you more than the incident did.",
      "One of the remaining options is aimed at the wrong reader, one leads with fault, and one " +
      "leaves no record. The one you want can be added to later without any of it being wrong."
    ]
  }
];

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
export function makeState() {
  return {
    tier: 2,
    decisions: {},      /* decision-set working out, owned by decisions.js */
    picks: {},          /* setId -> optionId, for the product choices */
    month: 0,
    told: {},
    notes: {}
  };
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

/** How badly month 5 goes, from what they actually built. Three bands,
    exactly as the design sets them out — and the offsite copy is the
    one that decides it. */
export function ransomwareOutcome(state) {
  const b = pickOf(state, "t2-backup");
  const strength = b ? b.strength : 0;
  if (strength >= 3) {
    return { band: "contained", headline: "Contained. A bad week.",
      detail: "Your offsite copy was not on the network when this happened, so it is still " +
        "yours. You will spend a day or more pushing " + DATA_GB + "GB back down a residential " +
        "line, unbillable, with Dana waiting — which is the honest argument for keeping a local " +
        "copy as well. But nothing is lost and nobody is paying anybody." };
  }
  if (strength >= 1) {
    return { band: "hurt", headline: "It took the backup too.",
      detail: "What you chose was reachable from the machine it was protecting — plugged into " +
        "it, or mirroring it automatically. So it is encrypted as well, or it faithfully " +
        "replicated the encryption within minutes. This is the moment paying starts to look " +
        "reasonable, and it is the moment it is worst value." };
  }
  return { band: "catastrophic", headline: "There is no copy.",
    detail: "Claw's records, your invoices, your photographs. The only route back is a " +
      "criminal's decryptor, and what comes back from those is partial, corrupted, and paid for." };
}

/* ---------------------------------------------------------------------
   OBJECTIVES — six, every one computed, none of them ticked

   Same contract as Tier 1: nothing here is set by a script. Each one
   is worked out from what is true in the tier right now, so they can
   go backwards, and a student who changes their mind sees it move.

   Labels are domain-and-bullet level against the owner's supplied
   SY0-701 text. NO sub-objective numbers are claimed anywhere,
   because none were supplied — verify/tiers.mjs fails the build if
   one is ever invented.
   --------------------------------------------------------------------- */
import * as D from "./decisions.js";

const set = id => SETS.filter(s => s.id === id)[0];

export const OBJECTIVES = [
  {
    id: "t2-promises",
    title: "You only promised what you can deliver",
    domains: ["Security program management — governance",
              "Security program management — third-party risk"],
    why: "An agreement is the first thing a client holds you to and the first thing a bigger " +
         "client asks to see. The number in it is not a marketing decision — it is an operational " +
         "one, and a one-person business that signs up to round-the-clock cover has written a " +
         "cheque against a night it will spend asleep.",
    test: s => D.settled(s, "t2-sla"),
    status: s => D.settled(s, "t2-sla")
      ? "The response time you signed up to is one you can hit alone, on your worst day."
      : "The agreement with Claw still has no response time you have thought about."
  },
  {
    id: "t2-identity",
    title: "Nothing personal holds the keys to the business",
    domains: ["General security concepts — identity and access management",
              "Security architecture — resilience and recovery"],
    why: "Whoever controls the recovery path controls the account. Put the business's recovery " +
         "on your personal mail and your holiday snaps are now the master key to the company — " +
         "which is, exactly, the mistake an employee makes two tiers from here at much greater cost.",
    test: s => D.settled(s, "t2-recovery"),
    status: s => D.settled(s, "t2-recovery")
      ? "The business can be recovered without going through anything you use every day."
      : "The business account's recovery path has not been separated from your personal one."
  },
  {
    id: "t2-mfa",
    title: "A stolen password is not enough on its own",
    domains: ["General security concepts — identity and access management",
              "Threats, vulnerabilities and mitigations — message-based vectors"],
    why: "Month three is a convincing copy of your own sign-in page. Whether that costs you the " +
         "business depends entirely on whether the password was the only thing standing there.",
    test: s => { const p = pickOf(s, "t2-mfa"); return !!p && p.strength >= 2; },
    status: s => {
      const p = pickOf(s, "t2-mfa");
      if (!p) return "No second factor has been chosen for the business account.";
      if (p.strength >= 2) return "Chosen: " + p.label + ". A password on its own is no longer enough.";
      return "Chosen: " + p.label + ". A stolen password still gets somebody all the way in.";
    }
  },
  {
    id: "t2-separation",
    title: "The client's work cannot be reached from the television",
    domains: ["Security architecture — enterprise infrastructure",
              "Threats, vulnerabilities and mitigations — mitigation techniques"],
    why: "A flat network means a problem on the cheapest thing on it is a problem everywhere. " +
         "This is the first real segmentation of the programme and the idea never changes — it " +
         "only gains zones, and better enforcement, and eventually a standard you have to write.",
    test: s => D.settled(s, "t2-network"),
    status: s => D.settled(s, "t2-network")
      ? "The business sits on its own network. The household kit cannot reach it."
      : "Client work is still on the same flat network as everything else in the house."
  },
  {
    id: "t2-copy",
    title: "There is a copy that survives this building",
    domains: ["Security architecture — resilience and recovery",
              "Security operations — incident response"],
    why: "Sync is not backup — it is very good at making sure whatever happens to your copy " +
         "happens to the other one. The local copy is convenience. The offsite copy is survival, " +
         "and month five is the exam.",
    test: s => { const p = pickOf(s, "t2-backup"); return !!p && p.strength >= 3; },
    status: s => {
      const p = pickOf(s, "t2-backup");
      if (!p) return "No backup has been set up for the " + DATA_GB + "GB you are responsible for.";
      if (p.strength >= 3) return "Chosen: " + p.label + ". Something survives this building.";
      return "Chosen: " + p.label + ". Whatever reaches the laptop reaches this too.";
    }
  },
  {
    id: "t2-handled",
    title: "You handled it in the right order, and you told them properly",
    domains: ["Security operations — incident response",
              "Security program management — compliance and reporting",
              "Security program management — security awareness"],
    why: "Contain, understand, notify, recover. Steps taken out of that order are not merely " +
         "slower — several of them destroy the thing the next step needed. And a notification " +
         "that has to be corrected three times does more damage than one that arrives ninety " +
         "minutes later and is right.",
    test: s => D.settled(s, "t2-ransom") && D.settled(s, "t2-notify"),
    status: s => {
      const a = D.settled(s, "t2-ransom"), b = D.settled(s, "t2-notify");
      if (a && b) return "Contained first, then told Claw what you knew and what you did not.";
      if (a) return "Contained — and Claw has not been told properly yet.";
      if (b) return "Claw has been told, but the first move on the morning was not settled.";
      return "Month five has not been worked through.";
    }
  }
];
