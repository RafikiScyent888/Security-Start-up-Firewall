/* =====================================================================
   TIER 4 — PIPPIN, AND THE TIER WHERE EVERY CONTROL WORKS

   Two years. An office attached to a warehouse, twelve people, six
   remote workers and two field techs. Royal Smile signs — a dental
   surgery — and with them comes a BAA and HIPAA. Novoon signs: nine
   sandwich shops, nine card environments, heavy turnover.

   THE POINT OF THE TIER, and it should be said plainly to students:

     The firewall worked. The network was never breached. No malware
     ran. MDM was fine. The VPN was fine. The SIEM had the evidence all
     along. Every technical control did its job, and the business still
     lost twenty-one thousand dollars and nearly a client.

   WHAT PIPPIN DOES: he sets his work mail to auto-forward to his
   personal account so he can keep up at weekends. He steals nothing
   and hides nothing. He is being productive, the same way Sam was
   being helpful. He broke the AUP he signed on day one.

   THE CHAIN:
     week 1     the rule goes in. Nothing alerts
     weeks 1-5  every client mail, invoice and reset link copies out
     ~week 5    his personal account falls to credential stuffing. Not
                targeted — he was in a list
     weeks 5-9  somebody reads a month of your mail, touching nothing
     ~week 9    a fraudulent invoice to Third Chance Thrift Stores for
                the fit-out of their sixth store, with changed bank
                details, timed to land when the real one would
     ~week 10   Third Chance pays it. Then the phone rings

   THE HOMOGLYPH: the attacker does not send from Pippin's account.
   They register rafikislTS.com — capital I for lowercase L — and send
   from there. It passes SPF, DKIM and DMARC perfectly, because it
   genuinely came from their own legitimate domain. DMARC stops
   somebody spoofing YOUR domain. It does nothing about one that merely
   looks like yours.
   ===================================================================== */

export const ID = 4;
export const NAME = "Pippin, and the tier where every control works";
export const MONTHS = 24;
export const FRAUD = 21000;
export const BLURB =
  "An office, twelve people, and a dental surgery whose electronic records you now hold. Nothing " +
  "technical fails this tier. A good employee removes an obstacle to get his work done, and " +
  "everything after that follows from it.";

export const CLIENTS = [
  { name: "Royal Smile", rate: "Managed + backup + compliance", regime: "HIPAA (via BAA)",
    note: "They keep the paper; you hold the electronic records. Paper PHI is still PHI." },
  { name: "Novoon", rate: "~$5,000/mo", regime: "PCI DSS at nine sites",
    note: "Nine card environments, heavy staff turnover." },
  { name: "Third Chance Thrift Stores", rate: "~$2,000/mo", regime: "Donor privacy, fiduciary duty",
    note: "A sixth store opening. A volunteer board who will have to be told." }
];

/* ---------------------------------------------------------------------
   PICKS
   --------------------------------------------------------------------- */
