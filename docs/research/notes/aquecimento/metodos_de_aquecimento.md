# Métodos para determinar o período de aquecimento (warm-up / initial transient deletion) em simulação de eventos discretos, e comparações entre eles, com foco em automação dentro de um produto de software

Convenção usada nestas notas:
- **Fato**: afirmação com fonte, em "Cited Findings". Fiz leitura direta do texto completo destas fontes primárias: Hoad, Robinson & Davies (WSC 2008), Hoad & Robinson (WSC 2011), Franklin & White (WSC 2008), Mahajan & Ingalls (WSC 2004), Pasupathy & Schmeiser (WSC 2010), Sánchez & White (WSC 2011), Robinson (WSC 2002) e o catálogo de métodos do AutoSimOA (PDF da Univ. de Warwick). As demais fontes (JORS 2010, J. Simulation 2010, TOMACS 2016) foram vistas apenas pelo resumo ou pelo registro bibliográfico, e isso vem indicado.
- **[Estimativa]**: inferência minha bem apoiada nos fatos citados.
- **[Palpite]**: opinião ou extrapolação minha com pouco apoio direto.

---

## 1. Procedimento gráfico de Welch (Welch's graphical procedure): passos, parâmetros e por que é difícil de automatizar

### Takeaway
O método de Welch calcula médias entre réplicas (ensemble averages) e aplica sobre elas uma média móvel (moving average) com janela w. O analista escolhe "a olho" o ponto em que a curva fica plana. Por isso o AutoSimOA o rejeitou para automação, e comparações empíricas o consideram muito subjetivo.

