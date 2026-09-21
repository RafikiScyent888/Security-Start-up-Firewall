# Security Start-up Firewall — build document

**Status: TIER 1 IS BUILT AND PROVED. Tiers 2 to 5 are design only.**

A Tier 1 build existed once and was lost with the container on 19 September
2026. It has been rebuilt from this document, and this time the checks were
written alongside it.

| | |
|---|---|
| Runtime | `index.html` · `assets/` — 17 files, static HTML/CSS/vanilla JS, no build step, no runtime fetches |
| Checks | `verify/` — 6 verifiers, **62 checks plus the contrast sweep, 40 plants, every plant caught** |
| Panes | The house · Console · The log · VOO · Objectives · **AAR** · Notes |
| Objectives | Six, every one computed from world state, none of them ticked |
| Scenarios | **Six houses**, one lesson, six different faults |

Run the checks:

```
node verify/rules.mjs        # 12 checks · 5 plants
node verify/adversary.mjs    # 12 checks · 7 plants
node verify/objectives.mjs   # 17 checks · 10 plants
node verify/scenarios.mjs    # 9 checks · 7 plants
PW=<playwright-core> node verify/page.mjs       # 12 checks · 8 plants
PW=<playwright-core> node verify/contrast.mjs   # AAA on painted pixels · 3 plants
```

Add `--plant` to any of them to run the calibration. A `--plant` run that
passes is reported as a failure, because a check that cannot fail is not a
check.

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
| **3** | **Third Chance Thrift Stores** | **Non-profit.** 5 locations, a **sixth opening**. Donor data, volunteer board | Managed, ~**$2,000/mo** — charity rate | Donor privacy, fiduciary duty |
| **4** | **Royal Smile** | Dental surgery — practice management, imaging, records | Managed + backup + compliance controls. **They keep the paper; we hold the electronic records** | **HIPAA** |
| **4** | **Novoon** | Medium sandwich shop, **9 locations** — nine card environments, heavy staff turnover | Managed, ~**$5,000/mo** | **PCI DSS** at nine sites |
| **5** | **J. Fenty Jr School** | Welding trade school — *"Forging veterans into welders"* | Full managed + SOC | **FERPA**, **GLBA**, and workshop kit puts **ICS/OT** on the table |

Every tier adds a new regulatory regime and a new technical problem. That was
not planned and should be preserved.

**The pricing gap is the point.** 6th Cup pays 42% more than Claw, and it is
entirely defensible — more devices, more users, guest wifi, PCI scope. Claw is
on founder pricing nobody revisited. **Founder pricing you never revisit
becomes a liability.**

**Note: paper PHI is still PHI.** Royal Smile's filing cabinet needs locks,
access control and shredding. Their obligation, but the student will be asked.

### Added later — SETTLED

| Tier | Client | Scope | Role |
|---|---|---|---|
| **3 or 4** | **Third Chance Thrift Stores** | **Non-profit.** 5 locations, a **sixth opening** at the time of the fraud | **Pippin's fraud target** — moved here from Motorpool, because Motorpool being hit twice makes no sense |
| **4** | **Novoon** | Medium sandwich shop, **9 locations** — nine card environments, heavy staff turnover. ~**$5,000/mo** | **The client who leaves**, after Coriakin's arrest becomes known |

**Why Third Chance is the better target for Pippin.** A non-profit losing
$21,000 **earmarked for the sixth store** does not just lose money — it may
lose the store. And explaining that to a volunteer board is a different
conversation from explaining it to an owner. Non-profits also carry donor
data, fiduciary duty, and in some states a charity regulator.

**DONE** — the Pippin section now reads Third Chance throughout, with the
numbers recalculated for a $2,000/month charity retainer.

**Why Novoon leaves, and why it matters.** Not because of the data — they were
never targeted and nothing of theirs was taken. They leave because of
**association**: a nine-location food chain cannot be the one using the IT firm
that employed a spy. A brand decision, made by someone who was never in the
room.

**So the student did nothing wrong and lost them anyway.** That is the lesson
that had been missing from the whole build — every client had survived every
incident, which made consequences feel theoretical. **The after-action must say
explicitly that this one was not their fault**, or students will assume they
misplayed it. Losing Novoon costs **~$60,000 a year.**

### The growth engine — the owner's observation, worth teaching

> **You tighten after every incident, and the tightening is what wins the next
> client.**

That is why the client list grows tier by tier. **The scar tissue is the sales
pitch.** It reframes incidents for students as the price of growth rather than
as failure — and it is why the DLP tightening for J. Fenty exists at all.

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

**Glimfeather** — the owl from *The Silver Chair*, the one that sees in the
dark. **A fellow veteran who was an investigation tech in the Army**, and who
met the owner while serving. He has been helping informally since Tiers 1 and
2 and came on properly at Tier 3.

**That he has an investigator's background is not widely known — by design**,
so that when the company grows, the quiet one in the corner turns out to have
done this before, in uniform. Coriakin does not know who he is being watched
by.

The student is the face of the company and its brains. **Glimfeather is also
its brains** — better two than one.

For veteran students this carries the message the whole programme exists to
deliver: **your MOS transfers.** The skill they already have is the skill this
job wants.

**Roster change to confirm:** Tier 3's three hires become **Glimfeather, Sam
and Lucy**, with Glimfeather first. **Digory moves to Tier 4.**

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
| ~Week 9 | **Fraudulent invoice to Third Chance Thrift Stores** — the fit-out for their sixth store. Timed to land when the real one would, **changed bank details** |
| ~Week 10 | Third Chance pays it. Then the phone rings |

### The damage — SETTLED

- **~$21,000** — the fit-out for the sixth store: POS, network, wifi,
  cameras. Attackers wait for the big one, and this was the biggest invoice
  Third Chance had ever been sent
- **The money was earmarked for the store.** The fraud does not only cost
  cash, it may cost the opening
- Reimbursed in full by the owner, **plus** whatever else Third Chance
  incurred, then **75% of normal rate for a full year**
- **~$2,000/mo × 25% × 12 = $6,000**, plus a week not earning ≈ $5–6k
- **Total ≈ $32,000** — most of a year's profit, caused by a man answering
  emails at the weekend

**The non-profit changes the shape of it.** A volunteer board has to be told.
There is donor data in the mix, and fiduciary duty, and in some states a
charity regulator. And **Third Chance cannot absorb $21,000 the way a trading
business can** — they cannot wait months for an insurance claim to settle.

Which sharpens the insurance lesson rather than softening it: **the reason to
pay them immediately is now morally compelling, and paying immediately is
exactly what voids the claim.** The humane act and the costly act are the same
act.
- **Insurance does not pay**
- **Pippin is dismissed**, and the owner presses charges
- Every client's correspondence was in that mailbox. You must tell **all of
  them** — including 6th Cup, one tier after promising you had fixed how you
  handle their documents
- If Royal Smile is in: **ePHI in an unmanaged consumer mailbox for five
  weeks.** Factor 3 of the risk assessment is fatal — the attacker
  demonstrably read it. **Reportable**

### How the fake invoice got past Third Chance — homoglyph — SETTLED

The attacker does **not** send from Pippin's compromised account. That leaves
traces and the real owner might notice. They register a **lookalike domain**
and send from there: `rafikisITS.com` becomes `rafikislTS.com` — capital I
swapped for lowercase L. In a mail client, at a glance, identical.

