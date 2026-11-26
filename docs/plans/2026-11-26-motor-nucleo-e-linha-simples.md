# Plano: núcleo de eventos e linha simples (sub-plano 4)

| Campo | Valor |
| --- | --- |
| Status | Concluído (26/11/2026) |
| Data | 26/11/2026 |
| Pedido | "Pull feito, pode começar o sub-plano 4" (26/11/2026), para a linha 4 do roteiro aprovado: "Compilação da planta (sobreposições sem mesclagem profunda, segundos, grafo, sequências por chave); lista de eventos com desempate; fonte, estação, buffer e expedição; uma replicação no modo turno com log, indicadores (vazão, WIP, lead time, utilização), séries por minuto e estado final; tetos de segurança" |
| Contexto | [Roteiro](2026-11-04-roteiro-motor.md) (linha 4, interfaces, segurança, pendências do 4), [UC-SIM-002](../product/use-cases/uc-sim-002-executar-simulacao.md) passos 2 a 4 e 6, [RN-SIM-001, 013 e 014](../product/rules/simulation.md), [RN-EDT-003](../product/rules/editor.md), [códigos de problema](../product/rules/README.md), [PDR-0022](../pdr/0022-modelo-de-fluxo-da-planta.md), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) itens 2 a 5 e 8, [ADR-0008](../adr/0008-validacao-de-dados.md) (item 12 e poluição de protótipo), [ADR-0013](../adr/0013-erros-esperados.md), [ADR-0009](../adr/0009-estrategia-de-testes.md), [simulation.md](../product/simulation.md) (indicadores e validação), [sim-engine.md](../architecture/sim-engine.md), [plant-schema.md](../architecture/plant-schema.md), [workspace.md](../architecture/workspace.md), [pesquisa da literatura do motor](../research/literatura-do-motor.md) (Dₙ, LL.2, séries), [pesquisa do modelo de fluxo](../research/modelo-de-fluxo-da-planta.md) e debates, [code-style.md](../architecture/code-style.md) seções 3, 5, 7 e 10 |
| Roteiro | [Esquema da planta e motor (marco 1)](2026-11-04-roteiro-motor.md), sub-plano 4 |

**Objetivo:** o motor compila uma planta validada com o cenário aplicado e roda uma replicação no modo turno de uma linha com fontes, estações, buffers e expedições, devolvendo log, indicadores, séries por minuto e estado final, com determinismo e tetos de segurança.

**Arquitetura:** núcleo funcional em `libs/sim-engine/src`, em pastas por conceito (guia, seção 7): `model/` compila a planta (cenário aplicado pelo `applyScenario` do esquema, importado por um caminho próprio que não carrega o Zod, ADR-0015), `events/` guarda a lista de eventos, `replication/` roda uma replicação e move as peças, `stats/` acumula indicadores e séries. O `index.ts` ganha só os tipos do erro; a função pública `run` é do sub-plano 6.

**Regras e registros:** UC-SIM-002 (passos 2 a 4 e 6; extensões 2a e 4a); RN-SIM-001, 013, 014, a nova RN-SIM-018 (tarefa 1) e RN-EDT-003; PDR-0022 itens 1 a 3; ADR-0008 item 12; ADR-0011 itens 2 a 5 e 8 e "Riscos de segurança"; ADR-0013; ADR-0009; ADR-0014 (só `log` e `exp` próprios); o ADR-0015 proposto na tarefa 1.

## Restrições globais

- **Fora do escopo, até o sub-plano 5:** esteira, refugo, falhas, defeitos e regras de roteamento. A compilação lança um **defeito** (erro sem `code`, ADR-0013) para uma planta com elemento `production.conveyor` ou `production.scrap`, estação com `defectRate > 0` ou `failure` diferente de `null`, ou qualquer elemento com `routing` diferente de `null`. O sub-plano 5 remove essa recusa e os testes dela. Sem `routing`, todo elemento tem no máximo uma saída (o esquema exige regra com mais de uma: `ROUTING_REQUIRED`); entradas, várias.
- **Só o modo turno** (`shift`); `continue` e `steadyState` lançam defeito na compilação até o sub-plano 6. Uma replicação por chamada; média, IC e `run` são do 6.
- **Tempo em segundos**, `number` (ADR-0011, item 4); a duração é `durationH × 3600`. Nenhuma função aproximada de `Math` nem `**` (ADR-0014; lint).
- **Tetos obrigatórios nas opções, sem padrão** (roteiro, interface "Opções da execução"): os testes passam valores próprios.
- **Entrada já validada:** o motor recebe um `Plant` aceito pelo `validatePlant` (ADR-0008: validação uma vez, na borda); não revalida.
- **Dependência nova:** `fast-check` **4.10.3**, exata, em `devDependencies` da raiz (publicada em 18/11/2026, conferido com `npm view fast-check time` em 26/11/2026; a 4.11.0, de 21/11/2026, ainda não tem os 7 dias de `workspace.md`). O ADR-0009 já prevê o fast-check.
- **Sequências por chave** (roteiro, interface do gerador): `<id do elemento>:interarrival` para a fonte e `<id>:cycle` para a estação. Os propósitos `failure`, `repair`, `defect` e `routing` entram no 5, sem mudar as sequências existentes (cada chave é independente das outras).
- **Erros:** `SimulationError` com `code` e `details` tipados por código; o `INVALID_PLANT` traz a lista de problemas `{ elementId?, path, code }` ([rules/README.md](../product/rules/README.md), ADR-0008 item 12); defeito é `Error` sem `code` (ADR-0013). Nenhuma mensagem leva valor da planta além de IDs, que o esquema restringe a `^[A-Za-z0-9_-]{1,64}$` (ADR-0007).

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Como o motor recebe o cenário aplicado sem quebrar o ADR-0011, item 2 | ADR novo que complementa o item 2: o motor pode importar `applyScenario` (função pura, sem Zod) do esquema; o UC-SIM-002, passo 2, continua verdadeiro. Rejeitadas: reescrever a aplicação no motor (duas cópias que podem divergir) e a casca aplicar antes (muda o UC; esquecer daria resultado errado em silêncio). Para continuar "sem Zod", a importação é por um caminho próprio do pacote (`@takt/plant-schema/apply-scenario`), porque o `index.ts` do esquema carrega o Zod (achado 2 do revisor) | 26/11/2026 |
| Fim de serviço e chegada no mesmo instante | O fim de serviço vem antes: a vaga liberada no instante t serve à chegada do mesmo instante | 26/11/2026 |
| Instante da primeira chegada | Depois do primeiro intervalo sorteado, não em t = 0 (processo de Poisson que começa em 0, o do alvo de 3,79 do sub-plano 6) | 26/11/2026 |
| Evento exatamente no fim do turno | Não é processado: a replicação cobre [0, T) | 26/11/2026 |
| Lead time na série por minuto | Média das peças que saíram na fatia; `null` quando nenhuma saiu. O indicador final conta só as peças que saíram (censura do turno dita na interface, marco 2) | 26/11/2026 |
| A série contra o "lead time das peças que entraram" do ADR-0011, item 8 | O ADR-0015 também complementa o item 8: as peças que entraram no sistema são medidas na fatia em que saem | 26/11/2026 |
| A regra da peça que espera há mais tempo fora da estação, e o empate | Vale para todo elemento com várias entradas (estação, buffer, expedição); no empate, a ordem das conexões no documento. Escrito na RN-SIM-018 | 26/11/2026 |

## Decisões técnicas deste plano

Pendências do roteiro para o sub-plano 4, resolvidas aqui sem pergunta ao usuário porque não mudam número de produto:

