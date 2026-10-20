# Aquecimento (warm-up) em ferramentas de simulação, no ensino e na validação contra resultados analíticos

> Convenção de rótulos usada nestas notas:
> - **[FATO]**: afirmação sustentada pela fonte citada logo em seguida.
> - **[ESTIMATIVA]**: número que eu mesmo calculei (o método está descrito), ou que deriva de fórmulas citadas.
> - **[PALPITE]**: inferência de projeto ou conhecimento prévio que **não** verifiquei em fonte nesta sessão.
>
> Contexto: "Takt" é um simulador didático web de linha de produção. Por padrão começa vazio e é terminante (ex.: turno de 8 h), com aquecimento (warm-up) opcional.

---

## 1. Como as ferramentas comerciais e acadêmicas expõem o aquecimento (Arena, Simio, FlexSim, AnyLogic, Simul8, Plant Simulation, ExtendSim)

### Takeaway
Todas as ferramentas pesquisadas usam o mesmo modelo mental: um campo numérico de "Warm-up Period/Time" no nível do experimento ou da execução. Ao fim desse período, as estatísticas são zeradas, mas o estado do modelo (WIP, filas, recursos) é mantido. Nenhuma calcula o comprimento do aquecimento automaticamente no produto padrão: o usuário escolhe o valor, em geral olhando um gráfico até ele "estabilizar". A estimativa automática (MSER-5) existiu como protótipo de pesquisa ligado ao Simul8. Não encontrei evidência de que esteja no produto atual.

### Cited Findings
- **Simul8**
  - [FATO] O item global "Warm Up Period" é criado pelo próprio Simul8 e configurado em Build > Warm Up. É o tempo que a simulação roda **antes** de começar a coletar resultados. Há a opção de excluir o aquecimento do relógio exibido: o relógio roda até o fim do aquecimento e depois volta ao horário inicial. Existe também "Go to End of Warm Up Period", que avança sem animação. Fonte: Minitab/Simul8 Help, "Warm Up Period" (página de ajuda oficial, s.d.), https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/clock/warm-up-period/ ; e "warm up" (Information Store), https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/information-store/warm-up/
  - [FATO] A mesma página de ajuda diz que o aquecimento **não é necessário** quando o sistema começa e termina vazio (ex.: uma loja que abre e fecha sem WIP). Ele **é necessário** quando o sistema retoma o estado em que parou (ex.: fábrica que segunda de manhã está como ficou na sexta à noite). Ela também sugere reduzir o aquecimento "priming" o modelo com Work Items nas filas (ver "Queues, initial contents"). Fonte: idem, https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/clock/warm-up-period/
  - [FATO] A página não informa valor padrão nem oferece cálculo automático. Ela remete a um artigo separado, "How to work out the right warm up time". Fonte: idem.
  - [FATO] Estimativa automática em pesquisa: o projeto AutoSimOA (Warwick Business School, financiado pela SIMUL8 Corporation) criou um "Analyser" ligado ao Simul8 que recomenda aquecimento, número de replicações e duração da execução. Ele avaliou MSER-5, testes de viés por batch means e o método de Welch. Fontes: Robinson, S. et al., "Automated analysis of simulation output data", Proceedings of the 2005 Winter Simulation Conference, https://www.informs-sim.org/wsc05papers/088.pdf ; página do projeto: https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa e https://warwick.ac.uk/fac/soc/wbs/projects/autosimoa/warmup
  - [FATO] Hoad, K.; Robinson, S.; Davies, R., "Automating warm-up length estimation", *Journal of the Operational Research Society* 61(9):1389–1403, 2010, DOI 10.1057/jors.2009.87. Há versão no WSC 2008, DOI 10.1109/WSC.2008.4736110. Objetivo declarado: criar um procedimento automático "for inclusion into commercial simulation software". Fontes: https://wrap.warwick.ac.uk/id/eprint/5368 ; versão JORS: https://dspace.lboro.ac.uk/2134/14601
  - [FATO] Segundo resumo do mesmo trabalho, entre os métodos pré-selecionados só o **MSER-5** se mostrou "robust and viable candidate for automation". Fonte: https://dspace.lboro.ac.uk/2134/14601 (via resumo de busca; texto integral não lido).
  - [FATO] Existe ainda um artigo de Hoad & Robinson, "Implementing MSER-5 in commercial simulation software and its wider implications", WSC 2011 (só o título foi confirmado; conteúdo não lido). Fonte: listagem em https://wrap.warwick.ac.uk/view/funders/SIMUL8_Corporation.creators_name.html
- **Arena (Rockwell)**
  - [FATO] O aquecimento é configurado em Run > Setup > Replication Parameters ("Warm-up Period"). Cada replicação usa o mesmo aquecimento. A recomendação é "fazer gráficos de medidas-chave e ver a olho quando parecem estabilizar". Fonte: Rockwell/Arena blog, "Steady state and warmup", https://info.arenasimulation.com/blog/steady-state-and-warmup (citado via resumo de busca; ao buscar a página diretamente, ela retornou 404).
  - [FATO, fonte fraca] Uma apostila de exercício mostra a tela Run Setup com "Warm-up Period: 0", o que sugere padrão 0, mas não é documentação oficial. Fonte: https://www.scribd.com/document/106997390/Sim