That is how real BEC works, and it makes Third Chance's mistake reasonable
rather than careless — especially for a non-profit where the person approving
invoices is as likely to be a volunteer as an accountant.

**It also kills a dangerous misconception.** Students learn SPF, DKIM and
DMARC and conclude they are safe from BEC. **DMARC stops someone spoofing
*your* domain. It does nothing about a domain that merely looks like yours**
— that mail is perfectly authenticated, because it genuinely came from the
attacker's own legitimate domain.

Control: **lookalike domain monitoring**, and defensively registering the
obvious variants.

Drill the *skill* earlier — a smaller Tier 3 version where they must spot a
lookalike of a client's domain — so by Tier 4 they know what to look for and
still miss it.

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
| **Neither** | Week 10, when Third Chance rings | Everything |

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

Third Chance survives — the loss was reimbursed and the sixth store opens,
late. Royal Smile keeps operating too, because their harm is regulatory and reputational
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
- **Paying Third Chance before notifying the insurer can void the claim.** Nearly
  every policy forbids voluntary payments without consent. **Doing the decent
  thing fast costs you the cover** — and it feels so wrong that it has to be
  taught

Two further wrinkles specific to these facts: **the money left Third Chance's
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

### Devices, mail and MFA — SETTLED

**Email format: `firstname@rafikisits.com`**, from Tier 3 when the first hires
arrive. One observation worth a sentence to students: a predictable format is
itself a small exposure — learn one address and you know them all.

**Company-provided devices from Tier 3.** BYOD is Tier 2 only; from Tier 3 the
company buys the hardware, for security and control. Full MDM, disk
encryption, remote wipe, and cleaner offboarding because you collect the
device. It is capital outlay, which feeds the money thread, and it feeds the
hardware procurement line.

**And it does not stop Pippin.** His personal Gmail is on his own phone.
**Controlling the device does not control the person's personal accounts** —
which is the gap the AUP has to close instead.

**MFA is the student's choice**, from the real-world options, and picking
wrong has real consequences:

| Choice | What kills it |
|---|---|
| **None** | Credential stuffing — Pippin's personal account, exactly |
| **SMS codes** | SIM swap. Your carrier's support desk is your security |
| **Email codes** | **If the mailbox falls, the MFA falls with it.** Pippin's scenario in one line |
| **TOTP app** | Real-time phishing proxy — they relay the code while it is still valid |
| **Push approval** | MFA fatigue. Fifty prompts at 3am until somebody taps accept |
| **Push + number matching** | Holds against fatigue. Relayable in theory |
| **Hardware key (FIDO2)** | Phishing-resistant. Loss and cost are the real problems |

The professional answer is **not** "everyone gets a hardware key" — it is
**risk-based: hardware keys for the admin tier, number-matched push or TOTP
for everyone else.** Protect the accounts whose compromise ends the company;
accept friction only where it is earned.

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

## 9b. TIER 5 — CORIAKIN — espionage

The third insider. **Named from Narnia on purpose**, breaking the Tolkien
pattern exactly when the stakes are highest — the student spends two tiers
learning that odd-one-out names mean trouble, and then it stops working.

Coriakin is the fallen star from *Voyage of the Dawn Treader*: placed
somewhere under another name, governing people who do not know what he
actually is, serving a purpose that is not the one on the surface.

### Settled

| | |
|---|---|
| **Motivation** | **Espionage** — named in the objectives under threat actor motivations |
| **Working for** | **Nari**, a competitor |
| **Real target** | **Motorpool of PMCS**, *through* RafikisITS |
| **Placement** | **Planted from day one.** Hired for this |
| **Caught by** | **DLP** — specifically the tightened outbound settings installed to prepare for J. Fenty |
| **Who sees the alerts** | **The student alone** |

### Why this one defeats everything already built

Sam and Pippin each **created an unauthorised path** — a mis-sent mail, a
forwarding rule. Something existed that should not have.

**Coriakin uses the access he was given, correctly, for the wrong purpose.**
Nothing is out of policy. No rule is broken. Every technical control is
looking for the wrong thing, and this time that is the nature of the threat
rather than a gap in the build.

**The behavioural indicators of an insider are identical to the indicators of
your best employee.** He volunteers for on-call. He takes the client with the
difficult network. He does the documentation nobody wants. He stays late and
asks thoughtful questions about how things are set up. Every one is a red
flag; every one is what you would want in a hire. That is *anomalous behaviour
recognition* from the objectives, made genuinely hard.

He passes the interview and the background check, because **he is good at the
job. The competence is the cover.**

### Two things that follow automatically from "planted from day one"

**1. Behavioural analytics cannot catch him.** UEBA works by spotting
deviation from a person's own baseline. A planted insider's first week is
already the compromised behaviour — there is no clean "before" to compare
against. **This is why DLP is the correct detector**: it watches *content
leaving*, not behaviour changing.

**2. The student's hiring process goes on trial.** Planted means he applied,
interviewed and passed whatever checks existed. References, employment
verification, background check — did the student do any of it? The board will
ask, and the honest answer may be embarrassing.

### Why the alerts go only to the student

His stated reason: they know the baseline best. True.

**The stronger reason: you cannot route insider alerts to the SOC queue,
because the suspect is in the SOC.** Coriakin is staff. Put those alerts in
the team's queue and he sees them.

That is a real operational principle — insider investigations run outside
normal channels precisely because the subject has access to the normal
channels.

**And it creates the worst dilemma in the tier:** the student investigates
alone, or chooses one person to trust. Glimfeather handled Pippin — but how do
they *know* Glimfeather is clean? They do not. **Choosing your confidant while
knowing you might be choosing the accomplice** is what insider work actually
feels like.

### The irony to build deliberately

**The control that catches him was installed for a completely different
reason.** The student tightened DLP to look good for J. Fenty — a sales
decision, a compliance uplift, box-ticking for a prospect. And it catches a spy.

That inverts the usual pattern. Everywhere else an earlier mistake bites them.
Here an earlier *ambition* saves them — **and if they never tightened it,
because it looked too expensive or J. Fenty did not ask hard enough, Coriakin
is not caught at all.**

### Handling it — SETTLED

**Narrowing his access:** once they know what he is taking, remove access to
the accounts he is *not* touching. **But anyone good enough to do this checks
their access** — lose three client environments overnight and he knows. So:
start with what is already dormant, wait for cover (a quarterly rotation of
client assignments that applies to everyone is invisible; a change that
applies only to him is a message), and **monitor rather than remove** wherever
possible.

**Honeytokens are the better tool.** Plant credentials, a document, a fake
client record — attractive, worthless, watched. Touched means proof, without
waiting for him to slip. That is **deception technology**, sitting in the
objectives under General Security Concepts beside zero trust. Removing access
limits damage; honeytokens **manufacture the evidence you are short of**,
which is the actual bottleneck.

**Law enforcement** is called on legal's recommendation.

> **Instructor correction, deliberately recorded:** *beyond reasonable doubt*
> is the standard a criminal court applies **at trial**. It is not the
> standard for reporting a crime. You report on **reasonable suspicion** —
> proving it is the police's job. Waiting for certainty means running a
> criminal investigation yourself, unqualified and unauthorised, very likely
> contaminating evidence, and losing the window for preservation orders,
> subpoenas and device seizure. **Counsel is engaged early; counsel calls law
> enforcement when there is credible evidence of a crime.**
>
> And the distinction students always miss: **the employment decision and the
> criminal case run on different standards.** Dismissal is on the balance of
> probabilities. Conviction needs far more. **You do not have to win a
> criminal case to fire someone.**

