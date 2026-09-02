<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The dashed-rule footer inside an exercise card: two LeetCode problems that
   * extend it. Deliberately outside the solution <details> so it is visible
   * without spoiling anything.
   */
  let { children }: { children: Snippet } = $props();
</script>

<p class="ex-more"><b>Optional</b>{@render children()}</p>
