<script lang="ts">
  import { neighbours, lessonHref } from '$lib/course';

  let { n }: { n: number } = $props();
  const { prev, next } = $derived(neighbours(n));
</script>

<nav class="next-prev">
  {#if prev}
    <a href={lessonHref(prev.slug)}>← Lesson {prev.n}: {prev.title}</a>
  {:else}
    <a href="/">← Course home</a>
  {/if}
  <span class="spacer"></span>
  {#if next}
    <a href={lessonHref(next.slug)}>Lesson {next.n}: {next.title} →</a>
  {:else}
    <span class="disabled">Next lesson: ask your teacher →</span>
  {/if}
</nav>
