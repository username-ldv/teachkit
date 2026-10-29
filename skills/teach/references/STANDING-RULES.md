# Standing rules

Each of these was paid for. The incident is included because the rule without the incident degrades
into a slogan, and a slogan does not survive a session where you are in a hurry.

Read this before writing a lesson, and again when a lesson fails.

---

## Truth

**1. Verify every primary source by fetching it.**
Two lessons cited `opendatastructures.org/ods-go/…` for a book that has no Go edition. The URL
pattern was plausible; the page 404s. Recognising a shape is not verification — fetch it.

**2. Never assert behaviour from parametric memory.**
A shipped Compose lesson claimed `Modifier.graphicsLayer` leaves the touch target at the element's
original position. It does not: hit-testing maps the pointer through the transform. Two web searches
came back inconclusive, and *that inconclusiveness was the signal to go to the source*. When the
docs do not state the behaviour outright, read the implementation or run it.

**3. A correct conclusion does not license an unverified explanation of why.**
"Growing a ring buffer must unroll, not copy" was right. The mechanism given for it — "the free
space ends up between the tail and the head" — was invented, and described the correct state as the
bug. The real failure only appeared when the copy was actually run: doubling the capacity *moves the
wrap point*, stranding elements before the head. If a lesson claims a specific failure mode, produce
the failure before writing the sentence.

**4. Ship the measurement, not the assertion.**
When a lesson makes a claim about memory, cost or timing that a sensible person would doubt, ship
runnable *given* code that measures it. A program that pins 5,000 elements and prints the retained
heap settles what a paragraph cannot. Two disputes ended this way; both times the claim was true and
the prose had been unconvincing.

**5. Quantify, and never say "leak" without saying pinned-until-what.**
The claim that `q = q[1:]` retains the element is true, but its *duration* was overstated by
implication. Bounded by the next reallocation; unbounded if the queue goes quiet. Say which.

**6. Never write "there are exactly N ways".**
"Three standard ways to distinguish full from empty" invited a fourth, which the learner supplied
and which was correct. Say "four ways, all correct", or prove the bound. Being right about the
constraint does not make the list around it complete.

---

## Explanation

**7. Show the intermediate arithmetic. Never "≈", "clearly", or three steps in one sentence.**
The worst-received paragraph in the reference course asserted "1+2+4+…+n/2 ≈ n, so ≤ 2n" in a single
line, with the geometric-series fact stated rather than shown. Rewritten as four explicit steps with
a convergence table, it landed. This is the learner's consistent shape: fine with the mechanics,
needs the steps written down.

**8. Compressions must be earned by having seen the uncompressed thing.**
`n.prev.next = n.next` is hard *because* `n.prev.next`, read as a value, equals `n` — the learner
said exactly that, and was right. The page had never distinguished a chained field access being read
from the same text as a storage location. Show the named-temporaries version, then compress it in
front of them. Same debt applies to `(head + size) % cap` and to age-vs-timestamp rearrangements.

**9. Any parameter whose name carries a unit must say whether it is a duration or an instant, a
count or an index.**
A learner read `windowMs` (a length) as a window *start*, and the exercise became unintelligible.
The question they asked was about something else entirely.

**10. Every build-a-structure exercise states its invariant.**
"After X runs, the structure holds exactly Y." Without it there is no way to tell a correct
implementation from a lucky one.

**11. Never introduce an untaught concept in example code, even for correctness.**
An unexplained `sync.Mutex` appeared in a Go lesson while concurrency was explicitly out of scope.
The learner caught it and was right to. Restructure to avoid it, or reduce it to one clearly-flagged
black box with a one-line "lesson N covers this".

**12. Before shipping, grep the new pages for terms of art.**
"Heap" appeared in lesson 4 having been defined nowhere in lessons 1–3 — the memory model got taught
by using its vocabulary. And watch for one word naming two things: "heap" is also the priority queue
in a later lesson. Both places must say which.

A figure's labels, columns, status line and caption count as terms on the page, and "before
shipping" is not the test — **before the figure is reached** is. This has cost two repairs in one
course. `FloatLab` printed *bias*, *exponent field* and *fraction* in lesson 2 §9 where the prose
introduced none of them. `StringLab` sat in lesson 3 §1 printing a *code point* row (`U+00E9 · 233`)
above a *bytes (hex)* row (`C3 A9`), and the prose that says those are different kinds of number did
not arrive until §5; the learner hit the collision in §3 and reported, exactly, that "the
explanations seem a little bit out of order." When a figure shows two quantities side by side, the
prose above it owes the reader what each one is **and how they differ** — a definition later in the
same lesson is too late. A term that a `.ts` model names is a teaching commitment.

