<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title = 'Checkpoint',
    children
  }: { title?: string; children: Snippet } = $props();
</script>

<div class="quiz">
  <p class="quiz-title">{title}</p>
  {@render children()}
</div>
