# Plano: medição da D4 e `log`/`exp` do motor (sub-plano 2)

| Campo | Valor |
| --- | --- |
| Status | Aprovado (18/11/2026) |
| Data | 18/11/2026 |
| Pedido | "Pode começar o sub-plano 2" (06/11/2026), para a linha 2 do roteiro aprovado: "`Math.log` e `Math.exp` [...] comparadas bit a bit entre Node e os motores dos navegadores (V8, SpiderMonkey, JavaScriptCore) [...]; decisão da D4 com o usuário". Escopo ampliado pelo usuário em 18/11/2026: "Tudo num plano só" (medição, decisão e, na opção (b), as funções próprias). |
| Contexto | [Roteiro](2026-11-04-roteiro-motor.md) (linha 2, riscos e pendências), [RN-SIM-001](../product/rules/simulation.md), [PDR-0008](../pdr/0008-simulacao-com-reproducao.md), [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md), [ADR-0009](../adr/0009-estrategia-de-testes.md), [ADR-0010](../adr/0010-qualidade-e-ci.md), [code-style.md](../architecture/code-style.md) seção 7 e "Decisões pendentes" (D4), [pesquisa da literatura do motor](../research/literatura-do-motor.md) (seção "A D4 já tem resposta provável"), [pesquisa do guia de estilo](../research/guia-de-estilo-de-codigo.md) (D4), [sim-engine.md](../architecture/sim-engine.md), [workspace.md](../architecture/workspace.md), código do sub-plano 1 em `libs/sim-engine/src` |
| Roteiro | [Esquema da planta e motor (marco 1)](2026-11-04-roteiro-motor.md), sub-plano 2 |

**Objetivo:** medir com que frequência `Math.log` e `Math.exp` dão bits diferentes entre os ambientes onde o Takt roda, levar o resultado ao usuário para decidir a D4 e, se a decisão for funções próprias (opção b), trocar as duas por um port do fdlibm que dá os mesmos bits em todo motor JavaScript.

**Arquitetura:** a medição fica fora do código do motor, em `libs/sim-engine/measurements/math/`. Um spec de medição roda no Node e, pelo modo navegador do Vitest com o Playwright, no Chromium, no Firefox e no WebKit; um workflow manual roda o WebKit num executor macOS, que usa a libm da Apple. Cada ambiente grava os bits que calculou, e um script compara. Na opção (b), `log` e `exp` viram código do motor em `src/math/`, traduzidos do fdlibm 5.3 só com as quatro operações e operações de bits, que a especificação obriga a serem iguais em todo motor; as distribuições passam a usá-los, e o lint proíbe as funções aproximadas de `Math` no motor.

**Regras e registros:** RN-SIM-001 (determinismo); PDR-0008; ADR-0011 (motor determinístico, mesmo resultado no navegador, nos testes e no servidor); ADR-0009 (TDD, metas, Playwright); ADR-0010 (dependências exatas, regra de 7 dias); D4 do guia. Opção (a) → PDR novo que muda a RN-SIM-001; opção (b) → ADR novo que complementa o ADR-0011 (roteiro, linha 2).

## Restrições globais