**13. A label in a diagram means exactly what the same identifier means in the code on that page.**
A ring-buffer figure labelled the newest element `tail` while the code computed `tail` as the next
free slot. The learner read the diagram correctly, applied it to the prose, and concluded the lesson
was wrong. It was.

**14. When two exercises in one lesson give opposite advice about the same-looking operation, the
lesson must name the distinguishing principle.**
"Clear the vacated slot" in one exercise and "do not tidy up on the way out" in another are both
right — a stale entry inside a live backing array is reachable; an evicted node becomes unreachable
whole. The page has to say that, not leave the reader to reconcile it.

**15. A slice-shrinking idiom in Go carries the nil-out, or it teaches the leak the course already
taught against.**
A `Delete` hint taught swap-with-last-then-truncate without zeroing the vacated slot — 19.2 MiB
retained versus 0.9 MiB, one lesson after the course had taught exactly that trap. Audit for
`[:len(x)-1]`.

---

## Listening

**16. Watch for the tell: they say "this sounds like X", and X is true.**
That is never confusion. It means the page asserted a conclusion and skipped the mechanism. This has
fired three times in one session.

**17. When a task is called unintelligible, read their code first.**
The question names the symptom; the code names the cause. In the case above, the reported confusion
was about two conditions being complements; the actual bug was a duration read as an instant.

**18. When the learner proposes a design, implement it and differential-test it before responding.**
Their nullable-`tail` ring buffer was correct — 2M operations, identical behaviour to the shipped
version.

**19. Identify *which* known thing they described before naming it.**
Calling a learner's rate-limiter design "the fixed-window one" was a lazy bucket for "not mine". It
was actually an anchored window — a distinct, widely deployed algorithm. They pushed back and were
right. The exercise now presents all three designs with measured numbers instead of a two-way straw
man.

**20. Repo state is not a progress report. Ask, do not infer.**
A remaining `TODO`, a still-skipped test, or a stale suite says nothing. The learner does each
exercise in one track or the other or both, chosen per exercise, and also solves linked problems
elsewhere, which leaves no trace anywhere. Run the suites to check that *your scaffolding* is sound;
that is all they are evidence of.

**21. Gate learning records and glossary promotions on demonstrated understanding.**
Not on lessons existing. Writing a lesson is not evidence the learner absorbed it.

---

## Repair

**22. Fix the lesson, not the chat.**
An answer in conversation evaporates and the page stays wrong. Rewrite the section, add the callout,
add a checkpoint question on the thing that broke.

**23. Correct visibly, and grep the whole workspace.**
A wrong claim propagates into reference sheets, glossary entries, exercise stubs and test files. A
marked CORRECTION callout is better than a silent patch — the learner may have already built on the
wrong version.

The same grep applies to a *correct* change. A repair switched a Go lesson's copy idiom from
`append([]int(nil), cur...)` to the plainer-looking `append([]int{}, cur...)`. Two lessons later, a
section explains `append([]int(nil), cur...)` "as arithmetic", cites it by name five times, and quotes
the earlier lesson's wording. The switch was reverted, and the earlier lesson now teaches the original
idiom. Before changing anything a later lesson might build on, grep the later lessons for it.

**24. Never edit the learner's in-progress code.**
Corrections go in chat, or in a doc comment only. They finished that exercise; the file is theirs.

**25. Three explanations of the same thing means change the explanation, not repeat it.**
Load-factor arithmetic and the amortised-doubling series appeared in three separate lessons. If it
still wobbles after that, the explanation is the problem.

---

## Process

**26. Verify exercise specs by solving them.** Reference solutions in, suite green, type-check
separately (Vitest transpiles without typechecking), formatter and linter clean, stubs restored —
and **time the stub run**. The learner's first run of every exercise is the stub run, and a green
suite says nothing about it, because the expensive paths are the failing ones. See rule 38.

**27. Never write a backslash or a `$` through a shell command.** Use the file-editing tools. A
heredoc eats them — `'\vdots'` arrives as a vertical tab and renders as nothing — and so does a
script whose *source* travels through a shell, even a quoted heredoc, which is how a Windows path in
a notes file became `D:` + CR + `epos` + TAB + `eachkit`.