- **Simio**
  - [FATO] O "Warm-up Period" é uma propriedade do **Experiment**. Um engenheiro de suporte da Simio explica que, fora de experimentos, dá para imitar o aquecimento com um Timer que dispara uma vez e chama um processo com o passo "Clear Statistics". Ele alerta que usar as duas coisas juntas "will essentially warm-up twice". Fonte: Simio Forum, tópico 2923 "warmup model", https://forum.simio.com/topic/2923-warmup-model/ ; tópico 2353 "steady state simulation", https://forum.simio.com/topic/2353-steady-state-simulation
- **FlexSim**
  - [FATO] "Warmup Time" fica na aba Experiment Run do Experimenter. Numa execução normal (fora do Experimenter), o usuário precisa chamar `resetstats()`, por exemplo num User Event. Fonte: Autodesk Community / FlexSim Forum, "How do I set a warmup period for my run?", https://forums.autodesk.com/t5/flexsim-forum/how-do-i-set-a-warmup-period-for-my-run/m-p/13489336
  - [FATO] Em outra thread, resposta do fórum: "There's no specific calculation for you". O aquecimento deve ser determinado pelo usuário. Fonte: https://forums.autodesk.com/t5/flexsim-forum/flexsim-experimenter/m-p/13526174
  - [FATO, fonte secundária] Slides de curso (NTHU, 2015) mostram Warmup Time = 0 ao lado de Run Time e Replications per Scenario no Experimenter. Fonte: https://ocw.nthu.edu.tw/ocw/upload/128/1639/桑慧敏教授110410系統模擬_Practice-lecture6.pdf
- **Siemens Tecnomatix Plant Simulation**
  - [FATO] No **EventController**, aba Settings, o campo "Statistics" define o instante em que as estatísticas são zeradas e tudo o que foi coletado até ali é descartado. A ajuda justifica que os dados de aquecimento "might distort the validity of the simulation results". O método `initStat` faz o reset no meio da execução, e o atributo SimTalk `startStat` lê/define esse instante. Fontes: Siemens, Plant Simulation Help v15, "Viewing and Visualizing Statistics", https://docs.plm.automation.siemens.com/content/plant_sim_help/15/plant_sim_all_in_one_html/en_US/tecnomatix_plant_simulation_help/step_by_step_help/animating_the_simulation_model_and_viewing_the_results/viewing_and_visualizing_statistics/viewing_and_visualizing_statistics.html ; Bangsow, S., *Tecnomatix Plant Simulation: Modeling and Programming by Means of Examples*, 2ª ed., Springer, 2020 (tabela de atributos, via resumo de busca), https://dokumen.pub/tecnomatix-plant-simulation-modeling-and-programming-by-means-of-examples-2nd-ed-9783030415433-9783030415440.html
  - [FATO] Na comunidade Siemens, a heurística recomendada é plotar uma estatística-chave e esperar "o gráfico ficar plano". Fonte: Siemens Community, "Warm up period of a simulation", https://community.sw.siemens.com/s/question/0D54O000061xouKSAQ/warm-up-period-of-a-simulation
  - Ressalva: as fontes são das versões de help 10.1 a 15. A interface pode ter mudado nas versões 2404+.
- **ExtendSim**
  - [FATO, indireto] Há uma tese de 2026 (DCU) sobre "Development of a Tool to Automate Warm-up Analysis in Discrete Event Simulation (ExtendSim 2024)". Isso indica que a análise automática **não** é nativa. Fonte: Caffrey, tese, https://extendsim.com/images/downloads/academic/grants/Caffrey-Thesis.pdf ; lista de blocos úteis: https://extendsim.com/learning/quicktips/qt-blocks
- **AnyLogic**
  - Não consegui acessar a documentação oficial (anylogic.help retornou 403). Ver Gaps.
- **Análogos (fora da lista, úteis como padrão de projeto)**
  - [FATO] ProModel: a instrução `WARMUP` encerra o aquecimento, zera todas as estatísticas e apaga as séries temporais. `RESET STATS` zera as estatísticas mas mantém o banco de saída. Se houver `WARMUP` e também warm-up nas Run Options, só o primeiro encontrado é executado. Fonte: ProModel Online Help 8.0, "Warmup" e "Reset Stats", https://promodel.com/onlinehelp/ProModel/80/C-14%20-%20Warmup.htm ; https://www.promodel.com/onlinehelp/ProModel/86/Content/Topics/C-14%20-%20Reset%20Stats.htm
  - [FATO] pydsol-core: o RunControl recebe um warmup period. Nesse instante são zerados os objetos de estatística "de simulação" (SimCounter, SimTally, SimPersistent), mas **não** os Tally comuns. Fonte: https://pydsol-core.readthedocs.io/en/latest/api/experiment.html
  - [FATO] Visual Components: o componente "Statistics Warm Up Controller" zera todas as estatísticas num tempo fixo (padrão 2 min), e usuários se confundiram com estatísticas "sumindo" por causa dele. Fonte: https://forum.visualcomponents.com/t/components-disappearing-on-statistic-chart/5639
  - [FATO] Ciw (biblioteca Python): o aquecimento é feito filtrando os registros criados durante o período. Fonte: Ciw docs, "Simulation Practice", https://ciw.readthedocs.io/en/latest/Background/simulationpractice.html

