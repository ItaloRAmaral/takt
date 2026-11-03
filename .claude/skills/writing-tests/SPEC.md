# Spec: writing-tests

## Intent

Makes every test in Takt catch a real break and follow ADR-0009: written first for new code, written as covered scenarios for existing code, named by rule ID, and proven by running, coverage and mutation. Where rules are few, it finds scenarios in the code itself, and turns uncovered business behavior into proposed rules instead of nameless tests.

## Scope

- In scope: writing and changing tests at the ADR-0009 levels; the red-green-refactor loop under an approved plan; scenario lists for existing code; proposing rules for business behavior that has none; running tests, coverage and mutation and reporting the output.
- Out of scope: planning the change (`planning-code-changes`), reviewing code, choosing test tools (ADR-0009 decides), Playwright specifics (later).

## Triggers

Test examples for the description, not rules of the skill. Draft, pending the user's review.

Should trigger:

1. escreve os testes da tarefa 1 do plano do MRG32k3a
2. quais cenários faltam testar no event-queue.ts?
3. a cobertura do domínio de plantas caiu pra 84%, sobe isso
4. o Stryker deixou 12 mutantes vivos no motor, resolve
5. achei um bug: publicar duas vezes duplica a linha; cria o teste de regressão
6. testa o caso de uso de publicar planta
7. write property tests for Little's law in the engine
8. esse arquivo não tem regra RN, mas precisa de teste
9. implementa a tarefa 2 do plano aprovado (TDD)
10. revisa se esses testes estão no padrão AAA

Should not trigger:

1. planeja a implementação da fila de eventos
2. roda a suíte de testes e me diz se passou
3. revisa o código desse PR
4. escreve a regra RN para limite de grupos
5. configura o Stryker no CI
6. pesquisa qual biblioteca de property testing é melhor
7. cria uma skill de testes de interface
8. muda o nome da função publishTo para publish
9. atualiza o ADR-0009
10. explica o que é teste de mutação

## Runtime contract

- First actions: find the mode (A: under an approved plan; B: existing code); read the rules, use cases, ADRs and code involved; for Mode B, build the scenario list and get approval first.
- Output: tests in the project, the run, coverage and mutation output, and the hand-over in `SKILL.md`.
- Hard constraints: never infer expected values; AAA without comments, one Act, no logic, ID in the name; no production code without a failing test first (Mode A); never change an expected value to make a test pass; never edit production code to prove a test; never lower thresholds or hide survivors; commands only from `CLAUDE.md`; no git commands that commit or publish.

## Files

| File | Loaded when |
| --- | --- |
| `SKILL.md` | the skill is used |
| `references/scenarios.md` | finding scenarios, proposing rules |
| `references/writing.md` | writing a test |
| `references/verifying.md` | running, coverage, mutation, reporting |
| `SOURCES.md`, `SPEC.md` | maintenance only |

## Validation

Structural:

```bash
node .claude/skills/writing-skills-and-agents/scripts/validate.mjs .claude/skills/writing-tests
```

Behavior tests (criteria 2, 3 and 4 apply), with fixtures because the repository has no code yet:

| Case | Task | Checks |
| --- | --- | --- |
| `mode-b-code-without-rules` | With and without the skill: "quais cenários faltam testar?" on a fixture TypeScript module (an event queue with a tie-break, a guard and an error) that cites no rule. | scenario list with source, level, name and break for each; scenarios from every branch, the guard's boundaries and the error; technical scenarios ask how to name them instead of inventing IDs; no test files written before approval |
| `mode-a-test-quality` | With and without the skill: write the test for one task of a fixture plan whose rule says a real plant cannot be published (`FORBIDDEN`). | AAA with blank lines and no comments; one Act; no logic; name starts with the rule ID, in English; expected value is a literal code, not computed; factories with fixed data; no mock of own code; asks for the missing test command instead of guessing it |

## Maintenance

- Update `references/writing.md` when ADR-0009 or the error style (ADR-0013) changes.
- Fill the commands in `CLAUDE.md` when the Nx workspace exists, then rerun the behavior tests on real code.
- Add a Playwright reference when the front-end starts.
