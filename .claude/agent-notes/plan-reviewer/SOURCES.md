# Sources: plan-reviewer

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | [obra/superpowers `writing-plans`](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md) | community | MIT | Review Focus, spec coverage, interface consistency, proportion, lines that decide nothing | 2026-10-21 |
| 2 | [obra/superpowers `requesting-code-review/code-reviewer.md`](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/code-reviewer.md) | community | MIT | spec as a vision document, "Declined to judge", read-only, no sub-dispatch | 2026-10-21 |
| 3 | [obra/superpowers commit e6221a4](https://github.com/obra/superpowers/commit/e6221a48c54141e0ef04adaea4895a8150fc57a1) (2026-03-20) | community | MIT | subagent plan-review loop doubled time with no measured gain in their tests; reason for one pass, important plans only, measured | 2026-10-21 |
| 4 | [anthropics/claude-plugins-official `code-review`](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-review/commands/code-review.md) | official | n.a. | confidence 0-100 with a cut at 80 | 2026-10-20 (via `docs/research/agentes-e-skills-da-comunidade.md`) |
| 5 | [Claude Code docs: Sub-agents](https://code.claude.com/docs/en/sub-agents) | official | n.a. | read-only tools, `model: inherit` | 2026-10-21 |
| 6 | ADRs 0001-0012 ("Riscos de segurança", "Conformidade"), `docs/architecture/code-style.md` | Takt doc | n.a. | threats, hard rules, over-engineering criteria, deviations, review checklist | 2026-10-21 |
| 7 | Behavior test, 2026-10-21 | Takt | n.a. | merging the two reviewers; prerequisites and living-doc checks taken from the generic baseline | 2026-10-21 |
| 8 | User decisions, 2026-10-21 | Takt | n.a. | option B with measurement; confidence cut, "Declined to judge", errors vs suggestions; one reviewer instead of two | 2026-10-21 |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Agent, not skill: fresh context without the conversation, read-only tools enforced. | #5 | fact |
| One reviewer covering gaps and design. In the behavior test, a single generic reviewer found everything the two specialized ones found together, for fewer tokens. | #7, #8 | fact (one test, obvious defects) |
| Prerequisites and living-doc checks added: the generic reviewer found them and the specialized ones did not. | #7 | fact |
| Security checked against the ADR threat tables, not a generic list. | #6 | guess |
| Tools `Read, Grep, Glob`; `model: inherit`; cut at 80. | #4, #5 | fact / estimate |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #2 "The spec is a vision document", "Declined to judge", no sub-dispatch | `.claude/agents/plan-reviewer.md` | adapted; MIT |
| #1 Review Focus, Self-Review items 3 and 5 | `.claude/agents/plan-reviewer.md` | adapted; MIT |

## Open gaps

- Behavior test of the merged reviewer not run; it reuses the prompts of the two tested reviewers.
- Switched off if, after 5 reviewed plans, it finds no accepted error that self-review missed (`docs/plans/README.md`).

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-21 | `plan-gap-reviewer` and `plan-design-reviewer` created and behavior-tested on a fixture plan with planted defects: each found all planted defects in its area (6 and 7), the design one also found 2 unplanted real errors; 71k and 58k tokens. A generic general-purpose reviewer found everything both found, plus undeclared prerequisites and living docs, for 99k tokens. |
| 2026-10-21 | Merged into `plan-reviewer` by user decision; added the prerequisites and living-docs checks. |
