/* =====================================================================
   THE PANES THAT ARRIVE LATER

   Settled in section 5 of the build document:

     "Panes move between tabs as tiers unlock, with a note to students
      explaining when and why."

   And for NTK specifically: "Live from Tier 2; later sections locked
   until their tier opens."

   THEY ARE ON THE RAIL FROM THE FIRST MINUTE, LOCKED. Not hidden.

   That distinction is the whole point and it was got wrong once. A
   pane that does not exist yet teaches nothing; a pane that is visibly
   locked tells a student the shape of the job ahead of them and why
   they cannot do it yet. Somebody at Tier 1 should be able to see that
   a business has maintenance and paperwork coming, and should not be
   able to touch either until there is a business.

   A LOCK IS MARKED THREE WAYS, never colour alone, because these
   students have damaged sight: the word "Locked" in the rail, the
   dimmed-but-still-legible label, and a full explanation on the pane
   itself when they open it. Nothing is ever dimmed into uselessness —
   a locked pane's note still meets the 7:1 floor, because it carries a
   reason the student needs.
   ===================================================================== */

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------------
   WHAT UNLOCKS WHEN
   --------------------------------------------------------------------- */
export const LATER = [
  {
    id: "ritscom",
    label: "RITSCOM",
    unlocksAt: 2,
    what: "The main pane once there is a business to run — where it stands, who it works for, " +
          "and what it owes. Short, need-to-know, no fluff.",
    why: "There is no business at Tier 1. You have a house and a router and somebody else's " +
         "mistake to find. RITSCOM opens the moment you sign your first client."
  },
  {
    id: "adt",
    label: "Action Date Tracker",
    unlocksAt: 2,
    what: "Recurring maintenance. Certificate expiry, domain renewal, subscription renewals, " +
          "backup test dates, policy reviews — the things that are nobody's emergency until " +
          "the day they are.",
    why: "Nothing here needs maintaining yet. You own no certificates, no domain and no " +
         "subscriptions, and the only backup that matters is your own. It opens with the business."
  },
  {
    id: "ntk",
    label: "NTK — Need to Know",
    unlocksAt: 2,
    what: "Every agreement you are working inside, readable at any time. Legal writes them; IT " +
          "reads them and lives inside them.",
    why: "You have not signed anything. From Tier 2 you have, and from then on this pane is " +
         "where you check what you actually promised — before you find out the hard way."
  }
];

export function lockedFor(id, reached) {
  const p = LATER.filter(x => x.id === id)[0];
  return p ? reached < p.unlocksAt : false;
}

export function paneFor(id) {
  return LATER.filter(x => x.id === id)[0] || null;
}

/** The note a student reads when they open something they have not
    reached. It says WHAT it is and WHEN it opens, because a locked
    door with no sign on it is just a wall. */
export function lockNote(id) {
  const p = paneFor(id);
  if (!p) return "";
  return `<div class="card">
    <h2>${esc(p.label)} <span class="flag neutral">Locked</span></h2>
    <p><strong>This opens at Tier ${p.unlocksAt}.</strong></p>
    <p>${esc(p.what)}</p>
    <p class="lede">${esc(p.why)}</p>
    <p><button type="button" data-go="campaign">See the five tiers</button></p>
  </div>`;
}

/* ---------------------------------------------------------------------
   RITSCOM
   --------------------------------------------------------------------- */
const CLIENTS_BY_TIER = {
  2: [["Claw Perfect Trim and Cleaning", "$95/hr", "Break-fix. One owner, one van, about three devices."]],
  3: [["Claw Perfect Trim and Cleaning", "$95/hr", "Founder pricing nobody has revisited."],
      ["6th Cup for the 6th Hour", "$135/hr", "POS, card payments, guest wifi. PCI DSS."],
      ["Motorpool of PMCS", "~$2,800/mo", "Three locations, 25-30 devices. Veteran-owned."],
      ["Third Chance Thrift Stores", "~$2,000/mo", "Non-profit. Five stores, a sixth opening."]],
  4: [["Royal Smile", "Managed + compliance", "Dental surgery. You hold the electronic records. HIPAA, via a BAA."],
      ["Novoon", "~$5,000/mo", "Nine sandwich shops. Nine card environments."],
      ["6th Cup for the 6th Hour", "$135/hr", "PCI DSS."],
      ["Motorpool of PMCS", "~$2,800/mo", "Three locations."],
      ["Third Chance Thrift Stores", "~$2,000/mo", "Non-profit, and about to need you badly."],
      ["Claw Perfect Trim and Cleaning", "$95/hr", "Still on the founder rate."]],
  5: [["J. Fenty Jr School", "Full managed + SOC", "Welding trade school. FERPA, GLBA, and workshop kit puts ICS/OT on the table."],
      ["Royal Smile", "Managed + compliance", "HIPAA, via a BAA."],
      ["Motorpool of PMCS", "~$2,800/mo", "Three locations. The real target, though nobody knows it yet."],
      ["Third Chance Thrift Stores", "~$2,000/mo", "Non-profit."],
      ["6th Cup for the 6th Hour", "$135/hr", "PCI DSS."],
      ["Claw Perfect Trim and Cleaning", "$95/hr", "Founder pricing, six years on."]]
};

