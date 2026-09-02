<script lang="ts">
  import type { Tone } from './geom';

  /**
   * A step-by-step trace as a real table: one row per call, columns for the
   * state before and after and the decision taken.
   *
   * Several of the old ASCII "diagrams" were tables drawn with spaces. A table
   * that is a table gets alignment, zebra striping and selectable text for
   * free, and stays aligned when the reader's font does not match mine.
   */
  type Row = {
    cells: (string | number)[];
    tone?: Tone;
    /** A full-width comment line printed under this row. */
    note?: string;
  };

  let {
    columns,
    rows,
    title = '',
    caption = '',
    /** Column indexes to render monospaced (state, values, code). */
    mono = [] as number[]
  }: {
    columns: string[];
    rows: Row[];
    title?: string;
    caption?: string;
    mono?: number[];
  } = $props();

  const monoSet = $derived(new Set(mono));
</script>

<div class="trace">
  {#if title}<span class="figure-title">{title}</span>{/if}
  <table>
    <thead>
      <tr>
        <!-- Keyed by position: two columns may legitimately share a heading
             (a before/after pair of the same field, say). -->
        {#each columns as col, c (c)}
          <th class:mono={monoSet.has(c)}>{col}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, r (r)}
        <tr class={row.tone ?? ''}>
          {#each row.cells as cell, c (c)}
            <td class:mono={monoSet.has(c)}>{cell}</td>
          {/each}
        </tr>
        {#if row.note}
          <tr class="note-row">
            <td colspan={columns.length}>{row.note}</td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
  {#if caption}<p class="figure-caption">{@html caption}</p>{/if}
</div>

<style>
  .trace {
    margin: 1.6rem 0;
    overflow-x: auto;
  }

  table {
    margin: 0;
  }

  .mono {
    font-family: var(--mono);
    font-size: 0.85em;
    white-space: pre;
  }

  tr.green td:first-child {
    box-shadow: inset 2px 0 0 var(--green);
  }
  tr.red td:first-child {
    box-shadow: inset 2px 0 0 var(--red);
  }
  tr.yellow td:first-child {
    box-shadow: inset 2px 0 0 var(--yellow);
  }
  tr.accent td:first-child {
    box-shadow: inset 2px 0 0 var(--accent);
  }

  .note-row td {
    border-top: none;
    color: var(--muted);
    font-size: 0.85rem;
    padding-top: 0;
  }

  .figure-caption {
    margin-top: 0.6rem;
  }
</style>
