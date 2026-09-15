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

## Content

- [ ] **Fetch every primary-source URL.** Recognising a URL pattern is not verification — two lessons
      cited a documentation path that had never existed.
- [ ] **Grep the new pages for terms of art.** Every one is defined on the page or already promoted
      in `GLOSSARY.md`. Watch for a word that names two different things in the same course.
- [ ] **Label-vs-code pass.** Every identifier in a figure means exactly what the same identifier
      means in the code on that page. Read the figures against the code, not from memory.
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
