# Standing rules

Each of these was paid for. The incident is included because the rule without the incident degrades
into a slogan, and a slogan does not survive a session where you are in a hurry.

Read this before writing a batch, and again when a lesson fails.

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

**24. Never edit the learner's in-progress code.**
Corrections go in chat, or in a doc comment only. They finished that exercise; the file is theirs.

**25. Three explanations of the same thing means change the explanation, not repeat it.**
Load-factor arithmetic and the amortised-doubling series appeared in three separate lessons. If it
still wobbles after that, the explanation is the problem.

---

## Process

**26. Verify exercise specs by solving them.** Reference solutions in, suite green, type-check
separately (Vitest transpiles without typechecking), formatter and linter clean, stubs restored.

**27. Never author files containing backslashes or `$` through a shell heredoc.** The shell eats
them, and `'\vdots'` becomes a vertical tab that renders as nothing.

**28. An idempotent fixer is the only kind worth having.** The first TeX repair used a negative
lookahead and turned `\\dots` into `\\\dots` on its second run. Normalise to the target state
instead of patching towards it.

**29. Look at the page.** Every remaining category of defect — overlap, clipping, a figure scaled to
2.3×, a stylesheet regression — is invisible to every check except a screenshot.
