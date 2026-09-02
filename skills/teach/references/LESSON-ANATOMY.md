# Anatomy of a lesson

The order below is the shipped shape of every lesson in the reference course. Keep it — the learner
navigates by it, and a lesson that skips a part reads as unfinished.

A skeleton to copy is in [LESSON-TEMPLATE.md](LESSON-TEMPLATE.md).

---

## Sections, in order

**1. `<svelte:head><title>`** — `Lesson N · Title — Course Name`.

**2. `<LessonHeader>`** — number, title, minutes, exercise count, `builds`. Breadcrumbs, the
"Lesson N of M" kicker, the track pills and the reference links all come from `$lib/course.ts`.
Never hand-write navigation.

**3. `<Recall>`** (lesson 2 onward) — three `<Question>`s drawn from *earlier* lessons only. Not the
current one; that is what the checkpoints are for.

**4. `<LessonToc>`** — one entry per `<h2>`, matching the `id`s exactly. Entries are raw inner HTML,
so an entry may carry markup or a second link.

**5. The body** — numbered `<h2 id="…">` sections. Ten to fourteen is normal for a 30-minute lesson.
The arc that works:

- **The wall.** Open with the problem the learner already has. "Look at what four lessons of price
  lists have in common" beats "a hash map is a data structure that…". Motivation before machinery.
- **The idea, in one sentence,** before any mechanism.
- **The mechanism, slowly.** One concept per section. Figures where the shape is the point.
- **The arithmetic, shown.** `<Derivation>`, every step, with the reason beside it.
- **A checkpoint `<Quiz>`** after each dense stretch — 3 to 4 in the lesson.
- **The real thing.** How the language or framework actually implements it, and what differs.
- **When *not* to use it.** Honest limits. A lesson that only sells is not teaching.
- **The payoff.** Something the learner could not do before and now can.

**6. `<h2 id="exercises">Exercises</h2>`** — see [EXERCISES.md](EXERCISES.md).

**7. `<PrimarySource>`** — one source, fetched and verified this session, with a sentence on which
part to read and why. Not a link dump: the *primary* source is one thing.

**8. Further reading** — a `<ul>` of two to five, each annotated with when to reach for it.

**9. `<AskTeacher>`** — with lesson-specific prompts, not the generic default. "Walk me through a
resize with actual numbers", "paste your LRU cache and I'll check the invariant with you". Name the
section that is most likely to have wobbled and invite the question.

**10. `<h2 id="next">What's next</h2>`** — one paragraph that names the next lesson and what it
unlocks. This is where promises are made; every promise made here must be recorded in `NOTES.md` and
paid.

**11. `<PrevNext n={N} />`**.

---

## Writing the prose

**Long is correct.** 25–35 minutes. When in doubt whether something needs explaining: explain it.
The failure mode of this course has never been too much detail.

**One step per sentence in an argument.** The single worst-received paragraph in the reference
course compressed three steps into one sentence and used "≈" for the hard part. Rewritten as three
explicit steps plus a convergence table, it landed. This is the standing rule: *the learner is fine
with the mechanics but needs the intermediate arithmetic shown.*

**Never "clearly", "obviously", "it follows that", or "≈" carrying real weight.**

**Never "there are exactly N ways".** Say "four ways, all correct" or prove the bound. An overclaim
invites a counterexample, and the learner has produced one.

**Earn every compression.** When the compact form of something is what practitioners write, show the
uncompressed form first — the named temporaries, the expanded index arithmetic, the algebraic
rearrangement — and then compress it in front of the reader. A chained field access on the *left* of
an assignment is the canonical case: `n.prev.next = n.next` is confusing precisely because
`n.prev.next` read as a value equals `n`. Show the storage-location reading explicitly.

**Name units and kinds.** Any parameter whose name carries a unit must say whether it is a duration
or an instant, a count or an index. `windowMs` as a *length* read as a *start time* made an entire
exercise unintelligible.

**Every claim gets a citation.** Link the source inline. A lesson dense with links is a lesson the
learner can check.

**Correct visibly.** When shipped material turns out to be wrong, fix it with a marked callout that
says what was wrong, not with a silent patch. Then grep the workspace — the claim will have
propagated into reference sheets, glossary entries and exercise stubs.

---

## The escape hatches

- `<Callout kind="note|tip|warn|deep">` — `deep` is the going-further aside, `warn` the trap.
- `<Solution summary="…" kind="hint|solution">` — a spoiler. Hints yellow, worked answers green.
- `<Playground>` — where the exercises live for this lesson.
- `<RepoRef path="…" line={…}>` — cite a real file in the learner's own codebase.
- `<PrimarySource title="…">` — reusable for a second source box mid-lesson when a section leans
  entirely on one document.
