---
name: Demo Terminal Emptying Monitor
description: A control-room wall sign made of asphalt, road paint, stencil and retroreflective yellow, where the containers are drawn as containers.
colors:
  asphalt: "#101110"
  asphalt-hi: "#191a19"
  steel: "#26282a"
  steel-hi: "#313432"
  galv: "#575e59"
  paint: "#e9e6dc"
  paint-worn: "#b8b4a8"
  paint-faint: "#aaa69b"
  rule: "#44474a"
  signal: "#ffd100"
  signal-deep: "#a98a00"
  st-terminal: "#8b9099"
  st-unopened: "#c8352b"
  st-emptying: "#d9a520"
  st-done: "#4e9a5b"
  st-cleared: "#bd3f89"
  st-urgent: "#e87818"
typography:
  display:
    fontFamily: "Secular One, Rubik Variable, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Secular One, Rubik Variable, sans-serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Rubik Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Rubik Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  label:
    fontFamily: "Rubik Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  mono:
    fontFamily: "Martian Mono Variable, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.25
    fontFeature: "tabular-nums"
rounded:
  none: "0"
spacing:
  hairline: "2px"
  edge: "6px"
  tight: "8px"
  gap: "12px"
  inset: "16px"
  bay: "24px"
  block: "28px"
  field: "40px"
components:
  route-plate:
    backgroundColor: "transparent"
    textColor: "{colors.paint-worn}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "8px 16px 8px 0"
  route-plate-active:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.paint}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
  chrome-button:
    backgroundColor: "transparent"
    textColor: "{colors.paint-worn}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  chrome-button-hover:
    backgroundColor: "transparent"
    textColor: "{colors.paint}"
  fault-retry:
    backgroundColor: "transparent"
    textColor: "{colors.signal}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  fault-retry-hover:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.asphalt}"
  reflect-edge:
    backgroundColor: "{colors.signal}"
    rounded: "{rounded.none}"
    width: "6px"
  sign-head:
    backgroundColor: "transparent"
    textColor: "{colors.paint}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    height: "24px"
  gate-marker:
    backgroundColor: "transparent"
    textColor: "{colors.paint}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "8px 16px 8px 0"
    height: "72px"
  gate-marker-selected:
    backgroundColor: "{colors.steel}"
    textColor: "{colors.signal}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
  manifest-sheet:
    backgroundColor: "#3a4147"
    textColor: "{colors.paint}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
  steel-plate:
    backgroundColor: "{colors.steel-hi}"
    textColor: "{colors.paint}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  hover-plate:
    backgroundColor: "{colors.steel-hi}"
    textColor: "{colors.paint}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    width: "296px"
  container-face:
    backgroundColor: "{colors.st-terminal}"
    rounded: "{rounded.none}"
    width: "100%"
  empty-bay:
    backgroundColor: "rgb(0 0 0 / 0.35)"
    rounded: "{rounded.none}"
    width: "100%"
---

# Design System: Demo Terminal Emptying Monitor

## Overview

**Creative North Star: "Yard Signage"**

A control-room wall screen is read from four meters for a whole shift, by people who are not holding a mouse. That is not a dashboard; that is a sign. So the interface is built out of the same materials the controllers already read outside the window: near-black asphalt with visible aggregate grain, road paint for markings, cut-stencil lettering, hazard chevron, and one retroreflective signal yellow for wayfinding. Nothing floats. Every surface is either painted onto the ground or bolted to it as steel, and the vocabulary of the build says so out loud — `.plate` is bolted steel, `.galv` is the galvanized interior a stage reveals when you open it, `.marking` is paint on asphalt, `.reflect` is the retroreflective edge.

The single idea the system owns is that a container is drawn as a container. On the floor screen the yard is not a table of rows tinted by status: it is corrugated steel door faces standing head-on, 24:26 because a real box front is 2.44m wide by 2.59m high, with a short skewed top face for volume. The doors themselves carry the state — banded shut, closed, one leaf ajar, both leaves back onto a dark empty interior — so the spec's mandated hues are a second carrier rather than the only one. The legend teaches with the real object, not with a swatch, so the same drawing that explains the system is the drawing the system uses.

