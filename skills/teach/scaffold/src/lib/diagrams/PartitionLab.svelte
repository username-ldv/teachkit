<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { CELL_H, type Cell } from './CellRow.svelte';
  import { arrowHead } from './geom';
  import { Button } from '$lib/components/ui/button';

  /**
   * Lomuto partition, one comparison at a time.
   *
   * Partition is the whole of quicksort — the recursion around it is two lines
   * — and it is the step people mis-remember, because two indices move at
   * different speeds and the pivot only arrives at its home in the very last
   * swap. Watching `i` lag behind `j` is the thing to see.
   *
   * Colours are the invariant, not decoration: green is "already known to be
   * ≤ pivot", yellow "already known to be > pivot", plain "not looked at yet".
   * That is the general move — paint the regions your invariant names, and the
   * figure explains itself.
   */
  let {
    values = [7, 2, 9, 4, 1, 8, 3, 5],
    w = 46,
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

  type Step = {
    arr: number[];
    /** Boundary: everything in [0, i) is ≤ pivot. */
    i: number;
    /** Scanner, or null once the scan is over. */
    j: number | null;
    /** Index the pivot currently sits at. */
    pivotAt: number;
    wrote?: number[];
    note: string;
    comps: number;
    finalAt?: number;
  };

  const trace = $derived.by(() => {
    const a = [...values];
    const hi = a.length - 1;
    const pivot = a[hi];
    const steps: Step[] = [];
    let comps = 0;
    let i = 0;
    steps.push({
      arr: [...a],
      i,
      j: 0,
      pivotAt: hi,
      note: `pivot is the last element, ${pivot}. i marks where the "≤ pivot" region ends.`,
      comps
    });
    for (let j = 0; j < hi; j++) {
      comps++;
      steps.push({
        arr: [...a],
        i,
        j,
        pivotAt: hi,
        note: `is a[${j}] = ${a[j]} ≤ ${pivot}?`,
        comps
      });
      if (a[j] <= pivot) {
        if (i !== j) {
          const t = a[i];
          a[i] = a[j];
          a[j] = t;
        }
        steps.push({
          arr: [...a],
          i: i + 1,
          j,
          pivotAt: hi,
          wrote: i === j ? [] : [i, j],
          note:
            i === j
              ? `yes — it is already inside the region, just widen it`
              : `yes — swap it into slot ${i} and widen the region`,
          comps
        });
        i++;
      } else {
        steps.push({
          arr: [...a],
          i,
          j,
          pivotAt: hi,
          note: 'no — leave it where it is; the ">" region grows for free',
          comps
        });
      }
    }
    const t = a[i];
    a[i] = a[hi];
    a[hi] = t;
    steps.push({
      arr: [...a],
      i,
      j: null,
      pivotAt: i,
      wrote: [i, hi],
      finalAt: i,
      note: `swap the pivot into slot ${i} — it is now in its final position, forever`,
      comps
    });
    return steps;
  });

  let k = $state(0);
  const step = $derived(trace[Math.min(k, trace.length - 1)]);
  const n = $derived(values.length);

  const cells = $derived<Cell[]>(
    step.arr.map((v, idx) => {
      let tone: Cell['tone'] = 'plain';
      if (idx === step.pivotAt) tone = step.finalAt === idx ? 'green' : 'purple';
      else if (idx < step.i) tone = 'green';
      else if (step.j !== null && idx < step.j) tone = 'yellow';
      else if (step.j === null && idx > step.pivotAt) tone = 'yellow';
      if (step.j !== null && idx === step.j && idx !== step.pivotAt) tone = 'accent';
      return { v, top: String(idx), tone };
    })
  );

  const PAD = 10;
  const TOP = 34;
  const W = $derived(PAD * 2 + n * w);
  const H = TOP + CELL_H + 40;
  const cx = (idx: number) => PAD + idx * w + w / 2;
  const bx = (idx: number) => PAD + idx * w;
</script>

<Figure {title} {caption} {plain} minWidth="30rem">
  <svg
    class="dg"
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label={title || 'Lomuto partition'}
  >
    <CellRow {cells} x={PAD} y={TOP} {w} h={CELL_H} />

    {#if step.j !== null}
      <text class="label strong accent-t" x={cx(step.j)} y={TOP - 22} text-anchor="middle">j</text>
      <line
        class="arrow accent"
        x1={cx(step.j)}
        y1={TOP - 18}
        x2={cx(step.j)}
        y2={TOP - 4}
        marker-end={arrowHead('accent')}
      />
    {/if}

    <text class="label strong green-t" x={bx(step.i)} y={TOP + CELL_H + 32} text-anchor="middle">i</text>
    <line
      class="arrow green"
      x1={bx(step.i)}
      y1={TOP + CELL_H + 20}
      x2={bx(step.i)}
      y2={TOP + CELL_H + 4}
      marker-end={arrowHead('green')}
    />
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={() => (k = Math.max(0, k - 1))} disabled={k === 0}>
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (k = Math.min(trace.length - 1, k + 1))}
      disabled={k >= trace.length - 1}
    >
      step →
    </Button>
    <Button variant="ghost" size="sm" onclick={() => (k = 0)}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      comparisons <b>{step.comps}</b> · ≤ pivot <b>{step.i}</b> · step {k + 1}/{trace.length}
    </span>
  {/snippet}

  {#snippet captionSnippet()}
    <p style="margin:0"><b>{step.note}</b>{caption ? ' — ' : ''}{@html caption}</p>
  {/snippet}
</Figure>