### Inferences
- [PALPITE] O padrão de mercado é "warm-up = 0 por padrão + campo numérico + reset de estatísticas mantendo o estado". Para o Takt, um campo opcional com padrão 0 está alinhado à prática. Valeria mostrar visualmente a fronteira do reset (linha vertical no gráfico, ou relógio que "volta", como no Simul8).
- [PALPITE] O caso Visual Components (estatísticas que somem) e o "warm-up duplo" do Simio mostram que a armadilha de usabilidade mais comum é o usuário não perceber que houve reset. Para o Takt: deixar explícito na UI quando o reset ocorre e o que foi descartado.
- [PALPITE] A distinção entre "estatísticas de simulação que zeram" e "contadores que não zeram" (pydsol) é uma decisão de projeto a documentar. Exemplo: o throughput acumulado desde o início zera ou não?
- [PALPITE] Um "assistente" de aquecimento baseado em MSER-5 seria um diferencial didático, já que nenhuma das ferramentas comerciais pesquisadas o oferece nativamente.

### Gaps
- AnyLogic: não verifiquei como o warm-up é exposto (a documentação retornou 403 e as buscas só trouxeram outros produtos). [PALPITE, conhecimento prévio não verificado] O AnyLogic não tem campo de warm-up dedicado na maioria dos experimentos. O usuário agenda um evento que chama `resetStats()` nos objetos ou datasets, mas isso precisa ser confirmado.
- Valores padrão oficiais de Arena, Simio e FlexSim não confirmados em documentação oficial (só em apostilas e fóruns, todos com 0).
- ExtendSim: não confirmei o nome ou o comportamento do bloco de reset de estatísticas na documentação oficial.
- Não confirmei se o Analyser MSER-5 do AutoSimOA chegou ao produto comercial Simul8.

---

## 2. Como o aquecimento é ensinado (cursos de Engenharia de Produção/Gestão de Operações) e equívocos comuns

### Takeaway
A literatura de ensino que encontrei (WSC 2005/2006) diz que a análise de sistemas não terminantes (non-terminating) é um dos tópicos mais difíceis para alunos de graduação. Ela também mostra, de forma contraintuitiva, que em experimentos didáticos com M/M/1 escolher bem a duração da execução (run length) importou mais para a cobertura dos intervalos de confiança do que fazer uma deleção de transiente "correta". As ferramentas reforçam um ensino baseado em gráfico e olho ("quando estabiliza").

### Cited Findings
- [FATO] "One of the most difficult topics for undergraduate students taking their first stochastic operations research or simulation course is non-terminating systems analysis." A dificuldade está em entender que a saída mistura dados transientes e de regime permanente (steady state). Fonte: artigo do Proceedings of the 2005 Winter Simulation Conference (Kuhl, Steiger, Armstrong & Joines, eds.), autores Court, Pittman & Pham conforme o resumo de busca, https://www.informs-sim.org/wsc05papers/287.pdf
- [FATO] Nesse estudo, os autores queriam mostrar aos alunos que não deletar o transiente gera ICs que subestimam os parâmetros. Os sistemas eram M/M/1/GD/∞/∞ e outro, com o método de replicações independentes. O resultado foi o contrário do esperado: "regardless of run length, ignoring transient analysis often leads to the same level of coverage at greater precision, or provides no gain in coverage to justify the effort". Os autores chegam a questionar se a análise de transiente deve ser ensinada. Fonte: idem (resumo e trechos via busca; o texto integral não pôde ser extraído do PDF).
- [FATO] No artigo seguinte (WSC 2006, Pham, Pittman & Court), determinar uma duração de execução "apropriada" é mais importante para a cobertura do que uma análise de transiente "apropriada". Os alunos não têm como checar cientificamente suas escolhas de truncagem, a menos que exista solução fechada. Fonte: https://www.informs-sim.org/wsc06papers/292.pdf (via resumo de busca).
- [FATO] Os materiais de fabricantes ensinam o conceito com a ideia de que o modelo "starts empty, so it usually takes some time before it reaches steady-state". Fonte: ProModel Help, "Step 4: Conducting Experiments", https://promodel.com/onlinehelp/ProModel/86/Content/Topics/C-03%20-%20Step%204%20Conducting%20Experiments.htm
- [FATO] O próprio Simul8 ensina o critério terminante versus não terminante pelo exemplo loja que abre e fecha vazia versus fábrica que continua de sexta para segunda. Fonte: https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/clock/warm-up-period/
- [FATO] Usuários iniciantes têm dificuldade com o método visual: um usuário do FlexSim relatou que a curva de throughput por hora oscilava e ele não conseguia achar o ponto de estabilização. Fonte: https://forums.autodesk.com/t5/flexsim-forum/how-do-i-set-a-warmup-period-for-my-run/m-p/13489336
- [FATO] Mesmo em modelos reais o MSER-5 pode dar estimativas muito dispersas. Num modelo de UTI neonatal, os aquecimentos estimados foram de 25 dias a 9,5 anos (média 2,3 anos). Fonte: SAS/INFORMS 2014, "Duke NICU", https://blogs.sas.com/content/operations/files/2014/11/SASOR_INFORMS2014_Duke_NICU.pdf

