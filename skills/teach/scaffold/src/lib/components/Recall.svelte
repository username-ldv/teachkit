<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The spaced-retrieval opener. Every lesson from 2 on starts with one:
   * three <Question>s drawn from EARLIER lessons only, never this one.
   *
   * This is the spacing half of the course's retrieval practice — the
   * end-of-section <Quiz> blocks cover the current material, this one fights
   * the forgetting curve on everything before it. Same widget, different job,
   * so it gets its own colour and title.
   */
  let {
    title = '↻ Before we start — from earlier lessons',
    children
  }: { title?: string; children: Snippet } = $props();
</script>

<div class="quiz recall">
  <p class="quiz-title">{title}</p>
  {@render children()}
</div>
