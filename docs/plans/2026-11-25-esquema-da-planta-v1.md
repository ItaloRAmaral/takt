# Plano: esquema da planta v1 (sub-plano 3)

| Campo | Valor |
| --- | --- |
| Status | Aprovado (25/11/2026) |
| Data | 25/11/2026 |
| Pedido | "Pull feito, pode começar o sub-plano 3" (24/11/2026), para a linha 3 do roteiro aprovado: "`@takt/plant-schema` completo para o marco 1: todos os elementos do MVP (fonte, estação, buffer, esteira, expedição, refugo) com parâmetros e padrões, roteamento, configurações, cenários e sobreposições; validação estrutural (modo estrito) e semântica; cadeia de migrações; JSON Schema gerado (UC-SIM-001)" |
| Contexto | [Roteiro](2026-11-04-roteiro-motor.md) (linha 3, interfaces, segurança, riscos e pendências do 3), [UC-SIM-001](../product/use-cases/uc-sim-001-validar-planta.md), [regras de simulação](../product/rules/simulation.md), [regras do editor](../product/rules/editor.md), [RN-JSN-005](../product/rules/json.md), [modelo da planta](../product/plant-model.md), [motor de simulação](../product/simulation.md), [escopo do MVP](../product/mvp-scope.md), [ADR-0008](../adr/0008-validacao-de-dados.md), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md), [ADR-0009](../adr/0009-estrategia-de-testes.md), [ADR-0013](../adr/0013-erros-esperados.md), [code-style.md](../architecture/code-style.md) seção 8, [pesquisa da literatura do motor](../research/literatura-do-motor.md), pesquisa nova do modelo de fluxo (tarefa 1), dois debates de revisores (25/11/2026, resumidos em "Decisões tomadas com o usuário") |
| Roteiro | [Esquema da planta e motor (marco 1)](2026-11-04-roteiro-motor.md), sub-plano 3 |

**Objetivo:** entregar o esquema da planta v1 completo do marco 1 (documento, tipos, padrões do editor, validação estrutural e semântica, cenários aplicados campo a campo e JSON Schema publicado), depois de fixar num PDR o modelo de fluxo que os campos representam.

**Arquitetura:** tudo em `libs/plant-schema/src`, sem depender do motor. O Zod 4 é a fonte da verdade da forma (objetos estritos); a validação semântica são funções puras sobre a planta já tipada; os problemas saem como `{ elementId?, path, code }`. `validatePlant` lê a versão, valida a forma, depois as regras da planta base e, em seguida, as de cada cenário com as sobreposições aplicadas. O JSON Schema é gerado pelo `z.toJSONSchema` e versionado como arquivo, conferido por teste.

**Regras e registros:** UC-SIM-001; RN-SIM-003 (faixa de replicações), 004, 005, 006, 007 (regime estável sem aquecimento é aceito) e as regras novas do PDR da tarefa 1; RN-EDT-001, 003 e 004; RN-JSN-005; PDR-0007, PDR-0008, PDR-0014, PDR-0020; ADR-0008 itens 9 a 13 e riscos; ADR-0011 itens 2, 4 a 6; ADR-0013; ADR-0009.

## Restrições globais

