---
name: teach-remake
description: "Aggressively rewrite a range of existing lessons against a target standard — deepening, restructuring, splitting, merging, reordering, replacing, and moving practice. Changes content, not just presentation. USER-INVOKED ONLY: run this only when the user explicitly asks for it by name (/teach-remake, $teach-remake). Never load or act on it from an ordinary message."
disable-model-invocation: true
argument-hint: "lesson range — '1-3', '4', 'all' — plus any standard to remake against"
---

# Remake

The user has asked for a **large-scale rewrite** of lessons that already exist. Not a fix, not a
port — a rethink. Lessons in the range may be deepened, split, merged, reordered, replaced, or cut,
and the course's lesson inventory may change shape.

Read [`teach/SKILL.md`](../teach/SKILL.md) and its references first. This skill assumes all of it;
what follows is only what is different when the material already exists and the learner has already
read it.

## Which of the three you are actually in

| The problem | Skill | What changes |
| --- | --- | --- |
| A section was unclear, a claim is wrong, a task is unintelligible | `/teach` (Mode C, repair) | One section, one callout, one checkpoint |
| The content is right; the platform is old — HTML files, ASCII art, hand-rolled highlighting | `/teach-adapt` | Presentation. Prose and code survive byte-for-byte |
| The content itself is thin, mis-ordered, mis-scoped, or promises more than it delivers | **`/teach-remake`** | Anything. Including which lessons exist |

If the user asks for a remake and the audit finds only one bad section, say so and offer repair
instead. Rewriting a good lesson costs the learner their familiarity with it for nothing.

## 0 · Scope, before anything else

**A range is required.** `1-3`, `4`, `2,5-7`, `all`. Lessons outside it keep their content.

Two things are allowed to touch lessons outside the range, and both must be named in the plan:

- **Navigation and manifest edits** — prev/next, numbering, roadmap. Unavoidable if the inventory
  changes.
- **One-line reconciliations** — a forward reference in lesson 6 to material that moved out of
  lesson 3, a promise now paid earlier. Anything larger means the range was drawn too small; say so
  and ask.

## 1 · The target standard

Write it down before auditing anything. Everything the audit reports is measured against it.

**Default**: the defaults table in [`teach/SKILL.md`](../teach/SKILL.md) plus
[LESSON-ANATOMY.md](../teach/references/LESSON-ANATOMY.md) — long-form, four substantial exercises,
strict sequencing, arithmetic shown, spaced retrieval, figures where movement is the lesson. The
course's own `NOTES.md` overrides these where it is explicit.

**Custom**: the user may state something else — "project-first, less theory", "move all practice
into my repo", "these should be 15 minutes, not 35", "add a track for a second language". Take it
literally, write it into the plan, and apply it consistently across the whole range rather than
softening it lesson by lesson.

Where the stated standard conflicts with something already in `NOTES.md`, name the conflict in the
plan and say which one you are following. Do not resolve it silently — `NOTES.md` is a record of
decisions the learner made, and overriding one is itself a decision.

## 2 · Audit

**Read the lessons.** Not the manifest, not the index cards — the actual pages, end to end. The
audit is worthless otherwise, and the most common defects are exactly the ones a summary hides.

Produce a table, one row per lesson: **what it claims · what it delivers · the gap**. Look for these
specifically; each has shipped at least once:

1. **The promise gap.** The header pill, the index card and the body disagree about how many
   exercises there are or how long they take. This is the defect that produced this skill: a course
   advertised "4 in-page tasks" for four three-minute prompts, and the reading and practice time
   were added together into one misleading number.
2. **Checkpoints counted as exercises.** A short feedback-bearing prompt inside a section is a
   *checkpoint*. An exercise is substantial, has an invariant, and is done at a real keyboard.
   Never count checkpoint time in the exercise estimate.
3. **Assertion in place of derivation.** "≈", "clearly", "it follows that", three steps compressed
   into one sentence.
4. **Decorative figures, and missing ones.** A figure that repeats what the caption says, or a
   paragraph the reader has to run in their head with no figure at all.
5. **Sequencing violations.** Something used, quizzed, or relied on — *including in example code* —
   before it was taught.
6. **Unpaid promises.** Every "What's next" paragraph and every "we'll get to this in lesson N".
7. **Undefined terms of art.** Grep for them; each must be defined on the page or promoted in
   `GLOSSARY.md`.
8. **Contradictions across lessons.** Two lessons giving opposite advice about the same-looking
   operation without naming the distinguishing principle.
9. **Practice that is copying.** An exercise whose answer appears verbatim above it.
10. **Sources.** Fetch every one. A dead or wrong primary source is a lesson-level defect.
11. **Two sources of truth.** Anything a page states that the manifest also states. These drift
    silently and the drift is always discovered by the learner.
12. **Scope.** A lesson carrying two lessons' worth of material, or half of one.

Report the audit before proposing anything. It is also the evidence for the plan.

## 3 · The plan — then stop and wait

A remake destroys work the learner has read. **Never rewrite before the plan is approved.**

The plan states:

- **The inventory, before and after.** A two-column list of lesson numbers, titles and slugs. Mark
  each: keep · deepen · split · merge · reorder · replace · drop · new.
- **Per lesson in range**: the gap from the audit, and what the rewrite does about it.
- **What is added**: new lessons, new figure components, new reference sheets, new practice.
- **What is removed**, and what the learner loses by it. Be explicit. Material they liked may be
  going.
- **What moves out of range** — the navigation and reconciliation edits from §0.
- **Promises**: which get paid, which get retracted, which move.
- **Anything they already studied whose claims change.** This is the part they most need to see.
- **The cost**: roughly how much is being rewritten, and what stays untouched.

