# How it works

The technical side of teachkit: what a course is made of, how the three skills divide the work, and
where the rules live.

## A course is a website

A course is a prerendered SvelteKit app in its own folder, read at `http://127.0.0.1:8321`:

- **Lessons are routes** built from a shared component library, not hand-written HTML files.
- **Figures are SVG components**, about thirty of them, a dozen interactive. There is no ASCII
  art and no hand-drawn `<svg>` in a page. A missing shape becomes a new component, so the next
  lesson gets it for free. `/dev/diagrams` renders every component and doubles as its props
  reference.
- **Code is highlighted at build time** by Shiki, with a per-course language toggle whose choice
  follows you across every page. None of Shiki ships to the browser.
- **Maths is KaTeX**, in a `<Derivation>` component that aligns each step on the relation symbol
  with the reason beside it, because the arithmetic gets shown, never asserted.
- **Quizzes** reshuffle their options on every load, retry until correct, and withhold the
  explanation until you get there.
- **One manifest** (`src/lib/course.ts`) holds the lesson order, titles and timings. Headers, index
  cards and prev/next links all read from it, so they cannot disagree.

Around the lessons sits the workspace itself:

```
MISSION.md          why you are learning it: the compass every lesson traces back to
RESOURCES.md        the trusted sources, each fetched and annotated, and the communities
GLOSSARY.md         the course's fixed vocabulary, promoted only once you have used a term correctly
NOTES.md            how you want to be taught, what was promised, and every gap found in use
learning-records/   what you have demonstrated: the floor for the next lesson
AGENTS.md           how this workspace is built, read first by every future session
```

The checks a lesson has to pass before it ships:

| Command | What it covers |
| --- | --- |
| `npm run build` | compiles and prerenders every page, the real gate |
| `npm run check` | TypeScript and Svelte diagnostics for the component library |
| `npm run check:pages` | crawls every route and fails on broken links, missing fragments, KaTeX errors and box-drawing characters |
| `npm run check:quizzes` | catches explanations that name an option by position, "all of the above" options that need a fixed order, and correct answers that give themselves away by length |

Checks that concern one course only, such as one that confirms every test a page names exists in
that course's practice repo, are written into the course's own `tools/` and listed in its
`AGENTS.md`.

Exercise suites are verified separately: reference solutions in, all green, starter files restored
and failing for the right reason, and every "this mistake fails that test" claim checked by making
the mistake.

Optionally, each lesson also gets an **independent review** before it ships: a fresh agent with
none of the authoring context reads it in order, as the learner will, and reports everything it
would have stopped on. The skill asks once whether you want it, because it adds to the token cost,
and records the answer.

## Three skills, three sizes of change

| Skill | Invoke | What it changes |
| --- | --- | --- |
| `teach` | `/teach <topic>` · `/teach continue` | Interviews you, scaffolds a course, writes lessons, and repairs one section at a time |
| `teach-adapt` | `/teach-adapt` | Migrates an older HTML-file course onto the platform. Presentation only: prose and code survive byte for byte |
| `teach-remake` | `/teach-remake 1-3` | Rewrites a range of lessons against a standard. Content, order and scope can all change |

They are ordered by how much they can break. `/teach`'s repair mode fixes one section.
`/teach-adapt` changes presentation and nothing else. `/teach-remake` may split a lesson, merge two,
reorder the course, move where practice lives, or replace a lesson outright, so it audits first,
shows you a before-and-after inventory, and waits for approval before writing.

All three are **user-invoked only**. They carry `disable-model-invocation: true` and say so in their
descriptions, so an agent will not wander into them because a conversation happened to mention
learning something.

## The defaults

The skill is opinionated: long lessons (35–50 minutes, a target rather than a cap), theory first,
four substantial exercises and 6–8 checkpoints apiece, one lesson per run, strict sequencing,
dark pages, desktop screens, and the intermediate arithmetic always written out. Those were settled across a dozen
courses, and the interview exists to move off them where a topic or a person needs something else.
A course records its own choices in `NOTES.md`; a machine can record standing overrides in
`references/LOCAL.md` (see [INSTALL.md](INSTALL.md)).

## Repository layout

```
skills/
  teach/
    SKILL.md              the entry point: modes, defaults, non-negotiables
    references/           the method, in files loaded on demand
    scaffold/             the course project, ready to copy
    agents/openai.yaml    Codex display metadata
  teach-adapt/
    SKILL.md              the migration
  teach-remake/
    SKILL.md              the rewrite
docs/                     this file and the install guide
install.ps1 · install.sh  the installers
```

`SKILL.md` is loaded in full every time the skill runs, so it stays short and points into
`references/`. Those cover the interview and topic archetypes, the pedagogy (retrieval, spacing, the
zone of proximal development), lesson anatomy and a template, when interaction earns its keep,
exercise design and verification, the platform's traps, the pre-ship checklist, and a numbered list
of standing rules, each with the incident that produced it.

## What changed from the original skill

teachkit is derived from the `teach` skill in
[mattpocock/skills](https://github.com/mattpocock/skills) (`skills/productivity/teach`). The
philosophy is inherited from there: knowledge, skills and wisdom; fluency versus storage strength;
the mission as compass; learning records as the teaching equivalent of ADRs; the reuse-first
component rule.

What changed: the lesson format (a SvelteKit route rather than a self-contained HTML file), the
length and depth defaults (the original keeps lessons short and quick to complete), the diagram and
interactivity rules, the exercise-in-your-own-repo model, the verification checklist, and the
standing rules, which came from courses in use.
