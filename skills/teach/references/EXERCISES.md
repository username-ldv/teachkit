# Exercises

Knowledge is acquisition; skills are durability. Exercises are where the lesson stops being read and
starts being owned. This is the half most likely to be under-built, and the half the learner
notices.

---

## The shape of a batch

**Four per lesson**, in this order:

1. **Build the thing.** Implement the structure, the algorithm, the component the lesson taught.
2. **A classic problem** at learning-friendly difficulty — the interview or textbook version, chosen
   so it is solvable with exactly what has been taught.
3. **A second angle** on the same idea: a variation, a prediction, a bug to find, a design to
   compare against another.
4. **The practical one** (green `practical` label): a real-world build the learner could ship. This
   one was explicitly asked for and is "greatly appreciated" — a rate limiter, a pagination helper, a
   browser-history engine, a config flattener. Where it does not fit the topic, say so rather than
   faking it.

Then **two optional external problems per exercise**, in a `<MoreProblems>` footer: name, link,
difficulty in parentheses, one clause on what it adds. Deliberately outside the solution `<details>`
so they are visible without spoiling anything.

---

## Design rules

**Transfer, not copying.** An exercise whose answer appears verbatim in the lesson above it teaches
nothing. Ask for an extension, a variation, a prediction, or a fix.

**State the invariant.** Every build-a-structure exercise must say what must be true when it works:
*after X runs, the structure holds exactly Y*. Without this the learner cannot tell a passing
implementation from a lucky one.

**State the expected observable outcome per step.** What logs, roughly how many times, what stays
silent, and why — so success and failure are unambiguous without opening the solution. Use
`<ol class="steps">` and a `<p class="checkpoint">`.

**Say out loud when a helper reads mutable state.** "Recompute the index" is not the same warning as
"the function that computes the index reads a field you are in the middle of changing". A rehash
loop that called `indexFor` before swapping in the new buckets passed 10 of 12 tests and was wrong.

**Name units and kinds in every parameter.** Duration or instant, count or index. This has cost an
entire exercise's intelligibility once.

**Progressive hints in `<Solution kind="hint">`,** then a worked solution. The worked solution must
compile against the stub as given — a solution using `int64` where the stub used `int` could never
have run.

**Two tracks stay in lockstep.** If the course teaches two languages, an exercise exists in both,
at equal difficulty, or it may never be reachable — the learner picks per exercise, not per lesson.

---

## Where exercises live

Prefer a **stub plus a pre-written test suite in the learner's own repo** over console harnesses in
the page. This was asked for explicitly and it is the single biggest quality jump available: real
tests to code against, run from a real editor.

Layout that works:

```
<repo>/<course>/lesson-NN-slug/<exercise>.ts      stub with a TODO and a header comment
<repo>/<course>/lesson-NN-slug/<exercise>.spec.ts tests, pre-written, not to be edited
<repo>/<course>/README.md                         the workflow
```

**Gate future lessons so a plain test run stays green.** The batch ships all at once but is turned
on one exercise at a time:

- TypeScript / Vitest: `describe.skip` plus a three-line header telling them to remove it.
- Go: a `//go:build lessonNN` tag plus the same instruction. `go test ./...` then reports
  "[no test files]" for gated packages rather than failing.

Ship the *whole batch* gated, not just the later lessons — three lessons arrive at once and the
learner enables them individually, in whichever language they pick that day.

**Respect the host repo.** Read its conventions (test file suffix, import style, formatter, linter,
existing config) and match them. Keep changes small, additive, and flagged to the user. If a linter
rule fights the stubs (unused parameters are unused *by design*), add a scoped override rather than
changing their global config.

---

## Verify before shipping — always

A broken spec costs the learner an hour and their trust in the whole suite.

1. Write **reference solutions in place**.
2. Run the suite with every gate opened: `npx vitest run <dir>`, `go test -tags "lessonNN …" ./...`.
   All green.
3. Run the type-checker separately — **Vitest transpiles without typechecking**, so
   `npx tsc --noEmit -p tsconfig.json` catches what the test run cannot. A readonly-tuple error sat
   in a spec for two sessions because of this.
4. Run the repo's formatter and linter (`gofmt -l`, `go vet`, `npx oxfmt`, `npx oxlint`, whatever it
   uses).
5. **Restore the stubs** and re-run to confirm they fail for the right reason.

This process has caught real bugs, including a test that counted two initialisation reads as part of
a single-pass assertion.

**Never edit the learner's in-progress code.** If a correction is needed in a file they have started,
give it in chat, or edit only the doc comment.

---

## Test the method, not just the answer

This is the main advantage over a console harness — lean on it hard. Assert the property the lesson
is actually about:

- **Single pass**: count reads with a `Proxy` (TypeScript) or fail an O(n²) solution with a
  goroutine plus `time.After` on a large input (Go).
- **No allocation**: `testing.AllocsPerRun` in Go asserts O(1) space directly.
- **No hidden data structure**: take `Set`/`Map`/`WeakSet`/`WeakMap` away for the duration of the
  call to enforce an O(1)-space claim in TypeScript.
- **In-place work**: `Object.is` identity on the container.
- **Structural claims**: old tail is the new head after a reversal; the capacity staircase is
  exactly the doubling sequence.
- **Real collisions**: search at runtime for genuinely colliding keys rather than hoping the ones
  you picked still collide.

For "two structures that must agree" exercises (a map plus a list, an index plus a store), the
shipped tests check behaviour and a separate **differential audit** checks the invariant: run the
learner's implementation and a naive reference over a million random operations and compare after
*every* operation. That harness has found what a test suite did not.

**If a spec needs randomness**, use a decent PRNG — mulberry32 on `Math.imul` in JS,
`math/rand/v2` with `rand.NewPCG` in Go. A hand-rolled LCG loses precision past 2^53 and its low
bits barely vary, which quietly made one test only ever reach 28 of 50 slots.

**Helpers defined once per package** must live in a file that is never gated out, or the package
stops compiling when the learner enables a different lesson.

---

## Picking external problems

- Verify slug, id, difficulty and paywall status through the site's own API, not by fetching the
  page — plain GETs to LeetCode return 403 for everything, so a status check proves nothing:
  `POST https://leetcode.com/graphql/` with
  `query{question(titleSlug:"…"){questionFrontendId title difficulty isPaidOnly}}`.
- No paid problems. No problem already linked elsewhere in the same batch.
- Only problems solvable with what has been taught by that lesson.
- The learner follows these links and solves problems there, leaving no trace in any repo. They are
  real teaching surface — choose them deliberately.
