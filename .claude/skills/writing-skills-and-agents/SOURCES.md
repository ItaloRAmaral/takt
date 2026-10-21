# Sources: writing-skills-and-agents

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | [Claude Code docs: Skills](https://code.claude.com/docs/en/skills) | official | n.a. | layout, frontmatter fields, 1,536-character trigger limit, invocation control, `allowed-tools` warning, commands merged into skills | 2026-10-20 |
| 2 | [Claude Code docs: Sub-agents](https://code.claude.com/docs/en/sub-agents) | official | n.a. | agent frontmatter, tools inheritance, skill vs agent, read-only reviewer, omitting `Agent`; recursive scan of `.claude/agents/` and identity by `name` (section "Choose the subagent scope", read 2026-10-21) | 2026-10-20 |
| 3 | [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | official | n.a. | concision, name rules (64 chars, gerund), third-person description, one-level references, freedom vs fragility, evaluations first, Claude A / Claude B | 2026-10-20 |
| 4 | [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) | official | n.a. | three-level progressive disclosure | 2026-10-20 |
| 5 | [Claude Code docs: Hooks, security considerations](https://code.claude.com/docs/en/hooks#security-considerations) | official | n.a. | hooks run with full user permissions | 2026-10-20 |
| 6 | [getsentry/skills `skill-writer`](https://github.com/getsentry/skills/tree/main/skills/skill-writer) | community (company) | Apache-2.0 | precision pass, simplest shape first, keep vs cut, structure vs fragility, SOURCES/SPEC split, validator checks, hand-over format | 2026-10-21 |
| 7 | [anthropics/skills `skill-creator`](https://github.com/anthropics/skills) (same text as the synced built-in skill) | official | Apache-2.0 (`LICENSE.txt` in the skill) | intent questions, explain the why, trigger lists with near-misses, with/baseline behavior tests, generalize from failures, read transcripts | 2026-10-21 |
| 8 | [anthropics/skills issue #556](https://github.com/anthropics/skills/issues/556) | issue | n.a. | automated trigger evals via `claude -p` reported to never trigger skills | 2026-10-20 |
| 9 | `docs/research/agentes-e-skills-da-comunidade.md` | Takt doc | n.a. | invisible-Unicode attack on `SKILL.md` (secondary source: CSA), "prompt level instructions get ignored" (community comment), third-party incidents | 2026-10-20 |
| 10 | `CLAUDE.md` and the user's rules in this session | Takt doc | n.a. | never infer, sources in `references.md`, English files, at most 3 questions, never commit | 2026-10-21 |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Shape: reference-backed with one script. Format and testing detail is needed only in some steps; structural checks are repeatable and error-prone by hand. Inline rejected: one file would load all of it on every use. | #3, #6 | guess |
| One skill writes both skills and agents: the authoring principles (focused scope, clear description, minimal tools, sources) are the same. | #2, #3; user decision 2026-10-21 | guess |
| Validator in Node, not Sentry's Python: Node is the project runtime (ADR-0001) and `uv` is not installed here. Re-implemented, not copied. | #6, ADR-0001 | fact |
| Name `writing-skills-and-agents`: gerund, as the authoring guide prefers. | #3 | fact |
| Claude may start this skill on its own: creating a skill is always an explicit user request, so a wrong trigger is unlikely and harmless. | #1 | guess |
| Agent notes in `.claude/agent-notes/<name>/`, outside `.claude/agents/`, because Claude Code scans `.claude/agents/` recursively and would read them as agent files. | #2 | fact |
| Behavior tests only when one of four criteria applies, always asking first. | #3, #7, fragility table in #6; agreed with the user on 2026-10-21 | guess |
| No automated trigger scripts. | #8 | fact |
| Validator rejects invisible Unicode characters. | #9 | fact (secondary source) |
| Prefer hooks over prompt text for rules that must hold. | #9, #5 | estimate |
| Do not combine untrusted input, network and write access in one agent. | #9 | estimate |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #6 `references/design-principles.md` (Precision Before Addition, Keep Vs Cut, Match Structure To Fragility) | `references/writing-rules.md` | adapted and shortened; Apache-2.0 |
| #6 `references/execution-shapes.md` (Defaulting To The Simplest Shape) | `references/writing-rules.md` | adapted; Apache-2.0 |
| #6 `scripts/quick_validate.py` (missing-file and unlisted-reference checks) | `scripts/validate.mjs` | ideas only, re-implemented in Node |
| #7 `SKILL.md` (Capture Intent, Description Optimization, Running and evaluating test cases, Improving the skill) | `SKILL.md` step 1, `references/testing.md` | adapted and shortened; Apache-2.0 |

## Open gaps

- Behavior tests ran once (2026-10-21) on 2 cases; no case yet where the skill must refuse or push back (for example, a request to install a third-party skill).
- Trigger lists in `SPEC.md` not yet reviewed by the user.
- `scripts/validate.mjs` has no automated tests; add Vitest tests when the Nx workspace exists (ADR-0009).
- The synced built-in `skill-creator` covers similar requests; check which one triggers on "create a skill" in this repository.
- Doc facts were read on 2026-10-20; fields may change with new Claude Code versions.
- Apache-2.0 section 4: if this repository is ever distributed, include the license text and these attributions.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-21 | Created. |
| 2026-10-21 | Behavior test, cases `inline-read-only-skill` and `read-only-agent`, with and baseline (4 subagents). With: both passed every SPEC check and the validator (0 errors). Baseline: both failed the validator (no `SOURCES.md`; the skill also lacked `SPEC.md` for its script) and recorded no sources. Functional quality was similar; the baseline skill tested its commands on 7 edge cases, the "with" skill only dry-ran them. Changes: step 6 now requires running the new item's commands on real and edge cases; step 7 now names the ADR-0010 commit scope and the trailer (one "with" run used scope `claude`, another omitted the trailer); `agent-format.md` now states the `model` default order and that a specifier in `disallowedTools` removes the whole tool (sub-agents docs, read 2026-10-21). |