| Pendência (roteiro) | Decisão | Motivo |
| --- | --- | --- |
| `TimeDistribution` → `Variability` | `dist` → `kind`; `maxSec: null` → `Infinity`; os outros campos iguais | A interface do sub-plano 1 já aceita `Infinity` |
| Normal truncada sem probabilidade em dupla precisão | `INVALID_PLANT` na compilação, com um problema `EMPTY_TRUNCATION` por distribuição, todos de uma vez, por uma função exportada de `truncated-normal.ts` que faz a mesma conta do sorteio | Pendência do 1: as duas contas não podem divergir |
| Colisão de chaves de sequência | `INVALID_PLANT` com um problema `STREAM_COLLISION` (`elementId` da segunda chave, caminho `[]`) | Formato do `INVALID_PLANT` no README das regras |
| Tempo não finito vindo de um sorteio | Defeito no agendamento (`scheduleSlot`), guarda única para todas as distribuições | Pendência do 1 |
| Custo do salto por chave (0,43 a 0,48 ms, medido) | Tabelas de A^(2^k) calculadas uma vez ao carregar o módulo; cada salto aplica só matriz × vetor por bit; medir antes e depois | 500 elementos × 6 propósitos (sub-plano 5) dariam ~1,4 s de compilação |
| Guardar Φ(a) e Φ(b) da normal truncada na compilação, e reavaliar a precisão com u perto de 1 (7,3×10⁻⁸ desvios) e um terceiro ramo | **Adiadas para o sub-plano 9**, que mede o custo de ponta a ponta | Sem medição de que pesa numa replicação; o guia pede medição antes de otimizar (seção 7); a precisão é a do sub-plano 1, sem mudança |
| `failure` e `repair` em sequências separadas; defeito e percentual sempre sorteando um número, mesmo com p = 0 | **Para o sub-plano 5**, que traz falhas, defeitos e roteamento | Nada disso sorteia neste plano |
| Testes longos a cada PR ou só no noturno | **Para o sub-plano 6**, que traz o primeiro teste longo (M/M/1); os testes deste plano rodam em menos de 5 s | Nenhum teste deste plano é longo |
| Teto de elementos do motor e limite do esquema "num só lugar" (roteiro, segurança) | **Para o sub-plano 9**, que fixa os padrões medidos dos tetos; até lá, o teto vem das opções e o esquema já para em 500 | O motor não importa `PLANT_LIMITS` (ADR-0015 libera só o `applyScenario`) |
| Ordem dos eventos no mesmo instante | Tempo, depois tipo (fim de processamento antes de chegada), depois ordem de agendamento (ADR-0011, item 3); depois de cada evento, as peças andam: os elementos com vaga puxam, **na ordem do documento**, e a varredura se repete até uma passada inteira não mover nada | Decisão do usuário acima; RN-SIM-018 e `sim-engine.md` |
| Estação "bloqueada por 0 s" | Pode acontecer dentro de um instante; soma 0 s ao tempo em cada estado e aparece no log só como `finish` seguido de `move` no mesmo t | Os indicadores usam duração; o log é para a cena reproduzir |
| WIP e lead time com a fila da fonte | Contam (RN-SIM-013) | Regra aceita |
| Fila da fonte de capacidade 0 | A chegada passa direto se o destino aceita naquele instante; senão se perde (M/M/1/1) | RN-SIM-013 (capacidade de 0 a 10 000) |
| Peça "que espera há mais tempo" (RN-SIM-014 e 018) | A de menor `availableSinceSec`: entrada na fila da fonte ou no buffer, ou fim de processamento numa estação bloqueada; vale para estação, buffer e expedição; empate pela ordem das conexões. O retrabalho na frente é do 5 | Decisão do usuário acima |
| Lista de eventos sem objeto por evento | *Heap* indexado por **posição** fixa (uma por elemento e tipo de evento: a próxima chegada de cada fonte, o fim de processamento de cada estação), com vetores de tempo e de ordem de agendamento; reagendar uma posição pendente é defeito até o 5, que adia o fim de processamento durante o reparo | Guia, seção 7 ("evite criar objeto por evento") |
| Escolha da entrada sem objeto por puxada | `chooseInput` lê vetores do estado da replicação (`availableSinceSec` por elemento), sem montar lista de candidatas | Guia, seção 7 |
| Numeração das peças | Cada chegada, perdida ou não, recebe o próximo número a partir de 1 | Liga os eventos `arrive` e `lose` do log à mesma chegada |
| Série por fatia | Fatias de 60 s (ADR-0011, item 8) desde 0; a última pode ser menor quando T não é múltiplo de 60 | Sem caso de uso que mude o intervalo; vira opção quando um pedir |
| `null` nas fatias sem saída, no MSER-5 e nas médias entre replicações | **Pendência nova para os sub-planos 6 e 7** no roteiro (a pesquisa aponta a correção do AutoSimOA para esse caso) | Nenhum deles existe neste plano |

## Foco de revisão

1. Fila da fonte cheia e fim de serviço no mesmo instante: a chegada entra (decisão do usuário).
2. Fila da fonte de capacidade 0 com a estação livre: a chegada passa; com a estação ocupada, se perde.
3. Evento exatamente em T: não processado; uma saída em T não conta.
4. Duas chegadas no mesmo instante, de fontes diferentes: ordem de agendamento (numeração das peças).
5. Ciclo 0: o fim cai no mesmo instante e a replicação termina (o intervalo da fonte é > 0 pelo esquema).
6. Estação com duas entradas, com e sem empate de `availableSinceSec`.
7. Nenhuma saída no turno: `leadTimeAverageSec` e o lead time de toda fatia são `null`; vazão 0.
8. Duração que não é múltiplo de 60 s: última fatia menor, com médias pelo próprio comprimento.
9. Teto igual ao valor: aceito; acima: `SIMULATION_LIMIT_EXCEEDED` com `details.limit`. Elementos e duração antes de começar; eventos dentro do laço.
10. Normal truncada sem massa, inclusive vinda de uma sobreposição, e duas ao mesmo tempo: `INVALID_PLANT` com um `EMPTY_TRUNCATION` por distribuição.
11. `scenarioId` inexistente: defeito (o `applyScenario` já lança erro sem `code`).
12. Planta com recurso do sub-plano 5, ou modo `continue` ou `steadyState`: defeito.
13. `__proto__` como chave do valor de uma sobreposição: nada muda no `Object.prototype`.
14. Colisão de chaves de sequência: `INVALID_PLANT` com `STREAM_COLLISION`.
15. Replicação fora de 0 a 2⁵¹ − 1: `RangeError` (comportamento do 1, mantido).

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |
| Planta desenhada para travar o motor (ADR-0011) | Tetos de elementos, duração e eventos, obrigatórios nas opções, com `SIMULATION_LIMIT_EXCEEDED` e `details.limit`; ciclo 0 e fila 0 terminam | 4 e 6: `UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED ...` (três), `RN-SIM-018: a zero cycle ...` |
| Poluição de protótipo (ADR-0008) | Cenário aplicado campo a campo pelo `applyScenario`, sem mesclagem; teste de defesa em profundidade com `__proto__` (o modo estrito do esquema já recusa essa chave) | 4: `applying a scenario with a __proto__ key changes no prototype` |
| Log de eventos muito grande (ADR-0011) | Log só com `recordLog: true` (o 6 liga só na primeira replicação) | 6: `UC-SIM-002: records no log unless asked` |
| Código do motor acessando o DOM ou a rede (ADR-0011) | Sem mudança: `tsc` sem `DOM` e lint, com conformidade | — |
| Importação de valores do esquema pelo motor (ADR-0011, item 2) | Lint permite no código do motor só o caminho `@takt/plant-schema/apply-scenario`; do pacote principal, só tipos; specs e auxiliares de teste podem importar valores (ADR-0015) | 1: quatro casos de conformidade |
| Tempo infinito no laço de eventos (pendência do 1) | Defeito no agendamento | 5: `refuses to schedule a time that is not finite` |
| Dado do usuário em mensagem de erro ou log (ADR-0007) | Mensagens e problemas só com IDs e caminhos, que o esquema restringe ao padrão ASCII | Revisão de código; sem teste próprio |
| Corpo enorme (ADR-0008) | O esquema limita a 500 elementos; o teto de elementos do motor vem das opções; "num só lugar" fica para o 9 (decisões técnicas) | 4: teto de elementos |

## Plano de testes

