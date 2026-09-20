# Security Start-up Firewall — build document

**Status: DESIGN ONLY. There is no code in this repository.**

A Tier 1 build existed — topology map, device console, VOO pane, adversary
engine, objectives ladder, save system, three verifiers, eighteen commits. It
was never uploaded, and the container it lived on was rebuilt on 19 September
2026. The code is gone. This document is the surviving record.

Last updated 20 September 2026.

**Read the confidence markers.**

| Marker | Means |
|---|---|
| **SETTLED** | The owner decided it. Build to this |
| **RECONSTRUCTED** | Recovered, plausible, unverified. Confirm before relying on it |
| **OPEN** | Genuinely undecided. Do not invent an answer |

**The working method, as of 20 September — SETTLED:**

> Talk every detail out before building anything. Order of work:
> **Security → CySA → Core 1 → Core 2 → Networking.** Because students are
> not given real-world examples in school, and this is the controlled
> environment where the instructor can answer their questions.

---

## 1. What this is

A security simulation where a student runs an IT services business from a home
office to a managed SOC, across five tiers. They configure real controls, and
the business reacts to what they actually did — not to a script.

**The founding rule, from Tier 1, which governs everything else:**

> The adversary says nothing. No alert, no banner, no "you have been
> compromised" panel. The only evidence is in the logs. A student who never
> looks never knows — and that is the lesson, because it is what happens to
> people.

The corollary matters as much: **a fix applied late does not undo the breach.**
Containment and prevention are different things.

**Everything is computed from world state.** Objectives are never ticked by a
script; they are derived from what is true in the simulated network right now.
A collapsed tier can go backwards. The grade is the state of the network.

Static HTML/CSS/vanilla JS. No framework, no build step, no runtime fetches.
Deterministic seeded RNG — same world, same seed, same minute, same event, so
an instructor can send a whole class to the same moment.

### The design principle that keeps recurring

**The control that saves the student is one they had to put in place months
earlier, when it looked like paperwork.** Every tier should contain at least
one decision whose consequence does not arrive until the next tier.

Worked examples already in the design:

- Sign the BAA before you can meet it → Pippin's breach becomes willful neglect
- Skip the onboarding acknowledgement → you cannot dismiss Pippin cleanly
- No second ISP at Tier 3 → one cut fibre takes out six remote workers at Tier 4
- Both sites on one carrier → your offsite backup is dark at the same time you are

---

## 2. The business

**RafikisITS.com** — capital R. Business `rafikisITS@gmail.com`, personal
`truman@gmail.com`. The student is the owner throughout, and the SOC manager
by the end.

### Tiers are triggered by work, not by a calendar — SETTLED

> **You move up a tier when you take on work you cannot serve at your current
> size.**

| Transition | Trigger |
|---|---|
| 2 → 3 | Landing 6th Cup and Motorpool — two at once is more than one person carries, so you hire |
| **3 → 4** | **Signing Royal Smile at the end of Tier 3.** Gated by the BAA |
| 4 → 5 | J. Fenty signing. Gated by their **vendor security questionnaire** |

Tier 4 is gated by a **regulatory** instrument, Tier 5 by a **procurement**
one. The student may decline or delay a client — the business simply grows
slower. They may also sign while unready, and that has to remain possible,
because it is the most instructive mistake in the build.

### Timelines — reference points, not deadlines

| Tier | Business time | Shape |
|---|---|---|
| 1 | — | Home network only. The guard: the firewall |
| 2 | 6 months | Home stays a home; the business starts alongside it |
| 3 | 1.5 years | Growth. First three hires. Home becomes the offsite backup site |
| 4 | 2 years | Office attached to a warehouse. Field techs, six remote |
| 5 | 3 years | SOC. The student manages a team and assigns responsibilities |

In his words: *"The student does not run out of time, it just means the
business grows slower. They need to learn and not be rushed."*

### Progression

