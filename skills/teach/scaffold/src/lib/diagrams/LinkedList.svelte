<script lang="ts">
  import Figure from './Figure.svelte';
  import NodeBox, { NODE_H, type NodeSpec } from './NodeBox.svelte';
  import { arrowHead, elbow, monoWidth, toneText, type Tone } from './geom';

  /**
   * A chain of nodes joined by real arrows.
   *
   * Defaults draw the ordinary singly linked case: node i points at node i+1,
   * and the tail points at nil. Everything a lesson needs to *change* about
   * that — a cut link, a rerouted link, back-pointers, a cycle, a label
   * hanging over one node — is a prop, so the same component draws the before
   * and the after of a splice without a second, hand-aligned diagram.
   */
  type Pointer = {
    /** Node index to point at, or 'nil' for the terminator. */
    at: number | 'nil';
    label: string;
    tone?: Tone;
    /** Stack labels that would otherwise collide. */
    lane?: number;
  };

  type Link = {
    from: number;
    /** Target node, or the nil terminator. */
    to: number | 'nil';
    tone?: Tone;
    dashed?: boolean;
    /** Route the arrow under the row rather than straight across. */
    under?: boolean;
    label?: string;
  };

  let {
    nodes,
    nodeWidth = 118,
    gapX = 44,
    /** Draw prev-pointers back along the chain. */
    double = false,
    /** '' hides the terminator entirely. */
    terminal = 'nil',
    /** Forward links to delete, by source index. */
    cut = [],
    /** Extra or replacement links drawn on top of the defaults. */
    links = [],
    pointers = [],
    /** Tail links back to node 0, drawn as an arc beneath the row. */
    circular = false,
    circularNote = '',
    title = '',
    caption = '',
    minWidth = '',
    plain = false
  }: {
    nodes: NodeSpec[];
    nodeWidth?: number;
    gapX?: number;
    double?: boolean;
    terminal?: string;
    cut?: number[];
    links?: Link[];
    pointers?: Pointer[];
    circular?: boolean;
    circularNote?: string;
    title?: string;
    caption?: string;
    minWidth?: string;
    plain?: boolean;
  } = $props();

  const PAD = 10;
  const LANE = 26;
  const h = NODE_H;

  /** A doubly linked head also terminates in nil, on the left. */
  const leftGutter = $derived(double && terminal ? monoWidth(terminal, 12) + 34 : 0);

  const laneCount = $derived(
    pointers.length ? Math.max(...pointers.map((p) => (p.lane ?? 0) + 1)) : 0
  );
  const rowY = $derived(PAD + laneCount * LANE + (laneCount ? 10 : 0));

  const hasNote = $derived(nodes.some((n) => n.note));
  const underLinks = $derived(links.some((l) => l.under) || circular);
  const noteSpace = $derived(hasNote ? 20 : 6);
  const height = $derived(
    rowY + h + noteSpace + (underLinks ? (circularNote ? 58 : 44) : 0) + PAD
  );

  const nx = (i: number) => PAD + leftGutter + i * (nodeWidth + gapX);
  const right = (i: number) => nx(i) + nodeWidth;
  const midY = $derived(rowY + h / 2);
  /** Forward arrows ride above centre when back-arrows share the gap. */
  const fwdY = $derived(double ? midY - 8 : midY);
  const backY = $derived(midY + 8);

  const nilX = $derived(nx(nodes.length) + 6);
  const contentRight = $derived(
    terminal && !circular
      ? nilX + monoWidth(terminal, 12) + PAD
      : right(nodes.length - 1) + PAD
  );

  const cutSet = $derived(new Set(cut));
  const spineY = $derived(rowY + h + noteSpace + 24);
</script>

