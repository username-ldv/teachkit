<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import CellRow, { CELL_W, CELL_H, type Cell } from './CellRow.svelte';
  import { arrowHead } from './geom';
  import { Button } from '$lib/components/ui/button';

  /**
   * Binary search, one probe at a time, against linear search on the same data.
   *
   * The movement *is* the lesson here: the point of the algorithm is that half
   * the array stops being a candidate after every comparison, and that is a
   * thing you watch happen rather than a sentence you believe. The ghosted
   * cells are the eliminated ones, so the shrinking window is the figure.
   *
   * The comparison counter is real — it counts element comparisons the same
   * way the code on the page does — which is what makes the linear/binary
   * toggle an argument rather than a demo.
   */
  let {
    values = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    /** Values offered as search targets. The last one may deliberately miss. */
    targets = [23, 2, 91, 40],
    w = 50,
    title = '',
    caption = '',
    plain = false
  }: {
    values?: number[];
    targets?: number[];
    w?: number;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  type Step = {
    lo: number;
    hi: number;
    /** The index being compared this step, or null before/after the search. */
    probe: number | null;
    verdict: string;
    comps: number;
    /** Set once the search has answered. */
    foundAt?: number | null;
  };

  let mode = $state<'binary' | 'linear'>('binary');
  // Seeded from the prop once; the target buttons own it after that.
  let target = $state(untrack(() => targets[0]));
  let i = $state(0);

  const n = $derived(values.length);

  function binaryTrace(t: number): Step[] {
    const steps: Step[] = [];
    let lo = 0;
    let hi = values.length - 1;
    let comps = 0;
    steps.push({ lo, hi, probe: null, comps, verdict: `start — all ${values.length} elements are candidates` });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      comps += 1;
      if (values[mid] === t) {
        steps.push({ lo, hi, probe: mid, comps, verdict: `a[${mid}] = ${values[mid]} — found it`, foundAt: mid });
        return steps;
      }
      if (values[mid] < t) {
        steps.push({ lo, hi, probe: mid, comps, verdict: `a[${mid}] = ${values[mid]} < ${t} — drop index ${lo}…${mid}` });
        lo = mid + 1;
      } else {
        steps.push({ lo, hi, probe: mid, comps, verdict: `a[${mid}] = ${values[mid]} > ${t} — drop index ${mid}…${hi}` });
        hi = mid - 1;
      }
    }
    steps.push({ lo, hi, probe: null, comps, verdict: `lo > hi — the window is empty, ${t} is not here`, foundAt: null });
    return steps;
  }

  function linearTrace(t: number): Step[] {
    const steps: Step[] = [];
    let comps = 0;
    steps.push({ lo: 0, hi: values.length - 1, probe: null, comps, verdict: `start — all ${values.length} elements are candidates` });
    for (let k = 0; k < values.length; k++) {
      comps += 1;
      if (values[k] === t) {
        steps.push({ lo: k, hi: values.length - 1, probe: k, comps, verdict: `a[${k}] = ${values[k]} — found it`, foundAt: k });
        return steps;
      }
      steps.push({ lo: k, hi: values.length - 1, probe: k, comps, verdict: `a[${k}] = ${values[k]} — not it, drop one` });
    }
    steps.push({ lo: values.length, hi: values.length - 1, probe: null, comps, verdict: `ran off the end, ${t} is not here`, foundAt: null });
    return steps;
  }

  const trace = $derived(mode === 'binary' ? binaryTrace(target) : linearTrace(target));
  const step = $derived(trace[Math.min(i, trace.length - 1)]);
  const alive = $derived(Math.max(0, step.hi - step.lo + 1));
  /** Comparisons the other strategy needs for the same target, for the readout. */
  const rival = $derived(
    (mode === 'binary' ? linearTrace(target) : binaryTrace(target)).at(-1)!.comps
  );

  const cells = $derived<Cell[]>(
    values.map((v, k) => {
      const out = k < step.lo || k > step.hi;
      const found = step.foundAt === k;
      return {
        v,
        top: String(k),
        ghost: out && !found,
        tone: found ? 'green' : k === step.probe ? 'accent' : out ? 'faint' : 'plain'
      };
    })
  );

  const PAD = 10;
  const TOP = 30;
  const W = $derived(PAD * 2 + n * w);
  const H = TOP + CELL_H + 42;
  const rowY = TOP;
  const cx = (k: number) => PAD + k * w + w / 2;

  function reset() {
    i = 0;
  }
</script>

<Figure {title} {caption} {plain} minWidth="32rem">
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title || 'binary search'}>
    <CellRow {cells} x={PAD} y={rowY} {w} h={CELL_H} />

    {#if step.probe !== null}
      <text class="label strong accent-t" x={cx(step.probe)} y={rowY - 18} text-anchor="middle">
        {mode === 'binary' ? 'mid' : 'i'}
      </text>
      <line
        class="arrow accent"
        x1={cx(step.probe)}
        y1={rowY - 14}
        x2={cx(step.probe)}
        y2={rowY - 3}
        marker-end={arrowHead('accent')}
      />
    {/if}

    {#if step.lo <= step.hi}
      <text class="label strong cyan-t" x={cx(step.lo)} y={rowY + CELL_H + 30} text-anchor="middle">lo</text>
      <line
        class="arrow cyan"
        x1={cx(step.lo)}
        y1={rowY + CELL_H + 18}
        x2={cx(step.lo)}
        y2={rowY + CELL_H + 4}
        marker-end={arrowHead('cyan')}
      />
      <text class="label strong purple-t" x={cx(step.hi)} y={rowY + CELL_H + 30} text-anchor="middle">hi</text>
      <line
        class="arrow purple"
        x1={cx(step.hi)}
        y1={rowY + CELL_H + 18}
        x2={cx(step.hi)}
        y2={rowY + CELL_H + 4}
        marker-end={arrowHead('purple')}
      />
    {/if}
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (i = Math.min(trace.length - 1, i + 1))}
      disabled={i >= trace.length - 1}
    >
      probe →
    </Button>
    <Button
      variant={mode === 'binary' ? 'default' : 'ghost'}
      size="sm"
      onclick={() => {
        mode = mode === 'binary' ? 'linear' : 'binary';
        reset();
      }}
    >
      {mode === 'binary' ? 'binary' : 'linear'}
    </Button>
    {#each targets as t (t)}
      <Button
        variant={t === target ? 'default' : 'ghost'}
        size="sm"
        onclick={() => {
          target = t;
          reset();
        }}
      >
        find {t}
      </Button>
    {/each}
    <span class="spacer"></span>
    <span class="readout">
      comparisons <b>{step.comps}</b> · candidates left <b>{alive}</b> · {mode === 'binary'
        ? 'linear'
        : 'binary'} needs {rival}
    </span>
  {/snippet}

  {#snippet captionSnippet()}
    <p style="margin:0">
      <b>{step.verdict}</b>{caption ? ' — ' : ''}{@html caption}
    </p>
  {/snippet}
</Figure>
