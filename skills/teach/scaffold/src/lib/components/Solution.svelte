<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A spoiler. `kind="solution"` gets a green summary (worked answers),
   * anything else gets yellow (hints, asides, going-deeper detours).
   */
  let {
    summary,
    kind = 'solution',
    open = false,
    children
  }: { summary: string; kind?: 'solution' | 'hint'; open?: boolean; children: Snippet } = $props();
</script>

<details class={kind === 'solution' ? 'solution' : ''} {open}>
  <summary>{summary}</summary>
  <div class="d-body">
    {@render children()}
  </div>
</details>
