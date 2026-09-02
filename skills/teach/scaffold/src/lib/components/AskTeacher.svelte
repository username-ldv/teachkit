<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title = '💬 Ask your teacher',
    children
  }: { title?: string; children?: Snippet } = $props();
</script>

<aside class="ask-teacher">
  <span class="co-title">{title}</span>
  {#if children}
    {@render children()}
  {:else}
    <p>
      Anything on this page that is less than completely clear is a question worth asking. Ask for a
      re-explanation from a different angle, a worked example with different numbers, extra practice
      on the bit that wobbled, or a review quiz over the earlier lessons.
    </p>
  {/if}
</aside>