- **O que a especificação garante** (ECMAScript 21.3.2 e 6.1.6.1, citados na [pesquisa](../research/literatura-do-motor.md)): `Math.sqrt`, `Math.abs`, `Math.min`, `Math.max` e as quatro operações dão o mesmo resultado em todo motor; `exp`, `log`, `pow` e as demais funções de `Math` são "implementation-approximated", e o operador `**` sobre `number` também.
- **Onde o motor usa funções aproximadas hoje:** `Math.log` em `distributions/exponential.ts` e em `normalQuantile` (`distributions/normal.ts`); `Math.exp` em `lowerTail` (`distributions/normal.ts`); `2 ** 51` em `rng/mrg32k3a.ts`. O gerador e a triangular usam só aritmética e `Math.sqrt`.
- **Ambientes medidos** (decisão do usuário, mais Windows por achado da revisão): Node 24.22.2 (V8 13.6, testes e futuro serviço do servidor); Chromium, Firefox e WebKit do Playwright 1.65.0 (Chromium 158, Firefox 159, WebKit 27.2, pelas [notas de versão](https://playwright.dev/docs/release-notes)) no Linux, na máquina do usuário; e os mesmos três no `macos-15` (arm64) e no `windows-latest` do GitHub Actions, onde o WebKit do macOS representa o Safari. A MDN avisa que o mesmo motor pode dar resultados diferentes em outro sistema ou arquitetura, por isso Chromium e Firefox também rodam fora do Linux. Celular e tablet ficam fora; Macs Intel, também (limite registrado no relatório).
- **Versões novas** (ADR-0010 e regra de 7 dias de `workspace.md`): `playwright` 1.65.0 (publicado em 05/11/2026) e `@vitest/browser-playwright` 5.0.5 (15/10/2026, igual ao `vitest` fixado), ambas exatas, em `devDependencies` da raiz. Actions novas fixadas por SHA, com versão de pelo menos 7 dias.
- **fdlibm** ([netlib](https://www.netlib.org/fdlibm/), versão 5.3): `e_log.c` (1.3, 95/01/18) e `e_exp.c` (1.6, 04/04/22). Ambos declaram "the error is always less than 1 ulp". Licença em cada arquivo: "Permission to use, copy, modify, and distribute this software is freely granted, provided that this notice is preserved", e por isso o aviso fica no topo de cada arquivo portado.
- **Bits de um `double`:** lidos e escritos por um `DataView` com ordem de bytes explícita (*big-endian*, o padrão do `DataView`), nunca por `Float64Array` com `Uint32Array`, cuja ordem depende da plataforma. `NaN` é sempre comparado como `NaN`: pela especificação (`NumericToRawBytes`, a conferir na tarefa 1), o motor escolhe a codificação de `NaN` que grava.
- **Scripts de referência:** Python 3.10.12, só a biblioteca padrão, rodados com `python3 -I`. O fdlibm em C é baixado num diretório próprio e vazio, fora do repositório, e compilado com `gcc -O0 -ffp-contract=off -fno-strict-aliasing -D__LITTLE_ENDIAN`, para não haver FMA nem otimização que mude o arredondamento (o `fdlibm.h` 5.3 só define `__LITTLE_ENDIAN` para i386 e afins, não para x86_64). Pré-requisito do usuário: `sudo apt install gcc`.
- **Nada da medição entra no build, na cobertura ou na mutação do motor:** a pasta `measurements/` fica fora de `src/`.
- Nomes por extenso e funções matemáticas com o nome do objeto (`log`, `exp`, `toBits`), como no guia e no sub-plano 1.

## Decisões tomadas com o usuário

| Pergunta | Resposta | Data |
| --- | --- | --- |
| Onde os números precisam bater | Navegadores de desktop atuais (Chrome e Edge, Firefox, Safari) e o Node; celular e tablet não entram, mesmo usando Chrome e Safari | 18/11/2026 |
| Como medir o Safari | WebKit do Playwright num executor macOS do GitHub Actions, por workflow manual; sem página hospedada nem Safari real | 18/11/2026 |
| Escopo | Um plano só: medição, decisão e, se for (b), as funções próprias | 18/11/2026 |
| Funções próprias, na opção (b) | Port do fdlibm (`e_log.c` e `e_exp.c`), com o aviso da Sun preservado | 18/11/2026 |
| Casos difíceis do CORE-MATH, sem licença declarada | Nem commitados nem baixados: "se não vai mudar nada, vamos deixar sem baixar" (a primeira resposta, baixar na hora, foi revista no mesmo dia). No lugar, casos "quase difíceis" inventados: de 10⁶ candidatos sorteados, os mil por função mais perto do meio entre dois `double` ("pode seguir") | 18/11/2026 |
| Workflow de macOS e Windows: PR próprio antes das rodadas? | Não: "podemos criar o workflow para testar no merge dessa mesma PR, mas já podemos decidir com esses dados já adquiridos". O workflow entra neste PR, roda no merge para a `main` e depois de cada mudança no motor, e a D4 é decidida com a medição do Linux | 18/11/2026 |
| Exceções de idade mínima (Nx 24.0.3 e `semver` 6.3.2, vencidas em 06/11 e 09/11) | Saem neste mesmo pull request, na tarefa 2 (antes: "vamos esperar até 10/11", 06/11/2026) | 18/11/2026 |

## Decisões técnicas deste plano

| Decisão | Evidência |
| --- | --- |
| Casos difíceis de Lefèvre (usados pelo CORE-MATH) **fora** da medição | **Fato:** as páginas de Lefèvre não declaram licença para os dados ([testlibm](https://www.vinc17.net/research/testlibm/index.en.html)). **Estimativa:** a decisão da D4 depende da frequência nos sorteios reais do motor, não dos piores casos; as fronteiras de cada ramo do fdlibm cobrem o port. O roteiro citava esses casos e é atualizado na tarefa 7 |
| Oráculo do port: o fdlibm em C compilado, bit a bit | Prova que a tradução é fiel em todos os ramos. **Fato:** o V8 atual delega `log` e `exp` à libm do LLVM ([ieee754.cc](https://raw.githubusercontent.com/nodejs/node/main/deps/v8/src/base/ieee754.cc)), e o SpiderMonkey chamava um `fdlibm_log` próprio no código lido em fevereiro de 2025 (pesquisa), sem garantia de ser igual ao 5.3; nenhum navegador é oráculo garantido |
| Referência corretamente arredondada: `decimal` do Python com 100 algarismos (`ln` e `exp`, convertidos para `float`) | Mede o erro em ulps de cada ambiente; com 100 algarismos o duplo arredondamento só ocorreria num ponto médio exato, impossível para um transcendental fora dos casos triviais (`ln 1`, `exp 0`), que o próprio teste confere |
| Medição pelo modo navegador do Vitest (`@vitest/browser-playwright`), não por um *runner* próprio | Roda o TypeScript do motor nos três navegadores sem empacotador novo; grava resultados pelo `server.commands.writeFile` ([comandos](https://vitest.dev/guide/browser/commands)) |
| Resultados brutos fora do repositório: `libs/sim-engine/test-output/math-measurement/<motor>-<plataforma>.json` (por exemplo `webkit-darwin.json`, `chromium-win32.json`, `node-linux.json`), com `test-output` acrescentado ao `.gitignore` | Chegam a megabytes por ambiente; hoje só a cobertura dentro de `test-output` é ignorada (padrão `coverage`). O relatório de pesquisa guarda as versões, as tabelas e os *digests* |
| macOS e Windows só rodam pelo workflow manual, e a medição não entra no CI dos pull requests | Na opção (b), o lint impede a volta de `Math.log`; a medição é uma prova de decisão, não um portão. Fecha só para este plano o "Em aberto" do ADR-0009 sobre navegadores no CI: aqui, nenhum. **Fato:** os executores padrão são gratuitos em repositório público ([cobrança do Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)) |
| O workflow chega à `main` num pull request próprio, antes do resto | **Fato:** o GitHub só dispara um `workflow_dispatch` cujo arquivo existe no ramo padrão; com o arquivo na `main`, `--ref feat/engine-d4-math` roda a versão do ramo |
| Nos conjuntos de entradas do motor (10⁵ valores), a comparação é só entre ambientes; contra o fdlibm e o valor corretamente arredondado, só no fixture | Evita rodar o oráculo e o `decimal` sobre 3×10⁵ valores; a frequência entre ambientes é o que a decisão usa |

## Foco de revisão

1. **Valores especiais** de `log`: 0, −0, negativo, −∞, +∞, `NaN`, 1, menor subnormal (5e−324), maior subnormal, menor normal (2⁻¹⁰²²) e `Number.MAX_VALUE`. Esperado: o que o fdlibm em C dá (log 0 = −∞, log de negativo = `NaN`, log 1 = 0).
2. **Valores especiais** de `exp`: 0, −0, ±∞, `NaN`, os limites de estouro (`o_threshold` = 7,09782712893383973096e+02 e o vizinho acima) e de *underflow* (`u_threshold` = −7,45133219101941108420e+02 e o vizinho abaixo), o menor resultado subnormal e |x| < 2⁻²⁸. Esperado: o fdlibm em C.
3. **Os dois lados de cada fronteira de ramo** do `e_log.c` (`hx < 0x00100000`, `hx >= 0x7ff00000`, o teste `(0x000fffff&(2+hx))<3`, `k == 0`, o sinal de `i = (hx-0x6147a)|(0x6b851-hx)`) e do `e_exp.c` (|x| > 0,5·ln 2, |x| < 1,5·ln 2, |x| < 2⁻²⁸, `k >= -1021`): um caso de cada lado, gerado pelo script a partir das constantes hexadecimais dos arquivos.
4. **Perto de 1 no `log`** (1 ± k·2⁻⁵², k de 1 a 50), onde o resultado é pequeno e o erro relativo pesa.
5. **Ordem de bytes:** `toBits(1)` = `3ff0000000000000` em todo ambiente; `toBits(-0)` = `8000000000000000`.
6. **`NaN` com codificações diferentes:** `toBits` devolve sempre `7ff8000000000000` para qualquer `NaN` (o literal, `fff8000000000000` e um `NaN` com *payload*), para a comparação não acusar diferença falsa. `ulpDistance` de dois `NaN` é 0, e de `NaN` contra um número é `Infinity`; no fixture, o valor corretamente arredondado de `log` de negativo e de `NaN` é gravado como `NaN` (o `decimal` lança `InvalidOperation`, que o script trata).
7. **Controle negativo:** antes da opção (b), a triangular (só `Math.sqrt`) dá bits iguais em todos os ambientes. Se não der, o defeito é da medição, e ela para.
8. **Determinismo do port:** depois da opção (b), `log`, `exp` e os sorteios ponta a ponta dão bits iguais nos dez ambientes.
9. **Custo no laço quente:** tempo de 10⁶ chamadas de `log` e `exp` próprios contra os nativos, medido e registrado, sem meta (o motor faz um `log` por sorteio exponencial).
10. **Lint:** `Math.log` e as demais funções aproximadas são recusadas no código do motor; `Math.sqrt` passa; `2 ** 51` é recusado e `2n ** 127n` (`bigint`, exato) passa; os specs não são afetados.
11. **Fixture reproduzível:** rodar o script de casos duas vezes dá o mesmo arquivo (semente fixa).

## Segurança

| Ameaça (ADR de origem) | Como este plano trata | Tarefa e teste |
| --- | --- | --- |
| Cadeia de suprimentos de dependências (ADR-0010) | `playwright` e `@vitest/browser-playwright` exatos e com mais de 7 dias; os binários dos navegadores vêm do CDN do Playwright pelo `playwright install`, só na máquina do usuário e no workflow manual, nunca no CI dos pull requests | 2: `pnpm install --frozen-lockfile` e a regra de idade passam |
| Código de terceiros baixado (fdlibm em C) | Baixado num diretório novo e vazio fora do repositório; só o programa de oráculo do Takt é compilado e roda, lendo entradas por argumento; nenhum arquivo baixado é commitado | 1: o script registra a origem e o SHA-256 dos arquivos baixados em `sim-engine.md` |
| Workflow com permissões demais (ADR-0010, `workspace.md`) | `workflow_dispatch` apenas, num pull request próprio, `permissions: contents: read`, actions por SHA, `persist-credentials: false`, sem segredos | 3: revisão do YAML e uma execução real |
| Escrita de arquivos pelo navegador | `writeFile` do Vitest grava só dentro da raiz do projeto (restrições `server.fs` do Vite) e exige `api.allowWrite`, que já vem ligado por padrão quando o servidor não fica exposto na rede (conferido no tipo `ApiConfig` do Vitest 5.0.5 durante a tarefa 2; o plano supunha que só a configuração de medição o ligaria). Nenhuma configuração expõe o servidor | 2: a configuração do `test` não muda |
| Determinismo do motor (ADR-0011) | É o objeto do plano; na opção (b), o lint impede funções aproximadas no motor | 7: testes de conformidade do lint |
| Itens da seção 11 do guia | Sem segredo, sem log, sem dado pessoal; o `userAgent` gravado nos resultados é do ambiente de teste, não de pessoa | — |

## Plano de testes

| Requisito, regra ou linha do foco de revisão | Nível | Teste | Tarefa |
| --- | --- | --- | --- |
| Foco 5 e 6 | unitário, `it.each` | `toBits of $label is $bits` (1, −0, `NaN`, menor subnormal); `toBits of the NaN encoded as $bits is the canonical NaN` (`fff8000000000000`, `7ff0000000000001`); `fromBits of $bits is $label`; `ulpDistance between $label is $distance` (0, 1, vizinhos de 0 com sinais trocados, dois `NaN` → 0, `NaN` e 1 → `Infinity`) | 1 |
| Fixture reproduzível (foco 11) | verificação | rodar `make_cases.py` duas vezes e comparar com `cmp` | 1 |
| Medição nos dez ambientes (linha 2 do roteiro) | medição (Vitest no Node e no modo navegador) | `records the bits of log, exp and the engine draws` | 2 e 3 |
| Foco 7 e gerador igual em todo ambiente (roteiro, linha 2) | medição | linhas dos uniformes e da triangular no relatório: zero diferenças | 4 |
| Bits altos e baixos de um `double` (opção b) | unitário, `it.each` | `highWord of $label is $high`; `lowWord of $label is $low`; `fromWords($high, $low) is $label` (1, −0, menor subnormal, `Number.MAX_VALUE`) | 5 |
| Auxiliares de teste do port | unitário | `mapBits applies the function to each input`; `maxUlpDistance of $label is $distance` | 5 |
| Foco 1 a 4 (opção b) | unitário, `it.each` | `log of $label is $expected` (valores especiais, literais); `log matches fdlibm bit for bit on the reference cases`; `log stays within 1 ulp of the correctly rounded value` | 5 |
| Foco 2 e 3 (opção b) | unitário, `it.each` | `exp of $label is $expected`; `exp matches fdlibm bit for bit on the reference cases`; `exp stays within 1 ulp of the correctly rounded value` | 6 |
| Foco 9 | medição | tempo de 10⁶ chamadas, registrado em `sim-engine.md` | 5 e 6 |
| Foco 10 | unitário (conformidade do lint) | `rejects $api in the engine` ganha `Math.log(2)`, `Math.exp(2)`, `Math.pow(2, 3)`, `2 ** 51`; `accepts $api in the engine` com `Math.sqrt(2)` e `2n ** 127n` | 7 |
| RN-SIM-001 entre ambientes (foco 8) | medição | nova rodada nos dez ambientes: zero diferenças em `log`, `exp` e nos sorteios | 7 |
| Distribuições com `log`/`exp` próprios | unitário | os testes do sub-plano 1 continuam passando (AS 241, Φ e Q contra as referências, momentos dentro do IC) | 7 |

- **Níveis usados e por quê:** unitário para os auxiliares, o port e o lint; a medição é um nível à parte, que roda o mesmo código em vários motores e grava o resultado. Não é um teste de aceitação: só falha por defeito da própria medição (arquivo de casos ausente, contagem errada). Ponta a ponta com Playwright não se aplica (não há tela); integração e API, também não.
- **Dados de teste:** `libs/sim-engine/src/tests/fixtures/fdlibm-cases.ts`, gerado por `make_cases.py` com `random.Random(20261118)`, com cerca de 2700 entradas por função: valores especiais, fronteiras de ramo, perto de 1, amostra espalhada por todos os expoentes entradas do tipo que o motor usa (u e 1 − u para o `log`; −x²/2 com x em [0, 37] para o `exp`) e mil casos "quase difíceis" por função (os mais perto do meio entre dois `double`, entre 10⁶ candidatos). Cada linha guarda a entrada, a saída do fdlibm em C e a saída corretamente arredondada, como bits hexadecimais. Os sorteios ponta a ponta usam a semente 42 e as chaves `d4:exponential`, `d4:triangular` e `d4:truncatedNormal`, com 10⁵ amostras cada: exponencial com média 30; triangular (10, 20, 50); normal truncada com média 30, desvio 5, mínimo 0 e sem máximo.
- **Tolerâncias:** bits iguais ao fdlibm em C; distância ≤ 1 ulp do valor corretamente arredondado (a afirmação do próprio fdlibm). Se um caso falhar com o port fiel, parar e levar ao usuário, sem mudar o esperado.
- **Metas:** 90% de linhas e ramificações; 80% de mutação no motor, agora com `src/math/` incluído. Os sobreviventes são listados e lidos, como no sub-plano 1.
- **Como rodar:** `pnpm nx test sim-engine --coverage`, `pnpm nx lint sim-engine`, `pnpm nx typecheck sim-engine`, `pnpm nx run sim-engine:mutate`; a medição, `pnpm nx run sim-engine:measure-math` (alvo novo, tarefa 2), que entra na tabela "Commands" do `CLAUDE.md`.

## Desvios do guia de estilo

| Princípio quebrado | Critério e evidência | Alternativa descartada | Gatilho de revisão | Impacto em testes |
| --- | --- | --- | --- | --- |
| "Comente só o que o código não consegue dizer" (seção 2): `log.ts` e `exp.ts` levam o aviso de licença da Sun, como comentário legal `/*! ... */`, que os empacotadores preservam no bundle do `takt-web-app` | Exigência da licença: "provided that this notice is preserved". Critério: obrigação externa que o guia não prevê | Escrever do zero a partir da descrição do algoritmo, sem aviso: mais trabalho e risco, e o usuário escolheu o port | O guia ganhar uma regra para avisos de licença | Nenhum |
| Funções curtas e nomes sem abreviação (seção 2): o port mantém a estrutura do C e os nomes do fdlibm, só no formato que o lint exige (constantes de módulo em `UPPER_CASE`: `ln2_hi` vira `LN2_HI`, `Lg1` vira `LG1`; variáveis locais em `camelCase`: `R` vira `r`, `hfsq` fica `hfsq`) | Um port fiel é conferido linha a linha contra o original; renomear e reestruturar tira essa conferência. O oráculo bit a bit cobre o comportamento, não a leitura | Reescrever com nomes por extenso: diverge do original e dificulta a revisão | Troca do algoritmo | Nenhum |

## Registros novos propostos

Um, conforme o resultado da tarefa 4: **ADR-0014** (opção b, funções próprias, complementa o ADR-0011) ou **PDR-0022** (opção a, substitui o PDR-0008 no todo ou em parte, pergunta ao usuário nessa hora; o PDR-0008 só ganha a nota "Substituído por PDR-0022", e a RN-SIM-001, regra viva, muda o enunciado), escrito com a skill `writing-decision-records` e aceito pelo usuário antes das tarefas 5 a 7.

## Cerimônia observada

Nenhuma.

---

## Tarefa 1: casos de referência e auxiliares de bits

**Arquivos:**
- Criar: `libs/sim-engine/measurements/math/make_cases.py`, `libs/sim-engine/measurements/math/fdlibm_oracle.c` (só o programa que lê entradas e chama `__ieee754_log`/`__ieee754_exp`; o fdlibm não é commitado), `libs/sim-engine/src/tests/fixtures/fdlibm-case.ts` (tipos), `libs/sim-engine/src/tests/fixtures/fdlibm-cases.ts` (gerado pelo script; um módulo TypeScript, porque o `tsconfig` não habilita `resolveJsonModule` e o mesmo arquivo precisa carregar no Node e nos navegadores), `libs/sim-engine/src/tests/helpers/float-bits.ts`
- Modificar: `.prettierignore` (o arquivo gerado)
- Testar: `libs/sim-engine/src/tests/helpers/float-bits.spec.ts`
- Modificar: `docs/architecture/sim-engine.md`

**Interfaces:**
- Produz: `toBits(value: number): string` (16 dígitos hexadecimais minúsculos; `NaN` → `7ff8000000000000`); `fromBits(bits: string): number`; `ulpDistance(left: number, right: number): number` (distância na ordem dos `double`, contando +0 e −0 como vizinhos de distância 0). Em `fdlibm-case.ts`: `interface FdlibmCase { readonly input: string; readonly fdlibm: string; readonly correctlyRounded: string; readonly nearMidpoint: boolean }` (bits; `nearMidpoint` marca os casos "quase difíceis", acrescentados depois da revisão de 18/11/2026) e `interface FdlibmCases { readonly log: readonly FdlibmCase[]; readonly exp: readonly FdlibmCase[] }`; em `fdlibm-cases.ts`: `export const fdlibmCases: FdlibmCases`, com cada caso criado por uma função local tipada `toCase(input, fdlibm, correctlyRounded, nearMidpoint)`, porque milhares de objetos literais com um campo booleano estouram o limite de uniões do TypeScript (TS2590).

- [ ] **Passo 1:** testes que falham de `float-bits` (foco 5 e 6). `pnpm nx test sim-engine` · Esperado: FALHA, `float-bits.ts` não existe.
- [ ] **Passo 2:** implementar `float-bits.ts` com um `DataView` de módulo. `pnpm nx test sim-engine` · Esperado: PASSA.
- [ ] **Passo 3:** baixar `e_log.c`, `e_exp.c` e `fdlibm.h` do netlib num diretório novo fora do repositório, registrar os SHA-256, compilar com o oráculo e as flags das restrições globais. Conferir o oráculo em log 1 = 0, log 2, exp 0 = 1 e exp 1 contra o Python antes de usá-lo.
- [ ] **Passo 4:** `python3 -I make_cases.py` gera as entradas (focos 1 a 4, amostra espalhada e entradas do motor), chama o oráculo e calcula a referência com `decimal`. Rodar duas vezes e comparar (foco 11).
- [ ] **Passo 5:** `sim-engine.md`: origem do fixture, versão do fdlibm, SHA-256 dos arquivos, flags e comandos.

**Commit sugerido:** `test(sim-engine): add fdlibm reference cases and float bit helpers` · arquivos: os da lista.

## Tarefa 2: medição no Node e nos navegadores do Linux

**Arquivos:**
- Criar: `libs/sim-engine/measurements/math/measure-math.ts`, `libs/sim-engine/measurements/math/expected-counts.ts` (quantos valores cada conjunto deve ter, compartilhado pelas duas entradas), `libs/sim-engine/measurements/math/math.node.measure.ts`, `libs/sim-engine/measurements/math/math.browser.measure.ts`, `libs/sim-engine/measurements/math/compare.py`, `libs/sim-engine/vitest.measure.config.mts`
- Modificar: `package.json` e `pnpm-lock.yaml` (as duas dependências), `pnpm-workspace.yaml` (sem as exceções `semver@6.3.2` e `nx`/`@nx/*@24.0.3` de `minimumReleaseAgeExclude`), `.gitignore` (`test-output`), `libs/sim-engine/package.json` (alvo `measure-math`), `libs/sim-engine/tsconfig.spec.json` (incluir `measurements/**/*.ts` e `vitest.measure.config.mts`), `libs/sim-engine/eslint.config.mjs` (bloco para `measurements/**` que permite `navigator` e `node:fs`), `CLAUDE.md` (tabela "Commands"), `docs/architecture/workspace.md`

**Interfaces:**
- Consome: `toBits` e o fixture (tarefa 1); `findStreamIndex`, `findStreamStart`, `createRandomStream`, `nextUniform`, `drawTimeSec` (sub-plano 1).
- Produz: `measureMath(environment: string, details: string, functions: Readonly<Record<string, MathFunctions>>, cases: FdlibmCases): MathMeasurement`, com `MathFunctions = { log(x: number): number; exp(x: number): number }` e `MathMeasurement = { environment: string; details: string; fixtureDigest: string; sets: Record<string, string[]> }` (`details`: Node e V8, ou o *user agent*; `fixtureDigest`: FNV-1a de 64 bits das entradas do fixture, para o `compare.py` recusar uma medição feita contra outra versão dele); `fixtureDigest(cases: FdlibmCases): string`; `countValues(measurement: MathMeasurement): Record<string, number>`, que a entrada compara com `expectedNativeCounts`. Os conjuntos são: os 10⁵ uniformes da chave `d4:uniforms` (vetores do gerador, que devem ser iguais em todo ambiente); `log` e `exp` de cada entrada de `functions` sobre o fixture e sobre as entradas do motor (10⁵ uniformes da chave `d4:uniforms`, como u e 1 − u, e −x²/2 com x = 37·u); e os três sorteios ponta a ponta. A tarefa 2 passa `{ native: { log: Math.log, exp: Math.exp } }`; a tarefa 7 acrescenta `fdlibm`. Arquivo de saída: `libs/sim-engine/test-output/math-measurement/<motor>-<plataforma>.json`, com a plataforma de `process.platform` no Node e do `userAgent` nos navegadores (`linux`, `darwin`, `win32`). `compare.py <pasta>` lê todos os arquivos da pasta e imprime as tabelas em Markdown: no fixture, por função e ambiente, diferenças contra o fdlibm e contra o valor corretamente arredondado, com a maior distância em ulps; nos uniformes, nas entradas do motor e nos sorteios, quantos valores diferem entre cada par de ambientes e o primeiro índice diferente.

- [ ] **Passo 1:** tirar as exceções vencidas do `pnpm-workspace.yaml` (e o comentário de cada uma) e conferir com `pnpm install --frozen-lockfile` · Esperado: PASSA sem as exceções. Instalar as dependências exatas; o usuário roda `pnpm exec playwright install chromium firefox webkit` e, se o WSL pedir bibliotecas do sistema, `sudo pnpm exec playwright install-deps`.
- [ ] **Passo 2:** escrever `measure-math.ts`, as duas entradas e a configuração (projetos `node` e `browser`, este com as instâncias `chromium`, `firefox` e `webkit`, `api.allowWrite` só aqui). Cada entrada tem um `it` que mede, grava e confere só a própria medição (`expect` sobre a quantidade de conjuntos e de valores).
- [ ] **Passo 3:** `pnpm nx run sim-engine:measure-math` · Esperado: quatro arquivos em `test-output/math-measurement/` (`node-linux`, `chromium-linux`, `firefox-linux`, `webkit-linux`); `git status` não os mostra. `python3 -I libs/sim-engine/measurements/math/compare.py libs/sim-engine/test-output/math-measurement` · Esperado: tabelas, com os uniformes e a triangular sem diferenças (foco 7).
- [ ] **Passo 4:** `pnpm nx run-many -t lint typecheck test` · Esperado: PASSA; a configuração do `test` não muda.
- [ ] **Passo 5:** `workspace.md` (dependências, navegadores, alvo novo; tabela de exceções sem as duas linhas); `CLAUDE.md` "Commands".

**Commit sugerido:** `test(sim-engine): measure log and exp bits in Node, Chromium, Firefox and WebKit` · arquivos: os da lista.

## Tarefa 3: medição no macOS e no Windows (pull request próprio)

**Arquivos:**
- Criar: `.github/workflows/math-measurement.yml`
- Modificar: `docs/architecture/workspace.md`

Este arquivo vai num ramo próprio a partir da `main` e num pull request pequeno, mesclado antes das rodadas, porque o `workflow_dispatch` só aparece com o arquivo no ramo padrão.

**Interfaces:**
- Consome: o alvo `measure-math` e o projeto `browser` (tarefa 2), lidos do ramo indicado em `--ref`.
- Produz: os artefatos `math-measurement-darwin` e `math-measurement-win32`, com `chromium-`, `firefox-` e `webkit-<plataforma>.json`, baixados pelo usuário com `gh run download`.

- [ ] **Passo 1:** escrever o workflow: `workflow_dispatch`, matriz `os: [macos-15, windows-latest]`, `permissions: contents: read`, checkout com `persist-credentials: false`, as mesmas actions do `ci.yml` (mesmos SHAs), `pnpm install --frozen-lockfile`, `pnpm exec playwright install chromium firefox webkit`, só a medição do projeto `browser` (sem lint nem testes) e `actions/upload-artifact` fixada por SHA (versão com pelo menos 7 dias).
- [ ] **Passo 2:** pull request próprio, mesclado pelo usuário.
- [ ] **Passo 3:** depois da tarefa 2, o usuário dispara (`gh workflow run math-measurement.yml --ref feat/engine-d4-math`) e baixa os artefatos para `test-output/math-measurement/`. `compare.py` · Esperado: dez ambientes nas tabelas (Node e três navegadores em três sistemas).
- [ ] **Passo 4:** `workspace.md`: o workflow e quando rodá-lo.

**Commit sugerido:** `ci(repo): add a manual workflow that measures log and exp on macOS WebKit` · arquivos: os da lista.

## Tarefa 4: relatório, decisão e registro

**Arquivos:**
- Criar: `docs/research/precisao-de-log-e-exp.md`; `docs/adr/0014-<nome>.md` (opção b) ou `docs/pdr/0022-<nome>.md` (opção a)
- Modificar: `docs/research/README.md`, `docs/product/references.md`, o índice de ADRs ou PDRs

- [ ] **Passo 1:** relatório com as versões exatas (Node, V8, navegadores, macOS, Windows, Playwright) e os limites (Linux só na máquina do usuário; sem Mac Intel, celular nem tablet), as tabelas do `compare.py`, os *digests* e a estimativa, rotulada, da chance de uma rodada divergir: 1 − (1 − r)ⁿ, com r a fração de sorteios diferentes e n os sorteios de um turno, supondo independência.
- [ ] **Passo 2:** levar ao usuário as tabelas e a recomendação; o usuário escolhe (a) ou (b).
- [ ] **Passo 3:** escrever o registro com a skill `writing-decision-records`, status "Proposto"; o usuário aceita. Na opção (a), pelo fluxo de aceite da skill: o PDR-0008 ganha só a nota de substituição e a RN-SIM-001 muda o enunciado; `sim-engine.md` registra o limite; a D4 sai das "Decisões pendentes" do guia e a seção 7 diz o resultado; o plano vai direto ao passo de fechamento da tarefa 7 (sem as tarefas 5 e 6 e sem a troca de código).

**Commit sugerido:** `docs: measure log and exp across JavaScript engines and propose ADR-0014` (ou `PDR-0022`) · arquivos: os da lista.

## Tarefa 5: `log` do fdlibm (opção b)

**Arquivos:**
- Criar: `libs/sim-engine/src/math/float-words.ts`, `libs/sim-engine/src/math/log.ts`, `libs/sim-engine/src/tests/helpers/map-bits.ts`, `libs/sim-engine/src/tests/helpers/max-ulp-distance.ts`
- Testar: `libs/sim-engine/src/math/float-words.spec.ts`, `libs/sim-engine/src/math/log.spec.ts`, `libs/sim-engine/src/tests/helpers/map-bits.spec.ts`, `libs/sim-engine/src/tests/helpers/max-ulp-distance.spec.ts`
- Modificar: `docs/architecture/sim-engine.md` (linha de `tests/helpers/`)

**Interfaces:**
- Consome: fixture, `toBits`, `fromBits` e `ulpDistance` (tarefa 1); auxiliares novos de teste `mapBits(fn: (x: number) => number, inputs: readonly string[]): string[]` e `maxUlpDistance(fn: (x: number) => number, cases: readonly FdlibmCase[]): number`, em `src/tests/helpers/`, cada um com spec.
- Produz: `highWord(x: number): number` (32 bits altos, com sinal, como o `int` do C); `lowWord(x: number): number` (32 bits baixos, sem sinal); `fromWords(high: number, low: number): number`, os três com um `DataView` de módulo; `log(x: number): number`.

- [ ] **Passo 1:** testes que falham: `float-words` (1 → `0x3ff00000`, 0; −0 → `0x80000000` com sinal, 0) e os três de `log` (plano de testes). `pnpm nx test sim-engine` · Esperado: FALHA.
- [ ] **Passo 2:** portar `__ieee754_log` do `e_log.c` linha a linha: aviso da Sun no topo, como `/*! ... */`, e uma linha de origem (`// fdlibm 5.3, e_log.c`); nomes como no desvio 2; aritmética de `int` do C com `| 0` e `>>`; nada de `Math.*` aproximado.
- [ ] **Passo 3:** `pnpm nx test sim-engine --coverage` · Esperado: PASSA, bits iguais ao fdlibm em todo o fixture.
- [ ] **Passo 4:** foco 9, registrado em `sim-engine.md`.

**Commit sugerido:** `feat(sim-engine): port the fdlibm natural logarithm` · arquivos: os da lista.

## Tarefa 6: `exp` do fdlibm (opção b)

**Arquivos:**
- Criar: `libs/sim-engine/src/math/exp.ts`
- Testar: `libs/sim-engine/src/math/exp.spec.ts`

**Interfaces:**
- Consome: `highWord`, `lowWord`, `fromWords` (tarefa 5), fixture e auxiliares de teste (tarefas 1 e 5).
- Produz: `exp(x: number): number`.

- [ ] **Passo 1:** os três testes de `exp`. `pnpm nx test sim-engine` · Esperado: FALHA.
- [ ] **Passo 2:** portar `__ieee754_exp` do `e_exp.c` (aviso, origem, mesmas regras da tarefa 5); `__HI(y) += (k<<20)` vira `fromWords(highWord(y) + (k << 20), lowWord(y))`.
- [ ] **Passo 3:** `pnpm nx test sim-engine --coverage` · Esperado: PASSA.
- [ ] **Passo 4:** foco 9, registrado.

**Commit sugerido:** `feat(sim-engine): port the fdlibm exponential` · arquivos: os da lista.

## Tarefa 7: troca nas distribuições, lint e fechamento

**Arquivos:**
- Modificar: `libs/sim-engine/src/distributions/exponential.ts`, `libs/sim-engine/src/distributions/normal.ts`, `libs/sim-engine/src/rng/mrg32k3a.ts` (`2 ** 51` vira o literal 2_251_799_813_685_248), `libs/sim-engine/eslint.config.mjs`, `libs/sim-engine/src/lint-conformance.spec.ts`, `libs/sim-engine/measurements/math/math.node.measure.ts` e `math.browser.measure.ts` (entrada `fdlibm`), `docs/research/precisao-de-log-e-exp.md`, `docs/architecture/sim-engine.md`, `docs/architecture/workspace.md` (seção "Lint"), `docs/architecture/code-style.md` (D4 resolvida, seção 7), `.claude/rules/engine.md`, `docs/plans/2026-11-04-roteiro-motor.md`, `docs/plans/README.md`, este plano

**Interfaces:**
- Consome: `log` e `exp` (tarefas 5 e 6).
- Produz: no lint do motor, para `src/**/*.ts` fora dos specs e de `src/tests/`: `no-restricted-properties` para as funções aproximadas de `Math` (`acos`, `acosh`, `asin`, `asinh`, `atan`, `atanh`, `atan2`, `cbrt`, `cos`, `cosh`, `exp`, `expm1`, `hypot`, `log`, `log1p`, `log10`, `log2`, `pow`, `sin`, `sinh`, `tan`, `tanh`), com mensagem que aponta `src/math/`; `no-restricted-syntax` para `**` e `**=` quando o lado esquerdo não é um literal `bigint`. Como uma regra redefinida substitui as opções anteriores, o bloco repete as proibições atuais (`Math.random`, `Date.now`, `performance.now`, `noEnum`, os seletores de `Date` e `globalThis`), em constantes compartilhadas, e acrescenta as novas; os testes de conformidade atuais provam que nada caiu.

- [ ] **Passo 1:** casos do foco 10 no teste de conformidade. `pnpm nx test sim-engine` · Esperado: FALHA.
- [ ] **Passo 2:** regras de lint e a troca nas distribuições. Os exemplos de JSDoc que mostram saídas exatas (`normalQuantile`, `normalSurvival`, `truncatedNormalQuantile`) são recalculados e conferidos contra as referências do sub-plano 1; teste nenhum muda de valor esperado.
- [ ] **Passo 3:** `pnpm nx run-many -t lint typecheck test` e `pnpm nx run sim-engine:mutate` · Esperado: PASSA, mutação ≥ 80%, sobreviventes lidos.
- [ ] **Passo 4:** medir de novo nos dez ambientes (tarefas 2 e 3) · Esperado: `log`, `exp` próprios e os três sorteios com zero diferenças (foco 8). Acrescentar ao relatório.
- [ ] **Passo 5: fechar.** `sim-engine.md` (seção `math/`, regra de lint, medição); guia e `.claude/rules/engine.md` no mesmo pull request; roteiro: linha 2 "Concluído", risco da D4, pendência das ferramentas de navegador e a troca dos casos de Lefèvre pelas fronteiras de ramo; status deste plano e índice de `docs/plans/README.md`.

**Commit sugerido:** `feat(sim-engine): draw times with the fdlibm log and exp and ban approximated Math in the engine` · arquivos: os da lista.

---

## Revisão

| # | Achado | Fonte | Aceito? | Motivo |
| --- | --- | --- | --- | --- |
| 1 | Links do PDR-0008 e do ADR-0010 apontavam para a pasta | autorrevisão | Sim | Caminhos dos arquivos |
| 2 | "Firefox usa o fdlibm do FreeBSD" sem fonte | autorrevisão | Sim | Trocado pelo que a pesquisa leu (código de fevereiro de 2025) |
| 3 | Nome errado da operação da especificação sobre a codificação de `NaN` | autorrevisão | Sim | `NumericToRawBytes`, a conferir na tarefa 1 |
| 4 | Fixture em JSON não carrega com `nodenext` sem `resolveJsonModule` | autorrevisão | Sim | Módulo TypeScript gerado, que carrega no Node e nos navegadores |
| 5 | Vetores do gerador, pedidos pelo roteiro, fora da medição | autorrevisão | Sim | Conjunto dos uniformes, com zero diferenças esperadas |
| 6 | Sem testes para os bits altos e baixos e para os auxiliares do port | autorrevisão | Sim | Linhas no plano de testes, tarefa 5 |
| 7 | `test-output/math-measurement/` não é ignorado pelo git | plan-reviewer | Sim | Conferido com `git check-ignore`; `.gitignore` na tarefa 2 |
| 8 | O WebKit do macOS sobrescreveria o do Linux | plan-reviewer | Sim | Arquivos por motor e plataforma |
| 9 | `workflow_dispatch` só dispara com o arquivo na `main` | plan-reviewer | Sim | Tarefa 3 vira um pull request próprio, mesclado antes das rodadas |
| 10 | Tarefa 5 sem os arquivos dos auxiliares novos | plan-reviewer | Sim | Arquivos e specs listados |
| 11 | Seção "Lint" de `workspace.md` não atualizada | plan-reviewer | Sim | Na tarefa 7 |
| 12 | Bloco de lint novo apagaria as proibições atuais | plan-reviewer | Sim | Repete as listas em constantes compartilhadas |
| 13 | Oráculo em x86_64 sem `-D__LITTLE_ENDIAN` | plan-reviewer | Sim | Flag acrescentada; a conferência log 1 = 0 continua |
| 14 | Variável local `R` do fdlibm quebra a regra de nomes | plan-reviewer | Sim | Locais em `camelCase`, constantes com o nome do fdlibm |
| 15 | Distância em ulps e fixture sem regra para `NaN` | plan-reviewer | Sim | Contrato no foco 6 e casos na tabela |
| 16 | Foco 6 sem teste com outra codificação de `NaN` | plan-reviewer | Sim | `fff8000000000000` e `7ff0000000000001` |
| 17 | `vitest.measure.config.mts` fora de todo `tsconfig` | plan-reviewer | Sim | Incluído no `tsconfig.spec.json` |
| 18 | `compare.py` sem referência para as entradas do motor | plan-reviewer | Sim | Nelas, só a comparação entre ambientes |
| 19 | Aviso da Sun pode sumir na minificação | plan-reviewer | Sim | Comentário legal `/*! ... */` |
| 20 | Chromium e Firefox só no Linux não representam Windows nem macOS | plan-reviewer | Sim | Matriz `macos-15` e `windows-latest` com os três navegadores; sem Mac Intel, registrado como limite |
| 21 | Minutos do macOS gastam a cota gratuita | plan-reviewer | Não | O repositório é público, e os executores padrão são gratuitos nele (conferido na documentação de cobrança) |
| 22 | Opção (a) "atualiza o PDR-0008", que está aceito | plan-reviewer | Sim | PDR-0022 substitui; o PDR-0008 só ganha a nota |
| 23 | Casos difíceis do CORE-MATH, pedidos pelo roteiro, cortados sem o usuário | plan-reviewer (premissa) | Sim | Levado ao usuário, que decidiu não usá-los (18/11/2026) |
