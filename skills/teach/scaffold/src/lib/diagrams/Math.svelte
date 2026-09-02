<script lang="ts">
  import katex from 'katex';

  /**
   * TeX rendered by KaTeX. Runs during prerender as well as in the browser,
   * so the maths is in the served HTML rather than appearing after hydration.
   *
   *   <Math tex={'\\alpha = n / m'} />
   *   <Math tex={'\\sum_{i=0}^{k} 2^i = 2^{k+1} - 1'} display />
   *
   * NOTE the doubled backslashes and the braces: TeX goes into a JS string, so
   * `'\alpha'` would be read as an escape sequence, and a plain HTML attribute
   * would have its `{` parsed by Svelte. `build/fix-tex.py` repairs a file that
   * forgot the first rule.
   */
  let {
    tex,
    display = false,
    class: className = ''
  }: { tex: string; display?: boolean; class?: string } = $props();

  const html = $derived(
    katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html'
    })
  );
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- KaTeX output -->
<span class="tex {className}" class:display>{@html html}</span>

<style>
  .tex :global(.katex) {
    font-size: 1.02em;
  }

  .display {
    display: block;
    margin: 0.4rem 0;
  }
</style>
