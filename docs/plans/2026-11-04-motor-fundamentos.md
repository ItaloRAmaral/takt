# Plano: fundamentos do motor (sub-plano 1)

| Campo | Valor |
| --- | --- |
| Status | Aprovado (04/11/2026) |
| Data | 04/11/2026 |
| Pedido | "Pode prosseguir" (04/11/2026), para o sub-plano 1 do roteiro aprovado: "Classe de erro do motor; helper `catchError`; MRG32k3a com sequência por chave e subsequência por replicação; distribuições por inversão (fixa, exponencial, triangular, normal truncada)". |
| Contexto | [Roteiro](2026-11-04-roteiro-motor.md) (sub-plano 1, interfaces e pendências), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) itens 5 e 6, [ADR-0013](../adr/0013-erros-esperados.md), [RN-SIM-001 e 010](../product/rules/simulation.md), [code-style.md](../architecture/code-style.md) seções 2, 4, 5, 7 e 10, [pesquisa da literatura do motor](../research/literatura-do-motor.md) e as notas [gerador](../research/notes/literatura-do-motor/gerador-mrg32k3a.md) e [distribuições](../research/notes/literatura-do-motor/distribuicoes-e-numerica.md) |
| Roteiro | [Esquema da planta e motor (marco 1)](2026-11-04-roteiro-motor.md), sub-plano 1 |

**Objetivo:** o motor ganha a classe de erro esperado, o helper de teste `catchError`, um gerador MRG32k3a reproduzível com uma sequência por chave e uma subsequência por replicação, e as quatro distribuições por inversão, tudo conferido contra referências externas ou de alta precisão.

**Arquitetura:** código puro em `libs/sim-engine/src`, com pastas por conceito (guia, seção 7): `errors/`, `tests/helpers/`, `rng/` e `distributions/`. O laço de geração usa `number`, cujos produtos ficam todos abaixo de 2⁵³ e por isso são exatos; os saltos entre sequências e subsequências usam `bigint`, só na preparação. O início de cada sequência é calculado uma vez por chave, e cada replicação só salta para a sua subsequência. Só `SimulationError` sai pelo `src/index.ts`; o resto é interno, usado pelos sub-planos 4 e 5.

**Regras e registros:** RN-SIM-001 (determinismo), RN-SIM-010 (números aleatórios comuns); ADR-0011 itens 5 e 6; ADR-0013 itens 1 e 5 e "Em aberto" (conferência do `toMatchObject`); ADR-0009 (TDD, metas). Nenhum `UC-...` é entregue aqui: estas peças servem o UC-SIM-002 a partir do sub-plano 4.

## Restrições globais

