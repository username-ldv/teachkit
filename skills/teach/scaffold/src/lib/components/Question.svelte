<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  /**
   * One retrieval-practice question.
   *
   * Wrong answers are struck through and stay visible; the learner retries
   * until correct, and the explanation only appears on success. That is
   * deliberate — the effort is the point, and an explanation shown too early
   * turns recall into reading.
   *
   * **The options are reshuffled on every page load.** Drafting a question
   * means writing the true statement first and inventing distractors around
   * it, so `answer={0}` is where every question lands and nothing later moves
   * it; one course shipped 52 of 52 that way before the learner noticed and
   * said so. Position is not something an author should have to think about,
   * so the component owns it.
   *
   * `answer` is therefore an **identity, not a position**: it indexes the
   * array as authored, and that index follows its option wherever the shuffle
   * puts it. Nothing in a lesson page changes.
   *
   * The server renders the authored order, so prerendered HTML and hydration
   * agree; the shuffle happens in `onMount`, after hydration, and moves keyed
   * DOM nodes rather than rewriting them.
   *
   * Pass `shuffle={false}` for the rare question whose options must stay in
   * the order they were written — a sequence the learner is meant to read in
   * order, or an "all of the above". If an *explanation* names an option by
   * where it sits ("the third option"), that is not a reason to freeze the
   * question: name the option by what it says instead.
   */
  let {
    q,
    options,
    answer,
    shuffle = true,
    explain
  }: {
    q: string;
    options: string[];
    answer: number;
    shuffle?: boolean;
    explain?: Snippet;
  } = $props();

  /**
   * Authored indices, in display order — each value is an option's identity.
   * Null until the shuffle runs, which is what keeps the server's render and
   * the client's first render identical.
   */
  let order = $state<number[] | null>(null);
  const shown = $derived(order ?? options.map((_, i) => i));

  onMount(() => {
    if (shuffle && options.length > 1) order = shuffled(shown);
  });

  function shuffled(xs: number[]) {
    const out = [...xs];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  let done = $state(false);
  let ruledOut = $state<number[]>([]);
  let status = $state<'' | 'ok' | 'bad'>('');

  function choose(id: number) {
    if (done) return;
    if (id === answer) {
      done = true;
      status = 'ok';
    } else {
      ruledOut = [...ruledOut, id];
      status = 'bad';
    }
  }
</script>

<div class="q" class:done>
  <p class="q-text">{q}</p>
  <div class="opts">
    {#each shown as id (id)}
      <button
        type="button"
        class="opt"
        class:correct={done && id === answer}
        class:wrong={ruledOut.includes(id)}
        disabled={done || ruledOut.includes(id)}
        onclick={() => choose(id)}
      >
        {options[id]}
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
