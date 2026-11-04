# Gerador MRG32k3a e pacote RngStreams para o motor em TypeScript

Notas de pesquisa (2026-11-04) para o roteiro do motor (`docs/plans/2026-11-04-roteiro-motor.md`, interface "Gerador" e pendência "semente única → estado inicial; chave → sequência independente"). Citações literais ficam em inglês. "Fato" tem link; "Inferência" é raciocínio meu sobre os fatos; "Estimativa" é número calculado ou medido por mim, não publicado.

Verificação feita nesta pesquisa: baixei o código C oficial (`RngStream.c`) e o programa de teste com a saída esperada (`test2RngStream.c` / `.res`) do site de L'Ecuyer, transcrevi o C literalmente para JavaScript (`Number`, Node v24.22.2) e rodei o mesmo teste. **Todos os estados e valores da saída de referência bateram**, inclusive os da versão C++ com mais casas decimais. Os scripts ficaram em rascunho fora do repositório (`/tmp/claude-1000/-home-italoamaral-virtual-factory/b8b7f604-0c34-4d5f-bf6a-6c2934068aea/scratchpad/port/rng.mjs`, `test2.mjs`, `jump.mjs`, `jump2.mjs`) e são temporários.

## 1. Recorrência, módulos, multiplicadores, normalização, período, espaçamento e restrições da semente

### Takeaway
MRG32k3a combina duas recorrências de ordem 3 com m1 = 2^32 − 209 e m2 = 2^32 − 22853; a saída fica estritamente em (0, 1); período ≈ 2^191; o RngStreams corta o ciclo em 2^64 sequências (streams) de 2^127 passos, cada uma em 2^51 subsequências (substreams) de 2^76. Cada metade da semente (3 valores) deve ser inteiro em [0, m) e não toda zero.