### Inferences
- [PALPITE] Equívocos prováveis (derivados das fontes acima e da prática; não encontrei um levantamento sistemático):
  1. Achar que o aquecimento é sempre necessário. Num turno de 8 h que começa vazio, o transiente faz parte do que se quer medir.
  2. Achar que o aquecimento "conserta" uma execução curta. Os dados de Pham/Pittman/Court indicam que a duração e a variância dominam.
  3. Confundir o tempo de aquecimento do modelo com a ideia de "esperar a média acumulada estabilizar". A média acumulada converge muito mais devagar que o valor esperado instantâneo (ver números na seção 3).
  4. Não perceber que o reset zera as estatísticas mas mantém o WIP.
- [PALPITE] O Takt tem uma vantagem pedagógica: pode mostrar lado a lado (a) a curva E[X(t)] partindo de vazio, (b) a média acumulada e (c) o valor analítico. Isso deixa visível que o viés do início vazio é pequeno diante do ruído quando a execução é longa, que é a conclusão de Court et al.

### Gaps
- Não encontrei artigo na *INFORMS Transactions on Education* específico sobre o ensino de warm-up. A busca não retornou nada desse periódico.
- Não confirmei o título exato do artigo WSC 2005 nº 287 (o PDF não pôde ser decodificado). Os autores vieram do resumo de busca.
- [PALPITE, não verificado nesta sessão] Livros-texto usados em cursos (Law, *Simulation Modeling and Analysis*; Banks et al., *Discrete-Event System Simulation*; Robinson, *Simulation: The Practice of Model Development and Use*; Kelton et al., *Simulation with Arena*) introduzem o método de Welch (gráfico de médias móveis sobre replicações) como técnica padrão de ensino. Robinson também discute as condições iniciais "mixed initialisation" e "initial conditions". Não consegui ler essas fontes.

---

## 3. Validação contra M/M/1 (λ=0,8, μ=1, ρ=0,8 → L=4, W=5): aquecimento, duração da execução e escala com ρ

### Takeaway
Para M/M/1 com ρ=0,8, **o gargalo é a variância, não o aquecimento**. O viés de começar vazio é pequeno (a constante de viés é −ρ/(1−ρ)³ = −100, ou seja, viés ≈ −100/T na média temporal de L). Já obter IC de 95% com ±5% em L=4 exige da ordem de **1,7×10⁵ unidades de tempo** de simulação (≈ 1,7×10⁵ tempos médios de serviço). Os tempos de relaxação crescem como (1−ρ)⁻². A variância assintótica cresce como (1−ρ)⁻⁴ e o viés como (1−ρ)⁻³. Para ±5% em W=5 são necessários ~10⁵ clientes.

### Cited Findings
- [FATO] Whitt, W., "Planning Queueing Simulations", *Management Science* 35(11):1341–1366, 1989. O artigo dá fórmulas heurísticas, baseadas em limites de heavy traffic e aproximação por movimento browniano refletido (RBM), para planejar a duração de uma execução longa única que estime médias de regime como o comprimento de fila em GI/G/1. Recebeu o 1991 Outstanding Simulation Publication Award (TIMS College of Simulation). Fontes: https://pubsonline.informs.org/doi/10.1287/mnsc.35.11.1341 ; https://www.econbiz.de/Record/planning-queueing-simulations/10009203776 ; https://www.informs.org/Explore/History-of-O.R.-Excellence/Biographical-Profiles/Whitt-Ward
- [FATO] Whitt, W., "Simulation Run Length Planning", Proceedings of the 1989 Winter Simulation Conference, DOI 10.1145/76738.76751 (texto inacessível: 403). Fontes: https://dl.acm.org/doi/10.1145/76738.76751 ; https://repository.lib.ncsu.edu/items/1c724603-d3ba-4c47-b224-7a362ecd3246/full
- [FATO] Ni, E. C.; Henderson, S. G., "How hard are steady-state queueing simulations?", *ACM Transactions on Modeling and Computer Simulation* (2015; preprint de 2013), https://people.orie.cornell.edu/shane/pubs/howhard.pdf . Pontos extraídos do texto:
  - Para estimar o número médio no sistema em filas com poucos servidores e alta utilização, o desvio assintótico σ é tipicamente de ordem (1−ρ)⁻², enquanto a média α é de ordem (1−ρ)⁻¹. Logo σ/α ~ (1−ρ)⁻¹ e "the heavily loaded M/M/1 queue is a standard test problem for batching algorithms" (citam Whitt 1989 e Asmussen 1992).
  - A duração necessária para meia-largura absoluta ε é t ≥ z²σ²/ε². Para erro relativo, t ≥ z²σ²/(ε²α²).
  - O viés do estimador de média temporal partindo de x é ≈ g(x)/t, com g(x) = ∫₀^∞ [Eₓ f(X(s)) − α] ds (constante de viés, obtida da equação de Poisson). A largura do IC é O(σ t^{-1/2}) e o viés é O(g/t).
  - M/M/c partindo de X(0)=0, com μ=1 e ρ→1: viés ≈ −c⁻¹(1−ρ)⁻³/t. A variância assintótica é de ordem 4c⁻¹(1−ρ)⁻⁴. Para IC de 95%, t ~ 16c⁻¹(1−ρ)⁻⁴ε⁻². Em erro absoluto "the variance is the dominant criterion". Em erro relativo, variância e viés são da mesma ordem. Os autores dizem que esses valores "agree with the M/M/1 special case in Whitt [2006]".
  - Iniciar no estado "representativo" X(0) ≈ (1−ρ)⁻¹ (a média de regime) **não** reduz a ordem do viés: g ≈ −(2cμ)⁻¹(1−ρ)⁻³, da mesma ordem que g(0).
  - Conclusão geral: em filas "bem dimensionadas" (com abandono, ou no regime QED) as durações são modestas. Filas de servidor único muito carregadas são o caso difícil.
