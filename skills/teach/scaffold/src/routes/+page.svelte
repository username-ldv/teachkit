<script lang="ts">
  import { course, lessons, references, roadmap, lessonHref, referenceHref } from '$lib/course';
  import { AskTeacher, Callout, Playground } from '$lib/components';
</script>

<svelte:head><title>{course.title} — Course Index</title></svelte:head>

<div class="hero">
  <p class="kicker">{course.kicker}</p>
  <h1>{course.title}</h1>
  <p class="sub">{course.tagline}</p>
</div>

<Callout kind="note" title="How to use this course">
  <p>
    Read in order — each lesson builds strictly on the ones before it. Do the quizzes without
    scrolling back (retrieval beats rereading), and do the exercises at a real keyboard.
    {#if course.tracks.length > 1}
      Every code sample has a <strong>{course.tracks.map((t) => t.label).join(' / ')} toggle</strong>
      that remembers your choice across all pages.
    {/if}
    Diagrams are live where movement is the point: drag, step and toggle them. When you finish a
    batch of lessons, ask your teacher to generate the next one — and ask questions any time
    something is less than fully clear.
  </p>
</Callout>

<!-- Where the exercises live. Fill this in once the practice environment is
     decided (own repo + test suite, in-page tasks, a practice log …) and
     delete it if the course has no standing practice environment. -->
<Playground title="▶ Where the exercises live">
  <p>Describe the practice environment here: which repo, which folder, which command.</p>
</Playground>

<h2>Lessons</h2>

{#each lessons as lesson (lesson.slug)}
  <a class="lesson-card" href={lessonHref(lesson.slug)}>
    <span class="num">LESSON {String(lesson.n).padStart(2, '0')}</span>
    <h3>{lesson.title}</h3>
    <p>{lesson.blurb}</p>
    <span class="pill time">⏱ {lesson.minutes}</span>
    <span class="pill">{lesson.exercises}</span>
  </a>
{/each}

{#if roadmap.length}
  <h2>Roadmap — ask your teacher to generate the next batch</h2>

  <ul class="roadmap">
    {#each roadmap as item (item.n)}
      <li><span class="num">{item.n}</span>{item.text}</li>
    {/each}
  </ul>
{/if}

{#if references.length}
  <h2>Reference sheets</h2>

  {#each references as ref (ref.slug)}
    <a class="lesson-card" href={referenceHref(ref.slug)}>
      <span class="num">REFERENCE</span>
      <h3>{ref.title}</h3>
      <p>{ref.blurb}</p>
    </a>
  {/each}
{/if}

<AskTeacher title="💬 Your teacher is one message away">
  <p>
    This course is taught by an agent in your teaching workspace. Ask for the next lessons, a
    re-explanation from a different angle, extra exercises on a weak spot, or a review quiz over past
    lessons — the more you ask, the better the course adapts to you.
  </p>
</AskTeacher>
