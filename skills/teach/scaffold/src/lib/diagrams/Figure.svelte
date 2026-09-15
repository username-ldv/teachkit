<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The frame every diagram sits in: an optional small-caps title, the drawing,
   * an optional controls strip, and a caption.
   *
   * `minWidth` gives the drawing a floor below which the figure scrolls
   * sideways instead of squashing — labels stay readable on a narrow window.
   */
  let {
    title = '',
    caption = '',
    minWidth = '',
    plain = false,
    children,
    controls,
    captionSnippet
  }: {
    title?: string;
    caption?: string;
    minWidth?: string;
    /** Drop the card border — for diagrams that already read as a unit. */
    plain?: boolean;
    children: Snippet;
    controls?: Snippet;
    captionSnippet?: Snippet;
  } = $props();
</script>

<figure class="figure" class:plain>
  {#if title}<span class="figure-title">{title}</span>{/if}
  <div class={minWidth ? 'figure-scroll' : ''} style={minWidth ? `--fig-min:${minWidth}` : ''}>
    {@render children()}
  </div>
  {#if controls}
    <div class="figure-controls">{@render controls()}</div>
  {/if}
  {#if captionSnippet}
    <figcaption class="figure-caption">{@render captionSnippet()}</figcaption>
  {:else if caption}
    <figcaption class="figure-caption">{@html caption}</figcaption>
  {/if}
</figure>

<style>
  figure {
    /* Reset the UA margin; spacing comes from .figure in diagram.css. */
    margin-inline: 0;
  }
</style>
