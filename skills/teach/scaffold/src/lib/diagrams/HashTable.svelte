<script lang="ts">
  import Figure from './Figure.svelte';
  import { arrowHead, monoWidth, toneClass, toneText, type Tone } from './geom';

  /**
   * A bucket array with its chains: the picture of separate chaining.
   *
   * `buckets[i]` is the chain in bucket i — an empty array is an empty bucket,
   * two entries is a collision. Chains are drawn as real linked boxes so the
   * cost of a long chain is visible rather than asserted.
   */
  type Entry = { k: string; v?: string | number; tone?: Tone };
  type Bucket = { entries: Entry[]; note?: string; tone?: Tone };

  let {
    buckets,
    /** Row height. */
    rh = 34,
    entryGap = 26,
    title = '',
    caption = '',
    minWidth = '',
    plain = false
  }: {
    buckets: Bucket[];
    rh?: number;
    entryGap?: number;
    title?: string;
    caption?: string;
    minWidth?: string;
    plain?: boolean;
  } = $props();

  const PAD = 10;
  const IDX_W = 30;
  const BUCKET_X = PAD + IDX_W + 8;
  const BUCKET_W = 16;
  const CHAIN_X = BUCKET_X + BUCKET_W + 30;
  const EH = 26;

  const text = (e: Entry) => (e.v === undefined ? `"${e.k}"` : `"${e.k}" : ${e.v}`);
  const entryW = (e: Entry) => monoWidth(text(e), 12) + 22;

  /** x offsets of every entry in a chain, laid out left to right. */
  function offsets(entries: Entry[]) {
    const out: number[] = [];
    let x = CHAIN_X;
    for (const e of entries) {
      out.push(x);
      x += entryW(e) + entryGap;
    }
    return out;
  }

  const rowY = (i: number) => PAD + 14 + i * rh;
  const height = $derived(PAD * 2 + 14 + buckets.length * rh);

  const width = $derived.by(() => {
    let max = CHAIN_X + 120;
    buckets.forEach((b) => {
      const os = offsets(b.entries);
      const last = os.at(-1);
      const end = last === undefined ? CHAIN_X : last + entryW(b.entries.at(-1)!) + 16;
      max = Math.max(max, end);
      if (b.note) max = Math.max(max, end + monoWidth(`← ${b.note}`, 11) + 12);
    });
    return max + PAD;
  });
</script>

<Figure {title} {caption} {minWidth} {plain}>
  <svg
    class="dg"
    viewBox="0 0 {width} {height}"
    {width}
    {height}
    role="img"
    aria-label={title || caption}
  >
    <text class="label" x={PAD} y={PAD + 4}>bucket</text>

    {#each buckets as bucket, i (i)}
      {@const y = rowY(i)}
      {@const cy = y + rh / 2 - 3}
      <text class="label strong" x={PAD + IDX_W - 6} y={cy + 4} text-anchor="end">{i}</text>
      <rect
        class={toneClass('box', bucket.tone)}
        x={BUCKET_X}
        y={cy - 11}
        width={BUCKET_W}
        height={22}
        rx="3"
      />

      {#if bucket.entries.length === 0}
        <text class="label" x={CHAIN_X} y={cy + 4}>(empty)</text>
      {:else}
        {@const os = offsets(bucket.entries)}
        <line
          class="arrow"
          x1={BUCKET_X + BUCKET_W + 4}
          y1={cy}
          x2={os[0] - 5}
          y2={cy}
          marker-end={arrowHead('plain')}
        />
        {#each bucket.entries as entry, j (j)}
          <rect
            class={toneClass('box', entry.tone)}
            x={os[j]}
            y={cy - EH / 2}
            width={entryW(entry)}
            height={EH}
            rx="4"
          />
          <text
            class="val {toneText(entry.tone)}"
            x={os[j] + entryW(entry) / 2}
            y={cy + 4}
            text-anchor="middle"
            font-size="12">{text(entry)}</text
          >
          {#if j < bucket.entries.length - 1}
            <line
              class="arrow"
              x1={os[j] + entryW(entry) + 4}
              y1={cy}
              x2={os[j + 1] - 5}
              y2={cy}
              marker-end={arrowHead('plain')}
            />
          {/if}
        {/each}
        {#if bucket.note}
          {@const endX = os.at(-1)! + entryW(bucket.entries.at(-1)!) + 16}
          <text class="label strong yellow-t" x={endX} y={cy + 4}>← {bucket.note}</text>
        {/if}
      {/if}
    {/each}
  </svg>
</Figure>
