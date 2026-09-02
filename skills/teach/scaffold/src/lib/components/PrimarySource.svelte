<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title = '★ Primary source', children }: { title?: string; children: Snippet } = $props();
</script>

<aside class="primary-source">
  <span class="co-title">{title}</span>
  {@render children()}
</aside>