### Telling the clients

**"We were hacked" invites sympathy. Everyone gets hacked.**
**"Our employee stole from you" is a failure of your judgement** — hiring,
oversight, vetting. It is personal, and some clients will conclude they were
the mark from the day they signed.

What they ask, in roughly this order: what was taken, exactly · when and for
how long · has it stopped · what are you doing about him · what stops the next
one · do we have to notify anyone (**Royal Smile's answer is yes, and there is
a clock**).

**Two questions with no good answer:**

- *"How do you know it was only him?"* — you cannot prove a negative, and "we
  found no indication of anyone else" sounds exactly like what you would say
  if you had not looked hard enough
- *"Why would you catch it next time?"* — and if the answer is "we have
  tightened our hiring", they will ask what it looked like before

**Mechanics:** the owner, in person, one client at a time, in writing
afterwards. **His name does not appear** — "unauthorised access originating
from within our organisation" is all you can say before it is proven. More
than that is defamation exposure.

**The timing conflict is the exercise:** the 48-hour SLA clock, HIPAA's clock
for Royal Smile, and **law enforcement asking you to delay so you do not tip
him off** — HIPAA does permit a law enforcement delay. Three obligations
pulling different ways, decided with counsel.

### The J. Fenty questionnaire, while the investigation is live

The owner's position: you cannot disclose an ongoing investigation.

> **Instructor note, deliberately recorded:** what is true — you cannot name
> him, law enforcement may restrict disclosure, and confidentiality to
> existing clients limits what you may say about *their* data. What is not
> true — there is no general legal bar on telling a prospect you have an
> ongoing internal matter.
>
> **The risk runs the other way.** The questionnaire asks *"have you
> experienced a security incident in the last 24 months?"* or *"are you aware
> of any ongoing incidents?"* Answer no when the honest answer is yes and that
> is a **material misrepresentation** — it can void the contract later, and if
> J. Fenty learns of it afterwards you lose them and your reputation with them.
>
> The professional answer is truthful at a level of generality: *"We have an
> active internal security matter under legal counsel. We can walk you through
> our incident response process and controls, and we will update you as we are
> able."* Some prospects walk. Some respect it more than a clean sheet.
> **Both outcomes should be possible, and the student should have to choose.**

### What it costs

Pippin cost money. **Coriakin costs the thing the business actually sells** —
that it can be trusted with access to other people's networks. An MSP that
employed a spy has a problem no insurance policy addresses.

### The cast around him — SETTLED

**Nari Motor Tools** — a **rival of Motorpool**, not a rival MSP. Motorpool is
growing steadily and Nari wants to take the business. Industrial espionage on
a competitor, executed through that competitor's IT provider.

**Igol Tech Keepers** — **innocent.** A legitimate IT firm that Nari gave the
inside track to, so they could try to win a new client. They approach Motorpool
with a proposal that is **oddly specific about their setup**, and never ask
where the brief came from.

That approach is **the foreshadowing**: a clue the student could catch months
early and will almost certainly walk past. If Motorpool switches to Igol, Nari
has a permanent tap into their rival — so the theft is not the goal, **it is
the pitch material.**

### The ramp — SETTLED

**He starts taking data at day 60**, not day one. He is a plant from the
first day, but he has to be *assigned* to Motorpool, earn it, get added to the
account. He is not being patient; he is unable yet.

Then the ramp: **top of the range, occasionally over the threshold, never
twice in a row.** Each crossing looks like a busy day. It is only visible in
aggregate, looking backwards — which is how these are actually found.

**This is peer group analysis, and it resolves the problem "planted from day
one" creates.** Individual-baseline UEBA fails because his first week is
already the compromised behaviour. **Comparing him to colleagues in the same
role works**, because they have clean histories even though he does not.

**The limitation to teach:** peer analysis needs peers. If Coriakin is the only
person handling Motorpool, there is nobody to compare him to. Small firms have
small peer groups; a specialist has none.

**Why it was not caught earlier:** the thresholds were **not yet tuned**.
Detection thresholds start loose on purpose — tight ones drown you in false
positives — and tighten over months. **The re-baseline that catches him comes
from the company's growth**, accelerated by J. Fenty.

### Log retention decides whether there is a case — SETTLED

**60 days of retention, 45-day investigation.**

> **You cannot build a 45-day case out of 30 days of logs.**

Coriakin runs for months; most of it falls outside the retained window. So
**you can prove the last 60 days and you cannot prove the first six months.**

Which makes **"about 18%" a reasoned estimate**, built from what he had access
to, what the honeytokens revealed about his method, and extrapolating the
volume pattern that survives. The uncertainty is itself part of the damage —
Motorpool will ask *"about?"*, and if the figure later proves higher, you have
already given them a number.

**OPEN:** does the student state a figure or a range?

**What he took:** business plans and ideology first, then client information.

| | |
|---|---|
| **12%** | General business data — **not** trade secrets. The crown jewels survived |
| **6%** | **Motorpool's own bigger clients' information** |
| **18%** | Total, before the honeytokens stopped the bleed |

**That 6% creates a cascade three levels deep** — RafikisITS → Motorpool →
Motorpool's customers. **Motorpool now has its own notification problem,
caused by you.** The apology is not "we lost your data", it is "and now you
have to go and tell your customers."

### The investigation — SETTLED

Quietly, **after hours**, checking Coriakin's activity history. Given to the
student rather than chosen, because it is Tier 5 and **Glimfeather knows what
he is doing.**

**Counsel comes in on discovery day**, not at day 45 — the case is built under
their direction, which is what keeps it privileged and admissible.

**And the lawyer meetings hide in plain sight**, because J. Fenty is being
onboarded at the same time. Counsel walking in and out looks like contract
work. Real operational cover, costing nothing.

**Honeytokens** are set by the owner. **Coriakin takes the bait because he has
got lazy** — he stopped double-checking after getting away with it for so
long. Operational complacency over time is real, and it is consistent: a man
careless enough to take a honeytoken is careless enough to believe he is being
promoted.

### The day — SETTLED

**Removal and reveal happen on the same day.**

**The arrest**: a one-hour window, **early morning before the staff arrive.**
Coriakin is brought in early for *"training for a new position we are creating
— you are one of two we picked."* No audience, no scene, no phones out. And
"one of two" is flattering without being unbelievable.

> **Worth the student sitting with: they are running a pretext on him, exactly
> as he ran one on them for a year.** It is legitimate, it is necessary, and it
> should still feel like something.

**Then Motorpool**, in person, the same day. Smooth it over.

**Then J. Fenty** — same day or the next — **who have already signed by this
point.** Explain the generalities, because it will make waves in the tech
world and *they should hear it from the owner.*

**Then a month of client work:** an event for all clients to explain what
happened, plus **one-on-one meetings** to show each of them they are still
safe. A long month of travelling to them.

**And RafikisITS goes with Motorpool to see Motorpool's customers**, to help
them keep their own business. You caused their problem; you help carry it.
**Automatic for the student, but explained to them**, because the reasoning is
the lesson.

> **The tension to teach:** counsel wants you to say as little as possible,
> because you are acknowledging fault in front of third parties. The
> relationship says show up and speak plainly. **Showing up is usually right** —
> and the way you square it is that counsel agrees the wording in advance and
> you do not depart from it.

