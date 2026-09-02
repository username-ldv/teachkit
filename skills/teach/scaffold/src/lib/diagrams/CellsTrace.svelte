<script lang="ts" module>
  import type { Cell } from './CellRow.svelte';
  import type { Tone } from './geom';

  export type TraceMark = { at: number; label: string; tone?: Tone };

  export type Frame = {
    /** Left gutter caption for this step, e.g. `read=3: 7  keep`. */
    label?: string;
    cells: Cell[];
    /** Pointer captions sitting above this row. */
    marks?: TraceMark[];
    /** Right-hand caption, e.g. `write=2`. */
    note?: string;
    noteTone?: Tone;
  };
</script>

<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { CELL_W, CELL_H } from './CellRow.svelte';
  import { monoWidth, toneText } from './geom';

  /**
   * A whole algorithm trace: one row of boxes per step, each with the state of
   * the pointers at that moment. This is the shape behind every "watch the
   * array change" figure — shifting for an insert, the two-pointer reverse,
   * the write-pointer filter.
   *
   * Showing every step at once (rather than animating) is deliberate: the
   * reader can compare step 4 with step 1 without replaying anything.
   */
  let {
    frames,
    w = CELL_W,
    h = CELL_H,
    gap = 0,
    gutter = 0,
    /** Vertical room above each row for its pointer captions. */
    markSpace = 16,
    title = '',
    caption = '',
    minWidth = '',
    plain = false
  }: {
    frames: Frame[];
    w?: number;
    h?: number;
    gap?: number;
    gutter?: number;
    markSpace?: number;
    title?: string;
    caption?: string;
    minWidth?: string;
    plain?: boolean;
  } = $props();

  const PAD = 8;
  const GAP_Y = 10;

  const anyMarks = $derived(frames.some((f) => f.marks?.length));
  const rowH = $derived(h + GAP_Y + (anyMarks ? markSpace : 0));

  const rowY = (i: number) => PAD + (anyMarks ? markSpace : 0) + i * rowH;
  const height = $derived(PAD * 2 + frames.length * rowH - GAP_Y + (anyMarks ? markSpace : 0));

  const cols = $derived(Math.max(...frames.map((f) => f.cells.length)));
  const cx = (i: number) => PAD + gutter + i * (w + gap) + w / 2;
  const gridRight = $derived(PAD + gutter + cols * (w + gap) - gap);

  const noteX = $derived(gridRight + 18);
  const width = $derived(
    Math.max(...frames.map((f) => (f.note ? noteX + monoWidth(f.note, 12) : 0)), gridRight) + PAD
  );
</script>

<Figure {title} {caption} {minWidth} {plain}>
  <svg
    class="dg"
    viewBox="0 0 {width} {height}"
    {width}
    {height}
    role="img"
    aria-label={title || caption}
  >
    {#each frames as frame, r (r)}
      {@const y = rowY(r)}
      <CellRow cells={frame.cells} x={PAD} {y} {w} {h} {gap} {gutter} label={frame.label ?? ''} />

      {#each frame.marks ?? [] as mark, m (m)}
        <text
          class="label strong {toneText(mark.tone ?? 'accent')}"
          x={cx(mark.at)}
          y={y - 5}
          text-anchor="middle">{mark.label}</text
        >
      {/each}

      {#if frame.note}
        <text class="label strong {toneText(frame.noteTone)}" x={noteX} y={y + h / 2 + 4}>
          {frame.note}
        </text>
      {/if}
    {/each}
  </svg>
</Figure>