The system refuses the card-and-KPI-tile admin page outright, and the refusal is enforced in the code: there is not one `rounded-*` class anywhere in the client, and not one blurred drop shadow. Depth comes from inset bevels, a 2px hard ground shadow under steel, and one warm bloom around retroreflective yellow. Density is high on purpose — 31 containers and their work orders fit above the fold at 1920 — but every figure that matters is set in stencil at poster scale so it still lands from across the room.

**Key Characteristics:**
- Asphalt ground with a real aggregate grain, never a flat fill
- Zero corner radius, everywhere, without exception
- Two colour systems that never touch: chrome yellow and the six status paints
- Status is never hue alone: paint plus door state, on every surface
- One 60ms clock governs every duration on client and server
- One whole-step type scale: eight sizes, all integer multiples of 4px
- Containers drawn as objects, at 24:26, with corrugation and door leaves
- Hebrew RTL throughout; logical properties (`ms-`, `pe-`, `border-s`) rather than left/right

## Colors

Two ground tones, three road-paint whites, one chrome, and the spec's six mandated status paints — grouped not by hue but by which of the two systems they belong to.

### Primary

The chrome system. Retroreflective signage yellow is the only accent in the build and it means exactly one thing: *this is the thing you are looking at, or the way to it.*

- **Signal Yellow** (`signal`): the retroreflective face. It appears as the `.reflect` edge bar at the head of every section and beside the selected gate and route plate, as the selected gate's count, as the focus ring (3px, 2px offset), and as the light half of the gantry's hazard band. Its rarity is the point.
- **Signal Deep** (`signal-deep`): the bottom stop of the `.reflect` gradient only. It is the shaded underside of a reflective bar, never a standalone colour.

### Secondary

The status system. These are fixed by the written spec, not chosen here; the build's job is to carry them faithfully and never let them leak onto chrome.

- **Terminal Grey** (`st-terminal`): arrived at the terminal, awaiting assignment. Also the fallback paint for any pre-arrival status that has no paint of its own.
- **Unopened Red** (`st-unopened`): placed in an emptying area, doors still shut.
- **Emptying Amber** (`st-emptying`): actively being emptied.
- **Emptied Green** (`st-done`): fully emptied, still in the lane.
- **Cleared Magenta** (`st-cleared`): out of the emptying area, emptied.
- **Urgent Orange** (`st-urgent`): urgency, which combines with a status rather than replacing it. It is the warning triangle wherever urgency is reported, and the light stripe of the fault plate's `.chevron`, and nothing else in the world's intent.

### Neutral

- **Asphalt** (`asphalt`): the page ground, carrying an inline SVG fractal-noise aggregate at 11% opacity over a 180px tile. Also the gantry's own ground at 95% with a backdrop blur, and the scrollbar track.
- **Asphalt Hi** (`asphalt-hi`): declared as the lifted ground tone.
- **Steel** / **Steel Hi** (`steel`, `steel-hi`): bolted plate. `.plate` is a 180° gradient from Steel Hi down to Steel; Steel alone is the selected gate marker's ground; Steel Hi is the scrollbar thumb.
- **Galv** (`galv`): declared as the galvanized tone and used for the scrollbar thumb on hover.
- **Road Paint** (`paint`): primary reading text and the status-change flash. Against the manifest sheet (sampled `rgb(54,61,67)`) it measures **8.83:1**.
- **Worn Paint** (`paint-worn`): secondary text — stage notes, table cells, unselected route labels, unselected marking bars. **5.32:1** on the same sheet.
- **Faint Paint** (`paint-faint`): tertiary text, definition-list terms, empty-bay dashes, gate ordinals. **4.53:1** on the same sheet — still above AA for the 16px it is set at.
- **Rule** (`rule`): the painted hairline under a sign head, at 40% opacity.

### Named Rules

**The Two Systems Rule.** CHROME and STATUS never touch. Chrome is signal yellow and appears only as a reflective edge bar or stencilled lettering — never as a fill, and never on a container. Status is the six spec paints and appears only on the face of a container object — never on chrome, never on the rail, never as type colour. `.hazard-chrome` is the chrome-yellow band; `.chevron` is the status-orange one. They look alike on purpose and are never interchangeable.