- [FATO] Madansky, A., "Optimal conditions for a simulation of the M/M/1 queue" (nota), *Operations Research* 24(3):572–577, 1976. Para t grande o bastante, iniciar com n=0 (e não em n = média de regime, como se costuma conjecturar) minimiza o erro quadrático médio. Esse "t grande o bastante" pode ser só ~1/4 do tempo de relaxação no exemplo estudado. Fonte: https://ideas.repec.org/a/inm/oropre/v24y1976i3p572-577.html (resumo).
- [FATO] Há a linha de "relaxation time heuristic" (Roth e colegas), que define o truncamento por características teóricas do modelo, sem execuções piloto, para M/Eₖ/1, Eₖ/M/1 e M/M/k. Fontes: https://iaorifors.com/paper/10633 ; https://ftp.iaorifors.com/paper/19742
- [FATO] Na M/M/1 o número no sistema tem distribuição geométrica com média ρ/(1−ρ). Fonte: Wikipedia, "M/M/1 queue", https://en.wikipedia.org/wiki/M/M/1_queue
- **Cálculos próprios para ρ=0,8 (λ=0,8, μ=1).** Script em Python puro. A equação de Poisson foi resolvida exatamente para a cadeia nascimento-morte truncada em 600 estados, e o transiente foi integrado numericamente (Euler, dt=0,01).
  - [ESTIMATIVA, exata a menos de truncagem] A variância assintótica da média temporal de X(t) é σ² = **1800**. Isso coincide com a fórmula fechada 2ρ(1+ρ)/(μ(1−ρ)⁴) = 2·0,8·1,8/0,2⁴ = 1800. [A fórmula é amplamente atribuída a Whitt 1989; aqui a confirmei numericamente, não na fonte.]
  - [ESTIMATIVA] A constante de viés partindo de vazio é g(0) = **−100** = −ρ/(μ(1−ρ)³). Partindo de X(0)=4 (a média), g(4) = −50. Partindo de X(0)=8, g(8) = +80.
  - [ESTIMATIVA] O tempo de relaxação "clássico" (Morse) é 1/(μ(1−√ρ)²) = **89,7**. [A fórmula é conhecimento prévio, ver Gaps.]
  - [ESTIMATIVA] Valor esperado instantâneo E₀[X(t)] partindo de vazio: t=10 → 2,03; t=50 → 3,41; t=100 → 3,79; t=200 → 3,96; t=300 → 3,99; t=400 → 4,00. Ou seja, cerca de 2 a 3 tempos de relaxação levam o viés pontual a <1%.
  - [ESTIMATIVA] Valor esperado da **média temporal** partindo de vazio, sem aquecimento: T=480 → 3,79 (−5,2%); T=960 → 3,90; T=2400 → 3,96; T=4800 → 3,98. A aproximação 4 − 100/T acerta já em T=480. Com aquecimento de 200: T=480 → 3,99; T≥960 → ≈4,00.
  - [ESTIMATIVA] Duração para IC de 95% em L (z=1,96): ±5% (±0,2) → t ≈ **1,73×10⁵**; ±10% (±0,4) → t ≈ **4,3×10⁴** unidades de tempo. Com tempo médio de serviço de 1 min, ±5% equivale a ~360 turnos de 8 h de simulação total, seja numa execução única ou somada entre replicações.
  - [ESTIMATIVA, Monte Carlo] Para W (tempo médio no sistema por cliente): 6×10⁶ clientes, Lindley, 60 lotes de 10⁵. Resultado: W̄ = 5,004 e variância assintótica por cliente ≈ **1,6×10³** (com incerteza de ~±20% por ser estimada com 60 lotes). Isso implica ~**1,0×10⁵ clientes** para ±5% e ~2,5×10⁴ para ±10% (IC de 95%).
  - [ESTIMATIVA] Viés versus ruído: com T = 1,7×10⁵ o viés de partir vazio é −100/T ≈ −0,0006, desprezível frente a ±0,2. Mas com **replicações curtas** (ex.: 30 replicações de 480 min sem aquecimento) o viés de −0,21 (−5%) é o mesmo em todas as replicações e não diminui ao somar replicações, enquanto o IC encolhe. Esse é o cenário em que a cobertura do IC falha.

