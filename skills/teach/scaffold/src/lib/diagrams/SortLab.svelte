<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { CELL_H, type Cell } from './CellRow.svelte';
  import { arrowHead } from './geom';
  import { Button } from '$lib/components/ui/button';
  import {
    ALGOS,
    PRESETS,
    PRESET_NAMES,
    RUNNERS,
    type Algo,
    type PresetName
  } from './sorting';

  /**
   * The three elementary sorts, running on the same data, with real counters.
   *
   * Two things about these algorithms are only visible in motion:
   * the sorted region growing from one end (a different end per algorithm),
   * and the fact that "nearly sorted" input costs insertion sort almost
   * nothing while costing selection sort exactly as much as random input.
   * Switch preset and algorithm and read the counters — that is the argument.
   *
   * `comps` counts element-to-element comparisons; `writes` counts assignments
   * into the array, so a swap is 2. The model lives in ./sorting.ts, which a
   * lesson quoting these numbers imports too — so the prose and the screen
   * come from the same code and cannot drift apart.
   */
  let {
    w = 46,
    title = '',
    caption = '',
    plain = false
  }: { w?: number; title?: string; caption?: string; plain?: boolean } = $props();

  let algo = $state<Algo>('bubble');
  let preset = $state<PresetName>('shuffled');
  let i = $state(0);
  let playing = $state(false);

  const trace = $derived(RUNNERS[algo](PRESETS[preset]));
  const step = $derived(trace[Math.min(i, trace.length - 1)]);
  const n = PRESETS.shuffled.length;

  const cells = $derived<Cell[]>(
    step.arr.map((v, k) => {
      const settled = step.done ? k >= step.done[0] && k <= step.done[1] : false;
      const comparing = step.cmp ? k === step.cmp[0] || k === step.cmp[1] : false;
      const written = step.wrote ? step.wrote.includes(k) : false;
      return {
        v,
        top: String(k),
        tone: written ? 'yellow' : comparing ? 'accent' : settled ? 'green' : 'plain'
      };
    })
  );

  const PAD = 10;
  const TOP = 34;
  const W = $derived(PAD * 2 + n * w);
  const H = TOP + CELL_H + 36;
  const cx = (k: number) => PAD + k * w + w / 2;

  $effect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (i >= trace.length - 1) playing = false;
      else i += 1;
    }, 260);
    return () => clearInterval(id);
  });

  function pickAlgo(a: Algo) {
    algo = a;
    i = 0;
    playing = false;
  }

  function pickPreset(p: PresetName) {
    preset = p;
    i = 0;
    playing = false;
  }
</script>

<Figure {title} {caption} {plain} minWidth="30rem">
  <svg
    class="dg"
    viewBox="0 0 {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label={title || 'elementary sorting'}
  >
    <CellRow {cells} x={PAD} y={TOP} {w} h={CELL_H} />

    {#if step.cmp && step.cmp[0] !== step.cmp[1]}
      {#each step.cmp as at (at)}
        <line
          class="arrow accent"
          x1={cx(at)}
          y1={TOP - 17}
          x2={cx(at)}
          y2={TOP - 4}
          marker-end={arrowHead('accent')}
        />
      {/each}
      <text
        class="label strong accent-t"
        x={(cx(step.cmp[0]) + cx(step.cmp[1])) / 2}
        y={TOP - 22}
        text-anchor="middle">compare</text
      >
    {/if}

    {#if step.done}
      <line
        class="arrow green"
        x1={PAD + step.done[0] * w + 2}
        y1={TOP + CELL_H + 13}
        x2={PAD + (step.done[1] + 1) * w - 2}
        y2={TOP + CELL_H + 13}
      />
      <text
        class="label green-t"
        x={PAD + ((step.done[0] + step.done[1] + 1) * w) / 2}
        y={TOP + CELL_H + 28}
        text-anchor="middle">in final position</text
      >
    {/if}
  </svg>

  {#snippet controls()}
    {#each ALGOS as a (a)}
      <Button variant={algo === a ? 'default' : 'ghost'} size="sm" onclick={() => pickAlgo(a)}>
        {a}
      </Button>
    {/each}
    {#each PRESET_NAMES as p (p)}
      <Button variant={preset === p ? 'default' : 'ghost'} size="sm" onclick={() => pickPreset(p)}>
        {p}
      </Button>
    {/each}
    <Button variant="outline" size="sm" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>
      ←
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (i = Math.min(trace.length - 1, i + 1))}
      disabled={i >= trace.length - 1}
    >
      →
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        if (i >= trace.length - 1) i = 0;
        playing = !playing;
      }}
    >
      {playing ? 'pause' : 'play'}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => {
        i = 0;
        playing = false;
      }}
    >
      reset
    </Button>
    <span class="spacer"></span>
    <span class="readout">comparisons <b>{step.comps}</b> · writes <b>{step.writes}</b></span>
  {/snippet}

  {#snippet captionSnippet()}
    <p style="margin:0"><b>{step.note}</b>{caption ? ' — ' : ''}{@html caption}</p>
  {/snippet}
</Figure>