**The Never Hue Alone Rule.** Red and green sit side by side in the same bay row and are the worst pair to rely on, so no status is carried by paint alone. Every status also has a door state drawn on the face: `sealed` (banding bar across both leaves), `closed` (3px hairline seam), `ajar` (one 16%-wide interior opening, offset to 30%), `open` (both leaves back, 33% interior, centred). Ajar and open separate by position as well as by width, so the pair reads without colour at all.

**The Triangle Means Urgent Rule.** Striping and the triangle divide cleanly by job: **striping is decoration, the triangle reports urgency.** The orange warning triangle is the only urgency mark anywhere, on a container face and equally beside an urgent count, on a sign head whose block holds urgent boxes, and in the hover plate. Striping survives only where it decorates rather than reports: the chrome band across the gantry and boot cover, and the fault plate, neither of which is about container urgency.

**How the rule was settled.** Documenting the build surfaced three crossings of the Two Systems Rule as it was first written. One was a real defect and was fixed; the other two showed the rule had been stated more strictly than it needed to be, and the rule was corrected instead of the code.

- **Fixed.** The gantry's live-feed lamp was filled `st-done`. Green already means רוקנה במלואה on the floor, so spending it on "the feed is up" diluted the one carrier that has to stay unambiguous. The lamp is `signal` now: feed state is system chrome.
- **Rule corrected, code kept.** `st-urgent` colours the urgent count in the gate marker, the manifest header and the hover plate. Each of those is a figure reporting that exact status, sitting beside its own hazard striping. That is the status carrier doing its job, not a status paint leaking into decoration.
- **Rule corrected, code kept.** The retry button fills `signal` on hover, and `::selection` fills `signal`. Chrome marks the active state; a control under the pointer is the active state, exactly as the selected gate's road marking is.

The governing rule, as it now reads in `index.css`: chrome is wayfinding and the active state, never a container and never a large surface; status is a container face or a figure directly reporting that status, never chrome and never decoration.

## Typography

**Display Font:** Secular One (with Rubik Variable fallback) — a single-weight Hebrew cut-stencil face
**Body Font:** Rubik Variable (with Segoe UI, system-ui)
**Label/Mono Font:** Martian Mono Variable (with ui-monospace)

**Character:** Three voices with three jobs and no overlap. Secular One is the sign painter: heavy, closed, legible at distance, used only for things the room is meant to read without walking over. Rubik is the squarish industrial grotesque that carries every piece of UI prose; it is set at 400 and 500 with `font-synthesis-weight: none`, so no weight is ever faked. Martian Mono is wide and machine-cut and is reserved for strings a machine produced — ISO 6346 container numbers, work orders, the clock, percentages and measures — which is what makes a container number instantly distinguishable from a customer name in the same row.

### Hierarchy

- **Display** (Secular One, 32px, line-height 1, +0.01em): the manifest's stage title, unselected gate counts.
- **Headline** (Secular One, 40px, line-height 1): the selected gate's count, and only that. It is the largest thing on the flow screen.
- **Title** (Rubik, 20px, line-height 1): route-plate labels on the gantry, the fault plate's headline, the container number on a hover plate (in mono), the clock.
- **Body** (Rubik, 16px, line-height 1.25): the working size of the whole system — every table cell, every stage note, every button. Nothing in this build is set below 16px except two deliberate label cases.
- **Label** (Rubik, 12px): only the legend plate's two lines per row, the mobile-collapsed secondary line in the manifest, and the "no source" tag on a measure.

The scale is exposed as `--text-step-1` through `--text-step-8` at 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px. Steps 7 and 8 are declared but unused in the current build; they are headroom for a larger wall, not dead tokens to prune.

### Named Rules

**The Whole-Step Rule.** Every type size in the system is an integer multiple of 4px and comes from `--text-step-N`. Nothing between the steps ships, and no Tailwind size utility (`text-sm`, `text-xl`) appears anywhere in the client — every size is written as `text-[length:var(--text-step-N)]`. The scale is what lets one stencil read at four meters and at arm's length.

**The Three Voices Rule.** Stencil is signage, grotesque is prose, mono is machine-read. A container number, work order, ETA, clock time or measured figure is always mono and always `tnum` (tabular figures), so columns of them align to the pixel and a changing digit does not reflow its neighbours. A human name or a customer never gets mono.

## Layout

