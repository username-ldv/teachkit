# Anatomy of a lesson

The order below is the shipped shape of every lesson in the reference course. Keep it — the learner
navigates by it, and a lesson that skips a part reads as unfinished.

A skeleton to copy is in [LESSON-TEMPLATE.md](LESSON-TEMPLATE.md).

---

## Sections, in order

**1. `<svelte:head><title>`** — `Lesson N · Title — Course Name`.

**2. `<LessonHeader n={N} />`** — and nothing else. Title, reading time, exercise count, exercise
time and `builds` are all read from `$lib/course.ts` by lesson number, along with the breadcrumbs,
the "Lesson N of M" kicker, the track pills and the reference links. **Add the lesson to the
manifest first.** Passing any of it as a prop is how a course ends up advertising one exercise count
on its index card and a different one in its own header — that has happened, and the learner found
it before anyone else did.

**3. `<Recall>`** (lesson 2 onward) — three `<Question>`s drawn from *earlier* lessons only. Not the
current one; that is what the checkpoints are for.

**4. `<LessonToc>`** — one entry per `<h2>`, matching the `id`s exactly. Entries are raw inner HTML,
so an entry may carry markup or a second link. The same entries feed `LessonRail`, the buttons in
the right margin (top, a floating copy of this list, exercises, end): its exercises button appears
only when an entry links `#exercises`.

**5. The body** — numbered `<h2 id="…">` sections. Twelve to sixteen is normal for a 45-minute
lesson.
The arc that works:

- **The wall.** Open with the problem the learner already has. "Look at what four lessons of price
  lists have in common" beats "a hash map is a data structure that…". Motivation before machinery.
- **The idea, in one sentence,** before any mechanism.
- **The mechanism, slowly.** One concept per section. Figures where the shape is the point.
- **The arithmetic, shown.** `<Derivation>`, every step, with the reason beside it.
- **A checkpoint** (`<Quiz>` or `<NumericQuestion>`) after each dense stretch — 6 to 8 in the
  lesson.
- **The real thing.** How the language or framework actually implements it, and what differs.
- **When *not* to use it.** Honest limits. A lesson that only sells is not teaching.
- **The payoff.** Something the learner could not do before and now can.

**6. `<h2 id="exercises">Exercises</h2>`** — see [EXERCISES.md](EXERCISES.md).

Everything before this heading is a **checkpoint**, never an exercise. See below.

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

## Checkpoints are not exercises

Two different things give feedback inside a lesson, and conflating them breaks a promise the learner
is counting on.

A **checkpoint** is short — a `<Quiz>` of multiple-choice `<Question>`s, or a `<NumericQuestion>`
where the answer is a number and the page checks it. It sits inside the section it tests, takes
under a minute, and exists to make retrieval effortful. There are 6–8 per lesson and they are part
of the *reading*.

An **exercise** is substantial. It is done at a real keyboard, it states an invariant, it takes
fifteen minutes at the least and often an hour or more, and it lives under the Exercises heading.
There are four.

From this:

- **Never count checkpoint time in the exercise estimate.** A lesson with four three-minute prompts
  has *zero* exercises, and saying otherwise is the single complaint this format has produced.
- **State reading time and exercise time separately**, both in the manifest (`minutes` and
  `exerciseTime`), both conservative.
- **A migrated short prompt stays a checkpoint.** Carrying an old course's brief tasks forward is
  fine; promoting them to "exercises" to satisfy the count is not.

## Writing the prose

**Long is correct.** 35–50 minutes, and that is a target, not a cap: a topic takes the time it
needs, or becomes two lessons. Do not cut explanation to fit the number. When in doubt whether
something needs explaining: explain it. The failure mode of this course has never been too much
detail.

When a lesson runs well past the target, offer the split rather than deciding it. One learner
asked for heavy topics to be split, then kept a 65-minute lesson whole when offered the choice
("it is ok to keep as one"); a 55-minute one before it "was ok" too.

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
- `<NumericQuestion expected={…} tolerance={…} hint="…" correct="…">` — a checkpoint whose answer
  is a number, checked live. The right shape whenever the retrieval is arithmetic.
- `<Question … shuffle={false}>` — freeze the option order. `<Question>` otherwise reshuffles on
  every page load, which is what stops `answer={0}` becoming a pattern; freeze it only when the
  options have to be read in the order written ("all of the above", a numbered sequence).
- `<RepoRef path="…" line={…}>` — cite a real file in the learner's own codebase.
- Wrap every `<table>` in `<div class="table-wrap">` so a wide one scrolls inside its own box
  instead of pushing the page sideways.
- `<PrimarySource title="…">` — reusable for a second source box mid-lesson when a section leans
  entirely on one document.