| Requisito, regra ou linha do foco de revisão | Nível | Teste | Tarefa |
| --- | --- | --- | --- |
| ADR-0015 no lint | unitário (conformidade) | `allows importing applyScenario from its plant schema path in engine code`; `rejects importing applyScenario from the plant schema package root in engine code`; `rejects importing validatePlant from the plant schema in engine code`; `allows value imports from the plant schema in engine specs` | 1 |
| ADR-0015 no esquema | unitário | `the apply-scenario path exports applyScenario` (spec do esquema importando `@takt/plant-schema/apply-scenario`) | 1 |
| Erro com `details` (ADR-0013, ADR-0008 item 12) | unitário | `a simulation error carries details for its code`; os três testes de `toMatchObject` do 1 passam com `details` | 2 |
| Foco 14 | unitário | `refuses two keys that share a stream with INVALID_PLANT and STREAM_COLLISION` (teste existente do 1, agora com `details`) | 2 |
| Saltos por tabela | unitário | os testes do `.res` oficial continuam passando; `findStreamStart gives the reference state for stream 2^64 − 1` e `createRandomStream gives the reference state for replication 2^51 − 1` (estados literais do script de referência) | 3 |
| TimeDistribution → Variability | unitário | `converts each time distribution to the engine variability` (tabela: `fixed`, `exponential`, `triangular`, `truncatedNormal` com `maxSec` número e `null`) | 4 |
| Foco 10 | unitário | `truncationMass is 0 for [40, 41] standard deviations above the mean`; `UC-SIM-002: refuses a plant whose truncated normals have no probability with INVALID_PLANT and one EMPTY_TRUNCATION each` (uma no elemento e uma por sobreposição) | 4 |
| Foco 11, 12 | unitário | `throws a defect for an unknown scenario`; `throws a defect for a plant with $feature until its sub-plan` (tabela: esteira, refugo, defeito, falha, roteamento, modo `continue`, modo `steadyState`) | 4 |
| Foco 13 | unitário | `applying a scenario with a __proto__ key changes no prototype` | 4 |
| Foco 9 (elementos, duração) | unitário | `UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED before starting when the plant has more elements than the limit`; `UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED before starting when the duration is longer than the limit`; `UC-SIM-002: accepts a plant at exactly the element and duration limits` | 4 |
| Compilação: grafo e sequências | unitário | `compiles inputs in connection order`; `the stream of a key does not depend on the other elements` | 4 |
| Lista de eventos (ADR-0011, item 3) | unitário e propriedade | `takes events by time, then kind, then scheduling order`; `refuses to schedule a slot already scheduled`; propriedade `takes every scheduled event once, in (time, kind, sequence) order` | 5 |
| RN-SIM-013 | unitário | `RN-SIM-013: a full source queue loses arrivals until the station frees a place`; `RN-SIM-013: an arrival with a queue of 0 passes when the station is free` | 6 |
| RN-SIM-014 | unitário | `RN-SIM-014: a station whose next station is busy stays blocked`; `RN-SIM-014: a station chooses the input whose part has waited longest` (tabela de `chooseInput`); `RN-SIM-014: a station fed by two sources pulls the part that has waited longest, ties by connection order` (duas variantes) | 6 |
| RN-SIM-018 (focos 1 a 5) | unitário | `RN-SIM-018: an end of processing frees the place for an arrival at the same instant`; `RN-SIM-018: the first arrival comes after the first interval`; `RN-SIM-018: an exit exactly at the end of the shift is not counted`; `RN-SIM-018: a zero cycle finishes at the same instant` | 6 |
| Linha em série (roteiro; pesquisa, Dₙ) | unitário | `UC-SIM-002: the n-th part leaves a fixed serial line at a + Σt + (n − 1)·max(a, t_max)` (três configurações) | 6 |
| Foco 9 (eventos) | unitário | `UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED when the run passes the event limit`; `UC-SIM-002: accepts a run with exactly the event limit` | 6 |
| Log, estado final | unitário | `UC-SIM-002: records no log unless asked`; `UC-SIM-002: the final state lists the parts in the line, the station states and the next arrival` | 6 |
| Conservação, determinismo, RN-EDT-003 | propriedade e unitário | `arrivals = lost + exits + parts left inside, for any line`; `RN-SIM-001: two runs of the same input give identical results`; `RN-EDT-003: a source, a station and a sink with the editor defaults run` | 6 |
| Indicadores e séries | unitário | `RN-SIM-013: WIP and lead time count the source queue: throughput 60 per hour, WIP 2.8, lead time 114 s`; `RN-SIM-013: counts 29 arrivals and 21 lost`; `UC-SIM-002: series slices of 60 s give exits, WIP and lead time, with null when nothing left`; `UC-SIM-002: the last slice is shorter when the duration is not a multiple of 60 s`; `RN-SIM-014: busy, blocked and starved ratios of a blocked station` | 7 |
| Foco 7 | unitário | `UC-SIM-002: lead time is null when no part leaves` | 7 |
| Lei de Little LL.2 (roteiro, ADR-0009) | unitário e propriedade | `UC-SIM-002: the time of every part inside the shift equals the WIP area (Little 2011, LL.2)`; propriedade `the time of every part inside the shift equals the WIP area, for any line` | 7 |

- **Níveis usados e por quê:** unitário (funções do motor), propriedade (fast-check: lista de eventos, conservação, determinismo e Lei de Little sobre plantas geradas, como pede o ADR-0009) e conformidade do lint. Sem integração, API nem ponta a ponta: o motor não tem banco, rota nem interface.
- **Dados de teste:** plantas montadas com os construtores de teste do motor (tarefa 4), conferidas pelo `validatePlant` nos specs (ADR-0015); valores fixos; semente 42 nos casos aleatórios; geradores do fast-check com `seed: 42` e `numRuns` fixo. Valores derivados do log saem de auxiliares de teste com spec (`exitTimesSec`, `sumTimeInWindowSec`), nunca de contas no teste.
- **Casos de borda e de segurança:** cada linha do foco de revisão e da segurança tem teste na tabela acima.
- **Metas:** 90% de linhas e ramificações; mutação de 80% no motor (ADR-0009). Exclusões: nenhuma nova.
- **Como rodar:** `pnpm nx test sim-engine --coverage`, `pnpm nx test plant-schema`, `pnpm nx lint sim-engine`, `pnpm nx typecheck sim-engine`, `pnpm nx run sim-engine:mutate`, `pnpm exec prettier --check .` e, no fim, `pnpm nx run-many -t lint typecheck test`.

## Desvios do guia de estilo

Nenhum.

## Registros novos propostos

- **ADR-0015, "Cenário aplicado e séries do núcleo do motor"** (tarefa 1, skill `writing-decision-records`), que **complementa** o ADR-0011, itens 2 e 8. Item 8: na série por intervalo, o lead time das peças que entraram no sistema é medido na fatia em que saem (média das saídas da fatia, `null` sem saída). Item 2: o código do motor pode importar `applyScenario` pelo caminho `@takt/plant-schema/apply-scenario`, que só importa tipos e não carrega o Zod; do pacote principal, continua só com tipos; specs e auxiliares de teste do motor podem importar valores do esquema (`validatePlant`, `createDefault*`) para montar plantas válidas. Passa nos três critérios: muda a fronteira entre as bibliotecas (difícil de reverter quando a casca depender dela), surpreende quem lê só o ADR-0011 e é uma troca real (duplicar 40 linhas ou mudar o UC-SIM-002).
- **RN-SIM-018, "Ordem no mesmo instante e de onde se puxa"** (tarefa 1, em `rules/simulation.md`), com as decisões do usuário de 26/11/2026: fim de processamento antes de chegada; primeira chegada depois do primeiro intervalo; replicação em [0, T); todo elemento com várias entradas puxa a peça que espera há mais tempo, com empate pela ordem das conexões no documento (estende a RN-SIM-014, que fala só da estação). Origem: ADR-0011, item 3, PDR-0022, item 3, e decisão do fundador.
- **Códigos de problema de execução** `EMPTY_TRUNCATION` e `STREAM_COLLISION` (tarefa 2), na tabela de códigos de [rules/README.md](../product/rules/README.md), com o nível "Execução".

## Cerimônia observada

Nenhuma.

---

## Tarefa 1: ADR-0015, RN-SIM-018, caminho do `applyScenario` e lint do motor

**Arquivos:**
- Criar: `docs/adr/0015-cenario-aplicado-e-series-do-motor.md`, `libs/plant-schema/src/apply-scenario-path.spec.ts`
- Modificar: `docs/adr/README.md`, `docs/PRODUCT.md` (contagem de ADRs), `docs/product/rules/simulation.md` (RN-SIM-018), `libs/plant-schema/package.json` (`exports`), `libs/sim-engine/eslint.config.mjs`
- Testar: `libs/sim-engine/src/lint-conformance.spec.ts`, `libs/plant-schema/src/apply-scenario-path.spec.ts`

**Interfaces:**
- Produz:
  - `exports` do `@takt/plant-schema` com `"./apply-scenario"` → `./src/apply-scenario.ts` (mesmas condições `types`, `import` e `default` do `"."`); o arquivo só importa tipos, então não carrega o Zod;
  - no lint do motor, bloco do código do motor: `@takt/plant-schema` com `allowTypeImports: true` (como hoje) e `@takt/plant-schema/apply-scenario` liberado; bloco geral (que também cobre specs e `src/tests/`): sem restrição ao esquema.

