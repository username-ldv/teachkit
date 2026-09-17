<script lang="ts">
  import Figure from './Figure.svelte';
  import BinaryTree, { type TNode } from './BinaryTree.svelte';
  import { Button } from '$lib/components/ui/button';

  /**
   * One tree, four orders, stepped.
   *
   * The lesson of this lesson is that the four traversals are the same walk
   * with the visit moved, and that is very hard to see from four code
   * listings and very easy to see from one tree you step through four times.
   * The output row builds up as you go, so "in-order comes out sorted" is
   * something the reader watches happen on a BST rather than a claim.
   *
   * The pending column is the real auxiliary structure: an explicit stack for
   * the depth-first orders, a queue for level order. That is what makes the
   * DFS-holds-the-depth / BFS-holds-the-width comparison concrete — the two
   * numbers in the readout are the peak sizes of exactly this column.
   */
  let {
    title = '',
    caption = '',
    plain = false
  }: { title?: string; caption?: string; plain?: boolean } = $props();

  type Raw = { v: number; left: Raw | null; right: Raw | null };

  const raw: Raw = {
    v: 50,
    left: {
      v: 30,
      left: { v: 20, left: null, right: null },
      right: { v: 40, left: null, right: null }
    },
    right: {
      v: 70,
      left: { v: 60, left: null, right: null },
      right: { v: 80, left: null, right: null }
    }
  };

  type Order = 'pre' | 'in' | 'post' | 'level';

  const orders: { id: Order; label: string; blurb: string }[] = [
    { id: 'pre', label: 'pre-order', blurb: 'visit, then left, then right' },
    { id: 'in', label: 'in-order', blurb: 'left, then visit, then right' },
    { id: 'post', label: 'post-order', blurb: 'left, then right, then visit' },
    { id: 'level', label: 'level order', blurb: 'a queue, one level at a time' }
  ];

  let order = $state<Order>('in');
  let i = $state(0);

  type Step = {
    /** The node visited (emitted) at this step, or null for a bookkeeping step. */
    visited: number | null;
    /** The node the walk is currently looking at. */
    at: number | null;
    /** Everything emitted so far, in order. */
    out: number[];
    /** The explicit stack or queue, bottom/front first. */
    pending: string[];
    note: string;
  };

  /**
   * Recursive DFS, recorded. `pending` is the call stack: the chain of nodes
   * whose call frames are alive, which is exactly what the recursion holds.
   */
  function dfsTrace(kind: 'pre' | 'in' | 'post'): Step[] {
    const steps: Step[] = [];
    const out: number[] = [];
    const stack: number[] = [];

    const push = (at: number | null, visited: number | null, note: string) =>
      steps.push({ visited, at, out: [...out], pending: stack.map(String), note });

    const walk = (node: Raw | null) => {
      if (!node) return;
      stack.push(node.v);
      push(node.v, null, `enter ${node.v} — its frame goes on the stack`);
      if (kind === 'pre') {
        out.push(node.v);
        push(node.v, node.v, `visit ${node.v} on the way DOWN, before either child`);
      }
      walk(node.left);
      if (kind === 'in') {
        out.push(node.v);
        push(node.v, node.v, `visit ${node.v} BETWEEN the two children`);
      }
      walk(node.right);
      if (kind === 'post') {
        out.push(node.v);
        push(node.v, node.v, `visit ${node.v} on the way UP, after both children`);
      }
      stack.pop();
      push(node.v, null, `leave ${node.v} — its frame pops`);
    };

    push(null, null, 'nothing walked yet');
    walk(raw);
    push(null, null, `done — ${out.length} nodes, in ${kind}-order`);
    return steps;
  }

  /** Level order: an explicit queue, which is the whole algorithm. */
  function levelTrace(): Step[] {
    const steps: Step[] = [];
    const out: number[] = [];
    const queue: Raw[] = [raw];

    const push = (at: number | null, visited: number | null, note: string) =>
      steps.push({ visited, at, out: [...out], pending: queue.map((q) => String(q.v)), note });

    push(null, null, 'the root is enqueued; nothing visited yet');
    while (queue.length) {
      const node = queue.shift()!;
      out.push(node.v);
      const added: number[] = [];
      if (node.left) {
        queue.push(node.left);
        added.push(node.left.v);
      }
      if (node.right) {
        queue.push(node.right);
        added.push(node.right.v);
      }
      push(
        node.v,
        node.v,
        added.length
          ? `dequeue ${node.v}, visit it, enqueue its children (${added.join(', ')})`
          : `dequeue ${node.v}, visit it — no children to enqueue`
      );
    }
    push(null, null, `done — ${out.length} nodes, level by level`);
    return steps;
  }

  const trace = $derived(order === 'level' ? levelTrace() : dfsTrace(order));
  const step = $derived(trace[Math.min(i, trace.length - 1)]);
  const emitted = $derived(new Set(step.out));

  /** Peak size of the pending column across the WHOLE run — the memory claim. */
  const peak = $derived(Math.max(...trace.map((s) => s.pending.length)));

  /** Counted from the tree, not typed into the readout as a literal. */
  const total = (function count(n: Raw | null): number {
    return n ? 1 + count(n.left) + count(n.right) : 0;
  })(raw);

  const decorated = $derived.by((): TNode => {
    const dec = (n: Raw | null): TNode | null => {
      if (!n) return null;
      const isAt = step.at === n.v;
      const done = emitted.has(n.v);
      return {
        v: n.v,
        tone: step.visited === n.v ? 'green' : isAt ? 'accent' : done ? 'cyan' : 'plain',
        left: dec(n.left),
        right: dec(n.right)
      };
    };
    return dec(raw)!;
  });

  function reset() {
    i = 0;
  }
</script>

<Figure {title} {caption} {plain} statusLabel="this step" minWidth="34rem">
  <BinaryTree root={decorated} bare />

  <p class="tl-rows">
    <span class="tl-row">
      <span class="tl-key">output</span>
      <span class="tl-val">{step.out.length ? step.out.join('  ') : '—'}</span>
    </span>
    <span class="tl-row">
      <span class="tl-key">{order === 'level' ? 'queue' : 'stack'}</span>
      <span class="tl-val">{step.pending.length ? step.pending.join('  ') : '—'}</span>
    </span>
  </p>

  {#snippet controls()}
    {#each orders as o (o.id)}
      <Button
        variant={o.id === order ? 'default' : 'ghost'}
        size="sm"
        onclick={() => {
          order = o.id;
          reset();
        }}
      >
        {o.label}
      </Button>
    {/each}
    <span class="spacer"></span>
    <Button variant="outline" size="sm" onclick={() => (i = Math.max(0, i - 1))} disabled={i === 0}>
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (i = Math.min(trace.length - 1, i + 1))}
      disabled={i >= trace.length - 1}
    >
      step →
    </Button>
    <Button variant="outline" size="sm" onclick={reset} disabled={i === 0}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      step <b>{Math.min(i, trace.length - 1) + 1}</b> of <b>{trace.length}</b> · visited
      <b>{step.out.length}</b> of <b>{total}</b> · peak {order === 'level' ? 'queue' : 'stack'}
      <b>{peak}</b>
    </span>
  {/snippet}

  {#snippet status()}{step.note}{/snippet}
</Figure>

<style>
  /* The two live rows under the tree: what has come out, and what is waiting. */
  .tl-rows {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin: 0.5rem 0 0;
  }

  .tl-row {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
  }

  .tl-key {
    flex: 0 0 4.2rem;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .tl-val {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--bright);
    /* Reserve the line so stepping does not shunt the controls up and down. */
    min-height: 1.2em;
  }
</style>
