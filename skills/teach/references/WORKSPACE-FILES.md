# The workspace files

Everything the course knows about itself, outside the lessons. Adapted from the original `/teach`
skill's format documents.

```
MISSION.md          why they are learning it — the compass
RESOURCES.md        the trusted sources, and the communities
GLOSSARY.md         the course's fixed vocabulary
NOTES.md            how this learner wants to be taught, and every gap found in use
learning-records/   what they have demonstrated — the floor for the next lesson
AGENTS.md           how this workspace is built (template in COURSE-SETUP.md)
```

---

## `MISSION.md`

The reason the user is interested. Every teaching decision traces back here.

```md
# Mission: {Topic}

## Why
{1-3 sentences. The concrete real-world goal. What changes in their work or life when they
have this skill? Push past "to understand X" to the underlying outcome.}

## Success looks like
- {A specific, observable thing they will be able to do}
- {Another}

## Constraints
- {Format preferences, time, prior commitments, the assumed baseline — anything that bounds
  the approach. Include the lesson-format defaults that apply here.}

## Out of scope
- {Adjacent topics deliberately deferred — this protects the zone of proximal development,
  and it is what stops a deferred concept sneaking into example code.}
```

**Rules.** One mission per workspace — two unrelated topics is two workspaces. Concrete over
abstract. If they cannot articulate why, interview before writing anything: a bad mission is worse
than none. Missions change as skill grows; when the goal moves, update the file and write a learning
record, after confirming with the user. Keep it under a screen — past that it has stopped being a
compass and become a plan.

---

## `RESOURCES.md`

The curated set of trusted sources. Explainers draw from here, never from parametric memory.

```md
# {Topic} Resources

## Knowledge

- [Title — Author (Publisher)](url)
  One line: what it covers and when to reach for it. Which lesson it is the primary source of.

## Wisdom (Communities)

- [r/subreddit](url)
  What it is good for — programme critique, plateau troubleshooting, code review.

## Gaps

- {An area the mission needs and no good source covers. This drives future search.}
```

**Rules.** High-trust only: primary sources, recognised experts, peer-reviewed work, strongly
moderated communities. Marketing dressed as education stays out. Annotate every entry — a bare link
is useless in three months. Prune what turned out to be wrong or shallow; five sharp sources beat
thirty mediocre ones. Record it here if the user has opted out of communities, so future sessions
stop proposing them. **Correct entries in place when a URL turns out to be wrong**, and note the
correction — one of these was a fabricated path that survived two lessons.

---

## `GLOSSARY.md`

The canonical language. Every lesson adheres to it; none redefines a promoted term.

```md
# {Topic} Glossary

{One or two sentences on what this glossary covers, and the promotion rule.}

## Promoted (demonstrated in lessons 1–N, {date})

Evidence: {how they demonstrated it}.

| term | meaning as used in this course |
| --- | --- |
| **term** | one or two sentences: what it IS, not how to do it. |
```

**Rules.** Add a term only once the learner uses it correctly — the glossary is a record of
compressed understanding, not a dictionary to learn from. Be opinionated: pick the best word and
list the rest as aliases to avoid. Use the glossary's own terms inside its definitions. Flag
ambiguity the wider field is loose about, and *always* flag a word that names two different things
in this course. Revise in place as understanding deepens; do not leave a stale entry.

---

## `NOTES.md`

The working record: how this learner wants to be taught, what has been delivered, what was promised,
and — the most valuable part — every gap found in use.

Sections that have earned their place:

```md
# Working notes

## User preferences (stated {date})
{Format, depth, pacing, languages, theme. The things that override the skill defaults.}

## Practice environment ({date})
{Which repos, which layout, which commands, which conventions of theirs to respect.}

## Teaching gaps found in use — fix the lesson, do not just answer in chat
{One entry per incident: what they asked, what the real cause was, what was changed, and
the RULE it produced in bold. Cross-link the learning record.}

## How the learner actually practises ({date})
{Do not re-derive this. It is why repo state is not a progress report.}

## Conventions established
{Anything a future session must not accidentally change.}

## Delivered / promised / open
{What shipped in each batch. Every promise made in a "What's next" paragraph, and whether
it has been paid.}
```

The gap entries are the highest-value writing in the workspace. Write them long: what was asked,
what the real cause was (often not what was asked about), what was changed where, and the general
rule. If the rule generalises beyond this course, it belongs in
[STANDING-RULES.md](STANDING-RULES.md) too.

---

## `learning-records/NNNN-slug.md`

The teaching equivalent of an ADR. They capture non-obvious insights and stated prior knowledge, and
they are what the zone of proximal development is computed from.

```md
# {Short title of what was learned or established}

{1-3 sentences: what was learned, or what prior knowledge was established, and why it
changes what to teach next.}
```

That is the whole format; one paragraph is a complete record. Optional sections, only when they earn
their place: **Status** (`active | superseded by LR-NNNN`), **Evidence** (how they demonstrated it),
**Implications** (what this unlocks or rules out).

**Numbering** — scan the directory for the highest number and increment.

**Write one when**: they demonstrated genuine understanding of something non-trivial; they disclosed
prior knowledge (record the depth claimed); **a misconception was corrected** (the highest-value
kind — these predict future stumbles); or the mission shifted.

**Not for**: material merely covered, a lesson merely written, or a session log.

**Supersession** — when a later record contradicts an earlier one, mark the old one
`Status: superseded by LR-NNNN` rather than deleting it. How the understanding evolved is itself
signal.
