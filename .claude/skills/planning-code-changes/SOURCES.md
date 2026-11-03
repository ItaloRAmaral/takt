# Sources: planning-code-changes

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | [obra/superpowers `writing-plans`](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md) (v6.4.2, 2026-09-25) | community | MIT | plan for an engineer who has not seen the conversation; scope check and one plan per subsystem; file structure; task right-sizing; step granularity; header with goal, architecture, global constraints; Review Focus; Interfaces block; "what a step contains"; self-review checklist; proportion | 2026-10-21 |
| 2 | [obra/superpowers commit e6221a4](https://github.com/obra/superpowers/commit/e6221a48c54141e0ef04adaea4895a8150fc57a1) (2026-03-20) | community | MIT | evidence that subagent plan-review loops doubled time (~25 min) with no measured quality gain in their tests (5 versions × 5 trials), and that self-review caught 3-5 bugs in ~30 s | 2026-10-21 |
| 3 | [obra/superpowers `requesting-code-review/code-reviewer.md`](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/code-reviewer.md) | community | MIT | spec as a vision document, "Declined to judge" (used in the reviewer agents) | 2026-10-21 |
| 4 | [obra/superpowers `receiving-code-review`](https://github.com/obra/superpowers/blob/main/skills/receiving-code-review/SKILL.md) | community | MIT | verify each finding before acting; no performative agreement | 2026-10-20 (via `docs/research/agentes-e-skills-da-comunidade.md`) |
| 5 | `docs/architecture/code-style.md` and `docs/research/guia-de-estilo-de-codigo.md` | Takt doc | n.a. | deviation criteria and the five items; what is never broken; security checklist; ceremony notes | 2026-10-21 |
| 6 | ADRs 0001-0012 ("Riscos de segurança"), ADR-0009 (tests), ADR-0010 (commits) | Takt doc | n.a. | security section, TDD and test naming, commit scope | 2026-10-21 |
| 7 | `CLAUDE.md` | Takt doc | n.a. | never infer; use cases first in each milestone; never commit; docs in pt-BR | 2026-10-21 |
| 8 | User decisions, 2026-10-21 | Takt | n.a. | plan only (no execution); plan big requests too, via roadmap; on doubt read code and docs, then ask, never infer; reviewers only on important plans (option B), one pass, measured, switched off if useless; confidence cut, "Declined to judge", errors vs suggestions; style principles may be broken only with written justification; ADRs never | 2026-10-21 |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Shape: reference-backed. The plan template, self-review and review procedure are each needed only at one step. Inline rejected: one file would load all of them on every use. | `writing-skills-and-agents` writing rules | estimate |
| Skill, not agent: planning needs back-and-forth with the user (questions, approval). | Sub-agents docs, via `writing-skills-and-agents` | fact |
| One reviewer (`plan-reviewer`) runs only when one of five criteria applies, in one pass, and is measured. Two specialized reviewers were merged after the behavior test. | #2, #8 | fact (user decision) / estimate (criteria) |
| Switch-off check after 5 reviewed plans. | #8 (agreed with the user) | guess |
| Plans in pt-BR, in `docs/plans/`. | #7 | fact |
| Each task lists a suggested commit instead of committing. | #7, #6 | fact |
| Verification commands come from `CLAUDE.md` "Commands", or are asked; never guessed. | #7, #8 | fact |
| Three sizes: no plan only for prose docs, comments and formatting; a short plan in the conversation for small, local changes, even fully specified ones (they can still leave gaps); a full plan otherwise. | User decision, 2026-10-21 | fact |
| A plan needs the request plus the docs that define it; without them, search candidates and ask. | User decision, 2026-10-21 | fact |
| Every plan has a "Plano de testes" section mapping requirements, review focus and security rows to named tests at ADR-0009 levels, with data and targets; roadmaps list the tests that prove each sub-plan. | User decision, 2026-10-21; #6 | fact |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #1 Overview, Scope Check, File Structure, Task Right-Sizing, Plan Document Header, Task Structure, What a Step Contains, Self-Review | `SKILL.md`, `references/plan-template.md`, `references/self-review.md` | adapted and translated to the Takt process; MIT |
| #2 commit message | `references/reviews.md` (one pass, no loop) | cited; MIT |

## Open gaps

- Behavior tests not run yet (criteria 2, 3 and 4 apply).
- Commands in `CLAUDE.md` are not written yet; until the Nx workspace exists, plans must ask for them.
- The error style in the template example depends on decision D3.
- Execution of an approved plan is out of scope; a separate skill may come later.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-21 | Created. |
| 2026-10-21 | Behavior test, 4 subagents. `skill-use-case-without-docs`: with the skill, stopped at step 1, listed candidate docs, noticed missing use cases and the missing milestone 1-4 foundations, asked 3 questions; baseline wrote a full 313-line plan on 17 assumptions. `skill-engine-rng`: both plans good; with the skill, every template section present, no constants from memory (research asked), 12 self-review fixes, one deviation declared with the five items, commands marked pending; baseline marked memory constants "a conferir" and proposed an ADR. Conclusion: the skill's measurable value is behavior (asks instead of assuming, consistent structure), not technical depth. |
| 2026-10-21 | User feedback: context docs are a required input; tests are always planned ("Plano de testes" section, self-review item 10, roadmap test column); `plan-gap-reviewer` checks the test plan. |
| 2026-10-21 | `plan-gap-reviewer` and `plan-design-reviewer` merged into `plan-reviewer` by user decision, after a single generic reviewer matched both in the behavior test. |
| 2026-10-21 | Sizes changed by user decision: short plan in the conversation for small changes; no plan only for prose docs, comments and formatting. |