Then wait. If they narrow the range or reject a lever, follow that exactly.

## 4 · The levers

These are in scope by default and belong in the plan rather than in a separate question.

**Change the inventory.** Split a lesson carrying two lessons' worth of material. Merge two thin
ones. Reorder for real dependency rather than the order they happened to be written in. Drop
material that no longer earns its place. **Promote a roadmap item into a real lesson** when the
range's content is already leaning on it — that pays a promise and is usually the highest-value
single move available.

**Move the practice environment.** In-page tasks → stubs plus a gated test suite in the learner's
own repo, or the reverse. This is the biggest quality lever there is: real tests to code against,
run from a real editor, checking *method* rather than answers. See
[EXERCISES.md](../teach/references/EXERCISES.md) for the layout, the gating, and the
verify-by-solving requirement. When practice moves, the old files stay where they are — see §5.

**Add a review lesson.** A lesson that introduces nothing and only revisits: mixed retrieval across
everything so far, interleaved rather than grouped by topic, with the exercises drawn from different
lessons in deliberately jumbled order. Interleaving is the one part of the spacing story a
lesson-by-lesson course never gets. Also use this shape for a **concepts-only lesson placed before
an implementation one** when a subject is dense enough that the theory and the build should not
share a page.

**Add a capstone.** One larger build that spans the range's material, with the theory already paid
for so the lesson is mostly brief plus scaffolding plus acceptance criteria. Earns its place when
several lessons have each produced a piece and nothing has yet made the learner assemble them.

## 5 · Continuity — what a remake must not break

- **Keep the slug when the lesson's identity survives**, however completely the words change. It is
  a URL the learner has bookmarked and a name their learning records use. Change it only when the
  lesson genuinely becomes a different lesson, and then **record old → new in `NOTES.md`**.
- **Renumbering is one edit in the manifest and a hundred references in prose.** Every
  `NOTES.md` entry, learning record, and cross-lesson mention that says "Lesson 4" now means
  something else. Grep for them, fix them, and write the number mapping down.
- **Never delete a learning record.** Mark it `Status: superseded by LR-NNNN` and write the new one.
  How the understanding evolved is signal; the record of what they demonstrated does not stop being
  true because the lesson changed.
- **Never touch the learner's own exercise files.** If practice moves to a new location, the old
  files stay exactly as they are and the repo README says they are superseded. They may have work in
  progress in them.
- **Where a claim they already learned has changed, say so on the page.** A marked correction, not a
  silent rewrite. They may have built on the old version. This is the standing rule about visible
  correction, applied at the scale where it matters most.
- **Do not promote glossary terms** because a lesson was rewritten. Promotion is gated on the
  learner demonstrating the term, and a remake is evidence about you, not about them.

## 6 · Rewrite

Per lesson, in order, following [LESSON-ANATOMY.md](../teach/references/LESSON-ANATOMY.md). Two
things specific to a remake:

- **Keep what was good.** A remake is not a demonstration of effort. If a section already lands,
  leave it — the diff is a means, not the goal. The audit says what was wrong; everything else is
  not a target.
- **Do the whole range before verifying any of it.** Contradictions between lessons are the defect
  class a remake most easily introduces, and they only show up once the whole range exists.

## 7 · Verify

The full list in [VERIFICATION.md](../teach/references/VERIFICATION.md), plus these, which only
apply when material has moved:

- [ ] **Every claim in the plan actually happened.** Walk the plan and check off each line.
- [ ] **No sequencing regression from reordering.** Re-read the range in its new order and check
      every term and technique against what precedes it. Reordering is the move most likely to break
      strict sequencing, and the break is invisible from inside a single lesson.
- [ ] **Number and slug references resolve**, in prose, in `NOTES.md`, in learning records, and in
      the practice repos.
- [ ] **Exercise suites**: reference solutions in, all green, type-check separately, formatter and
      linter clean, starters restored, gates back on.
- [ ] **The promise gap is closed.** For every lesson in range, the index card, the header pill and
      the body agree, reading time and exercise time are separate, and no checkpoint is counted as
      an exercise.

## 8 · Record

`NOTES.md` gets a dated section. It must **supersede rather than overwrite** — leave the earlier
entry in place and say what replaced it, the way a superseded learning record works. Something like:

```md
## Depth and practice remake — {date}

- {What the user reported, or the standard they asked for.}
- {The constraint this supersedes: "the migration preserved the old prose for source fidelity;
  this remake supersedes that constraint."}
- {What changed, per lesson, in one line each.}
- {Inventory changes and the old → new number/slug mapping.}
- {How it was verified — the suites that ran, the count that passed.}
- {What was deliberately NOT done, and why.}
- Next promise: {what the range now owes.}
```

Then update `AGENTS.md` for any rule that changed, `MISSION.md` if success criteria moved,
`RESOURCES.md` for sources added, and the manifest and roadmap. Write a learning record only if the
*learner* demonstrated something.

## Standing hazards

- **The audit is the work.** A remake that starts writing before it has read every page in the range
  produces a longer version of the same lesson.
- **A bigger diff is not a better remake.** Rewriting what already worked costs the learner their
  familiarity and buys nothing.
- **Do not remake the range into a different course.** The mission is the constraint; if the remake
  genuinely needs the mission to change, that is a separate conversation, confirmed with the user,
  and it gets a learning record.
- **Read [STANDING-RULES.md](../teach/references/STANDING-RULES.md) before writing.** A remake
  reintroduces every one of those failure modes at once, because it is writing many lessons in one
  pass under a deadline of its own making.
