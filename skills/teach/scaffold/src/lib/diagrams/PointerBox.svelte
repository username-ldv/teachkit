<script lang="ts">
  import Figure from './Figure.svelte';
  import { arrowHead, monoWidth, toneClass, type Tone } from './geom';

  /**
   * A variable holding an address, and the thing at that address.
   *
   * Two boxes and one arrow, but it is the diagram lesson 3 is built on: the
   * pointer is a small box with a number in it, the object is somewhere else,
   * and the arrow is the only relationship between them.
   *
   * Also does slice headers (`pointer / len / cap` on the left, backing array
   * on the right) — same shape, more fields.
   */
  type FieldRow = { label: string; value?: string; tone?: Tone; port?: boolean };

  let {
    /** Left box: the handle. */
    varName = '',
    fields,
    /** Right box: what it refers to. */
    targetTitle = '',
    targetLines = [] as string[],
    targetNote = '',
    varNote = '',
    /** Render the right side as a row of array cells instead of a text block. */
    cells,
    cellNote = '',
    title = '',
    caption = '',
    plain = false
  }: {
    varName?: string;
    fields: FieldRow[];
    targetTitle?: string;
    targetLines?: string[];
    targetNote?: string;
    varNote?: string;
    cells?: { v?: string | number; empty?: boolean; tone?: Tone }[];
    cellNote?: string;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  const PAD = 10;
  const ROW_H = 26;
  const LEFT_W = $derived(
    Math.max(
      120,
      ...fields.map((f) => monoWidth(`${f.label} ${f.value ?? ''}`, 12) + 34),
      monoWidth(varName, 12) + 24
    )
  );
  const GAP = 92;
  const CW = 46;
  const CH = 34;

  const leftH = $derived(fields.length * ROW_H + 12);
  const rightX = $derived(PAD + LEFT_W + GAP);

  const rightW = $derived(
    cells
      ? cells.length * CW
      : Math.max(150, ...targetLines.map((l) => monoWidth(l, 12) + 34), monoWidth(targetTitle, 12) + 34)
  );
  const rightH = $derived(cells ? CH : Math.max(leftH, targetLines.length * 20 + 26));

  const topLabel = $derived(varName || targetTitle ? 18 : 0);
  const rowY = $derived(PAD + topLabel);
  const H = $derived(rowY + Math.max(leftH, rightH) + (varNote || targetNote || cellNote ? 22 : 0) + PAD);
  const W = $derived(rightX + rightW + PAD + (targetNote ? monoWidth(targetNote, 11) + 16 : 0));

  const midY = $derived(rowY + Math.max(leftH, rightH) / 2);
</script>

<Figure {title} {caption} {plain} minWidth={cells && cells.length > 6 ? '32rem' : ''}>
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title}>
    {#if varName}
      <text class="label strong" x={PAD} y={rowY - 6}>{varName}</text>
    {/if}
    {#if targetTitle}
      <text class="label strong" x={rightX} y={rowY - 6}>{targetTitle}</text>
    {/if}

    <rect class="box" x={PAD} y={rowY} width={LEFT_W} height={leftH} rx="5" />
    {#each fields as field, i (i)}
      {@const y = rowY + 6 + i * ROW_H}
      {#if i > 0}
        <line class="rule" x1={PAD} y1={y - 3} x2={PAD + LEFT_W} y2={y - 3} />
      {/if}
      <text class="label strong mono" x={PAD + 12} y={y + 16}>
        {field.label}{field.value ? `: ${field.value}` : ''}
      </text>
      {#if field.port}
        <circle cx={PAD + LEFT_W - 10} cy={y + 11} r="3" fill="var(--accent)" />
        <line
          class="arrow accent"
          x1={PAD + LEFT_W - 7}
          y1={y + 11}
          x2={rightX - 6}
          y2={cells ? rowY + CH / 2 : midY}
          marker-end={arrowHead('accent')}
        />
      {/if}
    {/each}

    {#if cells}
      {#each cells as cell, i (i)}
        <rect
          class={toneClass(cell.empty ? 'box empty' : 'box', cell.tone)}
          x={rightX + i * CW}
          y={rowY}
          width={CW}
          height={CH}
          rx="4"
        />
        <text class="val" x={rightX + i * CW + CW / 2} y={rowY + CH / 2 + 5} text-anchor="middle">
          {cell.v ?? ''}
        </text>
      {/each}
      {#if cellNote}
        <text class="label" x={rightX} y={rowY + CH + 18}>{cellNote}</text>
      {/if}
    {:else}
      <rect class="box" x={rightX} y={rowY} width={rightW} height={rightH} rx="5" />
      {#each targetLines as line, i (i)}
        <text class="val mono" x={rightX + 14} y={rowY + 24 + i * 20} font-size="13">{line}</text>
      {/each}
      {#if targetNote}
        <text class="label" x={rightX + rightW + 10} y={rowY + 22}>{targetNote}</text>
      {/if}
    {/if}

    {#if varNote}
      <text class="label" x={PAD} y={rowY + leftH + 16}>{varNote}</text>
    {/if}
  </svg>
</Figure>
