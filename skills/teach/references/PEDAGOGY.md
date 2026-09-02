# Pedagogy

Why the format is the way it is. Read this when the next lesson is not obvious, when designing
quizzes, or when tempted to shorten something.

---

## Knowledge, skills, wisdom

Deep learning needs three things, and they come from different places:

- **Knowledge** — captured from high-trust sources. Never from parametric memory.
- **Skills** — acquired through practice with a tight feedback loop.
- **Wisdom** — from real use outside the learning environment, and from other practitioners.

Before `RESOURCES.md` is well populated, finding good sources *is* the work. Some topics are more
knowledge-shaped (theory), some more skill-shaped (anything physical). Most programming topics need
both, and this learner's courses are deliberately theory-heavy: the mental model first, the practice
in service of it.

For **wisdom**, the honest posture is to answer as far as you can and then name a community — a
forum, a subreddit, a local group — where the answer gets tested against reality. Find high-signal
ones and record them in `RESOURCES.md`. If the user says they do not want communities, respect it
and note it there so future sessions stop proposing them.

---

## Fluency versus storage

Two different things get called "learning":

- **Fluency strength** — can retrieve it right now, with the page open.
- **Storage strength** — can retrieve it in six weeks, cold.

Fluency is an illusion of mastery, and rereading manufactures it. Storage strength is the goal, and
it is built by **desirable difficulty**:

- **Retrieval practice.** Recall from memory, not recognition. This is why quizzes appear mid-lesson
  and why the explanation is hidden until the answer is right — an explanation shown early turns
  recall back into reading.
- **Spacing.** The `<Recall>` block at the top of every lesson from 2 onward: three questions drawn
  from *earlier* lessons only, never this one. The end-of-section quizzes cover current material;
  `<Recall>` fights the forgetting curve on everything before it.
- **Interleaving.** Mixing related-but-different problems in *practice*. Applies to exercises, not
  to explanation — explanation should be one thing at a time.

**Difficulty is the enemy of knowledge acquisition and the tool of skill acquisition.** While
explaining, remove every avoidable obstacle: shorter sentences, one idea at a time, the arithmetic
written out. While practising, add them back.

---

## The zone of proximal development

Every lesson should feel like *just enough* challenge. Compute the zone from:

1. **`learning-records/`** — what has been demonstrated. Not what has been covered. Coverage is not
   learning; a lesson existing is not evidence of anything.
2. **`MISSION.md`** — what the goal actually needs next.
3. **The roadmap in `src/lib/course.ts`** and the promises in `NOTES.md`.

**Ask rather than infer.** Repo state is not a progress report: a remaining `TODO`, a still-skipped
test, or a failing older suite says nothing about what the learner has practised — they may have
done the exercise in the other track, or solved the linked problem elsewhere entirely. Inferring a
"Go is ahead, TypeScript lags" picture from test output was wrong once and cost a session's
planning.

**Retrieval debt.** When a concept has been explained three times and still wobbles, that is a
signal to *change the explanation*, not to repeat it. Note the debt in `NOTES.md` and quiz it once
more, differently, later.

---

## Strict sequencing

Never use, quiz, or rely on anything that has not been taught earlier in *this* course. The assumed
baseline lives in `MISSION.md` and nothing beyond it may be assumed.

This holds for **example code too**. If a snippet would need a not-yet-taught concept to be strictly
correct, either restructure it so it does not, or reduce that concept to a single clearly-flagged
black box with a one-line "we'll get to this in lesson N". Never sprinkle it through the code as if
the learner should already know it — a stray `sync.Mutex` in a Go lesson was caught by the learner
and was right to be.

The same rule governs vocabulary. Before shipping, grep the new pages for terms of art and check
each is either defined on the page or already promoted in `GLOSSARY.md`. "Heap" once appeared in
lesson 4 having never been introduced — the memory model got taught by using its words.

---

## Quiz design

- **3–4 checkpoints per lesson**, placed after the section they test, not all at the end.
- **Options equal length.** Equal word count, and equal character count if it can be managed. A
  longer option is a tell, and a tell turns retrieval into pattern-matching.
- **No formatting clues.** Same typography in every option.
- **Retry until correct.** Wrong answers are struck through and stay visible; the effort is the
  point.
- **Explanation only on success.** `<Question>` enforces this.
- **Test the mechanism, not the sentence.** A question whose answer can be found by scanning the
  page for a matching phrase teaches nothing. Ask what would happen, what breaks, which of two
  designs has the property.
- After a repair (Mode C), **add a checkpoint on the thing that broke.** If a claim was misread once
  it will be misread again.

---

## Reference documents

Lessons are read once. Reference sheets are read for years. They are the compressed essence — the
price list, the decision flow, the syntax table, the red flags in review — and they must print well.

Create them as the course earns them, and **extend rather than duplicate**: one structure-picker
sheet that grows is worth more than five per-topic sheets. Link them from the lesson header
(`course.headerLinks`).

The **glossary** is the most important one. Add a term only once the learner has used it correctly —
it is a record of compressed understanding, not a dictionary to learn from. Once a term is in, every
lesson uses it and none redefines it. Flag ambiguity explicitly when the wider field is loose about a
word, and especially when one word names two things in the same course ("heap" is both a memory
region and a priority queue — both places must say which).

---

## What earns a learning record

Write one when the *learner* did something, not when you did:

1. They demonstrated genuine understanding of something non-trivial — this raises the floor.
2. They disclosed prior knowledge — record the depth claimed.
3. **A misconception was corrected** — the highest-value kind. These predict future stumbles on
   related material.
4. The mission shifted.

Not for: material merely covered, a lesson merely written, or a session log. Gate promotion on
demonstrated understanding, not on artefacts existing. Format in
[WORKSPACE-FILES.md](WORKSPACE-FILES.md).
