<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    n,
    title,
    tags = '',
    practical = false,
    children
  }: {
    n: number | string;
    title: string;
    tags?: string;
    /** The green label: the real-world web/backend build. */
    practical?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="exercise">
  <span class="ex-label" class:practical>Exercise {n}</span>
  <h3>{title}</h3>
  {#if tags}<p class="ex-tags">{tags}</p>{/if}
  {@render children()}
</div>
