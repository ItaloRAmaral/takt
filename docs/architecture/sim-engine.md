# Motor de simulação (`@takt/sim-engine`)

> **Resumo.** Como o motor é construído hoje. O motor é um núcleo funcional em TypeScript puro, sem React, Three.js nem DOM, que roda num Web Worker do `takt-web-app`. O porquê está no [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) e no [ADR-0013](../adr/0013-erros-esperados.md); o plano que o constrói é o [roteiro do motor](../plans/2026-11-04-roteiro-motor.md). Este documento cresce a cada sub-plano.

Atualizado em 26/11/2026 (sub-plano 4 concluído: compilação da planta, lista de eventos, uma replicação no modo turno, indicadores e séries; [ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md) e RN-SIM-018).

## Estrutura

Pastas por conceito ([guia de estilo](code-style.md), seção 7), dentro de `libs/sim-engine/src/`:

| Pasta | O que tem | Sub-plano |
| --- | --- | --- |
| `errors/` | `SimulationError`, o erro esperado do motor | 1 |
| `tests/helpers/` | Auxiliares só de teste (`catchError`, `drawUniforms`, `summarizeUniforms`, `drawTimesSec`, `sampleMean`, `sampleVariance`, `relativeError`; e, do sub-plano 2, `toBits`, `fromBits`, `ulpDistance`, `findFdlibmMismatches` e `maxUlpDistance`), cada um com o spec ao lado; do sub-plano 4, `makePlant` e os construtores de elementos e cenário, `testLimits`, `withUncheckedOverride`, `scheduleSlots`, `takeAllSlots`, `sortSlotsByEventOrder`, as consultas ao log (`exitTimesSec`, `selectLogEvents`, `selectPartIds`, `countUnaccountedParts`), `sumTimeInWindowSec` e `arbitraryLine` (plantas geradas pelo fast-check); não saem pelo `index.ts`, não entram no *build* (`exclude` do `tsconfig.lib.json`) nem na mutação (`mutate` da Stryker), mas contam na cobertura; o lint do motor proíbe importá-los fora dos specs (`no-restricted-imports`, com caso no teste de conformidade) | 1 |
| `math/` | `log` (`log.ts`) e `exp` (`exp.ts`), ports do fdlibm 5.3 que dá os mesmos bits em todo motor JavaScript ([ADR-0014](../adr/0014-log-e-exp-proprios-no-motor.md)); bits altos e baixos de um `double` (`float-words.ts`) | 2 |
| `tests/fixtures/` | Casos de referência de `log` e `exp` (`fdlibm-cases.ts`, gerado; tipos em `fdlibm-case.ts`); ver "Casos de referência de `log` e `exp`" | 2 |
| `rng/` | Gerador MRG32k3a (`mrg32k3a.ts`), saltos por potência de matriz (`jump.ts`), índice da sequência por chave (`stream-index.ts`) | 1 |
| `distributions/` | `Variability` e `drawTimeSec` (`variability.ts`); quantis da exponencial (`exponential.ts`), da triangular (`triangular.ts`) e da normal truncada (`truncated-normal.ts`, com `truncationMass` desde o 4); quantil, função de distribuição e cauda superior da normal padrão (`normal.ts`) | 1 |
| `collections/` | `itemAt`, leitura de vetor que lança defeito fora do tamanho (o `noUncheckedIndexedAccess` tipa a leitura como `T \| undefined`, e escrever fora de um vetor tipado é ignorado em silêncio) | 4 |
| `model/` | `compilePlant` (`compile-plant.ts`), `CompiledPlant` e `CompiledElement` (`compiled-plant.ts`), `toVariability` (`to-variability.ts`) | 4 |
| `events/` | A lista de eventos (`event-queue.ts`) | 4 |
| `replication/` | `simulateReplication` (`simulate-replication.ts`), `chooseInput` (`choose-input.ts`), os tipos do resultado (`replication-result.ts`) e das opções (`run-options.ts`) | 4 |
| `stats/` | Valor ponderado pelo tempo (`time-weighted.ts`) e séries por fatia (`series.ts`) | 4 |

O `src/index.ts` é a API pública: hoje só `SimulationError` e os tipos que aparecem nele (`SimulationErrorCode`, `SimulationErrorDetails`, `SimulationLimit`, `RunIssue`, `RunIssueCode`). O resto é interno; a função pública `run`, com `RunOptions`, é do sub-plano 6.

## Erros

- **Erro esperado:** `SimulationError<C>`, com `code` literal, `details` tipados pelo código (`SimulationErrorDetails[C]`) e `name = 'SimulationError'`. `SIMULATION_LIMIT_EXCEEDED` traz `{ limit }` (`'elementCount'`, `'durationSec'` ou `'eventCount'`); `INVALID_PLANT` traz `{ issues }`, a lista `{ elementId?, path, code }` das [regras](../product/rules/README.md), com os códigos de execução `EMPTY_TRUNCATION` e `STREAM_COLLISION` (o 6 acrescenta os do modo). A mensagem é interna, para o log, e só leva IDs, que o esquema restringe a ASCII.
- **Defeito:** qualquer outro erro, sem `code` (ADR-0013).
- **Teste:** em código síncrono, `catchError(fn)` devolve o erro lançado e falha se nada for lançado; `fn` tem tipo `() => void`, e a regra `no-misused-promises` do typescript-eslint recusa no lint uma função assíncrona; em código assíncrono, `await expect(promise).rejects.toMatchObject({ code })`.
- **Conferência do ADR-0013 ("Em aberto"), feita em 04/11/2026 com o Vitest 5.0.5:** `toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error`, e um `code` diferente falha. Testes em `src/errors/simulation-error.spec.ts`: `toMatchObject checks the code of a simulation error`, `toMatchObject fails on a different code` e `rejects.toMatchObject checks the code of a rejected simulation error`. Pelos critérios da skill de registros, isso confirma o ADR-0013 e não pede registro novo.

## Gerador

**MRG32k3a** (L'Ecuyer 1999; L'Ecuyer et al. 2002), escrito a partir do artigo, sem código copiado do RngStreams.

- **Constantes:** m1 = 4294967087, m2 = 4294944443, a12 = 1403580, a13n = 810728, a21 = 527612, a23n = 1370589, norm = 1 / (m1 + 1). Estado inicial do pacote: 12345 nos seis valores.
- **Sequências e subsequências:** `findStreamStart(índice)` salta `índice · 2¹²⁷` passos a partir do estado do pacote, uma vez por chave, e lança `RangeError` com índice fora de 0 a 2⁶⁴ − 1; `createRandomStream(início, replicação)` salta `replicação · 2⁷⁶` passos e lança `RangeError` (defeito) com replicação negativa, que daria em silêncio a mesma subsequência da replicação 0, ou a partir de 2⁵¹ (2¹²⁷ / 2⁷⁶ subsequências por sequência), que cairia em silêncio na sequência seguinte. Os saltos usam matrizes 3 × 3 módulo m em `bigint` (`jump.ts`), só na preparação: desde o sub-plano 4, as tabelas de A^(2^k) (k de 0 a 63 para as sequências, de 0 a 50 para as subsequências, nos dois componentes) são calculadas uma vez ao carregar o módulo (`powerOfTwoTable`), e cada salto só aplica matriz × vetor para cada bit ligado do número de passos (`applyPowerTable`). **Medição** (26/11/2026, Node 24.22.2, WSL na máquina do fundador, script temporário fora do repositório): `findStreamStart` para 1000 índices levava de 222 a 376 ms (3 rodadas) e passou a levar de 30 a 158 ms (8 rodadas, mediana de cerca de 40 ms); `createRandomStream` para 1000 chaves × 30 replicações, de 489 a 617 ms para de 150 a 368 ms (mediana de cerca de 180 ms). A variação entre rodadas é grande, mas o pior depois fica abaixo do melhor antes. Os estados de 2⁶⁴ − 1 (sequência) e 2⁵¹ − 1 (replicação), gerados pelo script abaixo com esses índices no laço final, fixaram o resultado antes da troca. O `jump.spec.ts` testa a potência e o produto com módulo 7 e entradas entre 2 e 6: com 0 ou 1 nos dados, trocar `*` por `/` não muda o resultado e o mutante sobrevive.
- **Geração:** `nextUniform` usa `number`; o invariante abaixo de 2⁵³ é o único comentário do gerador além da fonte, por decisão do usuário de 05/11/2026 (comentário de invariante só quando a correção depende dele; o outro do motor é a ordem dos coeficientes em `normal.ts`, do maior grau para o menor, da qual depende o Horner). Todos os produtos ficam abaixo de 2⁵³ (o maior, a12 · s, é cerca de 6,0×10¹⁵), por isso a conta é exata e igual em qualquer motor JavaScript; só a multiplicação final por `norm` é arredondada, e é a mesma operação do pacote de referência. A saída fica estritamente em (0, 1): com p₁ ≤ p₂ soma-se m1, então p₁ = p₂ dá m1 · norm, não 0.
- **Mutantes equivalentes conhecidos:** a mensagem do `RangeError` da tabela de saltos (`applyPowerTable`, que desde o sub-plano 4 é quem recusa o índice e a replicação fora da faixa) trocada por texto vazio sobrevive, porque os testes nunca verificam mensagens; e trocar `p1 < 0` por `p1 <= 0` grava m1 em vez de 0 no estado, mas toda conta seguinte é módulo m1, onde os dois valem o mesmo; nenhum número sorteado muda.