### Inferences
- [ESTIMATIVA/PALPITE] Receita prática de validação do Takt contra M/M/1 com ρ=0,8: (a) uma execução longa (≥2×10⁵ unidades de tempo) com aquecimento de ~300–500 unidades (3 a 5 tempos de relaxação), e IC por batch means com ~20–30 lotes; ou (b) n replicações de duração T ≥ ~10⁴ cada, com aquecimento de ~300, até que n·T ≈ 2×10⁵. Usar uma tolerância de aceitação estatística (o valor analítico dentro do IC de 95%), nunca igualdade.
- [ESTIMATIVA] Escala com ρ, usando as fórmulas acima: o tempo de relaxação ~1/(1−√ρ)² ≈ 4/(1−ρ)² quando ρ→1; a duração para erro absoluto fixo ~(1−ρ)⁻⁴; para erro relativo fixo ~(1−ρ)⁻². Exemplos com σ² = 2ρ(1+ρ)/(1−ρ)⁴ para ±5% relativo: ρ=0,5 → σ²=24, L=1, t≈3,7×10⁴; ρ=0,8 → t≈1,7×10⁵; ρ=0,9 → σ²=34200, L=9, t≈6,5×10⁵. Para testes rápidos de regressão, validar em ρ=0,5 é muito mais barato.
- [PALPITE] Linhas seriais (tandem) com chegadas Poisson e serviço exponencial: pelo teorema de Burke e pelas redes de Jackson, cada estação em regime se comporta como M/M/1 com o mesmo λ. L total = ΣLᵢ e W total = ΣWᵢ. Isso dá alvos analíticos para validar a linha do Takt. O transiente de uma linha começando vazia é dominado pela estação mais carregada (o gargalo). Com buffers finitos ou bloqueio, não há forma produto simples. Teorema não verificado nesta sessão (Burke 1956; Jackson 1957).
- [PALPITE] Para validar um simulador **terminante** (turno de 8 h começando vazio), compare contra a solução **transiente** E₀[X(t)] e a média temporal sobre [0,T] (os valores acima, ex.: 3,79 em T=480), não contra L=4. Isso torna o comportamento padrão do Takt verificável analiticamente.

### Gaps
- Não consegui ler o texto integral de Whitt (1989, MS) nem de Whitt (1989, WSC). Os PDFs estavam inacessíveis. As fórmulas σ² = 2ρ(1+ρ)/(μ(1−ρ)⁴) e g(0) = −ρ/(μ(1−ρ)³) foram verificadas por cálculo próprio exato, não pela leitura da fonte.
- A fórmula do tempo de relaxação 1/(μ(1−√ρ)²) (Morse 1955; Cohen) é conhecimento prévio. Não encontrei fonte primária nesta sessão.
- "Whitt [2006]", citado por Ni & Henderson para o caso M/M/1 (provavelmente sobre filas de muitos servidores e M/M/∞), não foi lido.
- Não obtive uma fórmula fechada publicada para a variância assintótica da média de W por cliente na M/M/1. O valor ~1,6×10³ é estimativa por Monte Carlo.

---

## 4. Little's Law em execuções finitas (início e fim vazios, efeitos de borda)

### Takeaway
A Lei de Little vale **exatamente**, de forma determinística e sobre o caminho amostral, num intervalo finito [0,T] **se o sistema estiver vazio em 0 e em T**. Se não estiver vazio (caso típico de um turno que termina com WIP, ou de uma execução com aquecimento truncado), a igualdade só é exata com definições específicas: contar os itens presentes em t=0 como "chegadas" e medir o tempo de cada item apenas dentro da janela. Com as definições ingênuas (W só dos itens que saíram, λ = chegadas/T) surgem termos de borda de ordem O(1/T).