- [x] **Passo 1:** escrever o ADR-0015 como "Proposto" (skill `writing-decision-records`) e a RN-SIM-018 no formato das outras (enunciado, origem, exemplos: "a estação termina às 60 s com a fila cheia; a chegada das 60 s entra" e "duas fontes com peças esperando desde 60 s: a estação puxa a da conexão que vem primeiro"; quando violada: invariante do motor). **O usuário aceita o ADR antes do passo 2.**
- [x] **Passo 2: testes que falham:** no motor, `allows importing applyScenario from its plant schema path in engine code` (mensagens vazias); `rejects importing applyScenario from the plant schema package root in engine code` e `rejects importing validatePlant from the plant schema in engine code` (`@typescript-eslint/no-restricted-imports`, linha 1); `allows value imports from the plant schema in engine specs` (arquivo `value.spec.ts` importando `validatePlant`, mensagens vazias). O caso existente `rejects a value import from the plant schema in the engine` continua. No esquema, `the apply-scenario path exports applyScenario` (`typeof applyScenario` é `'function'`).
- [x] **Passo 3:** rodar `pnpm nx test sim-engine` e `pnpm nx test plant-schema` · Esperado: FALHA nos novos.
- [x] **Passo 4:** mudar o `package.json` do esquema e o `eslint.config.mjs` do motor. Conferir na documentação do typescript-eslint 8.72.1 (`@typescript-eslint/no-restricted-imports`, a regra usada) e do ESLint 10.13.0 como liberar um caminho e manter só tipos no outro; se não houver forma, parar e trazer ao usuário.
- [x] **Passo 5:** rodar `pnpm nx test sim-engine`, `pnpm nx test plant-schema`, `pnpm nx lint sim-engine` e `pnpm nx typecheck sim-engine` · Esperado: PASSA.

**Commit sugerido:** `docs: propose ADR-0015 and RN-SIM-018 for the engine core` (passo 1) e `chore(sim-engine): import applyScenario through its own plant schema path` (passos 2 a 5) · arquivos: os listados.

---

## Tarefa 2: erros com detalhes e opções da execução

**Arquivos:**
- Modificar: `libs/sim-engine/src/errors/simulation-error.ts`, `libs/sim-engine/src/rng/stream-index.ts` (lança com `details`), `libs/sim-engine/src/index.ts`, `docs/product/rules/README.md` (códigos `EMPTY_TRUNCATION` e `STREAM_COLLISION`, nível "Execução")
- Criar: `libs/sim-engine/src/replication/run-options.ts`
- Testar: `libs/sim-engine/src/errors/simulation-error.spec.ts`, `libs/sim-engine/src/rng/stream-index.spec.ts`

**Interfaces:**
- Produz:
  - `interface SimulationLimits { readonly elementCount: number; readonly durationSec: number; readonly eventCount: number }` e `type SimulationLimit = keyof SimulationLimits`;
  - `interface RunOptions { readonly limits: SimulationLimits; readonly recordLog: boolean }`;
  - `type RunIssueCode = 'EMPTY_TRUNCATION' | 'STREAM_COLLISION'` (o 6 acrescenta os do modo) e `interface RunIssue { readonly elementId?: string; readonly path: readonly (string | number)[]; readonly code: RunIssueCode }`;
  - `interface SimulationErrorDetails { readonly SIMULATION_LIMIT_EXCEEDED: { readonly limit: SimulationLimit }; readonly INVALID_PLANT: { readonly issues: readonly RunIssue[] } }`;
  - `class SimulationError<C extends SimulationErrorCode = SimulationErrorCode> extends Error` com `readonly code: C`, `readonly details: SimulationErrorDetails[C]` e `constructor(code: C, details: SimulationErrorDetails[C], message: string)`;
  - `index.ts` exporta também `SimulationErrorDetails`, `SimulationLimit`, `RunIssue` e `RunIssueCode`, que aparecem no tipo público do erro (a casca do Worker manda `{ code, details }`); `RunOptions` e `SimulationLimits` saem pelo `index.ts` só no sub-plano 6, com o `run`.

- [x] **Passo 1: testes que falham:** `a simulation error carries details for its code` (`new SimulationError('SIMULATION_LIMIT_EXCEEDED', { limit: 'eventCount' }, '...')` → `toMatchObject({ code: 'SIMULATION_LIMIT_EXCEEDED', details: { limit: 'eventCount' } })`); em `stream-index.spec.ts`, a colisão espera `details: { issues: [{ elementId: <id da segunda chave>, path: [], code: 'STREAM_COLLISION' }] }`.
- [x] **Passo 2:** rodar `pnpm nx test sim-engine` · Esperado: FALHA (sem `details`).
- [x] **Passo 3:** implementar; ajustar as chamadas existentes do construtor; acrescentar os dois códigos ao README das regras.
- [x] **Passo 4:** rodar `pnpm nx test sim-engine` e `pnpm nx typecheck sim-engine` · Esperado: PASSA.

**Commit sugerido:** `feat(sim-engine): add error details and run options` · arquivos: os listados.

---

## Tarefa 3: saltos do gerador por tabela

Refatoração sob os testes existentes (o `.res` oficial e os de `jump.spec.ts`), com dois estados novos de referência para índices grandes.

**Arquivos:**
- Modificar: `libs/sim-engine/src/rng/mrg32k3a.ts`, `libs/sim-engine/src/rng/jump.ts`
- Testar: `libs/sim-engine/src/rng/mrg32k3a.spec.ts`

**Interfaces:**
- Consome: `powerMatrix` e `applyMatrix` (`jump.ts`, sub-plano 1).
- Produz: `findStreamStart(streamIndex: bigint): StreamStart` e `createRandomStream(start: StreamStart, replication: number): RandomStream`, **mesmas assinaturas e mesmos resultados**; internamente, um salto que aplica `applyMatrix` com a matriz A^(2^k) de cada bit k ligado do número de saltos. As tabelas (k de 0 a 63 para as sequências, de 0 a 50 para as subsequências, nos dois componentes) são constantes do módulo, calculadas uma vez ao carregar.

- [x] **Passo 1: medir antes:** um script temporário fora do repositório (no *scratchpad* da sessão) chama `findStreamStart` para 1000 índices e `createRandomStream` para 1000 chaves × 30 replicações; anotar os tempos no Node 24.
- [x] **Passo 2: testes novos:** `findStreamStart gives the reference state for stream 2^64 − 1` e `createRandomStream gives the reference state for replication 2^51 − 1`, com os seis valores literais gerados pelo script de referência de `sim-engine.md` (seção "Gerador"); se o script não salta para índices arbitrários, parar e trazer ao usuário. Rodar `pnpm nx test sim-engine` · Esperado: PASSA já com o código atual (eles fixam o resultado antes da troca).
- [x] **Passo 3:** implementar o salto por tabela e trocar os dois saltos para ele.
- [x] **Passo 4:** rodar `pnpm nx test sim-engine` · Esperado: PASSA, inclusive os do `.res` oficial. Medir de novo com o mesmo script e registrar antes e depois em `sim-engine.md` (tarefa 8). Apagar o script com caminho literal.

**Resultado (26/11/2026, Node 24.22.2, WSL na máquina do fundador; vai para `sim-engine.md` na tarefa 8):** `findStreamStart` para 1000 índices levava de 222 a 376 ms (3 rodadas) e passou a levar de 30 a 158 ms (8 rodadas, mediana de cerca de 40 ms); `createRandomStream` para 1000 chaves × 30 replicações levava de 489 a 617 ms e passou a levar de 150 a 368 ms (mediana de cerca de 180 ms). A variação entre rodadas é grande; o pior depois fica abaixo do melhor antes nas duas funções. Além do previsto: `powerOfTwoTable` e `applyPowerTable` ficaram exportadas em `jump.ts`, com testes próprios em módulo 7, e `findStreamStart` passou a recusar com `RangeError` um índice fora de 0 a 2⁶⁴ − 1 (antes saltaria errado em silêncio), com teste.

**Commit sugerido:** `perf(sim-engine): jump streams with precomputed matrix powers` · arquivos: os listados.

---

## Tarefa 4: compilação da planta

**Arquivos:**
- Criar: `libs/sim-engine/src/model/compiled-plant.ts`, `libs/sim-engine/src/model/compile-plant.ts`, `libs/sim-engine/src/model/to-variability.ts`, `libs/sim-engine/src/tests/helpers/make-plant.ts` e `libs/sim-engine/src/tests/helpers/parse-unchecked-plant.ts` (cada um com spec)
- Modificar: `libs/sim-engine/src/distributions/truncated-normal.ts`
- Testar: `libs/sim-engine/src/model/compile-plant.spec.ts`, `libs/sim-engine/src/model/to-variability.spec.ts`, `libs/sim-engine/src/distributions/truncated-normal.spec.ts`, os specs dos auxiliares

