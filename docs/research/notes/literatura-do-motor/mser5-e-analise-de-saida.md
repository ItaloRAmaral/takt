# MSER-5 e análise de saída por replicação/deleção: detalhes de implementação para o assistente de aquecimento e o IC do Takt

Convenções destas notas:
- **Fato**: afirmação com fonte, em "Cited Findings". Li o texto completo (extraído do PDF ou do .doc) destas fontes primárias: Hoad & Robinson (WSC 2011), Hoad, Robinson & Davies (WSC 2008), os três relatórios do projeto AutoSimOA em .doc (Parte 1, Parte 2 e o relatório do analisador final, "Automating discrete event simulation output analysis"), Pasupathy & Schmeiser (WSC 2010), Sánchez & White (WSC 2011), Franklin & White (WSC 2008), Law (WSC 2004) e Dieker & Warren (Math. Oper. Res. 2010, versão arXiv). As fórmulas dos .doc estão em objetos "Equation.3" embutidos e não foram extraídas como texto; o que ficou de fora está nos Gaps.
- **[Estimativa]**: inferência minha bem apoiada nos fatos citados, ou um cálculo/simulação meu, com o método descrito.
- **[Palpite]**: opinião ou extrapolação minha com pouco apoio direto.
- Estas notas **complementam** `docs/research/notes/aquecimento/metodos_de_aquecimento.md` e `ferramentas_e_validacao.md` e não repetem o que já está lá, exceto para corrigir. As correções estão marcadas com **[Correção]**.

---

## 1. Algoritmo exato do MSER-5: estatística, lotes, faixa de busca, cauda excluída, conversão para tempo, empates e comprimento não divisível por 5

### Takeaway
A especificação mais detalhada publicada é a do analisador final do AutoSimOA (Hoad, Robinson & Davies). Os passos são:
1. Agrupar a série em b₀ = ⌊n/5⌋ lotes não sobrepostos de 5 observações.
2. Calcular MSER(d) = (1/(b−d)²)·Σ_{j>d}(Ȳ_j − Ȳ_{b,d})² sobre as médias dos lotes, descartando um lote do início por vez até restarem **c = 5 lotes**.
3. Tomar o mínimo e converter: Lsol = d*·5 observações.
4. A estimativa só é **válida se d* cair nos primeiros (b₀ − c)/2 lotes**.

Nenhuma fonte trata de empates. Pasupathy & Schmeiser confirmam que os lotes não sobrepostos deixam observações "órfãs" no **fim** da série.

### Cited Findings
**Estatística**
- MSER(d) para a série X(j) da replicação j: d*(j) = argmin_{0 ≤ d(j) < n(j)} [1/(n(j)−d(j))²]·Σ_{i=d+1}^{n}(X_i(j) − X̄_{n,d}(j))², "applied to a series of b = n/5 batch averages instead of to the raw output data series" — [Hoad & Robinson 2011, WSC](https://www.informs-sim.org/wsc11papers/044.pdf)
- Na forma de Pasupathy & Schmeiser: MSER(n,k) = S²_{n,k}/(n−k), com S²_{n,k} = Σ_{i=k+1}^{n}(Y_i − Ȳ_{n,k})²/(n−k), "the sample variance using n − k rather than n − k − 1". Os autores registram que "One could argue about whether to divide by n − k or n − k − 1". O MSER-GM original usa n − k; a variante nova MSER-LLM "divides by n − k − 1" — [Pasupathy & Schmeiser 2010, WSC](https://www.informs-sim.org/wsc10papers/017.pdf)
- A estatística é "the square of the estimated standard error of the mean obtained using the large-sample variance". Para dados correlacionados, o fator de autocorrelação "for sufficiently large n … becomes de facto a constant", e por isso não muda o argmin — [Sánchez & White 2011, WSC](https://www.informs-sim.org/wsc11papers/043.pdf)
- O lote de 5 vem de Spratt (1998), que "states that the process of batching data into batches of 5 data points in this context was derived from the recommendation in Schruben (1982)" — [AutoSimOA, relatório do analisador final (.doc)](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)

**Procedimento passo a passo (analisador final do AutoSimOA)**
- "The MSER-5 method first calculates the test statistic … using all the batched data provided, i.e. b = b0 … Then the first batch is discarded and the test statistic recalculated using only the data that is left, b = b1 = b0 − 1. This is repeated until only c (default is c = 5) batches are remaining." — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "Once the b0 − c test statistic values have been calculated, the minimum value is selected. The number of batches discarded to create this minimum value is taken as the estimate of the warm-up period. This value is translated into a truncation point in terms of data points rather than batches by multiplying by 5, the batch size (m). We refer to this estimated truncation point as Lsol. The estimate is only valid if it falls into the first (b0 − c)/2 batches." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "The initial length n should be greater or equal to 100, giving at least 20 batches. The data set Xn is batched into the maximum possible number of batches, b0, of length m (default, m = 5) … the length of the data used to construct this batched data set is therefore n* = b0·[m]". A fórmula exata de b₀ é uma equação embutida que não foi extraída — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Exemplo do próprio relatório: "the minimum value of the test statistic occurs when 50 data points are deleted … the warm-up estimator would propose a warm-up period of 50 data points" — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)

**Exclusão da cauda: "5 points" ou "5 batches"**
- **[Correção]** As notas anteriores deixaram em aberto a diferença entre "5 points" e "5 batches". Ela tem uma resolução documental. Os textos de 2008 (WSC 2008 e o relatório "Part 2", de julho de 2008) dizem "we have chosen a default value of 5 points" — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [AutoSimOA Part 2 (.doc)](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc). Os textos posteriores dizem **5 lotes**:
  - o relatório do analisador final: "until only c (default is c = 5) batches are remaining" — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc);
  - Hoad & Robinson 2011: "stop calculating the test statistic at a default of 5 batches (5x5=25 data points) from the end" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf).
