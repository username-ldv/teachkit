<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { type Cell } from './CellRow.svelte';
  import { Button } from '$lib/components/ui/button';

  /**
   * Merge sort drawn as what it costs: every row is the same n cells wide.
   *
   * Splitting down and merging back up are usually drawn as a binary tree,
   * which makes the levels obvious and the *width* invisible. Drawn as rows,
   * the O(n log n) argument is the picture: each row touches all n elements
   * once, and there are only ⌈log₂ n⌉ + 1 rows, because the run length
   * doubles every time you go up one.
   *
   * Stepping is there to separate the two phases — splitting moves no data,
   * merging moves all of it — which is the part that gets misremembered.
   *
   * Steal the SHAPE for any divide-and-conquer process whose cost argument is
   * "every level does the same work, and there are only log n levels".
   */
  let {
    values = [38, 27, 43, 3, 9, 82, 10, 5],
    w = 42,
    title = '',
    caption = '',
    plain = false
  }: {
    values?: number[];
    w?: number;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  type Range = { s: number; e: number };
  type Row = {
    kind: 'split' | 'merge';
    runs: Range[];
    /** The row's contents, in the order they physically sit in. */
    arr: number[];
    label: string;
    note: string;
  };

  const longestRun = (runs: Range[]) => Math.max(...runs.map((r) => r.e - r.s));
  const runNote = (runs: Range[]) =>
    `${runs.length} run${runs.length === 1 ? '' : 's'}, longest ${longestRun(runs)}`;

  /** One level of splitting: halve every run that still has more than one element. */
  function splitOnce(runs: Range[]): Range[] {
    const out: Range[] = [];
    for (const r of runs) {
      if (r.e - r.s > 1) {
        const mid = r.s + Math.floor((r.e - r.s) / 2);
        out.push({ s: r.s, e: mid }, { s: mid, e: r.e });
      } else {
        out.push(r);
      }
    }
    return out;
  }

  const rows = $derived.by(() => {
    const n = values.length;
    const levels: Range[][] = [[{ s: 0, e: n }]];
    while (levels[levels.length - 1].some((r) => r.e - r.s > 1)) {
      levels.push(splitOnce(levels[levels.length - 1]));
    }
    const deepest = levels.length - 1;

    const out: Row[] = [];
    // Going down: the data never moves, only the run boundaries do.
    levels.forEach((runs, d) => {
      out.push({
        kind: 'split',
        runs,
        arr: [...values],
        label: d === 0 ? 'start' : 'split',
        note: runNote(runs)
      });
    });
    // Coming back up: each run is the merge of the two below it, so it is sorted.
    for (let d = deepest - 1; d >= 0; d--) {
      const runs = levels[d];
      const arr = [...values];
      for (const r of runs) {
        const part = values.slice(r.s, r.e).sort((a, b) => a - b);
        for (let k = 0; k < part.length; k++) arr[r.s + k] = part[k];
      }
      out.push({
        kind: 'merge',
        runs,
        arr,
        label: 'merge',
        note: runNote(runs)
      });
    }
    return out;
  });

  const deepestIndex = $derived(rows.findIndex((r) => r.kind === 'merge') - 1);
  /** ⌈log₂ n⌉ — the number of times the run length can double. */
  const passes = $derived(rows.filter((r) => r.kind === 'merge').length);
  let active = $state(0);
  const cur = $derived(rows[Math.min(active, rows.length - 1)]);

  const n = $derived(values.length);
  const maxRuns = $derived(Math.max(...rows.map((r) => r.runs.length)));

  const PAD = 10;
  const LGUT = 52;
  const RGUT = 78;
  const GAP = 8;
  const ROW_H = 32;
  const ROW_GAP = 12;

  const W = $derived(PAD * 2 + LGUT + n * w + (maxRuns - 1) * GAP + RGUT);
  const H = $derived(PAD * 2 + rows.length * (ROW_H + ROW_GAP) - ROW_GAP);
  const rowY = (idx: number) => PAD + idx * (ROW_H + ROW_GAP);

  /** x of the first cell of run `ri`, given how many gaps precede it. */
  const runX = (row: Row, ri: number) => PAD + LGUT + row.runs[ri].s * w + ri * GAP;

  function cellsOf(row: Row, ri: number, isActive: boolean): Cell[] {
    const r = row.runs[ri];
    // Inactive rows stay fully drawn rather than ghosted: the argument here is
    // that *every* row is n cells wide, and a faded row cannot make it.
    return row.arr.slice(r.s, r.e).map((v) => ({
      v,
      tone: isActive ? (row.kind === 'merge' ? 'green' : 'accent') : 'plain'
    }));
  }
</script>

<Figure {title} {caption} {plain} statusLabel="this row" minWidth="34rem">
  <svg
    class="dg"
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label={title || 'merge sort levels'}
  >
    {#each rows as row, idx (idx)}
      {@const isActive = idx === active}
      <text
        class="label {isActive ? 'strong' : ''}"
        x={PAD + LGUT - 10}
        y={rowY(idx) + ROW_H / 2 + 4}
        text-anchor="end">{row.label}</text
      >
      {#each row.runs as _run, ri (ri)}
        <CellRow
          cells={cellsOf(row, ri, isActive)}
          x={runX(row, ri)}
          y={rowY(idx)}
          {w}
          h={ROW_H}
        />
      {/each}
      <text
        class="label {isActive ? 'strong' : ''}"
        x={W - PAD - RGUT + 10}
        y={rowY(idx) + ROW_H / 2 + 4}>{row.note}</text
      >
    {/each}
  </svg>

  {#snippet controls()}
    <Button
      variant="outline"
      size="sm"
      onclick={() => (active = Math.max(0, active - 1))}
      disabled={active === 0}
    >
      ← up
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (active = Math.min(rows.length - 1, active + 1))}
      disabled={active >= rows.length - 1}
    >
      down →
    </Button>
    <Button variant="ghost" size="sm" onclick={() => (active = 0)}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      {cur.kind === 'split' ? 'splitting' : 'merging'} · <b>{n}</b> elements on this row ·
      {passes} split levels · <b>{passes}</b> merge passes
    </span>
  {/snippet}

  {#snippet status()}
    {#if cur.kind === 'split'}
      {active === 0
        ? 'One run of ' + n + ', not sorted.'
        : 'Split: the boundaries moved, not a single element.'}
      {active === deepestIndex
        ? ' A run of one element is sorted by definition — that is the base case.'
        : ''}
    {:else}
      Merge: every pair of neighbouring runs becomes one sorted run of twice the length.
    {/if}
  {/snippet}
</Figure>