The shell is a single full-height column: a gantry sign that shrinks to its content, then a `max-w-[1760px]` main area with 24px side gutters and 28px of vertical padding. At `xl` (1280px) and up the shell locks to `h-[100dvh]` and the main area becomes the only scroller — the wall screen must fit exactly one viewport, and both desktop pages do at 1920×1080. Below `xl` the shell relaxes to `min-h-[100dvh]` and the document scrolls normally, because a phone is a walk-up device, not a wall.

Everything is right-to-left. The build uses logical properties throughout (`ms-auto`, `pe-4`, `border-s`, `text-start`) rather than physical left/right, and the two page layouts are described in inline-start / inline-end terms: on the flow page the route rail is inline-start (the right in RTL) and the open gate's manifest is inline-end; on the floor page the two emptying areas are inline-start and the yard beds inline-end.

**Flow page.** A two-column grid at `xl`: `minmax(340px, 27rem)` for the rail, `minmax(0, 1fr)` for the manifest, 32px apart. The rail is a flex column of eight gate markers that share the available height, with the measures strip pinned beneath them. Below `xl` the grid collapses to one column and the rail stacks above the manifest.

**Floor page.** A two-column grid at `xl` of `1fr` and `1.04fr`, 40px apart. Emptying areas A and B are `grid-cols-10` — ten bays across, because ten across reads as one area at a glance and ten stacked reads as a list. The yard beds are `grid-cols-6`, going to `grid-cols-8` at `2xl`. The legend plate is pushed to the bottom of its column with `mt-auto` so it sits under the two bay blocks rather than between them.

**Manifest table.** Below `sm` (640px) the customer, driver/lane and time columns are dropped and their content is re-composed as one 12px secondary line under the container number. The table header is sticky on the galvanized sheet.

Spacing runs on Tailwind's 4px base. The recurring values are 12px between related elements, 16px of field padding, 24px of panel inset, 28px of page rhythm and 40px between the two halves of the floor page. Half-steps (6px, 10px, 14px) exist only for hairline furniture — the 6px reflective edge bar, the 10px scrollbar, the 14px chevron flag.

### Named Rules

**The Count Is The Only Variable Rule.** A gate block's height on the route rail is its container count and nothing else. The rail is a chart, not a nav list. This was broken twice during the build — once by adding a flat height bonus to every gate, which compressed the range that carries the data, and once by reserving height inside one gate for its four measures, which rendered the emptiest stage as one of the fullest. The measures strip exists as a separate section under the rail specifically so that nothing but the count can move a block. Selection is carried by the reflective edge, the steel ground and the paint — never by size. The block's `flex-grow` is `0.25 + 8 × (count / total)`, with a 72px minimum so a one-container gate is still clickable and readable; heights track counts monotonically at 1920 and 1280.

**The One Viewport Rule.** At `xl` and above, both pages fit exactly one viewport and the only scrollers are the manifest body and the main area. A route you have to scroll is not a route: all eight gates are always on screen at once.

**The Physical Layout Rule.** The floor page mirrors the spec's sketch of the actual yard — areas A and B on one side, the waiting bed and the cleared bed on the other. Do not rearrange it for visual balance; it is a map.

## Elevation & Depth

There are no floating shadows in this system. Nothing is a card, so nothing casts a soft ambient shadow onto a surface below it. Depth comes from three moves only: an inset top highlight that reads as a bevelled edge catching the room light, a 2px hard black offset under bolted steel that reads as the plate's own thickness rather than as levitation, and a single warm bloom around retroreflective yellow, which is the only glow in the build and is physically motivated — that is what reflective sheeting does under a light.

The one genuine material change is the cut face. When a gate is opened, the manifest does not grow taller in the same material: it reveals a *different* one. `.galv` is galvanized sheet — a 176° gradient through `#4a5157 → #3a4147 → #2c3237` with a 112° repeating spangle at 5% white, a 3px inset top highlight and a dark bottom lip. It animates in with a `clip-path: inset(0 0 100% 0)` wipe, so the panel cuts open downward rather than fading. The painted face and the interior it hides are different materials, and that is the whole depth story.

### Shadow Vocabulary