### Cited Findings
- **Passos, conforme Law & Kelton (2000), citados por Mahajan & Ingalls (2004):**
  1. Fazer n réplicas (replications) de comprimento m. Y_ji é a i-ésima observação da j-ésima réplica.
  2. Calcular as médias entre réplicas (ensemble averages): Ȳ_i = (1/n) Σ_j Y_ji, para i = 1..m.
  3. Calcular a média móvel Ȳ_i(w) com janela simétrica de 2w+1 pontos para i = w+1, …, m−w. Para i ≤ w a janela encolhe e usa 2i−1 pontos. A janela w é um inteiro positivo com **w ≤ m/4**.
  4. Plotar Ȳ_i(w) para i = 1..m−w e escolher como warm-up l o valor de i a partir do qual a curva "parece ter convergido".
  
  — [Mahajan & Ingalls 2004, WSC](https://www.informs-sim.org/wsc04papers/080.pdf)
- Recomendação de Law & Kelton (2000), segundo Mahajan & Ingalls: usar o menor w que deixe o gráfico suave. Mahajan & Ingalls usaram w = 10 e 5 réplicas. Para reduzir a subjetividade, pediram a **25 usuários** que lessem o gráfico e tomaram a média das respostas como warm-up — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
- O método tem três parâmetros: comprimento m, número de réplicas n e janela w — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
- Resultado comparativo: "Welch's Method didn't work well for most of the experiments. It is highly subjective. Different results may be observed for different set of users" — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
- Descrição do AutoSimOA: se o gráfico estiver razoavelmente suave ("judged by eye"), escolher o ponto em que a linha fica plana ("judged by eye"). Se não estiver suave, trocar w e redesenhar. As notas do catálogo são: Accuracy = Poor, Simplicity = Good, Automation potential = Poor — [Catálogo AutoSimOA de métodos de warm-up (PDF)](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- Motivo da rejeição no shortlist: "Welch's method requires a user to judge the smoothness and flatness of a moving average plot; this would be difficult to automate". Os métodos gráficos em geral foram rejeitados por exigirem intervenção do usuário e por precisão. Métodos baseados em estatísticas cumulativas reagem devagar a mudanças e tendem a superestimar o ponto de truncamento — [Hoad, Robinson & Davies 2008, WSC](https://www.informs-sim.org/wsc08papers/063.pdf)
- Crítica de Bause & Eickhoff (2003), reproduzida no catálogo: o método é fácil de implementar e popular, mas analisa só a média. A convergência da média é condição necessária e não suficiente para estacionariedade (o próprio Welch faz essa ressalva), então o método não serve para comportamento transiente complexo — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- Divergência sobre o limite de w: uma busca indicou outro artigo da WSC 2004 que descreve Welch com **w ≤ m/2** e n ≥ 5 réplicas, mas não verifiquei qual artigo é. Mahajan & Ingalls, citando Law & Kelton (2000), dão **w ≤ m/4**. Também segundo a busca, a escolha de w pode ser difícil em sistemas congestionados, cuja autocorrelação tem cauda longa (fonte: resultados de busca apontando para [WSC 2004 papers](https://www.informs-sim.org/wsc04papers/085.pdf), não verificado no texto).

### Inferences
- [Estimativa] Num produto de software, Welch funciona melhor como **visualização de apoio**: mostrar a curva das médias móveis entre réplicas com o warm-up sugerido por um algoritmo objetivo (por exemplo, MSER-5) marcado nela. É assim que o próprio framework do AutoSimOA trata o caso sem convergência: mostra um gráfico ao usuário (ver seção 3).
- [Palpite] Dá para "automatizar" Welch com regras de planura, como inclinação abaixo de uma tolerância ou faixa ±x% da média final. Isso, porém, cria parâmetros novos e dependentes do sistema, que são justamente o defeito apontado em heurísticas como crossing-of-the-mean. Não encontrei avaliação publicada de um "Welch automatizado".

### Gaps
- Não li o texto original de Welch (1983), em *The Computer Performance Modeling Handbook*, ed. S. Lavenberg, Academic Press, pp. 268–328. A referência vem do catálogo AutoSimOA. Também não li diretamente Law & Kelton. A recomendação de w ≤ m/4 vem de citação secundária (Mahajan & Ingalls).

---

## 2. MSER e MSER-5 (White 1997; White, Cobb & Spratt 2000; Franklin & White 2008): estatística, algoritmo, lote de 5, regra de truncamento, custo e falhas conhecidas

### Takeaway
O MSER escolhe o ponto de truncamento d que **minimiza o erro padrão marginal da média dos dados restantes**, o que equivale a minimizar a semiamplitude do intervalo de confiança. O MSER-5 aplica a mesma regra a médias de lotes (batch means) de 5 observações. É simples, tem custo O(n), não precisa de parâmetros dependentes do sistema e há base teórica para ele: o valor esperado da estatística MSER é assintoticamente proporcional ao MSE da média. As falhas conhecidas são: falsos mínimos no fim da série, sensibilidade a outliers, autocorrelação alta, oscilações amortecidas, saídas cumulativas e medidas de desempenho "não-padrão".

### Cited Findings
**Definição e intuição**
- White (1997): em vez de escolher o truncamento que minimiza o MSE, "we propose to select a truncation point that minimises the width of the CI about the truncated sample mean". A ideia é remover observações iniciais distantes da média, mas só enquanto esse ganho compensar a perda de tamanho amostral na semiamplitude do intervalo de confiança (IC) — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf); [Hoad & Robinson 2011, WSC](https://www.informs-sim.org/wsc11papers/044.pdf)
- Fórmula (Hoad & Robinson 2011; Sánchez & White 2011). Para a série X_i(j), i = 1..n, da réplica j:
  - d*(j) = argmin_{0 ≤ d < n} MSER(d), com MSER(d) = [1/(n−d)²] · Σ_{i=d+1}^{n} (X_i − X̄_{n,d})²
  - X̄_{n,d} é a média das observações após d.
  - Isso equivale ao quadrado do erro padrão estimado da média com o estimador de variância "de grandes amostras" (large-sample variance).
  - Como o nível de confiança é fixo, o fator z_{α/2} pode ser tomado como 1.
  
  — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf); [Sánchez & White 2011, WSC](https://www.informs-sim.org/wsc11papers/043.pdf); [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **MSER-5**: a mesma expressão aplicada a uma série de ⌊n/5⌋ médias de lotes não sobrepostos de tamanho 5, em vez da série bruta — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf). O lote de 5 é atribuído a Spratt (1998) e White, Cobb & Spratt (2000) — [Pasupathy & Schmeiser 2010, WSC](https://www.informs-sim.org/wsc10papers/017.pdf)
- Por que 5: "The improvement of MSER-5 over MSER was simply to batch 5 observations together to help ensure the monotonic behavior of the decrease in confidence interval width over the range where steady-state behavior is in force. Computational savings also are achieved as a byproduct" — [Franklin & White 2008, WSC](https://www.informs-sim.org/wsc08papers/064.pdf)
- Intuição de Franklin & White (2008): percorrendo a série do fim para o começo, enquanto as observações forem de regime permanente (steady state) a estatística (e o IC) diminui. Quando entram observações do transiente, ela volta a subir. Assim o MSER-5 escolhe o trecho em que temos mais confiança na média. Numa série estacionária a estatística decresce monotonicamente até t = 0, ou seja, não há truncamento — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf)
- Base teórica (Pasupathy & Schmeiser 2010, Teorema 1): para todo processo com média estacionária e soma de autocorrelações finita γ₀, lim_{n→∞} mse[Ȳ_{n,k}] / E[MSER(n,k)] = γ₀ para todo k. Portanto o MSER é **assintoticamente proporcional ao MSE**, e os mínimos de ambos tendem a coincidir. Conclusão dos autores: "if mse is the goal and if the performance measure is a mean, then the MSER statistic is a solid foundation for initial-transient algorithms" — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)
- Variância corrigida para autocorrelação: Franklin & White (2008) trocaram a variância simples pelo estimador de Phillips-Perron (variante "PPVR"). Os resultados ficaram praticamente iguais ao MSER-5, com truncamentos a cerca de 10 pontos um do outro. O teste de estacionariedade KPSS foi pior e mais disperso: em 108 experimentos (AR(2), viés exponencial, mean shift e oscilatório; 35 sequências de 10.000 observações cada), o KPSS teve menor viés em só 4 casos — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf). Sánchez & White (2011) explicam o motivo: o fator de autocorrelação é aproximadamente constante para n grande e não altera o argmin — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

**Regra de truncamento (onde procurar o mínimo)**
- "The recent consensus upper limit is k = n/2; that is, delete no more than half of the data". A escolha comum na literatura é K = {0, 1, …, ⌊n/2⌋}. O algoritmo que pega o mínimo global na primeira metade se chama **MSER-GM** — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)
- AutoSimOA, versão sequencial: se o ponto estimado cair na **segunda metade** da série, a estimativa é **inválida**. Gera-se então mais dados (padrão: **+10% de lotes**) e o cálculo é refeito, até o ponto cair na primeira metade. Depois de um número fixo de estimativas inválidas, o algoritmo pausa, mostra o gráfico ao usuário e pergunta se deve continuar — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Para evitar falsos mínimos no fim, o cálculo da estatística para antes do fim da série.
  - Hoad, Robinson & Davies (2008): padrão de "5 points".
  - Hoad & Robinson (2011), citando Hoad et al. (2011): para a **5 lotes do fim (5×5 = 25 observações)**.
  - Os dois textos diferem no detalhe ("points" vs. "batches") — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Para casos sem regime permanente, Franklin & White observam que "the truncation rules around MSER help to prevent truncation in the instance where no steady-state behavior is achieved" — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf)
- Variantes: **MSER-LLM**, que trunca no mínimo local mais à esquerda, e **MSER-LLM2**, no mínimo local mais à esquerda dentre os mínimos locais. Ambas superam o MSER-GM em vários tamanhos amostrais, autocorrelações e vieses. As três ficam a ~1% do MSE ótimo de deleção constante (OCD) quando o tamanho amostral efetivo é grande — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

**Custo computacional**
- Todos os valores de k podem ser avaliados em **O(n)**. Também dá para avaliar só cerca de 100 valores de k, porque os valores de MSER são correlacionados — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)
- MSER-5 foi o método mais rápido em White et al. (2000), "especially on data sets with big bias", e o de menor tempo de computação em Mahajan & Ingalls (2004): 5–16 s contra até 1.795 s do teste de aleatorização (randomization test) — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf); [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
- É descrito como "computationally trivial, easily understood, and does not require experimenter intervention to establish parameters" — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

**Evidência comparativa original**
- White (1997): 4 filas M/M/1 (vazia ρ=0,9; carregada com 100 entidades; tandem enchendo ρ=1,4 com capacidade 100; tandem transiente). Comparou Conway, Conway modificado, crossing-of-the-mean e MCR/MSER. Todos foram melhores que não truncar, mas "Only MCR provides coverage of the 95% confidence interval" nos casos de fila vazia e carregada — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- White, Cobb & Spratt (2000): processo AR(2) com vieses exponencial, mean shift e oscilatório amortecido, por superposição e injeção. MSER-5 foi o mais eficaz e robusto frente a MCR, teste modificado de Schruben, BM Max test e BM Batch Means test. Foi especialmente bom com viés exponencial e mean shift, e diferente do MCR, ficou mais eficaz quando o viés cresce. O pior foi o BM Batch Means test — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)

