/* =====================================================================
   THE CAMPAIGN RECORD — what survives a tier boundary

   A world is one tier. This is the thing that outlives it, and without
   it the AAR could only ever describe the tier the student is standing
   in — which would make an end-to-end report impossible, and the spine
   of this build is that Tier 1's camera becomes Tier 2's ransomware.

   It is written now, while Tier 1 is the only tier that exists and
   nothing is live, because it costs thirty lines today and is a
   retrofit across five tiers later.

   **Which is the same lesson the build spends five tiers teaching.**
   Log retention decides whether there is a case. It would be funny in
   the wrong way to get that wrong here.

   ---------------------------------------------------------------------
   APPEND ONLY

   Nothing in here is ever edited or removed. A record that can be
   rewritten is not a record, and an AAR built on one is a story. The
   only thing that ever happens to this file's contents is that another
   line goes on the end.

   That includes the unflattering lines. A student who restored a save,
   or took four attempts at Tier 3, has that written down — not as a
   black mark, because replaying is the point, but because an AAR that
   quietly tidies up is worth nothing to the person reading it.

   ---------------------------------------------------------------------
   IT HOLDS DECISIONS AND OUTCOMES, NOT KEYSTROKES

   `world.history` already records every change with its reason, and
   that is the right place for it — per tier, detailed, and thrown away
   with the tier. What lands here is what somebody would still want to
   know in three years: what fired, what they chose, how far up the
   hint ladder they went, where the tier finished.
   ===================================================================== */

const VERSION = 1;

export function makeCampaign(name) {
  return {
    v: VERSION,
    student: {
      name: name || "",
      /* Set once, on the first tier started, and never again. */
      startedAt: null,
      /* Filled in by the build when the last tier closes, not typed. */
      completedAt: null
    },
    /* One entry per tier reached, in order. */
    tiers: [],
    /* Everything that happened, oldest first. */
    events: [],
    seq: 0
  };
}

export function setName(c, name) {
  c.student.name = String(name || "").slice(0, 80);
  return c;
}

/** Append. The only write this file has. */
export function note(c, tier, kind, detail, data) {
  c.seq += 1;
  c.events.push({
    n: c.seq,
    at: Date.now(),
    tier: tier,
    kind: kind,
    detail: String(detail || ""),
    data: data || null
  });
  return c;
}

export function events(c, tier) {
  return c.events.filter(e => tier == null || e.tier === tier);
}

export function countOf(c, tier, kind) {
  return events(c, tier).filter(e => e.kind === kind).length;
}

/** A tier has been entered. Records the attempt number, because a
    student who is on their fourth run of Tier 3 is brushing up rather
    than failing and the AAR says so in those words. */
export function startTier(c, tier, scenarioId, seed) {
  if (!c.student.startedAt) c.student.startedAt = Date.now();
  const attempt = c.tiers.filter(t => t.tier === tier).length + 1;
  c.tiers.push({
    tier: tier, scenario: scenarioId, seed: seed,
    attempt: attempt, startedAt: Date.now(), closedAt: null, summary: null
  });
  note(c, tier, "tier.started",
       "Tier " + tier + " begun" + (attempt > 1 ? ", attempt " + attempt : ""),
       { scenario: scenarioId, seed: seed, attempt: attempt });
  return c;
}

export function currentTier(c) {
  return c.tiers.length ? c.tiers[c.tiers.length - 1] : null;
}

/** The attempt that is STILL RUNNING for this tier, if there is one.

    An attempt is something a student did on purpose — chose a new
    night, chose another house, loaded a copy. Opening the page is not
    one of those. Without this, every reload started a fresh attempt,
    and a record meant to hold three years of campaign filled with
    junk that no control could clear. */
export function openTier(c, tier) {
  for (let i = c.tiers.length - 1; i >= 0; i--) {
    if (c.tiers[i].tier === tier && !c.tiers[i].closedAt) return c.tiers[i];
  }
  return null;
}

export function attemptOf(c, tier) {
  const runs = c.tiers.filter(t => t.tier === tier);
  return runs.length ? runs[runs.length - 1].attempt : 0;
}

/** The tier is finished with. `summary` is whatever that tier wants
    the AAR to be able to say about it years later. */
export function closeTier(c, tier, summary) {
  const t = c.tiers.filter(x => x.tier === tier).pop();
  if (t && !t.closedAt) {
    t.closedAt = Date.now();
    t.summary = summary || null;
  }
  note(c, tier, "tier.closed", "Tier " + tier + " closed", summary || null);
  return c;
}

/** Recovery, not a rewind — and it is written down either way. */
export function noteRestore(c, tier) {
  return note(c, tier, "campaign.restored",
              "A saved copy was loaded back in", { tier: tier });
}

/* ---------------------------------------------------------------------
   THE STUDENT'S OWN WORDS

   Half the AAR is theirs. Kept on the campaign rather than in the
   world, because a note written about Tier 1 has to still be there at
   Tier 5, and the Tier 1 world will not be.

   These are the only entries that can be REPLACED rather than
   appended, because they are a draft somebody is writing, not a record
   of something that happened. Every version still leaves an event
   behind, so the fact that they revised it is itself in the record.
   --------------------------------------------------------------------- */
export function setNotes(c, tier, key, text) {
  if (!c.notes) c.notes = {};
  const id = tier + ":" + key;
  const clean = String(text || "").slice(0, 4000);
  const had = c.notes[id];
  c.notes[id] = clean;
  if (clean !== (had || "")) {
    note(c, tier, "student.note", (had ? "revised" : "wrote") + " a note on " + key,
         { key: key, length: clean.length });
  }
  return c;
}

export function getNotes(c, tier, key) {
  return (c.notes && c.notes[tier + ":" + key]) || "";
}

/* ---------------------------------------------------------------------
   PERSISTENCE

   Its own key, separate from the per-tier save. Clearing a tier to
   start a new night must never take three years of campaign with it.
   --------------------------------------------------------------------- */
const KEY = "cwp:firewall:campaign";

export function save(c) {
  try { window.localStorage.setItem(KEY, JSON.stringify(c)); return true; }
  catch (e) { return false; }
}

/** Throw the whole campaign away.

    Deliberately NOT reachable from "a new night", which must never
    cost somebody three years of record. This is the instructor
    handing the machine to the next student, or somebody clearing out
    their own practice runs — a separate act, asked for in those
    words, and confirmed. */
export function clear() {
  try { window.localStorage.removeItem(KEY); return true; }
  catch (e) { return false; }
}

export function load() {
  let raw;
  try { raw = window.localStorage.getItem(KEY); } catch (e) { return null; }
  if (!raw) return null;
  let c;
  try { c = JSON.parse(raw); } catch (e) { return null; }
  if (!c || c.v !== VERSION || !Array.isArray(c.events)) return null;
  if (!c.notes) c.notes = {};
  return c;
}

/** A campaign that came out of a saved file rather than this browser.
    Shape-checked, because a file somebody edited by hand should refuse
    to load rather than half-load into something unexplainable. */
export function adopt(data) {
  if (!data || data.v !== VERSION) return null;
  if (!Array.isArray(data.events) || !Array.isArray(data.tiers)) return null;
  if (!data.student || typeof data.student !== "object") return null;
  if (!data.notes) data.notes = {};
  if (typeof data.seq !== "number") data.seq = data.events.length;
  return data;
}