**Interfaces:**
- Consome: `applyScenario` (`@takt/plant-schema/apply-scenario`), `Plant`, `TimeDistribution` (`@takt/plant-schema`, tipos); `SimulationError`, `RunOptions`, `RunIssue` (tarefa 2); `assignStreamIndices`, `findStreamStart` (`rng/`); `Variability` (`distributions/`).
- Produz:
  - `toVariability(distribution: TimeDistribution): Variability`;
  - `truncationMass(meanSec: number, standardDeviationSec: number, minSec: number, maxSec: number): number`, a área que `truncatedNormalQuantile` reescala, pela mesma conta e no mesmo ramo; `truncatedNormalQuantile` passa a usá-la;
  - `type CompiledElement`, discriminado por `kind`, todos com `readonly id: string` e `readonly index: number` (posição no documento):
    - `{ kind: 'source'; interarrival: Variability; queueCapacity: number; streamStart: StreamStart; outputIndex: number }`;
    - `{ kind: 'station'; cycle: Variability; streamStart: StreamStart; inputIndices: readonly number[]; outputIndex: number }`;
    - `{ kind: 'buffer'; capacity: number; inputIndices: readonly number[]; outputIndex: number }`;
    - `{ kind: 'sink'; inputIndices: readonly number[] }`;
  - `interface CompiledPlant { readonly durationSec: number; readonly elements: readonly CompiledElement[] }` (a semente só serve às sequências, já resolvidas na compilação);
  - `compilePlant(plant: Plant, scenarioId: string, options: RunOptions): CompiledPlant`, nesta ordem: teto de elementos (`SIMULATION_LIMIT_EXCEEDED`, `limit: 'elementCount'`); `applyScenario`; modo e recursos fora do escopo (defeito, restrições globais); teto de duração (`limit: 'durationSec'`); distribuições convertidas, com todo `truncationMass` 0 virando um `EMPTY_TRUNCATION` (`elementId` e caminho até a distribuição na planta aplicada, por exemplo `['elements', 1, 'params', 'cycle']`), lançados juntos num `INVALID_PLANT`; `inputIndices` na ordem das conexões no documento; sequências pelas chaves das restrições globais com a semente do cenário;
  - auxiliares de teste:
    - `makeSource`, `makeStation`, `makeBuffer`, `makeSink`, `makeScenario` e `makePlant`, com os padrões do esquema (os specs conferem com `createDefaultElement` e `validatePlant`); `makeScenario({ durationSec })` grava `durationH = durationSec / 3600`, para os testes escreverem a duração em segundos como literal (conferido no Node 24: 30, 90, 100, 300, 3600 e 28 800 s voltam exatos de `durationH × 3600`);
    - `testLimits` (`{ elementCount: 500, durationSec: 2_592_000, eventCount: 10_000_000 }`, valores de teste, não padrões);
    - `parseUncheckedPlant(text: string): Plant`, que devolve o `JSON.parse` sem validar, com o `as` justificado num comentário (só para o teste de `__proto__`, que nenhuma planta validada pode ter).

- [x] **Passo 1: testes que falham:** os da tarefa 4 no "Plano de testes". Valores: `truncationMass(0, 1, 40, 41) === 0`; `Infinity` no `maxSec` quando `null`; para o teto, `elementCount: 2` com três elementos, e `durationSec: 3599` com 1 h; `UC-SIM-002: accepts ...` com `elementCount: 3` e `durationSec: 3600`; `the stream of a key does not depend on the other elements`: o `streamStart` de `m1` é igual numa planta com e sem uma segunda estação `m2` (duas compilações no Arrange, uma comparação no Assert); `__proto__`: planta de `parseUncheckedPlant` com uma sobreposição de `cycle` cujo valor é `{"dist":"fixed","valueSec":5,"__proto__":{"polluted":true}}`; esperado: `Object.prototype` sem `polluted` e o ciclo compilado `{ kind: 'fixed', valueSec: 5 }`.
- [x] **Passo 2:** rodar `pnpm nx test sim-engine` · Esperado: FALHA.
- [x] **Passo 3:** implementar.
- [x] **Passo 4:** rodar `pnpm nx test sim-engine` · Esperado: PASSA.

**Diferenças do planejado (26/11/2026):**
- `truncatedNormalQuantile` **não** passou a chamar `truncationMass`: o sorteio calcularia Φ três vezes em vez de duas. `truncationMass` usa as mesmas funções (`normalSurvival`, `normalCdf`) e o mesmo ramo (`lower >= 0`) do sorteio, o que atende ao motivo da pendência do sub-plano 1 (não repetir o corte de 37 à mão).
- O auxiliar `parseUncheckedPlant(text)` virou `withUncheckedOverride(plant, overrideJson)`, porque montar o texto de uma planta inteira com `__proto__` exigiria lógica no teste ou `String.replace` (o Semgrep recusa).
- Auxiliares a mais: `makeConveyor`, `makeScrap` (tabela de defeitos) e `makeLinePlant` (linhas conectadas em ordem, com posições sem sobreposição).
- Entradas e saída de cada elemento lidas direto das conexões (sem vetor intermediário com `?? []`), e dois testes de defeito a mais: elemento sem saída e conexão para elemento inexistente.

**Commit sugerido:** `feat(sim-engine): compile a plant with its scenario applied` · arquivos: os listados.

---

## Tarefa 5: lista de eventos

**Arquivos:**
- Criar: `libs/sim-engine/src/events/event-queue.ts`
- Modificar: `package.json` (raiz, `fast-check` 4.10.3 em `devDependencies`), `pnpm-lock.yaml`
- Testar: `libs/sim-engine/src/events/event-queue.spec.ts`

**Interfaces:**
- Produz:
  - `type EventKind = 'finishProcessing' | 'arrival'`, com prioridade `finishProcessing` antes de `arrival` (RN-SIM-018);
  - `interface EventQueue` (estado mutável e interno a uma replicação);
  - `createEventQueue(slotKinds: readonly EventKind[]): EventQueue`, uma posição por evento possível;
  - `scheduleSlot(queue: EventQueue, slot: number, tSec: number): void`: agenda uma posição livre; lança **defeito** se `tSec` não é finito ou se a posição já está agendada;
  - `takeNextSlot(queue: EventQueue): number`: tira a posição de menor (tempo, prioridade do tipo, ordem de agendamento); `-1` com a lista vazia;
  - `slotTimeSec(queue: EventQueue, slot: number): number`.
  - Estrutura: *heap* binário de posições sobre vetores de tempo e de ordem de agendamento, sem objeto por evento.

- [x] **Passo 1: testes que falham:** `takes events by time, then kind, then scheduling order` (posições agendadas em 10 s `arrival`, 10 s `finishProcessing`, 5 s `arrival`, 10 s `finishProcessing` → ordem 5 s, os dois `finishProcessing` na ordem em que foram agendados, depois a chegada das 10 s); `refuses to schedule a time that is not finite` (`Infinity` e `NaN`, `catchError` sem `code`); `refuses to schedule a slot already scheduled`; propriedade `takes every scheduled event once, in (time, kind, sequence) order` (fast-check, `seed: 42`, `numRuns: 200`, tempos inteiros de 0 a 100 para forçar empates).
- [x] **Passo 2:** rodar `pnpm nx test sim-engine` · Esperado: FALHA.
- [x] **Passo 3:** instalar `fast-check@4.10.3` exato e implementar.
- [x] **Passo 4:** rodar `pnpm nx test sim-engine` · Esperado: PASSA.

**Diferenças do planejado (26/11/2026):**
- O `fast-check` foi instalado antes dos testes, para que o vermelho viesse do módulo ausente e não do pacote ausente. Sem scripts de instalação nele nem na dependência `pure-rand` 8.4.2 (publicada em 10/07/2026).
- Auxiliares de teste a mais, com spec: `scheduleSlots`, `takeAllSlots` e `sortSlotsByEventOrder` (`src/tests/helpers/scheduled-slots.ts`). O último é o oráculo da propriedade: ordenação estável por tempo e tipo, sem *heap*.
- Testes a mais: lista vazia dá `-1`; `slotTimeSec`; reagendar uma posição depois de tirada; posição fora da lista é defeito, no `scheduleSlot` e no `slotTimeSec`.
- Leituras dos vetores por uma função só (`valueAt`) que lança defeito fora do tamanho: o `noUncheckedIndexedAccess` tipa a leitura como `number | undefined`, e escrever fora de um vetor tipado é ignorado em silêncio, o que corromperia o *heap*.

**Commit sugerido:** `feat(sim-engine): add the event list with a deterministic tie-break` · arquivos: os listados.

---

## Tarefa 6: uma replicação (fontes, estações, buffers, expedições)