**Falhas conhecidas**
- **Falso mínimo no fim da série.** Os últimos lotes podem, por acaso, ter valores próximos e gerar um mínimo espúrio, que é "an artefact of the point at which the simulation is terminated" — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- **Outliers.** Em Sandikci & Sabuncuoglu (2006), o MSER-5 sugeriu truncar 4.876 observações. Removendo outliers, o número caiu para 339. Também observaram que as médias cumulativas dão transientes mais longos que o MSER-5 — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf). Hoad et al. viram o mesmo fenômeno e notaram que ele diminui com médias de réplicas — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Autocorrelação alta.**
  - Quanto mais autocorrelacionado o dado, mais o MSER-5 subestima o truncamento. Três quartos dos casos com menos de 40% do viés removido vieram dos dados mais autocorrelacionados, como ARMA(5,5).
  - Só **7,4% de 201.600 execuções** foram falhas (L_sol > n/2), e mais de 88% delas vieram de ARMA(5,5).
  - Em geral, mais de 90% do viés foi removido.
  
  — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Viés oscilatório amortecido.** Nenhuma heurística (MSER-5, PPVR, KPSS) detectou bem esse viés de forma consistente — [Franklin & White 2008](https://www.informs-sim.org/wsc08papers/064.pdf). O MCR também é "not as effective with damped oscillating bias" — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Saídas cumulativas e extremos.**
  - Em 100 séries de médias cumulativas sem viés (n = 1.100), só 7% dos truncamentos caíram na primeira metade, ou seja, foram válidos.
  - A variância decrescente das médias cumulativas empurra o mínimo para o fim da série.
  
  — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- **Sensibilidade a flutuações.** Um trabalho posterior relata que o MSER "was observed to be highly sensitive to the fluctuations in a time series and resulted in frequent overprediction". Fonte secundária, vista só pelo resumo de busca — [Xavier et al. (Scipedia)](https://www.scipedia.com/public/Xavier_et_al_1970a)
- **Contraexemplos teóricos.** Wang & Glynn (2016) mostram que, para horizonte grande, o ponto do MSER é governado pelo minimizador de um passeio aleatório. Constroem dois exemplos "não-patológicos" em que "at least one variant of MSER fails to accurately predict the duration of the initial transient". Concluem que a eficácia depende da medida de desempenho escolhida e pedem ampliar os problemas-teste — [Wang & Glynn 2016, ACM TOMACS 27(1), art. 1](https://web.stanford.edu/~glynn/papers/2016/WangG16.html) (visto só pelo resumo)
- **Lote de tamanho fixo.** Pasupathy & Schmeiser criticam o "one-size-fits-all": se pré-processar melhora, por que não pré-processar de novo? Sugerem número fixo de lotes em vez de tamanho fixo, lotes sobrepostos (overlapping batches) e múltiplos tamanhos de lote — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)
- **Moléculas e química.** Clark, Cole & Michel (2024) reformulam o MSER como uma família de heurísticas segundo o tratamento da autocorrelação. As que tratam mais a autocorrelação truncam mais tarde e com maior variância. Implementaram tudo no pacote Python open-source **RED** — [Clark et al. 2024, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11736681/) (visto só pelo resumo de busca)

### Inferences
- [Estimativa] O algoritmo central do MSER-5 cabe em cerca de 20 linhas:
  1. Agrupar a série em lotes de 5.
  2. Calcular somas e somas de quadrados acumuladas do fim para o começo.
  3. Calcular MSER(d) para d = 0..⌊b/2⌋, excluindo os últimos ~5 lotes.
  4. Retornar argmin × 5.
  5. Se o argmin cair na segunda metade, marcar como inválido e pedir mais dados.
  
  O custo é desprezível perto do custo de simular.
- [Estimativa] Para um produto didático, a combinação mais defensável é: MSER-5 sobre a **média entre réplicas**, a regra da primeira metade, a exclusão da cauda e o gráfico mostrado ao usuário. Tudo isso tem respaldo direto do AutoSimOA.
- [Palpite] Vale implementar também o MSER-LLM como opção ou diagnóstico, já que Pasupathy & Schmeiser o mostram superior ao GM. Ele ainda não tem a validação extensa em modelos de manufatura que o MSER-5 tem.

### Gaps
- Não acessei o texto completo de White (1997), *Simulation* 69(6):323–334, nem de White, Cobb & Spratt (2000), WSC pp. 755–760. Os detalhes desses dois vêm do catálogo AutoSimOA e de citações em Franklin & White (2008).
- Não acessei o JORS 2010 (Hoad, Robinson & Davies), que traz os resultados completos dos 3.048 conjuntos artificiais, nem o Journal of Simulation 2011 com o algoritmo sequencial detalhado.
- A divergência entre "5 points" e "5 batches" para a exclusão da cauda ficou sem resolução.

---

## 3. Outras famílias (heurísticas, testes estatísticos, híbridos) e o projeto AutoSimOA (Hoad, Robinson & Davies 2008/2010/2011): o que foi pré-selecionado, recomendado e por quê

### Takeaway
O AutoSimOA catalogou **42 métodos** no artigo WSC 2008 (a página do projeto fala em 44, e o PDF do catálogo numera até 46) e os classificou em 5 tipos. Avaliou-os por 6 critérios e pré-selecionou um subconjunto. Após testes com 3.048 séries artificiais, concluiu que **só o MSER-5** era "robust and viable" para automação.

### Cited Findings
**Taxonomia (Robinson 2004, adotada pelo AutoSimOA)**
1. **Gráficos**: inspeção visual e julgamento humano.
2. **Heurísticos**: regras simples com poucas suposições.
3. **Estatísticos**: baseados em princípios estatísticos.
4. **Testes de viés de inicialização (initialisation bias tests)**: testam se há viés. Não dão o ponto de corte diretamente, mas podem ser usados de forma iterativa ou para verificar um método de truncamento.
5. **Híbridos**: testes de viés combinados com métodos de truncamento.

— [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)

**Catálogo (amostra)**
- Gráficos: Simple Time Series Inspection, Ensemble Average Plots, Cumulative-Mean Rule, Deleting-the-Cumulative-Mean, CUSUM, Welch, Variance Plots (Gordon), EWMA control charts, SPC (Robinson).
- Heurísticos: Schriber's rule, Conway, Modified Conway, Crossing-of-the-Mean, Autocorrelation Estimator, MCR/MSER, MSER-m, Telephone Network Rule, Relaxation heuristics, Beck (cíclico), Tocher's cycle rule, Kimbler double exponential smoothing, Euclidean Distance, Neural Networks.
- Estatísticos: Goodness-of-fit, ASD/ADD (Bause & Eickhoff), regressão de Kelton & Law, Glynn & Iglehart, WASSP (wavelet), MSEASVT, teoria do caos, Kalman filter, Randomisation tests (Yücesan).
- Testes de viés: Schruben max (STS), Schruben modificado, Optimal (Brownian bridge), Rank test, testes por batch means (Max, Batch Means, Area), t-tests de Ockerman & Goldsman.
- Híbridos: método sequencial de Pawlikowski, Scale-Invariant Truncation (SIT).

— [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)

**Descrição das heurísticas clássicas**
- **Regra de Conway (forward data-interval rule).**
  - Em cada réplica piloto, descartar observações iniciais até que a primeira restante não seja nem o máximo nem o mínimo das restantes.
  - O warm-up é o maior valor entre as réplicas piloto, ou seja, o máximo dos t_j (Fishman 1973; Gafarian et al. 1978).
  - Fishman recomenda aplicar a médias de lotes. Bratley et al.: aplicada a observações individuais, "it will not work well".
  - Pawlikowski (1990): superestima o transiente para ρ baixo e subestima para ρ alto.
  
  — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf); [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf). Nota no catálogo: Accuracy = Poor, Automation = Good.
- **Crossing-of-the-mean.**
  - Contar quantas vezes a série cruza a média, que pode ser a média total, a cumulativa, ou a cumulativa contra a total, conforme a fonte. O truncamento é o ponto em que se atinge k cruzamentos.
  - Valores de k usados: Gafarian et al. usaram k = 3, e houve estudos com k = 20.
  - Rejeitado pelo AutoSimOA por ser "extremely sensitive to the selection of its main parameter, which was system-dependent" (Pawlikowski 1990).
  
  — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf); [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf); [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Teste máximo de Schruben (1982).**
  - Calcula as somas parciais padronizadas S_m(k) e localiza o máximo k*.
  - Estatística h* = s*²/[3σ̂²t*(1−t*)] ~ F(3, ν), com H0: sem viés negativo.
  - Exige estimar a variância de regime σ̂² (e ν). Pode usar uma execução ou réplicas médias.
  
  Schruben et al. (1983) propõem o "optimal test" (ponte browniana). Ambos são testes de presença de viés, não de ponto de corte — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Teste modificado de Schruben (Nelson 1992).** Divide a execução ao meio e compara as CUSUMs das metades. Em White et al. (2000) foi eficaz para oscilação amortecida e mean shift, mas fraco para viés exponencial e "occasionally removed large amount of data" — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Kelton & Law (1983), regressão.**
  - Ajusta uma reta por GLS sobre médias de lotes das réplicas médias e testa inclinação zero, movendo a janela para trás.
  - Pressupõe convergência monotônica.
  - Falhou em 43% de 51 casos M/M/k em Roth (1994).
  - É complexo de codificar e tem muitos parâmetros.
  
  — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf); [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Método SPC (Robinson 2002/2007).**
  - Usa réplicas, médias entre réplicas e lotes que passem nos testes de von Neumann (correlação) e Anderson-Darling (normalidade), com pelo menos 20 lotes.
  - A média e o desvio da carta são estimados na **segunda metade** da série.
  - O warm-up é o ponto em que a série fica "in control" e permanece assim, segundo regras de Western Electric (3σ, 2 de 3 além de 2σ, etc.).
  - Nota do catálogo: "Simple to implement but not easily automatable … need to estimate 5 parameters".
  
  — [Robinson 2002, WSC](https://www.informs-sim.org/wsc02papers/055.pdf); [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf); [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Híbrido de Pawlikowski.** Uma heurística dá o corte inicial e o optimal test verifica a estacionariedade, iterando. O principal problema prático é que "they require a priori knowledge of the variance estimator of the simulated process in steady state". Além disso, há cerca de 7 parâmetros no algoritmo híbrido — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)

**Pré-seleção (shortlisting) do AutoSimOA**
- Seis critérios: (1) precisão e robustez; (2) simplicidade; (3) facilidade de automação; (4) generalidade quanto a tipos de viés e de saída; (5) número de parâmetros a estimar; (6) tempo de computação, idealmente desprezível perto da simulação. Versões superadas foram rejeitadas, por exemplo o MCR, substituído pelo MSER-5 — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Selecionados para teste:**
  - Heurísticos: **MSER-5, Kimbler's Double Exponential Smoothing, Euclidean Distance (ED)**.
  - Estatísticos: **Goodness-of-fit, ASD, ADD**.
  - Rejeitados: o teste máximo de Schruben ("for robustness reasons") e o rank test (informação conflitante nos artigos originais). Os demais testes de viés e os híbridos ficaram suspensos por tempo.
  
  — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Resultados preliminares:**
  - ASD/ADD exigem muitas réplicas.
  - Goodness-of-fit e Kimbler subestimaram o ponto "consistently and severely".
  - ED não retornou resultado na maioria das vezes.
  - Métodos sequenciais pressupõem viés monotônico e falham com mean shift.
  - Métodos que analisam todos os dados de uma vez lidam melhor com tipos variados de viés.
  - "MSER-5 … performed the best and the most consistently".
  
  — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Bateria de testes.**
  - Viés com comprimento L = 0, 10, 40 ou 100% da série; severidade M = 1, 2, 4 (em unidades de percentil); 5 formas (mean shift, linear, quadrática, exponencial, oscilatória decrescente).
  - Erros N(0,1) ou Exp(1); autocorrelação nenhuma, AR(1), AR(2), MA(2), AR(4) ou ARMA(5,5); execução única ou média de 5 réplicas.
  - Viés aplicado por superposição.
  - Total de 2.016 + 1.032 = **3.048 conjuntos**, cada um com 100 execuções.
  
  — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **Por que MSER-5 foi escolhido:** "not model or data type specific, does not require estimation of any parameters, and can run with minimal user intervention … runs quickly and performs robustly and effectively for a wide range of data series" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf); [AutoSimOA warm-up page](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup)
- **Notas do catálogo para o MSER-5:** Accuracy, Simplicity, Automation potential e Generality todos = Good. Parâmetros: run length e batch size, "although this could be set to 5 by default". Computation time = Medium. Nenhum outro método recebeu Good em todos esses critérios — [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Problemas práticos ao embutir o MSER-5 num software comercial** (parceria com a SIMUL8 Corporation; projeto financiado pelo EPSRC, EP/D033640/1):
  1. Para rodar de forma sequencial com réplicas é preciso salvar o estado final de cada réplica e continuar dele.
  2. Os KPIs nativos costumam ser cumulativos ou extremos, inadequados ao MSER-5.
  3. O software registra por tempo, enquanto muitas saídas são por entidade.
  4. A escolha da quantidade de dados a analisar.
  
  Recomendações aos fornecedores:
  - Salvar o estado de cada réplica.
  - Impedir o cálculo de warm-up sobre dados cumulativos.
  - Fornecer as saídas também desagregadas.
  - Permitir definir warm-up e run length por número de entidades.
  
  — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf); [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- **O que o AutoSimOA deixa para o usuário.** Deixa as decisões de "o quê": se a saída é transiente, de regime permanente ou cíclica; se usa réplicas ou uma execução longa; quais saídas analisar. Automatiza o "como" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)

### Inferences
- [Estimativa] Para um produto, a lição do AutoSimOA é tão de **engenharia de dados** quanto de estatística:
  - Coletar séries **desagregadas** por intervalo ou por entidade, não cumulativas.
  - Permitir continuar réplicas.
  - Deixar o usuário confirmar o resultado com um gráfico.
- [Palpite] Testes de viés (Schruben, optimal test) podem servir como **verificação a posteriori** do corte do MSER-5, que é o desenho "híbrido" que o AutoSimOA deixou em aberto. Exigem, porém, estimar a variância de regime e não foram validados pelo projeto.

### Gaps
- O texto completo do JORS 2010, com a versão final do shortlist e os resultados para L = 0% e 100% ("currently being analysed" em 2008), não foi acessível: a cópia da Loughborough retornou 403.
- O artigo do Journal of Simulation 2011 (AutoSimOA framework, vol. 5, pp. 9–24) não foi lido.
- Há divergência na contagem de métodos: 42 no artigo WSC 2008, 44 na página do projeto e numeração até 46 no catálogo. Provavelmente são versões diferentes.

---

## 4. Trabalhos comparativos posteriores (Mahajan & Ingalls 2004, Pasupathy & Schmeiser 2010, Hoad & Robinson, WSC recentes): há consenso de que o MSER-5 é o mais robusto para automação?

### Takeaway
Há um **consenso declarado** na comunidade WSC, sobretudo em 2010–2011, de que o MSER e o MSER-5 são a melhor base para regras automáticas de truncamento. Esse consenso é sustentado por White, Hoad, Robinson, Franklin, Sánchez e Pasupathy & Schmeiser. Ele não é unânime nem incondicional: Mahajan & Ingalls (2004) concluem que "no method works well for all types of models", e Wang & Glynn (2016) mostram contraexemplos teóricos.

### Cited Findings
- Sánchez & White (2011): "a consensus has emerged among researchers that MSER has all of the properties most desired in a truncation criterion. It is effective and efficient at mitigating bias, robust across alternate forms of biasing functions, computationally trivial, easily understood, and does not require experimenter intervention to establish parameters". Exemplos que eles listam:
  - Oh & Park (2006) acharam o MSER-m "the most sensitive rule in detecting bias".
  - Bertoli, Casale & Serazzi (2007, 2009) adotaram MSER-5 no pacote **Java Modelling Tools (JMT)**, com um assistente.
  - Mokashi et al. (2010) compararam o **N-Skart** ao MSER-5 e obtiveram "only modest improvements with considerably greater computational effort".
  
  — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)
