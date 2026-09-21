# Lesson skeleton

Copy into `src/routes/lessons/NNNN-slug/+page.svelte`, after adding the lesson to
`src/lib/course.ts`. Delete what the lesson does not use; keep the order.

Two things to remember while filling it in, both of which will bite:

- **`{` in prose or in a plain HTML attribute** is a Svelte expression. Write `&#123;` / `&#125;` in
  text, and `attr={'…{…}…'}` in attributes. Inside a `<CodeBlock>` body braces are fine — that text
  never reaches the Svelte parser.
- **Backslashes in TeX props** are JS string escapes: `'\\alpha'`, never `'\alpha'`.
  `npm run fix:tex` repairs a file that forgot, and is idempotent.

```svelte
<script lang="ts">
  import {
    AskTeacher, Callout, CodeBlock, CodeTabs, Exercise, LessonHeader, LessonToc,
    MoreProblems, Playground, PrevNext, PrimarySource, Question, Quiz, Recall, Solution
  } from '$lib/components';
  import { Cells, Derivation, Pipeline, Sequence, TraceTable } from '$lib/diagrams';
</script>

<svelte:head><title>Lesson N · Title — Course Name</title></svelte:head>

<LessonHeader
  n={N}
  title="Title"
  minutes="~30 min read"
  exercises="4 exercises"
  exerciseHours="~2 h"
  builds="Lessons 1–N-1"
/>

<!-- Lesson 2 onward. Three questions from EARLIER lessons only. -->
<Recall>
  <Question
    q="…?"
    options={['…', '…', '…']}
    answer={1}
  >
    {#snippet explain()}<p>Why, and which lesson it came from.</p>{/snippet}
  </Question>
</Recall>

<LessonToc
  items={[
    '<a href="#wall">1. The problem we keep hitting</a>',
    '<a href="#idea">2. The idea</a>',
    '<a href="#exercises">Exercises</a>'
  ]}
/>

<h2 id="wall">1. The problem we keep hitting</h2>

<p>Open with the wall the learner is already standing at, not with a definition.</p>

<h2 id="idea">2. The idea</h2>

<p>One sentence, then the mechanism — slowly.</p>

<Cells
  title="What it looks like in memory"
  cells={[{ v: '17', top: '0' }, { v: '4', top: '1' }, { v: '9', top: '2' }]}
  caption="What to look at, and what it means."
/>

<CodeTabs>
<CodeBlock lang="go">
func Example(xs []int) int {
    return len(xs)
}
</CodeBlock>
<CodeBlock lang="ts">
function example(xs: number[]): number {
  return xs.length;
}
</CodeBlock>
</CodeTabs>

<Derivation
  steps={[
    { lhs: 'T(n)', rel: '=', rhs: '2T(n/2) + n', why: 'split, recurse twice, merge in one pass' },
    { lhs: '', rel: '=', rhs: 'n \\log_2 n', why: 'log n levels, n work per level' }
  ]}
/>

<Callout kind="warn" title="The trap">
  <p>Name the misconception explicitly, then say why it is wrong.</p>
</Callout>

<!-- `answer` is an identity, not a position: <Question> reshuffles its options
     on every page load, so write the index the true statement happens to be at.
     Never say "the third option" in an explain snippet — name what it says. -->
<Quiz>
  <Question
    q="…?"
    options={['equal length', 'equal length', 'equal length']}
    answer={0}
  >
    {#snippet explain()}<p>Shown only once they get it right.</p>{/snippet}
  </Question>
</Quiz>

<h2 id="exercises">Exercises</h2>

<Playground>
  <p>Where these live, and the command that runs them.</p>
</Playground>

<Exercise n={1} title="Build the thing" tags="the core structure · ~30 min">
  <p>What to build, and the <strong>invariant</strong> it must hold: after X runs, the structure
  holds exactly Y.</p>
  <ol class="steps">
    <li>Step, with the expected observable outcome stated.</li>
  </ol>
  <p class="checkpoint">How you know it worked.</p>
  <Solution summary="Hint — if you are stuck on step 2" kind="hint">
    <p>…</p>
  </Solution>
  <Solution summary="Worked solution">
    <p>…</p>
  </Solution>
  <MoreProblems>
    : <a href="…">Problem name</a> (Easy) — what it adds.
    <a href="…">Second problem</a> (Medium) — what it adds.
  </MoreProblems>
</Exercise>

<Exercise n={4} title="The practical one" tags="real-world build" practical>
  <p>The thing they could ship.</p>
</Exercise>

<PrimarySource>
  <p><a href="…">The one source</a> — which part to read, and why that part.</p>
</PrimarySource>

<h2 id="further">Further reading</h2>

<ul>
  <li><a href="…">Source</a> — when to reach for it.</li>
</ul>

<AskTeacher title="💬 Stuck? Curious? Ask your teacher">
  <p>Lesson-specific prompts. Name the section most likely to have wobbled.</p>
</AskTeacher>

<h2 id="next">What&rsquo;s next</h2>

<p>One paragraph: the next lesson and what it unlocks. Every promise made here goes in NOTES.md.</p>

<PrevNext n={N} />
```
