# Sources: writing-tests

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | [obra/superpowers `test-driven-development`](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md) and [`writing-good-tests.md`](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/writing-good-tests.md) | community | MIT | red-green-refactor, "verify red" (fails for the right reason), run the whole suite, report every failure; name the break before writing; expected values derived independently; no change detectors; mock only the slow or external level; never assert on a mock; mutation check | 2026-11-03 |
| 2 | [mattpocock/skills `tdd`](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd) (`SKILL.md`, `tests.md`, `mocking.md`) | community | MIT | test at the public seam; tautological and implementation-coupled anti-patterns; vertical slices (one test, one implementation); mock at system boundaries only; respect ADRs and glossary vocabulary | 2026-11-03 |
| 3 | Neal Lindsay (Test Double), ["Keep your coding agent on task with mutation testing"](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing) (2025-10-21) | community | n.a. | Stryker on changed files only, coverage minimum first, survivors read and iterated, agent-reported scores must be verified (96.30% reported vs 94.44% rerun) | 2026-10-20 (via `docs/research/notes/agentes-e-skills/testes_e_arquitetura.md`) |
| 4 | ADR-0009 (test strategy), ADR-0002, ADR-0003, ADR-0006, ADR-0011, `docs/architecture/code-style.md` section 10, `CLAUDE.md` "Tests" | Takt doc | n.a. | AAA without comments, one Act, no logic, rule ID in the name, TDD for the engine and rules, levels, targets (90% lines and branches, 80% mutation in engine and API domain), coverage exclusions | 2026-11-03 |
| 5 | `docs/product/rules/README.md` | Takt doc | n.a. | rule format, "each rule comes from a PDR", stable IDs, error codes | 2026-11-03 |
| 6 | User decisions, 2026-11-03 | Takt | n.a. | analyze the code when rules are few; business behavior without a rule → propose a rule, anything else without an ID → ask; tests on existing code go through an approved plan; base on AAA and TDD, adjust on demand | 2026-11-03 |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Shape: reference-backed. Scenario finding, test writing and verification are each needed at different moments; inline rejected because one file would load all of it every time. | `writing-skills-and-agents` writing rules | estimate |
| One skill for test-first (Mode A) and coverage of existing code (Mode B): the same writing and verifying rules apply to both. | #1, #2, #6 | estimate |
| Mode B proves tests with mutation, because tests written after the code never had a red step; without mutation, list the breaking change per test and never edit production code to prove it. | #1 ("test passes immediately"), #3 | estimate |
| Code-analysis checklist (branches, errors, guards, boundaries, state, side effects, user input, ordering, arithmetic, concurrency). | #1 mutation check list, #2, ADR-0006/0011 threats | guess |
| A business scenario without a rule gets a proposed rule with its PDR origin; no PDR means the user decides on a new one. | #5, #6 | fact |
| Thresholds live in configuration and CI; the skill reports the tools' output. | #3, ADR-0009 | fact |
| Test names in English. | `CLAUDE.md` "Language"; #5 example | fact |
| Examples adapted, not copied: the sources' examples use comments or logic inside tests, which ADR-0009 forbids. | #1, #4 | fact |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #1 Red-Green-Refactor, Verify RED/GREEN, "Writing Good Tests" principles, Mutation Check | `SKILL.md` Mode A, `references/writing.md`, `references/scenarios.md` | adapted and shortened; MIT |
| #2 seams, anti-patterns, mocking at boundaries | `references/writing.md`, `references/scenarios.md` | adapted; MIT |

## Open gaps

- Commands: `CLAUDE.md` "Commands" is empty until the Nx workspace exists; the skill asks for them until then.
- Whether a literal table with `it.each` counts as "logic in the test" (ADR-0009) is not decided; ask the user.
- Behavior tests not run yet (criteria 2, 3 and 4 apply). With no code in the repository, they can only use fixtures.
- Playwright conventions (end-to-end) will need their own reference once the front-end starts.

## Changelog

| Date | Change |
| --- | --- |
| 2026-11-03 | Created. |