<Figure {title} {caption} {minWidth} {plain}>
  <svg
    class="dg"
    viewBox="0 0 {contentRight} {height}"
    width={contentRight}
    height={height}
    role="img"
    aria-label={title || caption}
  >
    <!-- default forward links -->
    {#each nodes as _node, i (i)}
      {#if i < nodes.length - 1 && !cutSet.has(i)}
        <line
          class="arrow"
          x1={right(i) + 3}
          y1={fwdY}
          x2={nx(i + 1) - 4}
          y2={fwdY}
          marker-end={arrowHead('plain')}
        />
      {/if}
      {#if double && i > 0}
        <line
          class="arrow faint"
          x1={nx(i) - 3}
          y1={backY}
          x2={right(i - 1) + 4}
          y2={backY}
          marker-end={arrowHead('faint')}
        />
      {/if}
    {/each}

    <!-- terminators -->
    {#if terminal && !circular && !cutSet.has(nodes.length - 1)}
      <line
        class="arrow"
        x1={right(nodes.length - 1) + 3}
        y1={fwdY}
        x2={nilX - 8}
        y2={fwdY}
        marker-end={arrowHead('plain')}
      />
      <text class="label mono" x={nilX} y={fwdY + 4}>{terminal}</text>
    {/if}
    {#if double && terminal}
      <line
        class="arrow faint"
        x1={nx(0) - 3}
        y1={backY}
        x2={PAD + monoWidth(terminal, 12) + 10}
        y2={backY}
        marker-end={arrowHead('faint')}
      />
      <text class="label mono" x={PAD} y={backY + 4}>{terminal}</text>
    {/if}

    <!-- explicit links: reroutes, cycles, "this now points there" -->
    {#each links as link, i (i)}
      {@const tone = link.tone ?? 'green'}
      {@const targetTop = link.to === 'nil' ? nilX : nx(link.to) + 18}
      {#if link.under}
        <path
          class="arrow {tone}"
          class:dashed={link.dashed}
          d={elbow(
            { x: right(link.from) - 14, y: rowY + h + 3 },
            { x: targetTop, y: rowY + h + 5 },
            spineY
          )}
          marker-end={arrowHead(tone)}
        />
        {#if link.label}
          <text
            class="label {toneText(tone)}"
            x={(right(link.from) - 14 + targetTop) / 2}
            y={spineY + 16}
            text-anchor="middle">{link.label}</text
          >
        {/if}
      {:else}
        <line
          class="arrow {tone}"
          class:dashed={link.dashed}
          x1={right(link.from) + 3}
          y1={fwdY}
          x2={(link.to === 'nil' ? nilX - 8 : nx(link.to)) - 4}
          y2={fwdY}
          marker-end={arrowHead(tone)}
        />
        {#if link.label}
          <text
            class="label {toneText(tone)}"
            x={(right(link.from) + (link.to === 'nil' ? nilX : nx(link.to))) / 2}
            y={fwdY - 9}
            text-anchor="middle">{link.label}</text
          >
        {/if}
      {/if}
    {/each}

    {#if circular}
      <path
        class="arrow cyan"
        d={elbow(
          { x: right(nodes.length - 1) - 14, y: rowY + h + 3 },
          { x: nx(0) + nodeWidth / 2, y: rowY + h + 5 },
          spineY
        )}
        marker-end={arrowHead('cyan')}
      />
      {#if circularNote}
        <text class="label cyan-t" x={contentRight / 2} y={spineY + 18} text-anchor="middle">
          {circularNote}
        </text>
      {/if}
    {/if}

    {#each nodes as node, i (i)}
      <NodeBox {node} x={nx(i)} y={rowY} w={nodeWidth} {h} />
    {/each}

    <!-- labelled pointers hanging above the row -->
    {#each pointers as p, i (i)}
      {@const lane = p.lane ?? 0}
      {@const px = p.at === 'nil' ? nilX : nx(p.at as number) + nodeWidth / 2}
      {@const ty = PAD + lane * LANE + 10}
      <text class="label strong {toneText(p.tone ?? 'accent')}" x={px} y={ty} text-anchor="middle"
        >{p.label}</text
      >
      <line
        class="arrow {p.tone ?? 'accent'}"
        x1={px}
        y1={ty + 5}
        x2={px}
        y2={rowY - 4}
        marker-end={arrowHead(p.tone ?? 'accent')}
      />
    {/each}
  </svg>
</Figure>
