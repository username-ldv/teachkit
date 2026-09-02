<script lang="ts">
  import Figure from './Figure.svelte';
  import CellRow, { CELL_W, CELL_H } from './CellRow.svelte';
  import { arrowHead, toneText } from './geom';
  import { Button } from '$lib/components/ui/button';
  import type { Frame } from './CellsTrace.svelte';

  /**
   * The same trace data as CellsTrace, one step at a time.
   *
   * Use this where the *movement* is the lesson — two pointers walking toward
   * each other, a write pointer falling behind a read pointer — and CellsTrace
   * where comparing distant steps matters more. Stepping keeps only one state
   * on screen, so the reader has to predict the next one.
   */
  let {
    frames,
    w = CELL_W,
    h = CELL_H,
    gap = 0,
    title = '',
    caption = '',
    plain = false
  }: {
    frames: Frame[];
    w?: number;
    h?: number;
    gap?: number;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  let i = $state(0);
  const frame = $derived(frames[Math.min(i, frames.length - 1)]);

  const PAD = 10;
  const MARK_SPACE = 26;
  const cols = $derived(Math.max(...frames.map((f) => f.cells.length)));
  const W = $derived(PAD * 2 + cols * (w + gap) - gap);
  const H = PAD * 2 + MARK_SPACE + CELL_H;
  const rowY = PAD + MARK_SPACE;
  const cx = (idx: number) => PAD + idx * (w + gap) + w / 2;
</script>

<Figure {title} {caption} {plain}>
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title}>
    <CellRow cells={frame.cells} x={PAD} y={rowY} {w} {h} {gap} />
    {#each frame.marks ?? [] as mark, m (m)}
      <text
        class="label strong {toneText(mark.tone ?? 'accent')}"
        x={cx(mark.at)}
        y={rowY - 14}
        text-anchor="middle">{mark.label}</text
      >
      <line
        class="arrow {mark.tone ?? 'accent'}"
        x1={cx(mark.at)}
        y1={rowY - 10}
        x2={cx(mark.at)}
        y2={rowY - 3}
        marker-end={arrowHead(mark.tone ?? 'accent')}
      />
    {/each}
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (i = Math.min(frames.length - 1, i + 1))}
      disabled={i >= frames.length - 1}
    >
      step →
    </Button>
    <Button variant="ghost" size="sm" onclick={() => (i = 0)}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      step <b>{i + 1}</b>/{frames.length}{frame.label ? ` · ${frame.label}` : ''}{frame.note
        ? ` · ${frame.note}`
        : ''}
    </span>
  {/snippet}
</Figure>
