# Falhas de máquina e esteiras em simuladores de eventos discretos (validação das escolhas v1 do Takt)

Rótulos: [Fato] = citação literal de fonte primária lida nesta pesquisa; [Fato secundário] = trecho obtido por extrato de buscador ou por resumo de página que não consegui abrir na íntegra (conferir antes de citar em PDR/ADR); [Estimativa] = cálculo meu, com a premissa declarada; [Palpite] = memória ou dedução sem fonte verificada.

Páginas inacessíveis nesta sessão (bloqueio do servidor): anylogic.help (403 Cloudflare), docs.flexsim.com (530; a documentação migrou para help.autodesk.com, que exige JavaScript), docs.sw.siemens.com (SPA com JavaScript), texto integral de Dallery e Gershwin 1992 no DSpace do MIT (HTML em vez de PDF), artigo de Matta no re.public.polimi.it (403).

## Pergunta 1 — Base de contagem das falhas (calendário x tempo ocupado x contagem) e distribuições padrão em cada ferramenta

### Takeaway
A escolha (a) do Takt — tempo de calendário contado a partir do fim do reparo anterior, podendo falhar ociosa — é exatamente o padrão do Simul8 e do Arena, e é uma opção explícita (usada nos tutoriais) do Plant Simulation, do Simio, do AnyLogic e do ProModel. Todas as ferramentas oferecem como alternativa a base "só tempo ocupado" (busy/processing time) e uma base por contagem de peças/ciclos. Nos padrões automáticos, o tempo até a falha é exponencial, mas o reparo NÃO é exponencial: Simul8 e Plant Simulation usam Erlang (Erlang-2).

### Cited Findings

**Simul8**
- [Fato] Padrão = tempo decorrido desde o fim do reparo: "The default in Simul8 is to breakdown an Activity based on the elapsed time since the end of repair for the previous breakdown." — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- [Fato] Alternativa por tempo ocupado: "Only Count Busy Time restricts the time since the last breakdown to count only to machine running time." — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- [Fato] No modo "Auto", Simul8 "uses negative exponential distributions for mean-time-between-failure" e "Erlang 2 distributions for repair time". — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- [Fato] Há também base por ciclos: MCBF (Mean Cycles Between Failures), que conta ciclos de máquina ou itens processados em vez de tempo. — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- [Fato] Eficiência no Simul8 "relates to machine breakdown rates, not loss of product in process in the from of scrap" (sic). — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)

**Arena (via Rossetti, "Simulation Modeling and Arena", livro online)**
- [Fato] "There are two ways in which a failure can be initiated for a resource: time based and usage (count) based." — [Rossetti, cap. 6.2](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)
- [Fato] Recontagem a partir do reparo e base padrão = relógio: "After the failure is repaired, the event is re-scheduled and the time to failure starts again. The up-time in this state field forms the basis for the time to failure. If nothing is specified, then simulation clock time is used as the basis. However, you can specify a state (from a STATESET or auto state (Idle, Busy, etc)) to use as the basis for accumulating the time until failure. The most common situation is to choose the Busy state." — [Rossetti, cap. 6.2](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)
- [Fato] Falha por uso: "Usage based failures occur after the resource has been released. Each time the resource is released a count is incremented, when it reaches the specified number until failure value, the resource fails." — [Rossetti, cap. 6.2](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)
- [Fato] Recurso ocupado no momento da falha: "If the resource has busy units, then the rules for capacity change (ignore, wait, and preempt) are invoked." — [Rossetti, cap. 6.2](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)
- [Fato] Exercício do livro usa exponencial nas duas pontas e base relógio: "The time between pump failures is distributed according to an exponential distribution with a mean of 40 hours and is based on clock time (not busy time). The time to service a pump is exponentially distributed with a mean of 4 hours." — [Rossetti, cap. 6](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)

