# Casos de validação do motor contra resultados analíticos

> Notas de pesquisa (04/11/2026). Rótulos: **[Fato]** = sustentado pela fonte citada ao lado; **[Cálculo próprio]** = número que calculei nesta sessão, com o método; **[Estimativa]** = inferência derivada de fatos ou cálculos, com o raciocínio; **[Palpite]** = conhecimento prévio não verificado em fonte nesta sessão.
>
> **Limite de acesso, importante para o redator:** os PDFs (Little 2011 na cópia da UMass, lição de casa da Georgia Tech) vieram como binário sem ferramenta de extração na máquina; o texto do Little foi lido na reimpressão HTML do Project Production Institute. O texto primário de Hopp e Spearman (*Factory Physics*), de Gross et al., de Kleinrock e de Abate e Whitt **não foi lido**: as fórmulas de Hopp e Spearman vêm de material de curso e resumos (secundários) e as de M/M/1 de fontes secundárias, confirmadas por cálculo próprio.
>
> **Scripts dos cálculos próprios** (Python puro, sem dependências) ficaram no scratchpad da sessão: integração RK4 da cadeia M/M/1 truncada em 300 estados, passo 0,02 (`mm1t.py`, `g0.py`); Monte Carlo com 20.000 replicações (`mc.py`); recursão de saídas de linha determinística com bloqueio (`det.py`). Não estão no repositório.

## 1. M/M/1 com λ = 0,8 e μ = 1,0 (regime estável)

### Takeaway
Correto como afirmado: ρ = 0,8; L = 4; W = 5; Lq = 3,2; Wq = 4. Mas o caso só vale com **fila infinita** (ou grande o bastante), **chegadas nunca bloqueadas**, **sem falhas nem setups**, L contando **quem está em serviço**, e no **modo regime estável** (com aquecimento descartado); a comparação é por IC, nunca igualdade.

