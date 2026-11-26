# Fila, capacidade e bloqueio em fontes e estações (ferramentas de simulação e literatura)

Notas de pesquisa para validar o modelo v1 do Takt: (a) estação com capacidade 1 e bloqueio após o serviço (BAS), com estado "blocked" distinto de "starved"; (b) espera entre estações só em buffers finitos explícitos; (c) fonte com fila de saída visível e finita, que bloqueia (para de gerar) quando cheia, em vez de perder chegadas; (d) caso de validação M/M/1 aproximado com fila da fonte de 1000.

Rótulos: [Fato] fonte primária (manual oficial, artigo); [Fato secundário] tutorial universitário, fórum, trecho de busca ou fonte que cita outra; [Estimativa] cálculo ou raciocínio meu, com a hipótese declarada; [Palpite] sem base publicada.

Limites desta coleta: anylogic.help devolveu HTTP 403 a todas as buscas diretas; a cópia do DSpace do MIT (Dallery e Gershwin) devolveu HTTP 429 (firewall); a documentação da FlexSim migrou para help.autodesk.com e a página do Source deu 404. Os trechos dessas fontes que aparecem abaixo vieram de resumos do buscador e não foram lidos na página. Por isso vão marcados como [Fato secundário] e precisam ser conferidos antes de entrar num PDR ou ADR.

## 1. Estação/servidor: fila implícita, capacidade padrão e o que acontece quando o sucessor está cheio

### Takeaway
Plant Simulation, a referência mais próxima do modelo do Takt, usa uma estação de capacidade 1 sem fila implícita, e a peça que não consegue sair fica na estação em estado "blocked" (BAS de fato). Simio e AnyLogic também param o fluxo quando o sucessor está cheio, mas Simio dá ao Server buffers de entrada e saída, e Arena cria por padrão uma fila diante do recurso. Não encontrei a capacidade padrão nas fontes oficiais de nenhuma das três.

