/* =====================================================================
   THE OBJECTIVE LABELS — what each one is called on the exam

   This file used to render Tier 1's debrief. That has been FOLDED INTO
   THE AAR, so there is one artefact rather than two that drift apart,
   and what is left here is the thing the AAR needs: the mapping from
   an objective to what it is called on the paper, and what leaving it
   undone costs later.

   ---------------------------------------------------------------------
   BULLET LEVEL, AND NO NUMBERS CLAIMED

   The supplied SY0-701 text is domain-and-bullet level, so the labels
   read as "Security operations — data sources" rather than inventing a
   sub-objective number that may not match the official document. If
   numbered objectives arrive later, these strings change and nothing
   else does.

   Several objectives appear under more than one domain. That is not
   padding — one decision really does reach that far, and students who
   only ever meet an idea in one domain do badly when it turns up in
   another.
   ===================================================================== */

/* What each objective is called on the exam. Bullet level, no numbers
   claimed. Several appear under more than one domain, which is not
   padding — one decision really does reach that far, and students who
   only ever meet an idea in one domain do badly when it turns up in
   another. */
/** The five domains, in the order the objectives text gives them.
    The AAR's coverage column is built from these. */
export const DOMAINS = [
  "General security concepts",
  "Threats, vulnerabilities and mitigations",
  "Security architecture",
  "Security operations",
  "Security program management"
];

export const LABELS = {
  "no-way-in": [
    "General security concepts — security controls: preventive, technical",
    "Threats, vulnerabilities and mitigations — threat vectors: unsecure networks and open service ports",
    "Security architecture — infrastructure considerations: attack surface"
  ],
  "no-factory-passwords": [
    "Threats, vulnerabilities and mitigations — hardening targets, and default credentials as a vulnerability",
    "Security operations — secure baselines and hardening",
    "Threats, vulnerabilities and mitigations — password attacks: spraying and stuffing, which is not brute force"
  ],
  "cameras-cannot-reach-family": [
    "Security architecture — architecture concepts: segmentation",
    "Security operations — mitigation techniques: segmentation, isolation, least privilege",
    "General security concepts — zero trust, in embryo: position on a network is not trust"
  ],
  "you-have-looked": [
    "Security operations — data sources: log data",
    "Security operations — monitoring computing resources",
    "General security concepts — security controls: detective"
  ],
  "rules-do-what-you-think": [
    "Security operations — firewall rules, rule order and access control lists",
    "General security concepts — change management, and why a documented reason matters",
    "Security operations — configuration enforcement"
  ],
  "you-know-what-is-happening": [
    "Threats, vulnerabilities and mitigations — indicators of malicious activity: beaconing and anomalous traffic",
    "Security operations — alerting and monitoring, and incident response: detection and analysis",
    "Security program management — security awareness: anomalous behaviour recognition"
  ]
};

/* What NOT doing each one costs, six months later. Every line is
   already in the design of Tier 2 — none of it is a threat invented to
   make a point here. */
export const BITES = {
  "no-way-in":
    "That hole is still open when the business starts. Tier 2 is the same house with client data in " +
    "it, and an open forward is how the first client's files are reached.",
  "no-factory-passwords":
    "The same published password works on the next device, and on the one after that. Nothing about " +
    "the attack has to improve.",
  "cameras-cannot-reach-family":
    "On a flat network the cheapest device on it can reach the laptop directly, and the firewall " +
    "never sees that traffic — so when ransomware arrives at Tier 2 it spreads as far as the flat " +
    "network lets it, which is everywhere.",
  "you-have-looked":
    "A student who did not open the log tonight does not open it at Tier 2 either, and at Tier 2 " +
    "there is a client whose data is on that laptop.",
  "rules-do-what-you-think":
    "A ruleset nobody has read from the top is a ruleset that will be trusted when it matters. The " +
    "first time that costs anything is the first time something has to be kept out.",
  "you-know-what-is-happening":
    "Not knowing is the default state and it is comfortable. The bill arrives at Tier 2, when the " +
    "foothold that has been sitting there quietly finally has something worth taking."
};

/* The AAR owns the rendering now. `verify/scenarios.mjs` still proves
   that every objective has labels, that every domain is represented,
   and that nothing is left undefined — which is the part that would
   quietly rot. */
export function labelsFor(id) { return LABELS[id] || []; }
export function biteFor(id) { return BITES[id] || ""; }