**Two operational notes:** you may not control the arrest timing — law
enforcement decides when they move. And a group event carries risk, because
clients talk to each other and one nervous question can start a stampede.
**One-on-ones first, event second** is safer: the room then confirms what each
of them already heard privately.

### Decision point 4 · The J. Fenty questionnaire

| | |
|---|---|
| ✅ | **Answer truthfully at a level of generality.** An active internal matter under legal counsel; here is our IR process and our controls; we will update you when we can |
| ❌ | Answer **"no"** *(a material misrepresentation in a contractual document — it voids the contract later, and they will find out)* |
| ❌ | Disclose in full, including that a staff member is under investigation *(compromises a criminal case, defames him before proof, breaches confidentiality to Motorpool)* |
| ❌ | Withdraw from the bid until it is resolved *(honourable, costs the client and the tier — and they will wonder why you ran)* |
| ❌ | Delay returning it until after the arrest *(procurement timelines do not wait, and stalling reads as evasion)* |
| ❌ | Have them sign an NDA first, then tell them everything *(an NDA does not cure disclosing a criminal investigation, and it drags them into your problem)* |

**The owner's position, and it is the same position:** you are not allowed to
discuss an ongoing investigation, and **you are not lying to J. Fenty.**
Declining to discuss is honest and standard; writing "no" in the box is not
declining, it is an affirmative false statement. In practice: **they do not
answer no.**

**And the investigation helps land the client.** Once the arrest is made and
it can be discussed, RafikisITS is a firm that **detected a planted insider
using controls it had just installed.** That is a better reference than a
clean sheet — a clean sheet only means nothing has been found yet.

### Decision point 5 · The removal

