# Skill format

Facts below come from the Claude Code docs as read on 2026-10-20 (Claude Code v2.1.305). Sources are in `SOURCES.md`. Re-check the docs when a field behaves differently than described.

## Layout

```
.claude/skills/<name>/
├── SKILL.md       required: frontmatter + instructions
├── SOURCES.md     Takt: sources, decisions, changelog (never loaded at runtime)
├── SPEC.md        Takt: maintenance contract, when there are references/ or scripts/
├── references/    loaded on demand, one level deep, each listed in SKILL.md
├── scripts/       executed, not loaded into context
└── assets/        templates or files used in output
```

- A skill loads in three levels: name and description are always in context; the `SKILL.md` body loads when the skill is used; bundled files load only when opened. Keep each level as small as it can be.
- Keep `SKILL.md` under 500 lines; move detail into `references/`.
- Custom commands were merged into skills: `.claude/skills/<name>/SKILL.md` creates `/<name>`. Do not create `.claude/commands/`.

## Frontmatter

All fields are optional for Claude Code. Takt requires `name` and `description`.

| Field | Use |
| --- | --- |
| `name` | at most 64 characters, lowercase letters, digits and hyphens; must equal the directory name; prefer a gerund (`writing-tests`) |
| `description` | what it does and when to use it, in third person, main use case first |
| `when_to_use` | extra trigger context; `description` + `when_to_use` are truncated at 1,536 characters together |
| `disable-model-invocation: true` | only the user can start it with `/name`; use for side effects or when the user should control timing (commit, deploy) |
| `user-invocable: false` | hidden from the `/` menu; for background knowledge Claude applies on its own |
| `allowed-tools` | pre-approves tools while the skill runs; workspace trust does not gate it, so avoid it unless needed and list exact commands |
| `disallowed-tools` | tools the skill must not use |
| `argument-hint`, `arguments` | for skills usually started with explicit arguments |
| `context: fork`, `agent` | run the skill in an isolated subagent context |
| `model`, `effort` | override model or effort for this skill only |
| `paths` | glob patterns that limit when the skill activates |
| `hooks`, `shell`, `background`, `metadata` | advanced; justify in `SOURCES.md` before using |

## Invocation choice

| Situation | Setting |
| --- | --- |
| Claude should notice by itself that the skill applies | default (no flag); the description must trigger well |
| it has side effects or the user wants to control when it runs | `disable-model-invocation: true` |
| it is passive knowledge, not a command a person would type | `user-invocable: false` |

## Description checklist

- Third person ("Creates...", "Reviews..."); it is injected into the system prompt.
- First sentence: the main use case. Then "Use when..." with the phrases users actually say.
- End with near-misses it should not handle, when another skill or tool is the right one.
- No internals unless they help Claude choose.
