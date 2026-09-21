# The Security Start-up Firewall

**Tier 1 of the Cyber Warrior Program.** One house, one router, and a network
somebody else set up badly — which is what walking into any real job feels
like.

A student inherits a home network, finds out what it is doing, and fixes it.
Nothing in the simulation ever tells them something is wrong. The only place
the truth is written is the log.

---

## Run it

**You cannot open `index.html` by double-clicking it.** The build uses ES
modules, and a browser refuses to load those from a `file://` path. It will
open to a blank page and the console will say something about CORS.

Serve the folder over HTTP instead. Any of these work:

```bash
# Python — already on macOS and most Linux
python3 -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Then open **http://localhost:8000** — not the file path.

That is the whole of "installing" it. There is no build step, no bundler, no
`npm install` for the site itself, and nothing is fetched from the internet at
runtime. Once the page has loaded it works with the network unplugged.

---

## Put it online

It is a static site, so GitHub Pages serves it as-is:

1. Push this repository to GitHub.
2. **Settings → Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. It appears at `https://<user>.github.io/<repo>/` within a minute or two.

Nothing else to configure. No workflow file, no build, no environment
variables. It works the same on Netlify, Cloudflare Pages, a school web
server, or a USB stick plugged into a classroom machine with a local server
running on it.

**Keep the folder structure.** `index.html` expects `assets/` to sit beside it.

---

## What is in the box

### The site — everything needed to run

| | |
|---|---|
| `index.html` | The page |
| `assets/style.css` | Everything visual, plus the print stylesheet |
| `assets/theme.js` | Light/dark and easier-reading, stamped before the first paint |
| `assets/world.js` | The single source of truth. Devices, forwards, rules, segments, history |
| `assets/rules.js` | NAT and the firewall, kept strictly apart. First match wins |
| `assets/traffic.js` | What a house sounds like when nothing is wrong |
| `assets/adversary.js` | Reads the world, not a script. Says nothing, ever |
| `assets/scenarios.js` | The six houses |
| `assets/objectives.js` | The six objectives and the hint ladder |
| `assets/verdict.js` | The six-option board |
| `assets/campaign.js` | The record that outlives a tier |
| `assets/aar.js` | The After Action Review — document, instructor view, and save |
| `assets/debrief.js` | Which exam objective each one is, at bullet level |
| `assets/map.js` · `console.js` · `log.js` · `voo.js` | The panes |
| `assets/instructor.js` | The notes behind the PIN |
| `assets/save.js` · `app.js` | Saving, and the wiring |

### Not needed to run

`verify/` — the checks. `CLAUDE.md` — the full build document for all five
tiers. `instructions/` — the working rules for this programme.

**If you only want to upload what makes the site work, that is `index.html`
and `assets/`.** Everything else is for whoever maintains it.

---

## The checks

Six verifiers. Four need nothing but Node; two drive a real browser.

```bash
node verify/rules.mjs        # 12 checks · 5 plants
node verify/adversary.mjs    # 12 checks · 7 plants
node verify/objectives.mjs   # 17 checks · 10 plants
node verify/scenarios.mjs    #  9 checks · 7 plants

# These two need playwright-core and a Chromium:
PW=/path/to/node_modules/playwright-core node verify/page.mjs      # 12 checks · 8 plants
PW=/path/to/node_modules/playwright-core node verify/contrast.mjs  # the AAA sweep · 3 plants
```

To get the browser ones running:

```bash
npm install playwright-core
PW="$PWD/node_modules/playwright-core" node verify/page.mjs
```

If Chromium is somewhere unusual, point at it: `CHROME=/path/to/chrome`.

### `--plant` — the important part

```bash
node verify/rules.mjs --plant
```

Every check ships with sabotaged copies of the code, one defect each, and the
check has to catch every one. **A `--plant` run that passes is reported as a
failure**, because a check that cannot fail is not a check.

Run this after changing anything. It is the difference between a test suite
and a green light nobody has interrogated.

`package.json` contains only `{"type": "module"}`, so Node reads the asset
files the same way a browser does. There are no dependencies for the site.

---

## For instructors

**The PIN is 3693.** It opens the Notes pane and the instructor half of the
AAR — what students got stuck on, the decision trail, and questions to put to
the room, generated from what that student actually did.

The PIN is in the page source, and anyone who looks will find it. There is no
server here to check a secret against, so it stops somebody wandering in by
accident and stops nothing else. Nothing behind it would do harm in front of
it — and a student who works out that client-side access control is not access
control has learned something real.

### Sending a class to the same moment

Same seed, same minute, same traffic, on every machine. The seed is on the
Objectives pane and in the AAR footer, so *"everybody go to day 1, 03:14 and
tell me what you see"* works and every screen shows the same lines.

### The six houses

Same lesson, six different faults, chosen from the Objectives pane. Two of
them break the pattern deliberately — one has nothing open and is dirty
anyway, one is genuinely clean and the correct answer is to say so.

### The clock

One real second is four simulated seconds. Students arrive at 20:00 with
forty-five minutes of readable history behind them. A door that is reachable
and has a weak credential is broken into **eight simulated minutes** later —
about two real minutes — so a student who spots it and closes it has genuinely
prevented something.

### The AAR

Open from the first minute and it contains only what the student has done or
already established. **Save a copy** writes one HTML file that is both their
report and their restore point. Loading it back returns them to the start of a
tier they had already finished — recovery, never an undo.

To hand work in, they open the saved file and press **Save as PDF**. Send the
PDF, not the HTML: an HTML attachment is a standard phishing delivery method
and a security professional is right to be wary of one.

---

## What is stored in the browser

Nothing leaves the machine. There is no server, no account, and no analytics.

| Key | What |
|---|---|
| `cwp:theme` | Light or dark |
| `cwp:dyslexia` | Easier reading on or off |
| `cwp:instructor` | Whether the PIN has been entered |
| `cwp:classurl` | The instructor's class link |
| `cwp:firewall:tier1` | The current tier |
| `cwp:firewall:campaign` | The record across tiers |

The first two are shared with the other sites in the programme, so a student
who turns on easier reading once has it everywhere.

**Clearing browser data deletes all of it.** That is why the AAR can be saved
as a file, and why students should be told to do it at the end of every tier.

---

## Readability

The students this is built for have eye damage from military service, so
contrast here is a medical accommodation rather than a preference.

- **WCAG AAA throughout** — 7:1 body text, 4.5:1 large — verified by sampling
  painted pixels rather than reading the stylesheet, on every pane, in both
  themes, in both reading modes, on a phone and on a desk.
- **Nothing is painted smaller than 12px**, counting the viewBox scale for
  anything drawn as a diagram.
- **Colour is never the only signal.** Every state is marked at least three
  ways — the colour, a shape, and the words.
- **Easier reading** changes the typeface, the letter and word spacing, the
  line height and the line length. The spacing does most of the work, and it
  survives into print, because it is an accommodation and not a style.
- Both toggles persist across pages and sessions and are stamped before the
  first paint, so there is no white flash in a dark room.

---

## Scope

**Tier 1 is playable. Tiers 2 to 5 are designed and not built.** The AAR shows
them as *not reached*, which is exactly what a real student's would say if they
stopped here. `CLAUDE.md` carries the full design for all five.

---

Cyber Warrior Program — built by an instructor, for students, to make
certification study more interactive. For educational purposes only. Not
affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks belong
to their respective owners.

Every address in this simulation comes from a documentation range reserved by
RFC 5737, so nothing here can point at a real host.