### Cited Findings
- [Fato secundário] Plant Simulation: o objeto Station (antigo SingleProc) "receives a MU, retains it during the processing time and then attempts to pass it on. For example, a machine with capacity 1." O ParallelStation é "a machine with capacity > 1". (Tutorial Plant Simulation 2404 da Universidade de Twente, M. Mes, seção sobre objetos básicos, p. ~12.) — [U. Twente, Tutorial Plant Simulation 2404 v20250502](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Plant Simulation, estados: "Static objects: blocked, failed, recovering, operational, paused, setting-up, working, waiting". "blocked" e "waiting" são, portanto, estados distintos, como "blocked" e "starved" no Takt. — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Plant Simulation, como o bloqueio funciona (o "push-block theorem"): "If the successor cannot receive the part at the moment, the blocking principle is activated, guaranteeing that the object ready to move a MU is re-activated as soon the successor is ready to receive the part." Também: "The push-block theorem ensures that parts are passed on using the basic functionality of objects and that the stream of events is not interrupted by blockages, failures or pauses." Num exemplo, a peça fica no objeto e o bloqueia: "the Pallet with an Engine on it will stay in the PartOnPallet and block incoming MUs". — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Plant Simulation, capacidade de buffers e armazéns: "The capacity of these objects can be adjusted in their settings dialog window. It is possible to set the capacity to infinity: if you enter -1 as capacity, your storage object has infinite capacity." Nos exercícios, a capacidade do Buffer é sempre ajustada explicitamente (ex.: "set its capacity to 4", "set its capacity to infinity"). O tutorial não diz o valor padrão. — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Plant Simulation 14 mudou a contabilidade de peças bloqueadas: "Blocked MUs are now always counted as waiting", qualquer que seja o estado do recurso. — [Siemens, Changed Features of the Material Flow Objects (help 15.1)](https://docs.plm.automation.siemens.com/content/plant_sim_help/15.1/plant_sim_all_in_one_html/en_US/tecnomatix_plant_simulation_help/whats_new/whats_new_in_tecnomatix_plant_simulation_14/changed_features_of_the_material_flow_objects.html) (citação obtida via resumo do buscador; a página não foi aberta.)
- [Fato secundário] Simio Server: "When no capacity of the processing station is available and an InputBuffer exits (i.e., Input Buffer capacity is greater than zero), then the entities wait in the InputBuffer". Ou seja, o Server tem um buffer de entrada embutido, cuja capacidade pode ser zero. — [Simio textbook, Workbook 6ª ed., DMV](https://textbook.simio.com/Workbook6/working-with-flow-and-capacity-the-dmv.html) (via resumo do buscador)
- [Fato secundário] Simio, comportamento padrão com buffer cheio: com o Balk Decision Type, a entidade que chega a um buffer cheio vai para Input@Balks "rather than blocking on the network (the default behavior)". O padrão é bloquear, não perder a entidade. — [Simio and Simulation 7ª ed., cap. 10](https://textbook.simio.com/SASMAA7/ch-misc-modeling-topics.html) (via resumo do buscador)
- [Fato secundário] Simio, linha acoplada: para modelar BAS puro entre dois Servers, liga-se Server1 a Server2 por um Connector, com o OutputBuffer de Server1 e o InputBuffer de Server2 em capacidade 0; "Beyond that Server1 will be blocked and additional entities will wait in Server1 Input Buffer". — [Fórum Simio, tópico 1107](https://forum.simio.com/topic/1107-queuing-at-server1-when-server2-is-busy/) (via resumo do buscador; fórum de usuários)
- [Fato secundário] AnyLogic: por padrão, o fluxo entre blocos é "pull": "flowchart blocks will stop and wait until the next blocks are ready". A opção Forced pushing muda para "push", em que os agentes "are instantly pushed further regardless the state of the succeeding block". — [AnyLogic Help, Agent flow](https://anylogic.help/library-reference-guides/process-modeling-library/agent-flow.html); [AnyLogic Help, Wait](https://www.anylogic.help/library-reference-guides/process-modeling-library/wait.html) (via resumo do buscador; as páginas devolveram 403)
- [Fato secundário] Arena: no Process com a ação Seize Delay Release, o módulo "automatically defines a QUEUE that holds the entities that are waiting for the resource". A fila é implícita. — [Rossetti, Simulation Modeling and Arena (livro online)](https://rossetti.github.io/RossettiArenaBook/ch2-howArenaWorks.html) (via resumo do buscador; quando baixei essa página, a frase não apareceu nela e deve estar em outro capítulo)

### Inferences
- [Estimativa] A estação do Takt (capacidade 1, sem fila implícita, peça pronta parada na máquina quando o sucessor está cheio, estado "blocked" separado de "waiting/starved") coincide com o Station do Plant Simulation e com o Server do Simio com os dois buffers em 0. O comportamento descrito é BAS: a peça termina o processamento e só então tenta sair.
- [Estimativa] Arena, Simio (com buffers padrão) e AnyLogic (Service) põem uma fila junto ao servidor. Num simulador de fábrica didático, pôr a espera só em buffers explícitos é uma escolha de modelagem. Ela torna o WIP visível e editável e é defensável, mas as ferramentas de fila não fazem assim por padrão.

### Gaps
- Capacidade padrão do InputBuffer e do OutputBuffer do Simio Server: não confirmada em fonte oficial (minha memória diz "Infinity", mas não verifiquei).
- AnyLogic Service: se tem Queue embutida, qual a capacidade padrão e se o agente que termina o delay fica preso no bloco: a página devolveu 403 e não foi verificada.
- FlexSim Processor e Queue: capacidade padrão e bloqueio não verificados (a documentação migrou para help.autodesk.com e a página deu 404).
- Arena: capacidade da fila do Process (infinita?) e se existe bloqueio nativo: não confirmei em fonte publicada.
- Simul8 Activity: capacidade e fila implícita não verificadas.
- Não achei manual oficial da Siemens que diga em palavras se o Station bloqueia antes ou depois do serviço. O tutorial de Twente só descreve o comportamento.

## 2. Fonte/chegada que não consegue liberar a peça: bloquear, segurar uma peça, enfileirar ou perder (balk)

### Takeaway
As ferramentas divergem. O Start Point do Simul8 descarta a chegada como "Lost". O Source do Plant Simulation segura a peça bloqueada e não cria outra enquanto ela estiver lá; o tutorial de Twente diz que, "na maioria dos casos", isso produz um modelo inválido. O Source do AnyLogic, por padrão, não deixa agentes esperarem na saída, e é preciso escolher o que fazer com eles. O Simio bloqueia por padrão. Quando uma fonte bloqueada para de gerar, o processo de chegada muda, e o tutorial de Twente trata isso como erro de modelagem salvo quando é intencional.

### Cited Findings
- [Fato] Simul8 Start Point: se o Work Item "cannot immediately proceed from the Start Point to the next object on the screen", "it will be classed as Lost and will not enter the simulation". E: "A warning will be given when this happens unless you have switched off these warnings." O padrão é perder a chegada (balk), não bloquear. — [Simul8 Help, Start Points](https://support.minitab.com/en-us/simul8/help-and-how-to/simulation-key-concepts/simulation-objects/start-points/)
- [Fato] Simul8: "Constraining arrivals" só limita a quantidade ou a duração das chegadas ("Once the simulation time reaches this number, the Start Point will stop generating arrivals"); não é bloqueio. — [Simul8 Help, Constraining Arrivals](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/arrivals-start-point/constraining-arrivals/)
- [Fato secundário] Plant Simulation Source: "The source creates MUs and attempts to pass them on." Quando a saída está ocupada: "The yellow icon indicates that the MU is currently blocked, because it cannot move further in the model. [...] Note that no new MUs are created when a blocked MU occupies the Source. This might be desired behaviour, e.g., for modelling a queueing system where MUs decide not to enter the system when the queue is too long. In most cases, however, this behaviour leads to an invalid model!" (p. ~25). — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Plant Simulation, o atributo "Blocking" do Operating mode do Source, num exemplo com turnos: "with Blocking checked, patients also arrive outside the shifts, but will be kept on the Source until the start of the shift". Noutro exemplo: "When enabling Blocking under the Attributes tab of the PartSource, the source will generate Engines at all times and buffer them till the start of a shift". Em outro exercício o tutorial manda desmarcar: "At the Operating mode, uncheck Blocking". O tutorial não diz em palavras o que acontece com o Blocking desmarcado. — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Plant Simulation: para não bloquear a fonte, o tutorial põe logo depois dela uma sala de espera de capacidade infinita: "Set the WaitingRoom capacity to unlimited (-1)"; "a waiting room with infinite capacity". — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] AnyLogic Source: "By default, Source does not allow the agents to wait at its output port until they can be consumed by the next block". Para mudar, deve-se "clearing the Forced pushing advanced option and selecting the required behavior from the Agents which can't exit list". — [AnyLogic Help, Source](https://anylogic.help/library-reference-guides/process-modeling-library/source.html) (via resumo do buscador; a página devolveu 403. Não verifiquei as opções da lista "Agents which can't exit"; pela minha memória são algo como "can wait"/"are destroyed", ainda a confirmar)
- [Fato secundário] Simio: uma fonte com OutputBuffer 0 e a regra de destino bloqueado "Select Available Only" faz as entidades extras esperarem na fonte; "All entities created after the first two wait until one of the Servers has finished processing". Nesse caso a fonte continua criando e as entidades se acumulam nela. — [Fórum Simio, tópico 3145](https://forum.simio.com/topic/3145-waiting-on-the-path-if-there-is-no-seat-in-input-buffer/) (via resumo do buscador; fórum de usuários)
- [Fato secundário] Simio: o padrão diante de buffer cheio é "blocking on the network (the default behavior)", e a alternativa explícita é o balking. — [Simio and Simulation 7ª ed., cap. 10](https://textbook.simio.com/SASMAA7/ch-misc-modeling-topics.html) (via resumo do buscador)

### Inferences
- [Estimativa] Há três famílias de comportamento: (1) perder a chegada (Simul8 por padrão; M/M/1/K clássico); (2) a fonte segura uma peça e para de gerar (Plant Simulation com a saída ocupada); (3) a fonte cria e acumula, numa fila de saída da fonte (Simio com OutputBuffer, AnyLogic com "agents can wait"). A escolha (c) do Takt, uma fila de saída finita visível que, cheia, para a geração, combina (3) com (2): a peça excedente nunca é criada, nem perdida.
- [Estimativa] O alerta do tutorial de Twente ("In most cases [...] leads to an invalid model!") vale contra a escolha (c) quando a capacidade da fila é pequena: a fonte bloqueada deixa de representar a demanda externa, a taxa de chegada efetiva cai e a linha parece mais eficiente do que é. Isso apoia (i) exibir com destaque o estado "blocked" da fonte e as chegadas suprimidas e (ii) uma capacidade padrão grande para a fila da fonte.
- [Estimativa] Se a fonte para de gerar, o relógio entre chegadas precisa de regra explícita: (A) pausa o relógio e retoma ao abrir vaga, ou (B) segura a próxima peça já gerada e só sorteia o intervalo seguinte quando ela sai. Com chegadas exponenciais (sem memória), as duas regras dão a mesma cadeia de Markov nos estados não cheios. Com outras distribuições (por exemplo, determinística), dão resultados diferentes. O modelo v1 precisa escolher e documentar uma.

### Gaps
- Nenhuma fonte verificada diz se o relógio entre chegadas pausa durante o bloqueio da fonte, nem no Plant Simulation (o tutorial só diz que "no new MUs are created"), nem no AnyLogic, FlexSim ou Simio.
- Arena Create: não verifiquei o que acontece quando não há espaço (pela minha memória, a entidade sempre entra numa fila de capacidade infinita, mas sem fonte).
- FlexSim Source: não verificado (documentação indisponível). Pela minha memória, o Source espera a peça sair antes de gerar a próxima; [Palpite] até conferir.
- Valor padrão do atributo "Blocking" do Source no Plant Simulation: não confirmado em fonte oficial.

## 3. Literatura: tipos de bloqueio (BAS/BBS) e qual é o padrão em linhas de produção

### Takeaway
Não consegui ler o texto de Dallery e Gershwin (1992): o DSpace devolveu 429 duas vezes. Confirmei a citação e o resumo. As definições exatas de BAS/BBS e a afirmação sobre qual é a convenção usual em linhas de produção continuam sem citação literal.

### Cited Findings
- [Fato] Citação: Dallery, Y.; Gershwin, S. B. "Manufacturing Flow Line Systems: a Review of Models and Analytical Results". *Queueing Systems* 12(1–2), mar. 1992, p. 3–94. Do resumo: "The most important models and results of the manufacturing flow line literature are described."; "The exact methods are appropriate for small systems."; "The approximate methods, which are the only means available for large systems, are generally based on decomposition". — [MIT DSpace 1721.1/95914](https://dspace.mit.edu/handle/1721.1/95914); [Springer](https://link.springer.com/article/10.1007/BF01158636)
- [Fato secundário] Uma enciclopédia de pesquisa operacional da Springer descreve uma máquina "blocked" quando, "on completion of its work on a part it cannot deliver the part to the next machine", e o caso oposto, a falta de peças vinda de montante ("starvation"). Essa definição é a de bloqueio após o serviço. — [Springer, Encyclopedia of OR/MS, verbete de linhas de produção](https://link.springer.com/referenceworkentry/10.1007/1-4020-0612-8_94) (via resumo do buscador; página não aberta)
- [Fato secundário, não verificado] Resumo do buscador: textos que citam o survey chamariam o BAS de "type 1 blocking" e o BBS de "type 2 blocking"; os métodos analíticos do survey se concentrariam em linhas BAS; e o modelo clássico de duas máquinas de Gershwin e Berman (1981) usaria BBS. O buscador não mostrou as frases originais. — [Busca; cópia aberta indicada: dallery-gershwin-survey92.pdf](http://dspace.mit.edu/bitstream/handle/1721.1/95914/dallery-gershwin-survey92.pdf;sequence=1)

### Inferences
- [Estimativa] A definição da enciclopédia Springer e o comportamento do Plant Simulation (a peça processada fica na máquina até o sucessor liberar) são BAS. Isso sustenta que BAS é o comportamento esperado de uma "máquina" num simulador de fábrica. A afirmação de que BAS é "o padrão" na literatura de linhas de produção, porém, ainda não tem citação literal verificada.

### Gaps
- Definições literais de BAS/BBS em Dallery e Gershwin (1992), em Perros ("Queueing Networks with Blocking", 1994) e em Buzacott e Shanthikumar ("Stochastic Models of Manufacturing Systems", 1993): não verificadas, pois o DSpace bloqueou o download e os livros não têm cópia aberta. Vale tentar a cópia do DSpace mais tarde, a partir do navegador.
- Convenção de capacidade (se a vaga da máquina conta na capacidade do buffer, como em vários modelos de Gershwin): não verificada.

## 4. M/M/1/K: probabilidade de fila cheia com rho = 0,8 e K grande

### Takeaway
Com rho = 0,8 e K = 1001 (1000 lugares na fila e 1 na estação), a probabilidade de o sistema estar cheio é cerca de 2·10⁻⁹⁸, e o número médio no sistema é igual ao do M/M/1 (L = 4) na precisão de um double. Para validar o M/M/1, uma fila de 1000 é efetivamente infinita. Bastaria uma fila de 50 para p_K ≈ 3·10⁻⁶.

### Cited Findings
- [Fato secundário] Distribuição estacionária do M/M/1/K, em que K conta o cliente em serviço: p_k = ρ^k (1−ρ) / (1−ρ^(K+1)), k = 0..K; a probabilidade de bloqueio (chegada encontra o sistema cheio) é p_K. — [KTH EP2200, notas de aula M/M/1/K](https://kth.se/social/files/56b61e80f276540578cb91b3/lmm-16.pdf); [TU Berlin, M/M/c, M/M/1/K e Erlang](https://commit-web.commit.tu-berlin.de/en/book/fsp/chapter/ch18/section/s05) (via resumo do buscador)
- [Estimativa] Cálculo exato em Python com frações racionais (ρ = 4/5):
  - K = 1001: p_K ≈ 1,97·10⁻⁹⁸
  - K = 1000: p_K ≈ 2,46·10⁻⁹⁸
  - K = 50: p_K ≈ 2,85·10⁻⁶
  - K = 20: p_K ≈ 2,33·10⁻³
  - K = 10: p_K ≈ 2,35·10⁻²
  - L(K = 1001) = ρ/(1−ρ) − (K+1)ρ^(K+1)/(1−ρ^(K+1)) = 4,0, igual ao L = ρ/(1−ρ) = 4 do M/M/1 na precisão de um double.

### Inferences
- [Estimativa] Com chegadas exponenciais, o modelo do Takt (a fonte para de gerar quando o sistema está cheio, sem perder chegadas) tem a mesma cadeia de Markov que o M/M/1/K com perdas. Nos estados 0..K−1 as taxas de chegada (λ) e de serviço (μ) são as mesmas. No estado K a chegada é suprimida num caso e perdida no outro, e nos dois a cadeia não sai de K por chegada. Logo a distribuição estacionária é a mesma, e a fórmula acima vale para o Takt. Hipóteses: interarrival exponencial, e pausar o relógio ou ressorteá-lo dá no mesmo pela falta de memória da exponencial.
- [Estimativa] Com p_K ≈ 10⁻⁹⁸, o desvio em relação ao M/M/1 fica muitas ordens de grandeza abaixo do erro de Monte Carlo de qualquer corrida viável. A escolha (d) está validada. Ainda assim, convém registrar que o caso testado é formalmente M/M/1/1001 e que o erro analítico é desprezível.
- [Estimativa] O mesmo cálculo serve de teste didático: com K pequeno (10 ou 20), a fonte bloqueia com frequência mensurável, o que mostra ao aluno como a capacidade finita derruba o throughput.

### Gaps
- Nenhuma.

## 5. Textos didáticos (Banks et al.; Law; Hopp e Spearman): buffers finitos e bloqueio explícito em modelos de fábrica

### Takeaway
Não verifiquei nenhuma recomendação literal desses três livros: não têm cópia aberta e o orçamento de buscas acabou. A única fonte didática verificada é o tutorial de Plant Simulation de Twente. Ele usa buffers com capacidade explícita, trata o bloqueio como estado próprio e alerta que uma fonte bloqueada costuma invalidar o modelo.

### Cited Findings
- [Fato secundário] O tutorial de Twente (material de ensino) ajusta a capacidade de cada buffer em cada exercício ("set the capacity to 4", "set its capacity to infinity", "capacity of -1"), lista "blocked" entre os estados das estações e apresenta o bloqueio como mecanismo básico de passagem de peças (o "push-block theorem"). — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] O mesmo tutorial recomenda não deixar a fonte bloquear: "In most cases, however, this behaviour leads to an invalid model!". — [U. Twente, Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)

### Inferences
- [Estimativa] Do ponto de vista didático, as escolhas (a) e (b) do Takt seguem o tutorial de Twente: estado "blocked" visível e buffers com capacidade editável. A escolha (c) é defensável só se a fila da fonte tiver capacidade padrão grande e a interface deixar claro quando a fonte está bloqueada, porque o próprio material didático trata o bloqueio da fonte como armadilha.

### Gaps
- Banks, Carson, Nelson e Nicol, "Discrete-Event System Simulation"; Law, "Simulation Modeling and Analysis"; Hopp e Spearman, "Factory Physics" (que, pela minha memória, tem uma seção sobre bloqueio com buffers finitos): nenhuma frase verificada; sem cópia aberta e sem busca feita por falta de orçamento. Qualquer afirmação sobre o que esses livros recomendam é hoje [Palpite].

## Resumo: onde as escolhas do Takt concordam ou divergem

- (a) Estação com capacidade 1 e BAS, "blocked" distinto de "starved": concorda com o Station do Plant Simulation, com o Server do Simio com buffers em 0 e com a definição de bloqueio da enciclopédia Springer [Fato secundário]. Falta a citação literal de Dallery e Gershwin.
- (b) Espera só em buffers explícitos: diverge de Arena (fila implícita no Process) e do padrão do Simio (InputBuffer no Server) [Fato secundário]; concorda com Plant Simulation, onde o Station não tem fila e os buffers são objetos à parte [Fato secundário].
- (c) Fonte com fila finita que bloqueia sem perder chegadas: diverge do Simul8, que perde a chegada ("Lost") [Fato], e do M/M/1/K clássico, que também perde; fica perto do Plant Simulation (a fonte não cria peça enquanto bloqueada) e do Simio (a fonte acumula entidades). O tutorial de Twente trata a fonte bloqueada como risco de modelo inválido [Fato secundário]. Falta decidir e documentar a regra do relógio entre chegadas durante o bloqueio.
- (d) M/M/1 aproximado com fila de 1000: validado. p_K ≈ 2·10⁻⁹⁸ e L = 4,0 [Estimativa, fórmula com fonte secundária].
