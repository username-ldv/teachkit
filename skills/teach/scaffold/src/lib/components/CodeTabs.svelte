<script lang="ts">
  import { Tabs } from 'bits-ui';
  import { lang as pref } from '$lib/lang.svelte';

  type Pane = { label: string; lang: string; html: string; title?: string };

  /**
   * The Go / TypeScript toggle. `panes` is assembled at build time by
   * tools/shiki-preprocess.js from the <CodeBlock> children of <CodeTabs>.
   *
   * The chosen language is global (see $lib/lang.svelte.ts) so every block on
   * every page follows along, and the choice survives a reload. Built on
   * bits-ui's Tabs primitive for roving focus and arrow-key navigation;
   * the styling is the course's own, not shadcn's app-chrome look.
   */
  let { panes, title = '' }: { panes: Pane[]; title?: string } = $props();

  // If the remembered language isn't one of this group's panes (a Go-only
  // snippet, say), fall back to the first pane rather than showing nothing.
  const value = $derived(
    panes.some((p) => p.label === pref.current) ? pref.current : panes[0].label
  );
</script>

<div class="code-tabs">
  {#if title}<span class="code-title">{title}</span>{/if}
  <Tabs.Root {value} onValueChange={(v) => pref.set(v)}>
    <Tabs.List class="tab-bar">
      {#each panes as pane (pane.label)}
        <Tabs.Trigger value={pane.label} class="tab-btn">{pane.label}</Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each panes as pane (pane.label)}
      <!-- Every pane stays in the DOM (bits-ui only toggles `hidden`), so
           print.css can unhide them all and label each one. -->
      <Tabs.Content value={pane.label} class="pane" data-lang={pane.label}>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time Shiki output -->
        {@html pane.html}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
