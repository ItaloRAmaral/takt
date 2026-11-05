# Motor de simulação (`@takt/sim-engine`)

> **Resumo.** Como o motor é construído hoje. O motor é um núcleo funcional em TypeScript puro, sem React, Three.js nem DOM, que roda num Web Worker do `takt-web-app`. O porquê está no [ADR-0011](../adr/0011-motor-de-simulacao-e-esquema.md) e no [ADR-0013](../adr/0013-erros-esperados.md); o plano que o constrói é o [roteiro do motor](../plans/2026-11-04-roteiro-motor.md). Este documento cresce a cada sub-plano.

Atualizado em 05/11/2026 (sub-plano 1, tarefa 3).

## Estrutura

Pastas por conceito ([guia de estilo](code-style.md), seção 7), dentro de `libs/sim-engine/src/`:

| Pasta | O que tem | Sub-plano |
| --- | --- | --- |
| `errors/` | `SimulationError`, o erro esperado do motor | 1 |
| `tests/helpers/` | Auxiliares só de teste (`catchError`, `drawUniforms`, `summarizeUniforms`), cada um com o spec ao lado; não saem pelo `index.ts`, não entram no *build* (`exclude` do `tsconfig.lib.json`) nem na mutação (`mutate` da Stryker), mas contam na cobertura | 1 |
| `rng/` | Gerador MRG32k3a (`mrg32k3a.ts`), saltos por potência de matriz (`jump.ts`), índice da sequência por chave (`stream-index.ts`) | 1 |
| `distributions/` | Distribuições por inversão | 1 (a preencher) |

O `src/index.ts` é a API pública: hoje só `SimulationError` e `SimulationErrorCode`. O resto é interno e usado pelos sub-planos seguintes.

## Erros

- **Erro esperado:** `SimulationError`, com `code` literal (`'SIMULATION_LIMIT_EXCEEDED'` ou `'INVALID_PLANT'`) e `name = 'SimulationError'`. A mensagem é interna, para o log. Ainda não há `details`: o formato de cada código é declarado pelos sub-planos 4 e 6, que lançam os primeiros erros com dados.
- **Defeito:** qualquer outro erro, sem `code` (ADR-0013).
- **Teste:** em código síncrono, `catchError(fn)` devolve o erro lançado e falha se nada for lançado; `fn` tem tipo `() => void`, e a regra `no-misused-promises` do typescript-eslint recusa no lint uma função assíncrona; em código assíncrono, `await expect(promise).rejects.toMatchObject({ code })`.
- **Conferência do ADR-0013 ("Em aberto"), feita em 04/11/2026 com o Vitest 5.0.5:** `toMatchObject` e `rejects.toMatchObject` verificam o `code` de uma subclasse de `Error`, e um `code` diferente falha. Testes em `src/errors/simulation-error.spec.ts`: `toMatchObject checks the code of a simulation error`, `toMatchObject fails on a different code` e `rejects.toMatchObject checks the code of a rejected simulation error`. Pelos critérios da skill de registros, isso confirma o ADR-0013 e não pede registro novo.

## Gerador

**MRG32k3a** (L'Ecuyer 1999; L'Ecuyer et al. 2002), escrito a partir do artigo, sem código copiado do RngStreams.

- **Constantes:** m1 = 4294967087, m2 = 4294944443, a12 = 1403580, a13n = 810728, a21 = 527612, a23n = 1370589, norm = 1 / (m1 + 1). Estado inicial do pacote: 12345 nos seis valores.
- **Sequências e subsequências:** `streamStart(índice)` salta `índice · 2¹²⁷` passos a partir do estado do pacote, uma vez por chave; `createRandomStream(início, replicação)` salta `replicação · 2⁷⁶` passos e lança `RangeError` (defeito) com replicação negativa, que daria em silêncio a mesma subsequência da replicação 0. Os saltos usam potência de matriz 3 × 3 módulo m em `bigint` (`jump.ts`), só na preparação. O `jump.spec.ts` testa a potência e o produto com módulo 7 e entradas entre 2 e 6: com 0 ou 1 nos dados, trocar `*` por `/` não muda o resultado e o mutante sobrevive.
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

- **Regra:** a sequência de uma chave é a de número **FNV-1a de 64 bits de `<semente>:<chave>`**, com a chave no formato `<id do elemento>:<propósito>` (decisão do usuário de 04/11/2026; o porquê está no plano do sub-plano 1). `streamIndex(semente, chave)` dá o número; `assignStreamIndices(semente, chaves)` dá o de cada chave de uma execução. Renomear o ID de um elemento muda os sorteios dele.
- **FNV-1a:** `fnv1a64(texto)`, um byte por caractere, multiplicação módulo 2⁶⁴ em `bigint` (`BigInt.asUintN`). Constantes da [RFC 9923](https://www.rfc-editor.org/rfc/rfc9923) (fev. 2026, o *draft* do IETF citado no plano virou RFC): base de deslocamento `0xCBF29CE484222325` e primo `0x100000001B3`.
- **Só ASCII:** cada caractere vira exatamente um byte, sem `TextEncoder` (ausente no `lib` do motor). Um caractere fora do ASCII lança `RangeError`: é defeito, porque o esquema (sub-plano 3) define o formato dos IDs.
- **Colisões:** **estimativa:** com 10⁴ chaves sem intenção, a chance de duas coincidirem é da ordem de (10⁴)² / 2⁶⁵ ≈ 3×10⁻¹². O FNV-1a não resiste a colisões fabricadas, e plantas podem ser importadas; por isso dois índices iguais, chave repetida inclusive, lançam `SimulationError('INVALID_PLANT')`, um erro da entrada e não defeito.
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

A preencher nas tarefas 4 e 5 do sub-plano 1.
