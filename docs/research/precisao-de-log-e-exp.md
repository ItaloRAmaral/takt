# Precisão de `log` e `exp` entre motores JavaScript (D4)

> **Resumo.** O mesmo sorteio do motor dá bits diferentes conforme o navegador. Medido em 18/11/2026 no Linux: o Chromium 158 calcula `Math.log` e `Math.exp` corretamente arredondados (libm do LLVM); o Firefox 159 e o Node 24 usam o fdlibm, bit a bit; o WebKit 27.2 usa a libm do sistema, um terceiro resultado. Na exponencial, **6,8% dos sorteios** diferem entre Chrome e Firefox, o primeiro já no 14º; uma rodada de turno quase certamente diverge. O gerador e a triangular, que só usam aritmética e `Math.sqrt`, dão os mesmos bits em todos. A promessa da RN-SIM-001 ("o professor e o aluno veem os mesmos números") não vale com as funções nativas.

Data: 18/11/2026. Pedido: sub-plano 2 do [roteiro do motor](../plans/2026-11-04-roteiro-motor.md), [plano](../plans/2026-11-18-motor-d4-log-exp.md), tarefa 4. Decisão pendente D4 do [guia de estilo](../architecture/code-style.md).

**Rótulos.** **[Fato]**: sustentado pela fonte citada. **[Medição]**: rodei, com o método descrito; reproduzível pelos comandos de [`workspace.md`](../architecture/workspace.md), seção "Medição de `log` e `exp` entre motores (D4)". **[Estimativa]**: conta sobre a medição, com a hipótese dita. **[Palpite]**: opinião sem fonte.

## Por que medir

