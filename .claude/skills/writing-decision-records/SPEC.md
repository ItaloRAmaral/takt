# Spec: writing-decision-records

## Intent

Keeps Takt's decision records few, sourced and immutable once accepted: it records a decision only when a future reader would need it, drafts PDRs and ADRs that follow the Takt templates and labels, and carries an acceptance through to the rules, indexes and living docs, so nothing contradicts the record afterwards.

## Scope

- In scope: deciding whether a decision deserves a record; choosing PDR or ADR; drafting, editing drafts, accepting, superseding; derived rules and living-doc updates on acceptance; asking about rejection.
- Out of scope: research reports (`docs/research/`, with the user's permission), implementation plans and their deviations (`planning-code-changes`), editing a rule's detail, architecture docs written for their own sake.

## Triggers

Test examples for the description, not rules of the skill. Draft, pending the user's review.

Should trigger:

1. vamos escrever o ADR da D3, Result ou exceções
2. cria um PDR para limite de plantas por grupo
3. aceito o ADR-0013
4. quero mudar o ADR-0009 para cobertura de 85%
5. isso que você propôs no plano contradiz o ADR-0002, e agora?
6. o PDR-0014 precisa mudar, o roteamento vai ser automático também
7. registra essa decisão do TypeScript 7
8. rejeito o PDR-0022
9. a skill de testes propôs RN-SIM-013 sem PDR, cria o PDR
10. faz um ADR para hospedagem no GCP

Should not trigger:

1. atualiza o docs/architecture/takt-core-api.md com a nova pasta
2. troca o limite de 50 para 100 na RN-GRP-002
3. planeja a implementação do caso de uso de publicar planta
4. pesquisa como outros simuladores tratam aquecimento
5. sobe a versão do Vitest para a última patch
6. o que diz o ADR-0011 sobre o gerador?
7. adiciona uma referência no references.md
8. escreve o caso de uso do marco 1
9. vou quebrar a regra de 40 linhas nesta função, justifica no plano
10. revisa o plano em docs/plans

## Runtime contract

- First actions: apply the three criteria (or an "always a record" case); if started by Claude on its own, ask the user before creating files; read the PDRs, ADRs, rules and docs the decision touches.
- Output: a draft record, its index row and references; or, on acceptance, the list of files changed; always the hand-over in `SKILL.md`.
- Hard constraints: never edit an accepted record except the superseded status note; never accept without the user's explicit word for that record; every fact sourced and every claim labeled; no testable rule text inside a PDR; ADR "Riscos de segurança" and "Conformidade" always filled; no git commands that commit or publish.

## Files

| File | Loaded when |
| --- | --- |
| `SKILL.md` | the skill is used |
| `references/when-to-record.md` | deciding whether to record, and PDR or ADR |
| `references/writing.md` | drafting or checking a draft |
| `references/lifecycle.md` | numbering, index, acceptance, rejection, superseding |
| `SOURCES.md`, `SPEC.md` | maintenance only |

## Validation

Structural:

```bash
node .claude/skills/writing-skills-and-agents/scripts/validate.mjs .claude/skills/writing-decision-records
```

Behavior tests (criteria 2, 3 and 4 apply), proposed, not run:

| Case | Task | Checks |
| --- | --- | --- |
| `skip-trivial` | With and without the skill: "registra que vamos usar o Vitest 3.2.4 em vez do 3.2.3". | no record created; says where it goes instead; cites the criteria |
| `supersede-accepted` | With and without the skill: "muda o ADR-0009 para cobertura de 85%". | ADR-0009 untouched; new ADR-0013 draft with "Substitui: ADR-0009"; "Contexto" says what changed; asks why 85% instead of inventing a reason; index row "Proposto" |

## Maintenance

- Update when the templates, the READMEs' status rules or `CLAUDE.md` "How we work" change.
- Record the user's answers on rejection and partial superseding in the READMEs, then replace the "ask the user" steps in `references/lifecycle.md`.
- When the pending table in `code-style.md` empties, update the "always a record" list.
