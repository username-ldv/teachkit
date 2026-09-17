<script lang="ts" module>
  import type { Tone } from './geom';

  export type TNode = {
    /** What sits in the node. */
    v: string | number;
    tone?: Tone;
    /** Faded — "this used to be here", or a subtree that is not the subject. */
    ghost?: boolean;
    /** Small caption printed under the node. */
    note?: string;
    /** Tone of the edge coming down from the parent. */
    edge?: Tone;
    /** Dash that edge — a link about to be made, or one being cut. */
    edgeDashed?: boolean;
    left?: TNode | null;
    right?: TNode | null;
    /**
     * Draw dashed stubs where children are missing. The nil children are
     * half the lesson in a BST: they are the gaps a search falls into and
     * the slots an insert attaches to.
     */
    nil?: boolean;
  };

  export const TN_W = 44;
  export const TN_H = 28;
</script>

<script lang="ts">
  import Figure from './Figure.svelte';
  import { toneClass } from './geom';

  /**
   * A binary tree, laid out from the data rather than drawn by hand.
   *
   * Two layouts, because the course needs two different pictures:
   *
   * - `tidy` places each node at its IN-ORDER rank, so left-to-right on the
   *   page is sorted order. That makes the BST invariant visible as a
   *   property of the picture, and makes a degenerate tree fall down the
   *   diagonal exactly as the sorted-insert story says it should.
   * - `level` places each node by its slot in a complete tree (root 0,
   *   children 2i+1 and 2i+2), which is the pyramid a heap actually is and
   *   lines the nodes up with their array indices.
   */
  let {
    root,
    layout = 'tidy',
    /** Print each node's complete-tree slot index above it. For heaps. */
    showIndex = false,
    title = '',
    caption = '',
    plain = false,
    gapY = 54,
    /**
     * Render just the <svg>, with no <Figure> around it. For the interactive
     * labs, which own their own frame — a figure inside a figure gets two
     * captions, two status rows and the wrong margins.
     */
    bare = false
  }: {
    root: TNode | null;
    layout?: 'tidy' | 'level';
    showIndex?: boolean;
    title?: string;
    caption?: string;
    plain?: boolean;
    gapY?: number;
    bare?: boolean;
  } = $props();

  type Placed = {
    node: TNode;
    x: number;
    depth: number;
    slot: number;
    parent: Placed | null;
    /** Reserved ranks for the dashed nil stubs, when this node asked for them. */
    leftGap?: number;
    rightGap?: number;
  };

  const SLOT_W = 58;
  const PAD_X = 16;
  const PAD_TOP = $derived(showIndex ? 30 : 16);
  const PAD_BOTTOM = 26;
  /** Horizontal slot fraction a dashed nil stub reserves. */
  const NIL_GAP = 0.5;

  const placed = $derived.by(() => {
    const out: Placed[] = [];
    if (!root) return out;

    let rank = 0;
    let maxDepth = 0;

    /** In-order walk: assign x by rank, so the page reads left-to-right sorted. */
    function tidy(node: TNode, depth: number, slot: number, parent: Placed | null): Placed {
      if (depth > maxDepth) maxDepth = depth;
      const me: Placed = { node, x: 0, depth, slot, parent };
      // A nil stub is a small box, so it only reserves part of a slot.
      // A full slot each would double the width of every tree that draws them.
      if (node.left) tidy(node.left, depth + 1, slot * 2 + 1, me);
      else if (node.nil) {
        me.leftGap = rank + NIL_GAP / 2;
        rank += NIL_GAP;
      }
      me.x = rank++;
      if (node.right) tidy(node.right, depth + 1, slot * 2 + 2, me);
      else if (node.nil) {
        me.rightGap = rank - 1 + NIL_GAP / 2;
        rank += NIL_GAP;
      }
      out.push(me);
      return me;
    }

    /** Slot walk: x comes from the position in a complete tree. */
    function level(node: TNode, depth: number, slot: number, parent: Placed | null) {
      if (depth > maxDepth) maxDepth = depth;
      const me: Placed = { node, x: 0, depth, slot, parent };
      out.push(me);
      if (node.left) level(node.left, depth + 1, slot * 2 + 1, me);
      if (node.right) level(node.right, depth + 1, slot * 2 + 2, me);
    }

    if (layout === 'tidy') tidy(root, 0, 0, null);
    else level(root, 0, 0, null);

    if (layout === 'level') {
      // Centre each node inside the horizontal band its slot owns.
      const span = 2 ** maxDepth;
      for (const p of out) {
        const first = 2 ** p.depth - 1;
        const posInLevel = p.slot - first;
        const band = span / 2 ** p.depth;
        p.x = posInLevel * band + band / 2 - 0.5;
      }
    }

    return out;
  });

  /**
   * Dashed stubs for the missing children of nodes that asked for them, drawn
   * at the ranks tidy() actually reserved rather than at an eyeballed offset.
   */
  const stubs = $derived.by(() => {
    const out: { parent: Placed; x: number }[] = [];
    for (const p of placed) {
      if (p.leftGap !== undefined) out.push({ parent: p, x: p.leftGap });
      if (p.rightGap !== undefined) out.push({ parent: p, x: p.rightGap });
    }
    return out;
  });

  const maxX = $derived(Math.max(0, ...placed.map((p) => p.x), ...stubs.map((s) => s.x)));
  const minX = $derived(Math.min(0, ...placed.map((p) => p.x), ...stubs.map((s) => s.x)));
  const maxDepth = $derived(Math.max(0, ...placed.map((p) => p.depth)));

  const px = (x: number) => PAD_X + (x - minX) * SLOT_W + SLOT_W / 2;
  const py = (depth: number) => PAD_TOP + depth * gapY + TN_H / 2;

  /**
   * The lowest ink on the drawing. Notes hang below their node and nil stubs
   * hang a whole level below their parent, so neither can be left out of the
   * height or the figure clips — which is how the first draft of this
   * component cut the stub row off.
   *
   * The seed is the bottom of the root row, and it is doing two jobs. It keeps
   * an EMPTY tree at the height of a one-node tree, so a lab that empties out
   * does not collapse and then jump back; and it stops `Math.max()` over two
   * empty lists returning -Infinity, which it did, and which put
   * `viewBox="0 0 90 -Infinity"` on the page the moment HeapLab's last `pop`
   * landed. The other three extents below were already seeded with 0; this one
   * was not, and nothing renders an empty tree except that final pop.
   */
  const contentBottom = $derived(
    Math.max(
      py(0) + TN_H / 2,
      ...placed.map((p) => py(p.depth) + TN_H / 2 + (p.node.note ? 16 : 0)),
      ...stubs.map((s) => py(s.parent.depth + 1) + 7)
    )
  );

  const W = $derived(PAD_X * 2 + (maxX - minX + 1) * SLOT_W);
  const H = $derived(contentBottom + PAD_BOTTOM);