**[Fato]** A especificação só exige arredondamento correto de `Math.sqrt` e das quatro operações; `exp`, `log`, `pow` e as demais funções de `Math` são "implementation-approximated" ([ECMAScript 21.3.2](https://tc39.es/ecma262/multipage/numbers-and-dates.html)). O motor usa `Math.log` na exponencial e no AS 241, e `Math.exp` no Hart (Φ e Q da normal truncada). A [pesquisa da literatura do motor](literatura-do-motor.md) já previa a divergência pelo código dos motores; faltava o tamanho dela.

## Como medi

- **Ambientes** [Medição]: Node 24.22.2 (V8 13.6.233.17) e os navegadores do Playwright 1.65.0, todos no Linux x86_64 (WSL2, Ubuntu 22.04):

| Ambiente | Versão (*user agent*) |
| --- | --- |
| `node-linux` | Node v24.22.2, V8 13.6.233.17-node.63 |
| `chromium-linux` | HeadlessChrome/158.0.8127.18 |
| `firefox-linux` | Firefox/159.0 |
| `webkit-linux` | WebKit 27.2 (Version/27.2 Safari/605.1.15) |

- **Conjuntos:** os 10⁵ uniformes do gerador (chave `d4:uniforms`, semente 42); `log` de u e de 1 − u e `exp(−x²/2)` com x = 37·u, sobre os mesmos uniformes (as entradas que o motor usa); os casos de referência do fixture (`fdlibm-cases.ts`: 2674 de `log` e 2758 de `exp`, com valores especiais, fronteiras de ramo do fdlibm e mil casos "quase difíceis" por função); e 10⁵ sorteios de cada distribuição pelo `drawTimeSec` do motor: exponencial (média 30 s), triangular (10, 20, 50 s) e normal truncada (média 30 s, desvio 5 s, mínimo 0).
- **Referências:** a saída do fdlibm 5.3 compilado em C e o valor corretamente arredondado (`decimal` do Python, 100 algarismos), detalhados em [`sim-engine.md`](../architecture/sim-engine.md), seção "Casos de referência de `log` e `exp`".
- **Comparação:** bit a bit, com todo `NaN` tratado como um só.

## Resultados

### Contra as referências [Medição]

| Conjunto | Ambiente | ≠ fdlibm | ≠ correto | ≠ correto nos quase difíceis | Maior distância |
| --- | --- | --- | --- | --- | --- |
| `log` (2674 casos) | Chromium | 305 | 0 | 0 de 1000 | 0 ulp |
| | Firefox | 0 | 305 | 265 de 1000 | 1 ulp |
| | Node | 0 | 305 | 265 de 1000 | 1 ulp |
| | WebKit | 305 | 2 | 2 de 1000 | 1 ulp |
| `exp` (2758 casos) | Chromium | 655 | 0 | 0 de 1000 | 0 ulp |
| | Firefox | 1 | 654 | 498 de 1000 | 1 ulp |
| | Node | 1 | 654 | 498 de 1000 | 1 ulp |
| | WebKit | 643 | 358 | 358 de 1000 | 1 ulp |

- **Chromium 158:** `log` e `exp` corretamente arredondados em todos os casos, o que confirma a troca para a libm do LLVM que a pesquisa encontrou no código do V8 [Fato, pela medição e pelos commits citados na pesquisa].
- **Firefox 159 e Node 24:** o fdlibm, bit a bit, no `log`; no `exp`, o fdlibm menos um caso, `exp(1)`, que os dois dão corretamente arredondado (`2.718281828459045`), e o fdlibm 5.3, 1 ulp acima.
- **WebKit 27.2 no Linux:** um terceiro resultado, quase correto no `log` e com 358 erros de 1 ulp nos `exp` quase difíceis. [Estimativa] É a libm do sistema (glibc), que o JavaScriptCore chama ([MathCommon.h](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/JavaScriptCore/runtime/MathCommon.h)); o Safari no macOS chama a libm da Apple, que não foi medida.
- Ninguém erra mais de 1 ulp. A divergência não é de precisão: os quatro são bons. É de arredondamento, e basta 1 bit.

### Entre ambientes [Medição]

Grupos de ambientes com bits idênticos e quantos valores diferem entre cada par de grupos (entre parênteses, o primeiro índice diferente):

| Conjunto | Grupos | Diferenças |
| --- | --- | --- |
| Uniformes do gerador | um só: os quatro | — |
| Sorteios da triangular | um só: os quatro | — |
| Sorteios da exponencial | A: Chromium; B: Firefox, Node; C: WebKit | A×B: 6843 (13); A×C: 83 (272); B×C: 6836 (13) |
| Sorteios da normal truncada | A: Chromium, WebKit; B: Firefox, Node | A×B: 92 (3047) |
| `log(u)` | A: Chromium; B: Firefox, Node; C: WebKit | A×B: 7277 (32); A×C: 84 (1967) |
| `log(1 − u)` | A: Chromium; B: Firefox, Node; C: WebKit | A×B: 7383 (2); A×C: 82 (4891) |
| `exp(−x²/2)` | A: Chromium; B: Firefox, Node; C: WebKit | A×B: 9744 (3); A×C: 88 (794) |

- **Os controles batem:** os uniformes e a triangular são idênticos nos quatro. O gerador é portável, e a medição não acusa diferença que não existe.
- **Exponencial:** 6,8% dos sorteios mudam entre Chrome e Firefox, o primeiro no índice 13.
- **Normal truncada:** 92 de 10⁵ mudam; menos, porque a inversão passa pelo AS 241 e o `exp` só entra no Hart das bordas do intervalo.

## O que isso significa para uma rodada

**[Estimativa]** Supondo que cada sorteio diverge de forma independente com a fração medida r, a chance de uma rodada com n sorteios **não** divergir é (1 − r)ⁿ:

| Par de ambientes, distribuição | r | n = 15 | n = 100 | n = 1000 | n = 2400 |
| --- | --- | --- | --- | --- | --- |
| Chrome × Firefox, exponencial | 0,068 | 35% | 0,08% | ~0 | ~0 |
| Chrome × Safari no Linux, exponencial | 0,00083 | 99% | 92% | 44% | 14% |
| Chrome × Firefox, normal truncada | 0,00092 | 99% | 91% | 40% | 11% |

**[Palpite]** Um turno de 8 h com uma linha de cinco estações e ciclo de um minuto passa de 2400 sorteios. E um bit diferente num tempo muda a ordem de dois eventos próximos, de modo que a trajetória inteira diverge a partir dali, não só aquele número. Na prática, professor e aluno em navegadores diferentes veem resultados diferentes em quase toda rodada.

**[Fato]** Nem o mesmo navegador é estável no tempo: o Node 24 (V8 13.6) e o Chrome 158 são o mesmo motor em versões diferentes e caem em grupos diferentes, porque o V8 trocou `log` e `exp` em maio de 2026 (commits na [pesquisa](literatura-do-motor.md)). Uma atualização automática do Chrome mudou os números de uma mesma planta e semente.

## Opções da D4, à luz da medição

- **(a) Aceitar e documentar** ("reprodutível por motor JavaScript"): pela medição, a promessa ficaria "reprodutível no mesmo navegador, na mesma versão", porque a atualização do navegador também muda os bits. Não cobre o caso comum do produto, professor e aluno em navegadores diferentes.
- **(b) Funções próprias** só com as quatro operações e bits: a especificação garante o mesmo resultado em todo motor conforme. O port do fdlibm 5.3 ([netlib](https://www.netlib.org/fdlibm/)) foi escolhido pelo usuário em 18/11/2026; ele deve reproduzir exatamente a coluna do grupo B (Firefox e Node), menos `exp(1)`, e o fixture já tem o oráculo em C para provar isso.

## Depois da decisão: `log` e `exp` próprios [Medição]

Com o [ADR-0014](../adr/0014-log-e-exp-proprios-no-motor.md), o motor passou a usar ports do fdlibm 5.3 (`src/math/log.ts` e `exp.ts`), só com as quatro operações e operações de bits. Medido de novo em 18/11/2026, nos mesmos quatro ambientes:

| Conjunto | Resultado |
| --- | --- |
| `log` e `exp` próprios sobre o fixture (2683 e 2785 casos) | Iguais ao fdlibm em C em todos os casos, nos quatro ambientes |
| `log` e `exp` próprios sobre as entradas do motor (10⁵ cada) | Um só grupo: os quatro ambientes |
| Sorteios da exponencial, da triangular e da normal truncada | Um só grupo: os quatro ambientes |
| `Math.log` e `Math.exp` nativos (controle) | Continuam em três grupos |

O workflow `math-measurement.yml` repete a medição em Ubuntu, macOS e Windows a cada merge que mude o motor e falha se `log`, `exp` ou os sorteios divergirem. As funções próprias custam cerca de 30 a 35 ns a mais por chamada que as nativas (Node 24, 10⁶ chamadas), desprezível num turno.

## Limites

- A medição deste relatório é só Linux x86_64. macOS (Safari, libm da Apple) e Windows rodam pelo workflow, depois do merge; os resultados nativos deles ficam para uma atualização deste relatório.
- Navegadores *headless* do Playwright, não as versões instaladas por usuários; a biblioteca matemática é a mesma do motor de cada um, mas a versão pode ser outra.
- Sem Mac Intel, celular nem tablet (fora do escopo, decisão do usuário).
- A estimativa de rodada supõe independência entre sorteios e não simula a propagação na trajetória.

## Referências

- ECMA-262, [funções do objeto Math](https://tc39.es/ecma262/multipage/numbers-and-dates.html).
- fdlibm 5.3, [netlib](https://www.netlib.org/fdlibm/): `e_log.c` e `e_exp.c`.
- V8, [`ieee754.cc`](https://raw.githubusercontent.com/nodejs/node/main/deps/v8/src/base/ieee754.cc) (`log` e `exp` delegados à libm do LLVM) e os commits citados na [pesquisa da literatura do motor](literatura-do-motor.md).
- WebKit, [`MathCommon.h`](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/JavaScriptCore/runtime/MathCommon.h).
- Playwright, [notas de versão](https://playwright.dev/docs/release-notes) (1.65: Chromium 158, Firefox 159, WebKit 27.2).
- Vitest, [modo navegador](https://vitest.dev/guide/browser/) e [comandos](https://vitest.dev/guide/browser/commands).
- Lefèvre, V. [testlibm](https://www.vinc17.net/research/testlibm/index.en.html) (casos difíceis, sem licença declarada; não usados).
