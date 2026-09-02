<script lang="ts" module>
  import type { Tone } from './geom';

  export type Cell = {
    /** What sits in the box. Empty string draws an empty-but-real box. */
    v?: string | number;
    tone?: Tone;
    /** Dashed outline, nothing inside — an unused slot. */
    empty?: boolean;
    /** Faded, for "this used to be here". */
    ghost?: boolean;
    /** Label printed above this box (usually the index). */
    top?: string;
    /** Label printed below this box (usually the address). */
    bottom?: string;
    /** Second, smaller line inside the box. */
    sub?: string;
  };

  export const CELL_W = 54;
  export const CELL_H = 38;
</script>

<script lang="ts">
  import { toneClass } from './geom';

  /**
   * One row of boxed values — the shape behind arrays, slices, buckets, ring
   * buffers and the memory street. Draws into an existing <svg> at (x, y), so
   * bigger diagrams can compose several rows.
   *
   * (x, y) is the top-left of the *boxes*; the top label row, if any, is drawn
   * above y.
   */
  let {
    cells,
    x = 0,
    y = 0,
    w = CELL_W,
    h = CELL_H,
    gap = 0,
    /** Right-aligned caption in the gutter, level with the boxes. */
    label = '',
    /** Gutter captions for the per-cell label rows. */
    topLabel = '',
    bottomLabel = '',
    gutter = 0,
    mono = true
  }: {
    cells: Cell[];
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    gap?: number;
    label?: string;
    topLabel?: string;
    bottomLabel?: string;
    gutter?: number;
    mono?: boolean;
  } = $props();

  const cx = (i: number) => x + gutter + i * (w + gap) + w / 2;
  const bx = (i: number) => x + gutter + i * (w + gap);

  const hasTop = $derived(cells.some((c) => c.top !== undefined));
  const hasBottom = $derived(cells.some((c) => c.bottom !== undefined));
</script>

{#if label}
  <text class="label strong" x={x + gutter - 10} y={y + h / 2 + 4} text-anchor="end">{label}</text>
{/if}
{#if topLabel}
  <text class="label" x={x + gutter - 10} y={y - 9} text-anchor="end">{topLabel}</text>
{/if}
{#if bottomLabel}
  <text class="label" x={x + gutter - 10} y={y + h + 17} text-anchor="end">{bottomLabel}</text>
{/if}

{#each cells as cell, i (i)}
  {#if hasTop && cell.top !== undefined}
    <text class="label" x={cx(i)} y={y - 9} text-anchor="middle">{cell.top}</text>
  {/if}

  <rect
    class={toneClass(cell.empty ? 'box empty' : 'box', cell.tone) + (cell.ghost ? ' ghost' : '')}
    x={bx(i)}
    y={y}
    width={w}
    height={h}
    rx="4"
  />

  {#if cell.v !== undefined && cell.v !== ''}
    <text
      class="val {mono ? '' : 'sans'}"
      x={cx(i)}
      y={y + h / 2 + (cell.sub ? -1 : 5)}
      text-anchor="middle">{cell.v}</text
    >
  {/if}
  {#if cell.sub}
    <text class="label" x={cx(i)} y={y + h / 2 + 13} text-anchor="middle">{cell.sub}</text>
  {/if}

  {#if hasBottom && cell.bottom !== undefined}
    <text class="label" x={cx(i)} y={y + h + 17} text-anchor="middle">{cell.bottom}</text>
  {/if}
{/each}
