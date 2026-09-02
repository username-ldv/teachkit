<script lang="ts">
  import '../app.css';
  import 'katex/dist/katex.min.css';
  import ArrowDefs from '$lib/diagrams/ArrowDefs.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <meta name="color-scheme" content="dark" />
</svelte:head>

<!-- Arrowhead markers are defined once and referenced by every diagram. -->
<ArrowDefs />

<main>
  {@render children()}
</main>
