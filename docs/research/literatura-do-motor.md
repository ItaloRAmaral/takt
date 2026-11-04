# A literatura confirma o motor e cobra condições

> **Resumo.** Nenhuma afirmação técnica do [roteiro do motor](../plans/2026-11-04-roteiro-motor.md) está numericamente errada. O MRG32k3a, o AS 241, a triangular, o 3,79, o 94,1% e a geométrica conferem com a literatura ou com cálculo próprio. Três pontos estão errados: (1) o sub-plano 4 usa LL.1 num turno que termina com WIP; (2) o sub-plano 7 espera um corte de "algumas centenas" do MSER-5 no M/M/1; (3) a pesquisa anterior afirma que 30 replicações já separam 3,79 de 4. Quase todos os outros casos estão certos, mas falta uma condição: o relógio das falhas, o significado do MTBF, a regra de bloqueio, a fila ilimitada, a definição de disponibilidade no OEE e a convenção do limite de retrabalho. A D4 já tem resposta provável: `Math.log` e `Math.exp` divergem entre motores e até entre versões do V8. O roteiro também não planeja duas decisões: de onde vem o quantil da t, e como uma chave vira um índice de sequência sem depender da ordem.

**Convenção de rótulos.** **[Fato]** é uma afirmação sustentada pela fonte citada logo em seguida. **[Fato secundário]** se apoia numa fonte que só resume a primária, ou no trecho de uma busca sem a página inteira. **[Estimativa]** é um número calculado ou uma inferência derivada das fontes ou de cálculo próprio, com o método indicado. **[Palpite]** é uma opinião de projeto, ou uma extrapolação com pouco apoio direto. Quando um parágrafo inteiro tem a mesma natureza, o rótulo aparece uma vez, no início. Os cálculos e as simulações próprias citados aqui foram feitos em scripts temporários fora do repositório. Eles não usam o gerador do Takt.

O roteiro está bem fundamentado na literatura. O desenho do gerador (uma sequência por fonte de aleatoriedade, uma subsequência por replicação) é a recomendação literal dos autores do RngStreams, e um port literal em JavaScript reproduz a saída oficial. O AS 241 é exatamente o que o `qnorm` do R usa na faixa que o motor alcança. Os valores esperados dos casos de validação estão corretos. O que falta são **condições**, e elas pesam mais que os números. O 94,1% de disponibilidade só aparece se as falhas correrem no relógio de calendário e se o OEE não contar faminto e bloqueado como indisponibilidade. O M/M/1 só aparece com fila ilimitada e fonte nunca bloqueada. A Lei de Little só é exata no turno pelo teorema LL.2, não pelo LL.1. O 3,79 está certo, mas 30 replicações não o distinguem de 4. Cada uma dessas condições depende de uma escolha do esquema (sub-plano 3) que o roteiro ainda trata como pendência. Por isso o sub-plano 3 decide, sem que isso esteja escrito, se metade dos casos de validação dos sub-planos 5 e 6 vai fechar. Há também um risco de produto fora da engenharia: a versão em C do RngStreams no site do autor proíbe uso comercial sem contato. A versão no GitHub está sob Apache 2.0.

## O gerador está certo, e a "sequência por chave" é uma extensão nossa

**[Fato]** Os parâmetros que o ADR-0011 assume conferem com a fonte. O MRG32k3a combina duas recorrências de ordem 3, com m₁ = 2³² − 209 e m₂ = 2³² − 22853. O período é ≈ 2¹⁹¹. O RngStreams corta o ciclo em **2⁶⁴ sequências de 2¹²⁷ passos**, e cada uma em **2⁵¹ subsequências de 2⁷⁶** ([streams4.tex, L'Ecuyer et al.](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex); [L'Ecuyer et al. 2002, *Operations Research* 50(6)](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/papers/streams00.pdf)). A normalização usa 1/(m₁+1). O menor valor possível é ≈ 2,33×10⁻¹⁰ e o maior é m₁/(m₁+1), então **0 e 1 nunca saem** ([RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c)). A interface do roteiro ("uniformes em (0, 1)") está correta. A inversa da exponencial e a da normal ficam protegidas de log(0) sem tratamento extra. Os coeficientes satisfazem "a_ij(m_j − 1) < 2^53". Os produtos dos saltos são decompostos em `MultModM` para ficar abaixo de 2⁵³, de modo que "all seed values will have exact accuracy" em IEEE 754 ([streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex)). O ECMAScript define `*`, `+`, `−` e `/` pelas regras do IEEE 754 com roundTiesToEven ([ECMA-262](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html)).

**[Estimativa, verificação própria]** As notas transcreveram o C oficial literalmente para JavaScript e rodaram o teste do pacote. **Todos os estados e valores** de `test2RngStream.res` bateram, inclusive os da versão C++ com ~13 algarismos ([test2RngStream.res, C](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/test2RngStream.res); [C++](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/test2RngStream.res)). O maior valor intermediário foi ≈ 2^52,42, abaixo de 2⁵³. A única operação com arredondamento real é o produto final por `norm`. Daí a inferência de que o gerador dá os mesmos bits em V8, SpiderMonkey e JavaScriptCore. Ela foi testada só no V8. O sub-plano 2 pode confirmá-la com os mesmos vetores. O `.res` serve diretamente ao teste "primeiras sequências e subsequências idênticas às do RngStreams" do sub-plano 1. Ele traz os estados iniciais dos streams 1 a 3, cinco valores na 1ª e na 5ª subsequência do stream 3, somas de 100 valores e um salto para trás de 2¹²⁷. Duas condições faltam no roteiro. A primeira: o `.res` imprime só 8 ou ~13 algarismos, então a comparação exata deve ser feita nos **estados inteiros**. A segunda: a sequência g do Takt é o `CreateStream` número g + 1 do pacote. Os dados de referência não precisam de nada instalado, porque o `.res` é publicado.

**[Fato]** A recomendação da literatura é exatamente o desenho do roteiro: "assign different streams to different places where random numbers are needed in the model (e.g. … one stream for the service times at each queue, one stream for a routing decision, etc.) … assign run j to the j^th substream, within each stream" ([streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex)). L'Ecuyer et al. repetem a regra em 2017 ([G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf)). O que o pacote **não** oferece é o mapeamento de uma chave para uma sequência. O RngStreams cria streams em fila: cada `CreateStream` avança `nextSeed` em 2¹²⁷ passos. A literatura avisa o risco desse esquema: "the user must make sure that they are created in the same order and used for the same purpose in different configurations" ([G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf)). O ns-3 documenta o problema na prática. Com atribuição automática, ao mudar a configuração, "the mapping of RandomVariables to streams may (or may not) change". O remédio do ns-3 é um atributo `Stream` fixo por variável ([manual do ns-3](https://www.nsnam.org/docs/manual/html/random-variables.html)). O ns-3 também salta direto a um stream e uma subsequência arbitrários, com uma tabela de potências A^(2^k) aplicadas bit a bit ao índice de 64 bits ([ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc)).

**[Estimativa]** O salto direto não muda nenhuma sequência. As notas conferiram que (A^(2^127))^1000 · s₀ é igual a criar 1001 streams em fila, e o mesmo vale para a subsequência 7 do stream 1000. O custo medido em JavaScript sem otimização foi de ~0,07–0,08 ms por salto e ~8 ms para montar a tabela de 191 potências. Para alguns milhares de chaves, isso dá dezenas de milissegundos por execução. Restam duas formas de obter um índice estável por chave:

- **Hash da string `<id>:<propósito>`** para um índice de 64 ou 53 bits. Com 10.000 chaves, a chance de colisão é ≈ 2,7×10⁻¹² em 64 bits e ≈ 5,6×10⁻⁹ em 53 bits (aproximação do aniversário). Como todas as chaves são conhecidas ao compilar o modelo, a colisão pode ser **detectada** e virar erro determinístico.
- **Inteiro persistido por elemento** no documento da planta, como o `Stream` do ns-3. Elimina a colisão, mas põe um campo técnico no esquema.

O teste "chaves diferentes → sequências diferentes" do roteiro só vale por construção na segunda forma. Na primeira, ele vale salvo colisão, que precisa de verificação explícita na compilação. Nenhuma ferramenta de simulação publicada usa hash de nome para índice de stream; a análise de colisão vem de L'Ecuyer et al. (2017) ([G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf)). A função de hash não foi pesquisada.

**[Fato]** Não há padrão para transformar a semente única (42) no estado de 6 valores:

