<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Several small figures side by side, as one figure: step 1, step 2, step 3.
   *
   * Pass `plain` diagrams as children so they do not each draw their own card,
   * and give each one a `title` — that becomes its column heading. On a narrow
   * window the columns stack, which is why the steps read left-to-right rather
   * than being positioned absolutely.
   */
  let {
    title = '',
    caption = '',
    /** Minimum column width before the row wraps. */
    min = '11rem',
    children
  }: { title?: string; caption?: string; min?: string; children: Snippet } = $props();
</script>

<figure class="figure sequence">
  {#if title}<span class="figure-title">{title}</span>{/if}
  <div class="row" style="--col-min:{min}">
    {@render children()}
  </div>
  {#if caption}<figcaption class="figure-caption">{@html caption}</figcaption>{/if}
</figure>

<style>
  .sequence {
    margin-inline: 0;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--col-min), 1fr));
    gap: 1rem 1.25rem;
    /* Titles are the anchor, so tops line up even when one step is taller. */
    align-items: start;
  }

  /* Children are `plain` figures: strip their spacing so the grid controls it. */
  .row :global(.figure) {
    margin: 0;
    min-width: 0;
  }

  .row :global(.figure-title) {
    margin-bottom: 0.5rem;
  }
</style>
