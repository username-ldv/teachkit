<script lang="ts">
  import { toneClass, type Tone } from './geom';

  /**
   * The stack and the heap, side by side — one orderly region where frames
   * appear and vanish at the top, one shared pool of loose allocations.
   *
   * The asymmetry is the lesson: the left panel is a neat column because LIFO
   * makes it one, and the right panel is scattered because nothing about heap
   * allocation is ordered.
   *
   * Laid out as two HTML columns with an SVG inside each, so the explanatory
   * prose wraps like prose instead of running off the side of a viewBox.
   */
  type StackFrame = { label: string; tone?: Tone; note?: string };
  type HeapObject = {
    label: string;
    lines?: string[];
    /** Position within the heap panel, 0–1 on each axis. Authored, not random. */
    x: number;
    y: number;
    w?: number;
    tone?: Tone;
  };

  let {
    stackTitle = 'The stack',
    stackSub = '',
    frames,
    heapTitle = 'The heap',
    heapSub = '',
    objects,
    stackNote = '',
    heapNote = '',
    title = '',
    caption = ''
  }: {
    stackTitle?: string;
    stackSub?: string;
    frames: StackFrame[];
    heapTitle?: string;
    heapSub?: string;
    objects: HeapObject[];
    stackNote?: string;
    heapNote?: string;
    title?: string;
    caption?: string;
  } = $props();

  const CW = 290;
  const FH = 38;
  const bodyH = $derived(Math.max(frames.length * FH + 4, 168));
  const OW = 98;
  const OH = 36;
</script>

<figure class="figure regions">
  {#if title}<span class="figure-title">{title}</span>{/if}

  <div class="cols">
    <div class="col">
      <h4 class="stack">{stackTitle}</h4>
      {#if stackSub}<p class="sub">{stackSub}</p>{/if}
      <svg
        class="dg"
        viewBox="0 0 {CW} {bodyH}"
        width={CW}
        height={bodyH}
        role="img"
        aria-label={stackTitle}
      >
        {#each frames as frame, i (i)}
          {@const y = i * FH}
          <rect class={toneClass('box', frame.tone)} x="1" {y} width={CW - 2} height={FH} rx="4" />
          <text class="val" x={CW / 2} y={y + FH / 2 + 5} text-anchor="middle" font-size="13">
            {frame.label}
          </text>
          {#if frame.note}
            <text class="label cyan-t" x={CW - 10} y={y + FH / 2 + 4} text-anchor="end">
              {frame.note}
            </text>
          {/if}
        {/each}
      </svg>
      {#if stackNote}<p class="note">{stackNote}</p>{/if}
    </div>

    <div class="col">
      <h4 class="heap">{heapTitle}</h4>
      {#if heapSub}<p class="sub">{heapSub}</p>{/if}
      <svg
        class="dg"
        viewBox="0 0 {CW} {bodyH}"
        width={CW}
        height={bodyH}
        role="img"
        aria-label={heapTitle}
      >
        <rect
          x="1"
          y="0"
          width={CW - 2}
          height={bodyH}
          rx="6"
          fill="none"
          stroke="var(--border)"
          stroke-dasharray="4 4"
        />
        {#each objects as obj, i (i)}
          {@const ox = 12 + obj.x * (CW - (obj.w ?? OW) - 24)}
          {@const oy = 12 + obj.y * (bodyH - OH - 24)}
          <rect
            class={toneClass('box', obj.tone ?? 'purple')}
            x={ox}
            y={oy}
            width={obj.w ?? OW}
            height={OH}
            rx="4"
          />
          <text
            class="val"
            x={ox + (obj.w ?? OW) / 2}
            y={oy + OH / 2 + (obj.lines?.length ? -2 : 5)}
            text-anchor="middle"
            font-size="12">{obj.label}</text
          >
          {#each obj.lines ?? [] as line, li (li)}
            <text
              class="label"
              x={ox + (obj.w ?? OW) / 2}
              y={oy + OH / 2 + 12 + li * 12}
              text-anchor="middle">{line}</text
            >
          {/each}
        {/each}
      </svg>
      {#if heapNote}<p class="note">{heapNote}</p>{/if}
    </div>
  </div>

  {#if caption}<figcaption class="figure-caption">{@html caption}</figcaption>{/if}
</figure>

<style>
  .regions {
    margin-inline: 0;
  }

  .cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
    gap: 1.25rem;
  }

  .col {
    min-width: 0;
  }

  h4 {
    margin: 0 0 0.2rem;
    font-family: var(--mono);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h4.stack {
    color: var(--cyan);
  }

  h4.heap {
    color: var(--purple);
  }

  .sub,
  .note {
    margin: 0 0 0.5rem;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .note {
    margin: 0.6rem 0 0;
  }
</style>