### Cited Findings
- Recorrência (documento longo do pacote, `streams4.tex`, versão estendida de L'Ecuyer, Simard, Chen e Kelton 2002): "x_{1,n} = (1403580 × x_{1,n-2} − 810728 × x_{1,n-3}) mod m_1" e "x_{2,n} = (527612 × x_{2,n-1} − 1370589 × x_{2,n-3}) mod m_2", "where m_1 = 2^32 − 209 = 4294967087 and m_2 = 2^32 − 22853 = 4294944443" — [streams4.tex (diretório c++ do pacote)](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex); artigo publicado: [L'Ecuyer et al. 2002, Operations Research 50(6):1073–1075](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/papers/streams00.pdf).
- Coeficientes nomeados: "a_{11}=0, a_{12}=1403580, a_{13}=−810728, … a_{21}=527612, a_{22}=0, and a_{23}=−1370589"; "Its coefficients satisfy the condition that a_{ij}(m_j − 1) < 2^53, so that the recurrence has a fast implementation in floating point arithmetic." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Combinação e normalização: "z_n = (x_{1,n} − x_{2,n}) mod 4294967087"; "u_n = z_n / 4294967088 if z_n > 0; 4294967087 / 4294967088 if z_n = 0" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex). No C: `#define norm 2.328306549295727688e-10` (= 1/(m1+1)) e `u = ((p1 > p2) ? (p1 - p2) * norm : (p1 - p2 + m1) * norm);` — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c). Logo o menor valor possível é 1/(m1+1) ≈ 2,33×10⁻¹⁰ e o maior é m1/(m1+1); 0 e 1 nunca saem.
- Período: "Its period length is ρ = (m_1^3 − 1)(m_2^3 − 1)/2 ≈ 2^191 ≈ 3.1×10^57." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Streams e substreams: "We have selected v=51 and w=76, so W = 2^76 and Z = 2^127." O ciclo é cortado em streams de comprimento Z = 2^z, cada um em V = 2^v substreams de comprimento W = 2^w; "I_1 = s_0, I_2 = T^Z(s_0), …, I_g = T^Z(I_{g−1}) = T^{(g−1)Z}(s_0)"; "The first substream of stream g starts in state I_g, the second one in state T^W(I_g), the third one in state T^{2W}(I_g)" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Quantidade: "each instance of RngStream can assume different disjoint streams of which there are 2^64 ≈ 1.8 × 10^19" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex). Motivo das escolhas: teste espectral para valores espaçados de 2^l, "the uniformity was particularly good for l=51,76, and 127" — mesma fonte.
- Restrições da semente: "The first 3 integers in the seed must all be less than m_1 = 4294967087, and not all 0; and the last 3 integers must all be less than m_2 = 4294944443, and not all 0." e "If this method is not called, the default initial seed is (12345, 12345, 12345, 12345, 12345, 12345)." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex). No C, `CheckSeed` rejeita `seed[i] >= m1` (i = 0..2), `seed[i] >= m2` (i = 3..5) e as metades todas zero — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c). O R documenta a mesma regra para "L'Ecuyer-CMRG": "Neither the first three nor the last three should be all zero, and they are limited to less than 4294967087 and 4294944443 respectively." — [R, ?Random](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random.html).
- Precisão: "the generator gives no more than 32 bits of precision even though it returns 53-bit floating-point numbers"; há o modo `IncreasedPrecis`, que consome 2 passos por número, "u = (s.RandU01() + s.RandU01() * fact) % 1.0 where the constant fact is equal to 2^{-24}" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Matrizes de salto já calculadas no código oficial (primeira linha): `A1p127 = {2427906178, 3580155704, 949770784}, …`, `A1p76 = {82758667, 1871391091, 4127413238}, …` (as 4 matrizes completas, mais `InvA1`/`InvA2` para salto para trás, estão no arquivo) — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c).
- Fonte primária do gerador (citada pelo pacote, não lida aqui por inteiro): [L'Ecuyer 1999, "Good Parameter Sets for Combined Multiple Recursive Random Number Generators", Operations Research 47(1):159–164](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/papers/opres-combmrg2-1999.pdf).

### Inferences
- Para o motor, só `RandU01` sem precisão aumentada e sem antitético é necessário; os demais modos podem ficar fora (menos código, menos testes).
- A saída em (0, 1) aberto atende a interface do roteiro ("uniformes em (0, 1)") e protege a inversa das distribuições contra log(0) ou quantil infinito, sem tratamento extra.
- Conferi por cálculo próprio que elevar a matriz de transição A ao quadrado 127 e 76 vezes reproduz as constantes `A1p127` e `A1p76` do código oficial (primeira linha conferida). Isso permite gerar as tabelas no próprio código em vez de copiá-las, ou copiá-las e testá-las contra o cálculo.

### Gaps
- Não li o artigo de 1999 por inteiro; os parâmetros vêm do documento de 2002 e do código C, que o citam como origem.

## 2. Criação de streams no RngStreams, salto para índice arbitrário e custo

### Takeaway
O RngStreams cria streams em sequência: cada `CreateStream` usa `nextSeed` e o avança 2^127 passos. Não há método público para "ir direto ao stream g"; `AdvanceState(e, c)` só salta 2^e + c passos. Mas o salto para o stream g é a mesma álgebra (A^(g·2^127) mod m por exponenciação binária), e o ns-3 já faz exatamente isso com tabela de potências de 2. Medi em JS que o salto direto dá o mesmo estado que criar streams em sequência, a ~0,07–0,08 ms por salto.

### Cited Findings
- Criação sequencial: "Each time a new RngStream object is created, its starting point (initial seed) I_g is set Z=2^127 steps ahead of the starting point of the last created object. A vector named nextSeed is used to keep the seed values of the next created RngStream object" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex). No C: `MatVecModM (A1p127, nextSeed, nextSeed, m1); MatVecModM (A2p127, &nextSeed[3], &nextSeed[3], m2);` dentro de `RngStream_CreateStream` — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c).
- Próxima subsequência: `RngStream_ResetNextSubstream` aplica `A1p76`/`A2p76` a `Bg` — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c).
- `AdvanceState`: "If e > 0, then n = 2^e + c; if e < 0, then n = −2^{−e} + c; and if e = 0, then n = c. Note: c is allowed to take negative values. We discourage the use of this method." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex). No C, `c` é `long` e `MatPowModM` (A^n por decomposição binária de n) é função privada (`static`) — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c).
- Algoritmo do salto: "The matrix A_j^ν mod m_j is computed via a standard divide-and-conquer algorithm (Knuth), and can be precomputed once for ν = W and ν = Z." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- `SetSeed` por stream é desencorajado: "after calling this method, the initial seeds of the streams are no longer spaced Z values apart. We discourage the use of this method" — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- O ns-3 salta direto para stream e substream arbitrários: o construtor `RngStream(uint32_t seedNumber, uint64_t stream, uint64_t substream)` põe os 6 valores iguais à semente e chama `AdvanceNthBy(stream, 127, …)` e `AdvanceNthBy(substream, 76, …)`; `AdvanceNthBy` percorre os 64 bits do índice e, para cada bit 1, aplica a matriz pré-calculada A^(2^(by+bit)) (tabela `Precalculated` com as potências 2^1 a 2^190) — [ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc) (licença `GPL-2.0-only`).
- L'Ecuyer et al. (2017) citam outra forma de salto arbitrário para MRG32k3a: Bradley et al. "precompute and store A^p for all p of the form p = i b^e … They choose b = 8 and e_max = 20" — [L'Ecuyer, Munger, Oreshkin, Simard, "Random numbers for parallel computers: requirements and methods, with emphasis on GPUs", Math. Comput. Simul. 135 (2017) 3–17, preprint GERAD G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- Período de saltos da ordem de 2^127 é fixo no RngStreams: "In most software with multiple streams, the length ν of the streams is fixed to a very large constant (e.g., ν = 2^127 in the RngStream package …)" — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).