- **Zod 4.6.7**, exato, em `dependencies` de `@takt/plant-schema` (publicado em 12/10/2026; passa a regra de 7 dias de `workspace.md`). Fatos usados, da [documentação do Zod](https://zod.dev/api): `z.strictObject` recusa chave desconhecida com o código `unrecognized_keys`; `safeParse` devolve `{ success: false, error }` com `error.issues`, cada um com `code`, `path` e `message`; `z.number()` "allows any finite number" (recusa `NaN` e `Infinity`); `z.int()` "restricts to safe integer range"; `z.toJSONSchema` gera Draft 2020-12 por padrão e `z.strictObject` vira `additionalProperties: false` ([JSON Schema](https://zod.dev/json-schema)). Os códigos de problema do Zod que não aparecem com o nome exato na documentação (`not_multiple_of`, `invalid_union`, `invalid_key`, `invalid_element`) são conferidos no tipo `$ZodIssue` instalado, na tarefa 2.
- **O esquema não importa o motor** (lint e teste de conformidade já existentes). **O motor depende só dos tipos do esquema** (ADR-0011, item 2; o lint do motor só aceita `import type` de `@takt/plant-schema`, com teste de conformidade): `applyScenario` e `PLANT_LIMITS` são para quem chama o esquema (a casca do Worker, a API, os testes), nunca importados pelo motor. Como o motor recebe o cenário aplicado fica para o sub-plano 4 (pendência registrada na tarefa 8).
- **Modo estrito em todo objeto** (`CLAUDE.md`, ADR-0008 item 3); nenhum `.default()` do Zod no documento: todo valor fica escrito no arquivo (decisão do usuário; [JSON Schema](https://json-schema.org/understanding-json-schema/reference/annotations): `default` "is not used to fill in missing values", ao contrário do Zod). Os padrões são constantes exportadas para o editor.
- **Unidades no nome** (`CLAUDE.md`): todo tempo de elemento em segundos (`valueSec`, `meanSec`...), comprimento em metros (`lengthM`), velocidade em metros por minuto (`speedMPerMin`), duração do cenário em horas (`durationH`), aquecimento em minutos (`warmupMin`).
- **Limites** (decisão do usuário, 25/11/2026; sem fonte, revisáveis quando o sub-plano 9 medir): 500 elementos, 2000 conexões, capacidades até 10 000, duração do cenário até 720 h, todo campo de tempo até 1 ano (31 536 000 s). **[Estimativa]** limites menores escolhidos neste plano: grade até 200 × 200 células; até 50 zonas; até 20 cenários; até 2000 sobreposições por cenário; IDs de 1 a 64 caracteres; nomes de 1 a 120 caracteres; limite de retrabalho de 0 a 10; comprimento da esteira e velocidade até 10 000 (m e m/min); semente inteira de 0 a 4 294 967 295 (a RN-SIM-003 só diz "semente 42, editável").
- **IDs:** `^[A-Za-z0-9_-]{1,64}$` (ASCII imprimível sem `:`, o separador da chave da sequência `<id>:<propósito>`; expressão linear, sem retrocesso). Todos os IDs do documento são únicos entre si (elementos, zonas, conexões e cenários).
- **Sem `enum`**; uniões de literais; `erasableSyntaxOnly` (`code-style.md` seção 8).
- **JSDoc em todo export**, sem citar ADR; nomes por extenso; testes AAA sem comentários e sem lógica; nome do teste começa pelo ID da regra quando houver (`CLAUDE.md`).

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Onde a peça espera na frente de uma estação | Estação guarda uma peça; a peça terminada fica nela se o destino está cheio (bloqueio depois do serviço); estado "bloqueado" distinto de "faminto"; espera só em buffers explícitos, de capacidade editável | 24/11/2026 |
| Fila da fonte | Fila visível com capacidade finita editável ("nada no mundo real acontece sem limite"); padrão 20 | 24/11/2026 |
| Fonte com a fila cheia | A chegada se perde e entra em "pedidos não atendidos" (primeira escolha, parar a fonte, revista depois de dois debates: com a perda, o motor simula a demanda escrita e a sobrecarga aparece) | 25/11/2026 |
| Relógio das falhas | Calendário, desde o fim do reparo; a máquina pode falhar ociosa; MTBF = tempo de funcionamento; disponibilidade = MTBF/(MTBF+MTTR) | 24/11/2026 |
| Distribuição da falha e do reparo | Objetos de distribuição (as mesmas quatro do ciclo), padrão exponencial; ao ligar falhas, 240 min e 15 min (o par do caso de validação de 94,1%) | 25/11/2026 |
| Durante o reparo | Nada entra nem sai da máquina, nem a peça pronta de uma máquina que quebrou bloqueada | 25/11/2026 |
| Esteira | `lengthM` e `speedMPerMin` (trânsito = comprimento ÷ velocidade), `capacity`; para inteira como correia quando a saída bloqueia; não cria defeito. **Falha da esteira fora do v1** (primeiro pedida, retirada depois do debate: sem fonte para o comportamento e sem uso no demo) | 24 e 25/11/2026 |
| Defeitos | `defectRate` na estação; regra por qualidade com saídas boa, retrabalho (opcional) e refugo, todas conectadas; contador único por peça (RN-SIM-006) | 24 e 25/11/2026 |
| Linha travada (*deadlock*) | A execução para com um código próprio e mostra o ciclo travado; uma replicação travada invalida a execução ("7 de 30 travaram"), sem média só das que não travaram | 25/11/2026 |
| Ritmo ideal do OEE | Campo `idealCycleSec` na estação; o editor o preenche com a média do ciclo | 25/11/2026 |
| Padrões de um elemento novo | Fonte exponencial de 60 s, fila 20; estação fixa de 50 s, defeito 0, sem falhas; buffer 10; esteira 5 m a 10 m/min, capacidade 5; limite de retrabalho 2; cenário turno de 8 h, 30 replicações, semente 42 | 24/11/2026 |
| Limites | 500 elementos, 2000 conexões, capacidades até 10 000, duração até 720 h; teto de 1 ano por campo de tempo | 24 e 25/11/2026 |
| O que um cenário muda | Só o valor inteiro de parâmetros de elementos existentes e o limite de retrabalho, campo a campo; inclui trocar o tipo da distribuição, ligar e desligar falhas e trocar a regra de roteamento (apresentado ao usuário em 25/11/2026, sem objeção) | 24 e 25/11/2026 |
| Valores explícitos no documento | Todo valor escrito no arquivo; por isso a normal truncada grava `minSec` e `maxSec` (`null` = sem máximo), e o "mínimo opcional com padrão 0, máximo opcional sem limite" de 04/11/2026 vira o padrão do editor | 24/11/2026 |
| Plano, limites estimados, cadeia de migrações na v2 e revisor de planos mantido | "1. aprovo 2. pode ser 3. concordo" | 25/11/2026 |
| Pesquisa e revisão das escolhas | Pesquisa em quatro frentes e dois debates de revisores ("da uma pesquisada a mais para validar"; "coloque + 3 agentes para discutir"); o produto vem antes de qualquer uso acadêmico | 25/11/2026 |

**Decisões técnicas deste plano** (o usuário pode vetar na aprovação):

- **Regra de roteamento no elemento** (`routing`), como no exemplo do `plant-model.md` e no Simul8, Arena e Plant Simulation; só aponta para destinos ligados por conexão, e toda conexão de saída é coberta pela regra.
- **Percentuais inteiros** de 1 a 100, soma exatamente 100.
- **Espaço na grade gravado no elemento** (`size: [colunas, linhas]`); o editor escolhe o tamanho de cada tipo (marco 2). Convenção: `pos` é sempre a célula de menor coluna e menor linha da área ocupada; com `rot` 0° e 180° a área tem `size[0]` colunas por `size[1]` linhas, com 90° e 270° as duas se trocam. A sobreposição (RN-EDT-001) usa `pos`, `size` e `rot`.
- **A validação semântica só roda quando a forma passa**, na ordem das extensões 3a e 4a do UC-SIM-001: com problema de forma, volta a lista completa dos de forma. Rodar regras sobre um documento malformado exigiria tratar cada campo ausente em cada regra.
- **A cadeia de migrações nasce com a primeira migração.** A v1 é a primeira versão: este plano entrega a leitura da versão (`UNSUPPORTED_SCHEMA_VERSION` para a mais nova) e nenhuma etapa de migração; a cadeia, com arquivos de exemplo de cada versão (ADR-0009), entra na v2, quando houver o que migrar e testar.
- **Exemplo do `plant-model.md` corrigido:** hoje ele trava (m1 → rw1 → m1 com conexões diretas). O retrabalho passa a voltar ao fluxo depois da estação (rw1 → b1).
- **Planta de exemplo do demo neste sub-plano**, só como documento validado; os números (sobrecarga, gargalo que muda de lugar) são conferidos com o motor nos sub-planos 5 e 6.

## Foco de revisão

- Documento que não é objeto (`null`, número, texto, lista): um problema na raiz, sem exceção.
- `schemaVersion` ausente, não inteiro, 0, negativo ou maior que 1: ausente ou inválido → problema de forma; maior → só `UNSUPPORTED_SCHEMA_VERSION`, sem validar o resto.
- Chave desconhecida em qualquer nível, inclusive `__proto__` e `constructor` vindos do `JSON.parse`: recusada, um problema por chave.
- Números `NaN`, `Infinity`, negativos onde não cabem, fracionários onde se espera inteiro, acima do teto de 1 ano ou das capacidades.
- Tempos com piso acima de 0: intervalo fixo da fonte, tempo até a falha fixo, comprimento e velocidade da esteira; ciclo e reparo podem ser 0.
- Distribuição incoerente: triangular com mínimo > moda, moda > máximo ou mínimo = máximo; normal truncada com mínimo ≥ máximo.
- IDs repetidos, vazios, com `:`, espaço, acento ou caractere de controle; referência a ID que não existe (conexão, zona, regra, sobreposição).
- Planta sem fonte, sem saída (expedição ou refugo), com elemento solto (sem caminho de uma fonte até uma saída), conexão para a própria origem, conexão repetida entre o mesmo par, entrada em fonte, saída de expedição ou refugo.
- Elemento fora da grade ou sobreposto, inclusive depois de girar 90° e 270°.
- Saída com dois destinos e `routing: null`; regra que aponta para destino não conectado ou deixa uma conexão de saída de fora; percentuais somando 99 ou 101; regra por qualidade em quem não é estação; `scrap` que não é refugo.
- `defectRate > 0` sem regra por qualidade; o mesmo surgindo só num cenário que aumenta o `defectRate`.
- Sobreposição com parâmetro que não existe no tipo do elemento, repetida para o mesmo elemento e parâmetro, ou que cria uma regra inválida só naquele cenário.
- Aquecimento em modo que não é regime estável; aquecimento maior ou igual à duração; regime estável sem aquecimento aceito (RN-SIM-007).
- 501 elementos, 2001 conexões, 21 cenários: problema de limite, sem travar.
- Vários problemas no mesmo documento: todos voltam de uma vez, cada um com `elementId` quando o caminho passa por um elemento.

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |
| Corpo enorme ou muito aninhado (ADR-0008) | Limites de quantidade de elementos, conexões, zonas, cenários e sobreposições, e de tamanho de textos; a forma é rasa e fixa (sem recursão); o 1 MB do arquivo é da importação (RN-JSN-005, marco 3) | 3: `rejects more than 500 elements`, `rejects more than 2000 connections`, `rejects a name longer than 120 characters` |
| Poluição de protótipo (ADR-0008) | Objetos estritos recusam `__proto__` e `constructor`; `applyScenario` copia campo a campo, sem mesclagem profunda, e nunca escreve chave vinda do documento | 3: `rejects a __proto__ key parsed from JSON`; 5: `applyScenario does not change the base plant` |
| Expressão regular catastrófica (ADR-0008) | Uma expressão só, a dos IDs, sem alternância nem quantificador aninhado | 3: `rejects an id with a colon`, `rejects an id longer than 64 characters` |
| Planta desenhada para travar o motor (ADR-0011) | Tetos de tempo, capacidades e limite de retrabalho; pisos acima de 0 onde zero gera eventos sem fim; regras completas antes de executar; a linha travada em execução é do motor (sub-plano 5) | 2: `rejects a fixed interarrival of 0`; 3: `RN-SIM-006: rejects a rework limit above 10` |
| Problema que vaza dados do usuário | O problema leva só `elementId`, `path` e `code`; nunca a mensagem nem o valor recebido | 2: `issues carry only elementId, path and code` |
| Atribuição em massa (ADR-0008) | Não se aplica: o documento não tem organização, dono nem papel (`plant-model.md`, documento × registro) | — |

## Plano de testes

| Requisito, regra ou linha do foco de revisão | Nível | Teste | Tarefa |
| --- | --- | --- | --- |
| Forma das distribuições e pisos | unitário | `time distribution` (it.each por distribuição e campo) | 2 |
| Mapeamento de problemas do Zod | unitário | `structural issues` (código por tipo de problema; um por chave desconhecida; só três campos) | 2 |
| Forma do documento, limites, IDs, estrito | unitário | `plant document shape`; `RN-SIM-003: accepts 5 to 100 replications and rejects 4 and 101` | 3 |
| Fila da fonte, esteira, falha, `idealCycleSec` | unitário | `RN-SIM-013: accepts a source queue capacity of 0 and rejects 10001`, `RN-SIM-016: rejects a conveyor speed of 0`, `RN-SIM-016: rejects a failure on a conveyor`, `RN-SIM-015: rejects a fixed time to failure of 0` | 3 |
| Referências, grafo, grade, roteamento, faixas | unitário | `RN-EDT-004: ...`, `RN-EDT-001: ...`, `RN-SIM-004: ...`, `RN-SIM-005: ...`, `RN-SIM-006: ...` | 4 |
| Cenários e validação por cenário | unitário | `applyScenario ...`, `RN-SIM-007: accepts a steady-state scenario without warm-up` | 5 |
| Versão e entrada única | unitário | `RN-JSN-005: reports UNSUPPORTED_SCHEMA_VERSION for a newer version`, `UC-SIM-001: returns every problem at once` | 5 |
| Padrões e planta de exemplo | unitário | `RN-EDT-003: a source, a station and a sink with the defaults are valid`, `the demo plant is valid` | 6 |
| JSON Schema versionado | unitário | `the generated JSON Schema matches the published file` | 7 |

- **Níveis usados e por quê:** só unitário. O esquema é uma biblioteca pura, sem banco, rede ou interface; os testes de propriedade (fast-check) entram no sub-plano 4, com o motor (roteiro).
- **Dados de teste:** um construtor `makePlant(overrides?)` em `src/tests/helpers/make-plant.ts` (com spec), que monta a planta mínima válida (fonte → estação → expedição, padrões da tarefa 6 escritos à mão até lá) e aceita trocas pontuais; cada teste cria os próprios dados; documentos inválidos escritos literalmente no teste; nada aleatório.
- **Casos de borda e de segurança:** cada linha de "Foco de revisão" e de "Segurança" vira um caso nos testes das tarefas 2 a 5, com o código esperado.
- **Metas:** 90% de linhas e ramificações em `plant-schema` (ADR-0009); sem mutação, que o ADR-0009 exige só no motor e no domínio da API. Exclusões de cobertura: nenhuma.
- **Como rodar:** `pnpm nx test plant-schema --coverage`, `pnpm nx lint plant-schema`, `pnpm nx typecheck plant-schema`, `pnpm exec prettier --check .` e, no fim, `pnpm nx run-many -t lint typecheck test`.

## Desvios do guia de estilo

Nenhum.

## Registros novos propostos

- **PDR-0022, "Modelo de fluxo da planta"** (tarefa 1, skill `writing-decision-records`): fila e bloqueio, fonte que perde chegadas, falhas no calendário e o que acontece no reparo, esteira, regra por qualidade com retrabalho e refugo, linha travada, ritmo ideal. Passa nos três critérios: muda o resultado de toda planta salva (difícil de reverter), surpreende sem o contexto (por que a fonte perde a chegada, por que a máquina falha ociosa) e é troca real (o tempo ocupado de Law, a Erlang-2 do Simul8, a fonte que para do Plant Simulation). Complementa o PDR-0014 e o PDR-0020; não substitui nenhum.
- O "Em aberto" do ADR-0008 sobre limites e o do `plant-model.md` sobre o roteamento fecham nos docs vivos (`plant-schema.md`, `plant-model.md`), sem registro novo: são detalhes que o próprio ADR deixou para a implementação.

## Cerimônia observada

Nenhuma.

---

## Tarefa 1: pesquisa, PDR do modelo de fluxo e regras

Só documentos; o código das tarefas 2 a 8 começa depois que o usuário aceitar o PDR.

**Arquivos:**
- Criar: `docs/research/modelo-de-fluxo-da-planta.md` (a partir de `reports/reports/Modelo de fluxo da planta v1.md`, mais o resumo dos dois debates: o que mudou na proposta e por quê); `docs/pdr/0022-modelo-de-fluxo-da-planta.md`
- Modificar: `docs/research/README.md`, `docs/product/references.md` (fontes novas: Simul8 Help, tutorial do Plant Simulation da U. Twente, Rossetti, livro do Simio, Law cap. 14, Roser et al. 2001, Sargent 2010, OEE.com, Mullen 2013, Torres Júnior et al. 2022, Palmer, Harper e Knight 2018, JSON Schema e Zod), `docs/pdr/README.md`, `docs/PRODUCT.md` (contagem de PDRs)
- Depois da aceitação: `docs/product/use-cases/uc-sim-001-validar-planta.md` (regras novas, problemas por cenário, pendência do roteamento fechada), `docs/product/rules/simulation.md`, `docs/product/rules/editor.md`, `docs/product/rules/README.md`, `docs/product/simulation.md`, `docs/product/plant-model.md`, `docs/product/glossary.md`

- [ ] **Passo 1:** mover o relatório para `docs/research/`, com o resumo dos debates; listar as fontes em `references.md`.
- [ ] **Passo 2:** escrever o PDR-0022 "Proposto" com a skill `writing-decision-records`, a partir da tabela "Decisões tomadas com o usuário", e entregá-lo ao usuário.
- [ ] **Passo 3, depois do "aceito" do usuário:** regras derivadas, com IDs novos: RN-SIM-013 (fila da fonte e pedidos não atendidos), RN-SIM-014 (bloqueio depois do serviço e de qual entrada a estação puxa: a peça que espera há mais tempo, com o retrabalho na frente no empate), RN-SIM-015 (falhas no calendário; a peça em processo termina o restante; nada entra nem sai no reparo), RN-SIM-016 (esteira) e RN-SIM-017 (linha travada, com o código `PLANT_DEADLOCK` na tabela de códigos de `rules/README.md`; a extensão do UC-SIM-002 entra no sub-plano 5) e ajustes de detalhe nas existentes: RN-SIM-004 (`defectRate > 0` exige regra por qualidade), RN-SIM-005 (percentuais inteiros), RN-SIM-006 (saídas boa, retrabalho e refugo; o contador sobe ao mandar para retrabalho; limite de 0 a 10), RN-EDT-003 (tabela de padrões), RN-EDT-004 (validações mínimas atualizadas).
- [ ] **Passo 4:** `rules/README.md` ganha a seção "Códigos de problema da planta" com a tabela da tarefa 2 (código, quando, nível).
- [ ] **Passo 5:** `simulation.md`: condições de cada caso de validação (modo, fila da fonte de 1000 no M/M/1, bloqueio depois do serviço, 94,1% só em regime estável, 94,29% no turno); o caso "retrabalho sem limite" vira "com limite n: E[passagens] = (1 − pⁿ⁺¹)/(1 − p), P(refugo) = pⁿ⁺¹"; casos novos candidatos (fração perdida = p_K do M/M/1/K; vazão A/c de estação saturada com ciclo fixo; esteira determinística soma o trânsito ao lead time); gargalo pela maior fração ativa (processando + em reparo); seção curta "O que o Takt simplifica" (fila só em buffers, falha no calendário, reparo exponencial por padrão, esteira sem falha, sem turnos).
- [ ] **Passo 6:** `plant-model.md`: forma final do documento (exemplo válido pela v1, com o retrabalho sem laço), "Em aberto" fechado; `glossary.md`: `timeToFailure`, `repairTime`, pedidos não atendidos (`lostArrivalCount`), bloqueado e faminto, ritmo ideal (`idealCycleSec`), linha travada; `mtbfMin` sai.

**Commit sugerido:** `docs: propose PDR-0022 on the plant flow model and record the research` · arquivos dos passos 1 e 2; depois da aceitação, `docs: accept PDR-0022 and derive the flow rules` · arquivos dos passos 3 a 6.

---

## Tarefa 2: Zod, distribuições de tempo e problemas de forma

**Arquivos:**
- Modificar: `libs/plant-schema/package.json` (`"zod": "4.6.7"`), `pnpm-lock.yaml`
- Criar: `libs/plant-schema/src/limits.ts`, `src/time-distribution.ts`, `src/issues.ts`
- Testar: `src/time-distribution.spec.ts`, `src/issues.spec.ts`

**Interfaces:**
- Produz:
  - `PLANT_LIMITS`: objeto congelado com `elementCount: 500`, `connectionCount: 2000`, `zoneCount: 50`, `scenarioCount: 20`, `overrideCount: 2000`, `capacity: 10_000`, `timeSec: 31_536_000`, `durationH: 720`, `gridCells: 200`, `idLength: 64`, `nameLength: 120`, `reworkLimit: 10`, `lengthM: 10_000`, `speedMPerMin: 10_000`, `seed: 4_294_967_295`.
  - `timeDistributionSchema(options: { readonly positive: boolean })` e `type TimeDistribution` (uniões por `dist`): `{ dist: 'fixed'; valueSec }`, `{ dist: 'exponential'; meanSec }`, `{ dist: 'triangular'; minSec; modeSec; maxSec }`, `{ dist: 'truncatedNormal'; meanSec; standardDeviationSec; minSec; maxSec: number | null }`. Todo tempo de 0 ao teto; `meanSec` da exponencial e `standardDeviationSec` > 0; com `positive: true`, `valueSec` > 0. A coerência entre campos (mínimo, moda, máximo) é semântica (tarefa 4).
  - `type PlantIssueCode`: união de literais com os códigos abaixo; `interface PlantIssue { readonly elementId?: string; readonly path: readonly (string | number)[]; readonly code: PlantIssueCode }` (formato de objeto: `interface`, `code-style.md` seção 4).
  - `parseStructure<T>(schema: z.ZodType<T>, input: unknown): { readonly success: true; readonly data: T } | { readonly success: false; readonly issues: PlantIssue[] }`: único ponto que chama `safeParse`, com `reportInput: true` (para separar `REQUIRED` de `INVALID_TYPE`), e que nunca devolve a entrada; os problemas saem sem `elementId` (a tarefa 5 o preenche pelo caminho). Uma chave desconhecida entra no caminho só se tiver de 1 a 64 caracteres ASCII imprimíveis; senão o caminho para no objeto que a contém.

| Código | Quando | Nível |
| --- | --- | --- |
| `REQUIRED` | campo obrigatório ausente | forma |
| `INVALID_TYPE` | tipo errado (texto onde se espera número, `NaN`, `Infinity`) | forma |
| `INVALID_VALUE` | valor fora dos literais (tipo de elemento, `dist`, `rot`, modo, versão não inteira) | forma |
| `INVALID_FORMAT` | ID fora do padrão | forma |
| `OUT_OF_RANGE` | número abaixo do piso ou acima do teto; inteiro esperado | forma |
| `TOO_MANY_ITEMS` | lista acima do limite; texto acima do comprimento | forma |
| `TOO_FEW_ITEMS` | lista abaixo do mínimo (sem elementos, zonas, cenários, `shares` com menos de 2); texto vazio | forma |
| `UNKNOWN_FIELD` | chave desconhecida (um problema por chave, com a chave no caminho) | forma |
| `UNSUPPORTED_SCHEMA_VERSION` | versão mais nova que a do sistema (já em `rules/README.md`) | versão |
| `DUPLICATE_ID`, `UNKNOWN_REFERENCE`, `INVALID_RANGE`, `NO_SOURCE`, `NO_EXIT`, `UNREACHABLE_ELEMENT`, `INVALID_CONNECTION`, `OUT_OF_GRID`, `OVERLAP`, `ROUTING_REQUIRED`, `ROUTING_MISMATCH`, `PERCENTAGES_NOT_100`, `QUALITY_ROUTING_REQUIRED`, `INVALID_ROUTING_RULE`, `OVERRIDE_NOT_APPLICABLE`, `DUPLICATE_OVERRIDE`, `INVALID_WARMUP` | tarefa 4 e 5 | semântico |

- [ ] **Passo 1: testes que falham** (`time distribution`): aceita cada distribuição válida; `it.each` com cada campo negativo, `NaN`, `Infinity`, acima de 31 536 000 → `OUT_OF_RANGE` ou `INVALID_TYPE`; exponencial com média 0 e normal com desvio 0 → `OUT_OF_RANGE`; `rejects a fixed interarrival of 0` com `positive: true`; aceita fixa 0 com `positive: false`; `dist` desconhecido → `INVALID_VALUE`; campo de outra distribuição (`meanSec` na fixa) → `UNKNOWN_FIELD`. (`structural issues`): cada código da tabela de forma a partir de um esquema mínimo, inclusive lista vazia e texto vazio → `TOO_FEW_ITEMS`; `issues carry only elementId, path and code`; `cuts an unknown key longer than 64 characters from the path`.
- [ ] **Passo 2:** rodar e ver falhar (`pnpm nx test plant-schema`: falha porque os módulos não existem).
- [ ] **Passo 3:** instalar o Zod; implementar. No mapeamento, `invalid_type` com campo ausente vira `REQUIRED` (o Zod só põe a entrada no problema com `reportInput: true`, usado só dentro de `parseStructure`, nunca devolvido); `unrecognized_keys` vira um problema por chave; conferir no tipo `$ZodIssue` instalado os nomes que a documentação não lista e mapear cada um (código desconhecido do Zod → defeito: erro sem `code`, ADR-0013).
- [ ] **Passo 4:** rodar e ver passar, com `--coverage`.

**Commit sugerido:** `feat(plant-schema): add time distributions and structural issue codes` · `libs/plant-schema/package.json`, `pnpm-lock.yaml`, `src/limits.ts`, `src/time-distribution.ts`, `src/issues.ts` e specs

---

## Tarefa 3: forma do documento

**Arquivos:**
- Criar: `src/elements.ts`, `src/routing.ts`, `src/scenario.ts`, `src/plant.ts`, `src/tests/helpers/make-plant.ts`
- Modificar: `libs/plant-schema/tsconfig.lib.json` (`"src/tests/**/*.ts"` no `exclude`), `libs/plant-schema/eslint.config.mjs` (importar `tests/` fora de spec proibido, como no motor), `src/lint-conformance.spec.ts` (caso novo)
- Testar: `src/elements.spec.ts`, `src/routing.spec.ts`, `src/scenario.spec.ts`, `src/plant.spec.ts`, `src/tests/helpers/make-plant.spec.ts`

**Interfaces:**
- Consome: `timeDistributionSchema`, `PLANT_LIMITS`, `parseStructure` (tarefa 2).
- Produz (tipos por `z.infer`, todos os objetos estritos):
  - `type Routing`: `{ rule: 'byQuality'; good: string; rework: string | null; scrap: string }`, `{ rule: 'byPercentage'; shares: { to: string; sharePct: number }[] }` (`sharePct` inteiro de 1 a 100; de 2 a 2000 itens; `byPercentage` como no glossário), `{ rule: 'shortestQueue' }`.
  - Base de todo elemento: `id`, `type`, `zoneId`, `pos: [col, row]`, `rot: 0 | 90 | 180 | 270`, `size: [cols, rows]` (inteiros de 1 a 200).
  - `type PlantElement`, união por `type`:
    - `'production.source'`: `params: { interarrival: TimeDistribution (positive); queueCapacity: int 0..10 000 }`, `routing: Routing | null`;
    - `'production.station'`: `params: { cycle: TimeDistribution; idealCycleSec: number > 0 e ≤ teto; defectRate: number 0..1; failure: { timeToFailure: TimeDistribution (positive); repairTime: TimeDistribution } | null }`, `routing: Routing | null`;
    - `'production.buffer'`: `params: { capacity: int 1..10 000 }`, `routing: Routing | null`;
    - `'production.conveyor'`: `params: { lengthM: number > 0 e ≤ 10 000; speedMPerMin: number > 0 e ≤ 10 000; capacity: int 1..10 000 }`, `routing: Routing | null`;
    - `'production.sink'` e `'production.scrap'`: `params: {}`, sem `routing`.
  - `type Connection = { id; from; to; kind: 'direct' }` (`kind` reservado para tipos futuros, `plant-model.md`).
  - `type Scenario = { id; name; mode: 'shift' | 'continue' | 'steadyState'; durationH: number > 0 e ≤ 720; replicationCount: int 5..100; seed: int 0..4 294 967 295; warmupMin: number ≥ 0 | null; overrides: Override[] }`.
  - `type Override`, união por `param`, **uma variante por parâmetro**, cada `value` com o mesmo esquema do campo em `elements.ts` (mesmos pisos e tetos): `interarrival` (distribuição com `positive: true`), `queueCapacity` (0..10 000), `cycle`, `idealCycleSec`, `defectRate`, `failure` (objeto ou `null`), `capacity` (1..10 000), `lengthM`, `speedMPerMin`, `routing` (`Routing | null`), todas com `elementId`; e `{ param: 'reworkLimit'; value: int 0..10 }`, sem `elementId`.
  - `plantSchema` e `type Plant = { $schema?: string; schemaVersion: 1; id; name; grid: { cols; rows }; zones: { id; name }[]; elements: PlantElement[]; connections: Connection[]; settings: { reworkLimit: int 0..10 }; scenarios: Scenario[] }` (`$schema` opcional, texto de até 2048 caracteres, ADR-0008 item 10; de 1 a 500 elementos, até 2000 conexões, de 1 a 50 zonas, de 1 a 20 cenários).
  - `makePlant(changes?: Partial<Plant>): Plant`, só para testes.

- [ ] **Passo 1: testes que falham:** `rejects importing test helpers outside a spec` (conformidade do lint); aceita a planta de `makePlant()`; um teste por linha estrutural do "Foco de revisão" e da "Segurança", com o caminho e o código (por exemplo `rejects a __proto__ key parsed from JSON` lendo `JSON.parse('{"__proto__": {}}')` dentro de um elemento → `UNKNOWN_FIELD`; `rejects more than 500 elements` → `TOO_MANY_ITEMS` em `['elements']`; `rejects an id with a colon` → `INVALID_FORMAT`; `rejects an id with an accent, a space or a control character`; `rejects more than 20 scenarios`; `rejects more than 2000 overrides in a scenario`); `RN-SIM-003: accepts 5 to 100 replications and rejects 4 and 101` (`replicationCount`); `RN-SIM-006: rejects a rework limit above 10`; `RN-SIM-013: accepts a source queue capacity of 0 and rejects 10001`; `RN-SIM-016: rejects a conveyor speed of 0`; `RN-SIM-016: rejects a failure on a conveyor` (`UNKNOWN_FIELD`); `RN-SIM-015: rejects a fixed time to failure of 0`.
- [ ] **Passo 2:** rodar e ver falhar.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar e ver passar, com `--coverage`.

**Commit sugerido:** `feat(plant-schema): define the plant v1 document shape` · arquivos da tarefa

---

## Tarefa 4: regras semânticas da planta

**Arquivos:**
- Criar: `src/semantics/references.ts`, `src/semantics/flow-graph.ts`, `src/semantics/grid.ts`, `src/semantics/routing-rules.ts`, `src/semantics/ranges.ts`, `src/semantics/validate-semantics.ts`
- Testar: um spec por arquivo

**Interfaces:**
- Consome: `Plant`, `PlantIssue` (tarefas 2 e 3).
- Produz: `validateSemantics(plant: Plant): PlantIssue[]` (todos os problemas da planta base, cada um com `elementId` quando ligado a um elemento, na ordem dos elementos e, dentro de um elemento, das regras abaixo).

Regras, cada uma com seus testes (o caminho e o código esperado no `toMatchObject`):

| Regra | Código |
| --- | --- |
| IDs únicos em todo o documento | `DUPLICATE_ID` |
| `zoneId`, `from`, `to`, destinos da regra existem | `UNKNOWN_REFERENCE` |
| Triangular: mínimo ≤ moda ≤ máximo e mínimo < máximo; normal truncada: mínimo < máximo (quando há máximo) | `INVALID_RANGE` |
| Ao menos uma fonte; ao menos uma expedição ou refugo (RN-EDT-004) | `NO_SOURCE`, `NO_EXIT` |
| Conexão para a própria origem, repetida entre o mesmo par, chegando a uma fonte ou saindo de expedição ou refugo | `INVALID_CONNECTION` |
| Todo elemento alcançável a partir de uma fonte e com caminho até uma expedição ou refugo (RN-EDT-004, "nenhum elemento solto") | `UNREACHABLE_ELEMENT` |
| Dentro da grade e sem sobreposição, com `size` girado em 90° e 270° (RN-EDT-001) | `OUT_OF_GRID`, `OVERLAP` |
| Mais de uma conexão de saída exige `routing` (RN-SIM-004) | `ROUTING_REQUIRED` |
| Os destinos da regra são exatamente as conexões de saída, cada um uma vez (destino repetido num `shares`, ou `good` igual a `rework`, também) | `ROUTING_MISMATCH` |
| Percentuais somam 100 (RN-SIM-005) | `PERCENTAGES_NOT_100` |
| `byQuality` só em estação; `scrap` aponta para um refugo; `good` não aponta para refugo; `rework` não aponta para expedição nem refugo | `INVALID_ROUTING_RULE` |
| `defectRate > 0` exige `byQuality` (RN-SIM-004 e 006) | `QUALITY_ROUTING_REQUIRED` |

- [ ] **Passo 1: testes que falham:** um por linha da tabela, nomes com o ID da regra quando houver (`RN-SIM-004: requires a routing rule for two outgoing connections`, `RN-SIM-005: rejects percentages summing to 99`, `RN-EDT-001: occupies size[0] by size[1] cells at 0 and 180 degrees`, `RN-EDT-001: swaps columns and rows at 90 and 270 degrees`, `RN-EDT-001: detects an overlap after a 90 degree rotation`, `RN-EDT-001: rejects an element past the grid edge`, `RN-EDT-004: reports an element with no path to an exit`, `RN-EDT-004: requires a source and an exit`, `rejects a duplicated id across elements and connections`, `rejects a connection to an unknown element`, `rejects a second connection between the same pair`, `rejects a connection into a source`, `rejects a triangular with min above mode`, `rejects a truncated normal with min equal to max`, `RN-SIM-004: rejects a routing rule that leaves an outgoing connection out`, `RN-SIM-005: rejects a repeated destination in byPercentage`, `RN-SIM-006: rejects a scrap destination that is not a scrap element`, `RN-SIM-006: rejects byQuality on a buffer`, `RN-SIM-004: requires byQuality for a station with defects`), mais `returns every semantic problem at once`.
- [ ] **Passo 2:** rodar e ver falhar.
- [ ] **Passo 3:** implementar; o grafo usa busca em largura a partir das fontes e das saídas (custo linear no número de conexões); a sobreposição compara as células ocupadas por um mapa de células (no máximo 200 × 200).
- [ ] **Passo 4:** rodar e ver passar, com `--coverage`.

**Commit sugerido:** `feat(plant-schema): validate plant references, flow graph, grid and routing` · arquivos da tarefa

---

## Tarefa 5: cenários e `validatePlant`

**Arquivos:**
- Criar: `src/apply-scenario.ts`, `src/semantics/scenarios.ts`, `src/validate-plant.ts`, `src/tests/helpers/catch-error.ts` (cópia do helper do motor, que o esquema não pode importar; duas cópias ficam abaixo da regra de três)
- Modificar: `src/index.ts`
- Testar: `src/apply-scenario.spec.ts`, `src/semantics/scenarios.spec.ts`, `src/validate-plant.spec.ts`, `src/tests/helpers/catch-error.spec.ts`

**Interfaces:**
- Consome: `plantSchema`, `parseStructure`, `validateSemantics`.
- Produz:
  - `CURRENT_SCHEMA_VERSION = 1`.
  - `applyScenario(plant: Plant, scenarioId: string): Plant`: devolve uma planta nova com cada sobreposição aplicada ao campo indicado (o valor inteiro substitui o anterior; o resto é copiado), sem mudar a original; `scenarioId` inexistente → erro sem `code` (defeito de quem chama, ADR-0013, como no `run` do roteiro). Usado pela validação por cenário e por quem chama o esquema; o motor não o importa (ADR-0011, item 2).
  - `type PlantValidation = { readonly valid: true; readonly plant: Plant } | { readonly valid: false; readonly issues: readonly PlantIssue[] }`.
  - `validatePlant(document: unknown): PlantValidation`: (1) só um `schemaVersion` inteiro seguro maior que `CURRENT_SCHEMA_VERSION` é "mais novo" → só `UNSUPPORTED_SCHEMA_VERSION` em `['schemaVersion']`; qualquer outro valor inválido (1.5, texto, 0) é problema de forma; a v1 não tem etapa de migração (a cadeia começa na v2); (2) forma, por `parseStructure`; com problema, devolve os de forma; (3) `validateSemantics` na planta base; (4) para cada cenário: `OVERRIDE_NOT_APPLICABLE` (elemento inexistente ou parâmetro que o tipo não tem), `DUPLICATE_OVERRIDE`, `INVALID_WARMUP` (aquecimento diferente de `null` fora do regime estável, ou ≥ duração; RN-SIM-008 só zera no regime estável; `warmupMin: 0` no regime estável conta como aquecimento informado), e, se o cenário não tiver esses problemas, `validateSemantics(applyScenario(...))`; cada problema novo do cenário (chave de comparação: código, caminho na planta e `elementId`; os que já estão na base não se repetem) recebe o caminho `['scenarios', i, 'overrides', k, 'value', ...resto]` quando cai dentro do campo trocado pela sobreposição k, e `['scenarios', i]` nos demais casos, sempre com `elementId`; (5) `elementId` preenchido para todo caminho que passa por `['elements', i]` ou por uma sobreposição, só quando o `id` bruto do elemento casa com o padrão dos IDs.

- [ ] **Passo 1: testes que falham:** `applyScenario replaces a station cycle`, `applyScenario turns failures off with null`, `applyScenario does not change the base plant`, `applyScenario throws without a code for an unknown scenario` (pelo `catchError`, ADR-0013); `RN-JSN-005: reports UNSUPPORTED_SCHEMA_VERSION for a newer version` (versão 2, com outros erros no documento: só esse problema); `UC-SIM-001: returns every problem at once` (três problemas semânticos em elementos diferentes); `UC-SIM-001: returns structural problems without running the semantic rules`; `RN-SIM-007: accepts a steady-state scenario without warm-up`; `rejects a warm-up in shift mode`; `RN-SIM-004: rejects a scenario that raises defectRate on a station without a quality rule` (caminho `['scenarios', i]`); `reports a scenario problem at its override path` (sobreposição de `routing` com 99%); `does not repeat a base problem in a scenario`; `rejects a scenario that sets a fixed interarrival of 0`; `rejects a scenario that sets a buffer capacity of 0`; `rejects the same override twice`; `rejects a warm-up equal to the duration`; `RN-JSN-005: treats version 1.5 as a shape problem`; `omits elementId when the element id is invalid`; `rejects an override for a parameter the element does not have`; `fills elementId for a problem inside an element`; `RN-JSN-005: points a negative cycle to its element` (`elementId` e caminho até `cycle`); `rejects null, a number and a list at the root` (um problema na raiz, caminho vazio).
- [ ] **Passo 2:** rodar e ver falhar.
- [ ] **Passo 3:** implementar; exportar em `index.ts` `validatePlant`, `applyScenario`, `CURRENT_SCHEMA_VERSION`, `PLANT_LIMITS` e os tipos (`Plant`, `PlantElement`, `Connection`, `Routing`, `Scenario`, `Override`, `TimeDistribution`, `PlantIssue`, `PlantIssueCode`, `PlantValidation`).
- [ ] **Passo 4:** rodar e ver passar, com `--coverage`.

**Commit sugerido:** `feat(plant-schema): validate plants and scenarios through validatePlant` · arquivos da tarefa

---

## Tarefa 6: padrões do editor e planta de exemplo

**Arquivos:**
- Criar: `src/defaults.ts`, `libs/plant-schema/examples/demo-line.json`
- Modificar: `src/index.ts`, `src/tests/helpers/make-plant.ts` (passa a usar os padrões)
- Testar: `src/defaults.spec.ts`, `src/demo-line.spec.ts`

**Interfaces:**
- Produz: `ELEMENT_DEFAULTS` (por tipo: `params`, `routing: null`, `size: [1, 1]`, `rot: 0`, com os valores da tabela de decisões; estação com `idealCycleSec: 50` e `failure: null`); `DEFAULT_FAILURE` (`timeToFailure` exponencial de 14 400 s, `repairTime` exponencial de 900 s); `DEFAULT_SETTINGS` (`reworkLimit: 2`); `DEFAULT_SCENARIO` (`mode: 'shift'`, `durationH: 8`, `replicationCount: 30`, `seed: 42`, `warmupMin: null`, `overrides: []`).
- A planta de exemplo: fonte exponencial de 45 s com fila 20; cinco estações fixas de 40, 44, 56, 50 e 42 s, com buffers de 10 entre elas; expedição; a última estação com `defectRate: 0.02` e regra por qualidade para a expedição e um refugo; sem laço de retrabalho; cenários "Atual", "M3 mais rápida" (ciclo de 46 s) e "Com falhas" (M3 com `DEFAULT_FAILURE`). **[Palpite]** Os números vêm do debate e só valem depois de rodados (sobrecarga, gargalo que muda para M4, vazão que sobe): conferidos nos sub-planos 5 e 6, que ajustam o arquivo se preciso.

- [ ] **Passo 1: testes que falham:** `RN-EDT-003: a source, a station and a sink with the defaults are valid` (planta montada só com `ELEMENT_DEFAULTS`, `DEFAULT_SETTINGS` e `DEFAULT_SCENARIO`); `RN-EDT-003: a station with DEFAULT_FAILURE is valid`; `the demo plant is valid`.
- [ ] **Passo 2:** rodar e ver falhar.
- [ ] **Passo 3:** implementar.
- [ ] **Passo 4:** rodar e ver passar, com `--coverage`.

**Commit sugerido:** `feat(plant-schema): add editor defaults and the demo plant` · arquivos da tarefa

---

## Tarefa 7: JSON Schema publicado

**Arquivos:**
- Criar: `libs/plant-schema/plant.schema.v1.json` (gerado), `src/json-schema.spec.ts`
- Modificar: `.prettierignore` (o arquivo gerado), `docs/architecture/workspace.md` (como regenerar)

- [ ] **Passo 1: teste que falha:** `the generated JSON Schema matches the published file`: `z.toJSONSchema(plantSchema)` (Draft 2020-12), serializado com dois espaços e quebra de linha final, igual ao arquivo, pelo `toMatchFileSnapshot` do Vitest (conferir na tarefa que o Vitest 5.0.5 não grava instantâneo novo no CI; regenerar com `pnpm nx test plant-schema -- -u`).
- [ ] **Passo 2:** rodar e ver falhar (o arquivo não existe; no CI, falha).
- [ ] **Passo 3:** gerar com `-u`, revisar o arquivo (todo objeto com `additionalProperties: false`, nenhum tipo irrepresentável); se o Zod lançar por um tipo irrepresentável, trocar o tipo, nunca usar `unrepresentable: "any"`.
- [ ] **Passo 4:** rodar sem `-u` e ver passar.

**Commit sugerido:** `feat(plant-schema): publish the generated JSON Schema of plant v1` · arquivos da tarefa

---

## Tarefa 8: docs vivos e fechamento

**Arquivos:**
- Criar: `docs/architecture/plant-schema.md` (exigido pelo ADR-0011, "Em aberto": forma do documento, níveis de validação, códigos, limites e onde moram, padrões, `applyScenario`, JSON Schema, versão e migrações; fecha o "Em aberto" do ADR-0008 sobre limites)
- Modificar: `docs/plans/2026-11-04-roteiro-motor.md` (linha 3 "Concluído"; interface `Plant`/`validatePlant` com `PlantValidation` e `applyScenario`; pendências do 3 marcadas como decididas, com o PDR-0022; RN-SIM-013 e 014 no sub-plano 4 e RN-SIM-015 a 017 no 5; novas pendências: sub-plano 4 — como o motor recebe o cenário aplicado sem importar `applyScenario` (a casca passa a planta aplicada, o motor repete a aplicação campo a campo, ou um ADR novo que complemente o item 2 do ADR-0011), ordem dos eventos no mesmo instante, WIP e lead time contando a fila da fonte, compilação de `TimeDistribution` para `Variability` (`dist` → `kind`, `maxSec: null` → `Infinity`), sequências por propósito com `timeToFailure` e `repairTime` separados e defeito e percentual sempre sorteando; sub-plano 5 — linha travada com grafo de espera, gargalo pela fração ativa, OEE no gargalo com `idealCycleSec`, peça retrabalhada na qualidade, conferir a planta de exemplo; sub-plano 6 — "k de N travaram", IC pareado entre cenários, conferir a RN-SIM-011 com a planta de exemplo), `docs/plans/README.md`, este plano (status), `.claude/rules/schema.md` (só se a tarefa mudar uma convenção do guia; `code-style.md` no mesmo PR, se for o caso)

- [ ] **Passo 1:** escrever os docs.
- [ ] **Passo 2:** `pnpm nx run-many -t lint typecheck test` e `pnpm exec prettier --check .`: tudo passa.
- [ ] **Passo 3:** marcar este plano "Concluído" no cabeçalho e no índice.

**Commit sugerido:** `docs: document the plant schema and close sub-plan 3` · arquivos da tarefa

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Distribuições, problemas de forma, IDs e limites sem testes nomeados para fila da fonte, esteira e falha | autorrevisão | Sim | Testes com os IDs RN-SIM-013, 015 e 016 |
| 2 | IDs das regras novas só "propostos" | autorrevisão | Sim | RN-SIM-013 a 017 fixados na tarefa 1 |
| 3 | Limites de esteira e faixa da semente sem registro | autorrevisão | Sim | Listados como estimativas nas restrições globais |
| 4 | Semântica depois da forma em conflito aparente com o UC-SIM-001 | autorrevisão | Sim | Ancorada nas extensões 3a e 4a do UC |
| 5 | RN-JSN-005 pede o elemento no problema de forma | autorrevisão | Sim | Teste `points a negative cycle to its element` |
| 6 | `rework` podia apontar para a expedição | autorrevisão | Sim | Regra de `INVALID_ROUTING_RULE` ampliada |
| 7 | Raiz que não é objeto sem teste claro | autorrevisão | Sim | Teste `rejects null, a number and a list at the root` |
| 8 | `PLANT_LIMITS` sem os limites novos | autorrevisão | Sim | Campos acrescentados |
| 9 | Regras novas sem sub-plano dono | autorrevisão | Sim | RN-SIM-013 e 014 no 4; 015 a 017 no 5 |
| 10 | Teste da RN-JSN-005 sem caminho esperado | autorrevisão | Sim | Caminho até `cycle` |
| 11 | Retrabalho para a própria estação | autorrevisão | Sim | Conexão para a própria origem recusada (trava com bloqueio) |
| 12 | O motor importaria `applyScenario` e `PLANT_LIMITS`, proibido pelo ADR-0011 item 2 e pelo lint | plan-reviewer (erro) | Sim | Conferido no `eslint.config.mjs` do motor; o motor não importa; como recebe o cenário aplicado vira pendência do 4 |
| 13 | Sobreposições agrupadas pulavam pisos e tetos | plan-reviewer (erro) | Sim | Uma variante por parâmetro, com o esquema do campo; dois testes |
| 14 | `percentage` contra `byPercentage` do glossário | plan-reviewer (erro) | Sim | Conferido no glossário |
| 15 | Helpers de teste sem exclusão do build nem proibição de import | plan-reviewer (erro) | Sim | Conferido no `tsconfig.lib.json`; exclusão, lint e teste na tarefa 3 |
| 16 | `catchError` não existe no esquema | plan-reviewer (erro) | Sim | Cópia em `src/tests/helpers` na tarefa 5 |
| 17 | Caminho e deduplicação dos problemas de cenário | plan-reviewer (sugestão) | Sim | Convenção e chave definidas; dois testes |
| 18 | `elementId` e chave desconhecida vindos da entrada bruta | plan-reviewer (sugestão) | Sim | Só IDs no padrão; chave longa cortada; dois testes |
| 19 | `shares` sem limite; destino repetido | plan-reviewer (sugestão) | Sim | De 2 a 2000 itens; repetido é `ROUTING_MISMATCH` |
| 20 | Sem código para lista ou texto vazio | plan-reviewer (sugestão) | Sim | `TOO_FEW_ITEMS` |
| 21 | `PlantIssue` como `type` | plan-reviewer (sugestão) | Sim | `interface`, pela seção 4 do guia |
| 22 | `percent` e `replications` contra a seção 2 do guia | plan-reviewer (sugestão) | Sim | `sharePct` e `replicationCount`; `defectRate` fica, nomeado no ADR-0008 e no UC |
| 23 | Quem chama `safeParse` com `reportInput` | plan-reviewer (sugestão) | Sim | `parseStructure` na tarefa 2 |
| 24 | Convenção da rotação de `size` | plan-reviewer (sugestão) | Sim | Escrita nas decisões técnicas; testes por rotação |
| 25 | Ordem das verificações de `schemaVersion` | plan-reviewer (sugestão) | Sim | Só inteiro seguro maior é "mais novo"; teste com 1.5 |
| 26 | UC-SIM-001 não atualizado | plan-reviewer (sugestão) | Sim | Na tarefa 1 |
| 27 | Teste com o ID da RN-SIM-006 sem o limite 10 na regra | plan-reviewer (sugestão) | Sim | Faixa de 0 a 10 escrita na RN-SIM-006 |
| 28 | Linhas do foco de revisão sem teste nomeado | plan-reviewer (sugestão) | Sim | Testes nomeados nas tarefas 3 a 5 |
| 29 | Etapa de migração identidade sem forma | plan-reviewer (sugestão) | Sim | Removida: a v1 não tem migração |
