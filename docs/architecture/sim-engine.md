# Motor de simulação (`@takt/sim-engine`)

> **Resumo.** Como o motor é construído hoje. O motor é um núcleo funcional em TypeScript puro, sem React, Three.js nem DOM, que roda num Web Worker do `takt-web-app`. O porquê está no [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) e no [ADR-0013](../adr/0013-erros-esperados.md); o plano que o constrói é o [roteiro do motor](../plans/2026-11-04-roteiro-motor.md). Este documento cresce a cada sub-plano.

Atualizado em 05/11/2026 (sub-plano 1 concluído).

## Estrutura

Pastas por conceito ([guia de estilo](code-style.md), seção 7), dentro de `libs/sim-engine/src/`:

| Pasta | O que tem | Sub-plano |
| --- | --- | --- |
| `errors/` | `SimulationError`, o erro esperado do motor | 1 |
| `tests/helpers/` | Auxiliares só de teste (`catchError`, `drawUniforms`, `summarizeUniforms`, `drawTimesSec`, `sampleMean`, `sampleVariance`, `relativeError`), cada um com o spec ao lado; não saem pelo `index.ts`, não entram no *build* (`exclude` do `tsconfig.lib.json`) nem na mutação (`mutate` da Stryker), mas contam na cobertura | 1 |
| `rng/` | Gerador MRG32k3a (`mrg32k3a.ts`), saltos por potência de matriz (`jump.ts`), índice da sequência por chave (`stream-index.ts`) | 1 |
| `distributions/` | `Variability` e `drawTimeSec` (`variability.ts`); quantis da exponencial (`exponential.ts`), da triangular (`triangular.ts`) e da normal truncada (`truncated-normal.ts`); quantil, função de distribuição e cauda superior da normal padrão (`normal.ts`) | 1 |

O `src/index.ts` é a API pública: hoje só `SimulationError` e `SimulationErrorCode`. O resto é interno e usado pelos sub-planos seguintes.

## Erros

- **Erro esperado:** `SimulationError`, com `code` literal (`'SIMULATION_LIMIT_EXCEEDED'` ou `'INVALID_PLANT'`) e `name = 'SimulationError'`. A mensagem é interna, para o log. Ainda não há `details`: o formato de cada código é declarado pelos sub-planos 4 e 6, que lançam os primeiros erros com dados.
- **Defeito:** qualquer outro erro, sem `code` (ADR-0013).
- **Teste:** em código síncrono, `catchError(fn)` devolve o erro lançado e falha se nada for lançado; `fn` tem tipo `() => void`, e a regra `no-misused-promises` do typescript-eslint recusa no lint uma função assíncrona; em código assíncrono, `await expect(promise).rejects.toMatchObject({ code })`.
- **Conferência do ADR-0013 ("Em aberto"), feita em 04/11/2026 com o Vitest 5.0.5:** `toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error`, e um `code` diferente falha. Testes em `src/errors/simulation-error.spec.ts`: `toMatchObject checks the code of a simulation error`, `toMatchObject fails on a different code` e `rejects.toMatchObject checks the code of a rejected simulation error`. Pelos critérios da skill de registros, isso confirma o ADR-0013 e não pede registro novo.

## Gerador

**MRG32k3a** (L'Ecuyer 1999; L'Ecuyer et al. 2002), escrito a partir do artigo, sem código copiado do RngStreams.

