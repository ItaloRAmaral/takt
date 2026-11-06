# Roteiro: esquema da planta e motor de simulação (marco 1)

| Campo | Valor |
| --- | --- |
| Status | Aprovado (04/11/2026) |
| Data | 04/11/2026 |
| Pedido | "Roteiro do motor de simulação (`@takt/sim-engine`) do marco 1, a partir dos casos de uso UC-SIM-001 a UC-SIM-004, das regras RN-SIM e do ADR-0011; inclui o helper `catchError` e a conferência do ADR-0013 no primeiro sub-plano, e a medição da D4." Confirmado pelo usuário em 04/11/2026 ("Podemos seguir sim"). |
| Contexto | [Casos de uso do marco 1](../product/use-cases/README.md) (UC-SIM-001 a 004), [regras de simulação](../product/rules/simulation.md), [RN-EDT-001, 003 e 004](../product/rules/editor.md), [RN-JSN-005](../product/rules/json.md), [simulation.md](../product/simulation.md), [plant-model.md](../product/plant-model.md), [mvp-scope.md](../product/mvp-scope.md), [milestones.md](../product/milestones.md), [ADR-0008](../adr/0008-validacao-de-dados.md), [ADR-0009](../adr/0009-estrategia-de-testes.md), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md), [ADR-0013](../adr/0013-erros-esperados.md), [code-style.md](../architecture/code-style.md) seções 5, 7, 8 e 10 e "Decisões pendentes", [pesquisa do guia de estilo](../research/guia-de-estilo-de-codigo.md) (D4), [pesquisa sobre aquecimento](../research/aquecimento-em-simulacao-didatica.md), [pesquisa da literatura do motor](../research/literatura-do-motor.md) (04/11/2026, corrige pontos da anterior), [workspace.md](../architecture/workspace.md) |

**Objetivo:** o esquema valida plantas e o motor executa os quatro casos de uso do marco 1, reproduzindo os resultados da literatura de [simulation.md](../product/simulation.md) dentro do intervalo de confiança: é o mostrável do marco ("o motor reproduz Factory Physics e M/M/1").

