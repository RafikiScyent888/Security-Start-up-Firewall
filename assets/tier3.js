/* =====================================================================
   TIER 3 — GROWTH, AND THE FIRST PEOPLE

   Eighteen months. Three clients arrive — 6th Cup for the 6th Hour at
   $135/hr with PCI in scope, Motorpool of PMCS across three sites, and
   Third Chance Thrift Stores, a non-profit, on a charity rate. The
   home becomes the offsite backup site. You hire.

   THE THEME: you are no longer the only person who can make a mistake.

   WHAT HAPPENS:

     Sam's invoice       a mis-sent document, self-reported, costing an
                         awkward meeting and very nearly an account
     the lost phone      an employee loses a handset holding the
                         business inbox, Google Voice and the second
                         factor — and you cannot wipe it, because it is
                         their property. You do not get told to buy
                         company devices. You discover you have no
                         other option
     denial of service   the first attack that is not about data at all

   SAM IS THE HEART OF IT. Nothing alerts: well-formed mail, authorised
   sender, approved channel, legitimate business address. Every control
   says this was fine. The damage is commercial, not regulatory —

     The pricing was not wrong. Finding out by accident makes it look
     like a con. The damage is not what they pay, it is how they
     learned it.

   THREE SET SHAPES HERE, and the middle one is the owner's design
   rather than a deviation:

     SETS    six options, one correct, five near misses
     MULTI   six options, THREE correct, pick three. Sam's control
             decision is authored this way in the build document
             because choosing a coherent SET of controls is a
             different skill from choosing the single right action
     PICKS   product choices with consequences and no correct answer
   ===================================================================== */

export const ID = 3;
export const NAME = "Growth, and the first people";
export const MONTHS = 18;
export const BLURB =
  "Three clients, three hires, and the home becomes your offsite site. Somebody who is not you " +
  "sends a document to the wrong client, somebody loses a phone you are not allowed to wipe, " +
  "and somebody points traffic at your connection. None of it is malicious.";

export const CLIENTS = [
  { name: "6th Cup for the 6th Hour", rate: "$135/hr", regime: "PCI DSS",
    note: "~10 devices, a POS, card payments and guest wifi." },
  { name: "Motorpool of PMCS", rate: "~$2,800/mo", regime: "PCI-adjacent",
    note: "Three locations, 25-30 devices, diagnostic kit. Veteran-owned." },
  { name: "Third Chance Thrift Stores", rate: "~$2,000/mo", regime: "Donor privacy, fiduciary duty",
    note: "Non-profit. Five locations and a sixth opening. A volunteer board." },
  { name: "Claw Perfect Trim and Cleaning", rate: "$95/hr", regime: "None",
    note: "Founder pricing nobody has revisited. That is about to matter." }
];

export const STAFF = [
  { name: "Glimfeather", role: "Lower admin. A fellow veteran, an investigation tech in the Army. " +
      "He raises things; he does not resolve them for you." },
  { name: "Sam", role: "Client correspondence and invoicing." },
  { name: "Lucy", role: "Field and workstation support." }
];

/* ---------------------------------------------------------------------
   PICKS
   --------------------------------------------------------------------- */