### Dados de referência

- **Arquivo oficial:** `tests/test2RngStream.res` da [versão Apache 2.0 do RngStreams](https://github.com/umontreal-simul/RngStreams) (commit `b47f576`, lido em 04/11/2026), gerado pelo segundo caso de `tests/testRngStream.cpp`. Usados nos testes: os estados iniciais de `g1`, `g2` e `g3` (sequências 0, 1 e 2), os 5 primeiros valores de `g3` na subsequência inicial e na quarta seguinte (replicações 0 e 4) e a soma "dos 100 primeiros valores de `g3`" (53,98590159232), que na verdade são os valores 2 a 101 da sequência 2, porque o programa sorteia um valor de `g3` antes.
- **Fora dos testes,** porque a API não os expõe: o salto arbitrário de 2⁵ + 3 passos, a precisão aumentada (`IncreasedPrecis`), os valores antitéticos, a semente do pacote diferente de 12345 e o salto para trás; também as somas de 100 000 valores, que usam a precisão aumentada ou valores antitéticos.
- **Valores exatos:** o arquivo imprime 13 algarismos. Os testes comparam com igualdade exata contra o script abaixo (Python 3.10.12, inteiros de precisão arbitrária), que reproduz o arquivo nos 13 algarismos e também dá o índice alto 2⁶³ + 5 (replicações 0 e 7), conferido por um caminho independente do código do motor. Para rodar: `python3 -I mrg32k3a_reference.py`.

```python
import sys

M1, M2 = 4294967087, 4294944443
A12, A13N, A21, A23N = 1403580, 810728, 527612, 1370589
A1 = [[0, 1, 0], [0, 0, 1], [(-A13N) % M1, A12, 0]]
A2 = [[0, 1, 0], [0, 0, 1], [(-A23N) % M2, 0, A21]]


def mul(a, b, m):
    return [[sum(a[i][k] * b[k][j] for k in range(3)) % m for j in range(3)] for i in range(3)]


def power(a, e, m):
    result = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    while e:
        if e & 1:
            result = mul(result, a, m)
        a = mul(a, a, m)
        e >>= 1
    return result


def apply(a, v, m):
    return [sum(a[i][k] * v[k] for k in range(3)) % m for i in range(3)]


def state(stream, replication):
    s1 = apply(power(A1, stream * 2**127 + replication * 2**76, M1), [12345] * 3, M1)
    s2 = apply(power(A2, stream * 2**127 + replication * 2**76, M2), [12345] * 3, M2)
    return s1 + s2


def uniforms(s, count):
    s = list(s)
    out = []
    for _ in range(count):
        p1 = (A12 * s[1] - A13N * s[0]) % M1
        s[0], s[1], s[2] = s[1], s[2], p1
        p2 = (A21 * s[5] - A23N * s[3]) % M2
        s[3], s[4], s[5] = s[4], s[5], p2
        out.append(((p1 - p2) if p1 > p2 else (p1 - p2 + M1)) * (1.0 / (M1 + 1)))
    return out


for stream, replication in [(1, 0), (2, 0), (2, 4), (2**63 + 5, 0), (2**63 + 5, 7)]:
    s = state(stream, replication)
    print(stream, replication, s, [repr(u) for u in uniforms(s, 5)])
print("m1*norm", repr(M1 * (1.0 / (M1 + 1))))

total = 0.0
for u in uniforms(state(2, 0), 101)[1:]:
    total += u
print("sum of values 2..101 of stream 2", repr(total))
```

## Índice da sequência

- **Regra:** a sequência de uma chave é a de número **FNV-1a de 64 bits de `<semente>:<chave>`**, com a chave no formato `<id do elemento>:<propósito>` (decisão do usuário de 04/11/2026; o porquê está no plano do sub-plano 1). `findStreamIndex(semente, chave)` dá o número; `assignStreamIndices(semente, chaves)` dá o de cada chave de uma execução. Renomear o ID de um elemento muda os sorteios dele.
- **FNV-1a:** `fnv1a64(texto)`, um byte por caractere, multiplicação módulo 2⁶⁴ em `bigint` (`BigInt.asUintN`). Constantes da [RFC 9923](https://www.rfc-editor.org/rfc/rfc9923) (fev. 2026, o *draft* do IETF citado no plano virou RFC): base de deslocamento `0xCBF29CE484222325` e primo `0x100000001B3`.
- **Só ASCII:** cada caractere vira exatamente um byte, sem `TextEncoder` (ausente no `lib` do motor). Um caractere fora do ASCII lança `RangeError`: é defeito, porque o esquema (sub-plano 3) define o formato dos IDs.
- **Colisões:** **estimativa:** com 10⁴ chaves sem intenção, a chance de duas coincidirem é da ordem de (10⁴)² / 2⁶⁵ ≈ 3×10⁻¹². O FNV-1a não resiste a colisões fabricadas, e plantas podem ser importadas; por isso dois índices iguais, chave repetida inclusive, lançam `SimulationError('INVALID_PLANT')`, um erro da entrada e não defeito; a mensagem do log cita as duas chaves.
- **Dados de teste:** os seis vetores de 64 bits da seção 8.3 da RFC (`""`, `"a"` e `"foobar"`, com e sem o byte NUL final, de `FNV64svalues` e `FNV64bvalues`); o vetor com bytes fora do ASCII (`"Hello!\x01\xFF\xED"`) fica de fora, porque a função os recusa. Os demais literais (o caractere `\x7f` e as chaves `42:m1:cycle` e `42:m1:failure`) vêm do script abaixo, que reproduz antes os seis vetores da RFC. Para rodar: `python3 -I fnv_reference.py`.
- **Mutantes equivalentes conhecidos:** as mensagens do `RangeError` e do `SimulationError` trocadas por texto vazio sobrevivem, porque os testes nunca verificam mensagens.

```python
OFFSET_BASIS = 0xCBF29CE484222325
PRIME = 0x00000100000001B3


def fnv1a64(data: bytes) -> int:
    h = OFFSET_BASIS
    for octet in data:
        h ^= octet
        h = (h * PRIME) % 2**64
    return h


rfc = {b"": 0xcbf29ce484222325, b"a": 0xaf63dc4c8601ec8c, b"foobar": 0x85944171f73967e8,
       b"\0": 0xaf63bd4c8601b7df, b"a\0": 0x089be207b544f1e4, b"foobar\0": 0x34531ca7168b8f38}
assert all(fnv1a64(k) == v for k, v in rfc.items()), "RFC 9923 vectors"
for text in ["\x7f", "42:m1:cycle", "42:m1:failure"]:
    print(repr(text), fnv1a64(text.encode("ascii")))
```

## Distribuições

Método da inversão: cada amostra é a inversa da função de distribuição aplicada a **um único** número uniforme (ADR-0011, item 6), o que mantém o pareamento dos números aleatórios comuns entre cenários (RN-SIM-010).

- **Tipo interno:** `Variability`, com `kind` e tempos em segundos: `fixed` (`valueSec`), `exponential` (`meanSec`), `triangular` (`minSec`, `modeSec`, `maxSec`), `truncatedNormal` (`meanSec`, `standardDeviationSec`, `minSec`, `maxSec`, com `maxSec` podendo ser `Infinity`). O esquema da planta (sub-plano 3) tem outro formato; a compilação (sub-plano 4) converte um no outro.
- **`drawTimeSec(variabilidade, sequência)`:** `switch` exaustivo sobre `kind`, sem `default`. A fixa **não consome** número aleatório; as demais consomem exatamente um. Os testes conferem o estado da sequência depois do sorteio.
- **Exponencial:** `−média · ln(1 − u)`, com o `log` próprio de `src/math/` (ADR-0014), igual em todo motor JavaScript. Os testes da inversa usam `toBeCloseTo` com 12 casas, escritos antes da troca, quando ela usava `Math.log`.
- **Triangular:** fórmula fechada por partes, `mín + √(u · (máx − mín) · (moda − mín))` até u = (moda − mín) / (máx − mín), e `máx − √((1 − u) · (máx − mín) · (máx − moda))` acima. Só usa `Math.sqrt`, que a especificação manda arredondar corretamente: o resultado é igual em todo motor, e os testes da inversa comparam com igualdade exata, com valores de u e parâmetros escolhidos para dar raízes exatas, inclusive a moda nos dois extremos.
- **Mutante equivalente na prática:** trocar `u <=` por `u <` na triangular. Na fronteira os dois ramos dão a moda em aritmética exata; só o arredondamento poderia separá-los, e só com u exatamente igual à fração da moda.

### Momentos

Com a sequência 0, replicação 0 e 10⁵ amostras, a média e a variância amostrais (divisor n − 1) ficam dentro do intervalo de confiança de 95% dos valores teóricos ([simulation.md](../product/simulation.md); ADR-0009). Os limites estão nos testes como literais: valor teórico ± 1,96 erros-padrão, arredondados para fora.

| Distribuição | Média teórica | Limites da média | Variância teórica | Limites da variância | Média e variância obtidas (z) |
| --- | --- | --- | --- | --- | --- |
| Exponencial, média 30 | 30 | 29,814 a 30,186 | 900 | 884,22 a 915,78 | 29,9346 (−0,69); 896,40 (−0,45) |
| Triangular (20, 25, 35) | 80/3 | 26,6473 a 26,686 | 175/18 | 9,6509 a 9,7936 | 26,6624 (−0,43); 9,6689 (−1,47) |

- **Erro-padrão da média:** √(σ² / n).
- **Erro-padrão da variância:** √((μ₄ − σ⁴) / n), a aproximação de amostra grande; μ₄ é o 4º momento central. **Cálculo próprio:** exponencial, μ₄ = 9θ⁴ (conferido por integração numérica: 8,9999999998·θ⁴); triangular (20, 25, 35), μ₄ = 6125/27, isto é 12/5·σ⁴ (curtose em excesso −3/5), por integração exata da densidade por partes com frações.
- **Script:** acrescentado ao script do gerador (seção "Gerador"), no lugar do laço final; reproduz a tabela acima.

```python
import math
from fractions import Fraction as F


def poly_int(coeffs, lo, hi):
    return sum(c * (hi ** (k + 1) - lo ** (k + 1)) / (k + 1) for k, c in enumerate(coeffs))


def poly_mul(p, q):
    r = [F(0)] * (len(p) + len(q) - 1)
    for i, x in enumerate(p):
        for j, y in enumerate(q):
            r[i + j] += x * y
    return r


def tri_central(a, b, c, k, mean):
    a, b, c = F(a), F(b), F(c)
    left = [-2 * a / ((c - a) * (b - a)), 2 / ((c - a) * (b - a))]
    right = [2 * c / ((c - a) * (c - b)), -2 / ((c - a) * (c - b))]
    dev = [F(1)]
    for _ in range(k):
        dev = poly_mul(dev, [-mean, F(1)])
    return poly_int(poly_mul(dev, left), a, b) + poly_int(poly_mul(dev, right), b, c)


a, b, c = 20, 25, 35
mean = tri_central(a, b, c, 1, F(0))
var = tri_central(a, b, c, 2, mean)
mu4 = tri_central(a, b, c, 4, mean)
print("triangular", mean, var, mu4, mu4 / var**2)


def inv_exp(u):
    return -30.0 * math.log(1.0 - u)


def inv_tri(u):
    if u <= (b - a) / (c - a):
        return a + math.sqrt(u * (c - a) * (b - a))
    return c - math.sqrt((1 - u) * (c - a) * (c - b))


n = 100_000
us = uniforms(state(0, 0), n)
for name, f, m, v, m4 in [("exp", inv_exp, 30.0, 900.0, 9 * 30.0**4),
                          ("tri", inv_tri, float(mean), float(var), float(mu4))]:
    xs = [f(u) for u in us]
    sm = sum(xs) / n
    sv = sum((x - sm) ** 2 for x in xs) / (n - 1)
    se_m, se_v = math.sqrt(v / n), math.sqrt((m4 - v * v) / n)
    print(name, sm, (sm - m) / se_m, m - 1.96 * se_m, m + 1.96 * se_m,
          sv, (sv - v) / se_v, v - 1.96 * se_v, v + 1.96 * se_v)
```

### Normal truncada

`truncatedNormalQuantile(u, média, desvio, mínimo, máximo)`, com `maxSec` podendo ser `Infinity`. Com o intervalo padronizado [a, b], a = (mínimo − média)/desvio:

- **a ≥ 0** (o intervalo inteiro na média ou acima dela): trabalha com a cauda superior, p = Q(a) − u·(Q(a) − Q(b)) e z = −Φ⁻¹(p). Assim, um intervalo longe na cauda não perde os algarismos que 1 − Φ perderia. O plano dizia "acima de 0"; a = 0 entrou no mesmo ramo sem custo (o teste com u = 0,999999999 cobre o caso).
- **Limite de precisão conhecido (medido):** no outro ramo, com u perto de 1, p fica perto de 1 e 1 − p perde algarismos. Com o maior uniforme do gerador (1 − 2,3×10⁻¹⁰), o erro é de 1,5×10⁻¹⁰ desvios-padrão no caso realista (média 30, desvio 5, mínimo 0) e chega a 7,3×10⁻⁸ quando o intervalo começa logo abaixo da média (a = −10⁻⁹). Invisível no produto, pelo mesmo critério da decisão sobre Hart; o sub-plano 4 reavalia, junto com guardar Φ(a) e Φ(b) na compilação, se um terceiro ramo (escolher a cauda pelo lado em que p < 0,5) vale o código.
- **Senão:** p = Φ(a) + u·(Φ(b) − Φ(a)) e z = Φ⁻¹(p). Os dois ramos são crescentes em u.
- **Resultado** = média + desvio·z, **limitado a [mínimo, máximo]**: o arredondamento nunca põe um tempo fora do intervalo. **Probabilidade zero em dupla precisão** (por exemplo [40, 41] ou [40, ∞) desvios; o Hart dá 0 a partir de 37): a área calculada é 0 e a função devolve a **borda mais próxima da média** (o mínimo no ramo da cauda superior, o máximo no outro), que é onde a massa de uma normal cortada longe na cauda se concentra. Antes da revisão final, o ±∞ do Φ⁻¹ ia para o limite: [40, 41] dava 41, a borda errada, e [40, ∞) dava `Infinity`, um tempo infinito no laço de eventos (corrigido em 06/11/2026, com teste). Desde o sub-plano 4, a compilação recusa esse caso com `INVALID_PLANT` (`EMPTY_TRUNCATION`), por `truncationMass(média, desvio, mínimo, máximo)`, a área que o sorteio reescala, com as mesmas funções (`normalSurvival`, `normalCdf`) e o mesmo ramo (`a ≥ 0`) do sorteio, para as duas contas não divergirem se o Hart for trocado. O sorteio não chama `truncationMass`: calcularia Φ três vezes em vez de duas.

### Φ⁻¹: AS 241 (Wichura 1988)

- `normalQuantile(p)`, o PPND16, com as três regiões do artigo (|q| ≤ 0,425; r ≤ 5; r > 5). Escrito a partir do artigo ([PDF](https://csg.sph.umich.edu/abecasis/gas_power_calculator/algorithm-as-241-the-percentage-points-of-the-normal-distribution.pdf)).
- **Coeficientes:** os 52 do artigo, conferidos pelas três somas de conferência (*hash sums*) que o próprio artigo imprime. No código, cada coeficiente é o menor decimal que dá o mesmo `double` que o valor de 20 algarismos do artigo, porque o lint (`no-loss-of-precision`) recusa literais com mais algarismos do que um `double` guarda; a equivalência foi conferida coeficiente a coeficiente por script.
- **Fora de (0, 1):** p ≤ 0 dá −∞ e p ≥ 1 dá +∞, os limites matemáticos. O artigo devolve 0 com um indicador de falha; aqui, ±∞ é o limite matemático; a normal truncada não chega a chamar Φ⁻¹ com área 0 (devolve a borda antes).
- **Testes:** os três dados de teste do artigo (z₀,₂₅, z₀,₀₀₁ e z₁₀⁻²⁰; o literal de z₁₀⁻²⁰ é −9,262340089798409, o mesmo `double` que o −9,262 340 089 798 408 impresso) e pontos nas três regiões e perto de 0 e de 1 (10⁻¹⁰ e 1 − 10⁻¹⁰), contra o `statistics.NormalDist().inv_cdf` do Python 3.10.12, que implementa o mesmo AS 241: as duas implementações deram resultados bit a bit iguais em ~1300 pontos de 10⁻²⁹⁹ a 1 − 10⁻¹⁵. Tolerância: 13 casas.
- Dois dos três dados do artigo diferem do resultado em `double` no último algarismo (≈ 3×10⁻¹⁶): o artigo foi calculado num IBM 3081, em base 16. Fica dentro dos "about 16 figures" que ele declara.

### Φ e Q: Hart (1968), na forma de West (2005)

- `normalCdf(x)` e `normalSurvival(x)` = Φ(−x), pelo algoritmo da Figura 2 de West, ["Better approximations to cumulative normal functions"](https://s2.smu.edu/~aleskovs/emis/sqc2/accuratecumnorm.pdf): função racional para |x| < 7,07106781186547, fração contínua com 4 termos acima, e 0 para |x| > 37. A cauda é sempre calculada direto (Φ para x ≤ 0, Q para x ≥ 0), sem 1 − Φ.
- **Precisão medida (fato):** West afirma "accurate to double precision throughout the real line", mas isso só vale para o erro **absoluto**. O erro **relativo**, medido em `double` contra Q com 100 algarismos (conferido contra Φ(−1) conhecido e contra o `erfc` da glibc), é:

| \|x\| | Erro relativo de Φ(−\|x\|) |
| --- | --- |
| até 3 | ≤ 1,5×10⁻¹⁴ |
| 4 | 1,2×10⁻¹³ |
| 5 | 4,6×10⁻¹¹ |
| 7 | 2,6×10⁻⁹ |
| 8 | 8,7×10⁻⁹ (o pior) |
| 10 | 3,2×10⁻⁹ |
| 37 | 9,2×10⁻¹⁴ |

  Marsaglia (2004) chega à mesma conclusão sobre Hart ("would taper off to about 9 digits at x = 12").
- **Efeito no produto: nenhum visível.** Numa normal truncada com o intervalo inteiro em [8, 9] desvios, o tempo sorteado erra ~10⁻⁹ desvios-padrão (medido); perto da média, ~10⁻¹⁶. Com o caso realista (por exemplo, média 30 s, desvio 1 s, mínimo 0), o corte fica em −30 desvios e o erro some.
- **Decisão do usuário (05/11/2026):** manter Hart, publicado e simples, em vez de uma combinação própria mais precisa. A alternativa estudada (Marsaglia 2004 para |x| < 5 e a fração contínua de Laplace com 40 termos acima, erro relativo ≤ 3,7×10⁻¹⁴ medido) está em [Precisão da função de distribuição da normal](../research/precisao-da-normal.md), para o dia em que o motor precisar de Φ na cauda com erro relativo pequeno (por exemplo, um p-valor extremo).
- **Tolerâncias dos testes** (das medições, com folga): 10⁻¹³ até |x| = 3, 10⁻¹² em 4, 10⁻¹⁰ em 5 e 2×10⁻⁸ de 8 a 10 (erro relativo, pelo auxiliar `relativeError`); 10⁻¹² em 37; Φ(−37,5) = 0, o corte publicado (o valor verdadeiro é 4,6×10⁻³⁰⁸). Normal truncada: 14 casas onde a cauda superior é calculada direto ([−1, 1], [0, ∞) com u = 0,5 e com u = 0,999999999, este a 6,1 desvios) e 8 casas nos intervalos inteiros longe na cauda ([8, 9], [9, 10], [−9, −8]), onde o erro relativo de Hart pesa.

### Momentos da normal truncada

Normal com média 10 e desvio 1, truncada em [9, 11] (a padrão em [−1, 1]), sequência 0, replicação 0, 10⁵ amostras: média 9,99951 (z = −0,29) e variância 0,28984 (z = −1,44), dentro do IC de 95%. **Cálculo próprio:** variância 1 − 2φ(1)/(Φ(1) − Φ(−1)) = 0,291125094772793 e 4º momento central 3·variância − 2φ(1)/(Φ(1) − Φ(−1)) = 0,164500379091173 (por integração por partes; conferido por integração numérica, 0,164500379091170). Limites nos testes: média de 9,99665 a 10,00335; variância de 0,28937 a 0,29288.

### Funções matemáticas usadas

| Função | Onde | Igual em todo motor? |
| --- | --- | --- |
| `Math.sqrt` | triangular; AS 241 (caudas) | Sim: a especificação exige arredondamento correto |
| `log` (`src/math/log.ts`) | exponencial; AS 241 (caudas) | Sim: port do fdlibm só com as quatro operações (ADR-0014) |
| `exp` (`src/math/exp.ts`) | Hart (Φ e Q) | Sim: port do fdlibm só com as quatro operações (ADR-0014) |

Até o sub-plano 2 eram `Math.log` e `Math.exp`, que dão bits diferentes por navegador ([medição](../research/precisao-de-log-e-exp.md)). A troca não mudou nenhum valor esperado dos testes nem os exemplos dos JSDoc: nesses casos, o `Math.log` do Node 24 já era o fdlibm, e o `Math.exp` só difere dele em `exp(1)`. O lint do motor recusa as funções aproximadas de `Math` e `**` sobre `number` (ver "`log` e `exp` próprios"); o `2 ** 51` do gerador virou `Number(2n ** 51n)`, uma potência de `bigint`, exata.

### Mutantes equivalentes da normal

- No `evaluatePolynomial`, trocar `+ coefficient` por `- coefficient` inverte o sinal de todo polinômio; numerador e denominador passam pela mesma função, e a razão não muda.
- Fronteiras em que os dois lados dão o mesmo resultado ou valem igualmente: |q| = 0,425 e r = 5 no AS 241; x = 7,07106781186547 no Hart; `x >= 0` em Φ (em 0 os dois lados dão 0,5).
- `q <= 0` nos dois lugares do ramo das caudas do AS 241: ali |q| > 0,425, então q nunca é 0.

### Script de referência da normal

Gera todos os literais dos testes da normal, inclusive Q (pela simetria Q(x) = Φ(−x)) e a linha [−9, −8] da truncada (Python 3.10.12, `decimal` com 100 algarismos; Q por série até |x| = 5 e pela fração contínua de Laplace, Abramowitz e Stegun 26.2.14, acima). Para rodar: `python3 -I normal_reference.py`.

```python
import math
from decimal import Decimal as D, getcontext
from statistics import NormalDist

getcontext().prec = 100
PI = D("3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117068")

# Wichura (1988): the article's hash sums check the transcription of the coefficients in normal.ts
AB = "3.3871328727963666080 1.3314166789178437745 1.9715909503065514427 1.3731693765509461125 4.5921953931549871457 6.7265770927008700853 3.3430575583588128105 2.5090809287301226727 4.2313330701600911252 6.8718700749205790830 5.3941960214247511077 2.1213794301586595867 3.9307895800092710610 2.8729085735721942674 5.2264952788528545610"
CD = "1.42343711074968357734 4.63033784615654529590 5.76949722146069140550 3.64784832476320460504 1.27045825245236838258 2.41780725177450611770 2.27238449892691845833 7.74545014278341407640 2.05319162663775882187 1.67638483018380384940 6.89767334985100004550 1.48103976427480074590 1.51986665636164571966 5.47593808499534494600 1.05075007164441684324"
EF = "6.65790464350110377720 5.46378491116411436990 1.78482653991729133580 2.96560571828504891230 2.65321895265761230930 1.24266094738807843860 2.71155556874348757815 2.01033439929228813265 5.99832206555887937690 1.36929880922735805310 1.48753612908506148525 7.86869131145613259100 1.84631831751005468180 1.42151175831644588870 2.04426310338993978564"
for name, mantissas, printed in [("AB", AB, "55.8831928806149014439"), ("CD", CD, "49.33206503301610289036"), ("EF", EF, "47.52583317549289671629")]:
    print("hash", name, sum(D(m) for m in mantissas.split()) == D(printed))


def density(x):
    return (-(x * x) / 2).exp() / (2 * PI).sqrt()


def upper(x):  # Q(x) at 100 digits: erf series for |x| < 5, Laplace continued fraction (A&S 26.2.14) beyond
    x = D(x)
    if x <= -5:
        return 1 - upper(-x)
    if x >= 5:
        acc = x
        for k in range(3000, 0, -1):
            acc = x + D(k) / acc
        return density(x) / acc
    z, term, total, n = x / D(2).sqrt(), None, None, 0
    term = total = z
    while abs(term) > D(10) ** -110:
        n += 1
        term = term * (-z * z) / n
        total += term / (2 * n + 1)
    return (1 - 2 / PI.sqrt() * total) / 2


def lower(x):
    return upper(-D(x))


def inverse(target, from_above):  # Newton at 100 digits: Q(z) = target or Phi(z) = target
    t = D(target)
    z = D(-NormalDist().inv_cdf(float(t)) if from_above else NormalDist().inv_cdf(float(t)))
    for _ in range(8):
        step = ((upper(z) if from_above else lower(z)) - t) / density(z)
        z = z + step if from_above else z - step
    return z


def truncated(u, a, b):  # standard normal truncated to [a, b], at the uniform u
    u = D(u)
    if a >= 0:
        qa, qb = upper(a), (upper(b) if b != math.inf else D(0))
        return inverse(qa - u * (qa - qb), True)
    pa, pb = lower(a), (lower(b) if b != math.inf else D(1))
    return inverse(pa + u * (pb - pa), False)


print("quantiles", [repr(NormalDist().inv_cdf(p)) for p in (0.975, 1e-10, 1 - 1e-10)])
print("Phi", ["%.17g" % float(lower(x)) for x in (-37, -10, -8, -5, -4, -3, -1, 1, 3)])
print("Q", ["%.17g" % float(upper(x)) for x in (1, 4, 8, 10)])
print("truncated", ["%.17g" % float(truncated(u, a, b)) for u, a, b in
                    [(0.3, -1, 1), (0.5, 0, math.inf), (0.999999999, 0, math.inf), (0.5, 8, 9), (0.1, 8, 9), (0.5, 9, 10), (0.5, -9, -8)]])
print("one draw, mean 30, sd 5, [0, 40], u = 0.7285097861965271:", "%.17g" % float(30 + 5 * truncated(0.7285097861965271, -6, 2)))
mass = lower(1) - lower(-1)
var = 1 - 2 * density(D(1)) / mass
print("[-1, 1]: variance", "%.15g" % float(var))
mu4 = 3 * var - 2 * density(D(1)) / mass
print("[-1, 1]: fourth central moment", "%.15g" % float(mu4), "(Simpson gave 0.164500379091170)")
n = 100_000
se_mean, se_var = (float(var) / n) ** 0.5, ((float(mu4) - float(var) ** 2) / n) ** 0.5
print("bounds: mean 10 +-", 1.96 * se_mean, "variance", float(var) - 1.96 * se_var, float(var) + 1.96 * se_var)
```

## Compilação da planta (sub-plano 4)

`compilePlant(plant, scenarioId, options)` recebe uma planta já aceita pelo `validatePlant` (o motor não revalida) e devolve `CompiledPlant { durationSec, elements }`, nesta ordem:

1. **Teto de elementos:** mais elementos que `limits.elementCount` → `SIMULATION_LIMIT_EXCEEDED` (`limit: 'elementCount'`), antes de qualquer outra conta (UC-SIM-002, 2a).
2. **Cenário:** `scenarioId` inexistente é defeito de quem chama; modo diferente de `shift` é defeito até o sub-plano 6.
3. **Cenário aplicado** pelo `applyScenario` do esquema, importado de `@takt/plant-schema/apply-scenario` ([ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md)): cada sobreposição troca o valor inteiro do campo, sem mesclagem, o que fecha a poluição de protótipo (ADR-0008). Teste de defesa em profundidade: uma sobreposição com `__proto__` (montada por `withUncheckedOverride`, porque o modo estrito do esquema recusa a chave) não muda o `Object.prototype`.
4. **Teto de duração:** `durationH × 3600` acima de `limits.durationSec` → `SIMULATION_LIMIT_EXCEEDED` (`limit: 'durationSec'`).
5. **Normais truncadas sem probabilidade:** um `EMPTY_TRUNCATION` por distribuição (caminho na planta aplicada, por exemplo `['elements', 1, 'params', 'cycle']`), todos num só `INVALID_PLANT`.
6. **Sequências:** chaves `<id>:interarrival` (fonte) e `<id>:cycle` (estação), com a semente do cenário; colisão → `INVALID_PLANT` com `STREAM_COLLISION`.
7. **Elementos**, na ordem do documento, discriminados por `kind`: `source` (`interarrival`, `queueCapacity`, `streamStart`, `outputIndex`), `station` (`cycle`, `streamStart`, `inputIndices`, `outputIndex`), `buffer` (`capacity`, `inputIndices`, `outputIndex`) e `sink` (`inputIndices`). As entradas ficam na ordem das conexões no documento. `TimeDistribution` vira `Variability` por `toVariability` (`dist` → `kind`; `maxSec: null` → `Infinity`).

**Fora do escopo até o sub-plano 5:** esteira, refugo, estação com `defectRate > 0` ou `failure`, e qualquer `routing` diferente de `null` são defeito na compilação. Sem roteamento, todo elemento tem uma saída só; entradas, várias.

## Lista de eventos (sub-plano 4)

`events/event-queue.ts`: um *heap* binário indexado sobre **posições fixas**, uma por evento possível (a próxima chegada de cada fonte e o fim de processamento de cada estação), em vetores tipados (`Float64Array` de tempos e de ordem de agendamento, `Uint8Array` de prioridades, `Int32Array` do *heap* e das posições). Nenhum objeto é criado por evento (guia, seção 7).

- **Ordem** (ADR-0011, item 3; RN-SIM-018): tempo; depois o tipo (`finishProcessing` antes de `arrival`); depois a ordem de agendamento.
- `scheduleSlot(fila, posição, t)` lança **defeito** com tempo não finito (a guarda única contra um sorteio infinito, pendência do sub-plano 1), com posição já agendada (reagendar é do sub-plano 5, que adia o fim de processamento durante o reparo) ou fora da lista. `takeNextSlot` devolve −1 com a lista vazia; `slotTimeSec` lê o tempo de uma posição, que continua lá depois de tirada.
- **Propriedade:** para 200 conjuntos de eventos gerados (tempos inteiros de 0 a 100, para forçar empates), a lista devolve cada evento uma vez, na ordem de uma ordenação estável por (tempo, tipo), o oráculo `sortSlotsByEventOrder`.

## Uma replicação (sub-plano 4)

`simulateReplication(plantaCompilada, replicação, opções)` roda o modo turno sobre [0, T) e devolve `{ replication, indicators, series, finalState, log }`.

- **Laço:** tira o próximo evento enquanto o tempo dele for menor que T; um evento exatamente em T não acontece (RN-SIM-018), então uma saída em T não conta. Cada evento processado soma 1 e, passando de `limits.eventCount`, lança `SIMULATION_LIMIT_EXCEEDED` (`limit: 'eventCount'`).
- **Chegada:** agenda a próxima em t + sorteio; a primeira vem depois do primeiro intervalo, não em 0 (RN-SIM-018). A peça recebe o próximo número, a partir de 1, perdida ou não (o que liga `arrive` e `lose` no log), e entra na fila da fonte; as peças andam; se a fila ficou acima da capacidade, a última sai e conta como perdida (RN-SIM-013). Com fila 0, a chegada passa direto se o destino tem vaga naquele instante.
- **Fim de processamento:** a estação fica com a peça pronta, disponível desde t, e as peças andam. Se o destino não tem vaga, ela fica bloqueada (bloqueio depois do serviço, RN-SIM-014).
- **As peças andam:** os elementos com vaga (estação vazia, buffer abaixo da capacidade, expedição sempre), **na ordem do documento**, puxam de uma entrada; a varredura se repete até uma passada inteira não mover nada. A estação que recebe começa a processar e agenda o fim em t + sorteio. Uma estação pode ficar "bloqueada por 0 s" dentro de um instante: soma 0 s aos estados e aparece no log só como `finish` seguido de `move` no mesmo t.
- **De onde se puxa** (RN-SIM-014 e 018): `chooseInput(entradas, disponívelDesde)` escolhe a entrada cuja peça espera há mais tempo (menor instante de disponibilidade: entrada na fila da fonte ou no buffer, ou fim de processamento numa estação bloqueada), com empate pela ordem das conexões; −1 quando nenhuma tem peça. Lê vetores do estado, sem montar lista de candidatas.
- **Sequências:** `createRandomStream(início, replicação)` por chave; a fixa não consome número.
- **Log** só com `recordLog: true`; senão `log: null`. Eventos: `arrive`, `lose`, `move`, `start`, `finish`, com `tSec` e o número da peça.
- **Estado final:** as peças na linha (elemento e chegada), cada estação (`busy` com o tempo que falta, `blocked` ou `starved`) e a próxima chegada de cada fonte, na ordem do documento e, dentro de cada elemento, na ordem da fila.

## Indicadores e séries (sub-plano 4)

Sobre o turno inteiro [0, T):

| Indicador | Definição |
| --- | --- |
| `throughputPerHour` | Saídas nas expedições × 3600 ÷ T. Igual em matemática a saídas ÷ (T ÷ 3600), mas 300 ÷ 3600 não é exato em dupla precisão, e a planta de 300 s daria um vizinho de 60 |
| `wipAverage` | Peças nas filas das fontes, nos buffers e nas estações (inclusive bloqueadas), média ponderada pelo tempo (RN-SIM-013) |
| `leadTimeAverageSec` | Da chegada à fonte até a expedição, média das peças que saíram; `null` quando nenhuma saiu. As que ficam na linha não contam (o turno corta o tempo delas) |
| `arrivalCount`, `lostArrivalCount`, `exitCount` | Chegadas (perdidas inclusive), perdidas e saídas; `sources` dá chegadas e perdidas por fonte |
| `stations` | Por estação, `busyRatio` (a utilização), `blockedRatio` e `starvedRatio`: três valores 0 ou 1 ponderados pelo tempo, que somam 1 |

- **Média ponderada pelo tempo** (`stats/time-weighted.ts`): o valor guarda desde quando vale e a área acumulada; cada mudança soma valor × duração; a média é a área até T ÷ T. As áreas de durações inteiras são somas exatas, e os testes comparam as razões com igualdade (por exemplo `110 / 300`).
- **Séries** (`stats/series.ts`): fatias de 60 s (`SERIES_SLICE_SEC`) desde 0, a última menor quando T não é múltiplo de 60, cada uma com `startSec`, `endSec`, `exitCount`, `wipAverage` (área do WIP dividida entre as fatias, sobre o comprimento da própria fatia) e `leadTimeAverageSec` das peças que saíram nela, `null` sem saída ([ADR-0015](../adr/0015-cenario-aplicado-e-series-do-motor.md)). Uma saída em t pertence à fatia que contém t.
- **Lei de Little em janela finita (Little 2011, LL.2):** a soma, peça a peça, de min(saída, T) − chegada sobre as chegadas aceitas é igual à área do WIP (`wipAverage × T`). O auxiliar `sumTimeInWindowSec` calcula a soma pelo log; o teste unitário (fonte exponencial de 60 s, duas estações e um buffer, 8 h, semente 42) e a propriedade sobre 100 linhas geradas exigem erro relativo menor que 10⁻⁹.

## Testes do sub-plano 4

- **Plantas de referência** com tempos fixos, valores calculados à mão (`simulate-replication.spec.ts`): a fonte que perde chegadas com a fila cheia (21 perdas, saídas em 60, 110, 160, 210 e 260 s, vazão 60/h, WIP 2,8, lead time 114 s); fila 0; estação bloqueada por outra e por um buffer cheio; junção de duas fontes, com e sem empate; cada regra da RN-SIM-018.
- **Linha em série** com tempos fixos (pesquisa da literatura do motor, Dₙ = a + Σt + (n − 1)·max(a, t_max)): três configurações de 8 h, ligadas direto e com buffers.
- **Propriedades** (`properties.spec.ts`, fast-check 4.10.3, `seed: 42`, `numRuns: 100`, sobre `arbitraryLine`: uma ou duas fontes que se juntam numa estação, de 1 a 4 estações ou buffers, uma expedição, tempos fixos, exponenciais ou triangulares): conservação (chegadas = perdidas + saídas + peças dentro), determinismo (RN-SIM-001: duas execuções com log, `toEqual`) e LL.2.
- **RN-EDT-003:** fonte, estação e expedição com os padrões do editor rodam e entregam peças.
- **Cobertura** (26/11/2026): 100% das instruções (688/688), dos ramos (267/267) e das linhas (674/674) do motor.

## Mutação (sub-plano 4)

Rodada completa em 26/11/2026 (`pnpm nx run sim-engine:mutate`, 28 min, `concurrency: 4`; ver [workspace.md](workspace.md#testes-cobertura-e-mutação)): **92,08%** no motor (787 mortos, 38 por tempo esgotado, 71 sobreviventes), acima do corte de 80%. Ela achou lacunas que as rodadas por arquivo das tarefas não mostraram, todas fechadas no mesmo dia e conferidas por nova rodada dos arquivos:

- **`truncationMass`** só tinha testes que davam 0 ou com média 0 e desvio 1, que não separam `(mínimo − média) / desvio` de outras contas; nem a escolha do ramo pela cauda. Testes novos: média 10 e desvio 2 em [8, 12], e [8, 9] e [−9, −8] desvios com erro relativo menor que 10⁻⁷ contra Q(8) − Q(9) = 6,21983198586583×10⁻¹⁶ (100 algarismos, pela função `upper` do script da normal); no ramo errado, o cancelamento erra cerca de 7%. `truncated-normal.ts`: de 76,92% para 97,44%.
- **`compilePlant`:** nenhum teste compilava um cenário que não fosse o primeiro (teste novo com dois cenários, que confere a duração e a semente do pedido), roteamento numa fonte ou num buffer (duas linhas a mais na tabela de defeitos), nem uma normal truncada **com** probabilidade (com o mutante, toda truncada seria recusada). E a compilação calculava o índice de cada chave duas vezes; agora usa o que o `assignStreamIndices` devolve, lido por `streamIndexOf` (defeito se a chave não foi atribuída), e apagar a atribuição ou esvaziar as chaves quebra os testes. `compile-plant.ts`: de 76,19% para 86,75%, só com mensagens sobrevivendo.
- **`createRandomStream`:** a guarda da replicação fora de 0 a 2⁵¹ − 1 ficou redundante na tarefa 3 (o `applyPowerTable` já lança `RangeError` com um bit além da tabela, inclusive para negativos) e foi removida; os testes de replicação negativa e de 2⁵¹ continuam passando. `mrg32k3a.ts`: de 81,82% para 96,97%.

**Sobreviventes equivalentes dos arquivos do sub-plano 4:**

- Mensagens de erro trocadas por texto vazio (`item-at.ts`, `compile-plant.ts`, `event-queue.ts`, `simulate-replication.ts`, `jump.ts`, `stream-index.ts`): os testes nunca verificam mensagens (ADR-0013).
- `event-queue.ts`, em `comesBefore`: `timeA <= timeB` e `priorityA <= priorityB` estão dentro de um ramo em que os dois valores já são diferentes.
- `event-queue.ts`, em `siftDown`: `left <= queue.size` e `right < queue.size` trocado por `true`. O `siftDown` só desce a posição que saiu do fim do *heap*, então a posição `size` ainda guarda a própria posição que desce, e `comesBefore(x, x)` é falso: o laço para no mesmo lugar.
- `truncated-normal.ts`, `lower >= 0` por `lower > 0`: em a = 0 os dois ramos dão o mesmo valor matemático (Q(0) − Q(b) = Φ(b) − Φ(0)), como o `x >= 0` de Φ.

Os demais sobreviventes são os já registrados nos sub-planos 1 e 2 (gerador, normal, triangular, `log` e `exp`).

## Casos de referência de `log` e `exp` (sub-plano 2)

`src/tests/fixtures/fdlibm-cases.ts` guarda, para cada entrada, o que o fdlibm 5.3 compilado em C dá, o valor corretamente arredondado, todos como bits de `double` em hexadecimal (todo `NaN` é `7ff8000000000000`), e se o caso é "quase difícil" (`nearMidpoint`). É gerado, não editado à mão; fica no `.prettierignore` e fora da cobertura (código gerado, exclusão prevista no ADR-0009). Cada caso passa por uma função tipada (`toCase`), porque milhares de objetos literais com um campo booleano fazem o TypeScript montar uma união complexa demais (TS2590).

- **Entradas** (`measurements/math/make_cases.py`, semente 20261118): valores especiais; 1 ± k·ulp (k de 1 a 50); os dois lados de cada fronteira de ramo do `e_log.c` (normalização em `(hx + 0x95f64) & 0x100000`, sinal de `i | j`, \|f\| < 2⁻²⁰) e do `e_exp.c` (`o_threshold`, `u_threshold`, filtro do expoente, 0,5·ln 2, 1,5·ln 2, 2⁻²⁸, cada um com os dois sinais e os vizinhos); 201 pontos entre −745,2 e −707, onde `k` cruza −1021; amostra espalhada por todos os expoentes; entradas como as do motor (u e 1 − u no `log`; −x²/2 com x em [0, 37] no `exp`); e mil casos **"quase difíceis"** por função: de 10⁶ candidatos sorteados (sementes 20261119 e 20261120; `log` sobre todos os expoentes normais, `exp` em [−708, 709]), os mil cujo resultado exato fica mais perto do meio entre dois `double`, medido pelo `decimal`. São casos inventados, no lugar dos casos difíceis de Lefèvre, que não declaram licença (decisão do usuário, 18/11/2026). Resultado em 18/11/2026: 2683 casos de `log` e 2785 de `exp`; o fdlibm difere do valor corretamente arredondado em 305 e 655, sempre por 1 ulp, o que confirma o "less than 1 ulp" dos dois arquivos. Nos casos "quase difíceis" a diferença é de 26,5% (`log`) e 49,8% (`exp`), contra 2,4% e 8,9% no resto: é ali que uma libm corretamente arredondada e uma que não é se separam. Gerar duas vezes dá o mesmo arquivo, em ~2 min 20 s.
- **Oráculo:** `measurements/math/fdlibm_oracle.c`, que só lê entradas e chama `__ieee754_log` e `__ieee754_exp`. O fdlibm não fica no repositório: `e_log.c` (1.3, 95/01/18), `e_exp.c` (1.6, 04/04/22) e `fdlibm.h`, baixados de `https://netlib.org/fdlibm/` em 18/11/2026 num diretório vazio, com SHA-256 `a2b1bd1b367026a35f36da53425cd618386c3bf69d23ac224a40791aa9855ac9`, `04c96195b7ced914d659b5fd204724c182f091af8631fe42016ad6e27cb302ef` e `64113c472c2676499288bc35a821b0867916552930bc52c7445d2c50dddf0e71`. Compilado com o gcc 11.4.0 do Ubuntu 22.04: `gcc -O0 -ffp-contract=off -fno-strict-aliasing -D__LITTLE_ENDIAN -I <fdlibm> fdlibm_oracle.c <fdlibm>/e_log.c <fdlibm>/e_exp.c -o fdlibm_oracle`. O `-D__LITTLE_ENDIAN` é obrigatório no x86_64: o `fdlibm.h` só o define para i386 e afins, e sem ele `__HI` e `__LO` leem as palavras trocadas. O aviso "`__P` redefined" vem do conflito do `fdlibm.h` com o `sys/cdefs.h` e não muda nada. Conferência antes de usar: log 1 = 0, log 2 e exp 0 iguais ao valor correto; exp 1 dá `4005bf0a8b14576a`, 1 ulp acima do correto (`…5769`).
- **Referência corretamente arredondada:** `decimal` do Python 3.10.12 com 100 algarismos (`ln` e `exp` sobre o valor exato do `double`), convertido com `float`; o `InvalidOperation` de `log` de negativo vira `NaN`, e o `Overflow` de `exp` de um valor enorme (10³⁰⁰ passa do expoente do contexto) vira +∞.
- **Verificações do gerador, antes de gravar:** o oráculo e o `decimal` precisam dar log 1 = 0, log 2 e exp 0 = 1 certos; senão o script para sem tocar no fixture.
- **Regerar:** `python3 -I libs/sim-engine/measurements/math/make_cases.py <fdlibm_oracle> libs/sim-engine/src/tests/fixtures/fdlibm-cases.ts`.
- **Observado de passagem:** o `Math.exp(1)` do Node 24.22.2 (V8 13.6) dá `2.718281828459045`, o valor correto, e não o do fdlibm 5.3; o fdlibm "modificado" do V8 antigo não é idêntico ao original. Por isso nenhum motor serve de oráculo do port, só o C.

## `log` e `exp` próprios (sub-plano 2, [ADR-0014](../adr/0014-log-e-exp-proprios-no-motor.md))

- **Por quê:** `Math.log` e `Math.exp` dão bits diferentes conforme o navegador ([medição](../research/precisao-de-log-e-exp.md)); as funções de `src/math/` usam só as quatro operações e operações de bits, que a especificação obriga a serem iguais em todo motor.
- **`log`** (`log.ts`): port linha a linha de `__ieee754_log` do `e_log.c` do fdlibm 5.3, com o aviso de licença da Sun no topo como comentário legal (`/*! ... */`). As constantes estão na forma decimal mais curta que dá o mesmo `double` dos hexadecimais do arquivo C (conferido em Python), por causa do `no-loss-of-precision`; `0.33333333333333333` do C vira `0.3333333333333333`, o mesmo `double`. Nomes como no C, no formato do lint: constantes `LN2_HI`, `LG1`; locais `hx`, `k`, `f`, `s`, `r`, `hfsq`, `dk`.
- **Lint:** no código do motor (fora dos specs e de `src/tests/`), `no-restricted-properties` recusa `Math.acos`, `acosh`, `asin`, `asinh`, `atan`, `atanh`, `atan2`, `cbrt`, `cos`, `cosh`, `exp`, `expm1`, `hypot`, `log`, `log1p`, `log10`, `log2`, `pow`, `sin`, `sinh`, `tan` e `tanh`, e `no-restricted-syntax` recusa `**` com lado esquerdo que não seja literal `bigint` e `**=`. Como uma regra redefinida substitui a anterior, o bloco do código do motor repete as proibições de não determinismo (constantes compartilhadas no `eslint.config.mjs`). Testes de conformidade: recusa de `Math.log`, `Math.exp`, `Math.pow`, `2 ** 51` e `**=`; aceitação de `Math.sqrt` e `2n ** 127n`; `Math.log` permitido num spec.
- **Entre motores** (18/11/2026, Linux): com as funções próprias, os uniformes, `log`, `exp` e os três sorteios dão os mesmos bits no Node 24, Chromium 158, Firefox 159 e WebKit 27.2, e iguais ao fdlibm em C; o workflow `math-measurement.yml` repete a prova em Ubuntu, macOS e Windows a cada merge que mude o motor, exigindo `uniforms`, `fdlibm.` e `draws.` idênticos.
- **Bits do `double`** (`float-words.ts`): `highWord` (com sinal, como o `int hx` do C), `lowWord` (sem sinal) e `fromWords`, por um `DataView` com ordem de bytes explícita, para dar as mesmas palavras em toda plataforma.
- **Prova:** igual bit a bit ao fdlibm em C nos 2683 casos de `log` do fixture e a no máximo 1 ulp do valor corretamente arredondado; cobertura de 100% dos ramos pelas fronteiras de ramo do fixture.
- **Atalho de \|f\| < 2⁻²⁰:** o `e_log.c` tem um caminho curto para x perto de 1 ou de uma potência de 2. A primeira rodada de mutação mostrou que apagá-lo não mudava nenhum caso do fixture. Uma busca em Python (os dois caminhos reproduzidos com os mesmos `double`, semente 11, até 2·10⁵ palavras baixas por combinação de expoente e mantissa perto da fronteira) achou entradas em que os dois caminhos arredondam diferente, só com k = 0 (x logo acima ou abaixo de 1): `3feffffe37cb539d`, `3feffffe38ee39cc`, `3fefffff2d487e07`, `3fefffff3626a717`, `3ff00000f02b63b3`, `3ff00000ff558342`, `3ff000018081e4fd` e `3ff00001f8f4f410`, que entraram no fixture como casos fixos.
- **Mutantes equivalentes do `log`** (oito, na rodada de 18/11/2026; `log.ts` com 93,10%): trocar `hx < 0x00100000` por `<=` (em 2⁻¹⁰²² o ramo dos subnormais só multiplica por 2⁵⁴ e desconta 54 do expoente, ambos exatos); apagar o atalho de `f === 0` ou trocar o `k === 0` dele por `false` (o caminho seguinte dá o mesmo valor, inclusive o zero positivo); trocar cada `k === 0 ? A : B` das linhas finais por `false` (com k = 0, B vale `0 − (… − f)`, que no IEEE é o mesmo `double` de A, porque negar uma diferença arredondada é exato); e `i > 0` por `i >= 0` (`i` é o OR de dois valores que não se anulam ao mesmo tempo, então nunca vale 0).
- **`exp`** (`exp.ts`): port de `__ieee754_exp` do `e_exp.c` 1.6, pelas mesmas regras do `log`. Duas adaptações, comentadas no código: as tabelas `halF[2]`, `ln2HI[2]` e `ln2LO[2]`, indexadas pelo sinal, viram a escolha do valor com sinal (a negação é exata, os bits são os mesmos, e um índice de vetor seria `number | undefined` com `noUncheckedIndexedAccess`); e o `if (huge + x > one)` do caminho de \|x\| < 2⁻²⁸, sempre verdadeiro, que no C só aciona o sinalizador "inexato", vira o `return 1 + x` direto. A conversão `(int)` do C, que trunca, é `| 0`. Igual bit a bit ao fdlibm nos 2785 casos de `exp`.
- **Atalho de \|x\| < 2⁻²⁸ do `exp`:** aprendida a lição do `log`, os casos que separam o atalho do caminho geral foram procurados antes da mutação (busca em Python, semente 13): o atalho e o caminho geral arredondam diferente em parte das entradas abaixo de 2⁻²⁸ e em ~3% das que têm a palavra alta exatamente em 2⁻²⁸. Doze entradas entraram no fixture: `3e2000002ff7c0fc`, `3e2000006fcfd73d`, `3e201000cffaea0c`, `3e202000efeffc4f`, `3e2030008fbff9ba`, `3e2030006ffd7de0`, `3e205000cff4ffa4`, `3e205000efea1afe`, `3e30000067888144`, `3e30000047e4ee73`, `be300000846503c2` e `be3000005c7809e4`. O caminho especial de 0,5·ln 2 < \|x\| < 1,5·ln 2, ao contrário, dá os mesmos bits que o caminho geral: ali o k geral é sempre ±1 e `x − 1·LN2_HI` é `x − LN2_HI`.
- **Mutação do `exp` e casos acrescentados:** a primeira rodada deixou o `exp.ts` em 87,96%, com quatro lacunas reais: um `NaN` negativo (`fff8…`, que um `exp` sem o filtro de `NaN` levaria a 0); entradas muito abaixo de −745 (sem o limite de *underflow*, a escala do expoente dá a volta e devolve lixo); e as faixas da palavra alta em `0x3fd62e42` (0,5·ln 2) e `0x3ff0a2b2`, que contém o próprio 1,5·ln 2 (acima dele, o caminho especial usa k = 1 e o geral, k = 2). Entraram no fixture o `NaN` negativo (também no `log`), ±1000, ±2⁶⁴ e ±10³⁰⁰, e oito entradas das duas faixas achadas por busca em Python (semente 17), conferida contra o oráculo em C: `3fd62e422335e9e2`, `3fd62e42cd425ec3`, `bfd62e42de27660b`, `bfd62e428e8b88c2`, `3ff0a2b2c0d64421`, `3ff0a2b2f391361a`, `bff0a2b2cf8f95c3` e `bff0a2b2d6c500f4`.
- **Mutantes equivalentes do `exp`** (sete, na rodada de 18/11/2026; `exp.ts` com 93,52%): o filtro de \|x\| ≥ 709,78 trocado por `true` (fora da faixa, as comparações seguintes são falsas e o caminho continua); o filtro de ∞ e `NaN` desligado, apagado ou com `>` (∞ cai nos limites de estouro com o mesmo resultado, e `NaN` atravessa as contas como `NaN`); `value + value` por `value - value` (ambos `NaN`); o caminho especial de 0,5·ln 2 < \|x\| < 1,5·ln 2 trocado por `false` (o geral calcula o mesmo k = ±1 e os mesmos `hi` e `lo`); e `k >= -1021` por `k > -1021` (com k = −1021, o outro caminho de escala também é exato).
- **Custo** (medido em 18/11/2026, Node 24.22.2, 10⁶ chamadas sobre (0, 1), cinco rodadas): `Math.log` ~20 ms, `log` ~55 ms; `Math.exp` ~20 ms, `exp` ~50 ms (sobre −x²/2 com x em [0, 37], as entradas do Hart). Cerca de 30 a 35 ns a mais por chamada, desprezível para os milhares de sorteios de um turno.
