# Precisão da função de distribuição da normal

> **Resumo.** O algoritmo de Hart (1968), na forma de West (2005), que o sub-plano 1 usa para Φ e Q, tem erro relativo de até 8,7×10⁻⁹ na cauda (x ≈ 8), e não de dupla precisão como West afirma; a afirmação dele vale para o erro absoluto. O efeito no motor é de ~10⁻⁹ desvios-padrão no tempo sorteado, invisível no produto, e o usuário decidiu manter Hart (05/11/2026). Esta nota guarda a alternativa estudada para quando o motor precisar de Φ na cauda com erro relativo pequeno: Marsaglia (2004) para |x| < 5 e a fração contínua de Laplace (Abramowitz e Stegun 26.2.14) com 40 termos acima, com erro relativo medido ≤ 3,7×10⁻¹⁴ até x = 37,5.

Data: 05/11/2026. Pedido do usuário: pesquisar uma Φ com precisão relativa na cauda antes de decidir entre manter Hart e trocar.

**Rótulos.** **[Fato]**: sustentado pela fonte citada. **[Medição]**: conta que rodei, com o método descrito; reproduzível pelo script de [`sim-engine.md`](../architecture/sim-engine.md), seção "Script de referência da normal". **[Palpite]**: opinião sem fonte.

## Como medi

- **Referência:** Q(x) com 100 algarismos (`decimal` do Python 3.10.12): série de Taylor do `erf` até |x| = 5 e a fração contínua de Laplace, com 3000 termos, acima. As duas formas concordam em 10⁻⁵⁷ ou melhor em x = 8, 9 e 10, e a série reproduz Φ(−1) = 0,15865525393145705141… conhecido. **[Medição]**
- **Candidatos:** réplicas em Python, em `double`, com a mesma ordem de operações do código em TypeScript.
- **Acima de x ≈ 37,5**, Q é subnormal (< 2,2×10⁻³⁰⁸) e nenhum método tem precisão relativa; a medição para ali. **[Medição]**

## Hart, na forma de West

- **[Fato]** West (2005), Figura 2: função racional para |x| < 7,07106781186547, fração contínua com 4 termos (e a correção 0,65) acima, e 0 para |x| > 37; "accurate to double precision throughout the real line". — [West (2005), PDF](https://s2.smu.edu/~aleskovs/emis/sqc2/accuratecumnorm.pdf)
- **[Medição]** Erro relativo de Φ(−x): ≤ 1,5×10⁻¹⁴ até x = 3; 1,2×10⁻¹³ em 4; 4,6×10⁻¹¹ em 5; 2,6×10⁻⁹ em 7; 8,7×10⁻⁹ em 8 (o pior); 3,2×10⁻⁹ em 10; 9,2×10⁻¹⁴ em 37. O erro absoluto fica abaixo de 10⁻¹⁶ em toda a reta, o que explica a frase de West.
- **[Fato]** Marsaglia (2004) mede o mesmo: usando Hart para Φ(−x), a precisão relativa "would taper off to about 9 digits at x = 12". — [Marsaglia (2004)](https://www.jstatsoft.org/article/view/v011i04)

## Alternativas

| Candidato | Fonte e licença | Resultado |
| --- | --- | --- |
| Marsaglia (2004), `cPhi`: série de Taylor de R(x) = Q(x)/φ(x) em torno de pontos tabelados, com R⁽ᵏ⁺¹⁾ = x·R⁽ᵏ⁾ + k·R⁽ᵏ⁻¹⁾ | [J. Stat. Software 11(4)](https://www.jstatsoft.org/article/view/v011i04), CC-BY 3.0; método explicado no artigo **[Fato]** | O artigo usa `long double` e declara 14 a 16 algarismos. Os 9 valores tabelados conferem com o meu cálculo em 10⁻¹⁸. Em `double`: 1,8×10⁻¹⁵ até x = 5 e 4,6×10⁻¹⁴ até 10, mas piora acima (5,5×10⁻¹¹ até 15; 10⁻² perto de 30) **[Medição]** |
| Fração contínua de Laplace, Abramowitz e Stegun 26.2.14: Q(x) = Z(x)·{1/(x+ 1/(x+ 2/(x+ 3/(x+ …))))}, x > 0 | [A&S, p. 932](https://personal.math.ubc.ca/~cbm/aands/page_932.htm), domínio público **[Fato]** | Com 40 termos, em `double`: 2,6×10⁻¹⁵ a 4,5×10⁻¹⁵ de 5 a 9; ≤ 3,7×10⁻¹⁴ até 37,5. Não serve para x pequeno (converge devagar) **[Medição]** |
| Cody (1969), o do `pnorm` do R | [Math. Comp. 23, 631–637](https://www.ams.org/mcom/1969-23-107/S0025-5718-1969-0247736-4/) | O download do PDF devolve 403, como na pesquisa anterior. Descartado |
| Sun/fdlibm `erfc`, Ooura `derfc` | Citados por Marsaglia | Só existem como código, sem artigo de onde escrever o algoritmo (regra do usuário: escrever a partir dos artigos). Descartados |
| `erfc` da glibc (só comparação) | — | 1,7×10⁻¹³ em [8, 37,5] **[Medição]** |

**Combinação estudada:** Marsaglia para |x| < 5 (só usa R(0), R(2) e R(4) da tabela do artigo) e a fração contínua com 40 termos para |x| ≥ 5. **[Medição]** Erro relativo ≤ 1,8×10⁻¹⁵ abaixo de 5 e ≤ 3,7×10⁻¹⁴ até 37,5, melhor que a glibc. O ponto de troca e o número de termos são escolhas próprias, feitas por medição; a combinação não está publicada nessa forma.

## Decisão

- **Mantido Hart (05/11/2026).** Motivos: o erro não chega ao que o produto mostra (~10⁻⁹ desvios-padrão no pior caso, num intervalo patológico); Hart é um algoritmo publicado de uma fonte só, que qualquer pessoa confere; a combinação seria código próprio para ganhar precisão onde ela não importa. **[Palpite]** para portfólio, a medição documentada mostra mais engenharia do que o código extra.
- **Quando revisitar:** se o motor precisar de Φ na cauda com erro relativo pequeno, por exemplo um p-valor extremo ou a probabilidade de um evento raro como resultado. A troca é a combinação acima, com o mesmo script de medição.
