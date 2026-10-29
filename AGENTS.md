# Working in this repository

This repo *is* three agent skills. It has no build and no tests; the thing that has to work is the
prose, and the one thing that can actually be verified is the scaffold.

```
skills/teach/          SKILL.md · references/ · scaffold/ · agents/openai.yaml
skills/teach-adapt/    SKILL.md · agents/openai.yaml
skills/teach-remake/   SKILL.md · agents/openai.yaml
docs/                  INSTALL.md · HOW-IT-WORKS.md — the technical detail the README links to
```

`README.md` is written for people deciding whether to try the skill, not for agents. Keep it
readable by a non-programmer; installer flags, platform internals and layout go in `docs/`.

`teach` owns the method; the other two are workflows over an existing course and link into
`teach/references/` rather than restating it. When a rule changes, it changes in `teach/references/`
and the workflows keep pointing at it.

## Rules

**`SKILL.md` is a router, not a manual.** It is loaded in full every time the skill runs, so it
holds the modes, the defaults table and the non-negotiables, and points at `references/` for
everything else. Detail belongs in a reference file, which is read only when needed.

**Stay agent-agnostic.** No tool names, no vendor names, no `~/` paths, no `D:\` paths in tracked
files. The workspace instruction file a course gets is `AGENTS.md`. `disable-model-invocation: true`
and `argument-hint` are Claude Code keys that other agents ignore harmlessly — keep them, and keep
the "USER-INVOKED ONLY" sentence in each description so agents without that flag behave the same.

**Never publish anything from `skills/teach/references/LOCAL.md`.** It is gitignored, holds local
paths and a personal profile, and exists only on the author's machine.

**A rule in `references/STANDING-RULES.md` carries the incident that produced it.** A rule without
its story degrades into a slogan and does not survive a session where the agent is in a hurry. Do
not compress them.

## Changing the scaffold

`skills/teach/scaffold/` is a real SvelteKit project. Changing it means verifying it, not reading
it:

```bash
cd "$(mktemp -d)" && cp -r <repo>/skills/teach/scaffold/. .
npm install
npm run check     # must be 0 errors, 0 warnings
npm run build     # must prerender
npm run dev &     # then: node tools/check-pages.mjs
```

A component's props are not guessable — `/dev/diagrams` renders every one of them and is the props
reference. A wrong prop name prerenders as a 500, which is the only reason it gets caught at all.

The scaffold is generalised from a live course. When that course improves one of
`src/lib/components/`, `src/lib/diagrams/`, `src/styles/` or `tools/`, the change belongs here too —
otherwise the two silently diverge. The exception is anything that concerns one course only: a
check for one language's tests, one practice repo's layout, one lab's model. That stays
course-local, and the references say how to write one (`PLATFORM.md`, "Course-local checks").
