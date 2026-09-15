# The platform

A course is a prerendered SvelteKit app. This is what you need to know to build a page in it.

---

## Commands

```bash
npm run dev          # http://127.0.0.1:8321 — this is how lessons are read
```

| command | what it covers |
| --- | --- |
| `npm run dev` | the course, with hot reload |
| `npm run check` | TypeScript + Svelte diagnostics for `src/lib` |
| `npm run check:pages` | crawls every route from the running server and asserts nothing is broken |
| `npm run build` | compiles and prerenders every page — **the real gate before shipping** |
| `npm run fix:tex` | repairs under-escaped backslashes in `<Derivation>` / `<Math>` props |

`npm run build` prerenders into `dist/` (gitignored) if a static copy is ever wanted; `npm run
preview` serves it.

`npm run check` deliberately excludes `src/routes/lessons`, `src/routes/reference`,
`src/routes/dev` and the index page. Those carry raw source inside `<CodeBlock>`, which only becomes
valid Svelte after the preprocessor runs, and `svelte-check` reports diagnostics against the
*original* text — so it sees `i < len(nums)` as a broken tag. `npm run build` compiles them
properly, and `check:pages` covers them at runtime. The reasoning is written out in `tsconfig.json`;
do not "fix" it by removing the exclusions.

---

## Layout

```
src/
  app.css                  palette (the single source of colour) + Tailwind theme + shadcn tokens
  styles/                  prose.css · code.css · diagram.css
  lib/
    course.ts              THE MANIFEST — identity, lesson order, roadmap. Edit this first.
    components/            lesson chrome: LessonHeader, Quiz, Exercise, Callout, CodeTabs …
    components/ui/         shadcn-svelte primitives (button, tabs, accordion, slider, …)
    diagrams/              the SVG figure library
    lang.svelte.ts         which code track is showing, remembered across the course
  routes/
    +page.svelte           the course index, generated from course.ts
    lessons/<slug>/+page.svelte
    reference/<slug>/+page.svelte
    dev/diagrams/          a live gallery of every component. Check changes here first.
tools/
  shiki-preprocess.js      build-time syntax highlighting
  check-pages.mjs          the route crawler and smoke test
  fix-tex.mjs              TeX escaping repair
```

---

## Authoring a page

1. **Add it to `src/lib/course.ts` first.** Prev/next links, the index card and the header pills all
   derive from there. Never hand-write navigation.
2. Create `src/routes/lessons/NNNN-slug/+page.svelte`.
3. Import from the two barrels (`$lib/components`, `$lib/diagrams`) and write ordinary HTML in
   between. Skeleton in [LESSON-TEMPLATE.md](LESSON-TEMPLATE.md).

---

## Code blocks

Write source **raw** — no HTML entities, no escaping. `tools/shiki-preprocess.js` turns these into
highlighted HTML at build time using the same TextMate grammars VS Code uses, and Shiki never ships
to the browser.

```svelte
<CodeTabs>
<CodeBlock lang="go">
func main() { fmt.Println(len(xs) < 10) }
</CodeBlock>
<CodeBlock lang="ts">
console.log(xs.length < 10);
</CodeBlock>
</CodeTabs>
```

`lang` takes any Shiki language id (go · ts · js · json · bash · html · css · py · rust · kotlin ·
swift · sql · text). `title="…"` adds a caption, `hl="3,7-9"` highlights lines. A `<CodeTabs>` group
is one pane per track; the chosen track is global and remembered across pages
(`$lib/lang.svelte.ts`).

Keep lines under ~90 characters. A long line scrolls its block sideways, and a line the reader has
to drag to finish is a line they skip.

---

## The two escaping traps

**1. `{` in prose.** Svelte reads it as an expression start *everywhere*, including inside plain
HTML attributes. Write `&#123;` / `&#125;` in text, and `attr={'…{…}…'}` for attributes. Inside a
`<CodeBlock>` body braces are fine — that text never reaches the Svelte parser.

**2. Backslashes in TeX.** `<Derivation>` and `<Math>` props are JS strings, so a control sequence
needs a doubled backslash: `'\\alpha'`, not `'\alpha'` (which JS reads as an escape and turns into a
control character). `npm run fix:tex` repairs a file that forgot, and is idempotent. Never author
these through a shell heredoc — the shell eats the backslashes before Svelte ever sees them.

---

## Colour

`src/app.css` is the single source. `--accent` is the course's identity; everything else derives.
Never write a hex value in a component or a page — pass a `tone` and let the palette stay in
charge.

One accent per course, distinct from the others, so two open tabs are distinguishable.

---

## Traps that have cost real time

- **`adapter-static` writes to `build/` by default.** It deleted a directory of migration scripts.
  The scaffold points it at `dist/` and keeps tooling in `tools/`. Do not move it back.
- **Vite binds to `::1` only unless told otherwise.** `vite.config.ts` sets
  `server.host = '127.0.0.1'`; without it the dev server is unreachable and the browser shows
  nothing. Always verify against `http://127.0.0.1:8321`.
- **Tailwind's preflight strips list markers.** `prose.css` puts them back. Do not delete those
  rules while tidying.
- **Keyed `{#each}` over values that can repeat** throws `each_key_duplicate` during hydration and
  silently truncates the page. Key by index whenever values are not guaranteed unique.
- **Never write files through a shell heredoc** when they contain backslashes or `$`. Use the file
  tools.
