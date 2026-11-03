# UC-SIM-003: Sugerir o aquecimento

> **Resumo.** No modo regime estável, a aplicação pede ao motor uma sugestão de aquecimento. O motor roda replicações piloto, aplica o MSER-5 a cada indicador e sugere o maior corte, com os dados para o gráfico. O usuário aceita ou edita o valor antes de executar.

Atualizado em 03/11/2026 · Marco 1 · Decisões: [PDR-0020](../../pdr/0020-modos-de-simulacao-e-aquecimento.md), [ADR-0011](../../adr/0011-motor-de-simulacao-e-esquema.md) · Base: [pesquisa sobre aquecimento](../../research/aquecimento-em-simulacao-didatica.md).

| Campo | Valor |
| --- | --- |
| Ator principal | Aplicação que chama o motor (casca do Worker no `takt-web-app`; nos testes, a suíte) |
| Escopo | `@takt/sim-engine`, caixa-preta |
| Nível | Objetivo do usuário |
| Interessados | **Professor e aluno:** um aquecimento com base, em vez de um número chutado, e ver no gráfico onde o corte cai. **Portfólio:** um diferencial que nenhuma ferramenta comercial pesquisada oferece (PDR-0020). |
| Pré-condições | Planta aceita pelo [UC-SIM-001](uc-sim-001-validar-planta.md). Um cenário no modo regime estável. |
| Garantia mínima | Nenhum aquecimento é aplicado sem o usuário aceitar ou editar o valor (RN-SIM-009). Uma sugestão inválida nunca é devolvida como válida. |
| Garantia de sucesso | O motor devolve o aquecimento sugerido (o maior entre os indicadores), o corte de cada indicador (vazão, WIP, lead time) e as séries médias usadas, para o gráfico. |
| Gatilho | A aplicação, no modo regime estável, pede a sugestão antes de executar o [UC-SIM-002](uc-sim-002-executar-simulacao.md). |
| Regras e decisões | [RN-SIM-009](../rules/simulation.md), [RN-SIM-008](../rules/simulation.md), [RN-SIM-001](../rules/simulation.md); ADR-0011, item 7 (MSER-5 como função pura sobre as séries); verificação no M/M/1 em [simulation.md](../simulation.md#validação-contra-a-literatura). Pendente na regra: número de replicações piloto e de tentativas (RN-SIM-009) |

## Cenário principal

1. A aplicação entrega a planta e o cenário.
2. O motor roda as replicações piloto a partir do sistema vazio e registra as séries por intervalo de vazão, WIP e lead time.
3. O motor calcula, para cada indicador, a série média entre as replicações piloto.
4. O motor aplica o MSER-5 a cada série média e obtém um corte por indicador.
5. O motor sugere o **maior** dos cortes (RN-SIM-009).
6. O motor devolve a sugestão, o corte de cada indicador e as séries médias.
7. O usuário aceita ou edita o valor na interface (marco 2 em diante), e o valor segue para o UC-SIM-002.

## Extensões

- **2a.** As replicações piloto passam de um teto de segurança: o motor para e lança `SIMULATION_LIMIT_EXCEEDED` (ADR-0011, ADR-0013).
- **4a.** O corte de algum indicador cai na segunda metade da série: o resultado é inválido. O motor estende a corrida e tenta de novo (RN-SIM-009).
- **4b.** Depois do número máximo de tentativas, o corte ainda é inválido: o motor devolve o resultado sem sugestão, marcado como inválido, para o usuário decidir (RN-SIM-009).

## Em aberto

Nenhuma decisão de produto.
