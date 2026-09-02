<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import { n2 } from './geom';

  /**
   * The five growth curves, actually plotted rather than drawn by hand.
   *
   * Drag n and the readout says what each complexity class costs *there* —
   * which is the whole point of Big-O and the thing a static picture cannot
   * make. Curves are clipped at the top of the plot, so O(n²) leaves the
   * frame early and stays gone: that is the honest shape of the comparison.
   */
  let {
    nMax = 64,
    /** Vertical headroom, as a multiple of nMax. 2.2 keeps O(n log n) visible. */
    headroom = 2.2,
    interactive = true,
    startN = 24,
    title = '',
    caption = '',
    plain = false
  }: {
    nMax?: number;
    headroom?: number;
    interactive?: boolean;
    startN?: number;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  const W = 660;
  const H = 340;
  const M = { top: 30, right: 96, bottom: 46, left: 54 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const yMax = $derived(nMax * headroom);

  type Curve = {
    id: string;
    label: string;
    colour: string;
    f: (n: number) => number;
    /** Nudge the end label off its neighbour — the flat classes crowd together. */
    dy?: number;
  };

  const curves: Curve[] = [
    { id: 'n2', label: 'O(n²)', colour: 'var(--red)', f: (n) => n * n },
    {
      id: 'nlogn',
      label: 'O(n log n)',
      colour: 'var(--yellow)',
      f: (n) => n * Math.log2(Math.max(n, 1))
    },
    { id: 'n', label: 'O(n)', colour: 'var(--accent)', f: (n) => n },
    { id: 'logn', label: 'O(log n)', colour: 'var(--green)', f: (n) => Math.log2(Math.max(n, 1)), dy: -6 },
    { id: '1', label: 'O(1)', colour: 'var(--cyan)', f: () => 1, dy: 12 }
  ];

  const sx = (n: number) => M.left + (n / nMax) * plotW;
  const sy = (v: number) => M.top + plotH - (v / yMax) * plotH;

  function path(f: (n: number) => number) {
    const pts: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const n = (i / steps) * nMax;
      pts.push(`${n2(sx(n))} ${n2(sy(f(n)))}`);
    }
    return 'M ' + pts.join(' L ');
  }

  /** Where the curve leaves the plot: the last n whose value still fits. */
  function labelPoint(f: (n: number) => number) {
    for (let i = 200; i >= 0; i--) {
      const n = (i / 200) * nMax;
      if (f(n) <= yMax) return { x: sx(n), y: sy(f(n)) };
    }
    return { x: M.left, y: M.top };
  }

  // Seeded from the props once; the slider owns it after that.
  let n = $state(untrack(() => Math.min(startN, nMax)));

  const fmt = (v: number) =>
    v >= 1000 ? Math.round(v).toLocaleString('en-US') : v < 10 ? v.toFixed(1) : Math.round(v).toString();

  const gridYs = $derived([0.25, 0.5, 0.75, 1].map((f) => f * yMax));
</script>

<Figure {title} {caption} {plain} minWidth="34rem">
  <svg
    class="dg"
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label={title || 'Big-O growth curves'}
  >
    <defs>
      <clipPath id="growth-clip">
        <rect x={M.left} y={M.top} width={plotW} height={plotH} />
      </clipPath>
    </defs>

    {#each gridYs as gy, gi (gi)}
      <line class="rule" x1={M.left} y1={sy(gy)} x2={M.left + plotW} y2={sy(gy)} />
      <text class="label" x={M.left - 8} y={sy(gy) + 4} text-anchor="end">{fmt(gy)}</text>
    {/each}

    <line class="axis" x1={M.left} y1={M.top} x2={M.left} y2={M.top + plotH} />
    <line class="axis" x1={M.left} y1={M.top + plotH} x2={M.left + plotW} y2={M.top + plotH} />
    <text class="label" x={M.left - 8} y={M.top - 12}>steps ↑</text>
    <text class="label" x={M.left + plotW} y={M.top + plotH + 36} text-anchor="end">
      n (input size) →
    </text>
    <text class="label" x={M.left} y={M.top + plotH + 18}>0</text>
    <text class="label" x={M.left + plotW} y={M.top + plotH + 18} text-anchor="end">{nMax}</text>

    <g clip-path="url(#growth-clip)">
      {#each curves as c (c.id)}
        <path class="curve" d={path(c.f)} stroke={c.colour} />
      {/each}
    </g>

    {#each curves as c (c.id)}
      {@const p = labelPoint(c.f)}
      <text
        class="label strong"
        x={Math.min(p.x + 8, M.left + plotW + 6)}
        y={Math.max(p.y + 4 + (c.dy ?? 0), M.top + 10)}
        fill={c.colour}
        font-size="12">{c.label}</text
      >
    {/each}

    {#if interactive}
      <line
        class="arrow dashed"
        x1={sx(n)}
        y1={M.top}
        x2={sx(n)}
        y2={M.top + plotH}
        stroke="var(--bright)"
        opacity="0.5"
      />
      {#each curves as c (c.id)}
        {#if c.f(n) <= yMax}
          <circle cx={sx(n)} cy={sy(c.f(n))} r="3.5" fill={c.colour} />
        {/if}
      {/each}
      <text class="label strong" x={sx(n)} y={M.top + plotH + 18} text-anchor="middle">n = {n}</text>
    {/if}
  </svg>

  {#snippet controls()}
    {#if interactive}
      <label class="ctl">
        <span class="label-text">n</span>
        <input type="range" min="1" max={nMax} bind:value={n} aria-label="input size n" />
      </label>
      <span class="spacer"></span>
      <span class="readout">
        {#each curves.slice().reverse() as c (c.id)}
          <span class="chip" style="--c:{c.colour}">{c.label} <b>{fmt(c.f(n))}</b></span>
        {/each}
      </span>
    {/if}
  {/snippet}
</Figure>

<style>
  .ctl {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label-text {
    font-family: var(--mono);
    font-size: 0.8rem;
    color: var(--muted);
  }

  input[type='range'] {
    width: 12rem;
    accent-color: var(--accent);
  }

  .readout {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    font-family: var(--mono);
    font-size: 0.75rem;
  }

  .chip {
    color: var(--muted);
    border: 1px solid var(--border-soft);
    border-left: 2px solid var(--c);
    border-radius: 5px;
    padding: 0.05rem 0.45rem;
    white-space: nowrap;
  }

  .chip b {
    color: var(--bright);
    font-weight: 600;
  }
</style>