export const PICKS = [
  {
    id: "t3-insurance",
    question: "Cyber cover — what do you buy?",
    brief:
      "Month five of last tier cost you a week you did not bill for, and you were lucky. Your " +
      "revenue now justifies looking at this properly. Read the sub-limits, not just the headline " +
      "number: social engineering and funds transfer fraud sit in their own, much smaller bucket. " +
      "One tier from now somebody is going to take $21,000 off a charity using your name, and " +
      "which line of this table you picked is going to matter more than you think.",
    options: [
      { id: "none", label: "No cover — you will carry it yourself", cost: 0, strength: 0,
        consequence: "Every pound of a future incident is yours. Documented risk acceptance is a " +
          "legitimate position for a business this size; undocumented is just hoping." },
      { id: "b", label: "$250k cyber only, $25k social-engineering sub-limit — ~$1,500/yr",
        cost: 1500, strength: 1,
        consequence: "No Tech E&O, so a client's negligence claim against you is not covered at " +
          "all. And $25k does not cover the fraud that is coming." },
      { id: "c", label: "$1M cyber + Tech E&O, $100k sub-limit — ~$5,000/yr",
        cost: 5000, strength: 3,
        consequence: "The realistic default, and the one where the lesson lives: business email " +
          "compromise comes out of the $100k, not the $1M. Requires MFA, EDR, offline backups " +
          "and mail filtering at application — say yes on the form when it is not true and the " +
          "insurer can rescind after the claim." },
      { id: "d", label: "$1M cyber + Tech E&O, $500k sub-limit — ~$9,000/yr",
        cost: 9000, strength: 4,
        consequence: "Nearly double the premium for a sub-limit most people never read. Whether " +
          "that is prudent or wasteful depends on a risk you cannot see yet." }
    ]
  },
  {
    id: "t3-devices",
    question: "Three people are starting. Whose hardware do they use?",
    brief:
      "Glimfeather, Sam and Lucy all own perfectly good laptops and phones. Buying three of each " +
      "is real money out of a business that has just started making some.",
    options: [
      { id: "byod", label: "Their own devices — it is what you have been doing", cost: 0, strength: 0,
        consequence: "Cheap today. You cannot enforce encryption, cannot require a screen lock, " +
          "cannot wipe a lost handset, and cannot collect anything when somebody leaves." },
      { id: "phones", label: "Company phones only; laptops stay personal", cost: 1800, strength: 2,
        consequence: "Covers the second factor and the business number. The client data on three " +
          "personal laptops is still outside your control." },
      { id: "full", label: "Company laptops and phones, enrolled in management", cost: 6500, strength: 4,
        consequence: "Capital outlay you feel immediately, and it buys encryption you can prove, " +
          "remote wipe you are allowed to use, and an offboarding where you collect the hardware." }
    ]
  }
];

/* ---------------------------------------------------------------------
   MULTI — six options, three correct, choose three
   --------------------------------------------------------------------- */
export const MULTI = [
  {
    id: "t3-sam-control",
    tier: 3,
    title: "Stopping it happening again",
    question: "Pick THREE controls to put in after Sam's invoice.",
    brief:
      "Sam typed \"Da\" and the autocomplete finished it with the wrong Dana — the one he had " +
      "mailed most recently. Two clients, two contacts with similar names. You have almost no " +
      "money and three of these are free. Choose the three that actually change the outcome, not " +
      "the three that look like action.",
    choose: 3,
    options: [
      { id: "external-warning", label: "A warning banner when a recipient is outside the company",
        correct: true,
        reason: "Free, preventive, and it fires at the exact moment the mistake is being made." },
      { id: "autofill", label: "Clear the autofill history and turn off address auto-completion",
        correct: true,
        reason: "Free, and it removes the actual cause rather than compensating for it." },
      { id: "undo-send", label: "A thirty-second undo-send window",
        correct: true,
        reason: "Free, and thirty seconds is how long it takes to realise what you just did." },
      { id: "links", label: "Send revocable links instead of attachments",
        correct: false,
        reason: "Right idea, wrong tier. It is the better long-term answer and it needs tooling " +
          "and a budget you do not have — and it does nothing about sending the link to the " +
          "wrong person in the first place." },
      { id: "dlp", label: "Data loss prevention scanning outbound pricing",
        correct: false,
        reason: "Right idea, wrong tier — this needs a stack you do not have and a person to " +
          "tune it. Keep the thought. One tier from now PHI arrives, DLP becomes necessary, and " +
          "the same control you are declining here is the one that catches a spy at Tier 5." },
      { id: "footer", label: "A confidentiality footer on every outgoing message",
        correct: false,
        reason: "Feels like action and changes nothing. Nobody has ever un-read a document " +
          "because of a paragraph at the bottom. This is confusing DOCUMENTING a risk with " +
          "CONTROLLING one, and it is the most common mistake on this list." }
    ],
    hints: [
      "Go back to the brief and find the sentence that says what actually happened. Not what was " +
      "sent — what made it go to the wrong person.",
      "A control either removes the cause, catches the error as it is made, or gives you a moment " +
      "to take it back. Anything that only records that a risk exists is documentation, not " +
      "control. And at this size, anything needing a budget is a plan, not a control.",
      "Three of these cost nothing and act at the moment of the mistake. The others are a good " +
      "idea you cannot afford yet, or a paragraph nobody reads."
    ]
  }
];

/* ---------------------------------------------------------------------
   SETS
   --------------------------------------------------------------------- */
