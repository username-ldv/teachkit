<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A citation of a real file in the learner's own codebase — the thing that
   * makes a lesson theirs rather than generic. Use it when the course is
   * grounded in an existing project.
   *
   * Line numbers drift: re-read the file before citing one, and prefer a
   * symbol name over a line when the symbol is stable.
   */
  let {
    path,
    line = '',
    children
  }: { path: string; line?: number | string; children: Snippet } = $props();
</script>

<div class="repo-ref">
  <span class="rr-path">{path}{line ? `:${line}` : ''}</span>
  {@render children()}
</div>