- **Constantes:** m1 = 4294967087, m2 = 4294944443, a12 = 1403580, a13n = 810728, a21 = 527612, a23n = 1370589, norm = 1 / (m1 + 1). Estado inicial do pacote: 12345 nos seis valores.
- **Sequências e subsequências:** `findStreamStart(índice)` salta `índice · 2¹²⁷` passos a partir do estado do pacote, uma vez por chave; `createRandomStream(início, replicação)` salta `replicação · 2⁷⁶` passos e lança `RangeError` (defeito) com replicação negativa, que daria em silêncio a mesma subsequência da replicação 0, ou a partir de 2⁵¹ (2¹²⁷ / 2⁷⁶ subsequências por sequência), que cairia em silêncio na sequência seguinte. Os saltos usam potência de matriz 3 × 3 módulo m em `bigint` (`jump.ts`), só na preparação. O `jump.spec.ts` testa a potência e o produto com módulo 7 e entradas entre 2 e 6: com 0 ou 1 nos dados, trocar `*` por `/` não muda o resultado e o mutante sobrevive.
- **Geração:** `nextUniform` usa `number`; o invariante abaixo de 2⁵³ é o único comentário além da fonte, por decisão do usuário de 05/11/2026. Todos os produtos ficam abaixo de 2⁵³ (o maior, a12 · s, é cerca de 6,0×10¹⁵), por isso a conta é exata e igual em qualquer motor JavaScript; só a multiplicação final por `norm` é arredondada, e é a mesma operação do pacote de referência. A saída fica estritamente em (0, 1): com p₁ ≤ p₂ soma-se m1, então p₁ = p₂ dá m1 · norm, não 0.
- **Mutantes equivalentes conhecidos:** a mensagem do `RangeError` da replicação negativa trocada por texto vazio sobrevive, porque os testes nunca verificam mensagens; e trocar `p1 < 0` por `p1 <= 0` grava m1 em vez de 0 no estado, mas toda conta seguinte é módulo m1, onde os dois valem o mesmo; nenhum número sorteado muda.

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
- **Exponencial:** `−média · ln(1 − u)`. Usa `Math.log`, que a especificação do JavaScript não obriga a ser igual entre motores (D4, sub-plano 2); por isso os testes da inversa usam `toBeCloseTo` com 12 casas.
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
- **Resultado** = média + desvio·z, **limitado a [mínimo, máximo]**: o arredondamento nunca põe um tempo fora do intervalo. Com probabilidade zero em dupla precisão ([40, 41] desvios), p = 0, Φ⁻¹ dá ±∞ e o limite devolve a borda do intervalo; a recusa da planta nesse caso é do sub-plano 4.

### Φ⁻¹: AS 241 (Wichura 1988)

- `normalQuantile(p)`, o PPND16, com as três regiões do artigo (|q| ≤ 0,425; r ≤ 5; r > 5). Escrito a partir do artigo ([PDF](https://csg.sph.umich.edu/abecasis/gas_power_calculator/algorithm-as-241-the-percentage-points-of-the-normal-distribution.pdf)).
- **Coeficientes:** os 52 do artigo, conferidos pelas três somas de conferência (*hash sums*) que o próprio artigo imprime. No código, cada coeficiente é o menor decimal que dá o mesmo `double` que o valor de 20 algarismos do artigo, porque o lint (`no-loss-of-precision`) recusa literais com mais algarismos do que um `double` guarda; a equivalência foi conferida coeficiente a coeficiente por script.
- **Fora de (0, 1):** p ≤ 0 dá −∞ e p ≥ 1 dá +∞, os limites matemáticos. O artigo devolve 0 com um indicador de falha; aqui o ±∞ é o que faz a normal truncada com probabilidade zero cair na borda certa.
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
- **Tolerâncias dos testes** (das medições, com folga): 10⁻¹³ até |x| = 3, 10⁻¹² em 4, 10⁻¹⁰ em 5 e 2×10⁻⁸ de 8 a 10 (erro relativo, pelo auxiliar `relativeError`); 10⁻¹² em 37; Φ(−37,5) = 0, o corte publicado (o valor verdadeiro é 4,6×10⁻³⁰⁸). Normal truncada: 14 casas perto da média e 8 casas nas caudas ([8, 9], [9, 10], [−9, −8]).

### Momentos da normal truncada

Normal com média 10 e desvio 1, truncada em [9, 11] (a padrão em [−1, 1]), sequência 0, replicação 0, 10⁵ amostras: média 9,99951 (z = −0,29) e variância 0,28984 (z = −1,44), dentro do IC de 95%. **Cálculo próprio:** variância 1 − 2φ(1)/(Φ(1) − Φ(−1)) = 0,291125094772793 e 4º momento central 3·variância − 2φ(1)/(Φ(1) − Φ(−1)) = 0,164500379091173 (por integração por partes; conferido por integração numérica, 0,164500379091170). Limites nos testes: média de 9,99665 a 10,00335; variância de 0,28937 a 0,29288.

### Funções do `Math` usadas (insumo da D4, sub-plano 2)

| Função | Onde | Igual em todo motor? |
| --- | --- | --- |
| `Math.sqrt` | triangular; AS 241 (caudas) | Sim: a especificação exige arredondamento correto |
| `Math.log` | exponencial; AS 241 (caudas) | Não garantido |
| `Math.exp` | Hart (Φ e Q) | Não garantido |

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