**Arquivos:**
- Criar: `libs/sim-engine/src/replication/simulate-replication.ts`, `libs/sim-engine/src/replication/replication-result.ts` (tipos), `libs/sim-engine/src/replication/choose-input.ts`, `libs/sim-engine/src/tests/helpers/exit-times-sec.ts` e `libs/sim-engine/src/tests/helpers/arbitrary-line.ts` (cada um com spec), `libs/sim-engine/src/replication/properties.spec.ts`
- Testar: `libs/sim-engine/src/replication/simulate-replication.spec.ts`, `libs/sim-engine/src/replication/choose-input.spec.ts`, `libs/sim-engine/src/replication/properties.spec.ts`

**Interfaces:**
- Consome: `CompiledPlant` (tarefa 4), `EventQueue` (tarefa 5), `createRandomStream`, `drawTimeSec`, `RunOptions`, `SimulationError`.
- Produz:
  - `type LogEvent`, com `readonly tSec: number` e `type`: `'arrive'` (`sourceId`, `partId`), `'lose'` (`sourceId`, `partId`), `'move'` (`partId`, `fromId`, `toId`), `'start'` (`stationId`, `partId`), `'finish'` (`stationId`, `partId`);
  - `type StationStatus = 'busy' | 'blocked' | 'starved'`;
  - `interface FinalState { readonly parts: readonly { partId: number; elementId: string; arrivalSec: number }[]; readonly stations: readonly { elementId: string; status: StationStatus; remainingSec: number | null }[]; readonly sources: readonly { elementId: string; nextArrivalSec: number }[] }`, na ordem dos elementos e, dentro de cada um, da posição na fila;
  - `interface ReplicationResult { readonly replication: number; readonly finalState: FinalState; readonly log: readonly LogEvent[] | null }`; a tarefa 7 acrescenta `indicators` e `series`;
  - `simulateReplication(plant: CompiledPlant, replication: number, options: RunOptions): ReplicationResult`;
  - `chooseInput(inputIndices: readonly number[], availableSinceSec: readonly number[]): number`: entre as entradas de um elemento, o índice do elemento cuja peça disponível espera há mais tempo (menor `availableSinceSec[i]`, com `Infinity` para "sem peça disponível"); empate pela posição em `inputIndices` (ordem das conexões); `-1` quando nenhuma tem peça;
  - auxiliares de teste: `exitTimesSec(log: readonly LogEvent[], sinkIds: readonly string[]): number[]` (os `tSec` dos `move` para uma expedição, em ordem) e `arbitraryLine(): fc.Arbitrary<Plant>` (uma ou duas fontes que se juntam numa estação, seguidas de 1 a 4 estações ou buffers e uma expedição; tempos fixos, exponenciais ou triangulares; fila de 0 a 5, capacidades de 1 a 5; 1 h de turno; todo `Plant` gerado passa no `validatePlant`, conferido no spec do auxiliar).
- Comportamento (RN-SIM-013, 014 e 018):
  - **chegada:** agenda a próxima em t + sorteio; a peça entra na fila da fonte; as peças andam; se ela ficou na fila e a fila passou da capacidade, sai e conta como perdida (`lose`);
  - **fim de processamento:** a estação fica com a peça pronta (`availableSinceSec = t`) e as peças andam;
  - **andar:** os elementos com vaga (estação sem peça, buffer abaixo da capacidade, expedição sempre), na ordem do documento, puxam pela `chooseInput`; a estação que recebe começa a processar (`start`, agenda o fim em t + sorteio); a varredura se repete até uma passada inteira não mover nada;
  - **fim:** antes de processar um evento em t ≥ T, para; cada evento processado conta para `limits.eventCount` e, passando dele, `SIMULATION_LIMIT_EXCEEDED` com `limit: 'eventCount'`.

- [x] **Passo 1: auxiliares de teste**, com seus specs: `exitTimesSec` (um log literal com dois `move` para a expedição e um para um buffer → os dois tempos) e `arbitraryLine` (100 plantas geradas, todas aceitas pelo `validatePlant`).
- [x] **Passo 2: testes que falham** (os da tarefa 6 no "Plano de testes"), com estes dados:
  - **Planta A:** fonte fixa de 10 s, fila 2; estação fixa de 50 s; expedição; T = 300 s (`makeScenario({ durationSec: 300 })`).
    - `RN-SIM-013: a full source queue loses arrivals ...`: `exitTimesSec` = `[60, 110, 160, 210, 260]`; log com `lose` das peças 4, 5, 7, 8, 9, 10 e 29, entre outras; estado final com a estação ocupada (peça 16, faltando 10 s) e a fila com as peças 21 e 26.
    - `RN-SIM-018: an end of processing frees the place ...`: log com `arrive` da peça 6 às 60 s e sem `lose` dela.
    - `UC-SIM-002: the final state lists ...`: o estado acima e a próxima chegada às 300 s.
    - Teto de eventos: a planta A processa 34 eventos (29 chegadas e 5 fins antes de 300 s; a chegada das 300 s não é processada): `eventCount: 34` é aceito, `eventCount: 33` dá `SIMULATION_LIMIT_EXCEEDED` com `limit: 'eventCount'`.
  - **Planta B:** fonte fixa de 10 s, fila 0; estação fixa de 15 s; T = 100 s. `RN-SIM-013: an arrival with a queue of 0 ...`: `start` das peças 1, 3, 5, 7 e 9; `lose` das peças 2, 4, 6 e 8; `exitTimesSec` = `[25, 45, 65, 85]`.
  - **Planta C:** fonte fixa de 10 s, fila 100; M1 fixa de 10 s ligada direto a M2 fixa de 30 s; expedição; T = 300 s. `RN-SIM-014: a station whose next station is busy stays blocked`: log com `finish` de M1 às 30 s e o `move` dessa peça para M2 às 50 s; `exitTimesSec` = `[50, 80, 110, 140, 170, 200, 230, 260, 290]`.
  - **Planta D (junção):** fonte `src1` fixa de 20 s e fonte `src2` fixa de 30 s, filas de 5, as duas ligadas a M1 fixa de 25 s; expedição; T = 120 s. As peças são numeradas 1 (`src1`, 20 s), 2 (`src2`, 30 s), 3 (`src1`, 40 s), 4 (`src2`, 60 s, agendada antes) e 5 (`src1`, 60 s). `RN-SIM-014: a station fed by two sources ...`: com a conexão de `src1` antes da de `src2`, `start` das peças 1, 2, 3 e 5 às 20, 45, 70 e 95 s; com a ordem das conexões trocada, as mesmas até 70 s e a peça 4 às 95 s (empate às 60 s decidido pela ordem).
  - `RN-SIM-014: a station chooses the input ...`: tabela de `chooseInput` com `([0, 1], [20, 10]) → 1`, `([0, 1], [10, 10]) → 0`, `([1, 0], [10, 10]) → 1`, `([0, 1], [Infinity, Infinity]) → -1`.
  - `RN-SIM-018: the first arrival comes after the first interval`: fonte fixa de 10 s: primeiro `arrive` em 10 s.
  - `RN-SIM-018: an exit exactly at the end of the shift is not counted`: fonte fixa de 10 s, estação fixa de 20 s, T = 30 s: `exitTimesSec` = `[]`.
  - `RN-SIM-018: a zero cycle finishes at the same instant`: estação com ciclo fixo de 0 s: `start` e `finish` da peça 1 às 10 s, e a replicação termina.
  - `UC-SIM-002: the n-th part leaves ...`: estações fixas de 40, 56 e 44 s, T = 8 h, fila da fonte 1000; (i) ligadas direto, fonte fixa de 60 s: 477 saídas, a primeira em 200 s, a segunda em 260 s e a última em 28 760 s; (ii) ligadas direto, fonte fixa de 30 s: 512 saídas, em 170, 226 e 28 786 s; (iii) como (ii), com buffers de 2 entre as estações: as mesmas de (ii). O Assert lê o tamanho e as posições 0, 1 e última de `exitTimesSec`.
  - `UC-SIM-002: records no log unless asked`: `recordLog: false` → `log: null`.
  - Propriedades (`properties.spec.ts`, fast-check, `seed: 42`, `numRuns: 100`, sobre `arbitraryLine`): `arrivals = lost + exits + parts left inside, for any line` (contagem pelos `arrive`, `lose` e `exitTimesSec` do log contra `finalState.parts.length`, pelos auxiliares); `RN-SIM-001: two runs of the same input give identical results` (`toEqual` entre duas execuções com log).
  - `RN-EDT-003: a source, a station and a sink with the editor defaults run`: planta de `createDefaultElement` e `createDefaultScenario`, aceita pelo `validatePlant`; `exitTimesSec` com pelo menos um valor.
