<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    expected,
    tolerance = 0.005,
    step = 'any',
    hint,
    correct,
    children
  }: {
    expected: number;
    tolerance?: number;
    step?: string;
    hint: string;
    correct: string;
    children: Snippet;
  } = $props();

  let raw = $state('');
  const answered = $derived(raw !== '');
  const isCorrect = $derived(answered && Math.abs(Number(raw) - expected) <= tolerance);
</script>

<div class="numeric-question">
  <div class="prompt">{@render children()}</div>
  <label>
    <span class="sr-only">Your numeric answer</span>
    <input type="number" inputmode="decimal" {step} bind:value={raw} />
  </label>
  <p class:correct={isCorrect} class:wrong={answered && !isCorrect} class="feedback" aria-live="polite">
    {answered ? (isCorrect ? correct : hint) : ''}
  </p>
</div>

<style>
  .numeric-question :global(.prompt > p:last-child) {
    margin-bottom: 0.75rem;
  }

  input {
    width: min(100%, 14rem);
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--code-bg);
    color: var(--text);
    font: inherit;
  }

  .feedback {
    min-height: 1.75rem;
    margin: 0.6rem 0 0;
    font-weight: 700;
  }

  .correct {
    color: var(--green);
  }

  .wrong {
    color: var(--red);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
