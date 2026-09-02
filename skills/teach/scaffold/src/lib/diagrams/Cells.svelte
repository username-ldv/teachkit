<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { CELL_W, CELL_H, type Cell } from './CellRow.svelte';
  import { arrowHead, elbow, monoWidth, toneText, type Tone } from './geom';

  /**
   * A labelled row of boxes with pointers underneath — arrays, slices, buckets,
   * the memory street, a ring buffer's backing store.
   *
   * `marks` are the callouts: an arrow pointing at one cell (or a bracket over
   * a span of cells) with a caption. Marks on the same `lane` share a line;
   * give overlapping marks different lanes to stack them.
   */
  type Mark = {
    /** Index of the cell to point at, or [first, last] to bracket a span. */
    at: number | [number, number];
    label: string;
    tone?: Tone;
    /** 0 is the line closest to the boxes. */
    lane?: number;
    /** Point down from above the row instead of up from below. */
    above?: boolean;
  };

  /** An arrow from one cell back to another, routed under the row. */
  type Loop = { from: number; to: number; label?: string; tone?: Tone };

  let {
    cells,
    label = '',
    topLabel = '',
    bottomLabel = '',
    gutter = 0,
    gap = 0,
    w = CELL_W,
    h = CELL_H,
    marks = [],
    loops = [],
    title = '',
    caption = '',
    minWidth = '',
    plain = false
  }: {
    cells: Cell[];
    label?: string;
    topLabel?: string;
    bottomLabel?: string;
    /** Left space for the row captions (`label`, `topLabel`, `bottomLabel`). */
    gutter?: number;
    gap?: number;
    w?: number;
    h?: number;
    marks?: Mark[];
    loops?: Loop[];
    title?: string;
    caption?: string;
    minWidth?: string;
    plain?: boolean;
  } = $props();

  const PAD = 8;
  const LANE = 34;
  const MARK_FONT = 11;

  const hasTop = $derived(cells.some((c) => c.top !== undefined) || !!topLabel);
  const hasBottom = $derived(cells.some((c) => c.bottom !== undefined) || !!bottomLabel);

  const below = $derived(marks.filter((m) => !m.above));
  const above = $derived(marks.filter((m) => m.above));

  const lanesBelow = $derived(below.length ? Math.max(...below.map((m) => (m.lane ?? 0) + 1)) : 0);
  const lanesAbove = $derived(above.length ? Math.max(...above.map((m) => (m.lane ?? 0) + 1)) : 0);

  const rowY = $derived(PAD + (hasTop ? 18 : 0) + lanesAbove * LANE);
  const loopSpace = $derived(loops.length ? 34 + (loops.some((l) => l.label) ? 16 : 0) : 0);
  const height = $derived(
    rowY + h + (hasBottom ? 22 : 0) + lanesBelow * LANE + loopSpace + PAD
  );

  const cx = (i: number) => PAD + gutter + i * (w + gap) + w / 2;
  const spanX = (m: Mark) =>
    Array.isArray(m.at) ? (cx(m.at[0]) + cx(m.at[1])) / 2 : cx(m.at as number);

  /** y where a below-mark's arrow tip sits (just under the boxes / bottom labels). */
  const belowBase = $derived(rowY + h + (hasBottom ? 22 : 4));

  const contentRight = $derived(PAD + gutter + cells.length * (w + gap) - gap + PAD);

  /**
   * Mark captions are centred on their cell and routinely stick out past the
   * last box, so the viewBox is widened to whatever the text actually needs
   * rather than clipping it.
   */
  const bounds = $derived.by(() => {
    let lo = 0;
    let hi = contentRight;
    for (const m of marks) {
      const half = monoWidth(m.label, MARK_FONT) / 2;
      lo = Math.min(lo, spanX(m) - half - 4);
      hi = Math.max(hi, spanX(m) + half + 4);
    }
    return { lo, hi };
  });
</script>

<Figure {title} {caption} {minWidth} {plain}>
  <svg
    class="dg"
    viewBox="{bounds.lo} 0 {bounds.hi - bounds.lo} {height}"
    width={bounds.hi - bounds.lo}
    height={height}
    role="img"
    aria-label={title || caption}
  >
    <CellRow {cells} x={PAD} y={rowY} {w} {h} {gap} {label} {topLabel} {bottomLabel} {gutter} />

    {#each above as m, i (i)}
      {@const lane = m.lane ?? 0}
      {@const textY = rowY - 14 - lane * LANE - (hasTop ? 18 : 0)}
      <line
        class="arrow {m.tone ?? 'accent'}"
        x1={spanX(m)}
        y1={textY + 6}
        x2={spanX(m)}
        y2={rowY - (hasTop ? 20 : 5)}
        marker-end={arrowHead(m.tone ?? 'accent')}
      />
      <text
        class="label strong {toneText(m.tone ?? 'accent')}"
        x={spanX(m)}
        y={textY}
        text-anchor="middle">{m.label}</text
      >
    {/each}

    {#each below as m, i (i)}
      {@const lane = m.lane ?? 0}
      {@const textY = belowBase + lane * LANE + 26}
      {#if Array.isArray(m.at)}
        {@const x1 = cx(m.at[0]) - w / 2 + 3}
        {@const x2 = cx(m.at[1]) + w / 2 - 3}
        {@const yb = belowBase + lane * LANE + 10}
        <path
          class="arrow {m.tone ?? 'accent'}"
          d="M {x1} {yb - 6} L {x1} {yb} L {x2} {yb} L {x2} {yb - 6}"
        />
      {:else}
        <line
          class="arrow {m.tone ?? 'accent'}"
          x1={spanX(m)}
          y1={textY - 9}
          x2={spanX(m)}
          y2={belowBase + lane * LANE + 3}
          marker-end={arrowHead(m.tone ?? 'accent')}
        />
      {/if}
      <text
        class="label strong {toneText(m.tone ?? 'accent')}"
        x={spanX(m)}
        y={textY}
        text-anchor="middle">{m.label}</text
      >
    {/each}

    {#each loops as loop, i (i)}
      {@const tone = loop.tone ?? 'cyan'}
      {@const spine = belowBase + lanesBelow * LANE + 22}
      <path
        class="arrow {tone}"
        d={elbow(
          { x: cx(loop.from), y: rowY + h + 2 },
          { x: cx(loop.to), y: rowY + h + 4 },
          spine
        )}
        marker-end={arrowHead(tone)}
      />
      {#if loop.label}
        <text
          class="label {toneText(tone)}"
          x={(cx(loop.from) + cx(loop.to)) / 2}
          y={spine + 16}
          text-anchor="middle">{loop.label}</text
        >
      {/if}
    {/each}
  </svg>
</Figure>
