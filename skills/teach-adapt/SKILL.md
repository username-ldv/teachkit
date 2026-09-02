---
name: teach-adapt
description: "Migrate an existing teaching workspace onto the SvelteKit course platform — standalone HTML lessons become routes, ASCII art becomes real SVG components, a hand-rolled highlighter becomes build-time Shiki. USER-INVOKED ONLY: run this only when the user explicitly asks for it by name (/teach-adapt, $teach-adapt). Never load or act on it from an ordinary message."
disable-model-invocation: true
argument-hint: "(run it in the course workspace to migrate)"
---

# Adapt a course to the platform

This takes a teaching workspace whose lessons are standalone HTML files — `lessons/*.html`,
`assets/dsa.css`, a hand-rolled highlighter, ASCII "diagrams" drawn with box characters — and turns
it into the app described in [`teach`](../teach/SKILL.md): a prerendered SvelteKit course with a
real component library.

**The content is not the thing being changed.** Fidelity is the whole job: the learner has read
these lessons, quoted them back, and built exercises against them. The prose survives, the code
survives byte-for-byte, and the figures get *better*. Anything else is a regression.

Read [`teach/SKILL.md`](../teach/SKILL.md) and its references first — this skill assumes them.

---

## Before starting

- **Commit.** The migration deletes files. `git status` clean, and if the workspace is not a repo,
  `git init` and commit before touching anything.
- **Read `NOTES.md`, `MISSION.md`, `learning-records/` and `GLOSSARY.md`.** They carry conventions
  and promises the new pages must keep.
- **Confirm the scope with the user** if the course is large. The reference migration was ~11k lines
  of HTML, 60 figures, six lessons, and it was done in one pass — but say so before starting.

---

## 1 · Survey

Produce an inventory before writing anything, and show it to the user:

- lesson files, reference files, the index, the stylesheet, the scripts
- per lesson: `<pre><code>` blocks, code-tab groups, quizzes, exercises, callouts, `<details>`
- **every ASCII figure** — `<pre class="diagram">`, or any `<pre>` containing box-drawing
  characters. Each one becomes a decision.

Classify each figure now, because roughly a third of them are not diagrams at all:

| Looks like | Usually is | Becomes |
| --- | --- | --- |
| a grid of aligned columns | a table | `TraceTable`, or plain `<table>` |
| aligned `=` signs | algebra | `<Derivation>` |
| boxes in a row with arrows | an array or buckets | `Cells` / `CellsTrace` |
| boxes with `→` between them | a chain | `LinkedList` / `Pipeline` |
| indented pseudo-code | actual code | a `<CodeBlock>` |
| a sequence of "before / after" blocks | steps | `Sequence` |
| a thing whose *movement* is the point | an interactive figure | see below |

---

## 2 · Ask, briefly

An existing course usually needs no interview — the mission, the format and the conventions are
already written down. Do not re-ask what `NOTES.md` answers.

Two things are worth asking, and both should be *proposals*, not open questions:

1. **This topic's interactive apparatus.** Now that figures can move, name two to four concrete
   candidates from this specific course and ask which are worth building. Pass them through the test
   in [INTERACTIVITY.md](../teach/references/INTERACTIVITY.md) first — propose the ones where the
   movement is the lesson, not the ones that would look impressive.
2. **Anything the course was missing** relative to the current standard: the `<Recall>` spaced
   retrieval opener, external practice problems per exercise, a reference sheet the course keeps
   almost-writing in its prose. Offer; do not impose.

Also confirm: keep the static HTML as well, or drop it? The reference migration dropped it — the
dev server is how lessons are read now, and `npm run build` prerenders a static copy if one is ever
wanted.

---

## 3 · Scaffold alongside

Copy `teach/scaffold/` into the workspace *next to* the existing files — nothing is deleted yet.
Then:

- Fill in `src/lib/course.ts` from the existing index page: slugs, numbers, titles, blurbs,
  minutes, exercise counts, `builds`, the roadmap, the reference sheets.
- Port the course's palette into `src/app.css`. Keep its accent — the learner recognises the course
  by it.
- Port the course's typography into `src/styles/prose.css` **wholesale**, rather than rewriting it
  in Tailwind utilities. It works, the learner likes it, and churning it risks every lesson's layout
  for nothing. Tailwind is there for new work.
- `npm install && npm run dev`, and confirm the empty shell builds before porting content.

---

## 4 · Port mechanically

Write a throwaway porter script — this is not work to do by hand across six lessons, and a script
is auditable. It should convert, per lesson:

- `<pre><code class="lang-x">` → `<CodeBlock lang="x">` with the body **unescaped back to raw
  source** (`&lt;` → `<`, `&amp;` → `&`). The preprocessor wants raw text.
- code-tab groups → `<CodeTabs>` wrapping the blocks
- `.quiz > .q[data-answer]` → `<Quiz>` / `<Question q options answer>` with the explanation as an
  `explain` snippet
- `.callout.note|tip|warn|deep` → `<Callout kind>`
- `.exercise`, `.playground`, `.primary-source`, `.ask-teacher`, `<details>` → their components
- the "In this lesson" list → `<LessonToc items={[…]}>` — items are **raw inner HTML**, because an
  entry may carry a second link or trailing markup. A porter that assumes one `<a>` per `<li>`
  produces an unterminated string and a page that will not compile.
- header, prev/next → `<LessonHeader>` / `<PrevNext>` reading from the manifest
- `{` and `}` in prose → `&#123;` / `&#125;`
- **every ASCII figure → a marker comment**, `<!-- @@DIAGRAM lesson#index -->`, carrying the
  original block so it can be read while authoring the replacement.

Leave the markers in. `npm run check:pages` fails on them, so none can survive to a reader.

---

## 5 · Author the figures

One at a time, by hand, against the original block. This is the part that cannot be scripted and it
is most of the value.

- **Every figure is a component from `$lib/diagrams`.** If the shape does not exist, add the
  component and put it in `/dev/diagrams` — never inline an `<svg>`.
- Reach for interaction only where the movement is the lesson. In the reference migration, 5 of 60
  figures earned it.
- Where a figure was compensating for the old format's limits, say so and fix it properly: two
  "diagrams" in the reference course were really code and JSON, and became real code blocks.
- Check each figure against the code on its page. A label must mean exactly what the same identifier
  means there — that mismatch is a bug the old format hid.

---

## 6 · Prove the fidelity

Do not claim the port is faithful. Show it.

1. **Every `<pre><code>` body, byte-for-byte**, old versus new, per lesson. They must be identical.
   Report any legitimate difference explicitly and say why (a figure that became a code block is a
   legitimate gain; anything else is a bug).
2. **Prose as a word multiset**, old versus new. The only differences should be chrome that moved
   into component props.
3. **Quiz count, answer indices and option counts** unchanged.
4. **Every link and anchor** still resolves — `npm run check:pages` crawls and checks fragments.

---

## 7 · Verify and finish

Run the full list in [VERIFICATION.md](../teach/references/VERIFICATION.md). Then:

- `git rm` the old `lessons/*.html`, `reference/*.html`, `index.html` and `assets/`. They stay in
  history; say so.
- Write the workspace `AGENTS.md` (template in
  [COURSE-SETUP.md](../teach/references/COURSE-SETUP.md)). This is what future sessions read first.
- Append a section to `NOTES.md` recording the rebuild: the decisions taken, what became
  interactive, how fidelity was proven, and any trap hit.
- Update `.agents/launch.json` to run the dev server.
- Commit in two parts if the diff is large: the platform and the port separately.

---

## Traps

Each of these cost real time in the reference migration.

- **`adapter-static` writes to `build/` by default** and will silently delete a `build/` directory
  of your own scripts. The scaffold points it at `dist/`; keep tooling in `tools/`.
- **Vite binds to `::1` only** unless `server.host` is set. Verify against `http://127.0.0.1:8321`.
- **Never author a file containing backslashes through a shell heredoc.** The shell eats them and
  `'\vdots'` silently becomes a control character. Use the file tools; `npm run fix:tex` repairs
  what slipped through.
- **`{` is a Svelte expression even inside a plain HTML attribute.** `conclusion="\\frac{3n}{n}"`
  is a parse error; `conclusion={'…'}` is not.
- **Tailwind's preflight strips list markers.** The scaffold's `prose.css` restores them.
- **Keyed `{#each}` over repeatable values** throws `each_key_duplicate` during hydration and
  truncates the page silently — one lesson rendered 9 of its 29 figures because two table columns
  were both called `tail`. Key by index.
- **SVG text does not wrap**, and a fixed gutter with nothing in it scales the whole viewBox down.
  Size gutters from the data; move long prose into the caption.
- **`svelte-check` reports diagnostics against unpreprocessed text**, so lesson pages must stay in
  the `tsconfig.json` exclude list. `npm run build` compiles them for real.
- **Recover a lost `package.json`** from `package-lock.json`'s root `packages[""]` entry if a
  careless write destroys it.