- **ns-3:** copia a semente nos 6 valores, exigindo 1 ≤ semente < m₂ ([rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc)).
- **R:** espalha a semente com a LCG 69069·s + 1, depois de 50 passos de aquecimento ([R RNG.c](https://github.com/wch/r-source/blob/trunk/src/main/RNG.c)), e avisa que "There is no guarantee that different values of seed will seed the RNG differently" ([R ?Random](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random.html)).
- **MATLAB:** não documenta a conversão ([RandStream](https://www.mathworks.com/help/matlab/ref/randstream.html)).

O ponto em comum é a recomendação de variar a **subsequência**, e não a semente, para obter execuções independentes ([manual do ns-3](https://www.nsnam.org/docs/manual/html/random-variables.html)). **[Estimativa]** As opções para o Takt são três:

- **(a)** semente copiada nos 6 valores, como no ns-3;
- **(b)** semente do pacote fixa em 12345 ×6, que tem vetores oficiais, com a semente do cenário entrando no hash da chave, o que mantém todas as combinações (semente, chave) na mesma partição de streams disjuntos;
- **(c)** a LCG do R.

Nenhuma fonte publica o estado da semente 42, então qualquer opção exige vetores de teste próprios.

**[Fato]** A licença é um achado que nenhum documento do Takt registra. O `RngStream.c` do site do autor diz "This code can be used freely for personal, academic, or non-commercial purposes. For commercial purposes, please contact P. L'Ecuyer" ([RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c); [README](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/README)). O repositório oficial no GitHub, que contém a versão C++, diz que o pacote "is under an Apache 2.0 license … It can be used freely for any purpose" ([umontreal-simul/RngStreams](https://github.com/umontreal-simul/RngStreams)). O ns-3 é GPL-2.0-only. **[Palpite]** Implementar a partir das fórmulas publicadas e conferir contra o `.res`, ou partir da versão Apache 2.0, evita o problema. A interpretação jurídica fica com o usuário. Uma busca no npm não encontrou nenhum port em JavaScript ou TypeScript ([npm](https://registry.npmjs.org/-/v1/search?text=mrg32k3a)).

## As inversas estão certas; a normal truncada precisa de complemento nas caudas

**[Fato]** O ADR-0011 diz que o AS 241 é "o mesmo usado pelo `qnorm` do R", e isso está certo na faixa que o motor alcança. O PPND16, a versão de dupla precisão do AS 241, declara que "Z is accurate to about 1 part in 10**16". A StatLib publica os coeficientes com "hash sums" para conferir a transcrição ([StatLib apstat/241](https://lib.stat.cmu.edu/apstat/241)). O `qnorm.c` do R usa as três regiões originais. Ele só acrescentou, em 2022, expansões assintóticas para r > 27, "practically only when log_p = TRUE" ([R qnorm.c](https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/qnorm.c)). **[Estimativa]** Com o menor uniforme do MRG32k3a (≈ 2,33×10⁻¹⁰), r = √(−ln u) ≈ 4,7. Isso fica abaixo até do terceiro ramo (r > 5), que só a normal truncada alcança, e o ramo de 2022 não precisa ser portado. O teste contra o `qnorm` precisa de tolerância, como o roteiro já diz, e não de igualdade de bits. O "1 parte em 10¹⁶" é o erro do algoritmo, e o resultado depende também de `Math.log`.

**[Fato]** Para a função de distribuição Φ, que o JavaScript não tem e que a normal truncada exige, a referência de fato em software estatístico é o algoritmo de **Cody**. São aproximações racionais de Chebyshev (1969), reempacotadas no SPECFUN (ACM TOMS 715, 1993). É o que o `pnorm` do R usa, e ele declara "at least 18 significant decimal digits" teóricos ([R pnorm.c](https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/pnorm.c)). Há duas alternativas em dupla precisão. A de Hart (1968), no formato de West (2005), "is accurate to double precision throughout the real line" ([West 2005](https://s2.smu.edu/~aleskovs/emis/sqc2/accuratecumnorm.pdf)). A de Marsaglia (2004) é uma função curta com "absolute error less than 8 x 10^-16" ([JSS v011i04](https://www.jstatsoft.org/article/view/v011i04)). A fórmula mais difundida é outra: a 26.2.17 de Abramowitz e Stegun, a "most common" segundo West e repetida em Hull e Haug. Ela tem |ε| < 7,5×10⁻⁸ ([A&S p. 932](https://personal.math.ubc.ca/~cbm/aands/page_932.htm)), e West mostra preços de opção errados causados por ela ([West 2005](https://s2.smu.edu/~aleskovs/emis/sqc2/accuratecumnorm.pdf)). **[Estimativa]** O par natural é AS 241 + Cody: os dois vêm do R e são testáveis contra o mesmo programa. Marsaglia limita o erro absoluto, o que é ruim nas caudas, onde a truncada precisa de erro relativo. A 26.2.17 fica fora do motor.

**[Fato]** O problema da normal truncada é o cancelamento. O pacote TruncatedNormal, de Botev, resolve assim: quando os dois limites estão do mesmo lado, reflete o intervalo ("use symmetry of normal") e calcula com a cauda superior Q(x) = 1 − Φ(x), `pnorm(…, lower_tail=0)` e `qnorm(…, lower_tail=0)` ([TruncatedNormal, Phinv](https://raw.githubusercontent.com/cran/TruncatedNormal/master/src/lnNpr_cholperm_Phinv.cpp)). Ele só passa a um Newton próprio quando o limite passa de 35 desvios ([cases.R](https://raw.githubusercontent.com/cran/TruncatedNormal/master/R/cases.R)). **[Estimativa, cálculo próprio]** Os números mostram onde a fórmula simples do ADR quebra:

| Intervalo | Erro relativo de Φ(b) − Φ(a) |
| --- | --- |
| [5, 6] | 4×10⁻¹¹ |
| [8, 9] | 7% |
| [9, 10] | Φ(a) = Φ(b) = 1,0 em double: todo u vira o mesmo ponto |

Com Q, os três ficam corretos. No uso típico do Takt (tempo de ciclo truncado em 0, com coeficiente de variação até 1), a = −μ/σ ≤ −1 e a fórmula simples é exata. A reflexão custa uma linha e elimina o colapso. Os ramos de Botev acima de 35 desvios exigiriam `expm1` e `log1p`, que aumentam a lista da D4. **[Palpite]** Um `clamp` final em [a, b] protege contra um resultado um ulp fora do intervalo. Nenhuma fonte prescreve isso.

**[Fato]** A triangular tem inversa fechada, e o `triinv` do Octave a implementa. Há duas armadilhas para o teste de referência. A primeira: a ordem dos parâmetros "has been changed after statistics version 1.6.3", e hoje é (p, mínimo, moda, máximo). A segunda: a raiz é calculada como `.^ 0.5` sobre 2·p·(w/h), com outros arredondamentos ([triinv.m](https://raw.githubusercontent.com/gnu-octave/statistics/main/inst/Distribution_Functions/triinv.m)). O arquivo é GPL v3. A especificação manda `Math.sqrt` devolver a raiz exata arredondada, enquanto `Math.pow` é "implementation-approximated" ([ECMAScript 21.3.2](https://tc39.es/ecma262/multipage/numbers-and-dates.html)). **[Estimativa]** Escrita com `Math.sqrt`, a triangular é idêntica bit a bit entre motores conformes e sai da D4. Com `** 0.5`, ela entra. O teste contra o Octave precisa de tolerância relativa (≈ 10⁻¹⁴), da versão do pacote e da ordem dos parâmetros. Os valores em p = 0, p = (b−a)/(c−a) (que dá a moda) e p = 1 são testes calculados à mão, e o Octave vira conferência extra. R e Octave não estão instalados no ambiente desta pesquisa, o que favorece gravar as saídas com o comando que as gerou, como o roteiro já prevê.

## O IC pela t pede uma tabela, não um algoritmo

**[Fato]** O IC do sub-plano 6 é o de Law: X̄(n) ± t_{n−1, 1−α/2}·√(S²(n)/n), com S² dividido por n − 1. A cobertura é exata para X_j normais e próxima para distribuições "reasonably symmetric" ([Law 2004](https://www.informs-sim.org/wsc04papers/009.pdf)). No regime estável, a replicação/deleção usa o mesmo IC sobre X_j = média das observações depois do aquecimento, e "the X_j's are IID" porque cada replicação usa números aleatórios próprios ([Law 2004](https://www.informs-sim.org/wsc04papers/009.pdf)). No RngStreams, isso é a subsequência por replicação ([L'Ecuyer et al. 2002](https://econpapers.repec.org/RePEc:inm:oropre:v:50:y:2002:i:6:p:1073-1075)). O roteiro está certo nisso. Falta a fonte do quantil, que o JavaScript não tem. O `qt` do R traduz o Algoritmo 396 de Hill (1970), com casos exatos para gl = 1 e 2 e um refinamento por Taylor de Hill (1981) que chama `pt`, a beta incompleta ([R qt.c](https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/qt.c)). O Hill 396 depende de uma inversa da normal "such as … AS 241" e usa potências e exponenciais ([cacm396.f90](https://jblevins.org/mirror/amiller/cacm396.f90)). A Boost.Math também usa Hill como método principal ([Boost, resumo da busca](https://live.boost.org/doc/libs/1_80_0/boost/math/special_functions/detail/t_distribution_inv.hpp)). É o algoritmo mais comum em software, mas nenhuma fonte aberta declara a precisão dele.

**[Estimativa]** As replicações vão de 5 a 100 (RN-SIM-003, `docs/product/rules/simulation.md`), ou seja, gl de 4 a 99. Bastam **96 constantes** t₀,₉₇₅, gravadas com 17 algarismos significativos a partir do `qt` do R, com o comando registrado. A tabela não chama `Math` em tempo de execução e é idêntica em todo motor. Ela pode ser conferida contra a tabela publicada do NIST, que dá 2,776 (gl 4), 2,262 (9), 2,093 (19), 2,045 (29) e 2,010 (49) ([NIST/SEMATECH e-Handbook](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm)). As alternativas são piores para o marco 1:

- o Hill 396 sem refinamento põe `pow` e `exp` na D4 e não tem precisão publicada;
- o Hill com Taylor exige a beta incompleta;
- para Cornish-Fisher não se achou fonte primária.

Com a tabela, o IC usa só aritmética e `Math.sqrt`, ambos exatos pela especificação, desde que a soma das replicações siga ordem fixa: "Finite-precision addition is commutative, but not always associative" ([ECMAScript, Number::add](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html)). Há também um caso de borda que o roteiro não prevê. A linha em série com tempos fixos dá a mesma vazão em todas as replicações, com S = 0 e IC de largura zero. O código precisa tratar isso sem NaN, e o teste deve comparar por igualdade.

## A D4 já tem resposta provável: `log` e `exp` divergem entre motores

**[Fato]** A especificação resolve metade da D4. `Math.sqrt` devolve "𝔽(the square root of ℝ(n))", arredondado corretamente. `exp`, `log`, `pow` e as trigonométricas são "implementation-approximated", e o fdlibm é só recomendado ([ECMAScript 21.3.2](https://tc39.es/ecma262/multipage/numbers-and-dates.html)). A MDN avisa que "Even the same JavaScript engine on a different OS or architecture can give different results!" ([MDN, Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)). O código-fonte de cada motor mostra que hoje os três usam bibliotecas diferentes:

- **V8:** trocou `Math.log` e `Math.exp` pela libm do LLVM em maio de 2026. No benchmark do próprio commit, `Math.log` passou de "Max ULP 1.00 … % CR 80.7%" para "0.00 … 100.0%", e `Math.exp` de "80.3%" para "100.0%" ([commit 08be4445f6](https://github.com/v8/v8/commit/08be4445f60b3470b2b3130c97d41f09472bd076); [commit e5bb55463b](https://github.com/v8/v8/commit/e5bb55463b592ea0cb9480736146941c10e6bb62)). O `Math.pow` do V8 usa a `std::pow` da plataforma por padrão ([commit 716d3e3363](https://github.com/v8/v8/commit/716d3e3363c5bdb26e6de68327f6a1c559b8bf19)). Os commits estão na versão 15.0 ([v8-version.h](https://raw.githubusercontent.com/v8/v8/08be4445f6/include/v8-version.h)). O Node instalado aqui (v24.22.2, V8 13.6) é anterior à troca.
- **SpiderMonkey:** usava `fdlibm_exp` e `fdlibm_log`, com `std::pow`, no código de fevereiro de 2025 ([jsmath.cpp](https://raw.githubusercontent.com/mozilla/gecko-dev/master/js/src/jsmath.cpp)).
- **JavaScriptCore:** chama a libm do sistema ([MathCommon.h](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/JavaScriptCore/runtime/MathCommon.h)).

**[Estimativa]** Daí sai a conclusão que o sub-plano 2 vai medir. Nas entradas difíceis do benchmark, o `Math.log` antigo do V8 errava o arredondamento correto em ~19% dos casos e o novo em 0%. Logo Node 24 e Chrome com V8 ≥ 15 já devem dar bits diferentes nessas entradas. O Firefox (fdlibm) e o Safari (libm da Apple, não verificada) não têm garantia de bater com nenhum dos dois. A promessa da RN-SIM-001 ("professor e aluno veem os mesmos números") **não vale hoje** com `Math.log` e `Math.exp` nativos. A taxa em entradas aleatórias deve ser menor que 19%, mas não foi medida. **[Palpite]** Um bit diferente num tempo de evento pode trocar a ordem de dois eventos próximos, e a trajetória diverge a partir daí. A diferença não fica em 1 ulp nos indicadores.

**[Estimativa]** A medição fica mais barata do que o roteiro supõe, porque a lista de funções encolhe:

- **Fora da D4:** a triangular e o IC (só `sqrt`, se o IC usar a tabela) e o gerador (só aritmética).
- **Na D4:** a exponencial (`log`), o AS 241 (`log` e `sqrt`) e o Φ de Cody (`exp`). A lista se reduz a **`log` e `exp`**.

A opção (b) da D4 (funções próprias) tem base na especificação. As quatro operações são arredondadas uma a uma, sem FMA implícito ([ECMAScript 6.1.6.1](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html)). Então um `log` e um `exp` escritos só com aritmética e manipulação de bits dão os mesmos bits em todo motor conforme. Há dois candidatos:

- **port do fdlibm**, com licença permissiva da Sun e a mesma origem do código antigo do V8 ([V8 ieee754.cc](https://raw.githubusercontent.com/nodejs/node/main/deps/v8/src/base/ieee754.cc));
- **versão corretamente arredondada** do CORE-MATH ou da libc do LLVM, que mira "correctly rounded for all rounding modes" ([LLVM libc](https://libc.llvm.org/headers/math/index.html)). Ela coincidiria bit a bit com o `Math.log` do V8 novo, o que dá um oráculo grátis, ao custo de mais código e tabelas.

As licenças do CORE-MATH e da libc do LLVM não foram conferidas na fonte. Para o sub-plano 2, as notas apontam três exigências que o roteiro não lista:

- fixar e registrar a versão de cada navegador, porque o mesmo motor muda entre versões;
- incluir as entradas "worst-case" do CORE-MATH, como faz o js-math-bench ([nico/js-math-bench](https://github.com/nico/js-math-bench)), além dos uniformes do próprio gerador;
- rodar também os vetores do gerador, para confirmar que ele é idêntico.

Não há medição pública sistemática entre Chrome, Firefox, Safari e Node. O sub-plano 2 produz esse dado.

## Os casos de validação têm números certos e condições incompletas

**[Estimativa, cálculo próprio]** O **M/M/1** com λ = 0,8 e μ = 1 confere: ρ = 0,8, L = 4, W = 5, Lq = 3,2 e Wq = 4, pelas fórmulas de livro-texto ([Kelton et al., notas em RPubs](https://rstudio-pubs-static.s3.amazonaws.com/305152_deb4ef47278a4a20a136768a8293127e.html)). Uma fonte secundária traz código com W e Wq trocados ([MetricGate](https://metricgate.com/docs/queue-mm1-stationary/)), então convém conferir pela álgebra. O caso só vale com cinco condições, e o roteiro não nomeia nenhuma:

- fila ilimitada antes da estação (com capacidade K, vira M/M/1/K, e a probabilidade de cheio ≈ (1−ρ)ρ^K só cai abaixo de 10⁻⁴ com K ≳ 35);
- fonte nunca bloqueada;
- estação sem falhas, defeitos ou transporte;
- L contando quem está em serviço;
- modo regime estável com aquecimento.

A variância assintótica σ² = 2ρ(1+ρ)/(1−ρ)⁴ = 1.800 dá ≈ **1,73×10⁵** unidades de tempo para ±5% em L. O número confere com a pesquisa anterior, mas a fórmula é atribuída a Whitt (1989), não lido no original. O "ρ = 0,5 custa cerca de 5 vezes menos", rotulado como palpite no roteiro, tem a aritmética conferida: ≈ 3,7×10⁴ unidades de tempo, 4,7 vezes menos. Pode passar a estimativa.

**[Estimativa, cálculo próprio]** O **3,79 está correto** (3,7918), confirmado por dois métodos independentes. O primeiro integrou as equações de Kolmogorov da cadeia truncada. O segundo foi um Monte Carlo com 20.000 replicações de [0, 480] partindo do vazio, que deu média 3,7918 (erro-padrão 0,0117) e desvio-padrão por replicação de **1,65**. A integral do viés converge para −100, o que confere com g(0) = −ρ/(1−ρ)³ em três valores de ρ. Nenhuma fonte primária lida traz essa forma fechada. A ordem (1−ρ)⁻³ do viés é de Ni e Henderson ([Ni & Henderson](https://people.orie.cornell.edu/shane/pubs/howhard.pdf)). O problema está no teste. Com 30 replicações, a meia-largura do IC é ≈ 2,045 × 1,65/√30 ≈ **0,62**, e o intervalo contém 3,79 e 4 ao mesmo tempo. Separar os dois exige ~**1.000 replicações**. Um IC de ±0,05 em torno de 3,79 exige ~4.200 replicações (≈ 2×10⁶ unidades de tempo). Há um alvo transiente mais barato: E[L(10)] = 2,030, longe de 4 e com ruído menor. A variância de L(10) não foi calculada.

**[Fato]** A **Lei de Little** em janela finita tem duas formas. O LL.1 vale "for a queuing system observed over [0, T] that is empty at 0 and T". O LL.2 dispensa o vazio: S(T) passa a contar "any items that were in the system at t = 0", com L = A/T, λ = S(T)/T e W = A/S(T) ([Little 2011, reimpressão PPI](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/); [DOI](https://pubsonline.informs.org/doi/10.1287/opre.1110.0940)). **[Estimativa]** O sub-plano 4 cita LL.1, mas um turno termina com WIP. Para usar LL.1, o teste precisa parar a fonte e esvaziar a linha. Fora disso, o teorema certo é o LL.2, também no sub-plano 4. Com as definições do LL.2, L = λW é uma identidade algébrica, e o teste útil é outro: a soma, peça a peça, de [min(saída, T) − max(entrada, 0)] sobre todas as S(T) peças deve igualar a área sob o WIP. Entram nessa soma as peças refugadas e as que não saíram. A igualdade vale até o erro de ponto flutuante (tolerância relativa ≈ 10⁻⁹), não bit a bit. Em regime, "WIP = vazão × lead time", com vazão de peças boas e lead time só das peças boas, **não fecha com refugo**. λ precisa ser a taxa de entrada, ou a de saída total, e W o tempo de todas as peças.

**[Fato secundário]** "Vazão = 1/maior tempo de ciclo" é a lei do melhor caso de Hopp e Spearman, TH = min(w/T₀, r_b). Não é incondicional ([GT ISyE 6201, Hw-4](https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-07/Hw-4.pdf), trecho de busca). O gargalo é "the workstation having the highest long-term utilization", que coincide com a estação mais lenta só em linhas de rota única ([notas de Factory Physics](https://neoprimate.github.io/IEOR/supply-chain/manufacturing/factory-physics/index.html)). **[Estimativa, cálculo próprio]** Numa linha determinística vazia em t = 0, com liberação a cada a (a = 0 para fonte saturada), bloqueio depois do serviço e qualquer buffer, a n-ésima peça sai em **Dₙ = T₀ + (n−1)·max(a, t_max)**, com T₀ = Σtⱼ. A recursão foi conferida por simulação em 5 configurações. Isso dá ao sub-plano 4 o "tempo de enchimento exato" (T₀) e a contagem de peças num turno, ⌊(T − T₀)/max(a, t_max)⌋ + 1. Faltam ao caso quatro condições:

- liberação ≥ r_b (senão a vazão é a taxa de liberação);
- rota única sem refugo nem retrabalho;
- sem falhas;
- vazão medida depois do enchimento.

Para as **k estações paralelas**, a capacidade k/c ([StudySmart, Factory Physics](https://www.studysmart.ai/en/summaries/factory-physics-hopp/station-machines-time)) exige que nenhuma máquina fique ociosa com fila em outra. Com roteamento "por percentual" e buffers finitos, a capacidade efetiva fica abaixo de k/c. Numa linha, o "maior tempo de ciclo" dessa estação é c/k. Em `simulation.md`, a linha "k estações paralelas" está fora da tabela (depois do parágrafo) e não renderiza como linha.

**[Fato secundário]** A **disponibilidade** A = m_f/(m_f + m_r) é a de Hopp e Spearman ([GT ISyE 6201, Hw3 Solution](https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-17/Hw3-Solution.pdf), trecho de busca). **[Estimativa, cálculo próprio]** O 240/255 = 94,1% exige três coisas:

- MTBF = tempo em operação entre o fim de um reparo e a próxima falha (se for o ciclo de falha a falha, A = 225/240 = 93,75%);
- falhas no relógio de calendário, ou estação sempre ocupada;
- valor de longo prazo: num turno que começa em operação, com tempos exponenciais, a disponibilidade esperada é 0,9429.

Num turno de 480 min há ~1,9 falhas, e o IC com 30 turnos tem meia-largura ≈ ±2,2 pontos percentuais. O teste precisa de corrida longa ou de muitas replicações. **[Estimativa, cálculo próprio]** O **retrabalho** sem limite dá E[N] = 1/(1−p) passagens, com p constante e independente por passagem. Com o limite da RN-SIM-006 contando **retrabalhos**, como no exemplo da regra ("com limite 2, uma peça defeituosa pela terceira vez vira refugo"), as passagens esperadas são (1 − p^{n+1})/(1−p) e P(refugo) = p^{n+1}. A própria regra, porém, escreve o padrão como "3 passagens". Com p = 0,2, as duas leituras dão refugo de 0,8% ou 0,16% para o padrão 3. A convenção precisa ser fixada antes do teste. Medir passagens só nas peças concluídas de um turno subestima E[N].

| Caso (sub-plano) | Veredito |
| --- | --- |
| M/M/1: L = 4, W = 5 (6) | Certo; faltam fila ilimitada, fonte não bloqueada, sem falhas, L com o serviço, regime estável |
| Média transiente 3,79 em T = 480 (6) | Certo; falta o número de replicações: 30 dão ±0,62 e não separam de 4 |
| Little LL.1 em janela finita (4) | Errado no turno: LL.1 exige vazio em 0 e T; usar LL.2 ou esvaziar a linha |
| Little LL.2 depois do aquecimento (6) | Certo; "exata" significa até o arredondamento |
| Little em regime (6) | Certo; falta λ = entrada (ou saída total) e W de todas as peças quando há refugo |
| Linha em série: vazão e gargalo (4, 6) | Certo; faltam liberação ≥ r_b, rota única, enchimento, gargalo = maior utilização, S = 0 no IC |
| k paralelas: k/c (6) | Certo; falta alimentação sem ociosidade com fila em outra máquina |
| Disponibilidade 94,1% (5) | Certo; faltam significado do MTBF, relógio de calendário, longo prazo e IC de ±2,2 p.p. com 30 turnos |
| Retrabalho 1/(1−p) (5) | Certo sem limite; com o limite, (1−p^{n+1})/(1−p), e a convenção da RN-SIM-006 é ambígua |
| ±5% em L ≈ 1,7×10⁵; ρ = 0,5 cerca de 5× menos (estratégia) | Certo como estimativa (4,7×) |

## O MSER-5 funciona, mas não corta "algumas centenas" no M/M/1

**[Fato]** A especificação mais detalhada está no relatório do analisador final do AutoSimOA ([AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)). Os passos são:

1. Rodar k = 5 replicações piloto e tirar a média delas por índice.
2. Exigir n ≥ 100, "giving at least 20 batches".
3. Agrupar a série em b₀ lotes de 5.
4. Calcular a estatística descartando um lote do início por vez, "until only c (default is c = 5) batches are remaining".
5. Tomar o mínimo e multiplicar por 5 para obter Lsol.
6. Aceitar a estimativa só se ela "falls into the first (b0 − c)/2 batches".

Se o corte for inválido, o analisador gera mais "[z·b] batches", com z = 10%. Depois de "10 invalid estimates … in a row", ele pausa e pergunta ao usuário. Isso fecha com fonte o "Em aberto" da RN-SIM-009: 5 pilotos e 10 tentativas, sendo que a extensão 4b do UC-SIM-003 corresponde à pausa. A estatística é MSER(d) = Σ(Ȳ_j − Ȳ_d)²/(b − d)² sobre as médias dos lotes ([Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)). As observações que não completam um lote ficam no **fim** e são descartadas ([Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)). Usar o **maior** corte entre as saídas tem fonte primária: "The user can decide to run the model for other scenarios, using the largest warm-up period … estimated for all the output variables of interest" ([AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)).

**[Estimativa]** O sub-plano 7 precisa fixar quatro detalhes:

- **A variante.** O AutoSimOA busca em toda a série, menos a cauda, e **depois** rejeita um mínimo na segunda metade. O MSER-GM restringe a busca a {0, …, ⌊n/2⌋} ([Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)) e por isso nunca detecta o caso inválido. A RN-SIM-009 ("estende a corrida e tenta de novo") só faz sentido com a variante do AutoSimOA.
- **O divisor.** O MSER-GM usa n − k e o MSER-LLM usa n − k − 1, e os autores registram que "One could argue" ([Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)).
- **Os empates.** Nenhuma fonte trata deles. Escolher o **menor d** (**[Palpite]**) garante d* = 0 numa série constante, que é um caso real do Takt: a linha determinística.
- **A ambiguidade de ±1** entre "until only c batches are remaining" e "the b0 − c test statistic values". Ela só afeta o último ponto, que nunca é válido.

Não ficou claro se os +10% incidem sobre b₀ ou sobre o b atual. O teto das piloto fica entre 2,0× e 1,1¹⁰ ≈ 2,59× o comprimento inicial. O cálculo é O(b) com somas acumuladas do fim para o começo, subtraindo antes a média global para evitar cancelamento.

**[Fato]** As séries precisam ser **desagregadas por fatia de tempo**, nunca cumulativas, e o AutoSimOA traz um alerta específico sobre lead time. Numa fatia em que nenhuma peça sai, "the average queue time for that time interval would be recorded as zero which is logically incorrect", e o remédio é incluir "the current time spent in the queue by entities that have not yet left" ([AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)). **[Estimativa]** As séries "por minuto" saem do sub-plano 4, e é lá que essa regra precisa ser fixada. Num sistema com ~1 peça/min, a série de lead time por minuto terá muitas fatias vazias.

**[Fato]** O tempo de relaxação do M/M/1 é **τ = 1/(μ(1 − √ρ)²)**. A fórmula está confirmada em fonte primária: Dieker e Warren mostram que, numa rede de filas em série com chegadas Poisson e serviço exponencial, ela "is the same as the relaxation time of an M/M/1 queue … determined by a single bottleneck station" ([Dieker & Warren 2010](https://arxiv.org/abs/0808.0513)). Com ρ = 0,8, τ = 89,7. A fórmula (1+ρ)/(μ(1−√ρ)²) = 161,5 não aparece em nenhuma fonte. **[Estimativa, simulação própria com o gerador do Python]** O MSER-5 não procura o instante em que E[X(t)] chega a 4, que levaria 3 a 5 τ. Ele procura o corte que minimiza o erro-padrão estimado da média restante. Com 5 a 10 replicações piloto e WIP por minuto, a **mediana do corte foi de 10 a 15 unidades de tempo**, com cauda pesada (p90 de 250 a 370) e 4% a 16% de cortes inválidos. Com 50 pilotos, a mediana subiu para ~40. O intervalo de registro muda o resultado: com Δ = 10, a mediana foi 0. A teoria explica o número. A deleção MSE-ótima num AR(1) é **0** quando o viés inicial é de até 1σ ([Pasupathy & Schmeiser 2010, Tabela 1](https://www.informs-sim.org/wsc10papers/017.pdf)). O AutoSimOA registra que o MSER-5 "will increasingly underestimate the truncate point for decreasing severity of bias" ([AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)). No M/M/1 partindo do vazio, o viés (−4) é menor que um desvio-padrão do número no sistema (≈ 4,5).

**[Estimativa]** O teste do UC-SIM-003 no M/M/1 deve afirmar três coisas: o corte é válido, a média truncada com replicação/deleção suficiente cobre L = 4, e a sugestão é o máximo dos cortes por indicador. Para testar a **mecânica** do MSER-5, as séries sintéticas determinísticas funcionam melhor:

- série constante → d* = 0;
- degrau sem ruído em 5k pontos → corte exato 5k;
- degrau que termina na segunda metade → inválido;
- n = 1003 → igual a n = 1000;
- menos de 100 pontos → recusa;
- argmin invariante a y → a·y + b, que serve de propriedade no fast-check.

Os conjuntos publicados do AutoSimOA e de Franklin e White só trazem **distribuições** de desempenho, não cortes pontuais ([Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf)). Servem para testes de limiar, não como "golden tests". O determinismo do Takt permite trocar "continuar de onde parou", que Hoad e Robinson tratam como exigência de guardar o estado ([Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)), por "rodar de novo com T maior e as mesmas subsequências", desde que o horizonte não altere as amostras anteriores. **[Palpite]** Usar subsequências diferentes para as piloto e a execução final evita uma dependência entre o corte e os dados que nenhuma fonte discute.

## Fila, bloqueio, esteira e falhas: cada escolha do esquema muda um caso de validação

**[Fato]** As ferramentas se dividem sobre a fila na frente da estação, em dois estilos:

- **Fila embutida.** No Plant Simulation, a Station é "uma máquina com capacidade 1". A espera é um Buffer separado, e a passagem segue o "push-block": se o sucessor não pode receber, "o princípio de bloqueio é ativado" ([tutorial Plant Simulation, U. Twente 2025](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)). No Arena, o processo Seize-Delay-Release cria a fila sozinho ([Rossetti, seção 2.10](https://rossetti.github.io/RossettiArenaBook/ch2-howArenaWorks.html), fato secundário).
- **Fila separada.** O Server do Simio tem InputBuffer, processamento e OutputBuffer ([Simio textbook](https://textbook.simio.com/Workbook6/the-anatomy-of-objects-server.html), fato secundário). No Simul8, segundo um guia antigo de terceiros, sem fila na saída de um ponto de entrada os itens "podem ser perdidos" ([Sybase PowerDesigner](https://infocenter-archive.sybase.com/help/topic/com.sybase.stf.powerdesigner.docs_12.5.0/html/bpug/bpugp288.htm)).

Nas ferramentas com capacidade verificável (Plant Simulation, Simul8, Simio com OutputBuffer 0), o bloqueio é **depois do serviço** (BAS): a peça terminada fica na máquina, e o Simul8 registra esse tempo como "Blocked" ([Simul8 Help, Hold Work Here](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/hold-work-here/)). Roser et al. tratam "blocked" como estado distinto de "waiting" ([Roser, Nakano, Tanaka 2001](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)). A Source do Plant Simulation, em modo Blocking, **retém** a peça até poder entregá-la ([tutorial, seção 6.4](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)). **[Estimativa]** As três opções de fila são:

- **(A)** fila implícita ilimitada, no estilo Arena;
- **(B)** sem fila e com bloqueio, no estilo Plant Simulation;
- **(C)** fila implícita de capacidade configurável, com 0 significando sem fila, no estilo InputBuffer do Simio.

Nas ferramentas verificadas, há empate de 2 a 2 entre A e B. As três rodam "fonte → estação → expedição" (RN-EDT-003), mas o M/M/1 só sai com fila ilimitada entre a fonte e a estação, porque uma fonte que retém ou perde chegadas deixa de ser Poisson. A recursão Dₙ dos casos de validação vale só com BAS. A revisão de referência sobre bloqueio em linhas, Dallery e Gershwin (1992), tem cópia aberta no [MIT DSpace](https://dspace.mit.edu/handle/1721.1/95914), mas não foi lida.

**[Fato]** O Simul8 tem esteiras "Accumulating" e "Fixed". Na não acumuladora, quando o primeiro item para, "todos os outros itens … também param". A capacidade vem do comprimento e do tamanho do item, e o tempo vem da velocidade ([Simul8 Help, Conveyors](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/conveyors/)). O ProModel calcula o tempo como (comprimento − comprimento da entidade)/velocidade ([ProModel Help](https://promodel.com/onlinehelp/ProModel/80/C-05%20-%20Conveyors.htm), fato secundário). O modelo comercial é, portanto, comprimento e velocidade, com opção de acumular. **[Estimativa]** O MVP não tem distâncias reais (PDR-0007), e o modelo da planta separa posição de comportamento. Por isso o modelo mais simples compatível com o Takt é um **atraso fixo `transitSec` com `capacity`, acumulador e FIFO**: um buffer com tempo mínimo de permanência, como o "dwell time" do Buffer do Plant Simulation. Nenhuma fonte diz qual modelo é o mais usado no ensino.

**[Fato]** O padrão das ferramentas para falhas é o relógio:

- **Simul8:** "O padrão … é quebrar uma Activity com base no tempo decorrido desde o fim do reparo da quebra anterior", e "máquinas podem quebrar mesmo sem estar trabalhando". "Only Count Busy Time" é a alternativa. Com eficiência automática, o Simul8 usa exponencial para o MTBF e **Erlang-2** para o reparo ([Simul8 Help, Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)).
- **Plant Simulation:** oferece "SimulationTime", "operating time" e "processing time". Dados só a disponibilidade e o MTTR, usa exponencial e Erlang ([tutorial, seção 7.7](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)).

**[Fato secundário]** Nos modelos analíticos de linha, a suposição usual é a falha dependente da operação. Modelar uma máquina desse tipo como dependente do tempo subestima a vazão ([HAL emse-00449370](https://hal-emse.ccsd.cnrs.fr/emse-00449370); [Matta e Simone 2016](https://ideas.repec.org/a/taf/tprsxx/v54y2016i6p1850-1862.html)). **[Estimativa]** No relógio de calendário, a disponibilidade medida é MTBF/(MTBF+MTTR) em qualquer carga. No tempo ocupado, a fração parada fica ≈ u·MTTR/MTBF. Com u = 0,5, isso dá 0,969, não 0,941. A escolha também afeta o teste de números aleatórios comuns do sub-plano 5 ("falhas de M1 nos mesmos instantes com o tempo de M3 alterado"). Com falhas no tempo ocupado, M1 sorteia os mesmos tempos até a falha, mas os **instantes** mudam quando M3 altera a carga de M1. O teste só vale como está escrito com falhas no relógio de calendário. Na outra opção, ele precisa comparar as amostras sorteadas.

## OEE, gargalo e roteamento precisam de definições que o texto atual não dá

**[Fato secundário]** Segundo fornecedores que citam a ISO 22400-2, OEE = Availability × Effectiveness × Quality. Availability = APT/PBT, o tempo real de produção sobre o tempo planejado ocupado ([TeepTrak](https://teeptrak.com/en/how-to-calculate-oee-industrial-production-2026/); [Infor MES](https://docs.infor.com/mes/2026.x/en-us/mesuaal/production_overview/beg1725387088865.html)). A norma não foi lida. **[Estimativa]** Sem turnos nem paradas planejadas no MVP, o PBT é a janela de estatística. Se só o tempo processando conta como APT, faminto e bloqueado viram perda de disponibilidade. Uma estação não gargalo perde OEE por falta de peça, e o 94,1% do caso de validação **não aparece**. A alternativa é contar como disponível o tempo planejado menos o tempo em falha e levar faminto e bloqueado ao desempenho. Ela reproduz MTBF/(MTBF+MTTR) e combina com a história do demo ("ligar falhas e ver o OEE cair"). A leitura da norma pelos fornecedores favorece a primeira, mas só a segunda fecha o caso. Restam duas decisões sem fonte: o "ritmo ideal" com tempo aleatório (média, mínimo ou campo próprio) e se a peça retrabalhada conta como boa na qualidade.

**[Fato]** Roser, Nakano e Tanaka (2001) dizem que os dois métodos frequentes para achar o gargalo são o tempo de espera à frente e a carga, "a porcentagem do tempo em que uma máquina está ativa (Law e Kelton 1991)". Os autores mostram onde cada um falha. Com buffers finitos, a espera "fica comprometida", e "a espera em todos os buffers antes do gargalo tende ao infinito, enquanto todos os buffers depois do gargalo tendem a zero". Com cargas de 97% e 99%, os ICs se sobrepõem e há 13,4% de chance de o gargalo ser a outra máquina. Eles propõem o **período ativo médio**: ativo inclui processar e estar em reparo, enquanto faminto e bloqueado são inativos. O cálculo só precisa do log de estados ([Roser et al. 2001](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)). **[Estimativa]** O critério atual de `simulation.md` ("maior utilização, confirmada pela fila acumulada à frente dela") é o mais comum. A confirmação pela fila, porém, falha justamente com buffers finitos. Se "utilização" contar só o tempo processando, uma máquina que falha muito pode ser o gargalo com utilização menor que outra. A forma mais robusta que mantém o conceito dos livros é a maior fração ativa, contando processando + em falha, com IC entre replicações. **[Palpite]** Um aviso de "gargalo indefinido" quando os ICs dos dois primeiros se sobrepõem completa essa forma.

**[Fato secundário]** O Simul8 documenta "Shortest Queue: envia os itens para a fila mais curta" sem regra de desempate. O "Priority" do Simul8 tenta o primeiro destino da lista e passa ao seguinte se ele estiver bloqueado ([Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)). Nenhuma fonte lida fixa uma convenção de desempate para a fila mais curta. **[Estimativa]** As opções determinísticas são quatro:

- **ordem da lista:** explicável, mas enviesa o primeiro destino;
- **menor `id`:** um renomeio muda o resultado;
- **sorteio com uma sequência própria:** sem viés, e o propósito `routing` da chave já a prevê;
- **rodízio:** sem viés e sem gerador, mas guarda estado.

O sub-plano 5 precisa fixar também o que é "fila": só a espera, ou espera + em processo. Precisa fixar ainda se uma peça destinada a um destino cheio espera ou tenta o próximo, e se o percentual é sorteio independente por peça ou proporção determinística.

## O que a pesquisa anterior afirmou e as notas novas corrigem

A [pesquisa sobre aquecimento](aquecimento-em-simulacao-didatica.md) continua válida no essencial: modos, replicação/deleção, MSER-5 como método padrão e os valores 4, 5, 3,79 e 1,73×10⁵. Seis afirmações dela mudam, e o roteiro e `simulation.md` herdaram duas delas.

| Afirmação anterior | O que muda | Base |
| --- | --- | --- |
| "30 replicações de 480 sem aquecimento produzem um IC estreito em torno de 3,79, que **exclui** o valor verdadeiro 4" | **Errada.** A meia-largura é ≈ 0,62, e o IC contém 4. A lição (o viés não diminui com replicações) vale, mas só aparece com ~1.000 replicações | Monte Carlo próprio, desvio-padrão 1,65 por replicação |
| O MSER-5 no M/M/1 com ρ = 0,8 "deve sugerir um corte da ordem de algumas centenas de unidades de tempo, compatível com 3–5τ" | **Errada como expectativa do MSER-5.** 3–5τ é o tempo para o viés pontual sumir; o MSER-5 deu mediana de 10 a 15 com cauda pesada. O texto foi copiado para `simulation.md` e para o sub-plano 7 | Simulação própria; [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf); [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc) |
| Passo 4 do assistente: "procurando o mínimo só na primeira metade da série" | **Incompatível com a regra de nova tentativa.** Essa é a variante MSER-GM, que nunca detecta corte inválido. A RN-SIM-009 pede a do AutoSimOA, que busca tudo menos a cauda e rejeita a segunda metade | [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc) |
| Exclusão da cauda: "ignorando os últimos ~5 lotes", com a divergência "5 points" × "5 batches" deixada em aberto nas notas | **Resolvida:** os textos de 2008 dizem 5 pontos, e os posteriores (analisador final e Hoad & Robinson 2011) dizem **5 lotes** (25 observações) | [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf) |
| Corte inválido = "segunda metade" (Lsol > n/2) | **Refinada:** no analisador final o limite é (b₀ − c)/2 lotes, a metade da faixa efetivamente buscada | [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc) |
| "5 a 10 replicações piloto"; "depois de algumas tentativas inválidas, pausa"; "maior aquecimento" com base na ajuda do Simul8 | **Precisadas com fonte primária:** 5 piloto, n ≥ 100, +10% de lotes, 10 inválidas seguidas; o maior corte entre saídas é recomendação do próprio AutoSimOA | [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc) |

Uma afirmação ganhou fonte. O tempo de relaxação τ = 1/(1−√ρ)², antes "conhecimento prévio, sem fonte primária", está agora confirmado em [Dieker & Warren 2010](https://arxiv.org/abs/0808.0513), que o estendem ao gargalo de uma linha em série com chegadas Poisson e serviço exponencial. As notas também lembram uma falha de cobertura: o lead time por minuto calculado só com as peças que saem precisa da correção de fatias vazias do AutoSimOA, que a pesquisa anterior não mencionava.

## O que muda no roteiro, sub-plano a sub-plano

| # | Achado | O que o roteiro deve mudar |
| --- | --- | --- |
| 1 | O gerador confere com o `.res` oficial; streams e substreams por salto direto dão os mesmos estados | Testes nos **estados inteiros** do `.res`, com sequência g = `CreateStream` g + 1; os dados de referência do gerador são publicados, e nada precisa ser instalado |
| 1 | O pacote não tem "chave → sequência"; a criação em fila quebra os números aleatórios comuns | Pendência explícita: hash da chave (com detecção de colisão na compilação, que leva o teste "chaves diferentes" a verificar colisão) ou inteiro persistido no esquema (decisão que toca o 3); escolher e pesquisar a função de hash |
| 1 | Não há padrão para semente → estado | Opções (a) ns-3, (b) semente no hash, (c) R; vetores próprios para a semente 42 |
| 1 | Licença: C do site é não comercial; GitHub é Apache 2.0 | Nova linha em "Riscos": origem do código e licença, decididas com o usuário e registradas em `references.md` |
| 1 | AS 241 = `qnorm` do R na faixa alcançável; Φ: Cody (`pnorm` do R) | Fechar a pendência do Φ com Cody; teste contra `pnorm`/`qnorm` com tolerância |
| 1 | A normal truncada perde precisão quando o intervalo inteiro está numa cauda | Acrescentar reflexão com o complemento Q; teste com [9, 10] e [8, 9] |
| 1 | `triinv` mudou a ordem dos parâmetros depois da 1.6.3; é GPL | Registrar versão e ordem; usar `Math.sqrt` (não `** 0.5`); casos calculados à mão como fonte da verdade |
| 2 | Pela especificação, só `sqrt` e as quatro operações são exatos; V8, SpiderMonkey e JSC usam libms diferentes | Reduzir a medição a `log` e `exp`; incluir entradas "worst-case" do CORE-MATH e os vetores do gerador; registrar a versão de cada navegador; para a opção (b), os candidatos são o port do fdlibm ou uma versão corretamente arredondada |
| 3 | Fila implícita × buffer explícito; BAS × BBS; fonte que retém × que perde | As três pendências do 3 precisam escolher sabendo que o M/M/1 exige fila ilimitada e fonte não bloqueada, e que a recursão Dₙ exige BAS; incluir estado `blocked` distinto de faminto |
| 3 | Esteira: atraso + capacidade × comprimento/velocidade | Opção mínima: `transitSec` + `capacity`, acumuladora, FIFO |
| 3 | Relógio das falhas, significado do MTBF, distribuições | Nova pendência do 3 (o roteiro só a cita como "parâmetros padrão"): relógio de calendário desde o fim do reparo (padrão das ferramentas) ou tempo ocupado; MTBF = tempo em operação até a falha; exponencial + Erlang como precedente |
| 3 | RN-SIM-006 conta retrabalhos no exemplo e "passagens" no padrão | Fixar a convenção antes do teste do 5; a fórmula truncada (1−p^{n+1})/(1−p) dispensa um limite alto |
| 4 | LL.1 exige vazio em 0 e em T | Trocar o teste por LL.2 no turno (ou esvaziar a linha); comparar Σ tempos por peça na janela com a área do WIP, com tolerância relativa |
| 4 | Dₙ = T₀ + (n−1)·max(a, t_max) com BAS | Usar como oráculo do teste "vazão e tempo de enchimento exatos" |
| 4 | Séries por fatia de tempo; lead time com fatias vazias | Fixar a regra do AutoSimOA (incluir o tempo corrente das peças) ou uma fatia maior para o lead time |
| 4 | Custo dos testes longos | Insumo para a pendência "PR ou noturno": 1,73×10⁵ (ρ = 0,8), 3,7×10⁴ (ρ = 0,5), ~4,8×10⁵ para separar 3,79 de 4 |
| 5 | 94,1% só fecha com relógio de calendário e OEE que não conta faminto e bloqueado como indisponível | Escrever as condições no teste; nova pendência: definição da disponibilidade no OEE, ritmo ideal e retrabalho na qualidade |
| 5 | Teste de números aleatórios comuns com falhas no tempo ocupado | Comparar as amostras sorteadas, não os instantes, se o 3 escolher tempo ocupado |
| 5 | Gargalo: maior utilização é o mais comum; a fila não confirma com buffers finitos | Definir "ativo" (processando + em falha) e o IC; avaliar o aviso de gargalo indefinido |
| 5 | Desempate da fila mais curta sem convenção publicada | Quatro opções; fixar também a definição de "fila", o destino cheio e o modo do percentual |
| 6 | Quantil da t não está planejado | Nova pendência: tabela de 96 constantes (gl 4 a 99) gerada pelo `qt` e conferida contra a NIST; tratar S = 0 |
| 6 | 3,79 com 30 replicações não distingue de 4 | Teste com ≥ 1.000 replicações (noturno) ou alvo E[L(10)] = 2,030 |
| 6 | M/M/1, Hopp e Spearman, Little em regime | Escrever as condições de cada caso no teste; Little com refugo usa λ de entrada e W de todas as peças |
| 7 | MSER-5 com fonte: 5 piloto, n ≥ 100, c = 5 lotes, (b₀ − c)/2, +10%, 10 tentativas | Fechar o "Em aberto" da RN-SIM-009 e do ADR-0011 com esses valores; fixar a variante do AutoSimOA, o divisor, o empate pelo menor d e o descarte do resto no fim |
| 7 | O corte típico no M/M/1 é pequeno e de cauda pesada | Trocar "algumas centenas" por "corte válido + IC cobre L = 4 + máximo por indicador"; testar a mecânica com séries sintéticas; corrigir a linha de `simulation.md` no mesmo pull request |
| 7 | Determinismo permite re-simular com T maior | Decidir entre guardar o estado final ou re-simular; usar subsequências distintas para piloto e execução final |
| 8 | Nenhum achado das notas | Sem mudança |
| 9 | Tetos sem literatura (como já diz o ADR-0011) | Considerar ~0,07 ms por salto de chave e o crescimento de até 2,59× das piloto na medição |

As pendências do roteiro, com as opções que a literatura dá e a mais comum quando ela existe:

| Pendência (sub-plano) | Opções | Mais comum |
| --- | --- | --- |
| Semente → estado (1) | Cópia nos 6 valores (ns-3); semente do pacote fixa e semente no hash; LCG do R | Não há padrão; a recomendação comum é variar a subsequência, não a semente |
| Chave → sequência (1) | Criação em fila; número fixo por variável (ns-3 `Stream`); hash da chave | Criação em fila, que quebra os números aleatórios comuns; entre as robustas, o número fixo |
| Φ da normal (1) | Cody/SPECFUN; Hart/West; Marsaglia; A&S 26.2.17 | A&S 26.2.17 é a mais difundida, mas tem 7,5×10⁻⁸; em dupla precisão, Cody (R) |
| Ferramenta de navegador (2) | Fora destas notas | — |
| Funções próprias na D4 (2) | Port do fdlibm; CORE-MATH ou libc do LLVM | Não determinado |
| Fila na frente da estação (3) | Implícita ilimitada; sem fila com bloqueio; capacidade configurável | Empate 2 a 2 nas ferramentas verificadas |
| Bloqueio (3) | BAS; BBS | BAS (Plant Simulation, Simul8, Simio) |
| Fonte com destino cheio (3) | Reter; perder; fila ilimitada | Não determinado |
| Esteira (3) | Atraso + capacidade; comprimento/velocidade; não acumuladora | Comprimento/velocidade com opção de acumular, nas ferramentas comerciais |
| Relógio das falhas (3) | Calendário; tempo ocupado; tempo operacional | Calendário desde o fim do reparo nas ferramentas; tempo ocupado na teoria de linhas |
| Distribuições de falha e reparo (3) | — | Exponencial e Erlang (Simul8, Plant Simulation) |
| Limite de retrabalho (3) | Contar retrabalhos; contar passagens | Não determinado; a RN-SIM-006 se contradiz |
| Desempate da fila mais curta (5) | Ordem da lista; menor `id`; sorteio; rodízio | Nenhuma convenção publicada |
| Disponibilidade no OEE (5) | Tempo processando/planejado; (planejado − falha)/planejado | A primeira, pela leitura dos fornecedores da ISO 22400-2 |
| Gargalo (5) | Maior utilização; maior espera; período ativo médio | Maior utilização ou carga |
| Quantil da t (6, nova) | Tabela; Hill 396; Hill + Taylor; Cornish-Fisher | Hill 396 em software (R, Boost) |
| Estado no modo continuar e nas extensões (6, 7) | Guardar o estado final; re-simular com T maior | Guardar o estado (Hoad & Robinson) |
| Piloto, tentativas e extensão (7) | — | 5 piloto, +10% de lotes, 10 inválidas seguidas (AutoSimOA) |
| Variante do MSER (7) | AutoSimOA; MSER-GM; MSER-LLM | MSER-GM com K = {0…⌊n/2⌋} é a "common suggestion"; a RN-SIM-009 exige a do AutoSimOA |

## Conclusão

O ponto que a literatura muda no roteiro não é numérico, é de ordem. O roteiro trata as escolhas do esquema (fila, bloqueio, relógio das falhas, OEE) como pendências de modelagem do sub-plano 3. Os testes dos sub-planos 5 e 6, que são o "mostrável" do marco, só passam com uma combinação específica dessas escolhas. O 94,1% exige falhas no relógio de calendário e uma disponibilidade que não pune o faminto. O M/M/1 exige fila ilimitada e fonte que nunca segura chegadas. O oráculo exato da linha em série exige BAS. Escolher no 3 sem olhar os casos de validação pode transformar um teste correto num teste falho. O caminho é decidir no 3 com a tabela de validação aberta e escrever as condições no nome ou no arranjo de cada teste.

Os dois erros herdados vêm da mesma origem: confundir a escala do transiente com a resolução do teste. Tanto o "30 replicações revelam o viés" quanto o "o MSER-5 corta algumas centenas" supõem que o viés de começar vazio domina o ruído, e no M/M/1 com ρ = 0,8 é o contrário. O desvio-padrão por turno (1,65) é oito vezes o viés (0,21), e o MSER-5 enxerga isso e corta pouco. É exatamente a lição didática que a pesquisa anterior queria dar ("o gargalo da validação é a variância"), agora aplicada aos próprios testes. Para a D4, o recado é que a medição deixou de ser exploratória. A especificação e o código dos motores já dizem que `log` e `exp` divergem, e o sub-plano 2 serve mais para dar o tamanho da divergência e escolher a implementação própria do que para descobrir se ela existe.

## Lacunas e incertezas

- **Fontes primárias não lidas.** Não foram lidos o texto de Hopp e Spearman (*Factory Physics*), de Law (*Simulation Modeling and Analysis*), de Dallery e Gershwin (1992), da ISO 22400-2, de Nakajima, de Cody (1969), de Wichura (1988), de Hill (1970, 1981), de Botev (2017), de Abate e Whitt (1987) nem de Whitt (1989). Para esses, as fórmulas vêm de material de curso, de fornecedores, do código que implementa o algoritmo ou de cálculo próprio.
- **Recomendações não verificadas.** Ficam sem verificação a recomendação de Law sobre falhas em tempo ocupado, a afirmação de que BAS é o padrão em manufatura segundo Dallery e Gershwin e o desempate das regras "smallest" do Arena.
- **Navegadores e licenças.** O comportamento do Firefox atual e do Safari não foi medido. O código do SpiderMonkey lido é de fevereiro de 2025. A correspondência entre V8 15 e versões do Chrome não foi conferida. As licenças do CORE-MATH e da libc do LLVM não foram conferidas na fonte, e a interpretação jurídica da licença do RngStreams é do usuário.
- **AutoSimOA.** As fórmulas exatas estão em equações embutidas nos `.doc` e não foram extraídas. Não está claro se os +10% incidem sobre b₀ ou sobre o b atual, nem se o artigo publicado em 2011 mudou os padrões.
- **Resultados próprios.** O corte do MSER-5 no M/M/1 vem de simulação própria com o gerador do Python, com 60 a 400 conjuntos por célula, e os percentis da cauda têm erro amostral apreciável. A forma fechada g(0) = −ρ/(1−ρ)³ e a recursão Dₙ são derivações próprias, conferidas numericamente, sem fonte publicada lida.

## Referências

- Abramowitz, M.; Stegun, I. A. *Handbook of Mathematical Functions*, p. 932 (26.2.16–26.2.19). https://personal.math.ubc.ca/~cbm/aands/page_932.htm
- AutoSimOA (Hoad, K.; Robinson, S.; Davies, R.). "Automating discrete event simulation output analysis" (relatório do analisador final, .doc). Warwick Business School. https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc
- AutoSimOA. "Automating warm-up length estimation. Part 1: Review of methods and shortlisting" (.doc), 2008. https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part1_review_of_methods_and_shortlisting.doc
- AutoSimOA. "Automating warm-up length estimation. Part 2: MSER-5 – a full analysis" (.doc), 2008. https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc
- Boost.Math. `t_distribution_inv.hpp` (via resumo de busca). https://live.boost.org/doc/libs/1_80_0/boost/math/special_functions/detail/t_distribution_inv.hpp
- Botev, Z. TruncatedNormal (pacote R): `trandn.R`, `cases.R`, `lnNpr_cholperm_Phinv.cpp`. https://raw.githubusercontent.com/cran/TruncatedNormal/master/R/trandn.R ; https://raw.githubusercontent.com/cran/TruncatedNormal/master/R/cases.R ; https://raw.githubusercontent.com/cran/TruncatedNormal/master/src/lnNpr_cholperm_Phinv.cpp
- Botev, Z. 2017. "The normal law under linear restrictions: simulation and estimation via minimax tilting". *JRSS-B* 79(1). https://arxiv.org/abs/1603.04166
- Dallery, Y.; Gershwin, S. B. 1992. "Manufacturing flow line systems: a review of models and analytical results". *Queueing Systems* 12:3–94. https://dspace.mit.edu/handle/1721.1/95914 (não lido)
- Dieker, A. B.; Warren, J. 2010. "Series Jackson networks and non-crossing probabilities". *Mathematics of Operations Research* 35:257–266. https://arxiv.org/abs/0808.0513
- ECMA-262 (ECMAScript). Numeric Types (6.1.6.1) e Function Properties of the Math Object (21.3.2). https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html ; https://tc39.es/ecma262/multipage/numbers-and-dates.html
- Franklin, W. W.; White, K. P. 2008. "Stationarity tests and MSER-5". *Proceedings of the 2008 WSC*. https://www.informs-sim.org/wsc08papers/064.pdf
- Georgia Tech ISyE 6201 (Reveliotis). Hw-4 (2007) e Hw3 Solution (2017), via trechos de busca. https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-07/Hw-4.pdf ; https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-17/Hw3-Solution.pdf
- Hill, G. W. 1970. "Algorithm 396: Student's t-quantiles", tradução Fortran de A. Miller. https://jblevins.org/mirror/amiller/cacm396.f90
- Hoad, K.; Robinson, S. 2011. "Implementing MSER-5 in commercial simulation software and its wider implications". *Proceedings of the 2011 WSC*. https://www.informs-sim.org/wsc11papers/044.pdf
- Hoad, K.; Robinson, S.; Davies, R. 2008. "Automating warm-up length estimation". *Proceedings of the 2008 WSC*. https://www.informs-sim.org/wsc08papers/063.pdf
- Infor MES. Production overview (OEE). https://docs.infor.com/mes/2026.x/en-us/mesuaal/production_overview/beg1725387088865.html
- JavaScriptCore (WebKit). `MathCommon.h`. https://raw.githubusercontent.com/WebKit/WebKit/main/Source/JavaScriptCore/runtime/MathCommon.h
- Kelton et al. *Simio and Simulation* (notas em RPubs). https://rstudio-pubs-static.s3.amazonaws.com/305152_deb4ef47278a4a20a136768a8293127e.html
- L'Ecuyer, P.; Simard, R.; Chen, E. J.; Kelton, W. D. 2002. "An object-oriented random-number package with many long streams and substreams". *Operations Research* 50(6):1073–1075. https://www-labs.iro.umontreal.ca/~lecuyer/myftp/papers/streams00.pdf ; documento longo: https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex
- L'Ecuyer, P. RngStreams: `RngStream.c`, `test2RngStream.res` (C e C++), README. https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c ; https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/test2RngStream.res ; https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/test2RngStream.res ; https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/README
- L'Ecuyer, P. RngStreams no GitHub (Apache 2.0). https://github.com/umontreal-simul/RngStreams
- L'Ecuyer, P.; Munger, D.; Oreshkin, B.; Simard, R. 2017. "Random numbers for parallel computers: requirements and methods, with emphasis on GPUs". *Math. Comput. Simul.* 135:3–17 (preprint G-2015-35). https://www.gerad.ca/papers/G-2015-35.pdf
- Law, A. M. 2004. "Statistical analysis of simulation output data: the practical state of the art". *Proceedings of the 2004 WSC*. https://www.informs-sim.org/wsc04papers/009.pdf
- Little, J. D. C. 2011. "Little's Law as viewed on its 50th anniversary". *Operations Research* 59(3):536–549. https://pubsonline.informs.org/doi/10.1287/opre.1110.0940 ; reimpressão: https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/
- LLVM libc, math. https://libc.llvm.org/headers/math/index.html
- Marsaglia, G. 2004. "Evaluating the normal distribution". *Journal of Statistical Software* 11(4). https://www.jstatsoft.org/article/view/v011i04
- Matta, A.; Simone, F. 2016. *International Journal of Production Research* 54(6):1850–1862 (via resumo). https://ideas.repec.org/a/taf/tprsxx/v54y2016i6p1850-1862.html
- MATLAB. RandStream. https://www.mathworks.com/help/matlab/ref/randstream.html
- MDN. Math. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- MetricGate. M/M/1 estacionária. https://metricgate.com/docs/queue-mm1-stationary/
- Ni, E. C.; Henderson, S. G. "How hard are steady-state queueing simulations?" https://people.orie.cornell.edu/shane/pubs/howhard.pdf
- NIST/SEMATECH e-Handbook of Statistical Methods. Critical values of the Student's t distribution. https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
- nico/js-math-bench. https://github.com/nico/js-math-bench
- ns-3. Manual, Random Variables; `rng-stream.cc`. https://www.nsnam.org/docs/manual/html/random-variables.html ; https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc
- Octave statistics. `triinv.m`. https://raw.githubusercontent.com/gnu-octave/statistics/main/inst/Distribution_Functions/triinv.m
- Pasupathy, R.; Schmeiser, B. 2010. "The initial transient in steady-state point estimation". *Proceedings of the 2010 WSC*. https://www.informs-sim.org/wsc10papers/017.pdf
- ProModel Help. Conveyors (via resumo). https://promodel.com/onlinehelp/ProModel/80/C-05%20-%20Conveyors.htm
- R. `src/main/RNG.c`, `src/nmath/qnorm.c`, `pnorm.c`, `qt.c`; `?Random`. https://github.com/wch/r-source/blob/trunk/src/main/RNG.c ; https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/qnorm.c ; https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/pnorm.c ; https://raw.githubusercontent.com/wch/r-source/trunk/src/nmath/qt.c ; https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random.html
- Roser, C.; Nakano, M.; Tanaka, M. 2001. "A practical bottleneck detection method". *Proceedings of the 2001 WSC* (preprint). https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf
- Rossetti, M. *Simulation Modeling and Arena*, seção 2.10. https://rossetti.github.io/RossettiArenaBook/ch2-howArenaWorks.html
- Sánchez, P. J.; White, K. P. 2011. "Interval estimation using replication/deletion and MSER truncation". *Proceedings of the 2011 WSC*. https://www.informs-sim.org/wsc11papers/043.pdf
- Simio. *Simulation Modeling with Simio*, 6ª ed., "Anatomy of objects: Server". https://textbook.simio.com/Workbook6/the-anatomy-of-objects-server.html
- Simul8 Help: Conveyors; Efficiency; Hold Work Here; Routing Out. https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/conveyors/ ; https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/ ; https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/hold-work-here/ ; https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/
- SpiderMonkey. `jsmath.cpp` (espelho gecko-dev, fevereiro de 2025). https://raw.githubusercontent.com/mozilla/gecko-dev/master/js/src/jsmath.cpp
- StatLib. Algorithm AS 241 (PPND7, PPND16). https://lib.stat.cmu.edu/apstat/241
- StudySmart. Resumos de *Factory Physics* (secundário). https://www.studysmart.ai/en/summaries/factory-physics-hopp/station-machines-time
- Sybase PowerDesigner 12.5, cap. 10 (SIMUL8). https://infocenter-archive.sybase.com/help/topic/com.sybase.stf.powerdesigner.docs_12.5.0/html/bpug/bpugp288.htm
- TeepTrak. "How to calculate OEE (2026)". https://teeptrak.com/en/how-to-calculate-oee-industrial-production-2026/
- Universidade de Twente. Tutorial Plant Simulation 2404 (2025). https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf
- V8. Commits 08be4445f6 (`log`), e5bb55463b (`exp`), 716d3e3363 (`pow`); `ieee754.cc`; `v8-version.h`. https://github.com/v8/v8/commit/08be4445f60b3470b2b3130c97d41f09472bd076 ; https://github.com/v8/v8/commit/e5bb55463b592ea0cb9480736146941c10e6bb62 ; https://github.com/v8/v8/commit/716d3e3363c5bdb26e6de68327f6a1c559b8bf19 ; https://raw.githubusercontent.com/nodejs/node/main/deps/v8/src/base/ieee754.cc ; https://raw.githubusercontent.com/v8/v8/08be4445f6/include/v8-version.h
- West, G. 2005. "Better approximations to cumulative normal functions". *Wilmott Magazine*. https://s2.smu.edu/~aleskovs/emis/sqc2/accuratecumnorm.pdf
- "Failure models and throughput rate of transfer lines" (via resumo). https://hal-emse.ccsd.cnrs.fr/emse-00449370
