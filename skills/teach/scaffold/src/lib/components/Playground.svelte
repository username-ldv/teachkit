<script lang="ts">
  import type { Snippet } from 'svelte';

  /** The "where this exercise lives in your repos" box. */
  let { title = '▶ Where the exercises live', children }: { title?: string; children: Snippet } =
    $props();
</script>

<div class="playground">
  <span class="pg-title">{title}</span>
  {@render children()}
</div>