- [x] **Passo 3:** rodar `pnpm nx test sim-engine` · Esperado: FALHA (`simulateReplication` não existe).
- [x] **Passo 4:** implementar.
- [x] **Passo 5:** rodar `pnpm nx test sim-engine` · Esperado: PASSA. Se a configuração (ii) ou (iii) não der Dₙ, parar e trazer ao usuário: a recursão é derivação própria da pesquisa, conferida só por simulação.

**Diferenças do planejado (26/11/2026):**
- `exit-times-sec.ts` virou `log-queries.ts`, com `exitTimesSec` e mais três consultas ao log: `selectLogEvents`, `selectPartIds` e `countUnaccountedParts` (a conservação sem conta no teste). As quatro recebem `log: null` e lançam erro, para os testes não precisarem de `?? []`.
- Construtores a mais em `make-plant.ts`: `makeFixedSource`, `makeFixedStation` e `makeDefaultLinePlant` (a planta da RN-EDT-003, conferida pelo `validatePlant` no spec do auxiliar).
- `src/collections/item-at.ts` (com spec): leitura de vetor que lança defeito fora do tamanho, exigida pelo `noUncheckedIndexedAccess`; substitui o `valueAt` privado da lista de eventos (tarefa 5).
- Tipos nomeados no resultado: `PartInLine`, `FinalStation` e `FinalSource`, com os campos do plano.
- A planta A confere as 21 perdas inteiras (4, 5, 7 a 10, 12 a 15, 17 a 20, 22 a 25, 27 a 29), calculadas à mão, e as partidas da B saem de `selectPartIds`.
- Teste a mais: `UC-SIM-002: the final state gives each station busy, blocked or starved` (estações de 10, 30 e 1 s, T = 305 s: M1 bloqueada, M2 ocupada faltando 15 s, M3 sem peça).
- `RN-SIM-018: an end of processing frees the place ...` usa outra planta (fonte fixa de 30 s com fila 0, estação fixa de 30 s, T = 100 s: `start` das peças 1, 2 e 3, nenhum `lose`). Na planta A, o fim das 60 s é agendado antes da chegada das 60 s, então a ordem de agendamento já o põe na frente e o teste passava sem a prioridade; a mutação mostrou isso. Aqui a chegada é agendada antes do fim, e só a prioridade do tipo salva a peça 2.
- Teste a mais: `RN-SIM-014: a station before a full buffer stays blocked` (buffer de 1 entre M1 de 10 s e M2 de 30 s: a peça 3 termina em M1 aos 40 s e só passa ao buffer aos 50 s). A mutação mostrou que nenhum teste dependia da capacidade do buffer: na configuração (iii), o gargalo esconde o buffer.
- As duas propriedades foram escritas depois do código (falha no TDD); a mutação dos arquivos novos mostra que elas e os testes unitários falham quando o código muda.

**Commit sugerido:** `feat(sim-engine): run one shift replication of a line` · arquivos: os listados.

---

## Tarefa 7: indicadores, séries e Lei de Little

**Arquivos:**
- Criar: `libs/sim-engine/src/stats/time-weighted.ts`, `libs/sim-engine/src/stats/series.ts`, `libs/sim-engine/src/tests/helpers/time-in-window.ts` (com spec)
- Modificar: `libs/sim-engine/src/replication/simulate-replication.ts`, `libs/sim-engine/src/replication/replication-result.ts`, `libs/sim-engine/src/replication/properties.spec.ts`
- Testar: `libs/sim-engine/src/stats/time-weighted.spec.ts`, `libs/sim-engine/src/stats/series.spec.ts`, `libs/sim-engine/src/replication/simulate-replication.spec.ts`, `libs/sim-engine/src/replication/properties.spec.ts`

**Interfaces:**
- Produz:
  - `ReplicationResult` ganha `readonly indicators: ReplicationIndicators` e `readonly series: readonly SeriesSlice[]`;
  - `interface ReplicationIndicators { readonly throughputPerHour: number; readonly wipAverage: number; readonly leadTimeAverageSec: number | null; readonly arrivalCount: number; readonly lostArrivalCount: number; readonly exitCount: number; readonly stations: readonly StationIndicators[]; readonly sources: readonly SourceIndicators[] }`;
  - `interface StationIndicators { readonly elementId: string; readonly busyRatio: number; readonly blockedRatio: number; readonly starvedRatio: number }` (a utilização é `busyRatio`; o 5 acrescenta o tempo em reparo);
  - `interface SourceIndicators { readonly elementId: string; readonly arrivalCount: number; readonly lostArrivalCount: number }` (os pedidos não atendidos de cada fonte; o total soma as fontes);
  - `interface SeriesSlice { readonly startSec: number; readonly endSec: number; readonly exitCount: number; readonly wipAverage: number; readonly leadTimeAverageSec: number | null }`;
  - auxiliar de teste `sumTimeInWindowSec(log: readonly LogEvent[], sinkIds: readonly string[], durationSec: number): number`: soma, peça a peça, de min(saída, T) − chegada, pelas chegadas aceitas (`arrive` sem `lose`); a saída é o `move` para uma das `sinkIds`.
- Definições: vazão = saídas na expedição ÷ (T ÷ 3600); WIP = peças na fila das fontes, nos buffers e nas estações (inclusive bloqueadas), média ponderada pelo tempo em [0, T); lead time = da chegada à expedição, média das peças que saíram; `arrivalCount` conta as perdidas; uma saída em t pertence à fatia [início, fim) que contém t.

- [x] **Passo 1:** o auxiliar `sumTimeInWindowSec` com seu spec (um log literal de três peças, uma ainda dentro em T).
- [x] **Passo 2: testes que falham**, com as plantas da tarefa 6:
  - `RN-SIM-013: WIP and lead time count the source queue ...` (planta A): vazão 60 por hora, WIP 2,8, lead time 114 s (lead times de 50, 90, 130, 150 e 150 s; a peça 2 espera na fila das 20 às 60 s);
  - `RN-SIM-013: counts 29 arrivals and 21 lost` (planta A, total e por fonte);
  - `UC-SIM-002: series slices of 60 s ...` (planta A): cinco fatias; saídas 0, 2, 1, 1, 1; WIP 2, 3, 3, 3, 3; lead time `null`, 70, 130, 150, 150;
  - `UC-SIM-002: the last slice is shorter ...`: planta A com T = 90 s → fatias [0, 60) e [60, 90);
  - `RN-SIM-014: busy, blocked and starved ratios of a blocked station` (planta C): M1 com 110/300 ocupada, 180/300 bloqueada e 10/300 faminta; M2 com 280/300 ocupada e 20/300 faminta (tolerância de 12 casas);
  - `UC-SIM-002: lead time is null when no part leaves`: estação de 400 s, T = 300 s;
  - `UC-SIM-002: the time of every part inside the shift equals the WIP area (Little 2011, LL.2)`: fonte exponencial de 60 s, estação exponencial de 50 s, buffer 5, estação triangular (30, 40, 55), semente 42, 8 h, `recordLog: true`; `sumTimeInWindowSec(log, ['snk1'], T)` igual a `wipAverage × T` com erro relativo menor que 10⁻⁹ (`relativeError`, sub-plano 1);
  - propriedade `the time of every part inside the shift equals the WIP area, for any line` (mesma comparação sobre `arbitraryLine`, `seed: 42`, `numRuns: 100`).
- [x] **Passo 3:** rodar `pnpm nx test sim-engine` · Esperado: FALHA (sem `indicators` nem `series`).
- [x] **Passo 4:** implementar.
- [x] **Passo 5:** rodar `pnpm nx test sim-engine` · Esperado: PASSA.

**Diferenças do planejado (26/11/2026):**
- A vazão é calculada como saídas × 3600 ÷ T, igual em matemática a saídas ÷ (T ÷ 3600): 300 ÷ 3600 não é exato em dupla precisão, e a planta A daria um valor vizinho de 60.
- As razões da planta C são comparadas exatamente (`110 / 300` e as outras), sem a tolerância de 12 casas: as áreas são somas de durações inteiras, então a divisão dá os mesmos bits.
- `sumTimeInWindowSec` aceita `log: null` e lança erro, como as consultas de `log-queries.ts`.
- A API de `stats/`: `createTimeWeightedValue`, `changeTimeWeightedValue` e `timeWeightedAverage`; `createSeries`, `addWipArea`, `recordSeriesExit` e `summarizeSeries`. O tipo `SeriesSlice` mora em `stats/series.ts`, e o resultado da replicação o importa. Cada módulo tem testes unitários próprios, além dos da replicação.
- O estado de cada estação é medido por três valores ponderados pelo tempo (0 ou 1 para ocupada, bloqueada e sem peça).
- Teste a mais: `RN-SIM-014: busy and starved ratios of a station that waits for parts` (planta B: 70/100 ocupada, 30/100 sem peça). A mutação mostrou que, na planta C, as estações só ficam sem peça no início, e nenhum teste cobria a volta ao estado "sem peça".
- Fora do escopo da tarefa, só em comentários: a JSDoc de `compile-plant.ts` e `run-options.ts` deixou de citar ADR (regra de comentários do projeto).

