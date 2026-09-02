<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import CellRow, { type Cell } from './CellRow.svelte';
  import { arrowHead, onCircle } from './geom';
  import { Button } from '$lib/components/ui/button';

  /**
   * A ring buffer you can actually drive.
   *
   * Both views are of the same state: the physical array (where the wrap is
   * visible as an index discontinuity) and the same array bent into a circle
   * (where the wrap disappears and the window is just an arc). Enqueue past
   * the end and the window wraps in front of you — which is the one thing the
   * static picture of a ring buffer can never show.
   *
   * `head` and `size` are the stored state, exactly as in the lesson's
   * implementation; `tail` is derived, never stored.
   */
  let {
    capacity = 8,
    initialHead = 2,
    initialItems = ['C', 'D', 'E', 'F'],
    /** Values handed out by successive enqueues. */
    supply = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
    title = '',
    caption = '',
    plain = false
  }: {
    capacity?: number;
    initialHead?: number;
    initialItems?: string[];
    supply?: string[];
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  // The whole ring is seeded from the props once, then driven by the
  // buttons — untrack says that is deliberate, not an oversight.
  const slots = $state<(string | null)[]>(
    untrack(() =>
      Array.from({ length: capacity }, (_, i) => {
        const off = (i - initialHead + capacity) % capacity;
        return off < initialItems.length ? initialItems[off] : null;
      })
    )
  );

  let head = $state(untrack(() => initialHead));
  let size = $state(untrack(() => initialItems.length));
  let supplied = $state(0);
  let lastAction = $state('');

  const tail = $derived((head + size) % capacity);
  const full = $derived(size === capacity);
  const empty = $derived(size === 0);

  /** The queue in logical order, front first. */
  const reading = $derived(
    Array.from({ length: size }, (_, i) => slots[(head + i) % capacity] ?? '·').join(' ')
  );

  function enqueue() {
    if (full) return;
    const v = supply[supplied % supply.length];
    supplied += 1;
    const at = tail;
    slots[at] = v;
    size += 1;
    lastAction = `enqueue ${v} → slot (head + size) % ${capacity} = ${at}`;
  }

  function dequeue() {
    if (empty) return;
    const v = slots[head];
    // Clearing the slot is the lesson's point, not tidiness: a live backing
    // array keeps whatever its slots still reference.
    slots[head] = null;
    head = (head + 1) % capacity;
    size -= 1;
    lastAction = `dequeue → ${v}, head moves to ${head}`;
  }

  function reset() {
    for (let i = 0; i < capacity; i++) {
      const off = (i - initialHead + capacity) % capacity;
      slots[i] = off < initialItems.length ? initialItems[off] : null;
    }
    head = initialHead;
    size = initialItems.length;
    supplied = 0;
    lastAction = '';
  }

  /** Is slot i inside the live window? */
  const live = (i: number) => {
    const off = (i - head + capacity) % capacity;
    return off < size;
  };

  const cells = $derived<Cell[]>(
    slots.map((v, i) => ({
      v: v ?? '',
      top: String(i),
      empty: !live(i),
      tone: live(i) ? (i === head ? 'cyan' : 'green') : undefined
    }))
  );

  // --- layout ---
  const W = 620;
  const CW = 52;
  const CH = 38;
  const PAD = 10;
  const ROW_Y = 34;
  const R = 74;
  /** Outer index ring sits R + 28 out, so the circle needs that much clearance. */
  const RING_OUT = R + 30;
  /** Below the row: head marker, then the tail marker on its own line. */
  const MARKERS_H = 78;
  const CIRCLE_CY = ROW_Y + CH + MARKERS_H + RING_OUT;
  const H = CIRCLE_CY + RING_OUT + 16;
  const gridW = $derived(capacity * CW);
  const cxCircle = W / 2;
  /** Centre x of physical slot i in the linear view. */
  const gx = (i: number) => (W - gridW) / 2 + i * CW + CW / 2;
</script>

<Figure {title} {caption} {plain} minWidth="32rem">
  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label={title}>
    <text class="label" x={PAD} y={ROW_Y - 22}>index:</text>
    <CellRow {cells} x={(W - gridW) / 2} y={ROW_Y} w={CW} h={CH} />

    <!-- head / tail markers on the physical row -->
    <line
      class="arrow cyan"
      x1={gx(head)}
      y1={ROW_Y + CH + 26}
      x2={gx(head)}
      y2={ROW_Y + CH + 4}
      marker-end={arrowHead('cyan')}
    />
    <text class="label cyan-t" x={gx(head)} y={ROW_Y + CH + 38} text-anchor="middle">
      head = {head}
    </text>
    {#if !full}
      <line
        class="arrow yellow"
        x1={gx(tail)}
        y1={ROW_Y + CH + 54}
        x2={gx(tail)}
        y2={ROW_Y + CH + 4}
        marker-end={arrowHead('yellow')}
      />
      <text class="label yellow-t" x={gx(tail)} y={ROW_Y + CH + 66} text-anchor="middle">
        tail = {tail} (next free)
      </text>
    {/if}

    <!-- the same array bent into a circle -->
    <circle
      cx={cxCircle}
      cy={CIRCLE_CY}
      r={R}
      fill="none"
      stroke="var(--border-soft)"
      stroke-dasharray="3 4"
    />
    {#each slots as slot, i (i)}
      {@const p = onCircle(cxCircle, CIRCLE_CY, R, i / capacity)}
      <circle
        cx={p.x}
        cy={p.y}
        r="15"
        class={live(i) ? (i === head ? 'box cyan' : 'box green') : 'box empty'}
      />
      <text class="val" x={p.x} y={p.y + 5} text-anchor="middle" font-size="12">
        {slot ?? ''}
      </text>
      {@const q = onCircle(cxCircle, CIRCLE_CY, R + 28, i / capacity)}
      <text class="label" x={q.x} y={q.y + 4} text-anchor="middle">{i}</text>
    {/each}
    <text class="label" x={cxCircle} y={CIRCLE_CY - 4} text-anchor="middle">size</text>
    <text class="val" x={cxCircle} y={CIRCLE_CY + 16} text-anchor="middle">{size}/{capacity}</text>
  </svg>

  {#snippet controls()}
    <Button variant="outline" size="sm" onclick={enqueue} disabled={full}>enqueue</Button>
    <Button variant="outline" size="sm" onclick={dequeue} disabled={empty}>dequeue</Button>
    <Button variant="ghost" size="sm" onclick={reset}>reset</Button>
    <span class="spacer"></span>
    <span class="readout">
      reads <b>{reading || '(empty)'}</b>
      {#if full}· <b>FULL</b>{/if}
    </span>
  {/snippet}

  {#snippet captionSnippet()}
    <span>{@html caption}</span>
    {#if lastAction}<br /><code>{lastAction}</code>{/if}
  {/snippet}
</Figure>