- O motivo da exclusão: "the method can be overly sensitive to observations at the end of the data series that are close in value (Delaney 1995, Spratt 1998). This is simply an artefact of the point at which the simulation is terminated" — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc). O relatório "Part 2" acrescenta: "by rejecting any truncation point that falls into the second half of the data and simply rerunning the algorithm with more data does almost completely eliminate this problem" — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)

**Regra de validade (segunda metade)**
- **[Correção/refinamento]** Nos testes de 2008, "Any Lsol value > n/2 is considered an invalid Lsol value and rejected" — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc). No analisador final o limite passa a ser "(b0 − c)/2 batches", ou seja, metade da faixa efetivamente buscada — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- A outra família: o MSER-GM "is often restricted to {0, 1, 2, …, ⌊n/2⌋}", porque "the global minimum in {0, …, n−1} is sometimes erroneously close to n". "A common suggestion in the recent literature is to choose K = {0, 1, 2, …, ⌊n/2⌋}" — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

**Comprimento não divisível por 5**
- "the use of non-overlapping batches is suboptimal to using overlapping batches, which leave no orphaned observations at the end of the data series, which cause no graininess in the analysis, and which still requires only O(n) computation" — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf). Isso indica que, no MSER-5, as observações que sobram ficam no **fim** da série e são descartadas. O AutoSimOA usa n* = b₀·m observações — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)

**Custo**
- "All values of k can be considered while maintaining O(n) computation". Também se pode considerar "no more than, say, 100 k values", porque os valores de MSER são correlacionados — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

**Variantes que não escolhem o mínimo global**
- MSER-LLM: "does no preprocessing, it considers K = {0, 1, …, n − 1}, it divides by n − k − 1, and it selects k̂ to be the location of the left-most local minimum". O MSER-LLM2 é igual, mas toma o mínimo local mais à esquerda entre os mínimos locais. Para toda realização, k̂_LLM ≤ k̂_LLM2 ≤ k̂_GM — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

### Inferences
- [Estimativa] Especificação implementável, fiel ao AutoSimOA, para a função pura do ADR-0011 item 7:
  1. Entrada: a série média entre replicações y[0..n−1], já por intervalo de tempo. Exigir n ≥ 100, ou seja, ≥ 20 lotes.
  2. b₀ = ⌊n/5⌋. Lote j = média de y[5j..5j+4]. Descartar as n − 5b₀ observações finais.
  3. Para d = 0, 1, …, b₀ − c − 1, com c = 5, calcular MSER(d) = Σ_{j=d}^{b₀−1}(Ȳ_j − m_d)² / (b₀ − d)², onde m_d é a média dos lotes d..b₀−1. Isso dá exatamente os "b0 − c test statistic values" do texto.
  4. d* = argmin. Válido se d* ≤ (b₀ − c)/2.
  5. Lsol = 5·d* observações; corte em tempo = 5·d*·Δ, onde Δ é o intervalo de registro da série.
- [Estimativa] Há uma ambiguidade de ±1 no texto do AutoSimOA. "Repeated until only c batches are remaining" sugere que o último d calculado é b₀ − c (restam c lotes), o que dá b₀ − c + 1 valores. "the b0 − c test statistic values" sugere que o último é b₀ − c − 1. A diferença só afeta o último ponto, que nunca é válido. Basta escolher uma e documentar.
- [Estimativa] O AutoSimOA busca em toda a série (menos a cauda) e **depois** rejeita um mínimo na segunda metade. Já o MSER-GM restringe a busca à primeira metade e por isso **nunca** detecta o caso inválido. A RN-SIM-009 manda "estender e tentar de novo quando o corte cair na segunda metade", o que só faz sentido na variante do AutoSimOA. O plano do sub-plano 7 deve fixar essa variante.
- [Estimativa] Cálculo em O(b): somas e somas de quadrados acumuladas do fim para o começo. Para evitar cancelamento numérico em Σy² − n·m², subtrair antes a média global da série (a estatística é invariante a translação) ou usar o algoritmo de Welford de trás para frente.
- [Palpite] Empates. Nenhuma fonte define a regra. Escolher o **menor d** (o empate não aumenta o corte, comparação estrita "<") é coerente com o espírito das variantes "left-most" de Pasupathy & Schmeiser e garante d* = 0 numa série constante, onde todos os MSER(d) valem 0. Empates exatos com dados reais são raros, mas a série constante (por exemplo, linha determinística em regime) é um caso de teste real para o Takt.
- [Estimativa] Propriedade verificável: o argmin é invariante a y → a·y + b com a ≠ 0, porque a translação não altera os desvios e a escala multiplica todos os MSER(d) por a². Serve como teste de propriedade com fast-check.

### Gaps
- As fórmulas exatas do AutoSimOA (b₀, Lsol máximo e z) são objetos de equação embutidos nos .doc e não foram extraídos. O texto em volta é suficiente para reconstruí-las, mas não li a equação em si.
- Não li White (1997), *Simulation* 69(6):323–334, nem White, Cobb & Spratt (2000), WSC pp. 755–760, que dariam a definição original do MSER-5. O link `informs-sim.org/wsc00papers/104.pdf` devolveu 404.
- Nenhuma fonte trata de empates nem de valores NaN na série.

---

## 2. MSER-5 sobre a média entre replicações: replicações piloto, comprimento mínimo, agregação dos dados e regra de nova tentativa (AutoSimOA)

### Takeaway
Os padrões publicados do AutoSimOA são:
- **k = 5 replicações** piloto, com média por índice;
- **n ≥ 100 observações** (≥ 20 lotes);
- séries **desagregadas por fatia de tempo** ("time slicing"), nunca cumulativas;
- corte inválido → gerar **mais 10% de lotes**, até **10 estimativas inválidas seguidas**; aí o programa **pausa e pergunta ao usuário** se continua e quantos dados acrescenta.

