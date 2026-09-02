# teachkit

Two agent skills for running a personal, long-form course on any topic — and the SvelteKit project
the courses are built from.

| Skill | Invoke | What it does |
| --- | --- | --- |
| `teach` | `/teach <topic>` · `/teach continue` | Interviews you, scaffolds a course, writes and repairs lessons |
| `teach-adapt` | `/teach-adapt` | Migrates an older HTML-file course onto the same platform |

Both are **user-invoked only**. They carry `disable-model-invocation: true` and say so in their
descriptions, so an agent will not wander into them because a conversation happened to mention
learning something.

## What a course looks like

A prerendered SvelteKit app, read at `http://127.0.0.1:8321`:

- **Lessons are routes** built from a shared component library, not hand-written HTML files.
- **Figures are SVG components** — around twenty of them, several interactive. No ASCII art, and no
  hand-drawn `<svg>` in a page. A missing shape becomes a component, so the next lesson gets it free.
- **Code is highlighted at build time** by Shiki, with a per-course language toggle whose choice
  follows you across every page. None of Shiki ships to the browser.
- **Maths is KaTeX**, in a `<Derivation>` component that aligns each step on the relation symbol
  with the reason beside it — because the arithmetic gets shown, never asserted.
- **Quizzes** retry until correct and withhold the explanation until you get there.
- **Everything prints**: the dark palette flips to ink, controls disappear, code wraps.

Around the lessons sits the workspace itself — a mission, curated sources, a glossary gated on
demonstrated understanding, learning records, and a notes file that accumulates every place a lesson
failed to land and what was changed because of it.

## Layout

```
skills/
  teach/
    SKILL.md              the entry point: modes, defaults, non-negotiables
    references/           the method, in files loaded on demand
    scaffold/             the course project, ready to copy
    agents/openai.yaml    Codex display metadata
  teach-adapt/
    SKILL.md              the migration
    agents/openai.yaml
```

`references/` covers the interview and topic archetypes, the pedagogy (retrieval, spacing, zone of
proximal development), lesson anatomy and a template, when interaction earns its keep, exercise
design and verification, the platform's traps, the pre-ship checklist, and a numbered list of
standing rules — each with the incident that produced it.

## Install

```bash
# Windows
powershell -ExecutionPolicy Bypass -File install.ps1

# macOS / Linux
./install.sh
```

Both install into every agent home they find, and take an explicit list when you want fewer:
`-Targets claude,codex` / `--targets claude,codex`.

Or copy by hand — the skills are plain directories with a `SKILL.md` inside, and every agent that
supports skills looks in one of these:

| Agent | Global | Per project |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` or `.agents/skills/` |
| Codex | `~/.codex/skills/` | — |
| Cross-agent (`skills` CLI) | `~/.agents/skills/` | `.agents/skills/` |

Copy `skills/teach` and `skills/teach-adapt` into whichever applies. The scaffold needs Node 20+; it
pins exact dependency versions, so `npm install` is reproducible without a lockfile.

### Machine-specific notes

`skills/teach/references/LOCAL.md` is gitignored and absent from a fresh clone. Create one if you
want the skill to know where your practice repositories live, which ports are taken, or what your
background is — the skill reads it when it exists and works fine when it does not. Nothing in it is
ever published.

## A note on defaults

These skills are opinionated in a specific direction: very long lessons (25–35 minutes), theory
first, four exercises apiece, three lessons per batch, strict sequencing, dark pages, and the
intermediate arithmetic always written out. Those are one learner's settled preferences, arrived at
across six courses, and the interview exists to move off them where a topic or a person needs
something else.

## Provenance

Derived from the `teach` skill in [mattpocock/skills](https://github.com/mattpocock/skills)
(`skills/productivity/teach`). The philosophy — knowledge/skills/wisdom, fluency versus storage
strength, the mission as compass, learning records as ADRs, the reuse-first component rule — is
inherited from there. What changed: the lesson format (a SvelteKit route rather than a
self-contained HTML file), the length and depth defaults, the diagram and interactivity rules, the
exercise-in-your-own-repo model, and the standing rules, which came from courses in use.
