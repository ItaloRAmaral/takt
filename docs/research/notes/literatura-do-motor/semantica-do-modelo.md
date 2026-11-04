# Semântica do modelo: estação, fila, buffer, esteira, falhas, OEE e gargalo

Notas de pesquisa (04/11/2026) para as pendências do [roteiro do motor](../../../plans/2026-11-04-roteiro-motor.md), sub-planos 3 e 5. Rótulos usados: **Fato** (com link para a fonte que li), **Fato secundário** (link para fonte que só resume a primária, ou para o resumo da busca sem a página inteira), **Lembrança não verificada** (conhecimento prévio sem fonte aberta nesta pesquisa; não usar como fato), **Estimativa** e **Palpite**.

Limites desta rodada: não consegui ler o texto completo de Dallery e Gershwin (1992), das notas do MIT 2.852, do Law (5ª ed.), do Factory Physics, da ISO 22400-2 nem de Nakajima (1988). O texto completo de Roser, Nakano e Tanaka (2001) e o do tutorial do Plant Simulation da Universidade de Twente (2025) foram lidos.

## 1. Fila na frente da estação: implícita ou só buffer explícito? O que acontece em "fonte → estação → expedição"?

### Takeaway
As ferramentas se dividem em dois estilos. No Arena e no Simio, a estação traz embutida uma fila de entrada (no Arena ela é criada sozinha pelo módulo Process). No Plant Simulation e no Simul8, a estação não tem fila: a fila é um objeto separado e, sem ele, o elemento de cima fica bloqueado ("push-block"). Nos dois estilos, "fonte → estação → expedição" roda. O que muda é o destino das chegadas quando a estação está ocupada: elas esperam numa fila implícita, ou ficam retidas na fonte.

