<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The frame every diagram sits in: an optional small-caps title, the drawing,
   * an optional live status line, an optional controls strip (hidden when
   * printing), and a caption.
   *
   * `minWidth` gives the drawing a floor below which the figure scrolls
   * sideways instead of squashing — labels stay readable on a narrow window.
   *
   * The `status` snippet exists because the per-step sentence used to be glued
   * to the front of the caption inside one paragraph. Stepping through a trace
   * changed its length, which reflowed the static caption under it, and a
   * reader could not tell where the changing half ended and the fixed half
   * began. It now has its own labelled row, with a reserved height, so the
   * caption below holds still while you press the arrows.
   */
  let {
    title = '',
    caption = '',
    minWidth = '',
    plain = false,
    statusLabel = 'this step',
    pinControls = false,
    children,
    controls,
    status
  }: {
    title?: string;
    caption?: string;
    minWidth?: string;
    /** Drop the card border — for diagrams that already read as a unit. */
    plain?: boolean;
    /** The small fixed label on the status row. Says what the live text is *about*. */
    statusLabel?: string;
    /**
     * Put the status and controls ABOVE the drawing.
     *
     * For figures whose drawing CHANGES SIZE as the reader steps — a tree that
     * grows, a heap that gains a row, a call tree that widens. With the
     * controls underneath, every press moves the button out from under the
     * cursor: BSTLab's drawing goes from 70px tall to 556px over one run, so
     * the "insert" button walked half a screen down the page while being
     * clicked. Pinning them above means the only thing that moves is the
     * drawing itself, which is the thing you are watching.
     *
     * Leave it off for fixed-size drawings. The default order reads better and
     * is what every non-growing figure in the library uses.
     */
    pinControls?: boolean;
    children: Snippet;
    controls?: Snippet;
    /** The one sentence that changes as the reader steps. Never the caption. */
    status?: Snippet;
  } = $props();
</script>

{#snippet statusRow()}
  {#if status}
    <p class="figure-status" class:pinned={pinControls} aria-live="polite">
      <span class="figure-status-label">{statusLabel}</span>
      <span class="figure-status-text">{@render status()}</span>
    </p>
  {/if}
{/snippet}

{#snippet controlsRow()}
  {#if controls}
    <div class="figure-controls" class:pinned={pinControls}>{@render controls()}</div>
  {/if}
{/snippet}

<figure class="figure" class:plain>
  {#if title}<span class="figure-title">{title}</span>{/if}

  {#if pinControls}
    {@render statusRow()}
    {@render controlsRow()}
  {/if}

  <div class={minWidth ? 'figure-scroll' : ''} style={minWidth ? `--fig-min:${minWidth}` : ''}>
    {@render children()}
  </div>

  {#if !pinControls}
    {@render statusRow()}
    {@render controlsRow()}
  {/if}

  {#if caption}
    <figcaption class="figure-caption">{@html caption}</figcaption>
  {/if}
</figure>

<style>
  figure {
    /* Reset the UA margin; spacing comes from .figure in diagram.css. */
    margin-inline: 0;
  }
</style>