| | |
|---|---|
| ✅ | **Preserve everything → revoke every access simultaneously at the moment he is in the room → collect devices → rotate every credential he had knowledge of → then notify** |
| ❌ | Disable his accounts the night before *(he logs in from home, finds himself locked out, destroys whatever he still can)* |
| ❌ | Let him work the morning normally, remove access after he leaves *(he leaves with whatever he takes that morning)* |
| ❌ | Revoke access, let him return the devices later *(**the device is the evidence**)* |
| ❌ | Change the passwords he used, deal with certificates and tokens after *(Pippin's lesson, unlearned)* |
| ❌ | Walk him out first, sort the technical side afterwards *(the humane instinct, and the most expensive — minutes matter and he has a phone)* |

### Damage and cost — SETTLED

| | |
|---|---|
| Counsel, 45 days under direction | $28,000 |
| External DFIR — independence is needed for a criminal referral | $30,000 |
| Notification, client communications, travel | $12,000 |
| **Covered response costs** | **~$70,000** |
| Less the retention | −$10,000 |
| **Insurance pays** | **~$60,000** |
| Civil action against Coriakin or Nari | $50,000+, years, recovery genuinely uncertain |
| Hiring overhaul — real background checks from now on | $50–150 per hire, forever |
| **Novoon leaves** | **~$60,000 a year** |

**Insurance, the honest picture — the second lesson after Pippin's sub-limit:**

| | |
|---|---|
| Response costs — forensics, counsel, notification | **Covered** by the cyber side |
| Motorpool's claim against you, if made | **Tech E&O** responds |
| **The value of what was stolen** | **Not covered.** Crime and fidelity cover money and tangible property; data and trade secrets are typically excluded or need an endorsement nobody buys |

**And it punishes you for years:** renewal goes from ~$5,000 to roughly
**$9,000–15,000**, or the insurer declines and you shop from a weaker position.

So: **the response is insurable, the loss is not.** Pippin taught the
sub-limit; Coriakin teaches the coverage gap. Same instrument, two different
ways it fails to do what you assumed.

**Motorpool stays** — veteran-owned understanding veteran-owned, and they
understand why everything was done the way it was. **But that is a reason for
Motorpool specifically, not a general rule**, and students should not come away
believing clients forgive you when you have things in common.

### The bad-handling path — and the business survives it

**SETTLED: the company does not die at Tier 5.** The worst case leaves it
badly damaged, not dead, and the final report carries a range of outcomes
rather than pass or fail.

Eight ways it goes wrong, and they compound:

1. **Dismiss the first alert** as a false positive → he runs another four to
   six months. 18% becomes 40%+, **and the trade secrets go**
2. **Confront him** → he denies, goes quiet, deletes what he can. No case, and
   he may sue over the accusation
3. **Escalate to the SOC queue** → he reads it. Same outcome
4. **Act too fast** on thin evidence → **wrongful dismissal claim.** A
   settlement, no criminal case, and the data still gone
5. **No counsel early** → evidence is not privileged, chain of custody breaks,
   the criminal referral collapses. He walks, and he is employable
6. **Lie on the questionnaire** → it surfaces, probably through Igol. Contract
   void, reputation gone
7. **Tell Motorpool badly** — by email, late, or with his name in it →
   Motorpool leaves
8. **Retention at 30 days** → no pattern, no case. Best available outcome is a
   quiet settlement with an NDA, and he does it to somebody else

**Worst case, totalled:** 40%+ of the data including trade secrets · Motorpool
gone at $33,600/year · Novoon gone anyway · a wrongful dismissal settlement of
$30,000–80,000 · no recovery · J. Fenty walks so the tier does not complete ·
and a botched investigation may prejudice the insurance claim too.

**Crippling. Survivable. And every line of it traceable to a specific
decision** — which is the rule the whole build runs on.

### Objectives — Coriakin

All five domains, weighted to Security Operations and Programme Management,
which is right for a capstone.

**General security concepts** — *security controls*: classify which failed and
which never existed · *fundamental concepts*: **zero trust**, because trust
based on position is the failure, and **deception technology**, which is the
honeytokens by name · *change management*: the DLP tightening was a change, and
it is the change that caught him

**Threats, vulnerabilities, mitigations** — *threat actors and motivations*:
**insider threat** and **espionage**, both named in the supplied text ·
*threat vectors*: **hiring as an attack surface** · *mitigation*: access
control, segmentation, least privilege — client separation would have capped
his reach

**Security architecture** — *data protection*: **data types and
classifications.** Trade secrets survived and business data did not, and that
outcome is a direct result of how each was classified and stored

**Security operations** — *alerting and monitoring*: threshold tuning, and why
an untuned threshold misses a careful adversary · *incident response*: **the
entire tier** — process, root cause, **threat hunting**, **digital forensics**
with real chain of custody · *data sources*: **log retention is the exercise;
you can only investigate what you kept** · *IAM*: provisioning,
deprovisioning, privileged access, JIT

**Security programme management** — *governance*: the board, and who decides ·
*risk management*: the register, business impact analysis, and **risk
acceptance** — skipping background checks was a risk accepted without ever
being named · *third-party risk*: **vendor questionnaires**, the J. Fenty gate
· *audits and assessments*: **attestation**, because the questionnaire is one ·
*security awareness*: **anomalous behaviour recognition** — the "he looks
exactly like your best employee" problem

---

## 9c. TIER 2 — the first tier a student ever plays

**Theme: drawing the line between business and personal.** Same house, same
network, same laptop, same phone, same person — and client data now lives
where personal files live. **The line they draw here is the exact rule Pippin
breaks two tiers later.**

Six months. Claw signs at $95/hr. **No family in the house.** The campaign
**always starts at Tier 1**, because some students will go straight to
consulting and others to a SOC interview, and this shows them the details most
people overlook.

**Glimfeather is here from Tier 2** — he was helping during Tier 1 — as an
**early investor who becomes a partner.** Both he and the student have held
clearances, so paperwork is normal and there is no awkwardness in asking him
to sign. **That means the BPA — Business Partners Agreement — belongs at
Tier 2**, an objective bullet that previously had nowhere to go. It also
**seeds the governance structure**: two partners who must agree is governance
at its smallest scale, and it grows into the Tier 5 board.

> **The frame for the whole build: two people who already know how to handle
> secrets, learning to handle other people's data commercially.** It is why
> they think in need-to-know — which is why the NTK pane is called that. For
> veteran students, that is the pitch: they already have the discipline.

**Watch:** Glimfeather should **raise** things, not resolve them. The moment
he solves the incidents, the student stops being necessary.

### The setup phase — months 0 to 1

**The rule: every setup decision must be tested by one of the three
incidents.** Anything untested is busywork.

| Task | The decision | Tested by |
|---|---|---|
| **1 · Paperwork first** | **What response time do they commit to in the SLA?** A one-person business promising 4-hour, 24/7 response has written a cheque it cannot cash | Notifying Claw against a clock they set themselves |
| **2 · Separating identity** | **What is the recovery address for the business account?** If it is the personal Gmail, whoever takes that owns the business — Pippin's lesson in miniature, two tiers early | The phishing |
| **3 · MFA** | The seven options. Hardware keys cost money they do not have | The phish, the lost phone at Tier 3, account recovery |
| **4 · The phone** | Personal SIM + Google Voice. **The business number is software — it follows the account, not the SIM.** Is this phone also the MFA device? | The phish |
| **5 · The network** | Business split from home on consumer kit. **The camera is on the home side** | How far the ransomware spreads |
| **6 · Backups — 102GB** | Local only · cloud sync (**sync is not backup — it replicates the encryption**) · local + offsite · offsite only | The ransomware |

### The three incidents

| Month | What |
|---|---|
| **1** | **The camera** — inherited from Tier 1, found only by looking |
| **3** | **Credential phishing** — a **lookalike email from Claw**, which plants the homoglyph skill two tiers before Pippin's BEC uses it for real. Their MFA choice decides it |
| **5** | **Ransomware** — the climax |

**The camera and the ransomware are connected.** The attacker has held that
foothold since Tier 1. For six months there was nothing worth taking. Then a
business starts and client data appears.

> **The ransomware is not a new incident. It is the Tier 1 negligence accruing
> interest, and the bill arriving the moment there is something to take.**

**If they cleaned up Tier 1 it still happens, smaller** — through the
convenience port forward they opened at Tier 2 instead. A diligent student
must not be allowed to skip the backup lesson.

**Severity gradient:**

| What they did | What happens |
|---|---|
| Clean Tier 1, offsite backup | Contained. A bad week |
| Dirty Tier 1, offsite backup | The attacker had months of reconnaissance — it spreads further and takes the **local** backup. The offsite copy survives |
| Dirty Tier 1, local backup only | Catastrophic, and this is where paying becomes tempting |

**The local copy is convenience. The offsite copy is survival.**

**Ransom: $8,000** — painful, plausible, and *just* affordable, which is what
makes it tempting. **Paying returns a broken decryptor**: partial recovery,
corrupted files, and they still restore from backup. **They paid for nothing.**

**And that is where integrity gets taught.** The build rotates through CIA
without having planned to — Tier 1 confidentiality, Tier 2 ransomware
availability, **the broken decryptor integrity**: data that exists, that
opens, and that cannot be trusted. Integrity usually gets a definition and
nothing else; here a student *experiences* it.

**Restore time is the data weight mechanic arriving.** 102GB over a
residential upload is a day or more of unbillable downtime with a client
waiting — and the honest argument for keeping a local copy as well.

**Claw has to be told.** The agreements are signed at Tier 2, so the 48-hour
clock is already live. **The student's first ever client notification**, and
the dry run for Sam at Tier 3. Whether Claw stays should be **earnable**, not
automatic.

### Insurance at Tier 2 — visible, unaffordable

They **look** at it and cannot justify it on current revenue. That is not
negligence, it is **risk acceptance, documented** — the objective, lived. Then
the risk materialises, and **that is what makes them buy it at Tier 3.**

> **Every control in this build is bought with a scar. Nothing is handed
> down.**

| Incident | Creates the reason for |
|---|---|
| Tier 2 ransomware, uninsured | Buying cyber insurance at Tier 3 |
| Tier 3 lost phone you cannot wipe | Company-provided devices |
| Tier 3 Sam's invoice | Outbound controls |
| Tier 4 Pippin | DLP and mailbox rule alerting |
| Tier 4 DLP tightened for J. Fenty | Catches Coriakin at Tier 5 |

---

## 9d. THE ATTACKS, PLACED

Not every attack needs its own incident. Some are **techniques that recur.**

| Tier | Incidents | Techniques visible |
|---|---|---|
| **1** | IoT foothold — default credentials through an open port forward | **Brute force** as background scanning |
| **2** | **Phishing** → **Ransomware**, connected through the camera | **Credential theft** if MFA is weak · **homoglyph** in the Claw lookalike |
| **3** | Sam · **Lost phone** · **DoS** | **Spear phishing**, now targeted at a named person · credential theft |
| **4** | Pippin — **BEC** · **DDoS** · **Supply chain (RMM)** | Homoglyph as BEC delivery · credential stuffing |
| **5** | Coriakin — **espionage** | All of it, at scale. **Steganography** |

**All ten placed.**

### The lost phone moves to Tier 3, and improves for the move

Previously "company devices from Tier 3" was a rule handed down. Now it is the
**consequence**: an employee loses a phone holding the business inbox, Google
Voice and the second factor — and **the student cannot wipe it, because it is
the employee's personal property.** No MDM enrolment, no prior agreement, no
right to touch it. They do not get told to buy hardware; **they discover they
have no other option.**

**Lucy's or Digory's phone, not Sam's.** The lesson lands harder when it is
someone who did nothing wrong at all.

### Supply chain at Tier 4 — the RMM compromise

**Their remote management tool is compromised upstream and pushes to every
client at once.** The MSP nightmare, and the purest supply chain lesson
because it inverts everything: you did nothing wrong, your vendor did, and
your clients pay for it **through your trusted connection.**

> **Automation multiplies in both directions.** The tool that lets twelve
> people manage forty clients is the tool that lets one compromise reach forty
> clients.

It also gives Tier 4 an incident that is not an insider, and the
signature-verification failure places **hashing and digital signatures**,
which had nowhere to go.

### Obfuscation — placed in three spots

**Tokenization → 6th Cup and Novoon.** The best way to shrink PCI scope is
never to hold the card number at all.
**Data masking → Royal Smile.** How *minimum necessary* is actually
implemented — a technician fixing a printer should not see full records.
**Steganography → Coriakin**, and it closes a hole: content-inspecting DLP saw
a photograph of a server rack, not a client list.

> **You can hide what you send. You cannot hide how much.** Which is exactly
> why peer-comparison on volume is what catches him.

---

## 9e. THE THINGS WE HAD NEVER DISCUSSED

### Verification — how a simulation this size is proven

The owner's calibration rule has an industry name: **mutation testing.** Five
techniques, and this build needs all of them:

| | What it proves |
|---|---|
| **Deterministic replay** | Record a session's inputs, replay, assert the world state matches. Seeded RNG already makes this possible |
| **Property-based testing** | Assert what must **always** hold, then throw thousands of random valid sessions at it. **The owner's rules are properties**: every state has a valid next action (nobody gets stranded) · no objective completes unless its world condition is true · six options, one correct, five wrong · every wrong option has a reason · rung 3 always leaves two live |
| **State walking** | Walk every legal transition exhaustively. Finds unreachable content and dead ends — "written and reachable are different claims", automated |
| **Content linting** | Validate the scenario *data*, separately from the logic. Where generator bugs have historically lived |
| **Playtesting** | Nothing replaces a human. The instructor plays it before a student does |

### What fills the Action Date Tracker — CIS Controls IG1

**Free, respected, and explicitly designed for small organisations with
limited security expertise.** Not invented busywork — a defensible baseline
with a source to point at. And it maps onto the tiers:

| | |
|---|---|
| **IG1** | Small business, limited expertise — **Tiers 2 and 3** |
| **IG2** | Organisations managing others' data — **Tier 4** |
| **IG3** | Mature, dedicated security staff — **Tier 5** |

| Cadence | What |
|---|---|
| **Daily** | Backup job results — did it run, did it *succeed* · alert triage |
| **Weekly** | Patch review · failed login review · EDR health · new devices discovered |
| **Monthly** | Patch deployment · **restore test** · admin account review · firewall rule review · licence reconciliation |
| **Quarterly** | **Access review — who has what and why** · DR test · policy review · vendor review |
| **Annually** | Insurance renewal · SLA review · certificate renewals · awareness training · continuity exercise |

**The access review is the one that matters most for the story** — it would
have caught Pippin's forwarding rule, and it makes Coriakin's accumulating
access visible.

### Money is a mechanic — SETTLED

Monthly revenue by client, monthly costs, a running balance, and **every
security decision priced.** That is what makes "we cannot afford it yet" a
real constraint rather than a line of dialogue.

### Objectives are named in the after-action — SETTLED

Learned through the work with real-world examples under fake names; **named at
the end of each incident.** Not a progress bar during play — a "here is what
you just learned, and here is what it is called on the exam."

### Employees are sensors — SETTLED

**They alert, they do not fix.** Sam alerts, and so do the others. Which makes
**Tier 4's difficulty triage rather than volume** — more reports arriving than
can be actioned, and learning to prioritise.

### Stating a figure or a range — SETTLED, per real practice

State **what you can evidence**, characterise **what you cannot**, commit to
updating:

> *"We have evidence of unauthorised access to [categories] between [dates].
> Our log retention limits visibility before [date]. Based on access patterns
> we assess it likely that [characterisation]. We will update you if that
> changes."*

**Never a bare precise number you cannot support.** A figure revised upward
later destroys credibility and creates liability. **"We do not know, and here
is exactly why" is a professional answer** — students think admitting
uncertainty is weakness; it is the opposite.

---

## 9f. THE VENDOR SECURITY QUESTIONNAIRE — the Tier 4→5 gate

**The original fifteen were drafted before the compaction and are lost.** The
transcript was searched on 20 September: two hits for "15 questions", one the
summary preserving the owner's request, one a false positive. Not recoverable.

**Redrafted below.** Every question interrogates something specific the
student did or did not build, and each is answerable from world state so it
can be scored.

**Governance**
1. Do you maintain a written information security policy, reviewed annually and approved by leadership?
2. Is there a named individual accountable for information security?
3. Do you carry cyber liability and technology E&O cover? **State your limits and any sub-limits.**

**People**
4. Do you perform background checks on all personnel with access to client data?
5. Do all personnel sign confidentiality agreements, and is awareness training delivered annually with records retained?
6. Describe your process for revoking access when personnel leave.

**Access**
7. Is MFA enforced on all remote access and all administrative accounts?
8. Do you separate administrative accounts from day-to-day accounts? How is privileged access controlled?
9. How often do you review user access rights, and by what process?

**Data**
10. How is each client's data segregated from other clients' and from your own?
11. Is client data encrypted at rest and in transit? Describe key management.
12. What is your retention and secure disposal process, including at contract termination?

**Operations**
13. Describe your backup regime, including offsite copies, encryption, and **the date of your most recent successfully tested restore.**
14. Do you maintain centralised logging? **State your retention period** and your documented detection use cases.
15. Describe your incident response plan including client notification timeframes, and **confirm whether you have experienced a reportable security incident in the last 24 months.**

### Why these fifteen

**4** is the one Coriakin walks through. **9** would have caught both Pippin
and Coriakin. **13** asks for a *date*, which is devastating if they never
tested. **14** asks for the retention number that decides whether a case can
be built. **15** forces the disclosure dilemma while the investigation is live.

> **The questionnaire is the summative assessment wearing a procurement
> document's clothing.** Every answer is scored against the student's actual
> world state.

---

## 9g. PRESENTATION — SETTLED 20 September

- **Mobile friendly.** Confirmed. It decides layout, the pane model, tabs
  versus rail, and how much is on screen at once
- **Light/dark toggle**, same as the acronym sites — stamped before first
  paint, persists across pages and sessions, shared key `cwp:theme`
- **Dyslexia toggle**, per the standing rule. Persists the same way, shared
  key `cwp:dyslexia`, so one choice carries across every site in the programme
- **AAA throughout**, verified on painted pixels
- **Instructor notes are for other instructors who will use this**, hidden
  behind the **instructor toggle, PIN 3693**
- **Build order: rebuild Tier 1 fresh**, with everything since. The old code
  is gone and the design has moved a long way past it

---

## 9h. TIER 1, AS BUILT — 20 September 2026

### The panes at Tier 1

| Pane | What it is |
|---|---|
| **The house** | The map, the inventory, and the segment editor |
| **Console** | One device at a time. The Router additionally carries the forwarding table, the ruleset and the review, in that order and visibly apart, because a forward is not a rule |
| **The log** | Every packet the router judged, plus **the verdict board** |
| **VOO** | Empty, and the emptiness is the content |
| **Objectives** | The six, with the hint ladder |
| **Notes** | Instructor notes behind PIN 3693 |

**RITSCOM, the Action Date Tracker and NTK are not here.** There is no
business at Tier 1 and nothing to maintain or to file. They arrive at Tier 2
with the first client. *Confirm this is what was wanted.*

### Navigation — SETTLED 20 September, after the preview

**A left rail on a desk, a drawer on a phone, and they are the same vertical
list either way.** One thing to learn, not two.

The scrolling tab strip that was built first is **gone**. It put three of six
panes past the right-hand edge with nothing on screen saying so, and content
hidden past an edge with no affordance is exactly the failure to avoid for
somebody whose sight is damaged.

**Why the rail rather than top tabs**, from what real consoles actually do:

| Pattern | Who uses it |
|---|---|
| **Left rail** | Sentinel, Defender, CrowdStrike Falcon, Wazuh, Kibana, Grafana, Meraki, UniFi, FortiGate |
| **Top tabs** | PAN-OS, QRadar, Cisco FMC, pfSense/OPNsense |
| **Drawer or bottom bar on phones** | All of their mobile apps. **None uses a horizontally scrolling strip** |

The split is real: firewall appliances use top tabs, SIEM and EDR consoles use
a rail. Tier 1 is a firewall, so PAN-OS is the closest match *today* — but by
Tier 5 this is a SOC console with nine-plus panes, and the rail is what that
world uses. Nine top tabs fit on one row at 1280px and **wrap below roughly
1100px**, which is a laptop or a browser that is not maximised.

Mechanics: the list is one `<nav>`, shown as a sticky rail above 980px and
behind a labelled button below it. Picking a pane closes the drawer and moves
focus to the content; Escape closes it without picking. State is `data-open`
rather than the `hidden` attribute, because `hidden` means "not relevant" and
overriding it in CSS so a desk can see the rail tells the browser one thing
and the reader another.

**Checked:** at 390px every one of the six is on screen at once, none past an
edge, none under 44px tall — and a plant that hides the rail on a desk is
caught, because a desk-only test would never have seen it.

### The one design change made during the build

The sixth objective used to be **"the house is clean — and you checked"**,
computed from world state. Driving the finished page showed what that
actually did: its status line read **"1 device(s) are compromised"**.

That is a you-have-been-compromised panel, in the tier built to prove you do
not get one. A student could open the log for a second, read nothing, and be
handed the answer.

So the engine says nothing and **the student commits instead**. The sixth
objective is now **"You can say what is happening in this house"**, and it is
met by a **six-option verdict board** on the log pane:

> Which of these, if any, is talking somewhere it has no business talking to?

One correct, five wrong. The wrong ones are the other three cameras — same
model, same box, same vendor address all day — the printer, which also phones
a manufacturer nobody thinks about, and **"nothing here is out of place"**,
which is the correct answer in a house that was never taken and the tempting
one in a house that was. A wrong pick goes red and **stays** red, marked three
ways: the colour, an inset rule and a strike, and the word *Ruled out* with
the reason after it. Unlimited tries. Clearing the board clears the working
out and **nothing the student configured**.

This also gives the six-option board its first real home, and the palette for
it is proved on painted pixels before the Tier 3 decision sets arrive.

### What the checks found that reading would not have

| | |
|---|---|
| **The adversary attacked one door** | Harden the front door camera, leave three exposed with the same published password, and it gave up. Every door now has its own clock |
| **A hint was lying** | Rung 3 handed the student the argument about where the unpatchable IoT devices belong while the test had already decided. The rule that came out of it: **a hint must never state as open a question the engine treats as closed** |
| **One badly drawn segment was permanent** | There was no way to dissolve a segment, so a camera and the laptop in one box stranded the student for the rest of the run. `removeSegment` exists, and **every setting now has an inverse**, checked by changing it and changing it back |
| **The objectives pane was the alert** | Above |
| **The contrast checker did not hide SVG text** | `color: transparent` does nothing to a glyph painted with `fill`, so it was measuring anti-aliased text against itself. Caught by its own calibration |
| **A fullPage screenshot of the log came back part black** | Every sample after the fold was taken from the wrong pixels. It measures a screenful at a time now |

### Verified, not asserted

- **AAA on painted pixels** — every pane, both themes, both reading modes,
  phone and desk. The calibration includes the gradient trap: a
  `background-image` with no `background-color`, which every cascade-reading
  checker passes and this one has to fail
- **Nothing on any screen announces the breach** — proved by freezing the
  clock, reading every screen that is not the log, clearing the compromise,
  and reading them all again. **Words and pixels.** Any difference at all is
  the disclosure. A plant that ringed the taken camera in red, writing no text
  at all, is what forced the pixel half
- **Both toggles survive a reload**, and the theme is stamped by a blocking
  script in the head rather than a deferred module — a white flash in a dark
  room is not a cosmetic problem here
- **Doing nothing gets you taken**, through the real interface, and closing
  the forward in the first minute genuinely prevents it
- **Determinism** — same seed, same minute, same traffic, on every machine
- **Nothing is painted smaller than 12px**, phone or desk, counting the
  viewBox scale for anything drawn in SVG. This one caught a live defect:
  the map was 680 units inside a 520px box, so its labels landed at **8.4
  pixels** on a phone. Contrast checks colour and is blind to size, and
  reading the stylesheet would never have shown it — the number only exists
  once the browser has scaled the drawing. The map is now 1:1 and scrolls

### The six houses — SETTLED 21 September

The standing five-scenario rule, paid. Same lesson, six different faults, and
in every one the mistake was made for a reason that made sense at the time.

| | House | The fault | Teaches |
|---|---|---|---|
| 1 | **The four-pack** | 8080 → front door camera, all four on the manual's password | A forward is the single hole in an otherwise solid wall, and four devices out of one box share one password |
| 2 | **Two doors, one password** | 8080 and 8081, only one of them weak | Two ways in are not the same risk. Both should close; only one was ever going to be walked through |
| 3 | **The remote desktop** | 3389 → the laptop, password **reused** from a site in a breach dump | Not a factory default. A real password, decent length — and typed in from a list, not guessed. A longer one would not have helped |
| 4 | **The one nobody thinks about** | 9100 → the printer, factory password | Nothing valuable on it, which is why nobody ever looked. A foothold needs one thing: to be always on |
| 5 | **Nothing is open** | No forwards at all, and a device already taken before the student arrived | **Containment is not prevention, from the other end.** There is no configuration mistake to find |
| 6 | **Somebody who knew what they were doing** | Genuinely clean | **Being right that nothing is wrong is graded.** A student who cannot say it will hunt for ever — in a SOC that is the person who escalates everything |

**Five and six exist to break the pattern.** By the fourth house a student has
learned "find the open port, close it, done", and neither of those two can be
solved that way.

**A blurb describes what somebody DID and never names the device that was
taken.** A check enforces it, and it already caught one: the printer house
used to say "it is a printer".

**At most one device is ever taken in any scenario** — otherwise two of the
six options on the verdict board would be correct and only one could be
celebrated. Enforced by running every house forward three hours untouched.

The engine grew one idea for this: **a reused password is as weak as a factory
one.** Both are typed in from a list, neither is guessed, and neither is fixed
by making it longer. Only the first of those looks wrong to a student.

### THE AAR — SETTLED AND BUILT, 21 September

Not "the final report". An **After Action Review**, because that is what it is
and because every veteran in the room has sat in one. Four questions, no rank,
no blame: what was supposed to happen · what actually happened · why the
difference · what we sustain and what we improve.

That format already *is* how a security incident review works, which is the
programme's pitch landing again — and it solves the grading problem for free,
because question four is sustain-and-improve rather than a mark out of ten.

| Decision | Settled |
|---|---|
| **Scope** | The whole spine, Tier 1 to Tier 5 |
| **How "how they did" is said** | **Side by side** — where the business ended up, and SY0-701 coverage by domain. **No letter, no percentage, no pass mark** |
| **Versions** | Two. The student's AAR, and an instructor view behind **PIN 3693** |
| **Keepable** | Yes. To be peer reviewed before students see it |
| **Replays** | Shown with the attempt number. Replaying is the point — brushing up, not failing |
| **The insiders** | **Good, bad and ugly as three angles on what the student actually did.** Not three alternative paths shown side by side. Classroom discussion then compares real runs |
| **Unreached tiers** | Said plainly. "Not reached", and it is the road ahead |
| **Running** | Yes — and it holds only what the student has DONE or ESTABLISHED. Tonight's undiscovered finding is never in it |
| **Money** | **Stated averages** about the shape of the business, not a running balance |
| **Tone** | **Nobody fails.** No failure language. Guide them to keeping the business afloat — they are learning this for the first time |
| **Half theirs** | A box per tier in their own words. It is what they will defend in class |
| **Identity** | Name and start date; completion date filled in by the build |
| **Format** | **One HTML file** that is both the document and the save |

### HTML and PDF — both, doing different jobs

| | The job | Who touches it |
|---|---|---|
| **HTML file** | The **save**. Their restore point | The student. **Never emailed** |
| **PDF** | The **document**. Ctrl-P from that same file | Emailed, peer reviewed, printed, taken to an interview |

**HTML wins as the source because a PDF freezes the type size and the colours
the moment it is made.** An HTML file still honours the dyslexia toggle and
light/dark when it is opened, so the accommodations travel with the document.
It also carries the campaign record inside it, which a PDF cannot.

**But the PDF is what gets sent**, for a reason specific to this audience: an
HTML attachment is a standard phishing delivery method, and a security
professional is right to hesitate over one. The interface says so on the page.

**And a PDF is not professional because it is a PDF — it is professional
because somebody set it.** So the effort went into the print stylesheet: page
breaks that strand no heading and slice no table, black on white regardless of
screen theme, controls gone, **the dyslexia spacing kept because it is an
accommodation rather than a style**, and the seed and attempt in the footer so
a reviewer can reproduce the exact run they are reading.

### Recovery, not rewind — SETTLED

A copy is written **at tier close, not mid-tier**. Loading one returns a
student to the **start of a tier they had already finished**, never to five
minutes ago. That covers the whole safety-measure case and creates no way to
cancel a consequence — the same loophole that was closed at Tier 1 so a
break-in could not be dodged with F5. **Restoring is written into the record**,
not as a black mark, because an AAR that tidies up is worth nothing.

### The campaign record — the thing that made it possible

A world is one tier. `assets/campaign.js` is what outlives it: append-only,
its own storage key, holding decisions and outcomes rather than keystrokes.

Written **now**, while Tier 1 is the only tier and nothing is uploaded,
because it costs thirty lines today and is a retrofit across five tiers later.
**Which is the lesson the build spends five tiers teaching** — log retention
decides whether there is a case.

### What a peer reviewer will look for, and will find

On the page, not in a footnote: objectives labelled at **domain and bullet
level with no sub-objective numbers claimed** (there is a check that fails the
build if one is invented) · costs as **illustrative ranges, not quotations** ·
regulatory content as **general education, not legal advice** · and **not a
statement of certification readiness**.

**Honest scope for the review: only Tier 1 is playable.** A reviewer can
assess Tier 1 end to end, the AAR as it works for Tier 1, the labelling and
the tone. There is no way to produce a completed five-tier AAR, because there
is no way to play one — so Tiers 2 to 5 appear exactly as a real student's
would if they stopped: *not reached*.

### The old Tier 1 debrief, folded in

Settled long ago — *"named at the end of each incident, here is what you just
learned and here is what it is called on the exam"* — and Tier 1 never had it.

**It does not exist until a verdict is given.** No tab, no greyed-out heading,
nothing to read the shape of. A debrief visible before the answer is the alert
this tier exists to prove you do not get, wearing a mortarboard. Clearing the
board withdraws it again.

Once earned it says what happened, when, and — if they closed the hole after
the break-in — that they prevented the next one and did nothing about the one
already inside. Then every objective with its exam labels at domain-and-bullet
level, all five domains, and for anything left undone, **what it costs at
Tier 2**, drawn from the Tier 2 design rather than invented.

### Still open on Tier 1

- **Brown and sky blue have still not been previewed**, so neither is used.
  The six royals carry the whole build
- Whether the Tier 1 pane list is right — RITSCOM, the Action Date Tracker and
  NTK are absent because there is no business yet and nothing to file
- **Backups at Tier 1** — the tier table says *"personal files, external drive,
  learn the habit"* and nothing in the build touches it. It is not connected to
  any of the six objectives, so it was left rather than invented

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

### A. Decided in conversation, never yet expanded — HIGHEST RISK

These came out of the original planning and survive only here. The owner asked
that they be remembered for later.

| | What was decided |
|---|---|
| **"The seed"** | To be stored as a **separate live teaching aid**, for when he becomes lead instructor. Not part of this build |
| **Data weight and restore cost** | *"Yes, lets add the restore cost time as well. Yes, add weight to the data as well."* Data has size, and size drives restore time |
| **Two inboxes at Tier 2** | `truman@gmail.com` personal, `rafikisITS@gmail.com` business |
| **The phone** | Normal SIM personal, **Google Voice** business. Tier 2 |
| **The lost phone scenario** | Tier 2. Agreed, never designed |
| **The backup test counter** | "Last tested 3 days ago", incrementing daily. A PMCS-shaped control |
| **Employee inboxes** | Each employee gets their own from Tier 3 — `firstname@rafikisits.com` |
| **3-2-1 backup at Tier 2** | Do **not** name it. Give the student options |
| **Breach cost range** | Half a day up to a week |
| **Instructor-authored notes** | Written by Claude, with a field for the student to input the live URL |
| **Objectives shown to students** | They should see what they are learning |

### B. The attack catalogue — the largest structural gap

Ten attack methods were listed. **Only BEC is placed** (Tier 4, Pippin) and
**espionage** (Tier 5, Coriakin). The rest have no tier, no trigger, no
detection, no damage:

phishing · spear phishing · ransomware · credential theft · brute force ·
supply chain · DDoS · DoS

Known: **DoS and DDoS start at Tier 3.** **Phishing and ransomware at Tier 2.**
Nothing beyond that is designed.

**Recommended next step:** one pass placing all ten across the tiers with no
detail — just which tier each lands in. That gives the build its skeleton and
reveals how much work Tiers 2 and 3 actually are.

### C. Tiers 2 and 3 are barely designed

Tier 3 has **Sam and nothing else**. Tier 2 has a list of ingredients and no
incidents at all. Neither has objectives, decision sets, or a sequence of
events.

### D. Decision sets that do not exist

- **Pippin's own** — the five decision points are named (contain, investigate,
  notify, remediate, offboard) and only the **containment order** is written.
  No six-option sets
- **Pippin's five variants** — none
- **Sam's five accidental-insider variants** — approved, never written
- **Coriakin's** — none

### E. Lost in the container rebuild, not recoverable

- **The fifteen governance questions.** Drafted before the compaction, to be
  compared against CompTIA's standards. **Gone.** Would need redrafting, and
  the owner never said whether the originals were any good
- Whatever was said about **finding real vendor questionnaires and audit
  criteria** to build the governance content from

### F. Presentation, unresolved

- **Is this mobile friendly?** Asked directly by the owner and never answered
  by either party
- The **ninth pane colour**; **brown and sky blue need AAA previews** before use
- **Tabs across the top versus a left-hand rail**
- Which **URL** goes in the instructor notes, and whether students see them
- **The live monitoring environment** — the owner's correction to what "3D"
  means here: not an object to rotate, but *"the different panes… a live
  monitoring session that increases with each tier."* **No screenshots until
  he asks**
- **PMCS as the recurring teaching device** — the pane is named *Action Date
  Tracker*, but the framing itself was never explicitly agreed

### G. Carried

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