Isso fecha quase todos os "Em aberto" da RN-SIM-009 com fonte. Também há recomendação explícita para estender as mesmas replicações a partir do estado final.

### Cited Findings
**Replicações piloto e comprimento**
- "The algorithm will therefore run the simulation model with k replications (default, k = 5) and average the output data over these replications to create one set of data, Yn, of length n." — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "The initial length n should be greater or equal to 100, giving at least 20 batches." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Nos testes do MSER-5, as séries tinham n = 1000, de execução única ou com "Data averaged over 5 replications" — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc). Com 5 replicações em média, "In 76% of valid runs … removed at least 95% of the bias … and in 88% … at least 90%", contra 52% e 67% com execução única — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- Efeito colateral do uso de médias: "Using averaged data rather than single run data increases the probability of getting an end point Lsol value but also increases the probability of procuring a more accurate estimate of L." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- Exemplo do analisador ("Path A", modelo de help desk): "5 replications of length 500 were run and averaged to give 500 averaged data points … recommended a warm-up period of 70 data points … This left a truncated run-length of 430." Em seguida, as mesmas 5 replicações truncadas foram estendidas até 1000 e entraram no calculador de replicações, que recomendou 10 — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "It is strongly advised that the user does not use a run-length, n, for warm-up that is much greater than the n that will be used in subsequent runs of the simulation model, as the value of the truncation point estimator is dependent upon the length of the data used." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Robinson (2002), para o método SPC: 5 a 10 replicações e ≥ 60 pontos por replicação. Já está nas notas anteriores — [Robinson 2002](https://www.informs-sim.org/wsc02papers/055.pdf)

**Regra de nova tentativa**
- "If an invalid Lsol value is returned, further data are requested from the simulation model. Enough data to create a further [z·b] batches are produced (where the default for z is set at 10%)." — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "If 10 invalid estimates occur in a row the program pauses, informs the user and asks if the user wishes to continue. If the user does wish to continue the user is prompted to input the number of extra batches … that they wish to add." O motivo: dados iniciais ainda fora do regime permanente, ou autocorrelação muito alta — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Mesmo com um corte válido, o usuário pode pedir outra rodada do algoritmo: "This cycle continues until a valid truncation point estimate is accepted by the user." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Evidência de que estender resolve. Nos testes, "each data set with a rejected Lsol value was given more data (successively 100 more data points) … for all of the data sets a valid Lsol value … was returned by the time the data length was doubled (i.e. n = 2000)". O ARMA(5,5) foi o que mais exigiu; "for the other data types a further 100 or 200 data points would suffice" — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- Estender as replicações exige continuar de onde pararam: "it is necessary for the simulation to run on from where it previously terminated … the end state of every replication needs to be stored" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)

**Agregação dos dados**
- "We suggest that averages or similar cumulative results should be disaggregated before being passed to the warm-up estimator … results which are functions [min, max, percentuais] should not be directly warmed-up but … the related underlying output data should be used." — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "Most simulation software describes warm-up period and run length in terms of time, not numbers of entities. We therefore suggest that time slicing is used rather than entity data … A typical recording interval (time slice) … might be 60 minutes, but this does depend on the granularity of time in the model." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- **Fatias vazias em médias por evento (lead time).** "it is possible that no events of interest occur, e.g. no entities leave a queue in a time slice and so the average queue time for that time interval would be recorded as zero which is logically incorrect. To remedy this the current time spent in the queue by entities that have not yet left should be included in the calculations per time interval." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Tabela 5 do mesmo relatório (resultado de interesse → dado a aquecer):
  - "Average time in system → Averaged time in system per time slice";
  - "Average number in queue → Average number in queue per time slice";
  - "Percentage utilisation → … per time slice";
  - "Number of completed jobs → Number of completed jobs per time slice";
  - min e máx → a variável subjacente.
  
  — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Séries por entidade com replicações de tamanhos diferentes: "create averaged data that is the same length as the shortest individual replication and the excess data from the other replications are not used" — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)

### Inferences
- [Estimativa] Valores que a RN-SIM-009 pode adotar com fonte:
  - replicações piloto = 5;
  - tentativas = 10 seguidas antes de devolver "inválido" ao usuário;
  - extensão = +10% de lotes por tentativa;
  - série mínima = 100 intervalos.

  Como o Takt devolve o resultado ao usuário em vez de pausar (UC-SIM-003, 4b), "10 inválidas seguidas" corresponde exatamente à extensão 4b.
- [Estimativa] O teto de segurança (UC-SIM-003, 2a) precisa considerar o pior caso. Com +10% composto 10 vezes, a série cresce até 1,1¹⁰ ≈ 2,59× o comprimento inicial. O custo total das piloto fica em ≈ 5 replicações × 2,59 × T₀. Se a extensão for de 10% dos lotes **iniciais** a cada vez (o texto não deixa claro se é 10% de b₀ ou do b atual), o teto é 2,0× T₀.
- [Estimativa] O motor do Takt é determinístico (RN-SIM-001), com subsequência por replicação. Por isso, "continuar de onde parou" pode virar "rodar de novo do zero com T maior e as mesmas sementes", desde que o horizonte T não altere as amostras sorteadas antes de T. Isso dispensa guardar o estado final de cada replicação (o problema da seção 3.1 de Hoad & Robinson 2011) ao custo de re-simular o prefixo. A escolha (snapshot ou re-simulação) é decisão do sub-plano 7.
- [Estimativa] Lead time no Takt. A série "por minuto" de lead time, calculada só com as peças que saem no minuto, terá muitos minutos vazios num sistema com ~1 peça/min. A recomendação do AutoSimOA é incluir na fatia o tempo corrente das peças ainda no sistema. A alternativa é usar uma fatia maior para o lead time. Isso deve ser fixado no sub-plano 4, que gera as séries.
- [Palpite] Para o Takt, que já reutiliza as replicações piloto como no "Path A", usar as 5 replicações piloto também na execução final é permitido pelo exemplo do AutoSimOA. Mas fica uma dependência entre a escolha do corte e os dados estimados, que não encontrei discutida. O caminho mais simples de justificar é usar subsequências diferentes para piloto e execução.

