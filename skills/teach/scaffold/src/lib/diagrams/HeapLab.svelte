<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import BinaryTree, { type TNode } from './BinaryTree.svelte';
  import CellRow, { CELL_H, type Cell } from './CellRow.svelte';
  import { Button } from '$lib/components/ui/button';

  /**
   * A min-heap as both things it is at once: a tree you reason about and an
   * array you actually store.
   *
   * The two views are driven by ONE array, so they cannot disagree — which is
   * the point being taught. Push and pop walk a single root-to-leaf or
   * leaf-to-root path, highlighted in both views simultaneously, so "O(log n)
   * because it is one path down a complete tree" is a thing you watch rather
   * than a bound you are given.
   *
   * The comparison counter reads "k of m" for the operation in progress, per
   * the rule that a bare running count is uncomparable between runs.
   */
  let {
    initial = [3, 8, 5, 21, 10, 17, 9],
    title = '',
    caption = '',
    plain = false
  }: { initial?: number[]; title?: string; caption?: string; plain?: boolean } = $props();

  type Frame = {
    heap: number[];
    /** Indexes on the sift path so far. */
    path: number[];
    /** The index currently being moved. */
    cursor: number | null;
    comps: number;
    note: string;
  };

  /** The frames of one push, from "appended at the end" to "settled". */
  function pushFrames(start: number[], v: number): Frame[] {
    const h = [...start];
    const frames: Frame[] = [];
    h.push(v);
    let i = h.length - 1;
    const path = [i];
    let comps = 0;
    frames.push({
      heap: [...h],
      path: [...path],
      cursor: i,
      comps,
      note: `append ${v} at index ${i} — the only slot that keeps the tree complete`
    });
    while (i > 0) {
      const p = (i - 1) >> 1;
      comps++;
      if (h[p] <= h[i]) {
        frames.push({
          heap: [...h],
          path: [...path],
          cursor: i,
          comps,
          note: `parent ${h[p]} ≤ ${h[i]} — the heap property holds, so ${v} stops here`
        });
        return frames;
      }
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
      path.push(i);
      frames.push({
        heap: [...h],
        path: [...path],
        cursor: i,
        comps,
        note: `parent was larger — swap up to index ${i}`
      });
    }
    frames.push({
      heap: [...h],
      path: [...path],
      cursor: 0,
      comps,
      note: `${v} reached the root — it is the new minimum`
    });
    return frames;
  }

  /** The frames of one pop: take the root, move the last element up, sift down. */
  function popFrames(start: number[]): Frame[] {
    const h = [...start];
    const frames: Frame[] = [];
    if (h.length === 0) return [{ heap: [], path: [], cursor: null, comps: 0, note: 'the heap is empty' }];
    const min = h[0];
    const last = h.pop()!;
    if (h.length === 0) {
      return [{ heap: [], path: [], cursor: null, comps: 0, note: `removed ${min}; the heap is now empty` }];
    }
    h[0] = last;
    let i = 0;
    const path = [0];
    let comps = 0;
    frames.push({
      heap: [...h],
      path: [...path],
      cursor: 0,
      comps,
      note: `remove the root ${min}, move the last element ${last} into its place`
    });
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let small = i;
      if (l < h.length) {
        comps++;
        if (h[l] < h[small]) small = l;
      }
      if (r < h.length) {
        comps++;
        if (h[r] < h[small]) small = r;
      }
      if (small === i) {
        frames.push({
          heap: [...h],
          path: [...path],
          cursor: i,
          comps,
          note: `${h[i]} is no larger than its children — it stops at index ${i}`
        });
        return frames;
      }
      [h[i], h[small]] = [h[small], h[i]];
      i = small;
      path.push(i);
      frames.push({
        heap: [...h],
        path: [...path],
        cursor: i,
        comps,
        note: `swap down with the SMALLER child, to index ${i}`
      });
    }
  }

  // Seeded from the prop once; the buttons own it after that — the same
  // pattern as RecursionTree and BinarySearchLab.
  let heap = $state<number[]>(untrack(() => [...initial]));
  let frames = $state<Frame[]>([]);
  let f = $state(0);
  let nextValue = $state(4);

  const live = $derived(frames.length ? frames[Math.min(f, frames.length - 1)] : null);
  const shown = $derived(live ? live.heap : heap);
  const pathSet = $derived(new Set(live ? live.path : []));
  const totalComps = $derived(frames.length ? frames[frames.length - 1].comps : 0);

  function start(next: Frame[]) {
    frames = next;
    f = 0;
  }

  /** Settle the animation into the real heap, so the next operation starts clean. */
  function commit() {
    if (frames.length) {
      heap = [...frames[frames.length - 1].heap];
      frames = [];
      f = 0;
    }
  }

  function doPush() {
    commit();
    start(pushFrames(heap, nextValue));
    nextValue = ((nextValue + 7) % 24) + 1;
  }

  function doPop() {
    commit();
    start(popFrames(heap));
  }

  function reset() {
    heap = [...initial];
    frames = [];
    f = 0;
    nextValue = 4;
  }

  const cells = $derived<Cell[]>(
    shown.map((v, k) => ({
      v,
      top: String(k),
      tone: live && live.cursor === k ? 'green' : pathSet.has(k) ? 'accent' : 'plain'
    }))
  );

  const tree = $derived.by((): TNode | null => {
    const build = (k: number): TNode | null => {
      if (k >= shown.length) return null;
      return {
        v: shown[k],
        tone: live && live.cursor === k ? 'green' : pathSet.has(k) ? 'accent' : 'plain',
        edge: pathSet.has(k) ? 'accent' : undefined,
        left: build(2 * k + 1),
        right: build(2 * k + 2)
      };
    };
    return build(0);
  });

  const W = $derived(20 + shown.length * 46);
  const H = CELL_H + 34;
</script>

<Figure {title} {caption} {plain} statusLabel="this step" minWidth="34rem" pinControls>
  <BinaryTree root={tree} layout="level" showIndex bare />

  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label="the same heap, as an array">
    <CellRow {cells} x={10} y={26} w={46} h={CELL_H} topLabel="index" gutter={0} />
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={doPush}>push {nextValue}</Button>
    <Button variant="outline" size="sm" onclick={doPop} disabled={shown.length === 0}>pop min</Button>
    <span class="spacer"></span>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (f = Math.max(0, f - 1))}
      disabled={!frames.length || f === 0}
    >
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (f = Math.min(frames.length - 1, f + 1))}
      disabled={!frames.length || f >= frames.length - 1}
    >
      step →
    </Button>
    <Button variant="ghost" size="sm" onclick={reset}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      size <b>{shown.length}</b> · comparisons <b>{live ? live.comps : 0}</b> of
      <b>{totalComps}</b>
    </span>
  {/snippet}

  {#snippet status()}{live ? live.note : 'press push or pop min — then step through the sift'}{/snippet}
</Figure>
