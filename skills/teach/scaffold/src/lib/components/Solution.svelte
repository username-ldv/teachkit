<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A spoiler. `kind="solution"` gets a green summary (worked answers),
   * `kind="approach"` a cyan one (the concise explanation of the method,
   * between the hint and the code — the review lessons' third tier), and
   * anything else yellow (hints, asides, going-deeper detours).
   */
  let {
    summary,
    kind = 'solution',
    open = false,
    children
  }: {
    summary: string;
    kind?: 'solution' | 'hint' | 'approach';
    open?: boolean;
    children: Snippet;
  } = $props();
</script>

<details class={kind === 'solution' ? 'solution' : kind === 'approach' ? 'approach' : ''} {open}>
  <summary>{summary}</summary>
  <div class="d-body">
    {@render children()}
  </div>
</details>