### Gaps
- O artigo de periódico com o algoritmo sequencial (Hoad, Robinson & Davies 2011, *Journal of Simulation* 5:9–24, DOI 10.1057/jos.2010.22) não tem cópia aberta. O WRAP (eprint 49996) não tem o arquivo. O relatório .doc do analisador final parece ser a versão de trabalho desse artigo, mas não confirmei se os padrões mudaram na versão publicada.
- Não ficou claro se o "10% more batches" incide sobre b₀ ou sobre o b atual, porque a equação está embutida.
- A versão JORS 2010 (Loughborough, `dspace.lboro.ac.uk/2134/14601`) devolveu 403.
- Os dados de teste do AutoSimOA existem (zip de ~2,1 GB em `warwick.ac.uk/.../autosimoa/data/data_12_9_2011.zip`, e a página diz "please contact Dr Katy Hoad"). Não baixei.

---

## 3. Tomar o maior corte entre várias medidas de saída: há respaldo na literatura?

### Takeaway
Sim, com fonte primária do próprio AutoSimOA. O analisador estima o aquecimento **por saída** e recomenda, ao rodar outros cenários, usar o **maior** aquecimento entre as saídas de interesse. Isso fecha o gap das notas anteriores, que só tinham a ajuda do SIMUL8. Para a comparação justa de cenários (RN-SIM-010), o mesmo texto recomenda manter um único aquecimento entre cenários.

### Cited Findings
- "AutoSimOA is designed to work with multiple outputs. Estimates for the warm-up period, the number of replications or run-length … would be produced for each output of interest to the user." — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- "The user can decide to run the model for other scenarios, using the largest warm-up period, number of replications or run-length estimated for all the output variables of interest. Alternatively the user can run each specific scenario through AutoSimOA, but this could lead to different warm-up periods and the use of different amounts of data which makes comparison of scenarios more difficult to interpret. It is highly recommended however that the user at least check periodically that warm-up periods … have not significantly changed while running multiple scenarios." — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- O framework sequencial é "duplicated for each output variable of user interest" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Quando o MSER é aplicado por replicação (e não à média), Sánchez & White propõem "(1) find and apply the maximum truncation amount to all runs to reduce them to a common size; or (2) use weighted estimators" — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

### Inferences
- [Estimativa] A RN-SIM-009 ("sugere o maior") e a RN-SIM-010 (mesmo aquecimento nos cenários comparados) têm respaldo direto no AutoSimOA. A sugestão de "checar periodicamente" se o aquecimento mudou entre cenários é um aviso que o Takt pode exibir quando o usuário altera a planta sem refazer a sugestão. [Palpite: como aviso, não como regra.]
- [Estimativa] O máximo entre indicadores herda a cauda pesada do indicador mais ruidoso (seção 5): na simulação de M/M/1, o lead time dominou o máximo.

### Gaps
- Não encontrei estudo que avalie o viés ou a cobertura de IC ao tomar o máximo entre saídas, em comparação com cortes separados por saída.

---

## 4. Replicação/deleção (Law): ponto de truncamento, zerar estatísticas mantendo o estado, IC t e independência

### Takeaway
Replicação/deleção, nos termos de Law:
- fazer n replicações independentes de comprimento m ≫ l;
- em cada uma, X_j = média das observações após o aquecimento l;
- IC = X̄(n) ± t_{n−1, 1−α/2}·√(S²(n)/n).

A independência vem de cada replicação usar números aleatórios próprios. No RngStreams, isso é a subsequência por replicação, que o Takt já prevê.

