<script lang="ts">
  /**
   * One hidden SVG holding every arrowhead marker, rendered once by the root
   * layout. SVG markers take their colour from the marker's own paint rather
   * than the referencing path, so there is one marker per palette role; the
   * `url(#…)` references resolve across the whole document.
   */
  const tones = [
    ['muted', 'var(--muted)'],
    ['accent', 'var(--accent)'],
    ['green', 'var(--green)'],
    ['yellow', 'var(--yellow)'],
    ['red', 'var(--red)'],
    ['purple', 'var(--purple)'],
    ['cyan', 'var(--cyan)'],
    ['faint', 'var(--border)']
  ] as const;
</script>

<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
  <defs>
    {#each tones as [name, colour] (name)}
      <marker
        id="ah-{name}"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 9 5 L 0 9 z" fill={colour} />
      </marker>
      <marker
        id="at-{name}"
        viewBox="0 0 10 10"
        refX="1"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 10 1 L 1 5 L 10 9 z" fill={colour} />
      </marker>
      <marker
        id="dot-{name}"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="5"
        markerHeight="5"
      >
        <circle cx="5" cy="5" r="3.5" fill={colour} />
      </marker>
    {/each}
  </defs>
</svg>