Two things made that one worse and are worth knowing on their own: the damage is invisible in
ordinary output (CR and TAB look like whitespace), and **Python's text mode silently rewrites it**
— `read_text()` turns a lone CR into `\n`, so the repair script searching for the broken bytes
found nothing and the write-back split the line. Repair corruption in binary mode, or with
`newline=''`.

**28. An idempotent fixer is the only kind worth having.** The first TeX repair used a negative
lookahead and turned `\\dots` into `\\\dots` on its second run. Normalise to the target state
instead of patching towards it.

**29. Look at the page.** Every remaining category of defect — overlap, clipping, a figure scaled to
2.3×, a stylesheet regression — is invisible to every check except a screenshot.

**30. When a lesson quotes numbers that a figure also shows, share the module.**
Lesson 8's comparison-and-write table and the counters under its interactive figure were, at first,
two separate implementations of three sorting algorithms. Extracting the model into a plain `.ts`
file that both the component and the author use makes the prose and the screen incapable of drifting
apart — and lets you re-derive the table by running the module. Do this whenever a claim in text and
a claim in a figure are the same claim.

**31. Scope a famous bug before repeating it.**
`(lo + hi) / 2` overflowing is real, is well documented, and is *unreachable* in Go on a 64-bit
machine and in JavaScript at any size. Saying "this will crash your code" would have been received
wisdom rather than teaching. Check whether the classic failure is reachable in the languages the
course actually uses; then, if the safe form is still worth writing, give the reasons that survive
the scoping.

**32. When a property cannot be observed, say so instead of faking a test for it.**
Stability is invisible on an array of plain integers: two equal values *are* the same value, which is
exactly why Go's `slices.Sort` promises nothing about it. The fix was not a cleverer assertion, it
was a small record type carrying a field the comparator never reads — plus a comment in the spec
saying why that type exists. A test that cannot fail teaches nothing.

It can also teach something false. A Go suite compared `&xs[0]` before and after four in-place
functions, "to prove the backing array never moved". A function receives a *copy* of the caller's slice
header and cannot move the caller's slice at all, so the test could not fail. A `Reverse` that built a
new slice failed the real tests and passed that one. Worse, the test told the learner the array *could*
move. **Any test written to catch a specific mistake gets that mistake written and run against it**
(rule 40); if it passes, the test is decoration.

**33. If the lesson teaches a failure mode, the exercise should reproduce it, asserted.**
Reading "quicksort is O(n²) in the worst case" and watching your own function make exactly 499,500
comparisons on 1,000 already-sorted numbers are different experiences. Ask for the naive version
*and* pin its cost, then ask for the fix and pin that too. The failure is part of the specification.

**34. Every bug you find by eye should leave a check behind.**
An HTML entity written inside a `{…}` expression prop is escaped rather than decoded, so it reaches
the reader as literal `&rsquo;` — one instance, spotted in a screenshot. The fix took a minute; the
crawler rule that fails on any escaped entity in served HTML takes it off the list permanently. Ask,
every time: what class of thing is this, and can the page checker see it?

**35. One fact, one home.**
Anything a page states that the manifest also states will drift, and the learner finds it before you
do. A lesson header once took its title and its timings as props while `course.ts` held them too;
the index card and the header ended up disagreeing about how many exercises the lesson had. Derive
from the manifest and pass the lesson number.

**36. A short prompt is a checkpoint, not an exercise, and its time is reading time.**
Four three-minute in-page questions were advertised as a lesson's practice, with reading and
practice added into one number. It is the only complaint this format has produced about honesty
rather than clarity. State reading time and exercise time separately, count only substantial work in
the second, and be conservative in both.

**37. Fidelity protects content, not deficiencies.**
A faithful port means the prose and the code survive — it does not mean carrying a weak practice
contract forward, and it certainly does not mean writing that weakness into the new workspace's
rules as though it were a decision. Port the content, then say plainly which parts of the current
standard the ported course does not meet, and offer to remake them.