- **Bolted plate** (`inset 0 1px 0 rgb(255 255 255 / 0.06), 0 2px 0 rgb(0 0 0 / 0.5)`): every `.plate` — the hover plate, the legend, the fault plate.
- **Galvanized lip** (`inset 0 3px 0 rgb(255 255 255 / 0.16), inset 0 -1px 0 rgb(0 0 0 / 0.5)`): the manifest interior sheet.
- **Retroreflective bloom** (`0 0 12px rgb(255 209 0 / 0.28)`): the `.reflect` bar only.
- **Container box** (`inset 0 4px 0 rgb(0 0 0 / 0.34), inset 0 -5px 0 rgb(0 0 0 / 0.42), inset ±3px 0 0 rgb(0 0 0 / 0.26)`): the frame rails of a container's front face.
- **Open interior** (`inset 0 6px 10px rgb(0 0 0 / 0.75)`): the dark cavity behind swung doors — the only blurred shadow in the system, and it is inside a box.

### Named Rules

**The Bolted-Not-Floating Rule.** No element in this system may cast a blurred drop shadow onto the surface beneath it. If something needs to read as raised, give it an inset top highlight and a hard 2px offset. If it needs to read as a different thing rather than a higher thing, change its material to galvanized sheet.

## Shapes

**The Zero Radius Rule.** There is no corner radius anywhere in this build — not one `rounded-*` class, not one `border-radius` declaration. Road markings, stencils, steel plate and shipping containers do not have rounded corners, and the moment one appears the whole world reads as a web app again. This is the system's single hardest prohibition.

Borders are structural and nearly always pure black (`border-black`) or a very low-alpha white (`border-white/6`, `/8`, `/12`) acting as a painted seam rather than an outline. A dashed 2px `paint-faint` border at 40–55% opacity over `bg-black/35` is the universal "nothing is standing here" form: an empty bay, an empty yard bed, an empty stage, and the loading skeleton all use it, so an empty slot always looks like painted asphalt with no steel on it.

The recurring silhouettes are: the **6px reflective edge bar**, which starts every heading, every selected gate and the measures strip; the **1.5px painted rule** under a sign head; the **hazard band** at 10px/20px stripe pitch on −45°, in chrome yellow on the gantry and in status orange as a chevron; the **warning triangle** at 56% of a container face; and the **container** — a 9% skewed top face lightened 68% toward white, over a `24 / 26` front face bearing four vertical corrugation ribs at 17/31/67/81% and a fine 2px/4px/11px repeating corrugation texture.

### Named Rules

**The 24:26 Rule.** A container face is `aspect-[24/26]` — slightly taller than it is wide, because a real box front is 2.44m by 2.59m. Anything wider stops reading as a container and starts reading as a table row. The same `ContainerFace` component draws the yard, the numbered bays and the legend, so all three lean the same way and teach the same door vocabulary.

## Components

### Brand: the mark and the loader

- **`BrandMark`**: the demo mark, a purple puzzle sphere drawn in SVG with a stencilled wordmark beside it, straight onto the asphalt with no panel. A 1px drop shadow keeps the sphere's dark seams from merging into the ground. 44px in the gantry header, 52px at the head of the boot cover.
- **`LoadingSphere`**: the same sphere in motion on a canvas: a slow wind-up, a fast spin the other way with motion blur, and back to rest. Under reduced motion it draws one still frame, so the loading state stays branded rather than going blank.
- **`BootGate`**: covers the boot until the board has real data. It lifts on the first snapshot or the first error, so a dead feed shows its fault plate rather than an animation that never ends. It holds for a 720ms minimum (12 clock units) because on localhost the data arrives in single-digit milliseconds and the animation would otherwise never actually be seen.

**The brand is not UI.** The mark's purples live in `components/brand/sphere.ts` and are used only by the mark and the loader. They are not in the paint/chrome/status palette and never appear on a control, a status or a rail.

### Search marking (floor view)

Finding a container is wayfinding, so it paints in chrome and never borrows a status colour.

- **`.field`** — a painted input: black at 42% over the ground, a 1px `rule` border, `paint-faint` placeholder, and a signal-yellow border on focus. Container numbers are Latin, so the field is `dir="ltr"` and set in Martian Mono; its placeholder is an example number rather than Hebrew prose, which would drift inside an LTR field.
- **`.search-hit`** — a 3px signal-yellow outline at 2px offset with a 16px bloom. Reflective tape round the box. It sits outside the face, so it never covers the urgency triangle underneath.
- **`.search-miss`** — everything the search did not hit, pushed back with `brightness(0.4) saturate(0.55)`. A filter, not a colour change: the status paint underneath is unaltered and returns intact when the search clears.

