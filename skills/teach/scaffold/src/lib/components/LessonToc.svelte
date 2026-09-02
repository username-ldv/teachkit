<script lang="ts">
  /**
   * "In this lesson".
   *
   * Items are the raw inner HTML of each list entry, not just a label, because
   * some entries carry more than one link ("The call stack · and the heap").
   * Wrapping a plain label in an <a> here would nest anchors in those cases.
   */
  let { items }: { items: string[] } = $props();
</script>

<nav class="lesson-toc" aria-label="In this lesson">
  <strong>In this lesson</strong>
  <ol>
    {#each items as item, i (i)}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- authored, not user input -->
      <li>{@html item}</li>
    {/each}
  </ol>
</nav>
