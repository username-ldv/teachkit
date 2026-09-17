<script lang="ts">
  import Figure from './Figure.svelte';
  import BinaryTree, { type TNode } from './BinaryTree.svelte';
  import { Button } from '$lib/components/ui/button';

  /**
   * Insert the SAME keys in different orders and watch the shape change.
   *
   * This is the figure the balance section is about, and the movement is the
   * whole argument: nothing about the data changes between the presets, only
   * the order they arrive in, and the height goes from 3 to 9. A static
   * before/after pair would show the two endpoints; stepping shows that every
   * sorted insert lands on the same side, which is *why*.
   *
   * The height readout is the real height of the tree on screen, next to the
   * best height achievable for that many nodes, so "how bad is this?" is a
   * number you can read rather than a shape you have to judge.
   */
  let {
    title = '',
    caption = '',
    plain = false
  }: { title?: string; caption?: string; plain?: boolean } = $props();

  const presets: { label: string; keys: number[]; note: string }[] = [
    { label: 'shuffled', keys: [50, 30, 70, 20, 40, 60, 80, 35, 65, 10], note: 'a lucky order' },
    { label: 'sorted', keys: [10, 20, 30, 35, 40, 50, 60, 65, 70, 80], note: 'every key is the new maximum' },
    { label: 'reversed', keys: [80, 70, 65, 60, 50, 40, 35, 30, 20, 10], note: 'every key is the new minimum' },
    { label: 'zig-zag', keys: [50, 10, 80, 20, 70, 30, 65, 35, 60, 40], note: 'alternating extremes' }
  ];

  let which = $state(0);
  let n = $state(1);

  const keys = $derived(presets[which].keys);
  const shown = $derived(keys.slice(0, n));

  /** The key inserted at this step, and the path its insert walked. */
  const inserted = $derived(shown[shown.length - 1]);

  type Built = { root: TNode | null; height: number; path: number[] };

  /**
   * Rebuild from scratch each step. n is at most 10 here, so this is free, and
   * it keeps the figure a pure function of (preset, n) — no mutable tree to
   * get out of sync with the buttons.
   */
  const built = $derived.by((): Built => {
    type Raw = { v: number; left: Raw | null; right: Raw | null };
    let root: Raw | null = null;
    let path: number[] = [];

    for (const k of shown) {
      const node: Raw = { v: k, left: null, right: null };
      if (!root) {
        root = node;
        path = [k];
        continue;
      }
      const walked: number[] = [];
      let cur = root;
      for (;;) {
        walked.push(cur.v);
        if (k < cur.v) {
          if (!cur.left) {
            cur.left = node;
            break;
          }
          cur = cur.left;
        } else {
          if (!cur.right) {
            cur.right = node;
            break;
          }
          cur = cur.right;
        }
      }
      walked.push(k);
      path = walked;
    }

    const onPath = new Set(path);
    const height = (r: Raw | null): number => (r ? 1 + Math.max(height(r.left), height(r.right)) : 0);

    const decorate = (r: Raw | null): TNode | null => {
      if (!r) return null;
      const isNew = r.v === inserted;
      return {
        v: r.v,
        tone: isNew ? 'green' : onPath.has(r.v) ? 'accent' : 'plain',
        edge: onPath.has(r.v) ? 'accent' : undefined,
        left: decorate(r.left),
        right: decorate(r.right)
      };
    };

    return { root: decorate(root), height: height(root) - 1, path };
  });

  /** Fewest edges any binary tree with this many nodes can have as its height. */
  const best = $derived(Math.ceil(Math.log2(shown.length + 1)) - 1);

  // Named `note`, not `status`: inside {#snippet status()} the snippet
  // shadows a same-named variable, and Svelte stringifies the snippet.
  const note = $derived.by(() => {
    if (built.path.length === 1) return `insert ${inserted} — the tree was empty, so it becomes the root`;
    const walked = built.path.slice(0, -1);
    const turns = walked
      .map((v, i) => {
        const next = built.path[i + 1];
        return `${next < v ? 'left' : 'right'} at ${v}`;
      })
      .join(', ');
    return `insert ${inserted} — ${turns}, then attach. ${walked.length} comparison${walked.length === 1 ? '' : 's'}.`;
  });
</script>

<Figure {title} {caption} {plain} statusLabel="this insert" minWidth="36rem" pinControls>
  <BinaryTree root={built.root} bare />

  {#snippet controls()}
    {#each presets as p, i (p.label)}
      <Button
        variant={i === which ? 'default' : 'ghost'}
        size="sm"
        onclick={() => {
          which = i;
          n = 1;
        }}
      >
        {p.label}
      </Button>
    {/each}
    <span class="spacer"></span>
    <Button variant="outline" size="sm" onclick={() => (n = Math.max(1, n - 1))} disabled={n === 1}>
      ← back
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => (n = Math.min(keys.length, n + 1))}
      disabled={n >= keys.length}
    >
      insert →
    </Button>
    <Button variant="outline" size="sm" onclick={() => (n = keys.length)} disabled={n >= keys.length}>
      all
    </Button>
    <span class="spacer"></span>
    <span class="readout">
      nodes <b>{shown.length}</b> of <b>{keys.length}</b> · height <b>{built.height}</b> · best possible
      <b>{best}</b>
    </span>
  {/snippet}

  {#snippet status()}{note}{/snippet}
</Figure>
