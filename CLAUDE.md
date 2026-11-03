# Takt

## What this is

Takt is a web platform with an editable 3D virtual factory, driven by a discrete-event simulation engine, for teaching, training and (later) analyzing production engineering. It is a portfolio project first and a sellable product later.

**Start every task by reading `docs/PRODUCT.md`.** It is the entry point and links to everything else.

## Never infer, never assume

- Do not state anything you have not verified. If it is not in the code or the docs, either **ask the user** or **ask permission to research it** (official docs, literature, industry sources).
- When in doubt about intent, scope or a decision, **ask** instead of choosing silently.
- Every reference used in a decision is listed in `docs/product/references.md`. Research reports go to `docs/research/`.
- If no published, reliable source exists, say so explicitly and label the claim as an estimate.

## Where things live

| Path | What |
| --- | --- |
| `docs/PRODUCT.md` | Product overview and documentation map |
| `docs/pdr/` | Product decision records (PDR) |
| `docs/adr/` | Architecture decision records (ADR) |
| `docs/product/rules/` | Business rules with stable IDs (`RN-...`) and error codes |
| `docs/product/` | Vision, scope, access, plant model, simulation, UX, milestones, risks, glossary, references |
| `docs/architecture/` | Living docs: how each app and lib works today; `code-style.md` is the code style guide |
| `docs/research/` | Literature and technical research reports |
| `docs/plans/` | Implementation plans (pt-BR), written with the `planning-code-changes` skill, and the reviewer measurement table |
| `.claude/skills/`, `.claude/agents/` | Project skills and subagents; create or change them with the `writing-skills-and-agents` skill |
| `.claude/agent-notes/` | Sources and specs of each subagent |
| `.claude/rules/` | Short, path-scoped digests of the style guide per area (API, engine, schema, web, tests, comments); change them with `docs/architecture/code-style.md` in the same pull request |
| `.claude/settings.json`, `.claude/hooks/` | Project permissions and hooks (blocks git commands that create commits or publish) |

Read only what the task needs; every doc starts with a short summary.

## Language

- Docs, PDRs and ADRs: Portuguese (pt-BR).
- Code, identifiers, commit messages, this file, skills and agents: English. `docs/product/glossary.md` maps pt-BR terms to code names.

## How we work

- **Never run `git commit` or `git push`**, nor other git commands that create commits, move refs or publish (`merge`, `rebase`, `cherry-pick`, `revert`, `am`, `tag`). When work is ready, give the user the Conventional Commits message and the exact list of files to stage.
- Every code or configuration change starts from a plan the user approved (`planning-code-changes` skill): a short plan in the conversation for small, local changes, a full plan in `docs/plans/` otherwise. Even a fully specified change can leave gaps. Only prose docs, comments and formatting skip planning.
- All code reaches `main` through a pull request.
- A new product or technical decision that is hard to reverse, surprising without context and a real trade-off becomes a PDR or ADR with status "Proposto" (`writing-decision-records` skill); smaller decisions go in the plan or the commit. Accepted records are never edited; a change is a new record that supersedes the old one. The new record names the old one in its "Substitui" field, and the old one gets only the note "Substituído por PDR/ADR-NNNN" in its status.
- Business rules and architecture docs are living docs: update them in the same pull request that changes the behavior.
- Each milestone starts by writing its use cases (`docs/product/use-cases/`) and adjusting the rules it touches.

## Hard rules for code

Style follows `docs/architecture/code-style.md`; its principles may be broken only with the justification it requires in the plan. The rules below never are.

- `@takt/sim-engine` never imports React, Three.js or DOM APIs, and never uses `Math.random` (ADR-0001, ADR-0011).
- In `takt-core-api`, `domain/` imports nothing external (no `@nestjs/*`, `@prisma/*`, `zod`) (ADR-0002).
- Authorization is always decided on the server, per organization; a role is never global (ADR-0006).
- Every business table has `organization_id` and row-level security (ADR-0003).
- Input is validated once, at the edge, with Zod in strict mode; responses use explicit output DTOs (ADR-0008).
- The API returns error codes, never sentences (`docs/product/rules/README.md`).
- Units go in field names (`cycleSec`, `mtbfMin`).
- No secrets in the repository; logs never contain personal data, passwords, tokens or cookies (ADR-0007).
- Prefer small, tested in-house code over unmaintained dependencies; dependencies are updated manually (ADR-0010, ADR-0012).

## Tests

- Arrange, Act, Assert, separated by blank lines, without comments; one Act per test; no logic in tests.
- Test names start with the rule or use case ID: `RN-PLT-002: ...`. A test with neither (tooling, a technical invariant) has only a plain description of the behavior; never invent an ID.
- TDD for the engine and for `RN-...` rules.
- Coverage of at least 90% (lines and branches) in every project; mutation score of at least 80% in the engine and the API domain (ADR-0009).

## Commands

To be filled in when the Nx workspace is created.
