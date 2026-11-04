# Motor de simulação (`@takt/sim-engine`)

> **Resumo.** Como o motor é construído hoje. O motor é um núcleo funcional em TypeScript puro, sem React, Three.js nem DOM, que roda num Web Worker do `takt-web-app`. O porquê está no [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) e no [ADR-0013](../adr/0013-erros-esperados.md); o plano que o constrói é o [roteiro do motor](../plans/2026-11-04-roteiro-motor.md). Este documento cresce a cada sub-plano.

Atualizado em 04/11/2026 (sub-plano 1, tarefa 1).

## Estrutura

Pastas por conceito ([guia de estilo](code-style.md), seção 7), dentro de `libs/sim-engine/src/`:

| Pasta | O que tem | Sub-plano |
| --- | --- | --- |
| `errors/` | `SimulationError`, o erro esperado do motor | 1 |
| `testing/` | Auxiliares só de teste (`catchError`); não saem pelo `index.ts` | 1 |
| `rng/` | Gerador MRG32k3a e índice da sequência por chave | 1 (a preencher) |
| `distributions/` | Distribuições por inversão | 1 (a preencher) |

O `src/index.ts` é a API pública: hoje só `SimulationError` e `SimulationErrorCode`. O resto é interno e usado pelos sub-planos seguintes.

## Erros

- **Erro esperado:** `SimulationError`, com `code` literal (`'SIMULATION_LIMIT_EXCEEDED'` ou `'INVALID_PLANT'`) e `name = 'SimulationError'`. A mensagem é interna, para o log. Ainda não há `details`: o formato de cada código é declarado pelos sub-planos 4 e 6, que lançam os primeiros erros com dados.
- **Defeito:** qualquer outro erro, sem `code` (ADR-0013).
- **Teste:** em código síncrono, `catchError(fn)` devolve o erro lançado e falha se nada for lançado; em código assíncrono, `await expect(promise).rejects.toMatchObject({ code })`.
- **Conferência do ADR-0013 ("Em aberto"), feita em 04/11/2026 com o Vitest 5.0.5:** `toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error`, e um `code` diferente falha. Testes em `src/errors/simulation-error.spec.ts`: `toMatchObject checks the code of a simulation error`, `toMatchObject fails on a different code` e `rejects.toMatchObject checks the code of a rejected simulation error`. Pelos critérios da skill de registros, isso confirma o ADR-0013 e não pede registro novo.
- **Mutante equivalente conhecido:** trocar a mensagem do defeito do `catchError` por texto vazio sobrevive, porque nenhum teste verifica mensagens. Fica sem marcação no código, que só leva JSDoc nas exportações públicas.

## Gerador

A preencher na tarefa 2 do sub-plano 1.

## Distribuições

A preencher nas tarefas 4 e 5 do sub-plano 1.
