# A teaching workspace

Lessons for this course are a prerendered SvelteKit app, not files you open.

```bash
npm install
npm run dev          # http://127.0.0.1:8321
```

| command | what it covers |
| --- | --- |
| `npm run dev` | the course, with hot reload |
| `npm run check` | TypeScript + Svelte diagnostics for `src/lib` |
| `npm run check:pages` | crawls every route from the running server and asserts nothing is broken |
| `npm run build` | compiles and prerenders every page into `dist/` |
| `npm run preview` | serves that build |
| `npm run fix:tex` | repairs under-escaped backslashes in `<Derivation>` / `<Math>` props |

`/dev/diagrams` is a live gallery of every figure component.

The course is taught by an agent: run `/teach` in this directory to continue it, ask for the next
batch, or report a lesson that did not land. `AGENTS.md` holds this workspace's authoring rules;
`NOTES.md` holds how this course is meant to be taught.
