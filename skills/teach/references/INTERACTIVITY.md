# Figures, interaction and animation

The platform exists because the old one could only draw with letters. Use it — and use it for
teaching, not for decoration.

---

## The rule

**No ASCII art. No hand-written `<svg>` in a lesson page.** Every figure is a component from
`$lib/diagrams` with data passed in. If a lesson needs a shape that does not exist, **add the
component and put it in `/dev/diagrams`** — the next lesson gets it for free, and the gallery stays
the one place the visual language can be reviewed.

Colour is never a hex value in a page or a component. Pass a `tone`
(`accent · green · yellow · red · purple · cyan · faint`) so the palette and the print stylesheet
stay in charge.

`npm run check:pages` fails on box-drawing characters anywhere in the served HTML. That check exists
because ASCII art creeps back in under time pressure.

---

## When interaction earns its keep

A static figure is not a failure. Most figures should be static: comparing two distant states at a
glance is exactly what a still picture is for, and a printed page has no buttons.

Reach for interaction when **the movement is the lesson**. Three tests — if none of them is a yes,
build it static:

1. **Is the subject a state that changes over time, where the sequence matters more than any
   snapshot?** A window sliding, a pointer pair converging, a tree collapsing, a queue wrapping.
   → a stepper, or a control that advances the state.
2. **Is there a parameter whose *effect* is the point?** Capacity, n, load factor, a frame budget,
   an angle. → a slider or an input, with a live readout of the consequence.
3. **Would the learner otherwise have to run code in their head to follow the paragraph?** → make
   the page run it.

And one test that overrides all three: **would the learner learn the same thing from two static
frames side by side?** If yes, ship the two frames. `CellsTrace` and `Sequence` exist for exactly
that, and comparing distant states is *easier* when they are both on screen.

Never build interaction for engagement, polish, or because the platform supports it.

---

## Rules for interactive figures

**The widget must run the real thing.** `HashLab` computes FNV-1a with the same arithmetic the
lesson teaches; `RecursionTree` generates its tree by actually recursing. Never fake it with
hardcoded frames or an approximation — if the taught code and the widget can disagree, the widget is
a lie, and it is a lie the learner will trust over the prose.

**A meaningful static first frame is mandatory.** Every page is prerendered and printed. Whatever
the figure shows before anyone touches it must be a sentence-worthy state on its own, and the
caption must make sense without the controls. `.figure-controls` is hidden by `print.css`.

**Controls, not autoplay.** The learner sets the pace. Give buttons or a slider; do not animate on
load. If something genuinely must move on its own, respect `prefers-reduced-motion` and provide the
step controls anyway.

**Animate only when time is the variable.** A transition that shows *how* one state becomes the next
(an element moving to its new index, a pointer advancing) teaches. A fade-in teaches nothing and
costs the reader a beat. Duration in the tens of milliseconds, not hundreds.

**Label consistency is load-bearing.** Any identifier in a figure must mean exactly what the same
identifier means in the code on that page. A ring-buffer diagram once labelled the newest element
`tail` while the code computed `tail` as the next free slot; the learner read the diagram correctly,
applied it to the prose, and concluded the lesson was wrong. It was.

**State it in the caption.** A figure with no caption is a decoration. The caption says what to look
at and what it means — not what the picture contains.

---

## The library

| Component | For | Interactive |
| --- | --- | --- |
| `Figure` | the frame every diagram sits in: title, drawing, controls strip, caption | |
| `Sequence` | several `plain` figures laid out as step 1 / step 2 / step 3 | |
| `Cells` / `CellRow` | one row of boxes: arrays, slices, buckets, ring storage. `marks` for pointers, `loops` for a back-edge | |
| `CellsTrace` | the same row repeated per step — a whole trace, comparable at a glance | |
| `ArrayStepper` | the same data, one step at a time, with buttons | ● |
| `LinkedList` / `NodeBox` | chains: single, double, circular, cut links, rerouted links, pointer labels | |
| `PointerBox` | a handle and the thing it refers to (a pointer, a slice header) | |
| `StackFrames` | a stack drawn as a stack; also call frames, with per-frame notes | |
| `MemoryRegions` | two labelled regions side by side (stack and heap; any two-space model) | |
| `Pipeline` | a → b → c transformation chains | |
| `Timeline` | events and windows on a time axis | |
| `TraceTable` | a step table — several things that look like diagrams are really tables | |
| `DecisionFlow` | a branching "which one should I use?" tree | |
| `Derivation` + `Math` | algebra aligned on the relation symbol, reason beside each line, rendered by KaTeX | |
| `RingBuffer` | enqueue/dequeue and watch the window wrap, flat and circular | ● |
| `HashTable` | buckets with chains | |
| `HashLab` | a hash function running byte by byte, with a live bucket | ● |
| `RecursionTree` | a call tree generated by real recursion, with a memoisation toggle | ● |
| `GrowthChart` | plotted curves with a draggable parameter and a per-class readout | ● |

`/dev/diagrams` is also the **props reference**: every component is rendered there with real
props. Read it, or the component source, before using one — the prop names are not guessable
(`Pipeline` takes `steps` and `edges`, not `stages`), and a wrong one prerenders as a 500.

The last five are **worked examples**, not furniture — they were built for a data-structures course.
Read them for the interaction patterns, then delete the ones your topic will not use.

---

## Building a new component

1. Draw into a `viewBox` whose units are **design pixels**, and emit `width`/`height` attributes
   equal to it. `diagram.css` caps it at `max-width: 100%` so a figure can shrink but never
   *stretch* — without this, a 334-unit-wide figure renders at 2.3× and its text is a different size
   from every other figure on the page.
2. Wrap it in `<Figure>`. Pass `minWidth` when squashing would make labels illegible; the figure
   then scrolls sideways instead.
3. Use the `.dg` primitives in `diagram.css` (`.box` + tone, `.val`, `.label`, `.arrow` + tone,
   `.curve`, `.axis`) and the helpers in `geom.ts` (`monoWidth`, `toneClass`, `arrowHead`, `elbow`,
   `arc`, `onCircle`). Arrowhead markers are defined once in `ArrowDefs`, rendered by the root
   layout; a marker takes its colour from itself, not from the path referencing it, so there is one
   marker per tone.
4. **SVG text does not wrap.** Anything longer than a few words belongs in the caption, or in an
   HTML layout with small SVGs inside it — that is what `MemoryRegions` had to become.
5. Size gutters from the data: a fixed 150px note column with no notes in it scales the whole
   viewBox down and renders every label at 6px.
6. Keyed `{#each}` blocks over values that can repeat must key **by index**. Two columns both named
   `tail` produced an `each_key_duplicate` hydration crash that silently truncated a lesson to 9 of
   its 29 figures.
7. Add it to `src/lib/diagrams/index.ts` **and** to `/dev/diagrams` in the same commit.
8. Look at it in a browser. A figure that overlaps or clips is a bug, and only a screenshot will
   tell you.

---

## Simulations and labs

Beyond figures, two shapes have paid off and are worth reaching for:

**A given, runnable lab.** Not an exercise — code shipped complete, whose job is to *measure* a
claim the lesson makes. When a lesson asserts something about memory, cost, or timing that a
sensible person would doubt, ship the measurement instead of the assertion. A Go program that pins
5,000 elements and prints the retained heap settles an argument the prose cannot.

**A shared simulator.** When several lessons need the same runnable model, it belongs in `$lib` and
gets imported by all of them — the same rule as the diagram library. Its arithmetic must be the
arithmetic the lessons teach, and where a lesson shows the code, the simulator should be running
that code, not a paraphrase of it.