### Cited Findings
- [FATO] Little, J. D. C., "Little's Law as Viewed on Its 50th Anniversary", *Operations Research* 59(3):536–549, 2011, DOI 10.1287/opre.1110.0940. Fontes: https://pubsonline.informs.org/doi/10.1287/opre.1110.0940 ; reimpressão: https://projectproduction.org/journal/reprint-littles-law-as-viewed-on-its-50th-anniversary/ ; PDF: https://people.cs.umass.edu/~emery/classes/cmpsci691st/readings/OS/Littles-Law-50-Years-Later.pdf
  - [FATO] Teorema LL.1: "For a queuing system observed over [0, T] that is empty at 0 and T and has 0 < T < ∞, the formula L = λW holds", com L = A/T, λ = N/T, W = A/N, onde A é a área sob n(t) e N o número de chegadas. "Under the conditions of Theorem LL.1, the formula L = λW is deterministic and holds exactly". É uma relação de medição ("the measurement business, not the forecasting business").
  - [FATO] Teorema LL.2: vale para [0,T] sem exigir sistema vazio, se S(t) incluir "not only the cumulative arrivals up to t, but also any items that were in the system at t = 0". Usa λ = S(T)/T e W = A/S(T), ou seja, W é a área dentro da janela por item que passou pela janela. Little alerta que nesse caso os itens podem ter "a history of waiting prior to 0 and may stay in the system after T", e cabe ao praticante verificar se essa definição responde à sua pergunta. O LL.2 vale exatamente "even if the queuing system is never empty".
  - [FATO] Versão de limite (caminho amostral): "If limits λ and W exist and are finite, L exists and is finite, and L = λW". Versão estacionária: E[N(t)] = λE[Wᵢ].
  - [FATO] Em Gestão de Operações a lei é escrita como TH = WIP/CT (Hopp & Spearman) ou "Average Inventory = Average Flow Rate × Average Flow Time" (Cachon & Terwiesch), "in terms of the average output or departure rate ... rather than the arrival rate". Little observa que em manufatura a chegada costuma ser endógena (liberação definida a partir da produção desejada).

### Inferences
- [PALPITE/derivação] No Takt, com turno de 8 h começando vazio e terminando com WIP, usar as definições do LL.2 com S(T) = itens iniciais + chegadas e W calculado como área/S(T) dá uma identidade exata, ótima como **teste automatizado de consistência interna do motor** (deve fechar até o erro de ponto flutuante). Já com "W = média do lead time dos itens concluídos" e "λ = throughput", a igualdade é só aproximada. A discrepância vem dos itens em processo no fim, ou no início após o aquecimento, e cai como O(1/T).
- [PALPITE] Com aquecimento, o sistema não está vazio no instante do reset. O mesmo raciocínio se aplica: ou se contam os itens presentes no reset como entradas da janela, ou se aceita um termo de borda. Sugestão: o Takt exibe L, λ e W e um indicador "Little fecha?", explicando que a diferença é efeito de borda (útil didaticamente).
- [PALPITE] Para um teste de Little "estatístico" (não identidade), a variância de L̂ − λ̂Ŵ é bem menor que a de L̂ ou Ŵ isoladas, porque são positivamente correlacionadas. Isso faz dela um bom teste de sanidade com execuções curtas.

### Gaps
- Não li o trabalho de Kim, S.-H. & Whitt, W., "Statistical Analysis with Little's Law", *Operations Research* 61(4), 2013, que trata exatamente de estimação e ICs com a lei de Little a partir de dados com efeitos de borda. Referência de conhecimento prévio, não verificada nesta sessão.
- Não encontrei nesta sessão fórmula publicada explícita para o termo de correção de borda no formato "W só dos itens que saíram". A afirmação O(1/T) é inferência minha.

---

## 5. Números aleatórios comuns (Common Random Numbers, CRN) com aquecimento ao comparar cenários

### Takeaway
Não encontrei fonte que trate especificamente da interação entre CRN e aquecimento. As fontes cobrem CRN em geral (sincronização por fluxos dedicados) e aquecimento em geral. A interação relevante é sobretudo de sincronização: se os cenários consomem números aleatórios em ordens diferentes durante o aquecimento, a correlação após o reset se perde.

### Cited Findings
- [FATO] CRN é uma técnica de redução de variância amplamente usada para comparar sistemas estocásticos. Glasserman & Yao dão condições sob as quais ela comprovadamente ajuda. Fonte: Glasserman, P.; Yao, D. D., "Some guidelines and guarantees for common random numbers", *Management Science* 38(6):884–908, 1992, https://business.columbia.edu/sites/default/files-efs/pubfiles/4261/glasserman_yao_guidelines.pdf
- [FATO] Boa prática: dar a cada replicação a mesma semente em todos os cenários, analisar diferenças pareadas e atribuir fluxos (streams) dedicados a cada fonte de aleatoriedade (chegadas, volumes), para que sorteios extras de um cenário não desloquem os outros. Fonte: arXiv 2608.07889, "From Annual Throughput to Vessel Schedules: A Stochastic Generator for Transshipment Hub Simulation" (2026), https://arxiv.org/pdf/2608.07889
- [FATO] Um estudo de eficácia de técnicas de redução de variância (CRN, variáveis antitéticas) em modelos de manufatura, call center e cross-docking existe como referência empírica (conteúdo não lido). Fonte: arXiv 1305.7424, https://arxiv.org/pdf/1305.7424
- [FATO] Glynn, P. W., "Two Approaches to the Initial Transient Problem" (1995) trata do problema de transiente inicial de forma teórica. Fonte: https://web.stanford.edu/~glynn/papers/1995/G95b.html (só título e resumo vistos).