**Regras e registros:** RN-SIM-001 a 012, RN-EDT-001, 003 e 004, RN-JSN-005; PDR-0008, PDR-0014, PDR-0020; ADR-0008 (itens 9 a 13 e riscos), ADR-0009, ADR-0011, ADR-0013; decisão pendente D4 do guia.

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Começar o roteiro do motor antes de outras pendências | Sim, depois de fechar as pendências do workspace | 04/11/2026 |
| Contradição entre o UC-SIM-001 e o UC-SIM-003 sobre o aquecimento | A verificação fica num lugar só: o `run` do motor recusa com `INVALID_PLANT` um regime estável sem aquecimento; a validação da planta aceita esse cenário. UC-SIM-001, UC-SIM-002 (1b) e RN-SIM-007 atualizados neste pull request | 04/11/2026 |
| Código de partida do gerador, dada a licença do RngStreams (C não comercial; GitHub Apache 2.0) | Escrito a partir do artigo (L'Ecuyer et al. 2002), sem copiar código de nenhuma das versões, e conferido contra o arquivo de saída oficial | 04/11/2026 |
| Contagem do limite de retrabalho (RN-SIM-006 contraditória) | Conta retrabalhos, com um contador por peça somado em todas as estações; padrão 2 (até 3 passagens), definido por planta e editável. RN-SIM-006 atualizada neste pull request | 04/11/2026 |

## Sub-planos

Cada sub-plano entrega código testado e mesclável sozinho, e é detalhado no modelo completo só quando os de que depende estiverem aprovados. Em cada um, no mesmo pull request: os docs vivos que ele muda (`docs/architecture/sim-engine.md`, criado no 1, e `plant-schema.md`, criado no 3, exigidos pelo ADR-0011), as regras cujo "Em aberto" ele fecha, as fontes novas em `references.md` e, para cada "Em aberto" de um registro aceito que ele fecha, a skill `writing-decision-records` (registro novo ou só o doc vivo, pelos critérios dela). A última tarefa marca o sub-plano como "Concluído"; a do 9 fecha também este roteiro.

| # | Sub-plano | Entrega testável | Testes que provam a entrega | Depende de | Regras e registros | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Fundamentos do motor | Classe de erro do motor; helper `catchError`; MRG32k3a com sequência por chave e subsequência por replicação; distribuições por inversão (fixa, exponencial, triangular, normal truncada) | Unitário: `catchError` devolve o erro e falha se nada for lançado; `toMatchObject` com `code` numa subclasse de `Error` (ADR-0013, "Em aberto"); estados inteiros das primeiras sequências e subsequências idênticos aos do arquivo de saída oficial do RngStreams (`.res`); mesma chave → mesma sequência, colisão de chaves detectada na compilação; AS 241 igual ao `NormalDist.inv_cdf` do Python e aos dados de teste do artigo; Φ e Q (Hart) contra referência própria com 100 algarismos, nas tolerâncias medidas; triangular contra casos calculados à mão; normal truncada com o intervalo inteiro numa cauda ([8, 9] e [9, 10]) sem perda catastrófica (erro de ~10⁻⁹ desvios-padrão, medido). Média e variância amostrais (10⁵ amostras) dentro do IC de 95% | — | ADR-0011 itens 5 e 6; ADR-0013; RN-SIM-001 e 010 | Concluído (05/11/2026), [plano](2026-11-04-motor-fundamentos.md) |
| 2 | Medição da D4 | `Math.log` e `Math.exp` (pela especificação, só `sqrt` e as quatro operações são exatos) comparadas bit a bit entre Node e os motores dos navegadores (V8, SpiderMonkey, JavaScriptCore), com as entradas difíceis publicadas pelo CORE-MATH e os vetores do gerador; decisão da D4 com o usuário | Teste de referência: as mesmas entradas, saídas comparadas bit a bit entre motores | 1 | D4; RN-SIM-001; PDR-0008. Resultado (a) → PDR novo que muda a RN-SIM-001; (b) → ADR novo que complementa o ADR-0011 | A planejar |
| 3 | Esquema da planta v1 | `@takt/plant-schema` completo para o marco 1: todos os elementos do MVP (fonte, estação, buffer, esteira, expedição, refugo) com parâmetros e padrões, roteamento, configurações, cenários e sobreposições; validação estrutural (modo estrito) e semântica; cadeia de migrações; JSON Schema gerado (UC-SIM-001) | Unitário: um teste por regra estrutural e semântica, com o código esperado; chave desconhecida recusada; limites de elementos e conexões; versão mais nova → `UNSUPPORTED_SCHEMA_VERSION`; cenário em regime estável sem aquecimento aceito; JSON Schema gerado igual ao versionado; planta mínima com os padrões aceita (RN-EDT-003) | — | UC-SIM-001; RN-SIM-003 a 007; RN-EDT-001, 003 e 004; RN-JSN-005; ADR-0008 itens 9 a 13 e riscos | A planejar |
| 4 | Núcleo de eventos e linha simples | Compilação da planta (sobreposições sem mesclagem profunda, segundos, grafo, sequências por chave); lista de eventos com desempate; fonte, estação, buffer e expedição; uma replicação no modo turno com log, indicadores (vazão, WIP, lead time, utilização), séries por minuto e estado final; tetos de segurança | Unitário: fonte → estação → expedição roda com os padrões (RN-EDT-003); linha em série com tempos fixos: a peça n sai em Dₙ = T₀ + (n − 1)·max(a, t_max), com bloqueio depois do serviço (derivação conferida numericamente na pesquisa); Lei de Little exata no turno, que termina com WIP (Little 2011, LL.2): soma dos tempos de cada peça dentro da janela, inclusive refugadas e inacabadas, igual à área do WIP, com tolerância de ponto flutuante; `__proto__` nas sobreposições não altera nada; cada teto passado → `SIMULATION_LIMIT_EXCEEDED`, inclusive o de elementos antes de começar (UC-SIM-002, 2a e 4a). Propriedade: conservação (entrou = saiu + em processo + refugo); determinismo | 1, 3 | UC-SIM-002 passos 2 a 4 e 6; RN-SIM-001; RN-EDT-003; ADR-0011 itens 2 a 4 e 8; ADR-0008 (poluição de protótipo) | A planejar |
| 5 | Falhas, defeitos, esteira, roteamento e retrabalho | Falhas e reparos, defeitos, refugo, esteira, regras de roteamento (por qualidade, por percentual, fila mais curta, com desempate), limite de retrabalho; OEE e gargalo | `UC-SIM-002`: disponibilidade ≈ 94,1% (240/255) com MTBF 240 e MTTR 15, válida só com falhas no relógio de calendário, MTBF contado do fim do reparo e uma disponibilidade que não conta faminto e bloqueado; passagens de retrabalho conforme a geométrica truncada no limite, (1 − pⁿ⁺¹)/(1 − p), com refugo pⁿ⁺¹ (RN-SIM-006: n retrabalhos por peça). Unitário: peça vai ao refugo no defeito seguinte ao último retrabalho permitido, com o contador somado entre estações (RN-SIM-006); por qualidade manda a defeituosa ao destino de defeito; proporções do percentual; fila mais curta com empate decidido pela regra. Propriedade: números aleatórios comuns (RN-SIM-010): com o tempo de M3 alterado, as amostras sorteadas para M1 são as mesmas (os instantes só coincidem se as falhas correrem no relógio de calendário). Unitário: gargalo = maior utilização, contando como ativo o tempo processando e em falha | 4 | RN-SIM-004 a 006 e 010; PDR-0014 | A planejar |
| 6 | Replicações, modos e resultado | `run`: N replicações, média e IC de 95% pela t, log só da primeira, modos turno, continuar e regime estável, aviso do gargalo, versão, semente e modo no resultado (UC-SIM-002 completo) | `UC-SIM-002` no regime estável: linha em série (vazão = 1 / maior tempo de ciclo, gargalo = estação mais lenta) e k estações paralelas (Hopp e Spearman); M/M/1 com ρ = 0,8 (L = 4, W = 5 dentro do IC); Lei de Little em regime. No turno com T = 480: média de L ≈ 3,79 (3,7918), que 30 replicações não distinguem de 4 (meia largura do IC ≈ 0,62): o teste usa pelo menos 1.000 replicações, no CI noturno, ou o alvo exato E[L(10)] = 2,030. Cada caso com as condições escritas no teste (fila ilimitada, fonte nunca bloqueada, sem falhas; IC com S = 0 nos determinísticos). Unitário: estatísticas zeradas e estado mantido no fim do aquecimento (RN-SIM-008), com Little exata na janela que começa com WIP (LL.2); continuar sem estado compatível → `INVALID_PLANT`; regime estável sem aquecimento → `INVALID_PLANT` (RN-SIM-007); uma replicação rodada sozinha igual à mesma replicação no conjunto; aviso acima do limite (RN-SIM-011) | 5 | UC-SIM-002; RN-SIM-001, 003, 007, 008, 011, 012; ADR-0011 itens 7 a 10 | A planejar |
| 7 | Assistente de aquecimento | `suggestWarmup`: replicações piloto, MSER-5 por indicador, maior corte, nova tentativa quando o corte cai na segunda metade (UC-SIM-003) | Unitário: MSER-5 sobre séries sintéticas com corte conhecido; corte na segunda metade → nova tentativa, e resultado inválido depois do limite (4a, 4b); piloto que passa de um teto → `SIMULATION_LIMIT_EXCEEDED` (2a). `UC-SIM-003` no M/M/1 com ρ = 0,8: corte válido, IC da média truncada cobre L = 4 e a sugestão é o maior dos cortes (o corte típico é pequeno, mediana de 10 a 15 unidades de tempo em simulação da pesquisa, e não "algumas centenas") | 6 | UC-SIM-003; RN-SIM-008 e 009 | A planejar |
| 8 | Execução passo a passo | Início da execução passo a passo, `step` (próximo evento) e `advanceUntil(t)`, com os eventos do trecho e o estado em t (UC-SIM-004) | Unitário: eventos trecho a trecho (por `step` e por `advanceUntil`) iguais ao log do `run` com a mesma entrada; indicadores no fim iguais aos da mesma replicação no `run`; t anterior ao relógio → erro sem `code`; t além da duração → para na duração; teto passado → `SIMULATION_LIMIT_EXCEEDED` | 6 | UC-SIM-004; RN-SIM-001 e 002; ADR-0011 item 9 | A planejar |
| 9 | Tetos medidos e fechamento do marco | Valores padrão dos tetos, medidos; relatório dos testes contra a literatura para o post | Teste de desempenho que fixa os tetos | 4 a 8 | ADR-0011, "Em aberto" | A planejar |

**Ordem:** 1 → 2 → 3 → 4 a 9. Os sub-planos 1 e 3 não dependem um do outro; a D4 vem logo depois do 1 porque o resultado dela pode reescrever as distribuições (opção b: funções próprias) antes que os sub-planos 4 a 8 se apoiem nelas.

## Estratégia de testes do conjunto

- **TDD** em todos os sub-planos (motor e regras `RN-...`, ADR-0009): o teste da literatura é escrito antes do código que o faz passar.
- **Casos da literatura** ([simulation.md](../product/simulation.md#validação-contra-a-literatura)), cada um no sub-plano que entrega o que ele mede, com o nome `UC-SIM-002: ...` (o caso de uso que eles verificam) ou `UC-SIM-003: ...`:

| Caso | Sub-plano |
| --- | --- |
| Lei de Little em janela finita (exata, LL.2, no turno) | 4 |
| Disponibilidade com MTBF 240 e MTTR 15; retrabalho geométrico | 5 |
| Linha em série e k estações paralelas (Hopp e Spearman), M/M/1 e Lei de Little em regime estável; média transiente 3,79 no turno; LL.2 depois do aquecimento | 6 |
| MSER-5 no M/M/1 | 7 |

- **Tolerância pelo intervalo de confiança**, nunca igualdade, com semente fixa (ADR-0009). **Estimativa** da pesquisa: ±5% em L com ρ = 0,8 exige cerca de 1,7×10⁵ unidades de tempo somadas. **Palpite** da pesquisa: ρ = 0,5 custa cerca de 5 vezes menos e cobre o mesmo código.
- **Propriedades** com fast-check e semente fixa (ADR-0009): conservação e Lei de Little sobre plantas geradas; a dependência entra no sub-plano 4.
- **Determinismo** (RN-SIM-001) verificado em cada sub-plano que acrescenta aleatoriedade ou ordem de eventos: duas execuções com a mesma entrada, resultados idênticos.
- **Metas** (ADR-0009): 90% de linhas e ramificações nas duas bibliotecas; 80% de mutação no motor. O esquema não tem mutação.
- **Dados de referência** (sub-plano 1, feito): o arquivo de saída oficial do RngStreams (versão Apache 2.0) e os vetores da RFC 9923 (FNV-1a), usados como dados; o AS 241 contra o `statistics.NormalDist` do Python 3.10.12 e os dados de teste do artigo; Φ, Q e a normal truncada contra cálculo próprio com `decimal` de 100 algarismos (o R não está instalado); a triangular com casos calculados à mão. Os scripts e os comandos estão em [`sim-engine.md`](../architecture/sim-engine.md).
- **Condições antes dos números** ([pesquisa](../research/literatura-do-motor.md)): os casos da literatura só fecham com escolhas específicas do esquema (fila ilimitada e fonte nunca bloqueada para o M/M/1; bloqueio depois do serviço para a linha em série; falhas no relógio de calendário para os 94,1%). O sub-plano 3 decide essas escolhas com a tabela de validação aberta, e cada teste escreve as suas condições no arranjo.

## Interfaces entre sub-planos

Decididas aqui, para cada sub-plano ser detalhado sozinho. Os campos internos de cada tipo ficam no sub-plano que o produz.

| Interface | Produzida por | Usada por |
| --- | --- | --- |
| `SimulationError extends Error`, com `readonly code` literal (`'SIMULATION_LIMIT_EXCEEDED'`, `'INVALID_PLANT'`) (ADR-0013); sem `details` até os sub-planos 4 e 6, que declaram o formato de cada código | 1 | 4 a 8 |
| `catchError(act: () => void): unknown`, utilitário de teste do motor em `src/tests/helpers/` (ADR-0013, item 5); uma função assíncrona é recusada no lint | 1 | 4 a 9 |
| Gerador: uma sequência por **chave** `<id do elemento>:<propósito>` (propósitos: `interarrival`, `cycle`, `failure`, `repair`, `defect`, `routing`), derivada da semente do cenário, com uma subsequência por replicação; uniformes em (0, 1). A sequência de uma chave não depende das outras chaves nem da ordem dos elementos. Feito: a sequência de uma chave é a de número FNV-1a de 64 bits de `<semente>:<chave>` (`assignStreamIndices(seed, keys)`, que lança `INVALID_PLANT` em índices repetidos); `findStreamStart(index)` uma vez por chave; `createRandomStream(start, replication)` por replicação, com replicação de 0 a 2⁵¹ − 1; `nextUniform(stream)` | 1 | 4, 5 |
| Distribuições: uma amostra = inversa da distribuição aplicada a um único uniforme, por tipo de variabilidade da planta. Feito: `Variability` (`fixed`, `exponential`, `triangular`, `truncatedNormal`, tempos em segundos) e `drawTimeSec(variability, stream)`; a fixa não consome número | 1 (2 pode trocar a implementação, não a interface) | 4, 5 |
| `Plant` (tipo inferido do Zod, com todos os campos do marco 1) e `validatePlant(document: unknown)`, que devolve a planta aceita na versão atual ou a lista completa `{ elementId?, path, code }`; versão mais nova e demais problemas vêm **na lista**, não como exceção (ADR-0008, item 12), e o esquema não depende do motor | 3 | 4 a 8 e o `takt-web-app` |
| Modelo compilado: a planta com as sobreposições do cenário aplicadas campo a campo, tempos em segundos, grafo de elementos e geradores atribuídos (ADR-0011, item 2) | 4 | 5 a 8 |
| Resultado de uma replicação: indicadores, séries por intervalo, estado final e, quando pedido, o log de eventos | 4 (5 acrescenta OEE e gargalo) | 6, 7, 8 |
| Opções da execução, separadas do cenário da planta: tetos de segurança, estado salvo (modo continuar). O cenário traz modo, duração, replicações, semente e aquecimento. Até o sub-plano 9, os tetos são **obrigatórios** nas opções, sem valor padrão; os testes passam valores próprios | 4 (6 acrescenta o estado salvo) | 5 a 9 |
| `run(plant, scenarioId, options)`, que devolve o resultado completo do UC-SIM-002; um `scenarioId` que não existe na planta é defeito de quem chama (erro sem `code`, ADR-0013) | 6 | 7, 8, 9 e o `takt-web-app` |
| `suggestWarmup(plant, scenarioId, options)`, que devolve a sugestão do UC-SIM-003 | 7 | `takt-web-app` |
| Execução passo a passo: início com planta, cenário e opções; `step()` e `advanceUntil(tSec)` (UC-SIM-004; ADR-0011, item 9) | 8 | `takt-web-app` |

## Segurança

| Ameaça (origem) | Como o roteiro trata | Sub-plano |
| --- | --- | --- |
| Planta desenhada para travar o motor (ADR-0011) | Validação antes de executar; limite de retrabalho (RN-SIM-006); tetos de elementos, duração e eventos com `SIMULATION_LIMIT_EXCEEDED`, com valores medidos | 3, 5, 4 e 9 |
| Código do motor acessando o DOM ou a rede (ADR-0011) | Já bloqueado pelo `tsc` (sem `DOM`) e pelo lint, com testes de conformidade (plano do workspace) | — |
| Log de eventos muito grande (ADR-0011) | Log completo só da primeira replicação | 6 |
| Corpo enorme ou muito aninhado (ADR-0008) | Limites de quantidade de elementos e conexões no esquema; o tamanho de 1 MB do arquivo (RN-JSN-005) é da importação, no marco 3. O esquema e o teto de elementos do motor usam o mesmo valor, definido num só lugar | 3 e 4 |
| Poluição de protótipo (ADR-0008) | Modo estrito no esquema (`CLAUDE.md`); sobreposições do cenário aplicadas campo a campo, sem mesclagem profunda | 3 e 4 |
| Expressão regular catastrófica (ADR-0008) | IDs sem expressões regulares complexas | 3 |

## Fora deste roteiro

- **Bloqueio da comparação de cenários** com modo, semente, aquecimento ou duração diferentes (RN-SIM-010): é da comparação de cenários, no marco 6. Este roteiro entrega só os números aleatórios comuns.
- **Workers em paralelo** e quantos usar por padrão (ADR-0011, item 10 e "Em aberto"): ficam na casca do Worker, no `takt-web-app` (marco 2). O sub-plano 6 garante a condição para isso: uma replicação rodada sozinha é igual à mesma replicação no conjunto.
- **Texto da pergunta que o resultado responde** (RN-SIM-012): é da interface; o motor devolve o modo.
- **Tamanho máximo do arquivo importado** (RN-JSN-005, 1 MB): é da importação, no marco 3.

## Riscos e decisões pendentes

| Pendência | Origem | Sub-plano que decide |
| --- | --- | --- |
| Como a semente única do cenário (42) vira o estado inicial do MRG32k3a: sem padrão na literatura; opções: cópia nos seis valores (ns-3), semente fixa do pacote com a semente na chave, gerador auxiliar (R) ([pesquisa](../research/literatura-do-motor.md)) | ADR-0011 item 5 | 1 — decidido: estado inicial padrão do pacote (12345) e a semente dentro da chave do hash |
| Como uma chave vira uma sequência independente das outras: o RngStreams só cria sequências em fila, o que quebra os números aleatórios comuns; opções: hash da chave com detecção de colisão, ou número fixo por elemento persistido no esquema (como o `Stream` do ns-3, que toca o 3) ([pesquisa](../research/literatura-do-motor.md)) | ADR-0011 item 5; RN-SIM-010 | 1 — decidido: FNV-1a de 64 bits de `<semente>:<chave>`, colisão → `INVALID_PLANT` |
| Algoritmo da função de distribuição da normal, necessária à normal truncada (o JavaScript não tem `erf`): a pesquisa indica Cody (1969), o do `pnorm` do R; a mais difundida (Abramowitz e Stegun 26.2.17) tem erro de 7,5×10⁻⁸ ([pesquisa](../research/literatura-do-motor.md)) | ADR-0011 item 6 | 1 — decidido: Hart (1968) na forma de West (2005), erro relativo medido de até 8,7×10⁻⁹ na cauda ([pesquisa](../research/precisao-da-normal.md)) |
| Onde fica o `catchError`: no motor, ou numa biblioteca de teste compartilhada quando a API também precisar | ADR-0013 | 1 — decidido por ora: no motor, em `src/tests/helpers/`; a API decide quando precisar |
| Ferramenta para rodar nos motores dos navegadores (Playwright, previsto no ADR-0009, ou o modo navegador do Vitest), sob a regra de 7 dias; a D4 termina em PDR ou ADR novo | D4; [pesquisa](../research/guia-de-estilo-de-codigo.md) | 2 |
| Onde fica a regra de roteamento (no elemento ou na conexão) e o formato final do esquema, inclusive das sobreposições do cenário | [plant-model.md](../product/plant-model.md), "Em aberto" | 3 |
| Fila na frente da estação sem buffer (implícita ilimitada, nenhuma com bloqueio, ou capacidade configurável: empate entre as ferramentas); o M/M/1 exige fila ilimitada e fonte nunca bloqueada ([pesquisa](../research/literatura-do-motor.md)); a RN-EDT-003 exige que "fonte → estação → expedição" rode | [RN-EDT-003](../product/rules/editor.md), [mvp-scope.md](../product/mvp-scope.md) (comportamento não documentado) | 3 |
| Bloqueio quando o destino está cheio: depois do serviço (o mais comum: Plant Simulation, Simul8, Simio) ou antes; estado "bloqueado" distinto de "faminto"; o que a fonte faz com o destino cheio (reter, perder, fila ilimitada: sem padrão) ([pesquisa](../research/literatura-do-motor.md)) | idem | 3 |
| Relógio das falhas (calendário desde o fim do reparo, o padrão das ferramentas, ou tempo ocupado, o da teoria de linhas), significado do MTBF (tempo em operação até a falha dá 94,1%; ciclo inteiro dá 93,75%) e distribuições de falha e reparo (exponencial e Erlang nas ferramentas) ([pesquisa](../research/literatura-do-motor.md)) | [simulation.md](../product/simulation.md), caso da disponibilidade | 3 |
| Comportamento e campos da esteira: está no escopo do MVP, mas em nenhuma regra nem no modelo da planta; opção mínima da pesquisa: `transitSec` e `capacity`, acumuladora, primeira a entrar é a primeira a sair; as ferramentas usam comprimento e velocidade ([pesquisa](../research/literatura-do-motor.md)) | [mvp-scope.md](../product/mvp-scope.md) | 3 |
| Parâmetros padrão de cada elemento e onde moram (esquema ou editor), com os valores confirmados pelo usuário | RN-EDT-003 | 3 |
| Limites de quantidade de elementos e conexões, num só lugar para o esquema e o motor | ADR-0008, "Em aberto"; UC-SIM-002, 2a | 3 |
| Validação semântica com erros estruturais presentes; códigos por problema | detalhes técnicos tirados dos casos de uso | 3 |
| Do sub-plano 1: IDs dos elementos só em ASCII (a chave da sequência recusa outro caractere como defeito); tempos ≥ 0, média da exponencial > 0, fixa ≥ 0, desvio da normal > 0, mínimo < máximo, moda dentro do intervalo; normal truncada com média e desvio obrigatórios, mínimo opcional com padrão 0 e máximo opcional sem limite (decisão do usuário de 04/11/2026) | [plano do sub-plano 1](2026-11-04-motor-fundamentos.md) | 3 |
| Do sub-plano 1: normal truncada num intervalo com probabilidade zero em dupla precisão (por exemplo [40, 41] desvios) recusada com `INVALID_PLANT` na compilação; custo do salto de sequência por chave (~0,08 ms, limitado pelo teto de elementos) | [plano do sub-plano 1](2026-11-04-motor-fundamentos.md) | 4 |
| Do sub-plano 1: guardar Φ(a) e Φ(b) (ou Q) da normal truncada no modelo compilado, em vez de recalcular a cada sorteio (dois terços do custo de cada amostra); junto, reavaliar o limite de precisão com u perto de 1 (até 7,3×10⁻⁸ desvios-padrão quando o intervalo começa logo abaixo da média, medido) e se um terceiro ramo, escolhendo a cauda pelo lado em que p < 0,5, vale o código ([`sim-engine.md`](../architecture/sim-engine.md), normal truncada) | *code review* do sub-plano 1 | 4 |
| Testes longos da literatura a cada pull request ou só no CI noturno; repetir o M/M/1 com várias sementes e medir a cobertura de ≈ 95% (pesquisa sobre aquecimento) | ADR-0009, ADR-0010 (cota de minutos) | 4 (cobertura com várias sementes: 6) |
| Desempate da fila mais curta (sem convenção publicada: ordem da lista, menor `id`, sorteio ou rodízio), o que conta como fila (só espera, ou espera e processo) e o destino escolhido cheio ([pesquisa](../research/literatura-do-motor.md)) | code-style seção 7 | 5 |
| Definições do OEE: disponibilidade (tempo processando sobre o planejado, pela leitura dos fornecedores da ISO 22400-2, ou planejado menos falha), ritmo ideal (média, mínimo ou campo próprio) e retrabalho na qualidade ([pesquisa](../research/literatura-do-motor.md)) | [simulation.md](../product/simulation.md), "Indicadores do MVP" | 5 |
| Séries por fatia de tempo: o lead time de uma fatia sem saídas inclui o tempo corrente das peças presentes (regra do AutoSimOA) ou usa fatia maior ([pesquisa](../research/literatura-do-motor.md)) | ADR-0011 item 8 | 4 |
| Resultados até ali quando uma execução passa de um teto | ADR-0013 e UC-SIM-002, "Em aberto" | 6 |
| Quantil da t para o IC (o JavaScript não tem a inversa da t): a pesquisa indica uma tabela de 96 constantes (gl 4 a 99) gerada pelo `qt` do R e conferida contra a NIST ([pesquisa](../research/literatura-do-motor.md)) | RN-SIM-003 | 6 |
| Limite do aviso de utilização do gargalo (proposta: 0,85) | RN-SIM-011 | 6 |
| Quando um estado salvo deixa de ser compatível com a planta; de qual estado final cada replicação continua no modo continuar, e se o gerador continua ou usa nova subsequência (Hoad e Robinson recomendam guardar o estado) | RN-SIM-007; RN-SIM-001 e 010 | 6 |
| De onde vem a versão do motor no resultado | RN-SIM-001 | 6 |
| Valores com fonte (AutoSimOA): 5 replicações piloto, série de pelo menos 100 observações, lotes de 5, corte válido só nos primeiros (b₀ − 5)/2 lotes, +10% de lotes por tentativa, pausa depois de 10 cortes inválidos seguidos; falta decidir: a variante (a do AutoSimOA, que a nova tentativa da RN-SIM-009 exige), o empate (menor corte, palpite), guardar o estado ou re-simular na extensão, subsequências distintas para piloto e execução final, como a nova tentativa respeita os tetos ([pesquisa](../research/literatura-do-motor.md)) | RN-SIM-009; ADR-0011, "Em aberto" | 7 |
| Em qual trecho entra um evento exatamente em t; campos do estado em t | detalhes técnicos tirados dos casos de uso | 8 |
| Valores dos tetos de segurança (não há literatura; capacidade do navegador) | ADR-0011, "Em aberto" | 9 |

**Riscos:**

- **Duração dos testes contra a literatura:** um teste de regime estável precisa de centenas de milhares de unidades de tempo simuladas; se ficar lento, pesa em cada pull request e nos minutos do GitHub Actions (ADR-0010). Tratado no sub-plano 4.
- **Mutação lenta no motor:** com muitos testes longos, a mutação noturna pode passar do tempo do job; os testes da literatura podem precisar ficar fora da mutação, com justificativa no sub-plano que a medir.
- **D4 já tem resposta provável:** a especificação só garante `sqrt` e as quatro operações, e V8, SpiderMonkey e JavaScriptCore usam bibliotecas matemáticas diferentes; o V8 trocou `log` e `exp` em 05/2026. O sub-plano 2 mede o tamanho da divergência mais do que a existência dela ([pesquisa](../research/literatura-do-motor.md)).
- **D4 com funções próprias:** se a medição mostrar divergência e o usuário escolher funções próprias, o sub-plano 2 reescreve as distribuições do 1; por isso ele vem antes dos sub-planos que as usam.

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Extensão 3a do UC-SIM-004 (teto no passo a passo) sem teste | autorrevisão | Sim | Teste no sub-plano 8 |
| 2 | RN-EDT-003 ("fonte → estação → expedição roda") ausente | autorrevisão | Sim | Testes nos sub-planos 3 e 4 |
| 3 | Número da pesquisa rotulado como estimativa, mas a pesquisa o marca como palpite | autorrevisão | Sim | Rótulo corrigido |
| 4 | Bloqueio da comparação (RN-SIM-010) sem dono | autorrevisão | Sim | "Fora deste roteiro": marco 6 |
| 5 | Sem seção de segurança para as ameaças do ADR-0011 | autorrevisão | Sim | Seção "Segurança" |
| 6 | Decisões do esquema (esteira, fila e bloqueio, sobreposições) agendadas depois do sub-plano do esquema | plan-reviewer | Sim | Todas no sub-plano 3, que entrega o esquema completo do marco 1 |
| 7 | Atribuição estável das sequências decidida no 3, mas muda o gerador do 1; propósitos além de elemento | plan-reviewer | Sim | Chave `<id>:<propósito>` na interface; derivação decidida no 1 |
| 8 | Contradição UC-SIM-001 × UC-SIM-003 sobre o aquecimento | plan-reviewer | Sim | Decidida com o usuário: verificação só no `run` |
| 9 | Ameaças do ADR-0008 (tamanho, protótipo, ReDoS) e modo estrito ausentes | plan-reviewer | Sim | Linhas na "Segurança" e testes nos sub-planos 3 e 4 |
| 10 | Hopp e Spearman no sub-plano 3, sem regime estável nem gargalo | plan-reviewer | Sim | `simulation.md` diz regime estável: casos movidos para o 6; o 4 fica com um teste exato da linha em série, contando o enchimento |
| 11 | D4 decidida por último, mas pode reescrever o sub-plano 1; sem ferramenta nem registro | plan-reviewer | Sim | Novo sub-plano 2, logo depois do 1; ferramenta e registro nas pendências |
| 12 | Docs vivos do ADR-0011, regras com "Em aberto", `references.md` e registros sem dono | plan-reviewer | Sim | Parágrafo de abertura dos sub-planos |
| 13 | "Até o próximo evento" (UC-SIM-004) sem interface nem teste; passos 1 e 6 sem teste | plan-reviewer | Sim | `step()` e testes no sub-plano 8 |
| 14 | RN-SIM-006 fora do esquema; parâmetros padrão sem fonte | plan-reviewer | Sim | RN-SIM-006 no 3; padrões nas pendências do 3 |
| 15 | Testes da literatura deveriam levar `UC-SIM-002` no nome | plan-reviewer (sugestão) | Sim | O README dos casos de uso manda o ID do caso nos testes de um passo |
| 16 | Testes do próprio `catchError` | plan-reviewer (sugestão) | Sim | No sub-plano 1 |
| 17 | Extensão 2a do UC-SIM-003 sem teste | plan-reviewer (sugestão) | Sim | No sub-plano 7 |
| 18 | Tetos sem valor até o sub-plano 9 | plan-reviewer (sugestão) | Sim | Obrigatórios nas opções até lá, sem padrão inventado |
| 19 | Entradas de `run` e `validatePlant` indefinidas | plan-reviewer (sugestão) | Sim | Na tabela de interfaces |
| 20 | Modo continuar com N replicações | plan-reviewer (sugestão) | Sim | Pendência do 6 |
| 21 | Testes de roteamento e desempate | plan-reviewer (sugestão) | Sim | No 5 |
| 22 | Retrabalho geométrico "sem limite" contra a RN-SIM-006 | plan-reviewer (sugestão) | Sim | Pendência do 3 |
| 23 | Little exata depois do aquecimento (LL.2) | plan-reviewer (sugestão) | Sim | No 6 |
| 24 | Origem dos dados de referência | plan-reviewer (sugestão) | Sim | "Estratégia de testes" |
| 25 | Cobertura do IC com várias sementes | plan-reviewer (sugestão) | Sim | Pendência do 4 e do 6 |
| 26 | Premissa "elemento acrescentado no cenário" | plan-reviewer (premissa) | Sim | `plant-model.md`: o cenário só troca valores; texto corrigido para a chave estável |
| 27 | Sub-plano 4 usava LL.1 num turno, que termina com peças | pesquisa | Sim | LL.2 com soma dos tempos na janela igual à área do WIP |
| 28 | Teste do MSER-5 esperava corte de "algumas centenas" no M/M/1 | pesquisa | Sim | Corte válido + IC cobre L = 4 + maior corte; `simulation.md` corrigido |
| 29 | Teste do 3,79 com 30 replicações não distingue de 4 | pesquisa | Sim | ≥ 1.000 replicações no noturno, ou E[L(10)] = 2,030 |
| 30 | Condições dos casos (fila ilimitada, bloqueio depois do serviço, relógio das falhas, MTBF, OEE) não escritas | pesquisa | Sim | Nos testes dos sub-planos 4 a 6 e nas pendências do 3; nota em `simulation.md` |
| 31 | Quantil da t não planejado | pesquisa | Sim | Pendência do 6: tabela conferida contra a NIST |
| 32 | Licença do RngStreams (C não comercial; GitHub Apache 2.0) | pesquisa | Sim | Decidida com o usuário: escrito a partir do artigo |
| 33 | RN-SIM-006 contraditória (retrabalhos × passagens) | pesquisa | Sim | Decidida com o usuário: retrabalhos, contador por peça, padrão 2 |
| 34 | Normal truncada perde precisão numa cauda; Φ sem algoritmo; `triinv` mudou a ordem dos parâmetros | pesquisa | Sim | Testes e pendência do 1 |
| 35 | D4: `log` e `exp` já divergem pela especificação e pelo código dos motores | pesquisa | Sim | Sub-plano 2 reduzido a `log` e `exp`; risco atualizado |
| 36 | Gargalo confirmado pela fila falha com buffers finitos; números aleatórios comuns por instantes só valem com falhas no calendário | pesquisa | Sim | Testes do 5 |