const STAFF_BY_TIER = {
  2: [["You", "Owner, engineer, salesperson and invoicing clerk."],
      ["Glimfeather", "Early investor turning partner. A fellow veteran. He raises things; he does not resolve them for you."]],
  3: [["You", "Owner."], ["Glimfeather", "Lower admin. An investigation tech in the Army, which nobody here knows."],
      ["Sam", "Client correspondence and invoicing."], ["Lucy", "Field and workstation support."]],
  4: [["You", "Owner."], ["Glimfeather", "Lower admin."], ["Sam", "Client correspondence."],
      ["Lucy", "Field support."], ["Digory", "Workstations."], ["Pippin", "New this tier."],
      ["Six remote", "Edmund, Caspian, Jill, Aravis, Helen, Rilian."],
      ["Field techs", "Frank, Trumpkin."]],
  5: [["You", "Owner, and SOC manager."], ["Glimfeather", "Runs investigations."],
      ["Coriakin", "Has been here since the first day."],
      ["The rest", "Twelve people, a board, and an offboarding checklist that is twelve names long."]]
};

/* The money, as stated averages — never a running balance. Settled:
   "Money, just stated the average facts about doing business so the
   students have a general understanding of it." */
const MONEY_BY_TIER = {
  2: "One client on break-fix at $95/hr. This does not pay a salary yet and it is not supposed to. " +
     "Insurance is visible and unaffordable, which is documented risk acceptance rather than negligence.",
  3: "Roughly $5,000 a month across four clients. Enough to hire, not enough to be comfortable. " +
     "The industry rule of thumb is $150,000 to $200,000 of revenue per employee.",
  4: "The named clients pay around $10,000 a month between them — which cannot carry twelve people. " +
     "Most of the revenue is hardware procurement and cloud brokerage: big numbers, thin slices. " +
     "Managed services is the profitable part and the smallest number, which is true of real MSPs " +
     "and surprises people.",
  5: "Somewhere near $2M of revenue to carry the headcount. And the thing the business actually " +
     "sells is not any of it — it is that it can be trusted with access to other people's networks."
};

export function ritscom(reached, tierStates) {
  const t = Math.min(reached, 5);
  const clients = CLIENTS_BY_TIER[t] || [];
  const staff = STAFF_BY_TIER[t] || [];

  let html = `<div class="card">
    <h2>RITSCOM</h2>
    <p class="lede">RafikisITS. Business state, need-to-know. This is what you would want on one
      screen before a client rings.</p>
    <p><strong>Tier ${t}.</strong> ${esc(MONEY_BY_TIER[t] || "")}</p>
  </div>`;

  html += `<div class="card"><h3>Who you work for</h3>${
    clients.map(([n, r, note]) => `<div class="objective">
      <div class="head"><span class="state">${esc(r)}</span><span class="title">${esc(n)}</span></div>
      <p class="status">${esc(note)}</p></div>`).join("")}</div>`;

  html += `<div class="card"><h3>Who works here</h3>${
    staff.map(([n, note]) => `<div class="objective">
      <div class="head"><span class="title">${esc(n)}</span></div>
      <p class="status">${esc(note)}</p></div>`).join("")}</div>`;

  html += `<div class="card"><h3>How you got bigger</h3>
    <p>You move up a tier when you take on work you cannot serve at your current size — not
      because a calendar moved. And the pattern worth noticing:
      <strong>you tighten after every incident, and the tightening is what wins the next
      client.</strong> The scar tissue is the sales pitch.</p></div>`;

  return html;
}

/* ---------------------------------------------------------------------
   THE ACTION DATE TRACKER

   Filled from CIS Controls Implementation Group 1 — free, respected,
   and explicitly designed for small organisations with limited
   security expertise. Not invented busywork: a defensible baseline
   with a source to point at.
   --------------------------------------------------------------------- */
