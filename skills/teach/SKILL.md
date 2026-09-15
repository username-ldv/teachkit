---
name: teach
description: "Run a long-form course of deeply-explained, interactive lessons, built as a SvelteKit app in the current directory. USER-INVOKED ONLY: run this only when the user explicitly asks for it by name (/teach, $teach). Never load or act on it from an ordinary message, however relevant the topic seems."
disable-model-invocation: true
argument-hint: "topic to learn · 'continue' · or what went wrong in the last lesson"
---

# Teach

The user has asked to be taught. This is **stateful and long-running**: a course lives in this
directory across many sessions, and you are its author, its teacher, and the person who fixes it
when it fails.

The course is a **prerendered SvelteKit app**, not a pile of HTML files. Lessons are routes built
from a shared component library; figures are real SVG components, some of them interactive; code is
highlighted at build time. `scaffold/` in this skill is that app, ready to copy.

## Work out which mode you are in — this is the first thing to do

Look at the directory before writing anything.

| What you find | Mode | Go to |
| --- | --- | --- |
| Empty, or no `MISSION.md` | **New course** | [Mode A](#mode-a--new-course) |
| `MISSION.md` + `src/routes/lessons/` | **Continue** | [Mode B](#mode-b--continue-a-course) |
| `MISSION.md` + `lessons/*.html`, no `src/` | **Unmigrated** | Say so, and offer `/teach-adapt` |
| The user is reporting confusion, a dispute, or a bug in a delivered lesson | **Repair** | [Mode C](#mode-c--repair) |

Repair beats everything. If the user's message is "I don't understand X" or "isn't X wrong?",
that is Mode C even mid-batch — and it is the highest-value work in this skill.

Mode C is for **one section, one claim, one task**. If what is wrong is the lesson's depth, scope,
order, or the practice it promises — anything where the fix is "rewrite it" rather than "correct
it" — that is `/teach-remake`, which takes a lesson range and rethinks it against a standard. Say
so rather than quietly starting a rewrite inside a repair.

## Orient — read these, in this order, every session

1. `AGENTS.md` (or `CLAUDE.md`, whichever the workspace has) — workspace-specific build and
   authoring rules. Overrides this skill where they differ.
2. `NOTES.md` — how *this* learner wants *this* course taught, plus every gap found in use.
3. `MISSION.md` — why they are learning it. Every lesson traces back here.
4. `learning-records/` — what they have actually demonstrated. This is the floor.
5. `GLOSSARY.md` — the course's fixed vocabulary. Do not redefine a promoted term.
6. `RESOURCES.md` — the trusted sources. Do not teach from parametric memory.
7. `src/lib/course.ts` — the manifest: lesson order, titles, roadmap.
8. `references/LOCAL.md` in this skill, **if it exists** — machine-specific facts (where the
   practice repos live, which ports are taken, the learner's background). Gitignored, so it is
   absent on a fresh install; that is fine.

## The defaults

These are the settled preferences, learned across five courses. Apply them unless `NOTES.md`
says otherwise for this workspace. They are not the generic-good-teaching defaults — they are
this learner's, and they are deliberately maximalist.

| | Default |
| --- | --- |
| **Lesson length** | 25–35 minute read. Long is correct. When in doubt whether to explain something: explain. |
| **Batch size** | 3 lessons, generated together, strictly sequential. |
| **Sequencing** | Never use, quiz, or assume anything not taught earlier *in this course*. The baseline is written in `MISSION.md`; nothing else may be assumed. |
| **Exercises** | 4 per lesson, each **substantial** — done at a real keyboard, with an invariant: build the thing · a classic problem at learning difficulty · a second angle · and a **practical real-world build** (green label). Plus 2 optional external problems per exercise. |
| **Checkpoints** | 3–4 `<Quiz>` / `<NumericQuestion>` blocks through the lesson. Options equal length, retry until correct, explanation only on success. **A checkpoint is not an exercise** and its time never counts toward the exercise estimate. |
| **Time** | Reading time and exercise time are stated **separately** and conservatively. Both live in the manifest, never in page props. |
| **Spaced retrieval** | Lesson 2 onward opens with `<Recall>` — 3 questions from *earlier* lessons only. |
| **Ratio** | Theory-heavy. Exercises serve the concepts, not the reverse. |
| **Arithmetic** | Shown, never asserted. No "≈", no "clearly", no three steps compressed into one sentence. Use `<Derivation>`. |
| **Figures** | Components from `$lib/diagrams`. **No ASCII art. No hand-written `<svg>` in a page.** |
| **Interactivity** | Where the *movement* is the lesson — never decorative. See [INTERACTIVITY.md](references/INTERACTIVITY.md). |
| **Theme** | Dark, always. No light mode, no print stylesheet — the learner reads on screen. |
| **Screen** | A PC. Pages are checked at full desktop width; no phone-width pass, and no effort spent on small-screen layouts. |
| **Every lesson ends with** | Primary source (fetched and verified) · further reading · ask-your-teacher box · prev/next. |

## Mode A — new course

1. **Interview first.** Do not scaffold, do not research, do not write. Follow
   [COURSE-SETUP.md](references/COURSE-SETUP.md) — it has the question set, the topic archetypes,
   and the rule that you must propose *this topic's* interactive apparatus and let the user choose.
2. **Write `MISSION.md`** from the answers. Then `RESOURCES.md`, after real research — fetch every
   URL you list.
3. **Scaffold**: copy `scaffold/` into the workspace, fill in `src/lib/course.ts`, `npm install`,
   `npm run dev`. Details in [COURSE-SETUP.md](references/COURSE-SETUP.md).
4. **Write the workspace instruction file** (`AGENTS.md`) from the template in COURSE-SETUP.md,
   and `NOTES.md` with everything the interview established.
5. **Write lessons 1–3.** Then verify ([VERIFICATION.md](references/VERIFICATION.md)) and report.

## Mode B — continue a course

1. Orient (above). Then work out the **zone of proximal development**: what has been demonstrated,
   what the mission needs next, what the roadmap promised. Read
   [PEDAGOGY.md](references/PEDAGOGY.md) if the next step is not obvious.
2. **Check the promises.** `NOTES.md` records things promised to the learner in earlier lessons
   ("binary search is earned in the sorted-data lesson"). An unpaid promise outranks a new topic.
3. **Ask, do not infer, what they have practised.** Repo state is not a progress report — a
   remaining `TODO` or a skipped test says nothing. This has been wrong before.
4. Write the batch: [LESSON-ANATOMY.md](references/LESSON-ANATOMY.md) for structure,
   [PLATFORM.md](references/PLATFORM.md) for how to build the page,
   [INTERACTIVITY.md](references/INTERACTIVITY.md) for figures,
   [EXERCISES.md](references/EXERCISES.md) for practice.
5. **Verify** ([VERIFICATION.md](references/VERIFICATION.md)). This is not optional and it is not
   quick. Every failure in the checklist there is one that actually shipped.
6. Update `src/lib/course.ts`, `NOTES.md`, and the roadmap. Write a learning record only if the
   *learner* demonstrated something — not because lessons now exist.

## Mode C — repair

The learner says something is unclear, or disputes a claim. This is the most valuable signal the
course produces. Handle it in this order:

1. **If they are disputing a claim, work out whether they are right before defending it.** In this
   course's history they have been right more often than not — including on a Go retention claim, a
   ring-buffer failure mode, and a "there are exactly three ways" overclaim. If they propose a
   design, *implement it and differential-test it* before answering.
2. **Watch for the tell**: they say "this sounds like X" and X is **true**. That is never
   confusion — it means the page asserted a conclusion and skipped the mechanism.
3. **If they call a task unintelligible, read their code first.** The question names the symptom;
   the code names the cause. The reported confusion is usually not the real gap.
4. **Fix the lesson, not the chat.** An answer in conversation evaporates. Rewrite the section,
   add the callout, add a checkpoint question on the thing that broke, and — if it shipped wrong —
   mark the correction visibly rather than patching silently.
5. **Grep the whole workspace.** A wrong claim propagates into reference sheets, glossary entries,
   exercise stubs and test files. Fix every copy.
6. **Record it in `NOTES.md`** as a rule for future lessons, and add a learning record if a
   misconception was corrected. Cross-check the new rule against
   [STANDING-RULES.md](references/STANDING-RULES.md) — if it generalises, say so in the note.
7. Leave the learner's own in-progress code alone. Corrections go in chat or in doc comments.

## Non-negotiables

The long version, with the incident behind each one, is in
[STANDING-RULES.md](references/STANDING-RULES.md). Read it before writing a batch. The five that
have cost the most:

- **Verify every primary source by fetching it.** Recognising a URL pattern is not verification.
- **Never assert behaviour from parametric memory.** If the docs do not say it outright, read the
  source or run it.
- **A correct conclusion does not license an unverified explanation of why.** Produce the failure
  before writing the sentence that describes it.
- **Grep new pages for terms of art.** Every one must be defined on the page or already in
  `GLOSSARY.md`.
- **A label in a diagram must mean exactly what the same identifier means in the code on that page.**

## Reference index

| File | Read it when |
| --- | --- |
| [COURSE-SETUP.md](references/COURSE-SETUP.md) | Starting a new course: the interview, topic archetypes, scaffolding steps, the `AGENTS.md` template |
| [PEDAGOGY.md](references/PEDAGOGY.md) | Choosing what to teach next; designing quizzes and retrieval |
| [LESSON-ANATOMY.md](references/LESSON-ANATOMY.md) | Writing a lesson page — the required sections, in order |
| [LESSON-TEMPLATE.md](references/LESSON-TEMPLATE.md) | A complete skeleton page to copy |
| [INTERACTIVITY.md](references/INTERACTIVITY.md) | Any figure. When interaction earns its keep, and the component library |
| [EXERCISES.md](references/EXERCISES.md) | Designing practice and shipping it into the learner's repos |
| [PLATFORM.md](references/PLATFORM.md) | The SvelteKit app: commands, layout, code blocks, escaping traps |
| [VERIFICATION.md](references/VERIFICATION.md) | Before shipping anything |
| [STANDING-RULES.md](references/STANDING-RULES.md) | Before writing a batch; when a lesson fails |
| [WORKSPACE-FILES.md](references/WORKSPACE-FILES.md) | Writing MISSION / RESOURCES / GLOSSARY / NOTES / learning records |
| `references/LOCAL.md` | Machine-specific facts, if present. Gitignored — never publish anything from it |

Two sibling skills handle work on courses that already exist: **`/teach-adapt`** migrates an older
HTML-file course onto this platform without changing its content, and **`/teach-remake`** rewrites a
range of lessons against a standard, changing content, order and scope.
