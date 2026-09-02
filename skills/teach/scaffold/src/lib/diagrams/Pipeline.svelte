<script lang="ts">
  import Figure from './Figure.svelte';
  import { arrowHead, monoWidth, sansWidth, toneClass, toneText, type Tone } from './geom';

  /**
   * A left-to-right transformation chain: box, arrow, box, arrow, box.
   * `key → hash function → integer → % capacity → bucket index` is the
   * canonical use; anything shaped "this becomes that becomes that" fits.
   *
   * Boxes size themselves to their text, so a step can be a word or a
   * whole expression without the author computing coordinates.
   */
  type Step = { label: string; sub?: string; tone?: Tone; mono?: boolean };

  let {
    steps,
    /** Labels on the arrows. edges[i] sits between steps[i] and steps[i+1]. */
    edges = [],
    h = 42,
    title = '',
    caption = '',
    minWidth = '',
    plain = false
  }: {
    steps: Step[];
    edges?: string[];
    h?: number;
    title?: string;
    caption?: string;
    minWidth?: string;
    plain?: boolean;
  } = $props();

  const PAD = 10;
  const PADX = 18;
  const GAP_MIN = 56;

  const boxW = (s: Step) =>
    Math.max(
      54,
      (s.mono ? monoWidth(s.label, 13) : sansWidth(s.label, 14)) + PADX * 2,
      s.sub ? monoWidth(s.sub, 11) + PADX * 2 : 0
    );

  const widths = $derived(steps.map(boxW));
  const gaps = $derived(
    steps.slice(0, -1).map((_, i) => Math.max(GAP_MIN, monoWidth(edges[i] ?? '', 11) + 24))
  );

  const xs = $derived.by(() => {
    const out: number[] = [];
    let x = PAD;
    for (let i = 0; i < steps.length; i++) {
      out.push(x);
      x += widths[i] + (gaps[i] ?? 0);
    }
    return out;
  });

  const hasSub = $derived(steps.some((s) => s.sub));
  const rowY = PAD + 4;
  const height = $derived(rowY + h + (hasSub ? 22 : 0) + PAD);
  const width = $derived((xs.at(-1) ?? 0) + (widths.at(-1) ?? 0) + PAD);
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
    {#each steps as step, i (i)}
      <rect
        class={toneClass('box', step.tone)}
        x={xs[i]}
        y={rowY}
        width={widths[i]}
        height={h}
        rx="6"
      />
      <text
        class="val {step.mono ? 'mono' : ''} {toneText(step.tone)}"
        x={xs[i] + widths[i] / 2}
        y={rowY + h / 2 + 5}
        text-anchor="middle"
        font-size={step.mono ? 13 : 14}>{step.label}</text
      >
      {#if step.sub}
        <text class="label" x={xs[i] + widths[i] / 2} y={rowY + h + 17} text-anchor="middle">
          {step.sub}
        </text>
      {/if}

      {#if i < steps.length - 1}
        {@const x1 = xs[i] + widths[i] + 6}
        {@const x2 = xs[i + 1] - 6}
        <line
          class="arrow"
          {x1}
          y1={rowY + h / 2}
          x2={x2}
          y2={rowY + h / 2}
          marker-end={arrowHead('plain')}
        />
        {#if edges[i]}
          <text class="label" x={(x1 + x2) / 2} y={rowY + h / 2 - 9} text-anchor="middle">
            {edges[i]}
          </text>
        {/if}
      {/if}
    {/each}
  </svg>
</Figure>
