<script lang="ts">
  /**
   * A single highlighted snippet.
   *
   * `html` is produced at build time by tools/shiki-preprocess.js — authors
   * never pass it by hand. In a .svelte page you write:
   *
   *   <CodeBlock lang="go">
   *   func main() { ... }
   *   </CodeBlock>
   */
  let {
    html,
    lang = 'text',
    label = '',
    title = ''
  }: { html: string; lang?: string; label?: string; title?: string } = $props();
</script>

<div class="code-block" data-lang={label} data-lang-id={lang}>
  {#if title}<span class="code-title">{title}</span>{/if}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time Shiki output -->
  {@html html}
</div>
