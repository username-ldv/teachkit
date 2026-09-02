<script lang="ts">
  import Figure from './Figure.svelte';
  import { arrowHead, toneClass, toneText, type Tone } from './geom';

  /**
   * A stack drawn the way a stack is: growing upward, only the top reachable.
   * Used for both the value stack (push/pop) and the call stack (frames).
   *
   * `frames` is bottom-first — index 0 is the bottom of the stack, the same
   * order you would push them — and the component reverses it for drawing.
   */
  type Frame = { label: string; note?: string; tone?: Tone; ghost?: boolean };

  let {
    frames,
    w = 190,
    h = 38,
    /** Caption pinned to the topmost frame. */
    topNote = '← top',
    bottomNote = 'bottom',
    /** An arrow above the stack: something arriving or leaving. */
    action,
    title = '',
    caption = '',
    plain = false
  }: {
    frames: Frame[];
    w?: number;
    h?: number;
    topNote?: string;
    bottomNote?: string;
    action?: { label: string; dir: 'in' | 'out'; tone?: Tone };
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  const PAD = 10;
  const ACTION_H = 46;

  /* Only reserve gutter width when something is actually written in it —
     otherwise a note-less column scales its whole viewBox down to fit
     150px of empty space, and the labels shrink with it. */
  const hasNotes = $derived(frames.some((f) => f.note) || !!topNote);
  const NOTE_W = $derived(hasNotes ? 150 : 0);

  const topSpace = $derived(PAD + (action ? ACTION_H : 0));
  const height = $derived(topSpace + frames.length * h + 22 + PAD);
  const width = $derived(PAD + w + NOTE_W);

  const x = PAD + 30;
  /** Screen y of frame `i`, counting from the bottom of the stack. */
  const fy = (i: number) => topSpace + (frames.length - 1 - i) * h;
</script>

<Figure {title} {caption} {plain}>
  <svg
    class="dg"
    viewBox="0 0 {width} {height}"
    {width}
    {height}
    role="img"
    aria-label={title || caption}
  >
    {#if action}
      {@const ax = x + w / 2}
      {@const tone = action.tone ?? (action.dir === 'in' ? 'green' : 'yellow')}
      <text class="label strong {toneText(tone)}" {x} y={PAD + 12}>{action.label}</text>
      {#if action.dir === 'in'}
        <line
          class="arrow {tone}"
          x1={ax}
          y1={PAD + 20}
          x2={ax}
          y2={topSpace - 6}
          marker-end={arrowHead(tone)}
        />
      {:else}
        <line
          class="arrow {tone}"
          x1={ax}
          y1={topSpace - 6}
          x2={ax}
          y2={PAD + 20}
          marker-end={arrowHead(tone)}
        />
      {/if}
    {/if}

    {#each frames as frame, i (i)}
      <g opacity={frame.ghost ? 0.4 : 1}>
        <rect class={toneClass('box', frame.tone)} {x} y={fy(i)} width={w} height={h} rx="4" />
        <text class="val" x={x + w / 2} y={fy(i) + h / 2 + 5} text-anchor="middle">
          {frame.label}
        </text>
        {#if frame.note}
          <text class="label strong" x={x + w + 12} y={fy(i) + h / 2 + 4}>{frame.note}</text>
        {/if}
      </g>
    {/each}

    {#if topNote && !frames[frames.length - 1]?.note}
      <text class="label cyan-t" x={x + w + 12} y={fy(frames.length - 1) + h / 2 + 4}>
        {topNote}
      </text>
    {/if}
    {#if bottomNote}
      <text class="label" {x} y={fy(0) + h + 16}>{bottomNote}</text>
    {/if}
  </svg>
</Figure>
