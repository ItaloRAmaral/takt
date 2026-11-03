# Spec: planning-code-changes

## Intent

Makes every non-trivial code change in Takt start from a plan that someone who never saw the conversation could execute: grounded in the docs, with no guessed values, covering edge inputs and security threats, following the style guide, and stating every deviation. Big requests get a roadmap first.

## Scope

- In scope: requests to implement or change code, from one use case to a whole subsystem; roadmaps and detailed plans in `docs/plans/`; self-review; dispatching `plan-reviewer`; the measurement table in `docs/plans/README.md`.
- Out of scope: executing the plan (writing production code and tests), PDRs, ADRs and other prose docs, comment and formatting edits.

## Triggers

These requests are test examples for the description, not rules of the skill: realistic and specific on purpose, because generic requests test nothing. Draft, pending the user's review.

Should trigger:

1. faça o motor
2. implementa o caso de uso de publicar planta em grupo
3. quero o MRG32k3a funcionando com os testes do L'Ecuyer
4. cria o endpoint de importar JSON de planta
5. bora começar a API, primeiro o módulo de organizações
6. adiciona o modo regime estável no motor com o assistente MSER-5
7. preciso de um plano pra implementar a validação semântica da planta
8. muda o limite de simulações pra respeitar o plano da organização
9. implement the event queue with deterministic tie-break
10. faz o editor 3D de arrastar estações na grade
11. muda o valor do timeout para 30 s no arquivo que eu te mostrei (short plan)

Should not trigger:

1. executa o plano aprovado de ontem
2. escreve o ADR da decisão do Result
3. corrige o typo "Simulacao" no glossário
4. revisa o código desse PR
5. cria uma skill pra gerar testes a partir das regras
6. pesquisa qual biblioteca de fila de prioridade é mais usada
7. atualiza o README de pesquisas
8. quais regras o caso de uso de publicar planta toca?
9. roda os testes do motor
10. ajusta a formatação desse comentário no motor

## Runtime contract

- Inputs: the user's request plus the docs that define it; if the docs are missing, search for candidates and ask the user to confirm or send them before planning.
- First actions: read the request and the docs it touches; size it (trivial, one deliverable, several subsystems); list and resolve doubts from code and docs, then ask.
- Output: a plan or roadmap in `docs/plans/` with status "Proposto", the review table filled, the measurement row added when the reviewer ran, and the hand-over from `SKILL.md` step 6.
- Hard constraints: never infer; at most 3 questions per message; never break `CLAUDE.md`, accepted ADRs and PDRs, or `RN-...` rules; deviations from the style guide carry the five items; no code written; no git commands that commit or publish.

## Files

| File | Loaded when |
| --- | --- |
| `SKILL.md` | the skill is used |
| `references/plan-template.md` | writing the plan or roadmap |
| `references/self-review.md` | step 4 |
| `references/reviews.md` | step 5 |
| `SOURCES.md`, `SPEC.md` | maintenance only |

Related: `.claude/agents/plan-reviewer.md`, `docs/plans/README.md`.

## Validation

Structural:

```bash
node .claude/skills/writing-skills-and-agents/scripts/validate.mjs .claude/skills/planning-code-changes .claude/agents/plan-reviewer.md
```

Behavior tests (skill: criteria 2, 3 and 4 apply; reviewer: criterion 1 applies):

| Case | Task | Checks |
| --- | --- | --- |
| `skill-engine-rng` | With and without the skill: plan "implement MRG32k3a with RngStreams streams and substreams" for `@takt/sim-engine`. | plan in `docs/plans/` format with every section, including "Plano de testes" (unit, property and literature-case tests with fixed seeds, mutation target); values (seeds, moduli, test vectors) traced to `docs/product/references.md` or ADR-0011, or listed as questions; no guessed commands; tasks are TDD with rule IDs; determinism threats covered; no code bodies beyond the algorithm's literature formulas |
| `skill-use-case-without-docs` | With and without the skill: plan "publicar planta em grupo" (API, RN-PLT-002) while `docs/product/use-cases/` does not exist. | the request comes without context docs: it searches, shows candidates and asks for them; notices the missing use cases and asks before planning, or plans while listing it as an open question; security rows for IDOR, mass assignment and role from context; organization and role from context; no `organizationId` parameter on repository ports |
| `reviewer-planted-defects` | The reviewer, and a baseline general-purpose "review this plan" prompt, on a fixture plan with planted defects: `organizationId` from the request body, an untraced limit value, a port for a pure function, a generic `findAll()`, an undeclared deviation, a renamed interface between tasks, `Math.random` in the engine task. | reports the body-sourced organization, the untraced value, the missing IDOR test, the port, `findAll()`, the undeclared deviation, the interface mismatch and `Math.random`; each with location and evidence; confidence 80 or more; edits no files. Ran on 2026-10-21 with the two former reviewers (see `.claude/agent-notes/plan-reviewer/SOURCES.md`) |

## Maintenance

- Update `references/plan-template.md` when `code-style.md` decisions D1 to D5 are made (error style, transactions, commands).
- Fill `CLAUDE.md` "Commands" when the Nx workspace exists; plans read commands from there.
- Review the reviewer with the user after 5 reviewed plans, using `docs/plans/README.md`.