- **Mahajan & Ingalls (2004).**
  - Desenho: job shop com 5 células, 3 classes, utilização alta (90%), média (70%) e baixa (50%). Medida: número no sistema por hora. 5 réplicas, 1.000 h e depois 5.200 h. Métodos: Welch, SPC, Randomization, Conway, Crossing-of-the-means e MSER-5.
  - Resultados:
    - "there is no method which works well for all types of models".
    - MSER-5 "works well for longer run lengths. For shorter run lengths it works well for low and moderately utilized models. This rule is highly efficient".
    - SPC é bom para alta utilização com execução longa, mas superestima em baixa e média utilização.
    - O teste de aleatorização é bom em alta utilização se houver mais dados, mas é muito lento.
    - Conway é "very aggressive" e só serve para baixa utilização.
    - Crossing-of-the-means precisa de execuções muito longas.
    - Welch é subjetivo.
  - Com 1.000 h e alta utilização, **nenhum método funcionou**. O MSER-5 chegou a aumentar o MSE em 23%.
  
  — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf). Os autores ressaltam que a medida de desempenho foi escolhida arbitrariamente e "Results may vary for different performance measures".
- **Pasupathy & Schmeiser (2010).**
  - Defendem o **MSE** como critério principal de comparação.
  - Provam que o MSER é assintoticamente proporcional ao MSE.
  - Propõem MSER-LLM e MSER-LLM2, ambos melhores que o MSER-GM.
  - Explicam por que **não** avaliam o MSER-5: criticam o lote fixo de 5.
  - Listam requisitos para uma regra automática: aplicável a muitos estimadores e processos, "automatic, in the sense that human judgment is not required, either to set algorithm parameters or to judge (subjectively) the 'look' of the output data", e que sempre retorne uma quantidade a deletar.
  
  — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)
