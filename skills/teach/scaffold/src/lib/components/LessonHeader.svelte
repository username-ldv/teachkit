<script lang="ts">
  import { course, lessons, lessonByNumber, lessonHref, neighbours } from '$lib/course';

  /**
   * Breadcrumbs, kicker, title and the meta pills.
   *
   * Everything is read from $lib/course.ts by lesson number, so a page passes
   * only `n`. That is deliberate: when the title and the timings could also be
   * passed as props, the manifest and the page drifted apart silently — a
   * course once advertised one exercise count on its index card and a
   * different one in its own header.
   */
  let { n }: { n: number } = $props();

  const prev = $derived(neighbours(n).prev);
  const lesson = $derived(lessonByNumber(n));
</script>

<header class="lesson-header">
  <nav class="crumbs">
    <a href="/">← Course home</a>
    {#if prev}
      <span>·</span>
      <a href={lessonHref(prev.slug)}>Lesson {prev.n}</a>
    {/if}
    {#each course.headerLinks as link (link.href)}
      <span>·</span>
      <a href={link.href}>{link.label}</a>
    {/each}
  </nav>
  <p class="kicker">Lesson {n} of {lessons.length} · {course.short}</p>
  <h1>{lesson?.title ?? `Lesson ${n}`}</h1>
  <div class="lesson-meta">
    {#if lesson}
      <span class="pill time">⏱ {lesson.minutes} read</span>
      <span class="pill">
        🏋 {lesson.exercises}{lesson.exerciseTime ? ` · ${lesson.exerciseTime}` : ''}
      </span>
    {/if}
    {#each course.tracks as track (track.label)}
      <span class="pill lang">{track.label}</span>
    {/each}
    {#if lesson?.builds}<span class="pill">Builds on: {lesson.builds}</span>{/if}
  </div>
</header>