**Plant Simulation (Siemens Tecnomatix)**
- [Fato] Três referências de tempo: "We defined the failure to be related to the simulation time, but you can also choose the options operating time and processing time. Operating time is the time when the object (in our case Machine) is operational. Operating time is interrupted by pauses and failures. Processing time is the time that the object is actually processing a MU. For lines and conveyors, which can also fail, processing time is the time the speed is not zero. It does not matter if the line or conveyor is transporting a MU or moving empty." — [U. Twente, Plant Simulation Tutorial 2404 (2025), §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Intervalo contado a partir do fim do reparo: "Interval is the time between the end of the last failure and the occurrence of a new failure. Duration is the time a failure takes to be repaired." — [U. Twente, tutorial §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Distribuições automáticas no modo Disponibilidade/MTTR: "Although we only set the availability to 75% and the MTTR to 2 minutes, Plant Simulation uses an exponential distribution for the interval times, with a beta of 6 minutes, and an Erlang distribution for the duration, with a mu of 2 minutes and a sigma of 1 minute and 24.85 seconds." — [U. Twente, tutorial §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] O tutorial instrui: "Make sure that Failure relates to is set to SimulationTime." (não afirma que é o padrão de fábrica). — [U. Twente, tutorial §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Ajuda oficial (extrato do buscador): ao atribuir Availability via SimTalk, o programa "enters a default value of 1 hour for the MTTR". — [Plant Simulation Help 15: MTTR](https://docs.plm.automation.siemens.com/content/plant_sim_help/15/plant_sim_all_in_one_html/en_US/tecnomatix_plant_simulation_help/objects_reference_help/material_flow_objects/shared_properties_of_the_material_flow_objects/attributes_of_the_material_flow_objects/attributes_for_defining_failures_of_the_material_flow_objects/attributes_for_failures_in_the_simplified_notation/mttr_material_flow_objects.html)

**Simio (Smith, Sturrock e Kelton, "Simio and Simulation: Modeling, Analysis, Applications", 7ª ed.)**
- [Fato] O Server "supports three different types of failures": "Calendar Time Based — the uptime is based on calendar time and you specify the uptime between failures;" "Event Count Based — the uptime is based on the number of times an event occurs and you specify the number of events; and" "Processing Count Based — the uptime is based on the number of times the server processes an entity". Falhas Calendar Time Based "are most commonly used to model random mechanical failures". — [Simio textbook 7ª ed., cap. 5, §5.3.4](https://textbook.simio.com/SASMAA7/ch-intermediate-modeling.html)
- [Fato] Exemplo do livro: "fails after about 6 hours of uptime", reparo "approximately 30 minutes", "both are exponentially distributed"; Uptime Between Failures = `Random.Exponential(6)` Hours, Time to Repair = `Random.Exponential(30)` Minutes; fração estimada em falha ≈ 7,54%. — [Simio textbook 7ª ed., §5.3.4](https://textbook.simio.com/SASMAA7/ch-intermediate-modeling.html)
- [Fato secundário] Material de treinamento da Simio lista tipos diferentes (versão diferente): "Calendar Time Based, Usage Time Based, Usage Count Based, and Event Count Based". — [Simio LLC, Module 4 (UTRGV)](https://www.utrgv.edu/nsfmbse/resources/4_more-simio-libraryhighlights.pdf)
- [Palpite] Os autores (Smith, Sturrock, Kelton) vêm da minha memória; a página lida não exibiu os nomes.

**AnyLogic**
- [Fato secundário] ResourcePool, opção "Count busy time only": "If selected, the time between failures (time to failure) is counted only when the resource is busy with a task. Otherwise, the time to failure is counted unconditionally." e o tempo entre falhas "starts counting from the repair moment". — [AnyLogic Help: ResourcePool](https://anylogic.help/library-reference-guides/process-modeling-library/resourcepool.html)
- [Fato secundário] Bloco Downtime: tipos "Maintenance (may be triggered by schedule), Failure / repair (may not be triggered by schedule), or Custom"; estatística de uso padrão "Downtime.USAGE_NOT_COUNTED". — [AnyLogic Help: Downtime](https://anylogic.help/library-reference-guides/process-modeling-library/downtime.html)

**FlexSim**
- [Fato secundário] Fórum oficial (Autodesk): com MTBF restrito a estados escolhidos, "the time between failures only counts the time spent in the chosen states"; para esteira falhar enquanto move itens, é preciso selecionar o estado "conveying". — [Autodesk Community: MTBF & MTTR not working](https://forums.autodesk.com/t5/flexsim-forum/mtbf-amp-mttr-not-working-in-model/td-p/13698818)
- [Fato secundário] Fórum: parar o objeto "does not interrupt the Process Flow of items that are already in the object". — [Autodesk Community](https://forums.autodesk.com/t5/flexsim-forum/mttr-behavior-issue/m-p/13585821)

**ProModel**
- [Fato secundário] "usage downtimes are based on in-use time, which does not include idle time. Scheduled and unscheduled downtimes are based on total elapsed simulation time (in-use time and idle time)." — [ProModel Process Simulator Help: Downtimes Tab](https://www.promodel.com/onlinehelp/processsimulator/93/Content/Topics/Downtimes_Tab.htm)

### Inferences
- [Estimativa] Base de calendário com recontagem após o reparo é o padrão em Simul8 e Arena e a opção "elapsed/SimulationTime/Calendar Time Based/unconditional" nas demais; logo, a escolha (a) do Takt está alinhada com o mercado e é defensável como padrão didático.
- [Estimativa] Todas as ferramentas oferecem a base "tempo ocupado". Recomendo registrar no PDR que a v1 só tem calendário e que "busy time" é extensão prevista (um campo de base de falha), em vez de omitir o assunto — Law (pergunta 3) considera a base ocupada "more natural".
- [Estimativa] O exemplo do Plant Simulation (exponencial de média 6 + Erlang de média 2) mostra que o Erlang usado é Erlang-2: σ = 84,85 s = 120 s / √2 (premissa: Erlang-k tem σ = μ/√k; k = 2 dá exatamente 84,85 s).

### Gaps
- Defaults de distribuição do Arena (expressões iniciais de Up Time/Down Time no módulo Failure), do FlexSim (First Failure Time, MTBF, MTTR) e do AnyLogic (Downtime/ResourcePool) não foram verificados: páginas oficiais inacessíveis ou não tratam disso.
- Não confirmei qual é o valor padrão de fábrica de "Failure relates to" no Plant Simulation.
- Não achei o que o Arena faz por padrão (Ignore, Wait ou Preempt) — Rossetti lista as regras, mas não o padrão.

## Pergunta 2 — O que "MTBF" significa em cada ferramenta e qual fórmula de disponibilidade resulta

### Takeaway
Em todas as ferramentas verificadas, o parâmetro de "tempo entre falhas" é o tempo de funcionamento (uptime) entre o fim de um reparo e a próxima falha, e não o ciclo completo falha-a-falha. Portanto A = MTBF / (MTBF + MTTR). Em confiabilidade/manutenção, porém, há fontes que definem MTBF pelo ciclo inteiro; o Takt deve documentar o significado de `mtbfMin` explicitamente.

### Cited Findings
- [Fato] Plant Simulation: "Interval is the time between the end of the last failure and the occurrence of a new failure"; disponibilidade 75% com MTTR 2 min gera intervalo exponencial "with a beta of 6 minutes". — [U. Twente, tutorial §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Simul8: quebra baseada em "the elapsed time since the end of repair for the previous breakdown". — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- [Fato] Arena: "After the failure is repaired, the event is re-scheduled and the time to failure starts again." — [Rossetti, cap. 6.2](https://rossetti.github.io/RossettiArenaBook/06-Chapter6.html)
- [Fato] Simio: "Calendar Time Based — the uptime is based on calendar time and you specify the uptime between failures". — [Simio textbook 7ª ed., §5.3.4](https://textbook.simio.com/SASMAA7/ch-intermediate-modeling.html)
- [Fato] Law define o ciclo: "A machine goes through a sequence of cycles, with the i th cycle consisting of an up ("operating") segment of length U i followed by a down segment of length D i." e, no Exemplo 14.3, falha exponencial de média 540 min e reparo de média 60 min: "The machine is, thus, broken 10 percent of the time, since the mean length of the up–down cycle is 10 hours." — [Law, Simulation Modeling and Analysis, cap. 14, §14.4.2](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Law define eficiência como "the long-run proportion of potential processing time (i.e., parts present and machine not blocked) during which the machine is actually processing parts", e = m_B / (m_B + m_D), com m_B = média do tempo ocupado antes de uma falha. — [Law, cap. 14, §14.4.2](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato secundário] Definição alternativa (ciclo inteiro): AVEVA define MTBF como a janela de tempo de simulação dividida pelo número de falhas. — [AVEVA Asset Strategy Optimization](https://docs.aveva.com/bundle/asset-strategy-optimization/page/1161293.html); em contraste, ReliaSoft BlockSim tem "MTBF on uptime", considerando "only the time that the system was up". — [ReliaSoft BlockSim: System Overview](https://help.reliasoft.com/blocksim/content/system_overview.htm)
- [Fato secundário] Material do Simul8 descreve disponibilidade como MTBF/(MTBF+MTTR). — [Simul8, "Breakdowns happen" (slides)](https://www.slideshare.net/SIMUL8/breakdowns-happen-slides)

### Inferences
- [Estimativa] Conferência numérica: Plant Simulation 6/(6+2) = 75% (bate com a entrada); Law 540/(540+60) = 90% (bate com "10 percent"); Simio 6 h/(6 h + 0,5 h) = 92,3%, isto é, 7,69% em falha, coerente com os 7,54% simulados (premissa: diferença é ruído amostral). As três confirmam A = MTBF_up/(MTBF_up + MTTR).
- [Estimativa] Com base de calendário, A = mtbf/(mtbf+mttr) vale como fração do tempo total; com base ocupada, a mesma expressão é a "eficiência" de Law (fração do tempo potencial de processamento), não a fração do tempo de calendário. Isso precisa constar na documentação de KPIs do Takt.
- [Estimativa] Recomendo definir `mtbfMin` no glossário como "tempo médio de funcionamento entre o fim de um reparo e a próxima falha" para evitar a ambiguidade AVEVA x ReliaSoft.

### Gaps
- Não encontrei definição textual de MTBF na documentação do FlexSim nem do AnyLogic (páginas bloqueadas).

## Pergunta 3 — Literatura: falhas dependentes de operação x de tempo; exponencial como padrão didático; recomendação de Law

### Takeaway
Law (cap. 14, "Simulation of Manufacturing Systems") descreve os dois métodos, aponta duas desvantagens do calendário (falha ociosa e comparação injusta entre configurações) e conclui que "the busy-time approach is more natural", mas admite que muitas fábricas só têm dados de calendário. Ele também desaconselha a exponencial para o tempo até a falha e propõe gama(0,7) para tempo ocupado até a falha e gama(1,3) para o reparo quando não há dados. A escolha do Takt (calendário + exponencial nas duas pontas) é a mais simples e comum nas ferramentas, mas contraria a recomendação de Law nos dois pontos; o reparo exponencial também diverge dos defaults do Simul8 e do Plant Simulation (Erlang-2).

### Cited Findings
- [Fato] Importância: "The most important source of randomness for many manufacturing systems is that associated with machine breakdowns or unscheduled downtime." — [Law, cap. 14, §14.4.2](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Contra reduzir a taxa: no Exemplo 14.3, reduzir a taxa de processamento em 10% dá vazão quase igual, mas "measures of performance such as average time in system for a job and maximum number of jobs in queue are vastly different"; e mesmo mantendo 10% em falha, MTBF 54/MTTR 6 difere muito de 540/60: "it is also important to have an accurate assessment of mean time to failure and mean repair time". Tabela 14.2: tempo médio no sistema 35,1 (540/60) x 10,3 (54/6) x 5,6 (sem quebras, taxa reduzida). — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Calendário: "When the machine actually fails at time u 1 , note that it may either be busy or idle" e "(If the machine was processing a part when it failed at time u 1 , then it is usually assumed that the machine finishes this part's remaining processing time starting at time u 1 + d 1 .)" — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Desvantagens do calendário: "There are two drawbacks of the calendar-time approach. First, it allows the machine to break down when it is idle, which may not be realistic." O segundo: ao comparar duas configurações com falhas sincronizadas, "the machine will break down at the same points in simulated (calendar) time for both simulations", embora o tempo ocupado real difira por bloqueio/falta. "This also may not be very realistic." — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Recomendação: "In general, the busy-time approach is more natural than the calendar-time approach. We would expect the next time of failure of a machine to depend more on total busy time since the last repair than on calendar time since the last repair. However, in practice, the busy-time approach may not be feasible, since uptime data (U 1 , U 2 , . . .) may be available but not busy-time data (B l , B 2 , . . .). In many factories, only the times that the machine fails and the times that the machine goes back up (completes repair) are recorded." — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Equivalência: "Note that if a machine is never starved or blocked, then B i = U i and the two approaches are equivalent." Também: "(In computing the U i 's, time intervals where the machine is off, e.g., idle shifts, should be subtracted out.)" — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Terceiro método: "the number of completed parts. For example, after a machine has completed 100 parts, it might be necessary to perform maintenance on the machine." — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Contra a exponencial no tempo até a falha: "Note that the exponential distribution (gamma distribution with α B = 1.0) does not appear, in general, to be a good model for machine busy times, even though it is often used in simulation models for this purpose." O ajuste a 7 conjuntos de dados deu forma média 0,7; "In only one case was the estimated shape parameter close to 1.0 (the exponential distribution)." — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Reparo sem dados: "We will assume that machine downtime (or repair time) has a gamma distribution with shape parameter α D = 1.3", obtido de 11 conjuntos de dados; a densidade "has the same general shape as downtime histograms often experienced in practice". Histogramas de reparo "have their mode at a positive value and are skewed to the right". — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Parametrização por especialistas: média de reparo m_D e eficiência e; escalas β_B = e·m_D / (0,7·(1−e)) e β_D = m_D / 1,3. — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Espera por reparador: D_i = W_i + R_i; se W_i for significativa, modelar "a maintenance resource with a finite number of units". — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato] Dallery e Gershwin, "Manufacturing Flow Line Systems: a Review of Models and Analytical Results", Queueing Systems 12(1–2), 1992, pp. 3–94 (registro bibliográfico; manuscrito final dos autores no DSpace). — [DSpace@MIT 1721.1/95914](https://dspace.mit.edu/handle/1721.1/95914); [Springer DOI 10.1007/BF01158636](https://link.springer.com/doi/10.1007/BF01158636)
- [Fato secundário] A distinção ODF (operation-dependent failures) x TDF (time-dependent failures) é usada na literatura de linhas de fluxo (Matta e coautores, IJPR), que cita Dallery e Gershwin 1992. — [re.public.polimi.it IJPR](https://re.public.polimi.it/bitstream/11311/1016957/4/IJPR.pdf) (403; só extrato do buscador)
- [Palpite] O PDF lido tem ISBN 0073401323 na URL e arquivos "Law01323_ch14" datados de 2013; presumo ser a 5ª edição (McGraw-Hill, 2015). Não verificado na página.

### Inferences
- [Estimativa] Calendário x ocupado é exatamente TDF x ODF da literatura analítica. A escolha (a) do Takt corresponde a TDF.
- [Estimativa] Para fins didáticos, o segundo defeito apontado por Law é relevante ao Takt: se o aluno compara cenários (ex.: buffer maior) com a mesma semente, as falhas cairão nos mesmos instantes de calendário em ambos, o que é bom para comparação pareada, mas uma máquina mais bloqueada "gasta" MTBF ociosa e parece melhor do que seria com ODF. Vale um aviso na UX/glossário.
- [Estimativa] Exponencial no tempo até a falha: aceitável como padrão didático (é o default de Simul8, Plant Simulation e o exemplo do Simio/Arena), desde que o texto reconheça que Law a desaconselha para dados reais. Exponencial no reparo: mais difícil de defender — Simul8 e Plant Simulation usam Erlang-2 por padrão e Law usa gama(1,3) e gama(2) (Exemplo 14.3); os dados de reparo têm moda positiva, e a exponencial tem moda em zero. Sugestão [Estimativa]: reparo Erlang-2 com média `mttrMin` (soma de duas exponenciais de média mttrMin/2), o que só exige o `log` próprio do motor e respeita a regra de não usar `Math.log`.
- [Estimativa] Law confirma a regra "peça interrompida termina o restante após o reparo" (preempt-resume) como o pressuposto usual — o Takt deve declarar o que faz com a peça em processo.

### Gaps
- Não consegui o texto integral de Dallery e Gershwin 1992 nem de Buzacott e Hanifin 1978 para citar a definição literal de ODF/TDF e a comparação de vazão entre os dois casos.
- Não encontrei um tutorial WSC de Law específico sobre paradas de máquina; a fonte usada é o capítulo 14 do livro, publicado pela McGraw-Hill como amostra gratuita.

## Pergunta 4 — Esteiras: acumulativa x não acumulativa, comprimento, velocidade, capacidade e falhas em cada ferramenta

### Takeaway
Todas as ferramentas modelam esteira por comprimento e velocidade (tempo de trânsito = comprimento/velocidade) e distinguem acumulativa de não acumulativa (Simul8: "Accumulating" x "Fixed"). A capacidade vem do comprimento dividido pelo tamanho do item (Simul8, Plant Simulation, Arena por células), e o Plant Simulation também tem atributo explícito de capacidade. Esteiras podem falhar em Plant Simulation, Simul8 (Efficiency), FlexSim e AnyLogic; nenhuma fonte lida descreve em detalhe o que acontece com as peças durante a falha.

### Cited Findings

**Simul8**
- [Fato] "Conveyors can be either "Accumulating" or "Fixed"." — [Simul8 Help: Conveyors](https://www.simul8.com/support/help/doku.php?id=features:conveyors)
- [Fato] Capacidade: "The number of Work Items that can be on a Conveyor at any one time is determined by the length of the Conveyor and the size of the Work Item." e "The size or length of a Work Item can be controlled by using the reserved Label name Length." — [Simul8 Help: Conveyors](https://www.simul8.com/support/help/doku.php?id=features:conveyors)
- [Fato] Trânsito: "The speed of a Conveyor, combined with its length affects how long it takes a Work Item to travel from the start to the end of a Conveyor (assuming no other Work Items block its progress)." — [Simul8 Help: Conveyors](https://www.simul8.com/support/help/doku.php?id=features:conveyors)
- [Fato secundário] "Allow Gaps": desmarcado, "commands the Conveyor to wait whenever a gap will appear on the Conveyor if an item is not ready to be immediately loaded." — [Simul8 Help: Conveyors](https://www.simul8.com/support/help/doku.php?id=features:conveyors)
- [Fato] Esteiras podem quebrar: "Both Activities and Conveyors can simulate situations were equipment or people work with less then 100% efficiency." (sic) — [Simul8 Help: Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)

**Arena (Rossetti, cap. 7.3)**
- [Fato] Classificação: "Accumulating: Items on the conveyor continue to move forward when there is a blockage on the conveyor. Non-accumulating: Items on the conveyor stop when the conveyor stops. Fixed spacing: Items on the conveyor have a fixed space between them or the items ride in a bucket or bin. Random spacing: Items are placed on the conveyor in no particular position and take up space on the conveyor." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato] Analogias: "the belt conveyor at a grocery store is like an accumulating conveyor. An escalator is like a fixed spaced non-accumulating conveyor [...] People movers in airports are like non-accumulating, random spacing conveyors." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato] Células e capacidade: "if each cell represents 1 foot and the total length of the conveyor is 15 feet, then there will be 15 cells. The cell size of the conveyor is the smallest portion of a conveyor that an entity can occupy." e "When one cell moves, all cells must move, in lock step." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato] Módulo CONVEYOR define se é acumulativa ou não, "the cell size (in physical units e.g. feet), and the velocity"; "The sum of the distances among the stations on the conveyor (specified by SEGMENT module) must be divisible by the cell size. If not, an error will occur when the model is checked." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato] Velocidades típicas: "The speeds of conveyance typically range from 20-80 feet per minute to as fast as 500 feet per minute." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)

**Plant Simulation (objeto Line)**
- [Fato] Capacidade pelo comprimento: "The number of MUs that fit on LineRound depends on the length of the Line and the length of the MU Pallet." (palete de 1,2 m). — [U. Twente, tutorial §8.2](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Capacidade explícita além do comprimento: "Create 6 separate straight Lines, which have the following specifications: Length = 5m, Speed = 0.2 m/s, and Capacity = 2." — [U. Twente, tutorial §8.3](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Linhas podem falhar: "For lines and conveyors, which can also fail, processing time is the time the speed is not zero. It does not matter if the line or conveyor is transporting a MU or moving empty." — [U. Twente, tutorial §7.7](https://www.utwente.nl/en/bms/iems/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Palpite] O Line tem um atributo "Accumulating" (marcado por padrão); não verificado nesta pesquisa (ajuda oficial inacessível, tutorial não menciona).

**FlexSim**
- [Fato] Law: "Material-handling devices available in FlexSim include conveyors (transport and accumulating)". — [Law, cap. 14, §14.3.1](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)
- [Fato secundário] Esteiras falham via MTBF/MTTR com o estado "conveying" selecionado. — [Autodesk Community](https://forums.autodesk.com/t5/flexsim-forum/mtbf-amp-mttr-not-working-in-model/td-p/13698818)

**AnyLogic**
- [Fato secundário] Estado FAILED de estação/esteira: "Failure caused by the Downtime block of the Failure / repair type or the call of fail() function." — [AnyLogic Help: Station](https://anylogic.help/markup/station.html)

**Classificação geral (Law)**
- [Fato] "Important classes of material-handling systems are forklift trucks, AGVS with contention for guide paths, transport conveyors (equal distance between parts), accumulating (or queueing) conveyors, power-and-free conveyors, [...]" e "real-world conveyor systems come in a wide variety of forms, and different software packages have varying degrees of conveyor capabilities." — [Law, cap. 14](https://highered.mheducation.com/sites/dl/free/0073401323/1041673/Chapter_14.pdf)

### Inferences
- [Estimativa] A escolha (b) do Takt (lengthM, speedMPerMin, trânsito = L/v) coincide com Simul8, Arena e Plant Simulation. Ter capacity explícita independente do comprimento tem precedente no Plant Simulation (Length 5 m + Capacity 2).
- [Estimativa] Ponto a decidir: numa esteira não acumulativa real o espaçamento entre peças é fixo e a entrada exige espaço livre (células contíguas no Arena; comprimento do item no Simul8). Como o Takt não tem comprimento de peça, duas peças poderiam entrar no mesmo instante e "ocupar o mesmo lugar". Sugestão: espaçamento mínimo de entrada = lengthM / capacity, ou seja, intervalo mínimo de entrada = trânsito / capacity. Isso dá à esteira uma vazão máxima coerente de capacity / trânsito (peças/min). Sem essa regra, a esteira só limita estoque em trânsito, não a vazão.
- [Estimativa] "A esteira nunca cria defeitos" é consistente com todas as ferramentas lidas: nenhuma documentação cita refugo gerado por esteira, e o Simul8 separa eficiência de refugo.
- [Estimativa] Base de falha da esteira: no Plant Simulation, a opção "processing time" de uma esteira conta enquanto a velocidade não é zero, mesmo vazia. Com base de calendário (escolha do Takt), a esteira falha também parada por bloqueio; é coerente com (a), mas vale registrar.

### Gaps
- Defaults de comprimento, velocidade e tamanho de célula: nenhuma fonte lida dá valores padrão (Rossetti diz explicitamente que 10 ft/min e 1 ft são escolhas do exemplo).
- O que acontece com as peças sobre uma esteira em falha (param e retomam? tempo restante preservado?) não é descrito em nenhuma fonte lida. Os fóruns do FlexSim só dizem que parar o objeto não interrompe automaticamente a lógica dos itens.
- Documentação oficial de esteiras do AnyLogic (Material Handling Library), do FlexSim e do Simio não pôde ser lida.
- Não verifiquei STOP/START de esteira no Arena nem falha de esteira no Arena.

## Pergunta 5 — "Esteira não acumulativa para inteira quando a saída está bloqueada" é o comportamento documentado?

### Takeaway
Sim. Simul8, Arena e FlexSim (fórum) descrevem exatamente isso: na esteira não acumulativa/fixa, quando o item da frente não pode sair, a esteira inteira para e as lacunas entre itens são preservadas; na acumulativa, só os itens atrás do bloqueio param.

### Cited Findings
- [Fato] Simul8: "If Accumulating is unchecked, the first Work Item on the Conveyor stops then all other Work Items on the Conveyor will also stop. (Gaps on the Conveyor do not get squashed to let the items accumulate at the front)." — [Simul8 Help: Conveyors](https://www.simul8.com/support/help/doku.php?id=features:conveyors)
- [Fato] Arena: "Non-accumulating conveyors travel in a single direction, and the spacing remains the same between the entities. When an entity is placed on the conveyor, the entire conveyor is actually disengaged or stopped until instructions are given to transfer the entity to its destination. When the entity reaches its destination, the entire conveyor is again disengaged until instructions are given to remove the entity from the conveyor, at which time it is engaged or started." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato] Arena, processamento sobre a esteira: "If you run the model, you will see that the whole conveyor stops when the entity is being processed." e, para a acumulativa, "Instead of disengaging the conveyor as with non-accumulating conveyors the conveyor continues to run." — [Rossetti, cap. 7](https://rossetti.github.io/RossettiArenaBook/07-Chapter7.html)
- [Fato secundário] FlexSim (fórum): "if that item stops later down the line, it will stop the upstream nonaccumulating conveyor" e, com estações em esteira não acumulativa, "only one station can actively stop the conveyor and as soon as it does, all other stations are "blocked" and unable to process." — [Autodesk Community: Conveyor items stop](https://forums.autodesk.com/t5/flexsim-forum/conveyor-items-stop-with-moving-space-gt-0/m-p/13491334); [Autodesk Community: Stations on non accumulating conveyor](https://forums.autodesk.com/t5/flexsim-forum/stations-on-non-accumulating-conveyor/m-p/13485535)

### Inferences
- [Estimativa] A regra do Takt "quando o elemento a jusante está cheio, a esteira inteira para" corresponde à esteira "Fixed"/non-accumulating. A analogia "belt conveyor" do Takt precisa de cuidado: Rossetti usa a esteira de caixa de supermercado ("belt conveyor at a grocery store") como exemplo de acumulativa, porque ali os itens deslizam sobre a correia. Para a UX, a analogia mais segura é a escada rolante ou o "people mover" (Rossetti).
- [Estimativa] O Takt deve declarar que, ao parar, as posições relativas (lacunas) são preservadas e o tempo restante de trânsito de cada peça é congelado e retomado — é o que "Gaps [...] do not get squashed" implica.

### Gaps
- Nenhuma fonte primária lida (doc oficial) do FlexSim, AnyLogic, Simio ou Plant Simulation confirma o comportamento; para FlexSim só há fórum.
