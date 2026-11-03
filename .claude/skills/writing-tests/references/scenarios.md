# Finding scenarios

## Contents

- Sources, in order
- Reading the code for scenarios
- When a scenario has no rule
- Scenario list format

## Sources, in order

1. **The approved plan:** "Plano de testes", "Foco de revisão" and "Segurança" (Mode A takes its scenarios from here).
2. **Rules and use cases:** every `RN-...` the code implements (`docs/product/rules/`), its "Exemplo" and "Quando violada", and the use case steps (`docs/product/use-cases/`).
3. **ADRs of the area:** "Conformidade" lists tests the decision requires (for example ADR-0003: isolation between organizations; ADR-0011: determinism and literature cases; ADR-0006: role × route matrix).
4. **The code itself**, below. This is what finds the cases the docs never mention, and it matters most where rules are few.

## Reading the code for scenarios

Test at the public boundary of the unit (its seam: the entity's methods, the use case's `execute`, the route, the engine's `run`), never private functions. For each public entry point, walk through:

| Look for | Scenario it gives |
| --- | --- |
| each branch (`if`, `switch` case, ternary, early `return`) | one scenario per side of the branch |
| each error raised or returned, with its code | the input that triggers it, and the code expected |
| each validation or guard | just inside and just outside the accepted range |
| boundaries | zero, one, many; empty and missing; minimum, maximum, maximum + 1; limits from the plan or the engine's safety caps |
| state changes | the state before and after; an invalid transition |
| side effects (save, audit, log step, event) | that it happens on success and does not happen on failure |
| input that comes from a user | malformed, unknown fields, another organization's IDs (IDOR), a role without permission |
| ordering and time (engine) | ties at the same instant, determinism with a fixed seed, same output on a second run |
| arithmetic | units, rounding, precision limits, division by zero |
| concurrency (API) | two requests at once against a limit or a unique constraint |
| a comparison or ordering with several keys (sort, priority, tie-break) | one scenario per level, where that key decides and the next one would say the opposite; swapping the order of two keys must fail a test |
| internal paths reached only by certain input shapes (data-structure branches, rebalancing, retries) | drive each path through the public interface with an input built to force it; do not rely on a big random input happening to cover it |
| how callers really use it | the realistic sequence of operations: interleaved calls, reuse after emptying, after filling, after an error |

For each scenario, name the break it catches: the production change that would make the test fail. A scenario that catches no plausible break is not worth a test, but list it under "left out" with the reason, so the user sees what was cut.

**Public contract vs internal detail.** Everything the module exports, and every field of every value it returns, is public contract and may be tested; asserting it is not a change detector. Only what never leaves the module (private fields, private functions) is internal. Check the exports and return types in the code before deciding; do not ask the user what the code already answers.

## When a scenario has no rule

| Scenario | What to do |
| --- | --- |
| business behavior (what a user, role, plan or plant may or may not do) with no `RN-...` | propose a rule in the format of `docs/product/rules/README.md`, in pt-BR, with its "Origem" (the PDR it comes from). If no PDR covers the intent, say so: a new intent needs a PDR, and that is the user's decision. Write the test only after the user approves the rule and it is added to the rules file. |
| anything else (technical behavior, a contract between modules, an engine invariant) with no ID to name the test by | ask the user how to name it; do not invent an ID |
| code behavior that contradicts a rule | a bug or a stale rule: stop and ask |

Proposed rule format:

```markdown
### RN-XXX-NNN: <título curto>

- **Enunciado:** <a regra, exata e testável>
- **Origem:** <PDR-NNNN, ou "nenhum PDR cobre: pergunta ao usuário">
- **Exemplo:** <um caso concreto, tirado do código analisado>
- **Quando violada:** <o que o sistema faz e o código de erro>
```

Use the next free number in the domain's file; never reuse an ID (`docs/product/rules/README.md`).

## Scenario list format

Show this to the user before writing tests for existing code (Mode B), as the short plan's "Testes" item or the full plan's "Plano de testes":

| # | Scenario | Source | Level (ADR-0009) | Test name | Break it catches |
| --- | --- | --- | --- | --- | --- |
| 1 | planta real recusada | RN-PLT-002 | unit | `RN-PLT-002: refuses to publish a real plant` | `publishTo` stops checking the kind |
| 2 | fila com dois eventos no mesmo instante | code: `event-queue.ts` | unit | (ask the user) | tie-break uses insertion order |
