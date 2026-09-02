<script lang="ts" module>
  import type { Tone } from './geom';

  export type Field = {
    text: string;
    /** Column width. Defaults to an even share of the node width. */
    w?: number;
    /** Draw the outgoing-pointer dot in this compartment. */
    port?: boolean;
    dim?: boolean;
  };

  export type NodeSpec = {
    fields: Field[];
    tone?: Tone;
    ghost?: boolean;
    /** Small caption printed under the node. */
    note?: string;
  };

  export const NODE_H = 40;
</script>

<script lang="ts">
  import { toneClass } from './geom';

  /**
   * One list/tree node: a box divided into labelled compartments, e.g.
   * `[ Val 7 | Next ]`. Drawn into an existing <svg> at (x, y).
   *
   * A compartment marked `port` gets a dot — the place an outgoing arrow
   * leaves from, which is what makes "the pointer lives inside the node"
   * visible rather than implied.
   */
  let {
    node,
    x,
    y,
    w = 120,
    h = NODE_H
  }: { node: NodeSpec; x: number; y: number; w?: number; h?: number } = $props();

  const widths = $derived.by(() => {
    const given = node.fields.map((f) => f.w ?? 0);
    const fixed = given.reduce((a, b) => a + b, 0);
    const flexCount = given.filter((g) => g === 0).length;
    const flex = flexCount ? (w - fixed) / flexCount : 0;
    return given.map((g) => (g === 0 ? flex : g));
  });

  const offsets = $derived(
    widths.reduce<number[]>((acc, cur, i) => [...acc, (acc[i - 1] ?? 0) + (i ? widths[i - 1] : 0)], [])
  );
</script>

<g class={node.ghost ? 'ghost' : ''} opacity={node.ghost ? 0.4 : 1}>
  <rect class={toneClass('box', node.tone)} {x} {y} width={w} height={h} rx="5" />

  {#each node.fields as field, i (i)}
    {#if i > 0}
      <line
        class="rule"
        x1={x + offsets[i]}
        y1={y + 1}
        x2={x + offsets[i]}
        y2={y + h - 1}
        stroke="var(--border)"
      />
    {/if}
    <text
      class={field.dim ? 'label' : 'val'}
      x={x + offsets[i] + widths[i] / 2 - (field.port ? 5 : 0)}
      y={y + h / 2 + (field.dim ? 4 : 5)}
      text-anchor="middle"
      font-size={field.dim ? 11 : 13}>{field.text}</text
    >
    {#if field.port}
      <circle
        class="port"
        cx={x + offsets[i] + widths[i] - 9}
        cy={y + h / 2}
        r="3"
        fill="var(--muted)"
      />
    {/if}
  {/each}

  {#if node.note}
    <text class="label" x={x + w / 2} y={y + h + 15} text-anchor="middle">{node.note}</text>
  {/if}
</g>
