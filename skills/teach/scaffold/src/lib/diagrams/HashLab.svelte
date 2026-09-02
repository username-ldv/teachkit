<script lang="ts">
  import { untrack } from 'svelte';
  import Figure from './Figure.svelte';
  import CellRow, { type Cell } from './CellRow.svelte';
  import { arrowHead } from './geom';

  /**
   * FNV-1a, running.
   *
   * Type a key and watch the hash being built one byte at a time — xor, then
   * multiply by the prime — and then watch `% capacity` pick a bucket. Change
   * the capacity and the bucket moves, which is the fact the resize section
   * depends on and the one people most often have to be shown twice.
   */
  let {
    initialKey = 'cat',
    capacities = [4, 8, 16, 32],
    initialCapacity = 8,
    title = '',
    caption = '',
    plain = false
  }: {
    initialKey?: string;
    capacities?: number[];
    initialCapacity?: number;
    title?: string;
    caption?: string;
    plain?: boolean;
  } = $props();

  const OFFSET = 2166136261;
  const PRIME = 16777619;

  // Seeded from the props once; the inputs own them after that.
  let key = $state(untrack(() => initialKey));
  let capacity = $state(untrack(() => initialCapacity));

  /** Each byte's xor and multiply, using the same 32-bit maths as the lesson's code. */
  const steps = $derived.by(() => {
    let h = OFFSET >>> 0;
    const rows: { ch: string; code: number; afterXor: number; afterMul: number }[] = [];
    for (const ch of key.slice(0, 12)) {
      const code = ch.charCodeAt(0);
      const afterXor = (h ^ code) >>> 0;
      const afterMul = Math.imul(afterXor, PRIME) >>> 0;
      rows.push({ ch, code, afterXor, afterMul });
      h = afterMul;
    }
    return rows;
  });

  const hash = $derived(steps.length ? steps[steps.length - 1].afterMul : OFFSET >>> 0);
  const bucket = $derived(hash % capacity);

  const cells = $derived<Cell[]>(
    Array.from({ length: capacity }, (_, i) => ({
      v: i === bucket ? key || '·' : '',
      top: String(i),
      empty: i !== bucket,
      tone: i === bucket ? 'accent' : undefined
    }))
  );

  const CW = $derived(Math.max(30, Math.min(54, 440 / capacity)));
  const W = 620;
  const ROW_Y = 26;
  const CH = 34;
  const H = ROW_Y + CH + 46;
  const gridW = $derived(capacity * CW);
  const gx = $derived(() => (W - gridW) / 2 + bucket * CW + CW / 2);
</script>

<Figure {title} {caption} {plain} minWidth="30rem">
  <div class="lab">
    <div class="inputs">
      <label>
        <span>key</span>
        <input bind:value={key} maxlength="12" spellcheck="false" autocomplete="off" />
      </label>
      <label>
        <span>capacity</span>
        <select bind:value={capacity}>
          {#each capacities as c (c)}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </label>
    </div>

    <table class="steps">
      <thead>
        <tr>
          <th>byte</th>
          <th>h ^ byte</th>
          <th>× 16777619</th>
        </tr>
      </thead>
      <tbody>
        <tr class="seed">
          <td colspan="2">h = 2166136261</td>
          <td>(the offset basis)</td>
        </tr>
        {#each steps as step (step.ch + step.afterMul)}
          <tr>
            <td>'{step.ch}' ({step.code})</td>
            <td>{step.afterXor}</td>
            <td>{step.afterMul}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <p class="result">
      hash(<b>{key || '""'}</b>) = <b>{hash}</b> &nbsp;·&nbsp; {hash} % {capacity} =
      <b class="bucket">{bucket}</b>
    </p>
  </div>

  <svg class="dg" viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label="bucket array">
    <CellRow {cells} x={(W - gridW) / 2} y={ROW_Y} w={CW} h={CH} />
    <line
      class="arrow accent"
      x1={gx()}
      y1={ROW_Y + CH + 26}
      x2={gx()}
      y2={ROW_Y + CH + 4}
      marker-end={arrowHead('accent')}
    />
    <text class="label accent-t" x={gx()} y={ROW_Y + CH + 38} text-anchor="middle">
      bucket {bucket}
    </text>
  </svg>
</Figure>

<style>
  .lab {
    margin-bottom: 0.75rem;
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .inputs label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--mono);
    font-size: 0.8rem;
    color: var(--muted);
  }

  input,
  select {
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--bright);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
  }

  input {
    width: 8rem;
  }

  .steps {
    margin: 0;
    font-family: var(--mono);
    font-size: 0.78rem;
  }

  .steps th,
  .steps td {
    padding: 0.2rem 0.6rem;
  }

  .steps .seed td {
    color: var(--muted);
  }

  .result {
    margin: 0.75rem 0 0;
    font-family: var(--mono);
    font-size: 0.82rem;
    color: var(--muted);
  }

  .result b {
    color: var(--bright);
    font-weight: 600;
  }

  .result .bucket {
    color: var(--accent);
  }
</style>