const CADENCES = [
  ["Daily", 2, [
    ["Backup job results", "Did it run, and did it SUCCEED. Those are two different questions and only one of them is in the summary email."],
    ["Alert triage", "Whatever came in overnight. Most of it is noise and the job is knowing which."]
  ]],
  ["Weekly", 2, [
    ["Patch review", "What is available, what is critical, what breaks if you apply it."],
    ["Failed login review", "A handful is people. A pattern is somebody trying."],
    ["Endpoint protection health", "An agent that stopped reporting three weeks ago is not protecting anything."],
    ["New devices discovered", "You cannot secure what you do not know is there."]
  ]],
  ["Monthly", 3, [
    ["Patch deployment", "Reviewing is not deploying."],
    ["Restore test", "The only test that matters. A backup nobody has restored is a hope."],
    ["Admin account review", "Who holds privilege, and does each of them still need it."],
    ["Firewall rule review", "Stale permits accumulate. Every one was temporary once."],
    ["Licence reconciliation", "What you pay for against what you use."]
  ]],
  ["Quarterly", 3, [
    ["Access review — who has what, and why", "The one that matters most. It would have found Pippin's forwarding rule, and it is what makes an insider's accumulating access visible."],
    ["Disaster recovery test", "Not the backup. The recovery."],
    ["Policy review", "A policy nobody has read since it was written is decoration."],
    ["Vendor review", "Your suppliers are your attack surface."]
  ]],
  ["Annually", 4, [
    ["Insurance renewal", "Read the sub-limits, not the headline number."],
    ["SLA review", "What you promised, against what you can still deliver at this size."],
    ["Certificate renewals", "Certificates expire at 2am on a holiday weekend. That is what this pane is for."],
    ["Awareness training", "With records retained, because a client will ask to see them."],
    ["Continuity exercise", "The one where you find out who actually knows the plan."]
  ]]
];

export function adt(reached) {
  let html = `<div class="card">
    <h2>Action Date Tracker</h2>
    <p>Recurring maintenance. Everything here is a thing that is nobody's emergency until the day
      it is — and every one of them is on a clock somebody has to own.</p>
    <p class="lede">You already know this discipline. <strong>PMCS.</strong> You have stood in a
      motor pool doing before-operation checks on a vehicle that was working perfectly well, and
      you know why. Patch cycles are the intervals. Vulnerability scanning is the walk-around. A
      critical unpatched flaw is <strong>deadlined</strong> — you do not operate until it is fixed.
      The risk register is the faults carried on the 5988-E. Your configuration baseline is the
      -10. Asset inventory is dispatch and the roster. And testing the backup is the operational
      check.</p>
    <p class="lede">Drawn from CIS Controls Implementation Group 1 — free, respected, and written
      for small organisations with limited security expertise. Not invented busywork.</p>
  </div>`;

  for (const [name, from, items] of CADENCES) {
    const live = reached >= from;
    html += `<div class="card"><h3>${esc(name)} ${live ? "" : `<span class="flag neutral">From Tier ${from}</span>`}</h3>
      ${live ? "" : `<p class="lede">Not yet. These arrive at Tier ${from}, when there is enough
        running to need them.</p>`}
      ${items.map(([t, note]) => `<div class="objective" data-met="${live}">
        <div class="head"><span class="state">${live ? "live" : "not yet"}</span>
          <span class="title">${esc(t)}</span></div>
        <p class="status">${esc(note)}</p></div>`).join("")}</div>`;
  }
  return html;
}

/* ---------------------------------------------------------------------
   NTK — NEED TO KNOW

   Taught against four questions. Three and four are where the job
   lives, and they are the two nobody asks.
   --------------------------------------------------------------------- */