Pressing a container writes its urgency. That makes the box a real control, so it takes `cursor-pointer`, `aria-pressed`, and a title naming the action in both directions. The press is applied locally first and reconciled on the next poll, so the wall never waits out a network round trip to show what the operator just did.

### Buttons

- **Shape:** square (0 radius), a 1px border, never a fill at rest.
- **Chrome button** (the freeze/live toggle): `border-white/12`, worn-paint text, 8px/16px padding. Hover raises the border to signal yellow and the text to full road paint; active nudges down 1px, which is the only translate in the system.
- **Fault retry:** the one deliberately louder button — a signal-yellow 1px border and signal-yellow text on the fault plate.
- **Focus:** a 3px signal-yellow outline at 2px offset, global, unmodified. Every interactive element in the build gets it.
- **Transitions:** `--t-2` (120ms), colours only.

### Cards / Containers

There are no cards. The two panel materials are:

- **Steel plate** (`.plate`): a 180° Steel-Hi→Steel gradient, 1px black border, 0 radius, inset top highlight plus a 2px hard ground shadow. Used for the hover plate, the legend plate and the fault plate. Internal padding 16–20px.
- **Galvanized sheet** (`.galv`): the revealed interior of an opened stage. Only the manifest uses it. 24px header padding, 1px black borders between header, body and rows.

### Navigation

The **gantry sign** is the header: an 8px chrome hazard band at 90% opacity across the full width, then the company mark on the inline-start edge beside the Hebrew product name, then the route plates, then a mono clock, the live/freeze toggle and the feed indicator pushed to the inline end. It is `z-30`, black-bordered below, asphalt at 95% with a small backdrop blur. It wraps rather than truncating, and the shell's height lock accounts for whatever height it takes.

**Route plates:** a 6px edge bar plus a stencilled label over a worn-paint note. Active gets a signal border, a 6% white wash and a `.reflect` edge; inactive gets a faint-paint edge at 40% and a border that warms to worn paint on hover. `aria-current="page"` carries the state.

### Sign Head

The world's section heading, and the most reused component in the build: a 6px `.reflect` bar, a 24px stencil title, an optional urgency triangle when the block below holds urgent containers, an optional mono aside pushed to the inline end (a count or an occupancy like `8/10`), and a 1px painted rule under the whole thing at 40% opacity. It is not a card header — there is no card.

### Gate Marker (signature)

One gate on the route rail. Its height is its count (see The Count Is The Only Variable Rule); it carries a 6px edge bar that becomes reflective when selected, the count in stencil at 32px (40px when selected, and signal yellow), the stage name and note truncated to one line each, an urgency triangle plus mono urgent count when any box in it is urgent, a faint stencil ordinal, and beneath all of it a 6px road marking on a black track whose scaled length is the same count again. Selecting re-proportions the entire rail as one linked field over `--t-8` (480ms) on `--ease-yard`; the marking bars retime together.

### Container Face (signature)

The object the whole system is built around. A 9% skewed top face, then a `24/26` front face painted with the status colour, four corrugation ribs, a fine corrugation texture, a top-to-bottom lighting gradient, and inset frame rails. On top of that a hairline door seam, constant across every status. Urgency adds the warning triangle at 56% of the face, orange with a dark halo. The face carries no text at all, by spec — everything readable lives in the hover plate.

Wrapped as `ContainerBox`, it becomes a button: hover and focus both open the hover plate, hover brightens the face 115%, and a status change flashes a road-paint overlay at 90% opacity fading out over 720ms (12 clock units). The flash deliberately skips first render, because flashing the whole floor on load says nothing.

### Hover Plate

A 296px bolted steel plate, portalled to `document.body` and fixed-positioned, hung above the container it describes — or below it when the container sits within 290px of the top. It clamps to the viewport horizontally. Its head repeats the container's own face paint as a 8px colour bar beside the container number in mono; an urgent container gets a triangle row on a near-black band; then a two-column definition list of work order, customer, driver, lane, ETA and last update. It is `pointer-events-none`, so it can never be the thing you are hovering.

### Legend Plate