- **Constantes do MRG32k3a** (L'Ecuyer 1999; L'Ecuyer et al. 2002; conferidas em 04/11/2026 no `src/RngStream.cpp` da [versão Apache 2.0](https://github.com/umontreal-simul/RngStreams)): m1 = 4294967087, m2 = 4294944443, a12 = 1403580, a13n = 810728, a21 = 527612, a23n = 1370589, norm = 1 / (m1 + 1). Estado inicial do pacote: 12345 nos seis valores. Sequências espaçadas de 2¹²⁷ passos; subsequências, de 2⁷⁶.
- **Nada copiado** de código do RngStreams, do R (GPL), da StatLib nem do SPECFUN: o gerador, o AS 241 e a função de distribuição da normal são escritos a partir dos artigos (decisões do usuário de 04/11/2026). Arquivos de saída, somas de conferência e valores de referência são usados só como dados de teste, com a origem registrada.
- **Saída do gerador estritamente em (0, 1).**
- **Proibidos no motor:** `Math.random`, `Date.now`, `new Date()`, `performance.now`, DOM (lint e `tsc` já impõem).
- **Erros** (ADR-0013): erro esperado é `SimulationError` com `code` literal; defeito é `Error` sem `code`. Nenhum `catch` no meio do caminho.
- **Configuração já em vigor que o código precisa respeitar:** `noImplicitOverride` (o `name` da subclasse é `override`), `erasableSyntaxOnly` (o construtor atribui os campos, sem *parameter properties*), `noUncheckedIndexedAccess` sem `!` (matrizes 3×3 com campos nomeados ou fórmulas desenroladas, nunca índice em laço), `restrict-template-expressions` sem número (`String(seed)`), `naming-convention` (constantes globais em `camelCase` ou `UPPER_CASE`).
- **Nomes por extenso e unidade no nome** (guia, seção 2): `standardDeviationSec`, nunca `sdSec`.
- **Testes:** AAA sem comentários e sem laço; nome com o ID quando houver (RN-SIM-001, RN-SIM-010), descrição simples quando não houver; nunca `expect(() => ...).toThrow()`.

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Código de partida do gerador | Escrito a partir do artigo, sem copiar código, conferido contra o arquivo de saída oficial | 04/11/2026 |
| Semente → estado e chave → sequência, sem padrão na literatura | Uma regra só: a sequência de uma chave é a sequência número **FNV-1a de 64 bits de `<semente>:<chave>`** do RngStreams, a partir do estado inicial padrão do pacote. Renomear o ID de um elemento muda os sorteios dele (aceito) | 04/11/2026 |
| Licença das funções numéricas | Mesma regra do gerador: AS 241 a partir de Wichura (1988); função de distribuição da normal pelo algoritmo de Hart (1968) descrito em West (2005), artigo acessível, no lugar de Cody (1969), inacessível e só disponível em código GPL ou SPECFUN | 04/11/2026 |
| Parâmetros da normal truncada | Média e desvio-padrão obrigatórios; mínimo opcional, padrão 0; máximo opcional, sem limite superior quando ausente. O esquema (sub-plano 3) exige mínimo ≥ 0 e mínimo < máximo | 04/11/2026 |
| Onde ficam os auxiliares de teste e se o `jump.ts` tem teste próprio | Em `src/tests/helpers/`, fora do *build* da lib (`exclude` do `tsconfig.lib.json`, `include` do `tsconfig.spec.json`) e da mutação, cada um com o spec ao lado; `rng/` mantido; `jump.spec.ts` com módulo 7 e literais conferidos por multiplicação repetida em Python | 05/11/2026 |

## Decisões técnicas deste plano

| Decisão | Evidência |
| --- | --- |
| Índice da sequência = FNV-1a de 64 bits sobre os bytes de `String(seed) + ':' + key`, com chaves ASCII | **Fato:** o RngStreams tem 2⁶⁴ sequências ([nota do gerador](../research/notes/literatura-do-motor/gerador-mrg32k3a.md), seção 1). **Fato:** o FNV-1a tem especificação e vetores de teste públicos (página oficial do FNV e um *draft* do IETF; nome, versão, constantes e vetores conferidos e copiados na tarefa 3). **Palpite:** nenhuma ferramenta pesquisada usa hash para o índice; o desenho junta o número fixo por variável do ns-3 com a semente dentro da chave. **Estimativa:** com 10⁴ chaves escolhidas sem intenção, a chance de colisão é da ordem de (10⁴)² / 2⁶⁵ ≈ 3×10⁻¹². Com ASCII, cada caractere é um byte, sem `TextEncoder` (ausente no `lib` do motor); o formato dos IDs é do esquema (sub-plano 3) |
| Índices repetidos numa planta → `SimulationError('INVALID_PLANT')` | O FNV-1a não resiste a colisões fabricadas, e os IDs vêm de plantas importadas: é um problema da entrada, não um defeito (ADR-0013). A mesma verificação cobre a chave repetida, que é como o teste a exercita |
| Início da sequência e subsequência separados: `streamStart(index)` uma vez por chave; `createRandomStream(start, replication)` por replicação | **Fato:** cerca de 0,08 ms por salto de sequência com exponenciação binária (nota do gerador, seção 2); repetir o salto em cada replicação multiplicaria o custo pelo número de replicações |
| Potências de matriz por quadrados sucessivos de A₁ e A₂ (127 e 76 quadrados), em `bigint`, calculadas uma vez | Evita copiar as matrizes publicadas no código do pacote; o `.res` e um índice alto conferido por cálculo independente provam o resultado |
| `catchError` e os auxiliares de teste (`drawUniforms`, `sampleMean`, `sampleVariance`) em `src/tests/helpers/`, cada um com o próprio teste | Os testes de faixa, de somas e de momentos não podem ter laço (ADR-0009); as estatísticas de produção do motor só chegam no sub-plano 6, e estes auxiliares servem só aos testes |
| Referências: AS 241 contra `statistics.NormalDist().inv_cdf` do Python 3.10.12 da máquina (a função implementa o AS 241 e cita Wichura 1988 no código); Φ e Q contra um cálculo próprio de alta precisão com `decimal` de 50 algarismos (série para \|x\| pequeno e fração contínua na cauda); índice alto contra potência de matriz em inteiros do Python, a partir das matrizes A₁ e A₂ do artigo | R, Octave e `mpmath` não estão instalados. `0.5 * math.erfc(-x / math.sqrt(2))` perde cerca de 2·(x/√2)²·ε na cauda (≈ 2×10⁻¹⁴ em \|x\| = 10) e não serve de referência ali. Scripts e comandos registrados em `docs/architecture/sim-engine.md` |
| Normal truncada devolve um valor limitado a [mínimo, máximo] | A pesquisa sugere limitar (palpite, nota de distribuições, seção 3): o arredondamento não pode pôr um tempo fora do intervalo. Um intervalo com probabilidade zero em dupla precisão (por exemplo [40, 41] desvios) é recusado antes, na compilação (sub-plano 4, `INVALID_PLANT`) |
| Triangular conferida com casos calculados à mão | O `triinv` do Octave é GPL e mudou a ordem dos parâmetros depois da versão 1.6.3 ([pesquisa](../research/literatura-do-motor.md)) |
| `SimulationError` sem `details` neste sub-plano | O formato de `details` é declarado por código (ADR-0013); os sub-planos 4 e 6, que lançam os primeiros erros com dados, o declaram |
| `Variability` é o tipo interno compilado do motor (`kind`, tempos em segundos) | O esquema (sub-plano 3) define o formato do JSON (`dist`, campos com unidade); o sub-plano 4 converte um no outro |

## Foco de revisão

1. **Uniforme nunca 0 nem 1:** com p₁ = p₂ a saída é m1 · norm, não 0. Teste com um estado montado para p₁ = p₂, além de 10⁵ valores em (0, 1).
2. **Normal truncada com o intervalo inteiro numa cauda** ([8, 9], [9, 10] e [−9, −8] desvios): sem perda de precisão, resultado dentro do intervalo e igual à referência.
3. **Normal truncada sem máximo** (`maxSec` infinito) e com mínimo no padrão 0.
4. **Normal truncada com probabilidade zero em dupla precisão** ([40, 41] desvios): o resultado continua dentro de [mínimo, máximo]; a recusa da planta é do sub-plano 4.
5. **Inversa da normal em cada região do AS 241** (|q| ≤ 0,425; r ≤ 5; r > 5) e perto de 0 e de 1 (p = 10⁻¹⁰ e 1 − 10⁻¹⁰).
6. **Triangular com a moda num extremo** (moda = mínimo; moda = máximo).
7. **Índice de sequência alto** (bits altos usados, por exemplo 2⁶³ + 5) conferido contra o cálculo independente; replicação 0 e maior que 0.
8. **Chave repetida ou índices iguais:** `INVALID_PLANT`.
9. **Chave com caractere fora do ASCII:** defeito, erro sem `code`.
10. **Fixa não consome número aleatório:** sortear uma fixa não avança a sequência (RN-SIM-010).

Parâmetros fora da faixa (tempos negativos, desvio ≤ 0, mínimo ≥ máximo, triangular com moda fora do intervalo) não chegam ao motor: o esquema os recusa (pendência do sub-plano 3, registrada no roteiro na tarefa 5).

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |
| Planta desenhada para travar o motor (ADR-0011) | O custo de preparação é um salto de sequência por chave (cerca de 0,08 ms), limitado pelo teto de elementos do sub-plano 4. Uma planta com IDs fabricados para colidir no FNV-1a é recusada com `INVALID_PLANT`, não trava nem vira defeito | 3: `rejects repeated stream indices as an invalid plant` |
| Parâmetros que geram tempos infinitos ou NaN (ADR-0011) | Normal truncada limitada ao intervalo; intervalo de probabilidade zero recusado na compilação (sub-plano 4); faixas no esquema (sub-plano 3) | 5: `keeps a zero-mass truncation inside its bounds` |
| Código do motor acessando o DOM ou a rede (ADR-0011) | Já bloqueado pelo `tsc` e pelo lint | — |
| Log de eventos muito grande (ADR-0011) | Não se aplica: não há log neste sub-plano | — |
| Itens da seção 11 do guia | Sem segredo, sem `console`, sem log | — |

## Plano de testes

| Requisito, regra ou linha do foco de revisão | Nível | Teste | Tarefa |
| --- | --- | --- | --- |
| ADR-0013, item 1 | unitário | `a simulation error carries its code` | 1 |
| ADR-0013, item 5 | unitário | `catchError returns the thrown error`; `catchError fails when nothing is thrown` | 1 |
| ADR-0013, "Em aberto" | unitário | `toMatchObject checks the code of a simulation error`; `toMatchObject fails on a different code`; `rejects.toMatchObject checks the code of a rejected simulation error` | 1 |
| Auxiliares de teste | unitário | `drawUniforms returns the requested count`; `sampleMean of $values is $expected`; `sampleVariance of $values is $expected` | 2 e 4 |
| ADR-0011 item 5 (gerador igual à referência) | unitário, `it.each` | `stream $index starts at the reference state`; `$case matches the reference output` (valores e somas do `.res` que a API alcança) | 2 |
| Foco 1 | unitário | `uniforms stay strictly between 0 and 1`; `equal components give m1 times norm, not zero` | 2 |
| Foco 7 | unitário | `stream 2^63 + 5 starts at the independently computed state`; `replication $replication starts at the reference substream` | 2 |
| FNV-1a conforme a especificação | unitário, `it.each` | `hashes $input to the reference value` | 3 |
| RN-SIM-001 | unitário | `RN-SIM-001: the same seed and key give the same stream index` | 3 |
| RN-SIM-010 | unitário | `RN-SIM-010: a key keeps its stream index when other keys change`; `RN-SIM-010: a key keeps its stream index when the key order changes` (a chamada de base fica no Arrange) | 3 |
| Semente muda o sorteio | unitário | `different seeds give different stream indices` | 3 |
| Focos 8 e 9 | unitário | `rejects repeated stream indices as an invalid plant`; `rejects a key with a non-ASCII character` | 3 |
| ADR-0011 item 6 (fixa, exponencial, triangular) | unitário, `it.each` | `exponential inverse of $u is $expected`; `triangular inverse of $u is $expected`, inclusive moda nos extremos (foco 6) | 4 |
| Foco 10 | unitário | `a fixed variability draws no random number` | 4 |
| Média e variância teóricas | unitário | `exponential samples match the theoretical mean`, `... variance`; o mesmo para a triangular e a normal truncada | 4 e 5 |
| AS 241 igual à referência (foco 5) | unitário, `it.each` | `normal quantile of $p matches the reference` | 5 |
| Φ e Q iguais à referência de alta precisão | unitário, `it.each` | `normal cdf of $x matches the reference`; `normal survival of $x matches the reference` | 5 |
| Focos 2, 3 e 4 | unitário, `it.each` | `truncated normal on [$lower, $upper] matches the reference at u = $u`; `keeps a zero-mass truncation inside its bounds` | 5 |

- **Níveis usados e por quê:** só unitário, com tabelas `it.each`. Propriedade com fast-check entra no sub-plano 4 (roteiro); aqui, momentos usam uma sequência fixa com 10⁵ amostras. Integração, API e ponta a ponta não se aplicam: não há banco, rota nem tela.
- **Dados de teste:** literais. Estados, valores e somas do gerador vêm do `tests/test2RngStream.res` da [versão Apache 2.0](https://github.com/umontreal-simul/RngStreams); o índice alto, do cálculo independente em Python; os do FNV, dos vetores da especificação; a AS 241, do Python; Φ e Q, do cálculo de alta precisão; a triangular e os momentos teóricos, calculados à mão (exponencial com média 30: média 30, variância 900; triangular (20, 25, 35): média 80/3, variância 175/18). A origem de cada tabela e os scripts ficam em `sim-engine.md`, não em comentário no teste.
- **Tolerâncias** (**estimativas**, a confirmar pelos testes; se uma falhar com o código certo, parar e levar ao usuário): estados inteiros e índices, iguais; uniformes do `.res`, os algarismos que o arquivo imprime; AS 241, erro relativo de 10⁻¹⁴; Φ e Q, 10⁻¹⁴ em |x| ≤ 5 e 10⁻¹² em 5 < |x| ≤ 10; média, 4 erros-padrão (σ/√n); variância, 4 erros-padrão de s², com SE(s²) ≈ σ²·√((κ − 1)/n), escritos como literais a partir da curtose κ de cada distribuição (exponencial κ = 9; triangular κ = 2,4; normal padrão truncada em [−1, 1], κ calculado à parte).
- **Metas:** 90% de linhas e ramificações; 80% de mutação no motor. O Stryker não muta literais numéricos; o risco são mutantes aritméticos em termos pequenos dos polinômios (da ordem de 10⁻¹⁵) que ficam dentro da tolerância: cada sobrevivente é listado com a leitura (equivalente ou falta de teste). A transcrição dos coeficientes do AS 241 é conferida contra as somas de conferência publicadas pela StatLib, usadas só como dado.
- **Como rodar:** `pnpm nx test sim-engine --coverage`, `pnpm nx lint sim-engine`, `pnpm nx typecheck sim-engine`, `pnpm nx run sim-engine:mutate`.

## Desvios do guia de estilo

Nenhum. Conferido: pastas por conceito, sem classes de serviço (o gerador é um registro de estado e funções), `readonly` na fronteira, nomes por extenso, comentários com fórmula e fonte nos algoritmos da literatura (seções 2 e 7).

## Registros novos propostos

Nenhum. A conferência do "Em aberto" do ADR-0013 é verificação, não decisão: o resultado vai para `sim-engine.md`, confirmado pela skill `writing-decision-records` na tarefa 1. A regra da sequência por chave detalha o ADR-0011, item 5 ("derivada da semente do cenário") e fica no doc vivo.

## Cerimônia observada

Nenhuma.

---

## Tarefa 1: erro do motor e `catchError`

**Arquivos:**
- Criar: `libs/sim-engine/src/errors/simulation-error.ts`, `libs/sim-engine/src/tests/helpers/catch-error.ts`, `docs/architecture/sim-engine.md`
- Modificar: `libs/sim-engine/src/index.ts`, `docs/architecture/README.md` (índice)
- Testar: `libs/sim-engine/src/errors/simulation-error.spec.ts`, `libs/sim-engine/src/tests/helpers/catch-error.spec.ts`

**Interfaces:**
- Produz: `type SimulationErrorCode = 'SIMULATION_LIMIT_EXCEEDED' | 'INVALID_PLANT'`; `class SimulationError extends Error` com `readonly code: SimulationErrorCode`, `override readonly name = 'SimulationError'` e construtor `(code: SimulationErrorCode, message: string)`, que atribui `this.code`; `catchError(act: () => unknown): unknown`.

- [ ] **Passo 1: testes que falham** (linhas da tarefa 1 no "Plano de testes"). O teste negativo do `toMatchObject` usa o próprio `catchError` sobre a asserção; o assíncrono usa `await expect(promise).rejects.toMatchObject({ code })`.
- [ ] **Passo 2:** `pnpm nx test sim-engine` · Esperado: FALHA porque os módulos não existem.
- [ ] **Passo 3:** implementar. O `catchError` lança `Error` (defeito, sem `code`) quando nada é lançado. `index.ts` exporta `SimulationError` e `SimulationErrorCode`, com JSDoc.
- [ ] **Passo 4:** `pnpm nx test sim-engine` · Esperado: PASSA. Se o `toMatchObject` não verificar o `code` como o ADR-0013 descreve, parar e levar ao usuário.
- [ ] **Passo 5: doc vivo.** Criar `docs/architecture/sim-engine.md` (pt-BR, resumo no topo): estrutura de pastas, erros (com o resultado da conferência do ADR-0013 e os nomes dos testes), seções a preencher pelas tarefas 2 a 5. Rodar a skill `writing-decision-records` sobre o "Em aberto" do ADR-0013: esperado "não é decisão, só o doc vivo". Índice em `docs/architecture/README.md`.

**Commit sugerido:** `feat(sim-engine): add the engine error class and the catchError test helper` · arquivos: os da lista.

## Tarefa 2: gerador MRG32k3a com sequências e subsequências

**Arquivos:**
- Criar: `libs/sim-engine/src/rng/mrg32k3a.ts`, `libs/sim-engine/src/rng/jump.ts`, `libs/sim-engine/src/tests/helpers/draw-uniforms.ts`, `libs/sim-engine/src/tests/helpers/sum-uniforms.ts`
- Testar: `libs/sim-engine/src/rng/mrg32k3a.spec.ts`, `libs/sim-engine/src/rng/jump.spec.ts`, `libs/sim-engine/src/tests/helpers/draw-uniforms.spec.ts`, `libs/sim-engine/src/tests/helpers/sum-uniforms.spec.ts`

**Interfaces:**
- Produz: `interface StreamStart` (os seis valores do início da sequência, `readonly`); `streamStart(streamIndex: bigint): StreamStart`, que salta `streamIndex · 2¹²⁷` passos a partir do estado inicial do pacote; `interface RandomStream` com os seis valores do estado (mutáveis; só `nextUniform` os altera); `createRandomStream(start: StreamStart, replication: number): RandomStream`, que salta `replication · 2⁷⁶` passos; `nextUniform(stream: RandomStream): number`. Auxiliar de teste: `drawUniforms(stream: RandomStream, count: number): number[]`.

- [ ] **Passo 1: testes que falham** (linhas da tarefa 2). Os casos do `.res` são os que a API alcança: estados iniciais das sequências 0, 1 e 2 (as `g1`, `g2` e `g3` do arquivo), valores e somas de sequências e subsequências. Os de salto arbitrário (2⁵ + 3), semente do pacote diferente e salto para trás ficam de fora, porque a API não os expõe; a correspondência entre as chamadas do teste C++ (`ResetNextSubstream` etc.) e o número da replicação é conferida no `testRngStream.cpp` e anotada. O índice 2⁶³ + 5 é conferido contra o script Python de potência de matriz.
- [ ] **Passo 2:** `pnpm nx test sim-engine` · Esperado: FALHA porque os módulos não existem.
- [ ] **Passo 3:** implementar a recorrência e a saída: `u = (p₁ − p₂) · norm` se p₁ > p₂, senão `u = (p₁ − p₂ + m1) · norm` (L'Ecuyer et al. 2002), em `number`; e, em `jump.ts`, multiplicação e potência de matriz 3×3 módulo m, com campos nomeados, por quadrados sucessivos em `bigint`. Comentários com a fórmula, a fonte e a razão de os produtos ficarem abaixo de 2⁵³.
- [ ] **Passo 4:** `pnpm nx test sim-engine` · Esperado: PASSA.
- [ ] **Passo 5:** `sim-engine.md`, seção do gerador: constantes, espaçamentos, origem dos dados (arquivo, repositório, licença Apache 2.0), casos do `.res` que ficaram de fora, o script do índice alto. `references.md`: o `test2RngStream.res` da versão Apache 2.0 como dado de teste.

**Commit sugerido:** `feat(sim-engine): add the MRG32k3a generator with streams and substreams` · arquivos: os da lista e os docs.

## Tarefa 3: índice da sequência por chave

**Arquivos:**
- Criar: `libs/sim-engine/src/rng/stream-index.ts`
- Testar: `libs/sim-engine/src/rng/stream-index.spec.ts`

**Interfaces:**
- Consome: `SimulationError` (tarefa 1).
- Produz: `streamIndex(seed: number, key: string): bigint`, o FNV-1a de 64 bits dos bytes de `String(seed) + ':' + key`; `assignStreamIndices(seed: number, keys: readonly string[]): ReadonlyMap<string, bigint>`, que lança `SimulationError('INVALID_PLANT')` quando dois índices coincidem (inclusive por chave repetida) e `Error` (defeito) quando uma chave tem caractere fora do ASCII. As chaves seguem o formato do roteiro, `<id do elemento>:<propósito>`.

- [ ] **Passo 1: testes que falham** (linhas da tarefa 3). Vetores do FNV-1a de 64 bits copiados da especificação (página oficial do FNV ou o *draft* do IETF), com a origem anotada em `sim-engine.md`.
- [ ] **Passo 2:** `pnpm nx test sim-engine` · Esperado: FALHA porque o módulo não existe.
- [ ] **Passo 3:** implementar, com a base de deslocamento e o primo do FNV-1a de 64 bits copiados da especificação e multiplicação módulo 2⁶⁴ em `bigint`.
- [ ] **Passo 4:** `pnpm nx test sim-engine` · Esperado: PASSA.
- [ ] **Passo 5:** `sim-engine.md`: a regra "sequência número FNV-1a(semente:chave)", a estimativa de colisão, a recusa de colisões e o motivo do ASCII. `references.md`: FNV (especificação e vetores).

**Commit sugerido:** `feat(sim-engine): derive a stream index from the seed and a stable key` · arquivos: os da lista e os docs.

## Tarefa 4: distribuições fixa, exponencial e triangular

**Arquivos:**
- Criar: `libs/sim-engine/src/distributions/variability.ts`, `libs/sim-engine/src/distributions/exponential.ts`, `libs/sim-engine/src/distributions/triangular.ts`, `libs/sim-engine/src/tests/helpers/sample-moments.ts`
- Testar: `libs/sim-engine/src/distributions/variability.spec.ts`, `exponential.spec.ts`, `triangular.spec.ts`, `libs/sim-engine/src/tests/helpers/sample-moments.spec.ts`

**Interfaces:**
- Consome: `RandomStream`, `nextUniform`, `drawUniforms` (tarefa 2).
- Produz: `type Variability = { kind: 'fixed'; valueSec } | { kind: 'exponential'; meanSec } | { kind: 'triangular'; minSec; modeSec; maxSec }` (todos `readonly number`; a tarefa 5 acrescenta a normal truncada); `sampleVariability(variability: Variability, stream: RandomStream): number`, que consome exatamente um uniforme por amostra, exceto a fixa, que não consome nenhum; `inverseExponential(u: number, meanSec: number): number` = −média · ln(1 − u); `inverseTriangular(u: number, minSec: number, modeSec: number, maxSec: number): number`, por partes, com `Math.sqrt`. Auxiliares de teste: `sampleMean(values: readonly number[]): number` e `sampleVariance(values: readonly number[]): number` (divisor n − 1).

- [ ] **Passo 1: testes que falham** (linhas da tarefa 4), com os valores teóricos e os erros-padrão como literais.
- [ ] **Passo 2:** `pnpm nx test sim-engine` · Esperado: FALHA.
- [ ] **Passo 3:** implementar; `switch` exaustivo sobre `kind`, sem `default` (guia, seção 4).
- [ ] **Passo 4:** `pnpm nx test sim-engine` · Esperado: PASSA.
- [ ] **Passo 5:** `sim-engine.md`, seção das distribuições.

**Commit sugerido:** `feat(sim-engine): sample fixed, exponential and triangular variability by inversion` · arquivos: os da lista e os docs.

## Tarefa 5: normal truncada e fechamento

**Arquivos:**
- Criar: `libs/sim-engine/src/distributions/normal.ts`, `libs/sim-engine/src/distributions/truncated-normal.ts`
- Modificar: `libs/sim-engine/src/distributions/variability.ts`, `docs/plans/2026-11-04-roteiro-motor.md`, `docs/plans/README.md`, `docs/product/references.md`, `docs/architecture/sim-engine.md`
- Testar: `libs/sim-engine/src/distributions/normal.spec.ts`, `truncated-normal.spec.ts`

**Interfaces:**
- Consome: `Variability` e `sampleVariability` (tarefa 4), aos quais acrescenta `{ kind: 'truncatedNormal'; meanSec; standardDeviationSec; minSec; maxSec }` (`maxSec` pode ser `Infinity`; o padrão 0 do mínimo é aplicado pelo esquema ou pela compilação, não aqui) e o ramo dele.
- Produz: `normalQuantile(p: number): number` (AS 241, PPND16, Wichura 1988); `normalCdf(x: number): number` e `normalSurvival(x: number): number` (Hart 1968, na forma de West 2005; Q(x) = Φ(−x)); `inverseTruncatedNormal(u: number, meanSec: number, standardDeviationSec: number, minSec: number, maxSec: number): number`. Com o intervalo padronizado [a, b] inteiro acima de 0, trabalha com o complemento: p = Q(a) − u · (Q(a) − Q(b)) e z = −Φ⁻¹(p); senão, p = Φ(a) + u · (Φ(b) − Φ(a)) e z = Φ⁻¹(p). Crescente em u nos dois ramos; o resultado é limitado a [mínimo, máximo].

- [ ] **Passo 1: testes que falham** (linhas da tarefa 5): pontos nas três regiões do AS 241 e nos extremos; x de −10 a 10 para Φ e Q; normal truncada em [−1, 1], [0, ∞), [8, 9], [9, 10], [−9, −8] e [40, 41] desvios; média e variância da normal padrão truncada em [−1, 1] (média 0; variância e curtose calculadas à parte e escritas como literais).
- [ ] **Passo 2:** `pnpm nx test sim-engine` · Esperado: FALHA.
- [ ] **Passo 3:** implementar a partir dos artigos (Wichura 1988; West 2005), com os coeficientes transcritos do artigo, conferidos pelas somas da StatLib (AS 241) e pelos testes; comentários com fonte, região e precisão declarada.
- [ ] **Passo 4:** `pnpm nx test sim-engine --coverage` e `pnpm nx run sim-engine:mutate` · Esperado: PASSA, cobertura ≥ 90% e mutação ≥ 80%, com os sobreviventes listados e lidos.
- [ ] **Passo 5: fechar.**
  - `sim-engine.md`: normal, scripts de referência, uso de `Math.log` e `Math.exp` (insumo da D4, sub-plano 2).
  - `references.md`: Wichura (1988, o PDF já citado), Hart (1968) e West (2005), Python como gerador de referências.
  - Roteiro, no mesmo pull request: interfaces (`SimulationError` sem `details` até os sub-planos 4 e 6; `streamStart` e `createRandomStream`; regra do índice); linha do sub-plano 1 (referências do Python e de alta precisão, não do R; casos de cauda); "Dados de referência"; pendências do sub-plano 3 (IDs em ASCII; tempos ≥ 0, média da exponencial > 0, fixa ≥ 0, desvio > 0, mínimo < máximo, moda dentro do intervalo; parâmetros da normal truncada decididos pelo usuário) e do sub-plano 4 (intervalo da normal com probabilidade zero → `INVALID_PLANT`; custo do salto por chave).
  - Status deste plano e da linha 1 do roteiro: "Concluído"; índice de `docs/plans/README.md`.

**Commit sugerido:** `feat(sim-engine): sample the truncated normal by inversion with AS 241 and Hart` · arquivos: os da lista e os docs.

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Conta de colisão escrita errado | autorrevisão | Sim | (10⁴)² / 2⁶⁵ |
| 2 | `switch` exaustivo da tarefa 4 não compilaria com o tipo da normal antes da tarefa 5 | autorrevisão | Sim | A tarefa 5 acrescenta o tipo e o ramo |
| 3 | Fórmula da saída do gerador incompleta | autorrevisão | Sim | Os dois casos de p₁ e p₂ escritos |
| 4 | Mutabilidade do estado descrita como "só dentro do módulo" | autorrevisão | Sim | Só `nextUniform` altera o estado |
| 5 | Referências do Cody e do FNV tiradas da memória | autorrevisão | Sim | Conferidas na tarefa; o Cody saiu (decisão do usuário) |
| 6 | Parâmetros que geram NaN ou infinito sem dono | plan-reviewer | Sim | Limite ao intervalo; recusa no sub-plano 4; faixas no sub-plano 3 |
| 7 | Testes que exigiriam laço no corpo | plan-reviewer | Sim | Auxiliares em `src/tests/helpers/` com testes próprios; erros-padrão como literais |
| 8 | Φ, referência e tolerância incompatíveis na cauda | plan-reviewer | Sim | Hart/West, referência de alta precisão em `decimal`, tolerância por faixa |
| 9 | Código planejado violaria lint e `tsconfig` (número em *template*, `override`, *parameter property*, índice com `!`) | plan-reviewer | Sim | Conferido no `strict-type-checked` 8.72.1 (`allowNumber: false`); restrições globais |
| 10 | Salto de sequência repetido em cada replicação | plan-reviewer | Sim | `streamStart` separado de `createRandomStream` |
| 11 | Ramo "nunca 0" inalcançável pelo teste planejado | plan-reviewer | Sim | Estado montado com p₁ = p₂ |
| 12 | Bits altos do índice sem referência | plan-reviewer | Sim | Índice 2⁶³ + 5 contra cálculo independente |
| 13 | Colisão fabricada tratada como defeito | plan-reviewer | Sim | `INVALID_PLANT`, com linha de segurança |
| 14 | Roteiro não atualizado onde o plano diverge | plan-reviewer | Sim | Tarefa 5, passo 5; caso [9, 10] mantido |
| 15 | Nota de mutação não corresponde ao Stryker | plan-reviewer | Sim | Reescrita; somas da StatLib para a transcrição |
| 16 | Forma do `Variability` sem origem; `sdSec` | plan-reviewer | Sim | Tipo interno compilado; `standardDeviationSec`; parâmetros decididos pelo usuário |
| 17 | Caminho do `.res` e constantes do repositório Apache 2.0 não verificados | plan-reviewer (premissa) | Não | Conferidos nesta sessão: árvore do repositório, início do `.res` e constantes do `RngStream.cpp` |
| 18 | Linha do `statistics.py` dependente da máquina | plan-reviewer (premissa) | Sim | Trocada pela versão (3.10.12) e pelo comando, em `sim-engine.md` |
