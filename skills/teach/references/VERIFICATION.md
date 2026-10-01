# Before shipping

Every item here exists because something shipped without it. Three sessions running, the problems
the learner reported were an unverified URL, an undefined term, and an inconsistent label — all
things a mechanical pass catches, none of which link-checking or test-running covered.

Run the whole list. It is not long, and skipping the boring half is how the boring half fails.

---

## Mechanical

- [ ] **`npm run build`** — compiles and prerenders every page. This is the real gate; `svelte-check`
      does not cover lesson pages and cannot.
- [ ] **`npm run check`** — the component library still type-checks. Zero errors, zero warnings.
- [ ] **`npm run check:pages`** with the dev server running — every route, every internal link, every
      `#fragment`. Fails on box-drawing characters, unreplaced markers, KaTeX errors and
      double-escaped braces.
- [ ] **`npm run fix:tex`** if any `<Derivation>` or `<Math>` was touched.
- [ ] **Exercise suites**: reference solutions in, all green, type-check separately, formatter and
      linter clean, stubs restored, failing for the right reason. See [EXERCISES.md](EXERCISES.md).
- [ ] **`npm run check:exercises`**: every `Test…` a page names exists in that lesson's test files,
      and every `-run` pattern the page prints matches at least one test. Set `TEST_ROOTS` in
      `tools/check-exercise-refs.mjs` once, when the practice repo is created.
- [ ] **Read which tests pass on the untouched stub.** Each one is deliberate and the page says so, or
      it is a defect (STANDING-RULES 41).
- [ ] **Mutate for every claim about code.** Every "X would pass/fail Y" or "X looks equivalent and is
      not" in a hint, worked solution or test comment, and every test written to catch one specific
      mistake: swap the line into the reference solution and run the real suite (STANDING-RULES 40).
- [ ] **Run the solution that is *on the page*, not the one you wrote while authoring.** Extract every
      `<CodeBlock>` inside a `<Solution kind="solution">`, paste it into the exercise repo, run the
      shipped tests. These two artefacts drift: L9 ex 2 and 3 shipped solutions carrying the previous
      lesson's `Counters` parameter — which the stubs no longer had — and an ungated `TopK` that
      panicked on the empty array the shipped test feeds it at n = 0. Both tracks, both exercises. The
      learner found it by following the page exactly. "The reference solution passed" is only true of
      text that was compiled and run.

## Content

- [ ] **Fetch every primary-source URL.** Recognising a URL pattern is not verification — two lessons
      cited a documentation path that had never existed.
- [ ] **Grep the new pages for terms of art.** Every one is defined on the page or already promoted
      in `GLOSSARY.md`. Watch for a word that names two different things in the same course.
- [ ] **Label-vs-code pass.** Every identifier in a figure means exactly what the same identifier
      means in the code on that page. Read the figures against the code, not from memory.
- [ ] **Method pass.** For each exercise, search the page *outside* its `<Exercise>` block for its
      central operation and for every constant, case and term its worked solution and tests name. If
      it is only in a hint, teach it in the body (STANDING-RULES 39). When this rule is new to a
      course, run it on the lessons already shipped too.
- [ ] **Sequencing pass.** Nothing is used, quizzed, or relied on that has not been taught earlier in
      this course — *including in example code*. A concept the mission defers must not appear
      unflagged.
- [ ] **Consistency pass across the batch.** Two exercises in one lesson must not give opposite
      advice about the same-looking operation without the lesson naming the distinguishing
      principle. Check the batch against the lessons before it too.
- [ ] **Every claim about behaviour, cost or memory** is either cited to a source that states it
      outright, or measured by code you ran.
- [ ] **No "≈", "clearly", "obviously"** carrying real weight, and no "there are exactly N ways".
- [ ] **Quiz options are equal length** and give nothing away by formatting.
- [ ] **`npm run check:quizzes` is green.** `<Question>` shuffles its options on every load, so
      `answer` needs no thought — but an explanation that says "the third option" is now wrong, and
      an "all of the above" needs `shuffle={false}`. The lint catches both, and warns when the
      correct option is markedly the longest.
- [ ] **`<Recall>` draws only from earlier lessons.**
- [ ] **Promises made in "What's next" are recorded in `NOTES.md`.**

## Visual

- [ ] **Look at every page in a browser.** Diagrams are the point now; a figure that overlaps, clips,
      or renders its labels at a different size from the page's other figures is a bug, and only a
      screenshot will tell you.
- [ ] **`/dev/diagrams`** still renders every component, including any you added.
- [ ] **Interactive figures**: the untouched first frame is a meaningful state, and the caption reads
      correctly without the controls.
- [ ] **No sideways scroll at full width.** Nothing overflows horizontally; wide figures scroll
      inside their own box rather than pushing the page. Desktop width only — the learner reads on a
      PC, and a phone-width pass once cost a whole verification round on a screen nobody uses.

## Bookkeeping

- [ ] `src/lib/course.ts` — new lessons added, roadmap updated.
- [ ] `NOTES.md` — what was delivered, what was promised, any new rule this batch produced.
- [ ] `learning-records/` — only if the *learner* demonstrated something. Not because lessons exist.
- [ ] `GLOSSARY.md` — only terms they have used correctly.
- [ ] `RESOURCES.md` — any new source, annotated with when to reach for it.

---

## Reporting

Say what was verified and how. If something failed and was left failing, say that plainly with the
output. "All pages clean" means the checker printed it, not that nothing looked wrong.