A two-column (three at `2xl`) steel plate that teaches with the real object: a 44px-wide `ContainerFace` per row, the status name in road paint, and where that status lives on the floor spelled out beneath it in faint paint. The urgent row shows a triangled face and says the triangle combines with any status.

### States

- **Loading:** a painted ground, not a spinner — two columns of dashed empty bays pulsing with a per-row delay of `calc(var(--t) * i)`, so the skeleton looks like the ground it is about to become.
- **Empty:** dashed faint-paint border over `bg-black/35` with a centred worn-paint line. Always the same form, at every scale.
- **Fault:** a steel plate with a chevron block, a stencilled Hebrew headline, the raw error in mono, and the signal-bordered retry button. A stale-but-present feed shows the fault plate *above* the still-rendered data rather than replacing it.

### Motion

**The One Clock Rule.** Every duration in the system is an integer multiple of `--t` (60ms), on both client and server. `--t-2` 120ms, `--t-3` 180ms, `--t-4` 240ms, `--t-8` 480ms; the container flash is 720ms (12 units); the feed polls every 3840ms (64 units) and the .NET simulation advances its scenario on exactly the same 64×60ms tick. Easing is always `--ease-yard`, `cubic-bezier(0.22, 1, 0.28, 1)` — a fast start and a long settle, the way a heavy thing stops. The single exception is the wall clock, which ticks on the second because it is a clock, not an animation.

Motion is state, never decoration. `prefers-reduced-motion` kills the travel transform and the status flash outright, and every Motion-driven transition drops to 0 (or one 60ms unit for the hover plate's fade).

## Do's and Don'ts

### Do:
- **Do** paint the ground and bolt things to it. If a new surface needs a container for content, it is either `.plate` (bolted steel) or `.galv` (a revealed interior) — never a new material.
- **Do** start every section with a `SignHead`: 6px reflective bar, stencil title, painted rule.
- **Do** remember that status is now carried by colour alone, by the user's explicit call. The door-state vocabulary that used to be the second carrier was removed on 2026-09-17. Urgency is the one status signal that survives without hue, and after comparing both candidates on the live board it is a **warning triangle** centred on the container face, not hazard striping. It carries a dark halo rather than a backing shape, which is what holds it legible on a yellow container.
- **Do** paint operator actions in chrome and yard conditions in status. Finding, selecting and hovering are chrome; urgency and emptying state are status. A search hit that borrowed the urgency orange would claim the yard had changed when only the operator had.
- **Do** draw a container with `ContainerFace` at `aspect-[24/26]`, never as a coloured chip or a tinted row.
- **Do** take every type size from `--text-step-1..8` written as `text-[length:var(--text-step-N)]`, and every duration as a multiple of `--t`.
- **Do** set container numbers, work orders, times and measures in Martian Mono with `tnum`.
- **Do** use logical properties (`ms-`, `pe-`, `border-s`, `text-start`) so the RTL layout stays correct.
- **Do** state a figure's missing provenance in words on the surface — a wall screen has nobody hovering it, so an unsourced measure says "ללא מקור" in line rather than hiding it in a tooltip.
- **Do** keep the count the only thing that sizes a block on the route rail.

### Don't:
- **Don't** use a corner radius. Anywhere. Not on a button, not on a plate, not on a container.
- **Don't** cast a blurred drop shadow onto the surface below. Inset bevel plus a 2px hard offset, or change the material.
- **Don't** put a status paint on anything that is not a container face or a figure reporting that status, and don't put signal yellow on a container or across a large surface. A status colour spent on chrome costs it its meaning on the floor, which is where it has to work.
- **Don't** use striping to report anything. Striping is decoration now: the gantry band and the fault plate. Anything reporting urgency carries the triangle, whether it is a container face or a count beside a heading.
- **Don't** reach for a Tailwind size utility (`text-sm`, `text-2xl`) or an ad-hoc pixel size. If the size you want is not on the whole-step scale, you want a different size.
- **Don't** add anything but the count to a gate block's height — not selection, not measures, not a badge. Put it in the measures strip instead.
- **Don't** write text onto a container face. The face carries paint and doors; the hover plate carries words.
- **Don't** introduce a spinner, a skeleton shimmer bar, or a toast. Loading is dashed empty bays, faults are a bolted fault plate above the data.
- **Don't** let the desktop layout exceed one viewport at `xl` and above, or let any gate scroll off the rail.
