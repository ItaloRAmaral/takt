# UC-SIM-001: Validar uma planta

> **Resumo.** A aplicação entrega um documento de planta e recebe de volta a planta aceita ou a lista completa de problemas, cada um ligado ao elemento e ao campo. Nada é executado com uma planta inválida.

Atualizado em 03/11/2026 · Marco 1 · Decisões: [ADR-0008](../../adr/0008-validacao-de-dados.md), [ADR-0011](../../adr/0011-motor-de-simulacao-e-esquema.md).

| Campo | Valor |
| --- | --- |
| Ator principal | Aplicação que chama o esquema (casca do Worker no `takt-web-app`; nos testes, a suíte; no marco 4, a API) |
| Escopo | `@takt/plant-schema`, caixa-preta |
| Nível | Objetivo do usuário; também incluído no [UC-SIM-002](uc-sim-002-executar-simulacao.md) e no [UC-SIM-003](uc-sim-003-sugerir-aquecimento.md) |
| Interessados | **Professor:** não perder a aula com uma planta que não roda. **Aluno:** ver o erro no elemento certo (RN-EDT-004), não uma mensagem genérica. **Motor:** só receber plantas que ele sabe executar. |
| Pré-condições | Um documento de planta em JSON, de qualquer origem (editor, arquivo importado, planta de teste). |
| Garantia mínima | Uma planta inválida nunca é aceita, e nenhum problema é escondido: todos são devolvidos de uma vez. |
| Garantia de sucesso | A planta é aceita, na versão atual do esquema, pronta para o motor. |
| Gatilho | A aplicação vai executar a planta ou quer mostrar seus erros no editor. |
| Regras e decisões | [RN-SIM-004](../rules/simulation.md), [RN-SIM-005](../rules/simulation.md), [RN-SIM-006](../rules/simulation.md) (limite de retrabalho como parâmetro), [RN-EDT-001](../rules/editor.md), [RN-EDT-004](../rules/editor.md), [RN-JSN-005](../rules/json.md), [RN-SIM-007](../rules/simulation.md) (aquecimento obrigatório no regime estável); ADR-0008, itens 9 a 13. Pendente em outro doc: onde fica a regra de roteamento ([plant-model.md](../plant-model.md)) |

## Cenário principal

1. A aplicação entrega o documento.
2. O esquema lê o `schemaVersion`. Se for de uma versão anterior, aplica as migrações em cadeia até a atual (RN-JSN-005).
3. O esquema faz a validação **estrutural**: tipos, campos obrigatórios e faixas (por exemplo, `defectRate` entre 0 e 1; replicações entre 5 e 100, RN-SIM-003; no modo regime estável, aquecimento informado, RN-SIM-007).
4. O esquema faz a validação **semântica**: conexões apontam para elementos existentes; há fonte e saída; nenhum elemento solto; nenhuma sobreposição na grade (RN-EDT-001); toda saída com vários destinos tem regra de roteamento (RN-SIM-004); os percentuais de cada regra somam 100% (RN-SIM-005).
5. Não há problema: o esquema devolve a planta aceita.

## Extensões

- **2a.** O `schemaVersion` é mais novo que o do sistema: a validação para, com `UNSUPPORTED_SCHEMA_VERSION`.
- **3a.** Há problemas estruturais: o esquema devolve a lista `{ elementId?, path, code }`.
- **4a.** Há problemas semânticos: o esquema devolve a lista `{ elementId?, path, code }` com todos eles. Quem chama traduz em `INVALID_PLANT` (execução) ou `INVALID_PLANT_FILE` (arquivo importado), conforme o ADR-0008.

## Em aberto

Nenhuma decisão de produto.