export const PICKS = [
  {
    id: "t4-mfa",
    question: "Twelve people now. How is the second factor assigned?",
    brief:
      "The professional answer is not \"everyone gets a hardware key\". It is risk-based: protect " +
      "the accounts whose compromise ends the company, and accept friction only where it is earned.",
    options: [
      { id: "flat-push", label: "Push approval with number matching for everybody", cost: 0, strength: 3,
        consequence: "Solid across the board and it treats the domain admin exactly like the " +
          "warehouse. A relay attack against the account that owns everything still works." },
      { id: "flat-keys", label: "Hardware keys for all twelve", cost: 1200, strength: 5,
        consequence: "Strongest and hardest to justify. Twelve keys, twelve backups, and twelve " +
          "people who will eventually leave one at home on the day they are on call." },
      { id: "risk-based", label: "Hardware keys for the admin tier, number-matched push for everybody else",
        cost: 350, strength: 5,
        consequence: "The professional answer. The accounts that could end the company are " +
          "phishing-resistant; everybody else gets strong protection without a key to lose." },
      { id: "totp", label: "An authenticator app for everybody", cost: 0, strength: 2,
        consequence: "Fine against stolen passwords, and relayable in real time by a convincing " +
          "fake page — including for the admin accounts." }
    ]
  },
  {
    id: "t4-detection",
    question: "What are you paying to watch, going into this tier?",
    brief:
      "You cannot afford everything and \"ingest it all\" is the right instinct on the wrong " +
      "budget. These two sensors watch different things at different moments, and which ones " +
      "you own decides whether Pippin costs you nothing or costs you everything.",
    options: [
      { id: "neither", label: "Neither yet — revenue first", cost: 0, strength: 0,
        consequence: "Week 10, when Third Chance rings. Everything." },
      { id: "dlp", label: "Data loss prevention on outbound content", cost: 4800, strength: 2,
        consequence: "Catches it when regulated data first flows outward — weeks, not months. " +
          "Real damage, and survivable. Note what it is watching: content LEAVING." },
      { id: "rules", label: "Alerting on mailbox rule creation and forwarding changes", cost: 1200, strength: 4,
        consequence: "Catches it in week one, at the moment the rule is created, and it never " +
          "happens at all. A forwarding rule is a CONFIGURATION change, not content leaving — " +
          "different sensor, different moment. Mailbox audit logging has to be switched on." },
      { id: "both", label: "Both, plus mailbox audit logging", cost: 6000, strength: 5,
        consequence: "Week one, and you also have the content sensor you will need for a dental " +
          "surgery's records — and, one tier from now, for a spy." }
    ]
  }
];

/* ---------------------------------------------------------------------
   SETS
   --------------------------------------------------------------------- */