### Cited Findings
- [Fato] Fórmulas de regime da M/M/1: L = ρ/(1−ρ), Lq = ρ²/(1−ρ), Wq = ρ/(μ−λ) = λ/(μ(μ−λ)), e L = λW, Lq = λWq; exemplo de livro-texto com ρ = 0,8 dá L = 0,8/0,2 = 4 — [Kelton et al., *Simio and Simulation* (2014), notas em RPubs](https://rstudio-pubs-static.s3.amazonaws.com/305152_deb4ef47278a4a20a136768a8293127e.html); [MetricGate, M/M/1](https://metricgate.com/docs/queuing-mm1/) (secundário, só confirma as formas).
- [Fato] A mesma busca apontou que uma das fontes secundárias traz código com W e Wq trocados — [MetricGate, M/M/1 estacionária](https://metricgate.com/docs/queue-mm1-stationary/). Moral: conferir as fórmulas pela álgebra, não por código copiado.
- [Fato, da pesquisa anterior] Variância assintótica da média temporal de L: σ² = 2ρ(1+ρ)/(1−ρ)⁴, atribuída a Whitt (1989), não lida no original — [aquecimento-em-simulacao-didatica.md](../../aquecimento-em-simulacao-didatica.md).

### Inferences
- [Cálculo próprio] Com λ = 0,8, μ = 1: ρ = 0,8; L = 0,8/0,2 = **4**; Lq = 0,64/0,2 = **3,2**; W = 1/(1−0,8) = **5**; Wq = 0,8/(1·0,2) = **4**; utilização (fração do tempo ocupado) = **0,8**; P(sistema vazio) = 0,2. Conferência: L − Lq = ρ = 0,8; W − Wq = 1/μ = 1.
- [Cálculo próprio] σ² = 2·0,8·1,8/0,2⁴ = 1.800; para IC 95% com ±5% em L (±0,2): n·T ≈ 1,96²·1.800/0,04 ≈ **1,73×10⁵** unidades de tempo. Confirma a pesquisa anterior.
- [Estimativa] Condições que o teste precisa fixar no Takt: (a) a fila antes da estação é ilimitada; se for finita com capacidade K, vira M/M/1/K e a probabilidade de cheio ≈ (1−ρ)ρ^K exige K ≥ ~35 para ficar abaixo de 10⁻⁴; (b) a fonte nunca é bloqueada (fonte bloqueada atrasa chegadas e as deixa de ser Poisson); (c) estação sem falhas, sem defeitos e sem transporte; (d) a unidade de tempo é o tempo médio de serviço (ex.: serviço exponencial de média 60 s e chegadas exponenciais de média 75 s dão W = 300 s); (e) W é o tempo no sistema, incluindo o serviço.

### Gaps
- Gross, Shortle, Thompson e Harris e Kleinrock não foram lidos nesta sessão; a citação de livro-texto primário para o `references.md` ainda falta (as fórmulas são padrão e foram conferidas pela álgebra).

## 2. M/M/1 transiente começando vazio: média de L em [0, 480] com ρ = 0,8

### Takeaway
**3,79 está correto** (3,7918), como valor esperado da média temporal de L(t) sobre [0, 480], começando vazio, λ = 0,8, μ = 1, sem aquecimento. Confirmei por dois métodos independentes. Mas o teste com 30 replicações **não consegue distinguir 3,79 de 4**: o IC tem meia-largura ≈ 0,62. A afirmação da pesquisa anterior de que 30 replicações dão "um IC estreito em torno de 3,79, que exclui o valor verdadeiro 4" está **errada**.

### Cited Findings
- [Fato] Abate, J.; Whitt, W. (1987). "Transient behavior of the M/M/1 queue: starting at the origin". *Queueing Systems* 2:41–65, DOI 10.1007/BF01182933. O resumo diz que os momentos fatoriais do tamanho da fila em função do tempo, partindo do vazio, têm estrutura que facilita aproximações — [Unpaywall](https://unpaywall.org/10.1007%2FBF01182933) (só metadados e resumo; texto não lido).
- [Fato] Odoni e Roth (1983) é descrito por fonte secundária como comparação empírica de filas transientes observadas e previstas na M/M/1 — resultado de busca que apontou [Leemis et al., INFORMS JOC 2012](https://www.math.wm.edu/~leemis/2012informsjocb.pdf) (o PDF falhou por certificado; texto não lido).
- [Fato] A ordem do viés de inicialização é (1−ρ)⁻³ e a da variância (1−ρ)⁻⁴; "in absolute error the variance is the dominant criterion" — [Ni e Henderson](https://people.orie.cornell.edu/shane/pubs/howhard.pdf) (citado pela pesquisa anterior; não relido).

### Inferences
- [Cálculo próprio, integração numérica das equações de Kolmogorov] E[L(t) | L(0) = 0]: 2,030 em t = 10; 3,792 em t = 100; 3,963 em t = 200; 3,992 em t = 300; 3,999 em t = 480. Média temporal esperada em [0, T]: **3,7918 em T = 480**; 3,8958 em T = 960; 3,9792 em T = 4.800. Com aquecimento de 200 descartado, a média em [200, 480] é 3,9914.
- [Cálculo próprio] A integral do viés ∫₀^∞ (E[L(t)] − L) dt converge para **−100**, e confere com a forma fechada g(0) = −ρ/(1−ρ)³ em três valores de ρ: −4,000 (ρ = 0,5), −25,926 (ρ = 0,7) e −100 (ρ = 0,8). Logo 4 − 100/480 = 3,7917 é uma aproximação excelente em T = 480 (o resto é a integral da cauda após 480, ≈ 0,05/480). A forma fechada foi verificada numericamente; **não encontrei a fórmula numa fonte primária lida** (rótulo: cálculo próprio).
- [Cálculo próprio, Monte Carlo independente] 20.000 replicações de [0, 480] partindo do vazio, gerador Mersenne Twister do Python, semente 12345: média **3,7918** (erro padrão 0,0117); desvio padrão por replicação **1,65**.
- [Estimativa, a partir do Monte Carlo] Meia-largura do IC 95% com 30 replicações ≈ 2,045·1,65/√30 ≈ **0,62**: o IC contém 3,79 e 4 ao mesmo tempo. Para separar os dois (diferença 0,21) é preciso meia-largura ≲ 0,1, ou seja **~1.000 replicações**; para ±0,05 em torno de 3,79, **~4.200 replicações** (≈ 2×10⁶ unidades de tempo). A pesquisa anterior acerta que o viés não diminui com mais replicações, mas erra ao dizer que 30 replicações já o revelam.
- [Estimativa] Um alvo transiente mais barato, se o objetivo for testar o modo turno: E[L(t)] em t pequeno (ex.: 2,030 em t = 10), em que o desvio do regime (−1,97) é grande diante do ruído. O desvio padrão de L(10) não foi calculado: é um gap.
- [Estimativa] Condições que o caso precisa nomear: começa vazio e com o servidor livre; a primeira chegada é sorteada (não ocorre em t = 0); L inclui quem está em serviço; média temporal (área/T), não média nos instantes de evento; unidade de tempo = tempo médio de serviço.

### Gaps
- Fórmula fechada de E[L(t)] e da média transiente em fonte primária (Abate e Whitt 1987/1988; Morse; Odoni e Roth 1983) não lida. O tempo de relaxação τ = 1/(μ(1−√ρ)²) ≈ 90 também segue sem fonte primária lida.
- Variância de L(t) em t pequeno não calculada.

## 3. Lei de Little em janela finita (Little 2011, LL.1 e LL.2)

### Takeaway
LL.1 exige o sistema **vazio em 0 e em T**; LL.2 dispensa isso, mas λ e W passam a ser definidos sobre S(T) = itens presentes em 0 + chegadas em [0, T], e W = área/S(T). Com essas definições, L = λW é uma identidade algébrica (A/T = (S/T)·(A/S)); o teste útil é verificar que a **soma, item a item, do tempo no sistema dentro da janela** é igual à **área sob o WIP**. A igualdade vale até o erro de arredondamento de ponto flutuante, não bit a bit.

### Cited Findings
- [Fato] Teorema LL.1: "For a queuing system observed over [0, T] that is empty at 0 and T and has 0 < T < ∞, the formula L = λW holds", com n(t) = itens no sistema em t, N = itens que chegam em [0, T], A = ∫₀ᵀ n(t) dt; na prova, L = A/T, λ = N/T, W = A/N — [Little 2011, reimpressão PPI](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/); original: Little, J. D. C. *Operations Research* 59(3):536–549, [DOI 10.1287/opre.1110.0940](https://pubsonline.informs.org/doi/10.1287/opre.1110.0940).
- [Fato] Teorema LL.2 (filas inicial e final não nulas): S(t) = número acumulado de itens no sistema em [0, t], que "includes not only the cumulative arrivals up to t, but also any items that were in the system at t = 0"; na prova, L = A/T, λ = S(T)/T, W = A/S(T) — [Little 2011, reimpressão PPI](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/).
- [Fato, da pesquisa anterior] LL.1 "is deterministic and holds exactly" — [aquecimento-em-simulacao-didatica.md](../../aquecimento-em-simulacao-didatica.md), citando Little 2011.
- [Fato] A versão em regime (caminho amostral) vale "subject to the existence and convergence of the three LL parameters": se os limites de λ e W existem e são finitos, L existe e L = λW — [Little 2011, reimpressão PPI](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/).
- [Fato] O artigo **não** traz uma observação sobre o erro de usar só os tempos dos itens concluídos (verificado na reimpressão) — [Little 2011, reimpressão PPI](https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/).

### Inferences
- [Estimativa] O que contar para a identidade ser exata no Takt: (1) A = ∫ WIP(t) dt sobre a janela, com WIP = peças dentro da fronteira escolhida (da entrada na linha à saída para expedição **ou refugo**); (2) S(T) = peças presentes no início da janela + peças que entraram na fronteira na janela; (3) Σᵢ (tempo da peça i dentro da janela) = Σᵢ [min(saídaᵢ, T) − max(entradaᵢ, 0)] sobre todas as S(T) peças, inclusive as que não saíram e as refugadas. Teste: Σᵢ(...) == A, com tolerância relativa da ordem de 10⁻⁹ (as duas somas acumulam arredondamentos em ordens diferentes).
- [Estimativa] **O sub-plano 4 cita LL.1, mas um turno termina com WIP.** Para usar LL.1, o teste precisa parar a fonte e rodar até a linha esvaziar (ou usar uma janela que termine vazia); caso contrário, o teorema certo é o LL.2 também no sub-plano 4.
- [Estimativa] Com as definições ingênuas (vazão = concluídas/T; lead time = média só das concluídas), L ≈ λW só aproximadamente, com um termo de borda que diminui com T. **Com refugo**, a vazão de peças boas é menor que a taxa de entrada, e "WIP = vazão × lead time" com vazão = peças boas e lead time só das peças boas **não fecha nem em regime**: λ precisa ser a taxa de entrada (ou de saída total, incluindo refugo) e W o tempo médio de todas as peças.

### Gaps
- O texto integral do artigo foi lido via reimpressão HTML resumida pelo leitor; vale reler a seção 2 no PDF antes de citar trechos literais em docs.

## 4. Linha em série com tempos determinísticos (Hopp e Spearman)

### Takeaway
"Vazão = 1 / maior tempo de ciclo" está **correto com condições faltando**: a liberação precisa ser ≥ r_b (senão vazão = taxa de liberação), cada peça visita cada estação uma vez (sem refugo, retrabalho ou rota alternativa), sem falhas, e a vazão é a **taxa de regime depois do enchimento**. "Gargalo = estação mais lenta" vale só nessa linha de rota única sem perdas; a definição de Hopp e Spearman é **a estação de maior utilização**.

### Cited Findings
- [Fato, fonte secundária] Tempo bruto de processo T₀ = soma dos tempos médios de processo de longo prazo das estações; WIP crítico W₀ = r_b·T₀; melhor caso: CT = T₀ se w ≤ W₀, senão w/r_b; TH = w/T₀ se w ≤ W₀, senão r_b (ou seja, TH_best = min(w/T₀, r_b)). Uma cópia raspada traz os casos da vazão trocados; a tabela da Penny Fab (TH = 0,125 com WIP 1 e T₀ = 8) confirma a forma min — busca sobre [GT ISyE 6201, Hw-4](https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-07/Hw-4.pdf) e [slides do cap. 7 (Scribd)](https://www.scribd.com/presentation/168662804/Chapter-07) (trechos de busca; texto primário não lido).
- [Fato, fonte secundária] O gargalo é "the workstation having the highest long-term utilization"; em linhas de rota única, é a estação de menor capacidade — [Factory Physics, notas IEOR](https://neoprimate.github.io/IEOR/supply-chain/manufacturing/factory-physics/index.html); [StudySmart, Factory Physics](https://www.studysmart.ai/en/summaries/factory-physics-hopp/station-machines-time).
- [Fato, fonte secundária] Utilização u = taxa de chegada × t_e / m (= r_a/r_e) — [StudySmart, Factory Physics](https://www.studysmart.ai/en/summaries/factory-physics-hopp/station-machines-time).

### Inferences
- [Cálculo próprio, recursão max-plus conferida por simulação] Linha determinística vazia em t = 0, tempos t₁…t_m, primeira liberação em t = 0, liberações a cada a (a = 0: fonte saturada), sem transporte, bloqueio após o serviço (BAS) e qualquer tamanho de buffer (inclusive zero): a n-ésima peça sai em **Dₙ = T₀ + (n−1)·max(a, t_max)**, com T₀ = Σtⱼ. Conferido em 5 configurações (ex.: tempos 3, 5, 2, 4 e a = 1 → 14, 19, 24, …; a = 6 → 14, 20, 26, …). Logo: tempo de enchimento (primeira saída) = T₀; vazão de regime = 1/max(a, t_max) = min(taxa de liberação, r_b).
- [Estimativa] Peças concluídas num turno [0, T] começando vazio = ⌊(T − T₀)/max(a, t_max)⌋ + 1 se T ≥ T₀, senão 0. A vazão média do turno é menor que r_b (efeito do enchimento). Se a primeira liberação ocorre em t = a e não em 0, somar a; transportes (esteiras) somam o tempo de trânsito a T₀ e, se tiverem capacidade, podem virar o gargalo.
- [Estimativa] A taxa de liberação conta: com a > t_max, não se forma fila nenhuma e a vazão é 1/a. "Gargalo" continua definido (maior utilização = t_max/a), mas não limita a vazão.
- [Estimativa] O sub-plano 6 põe este caso no regime estável "dentro do IC". Com tempos fixos e sem falhas, todas as replicações dão o mesmo número: variância zero, IC de largura zero. O código do IC precisa tratar s = 0 (sem divisão por zero nem NaN), e o teste deve comparar por igualdade (ou tolerância de ponto flutuante).
- [Palpite] Com bloqueio antes do serviço (BBS) e buffers zero, o tempo de ciclo pode ser maior que t_max; a recursão acima só vale para BAS. A regra de bloqueio do Takt não está escrita nos docs lidos.
- [Estimativa] WIP crítico e T₀: com tempos 3, 5, 2, 4, T₀ = 14, r_b = 1/5, W₀ = 2,8 peças.

### Gaps
- Texto primário de *Factory Physics* (3ª ed., cap. 7: leis do melhor caso, definição de r_b e T₀) não lido; não encontrei uma fonte publicada para a fórmula Dₙ (derivação própria).

## 5. k estações paralelas idênticas com tempo c

### Takeaway
Capacidade = k/c está **correto com condições faltando**: as k máquinas precisam ser alimentadas sem ficar ociosas enquanto há peças esperando em outra (fila única, ou roteamento que nunca deixa uma máquina parada com fila em outra), sem falhas, e a vazão observada é min(taxa de liberação, k/c, capacidade das outras estações).

### Cited Findings
- [Fato, fonte secundária] Capacidade (taxa) da estação com m máquinas: r_e = m/t_e — [StudySmart, Factory Physics](https://www.studysmart.ai/en/summaries/factory-physics-hopp/station-machines-time); exemplo de curso: "Station capacity = #machines / process time per machine" (trecho de busca sobre [GT ISyE 6201, Hw-3](https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-17/Hw-3.pdf)).

### Inferences
- [Estimativa] Com regra "por percentual" e buffers finitos por máquina, uma peça destinada a um buffer cheio bloqueia a saída mesmo com outra máquina livre: a capacidade efetiva fica abaixo de k/c. Com "fila mais curta" e desempate fixo, k/c é atingível com fonte saturada.
- [Estimativa] Numa linha determinística com uma estação de k máquinas paralelas, o "maior tempo de ciclo" a usar no caso 4 é c/k, não c.

### Gaps
- Texto primário de Hopp e Spearman para estações com várias máquinas não lido.

## 6. Disponibilidade com MTBF 240 min e MTTR 15 min

### Takeaway
A = 240/255 = 16/17 ≈ **0,9412** está **correto com condições faltando**: MTBF precisa ser o **tempo médio em operação entre o fim de um reparo e a próxima falha** (o m_f de Hopp e Spearman), as falhas precisam correr no **relógio do calendário** (ou a estação estar sempre ocupada), e o valor é de **longo prazo**. Se MTBF significar o ciclo inteiro (falha a falha), A = 225/240 = 0,9375. Se as falhas só correm com a máquina processando, a fração do tempo de calendário disponível depende da utilização.

### Cited Findings
- [Fato, fonte secundária] Hopp e Spearman: A = m_f/(m_f + m_r) (exemplo 60/(60+2) = 0,9677); t_e = t₀/A; c_e² = c₀² + 2(1−A)A·m_r/t₀ com reparo exponencial — trechos de busca sobre [GT ISyE 6201, Hw3 Solution](https://www2.isye.gatech.edu/~spyros/courses/IE6201/Spring-17/Hw3-Solution.pdf). A forma geral, com c_r², é c_e² = c₀² + (1 + c_r²)A(1−A)m_r/t₀ ([Palpite]: conhecimento prévio, coerente com o caso c_r² = 1 acima).
- [Fato, fonte secundária] Disponibilidade é "the long-run average fraction of time in which the machine is available for processing jobs"; falhas são interrupções preemptivas, que param a peça no meio do processo — [slides "Process variability" (Scribd)](https://www.scribd.com/document/522413376/11-Process-variability) (trecho de busca).
- [Fato] Falha dependente do tempo (TDF): a máquina pode falhar mesmo sem peça; falha dependente da operação (ODF): não pode falhar parada. Modelar ODF como TDF, como é comum na literatura, subestima a vazão — "Failure models and throughput rate of transfer lines", [HAL emse-00449370](https://hal-emse.ccsd.cnrs.fr/emse-00449370) (trecho de busca; a página bloqueou a leitura).

### Inferences
- [Palpite] Para falhas no relógio do calendário (processo de renovação alternado), a fração de tempo disponível de longo prazo é E[em operação]/(E[em operação] + E[reparo]), seja qual for a distribuição; só as médias importam. É o teorema de renovação-recompensa (ex.: Ross), não lido nesta sessão.
- [Cálculo próprio] Falhas só durante o processamento (ODF): para cada unidade de tempo processando há em média MTTR/MTBF = 1/16 de reparo. Numa estação saturada (sempre processando ou em reparo), a fração disponível é 16/17 = 240/255, o mesmo número. Numa estação com fração de processamento u, a fração de calendário em reparo é u/16, e a "disponibilidade" medida no calendário é 1 − u/16 (ex.: u = 0,5 → 0,969). O caso precisa dizer qual relógio usa e se a estação está saturada.
- [Cálculo próprio] Transiente do turno: com tempos exponenciais e máquina **em operação em t = 0**, a disponibilidade esperada em [0, 480] = A + (1−A)(1−e^{−(f+r)T})/((f+r)T), com f = 1/240 e r = 1/15: **0,9429**, contra 0,9412 em regime.
- [Estimativa] Precisão do teste: num turno de 480 min há ~1,9 falhas em média; o desvio padrão da indisponibilidade por turno fica em torno de √(1,9·2·15²)/480 ≈ 0,06 (soma composta de Poisson com reparos exponenciais), e o IC com 30 turnos tem meia-largura ≈ ±2,2 pontos percentuais. O teste deve usar uma corrida longa (regime estável) ou muitas replicações; o viés de 0,17 p.p. do turno fica invisível com 30.
- [Estimativa] Os docs do Takt não dizem a distribuição dos tempos até a falha e de reparo (`failure: { mtbfMin, mttrMin }` no `plant-model.md`) nem o relógio da falha. São decisões do sub-plano 5.

### Gaps
- Texto primário de Hopp e Spearman (cap. 8, interrupções preemptivas) não lido; não verifiquei se o livro supõe falhas no relógio de calendário ou de operação.
- Não encontrei uma norma lida (IEC 60050-192, MIL-HDBK-338) sobre o uso de "MTBF" como tempo em operação ou como ciclo completo; a ambiguidade é conhecimento prévio [Palpite].

## 7. Retrabalho com probabilidade p

### Takeaway
Sem limite, passagens esperadas pela estação que gera o defeito = **1/(1−p)** está **correto com condições faltando**: p igual e independente em cada passagem, retrabalho que devolve a peça à mesma estação, sem refugo por outro motivo, e a contagem por peça que entra. Com limite, o resultado depende da convenção; pela RN-SIM-006 (exemplo: "com limite 2, uma peça defeituosa pela terceira vez vira refugo"), o limite n conta **retrabalhos**, então: passagens esperadas = (1 − p^{n+1})/(1−p) e P(refugo) = **p^{n+1}**.

### Cited Findings
- [Fato] RN-SIM-006: "cada peça conta quantas vezes passou por retrabalho; ao atingir o limite, ela vai para o refugo"; exemplo: "com limite 2, uma peça defeituosa pela terceira vez vira refugo"; "Padrão: 3 passagens" — `docs/product/rules/simulation.md`. O `plant-model.md` usa `"settings": { "reworkLimit": 3 }`.
- [Palpite] O número de tentativas até o primeiro sucesso, com probabilidade de sucesso 1−p por tentativa, é geométrico em {1, 2, …}, com média 1/(1−p). É resultado de livro-texto, sem fonte lida nesta sessão.

### Inferences
- [Cálculo próprio] Seja N = número de passagens pela estação. Sem limite: P(N = k) = p^{k−1}(1−p), E[N] = 1/(1−p); passagens esperadas pela estação de retrabalho = p/(1−p).
- [Cálculo próprio] Com limite de **n retrabalhos** (convenção do exemplo da RN-SIM-006): no máximo n+1 passagens; E[N] = Σ_{k=0}^{n} p^k = (1 − p^{n+1})/(1−p); P(refugo) = p^{n+1}; P(boa) = 1 − p^{n+1}. Ex.: p = 0,2, n = 2 → E[N] = 1,24, refugo 0,8%. Se o limite contar **passagens** totais m: E[N] = (1 − p^m)/(1−p) e P(refugo) = p^m.
- [Estimativa] Há uma ambiguidade nos docs: a RN-SIM-006 conta retrabalhos ("limite 2 → refugo no 3º defeito"), mas o padrão está escrito como "3 passagens". Com p = 0,2, as duas leituras dão refugo de 0,8% (p³) ou 0,16% (p⁴) para o padrão 3. É preciso fixar a convenção antes do teste.
- [Estimativa] Efeito na carga: a estação recebe λ/(1−p) passagens (sem limite); a utilização dela é λ·t/(1−p), e o gargalo pode mudar. Isso afeta os casos 4 e 6 se forem combinados.
- [Estimativa] Num turno finito, medir "passagens por peça" só nas peças concluídas subestima levemente E[N], porque as peças com mais passagens têm mais chance de ainda estar na linha no fim. Medir por peça que entrou e terminou o ciclo, ou em regime estável.

### Gaps
- Nenhuma fonte primária foi lida para a média da geométrica (resultado elementar); `references.md` pode citar um livro de probabilidade.

## 8. Veredito caso a caso nos documentos

### Takeaway
Nenhum valor esperado está numericamente errado. A maioria dos casos omite condições, e dois pontos estão errados: a afirmação da pesquisa anterior sobre o IC com 30 replicações e o uso de LL.1 num turno que termina com WIP. Há também um defeito de formatação na tabela de `simulation.md`.

### Cited Findings
- [Fato] Em `docs/product/simulation.md`, a linha "k estações paralelas idênticas, tempo c | Capacidade = k / c" está **depois** do parágrafo "Os casos de regime estável...", fora da tabela: no Markdown, ela não renderiza como linha da tabela (verificado no arquivo, linhas 60–61).

### Inferences
| Caso (onde) | Veredito |
| --- | --- |
| Linha em série, tempos fixos: vazão = 1/maior tempo de ciclo; gargalo = estação mais lenta (`simulation.md`; sub-planos 4 e 6) | **Correto com condições faltando:** liberação ≥ r_b (senão vazão = liberação); rota única sem refugo nem retrabalho; vazão de regime após o enchimento (T₀ = Σtⱼ); gargalo = maior utilização em geral; recursão Dₙ = T₀ + (n−1)·max(a, t_max) vale com bloqueio após o serviço. No sub-plano 6, a variância é zero: tratar IC com s = 0 |
| M/M/1 λ = 0,8, μ = 1: utilização 0,8; L = 4; W = 5 (`simulation.md`; sub-plano 6) | **Correto com condições faltando:** fila ilimitada, fonte nunca bloqueada, sem falhas, L inclui o serviço, regime estável com aquecimento. Pode-se acrescentar Lq = 3,2 e Wq = 4 |
| Qualquer rodada estável: WIP = vazão × lead time (`simulation.md`; sub-plano 6) | **Correto com condições faltando:** em regime, λ = taxa de entrada (ou saída total incluindo refugo) e W = tempo médio de todas as peças; com refugo, "vazão" de peças boas não fecha. Numa janela finita, as definições ingênuas só fecham aproximadamente |
| Disponibilidade 240/255 ≈ 94,1% (`simulation.md`; sub-plano 5) | **Correto com condições faltando:** MTBF = tempo médio em operação até a falha (não o ciclo inteiro, que daria 93,75%); falhas no relógio de calendário ou estação saturada; valor de longo prazo (turno começando em operação: 94,29%); com 30 turnos, IC ≈ ±2,2 p.p. |
| Retrabalho sem limite: 1/(1−p) passagens (`simulation.md`; sub-plano 5) | **Correto com condições faltando:** p constante e independente por passagem, contagem na estação que gera o defeito, sem limite efetivo. Com o limite da RN-SIM-006: (1−p^{n+1})/(1−p) e refugo p^{n+1}; resolver a ambiguidade "limite de retrabalhos" × "3 passagens" |
| Turno vazio, M/M/1 ρ = 0,8, T = 480: média de L ≈ 3,79 (`simulation.md`; sub-plano 6) | **Correto** (3,7918, confirmado por integração numérica e por Monte Carlo). **Condição faltando:** com 30 replicações o IC (±0,62) não distingue 3,79 de 4; o teste exige ~1.000 replicações para separar ou ~4.200 para ±0,05 |
| Little em janela finita "contando o WIP inicial": igualdade exata (`simulation.md`; sub-planos 4 e 6) | **Correto com condições faltando:** LL.1 exige vazio em 0 e T (o sub-plano 4 precisa esvaziar a linha ou usar LL.2); LL.2 usa S(T) = WIP inicial + chegadas e o tempo de cada peça cortado à janela; "exata" = até o arredondamento de ponto flutuante; o teste útil compara Σ tempos por peça com a área do WIP |
| MSER-5 no M/M/1 ρ = 0,8: corte de algumas centenas (`simulation.md`; sub-plano 7) | **Não é resultado analítico:** é estimativa da pesquisa anterior (3–5τ com τ ≈ 90 pela fórmula de Morse, sem fonte primária lida). Compatível com meu cálculo (E[L(t)] em 1% de 4 perto de t = 200, em 0,2% em t = 300). Deve ser teste de faixa larga, não alvo exato |
| ±5% em L com ρ = 0,8 ≈ 1,7×10⁵ unidades de tempo (`simulation.md`; plano) | **Correto** como estimativa (1,73×10⁵ pela σ² = 1.800); depende da fórmula de Whitt (1989), não lida no original |
| ρ = 0,5 custa ~5 vezes menos (plano, rotulado palpite) | **Aritmética confere** para o tempo de corrida (≈ 3,7×10⁴ contra 1,73×10⁵, cerca de 4,7 vezes menos). Ver abaixo |
| k estações paralelas: capacidade k/c (`simulation.md`; sub-plano 6) | **Correto com condições faltando:** máquinas nunca ociosas com fila em outra (fila única ou "fila mais curta"), sem falhas, fonte saturada. Linha fora da tabela em `simulation.md` |
| Pesquisa anterior: "30 replicações de 480 sem aquecimento produzem um IC estreito em torno de 3,79, que exclui o valor verdadeiro 4" | **Errado:** com desvio padrão por replicação de 1,65, o IC de 30 replicações tem meia-largura ≈ 0,62 e contém 4. A lição didática (o viés não diminui com mais replicações) continua válida, mas só aparece com ~1.000 replicações ou mais |

- [Cálculo próprio, sobre o "ρ = 0,5 custa 5 vezes menos"] Para ±5% **relativos** em L = 1: σ² = 2ρ(1+ρ)/(1−ρ)⁴ = 1,5/0,0625 = 24; meia-largura 0,05 → n·T ≈ 3,8416·24/0,0025 ≈ **3,7×10⁴**, cerca de 4,7 vezes menos que 1,73×10⁵. Confere com a pesquisa anterior (3,7×10⁴). A meia-largura absoluta exigida é menor (0,05 contra 0,2), o que compensa em parte a variância muito menor.

### Gaps
- A regra de bloqueio do Takt (antes ou depois do serviço), a distribuição das falhas e o relógio das falhas não estão escritos nos docs lidos; cada um muda um dos valores esperados acima.