**Commit sugerido:** `feat(sim-engine): compute indicators, per-minute series and Little's law` · arquivos: os listados.

---

## Tarefa 8: verificação, docs e fechamento

**Arquivos:**
- Modificar: `docs/architecture/sim-engine.md`, `docs/architecture/plant-schema.md` (o motor importa `applyScenario` pelo caminho próprio), `docs/architecture/workspace.md` (o motor deixa de depender só dos tipos; `fast-check` nas dependências, se a lista de lá pedir), `docs/product/simulation.md` (séries e lead time censurado), `docs/product/glossary.md` (ocupada, bloqueada, faminta → `busy`, `blocked`, `starved`, se faltarem), `docs/plans/2026-11-04-roteiro-motor.md`, `docs/plans/README.md`, este plano

- [x] **Passo 1: verificação completa:** `pnpm nx test sim-engine --coverage` (90% de linhas e ramificações), `pnpm nx run sim-engine:mutate` (≥ 80%; listar os sobreviventes e o motivo de cada um em `sim-engine.md`), `pnpm nx run-many -t lint typecheck test`, `pnpm exec prettier --check .`.
- [x] **Passo 2: docs:**
  - `sim-engine.md`: a estrutura nova (`model/`, `events/`, `replication/`, `stats/`), a compilação, a ordem dos eventos e a varredura na ordem do documento, o movimento das peças, as definições dos indicadores e séries, os tetos, a medição dos saltos (tarefa 3) e a mutação;
  - roteiro: linha 4 como "Concluído"; nas pendências do 4, a decisão de cada uma; Φ em cache, precisão com u perto de 1 e "teto num só lugar" para o 9; testes longos para o 6; sequências separadas de falha e reparo e sorteio sempre consumido para o 5; pendência nova do `null` nas fatias para o 6 e o 7;
  - os demais arquivos listados; status "Concluído" neste plano e no índice.

**Diferenças do planejado (26/11/2026):**
- A mutação completa, com a concorrência padrão da Stryker (11 processos), parou no teste inicial: as propriedades das replicações passaram dos 5 s do Vitest. Decisão do usuário: `concurrency: 4` em `stryker.config.mjs` (as alternativas eram aumentar o tempo-limite das propriedades ou barateá-las). A rodada levou 28 min e deu 92,08%.
- A rodada completa achou lacunas de testes das tarefas 3 e 4, corrigidas com aprovação do usuário (plano curto na conversa, 26/11/2026) num commit próprio: testes de `truncationMass` com valor positivo e nas caudas; compilação de um cenário que não é o primeiro, de roteamento na fonte e no buffer e de uma normal truncada com probabilidade; `compilePlant` passou a usar os índices do `assignStreamIndices` (por `streamIndexOf`, novo, com testes) em vez de calcular o hash de novo; e `createRandomStream` perdeu a guarda redundante da replicação. Detalhes e sobreviventes em `sim-engine.md`, seção "Mutação (sub-plano 4)".
- O teste `streamIndexOf of a key that was not assigned throws a defect` passou já antes da implementação (o `TypeError` de função inexistente também é um `Error` sem `code`); o outro teste da função falhou como esperado.

**Commit sugerido:** `test(sim-engine): close mutation gaps of the compilation and the streams` e `docs: close sub-plan 4 of the engine roadmap` · arquivos: os listados.

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Duração em horas como expressão (`1/12`) nos testes, sem garantia de voltar exata em segundos | autorrevisão | Sim | `makeScenario({ durationSec })`, com a ida e volta conferida no Node 24 |
| 2 | `index.ts` exportava `RunOptions` e `SimulationLimits` antes do `run` | autorrevisão | Sim | Só os tipos do erro saem agora; o resto no 6 |
| 3 | Tarefa 6 dependia de tipos definidos na 7 | autorrevisão | Sim | A 7 acrescenta `indicators` e `series` ao resultado |
| 4 | `sumTimeInWindowSec` não sabia quais elementos são expedição | autorrevisão | Sim | Parâmetro `sinkIds` |
| 5 | Lead time calculado a partir do log dentro do teste (lógica no teste) | autorrevisão | Sim | Afirmado pelo indicador na tarefa 7 |
| 6 | Teto de eventos medido no próprio teste (dois Acts) | autorrevisão | Sim | Contagem literal de 34 eventos, conferida à mão |
| 7 | `seed` na planta compilada sem uso | autorrevisão | Sim | Removido |
| 8 | `details` do `INVALID_PLANT` fora do formato `{ elementId?, path, code }` do README das regras | plan-reviewer (erro) | Sim | Conferido em `rules/README.md`; `issues` com `EMPTY_TRUNCATION` e `STREAM_COLLISION` |
| 9 | Importar `applyScenario` pelo pacote principal carrega o Zod, contra o motivo da escolha do usuário | plan-reviewer (erro) | Sim | Conferido no `index.ts` e no `package.json` do esquema; caminho próprio `@takt/plant-schema/apply-scenario` |
| 10 | O teste "que falha" da tarefa 3 passaria antes da mudança | plan-reviewer (erro) | Sim | Conferido no `mrg32k3a.ts`; tarefa tratada como refatoração, com estados literais de referência |
| 11 | Testes da tarefa 6 contavam e filtravam o log (lógica no teste) | plan-reviewer (erro) | Sim | Auxiliar `exitTimesSec`; contagens na tarefa 7; Dₙ por tamanho e posições literais |
| 12 | LL.2, conservação e determinismo escritos depois do motor; LL.2 sem propriedade | plan-reviewer (erro) | Sim | Movidos para antes da implementação nas tarefas 6 e 7; LL.2 também como propriedade (ADR-0009) |
| 13 | Pendências do roteiro omitidas (precisão com u perto de 1, sequências de falha e sorteio sempre consumido, teto num só lugar) | plan-reviewer (erro) | Sim | Conferido no roteiro; cada uma com destino nas decisões técnicas e na tarefa 8 |
| 14 | Lead time da série contra o "das peças que entraram" do ADR-0011, item 8 | plan-reviewer (erro) | Sim | Decidido com o usuário: o ADR-0015 complementa também o item 8 |
| 15 | `workspace.md` diz que o motor depende só dos tipos | plan-reviewer (erro) | Sim | Conferido na linha 11; na tarefa 8 |
| 16 | Regra da peça que espera há mais tempo sem teste numa replicação | plan-reviewer (erro) | Sim | Planta D (junção de duas fontes), com empate; `arbitraryLine` gera junções |
| 17 | Modo `continue` fora da tabela de defeitos | plan-reviewer (sugestão) | Sim | Na tabela |
| 18 | Testes de passos do UC-SIM-002 sem o ID | plan-reviewer (sugestão) | Sim | Prefixo `UC-SIM-002:` |
| 19 | Teste de `__proto__` sem dados e impossível com planta validada | plan-reviewer (sugestão) | Sim | `parseUncheckedPlant`, com a chave e o resultado esperados |
| 20 | `scheduleSlot` dizia "agenda ou reagenda" e recusava reagendar | plan-reviewer (sugestão) | Sim | Só agenda; reagendar é do 5 |
| 21 | Ordem da varredura não definida | plan-reviewer (sugestão) | Sim | Ordem do documento, até uma passada sem movimento |
| 22 | `chooseInput` criava objetos a cada puxada | plan-reviewer (sugestão) | Sim | Lê vetores do estado |
| 23 | Documentação a conferir no passo do lint | plan-reviewer (sugestão) | Sim | typescript-eslint 8.72.1 e ESLint 10.13.0 |
| 24 | `null` nas fatias chega ao MSER-5 e às médias | plan-reviewer (sugestão) | Sim | Pendência nova para o 6 e o 7 |
| 25 | Numeração das peças com motivo sem fonte ("a cena mostra pedido n") | plan-reviewer (premissa) | Sim | Motivo trocado: ligar `arrive` e `lose` |
| 26 | Regra da peça mais antiga também em buffers e expedições, e empate pela ordem das conexões | plan-reviewer (premissa) | Sim | Decidido com o usuário; escrito na RN-SIM-018 |
