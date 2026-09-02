<script lang="ts">
  import Math from './Math.svelte';

  /**
   * An aligned chain of reasoning: expression, relation, expression, and the
   * reason the step is allowed.
   *
   * This is the shape the ASCII blocks were imitating with spaces. Aligning on
   * the relation symbol is the whole point — you read straight down the `=`
   * column and see one quantity being rewritten, not five unrelated lines.
   * A step with an empty `lhs` continues the previous left-hand side.
   */
  type Step = {
    /** TeX. Empty means "same as the line above". */
    lhs?: string;
    /** TeX for the relation: `=`, `<`, `\le`, `\Rightarrow`, `\iff`. */
    rel?: string;
    rhs: string;
    /** Plain prose, rendered muted to the right. */
    why?: string;
  };

  let {
    steps,
    title = '',
    caption = '',
    /** A closing line, emphasised — the conclusion the chain was built for. */
    conclusion = ''
  }: { steps: Step[]; title?: string; caption?: string; conclusion?: string } = $props();
</script>

<div class="derivation">
  {#if title}<span class="figure-title">{title}</span>{/if}
  <div class="grid">
    {#each steps as step, i (i)}
      <span class="lhs">{#if step.lhs}<Math tex={step.lhs} />{/if}</span>
      <span class="rel">{#if step.rel}<Math tex={step.rel} />{/if}</span>
      <span class="rhs"><Math tex={step.rhs} /></span>
      <span class="why">{step.why ?? ''}</span>
    {/each}
  </div>
  {#if conclusion}
    <p class="conclusion"><Math tex={conclusion} /></p>
  {/if}
  {#if caption}<p class="figure-caption">{@html caption}</p>{/if}
</div>

<style>
  .derivation {
    margin: 1.6rem 0;
    border: 1px solid var(--border-soft);
    border-left: 3px solid var(--purple);
    border-radius: 10px;
    background: var(--surface);
    padding: 1rem 1.25rem 0.9rem;
  }

  .grid {
    display: grid;
    grid-template-columns: auto auto auto 1fr;
    align-items: baseline;
    gap: 0.35rem 0.6rem;
    /* Wide algebra scrolls sideways; KaTeX's struts otherwise provoke a
       stray vertical scrollbar, so the y axis is pinned. */
    overflow: auto hidden;
    padding-bottom: 0.15rem;
  }

  .lhs {
    text-align: right;
  }

  .rel {
    text-align: center;
    color: var(--muted);
  }

  .rhs {
    text-align: left;
  }

  .why {
    color: var(--muted);
    font-size: 0.85rem;
    padding-left: 0.75rem;
  }

  .conclusion {
    margin: 0.9rem 0 0;
    padding-top: 0.7rem;
    border-top: 1px dashed var(--border-soft);
    color: var(--bright);
  }

  .figure-caption {
    margin-bottom: 0;
  }
</style>
