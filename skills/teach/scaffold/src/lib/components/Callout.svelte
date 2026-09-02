<script lang="ts">
  import type { Snippet } from 'svelte';

  /** note (blue) · tip (green) · warn (yellow) · deep (purple, "going deeper") */
  let {
    kind = 'note',
    title,
    children
  }: {
    kind?: 'note' | 'tip' | 'warn' | 'deep';
    title: string;
    children: Snippet;
  } = $props();
</script>

<div class="callout {kind}">
  <span class="co-title">{title}</span>
  {@render children()}
</div>
