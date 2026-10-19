<script lang="ts">
  import { tick } from 'svelte';
  import ArrowUpToLine from '@lucide/svelte/icons/arrow-up-to-line';
  import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
  import Dumbbell from '@lucide/svelte/icons/dumbbell';
  import TableOfContents from '@lucide/svelte/icons/table-of-contents';

  /**
   * The navigation rail: icon buttons fixed in the right-hand margin, beside
   * the text. Top of the lesson, a floating copy of "In this lesson",
   * the exercises, the end of the lesson.
   *
   * LessonToc renders it with its own items, so every lesson has the rail
   * without the page naming it, and the floating list cannot disagree with
   * the box. The list's button is a switch, and nothing else closes it:
   * the learner keeps it open while reading if they want to. Opening it does
   * not scroll the page, and the entry being read is marked as the page moves.
   *
   * Below 70rem there is no margin to stand in, so the rail lies flat in the
   * bottom-right corner. From 106rem the list and the labels open into the
   * margin, clear of the text, instead of over it.
   */
  let { items }: { items: string[] } = $props();

  /** The ids each entry links to, in order. */
  const targets = $derived(
    items.map((html) => [...html.matchAll(/href="#([^"]+)"/g)].map((m) => decodeURIComponent(m[1])))
  );
  const hasExercises = $derived(targets.some((ids) => ids.includes('exercises')));

  let open = $state(false);
  let current = $state(-1);
  let panel: HTMLElement | undefined = $state();

  /** The last entry whose section starts above the top third of the window. */
  function sectionInView(): number {
    const line = window.innerHeight / 3;
    let found = -1;
    targets.forEach((ids, i) => {
      const el = ids.length ? document.getElementById(ids[0]) : null;
      if (el && el.getBoundingClientRect().top <= line) found = i;
    });
    return found;
  }

  /**
   * Scroll the list, never the page, so the marked entry is in view: to the
   * middle when the list opens, and only if it has gone out of view after.
   */
  async function revealCurrent(always: boolean) {
    await tick();
    const li = panel?.querySelector<HTMLElement>('li.current');
    if (!panel || !li) return;
    const hidden = li.offsetTop < panel.scrollTop || li.offsetTop + li.offsetHeight > panel.scrollTop + panel.clientHeight;
    if (always || hidden) panel.scrollTop = li.offsetTop - (panel.clientHeight - li.offsetHeight) / 2;
  }

  function toggleContents() {
    open = !open;
    if (!open) return;
    current = sectionInView();
    revealCurrent(true);
  }

  const toStart = () => window.scrollTo({ top: 0 });
  const toEnd = () => window.scrollTo({ top: document.documentElement.scrollHeight });

  function onscroll() {
    if (!open) return;
    const now = sectionInView();
    if (now === current) return;
    current = now;
    revealCurrent(false);
  }
</script>

<svelte:window {onscroll} />

<nav class="lesson-rail" class:open aria-label="Lesson navigation">
  <button type="button" class="rail-btn" aria-label="Top of the lesson" onclick={toStart}>
    <ArrowUpToLine size={18} aria-hidden="true" />
    <span class="tip" aria-hidden="true">Top of the lesson</span>
  </button>

  <button
    type="button"
    class="rail-btn"
    aria-label="In this lesson"
    aria-expanded={open}
    aria-controls="lesson-rail-panel"
    onclick={toggleContents}
  >
    <TableOfContents size={18} aria-hidden="true" />
    <span class="tip" aria-hidden="true">In this lesson</span>
  </button>

  {#if open}
    <div class="rail-panel" id="lesson-rail-panel" bind:this={panel}>
      <p class="rail-title">In this lesson</p>
      <ol>
        {#each items as item, i (i)}
          <li class:current={i === current} aria-current={i === current ? 'location' : undefined}>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- authored, not user input -->
            {@html item}
          </li>
        {/each}
      </ol>
    </div>
  {/if}

  {#if hasExercises}
    <a class="rail-btn" href="#exercises" aria-label="Exercises">
      <Dumbbell size={18} aria-hidden="true" />
      <span class="tip" aria-hidden="true">Exercises</span>
    </a>
  {/if}

  <button type="button" class="rail-btn" aria-label="End of the lesson" onclick={toEnd}>
    <ArrowDownToLine size={18} aria-hidden="true" />
    <span class="tip" aria-hidden="true">End of the lesson</span>
  </button>
</nav>

<style>
  /* Narrow window: flat, in the bottom-right corner. */
  .lesson-rail {
    position: fixed;
    z-index: 30;
    right: 0.75rem;
    bottom: 0.75rem;
    display: flex;
    gap: 0.2rem;
    padding: 0.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgb(0 0 0 / 0.35);
    line-height: 1.4;
  }

  .rail-btn {
    position: relative;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 8px;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
  }
  .rail-btn:hover {
    color: var(--bright);
    background: var(--surface-2);
    text-decoration: none;
  }
  .lesson-rail.open .rail-btn[aria-expanded='true'] {
    color: var(--accent);
    background: var(--surface-2);
  }

  .tip {
    position: absolute;
    bottom: calc(100% + 0.6rem);
    right: 0;
    padding: 0.2rem 0.55rem;
    font-size: 0.8rem;
    white-space: nowrap;
    color: var(--bright);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .rail-btn:hover .tip,
  .rail-btn:focus-visible .tip {
    opacity: 1;
  }
  .lesson-rail.open .tip {
    display: none;
  }

  .rail-panel {
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.5rem);
    width: min(22rem, calc(100vw - 1.5rem));
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.85rem 0.75rem;
    font-size: 0.92rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 10px 32px rgb(0 0 0 / 0.45);
  }
  .rail-title {
    margin: 0 0 0.4rem 0.5rem;
    font-weight: 650;
    color: var(--bright);
  }
  .rail-panel ol {
    margin: 0;
    padding: 0;
    list-style: none; /* entries carry their own numbers */
  }
  .rail-panel li {
    margin: 0;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
  }
  .rail-panel li.current {
    background: var(--surface-2);
    box-shadow: inset 2px 0 0 var(--accent);
  }
  .rail-panel li.current :global(a) {
    color: var(--bright);
  }

  /* A margin wide enough to stand in: upright, just right of the text. */
  @media (min-width: 70rem) {
    .lesson-rail {
      right: auto;
      bottom: auto;
      top: 50%;
      left: calc(50% + 30.5rem);
      transform: translateY(-50%);
      flex-direction: column;
    }
    .tip {
      bottom: auto;
      top: 50%;
      right: calc(100% + 0.6rem);
      transform: translateY(-50%);
    }
    .rail-panel {
      bottom: auto;
      top: 50%;
      right: calc(100% + 0.5rem);
      transform: translateY(-50%);
      max-height: min(40rem, calc(100vh - 3rem));
    }
  }

  /* Room for the list in the margin too: it opens outwards, off the text. */
  @media (min-width: 106rem) {
    .tip {
      right: auto;
      left: calc(100% + 0.6rem);
    }
    .rail-panel {
      right: auto;
      left: calc(100% + 0.5rem);
      width: min(22rem, calc(50vw - 35rem));
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .rail-panel {
      animation: rail-panel-in 0.12s ease-out;
    }
  }
  @keyframes rail-panel-in {
    from {
      opacity: 0;
    }
  }

  @media print {
    .lesson-rail {
      display: none;
    }
  }
</style>
