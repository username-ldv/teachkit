# Installing teachkit

The skills are plain directories with a `SKILL.md` inside. The installers copy them into each agent's
skills folder; you can also copy them by hand.

## The installers

```bash
# Windows
powershell -ExecutionPolicy Bypass -File install.ps1

# macOS / Linux
./install.sh
```

Both install into every agent home they find, and take an explicit list when you want fewer:
`-Targets claude,codex` / `--targets claude,codex`. Add `-List` / `--list` to see where things would
go without touching anything. Restart the agent afterwards so it picks up the skills.

| Option | PowerShell | Bash | What it does |
| --- | --- | --- | --- |
| Targets | `-Targets claude,codex` | `--targets claude,codex` | Install only for these agents (`claude`, `codex`, `agents`) |
| Dry run | `-List` | `--list` | Print where each skill would go, and how |
| Real copies | `-Copy` | `--copy` | Copy into every home instead of linking the others to `~/.agents` |
| Link to repo | `-Link` | `--link` | Point the installed skills at this checkout instead of copying |

### One real copy, not three

Agents increasingly read the vendor-neutral `~/.agents/skills` *as well as* their own home, so a
real copy in each one appears as the same skill twice in the menu. When `.agents` is among the
targets it gets the real copy and the others are symlinked to it. If an agent turns out not to
follow a symlinked skill directory, re-run with `-Copy` / `--copy`. On Windows, creating a symlink
needs Developer Mode or an elevated shell; without either, the installer falls back to copying and
says so.

### Working on the skills themselves? Install with `-Link`

That points the canonical home at this checkout instead of copying into it, so editing an installed
skill edits the repo and the two cannot drift. They did drift once, and badly: the copy was edited
in place for seventeen days while the repo took its own commits, and putting the two back together
was a three-way merge over 38 files. Without `-Link`, re-run the installer after every change you
want the agent to see.

## Installing by hand

Copy the three `skills/*` directories into whichever of these your agent reads:

| Agent | Global | Per project |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` or `.agents/skills/` |
| Codex | `~/.codex/skills/` | — |
| Cross-agent (`skills` CLI) | `~/.agents/skills/` | `.agents/skills/` |

## Requirements for the courses

Each course is a SvelteKit app copied from `skills/teach/scaffold/`. It needs Node.js 20 or newer.
The scaffold pins exact dependency versions, so `npm install` is reproducible without a lockfile.
Exercises need whatever toolchain the course teaches (Go, a C compiler, Android Studio, and so on);
the agent sets that up with you during the first session.

## Machine-specific notes

`skills/teach/references/LOCAL.md` is gitignored and absent from a fresh clone. Create one if you
want the skill to know facts about your machine: where your practice repositories live, which ports
are taken, what your background is. It can also override the published defaults for every course
you start on that machine. If you always want three lessons per run, for example, say so there.
The skill reads it when it exists and works fine when it does not. Nothing in it is ever published.
