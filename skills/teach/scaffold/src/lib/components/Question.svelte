<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * One retrieval-practice question.
   *
   * Wrong answers are struck through and stay visible; the learner retries
   * until correct, and the explanation only appears on success. That is
   * deliberate — the effort is the point, and an explanation shown too early
   * turns recall into reading.
   */
  let {
    q,
    options,
    answer,
    explain
  }: { q: string; options: string[]; answer: number; explain?: Snippet } = $props();

  let done = $state(false);
  let ruledOut = $state<number[]>([]);
  let status = $state<'' | 'ok' | 'bad'>('');

  function choose(i: number) {
    if (done) return;
    if (i === answer) {
      done = true;
      status = 'ok';
    } else {
      ruledOut = [...ruledOut, i];
      status = 'bad';
    }
  }
</script>

<div class="q" class:done>
  <p class="q-text">{q}</p>
  <div class="opts">
    {#each options as option, i (i)}
      <button
        type="button"
        class="opt"
        class:correct={done && i === answer}
        class:wrong={ruledOut.includes(i)}
        disabled={done || ruledOut.includes(i)}
        onclick={() => choose(i)}
      >
        {option}
      </button>
    {/each}
  </div>
  {#if status}
    <p class="q-status {status}">
      {status === 'ok' ? '✓ Correct' : '✗ Not quite — try again'}
    </p>
  {/if}
  {#if explain}
    <div class="q-explain" class:show={done}>{@render explain()}</div>
  {/if}
</div>