### Cited Findings
- Estimadores clássicos: X̄(n) = Σ X_i/n e S²(n) = Σ[X_i − X̄(n)]²/(n−1). O IC aproximado de 100(1−α)% é X̄(n) ± t_{n−1,1−α/2}·√(S²(n)/n), "where t_{n−1,1−α/2} is the upper 1−α/2 critical point for a t distribution with n − 1 degrees of freedom". Se os X_i são normais, a cobertura é exata. Se a distribuição é "reasonably symmetric", fica próxima — [Law 2004, WSC](https://www.informs-sim.org/wsc04papers/009.pdf)
- "Make n independent replications … each of length m, where m should be much larger than l. (There is no definitive way of picking the run length m here …)". Defina X_j = Σ_{i=l+1}^{m} Y_{ji}/(m − l). "Then the X_j's are IID random variables", com E(X_j) ≈ ν. Substituindo nas expressões (1)–(3), obtém-se "an (approximately) unbiased point estimator" e o IC. "We call the above method … the replication/deletion method." Sobre o custo de descartar l em cada replicação: "given the availability and speed of PCs, this is no longer an issue" — [Law 2004](https://www.informs-sim.org/wsc04papers/009.pdf)
- Independência: "each entire replication is independent of any other replication, and each replication's observations have the same (joint) distribution. This independence across runs is the key to relatively simple output-data analysis" — [Law 2004](https://www.informs-sim.org/wsc04papers/009.pdf)
- Streams e substreams: o pacote RngStreams (MRG32k3a, período ≈ 2¹⁹¹) oferece "many long streams and substreams" para "independent replications" e para sincronização em redução de variância — [L'Ecuyer, Simard, Chen & Kelton 2002, *Operations Research* 50(6):1073–1075](https://econpapers.repec.org/RePEc:inm:oropre:v:50:y:2002:i:6:p:1073-1075)
- Valores críticos t_{0,975}: gl 4 → 2,776; 9 → 2,262; 19 → 2,093; 29 → 2,045; 49 → 2,010; ∞ → 1,960 — [NIST/SEMATECH e-Handbook, tabela da t](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm)
- Calculador de replicações do AutoSimOA, que pode servir de referência futura:
  - padrões de 5% de precisão relativa (meia-largura sobre a média) e 95% de confiança;
  - mínimo de 3 replicações;
  - "look ahead" de kLimit = 5 replicações para evitar convergência prematura.
  
  — [AutoSimOA, analisador final](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc)
- Cobertura com MSER-5 + replicação/deleção em M/M/1 com ρ = 0,95 (10 replicações, IC de 90%): 79% com n = 10⁴ e 86,5% com n = 10⁵ (já nas notas anteriores). A causa apontada é que "the confidence intervals are centered at the MSER estimate of the mean, which is known to be biased" — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

### Inferences
- [Estimativa] "Zerar estatísticas e manter o estado" (RN-SIM-008) é a implementação natural de X_j = média das observações após l:
  - para indicadores de **tempo** (WIP, utilização), X_j = (1/(T − l))·∫_l^T X(t)dt;
  - para indicadores por **peça** (lead time), média das peças que **saem** depois de l;
  - para vazão, saídas em (l, T] / (T − l).

  Law define l em número de observações. No Takt, l é um instante de tempo, e a conversão vem do MSER-5 (corte = 5·d*·Δ).
- [Palpite] Um lead time por peça "que sai depois de l" inclui peças que entraram antes de l, durante o transiente. Isso é coerente com a estatística zerada em l (Little em janela que começa com WIP, LL.2 do sub-plano 6), mas convém documentar a convenção.
- [Estimativa] O JavaScript não tem a inversa da t. Como o número de replicações do Takt é limitado por teto, uma tabela de t_{n−1, 0,975} para n de 2 até o teto, conferida contra a NIST ou o `qt` do R, é a opção mais simples e auditável.
- [Estimativa] A independência entre replicações no Takt vem da subsequência por replicação (sub-plano 1). Os números aleatórios comuns entre cenários (RN-SIM-010) vêm da sequência por chave. As duas coisas são compatíveis no RngStreams: streams por fonte de aleatoriedade, substreams por replicação.

### Gaps
- Não li o capítulo de Law (*Simulation Modeling and Analysis*, 5ª ed., 2015) nem a edição de 2024. Law 2004 (WSC) é um tutorial do mesmo autor com as mesmas fórmulas.
- Não li o texto completo de L'Ecuyer et al. 2002, só o registro bibliográfico.

---

## 5. Resultado esperado do MSER-5 no M/M/1 com ρ = 0,8 partindo do vazio, e o tempo de relaxação

### Takeaway
O tempo de relaxação do M/M/1 é **τ = 1/(μ(1 − √ρ)²)**, confirmado em fonte primária. Com μ = 1 e ρ = 0,8, **τ = 89,7**. A fórmula da tarefa, (1+ρ)/(μ(1−√ρ)²) = 161,5, **não** foi encontrada em fonte nenhuma e parece uma mistura de duas expressões.

**[Correção importante]** O teste planejado "corte da ordem de algumas centenas de unidades de tempo no M/M/1 com ρ = 0,8" (sub-plano 7) **não** é o resultado típico do MSER-5. Nas minhas simulações (estimativa), com 5 a 10 replicações piloto e WIP por minuto, a **mediana do corte é de 10 a 15 unidades de tempo**. A distribuição tem cauda pesada (p90 de 250 a 370) e 3–20% de cortes inválidos. Isso é coerente com a teoria: o viés de partir do vazio (−4) é menor que um desvio padrão do número no sistema (≈ 4,5), e nesse regime a deleção ótima em MSE é pequena ou nula.

### Cited Findings
- Dieker & Warren: numa rede de filas em série com chegadas Poisson e serviço exponencial, partindo vazia, "the relaxation time is (10) 1/(ν₀ + ν_(1) − 2√(ν₀ν_(1))) = 1/(ν_(1)(1 − √ρ_(1))²). This is the same as the relaxation time of an M/M/1 queue with arrival rate ν₀ and service rate ν_(1). Therefore, the relaxation time is determined by a single bottleneck station." A definição usada é "the reciprocal of the exponential rate at which |k_t(0,0) − k_∞(0,0)| converges to zero", ou seja, a convergência da probabilidade de sistema vazio, "(i.e., the reciprocal of the 'spectral gap')" — [Dieker & Warren 2010, *Math. Oper. Res.* 35:257–266 (arXiv:0808.0513)](https://arxiv.org/abs/0808.0513)
- Morse (1955) define o tempo de relaxação como o tempo médio para um desvio voltar 1/e do caminho até a média e mostra que ele cresce como (1 − ρ)⁻² quando ρ → 1 (resumo) — [Morse 1955, *Operations Research* 3(3):255–261 (IDEAS)](https://ideas.repec.org/a/inm/oropre/v3y1955i3p255-261.html)
- Odoni & Roth (1983): depois de um período inicial, Q(t) ≈ decaimento exponencial, com uma expressão aproximada para a constante de tempo que serve de cota superior para o tempo até Q(t) ≈ Q(∞) (resumo, sem a fórmula) — [Odoni & Roth 1983, *Operations Research* 31(3):432–455](https://ideas.repec.org/a/inm/oropre/v31y1983i3p432-455.html)
- Teoria do MSE ótimo (AR(1), n = 100, a = 0,9, γ₀ = 19). A deleção ótima constante k* vale **0, 0, 22, 44 e 66** para viés inicial |Y₀|/σ_Y = **0, 1, 10, 100 e 1000**. O MSE relativo sem deleção é 1,09 com viés 1, ou seja, deletar quase não ganha nada com viés de até 1σ — [Pasupathy & Schmeiser 2010, Tabela 1](https://www.informs-sim.org/wsc10papers/017.pdf)
- No AutoSimOA, com viés de severidade baixa o MSER-5 tende a subestimar: "MSER-5 will increasingly underestimate the truncate point for decreasing severity of bias" — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- A severidade nos testes do AutoSimOA é definida por max|a_t| = M·Q, onde Q é a distância entre a média de regime e o percentil 1 (ou 99) dos dados de regime. M = 1, 2, 4 — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- Não encontrei publicação com o corte do MSER-5 para M/M/1 com ρ = 0,8 partindo do vazio. Pasupathy & Schmeiser fizeram uma tabela para "M/M/1 queue waiting time", mas não a publicaram por falta de espaço ("the message is the same as from Table 1"). Sánchez & White usaram ρ = 0,95 e relatam cobertura, não o corte — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf); [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

### Inferences
- [Estimativa, cálculo] τ = 1/(1 − √0,8)² = 1/(0,105573)² = **89,72**. Logo, 3τ ≈ 269 e 5τ ≈ 449, como nas notas anteriores. Fórmulas próximas:
  - **2(1+ρ)/(μ(1−ρ)²) = 90,0**: é a minha derivação da escala de tempo do movimento browniano refletido equivalente (deriva −μ(1−ρ), variância μ(1+ρ), taxa de relaxação deriva²/(2·variância)). É uma aproximação de tráfego pesado e não tem fonte lida.
  - **(1+ρ)/(μ(1−√ρ)²) = 161,5**: a fórmula citada na tarefa, sem fonte. **Não usar.**
- [Estimativa] Consequência para o Takt: numa linha em série com chegadas Poisson e serviço exponencial, o tempo de relaxação é o do M/M/1 do gargalo (Dieker & Warren). Isso dá ao assistente um **valor de referência analítico** para os casos de validação, mas não para plantas com falhas, bloqueio ou tempos não exponenciais.
- [Estimativa, simulação própria] Método:
  - script Python em `scratchpad` (fora do repositório), M/M/1 com λ = 0,8 e μ = 1, partindo vazio, gerador Mersenne Twister do Python;
  - séries por intervalo Δ = 1: WIP = média temporal do número no sistema no intervalo; vazão = saídas no intervalo; lead time = média dos tempos no sistema das saídas, em fatias de 10, com fatia vazia preenchida pelo valor anterior;
  - média entre M replicações;
  - MSER-5 como na seção 1, com c = 5 lotes de cauda, inválido se d* > b₀/2 e menor d em empate;
  - corte em tempo = 5·d*·Δ.
  
  O código passou em dois testes de sanidade:
  - degrau de +2σ nas primeiras 100 observações com ruído N(0,1), n = 1000: mediana do corte 100, p10 100, p90 115;
  - ruído puro: mediana 0, p90 15, nenhum inválido.

  Resultados (corte em unidades de tempo, só os válidos):

| Pilotos M | Duração T | Indicador | Inválidos | p25 | Mediana | p75 | p90 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 1000 | WIP | 63/400 (16%) | 5 | 10 | 60 | 335 |
| 5 | 1000 | Vazão | 0/400 | 0 | 5 | 10 | 20 |
| 5 | 1000 | Lead time | 66/400 (17%) | 0 | 0 | 150 | 400 |
| 5 | 2000 | WIP | 15/300 (5%) | 5 | 10 | 30 | 370 |
| 5 | 2000 | Lead time | 55/300 (18%) | 0 | 0 | 200 | 550 |
| 10 | 2000 | WIP | 8/200 (4%) | 10 | 15 | 60 | 245 |
| 10 | 2000 | Lead time | 25/200 (13%) | 0 | 50 | 150 | 500 |
| 50 | 1000 | WIP | 8/60 | 30 | 40 | 120 | 285 |

  O máximo entre os três indicadores (só os conjuntos com os três válidos) teve mediana de 35 a 50 e p90 de 400 a 550. Com Δ = 10 (lote = 50 unidades), o WIP com M = 5 e T = 2000 deu mediana **0**, p75 150 e p90 450. Ou seja, **o intervalo de registro muda o resultado**.
- [Estimativa] Interpretação. O MSER-5 não procura onde E[X(t)] "chega" a 4, que levaria 3 a 5 τ. Ele procura o corte que minimiza o erro padrão estimado da média restante. Com média de 5 replicações, o desvio do WIP por minuto é ≈ √(σ²_X/5) ≈ √(20/5) = 2. Isso é da ordem do próprio viés (E[X(10)] ≈ 2, E[X(50)] ≈ 3,4), e por isso o ganho de cortar acaba cedo. Mais replicações reduzem o ruído e empurram o corte para mais tarde: a mediana passa de ~10 com M = 5 para ~40 com M = 50.
- [Estimativa] Recomendações para o teste do sub-plano 7 (UC-SIM-003 no M/M/1):
  1. **Não** afirmar "algumas centenas". Com semente fixa o teste é determinístico, mas o valor que sair pode ser 5 ou 400, e a faixa não tem base.
  2. Afirmações mais defensáveis:
     - o corte é válido (≤ metade da série);
     - a média truncada de L, com o corte sugerido e replicação/deleção suficiente, fica com IC de 95% cobrindo L = 4;
     - a sugestão é o máximo dos cortes por indicador.
  3. Para testar a **mecânica** do MSER-5 com corte conhecido, usar séries sintéticas (seção 6), não o M/M/1.
  4. Se o teste quiser um transiente visível no M/M/1, alternativas são partir de um estado muito longe da média (por exemplo, 40 peças na fila, viés ≈ 8σ) ou usar ρ = 0,9 com M grande. Não há valor publicado para comparar, então a tolerância seria uma estimativa por Monte Carlo própria.
- [Palpite] O texto da RN-SIM-009 e do roteiro ("corte da ordem de algumas centenas de unidades de tempo") deve ser revisto antes do sub-plano 7. A frase "compatível com 3–5 tempos de relaxação" da pesquisa anterior descreve o tempo para o viés pontual sumir, não o resultado do MSER-5.

### Gaps
- O PDF de Abate & Whitt (1987, "Transient behavior of the M/M/1 queue: starting at the origin", *Queueing Systems* 2:41–65, [cópia do autor](http://www.columbia.edu/~ww2040/TransientMM1questa.pdf)) é digitalizado sem camada de texto (CCITT) e não foi lido. A fórmula τ = 1/(μ(1−√ρ)²) está verificada só em Dieker & Warren. Que Abate & Whitt a usem é provável, mas não verificado.
- Não encontrei corte publicado do MSER-5 para M/M/1 com ρ = 0,8. Os números da tabela acima são **estimativas** de uma simulação própria (geradores do Python, não do Takt), com 60 a 400 conjuntos por célula. Os percentis da cauda têm erro amostral apreciável.
- Não testei o lead time com a correção do AutoSimOA para fatias vazias (incluir o tempo corrente das peças no sistema). Usei preenchimento pelo valor anterior.

---

## 6. Como testar uma implementação do MSER-5: conjuntos sintéticos com viés conhecido e resultados publicados

### Takeaway
Há dois conjuntos de teste publicados e reutilizáveis:
1. o do **AutoSimOA**: n = 1000; viés com 5 formas (degrau, linear, quadrática, exponencial e oscilatória decrescente), comprimentos de 0, 10, 40 e 100% e severidades 1, 2 e 4; sobre ruído N(1,1) ou Exp(1) com AR(1), AR(2), AR(4), MA(2) ou ARMA(5,5); somado por superposição;
2. o de **White, Cobb & Spratt / Franklin & White**: AR(2) com 6 pares de raízes, viés exponencial, degrau ou oscilatório, C ∈ {5, 10, 15}; 35 sequências de 10.000 observações.

Os resultados publicados são **distribuições** (por exemplo, ≥ 90% do viés removido em 88% dos casos válidos com média de 5 replicações), não valores pontuais. Por isso os testes unitários do Takt devem combinar casos determinísticos construídos à mão com testes estatísticos de limiar.

### Cited Findings
**Conjunto do AutoSimOA (Hoad, Robinson & Davies)**
- Fatores:
  - comprimento do viés L = 0, 10, 40 e 100% de n, com "The total data size, n, was set at 1000";
  - severidade max|a_t| = M·Q, M ∈ {1, 2, 4};
  - formas: "1. Mean Shift 2. Linear 3. Quadratic 4. Exponential 5. Oscillating – decreasing linearly / quadratically / exponentially", positivas e negativas;
  - erros "Normal(1,1) or Exponential(1)";
  - autocorrelação "None, AR(1), AR(2), AR(4), MA(2), ARMA(5,5)";
  - execução única ou "averaged over 5 replications".

  Ao todo, "2016 separate sets … plus another 1032 sets at the extremes", cada um rodado 100 vezes — [AutoSimOA Part 1 (.doc)](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part1_review_of_methods_and_shortlisting.doc); [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- Superposição: Y_t = X_t + a_t. Assim "there is no run-in period and no lag … Hence we know precisely the true truncation point". A injeção, que põe o viés dentro da recursão AR, cria "run-in" e "lag" e foi evitada — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- Critérios de desempenho: Lsol − L; cobertura da média verdadeira; percentual do viés removido (área sob a função de viés eliminada pelo corte); número de rejeições (Lsol > n/2) — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- Resultados publicados:
  - "In over 77% of cases where a valid Lsol was returned, the recommended truncation removed at least 90% of the bias. In only 7.4% of the total 201600 runs was the Lsol value rejected … the majority of these would return valid values when given sufficient data". Com média de 5 replicações: 88% dos casos válidos com ≥ 90% removido e 76% com ≥ 95%.
  - Cobertura da média verdadeira após o corte: "over 80%" dos casos, com n = 1000.
  - Degrau positivo, AR(2), N(1,1), média de replicações: o MSER-5 "accurately estimated L on 77% of the runs and only overestimated L to a maximum of 55 data points on the remaining 23%".
  - Com L = 100% (só viés), 53% de rejeições. Com degrau em 100% dos dados, "MSER-5 returned mainly zero Lsol values".
  
  — [AutoSimOA Part 2](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)
- Forma de viés e erro: "as the severity of decline in the bias increases the number of underestimations … increases, e.g. the most underestimates occur in data with exponentially declining bias" — [idem](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc)

**Conjunto de White, Cobb & Spratt (2000), repetido em Franklin & White (2008)**
- Processo: AR(2) X_i = φ₁X_{i−1} + φ₂X_{i−2} + a_i, com condições iniciais nulas e a_i normal padrão. Seis modelos (φ₁, φ₂; raízes):
  1. (0,9; 0; raízes 0 e 0,9)
  2. (−0,9; 0; raízes 0 e −0,9)
  3. (0,25; 0,5; raízes −0,59307 e 0,84307)
  4. (−0,25; 0,5; raízes −0,84307 e 0,59307)
  5. (0,75; −0,5; raízes 0,375 ± 0,59948i)
  6. (−0,75; −0,5; raízes −0,375 ± 0,59948i)
  
  Os sinais de φ vieram da extração do PDF e foram conferidos pelas raízes publicadas — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf)
- Vieses: exponencial (7), degrau (8) e oscilação subamortecida (9), todos não nulos para i = 1..1000 e nulos depois. Coeficiente C ∈ {5, 10, 15}. Incorporação por adição (Y_i = X_i + B_i) ou injeção. 108 experimentos, "Each experiment was run on 35 independently generated sequences, each with 10,000 observations" — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf)

**AR(1) com viés inicial (Pasupathy & Schmeiser)**
- Y_i = θ + a(Y_{i−1} − θ) + ε_i, com viés inicial b = (Y₀ − θ)/σ_Y. A Tabela 1 dá a deleção MSE-ótima k* para n = 100 e γ₀ = (1+a)/(1−a). Para a = 0,9: k* = 0, 0, 22, 44 e 66 com b = 0, 1, 10, 100 e 1000. Para a = 0,99: 99 com b ≥ 10. Ruído independente (a = 0): k* = 0 em todos os níveis da tabela — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

### Inferences
- [Estimativa] Testes unitários determinísticos (sem aleatoriedade, resultado exato), cada um derivável à mão:
  1. Série constante → d* = 0 (empate total, regra do menor d) e válido.
  2. Degrau sem ruído: série = h nos primeiros 5k pontos e 0 depois, com n = 1000. O corte esperado é exatamente 5k, porque a partir dali a variância restante é 0. Precisa de 5k ≤ (b₀ − 5)/2·5.
  3. Degrau sem ruído que termina na segunda metade → resultado inválido.
  4. Série com n não múltiplo de 5 (por exemplo, 1003): as 3 últimas observações não entram, e o resultado é igual ao da série com n = 1000.
  5. Série com < 100 pontos → erro ou recusa (regra do AutoSimOA, n ≥ 100).
  6. Cauda: uma série estacionária cujos últimos 5 lotes são idênticos não deve gerar corte no fim, porque esses pontos não são avaliados.
  7. Invariância a y → a·y + b.
- [Estimativa] Testes estatísticos com semente fixa e limiar, reproduzindo um subconjunto do AutoSimOA. Por exemplo, degrau positivo com M = 2 sobre N(1,1) e AR(1), L = 100, n = 1000, média de 5 séries: afirmar que a fração de cortes em [L, L + 55] passa de um limiar derivado do "77% exatos". A tolerância precisa ser calibrada, porque não reproduzimos o gerador nem os parâmetros AR, que não foram extraídos.
- [Estimativa] Para o assistente completo (retentativas): uma série em que o transiente dura 70% do comprimento inicial deve gerar inválido, estender +10% e convergir. Uma série sem regime permanente (tendência linear sem fim) deve chegar a 10 inválidos e devolver "inválido" (UC-SIM-003, 4b).

### Gaps
- As fórmulas exatas das funções de viés do AutoSimOA (degrau, linear, quadrática, exponencial com limite k e oscilatória com frequência f, "Number of cycles … is defined by L/f") e os **coeficientes** de AR(1), AR(2), AR(4), MA(2) e ARMA(5,5) estão em equações embutidas nos .doc e não foram extraídos. As fontes possíveis são o JORS 2010 (Loughborough deu 403) ou os dados a pedir à Dra. Hoad.
- As fórmulas (7)–(9) de Franklin & White perderam símbolos na extração. Os tokens legíveis sugerem C·e^{−0,005(i−1)} para o exponencial, C/5 para o degrau e C·e^{−0,005(i−1)}·sin(2πi/200) para o oscilatório. Isso é **[Palpite]** de reconstrução e precisa de conferência no PDF original antes de virar dado de teste.
- Não encontrei nenhum conjunto de teste com **resultado pontual publicado** (série → corte exato) que sirva de "golden test". Os resultados publicados são estatísticos.

### Referências (todas as perguntas, além das já listadas em `notes/aquecimento/metodos_de_aquecimento.md`)
- Hoad, K., S. Robinson & R. Davies. "Automating discrete event simulation output analysis: automatic estimation of number of replications, warm-up period and run length". Relatório do projeto AutoSimOA (.doc), Warwick Business School, c. 2009–2010. https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/overall_framework/overallframework_websitewriteup_5.doc. Corresponde, provavelmente, a Hoad, Robinson & Davies (2011), "AutoSimOA: a framework for automated analysis of simulation output", *Journal of Simulation* 5(1):9–24, DOI 10.1057/jos.2010.22 (não confirmado).
- Hoad, K., S. Robinson & R. Davies (2008). "Automating warm-up length estimation. Part 1: Review of methods and shortlisting" (.doc). https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part1_review_of_methods_and_shortlisting.doc
- Hoad, K., S. Robinson & R. Davies (2008). "Automating warm-up length estimation. Part 2: MSER-5 – a full analysis" (.doc). https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup/warm-up_writeup_part2_mser5_a_full_analysis.doc
- Law, A. M. (2004). "Statistical analysis of simulation output data: the practical state of the art". *Proceedings of the 2004 Winter Simulation Conference*. https://www.informs-sim.org/wsc04papers/009.pdf
- L'Ecuyer, P., R. Simard, E. J. Chen & W. D. Kelton (2002). "An object-oriented random-number package with many long streams and substreams". *Operations Research* 50(6):1073–1075. DOI 10.1287/opre.50.6.1073.358. https://econpapers.repec.org/RePEc:inm:oropre:v:50:y:2002:i:6:p:1073-1075
- Dieker, A. B. & J. Warren (2010). "Series Jackson networks and non-crossing probabilities". *Mathematics of Operations Research* 35:257–266. https://arxiv.org/abs/0808.0513
- Morse, P. M. (1955). "Stochastic properties of waiting lines". *Operations Research* 3(3):255–261. https://ideas.repec.org/a/inm/oropre/v3y1955i3p255-261.html (só o resumo)
- Odoni, A. R. & E. Roth (1983). "An empirical investigation of the transient behavior of stationary queueing systems". *Operations Research* 31(3):432–455. https://ideas.repec.org/a/inm/oropre/v31y1983i3p432-455.html (só o resumo)
- Abate, J. & W. Whitt (1987). "Transient behavior of the M/M/1 queue: starting at the origin". *Queueing Systems* 2:41–65. http://www.columbia.edu/~ww2040/TransientMM1questa.pdf (digitalizado, não lido)
- NIST/SEMATECH e-Handbook of Statistical Methods, "Critical values of the Student's t distribution". https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
- Pasupathy & Schmeiser (2010), Sánchez & White (2011), Franklin & White (2008), Hoad et al. (2008) e Hoad & Robinson (2011): referências completas nas notas anteriores.
