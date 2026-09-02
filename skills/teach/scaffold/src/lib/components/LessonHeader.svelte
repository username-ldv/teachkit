<script lang="ts">
  import { course, lessons, lessonHref, neighbours } from '$lib/course';

  /**
   * Breadcrumbs, kicker, title and the meta pills. Everything except the
   * hand-written pills is derived from $lib/course.ts, so renumbering a
   * lesson only means editing the manifest.
   */
  let {
    n,
    title,
    minutes,
    exercises,
    exerciseHours = '',
    builds = ''
  }: {
    n: number;
    title: string;
    minutes: string;
    exercises: string;
    exerciseHours?: string;
    builds?: string;
  } = $props();

  const prev = $derived(neighbours(n).prev);
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
  <h1>{title}</h1>
  <div class="lesson-meta">
    <span class="pill time">⏱ {minutes}</span>
    <span class="pill">🏋 {exercises}{exerciseHours ? ` (${exerciseHours})` : ''}</span>
    {#each course.tracks as track (track.label)}
      <span class="pill lang">{track.label}</span>
    {/each}
    {#if builds}<span class="pill">Builds on: {builds}</span>{/if}
  </div>
</header>