export const SETS = [
  {
    id: "t3-sam-notify",
    tier: 3,
    title: "Sam's invoice",
    question: "Claw's invoice went to 6th Cup. Who do you tell, and how?",
    brief:
      "Sam came to you himself, white-faced, about twenty minutes after he sent it. Claw's " +
      "invoice — showing the $95/hr founder rate — went to Dana at 6th Cup, who pays $135/hr. " +
      "Nothing alerted: it was a well-formed mail from an authorised sender down an approved " +
      "channel to a legitimate business address. You tried a recall; there is nothing to recall, " +
      "because it left your organisation. The clock in your agreement started when Sam spoke, " +
      "not when you got round to thinking about it.",
    options: [
      { id: "6th-only", label: "Tell 6th Cup only — they are the ones holding the document",
        reason: "The most popular wrong answer, and it misses who the victim is. Claw's " +
          "commercial information was disclosed to a third party. They are the ones whose data " +
          "this was, and they are the ones you have not told." },
      { id: "claw-only", label: "Tell Claw, and quietly ask 6th Cup to delete it without explaining why",
        reason: "An unexplained request to delete a document invites exactly the question you are " +
          "avoiding, and you have to answer it worse later, having now also looked evasive." },
      { id: "both-person", label: "Tell both, in person, inside the window — and put it in writing afterwards",
        correct: true,
        why: "Right. Claw because their information was disclosed and they are the injured " +
          "party; 6th Cup because they are holding somebody else's document and have to be asked " +
          "to delete it. In person because of what they are about to work out, and in writing " +
          "because a verbal briefing is not a notification. Now the hard part, and it is why " +
          "this works: 6th Cup can see they pay 42% more than Claw. That pricing is entirely " +
          "defensible — more devices, more users, guest wifi, card data in scope. The pricing " +
          "was not wrong. Finding out by accident is what makes it look like a con, and the only " +
          "thing that repairs it is hearing it from you first, with the reasoning.",
        reason: "" },
      { id: "email-both", label: "Email both immediately — speed matters and it gets it on record",
        reason: "The instinct is right and the channel is wrong. You are delivering bad news down " +
          "the exact medium that just failed, to a client who is about to discover a pricing gap. " +
          "That conversation needs a voice and a face." },
      { id: "nothing", label: "Say nothing, fix the tooling, and hope",
        reason: "6th Cup already has the document. When they open it — and they will — you have " +
          "gone from an awkward conversation to a concealed one, and that is what loses the account." },
      { id: "signature", label: "Get written deletion confirmation from 6th Cup, file it, and consider it closed",
        reason: "The signature-and-move-on trap. You now have a tidy record of a breach you never " +
          "told the victim about. Claw still does not know their information was disclosed." }
    ],
    hints: [
      "Two companies are involved and they are involved in different ways. Write down what each " +
      "of them lost and what each of them is now holding.",
      "In a disclosure, the party whose information was exposed always has to be told — that is " +
      "not a courtesy, it is the obligation. The party who received it has a separate and smaller " +
      "duty: to be asked to destroy it. Answering only one of those is answering half the question.",
      "Of what is left, some tell only one of the two parties, and one tells both but down the " +
      "channel that just failed. Ask which one does right by the client who was actually harmed."
    ]
  },

  {
    id: "t3-sam-discipline",
    tier: 3,
    title: "What happens to Sam",
    question: "Sam self-reported within twenty minutes. What is the consequence?",
    brief:
      "He made a genuine mistake, he owned it immediately, and his coming forward is the only " +
      "reason you were inside the window at all. Both clients are watching how you handle it — " +
      "and so are Glimfeather and Lucy, who will decide from this whether it is safe to report " +
      "their own mistakes. One tier from now, an employee who watched this will decide NOT to " +
      "come forward about something deliberate.",
    options: [
      { id: "dismiss", label: "Dismiss him — client data went to the wrong company",
        reason: "Disproportionate to a first-offence autofill error, and it terrifies everybody " +
          "else into hiding their mistakes. You have just made your next incident invisible." },
      { id: "quiet-word", label: "A quiet word, nothing on file",
        reason: "Kind, and it leaves you with nothing. No record, no escalation path if it " +
          "recurs, and nothing you can show a client who asks what you did about it." },
      { id: "unpaid", label: "Three days' suspension without pay",
        reason: "Invisible to the clients, who wanted a fixed process rather than a punished " +
          "person — and it teaches everybody that reporting your own mistake costs you money. " +
          "Docking pay can also create its own problems depending on how somebody is classified." },
      { id: "package", label: "The written-warning package — formal warning on file for 12 months, recorded data-handling training, a time-boxed second check on outbound pricing, and Sam apologises himself",
        correct: true,
        why: "Right, and every piece of it is doing work. The warning is a record that means " +
          "something if it recurs. The training is evidence you can show a client. The " +
          "second-person check is time-boxed — thirty days or twenty clean sends — because a " +
          "control with no end date becomes a permanent tax on somebody who made one mistake. " +
          "And Sam apologising himself is the part that keeps him: he stays a person who owns " +
          "his errors, in front of the people who need to see that owning them is survivable.",
        reason: "" },
      { id: "off-client", label: "Move him off client-facing work permanently",
        reason: "Wastes a good employee and never touches the cause. The autofill is still " +
          "configured the same way for whoever replaces him." },
      { id: "apology-only", label: "Have him apologise to both clients and leave it there",
        reason: "Theatre without a control change. Nothing about the system that produced this " +
          "error is different tomorrow, so it recurs — and the second time, having done nothing " +
          "the first time, is much harder to explain." }
    ],
    hints: [
      "Look again at how you found out about this at all, and ask what each of these options " +
      "teaches the next person who is deciding whether to tell you something.",
      "A consequence has three jobs: it has to be proportionate to what was actually done, it " +
      "has to leave a record you could show a client, and it must not make the next person hide " +
      "their mistake. An option that fails the third one costs you more than the incident did.",
      "Of what remains, one leaves no record at all, one removes the person instead of the cause, " +
      "and one is a performance with nothing behind it. The one you want does several things at once."
    ]
  },

  {
    id: "t3-phone",
    tier: 3,
    title: "The phone on the train",
    question: "Lucy has left her phone on a train. It holds the business inbox, the business number and her second factor. What can you actually do?",
    brief:
      "It is her phone. She bought it, she pays for it, and she uses it for work because that is " +
      "what you asked everybody to do. There is no management software on it, she never signed " +
      "anything about it, and she is extremely upset. It has a six-digit passcode and she thinks " +
      "it was locked.",
    options: [
      { id: "wipe", label: "Remotely wipe the device immediately",
        reason: "You cannot, and this is the lesson. It is her personal property, there is no " +
          "management enrolment on it, and no agreement giving you the right. Wiping somebody's " +
          "personal phone — including their photographs — without that is not a technical " +
          "question, it is a legal one." },
      { id: "ask-wipe", label: "Ask Lucy to wipe it herself from her own account",
        reason: "Closer, and it depends entirely on her cooperation, her remembering her " +
          "credentials, and the handset being online. It is worth doing and it is not a control — " +
          "you are asking, not enforcing, and a control you have to ask for is a favour." },
      { id: "revoke", label: "Revoke her sessions and rotate her credentials and second factor now, then ask her to wipe it",
        correct: true,
        why: "Right, and notice what you did: you could not reach the device, so you went after " +
          "the ACCESS instead. Kill the sessions, rotate the password, re-enrol the second " +
          "factor on something you can reach — and now the handset is a brick holding stale " +
          "tokens, whoever has it. Asking her to wipe it is still worth doing and it is the " +
          "second step, not the first. Then sit with what just happened: the only reason this " +
          "worked is that the access was yours to revoke. The device never was. That is why the " +
          "company buys the hardware from here on — not because somebody told you to, but " +
          "because you have just found out you had no other option.",
        reason: "" },
      { id: "police", label: "Report it to the police and wait to hear",
        reason: "Report it by all means, and it is not incident response. Nothing about your " +
          "client data is safer for having a crime number, and the account is still live while " +
          "you wait." },
      { id: "suspend", label: "Suspend Lucy's account entirely until the phone is found",
        reason: "It does stop the access, and it also stops Lucy working, for something that was " +
          "not her fault and that you set up this way. Revoking sessions and rotating credentials " +
          "achieves the same protection and has her back at her desk within the hour." },
      { id: "nothing", label: "Nothing — it was locked with a passcode and it will turn up",
        reason: "A six-digit passcode is a delay, not a control, and \"she thinks it was locked\" " +
          "is not something you can tell a client. The business inbox and the second factor are " +
          "sitting on a train." }
    ],
    hints: [
      "You cannot reach the device. So stop thinking about the device and write down everything " +
      "that device can currently get INTO.",
      "When you cannot control the endpoint, you control the access instead. Sessions, tokens, " +
      "passwords and second factors are all yours to revoke no matter whose hardware they are " +
      "sitting on — and revocation is immediate, where asking is a request.",
      "One of the remaining options is a favour rather than a control, one protects the data by " +
      "stopping an innocent person working, and one is a crime report doing no security work at " +
      "all. The one you want does not need the phone to cooperate."
    ]
  },

  {
    id: "t3-dos",
    tier: 3,
    title: "The connection goes",
    question: "Motorpool's three sites drop off at once and your monitoring lights up. What is your first move?",
    brief:
      "It is 09:40 on a Tuesday. All three Motorpool sites are unreachable and so is their " +
      "site-to-site link. Their phones still work. Your own office connection is fine. The " +
      "traffic graph at their main site is pinned at the ceiling and has been for four minutes — " +
      "far more than that site has ever pulled. Nothing is encrypted, nothing is ransomed, and " +
      "nobody has asked you for anything.",
    options: [
      { id: "reboot", label: "Reboot the firewall at the main site",
        reason: "The universal first instinct and it does nothing here — the device is not " +
          "faulty, it is drowning. You will lose your own remote access on the way down and come " +
          "back up into the same flood." },
      { id: "restore-backup", label: "Start a restore — something has clearly taken the site down",
        reason: "Nothing has been lost or altered. This is an availability problem, not an " +
          "integrity one, and restoring answers a question nobody asked." },
      { id: "call-isp", label: "Ring the ISP, confirm it is volumetric, and get it filtered upstream",
        correct: true,
        why: "Right, and the reason is bandwidth arithmetic. If more traffic is arriving than " +
          "the line can carry, everything you do on YOUR side of that line happens after the " +
          "damage — the pipe is already full. The only place a volumetric flood can be stopped " +
          "is upstream of the pipe, which means the carrier. This is also the first attack in " +
          "the programme that is not about data at all: nothing has been stolen, nothing " +
          "decrypted, nothing changed. Availability is the third leg, and it is the one people " +
          "forget until a client cannot trade.",
        reason: "" },
      { id: "block-ips", label: "Block the attacking addresses on the site firewall",
        reason: "Reasonable-looking and it cannot work at this scale. The packets have already " +
          "crossed the link to reach your firewall, so the line is saturated whether you drop " +
          "them or not — and with a distributed flood there is no short list to block." },
      { id: "failover", label: "Fail over to the second ISP",
        reason: "Worth doing and it is not first, and it may not help: your public address " +
          "changes on failover, which breaks the site-to-site tunnel, anything published in DNS " +
          "and any client allowlist. If the flood is aimed at a hostname it simply follows you." },
      { id: "tell-motorpool", label: "Ring Motorpool and tell them they are under attack",
        reason: "You will ring them, and not before you know what this is. \"Under attack\" to a " +
          "veteran-owned business with three sites down means something specific, and you cannot " +
          "yet say whether anything of theirs has been touched. Find out, then ring." }
    ],
    hints: [
      "Look at the traffic graph in the brief and ask where that traffic has already been by the " +
      "time your equipment sees it.",
      "You cannot filter a flood on the far side of the pipe it is filling. Whatever arrives has " +
      "already consumed the capacity, so any control that sits at your end is deciding what to do " +
      "with damage that has already happened. Mitigation has to be upstream of the constraint.",
      "Of the options left, one fights the flood after it has crossed the line, one moves you to " +
      "an address the flood can follow, and one makes a phone call you are not yet able to make " +
      "honestly."
    ]
  }
];

