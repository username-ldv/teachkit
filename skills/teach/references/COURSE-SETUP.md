# Starting a new course

Nothing gets written before the interview. A course built on a guessed mission is abstract, and
abstract is the one failure mode this format cannot absorb.

---

## 1. The interview

Ask in **two rounds**, batched — not one question at a time. If the agent has a structured
multiple-choice prompt, use it for anything enumerable; otherwise present numbered options and ask
for the numbers. The mission is the exception: ask it in prose, because it needs a real answer
rather than a pick.

### Round 1 — the mission and the floor

**Why this topic?** Push past "to understand X". What changes in their work or life when they have
it? What do they want to be able to *do*? A concrete goal ("recognise and fix performance problems
in real code, and handle interview problems once fundamentals are solid") is worth more than a
whole syllabus.

**What do you already know?** Ask for the honest floor and the shape of it — "two years of
TypeScript and React, some Kotlin, weak on anything low-level" is exactly the right resolution.
Where a codebase exists, read it instead of asking: it is better evidence, and it is where the
grounding examples will come from.

**What is explicitly out of scope?** This protects the zone of proximal development and stops the
course sprawling. Record it in `MISSION.md` and honour it — do not sneak a deferred concept into
example code "for correctness".

### Round 2 — the shape of the course

Offer the defaults from SKILL.md as the recommended answer in each case, and let the user move
off them.

1. **Tracks.** Which language(s), which versions? One track, or two taught side by side with a
   remembered toggle? (Two is right when the *comparison* teaches something. When one language is
   the subject and another is the learner's background, use the single track plus
   `<Callout kind="note">` asides instead — that is what the Svelte course chose, deliberately.)
2. **Practice environment.** The big one; see the table below.
3. **Format deltas.** Lesson length, batch size, exercises per lesson. Default 25–35 min, 3, 4.
4. **This topic's apparatus.** *You* propose; they choose. See §3.

---

## 2. Practice environments

Pick from these; they are all in production somewhere in this learner's courses.

| Environment | Fits | How it works |
| --- | --- | --- |
| **Stub + test suite in their own repo** | algorithms, language fundamentals, anything with a right answer | A stub file with a TODO and a pre-written spec they must not edit. Future lessons ship gated (see [EXERCISES.md](EXERCISES.md)). The tests check *method*, not just output. |
| **A runnable practice app per lesson** | backend, APIs, frameworks | `practice/lesson-NN/` that builds and runs. Verify it end to end yourself before shipping. |
| **Grounded in an existing repo of theirs** | anything they already work on | Cite real files and line numbers; exercises produce changes they can actually ship. Re-read the file before citing a line — line numbers drift. |
| **In-page tasks** | maths, visual/geometric topics, quick concepts | An interactive figure they have to drive to the right state, or a prediction they commit to before revealing. Zero setup. |
| **External problem sets** | interview prep, competitive practice | Two links per exercise. Verify each one exists, is free, is solvable with what has been taught, and is not already linked in the same batch. |
| **A practice log** | non-code topics entirely | Steps with an explicit CHECKPOINT — how the learner knows it worked — and a record they keep. |

Two or more can coexist: the DSA course ships stub+tests in *two* repos and links external problems
from every exercise.

---

## 3. Propose this topic's apparatus

This is the question the old skill could not ask, and the reason the platform changed. Before
asking, think about what in this topic is **hard because it moves, or because a parameter's effect
is the point** — and propose two to four concrete interactive figures for it. Then ask which are
worth building.

Say what each one would *show*, not what it would look like. Examples of the level of concreteness
wanted, from courses that exist:

- *"A hash lab: type a key, watch FNV-1a fold it byte by byte, change the capacity and watch the
  bucket move."*
- *"The five growth curves plotted, with a draggable n and a live cost readout per class."*
- *"A ring buffer you can enqueue past the end of, shown as both a flat array and a circle."*
- *"A render/commit/effect timeline you can step, showing which phase each log line comes from."*
- *"A unit circle where dragging the angle drives the sine and cosine plots underneath."*

Read [INTERACTIVITY.md](INTERACTIVITY.md) before proposing, so the proposals pass its test rather
than being decorations. If nothing in the topic passes it, say so and propose static figures — that
is a legitimate answer, and it is better than inventing a widget.

---

## 4. Topic archetypes

Starting points, not straitjackets. Confirm against the interview.

**Systems / algorithms / language internals.** Two tracks if a comparison teaches. Stub+test repos.
Memory and structure diagrams (`Cells`, `MemoryRegions`, `LinkedList`, `StackFrames`). Cost
arithmetic in `<Derivation>`, always shown. Measurement labs — given code that *measures* a claim
rather than asserting it. Glossary is heavy and load-bearing.

**A UI framework.** One track, with asides for the framework the learner already knows. Playground
links so practice needs no scaffolding. Figures that show the framework's *model* (what re-runs,
what is memoised, what order things happen in) — that is where interaction pays. Never oversell:
comparative claims get a citation or get softened.

