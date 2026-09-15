<script lang="ts">
  /**
   * The "which structure?" decision tree, as a real branching diagram.
   *
   * Rendered with nested lists and CSS connector rules rather than SVG: the
   * text wraps, the branches stay aligned, and it copies as text — which
   * matters, because this one is a reference sheet people actually use at a
   * keyboard.
   */
  export type Branch = {
    /** The question or condition on this branch. */
    q: string;
    /** The structure this branch lands on. */
    answer?: string;
    /** Extra clause after the answer. */
    note?: string;
    children?: Branch[];
  };

  let {
    start,
    branches,
    footer = ''
  }: { start: string; branches: Branch[]; footer?: string } = $props();
</script>

{#snippet level(items: Branch[])}
  <ul>
    {#each items as item, bi (bi)}
      <li>
        <span class="q">{item.q}</span>
        {#if item.answer}
          <span class="arrow">→</span><span class="answer">{item.answer}</span>
          {#if item.note}<span class="note">{item.note}</span>{/if}
        {/if}
        {#if item.children?.length}
          {@render level(item.children)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="flow">
  <p class="start">{start}</p>
  {@render level(branches)}
  {#if footer}<p class="footer">{@html footer}</p>{/if}
</div>

<style>
  .flow {
    margin: 1.6rem 0;
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    background: var(--surface);
    padding: 1.1rem 1.4rem;
    font-size: 0.95rem;
  }

  .start {
    margin: 0 0 0.75rem;
    font-family: var(--mono);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cyan);
  }

  .flow :global(ul) {
    list-style: none;
    margin: 0;
    padding: 0 0 0 1.1rem;
  }

  .flow > :global(ul) {
    padding-left: 0.2rem;
  }

  /* The connector: a vertical spine per level, with an elbow into each item. */
  .flow :global(li) {
    position: relative;
    margin: 0;
    padding: 0.28rem 0 0.28rem 1.15rem;
  }

  .flow :global(li)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-left: 1px solid var(--border);
  }

  .flow :global(li:last-child)::before {
    bottom: auto;
    height: 1.05rem;
  }

  .flow :global(li)::after {
    content: '';
    position: absolute;
    left: 0;
    top: 1.05rem;
    width: 0.8rem;
    border-top: 1px solid var(--border);
  }

  .q {
    color: var(--text);
  }

  .arrow {
    color: var(--muted);
    margin: 0 0.4rem;
  }

  .answer {
    font-family: var(--mono);
    font-size: 0.85em;
    font-weight: 700;
    color: var(--green);
    letter-spacing: 0.02em;
  }

  .note {
    color: var(--muted);
    font-size: 0.88em;
    margin-left: 0.4rem;
  }

  .footer {
    margin: 1rem 0 0;
    padding-top: 0.8rem;
    border-top: 1px dashed var(--border-soft);
    color: var(--muted);
    font-size: 0.9rem;
  }
</style>
