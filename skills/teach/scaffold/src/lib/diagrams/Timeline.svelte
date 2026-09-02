<script lang="ts">
  import Figure from './Figure.svelte';
  import { arrowHead, toneText, type Tone } from './geom';

  /**
   * Events on a time axis, with windows drawn over them.
   *
   * Built for the rate-limiter section, where the entire argument is about
   * *which* interval a request falls in: a fixed window pinned to the clock,
   * a window anchored to the first request, and a window that slides with
   * `now`. Drawn to scale, the three stop being a matter of opinion.
   */
  type Event = { t: number; label?: string; tone?: Tone; rejected?: boolean };
  type Window = { from: number; to: number; label: string; tone?: Tone; lane?: number };

  let {
    from = 0,
    to = 2000,
    events = [] as Event[],
    windows = [] as Window[],
    /** Tick marks on the axis. */
    ticks = [] as number[],
    unit = 'ms',
    title = '',
    caption = '',
    plain = false
  }: {
    from?: number;
    to?: number;
    events?: Event[];
    windows?: Window[];
    ticks?: number[];
    unit?: string;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  const W = 640;
  const PAD = 34;
  const LANE = 30;

  const laneCount = $derived(
    windows.length ? Math.max(...windows.map((w) => (w.lane ?? 0) + 1)) : 0
  );
  const axisY = $derived(28 + laneCount * LANE);
  const H = $derived(axisY + 58);

  const sx = (t: number) => PAD + ((t - from) / (to - from)) * (W - PAD * 2);
</script>

<Figure {title} {caption} {plain} minWidth="32rem">
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title}>
    {#each windows as win, i (i)}
      {@const y = 20 + (win.lane ?? 0) * LANE}
      {@const tone = win.tone ?? 'accent'}
      <line
        class="arrow {tone}"
        x1={sx(win.from)}
        y1={y}
        x2={sx(win.to)}
        y2={y}
        marker-start={arrowHead(tone)}
        marker-end={arrowHead(tone)}
      />
      <line class="arrow {tone} dashed" x1={sx(win.from)} y1={y} x2={sx(win.from)} y2={axisY} />
      <line class="arrow {tone} dashed" x1={sx(win.to)} y1={y} x2={sx(win.to)} y2={axisY} />
      <text
        class="label strong {toneText(tone)}"
        x={(sx(win.from) + sx(win.to)) / 2}
        y={y - 7}
        text-anchor="middle">{win.label}</text
      >
    {/each}

    <line class="axis" x1={PAD - 10} y1={axisY} x2={W - PAD + 14} y2={axisY} marker-end={arrowHead('plain')} />
    <text class="label" x={W - PAD + 18} y={axisY + 4}>t</text>

    {#each ticks as t, ti (ti)}
      <line class="rule" x1={sx(t)} y1={axisY - 4} x2={sx(t)} y2={axisY + 4} />
      <text class="label" x={sx(t)} y={axisY + 18} text-anchor="middle">{t}</text>
    {/each}

    {#each events as ev, i (i)}
      {@const tone = ev.tone ?? (ev.rejected ? 'red' : 'green')}
      <circle
        cx={sx(ev.t)}
        cy={axisY}
        r="5"
        fill={ev.rejected ? 'var(--bg)' : `var(--${tone})`}
        stroke={`var(--${tone})`}
        stroke-width="1.75"
      />
      <text
        class="label strong {toneText(tone)}"
        x={sx(ev.t)}
        y={axisY + 34}
        text-anchor="middle">{ev.label ?? ev.t}</text
      >
    {/each}

    <text class="label" x={PAD - 10} y={axisY + 50}>{unit}</text>
  </svg>
</Figure>
