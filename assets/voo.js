/* =====================================================================
   VOO — VeteransOvercomingOdds

   The alert pane. At Tier 1 it is EMPTY, and the emptiness is the whole
   content. It is not an unfinished screen and it must never look like
   one, because a student who reads it as a bug stops trusting the rest
   of the build.

   ---------------------------------------------------------------------
   WHY IT IS EMPTY

   Not because nothing is wrong. Something may well be badly wrong by
   the time a student reads this. It is empty because **there is no
   sensor**. A home router does not have a SIEM behind it. Nothing in
   this house is watching the logs, correlating anything, or holding a
   rule that says "tell me when a camera starts talking to a new
   address". Alerts do not arrive because somebody is in trouble; they
   arrive because somebody built something to notice.

   This pane fills up across the tiers as the student builds the things
   that feed it. Tier 1 is the tier where they learn what it costs to
   have nothing feeding it: you find out by reading, or you do not find
   out.

   ---------------------------------------------------------------------
   AND IT STAYS EMPTY EVEN AFTER THE BREACH

   Especially then. The adversary is in, the camera is beaconing, and
   this pane still says nothing, because nothing here can see it. That
   is the single most important sentence in the tier and it is told by
   an absence rather than by a paragraph.
   ===================================================================== */

import { esc } from "./map.js";

/* What a real alert pipeline needs before anything can land in one.
   Listed here as the shape of the thing rather than as a promise about
   any particular tier, because these are the parts, everywhere. */
const PARTS = [
  ["Something producing records", "The router keeps a log. That part exists — it is the only part that does."],
  ["Somewhere they are collected", "One place holding logs from everything, kept long enough to look back through. There is nowhere here."],
  ["Something deciding what matters", "A rule, a threshold, a baseline. Nothing here has any idea what normal is, so nothing here can say what is not."],
  ["Somebody it reaches", "A person, a queue, a phone. An alert nobody receives is not an alert."]
];

export function vooPane(world) {
  const bits = [];

  bits.push(`<h2>VOO</h2>`);
  bits.push(`<p class="lede">VeteransOvercomingOdds — where alerts land, and where you come to work out
    what an alert actually means before you touch anything.</p>`);

  bits.push(`<div class="voo-empty">
    <p class="big">Nothing has been raised.</p>
    <p>And that is not the same as nothing being wrong.</p>
    <p>This pane is empty because <strong>there is no sensor</strong>. Not because the house is fine.
      A home router has nothing behind it that watches, correlates, or holds an opinion about what
      ordinary looks like. Alerts do not arrive because something bad happened. They arrive because
      somebody built something that notices.</p>
    <p>Nobody has built anything here. So if something is wrong in this house tonight, this pane will
      say exactly what it says now, and the only place the truth is written is
      <strong>the log</strong>.</p>
  </div>`);

  bits.push(`<h3>What has to exist before anything can appear here</h3>`);
  bits.push(`<ol>` + PARTS.map(([a, b]) =>
    `<li><strong>${esc(a)}</strong><br><span class="lede">${esc(b)}</span></li>`).join("") + `</ol>`);

  bits.push(`<p>You build those, tier by tier, and this pane fills up as you do. It is worth
    remembering what it looked like empty.</p>`);

  /* The one honest status line. Counted from the log the student can
     read themselves — never from anything they could not have known. */
  const forwards = world.firewall.forwards.filter(f => f.enabled).length;
  bits.push(`<h3>What this pane can tell you without a sensor</h3>`);
  bits.push(`<ul>
    <li>The router is up.</li>
    <li>${forwards
      ? esc(forwards + " port forward(s) are open, which you can also read on the Router.")
      : "No port forwards are open."}</li>
    <li>${world.looked
      ? "You have read the log at least once."
      : "You have not opened the log yet."}</li>
  </ul>`);
  bits.push(`<p class="lede">That is the lot. Three facts about configuration, and not one of them
    is a fact about what is happening.</p>`);

  return bits.join("\n");
}