const AGREEMENTS = [
  { tier: 2, short: "BPA", name: "Business Partners Agreement",
    signs: "You and Glimfeather.",
    promises: "How two partners share the business, the decisions and the liability.",
    stops: "Either of you acting alone on something that binds both of you.",
    makes: "Agree before you commit. This is governance at its smallest scale, and it grows into " +
           "the board at Tier 5." },
  { tier: 2, short: "MSA", name: "Master Service Agreement",
    signs: "You and the client.",
    promises: "The umbrella everything else hangs off.",
    stops: "Assuming anything not written down. It contains the limitation of liability — the " +
           "number that says what a mistake can cost you.",
    makes: "Know that number before you need it." },
  { tier: 2, short: "SOW", name: "Statement of Work",
    signs: "You and the client.",
    promises: "Exactly what is in scope.",
    stops: "Scope creep. \"Out of scope\" is a boundary, not a suggestion.",
    makes: "Write down what you are actually doing, so both of you can point at it later." },
  { tier: 2, short: "SLA", name: "Service Level Agreement",
    signs: "You and the client.",
    promises: "Response times, and breach notification.",
    stops: "Promising what you cannot deliver on your worst day.",
    makes: "<strong>Notify within 48 hours of becoming aware</strong> — deliberately tighter than " +
           "the usual 72. And response time is not resolution time." },
  { tier: 3, short: "AUP", name: "Acceptable Use Policy",
    signs: "Every employee, on day one.",
    promises: "Business stays business; personal stays personal.",
    stops: "Exactly what Pippin does at Tier 4. This is his clause.",
    makes: "It also carries the monitoring notice that makes reading the logs lawful — which is " +
           "the only reason an investigation into a colleague's mailbox is clean." },
  { tier: 3, short: "NDA", name: "Non-Disclosure Agreement",
    signs: "Every employee, and it survives termination.",
    promises: "Client data does not leave with anybody.",
    stops: "Network diagrams on forums. Client names in a portfolio.",
    makes: "Keep confidences after somebody has gone, which is when it is most likely to matter." },
  { tier: 3, short: "Contract", name: "Employment contract and signed onboarding acknowledgement",
    signs: "Every employee.",
    promises: "The terms.",
    stops: "Somebody saying they were never told.",
    makes: "<strong>This is the artefact that makes every other agreement enforceable.</strong> " +
           "Skip the acknowledgement and you cannot dismiss cleanly when you need to." },
  { tier: 4, short: "BAA", name: "Business Associate Agreement",
    signs: "Royal Smile as covered entity, you as business associate — and any subcontractor you " +
           "hand records to needs their own.",
    promises: "Permitted uses, required safeguards, minimum necessary, breach notification, " +
              "return or destruction at termination.",
    stops: "Touching more than you need. Handing data onward without flow-down.",
    makes: "Notify the covered entity on their clock, in the form the agreement specifies. And " +
           "note the one most commonly missed in real life: <strong>your cloud backup provider " +
           "needs its own BAA.</strong> You do not have to look at the data to be a business " +
           "associate — the ability to access it is enough." },
  { tier: 5, short: "RoE", name: "Rules of Engagement",
    signs: "You and whoever is testing.",
    promises: "What may be tested, when, and by whom.",
    stops: "A penetration test becoming an incident.",
    makes: "Define scope and escalation before anybody touches anything." }
];

export function ntk(reached) {
  let html = `<div class="card">
    <h2>NTK — Need to Know</h2>
    <p>Legal writes them. <strong>IT reads them and lives inside them.</strong> You are not
      learning to draft these; you are learning what is in them, because they decide what you are
      allowed to do and how fast you have to do it.</p>
    <p class="lede">Every one is taught against four questions. The first two are easy and nobody
      forgets them. <strong>The third and fourth are where the job lives.</strong></p>
    <ol>
      <li>Who signs it?</li>
      <li>What does it promise?</li>
      <li><strong>What does it stop me doing?</strong></li>
      <li><strong>What does it make me do, and how fast?</strong></li>
    </ol>
    <p class="lede">Everything is signed on day one and revisited through the first week. Physical
      copies in the personnel file and digital — computers fail, and paper behind physical controls
      is harder to tamper with.</p>
    <p class="lede">General education, not legal advice.</p>
  </div>`;

  for (const a of AGREEMENTS) {
    const live = reached >= a.tier;
    html += `<div class="card">
      <h3>${esc(a.short)} — ${esc(a.name)}
        ${live ? "" : `<span class="flag neutral">Locked until Tier ${a.tier}</span>`}</h3>
      ${live ? `
        <p><strong>Who signs it.</strong> ${a.signs}</p>
        <p><strong>What it promises.</strong> ${a.promises}</p>
        <p><strong>What it stops you doing.</strong> ${a.stops}</p>
        <p><strong>What it makes you do, and how fast.</strong> ${a.makes}</p>`
      : `<p class="lede">This one arrives at <strong>Tier ${a.tier}</strong>. It is listed now so
          you can see what is coming and when — not to be read ahead of the work that makes it
          mean something.</p>`}
    </div>`;
  }
  return html;
}