- **White & Robinson (2010)**, Journal of Simulation 4(4):268–272, DOI 10.1057/jos.2010.19. Partem da conclusão de Hoad et al. de que o MSER é "efficient, effective, and robust … appropriate for automation". Argumentam que o objetivo correto é **mínimo MSE**, e não achar a condição inicial mais representativa, e que isso enfraquece o caso do replication/deletion como método eficiente — [IDEAS/RePEc](https://ideas.repec.org/a/taf/tjsmxx/v4y2010i4p268-272.html) (visto só pelo resumo)
- **Robinson (2007, EJOR)**, sobre o método SPC: o resumo diz que nenhum método pode ser recomendado acima dos demais. Fonte de busca, não verificada no texto — [WRAP Warwick](https://wrap.warwick.ac.uk/32864/)
- **Wang & Glynn (2016, TOMACS).**
  - Contraexemplos "não-patológicos" em que uma variante do MSER falha.
  - A eficácia depende da medida de desempenho.
  - Os problemas-teste padrão deveriam ser "substantially broadened".
  
  — [Wang & Glynn 2016](https://web.stanford.edu/~glynn/papers/2016/WangG16.html)
- **Sánchez & White (2011)**, com IC usando replication/deletion e MSER-5. Num M/M/1 com ρ = 0,95 e 10 réplicas, a cobertura de um IC nominal de 90% foi de **79% com n = 10.000** e **86,5% com n = 100.000**. A subcobertura vem do viés residual da média MSER e cai com execuções mais longas — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)

### Inferences
- [Estimativa] O consenso pode ser resumido assim: entre os métodos **objetivos, sem parâmetros e baratos**, o MSER-5 (ou outra variante do MSER) é a escolha padrão para automação. Ele não é infalível. Os casos de risco são alta utilização ou autocorrelação forte com execuções curtas, oscilações e medidas que não são médias, como quantis e máximos.
- [Estimativa] Boa parte da evidência pró-MSER vem do mesmo grupo de autores (White/UVA e Hoad/Robinson/Warwick). As vozes independentes são mais cautelosas: Mahajan & Ingalls e Wang & Glynn. Pasupathy & Schmeiser são independentes e apoiam a estatística MSER, mas não o lote fixo de 5.
- [Palpite] Para um produto didático, usar MSER-5 como padrão e a regra da primeira metade como guarda-corpo é a escolha com mais respaldo publicado. Num produto de pesquisa, valeria oferecer MSER-LLM ou lotes variáveis.

### Gaps
- Não encontrei meta-análise ou survey posterior a 2016 que reavalie o ranking de forma independente. Também não encontrei comparações recentes (2018–2026) na WSC com modelos de manufatura. A busca foi limitada.
- Não li Mokashi et al. (2010), sobre N-Skart vs MSER-5, nem Oh & Park (2006). Ambos são citados via Sánchez & White.

---

## 5. Aplicação prática: por medida de saída (throughput, WIP, tempo no sistema), sobre médias de réplicas, e como lidar com várias saídas (tomar o máximo?)

### Takeaway
A recomendação é calcular o warm-up **separadamente para cada saída de interesse** e, havendo várias, **usar o maior warm-up**. O MSER-5 deve rodar sobre a **média entre réplicas**, o que dá mais robustez, e sobre séries **desagregadas** (por intervalo ou por entidade). Nunca sobre médias cumulativas nem extremos.

### Cited Findings
- O framework sequencial do MSER-5 é "duplicated for each output variable of user interest (i = 1,…,k)". Os autores registram que se ensina a "warm-up every output that they are interested in (Robinson 2004, Law 2009)" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Ajuda do SIMUL8 sobre warm-up: escolher as medidas de interesse. Se houver mais de uma, aplicar o procedimento a algumas ou a todas e "use the longest warm-up time indicated" — [SIMUL8 Help (Minitab)](https://support.minitab.com/en-us/simul8/help-and-how-to/getting-started/warm-up-time/)
- Com réplicas, o MSER-5 atua sobre a série média x̄_i = (1/M) Σ_m x_{m,i}. Isso "is the appropriate procedure when intending to run the model with multiple replications" e foi "more robust when applied to this kind of data series, due to the smoothing effect of averaging" — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf). Com 5 réplicas médias houve muito mais casos com grande percentual de viés removido do que com execução única, e o efeito da autocorrelação foi "greatly reduced" — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- Alternativa: MSER por réplica. Os pontos d_j* são aleatórios e os comprimentos ficam desiguais, o que enviesa ICs ingênuos. Há duas soluções:
  1. Aplicar o **máximo** dos truncamentos a todas as réplicas.
  2. Usar média e variância **ponderadas** por (n − d_j*)/N, com graus de liberdade não inteiros.
  
  — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)
- Conway (via Fishman 1973) também usa o **máximo** entre réplicas piloto — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf); [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- **Tipo de saída.**
  - Saídas cumulativas, como tempo médio em fila acumulado ou utilização média acumulada, e extremos (mín/máx) têm variância decrescente. Isso:
    - (a) simula um transiente mesmo sem viés;
    - (b) superestima o warm-up quando há viés;
    - (c) faz o MSER-5 apontar para o fim da série. Só 7% de truncamentos válidos foram obtidos em séries cumulativas sem viés.
  - Recomendação: trabalhar com dados desagregados.
  - Fórmula para desagregar médias cumulativas por tempo: D_i = (N_i·y_i − N_{i−1}·y_{i−1}) / (N_i − N_{i−1}). Exige registrar também a contagem acumulada de entidades N_i.
  
  — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Entidade vs tempo: saídas como tempo no sistema, tempo em fila e tamanho de fila são naturalmente por entidade. O software comercial costuma definir warm-up e run length por tempo. Os autores recomendam permitir defini-los também por número de entidades — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Exemplos de medida usada em estudos:
  - Throughput horário numa linha de usinagem de blocos de motor, com 5 réplicas de 1.000 h — [Robinson 2002](https://www.informs-sim.org/wsc02papers/055.pdf)
  - Número no sistema (WIP) por hora — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
  - Tempo no sistema em linhas seriais e job shops — Sandikci & Sabuncuoglu 2006, via [Catálogo AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf)
- A eficácia de um procedimento de deleção depende da medida de desempenho escolhida — [Wang & Glynn 2016](https://web.stanford.edu/~glynn/papers/2016/WangG16.html). O MSER se justifica quando a medida é uma **média** — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf)

### Inferences
- [Estimativa] Desenho prático para um produto:
  1. Para cada KPI selecionado, como throughput por intervalo, WIP médio por intervalo (time-weighted) e tempo no sistema por entidade ou por lote de entidades, gerar a série **desagregada** em intervalos fixos.
  2. Calcular a média entre réplicas.
  3. Rodar o MSER-5 com a regra da primeira metade.
  4. Converter o corte para tempo simulado.
  5. Usar o **máximo** entre KPIs como warm-up global e mostrar o warm-up de cada KPI.
- [Estimativa] O throughput por intervalo costuma ser mais ruidoso e menos autocorrelacionado que o WIP ou o tempo no sistema. Por isso tende a dar warm-ups mais curtos, o que faz do máximo entre KPIs a escolha conservadora. [Palpite: não verifiquei isso empiricamente numa fonte.]
- [Palpite] Para tempo no sistema, registrado na saída da entidade, o viés inicial aparece com atraso de um tempo de ciclo, porque as primeiras entidades encontram a fábrica vazia. Isso sugere converter o corte por entidade em tempo pela data de **entrada** da entidade, ou usar o maior dos dois.

### Gaps
- Não encontrei uma fonte primária acadêmica que formalize "tomar o máximo entre saídas" além da ajuda do SIMUL8 e da prática de usar o máximo entre réplicas (Fishman/Conway; Sánchez & White, opção 1). Robinson (2004/2014, livro) provavelmente diz o mesmo, mas não foi verificado.
- Não encontrei estudo comparando warm-ups de throughput, WIP e tempo no sistema no mesmo modelo.

---

## 6. Orientação prática sobre o comprimento da execução em relação ao warm-up

### Takeaway
As regras publicadas que encontrei vão de **≥ 2× o warm-up** (implícita na regra de deletar no máximo metade dos dados) a **≥ 4× o warm-up**, que é a recomendação explícita de Robinson (2002) para o método SPC. Execuções mais longas reduzem o viés residual e melhoram a cobertura dos ICs. Não confirmei em fonte primária a regra frequentemente repetida de "10×".

### Cited Findings
- Robinson (2002), método SPC:
  - "It is recommended that the run length is at least four times longer than the estimated length of the initial transient and that at least 60 data points are collected in each replication".
  - Recomenda também **5 a 10 réplicas** no mínimo.
  - O motivo dos 4× é que a média e o desvio da carta são estimados na segunda metade e precisam ser de regime permanente.
  
  — [Robinson 2002, WSC](https://www.informs-sim.org/wsc02papers/055.pdf)
- Limite usual do MSER: não deletar mais que n/2 — [Pasupathy & Schmeiser 2010](https://www.informs-sim.org/wsc10papers/017.pdf). No AutoSimOA, um corte na segunda metade é inválido e dispara a coleta de mais 10% de lotes — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- Hoad & Robinson (2011) alertam que pode ser "advisable for the user not to use MSER-5 to analyze data of a run length much longer than the intended experimental run length", porque em tese o viés se dilui com mais dados. Empiricamente, porém, aumentando o run length de 100 para 1.100 pontos:
  - **75%** dos conjuntos mantiveram o mesmo ponto;
  - 18% reduziram o ponto, em média 14 pontos;
  - 6% aumentaram, em média 18 pontos.
  
  — [Hoad & Robinson 2011](https://www.informs-sim.org/wsc11papers/044.pdf)
- "The impact of residual bias is dependent on the run-length of the simulation beyond the truncation point" — [Hoad et al. 2008](https://www.informs-sim.org/wsc08papers/063.pdf)
- Mahajan & Ingalls: com 1.000 h nenhum método funcionou no sistema de alta utilização. O SPC exigiu 5.200 h, e com 5.200 h vários métodos passaram a funcionar. O MSER-5 "works well for longer run lengths" — [Mahajan & Ingalls 2004](https://www.informs-sim.org/wsc04papers/080.pdf)
- Cobertura de IC com MSER-5 e replication/deletion (M/M/1, ρ = 0,95): 79% com n = 10⁴ e 86,5% com n = 10⁵, contra 90% nominal — [Sánchez & White 2011](https://www.informs-sim.org/wsc11papers/043.pdf)
- AutoSimOA, ferramenta de run length: começa com uma execução inicial e **dobra** o comprimento até conseguir estimar os parâmetros. Esse é um procedimento de duplicação, não uma razão fixa em relação ao warm-up — fonte de busca, [AutoSimOA](https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa)

### Inferences
- [Estimativa] Regra operacional coerente com as fontes:
  - Run length mínimo para estimar o warm-up: o MSER-5 precisa achar o corte na primeira metade, o que implica ≥ 2× o warm-up.
  - Run length de produção: ≥ 4× o warm-up, como em Robinson 2002. Mais em sistemas de alta utilização ou autocorrelação forte.
  - Na prática, vários múltiplos acima disso para que o viés residual fique desprezível frente ao erro amostral.
- [Palpite] A heurística de "≥ 10× o warm-up", comum em material didático, é plausível como margem conservadora, mas **não encontrei fonte primária** que a sustente nesta pesquisa.

### Gaps
- Não verifiquei as recomendações de comprimento em Law (2015, *Simulation Modeling and Analysis*, 5ª ed.), Banks, Carson, Nelson & Nicol (*Discrete-Event System Simulation*) nem Robinson (2014, *Simulation: The Practice of Model Development and Use*, 2ª ed.). Se existir uma regra de "n× warm-up" nesses livros, não foi confirmada aqui.

### Referências completas (todas as perguntas)
- Hoad, K., S. Robinson & R. Davies (2008). "Automating warm-up length estimation". *Proceedings of the 2008 Winter Simulation Conference*, pp. 532–540. DOI 10.1109/WSC.2008.4736110. https://www.informs-sim.org/wsc08papers/063.pdf
- Hoad, K., S. Robinson & R. Davies (2010). "Automating warm-up length estimation". *Journal of the Operational Research Society* 61(9):1389–1403. DOI 10.1057/jors.2009.87. https://wrap.warwick.ac.uk/id/eprint/5368 (texto completo não acessado)
- Hoad, K., S. Robinson & R. Davies (2011). "AutoSimOA: a framework for automated analysis of simulation output". *Journal of Simulation* 5:9–24. (Não acessado; citado em Hoad & Robinson 2011.)
- Hoad, K. & S. Robinson (2011). "Implementing MSER-5 in commercial simulation software and its wider implications". *Proceedings of the 2011 Winter Simulation Conference*, pp. 495–503. DOI 10.1109/WSC.2011.6147779. https://www.informs-sim.org/wsc11papers/044.pdf
- AutoSimOA, Warwick Business School. Página de warm-up: https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup. Catálogo de métodos: https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/current_work/website_warmup_methods_total_doc.pdf
- White, K. P., Jr. (1997). "An effective truncation heuristic for bias reduction in simulation output". *Simulation* 69(6):323–334.
- White, K. P., Jr., M. J. Cobb & S. C. Spratt (2000). "A comparison of five steady-state truncation heuristics for simulation". *Proceedings of the 2000 Winter Simulation Conference*, pp. 755–760.
- Spratt, S. C. (1998). *An evaluation of contemporary heuristics for the startup problem*. M.S. thesis, University of Virginia.
- Franklin, W. W. & K. P. White, Jr. (2008). "Stationarity tests and MSER-5: exploring the intuition behind mean-squared-error-reduction in detecting and correcting initialization bias". *Proceedings of the 2008 Winter Simulation Conference*, pp. 541–546. https://www.informs-sim.org/wsc08papers/064.pdf
- White, K. P., Jr. & S. Robinson (2010). "The problem of the initial transient (again), or why MSER works". *Journal of Simulation* 4(4):268–272. DOI 10.1057/jos.2010.19. https://ideas.repec.org/a/taf/tjsmxx/v4y2010i4p268-272.html
- Pasupathy, R. & B. Schmeiser (2010). "The initial transient in steady-state point estimation: contexts, a bibliography, the MSE criterion, and the MSER statistic". *Proceedings of the 2010 Winter Simulation Conference*. https://www.informs-sim.org/wsc10papers/017.pdf (A paginação "184–197" citada por Sánchez & White parece erro de cópia, porque se repete para outros artigos na mesma lista.)
- Sánchez, P. J. & K. P. White, Jr. (2011). "Interval estimation using replication/deletion and MSER truncation". *Proceedings of the 2011 Winter Simulation Conference*, pp. 488ss. https://www.informs-sim.org/wsc11papers/043.pdf
- Mahajan, P. S. & R. G. Ingalls (2004). "Evaluation of methods used to detect warm-up period in steady state simulation". *Proceedings of the 2004 Winter Simulation Conference*, pp. 663–671. https://www.informs-sim.org/wsc04papers/080.pdf
- Robinson, S. (2002). "A statistical process control approach for estimating the warm-up period". *Proceedings of the 2002 Winter Simulation Conference*. https://www.informs-sim.org/wsc02papers/055.pdf. A versão em periódico é Robinson, S. (2007), "A statistical process control approach to selecting a warm-up period for a discrete-event simulation", *European Journal of Operational Research* 176(1):332–346; Hoad et al. 2008 a datam como 2005.
- Wang, R. J. & P. W. Glynn (2016). "On the marginal standard error rule and the testing of initial transient deletion methods". *ACM Transactions on Modeling and Computer Simulation* 27(1), Article 1. https://web.stanford.edu/~glynn/papers/2016/WangG16.html (DOI provável 10.1145/2961052, não confirmado)
- Schruben, L. W. (1982). "Detecting initialization bias in simulation output". *Operations Research* 30(3):569–590. Schruben, L. W., H. Singh & L. Tierney (1983). "Optimal tests for initialization bias in simulation output". *Operations Research* 31(6):1167–1178.
- Welch, P. D. (1983). "The statistical analysis of simulation results". In S. Lavenberg (ed.), *The Computer Performance Modeling Handbook*, Academic Press, pp. 268–328.
- Conway, R. W. (1963). "Some tactical problems in digital simulation". *Management Science* 10(1):47–61. Gafarian, A. V., C. J. Ancker & T. Morisaku (1978). "Evaluation of commonly used rules for detecting steady state in computer simulation". *Naval Research Logistics Quarterly* 25:511–529.
- Kelton, W. D. & A. M. Law (1983). "A new approach for dealing with the startup problem in discrete event simulation". *Naval Research Logistics Quarterly* 30:641–658.
- Sandikci, B. & I. Sabuncuoglu (2006). "Analysis of the behavior of the transient period in non-terminating simulations". *European Journal of Operational Research* 173:252–267.
- Pawlikowski, K. (1990). "Steady-state simulation of queueing processes: a survey of problems and solutions". *ACM Computing Surveys* 22(2):123–170.
- Law, A. M. & W. D. Kelton (2000). *Simulation Modeling and Analysis*, 3ª ed. McGraw-Hill.
- Clark, Cole & Michel (2024). "Robust automated truncation point selection for molecular simulations" (pacote RED). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11736681/ (visto só pelo resumo)
- SIMUL8 Help, "Warm Up Time". https://support.minitab.com/en-us/simul8/help-and-how-to/getting-started/warm-up-time/
