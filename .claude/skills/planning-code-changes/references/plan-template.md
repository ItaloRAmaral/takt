# Plan template

## Contents

- What a plan contains, and what it leaves out
- Short plan (pt-BR, in the conversation)
- Detailed plan template (pt-BR)
- Task format
- Roadmap template (pt-BR)

## What a plan contains, and what it leaves out

A step is done when the implementer can write exactly one reasonable thing from it: unambiguous, not complete.

| Kind of step | Carries |
| --- | --- |
| test | the test name (starting with the rule or use case ID, in English like all code) and its assertions, with the exact values from the docs |
| code | the exact signature (name, parameters, return type), the file, and the values the docs pin; a body only for an algorithm the signature and tests do not determine (for example, a formula from the literature, with its source) |
| verification | the command and the output that means it passed; take commands from `CLAUDE.md` "Commands", and if a command is not there, ask |
| reference to another task | point to that task's "Interfaces" block; do not repeat its code |

Two failures to avoid: a plan longer than the code it describes has written the code instead; a line that decides nothing ("TBD", "handle edge cases", "add appropriate validation", "write tests for the above", a type no task defines) is a gap.

Tasks: a task is the smallest unit with its own test cycle that a reviewer could approve or reject on its own. Fold setup, configuration and docs into the task whose deliverable needs them. Each task ends with something testable. The last task also sets the plan status to "Concluído" in its header and in the `docs/plans/README.md` index (and the roadmap status, in the last sub-plan of a roadmap): the pull request that delivers the code closes the plan, so nobody has to remember it after the merge.

Files: one clear responsibility per file; files that change together live together (ADR-0002 groups by context, then by layer). In existing code, follow the established pattern.

## Short plan (pt-BR, in the conversation)

For a small, local change. No file; the user approves it in the conversation. If writing it shows a rule, security, the database or the engine's determinism is involved, or the change is not local, stop and write a full plan instead.

````markdown
**Plano curto: <a mudança>**

1. **O que muda:** <uma ou duas frases, com o valor exato e a fonte (documento ou pedido)>
2. **Arquivos:** <lista>
3. **O que pode quebrar:** <casos de borda, regras `RN-...` e chamadores afetados, efeito em segurança; "nada" só depois de procurar no código>
4. **Testes:** <teste a criar ou ajustar, com o nome começando pelo ID; teste existente que deve continuar passando>
5. **Perguntas:** <dúvidas que o código e os documentos não responderam; vazio se não houver>

Posso seguir?
````

## Detailed plan template (pt-BR)

````markdown
# Plano: <nome da mudança>

| Campo | Valor |
| --- | --- |
| Status | Proposto · Aprovado · Concluído |
| Data | DD/MM/AAAA |
| Pedido | <as palavras do usuário> |
| Contexto | <os documentos que definem o pedido, enviados ou confirmados pelo usuário: caso de uso, regras, seção de `docs/product/`, ADR> |
| Roteiro | <link do roteiro, se este plano for um sub-plano> |

**Objetivo:** <uma frase sobre o que isto entrega>

**Arquitetura:** <duas ou três frases sobre a abordagem e onde o código vai morar>

**Regras e registros:** <RN-..., UC-..., PDRs e ADRs que este plano implementa ou respeita, com link>

## Restrições globais

<Uma linha por restrição que vale para todas as tarefas, com o valor exato copiado da fonte: limites, unidades, códigos de erro, versões, regras do CLAUDE.md que pesam aqui.>

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |

## Foco de revisão

<As entradas e falhas que o pedido implica, mas que nenhum teste do caminho feliz exercita: vazias, ausentes, duplicadas, fora da faixa, concorrentes, maliciosas, limites, falhas parciais. Uma linha cada, com o comportamento que uma pessoa razoável esperaria, da mais provável à menos. Cada linha ganha um teste na tarefa dona do código. Lista vazia significa "verifiquei e não achei", nunca "pulei".>

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |

<Uma linha por ameaça da seção "Riscos de segurança" dos ADRs da área, e por item de segurança da seção 11 do `code-style.md` que se aplica. Se uma ameaça não se aplica, diga por quê em vez de omitir.>

## Plano de testes

<Os testes são planejados com o mesmo cuidado que o código. Níveis e metas vêm do ADR-0009; não invente outros.>

| Requisito, regra ou linha do foco de revisão | Nível | Teste (nome começa com o ID, quando houver) | Tarefa |
| --- | --- | --- | --- |