### Inferences
- **Verificado por mim (não publicado):** com a semente padrão (12345 ×6), o estado inicial do stream de índice 1000 calculado por (A^(2^127))^1000 · s0 é igual ao obtido criando 1001 streams em sequência: `{316585915, 3866174274, 842974265, 1877456320, 1217882180, 1500026431}`. Com a tabela de potências de 2 no estilo ns-3, stream 1000 + substream 7 deu `{3620105340, 99468529, 4161568603, 3746947078, 1557642144, 1316682058}`, igual ao caminho sequencial (`CreateStream` ×1001 + `ResetNextSubstream` ×7). Esses dois vetores servem de teste para um salto direto, mas são cálculo meu, não da referência oficial.
- **Estimativa (medida minha, Node v24, código JS sem otimização, uma máquina WSL2):** salto para índice de 64 bits via exponenciação binária de A^(2^127): ~0,083 ms; via tabela pré-calculada (estilo ns-3) para stream + substream: ~0,068 ms; montar a tabela de 191 potências: ~8 ms. Para algumas centenas a poucos milhares de chaves, isso é dezenas de ms por execução (uma vez por chave; a subsequência de cada replicação é um salto a mais ou uma multiplicação por A^(2^76)). O custo dominante na minha medida é alocação de arrays e `BigInt`, não a aritmética.
- A matemática do salto direto é a mesma do pacote; a "extensão" necessária é só expor `MatPowModM` sobre `A1p127`/`A2p127` (ou a tabela). Não muda o gerador nem as sequências.

### Gaps
- Não encontrei, no pacote oficial, função pública de salto para índice de stream; a prática publicada que encontrei é a do ns-3 (código) e a de Bradley et al. (citada em 2017, não lida).

## 3. Como ferramentas mapeiam um elemento aleatório a um stream estável (números aleatórios comuns)

### Takeaway
A literatura recomenda exatamente o desenho do roteiro: um stream por fonte de aleatoriedade e uma subsequência por replicação. A atribuição sequencial ("na ordem de criação") só preserva a sincronização se a ordem for a mesma em todas as configurações; o ns-3 documenta o problema e resolve com número de stream fixo por variável. Não achei ferramenta de simulação que use hash de chave para índice de stream; a análise de colisão vem da literatura de sementes aleatórias e chaves aleatórias.