### Cited Findings
- **Fato (Plant Simulation):** a Station "recebe uma MU, a retém durante o tempo de processamento e depois tenta passá-la adiante. Por exemplo, uma máquina com capacidade 1". A espera é um objeto separado: no modelo do consultório, o tutorial manda "inserir um Buffer entre Arrival e GeneralPractitioner", com capacidade ilimitada (−1) — [Tutorial Plant Simulation 2404, U. Twente, 2025, seções 2.4 e 3.4](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- **Fato (Plant Simulation, regra de passagem):** "push-block": o objeto com uma peça pronta tenta empurrá-la ao sucessor; "se o sucessor não pode receber a peça no momento, o princípio de bloqueio é ativado", e o objeto é reativado assim que o sucessor puder receber — [mesmo tutorial, seção 3.6](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- **Fato (Plant Simulation, fonte):** a Source tem um modo de operação "Blocking". Com ele ligado, as peças "chegam também fora dos turnos, mas ficam retidas na Source até o início do turno", ou seja, a fonte guarda a chegada em vez de perdê-la — [mesmo tutorial, seção 6.4](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf). A semântica exata do modo não bloqueante (se perde a peça) não está no tutorial.
- **Fato secundário (Arena):** um processo Seize-Delay-Release cria automaticamente uma fila para as entidades que esperam o recurso — [Rossetti, *Simulation Modeling and Arena*, seção 2.10](https://rossetti.github.io/RossettiArenaBook/ch2-howArenaWorks.html). Além disso, no template do Arena, todo módulo que referencia uma fila cria o elemento de fila sozinho — [U. Iowa, ARENA Mods](https://user.engineering.uiowa.edu/~dbricker/Stacks_pdf8/ARENA_Mods.pdf). Não confirmei a capacidade padrão dessa fila.
- **Fato secundário (Simio):** o Server tem InputBuffer, estação de processamento e OutputBuffer. Quando a estação de processamento está cheia e a capacidade do InputBuffer é maior que zero, as entidades esperam nele — [Simulation Modeling with Simio, 6ª ed., "Anatomy of objects: Server"](https://textbook.simio.com/Workbook6/the-anatomy-of-objects-server.html). Com OutputBuffer 0, o Server de cima fica bloqueado e as peças esperam no InputBuffer dele — [fórum Simio, tópico 1107](https://forum.simio.com/topic/1107-queuing-at-server1-when-server2-is-busy/) (fórum, fonte fraca). Não confirmei o padrão (infinito ou não).
- **Fato secundário (Simul8):** num guia antigo do PowerDesigner com SIMUL8, "na saída de um ponto de entrada ligado a um centro de trabalho há sempre uma fila, para não perder itens"; sem fila, "itens vindos do ponto de entrada podem ser perdidos quando o centro de trabalho seguinte está ocupado" — [Sybase PowerDesigner 12.5, cap. 10](https://infocenter-archive.sybase.com/help/topic/com.sybase.stf.powerdesigner.docs_12.5.0/html/bpug/bpugp288.htm). É documentação de terceiros e antiga; pode não valer para o Simul8 atual.
- **Fato (Simul8):** a opção "Hold work here until more input is ready" impede que um item saia de uma Activity se o item seguinte não está pronto para entrar, e esse tempo vai para os resultados como tempo **Blocked** da Activity. Ou seja, o Simul8 registra bloqueio como um estado próprio — [Simul8 Help, Hold Work Here](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/hold-work-here/)

### Inferences
- Opções para o Takt (pendência "fila na frente da estação sem buffer"):
  - **(A) Fila de entrada implícita e ilimitada em toda estação** (estilo Arena/Simio). "Fonte → estação → expedição" roda e é um G/G/1 de manual, o que facilita bater o M/M/1 da validação. O buffer explícito passa a ser só um limite de capacidade entre estações.
  - **(B) Sem fila implícita; o bloqueio retém a peça no elemento de cima** (estilo Plant Simulation, "push-block"). Para "fonte → estação → expedição" rodar, a fonte precisa reter a chegada (modo Blocking do Plant Simulation), e o M/M/1 só sai com um buffer ilimitado entre fonte e estação.
  - **(C) Fila implícita com capacidade configurável, 0 = sem fila** (estilo InputBuffer do Simio). Engloba A e B num só campo, por exemplo `inputCapacity` (sem unidade, contagem de peças).
- **Palpite:** para uso didático, A ou C com padrão ilimitado deixa a "fila crescendo na estação mais lenta" (passo 2 da história do demo) visível sem obrigar o aluno a pôr um buffer, e atende à RN-EDT-003. Mas, como a fila fica dentro da estação, um buffer só tem efeito se for finito e houver bloqueio. Isso precisa de decisão do usuário.
- **Inferência:** se a fonte só pode reter a chegada (Plant Simulation com Blocking) e não há fila, a taxa de chegada efetiva cai abaixo da configurada. Então o caso M/M/1 da validação **exige** fila ilimitada, implícita ou explícita, entre a fonte e a estação.

### Gaps
- Capacidade padrão da fila implícita do Arena (Process/Seize) e do InputBuffer do Simio: não confirmei na documentação oficial.
- AnyLogic (bloco Service com fila embutida; o que a Source faz quando o próximo bloco recusa a peça): a página de ajuda deu 403. **Lembrança não verificada:** a Source do AnyLogic, empurrando para um bloco que não aceita, gera erro em tempo de execução, a menos que haja uma Queue.
- FlexSim (o Processor não tem fila; costuma-se pôr um objeto Queue antes): não verifiquei.

## 2. Buffers finitos e bloqueio: BAS × BBS; padrão para linhas; o que faz a fonte quando o próximo está cheio

### Takeaway
A revisão clássica é a de Dallery e Gershwin (1992, *Queueing Systems* 12, pp. 3–94). Ela trata de bloqueio, falhas e métodos exatos e aproximados para linhas, mas não consegui ler o texto completo. O comportamento-padrão das ferramentas que verifiquei (Plant Simulation, Simul8, Simio) é bloqueio depois do serviço (BAS): a peça terminada fica na máquina até haver lugar adiante, e a máquina não começa outra. A fonte, quando bloqueada, retém a peça (Plant Simulation com Blocking) ou a perde (configuração antiga do Simul8 sem fila).

### Cited Findings
- **Fato (referência bibliográfica):** Dallery, Y.; Gershwin, S. B. "Manufacturing flow line systems: a review of models and analytical results". *Queueing Systems* 12(1–2): 3–94, 1992. A revisão cobre modelos assíncronos, síncronos e contínuos, com bloqueio e falhas; há cópia aberta no MIT DSpace — [MIT DSpace 1721.1/95914](https://dspace.mit.edu/handle/1721.1/95914)
- **Fato secundário:** definição de BAS: "a unidade que termina o processamento permanece na estação e não pode começar outro processo até que a estação seguinte desbloqueie e a peça seja transferida". BAS também é chamado de "bloqueio tipo 1" — resumo da busca de um artigo de 2025 no *Int. J. Adv. Manuf. Technol.*, que cita Dallery e Gershwin — [Springer, s00170-025-17322-9](https://link.springer.com/10.1007/s00170-025-17322-9) (não li a página inteira)
- **Fato secundário:** as notas de aula do MIT 2.852 (Gershwin, 2010) listariam "blocking before service" e falhas dependentes da operação entre as suposições usuais dos modelos de linha — resumo da busca de [MIT 2.852 Lectures 6–9, Flow Lines](https://mitocw.ups.edu.ec/courses/mechanical-engineering/2-852-manufacturing-systems-analysis-spring-2010/lecture-notes/MIT2_852S10_transfer_lines.pdf). Baixei o PDF, mas não consegui extrair o texto; não verificado.
- **Fato (BAS no Plant Simulation):** no push-block, quem tem a peça pronta e não consegue passá-la fica bloqueado até o sucessor liberar — [Tutorial Plant Simulation 2404, seção 3.6](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- **Fato (BAS no Simul8):** o tempo em que o item não pode sair da Activity é registrado como "Blocked" — [Simul8 Help, Hold Work Here](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/hold-work-here/)
- **Fato (Roser et al. 2001):** num modelo de 8 máquinas em série com buffers de tamanho 3, os estados da máquina eram "1: working, 2: waiting, 3: blocked, 4: tool change, 5: under repair". Ou seja, bloqueado é um estado distinto de esperando (faminto) — [Roser, Nakano, Tanaka, WSC 2001, preprint](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)
- **Fato (fonte bloqueada, Plant Simulation):** com Blocking ligado, a Source retém as peças até poder entregá-las — [Tutorial Plant Simulation 2404, seção 6.4](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- **Fato secundário (fonte que perde chegadas, Simul8 antigo):** sem fila na saída do ponto de entrada, itens "podem ser perdidos" quando o centro seguinte está ocupado — [Sybase PowerDesigner 12.5, cap. 10](https://infocenter-archive.sybase.com/help/topic/com.sybase.stf.powerdesigner.docs_12.5.0/html/bpug/bpugp288.htm)

### Inferences
- Opções para "bloqueio quando o destino está cheio":
  - **BAS (bloqueio depois do serviço, "manufacturing blocking"):** a estação termina, guarda a peça e fica "bloqueada" até haver lugar. É o comportamento que verifiquei no Plant Simulation, no Simul8 e no Simio (OutputBuffer 0). **Mais comum nas ferramentas.**
  - **BBS (bloqueio antes do serviço, "communication blocking"):** a estação só começa se já houver lugar reservado adiante.
- **Lembrança não verificada:** Dallery e Gershwin dizem que BAS é o mais usual em sistemas de manufatura e BBS em redes de comunicação. Dizem também que, em certos modelos, as duas convenções se equivalem com uma diferença de uma unidade na capacidade do buffer. Antes de citar, conferir no texto (MIT DSpace).
- **Atenção à terminologia (palpite):** nos modelos síncronos de Gershwin, "blocking before service" pode ter um sentido próprio, ligado a quando o estado do buffer é contado na mesma fatia de tempo. Por isso o resumo das notas do MIT não contradiz que as ferramentas usem BAS. Não verificado.
- Opções para a fonte quando o próximo está cheio: **(i) reter a chegada e atrasar as seguintes** (Plant Simulation com Blocking); **(ii) perder a chegada e contá-la como perdida** (balking; Simul8 sem fila, segundo a fonte antiga); **(iii) fila ilimitada na saída da fonte** (Simul8, segundo a mesma fonte). Para a validação M/M/1, só (iii) ou uma fila implícita ilimitada na estação preservam a taxa de chegada.
- **Campos que isso exige (palpite):** estado `blocked` no log de eventos e nos indicadores (distinto de `starved`/ocioso); capacidade do buffer (`capacity`, peças); e, se houver fila implícita, a capacidade dela.

### Gaps
- Afirmação literal de Dallery e Gershwin (ou de Papadopoulos et al.) sobre qual convenção é padrão para linhas de produção: não consegui ler o texto.
- Padrão de bloqueio do Arena (em Arena, o bloqueio exige montar lógica explícita, por exemplo com Hold/Signal) e do FlexSim: não verificado.

## 3. Esteiras: acumuladora × não acumuladora; tempo = comprimento / velocidade; capacidade; modelo didático mais simples

### Takeaway
As ferramentas distinguem a esteira acumuladora (as peças encostam umas nas outras quando a frente para) da não acumuladora (a esteira inteira para quando a peça da frente não sai). O tempo de trânsito sem bloqueio vem de comprimento e velocidade, e a capacidade vem do comprimento dividido pelo tamanho da peça. O modelo mínimo é um atraso fixo com capacidade, que bloqueia na saída como uma estação.

### Cited Findings
- **Fato (Simul8):** esteiras podem ser "Accumulating" ou "Fixed". Sem acumular, quando o primeiro item chega à frente e não sai, "todos os outros itens na esteira também param". Quantos itens cabem depende do comprimento da esteira e do tamanho do item (rótulo reservado "Length"). Velocidade e comprimento determinam o tempo do início ao fim, "supondo que nenhum outro item bloqueie o progresso" — [Simul8 Help, Conveyors](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/conveyors/)
- **Fato secundário (ProModel):** tempo de movimento = (comprimento da esteira − comprimento da entidade) / velocidade. Esteiras não acumuladoras param inteiras quando a entidade da frente para — resumo da busca de [ProModel Help, C-05 Conveyors](https://promodel.com/onlinehelp/ProModel/80/C-05%20-%20Conveyors.htm)
- **Fato secundário (AnyLogic):** a esteira não acumuladora para quando o primeiro agente não pode avançar, o que mantém o espaçamento — resumo da busca de [AnyLogic Help, Conveyor](https://anylogic.help/library-reference-guides/process-modeling-library/conveyor.html)
- **Fato secundário (FlexSim):** o estado "blocked" só se aplica a esteiras não acumuladoras: um item parado bloqueia a esteira inteira — [FlexSim Answers, straight and curved conveyors](https://flexsim.cloud.answerhub.com/articles/23513/straight-and-curved-conveyors.html) (página da comunidade, não o manual)
- **Fato (Plant Simulation):** esteiras e linhas também podem falhar. Para elas, o "tempo de processamento" é o tempo em que a velocidade não é zero, transportando ou vazias — [Tutorial Plant Simulation 2404, seção 7.7](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)

### Inferences
- Opções para a esteira do MVP (grade sem distâncias reais, PDR-0007):
  - **(A) Atraso fixo com capacidade, acumuladora, FIFO:** cada peça leva `transitSec` desde a entrada. A capacidade é `capacity` peças. A peça que chega ao fim e não pode sair fica na esteira, e as de trás continuam até encostar. Pela regra FIFO, ela só sai depois da anterior. Modelo didático mais simples. **Palpite:** é o mais comum em ferramentas didáticas, mas não achei fonte que diga isso.
  - **(B) Comprimento e velocidade** (`lengthM`, `speedMPerSec`, capacidade = comprimento / tamanho da peça): é o modelo das ferramentas comerciais, mas exige tamanho de peça e distâncias reais, que o MVP deixou de fora.
  - **(C) Não acumuladora:** fiel para transferidores sincronizados, porém mais difícil de explicar.
- **Inferência:** em (A), com a grade, o comprimento pode vir do número de células, mas isso amarra o comportamento à posição, e o modelo da planta separa as duas coisas ("Posição separada do comportamento"). Manter `transitSec` como parâmetro respeita essa regra.
- **Inferência:** a esteira acumuladora com capacidade se comporta como um buffer com tempo mínimo de permanência. O Buffer do Plant Simulation tem exatamente um "dwell time" e uma capacidade (tutorial, seção 3.4).

### Gaps
- Manual oficial do FlexSim e do Arena (Conveyor/Transfer, Station) sobre a fórmula do tempo: não lido.
- Nenhuma fonte encontrada sobre qual modelo de esteira é o mais usado no ensino.

## 4. Falhas: dependentes do tempo (calendário) × dependentes da operação (tempo ocupado); recomendação de Law; preemptivas × não preemptivas (Hopp e Spearman); destino da peça; efeito na disponibilidade medida

### Takeaway
As ferramentas oferecem as duas bases. O padrão do Simul8 e o exemplo do tutorial do Plant Simulation usam o relógio (tempo de simulação). O Simul8 conta desde o fim do último reparo. As alternativas são o tempo ocupado ("Only Count Busy Time", "processing time"), o tempo operacional e as falhas por ciclos. Nos modelos analíticos de linha, a suposição usual é a falha dependente da operação, com MTTF medido em tempo de trabalho. A escolha muda a disponibilidade medida. Contando pelo relógio desde o fim do reparo, A = MTBF/(MTBF+MTTR) vale para qualquer carga. Contando pelo tempo ocupado, a fração parada cai com a utilização, e a fórmula só vale para uma estação sempre ocupada.

### Cited Findings
- **Fato (Simul8):** "O padrão no Simul8 é quebrar uma Activity com base no tempo decorrido desde o fim do reparo da quebra anterior", então "máquinas podem quebrar mesmo sem estar trabalhando". "Only Count Busy Time" restringe a contagem ao tempo em funcionamento. MCBF conta ciclos (itens processados) entre o fim de um reparo e a próxima quebra. Com eficiência automática, o Simul8 usa exponencial para o MTBF e Erlang-2 para o reparo — [Simul8 Help, Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/)
- **Fato (Simul8, peça em processo):** as opções "stop work immediately" e "close feeding Queues" controlam a quebra. Desligar "stop work immediately" deixa a Activity terminar o que já tem; não podem ficar as duas desligadas — [Simul8 Help, Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/). A página não diz se a peça interrompida retoma ou recomeça.
- **Fato (Plant Simulation):** a falha pode ser relativa a "SimulationTime", "operating time" (tempo em que o objeto está operacional, interrompido por pausas e falhas) ou "processing time" (tempo em que o objeto realmente processa uma MU). Dada só a disponibilidade e o MTTR, o Plant Simulation usa exponencial para os intervalos e Erlang para a duração. No exemplo, com disponibilidade de 75% e MTTR de 2 min, o intervalo tem β = 6 min, coerente com A = 6/(6+2) — [Tutorial Plant Simulation 2404, seção 7.7](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- **Fato secundário (ProModel):** "clock downtimes" usam o tempo total decorrido (operação, bloqueio e ocioso); "usage downtimes" usam o tempo em uso, sem o ocioso, e só existem para locais de capacidade 1 — resumo da busca de [ProModel Help, Usage Downtime Editor](https://promodel.com/onlinehelp/ProModel/80/C-05%20-%20Usage%20Downtime%20Editor.htm) (a página redirecionou e não foi lida)
- **Fato secundário (literatura de linhas):** falhas dependentes da operação (ODF) só ocorrem quando a máquina processa uma peça, e o MTTF é medido em tempo de trabalho. Falhas dependentes do tempo (TDF) podem ocorrer com a máquina parada. Modelar uma máquina ODF como TDF subestima a vazão, sob certas hipóteses exponenciais — resumo da busca de [MIT 2.852](https://mitocw.ups.edu.ec/courses/mechanical-engineering/2-852-manufacturing-systems-analysis-spring-2010/lecture-notes/MIT2_852S10_transfer_lines.pdf) e de [Matta e Simone, IJPR 2016 (ideas.repec)](https://ideas.repec.org/a/taf/tprsxx/v54y2016i6p1850-1862.html) / [Polimi](https://re.public.polimi.it/handle/11311/1016957)
- **Fato secundário (Hopp e Spearman):** **paradas preemptivas** são paradas não programadas que podem ocorrer no meio de um trabalho, como as quebras. **Paradas não preemptivas** acontecem inevitavelmente, mas o momento é controlável e costuma cair entre trabalhos; o exemplo típico é o setup. Disponibilidade A = m_f/(m_f + m_r), tempo efetivo t_e = t_0/A, taxa efetiva r_e = A·r_0 — resumo da busca de materiais de curso do *Factory Physics* ([StudySmart](https://studysmart.ai/en/summaries/factory-physics-hopp/machine-process-0-5); [Scribd, cap. 8](https://www.scribd.com/document/561264074/Chapter08)), não do livro
- **Fato (Roser et al. 2001):** "em reparo" e "trocando ferramenta" são estados **ativos**; esperando peça e bloqueado são **inativos** — [Roser, Nakano, Tanaka, WSC 2001](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)

### Inferences
- Opções para a base da falha (pendência do sub-plano 3):
  - **(A) Relógio, contando desde o fim do reparo** (padrão do Simul8; "SimulationTime" do Plant Simulation; "clock" do ProModel). A disponibilidade medida = MTBF/(MTBF+MTTR) **independe da carga**, então o caso de validação 240/255 = 94,1% fecha em qualquer estação. Mas uma estação ociosa "quebra" sem trabalhar.
  - **(B) Tempo ocupado** ("Only Count Busy Time", "processing time", "usage"; ODF na literatura analítica). É mais realista para desgaste. A fração de tempo parada ≈ u·MTTR/MTBF (inferência minha por renovação, onde u é a fração do tempo em processamento), então a disponibilidade medida é maior que 240/255 em estações não saturadas. O caso de validação só fecha numa estação sempre ocupada (gargalo com fila infinita), ou se a disponibilidade for medida sobre o tempo ocupado mais o reparo.
  - **(C) Tempo operacional** (Plant Simulation: tempo "ligado", sem pausas). Sem turnos no MVP, equivale a (A).
- **Mais comum:** nas ferramentas verificadas, o padrão é o relógio (A). Na teoria de linhas, o usual é a falha dependente da operação (B).
- **Inferência sobre o MTBF:** o 240/255 de simulation.md supõe que o "MTBF" é o tempo de funcionamento entre o fim de um reparo e a próxima falha (no rigor, MTTF), como no Simul8. Se o MTBF for medido de início a início de falha, A = (MTBF − MTTR)/MTBF = 225/240 = 93,75%. O esquema deve documentar qual é.
- **Destino da peça em processo:** o mais comum é **retomar** (preempt-resume): a peça fica na máquina e o tempo restante continua depois do reparo. **Lembrança não verificada:** é o padrão do Arena (regra "Preempt"/"Wait" da falha) e da maioria das ferramentas. Recomeçar ou refugar a peça são variantes. Não achei fonte aberta que confirme o padrão de cada ferramenta.
- **Lembrança não verificada (Law):** em *Simulation Modeling and Analysis* (cap. 14, manufatura), Law alerta que modelar quebras em tempo de calendário quando o dado veio de tempo de operação (ou o contrário) distorce a disponibilidade, e recomenda basear as quebras no tempo ocupado quando a máquina fica ociosa com frequência. Precisa ser conferido no livro antes de virar referência.

### Gaps
- Texto do Law (5ª ed.) e dos tutoriais WSC de Law e McComas sobre "busy time vs calendar time": não encontrei cópia aberta.
- Comportamento padrão do Arena, FlexSim e AnyLogic para a peça em processo durante a falha (retomar × recomeçar): não verificado.

## 5. OEE: Nakajima e ISO 22400-2; tempo planejado numa simulação sem paradas planejadas; retrabalho na qualidade

### Takeaway
Pelas fontes secundárias, a ISO 22400-2 define OEE = disponibilidade × eficácia ("effectiveness", o que se costuma chamar de desempenho) × taxa de qualidade. Disponibilidade = tempo real de produção (APT) / tempo planejado ocupado (PBT). Eficácia = tempo de processamento planejado por unidade × quantidade produzida / APT. Qualidade = quantidade boa / quantidade produzida. Sem turnos nem paradas planejadas no MVP, o PBT é a duração da janela medida. Ficam em aberto: em qual perda entram os tempos faminto e bloqueado, qual "ciclo ideal" usar com tempo aleatório, e onde entra o retrabalho.

### Cited Findings
- **Fato secundário (ISO 22400-2 via fornecedores):** OEE = Availability × Effectiveness × Quality ratio. Availability = APT/PBT. Performance/Effectiveness = (PRI × PQ)/APT, onde PRI é o tempo planejado de processamento por unidade e PQ a quantidade produzida. Quality = GQ/PQ — [TeepTrak, "How to calculate OEE (2026)"](https://teeptrak.com/en/how-to-calculate-oee-industrial-production-2026/); [TeepTrak, "Availability, Performance, Quality"](https://teeptrak.com/en/availability-performance-quality/)
- **Fato secundário (MES):** Availability = Run Time / Planned Busy Time. Planned Busy Time = tempo de operação planejado menos paradas planejadas. Tempo de operação planejado = tempo total menos tempo excluído, como os períodos sem turno — [Infor MES docs](https://docs.infor.com/mes/2026.x/en-us/mesuaal/production_overview/beg1725387088865.html)
- **Conflito entre fontes:** a TeepTrak trata o setup como perda de disponibilidade, que não sai do denominador. A Infor exclui as paradas planejadas do tempo planejado ocupado — [TeepTrak](https://teeptrak.com/en/oee-formula-step-by-step-calculator-2026/); [Infor](https://docs.infor.com/mes/2026.x/en-us/mesuaal/production_overview/beg1725387088865.html). Sem setup no MVP, o conflito não afeta o Takt.
- **Fato secundário (peças defeituosas):** segundo a TeepTrak, na leitura normativa da ISO 22400-2:2014 as peças defeituosas contam na quantidade produzida, o que reduz a qualidade e entra no ritmo (eficácia) — [TeepTrak](https://teeptrak.com/en/how-to-calculate-oee-industrial-production-2026/). Não verifiquei na norma.
- **Fato (indicadores atuais do Takt):** OEE = D × P × Q, com disponibilidade = tempo produzindo / tempo planejado, desempenho = ritmo real / ritmo ideal e qualidade = boas / total — [simulation.md, "Indicadores do MVP"](../../../product/simulation.md)

### Inferences
- **Tempo planejado sem turnos:** a escolha natural é PBT = duração da janela de estatística (turno inteiro no modo turno; duração menos aquecimento no regime estável). **Palpite:** é o que fazem ferramentas e textos didáticos de simulação, mas não achei fonte explícita.
- **Faminto e bloqueado: em qual fator entram?** Pela ISO, só o APT (tempo realmente produzindo) está no numerador da disponibilidade, então faminto e bloqueado viram perda de disponibilidade. Opções:
  - **(A)** Disponibilidade = tempo processando / tempo planejado. Faminto, bloqueado e falha reduzem D, e P fica ≈ 1 com tempo fixo. Bate com o texto atual ("tempo produzindo"), mas o OEE de uma estação não gargalo cai por falta de peça, não por culpa dela.
  - **(B)** Disponibilidade = (tempo planejado − tempo em falha) / tempo planejado, e faminto e bloqueado vão para o desempenho, como "pequenas paradas"/"ociosidade" na visão de Nakajima (lembrança não verificada). Assim, D bate com MTBF/(MTBF+MTTR) no caso de validação, que é o que a história do demo mostra ("ligar falhas e ver o OEE cair").
  - **Inferência:** o caso de validação "disponibilidade ≈ 94,1%" só fecha com (B), ou com (A) numa estação sempre ocupada.
- **Ciclo ideal com tempo aleatório:** opções: média da distribuição, mínimo (`minSec` da triangular, ou o valor fixo) ou um campo próprio `idealCycleSec`. Com a média, o desempenho fica ≈ 1 em regime, e a variabilidade não aparece como perda. **Palpite:** a média é o mais simples de explicar, mas precisa de decisão.
- **Retrabalho:** o mais comum na prática de OEE é contar como "boa" só a peça boa de primeira; o retrabalho é perda de qualidade (lembrança não verificada; Nakajima classifica "defeitos e retrabalho" como uma das seis grandes perdas). Opções para o Takt, por estação: Q = boas de primeira passagem / total processado (o retrabalho conta contra); ou Q = (total − refugo) / total (o retrabalho recuperado conta como bom). A primeira é coerente com a ISO, que separa quantidade boa e quantidade de retrabalho (lembrança não verificada; conferir na norma).

### Gaps
- Texto normativo da ISO 22400-2:2014 (pago) e o livro de Nakajima (1988): não acessados. Todas as fórmulas acima vêm de fornecedores.
- Nenhuma fonte encontrada sobre OEE calculado em simulação de eventos discretos sem paradas planejadas.

## 6. Detecção do gargalo: maior utilização, período ativo (Roser et al.), fila à frente; robustez; quando a maior utilização erra

### Takeaway
Roser, Nakano e Tanaka (2001) descrevem os dois métodos usuais, a maior espera à frente e a maior carga (fração do tempo ativo), e apontam as falhas de cada um. Na espera, os buffers finitos atrapalham, e a espera tende ao infinito antes do gargalo e a zero depois dele. Na carga, máquinas com cargas parecidas ficam indistinguíveis pelo erro estatístico. Eles propõem o período ativo médio: o gargalo é a máquina com o maior período ativo médio sem interrupção. Para uma ferramenta didática, a maior fração ativa é simples. Mas, com bloqueio, falhas e cargas próximas, ela precisa de intervalo de confiança e de um critério de empate ou de confirmação.

### Cited Findings
- **Fato:** "há dois métodos usados com frequência para detectar o gargalo: medindo o tempo de espera na frente de uma máquina ou a carga, representada pela porcentagem do tempo em que uma máquina está ativa (Law e Kelton 1991)" — [Roser, Nakano, Tanaka, WSC 2001](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)
- **Fato (crítica à espera):** a precisão "fica comprometida se o sistema tem buffers de tamanho limitado". O método só olha máquinas de processamento. "A espera em todos os buffers antes do gargalo tende ao infinito, enquanto todos os buffers depois do gargalo tendem a zero" — [mesmo artigo](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)
- **Fato (crítica à carga):** "mais de uma máquina pode ter porcentagem de atividade parecida", e por causa da variação aleatória "muitas vezes não se pode dizer com confiança qual é o gargalo". No exemplo, M2 = 97% e M4 = 99% de atividade, com intervalos de confiança sobrepostos e 13,4% de chance de o gargalo ser M2 — [mesmo artigo](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)
- **Fato (método):** os estados se dividem em ativos e inativos. Inativo é esperar a chegada de uma peça ou serviço, ou esperar a retirada de uma peça (bloqueado). Ativo é todo o resto, "inclusive reparo e serviço". Estados ativos consecutivos formam um só período ativo. A máquina com o maior período ativo médio é o gargalo. Os autores afirmam que as durações são aproximadamente independentes, o que permite um intervalo de confiança direto. Só é preciso o log de mudanças de estado — [mesmo artigo](https://www.allaboutlean.com/wp-content/uploads/2014/05/2001_Roser_WSC-A-Practical-Bottleneck-Detection-Method_Preprint.pdf)
- **Fato (extensão):** o método do gargalo que se desloca ("shifting bottleneck", WSC 2002, pp. 1079–1086, DOI 10.1109/wsc.2002.1166360) acompanha no tempo os gargalos primário e secundário — [AllAboutLean, preprint 2002](https://www.allaboutlean.com/publications/2002_roser_iss-detecting-shifting-bottlenecks_preprint/) (resumo; texto completo não lido)
- **Fato (critério atual do Takt):** "a estação de maior utilização, confirmada pela fila acumulada à frente dela" — [simulation.md](../../../product/simulation.md)

### Inferences
- **Quando a maior utilização erra (pelas fontes acima):** (1) com cargas parecidas, o ruído decide; (2) se a "utilização" contar só o tempo processando, uma máquina que falha muito pode ser o gargalo com utilização menor que outra (Roser conta o reparo como ativo); (3) se "ativo" incluir bloqueado, as máquinas antes do gargalo parecem mais carregadas. A terceira é inferência minha a partir da classificação de Roser, que trata bloqueado como inativo.
- **Quando a "fila à frente" erra:** com buffers finitos (as filas antes do gargalo enchem todas) e, com fila implícita ilimitada, na estação logo depois de uma fonte rápida.
- **Opções para o Takt:**
  - **(A)** Maior fração ativa (processando + em falha), com intervalo de confiança entre replicações. Simples e já é o texto atual, com "ativo" definido como em Roser.
  - **(B)** Período ativo médio (Roser 2001): mais robusto com bloqueio e falhas, quase tão simples (só precisa do log de estados, que o motor já gera), mas menos conhecido dos alunos.
  - **(C)** (A) com confirmação pela fila: é o texto atual, mas a confirmação falha com buffers finitos, segundo Roser.
- **Palpite:** para ensino, (A) definido como "processando + em falha", com o intervalo de confiança exibido e um aviso de "gargalo indefinido" quando os intervalos dos dois primeiros se sobrepõem, cobre o caso que Roser critica sem trocar o conceito que os livros ensinam.

### Gaps
- Definição literal de gargalo em Hopp e Spearman (lembrança não verificada: "a estação com a maior utilização de longo prazo"), sem cópia aberta.
- Comparações independentes de robustez (por exemplo, Lima et al. 2008 ou Subramaniyan et al.) não lidas; só apareceu o resumo de [Subramaniyan et al., IJDNE](https://www.iieta.org/journals/ijdne/paper/10.2495/DNE-V11-N3-428-437).

## 7. Regras de roteamento: por qualidade, por percentual, fila mais curta e desempate

### Takeaway
As ferramentas oferecem roteamento por percentual (probabilístico), por prioridade (primeiro da lista não bloqueado) e por fila mais curta. O Simul8 documenta a fila mais curta só como "envia para a fila mais curta", sem dizer como desempata. Não achei fonte que fixe uma convenção de desempate. As opções práticas são a ordem da lista, a ordem dos IDs, o sorteio com a semente ou o rodízio.

### Cited Findings
- **Fato secundário (Simul8):** "Shortest Queue: envia os itens para a fila mais curta". "Priority: envia todos os itens para o primeiro destino da lista, a menos que esteja bloqueado; então tenta o 2º, e assim por diante" — resumo da busca de [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/). O desempate da fila mais curta não está documentado ali.
- **Fato (Simul8, refugo):** a eficiência trata de quebras, não de perda de produto. O refugo deve ser modelado no Routing Out — [Simul8 Help, Efficiency](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/efficiency/). É o mesmo desenho do Takt (`routing` por qualidade na saída).
- **Fato (regras do Takt):** por percentual, os percentuais somam 100% (RN-SIM-005). Limite de retrabalho com padrão 3 (RN-SIM-006). O desempate da fila mais curta está pendente (code-style seção 7; sub-plano 5) — [rules/simulation.md](../../../product/rules/simulation.md); [roteiro do motor](../../../plans/2026-11-04-roteiro-motor.md)

### Inferences
- Opções de desempate da fila mais curta, todas determinísticas com semente fixa:
  - **(A) Ordem da lista de destinos da regra** (como o Priority do Simul8): simples, explicável ("empate vai para o primeiro da lista") e independente do gerador, mas enviesa sistematicamente o primeiro destino.
  - **(B) Menor `id` em ordem lexicográfica:** determinística e independente da ordem no JSON, mas um renomeio muda o resultado.
  - **(C) Sorteio uniforme entre os empatados, com uma sequência própria do elemento** (números aleatórios comuns, RN-SIM-010): sem viés, mas consome números aleatórios e precisa de uma sequência dedicada para não perturbar as outras.
  - **(D) Rodízio entre os empatados:** sem viés e sem gerador; guarda estado por elemento.
- **Inferência:** a definição de "fila" precisa ser fixada junto. Pode ser só a fila de espera, ou fila + em processo (a "carga" do destino). Com estações sem fila implícita (opção B da seção 1), "fila" só existe nos buffers. **Lembrança não verificada:** na teoria de filas, "join-the-shortest-queue" conta o número no sistema (fila + em serviço) e desempata ao acaso.
- **Roteamento por percentual:** as duas variantes comuns são o sorteio independente por peça (probabilístico) e o determinístico por proporção acumulada (um ciclo 70/30 exato). **Palpite:** o sorteio é o padrão das ferramentas ("Percent" no Simul8); não verificado nesta rodada.
- **Destino cheio e roteamento:** se o destino escolhido está cheio, a peça espera por ele (bloqueia) ou tenta o próximo? O Priority do Simul8 tenta o próximo, mas na fila mais curta e no percentual o comportamento não está documentado. Precisa de decisão.

### Gaps
- Convenção de desempate em Simul8, Arena (PickQ/"Smallest Number in Queue"), FlexSim ("Send to Shortest Queue") e AnyLogic: não encontrei documentação. **Lembrança não verificada:** as regras do tipo "smallest" do Arena desempatam pelo primeiro da lista.
- Nenhuma fonte acadêmica lida sobre a convenção de desempate do JSQ em simulação.
