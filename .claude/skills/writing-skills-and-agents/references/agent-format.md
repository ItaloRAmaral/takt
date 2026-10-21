# Agent format

Facts below come from the Claude Code sub-agents docs as read on 2026-10-20 (Claude Code v2.1.305). Sources are in `SOURCES.md`.

## Layout

```
.claude/agents/<name>.md              frontmatter + system prompt (checked into git)
.claude/agent-notes/<name>/SOURCES.md Takt: sources, decisions, changelog
.claude/agent-notes/<name>/SPEC.md    Takt: maintenance contract and behavior tests, when tested
```

Claude Code scans `.claude/agents/` recursively, so every `.md` file in any subfolder is read as an agent definition. That is why notes live outside it. Subfolders do not change an agent's identity, which comes only from `name`; keep names unique across the whole tree.

## How an agent differs from a skill

- The agent runs in its own context. It does not see the conversation; it sees only its system prompt (the file body) and the task it is given.
- It returns a result to the main conversation; its intermediate work stays out of the main context.
- Its tools are only the ones its frontmatter allows.

The docs recommend a subagent when the output is verbose and only a summary is needed, when tool restrictions must be enforced, or when the work is self-contained. They recommend a skill for reusable workflows that run in the main conversation.

## Frontmatter

Only `name` and `description` are required. Claude Code ignores unknown fields without reporting an error, so a typo silently does nothing; the Takt validator checks names.

| Field | Use |
| --- | --- |
| `name` | Takt: lowercase letters, digits and hyphens, equal to the file name |
| `description` | when Claude should delegate to it; specific enough to single out this one agent; add "use proactively" only if Claude should delegate without being asked |
| `tools` | allowed tools; **if omitted, the agent inherits every tool**, including Edit and Write |
| `disallowedTools` | tools to remove; an entry with a specifier such as `Bash(git push *)` still removes the whole tool |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit`; when omitted, Claude Code uses the model passed for that call, then `CLAUDE_CODE_SUBAGENT_MODEL`, then the main conversation's model |
| `permissionMode` | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns`, `effort` | limit work per run |
| `skills` | preloads the full content of the listed skills |
| `hooks` | hooks that apply only to this agent (for example, a `PreToolUse` that blocks write queries) |
| `memory`, `isolation: worktree`, `background`, `mcpServers`, `color`, `initialPrompt` | advanced; justify in `SOURCES.md` before using |

## Tool rules

- Always write `tools` explicitly. Start from nothing and add only what the task needs.
- Reviewers and auditors are read-only: no `Edit`, `Write` or `NotebookEdit`.
- Leave out `Agent` unless the agent must delegate; this stops it from spawning more agents.
- To keep `Bash` but block specific commands, use a deny rule in `permissions.deny` of `.claude/settings.json`; it applies to the main conversation and to every subagent. Remember that `Bash` can also write files.
- Prefer a hook over prompt text for rules that must hold, because an agent can ignore its prompt but cannot bypass a hook.
- An agent that reads untrusted content (diffs, issues, web pages) should not also have network access and write access together; that combination lets injected instructions leak or change data (estimate, see `SOURCES.md`).

## Writing the system prompt

The agent knows nothing beyond its prompt and the task, so the body must say:

1. Its single job, and what is out of scope.
2. The input it expects (for example, base and head commit SHAs plus the touched rule IDs).
3. The steps, in order, with how to verify before reporting.
4. The exact output format.
5. What to do when unsure: report it under a named section (for example "Declined to judge") instead of guessing.

The main conversation must pass everything the agent needs in the task text; never assume it can see earlier messages.
