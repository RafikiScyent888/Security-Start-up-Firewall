/* =====================================================================
   SAVING

   One key, one JSON blob, localStorage. No server, nothing leaves the
   machine, and a student who clears their browser starts a new night —
   which is fine, because a new night is one of the two ways this tier
   is meant to be replayed.

   ---------------------------------------------------------------------
   WHAT IS SAVED, AND THE ONE THING THAT MUST NOT BE FORGOTTEN

   The world, the clock, the hint ladder's attempt counts, and the
   adversary's per-door clocks.

   That last one is not an implementation detail. Without it, closing
   the tab hands back a fresh eight minutes of grace on every open door,
   and the break-in becomes something a student can postpone for ever by
   reloading. A consequence you can dodge with F5 is not a consequence.

   ---------------------------------------------------------------------
   A SAVE IS NOT A CHECKPOINT

   There is no undo here and no rewinding to before the mistake. The
   save exists so somebody can shut the laptop and come back, not so
   they can retry the night. Everything a student CONFIGURED can be
   changed back through the console; what happened while they were
   thinking stays happened.
   ===================================================================== */

const KEY = "cwp:firewall:tier1";
const VERSION = 1;

function can() {
  try {
    window.localStorage.setItem("cwp:probe", "1");
    window.localStorage.removeItem("cwp:probe");
    return true;
  } catch (e) { return false; }
}

export function save(state) {
  if (!can()) return { ok: false, msg: "This browser will not let the page store anything, so nothing is being saved." };
  try {
    window.localStorage.setItem(KEY, JSON.stringify({
      v: VERSION,
      at: Date.now(),
      world: state.world,
      adversary: state.adversary,
      objectives: state.objectives,
      /* Tiers 2 to 5. Plain data - decision working-out and product
         choices - so it serialises without any special handling. A
         save that dropped these would silently throw away four tiers
         of somebody's evening. */
      tierStates: state.tierStates || {}
    }));
    return { ok: true, msg: "Saved." };
  } catch (e) {
    return { ok: false, msg: "Could not save: " + e.message };
  }
}

export function load() {
  if (!can()) return null;
  let raw;
  try { raw = window.localStorage.getItem(KEY); } catch (e) { return null; }
  if (!raw) return null;
  let data;
  try { data = JSON.parse(raw); } catch (e) { return null; }

  /* A save from a version this build does not understand is discarded
     rather than half-applied. A world missing half its fields produces
     a map that disagrees with the engine, which is worse than starting
     again and much harder to explain. */
  if (!data || data.v !== VERSION || !data.world || !data.world.devices) return null;
  return data;
}

export function clear() {
  try { window.localStorage.removeItem(KEY); } catch (e) { /* nothing to do */ }
}

export function savedAt() {
  const d = load();
  return d ? new Date(d.at) : null;
}
