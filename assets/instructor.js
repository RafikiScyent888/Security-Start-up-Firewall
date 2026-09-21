/* =====================================================================
   INSTRUCTOR NOTES — behind the PIN

   For the other instructors who will teach from this. Not for students,
   and not hidden from them either, in any meaningful sense.

   ---------------------------------------------------------------------
   THE PIN IS A DOOR, NOT A LOCK, AND THAT IS WORTH SAYING OUT LOUD

   The PIN is in this file. Anybody who opens the page source has it.
   That is unavoidable in a static site with no server — there is
   nothing to check a secret against — and pretending otherwise would
   be teaching the wrong thing in a security course.

   So it is honest about what it is: a speed bump that stops a student
   wandering into the answers by accident. It is **client-side access
   control, which is not access control**, and a student who works that
   out has learned something real. There is a note on this screen that
   says so, on purpose.

   Anything that genuinely must not reach a student cannot live in a
   static page at all. Nothing here does.
   ===================================================================== */

import { esc } from "./map.js";

const PIN = "3693";
const OPEN_KEY = "cwp:instructor";
const URL_KEY = "cwp:classurl";

function read(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
function write(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* not fatal */ } }

export function isOpen() { return read(OPEN_KEY) === "1"; }
export function tryPin(entered) {
  const ok = String(entered || "").trim() === PIN;
  if (ok) write(OPEN_KEY, "1");
  return ok;
}
export function close() { write(OPEN_KEY, "0"); }
export function classUrl() { return read(URL_KEY) || ""; }
export function setClassUrl(u) { write(URL_KEY, String(u || "").trim()); return classUrl(); }

/* ---------------------------------------------------------------------
   THE NOTES
   --------------------------------------------------------------------- */
const NOTES = [
  ["What this tier is actually teaching",
   "One idea, and everything else serves it: <strong>NAT is not a firewall rule.</strong> An inbound " +
   "packet on an unforwarded port is not denied, it is undeliverable — there is no inside host it " +
   "belongs to. Students arrive believing a home router 'blocks' things. It mostly just has nowhere " +
   "to put them. Once that lands, an open port forward stops being 'one more service' and becomes " +
   "the single hole in an otherwise solid wall."],

  ["The second idea, which is harder",
   "<strong>Containment is not prevention.</strong> Closing the forward after the camera is taken " +
   "stops new arrivals and does nothing about whoever is already inside. The beacon keeps running. " +
   "Most students will close the hole, watch nothing change, and assume the simulation is broken. " +
   "It is not — that is the lesson, and it is worth letting them sit in it before you say so."],

  ["Nothing announces itself, and students will ask you if it is broken",
   "There is no alert anywhere in this tier. The VOO pane stays empty even after the breach, because " +
   "there is no sensor. Expect the question. The answer is that an alert is something somebody built, " +
   "not something that happens, and this is the tier where they find out what it costs to have built " +
   "nothing. Resist filling the silence."],

  ["Where they will get stuck, in order",
   "<strong>1.</strong> They will change the camera passwords and not think about the router or the " +
   "printer. <strong>2.</strong> They will close the one forward they can see and miss that three more " +
   "cameras share the same published password, so the hole was never the only problem. " +
   "<strong>3.</strong> They will write an inbound rule against the house's outside address and it will " +
   "never fire, because inbound rules match the translated inside address. That third one catches " +
   "everybody and it is worth letting it happen."],

  ["The cameras phone home legitimately, and that is the whole exercise",
   "Every camera talks to its vendor's cloud constantly. So 'a camera is sending data to the internet' " +
   "is not suspicious — it is the product working. The beacon differs from a keep-alive only by where " +
   "it goes. A student who finds it by noticing 'the camera is talking' has not found it; they have " +
   "guessed. Push them to say <em>which address</em> and <em>why that one is different</em>."],

  ["The hint ladder, and what it will not do",
   "Unlimited tries and unlimited hints. Nothing locks them out. Guesses one and two get nothing. " +
   "The third gets <em>where to look</em>. The fourth gets <em>the principle</em>. The fifth and every " +
   "one after that, for ever, gets the field narrowed with a reason attached to each thing ruled out — " +
   "and at least two options always left alive. <strong>There is no rung that says the answer.</strong> " +
   "If a student cannot get there from two live options and a stated principle, that is a content " +
   "problem and I want to hear about it: they need a better view of the mechanism, not a bigger hint."],

  ["Determinism — you can send the whole class to the same minute",
   "Same seed, same minute, same traffic, same attack. Nothing calls a random number generator that " +
   "is not seeded. So 'everybody go to day 1, 03:14 and tell me what you see' works, and every screen " +
   "shows the same lines. The seed is on the RITSCOM pane."],

  ["The break-in has a grace period, and it is per device",
   "Eight simulated minutes after a door first becomes breakable — reachable from outside AND still on " +
   "its factory password. Each open door has its own clock. Harden one and the others carry on " +
   "counting, which is deliberate: a student who secures the front door camera and leaves three " +
   "exposed has not finished, and the simulation must not tell them they have."],

  ["A factory reset is a security event, and nobody thinks so",
   "A student whose camera misbehaves will reset it with a paperclip, which silently puts the manual's " +
   "password back on. If the device was already compromised, the reset does not clean it either. Both " +
   "of those are worth catching in the moment rather than explaining in advance."],

  ["Nothing they do can strand them",
   "Every setting has an inverse — forwards, passwords, segments, rules, rule order. A badly drawn " +
   "segment can be dissolved. This is checked automatically, so if a student ever reports being stuck " +
   "with no way back, that is a bug and not a lesson. The one thing that is not undoable is a " +
   "compromise, and that is the point of the tier."]
];

export function instructorPane(world) {
  if (!isOpen()) {
    return `<h2>Instructor notes</h2>
    <p>Notes for instructors teaching from this. Not marks, not a walkthrough — what students get
      stuck on and why, in the order they get stuck on it.</p>
    <form data-form="pin" class="card" style="background:var(--surface-2)">
      <label for="pin">Instructor PIN</label><br>
      <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off"
             style="font-family:var(--font-mono)">
      <button class="btn-primary" type="submit">Open</button>
    </form>`;
  }

  const notes = NOTES.map(([h, b]) => `<h3>${esc(h)}</h3><p>${b}</p>`).join("");
  const url = classUrl();

  return `<h2>Instructor notes</h2>
  <div class="instructor">
    <p><strong>This PIN is a door, not a lock.</strong> It is in the page source, and anyone who looks
      will find it. There is no server here to check a secret against, so this stops a student
      wandering in by accident and stops nothing else. That is
      <em>client-side access control, which is not access control</em> — and if a student works that
      out and tells you, they have understood something real. Nothing behind this door would do any
      harm in front of it.</p>
  </div>
  ${notes}
  <h3>Your class link</h3>
  <p>Whatever you want students sent to — your live session, a shared document, wherever you are
    taking questions. It is kept in this browser only.</p>
  <form data-form="classurl" class="log-controls">
    <label class="sr-only" for="classurl">Class link</label>
    <input id="classurl" name="url" type="url" value="${esc(url)}" placeholder="https://..."
           style="flex:1 1 18rem">
    <button class="btn-primary" type="submit">Save</button>
  </form>
  ${url ? `<p>Students see: <a href="${esc(url)}" rel="noopener">${esc(url)}</a></p>` : ""}
  <p><button type="button" data-close-instructor>Close instructor notes</button></p>
  <p class="lede">Seed for this world: <span class="mono">${esc(String(world.seed))}</span>.
    Same seed, same minute, same traffic, on every machine in the room.</p>`;
}
