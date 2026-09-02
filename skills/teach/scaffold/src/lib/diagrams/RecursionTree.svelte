<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import { Button } from '$lib/components/ui/button';

  /**
   * The Fibonacci call tree, generated rather than drawn.
   *
   * Toggle memoisation and the tree collapses in front of you: every repeated
   * subtree turns into a single cache hit. The node counts underneath are the
   * real counts for the tree on screen, so the exponential-vs-linear claim is
   * something you can check rather than take on faith.
   */
  let {
    n = 5,
    maxN = 7,
    title = '',
    caption = '',
    plain = false
  }: { n?: number; maxN?: number; title?: string; caption?: string; plain?: boolean } = $props();

  // Seeded from the prop once; the buttons own it after that.
  let target = $state(untrack(() => n));
  let memo = $state(false);

  type TNode = {
    label: string;
    k: number;
    depth: number;
    x: number;
    /** A memoised call that returns immediately from the cache. */
    hit: boolean;
    children: TNode[];
  };

  /** Build the call tree exactly as the recursion would make it. */
  const tree = $derived.by(() => {
    let leafX = 0;
    let calls = 0;
    const seen = new Set<number>();

    function build(k: number, depth: number): TNode {
      calls += 1;
      const hit = memo && seen.has(k);
      seen.add(k);
      const node: TNode = { label: `fib(${k})`, k, depth, x: 0, hit, children: [] };
      if (k > 1 && !hit) {
        node.children = [build(k - 1, depth + 1), build(k - 2, depth + 1)];
      }
      if (node.children.length === 0) {
        node.x = leafX++;
      } else {
        node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
      }
      return node;
    }

    const root = build(target, 0);
    return { root, calls, leaves: leafX };
  });

  const flat = $derived.by(() => {
    const out: TNode[] = [];
    const walk = (t: TNode) => {
      out.push(t);
      t.children.forEach(walk);
    };
    walk(tree.root);
    return out;
  });

  /** How many times each value is computed — the duplication, counted. */
  const repeats = $derived.by(() => {
    const counts = new Map<number, number>();
    for (const t of flat) counts.set(t.k, (counts.get(t.k) ?? 0) + 1);
    return counts;
  });

  const NW = 58;
  const NH = 24;
  const GAP_X = 12;
  const GAP_Y = 52;
  const PAD = 12;

  const depth = $derived(Math.max(...flat.map((t) => t.depth)));
  const W = $derived(PAD * 2 + Math.max(tree.leaves, 1) * (NW + GAP_X));
  const H = $derived(PAD * 2 + (depth + 1) * GAP_Y);

  const px = (t: TNode) => PAD + t.x * (NW + GAP_X) + NW / 2;
  const py = (t: TNode) => PAD + t.depth * GAP_Y + NH / 2;
</script>

<Figure {title} {caption} {plain} minWidth={W > 700 ? `${Math.round(W / 16)}rem` : ''}>
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title}>
    {#each flat as node, ni (ni)}
      {#each node.children as child, ci (ci)}
        <line class="arrow faint" x1={px(node)} y1={py(node) + NH / 2} x2={px(child)} y2={py(child) - NH / 2} />
      {/each}
    {/each}

    {#each flat as node, ni (ni)}
      {@const dup = (repeats.get(node.k) ?? 0) > 1}
      <rect
        class="box {node.hit ? 'green' : dup ? 'yellow' : ''}"
        x={px(node) - NW / 2}
        y={py(node) - NH / 2}
        width={NW}
        height={NH}
        rx="4"
      />
      <text
        class="val {node.hit ? 'green-t' : ''}"
        x={px(node)}
        y={py(node) + 4}
        text-anchor="middle"
        font-size="11">{node.label}</text
      >
      {#if node.hit}
        <text class="label green-t" x={px(node)} y={py(node) + NH / 2 + 12} text-anchor="middle">
          cached
        </text>
      {/if}
    {/each}
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={() => (target = Math.max(1, target - 1))}>
      n −
    </Button>
    <span class="readout"><b>n = {target}</b></span>
    <Button variant="outline" size="sm" onclick={() => (target = Math.min(maxN, target + 1))}>
      n +
    </Button>
    <Button variant={memo ? 'default' : 'outline'} size="sm" onclick={() => (memo = !memo)}>
      {memo ? 'memoised' : 'naive'}
    </Button>
    <span class="spacer"></span>
    <span class="readout">calls: <b>{tree.calls}</b></span>
  {/snippet}
</Figure>