### Cited Findings
- Recomendação para CRN: "assign different streams to different places where random numbers are needed in the model (e.g., to compare queuing systems, use one stream for interarrival times, one stream for the service times at each queue, one stream for a routing decision, etc.). To make sure that each stream starts from the same state across the different systems, assign run j to the j^th substream, within each stream." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Mesma ideia em 2017: "one would use a separate stream for each required source of random numbers in the system, and use one substream for each of the n independent runs" — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- O risco da criação sequencial: com um monitor central, "For reproducibility, the user must make sure that they are created in the same order and used for the same purpose in different configurations." — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- ns-3, atribuição automática: streams dados em sequência quando cada variável é usada; a documentação avisa que, ao mudar a configuração, "the mapping of RandomVariables to streams may (or may not) change" (exemplo: trocar o protocolo de roteamento muda o padrão de mobilidade). Remédio: atributo `Stream` fixo por variável — [ns-3 manual, Random Variables](https://www.nsnam.org/docs/manual/html/random-variables.html).
- ns-3 divide o espaço de 2^64 streams em dois: "The first 2^63 streams are reserved for automatic stream number assignment" e "The last 2^63 streams are reserved for deterministic stream number assignment" (`target = base + stream`, `base = 1ULL << 63`) — [ns-3 random-variable-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/random-variable-stream.cc).
- Sementes aleatórias por stream (alternativa ao particionamento): "the probability that none of those streams overlap anywhere is approximately p = (1 − sℓ/ρ)^{s−1}"; "the probability that there is overlap somewhere is 1 − p ≈ … ≈ s²ℓ/ρ"; para chaves aleatórias (ℓ = 1), "if s = 2^30 (about one billion) random 128-bit keys are selected, the probability that they are not all distinct is approximately 2^60/2^128 = 2^{−68}" — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- Hash como fonte de streams aparece na literatura de paralelismo: Phillips "propose one stream per thread per kernel call, based on a hash function, which uses a global seed broadcast to all threads, the thread id, and a counter"; e "Splittable streams are also proposed in [8], using a hash function to determine the new streams when splitting occurs" — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- MATLAB: `mrg32k3a` tem streams e substreams; "Values generated from different substreams are mutually independent"; a tabela dá "2^63 parallel streams through sequence splitting, each of length 2^127" — [MATLAB RandStream](https://www.mathworks.com/help/matlab/ref/randstream.html), [Creating and Controlling a Random Number Stream](https://www.mathworks.com/help/matlab/math/creating-and-controlling-a-random-number-stream.html).
- Arena e AutoMod: um resumo de busca atribui a L'Ecuyer (WSC 2001) a frase de que o pacote "has been implemented in the most recent releases of the Arena and AutoMod simulation environments" — [WSC 2001, informs-sim.org](https://informs-sim.org/wsc01papers/012.PDF). **Não consegui extrair o texto do PDF para confirmar a frase literal.**
- Simio: só achei relato de usuário de que `RandomRow(RandomNumberStream)` aceita número inteiro de stream — [fórum Simio](https://forum.simio.com/topic/3536-randomrow-and-random-streams/) (fonte fraca, não oficial).
- SimOpt (Python) usa MRG32k3a com três níveis (stream, substream, subsubstream) e índice explícito `[s, ss, sss]`, com espaçamentos 2^141, 2^94, 2^47 — segundo [PyPI mrg32k3a-numba](https://pypi.org/project/mrg32k3a-numba/) e [Eckman, Henderson, Shashaani 2023, INFORMS J. Computing 35(2)](https://ideas.repec.org/a/inm/orijoc/v35y2023i2p495-508.html) (vistos só por resumo de busca; não conferi o código).

### Inferences
- O desenho do roteiro (stream por chave `<elementId>:<purpose>`, subsequência por replicação) é o recomendado por L'Ecuyer (2002, 2017). O que a literatura não oferece pronto é o mapeamento **chave → índice** que não depende da ordem; o ns-3 resolve com números fixos escolhidos pelo usuário, o que equivale a "índice estável por chave".
- Duas formas de obter o índice estável:
  1. **Hash da chave para um índice de stream** (64 bits, ou 53 bits para ficar em `Number`). Os streams continuam disjuntos por construção; o único risco é dois índices iguais. **Estimativa (aniversário, s²/2^(b+1)):** com s = 10 000 chaves, ≈ 2,7×10⁻¹² em 64 bits e ≈ 5,6×10⁻⁹ em 53 bits. Como todas as chaves da planta são conhecidas ao compilar o modelo, a colisão pode ser **detectada** de forma determinística (conjunto de índices) e tratada (erro, ou regra de desempate fixa) — nunca silenciosa.
  2. **Número inteiro persistido por elemento** no documento da planta (como o `Stream` fixo do ns-3), atribuído na criação e nunca reutilizado. Elimina colisão, mas põe um campo técnico no esquema e exige cuidado na cópia/importação de elementos. É decisão de esquema (sub-plano 3), não do gerador.
- Hash direto da chave para uma **semente de 6 valores** (sem usar a partição em streams) também é aceitável pela fórmula de 2017 (período 2^191; ver estimativa na seção 7), mas perde a garantia de disjunção e contraria o conselho do pacote contra `SetSeed` por stream. A opção 1 é mais segura.

### Gaps
- Não achei documentação oficial de Arena, AutoMod ou Simio sobre como cada elemento recebe um stream (Arena: número de stream como argumento da distribuição; não confirmado em fonte primária nesta pesquisa).
- Não achei ferramenta de simulação de eventos discretos que publique "hash do nome → índice de stream do MRG32k3a"; é extensão nossa, apoiada na análise de colisão de L'Ecuyer et al. (2017).
- Não pesquisei qual função de hash usar (FNV-1a, SplitMix64, SHA-256 etc.) nem fontes sobre sua qualidade; precisa de pesquisa própria se a opção 1 for escolhida.

## 4. Como uma semente única (ex.: 42) vira o estado de 6 valores

### Takeaway
Não há padrão único. O ns-3 copia a semente para os 6 valores; o R espalha a semente com uma LCG (69069·s + 1) após 50 passos de aquecimento; o MATLAB aceita semente escalar em [0, 2^32) mas não documenta a conversão. Em todos, a recomendação para execuções independentes é variar a subsequência, não a semente.

### Cited Findings
- ns-3: `if (seedNumber >= m1 || seedNumber >= m2 || seedNumber == 0) NS_FATAL_ERROR("invalid Seed " …); for (int i = 0; i < 6; ++i) m_currentState[i] = seedNumber;` — [ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc). O manual recomenda manter a semente e avançar o "run" (substream): usar "the substream capability to produce multiple independent runs", porque com sementes diferentes não há garantia de que as sequências não se sobreponham — [ns-3 manual](https://www.nsnam.org/docs/manual/html/random-variables.html).
- R (`set.seed` com "L'Ecuyer-CMRG"): "Initial scrambling" `for(j = 0; j < 50; j++) seed = (69069 * seed + 1);` e depois, para cada um dos 6 valores, `seed = (69069 * seed + 1); while(seed >= m2) seed = (69069 * seed + 1); i_seed[j] = seed;` — [R src/main/RNG.c](https://github.com/wch/r-source/blob/trunk/src/main/RNG.c). A documentação avisa: "There is no guarantee that different values of seed will seed the RNG differently" — [R ?Random](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random.html).
- MATLAB: semente "specified as a nonnegative integer less than 2^32 or 'shuffle'", padrão 0; a página não documenta como ela vira o estado do `mrg32k3a` ("The size and data type of the state vector depends on the generator algorithm"); "seeds initialize the stream at different starting points, but the spacing between those points is not exactly known." — [MATLAB RandStream](https://www.mathworks.com/help/matlab/ref/randstream.html), [Creating and Controlling a Random Number Stream](https://www.mathworks.com/help/matlab/math/creating-and-controlling-a-random-number-stream.html).
- RngStreams: só aceita a semente completa de 6 valores (`SetPackageSeed`), padrão 12345 ×6 — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- Rosetta Code (não é referência normativa) usa `x1 = [seed, 0, 0]`, `x2 = [seed, 0, 0]` — [Rosetta Code, MRG32k3a](https://rosettacode.org/wiki/Pseudo-random_numbers/Combined_recursive_generator_MRG32k3a). Não é compatível com o RngStreams e não deve ser usado como vetor de teste.
- NumPy: não pesquisado a fundo; não encontrei MRG32k3a no NumPy.

### Inferences
- Opções para o Takt, todas determinísticas:
  - (a) **Estilo ns-3:** semente → 6 valores iguais (exige 1 ≤ semente < m2 = 4294944443; 42 serve). Simples, com precedente publicado. Sementes diferentes caem em pontos arbitrários do ciclo; a sobreposição é improvável (ver seção 7), mas não é excluída por construção.
  - (b) **Semente dentro do hash:** manter a semente do pacote fixa (12345 ×6, com vetores de teste oficiais) e calcular o índice do stream como hash(semente, chave). Todas as combinações (semente, chave) ficam na mesma partição de 2^64 streams disjuntos; nenhuma sobreposição entre sementes, salvo colisão de índice. Não achei precedente publicado exato; é inferência sobre o esquema do pacote.
  - (c) **Estilo R:** espalhar a semente com uma LCG. Precedente publicado, mas mais código sem ganho claro sobre (a).
- Qualquer opção precisa de vetores de teste próprios (semente 42 → estado esperado), porque nenhuma fonte publica o estado para a semente 42.

### Gaps
- MATLAB não documenta o mapeamento da semente escalar para o `mrg32k3a`; não consegui verificar.
- Não pesquisei Python (`random`, NumPy `SeedSequence`) a fundo; o NumPy não traz MRG32k3a, até onde vi.

## 5. Saídas de referência para testar um port

### Takeaway
O pacote traz `test2RngStream.c`/`.cpp` com a saída esperada em `test2RngStream.res` (C com 8 casas; C++ com ~13 algarismos). Ele cobre estados iniciais dos streams 1–3, salto de 35 passos, 5 valores do stream 3 na subsequência 1 e na 5ª, somas de 100 000 valores, semente do pacote {1,…,1} e salto para trás de 2^127. Meu port literal em JS reproduziu tudo.

### Cited Findings
Arquivos: [c/test2RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/test2RngStream.c), [c/test2RngStream.res](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/test2RngStream.res), [c++/test2RngStream.res](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/test2RngStream.res). Valores literais do `.res` (semente padrão 12345 ×6; g1, g2, g3 criados nessa ordem):

| Caso | Valor esperado |
| --- | --- |
| Estado inicial g1 (stream 1) | `{ 12345, 12345, 12345, 12345, 12345, 12345 }` |
| Estado inicial g2 (stream 2) | `{ 3692455944, 1366884236, 2968912127, 335948734, 4161675175, 475798818 }` |
| Estado inicial g3 (stream 3) | `{ 1015873554, 1310354410, 2249465273, 994084013, 2912484720, 3876682925 }` |
| g1 após `AdvanceState(5, 3)` (35 passos) | `{ 1040577685, 3747037609, 277208355, 1712706441, 627445683, 2408037141 }` |
| `RandU01(g1)` em seguida | `0.07941674` (C); `0.07941673614985` (C++) |
| Soma de 35 `RandInt(1, 10)` de g1 | `186` |
| Soma dos primeiros 100 valores de g3 (após 1 valor já tirado) | `53.985902` (C); `53.98590159232` (C++) |
| 5 primeiros de g3 após `ResetStartSubstream` | `0.72850979, 0.96558728, 0.99618413, 0.11498842, 0.97314542` (C); `0.7285097861965, 0.9655872822837, 0.9961841304801, 0.1149884161813, 0.9731454191297` (C++) |
| 5 primeiros de g3 após 4× `ResetNextSubstream` | `0.17345454, 0.03286352, 0.26431691, 0.30594036, 0.54763030` (C); `0.1734545396358, 0.03286351608942, 0.2643169129682, 0.3059403602117, 0.5476303035177` (C++) |
| Soma de 100 000 de g2, precisão aumentada | `50098.2241` (C); `50098.22414959` (C++) |
| Soma de 100 000 antitéticos de g3 | `50017.2232` (C); `50017.2231775` (C++) |
| `SetPackageSeed({1,1,1,1,1,1})`: stream "Laplace" (2º) | `{ 2662865579, 741857976, 4206142246, 3352832365, 2519202871, 655500294 }` |
| idem, "Galois" (3º) | `{ 3784663252, 802042081, 160569404, 3391851556, 2150317468, 54240022 }` |
| idem, "Cantor" (4º) | `{ 3276123839, 3170955788, 1470482105, 884064067, 1017894425, 16401881 }` |
| "Galois" após `AdvanceState(-127, 0)` | igual ao estado inicial de "Laplace" |
| Soma final | `23.705324` (C); `23.70532386289` (C++) |

- Há também `testRngStream.c` e `example1.c` no mesmo diretório — [diretório c/](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/).

### Inferences
- **Verificado por mim:** transcrição literal do C para JS reproduziu todos os estados acima e os valores com todas as casas da versão C++ (por exemplo, soma de 100 do g3 = `53.98590159231507`; soma final = `23.70532386289388`).
- **Cálculo meu (não publicado), útil como teste extra:** os 5 primeiros `RandU01` do stream 1 com a semente padrão são `0.12701112204657714, 0.3185275653967945, 0.3091860155832701, 0.8258468629271136, 0.2216299157820229`.
- Para o motor bastam os casos de estado inicial dos streams (testam o salto de 2^127, inclusive por índice direto: stream 2 e 3), os 5 valores na 1ª e na 5ª subsequência (testam U01 e o salto de 2^76) e a soma de 100 valores. Precisão aumentada, antitético e `RandInt` só se o motor os usar.
- Para comparar números, usar igualdade exata dos estados (inteiros) e dos `RandU01` em `double` contra a saída do port verificado; os valores impressos do `.res` têm só 8 ou ~13 algarismos.

### Gaps
- Não achei vetores de teste oficiais além do `.res` (por exemplo, milhões de valores ou hash da sequência).

## 6. Ponto flutuante: exatidão em `double` e igualdade de bits em JavaScript

### Takeaway
Todos os produtos da recorrência ficam abaixo de 2^53, então são exatos em IEEE 754 `double`; os produtos maiores dos saltos (matriz × vetor) são decompostos em `MultModM` para também ficarem abaixo de 2^53. O `Number` do JavaScript é `double` com arredondamento ao par mais próximo, então um port literal dá os mesmos bits que o C em SSE2. Confirmei isso rodando o teste oficial. Não achei port JS/TS publicado no npm.

### Cited Findings
- "Its coefficients satisfy the condition that a_{ij}(m_j − 1) < 2^53, so that the recurrence has a fast implementation in floating point arithmetic." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- "If the product a×s ≤ 2^53, then it is always represented exactly in floating point on 32-bit computers that support the IEEE-754 floating-point arithmetic standard, with at least 53 bits of precision for the mantissa." Para a×s > 2^53 (saltos), decompõe-se "a = a_1 × 2^17 + a_2", com "a_1 × s < 2^47", "a_2 × s < 2^49", e "all the intermediate terms in the above computations are less than 2^53. Therefore, all seed values will have exact accuracy." — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex); implementação em `MultModM` — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c).
- No salto para trás, "we no longer have b_{ij}(m_j − 1) < 2^53" (por isso usa-se `MultModM`) — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex).
- ECMAScript: a conversão para Number "corresponds exactly to the behaviour of the IEEE 754-2019 roundTiesToEven mode"; `Number::multiply` "performs multiplication according to the rules of IEEE 754-2019 binary double-precision arithmetic" — [ECMA-262, Numeric Types](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html).
- O R implementa a mesma recorrência em `double` com `k = (int) (p1 / m1)` — [R src/main/RNG.c](https://github.com/wch/r-source/blob/trunk/src/main/RNG.c); o ns-3 também, com `int32_t` — [ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc).
- Busca no registro npm por `mrg32k3a`, `rngstreams` e `rngstream` (2026-11-04) não trouxe nenhum pacote que implemente o gerador — [npm search API](https://registry.npmjs.org/-/v1/search?text=mrg32k3a). Rosetta Code não tem solução em JavaScript/TypeScript — [Rosetta Code](https://rosettacode.org/wiki/Pseudo-random_numbers/Combined_recursive_generator_MRG32k3a). Há implementações em Python ([PyPI mrg32k3a](https://pypi.org/project/mrg32k3a)) e C# (NuGet), vistas só por resumo de busca.

### Inferences
- **Medido por mim:** o maior valor absoluto intermediário em `U01` durante todo o teste oficial foi 6 028 304 385 483 480 ≈ 2^52,42 (= 1403580 × (m1 − 1) no pior caso), abaixo de 2^53. Toda soma/subtração de inteiros nessa faixa é exata.
- A divisão `p1 / m1` é arredondada, mas o código corrige: se o quociente arredondar para cima, `p1 − k·m1` fica negativo e o `if (p1 < 0) p1 += m1` conserta; o resultado inteiro é exato. Em JS, `(long)` e `(int)` viram `Math.trunc` (os quocientes cabem em 32 bits com sinal: |p1/m1| < 1403580).
- A única operação com arredondamento real é a final, `(p1 − p2) * norm`. Em JS ela é um produto `double` com roundTiesToEven, igual ao C compilado com SSE2 (padrão em x86-64). Um C antigo em x87 (80 bits) poderia, em tese, arredondar diferente nesse último passo; não testei e não achei fonte. Isso só importaria para comparar com binários antigos, não entre navegadores.
- Os motores JS seguem o ECMA-262 para `*`, `/`, `+`, `−`; não há "fast-math" nem FMA implícito. Logo, o gerador deve dar os mesmos bits em V8, SpiderMonkey e JavaScriptCore. **Isso é inferência sobre a especificação; testei só no V8 (Node).** O sub-plano que roda testes nos motores dos navegadores pode confirmar com os vetores da seção 5.
- Não usar `BigInt` no caminho quente (`U01`); se o índice de stream tiver 64 bits, `BigInt` só aparece no salto, uma vez por chave.

### Gaps
- Nenhum port JS/TS publicado encontrado para comparar.
- Não verifiquei o comportamento em JavaScriptCore/SpiderMonkey.

## 7. O desenho do roteiro é apoiado pela literatura? Forma mais segura de implementar

### Takeaway
Sim no essencial: "um stream por fonte de aleatoriedade, uma subsequência por replicação" é a recomendação literal de L'Ecuyer et al. (2002, 2017). A parte nova é derivar o índice do stream da chave em vez da ordem de criação, que tem precedente no `Stream` fixo do ns-3. Forma mais segura: semente do pacote com restrições validadas; índice = hash estável da chave (e da semente, se escolhida a opção 4b) em [0, 2^64) ou [0, 2^53); I_g = (A^(2^127))^g · s0 por exponenciação binária ou tabela; replicação r = subsequência r; colisões detectadas ao compilar o modelo; testes com os vetores oficiais.

### Cited Findings
- Recomendação de stream por fonte e substream por execução — [streams4.tex](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c++/streams4.tex); [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- Criação sequencial exige mesma ordem entre configurações — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf); o ns-3 documenta a quebra de sincronização e recomenda número fixo — [ns-3 manual](https://www.nsnam.org/docs/manual/html/random-variables.html).
- Salto direto a stream e substream por índice de 64 bits — [ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc).
- Fórmula de sobreposição para sementes aleatórias, 1 − p ≈ s²ℓ/ρ — [G-2015-35](https://www.gerad.ca/papers/G-2015-35.pdf).
- **Licença (relevante porque o Takt deve virar produto):** o código no site de L'Ecuyer diz "This code can be used freely for personal, academic, or non-commercial purposes. For commercial purposes, please contact P. L'Ecuyer" — [RngStream.c](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/c/RngStream.c), e o README do site diz "It can be used freely for non-commercial purposes" — [README](https://www-labs.iro.umontreal.ca/~lecuyer/myftp/streams00/README). Já o repositório oficial no GitHub diz "The package is under an Apache 2.0 license, copyrighted by Pierre L'Écuyer and the University of Montreal. It can be used freely for any purpose." (arquivo `LICENSE` = Apache 2.0; o repositório tem a versão C++) — [umontreal-simul/RngStreams](https://github.com/umontreal-simul/RngStreams). O ns-3 é `GPL-2.0-only` — [ns-3 rng-stream.cc](https://gitlab.com/nsnam/ns-3-dev/-/blob/master/src/core/model/rng-stream.cc).

### Inferences
- **Desenho sugerido (inferência, para o sub-plano 1 decidir com o usuário):**
  1. `s0`: semente do pacote, 6 valores validados (cada metade em [0, m) e não toda zero). Escolher entre 4a (ns-3: semente ×6, exige 1 ≤ semente < 4294944443) e 4b (s0 fixo 12345 ×6 e semente dentro do hash).
  2. Índice do stream de uma chave: hash estável e especificado da string `<elementId>:<purpose>` (com a semente, se 4b). Tamanho: 64 bits (`BigInt` só no salto) ou 53 bits (`Number`).
  3. Estado inicial do stream: I_g = A1p127^g · s0[0..2] mod m1 e A2p127^g · s0[3..5] mod m2, por exponenciação binária (`MatPowModM` do pacote) ou tabela de A^(2^k) (ns-3). Guardar I_g por chave no modelo compilado.
  4. Replicação r (base 0): estado inicial da subsequência = (A^(2^76))^r · I_g, ou r aplicações de `A1p76`/`A2p76`. Assim uma replicação rodada sozinha é igual à mesma replicação no conjunto (condição do sub-plano 6).
  5. Colisão: ao compilar, conferir que os índices de todas as chaves são distintos; se não forem, falha determinística com código, ou regra de desempate fixa e documentada. **Estimativa:** com 10 000 chaves, ≈ 2,7×10⁻¹² (64 bits) ou ≈ 5,6×10⁻⁹ (53 bits).
  6. Disjunção: com índices distintos, os streams são disjuntos por construção. Cada subsequência tem 2^76 ≈ 7,6×10²² valores e cada stream tem 2^51 subsequências; nenhum cenário do Takt chega perto.
- Comparação com "hash direto para 6 valores": a fórmula s²ℓ/ρ com, por exemplo, s = 10⁴ chaves e ℓ = 1000 subsequências × 2^76 dá ≈ 10⁸ × 1000 × 2^76 / 2^191 ≈ 2×10⁻²⁴ (**estimativa minha**). Desprezível também, mas sem garantia por construção, e o pacote desencoraja `SetSeed` por stream. Prefiro o índice de stream.
- Licença: implementar a partir das fórmulas e constantes publicadas e conferir contra os vetores do `.res`. Se for copiar código, usar a versão do GitHub (Apache 2.0, com aviso de copyright) e não a do site (não comercial) nem a do ns-3 (GPL). Registrar a escolha no plano e em `docs/product/references.md`. **A interpretação jurídica de copiar constantes ou portar o algoritmo não é minha competência; levar ao usuário.**
- A extensão "índice → stream" não muda a sequência de nenhum stream: o stream g do Takt é o mesmo `CreateStream` número g + 1 do pacote. Por isso os vetores oficiais testam o caminho direto (streams 2 e 3, e "Laplace"/"Galois"/"Cantor" com semente {1,…,1}).

### Gaps
- Não há fonte publicada para "hash da chave → índice de stream do MRG32k3a" numa ferramenta de simulação; o desenho é inferência apoiada em ns-3 (índice fixo) e L'Ecuyer et al. 2017 (análise de colisão).
- Falta escolher e pesquisar a função de hash, e decidir entre as opções 4a e 4b e entre hash e número persistido no esquema; são decisões do usuário (sub-planos 1 e 3).
- Falta confirmar com fonte primária como Arena, AutoMod e Simio atribuem streams.
- Não confirmei a validade jurídica de usar o código da versão Apache 2.0 do GitHub (a versão C do site continua com a nota não comercial; o repositório GitHub contém a versão C++).