export const SETS = [
  {
    id: "t4-contain",
    tier: 4,
    title: "The order is the lesson",
    question: "You have just found the forwarding rule on Pippin's mailbox. What do you do FIRST?",
    brief:
      "It was created in his first week and it is still running. Five weeks of client mail has " +
      "gone to an address you do not control, and for the last four weeks somebody who is not " +
      "Pippin has been reading it. Pippin is at his desk, twenty feet away, and does not know " +
      "you know. Third Chance has already paid the fraudulent invoice.",
    options: [
      { id: "lock-out", label: "Lock Pippin out of everything immediately",
        reason: "The universal first instinct and it is wrong, which is exactly why it is worth " +
          "teaching. Pippin is not the threat — the rule is, and the person reading his Gmail " +
          "is. Lock him out and the attacker still has a month of mail, the forward still runs, " +
          "and you have told the room something is happening." },
      { id: "delete-rule", label: "Delete the forwarding rule so nothing else escapes",
        reason: "So close, and it destroys the evidence of the thing you most need to prove. The " +
          "rule IS the artefact — when it was created, by whom, and where it pointed. Delete it " +
          "and you are left asserting that it existed." },
      { id: "preserve", label: "Preserve first — export the rule, snapshot the mailbox audit log, capture mail flow records, litigation hold",
        correct: true,
        why: "Right, and it is counter-intuitive, which is why students get it wrong. Every " +
          "other step destroys something: deleting the rule destroys the record of it, resetting " +
          "the password tips off the attacker, and locking Pippin out tips off the room. " +
          "Preservation costs you minutes and it is the only step that cannot be taken later. " +
          "Then, in order: kill the forwarding rule to stop the bleeding; revoke sessions and " +
          "tokens and THEN reset credentials, because a password reset alone kills neither the " +
          "rule nor a live session; and only then deal with Pippin the person.",
        reason: "" },
      { id: "reset-password", label: "Reset Pippin's password to cut the attacker off",
        reason: "It changes nothing that matters. The forwarding rule survives a password reset " +
          "— it is a mailbox setting, not a session — and a live session stays live until it is " +
          "explicitly revoked. You have alerted somebody and stopped nothing." },
      { id: "confront", label: "Bring Pippin into a room and ask him what he has done",
        reason: "You do not yet know whether he is careless or complicit, and you have just told " +
          "him. If it is worse than it looks, everything he can still reach is now at risk; if it " +
          "is exactly what it looks like, you have contaminated the account of it." },
      { id: "notify-first", label: "Ring Royal Smile — there may be PHI in that mailbox",
        reason: "You will be ringing them, and the clock is real, and you cannot yet tell them " +
          "scope. The BAA specifies content, and a notification you have to amend three times " +
          "costs you the relationship more surely than the breach does. Complete scope, once." }
    ],
    hints: [
      "Go through each option and ask what it makes impossible afterwards. One of them costs you " +
      "nothing and can only be done now.",
      "In any investigation, the steps that destroy evidence and the steps that alert your subject " +
      "both have to come AFTER the step that records what is true right now. Preservation is " +
      "never the urgent-feeling choice and it is always the first one, because every other action " +
      "is still available in an hour and this one is not.",
      "Of what is left, one tips off the room, one tips off the attacker, one destroys the " +
      "artefact, and one is a phone call you cannot yet make honestly."
    ]
  },

  {
    id: "t4-bec",
    tier: 4,
    title: "How the invoice got through",
    question: "Third Chance paid $" + FRAUD.toLocaleString() + " to the wrong account. Their bookkeeper is a volunteer. What went wrong on THEIR side?",
    brief:
      "The invoice was for the fit-out of the sixth store — POS, network, wifi, cameras — and it " +
      "was the biggest invoice Third Chance had ever been sent. It arrived when the real one " +
      "would have. It looked exactly like yours because it was a copy of yours. The bank details " +
      "were different. The sender read accounts@rafikislTS.com. Your domain is rafikisITS.com. " +
      "Your mail passes SPF, DKIM and DMARC, and so did theirs.",
    options: [
      { id: "no-dmarc", label: "They did not check SPF, DKIM and DMARC",
        reason: "They did, and it passed. This is the misconception the whole incident exists to " +
          "kill: those checks prove a mail genuinely came from the domain it claims. The " +
          "attacker's mail genuinely came from the attacker's own domain, which they own and " +
          "configured properly. Authentication was never the gap." },
      { id: "careless", label: "The bookkeeper was careless — a professional would have spotted it",
        reason: "A capital I and a lowercase l are the same glyph in most sans-serif fonts. This " +
          "is not carelessness, it is typography, and blaming the volunteer means you will not " +
          "fix the thing that actually failed." },
      { id: "no-verify", label: "Nobody verified the changed bank details out of band, against a number they already had",
        correct: true,
        why: "Right, and it is the only control that would have worked. Everything else about " +
          "that mail was genuine-looking because it was genuinely sent from a domain the " +
          "attacker legitimately owns. The single reliable defence against a payment " +
          "redirection is a rule that says: any change to bank details gets confirmed by voice, " +
          "on a number you already held, before anything moves. It is free, it is boring, and " +
          "it is the same out-of-band verification you learned against the lookalike email two " +
          "tiers ago. On your side: lookalike domain monitoring, and defensively registering the " +
          "obvious variants.",
        reason: "" },
      { id: "weak-password", label: "Their mail account was compromised too",
        reason: "It was not. Nothing of Third Chance's was breached — they received a well-formed " +
          "mail from a domain that was not yours and acted on it." },
      { id: "no-mfa", label: "They had no multi-factor authentication",
        reason: "Nobody logged into anything of theirs. MFA protects accounts from being taken; " +
          "this was a payment made voluntarily by an authorised person acting on a convincing " +
          "instruction." },
      { id: "your-breach", label: "Nothing — it was entirely your breach and their process was fine",
        reason: "The first half is fair and the second is what you must not conclude. Your " +
          "mailbox is why the attacker knew what to send and when. But a process that moves " +
          "$21,000 to new bank details on the strength of an email alone will be exploited again " +
          "by somebody else, and part of helping them is saying so." }
    ],
    hints: [
      "Read the two domain names in the brief again, character by character. Then ask what in " +
      "that mail was actually forged — and what was not.",
      "Authentication tells you a message really came from the domain it claims. It cannot tell " +
      "you that the domain is the one you meant. So any control built on 'the mail was genuine' " +
      "is defeated by an attacker who simply owns a domain of their own — and the only remaining " +
      "defence is confirming the instruction through a channel the message did not choose.",
      "Of what is left, two options describe account compromises that did not happen, and one " +
      "blames a person for not seeing two identical glyphs. The one you want is a process, not a " +
      "piece of technology."
    ]
  },

  {
    id: "t4-insurance",
    tier: 4,
    title: "The decent thing and the costly thing",
    question: "Third Chance cannot absorb $" + FRAUD.toLocaleString() + ". They need the money now. What do you do?",
    brief:
      "It was earmarked for the sixth store. A non-profit cannot wait months for a claim to " +
      "settle, and the opening may not survive the delay. A volunteer board has to be told. You " +
      "have cover, or you do not, depending on what you bought at Tier 3 — and nearly every " +
      "policy in existence forbids voluntary payments without the insurer's consent.",
    options: [
      { id: "pay-now", label: "Pay them immediately out of your own funds — it is the right thing to do",
        reason: "It is the humane act and it is the one that voids the claim. Almost every policy " +
          "treats a payment made without consent as a voluntary payment, and the insurer is then " +
          "entitled to decline. You will have done right by them and paid for all of it yourself." },
      { id: "wait-claim", label: "Tell them to wait for the insurance to settle",
        reason: "Correct procedure, and it may cost them the store. Months is not a timescale a " +
          "charity with an earmarked grant can absorb, and 'our insurer is considering it' is not " +
          "something a volunteer board can act on." },
      { id: "notify-then-pay", label: "Notify the insurer first, get consent in writing, and press them for an advance while you tell Third Chance exactly where things stand",
        correct: true,
        why: "Right, and it is the least emotionally satisfying option on the board. Notifying " +
          "first costs you a day and preserves the cover that is the only reason you can pay them " +
          "at all. Consent in writing is what turns a voluntary payment into a covered one. And " +
          "telling Third Chance precisely where things stand — including that you are pushing for " +
          "an advance — treats them as adults. This is the lesson: doing the decent thing FAST " +
          "and doing it PROPERLY are in tension, and the professional move is to do it properly " +
          "and communicate fast. Also learn where this lands: the money left THEIR account, not " +
          "yours, so crime cover may not respond at all and it becomes a third-party liability " +
          "claim on the Tech E&O side.",
        reason: "" },
      { id: "deny", label: "Explain that the fraud was committed against them, not you",
        reason: "Technically arguable and commercially fatal. The attacker knew what to send and " +
          "when because they were reading your mailbox. Hiding behind the transaction's mechanics " +
          "ends the relationship and probably ends up in front of a lawyer anyway." },
      { id: "quiet-discount", label: "Say nothing about liability and quietly discount their fees until it is covered",
        reason: "A concealed settlement. It takes years at $2,000 a month, it never acknowledges " +
          "what happened, and a volunteer board with fiduciary duty cannot accept a benefit " +
          "nobody has explained to them." },
      { id: "police-only", label: "Report it to the police and let the recovery process run",
        reason: "Report it, certainly, and recovery of a transferred payment after ten days is " +
          "rare. Meanwhile nothing has been said to your insurer, nothing to the board, and " +
          "nothing has reached Third Chance's account." }
    ],
    hints: [
      "Before you decide what to pay, go and read what you actually bought at Tier 3 — and read " +
      "the part about what you are not allowed to do without asking.",
      "Insurance is a contract with conditions, and the most commonly broken one is the rule " +
      "against voluntary payments. Anything you settle before the insurer consents may be " +
      "uninsured, however morally obvious it was. So the order is: notify, consent, then act — " +
      "and the speed you owe the client is in the communication, not the transfer.",
      "Of what is left, one argues you are not liable, one conceals a settlement from a board " +
      "that has a duty to know, and one relies on a recovery that almost never arrives."
    ]
  },

  {
    id: "t4-hipaa",
    tier: 4,
    title: "Royal Smile",
    question: "Royal Smile's records were in that mailbox for five weeks. What are you obliged to do?",
    brief:
      "Appointment letters, referrals, imaging queries — patient information, in an unmanaged " +
      "consumer mailbox, for five weeks, and demonstrably read by somebody. You are the business " +
      "associate. The BAA you signed specifies the content and timing of a breach notification " +
      "to the covered entity, and your own SLA says 48 hours from awareness.",
    options: [
      { id: "no-harm", label: "Nothing — no patient has been harmed and nothing was published",
        reason: "Harm is not the test. The four-factor risk assessment asks what information was " +
          "involved, who received it, whether it was actually VIEWED, and how far the risk was " +
          "mitigated. Factor three is fatal here: the attacker demonstrably read the mailbox." },
      { id: "wait-full", label: "Wait until the forensic investigation is complete, then notify once with everything",
        reason: "The instinct — complete scope, once — is right and it does not override a clock. " +
          "You notify within the window with what you know, say what is still being established, " +
          "and update. Missing the deadline to have a tidier story is how a manageable breach " +
          "becomes willful neglect." },
      { id: "notify-full", label: "Notify Royal Smile inside the window, in person and in writing, with what you know and what is still being established — and engage an outside firm",
        correct: true,
        why: "Right, on all three counts. Inside the window because the BAA and your own SLA both " +
          "run from awareness, not from convenience. In writing because a verbal briefing is not " +
          "a breach notification and the BAA specifies content. And an outside firm because " +
          "'we investigated ourselves and found nothing wrong' is not what a covered entity " +
          "wants to hear, and because anything that becomes evidence needs to have been handled " +
          "by somebody independent. Then the part decided months ago: whether this is reasonable " +
          "cause or willful neglect turns on whether you signed that BAA attesting to safeguards " +
          "you actually had.",
        reason: "" },
      { id: "patients", label: "Notify the patients directly — they are the ones affected",
        reason: "Not yours to do. Royal Smile is the covered entity and the notification to " +
          "individuals is theirs to make. Going around them breaches the BAA and takes a decision " +
          "out of the hands of the people who are accountable for it." },
      { id: "verbal", label: "Tell the practice owner in person and keep it between you",
        reason: "The in-person part is right and stopping there is not. There is no record of " +
          "what was disclosed or when, the BAA requires specific content, and 'keeping it between " +
          "you' is asking a covered entity to help you conceal a reportable breach." },
      { id: "terminate", label: "Terminate the BAA and hand the records back before notifying",
        reason: "You cannot outrun the obligation by ending the contract. Return or destruction " +
          "of PHI at termination is one of the BAA's clauses, not a way around the rest of them, " +
          "and doing it in this order looks exactly like what it would be." }
    ],
    hints: [
      "Go back to what the BAA actually says about notification — who you tell, how fast, and " +
      "what has to be in it. Then check it against your own SLA.",
      "A breach assessment turns on four factors, and the decisive one here is whether the " +
      "information was actually viewed rather than merely exposed. And the obligation runs to " +
      "the covered entity, on their clock, in a form they can act on — not to whoever feels most " +
      "affected, and not on the schedule that suits your investigation.",
      "Of what is left, one notifies the wrong people, one leaves no record, and one tries to " +
      "end the contract ahead of the duty. The one you want is fast, written, and independent."
    ]
  },

  {
    id: "t4-rmm",
    tier: 4,
    title: "The tool that reaches everybody",
    question: "Your remote management tool shipped a signed update that turns out to be malicious. It has already pushed to every client. What is the lesson?",
    brief:
      "You did nothing wrong. Your vendor was compromised upstream, the update was properly " +
      "signed with their key, and your RMM did exactly what you bought it to do: deploy to all " +
      "forty managed endpoints within the hour. Royal Smile, Novoon, Motorpool, Third Chance, " +
      "6th Cup. Through your trusted connection.",
    options: [
      { id: "vendor-fault", label: "Nothing — it was the vendor's failure and your clients will understand",
        reason: "Some will and it is not a lesson. Your clients contracted with you, the reach " +
          "was yours, and 'our supplier did it' is the sentence every organisation in a supply " +
          "chain incident tries and none of them enjoys." },
      { id: "no-automation", label: "Automation is too dangerous — go back to manual patching",
        reason: "Forty endpoints by hand means they do not get patched, which is a far larger and " +
          "far more certain risk. The answer to a fast-moving tool is not a slow one." },
      { id: "multiplies", label: "Automation multiplies in both directions — so the blast radius has to be designed in, with staged rings and a tested rollback",
        correct: true,
        why: "Right, and it is the whole supply chain lesson from the direction students never " +
          "expect. The tool that lets twelve people manage forty clients is the tool that lets " +
          "one compromise reach forty clients. You do not answer that by going slower; you " +
          "answer it by deciding in advance how far anything can travel before somebody looks — " +
          "a pilot ring, then a wider ring, then everybody, with a rollback you have actually " +
          "tested. And notice what signature verification did and did not do: it proved the " +
          "update came from your vendor, which was true and useless, because your vendor was the " +
          "one compromised.",
        reason: "" },
      { id: "verify-sigs", label: "Verify signatures on every update before deployment",
        reason: "You did. It passed. The package was signed with the vendor's genuine key, " +
          "because the vendor is who was compromised. A signature proves origin, not " +
          "trustworthiness — and this is exactly the same shape as the lookalike domain that " +
          "passed DMARC." },
      { id: "switch-vendor", label: "Move to a different RMM vendor immediately",
        reason: "A migration under incident conditions, to a vendor whose own supply chain you " +
          "have not assessed either, swapping a known problem for an unknown one. Reassess them " +
          "afterwards, deliberately." },
      { id: "insurance", label: "Claim on the insurance and treat it as a cost of doing business",
        reason: "You will claim, and it is not a control. Nothing about the claim stops this " +
          "recurring, and a second incident of the same shape is what makes an insurer decline " +
          "your renewal." }
    ],
    hints: [
      "Ask what your RMM is FOR, and then ask what that same property does when the thing being " +
      "deployed is hostile.",
      "Any capability that lets a small team act on many systems at once is a capability an " +
      "attacker inherits the moment they reach it. That is not an argument for removing the " +
      "capability — it is an argument for deciding in advance how far a single action may travel " +
      "before a human confirms it.",
      "Of what is left, one is a control that already ran and passed, one swaps vendors mid-" +
      "incident, and one is a claim rather than a change."
    ]
  },

  {
    id: "t4-offboard",
    tier: 4,
    title: "The offboarding that stopped halfway",
    question: "Pippin is dismissed and his account is disabled. A week later something of his authenticates. What was missed?",
    brief:
      "You ran the checklist. The account is disabled, the laptop is back in the cupboard, the " +
      "badge is in the drawer. Then a backup job runs at 02:00 using an API token issued in his " +
      "name, and your monitoring — which you now have — asks why a credential belonging to " +
      "somebody who left is still working. The timing is not kind: you are discovering whether " +
      "your own offboarding finished, using the procedure you just ran.",
    options: [
      { id: "not-disabled", label: "The account was not really disabled",
        reason: "It was. What authenticated was not the account — it was a credential issued " +
          "under it that does not log in like a person and was never asked to." },
      { id: "shared", label: "Somebody else is using his login",
        reason: "Worth ruling out and it is not what happened. Nothing signed in interactively; a " +
          "token presented itself to an API at two in the morning, which is what tokens do." },
      { id: "non-human", label: "Credentials that do not log in like a person — API tokens, app passwords, SSH keys, VPN certificates — all outlive a disabled account unless they are revoked by name",
        correct: true,
        why: "Right, and this is why deprovisioning is a checklist and not a button. Disabling " +
          "the human account stops the human signing in. It does nothing to a token, an app " +
          "password, an SSH key or a VPN certificate, because none of those consults the " +
          "account's enabled flag — they are separate credentials that happen to have been " +
          "issued in his name. An offboarding that only disables the account leaves a live " +
          "credential belonging to somebody who has gone, with nobody watching it. And note what " +
          "this vindicates: certificate-based authentication is the right answer precisely " +
          "BECAUSE a certificate can be revoked centrally and instantly — if you actually run " +
          "the revocation.",
        reason: "" },
      { id: "mfa", label: "His second factor was never unenrolled",
        reason: "Part of a complete offboarding and not this. A second factor is only consulted " +
          "during an interactive sign-in, and nothing signed in." },
      { id: "backup-bug", label: "The backup software is misconfigured and should not be using a personal credential",
        reason: "Both true, and it is a finding rather than the answer. Service work running " +
          "under a named person's credential is its own problem — the reason it still WORKS is " +
          "that the credential outlived the account." },
      { id: "reinstated", label: "Somebody reinstated the account to finish a job",
        reason: "Nobody did, and it would be in the audit log if they had. The token never needed " +
          "the account to be enabled." }
    ],
    hints: [
      "Look at exactly what authenticated, and at what time, and ask whether that thing has ever " +
      "typed a password in its life.",
      "Disabling an identity stops that identity signing in. It does not revoke the credentials " +
      "issued under it — those are separate secrets with their own lifetimes, and most of them " +
      "were designed specifically so that no human has to be present for them to work.",
      "Of what is left, two describe interactive sign-ins that did not happen, and one is a real " +
      "finding about how the job was configured rather than why the credential still works."
    ]
  }
];

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
export function makeState() {
  return { tier: 4, decisions: {}, picks: {}, multi: {}, month: 0, notes: {} };
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

/** Three-way detection, not binary — the design rewards partial effort
    rather than passing or failing. */
export function detectionOutcome(state) {
  const d = pickOf(state, "t4-detection");
  const s = d ? d.strength : 0;
  if (s >= 4) {
    return { band: "prevented", headline: "Week one. It never happens.",
      detail: "The alert fired at the moment the rule was created. Pippin had a conversation " +
        "about the AUP he signed, no damage was done, and nothing else on this page happened. " +
        "That absence teaches nothing on its own — so here is what it was worth: roughly " +
        "$35,000 in reimbursement and discount, plus the forensics, the counsel and the " +
        "notification costs you did not incur. That is the strongest argument for a boring " +
        "control you will ever see." };
  }
  if (s >= 2) {
    return { band: "limited", headline: "Weeks, not months.",
      detail: "Your content sensor caught regulated data flowing outward. Real damage, and " +
        "survivable — the fraud was smaller or did not land, and Royal Smile's exposure is " +
        "days rather than five weeks. Note which sensor saved you and which one would have " +
        "stopped it entirely: a forwarding rule is a configuration change, and DLP watches " +
        "content leaving." };
  }
  return { band: "full", headline: "Week ten, when Third Chance rings.",
    detail: "Five weeks of mail out, four weeks of somebody reading it, $" + FRAUD.toLocaleString() +
      " gone from a charity, and a dental surgery's records in a consumer mailbox. Every " +
      "technical control you owned worked perfectly throughout." };
}

/* ---------------------------------------------------------------------
   OBJECTIVES
   --------------------------------------------------------------------- */
import * as D from "./decisions.js";

export const OBJECTIVES = [
  {
    id: "t4-preserved",
    title: "You preserved before you changed anything",
    domains: ["Security operations — incident response",
              "Security operations — digital forensics",
              "Security operations — data sources"],
    why: "Every other step destroys something. Deleting the rule destroys the record of it, " +
         "resetting the password tips off the attacker, locking him out tips off the room. " +
         "Preservation costs minutes and is the only step that cannot be taken later.",
    test: s => D.settled(s, "t4-contain"),
    status: s => D.settled(s, "t4-contain")
      ? "Preserved, then contained, then credentials — and the person last."
      : "The forwarding rule has been found and not yet acted on in order."
  },
  {
    id: "t4-bec",
    title: "You know why authentication did not save anybody",
    domains: ["Threats, vulnerabilities and mitigations — message-based vectors",
              "General security concepts — security controls",
              "Security program management — third-party risk"],
    why: "DMARC stops somebody spoofing your domain. It does nothing about a domain that merely " +
         "looks like yours — that mail is perfectly authenticated, because it genuinely came " +
         "from the attacker's own legitimate domain. The only defence left is out-of-band " +
         "verification of the instruction.",
    test: s => D.settled(s, "t4-bec"),
    status: s => D.settled(s, "t4-bec")
      ? "You can explain how a properly authenticated email took $" + FRAUD.toLocaleString() + " off a charity."
      : "How the fraudulent invoice got through has not been worked out."
  },
  {
    id: "t4-cover",
    title: "You did right by the charity without voiding the cover",
    domains: ["Security program management — risk management",
              "Security program management — governance",
              "Security program management — compliance and reporting"],
    why: "Nearly every policy forbids voluntary payments without consent. The humane act and the " +
         "costly act are the same act — and the professional move is to do it properly and " +
         "communicate fast, rather than the other way round.",
    test: s => D.settled(s, "t4-insurance"),
    status: s => D.settled(s, "t4-insurance")
      ? "Insurer notified first, consent in writing, and Third Chance told exactly where things stand."
      : "Third Chance is out $" + FRAUD.toLocaleString() + " and nothing has been decided."
  },
  {
    id: "t4-covered-entity",
    title: "The covered entity was notified on their clock, not yours",
    domains: ["Security program management — compliance and privacy",
              "Security operations — incident response",
              "Security architecture — data protection"],
    why: "The four-factor risk assessment turns on whether the information was actually viewed. " +
         "Here it demonstrably was. The obligation runs to Royal Smile, in writing, with content " +
         "the BAA specifies — and an outside firm handles anything that becomes evidence.",
    test: s => D.settled(s, "t4-hipaa"),
    status: s => D.settled(s, "t4-hipaa")
      ? "Notified inside the window, in writing, with an independent investigation behind it."
      : "Royal Smile has not been notified."
  },
  {
    id: "t4-blast-radius",
    title: "How far anything can travel is a decision you made in advance",
    domains: ["Threats, vulnerabilities and mitigations — supply chain vectors",
              "General security concepts — change management",
              "Security operations — hardening and secure baselines"],
    why: "Automation multiplies in both directions. The tool that lets twelve people manage " +
         "forty clients is the tool that lets one compromise reach forty clients — and a " +
         "signature proves origin, not trustworthiness.",
    test: s => D.settled(s, "t4-rmm"),
    status: s => D.settled(s, "t4-rmm")
      ? "Staged rings and a tested rollback, rather than trusting a signature that was never forged."
      : "The RMM compromise has not been worked through."
  },
  {
    id: "t4-deprovisioning",
    title: "Offboarding covers the credentials that never log in",
    domains: ["General security concepts — identity and access management",
              "Security operations — identity and access management",
              "Security program management — audits and assessments"],
    why: "Disabling an identity stops that identity signing in. Tokens, app passwords, SSH keys " +
         "and certificates are separate secrets with their own lifetimes, designed so that no " +
         "human has to be present for them to work.",
    test: s => D.settled(s, "t4-offboard"),
    status: s => D.settled(s, "t4-offboard")
      ? "Tokens, keys and certificates revoked by name — not just an account disabled."
      : "Something belonging to somebody who left is still authenticating."
  }
];