</script>

{#snippet drawing()}
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title || 'binary tree'}>
    <!-- Edges first, so the boxes sit on top of them. -->
    {#each placed as p (p.slot)}
      {#if p.parent}
        <line
          class={toneClass('arrow', p.node.edge ?? 'faint')}
          class:dashed={p.node.edgeDashed}
          class:ghost={p.node.ghost}
          x1={px(p.parent.x)}
          y1={py(p.parent.depth) + TN_H / 2}
          x2={px(p.x)}
          y2={py(p.depth) - TN_H / 2}
        />
      {/if}
    {/each}

    {#each stubs as s, i (i)}
      <line
        class="arrow faint dashed"
        x1={px(s.parent.x)}
        y1={py(s.parent.depth) + TN_H / 2}
        x2={px(s.x)}
        y2={py(s.parent.depth + 1) - 7}
      />
      <rect
        class="box empty"
        x={px(s.x) - 9}
        y={py(s.parent.depth + 1) - 7}
        width="18"
        height="14"
        rx="3"
      />
    {/each}

    {#each placed as p (p.slot)}
      {#if showIndex}
        <text class="label" x={px(p.x)} y={py(p.depth) - TN_H / 2 - 7} text-anchor="middle">
          {p.slot}
        </text>
      {/if}
      <rect
        class={toneClass('box', p.node.tone)}
        class:ghost={p.node.ghost}
        x={px(p.x) - TN_W / 2}
        y={py(p.depth) - TN_H / 2}
        width={TN_W}
        height={TN_H}
        rx="6"
      />
      <text
        class="val"
        class:ghost={p.node.ghost}
        x={px(p.x)}
        y={py(p.depth) + 5}
        text-anchor="middle">{p.node.v}</text
      >
      {#if p.node.note}
        <text class="label strong" x={px(p.x)} y={py(p.depth) + TN_H / 2 + 13} text-anchor="middle">
          {p.node.note}
        </text>
      {/if}
    {/each}
  </svg>
{/snippet}

{#if bare}
  {@render drawing()}
{:else}
  <Figure {title} {caption} {plain} minWidth={W > 640 ? `${Math.round(W / 16)}rem` : ''}>
    {@render drawing()}
  </Figure>
{/if}

<style>
  /* A ghosted edge or value fades with its node rather than staying crisp. */
  .ghost {
    opacity: 0.35;
  }
</style>
