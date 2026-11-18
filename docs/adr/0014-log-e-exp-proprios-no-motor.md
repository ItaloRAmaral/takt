# ADR-0014: Logaritmo e exponencial próprios no motor

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 18/11/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `@takt/sim-engine`; CI (workflow de medição entre motores JavaScript) |

## Contexto

A [RN-SIM-001](../product/rules/simulation.md) promete que a mesma planta, com o mesmo cenário, a mesma semente e a mesma versão do motor, dá exatamente os mesmos resultados, com o exemplo do professor e do aluno que veem os mesmos números ([PDR-0008](../pdr/0008-simulacao-com-reproducao.md)). O [ADR-0011](0011-motor-de-simulacao-e-esquema.md) espera que o motor rode "igual no navegador, nos testes e, no futuro, num serviço do servidor". A decisão pendente D4 do [guia de estilo](../architecture/code-style.md) perguntava se isso vale entre motores JavaScript.

- **Fato:** a especificação só exige arredondamento correto de `Math.sqrt` e das quatro operações; `exp`, `log`, `pow` e as demais funções de `Math` são "implementation-approximated" ([ECMAScript 21.3.2](https://tc39.es/ecma262/multipage/numbers-and-dates.html)). O motor usa `Math.log` na exponencial e no AS 241, e `Math.exp` no Hart da normal truncada (`docs/architecture/sim-engine.md`).
- **Fato (medição de 18/11/2026, [relatório](../research/precisao-de-log-e-exp.md)):** no Linux, o Chromium 158 arredonda `log` e `exp` corretamente; o Firefox 159 e o Node 24 usam o fdlibm; o WebKit 27.2 usa a libm do sistema. São três resultados para o mesmo sorteio. Na exponencial, 6,8% dos 10⁵ sorteios diferem entre Chrome e Firefox, o primeiro no índice 13. Os uniformes do gerador e a triangular, que só usam aritmética e `Math.sqrt`, são idênticos nos quatro ambientes.
- **Fato:** o mesmo navegador também muda: o Node 24 (V8 13.6) e o Chrome 158 caem em grupos diferentes, porque o V8 trocou `log` e `exp` em maio de 2026 ([pesquisa da literatura do motor](../research/literatura-do-motor.md)).
- **Estimativa:** supondo sorteios independentes, uma rodada com 100 sorteios exponenciais tem 0,08% de chance de dar o mesmo resultado no Chrome e no Firefox; um turno típico passa de mil sorteios. **Palpite:** um bit diferente num tempo muda a ordem dos eventos, e a trajetória inteira diverge dali em diante.

## Decisão

1. **O motor calcula o logaritmo natural e a exponencial com funções próprias**, `log(x)` e `exp(x)` em `libs/sim-engine/src/math/`, portadas do fdlibm 5.3 ([netlib](https://www.netlib.org/fdlibm/): `e_log.c` 1.3 e `e_exp.c` 1.6). O código usa só as quatro operações e operações de bits sobre o `double`, lido e escrito por um `DataView` com ordem de bytes explícita. Como a especificação obriga essas operações a dar o mesmo resultado em todo motor conforme, `log` e `exp` dão os mesmos bits em todo navegador, sistema e versão. O aviso de licença da Sun fica no topo de cada arquivo portado, como comentário legal (`/*! ... */`), que os empacotadores preservam.
2. **O código do motor não chama funções aproximadas**: as de `Math` que a especificação deixa "implementation-approximated" (`acos`, `acosh`, `asin`, `asinh`, `atan`, `atanh`, `atan2`, `cbrt`, `cos`, `cosh`, `exp`, `expm1`, `hypot`, `log`, `log1p`, `log10`, `log2`, `pow`, `sin`, `sinh`, `tan`, `tanh`) e o operador `**` sobre `number`. Continuam permitidas as exatas (`Math.sqrt`, `Math.abs`, `Math.min`, `Math.max`, os arredondamentos) e `**` sobre `bigint`. Uma função aproximada nova que o motor precise ganha implementação própria pela mesma regra, decidida no plano que a trouxer.
3. **Referência de correção:** `log` e `exp` dão exatamente os bits do fdlibm 5.3 compilado em C nos casos de referência do motor (valores especiais, fronteiras de cada ramo, amostra espalhada e casos "quase difíceis"), e ficam a no máximo 1 ulp do valor corretamente arredondado, como o próprio fdlibm afirma.
4. **Prova entre motores:** um workflow mede `log`, `exp` e os sorteios no Node e no Chromium, Firefox e WebKit, em Ubuntu, macOS e Windows, a cada merge na `main` que mude o motor e quando disparado à mão; ele falha se as funções próprias ou os sorteios derem bits diferentes entre ambientes.

## Alternativas consideradas

- **Aceitar a divergência e documentar (opção a da D4):** nenhum código novo. Perde porque a medição mostra que a promessa encolheria para "o mesmo navegador, na mesma versão", e nem isso é estável, já que uma atualização automática do navegador muda os bits. Não cobre o caso comum do produto, professor e aluno em navegadores diferentes, e exigiria um PDR que restringisse a RN-SIM-001.
- **Port corretamente arredondado (CORE-MATH ou libc do LLVM):** os mesmos bits em todo motor e igual ao Chrome atual. Perde pelo custo: aritmética de precisão dupla-dupla, tabelas e um caminho lento para os casos difíceis, bem mais código para manter, quando o objetivo é ter bits iguais, não o arredondamento correto. **Estimativa:** a diferença estatística entre o fdlibm (erro < 1 ulp) e o arredondamento correto é desprezível para tempos de simulação.
- **Escrever do zero, a partir da descrição do algoritmo, sem copiar código:** dispensaria o aviso de licença. Perde por mais trabalho e risco de erro, sem oráculo bit a bit; a licença do fdlibm permite o port, e o algoritmo vem descrito nos comentários do próprio código.
- **Medir em tempo de execução e avisar o usuário quando o navegador diverge:** não resolve; só informa que os números não batem.

## Consequências

**Positivas:**
- A RN-SIM-001 passa a valer entre navegadores, sistemas e atualizações, e a consequência do ADR-0011 ("roda igual no navegador, nos testes e no servidor") fica verdadeira.
- Um teste no Node prova o resultado de todos os navegadores para essas funções, porque elas não dependem do motor JavaScript.
- O workflow de medição vira um guarda contra regressão: um `Math.log` esquecido ou um port quebrado aparece no merge.

**Negativas e custos:**
- **Estimativa:** cerca de 100 linhas de código numérico portado por função (o corpo de cada função C tem ~40 linhas, mais constantes e acesso aos bits), mantidas pelo Takt, com nomes e estrutura do original para poder ser conferido linha a linha (desvio do guia registrado no [plano](../plans/2026-11-18-motor-d4-log-exp.md)).
- O motor dá resultados diferentes, em até 1 ulp, dos do Chrome atual, que arredonda corretamente; isso só importa para quem comparar o motor com um cálculo feito no console do navegador.
- **Estimativa a medir:** as funções próprias podem ser mais lentas que as nativas; o motor faz um `log` por sorteio exponencial. O plano mede o tempo de 10⁶ chamadas.
- Cada função aproximada nova (por exemplo, `pow` numa distribuição futura) custa um port próprio.
- O workflow consome minutos de CI em macOS e Windows, gratuitos em repositório público ([cobrança do Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)), e depende dos navegadores do Playwright.

## Riscos de segurança

A decisão não cria superfície de ataque: as funções são puras, sem entrada externa além dos parâmetros já validados pelo esquema. O workflow segue as regras do [ADR-0010](0010-qualidade-e-ci.md) (actions fixadas por SHA, permissão só de leitura, sem segredos). A ameaça de parâmetros que geram tempos infinitos ou `NaN` continua tratada pelo [ADR-0011](0011-motor-de-simulacao-e-esquema.md) e pelas pendências dos sub-planos 3 e 4; esta decisão não a muda.

## Conformidade

- **Lint do motor:** `no-restricted-properties` para cada função aproximada de `Math` listada na decisão, e `no-restricted-syntax` para `**` e `**=` quando o lado esquerdo não é um literal `bigint`, só no código do motor (fora dos specs e de `src/tests/`). Os testes de conformidade do lint provam a recusa de `Math.log`, `Math.exp`, `Math.pow` e `2 ** 51` e a aceitação de `Math.sqrt` e `2n ** 127n`.
- **Testes unitários:** `log` e `exp` iguais bit a bit ao fdlibm 5.3 em todos os casos de referência e a no máximo 1 ulp do valor correto; mutação de pelo menos 80% (ADR-0009).
- **Workflow de medição:** falha se `log`, `exp` próprios ou os sorteios do motor derem bits diferentes entre os ambientes medidos.

## Relacionados

- [RN-SIM-001](../product/rules/simulation.md) e [PDR-0008](../pdr/0008-simulacao-com-reproducao.md): a promessa que esta decisão cumpre.
- [ADR-0011](0011-motor-de-simulacao-e-esquema.md): complementa os itens 5 e 6 (gerador e distribuições), sem substituí-lo.
- [ADR-0009](0009-estrategia-de-testes.md) e [ADR-0010](0010-qualidade-e-ci.md): testes, mutação e CI.
- [Relatório da medição](../research/precisao-de-log-e-exp.md), [plano do sub-plano 2](../plans/2026-11-18-motor-d4-log-exp.md) e [`sim-engine.md`](../architecture/sim-engine.md).

## Em aberto

- O resultado das funções **nativas** no Safari (libm da Apple) e no Windows: medido pelo workflow depois do merge, só para o relatório; não muda esta decisão.
- O tempo das funções próprias contra as nativas, medido no plano; uma diferença grande pode pedir otimização, não troca de decisão.
- Se o workflow de medição passa a rodar também em cada pull request (o "Em aberto" do ADR-0009 sobre navegadores no CI); por ora, só no merge e à mão.