**38. A failing assertion must be cheap. Never `toEqual` a large array.**
An exercise was reported as "even though I haven't written anything, it never ends". Nothing looped:
the stubs took 4m37s to go red because two assertions compared 100,000-element arrays, and Vitest
prints one line per element and then diffs the two sides line by line — quadratic, 76 seconds per
failure, and paid only when the learner is wrong. Assert the property with an O(n) scan that names
one index, print the whole array only while it is short enough to read, and set
`test.diff.truncateThreshold` (default `0` = no cap; the CLI flag is swallowed when `test.projects`
is used) as the net for everything you did not think of. Go's `slices.IsSorted` + `slices.Equal`
helper had been doing it right in the same exercise, which is also rule 26's argument for diffing
the two tracks against each other.

---

## Exercises and their specs

**39. A method an exercise needs is taught in the lesson body. A hint may not be its only home.**
One Go course broke this four times in five days, and each time the learner's report was precise.
Digit peeling (`x % 10`, `x / 10`) appeared nowhere in the lesson except inside the exercise's own
hint: "I didn't find a place in the lesson that could give me an idea". A UTF-8 decoder's worked
solution and tests relied on the byte range `F8`–`FF`, which the lesson's table silently left out.
A recursion exercise asked for Hanoi, subsets, permutations and combinations from a section that had
taught only stack depth: "I don't know what is `Hanoi`". An allocation exercise required
`strconv.AppendInt`, which no lesson showed; with the tools the lesson *had* taught, the function
measured 38 allocations against a budget of 4.

The check before shipping: for each exercise, search the page *outside* its `<Exercise>` block for
the exercise's central operation, and for every constant, case and term that its worked solution and
its tests name. Teach the method on a *different* problem, so that the exercise is transfer rather
than copying, and give each exercise a one-line "Where the method is" that names the sections. When a
rule like this is written, audit the lessons written before it. The recursion exercise predated this
rule by five days and broke it on every function.

**40. A sentence about what code does is a claim about a program: run it.**
"X looks equivalent and is not." "Y would pass this test and fail that one." "Missing the pop gives
the right count." Each describes code, so each is settled by running that code. A worked solution
said that comparing with `xs[read-1]` in an in-place de-duplication "looks equivalent and is not".
That version passes the whole suite and agreed with the reference on 1,006,188 sorted inputs. The trap
is real only one step further on, in "keep at most two copies". The same lesson said
`bytes.Clone(buf)[:n]` passes a retention test and merely wastes memory. It fails both tests, because
the 16-byte result keeps the whole 64 MiB clone alive.

Rule 3 already says to produce a failure before describing it. This is rule 3 for worked solutions,
hints, test comments and test failure messages, where it was not being applied. The tool is a
mutation: swap one line of the reference solution, run the real suite, and read what it says.

**41. Run the stub's suite and read which tests pass.**
Every test that passes on an untouched stub is either deliberate, and then the page says so ("this
one needs no change; work out why"), or a defect. Doing this once found two. A `Coalesce` test passed
because it built its pointers with the stub's `Of`, which returned nil. A test must never lean on
another function the learner has not written yet. And a `FirstLines` stub shipped *fully implemented*
under a `// TODO` while the page asked the learner to write it. The stub run is also where "six tests
fail" and "watch three go green" come from. Count them, do not estimate: one page said six where it
was three.

**42. The page, the stub and the tests are three copies of one specification. Make them agree by
checking, not by care.**

- **A stub's doc-comment examples are copied from the test table, never typed.** A recursion stub
  said `Subsets([]int{1, 2})` is `[[] [1] [2] [1 2]]`; the tests and the page wanted
  `[[] [2] [1] [1 2]]`. A learner obeying the file they were editing would have failed a test for it.
- **A test the page names exists, and a `-run` pattern it prints matches something.**
  A Go course wrote a course-local check for both against the lesson's test files (see
  PLATFORM.md, "Course-local checks"). Its first runs found five test names that had never existed,
  across two lessons. They also found `-run 'TestBinarySearch$'`, which matched no test (the tests were
  `TestBinarySearchExhaustive` and two siblings), so `go test` printed `[no tests to run]` and exited
  0. That example sat in the very paragraph warning about that trap.
- **Every step that promises output is run and read.** "Re-run with `-v`: it prints the board after
  each move": the test logged nothing. "Two of the 'escapes to heap' lines should be gone": the stub
  printed none to begin with.
- **Invariants state what the tests check, over the ranges they check.** "Checked for every size up
  to 10" was 8 for one of the four functions; "compared on 20,000 generated inputs" was true of one
  function in five.