**Maths.** KaTeX everywhere; `<Derivation>` is the workhorse. Plots with a draggable parameter.
In-page tasks over repo tasks. Ground every abstraction in something that renders in a browser —
this learner explicitly wants maths made visible and runnable.

**Backend / API.** A runnable server per lesson, verified end to end (build it, curl it) before
shipping. `Pipeline` and `Timeline` for request flow. Concepts-only lessons before implementation
lessons when a subject is dense — auth was split into three that way, on request.

**Grounded in a repo they own.** Survey the repo first and collect real defects; each becomes
teaching material. `<RepoRef>` for citations. Exercises ship real changes. Re-verify every line
number before citing it.

**Non-code.** No code blocks, no test suites. Steps with checkpoints, spaced schedules, a practice
log, and communities for the wisdom half. The lesson chrome, quizzes, `Timeline`, `Sequence`,
`DecisionFlow` and `TraceTable` all still apply.

---

## 5. Scaffolding the workspace

```bash
# from the skill directory, into the (empty) course workspace
cp -r <skill>/scaffold/. .
npm install
npm run dev          # http://127.0.0.1:8321
```

Then, in order:

1. **`src/lib/course.ts`** — fill in the `course` object: `id` (localStorage prefix — pick once,
   never change), `title`, `kicker`, `short`, `tagline`, `tracks`, `headerLinks`. Leave `lessons`
   empty until the first batch exists.
2. **`src/app.css`** — set `--accent` to something distinct for this course. Every other colour is
   derived; the diagram tones, the print stylesheet and the shadcn tokens all follow. One accent per
   course, so the learner can tell two open tabs apart.
3. **`src/routes/+page.svelte`** — the index. Replace the placeholder practice-environment box with
   the real one, or delete it.
4. **`static/favicon.svg`** — swap the glyph.
5. **`.agents/launch.json`** — already correct if you copied it; it runs `npm run dev` on 8321.
6. **Delete what the topic does not need.** `src/lib/diagrams/index.ts` groups components into core
   primitives and worked examples. The examples (`RingBuffer`, `HashLab`, `HashTable`,
   `RecursionTree`, `GrowthChart`) are DSA-specific — read them for the interaction patterns, then
   delete the ones you will not use. Do not delete the core primitives; they are cheap and the third
   lesson will want them.
7. **`git init`** and commit the scaffold before the first lesson, so the first batch has a diff.

Verify the empty course before writing a word of content: `npm run build` and `npm run check` must
both be clean.

---

## 6. The workspace instruction file

Every course gets one, named **`AGENTS.md`** — the cross-agent convention. It is what a future
session reads first, and it holds the things that are true of *this* workspace rather than of
teaching in general.

If the workspace will also be opened in an agent that reads a different filename, add a one-line
stub beside it rather than a second copy: a `CLAUDE.md` containing `See [AGENTS.md](AGENTS.md).`
Two real copies drift, and the drift is silent.

Template:

```md
# Working in this teaching workspace

This is the **<course title>** course — a `/teach` workspace whose lessons are a SvelteKit app.
Read this before authoring or editing a lesson.

`NOTES.md` is the record of how *this learner* wants to be taught. This file is about *how the
pages are built*.

## Running it
`npm run dev` → http://127.0.0.1:8321. There are no openable `.html` files.

| command | what it covers |
| --- | --- |
| `npm run dev` | the course, with hot reload |
| `npm run check` | TypeScript + Svelte diagnostics for `src/lib` |
| `npm run check:pages` | crawls every route and asserts nothing is broken |
| `npm run build` | compiles and prerenders every page — the real gate before shipping |
| `npm run fix:tex` | repairs under-escaped backslashes in `<Derivation>` / `<Math>` props |

## Layout
<the src/ tree, annotated>

## Authoring a lesson
<the manifest-first workflow, the two escaping traps, the diagram rule>

## Course-specific rules
<the accent colour, the tracks, where exercises live, anything peculiar to this topic>

## Before shipping
<the checklist from VERIFICATION.md, trimmed to what applies here>
```

Copy the diagram rule verbatim into it — **no ASCII art, no hand-written `<svg>` in a lesson page;
a missing shape becomes a component in `src/lib/diagrams/` and appears in `/dev/diagrams`.** It is
the rule most likely to be forgotten under time pressure, and the one that degrades the course
fastest.