- **Níveis usados e por quê:** <unitário (entidades, casos de uso com adaptadores em memória, funções do motor); integração (Prisma, RLS e isolamento contra PostgreSQL real, com o usuário `takt_app`); API (matriz papel × rota, validação, formato de erro, log canônico); propriedade (fast-check, por exemplo Lei de Little e conservação no motor); ponta a ponta (Playwright). Diga quais níveis este plano usa e por que os outros não se aplicam.>
- **Dados de teste:** <fábricas e valores fixos; cada teste cria os próprios dados; nada aleatório sem semente>
- **Casos de borda e de segurança:** <cada linha de "Foco de revisão" e de "Segurança" com o teste que a prova>
- **Metas:** <90% de linhas e ramificações; mutação de 80% se o plano toca o motor ou o domínio da API; exclusões de cobertura só da lista do ADR-0009, com o motivo>
- **Como rodar:** <comandos do `CLAUDE.md` "Commands"; se faltarem, pergunte>

## Desvios do guia de estilo

| Princípio quebrado | Critério e evidência | Alternativa descartada | Gatilho de revisão | Impacto em testes |
| --- | --- | --- | --- | --- |

<Vazio quando não há desvio. Nunca inclui regra do CLAUDE.md, de ADR ou PDR aceito, ou RN: essas pedem registro novo, listado abaixo.>

## Registros novos propostos

<PDR ou ADR que este plano precisa e ainda não existe, com o motivo. Vazio quando não há.>

## Cerimônia observada

<Cerimônia imposta por ADR que não agrega aqui (caso de uso que só repassa, mapper trivial), para a revisão do ADR-0002 no fim do marco 4. Vazio quando não há.>

---

## Tarefa 1: <componente>

(formato na seção "Task format")

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |

<Fonte: autorrevisão ou plan-reviewer. Achado rejeitado fica registrado com o motivo.>
````

## Task format

````markdown
## Tarefa N: <componente>

**Arquivos:**
- Criar: `caminho/exato/arquivo.ts`
- Modificar: `caminho/exato/existente.ts`
- Testar: `caminho/exato/arquivo.spec.ts`

**Interfaces:**
- Consome: <o que usa de tarefas anteriores, com assinaturas exatas>
- Produz: <o que as próximas tarefas usam: nomes, parâmetros e tipos de retorno>

- [ ] **Passo 1: escrever o teste que falha**

```ts
it('RN-PLT-002: refuses to publish a real plant', () => {
  const plant = makePlant({ kind: 'real' });

  const error = catchError(() => plant.publishTo(makeGroup()));

  expect(error).toMatchObject({ code: 'FORBIDDEN' });
});
```

- [ ] **Passo 2: rodar e ver falhar**

Comando: <do CLAUDE.md "Commands"> · Esperado: FALHA porque `publishTo` não existe

- [ ] **Passo 3: implementar `publishTo(group: Group): void` em `caminho/exato/arquivo.ts`, lançando `RealPlantNotPublishableError`**

<Uma linha sobre a abordagem, só quando a assinatura e o teste deixam escolha.>

- [ ] **Passo 4: rodar e ver passar**

Comando: <...> · Esperado: PASSA

**Commit sugerido:** `feat(takt-core-api): <...>` · arquivos: <lista>
````

Expected errors are exceptions with a `code`, asserted through `catchError` in sync code and `rejects` in async code (ADR-0013).

## Roadmap template (pt-BR)

Use when the request covers several parts that can each ship and be tested on their own.

````markdown
# Roteiro: <nome>

| Campo | Valor |
| --- | --- |
| Status | Proposto · Aprovado · Concluído |
| Data | DD/MM/AAAA |
| Pedido | <...> |
| Contexto | <documentos que definem o pedido> |

**Objetivo:** <uma frase>

**Regras e registros:** <...>

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |

## Sub-planos

| # | Sub-plano | Entrega testável | Testes que provam a entrega | Depende de | Regras e registros | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | <nome> | <o que funciona> | <níveis e casos principais, por exemplo "propriedade: conservação; literatura: M/M/1 dentro do intervalo de confiança"> | — | <...> | A planejar |

## Estratégia de testes do conjunto

<Como os sub-planos se provam juntos: testes que atravessam sub-planos, casos da literatura, metas de cobertura e mutação do ADR-0009 por projeto.>

## Interfaces entre sub-planos

<Os contratos que um sub-plano entrega a outro: tipos, funções públicas, formatos. Decididos aqui para que cada sub-plano possa ser detalhado sozinho.>

## Riscos e decisões pendentes

<Decisões em aberto que bloqueiam algum sub-plano (por exemplo, as pendências do guia de estilo), com o sub-plano afetado.>
````

Each sub-plan is then written with the detailed template, one at a time, after the roadmap is approved.