### Inferences
- [PALPITE] Recomendações para o Takt:
  1. Usar fluxos separados por fonte de aleatoriedade e por estação: um stream para chegadas, um por máquina para tempos de processo, um para falhas. Assim, mudar a capacidade de uma estação não desloca os sorteios das outras.
  2. Pré-gerar atributos por entidade na chegada (ex.: o tempo de processo de cada peça em cada estação sorteado quando ela entra). Isso mantém a sincronização mesmo quando a ordem de atendimento muda.
  3. Usar o **mesmo** aquecimento em todos os cenários comparados. Se o aquecimento for estimado por cenário (ex.: MSER por cenário), as janelas medidas diferem e o pareamento fica mais fraco.
  4. Se a comparação for entre cenários com estados de partida diferentes (ex.: WIP pré-carregado diferente), CRN ainda ajuda, mas a diferença inclui o efeito do estado inicial. Deixar isso claro ao aluno.
  5. Lembrar que CRN reduz a variância da **diferença**, não do nível. Para validar contra o valor analítico (M/M/1) ele não ajuda.
- [PALPITE] Com aquecimento e CRN, a diferença pareada por replicação após o reset continua válida, porque o descarte é o mesmo nos dois braços. O risco está só na dessincronização, não no descarte em si.

### Gaps
- Não encontrei fonte primária (ex.: Law, cap. de comparação de sistemas; Kelton) que discuta explicitamente CRN e aquecimento juntos. As recomendações acima são inferência.

---

## 6. Começar de um estado "típico" não vazio (pré-carga de WIP) como alternativa à deleção

### Takeaway
As ferramentas suportam pré-carga de WIP: o Simul8 tem "initial contents" nas filas e o próprio help recomenda "priming" para encurtar o aquecimento. Mas a teoria sobre M/M/1 alerta que iniciar na média de regime **não muda a ordem de grandeza** do viés. Na M/M/1, pode até ser pior que iniciar vazio para minimizar o erro quadrático médio (Madansky 1976). O ganho é modesto e depende de acertar o estado.

### Cited Findings
- [FATO] Simul8: "you can reduce the warm-up length required by 'priming' your simulation with some Work Items in Queues", via "Queues, initial contents". Fonte: https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/clock/warm-up-period/
- [FATO] Ni & Henderson: iniciar em X(0) ≈ (1−ρ)⁻¹ (média de regime) dá constante de viés ≈ −(2cμ)⁻¹(1−ρ)⁻³, "of the same order as g(0) so, at least in order, bias is not reduced". O mesmo vale para GI/GI/c via RBM, e "our tools are too crude to quantify the benefits". Fonte: https://people.orie.cornell.edu/shane/pubs/howhard.pdf
- [FATO] Madansky (1976): para t suficientemente grande, iniciar em n=0 minimiza o erro quadrático médio na M/M/1, e não em n=λ/μ "often-conjectured". Fonte: https://ideas.repec.org/a/inm/oropre/v24y1976i3p572-577.html
- [FATO] Uma patente descreve rodar um cenário com fator aleatório durante o aquecimento para gerar a condição inicial antes de lotes de replicações, ou seja, salvar e reusar o estado aquecido. Fonte: US Patent 7650267, "Distribution of DES replications in a simulation", https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7650267
- [ESTIMATIVA, cálculo próprio, M/M/1 ρ=0,8] Constante de viés da média temporal de L: vazio → −100; X(0)=4 (média) → −50; X(0)=8 → +80. Iniciar na média **reduz o viés à metade**, mas não o elimina, e errar para cima inverte o sinal. Isso é coerente com o "mesma ordem" de Ni & Henderson. (Método descrito na seção 3.)

### Inferences
- [PALPITE] Para o Takt, a pré-carga é pedagogicamente útil em dois cenários:
  1. "Turno que continua o anterior": carregar o WIP final de um turno salvo (snapshot) como estado inicial do seguinte. Isso é uma condição inicial realista e não um truque estatístico, e corresponde ao exemplo de "fábrica de segunda-feira" do Simul8.
  2. Mostrar ao aluno que pré-carregar com a média reduz mas não elimina o viés, e que pré-carregar demais cria viés positivo.
- [PALPITE] Um "estado típico" pode ser obtido rodando um aquecimento uma vez e salvando o snapshot (como na patente). Mas, se todas as replicações reutilizarem o mesmo snapshot, elas deixam de ser independentes no início. Ou se aceita isso, ou se sorteia o estado inicial de uma distribuição (ex.: geométrica para M/M/1).
- [PALPITE] Para linhas seriais, pré-carga razoável: WIP por buffer ≈ Lq analítico de cada estação, ou o nível médio observado num aquecimento piloto. Pré-carregar só o buffer do gargalo captura a maior parte do efeito, já que ele domina o transiente.

### Gaps
- Não verifiquei, em documentação oficial, os recursos de pré-carga de WIP em Arena, Simio, FlexSim, AnyLogic, Plant Simulation e ExtendSim. [PALPITE, conhecimento prévio] Em geral faz-se com lógica de inicialização (por exemplo, criar entidades em t=0 ou usar métodos de init), mas não confirmei os nomes das funcionalidades.
- Não encontrei estudo empírico que compare pré-carga com deleção em linhas de produção seriais.
