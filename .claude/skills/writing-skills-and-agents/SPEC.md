# Spec: writing-skills-and-agents

## Intent

Gives every skill and subagent in the Takt repository the same authoring workflow, so they are built on verified sources, use the smallest shape and tool set that works, and are tested in proportion to the damage a mistake could cause.

## Scope

- In scope: creating, updating, reviewing and testing skills (`.claude/skills/`) and subagents (`.claude/agents/`), their `SOURCES.md` and `SPEC.md`, and the matching entries in `docs/product/references.md`.
- Out of scope: hooks and `settings.json` (handled directly, see `.claude/settings.json`), running existing skills, `CLAUDE.md` edits that do not come from a skill change, research reports.

## Triggers

Draft, pending the user's review. The user writes mostly in Portuguese, so most requests are in Portuguese.

Should trigger:

1. cria uma skill pra gerar os testes a partir das regras RN
2. quero um agente revisor de código só de leitura
3. transforma esse passo a passo que a gente sempre faz em um comando /algo
4. melhora a description da skill de testes, ela nunca é usada
5. o agente de segurança está deixando passar coisa, ajusta ele
6. a parte de como escrever ADR no CLAUDE.md virou um procedimento, vira uma skill?
7. testa se a skill de revisão funciona sem o contexto da nossa conversa
8. create a subagent that checks RLS policies on new migrations
9. olha essa skill da sentry e cria a nossa em cima dela: https://github.com/getsentry/skills/tree/main/skills/security-review
10. revisa o frontmatter do agente code-reviewer, acho que ele tem ferramenta demais

Should not trigger:

1. adiciona um hook que bloqueia rm -rf
2. libera o pnpm test sem pedir permissão toda vez
3. roda a revisão nesse PR
4. revisa o código desse diff
5. escreve o ADR da decisão de usar Redis
6. atualiza o CLAUDE.md com os comandos do Nx
7. cria o caso de uso UC-PLT-001
8. pesquisa quais skills de teste a comunidade mais usa
9. configura o claude-code-action no CI
10. quais skills eu tenho instaladas?

## Runtime contract

- First actions: find the operation, read prior art and existing notes, get answers to the intent questions.
- Output: the hand-over in `SKILL.md` step 7 (summary, changes, validation, open gaps, commit message and files).
- Hard constraints: English files; sources for every factual claim; at most 3 questions per message; no installing or running third-party material; no git commands that create commits or publish; behavior tests only after the user agrees.

## Files

| File | Loaded when |
| --- | --- |
| `SKILL.md` | the skill is used |
| `references/skill-format.md` | writing or checking a skill |
| `references/agent-format.md` | writing or checking an agent |
| `references/writing-rules.md` | choosing the shape, writing instructions, precision pass |
| `references/sources-and-spec.md` | filling notes or adapting third-party material |
| `references/testing.md` | deciding and running tests |
| `scripts/validate.mjs` | executed in step 6, never loaded |
| `SOURCES.md`, `SPEC.md` | maintenance only |

## Validation

Structural:

```bash
node .claude/skills/writing-skills-and-agents/scripts/validate.mjs .claude/skills/writing-skills-and-agents
```

Behavior tests (criteria 2, 3 and 4 apply):

| Case | Task | Checks |
| --- | --- | --- |
| `inline-read-only-skill` | Create a skill that lists the business-rule IDs (`RN-...`) mentioned in the files changed on the current branch. | directory name equals frontmatter `name`; description in third person with "Use when"; `SOURCES.md` exists; shape named with the reason simpler shapes were rejected (or "inline" chosen); no `allowed-tools`, or only exact read-only commands; validator reports 0 errors |
| `read-only-agent` | Create a subagent that checks that every relative Markdown link in `docs/` points to an existing file. | file name equals `name`; `tools` written explicitly without `Edit`, `Write` or `Agent`; prompt states the input and the exact output format; `.claude/agent-notes/<name>/SOURCES.md` exists; validator reports 0 errors |

## Maintenance

- Update `references/skill-format.md` and `references/agent-format.md` when the Claude Code docs change a field; record the new read date in `SOURCES.md`.
- Update `SKILL.md` and this spec when the Takt rules in `CLAUDE.md` change.
- Add a behavior-test case whenever a real skill or agent built with this skill fails in a way the existing cases would not catch.