Tier completes at **6 of 6** objectives. At **5 of 6** they may move on, and
the build explains what they missed and how it will bite later. Replay is
their choice: **"A new night"** (same world, new seed) or **"The hard road"**
(inherit someone else's mess, with a good baseline to work from). Completed
tiers collapse but stay readable.

---

## 3. Clients — all SETTLED

| Tier | Client | Scope | What RafikisITS does | Regime |
|---|---|---|---|---|
| **2** | **Claw Perfect Trim and Cleaning** | One owner, one van, ~3 devices | Break-fix, **$95/hr** — founder rate, never revisited | None |
| **3** | **6th Cup for the 6th Hour** | ~10 devices, POS, card payments, guest wifi | Managed, **$135/hr** | **PCI DSS** |
| **3** | **Motorpool of PMCS** | **3 locations**, ~25–30 devices, diagnostic kit | Managed + multi-site network, ~**$2,800/mo** | PCI-adjacent |
| **4** | **Royal Smile** | Dental surgery — practice management, imaging, records | Managed + backup + compliance controls. **They keep the paper; we hold the electronic records** | **HIPAA** |
| **5** | **J. Fenty Jr School** | Welding trade school — *"Forging veterans into welders"* | Full managed + SOC | **FERPA**, **GLBA**, and workshop kit puts **ICS/OT** on the table |

Every tier adds a new regulatory regime and a new technical problem. That was
not planned and should be preserved.

**The pricing gap is the point.** 6th Cup pays 42% more than Claw, and it is
entirely defensible — more devices, more users, guest wifi, PCI scope. Claw is
on founder pricing nobody revisited. **Founder pricing you never revisit
becomes a liability.**

**Note: paper PHI is still PHI.** Royal Smile's filing cabinet needs locks,
access control and shredding. Their obligation, but the student will be asked.

### How the business actually makes money — SETTLED

The named clients pay roughly **$10,000 a month** between them at Tier 4.
Twelve employees cannot be paid out of $120,000 a year — the industry rule of
thumb is **$150–200k of revenue per employee**, so twelve people needs
somewhere near **$1.5–2M**. Three revenue lines, and two of them explain
things already in the design:

| Line | Shape | Why it matters |
|---|---|---|
| **Hardware procurement and resale** | 30 laptops at $1,200 in, $1,350 out — **$40,500 revenue, $4,500 profit** | Big number, thin slice. **This is what the warehouse is for**, and it gives the field techs a job five days a week rather than only on callouts |
| **Cloud brokerage — the IaaS line** | Client pays $5,000/mo, provider takes $4,200, you keep $800 | The whole $5,000 runs through the books as revenue |
| **Managed services** | The recurring fees priced above | **The profitable part, and the smallest number.** True of real MSPs, and it surprises people |

**And it teaches supply chain from the uncomfortable direction.** Hardware
procurement and cloud brokerage both put RafikisITS *in the middle of somebody
else's supply chain*. Ship a tampered laptop, or lose the reseller account,
and **you are the attack path into every client at once** — the same lesson
Pippin teaches, pointing the same way.

### IaaS: broker plus an on-prem remnant — SETTLED

Not colo. Three places infrastructure lives, all realistic:

| Where | What | What it teaches |
|---|---|---|
| **Cloud, resold and managed** | Client IaaS workloads | **Shared responsibility** — the most misunderstood idea in cloud security |
| **The office** | Backup target, certificate authority, SIEM, file server | Power, physical security, site considerations — without pretending twelve people run a datacentre |
| **The client's site** | Royal Smile's imaging server — X-rays are large and the software wants them local | On-prem you are responsible for but do not own the building of |

On-prem has not died and AI is not what would kill it. CompTIA still tests it
— *"comparing on-premises, cloud, virtualization, IoT, ICS, IaC"* and
*"site considerations, power, platform diversity"*. And many of these students
will work in defence and government, where on-prem and air-gapped is Tuesday.

---

## 4. Staff

**Narnia names for the staff. Tolkien marks the insiders — deliberately.**
Chosen so no two look alike at a glance, and no staff name starts with S, P or
M, which keeps the insiders visually distinct on a busy screen.

| Tier | Who |
|---|---|
| **3** | **Sam** *(insider)*, Lucy, Digory |
| **4** | **+ Pippin** *(insider)* · **Glimfeather** *(lower admin — runs the investigation)* · remote six: Edmund, Caspian, Jill, Aravis, Helen, Rilian · field techs: Frank, Trumpkin |
| **5** | **+ the third insider — RENAMED to a Narnia name** |

**Glimfeather** is the owl from *The Silver Chair* — the one that sees in the
dark. He does the log review.

**The Tier 5 insider gets a Narnia name on purpose.** The student spends two
tiers learning that the odd-one-out names are trouble, and then the pattern
breaks exactly when the stakes are highest. **OPEN: which name.**

Only a handful are ever active in a scenario. The rest earn their keep in
licence counts, access reviews, and an offboarding checklist that is twelve
names long instead of three.

---

## 5. The panes

| Pane | Purpose |
|---|---|
| **RITSCOM** | The main pane, first thing they see. Business state, short, no fluff, need-to-know only |
| **Action Date Tracker** | Recurring maintenance. Certificate expiry, domain renewal, **subscription renewals**, backup test dates, policy reviews |
| **NTK — Need to Know** | Every agreement, readable at any time. Live from **Tier 2**; later sections locked until their tier opens |
| **VOO** | VeteransOvercomingOdds. No part of the business name in it |

Panes move between tabs as tiers unlock, with a note to students explaining
when and why.

### PMCS as the teaching frame — OPEN but recommended

The students all know **Preventive Maintenance Checks and Services**. They have
stood in a motor pool with a 5988-E doing before-operation checks on a vehicle
that was working fine. The whole logic transfers:

| Motor pool | Security |
|---|---|
| PMCS intervals | Patch cycles, log review, access reviews |
| The walk-around | Vulnerability scanning |
| **Deadlined / NMC** | A critical unpatched CVE — you do not operate until it is fixed |
| Faults carried on the 5988-E | The vulnerability and risk registers |
| The **-10** manual's specs | Your configuration baseline |
| Dispatch and the roster | Asset inventory |
| Operational checks | **Testing the backup** |

Most civilian security training has to argue from scratch that maintenance
done when nothing is wrong is the whole point. These students already believe
it. The Action Date Tracker is where this lives.

---

## 6. The agreements

Legal writes them. **IT reads them and lives inside them.** Students learn
what is in each one, not how to draft it. Everything is signed on day one and
revisited through the first week. **Physical copies in the personnel file and
digital** — computers fail, and paper behind physical controls is harder to
tamper with.

Teach every agreement against four questions. Three and four are where the job
lives:

1. Who signs it?
2. What does it promise?
3. **What does it stop me doing?**
4. **What does it make me do, and how fast?**

### Live from Tier 3

| | What it is | Where it bites |
|---|---|---|
| **AUP** | Acceptable Use Policy | Business stays business, personal stays personal. **Pippin's clause.** Also carries the monitoring notice that makes reading the logs lawful |
| **NDA** | Non-Disclosure | Survives termination. No client data leaves with you, no network diagrams posted to forums |
| **MSA** | Master Service Agreement | The umbrella. Contains the **limitation of liability** — the number that says what a mistake can cost |
| **SOW** | Statement of Work | Scope. "Out of scope" is a boundary, not a suggestion |
| **SLA** | Service Level Agreement | **48-hour breach notification** — deliberately tighter than the usual 72. Response time is not resolution time |
| **Employment contract + signed onboarding acknowledgement** | | The artefact that makes all of the above enforceable |

### Arriving later

**BAA** (Tier 4, Royal Smile) · **ISA** if the site-to-site ever terminates at
a client · **DPA**, **MOU/MOA**, **BPA** as the business grows · **Rules of
Engagement** at Tier 5 with pen testing.

### BAA — in full, because it is the gate to Tier 4

| Role | Who |
|---|---|
| Covered Entity | Royal Smile |
| Business Associate | RafikisITS |
| Subcontractor | Anyone RafikisITS hands PHI to — needs their own BAA |

**You do not have to look at the data to be a business associate.** If you have
the *ability* to access PHI — you manage the server, the backups, the mail —
you are in. The conduit exception is narrow and does not cover an MSP.

What is inside it: permitted uses and disclosures · prohibited uses · required
administrative, physical and technical safeguards · **minimum necessary** ·
subcontractor flow-down · breach notification to the covered entity · support
for individuals' access and amendment rights · availability of your books to
HHS · return or destruction of PHI at termination · termination for cause.

Penalties run in four tiers by culpability — unknowing, reasonable cause,
willful neglect corrected, willful neglect not corrected — with annual caps
adjusted yearly. **Teach the tier structure, not dollar figures.**

**The four-factor breach risk assessment:** what PHI, who received it,
**whether it was actually viewed**, and how far the risk was mitigated.

**The student must notice that the cloud backup provider needs its own BAA.**
Most commonly missed item in real HIPAA compliance.

*General education, not legal advice.*

---

## 7. SAM — Tier 3 — COMPLETE

### The incident

Sam sends **Claw Perfect Trim's invoice to 6th Cup**, because autofill
completed the address. Two clients, two contacts with similar names; the wrong
one ranks higher because he mailed her more recently.

**Nothing alerts.** Well-formed mail, authorised sender, approved channel,
legitimate business address. Every control says this was fine.

### The damage

Commercial, not regulatory. 6th Cup sees that Claw pays $95/hr against their
$135/hr.

> **The pricing was not wrong. Finding out by accident makes it look like a
> con.** The damage is not what they pay — it is how they learned it.

Which is why transparency saves the account, and why "quietly fix the tooling
and say nothing" loses it. Deliberately not a regulated breach; HIPAA stays in
reserve for Tier 4.

### Trigger, detection, recurrence

- **Trigger:** the student delegates invoicing or client correspondence to Sam
  **without putting a check on outbound documents.** Fallback at 9 months.
- **Detection:** **Sam self-reports**, as soon as he realises.
- **The 48-hour clock starts when the company becomes aware** — the moment Sam
  speaks, not when the student gets round to reading it. **The timer must be
  visible on screen and already running**, so they learn it by watching rather
  than by being caught out.
- **Recurrence: no.** Sam's incident does not happen twice.
- **Evidence surface:** Sam's own sent items. One line, unflagged, nothing
  highlighted.

### Recall fails, on purpose

Message recall only works inside your own mail organisation. Sending to a
client's domain there is nothing to recall. So the student **attempts it and
it fails** — and that failure teaches why the fix has to be preventive. Asking
6th Cup to delete stays in; it is a real step, and it cannot be verified,
which is the other half of the lesson.

### The three decision points

Noticing it and tracing what went where are **evidence-reading**, not choices.

**1 · NOTIFY**

| | Option |
|---|---|
| ✅ | **Tell both clients inside the 48-hour window, in person.** Claw because their information was disclosed; 6th Cup because they hold someone else's and must be asked to delete it. Document both |
| ❌ | Tell only 6th Cup — they hold the document *(misses that Claw is the victim; most students pick this)* |
| ❌ | Tell only Claw, quietly ask 6th Cup to delete without explaining |
| ❌ | Email both immediately to get it on record *(bad news down the channel that just failed)* |
| ❌ | Say nothing, fix the tooling *(loses the account)* |
| ❌ | Get written deletion confirmation from 6th Cup, close it, never tell Claw *(the "signature and move on" trap)* |

**2 · CONTROL — pick three of six**

| | Option | |
|---|---|---|
| ✅ | External-recipient warning | Free, preventive, catches it at the moment of error |
| ✅ | Autofill hygiene | Free, removes the actual cause |
| ✅ | Undo-send window | Free, thirty seconds of grace |
| ❌ | Revocable links instead of attachments | Right idea, wrong tier — cost and tooling |
| ❌ | DLP on outbound pricing | Right idea, wrong tier — needs a stack they lack |
| ❌ | Confidentiality footer | Feels like action, changes nothing. Confuses *documenting* a risk with *controlling* one |

**3 · DISCIPLINE**

| | Option |
|---|---|
| ✅ | **The written-warning package** — formal warning on file 12 months · recorded data-handling training · time-boxed second-person check on outbound pricing (30 days or 20 clean sends) · **Sam attends and apologises himself** |
| ❌ | Dismiss him *(disproportionate; terrifies everyone else)* |
| ❌ | A quiet word, nothing on file *(no record, no escalation path, nothing to show the client)* |
| ❌ | Three days unpaid *(invisible to clients; teaches the next person to hide it)* |
| ❌ | Move him off client work permanently *(wastes him, never touches the cause)* |
| ❌ | Make him apologise and leave it there *(theatre, no control change — it recurs)* |

Plus: apologise to **both** clients, sit-down meeting with each, show them the
new safeguards. **Both clients stay**, because of the transparency and the
limited impact.

**Instructor note:** docking pay over a partial week can create its own
problems depending on employee classification. An unpaid suspension is not the
model answer for a first-offence autofill slip.

### Objectives — bullet level, against the owner's supplied SY0-701 text

No official sub-objective numbers are claimed; **the supplied text is
domain-and-bullet level.** Labels read as *"Security operations — incident
response"*. **OPEN:** if the numbered objectives are supplied later, relabel
everything, which touches every tier.

One incident reaches all five domains:

- **General security concepts** — *security controls* (preventive, detective,
  corrective, directive and managerial, all from one event) · *CIA:
  confidentiality only* · *change management*
- **Threats, vulnerabilities, mitigations** — *insider threat, unintentional,
  no motivation* · *message-based vector* · *configuration enforcement, access
  control*
- **Security architecture** — *data types and classifications*: an invoice is
  commercially confidential, not regulated, and the classification decides the
  response
- **Security operations** — *incident response and root cause analysis*: the
  root cause is autofill plus no outbound check, **not "Sam is careless"** ·
  *data sources*: the sent item is the only evidence
- **Security program management** — *governance*: who may send what ·
  *business impact analysis* · *compliance and privacy*: judging that this is
  **not** reportable is a compliance skill · *security awareness — reporting*:
  Sam self-reporting is this bullet, literally

### Still open on Sam

**Five additional accidental-insider variants** — the standing five-scenario
rule applies. Not yet designed.

---

## 8. PIPPIN — Tier 4

Hired at the start of Tier 4. He sets his work mail to **auto-forward to his
personal account** so he can keep up at weekends. He steals nothing and hides
nothing. He is being productive, the same way Sam was being helpful.

**He broke policy.** Business stays at business, personal stays personal — the
AUP, signed on day one, with a physical copy in his file.

### The chain

| When | What |
|---|---|
| Week 1 | The rule goes in. Nothing alerts |
| Weeks 1–5 | Every client mail, invoice, reset link and internal argument copies out |
| ~Week 5 | His personal account falls to **credential stuffing** — not targeted, he was in a list |
| Weeks 5–9 | Somebody reads a month of your mail. They touch nothing of yours |
| ~Week 9 | **Fraudulent invoice to Motorpool of PMCS**, timed to land when the real one would, **changed bank details** |
| ~Week 10 | Motorpool pays it. Then the phone rings |

### The damage — SETTLED

- **~$21,000** — a three-site network refresh. Attackers wait for the big one
- Reimbursed in full by the owner, **plus** whatever else Motorpool incurred,
  then **75% of normal rate for a full year**
- **~$2,800/mo × 25% × 12 ≈ $8,400**, plus a week not earning ≈ $5–6k
- **Total ≈ $35,000** — most of a year's profit, caused by a man answering
  emails at the weekend
- **Insurance does not pay**
- **Pippin is dismissed**, and the owner presses charges
- Every client's correspondence was in that mailbox. You must tell **all of
  them** — including 6th Cup, one tier after promising you had fixed how you
  handle their documents
- If Royal Smile is in: **ePHI in an unmanaged consumer mailbox for five
  weeks.** Factor 3 of the risk assessment is fatal — the attacker
  demonstrably read it. **Reportable**

### Why the mail was readable

**Encryption never failed and would not have helped.** TLS in transit worked.
Encryption at rest worked. The attacker **logged in** — the system decrypted
everything for them, because that is its job.

"Plaintext" here means **people typed secrets into message bodies**. Wifi keys,
router passwords, temporary credentials. Worse for an MSP, because **clients
email you their own passwords constantly.** Nobody decided to build a
credential store; RafikisITS built one anyway, one message at a time.

**And password reset links are keys the attacker can mint on demand.** They do
not wait to find one — they click "forgot password" on your registrar, your
RMM, your backup console, and the link arrives in the mailbox they are
reading. **Whoever controls the mailbox controls every account that uses it
for recovery.**

### The traps

- **The password reset that changes nothing** — the forwarding rule survives it
- **Deleting the rule does not unring the bell** — a month is already gone
- **Who else did it?** The access review should find more rules nobody knew
  about. One incident becomes a systemic finding
- **Sam's shadow** — Pippin watched Sam's written warning for an honest
  mistake. His own was deliberate. So he does not come forward

### When it happens — SETTLED

**Scheduled relative to Sam, not to the calendar**, because Sam's incident is
student-triggered and has no fixed date.

> **Pippin's incident fires 12 months after Sam's — but never sooner than 3
> months after Pippin was hired.**

The floor matters twice: it prevents the event landing before Pippin exists if
a student triggers Sam very early, and three months is also the minimum that
makes his behaviour plausible. Nobody sets up a forwarding rule in week one.
People set them up when something in their life changes.

Then **18 months from Pippin's incident to the J. Fenty pitch** — long enough
to recover financially, and the Corrective Action Plan is still running during
the pitch, because those last two to three years.

On the fallback timings: Sam at month 9 of Tier 3 → Pippin at month 3 of
Tier 4 → J. Fenty pitch at month 21 of Tier 4.

### Detection — three-way, not binary — SETTLED

| What they built | When it is caught | Damage |
|---|---|---|
| **Mailbox rule alert** | Week 1, at rule creation | **None. It never happens** |
| **DLP only** | When PHI first flows outward | Weeks, not months. Real but survivable |
| **Neither** | Week 10, when Motorpool rings | Everything |

Rewards partial effort instead of pass/fail. **Mailbox audit logging must be
switched on** — the events are inbox-rule creation/modification and mailbox
forwarding changes. DLP inspects *content leaving*; the forward is a
*configuration change*. Different sensor, different moment.

And it makes the Tier 3 distractor pay off: **DLP was over-engineering at
Tier 3 and is necessary at Tier 4, because PHI arrived. The right control
depends on what you are holding.**

**The reward for getting it right has to be visible.** If they caught it in
week one, nothing happens — and an absence teaches nothing. So they still get
the policy conversation with Pippin, who breached the AUP with no damage done,
**plus an after-action showing what it would have cost.** The $35,000 they did
not spend, made visible. That is the strongest argument for a boring control a
student will ever see.

### Containment — the order is the lesson — SETTLED

**Locking Pippin out is not containment.** It is the universal first instinct
and it is wrong, which is exactly why it is worth teaching. Pippin is not the
threat — the rule is, and the attacker reading his Gmail is. Lock him out and
the attacker still has a month of mail and the forward still runs.

Guide the student through the order that works:

1. **Preserve first.** Export the rule, snapshot the mailbox audit log, capture
   mail flow records, litigation hold. **Before changing anything** — deleting
   the rule destroys the evidence of it
2. **Kill the forwarding rule.** Stop the bleeding
3. **Revoke sessions and tokens, then reset credentials.** In that order. A
   password reset alone kills neither the rule nor a live session
4. **Then** deal with Pippin the person

"Lock him out first" is the distractor most students will pick.

### Who investigates — SETTLED

**Glimfeather**, the lower admin — and this creates a good problem. If the
admin tiering is correct, **a lower admin cannot read mailbox audit logs**;
that is identity-tier access. So the student either breaks their own model or
does it properly: **just-in-time elevation**, time-boxed for the
investigation, then revoked. The JIT concept arriving with a reason to exist.

Two caveats built in: a peer investigating a peer is contestable if it goes
legal, and reading a colleague's mailbox is only clean because the AUP carries
a monitoring notice. So — **Glimfeather collects under the owner's direction,
and an outside firm handles anything that becomes evidence.** "We investigated
ourselves and found nothing wrong" is not what a covered entity wants to hear.

### What it costs if they got it wrong

Illustrative ranges based on the shape of real enforcement. Not a quotation.

| | |
|---|---|
| Reimbursement, the 25% discount, the lost week | **~$35,000** |
| Outside DFIR and forensics | $10,000–$30,000 |
| Breach counsel | $5,000–$15,000 |
| Notification costs | Royal Smile notifies patients; the BAA almost certainly makes you indemnify them |
| Credit monitoring, if offered | $10–$30 per patient per year |
| OCR settlement | Tens of thousands to low six figures for a BA this size |

**Call it $90,000–$200,000+.** Against roughly $120,000 of annual managed-
services revenue, that is existential — the business killer at Tier 4.

**The culpability tier is decided months earlier.** Signed the BAA attesting to
safeguards they had → reasonable cause. Signed attesting to safeguards they did
not have → **willful neglect**, top tier.

**The Corrective Action Plan costs more than the money** — two to three years
of policies, training, monitoring and reporting to HHS. A permanent tax on
twelve people.

**And it follows them into Tier 5.** J. Fenty's vendor questionnaire asks
*"have you had a reportable breach in the last three years?"* They answer yes,
in writing, to win the client that unlocks the tier.

### Keeping Royal Smile

Motorpool survives — the loss was reimbursed and they keep trading. Royal
Smile keeps operating too, because their harm is regulatory and reputational
rather than cash out of the door. Neither is unharmed.

The retention playbook, in order:

1. **Speed** — inside 48 hours, in person, **and in writing.** A verbal
   briefing is not a breach notification; the BAA specifies content
2. **Complete scope, once.** Three follow-up calls saying "actually it was
   also…" loses them more surely than the breach did
3. **Independent investigation**, not Glimfeather alone
4. **Pay for everything without being asked**
5. **Show the fix with evidence** — rule alerting live, DLP configured, AUP
   re-signed, training records
6. **Offer something structural** — monthly security reporting for a year, a
   contract amendment with tighter commitments

Do it well and they stay. Do it badly and they leave, and **the student must be
able to lose them** — not everything is recoverable afterwards.

### Cyber insurance — the student chooses — SETTLED

Prompted to buy at Tier 3 or 4, with the tiers explained and the choice
theirs to learn from.

| | Limit | Social engineering sub-limit | Premium | The catch |
|---|---|---|---|---|
| **A** | None | — | $0 | Everything is yours |
| **B** | $250k cyber only | $25k | ~$1,500 | No Tech E&O, so a client's negligence claim is not covered at all |
| **C** | $1M cyber + Tech E&O | $100k | ~$5,000 | The realistic default. **BEC comes out of the $100k, not the $1M** |
| **D** | $1M cyber + Tech E&O | $500k | ~$9,000 | Nearly double, for a sub-limit most people never read |

Three things they learn by choosing:

- **A policy limit is not one number.** Social engineering and funds transfer
  fraud sit in a separate, much smaller bucket. Students pick C believing they
  have a million dollars of cover
- **The insurer enforces security when the owner will not.** C and D require
  MFA, EDR, offline backups and mail filtering *at application*. Say yes on the
  form when it is not true and the insurer can rescind after the claim
- **Paying Motorpool before notifying the insurer can void the claim.** Nearly
  every policy forbids voluntary payments without consent. **Doing the decent
  thing fast costs you the cover** — and it feels so wrong that it has to be
  taught

Two further wrinkles specific to these facts: **the money left Motorpool's
account, not yours**, so crime cover may not respond at all and it becomes a
third-party liability claim on the Tech E&O side. And after a claim, renewal
premiums commonly jump 50–200%, or the insurer declines.

### The point of the tier

The firewall worked. The network was never breached. No malware ran. MDM was
fine. The VPN was fine. The SIEM had the evidence all along.

> **Every technical control did its job, and the business still lost
> twenty-one thousand dollars and nearly a client.**

Four consequence tracks off one act: **employment** (gross misconduct),
**contractual** (RafikisITS breached its client agreements — the serious one),
**regulatory** (HIPAA via the BAA), **criminal** (narrow, depends on
jurisdiction and whether he circumvented a control).

### The rhyme — build it deliberately

Tier 3: an invoice goes to the **wrong client, by accident**, and costs an
awkward meeting. Tier 4: a **fake invoice goes to the right client, on
purpose**, and costs them real money.

---

## 8b. Pippin's five variants — Tier 4

The standing five-scenario rule. All five share one archetype, which is what
makes them a set rather than a list:

> **A good employee removes an obstacle to get their work done, and creates an
> uncontrolled path in the process.** No malice. Every one of them would tell
> you about it if you asked.

Decision sets (six options, one correct) are **not yet written** for any of
these — that is the next conversation per variant.

### 1 · The shared account

New field techs start Monday and provisioning takes a week, so someone makes a
shared login the whole team uses.

- **Why it's rational:** the work is waiting and the process is slow
- **What breaks:** attribution. You cannot tell who did what, and every audit
  log becomes worthless
- **Caught by:** one account signing in from four places at once — impossible
  travel
- **Control:** real provisioning, named accounts, JIT elevation
- **Objectives:** *IAM — provisioning* · *data sources* · *governance — roles
  and responsibilities*

### 2 · The consumer cloud drive

A remote worker cannot get a 4GB file through the VPN, so they move it via
personal Google Drive.

- **Why it's rational:** the sanctioned path is too slow — **and the student
  made it slow**, by backhauling all remote traffic through the office
- **What breaks:** client data in a consumer service with no DPA, no BAA, no
  logging, no deletion
- **Caught by:** DNS and firewall logs showing consumer file-sharing traffic
- **Control:** provide a fast sanctioned path, DNS filtering, **and fix the
  VPN** — shadow IT exists when the official way is worse
- **Objectives:** *threat actors — shadow IT* · *DNS filtering* · *data
  protection* · *cloud vulnerabilities*

**The strongest of the five**, because the root cause is the student's own
architecture decision coming back for them.

### 3 · The standing remote access

A field tech is tired of requesting access on every callout, so they install
AnyDesk on a client's server with a fixed password.

- **Why it's rational:** saves twenty minutes on every single visit
- **What breaks:** an unmanaged, unlogged, internet-reachable backdoor **into a
  client's network**. Compromise it and you are the route into your own client
- **Caught by:** an unexpected listening service, outbound traffic to a
  remote-access vendor, or the client's own firewall logs
- **Control:** sanctioned RMM with MFA and logging; asset inventory that
  notices unknown software
- **Objectives:** *supply chain vectors* · *unsecure networks* · *asset
  management* · *hardening*

The supply chain lesson running in the direction students never expect —
**you** as the threat to the client.

### 4 · The exclusion that stayed

EDR keeps quarantining a client's legitimate line-of-business application, so
someone adds a folder exclusion to make the work possible.

- **Why it's rational:** the tool was wrong and the work was real
- **What breaks:** an exclusion is a permanent blind spot, and attackers go
  looking for exactly those to stage payloads in
- **Caught by:** **configuration drift** — live config diverging from the
  golden baseline. This is where the drift teaching pays off
- **Control:** change management, exclusions documented **with an expiry date
  on the Action Date Tracker**, tamper protection
- **Objectives:** *configuration enforcement* · *change management* · *secure
  baselines* · *monitoring*

### 5 · The offboarding that stopped halfway

Someone leaves. Their account is disabled. Their API token, app password, SSH
key and VPN certificate all keep working.

- **Why it's rational:** the checklist said "disable the account", and nobody
  thought about credentials that do not log in like a person
- **What breaks:** a live credential belonging to someone who left, that
  nobody is watching
- **Caught by:** authentication from a credential whose owner is gone; an
  access review
- **Control:** an offboarding checklist covering tokens, keys, certificates and
  shared credentials — and the certificate revocation already agreed
- **Objectives:** *IAM — provisioning and deprovisioning* · *access control* ·
  *audits and assessments*

**The timing is the gift:** it fires right after the student dismisses Pippin,
so they discover whether their own offboarding actually finished — using the
very procedure they just ran.

---

## 9. Tier 4 infrastructure

### Connectivity — SETTLED

| | |
|---|---|
| **Prism Fibre** | 1 Gig symmetric. Primary. *(The name is a deliberate in-joke — PRISM, the NSA programme)* |
| **Netcom Cable** | A cable company that also sells **symmetric business fibre**. 1 Gig, at parity |
| **Second ISP arrives at Tier 3.** Failover **automatic** from Tier 3 | |
| **The student picks the second carrier** when they move to their own building | |

**Both the home and the new office start on Prism** — because you go with the
provider you already have a relationship with. **This is a deliberate trap:** a
Prism outage takes down *both ends* of the site-to-site VPN at once, so the
office redundancy does not help. Learn it the hard way.

**Diversity is about the path, not the speed.** Two symmetric gigabit fibres in
one duct is still one digger from an outage. Ask both carriers for a **path
diversity statement**.

**The public IP changes on failover.** The failover works perfectly and you
still cannot reach your backup site or your client — internet came back,
*connections* did not. Breaks: the site-to-site tunnel (far end expects the
Prism address), remote workers dialling a fixed IP, anything published via
DNS, and **client allowlists**. Fixes are cheap in advance: hostname with
dynamic DNS, **both** addresses as accepted peers, **TTL at 300 seconds before
you need it**, and give clients both IPs.

### Owning your addresses — SETTLED

| Tier | What |
|---|---|
| **4** | **Buy PI address space**, and have **Prism announce it.** You now own the addresses; changing the line no longer changes your IP. No ASN needed — Prism announces from their AS |
| **5** | **Your own ASN + BGP to both carriers.** Now you announce them yourself and the *route* fails over |

**An ASN without BGP does nothing** — it is the identifier used inside BGP.
ARIN will not issue one unless you are multihomed and need it. You can own
addresses before you can announce them; you cannot announce before you own.

Costs, approximate and moving: IPv4 on the transfer market ~**$30–50 per
address**, so a /24 is roughly **$8–13k** one-off, plus ARIN annual fees, plus
a router that speaks BGP and somebody who can run it.

### Access — SETTLED

- **Six remote employees: full-tunnel VPN into the office**, so their cloud
  activity can be monitored. Two consequences to build in, not trip over: the
  office internet becomes a single point of failure for six people, and
  **Microsoft's own guidance is to split-tunnel M365** — backhauled, Teams and
  Outlook get noticeably worse
- **Field techs: company-issued hotspot** with its own SIM. **Private APN at
  Tier 5**, when enterprise responsibility arrives
- **The hotspot is not the control.** These are: **always-on VPN, fail-closed**
  (no tunnel, no internet), **certificate-based auth**, full-disk encryption,
  MDM, remote wipe, and public Wi-Fi never — the captive portal happens
  *before* the tunnel comes up
- **Certificate-based VPN auth for Royal Smile and J. Fenty.**
  Phishing-resistant, device-bound, **revocable centrally and instantly** —
  which is the Pippin offboarding problem solved properly. Requires a **PKI**:
  CA, issuance, renewal, revocation via CRL or OCSP. **Certificates expire at
  2am on a holiday weekend** — which is what the Action Date Tracker is for

### Backups — SETTLED

> **You choose an RPO and an RTO, and the method follows.**

**Revisited at every tier**, because the responsibility grows.

| Tier | At stake | What it drives |
|---|---|---|
| **1** | Personal files | External drive. Learn the habit |
| **2** | First client data | Three copies, two media, one offsite — **unnamed**, their choice of how |
| **3** | Three clients, **ransomware live** | Offline encrypted drive to the home. **Immutable copies** |
| **4** | **PHI** | Encryption as **safe harbour**. Retention periods. **The cloud backup provider needs its own BAA** |
| **5** | Student records, five clients | Per-client RPO/RTO in contract. Air-gapped. Restore testing as documented procedure |

Standards: **AES-256** full-volume · **hardware-encrypted drive with a keypad**
for transport, no host dependency · **the passphrase never travels with the
drive** · **key escrow** in a vault · **immutable/WORM** copies · **chain of
custody** on handover (owner or trusted person, never both on holiday at once)
· **tested restores**.

**Encryption is HIPAA's safe harbour.** Lose an encrypted drive with the key
uncompromised and it is *not* reportable. Lose an unencrypted one and it is.
Same drive, same car park, entirely different year.

### SIEM

Ingesting: UTM/firewall, VPN concentrator, DNS, EDR, identity and
authentication, server logs, backup job results, and the managed client
environments. **Mailbox audit logging on**, for the Pippin detection.

"Everything" is the right instinct and the wrong budget — ingest what answers
an investigation question.

---

## 10. Open

### Tier 4, next up

- **Decision sets for the five variants** — six options each, not yet written
- Which **UTM panes** unlock here
- What **attacks** land at this tier
- The **governance questionnaire** at the 4→5 gate
- **Employees as sensors** — the Tier 3 staff report and do not fix, so the
  tier's difficulty is **triage**, not volume. *Owner's reading to confirm*

### Segmentation — SETTLED in principle

**It changes shape across the tiers rather than disappearing:**

| Tier | What the student does with it |
|---|---|
| 2–3 | **Configures it**, hands on, one zone at a time |
| 4 | **Writes the standard**, applies it by template, verifies it |
| 5 | **Audits it** — catches drift, and answers for it in the questionnaire |

A SOC manager does not configure the switch and is still accountable for the
design. **Guide them through it; if they make a mistake that still works but
causes problems later, keep the mistake.** They learn from it and fix it.

**Enforcement is five layers.** VLANs *separate*; they enforce nothing:

1. **Where zones meet** — inter-VLAN traffic hits the UTM or an L3 ACL.
   **Default deny**, then permit with a documented reason. Permit-all-then-
   deny-exceptions is how you get `permit any any`
2. **Inside a zone** — private VLANs, port isolation, wireless client
   isolation, so cameras and guests cannot reach *each other*
3. **At the port** — **802.1X / NAC.** No VLAN until the device authenticates;
   unknown devices land in quarantine. Disable unused ports. MAC filtering is
   theatre
4. **On the host** — host firewalls, the last line once someone is inside a
   zone. Microsegmentation in embryo
5. **At identity** — conditional access. Network position is a weak boundary
   when people are everywhere; **identity becomes the perimeter**

**And test it.** Sit on the guest wifi and try to reach the server VLAN. If
you get there, the segmentation is a drawing. Plus **scheduled firewall rule
review** on the Action Date Tracker to kill stale permits.

**The zones:** management (jump host only) · staff · warehouse/operations ·
servers · **client data, one per client** · guest wifi · VPN pool (*not* the
staff LAN) · physical security · quarantine.

**Physical security is revisited twice** — when the company moves from the
home to the building, and again at 3→4 when it becomes an IaaS provider. It is
also a callback with teeth: **Tier 1's entire adversary was a camera with
factory credentials.** Drop the new cameras on a flat network and Tier 1 did
not stick.

### Multi-tenancy — SETTLED

**One container, everything in it — the spine of the whole build.** The same
root cause, three costumes:

| | |
|---|---|
| Tier 3 | One address book → Sam mails the wrong client |
| Tier 4 | One mailbox → Pippin leaks every client at once |
| Ongoing | One file server → one breach is all clients |

Client separation is contractual, and for Royal Smile regulatory. **At three
people you cannot fully separate client access** — everyone covers for
everyone or the business stops. That limit is itself the lesson. What changes
as you grow is how much of it you can afford.

Realistic at small scale: per-client shared mailboxes so invoices leave from a
scoped address rather than someone's personal mailbox with a global contact
list · client-scoped file permissions · **naming conventions** ("Dana · 6th
Cup", not "Dana") — free, and it alone would have prevented Sam's incident.

### Golden images and drift — SETTLED

**One base image per platform, with differences layered on by policy
afterwards.** Not one image per role — that is image sprawl, and three of them
quietly go stale. Separate images only when the *platform* differs: Windows
workstation, Linux server, ruggedised Android scanner.

**The image goes stale the day you build it.** Without a rebuild cadence every
new machine deploys sixty days behind. **Action Date Tracker.**

**The image stops drift at day zero and does nothing about day thirty.** What
catches ongoing drift is **configuration enforcement running continuously** —
reapply policy, alert on deviation, compare live against golden. Students
learn drift explicitly.

Automation **inherits your mistakes and multiplies them** — a flawed Tier 3
design becomes a flawed template applied to every new site at machine speed.
That is the point, and it is how the student learns.

### Admin tiering — SETTLED

- **Two accounts per person.** A normal one for mail and browsing, a separate
  one for admin work. The admin account never touches a browser
- **Tiers that do not mix** — identity and domain at the top, servers in the
  middle, workstations at the bottom. **A higher-tier credential must never be
  typed into a lower-tier machine**, because a compromised workstation harvests
  whatever logs into it
- **Just-in-time elevation** — rights for a window, not forever
- **A break-glass account** — one emergency account, complex password, sealed
  in the safe with the physical agreement files, and any use alerts

Set up as employees arrive: **provisioning**. Its mirror is
**deprovisioning** — Pippin's offboarding. Manual at Tiers 2 and 3; from Tier
4 the categories come from what they built earlier, and the routine parts
become automatic as the student's own role shifts upward.

### Carried

- **Sam's five additional variants**
- The **Tier 5 insider's Narnia name**
- Objective lists for Tiers 3, 4, 5
- The ninth pane colour; **brown and sky blue need AAA previews**
- Tabs across the top versus a left-hand rail
- Which URL goes in the instructor notes
- **The live monitoring environment** — the owner's correction to what "3D"
  means here: not an object to rotate, but *"the different panes… a live
  monitoring session that increases with each tier."* **No screenshots until
  asked**
- Rebuilding the Tier 1 code, or starting fresh
- **Restoring `/root/.claude/CLAUDE.md` and `exam-prep-coach.md`**, both lost
  in the same container rebuild

---

## 11. Standing rules

- **Never push to GitHub.** Commit locally, deliver zips, one per repo,
  excluding `.git`. Do not send zips until asked
- **WCAG AAA is a medical accommodation** — these students have eye damage from
  military service. 7:1 body, 4.5:1 large (≥24px, or ≥18.66px bold). Verify by
  **sampling painted pixels**, never the cascade
- **Dyslexia friendly throughout**; any toggle persists across pages and
  sessions
- **Royal palette**: green, purple, blue, red, silver, yellow. Anything else
  previewed before use
- **Hints**: unlimited. Guesses 1–2 nothing; 3 rung 1 (where to look); 4 rung 2
  (the principle, generally stated); 5 and forever rung 3 (field narrowed, a
  reason per option removed). **No rung gives the answer.** Always two live
  options. Reset to the last correct step
- **Six options: one correct, five wrong.** Every wrong one a near miss a real
  technician makes. A wrong pick goes red and **stays** red, marked at least
  three ways
- **Five additional scenarios** whenever something new is added
- **Instructor PIN 3693**
- **Calibrate before believing** — plant the defect a check exists to catch and
  confirm it fires
- **Objectives first, previews during**
- **The 90% weekly usage stop: the owner calls it.** The meter is not visible
  from inside a session and must never be guessed at

Footer, every site:

> Cyber Warrior Program — built by an instructor, for students, to make
> certification study more interactive. For educational purposes only. Not
> affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks
> belong to their respective owners.