/* ---------------------------------------------------------------------
   STATE
   --------------------------------------------------------------------- */
export function makeState() {
  return { tier: 3, decisions: {}, picks: {}, multi: {}, month: 0, notes: {} };
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

/* ---------------------------------------------------------------------
   OBJECTIVES
   --------------------------------------------------------------------- */
import * as D from "./decisions.js";

export const OBJECTIVES = [
  {
    id: "t3-told-both",
    title: "The client who was harmed heard it from you",
    domains: ["Security operations — incident response",
              "Security architecture — data types and classifications",
              "Security program management — compliance and privacy"],
    why: "Judging that a mis-sent invoice is commercially confidential and NOT a regulated " +
         "breach is itself a compliance skill. The classification decides the response — and " +
         "the party whose information was exposed always has to be told.",
    test: s => D.settled(s, "t3-sam-notify"),
    status: s => D.settled(s, "t3-sam-notify")
      ? "Both clients were told, in person, inside the window, and it went in writing afterwards."
      : "Sam's mis-sent invoice has not been notified."
  },
  {
    id: "t3-root-cause",
    title: "You fixed the cause, not the person",
    domains: ["Security operations — incident response and root cause analysis",
              "General security concepts — security controls",
              "General security concepts — change management"],
    why: "The root cause is autofill plus no outbound check. It is not \"Sam is careless\". A " +
         "control either removes the cause, catches the error as it is made, or gives you a " +
         "moment to take it back — anything that merely records that a risk exists is " +
         "documentation wearing a control's clothes.",
    test: s => D.multiSettled(s, "t3-sam-control"),
    status: s => {
      if (D.multiSettled(s, "t3-sam-control")) return "Three controls in, all of them free, all acting at the moment of the mistake.";
      const got = D.multiGot(s, "t3-sam-control").length;
      return got ? got + " of 3 controls chosen." : "No controls have been put in after Sam's invoice.";
    }
  },
  {
    id: "t3-proportionate",
    title: "Reporting a mistake is still survivable here",
    domains: ["Security program management — governance",
              "Security program management — security awareness (reporting)",
              "Threats, vulnerabilities and mitigations — insider threat, unintentional"],
    why: "Sam self-reporting is the only reason you were inside the window. Whatever you do to " +
         "him is what Glimfeather and Lucy learn about reporting their own mistakes — and one " +
         "tier from now, somebody who watched this decides not to come forward.",
    test: s => D.settled(s, "t3-sam-discipline"),
    status: s => D.settled(s, "t3-sam-discipline")
      ? "Recorded, proportionate, time-boxed, and he apologised himself."
      : "Sam's consequence has not been settled."
  },
  {
    id: "t3-access-not-device",
    title: "You can revoke access you do not own the hardware for",
    domains: ["General security concepts — identity and access management",
              "Security operations — identity and access management",
              "Security architecture — mobile solutions"],
    why: "When you cannot reach the endpoint you control the access instead. Sessions, tokens, " +
         "passwords and second factors are yours to revoke no matter whose handset they sit on — " +
         "and discovering that you could not wipe the phone is how a student arrives at company " +
         "hardware by themselves.",
    test: s => D.settled(s, "t3-phone"),
    status: s => D.settled(s, "t3-phone")
      ? "Sessions killed and credentials rotated, without ever touching the device."
      : "The lost phone has not been dealt with."
  },
  {
    id: "t3-availability",
    title: "You understand that availability is the third leg",
    domains: ["General security concepts — CIA",
              "Threats, vulnerabilities and mitigations — denial of service",
              "Security architecture — enterprise infrastructure (resilience)"],
    why: "Nothing was stolen, decrypted or altered, and a client still could not trade. A " +
         "volumetric flood cannot be filtered on the far side of the pipe it is filling — " +
         "whatever arrives has already spent the capacity.",
    test: s => D.settled(s, "t3-dos"),
    status: s => D.settled(s, "t3-dos")
      ? "Mitigated upstream, where the constraint actually is."
      : "Motorpool's outage has not been worked through."
  },
  {
    id: "t3-risk-named",
    title: "The risks you are carrying are ones you named on purpose",
    domains: ["Security program management — risk management",
              "Security program management — third-party risk",
              "Security architecture — resilience and recovery"],
    why: "Documented risk acceptance is a legitimate position. Undocumented is hoping. Cover " +
         "and hardware are both decisions with a price, and both of them are about to be tested " +
         "— so what matters is that you made them deliberately and can say why.",
    test: s => !!s.picks["t3-insurance"] && !!s.picks["t3-devices"],
    status: s => {
      const i = pickOf(s, "t3-insurance"), d = pickOf(s, "t3-devices");
      if (i && d) return "Cover: " + i.label.split("—")[0].trim() + ". Hardware: " + d.label.split("—")[0].trim() + ".";
      if (i) return "Cover decided. The hardware question is still open.";
      if (d) return "Hardware decided. Cover has not been looked at.";
      return "Neither the cover nor the hardware question has been decided.";
    }
  }
];
