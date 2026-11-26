# Padrões de parâmetros, limites de tamanho de modelo e mecanismos de cenário em ferramentas de simulação de eventos discretos

Pesquisa feita em 2026-11-25. Rótulos: [Fato] = citação literal lida na página oficial ou primária via fetch; [Fato secundário] = conteúdo visto só em trecho de busca, em fonte não oficial ou em espelho (a citação pode ser paráfrase do mecanismo de busca); [Estimativa] = inferência com premissa declarada; [Palpite] = sem base publicada.

Observação de método: `anylogic.help` e o fórum da Autodesk/FlexSim responderam HTTP 403 a buscas automáticas; as páginas de referência do FlexSim (docs.flexsim.com) redirecionam para help.autodesk.com, que devolveu "Page Not Found". O livro online de Rossetti sobre Arena devolveu 404 nas páginas tentadas. Por isso vários itens dessas ferramentas ficaram só como [Fato secundário] ou em Gaps.

## 1. Valores padrão de novos objetos (Source, estação, buffer/fila)

### Takeaway
Os padrões documentados que consegui confirmar mostram que as ferramentas comerciais escolhem padrões "que rodam" sem edição (fila AnyLogic com capacidade 100, Delay AnyLogic com capacidade 1, fila Simul8 configurável como infinita com -1), mas nenhum documenta padrões iguais aos propostos pelo Takt (chegada exponencial de 60 s, ciclo fixo de 50 s). Os números do Takt são escolhas próprias; o que dá para defender com fontes é o *princípio* de padrões que rodam, não os valores específicos.

### Cited Findings
- [Fato secundário] AnyLogic 9, bloco Queue: "Syntax: int capacity Default value: 100" (trecho de busca da página oficial; fetch bloqueado com 403) — [AnyLogic 9 Help: Queue](https://anylogic.help/9/libraries/process-modeling/queue.html)
- [Fato secundário] AnyLogic 9, bloco Wait: mesmo padrão de capacidade, "Default value: 100" (trecho de busca) — [AnyLogic Help: Wait](https://www.anylogic.help/library-reference-guides/process-modeling-library/wait.html)
- [Fato secundário] AnyLogic 9, bloco Delay: "The capacity of Delay block: the number of agents that can be delayed at the same time. Syntax: int capacity Default value: 1" (trecho de busca) — [AnyLogic 9 Help: Delay](https://anylogic.help/9/libraries/process-modeling/delay.html)
- [Fato secundário] AnyLogic, Delay, opção "Maximum capacity": "If the option is selected (true), the capacity of Delay is the maximum possible (limited by Integer.MAX_VALUE)", com "Type: boolean Default value: false"; tipo de atraso com "Default value: Delay.TIMEOUT — Specified time" (trechos de busca) — [AnyLogic Help: Delay](https://www.anylogic.help/library-reference-guides/process-modeling-library/delay.html)
- [Fato secundário] Tempo de atraso padrão do Delay no AnyLogic, segundo material de aula (não oficial): "Keep the default delay time distribution: a triangular distribution with a minimum of 0.5, maximum of 1.5 and mode of 1 second." — [UAB, Introduction to AnyLogic (TFG 2021)](https://ddd.uab.cat/pub/trerecpro/2021/tfg_395386/Introduction_to_AnyLogic_new.pdf)
- [Fato secundário] Simul8, referência de script: "Max Size sets the Capacity of the Queue. Set this value to -1 when the Queue has an infinite capacity." (trecho de busca; a página não cita se -1 é o padrão) — [Simul8 Help: Queue Properties](https://support.minitab.com/en-us/simul8/help-and-how-to/advanced/visual-logic/queue-properties/)
- [Fato] Simul8, página de conceito Queues: não declara capacidade padrão; diz apenas, para filas limitadas, "type the maximum number of items into the Capacity box." — [Simul8 Help: Queues](https://support.minitab.com/en-us/simul8/help-and-how-to/simulation-key-concepts/simulation-objects/queues/)
- [Fato secundário] PowerDesigner (Sybase), que exporta para SIMUL8, documenta para a fila: "Maximum count of work items that can be in this queue (-1 = no limit)" com padrão -1. É outro produto, não o Simul8 em si — [Sybase PowerDesigner: SIMUL8 Default Properties](https://infocenter-archive.sybase.com/help/topic/com.sybase.infocenter.dc38088.1530/doc/html/rad1253701241713.html)
- [Fato secundário] Simul8, Activity: o tempo "is determined by the settings in the Timing section"; a página não declara distribuição ou valor padrão — [Simul8 Help: Activities](https://support.minitab.com/en-us/simul8/help-and-how-to/simulation-key-concepts/simulation-objects/activities/)
- [Fato secundário] FlexSim, Source: o inter-arrival time é medido da saída de um item até a chegada do próximo, e há opção de criar o primeiro item no tempo 0 (trecho de busca no fórum; documentação oficial não acessível) — [FlexSim Answers: inter arrival source](https://flexsim.cloud.answerhub.com/articles/23429/inter-arrival-source-1.html)

### Inferences
- [Estimativa] As ferramentas convergem em padrões que deixam um modelo mínimo rodável sem edição (fila finita mas grande no AnyLogic, servidor unitário). A proposta (a) do Takt segue o mesmo princípio. Premissa: os padrões citados valem nas versões atuais.
- [Estimativa] Utilização resultante da proposta do Takt: 50 s / 60 s ≈ 83%, com chegada exponencial e serviço fixo (fila M/D/1). Isso gera fila visível mas estável, uma escolha didática razoável. Nenhuma ferramenta publicada documenta esse raciocínio; é inferência própria.
- [Estimativa] Capacidade de buffer 10 fica entre o "1" típico de servidor e o "100" da fila AnyLogic; não há fonte que favoreça 10 em particular.

### Gaps
- Plant Simulation: não encontrei página oficial acessível com os padrões de Source (intervalo), SingleProc (tempo de processamento) e Buffer (capacidade). [Palpite, memória do pesquisador, não verificada]: SingleProc com tempo de processamento de 1:00 (1 min) e Buffer com capacidade 1. Não usar sem verificar no help da Siemens.
- FlexSim: as páginas de referência de Source, Processor e Queue não abriram (redirecionamento para página inexistente em help.autodesk.com). [Palpite, memória não verificada]: Source com `exponential(0, 10, 0)`, Processor com tempo de processo 10 e Queue com Maximum Content 1000.
- AnyLogic Source: não encontrei o padrão documentado de "Arrival rate". [Palpite, memória não verificada]: taxa 1 por segundo.
- Arena Create/Process: não encontrei fonte acessível. [Palpite, memória não verificada]: Create com "Random (Expo)" de média 1 hora; Process com Triangular(0.5, 1, 1.5) horas.
- Nenhuma ferramenta documenta defeito, falha ou esteira com padrões comparáveis aos do Takt (taxa de defeito 0, sem falhas, esteira de 5 m a 10 m/min com capacidade 5, limite de retrabalho 2). Não há fonte publicada para esses valores; são escolhas de produto.

## 2. Limites de tamanho de modelo em edições estudantis e gratuitas

### Takeaway
As edições de ensino limitam modelos a dezenas de objetos: Plant Simulation estudante 80 objetos, FlexSim Express cerca de 30 objetos 3D, Arena estudante cerca de 150 entidades simultâneas. AnyLogic PLE limita o número de agentes (50.000) e de blocos por tipo de agente (200), não o de "objetos" no sentido de máquinas. O limite proposto pelo Takt (500 elementos, 2000 conexões) fica bem acima do que as edições de ensino permitem; ele coincide com o limite da licença Foundation do Plant Simulation.

### Cited Findings
- [Fato] Plant Simulation, página oficial de download da edição estudante: "Note: With the student license, you can use a maximum number of 80 objects in a simulation." e "The software is non-transferable and cannot be used for industrial projects, paid services or any other commercial purpose." A página não traz data nem versão — [Siemens: Tecnomatix Plant Simulation Student Download](https://resources.sw.siemens.com/en-US/download-tecnomatix-plant-simulation-student-software)
- [Fato secundário] Plant Simulation, outros tipos de licença: Standard limitado a 4000 objetos, Foundation a 500 objetos contados, Professional sem limite; métodos, comentários, variáveis e arestas (edges) não contam para o limite (resumo do mecanismo de busca a partir do PDF de tipos de licença e da SimPlan; não li o texto literal) — [cad.de: PlantSimulationLizenzarten](https://ww3.cad.de/foren/ubb/uploads/Tuhpon/PlantSimulationLizenzarten81D.pdf); [SimPlan: Plant Simulation Foundation license](https://www.simplan.de/en/plant-simulation-foundation-license/)
- [Fato secundário] FlexSim Express (sem licença): tabela da base de conhecimento lista "object creation limit 30" e "process flow activity creation limit 35"; além de objetos 3D, "Global Tables, Control Points, etc." contam; uma esteira pode valer dois objetos. A própria página avisa que a lista pode estar desatualizada (fetch bloqueado com 403; trechos de busca) — [FlexSim Knowledge Base: Feature limitations by license type](https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/ta-p/13530769); [FlexSim Answers: features by license type](https://flexsim.cloud.answerhub.com/articles/65811/flexsim-features-by-license-type.html)
- [Fato secundário] AnyLogic PLE: "Maximum 50 000 dynamically created agents (for example, by the Source block) in a model", limite de 200 populações e blocos de fluxograma por tipo de agente, 200 variáveis de dinâmica de sistemas por tipo de agente; OptQuest limitado a 500 iterações e 7 variáveis de decisão; licença "restricted to be used solely for classroom instruction and personal learning" (trechos de busca; fetch bloqueado) — [AnyLogic Help: Editions](https://anylogic.help/anylogic/ui/editions.html)
- [Fato secundário] AnyLogic: as notas de versão dizem que a avaliação Professional deixou de existir e que "the limitations of AnyLogic PLE have been relaxed", ou seja, números antigos de limite podem estar desatualizados — [AnyLogic Help: Release notes](https://anylogic.help/anylogic/introduction/release-notes.html)
- [Fato secundário] AnyLogic PLE com tempo de simulação limitado a 5 horas e 10 tipos de agente: só em agregador de terceiros, não confirmado em fonte oficial — [Yandex portal: AnyLogic overview](https://portal.yandex.com.tr/yaozet/programming/anylogic-simulation-software-overview-id7-5IghIiZh)
- [Fato] Arena, página acadêmica da Rockwell: "the Arena Student version provides the functionality of Arena Professional Edition, with only a limit to the size of the models that can be built." Não traz número — [Rockwell: Arena Academic](https://www.rockwellautomation.com/en-gb/products/software/arena-simulation/academic.html)
- [Fato secundário] Arena estudante, que acompanha o livro texto, "will allow analysis up to 150 entities" (wiki de laboratório da RPI, não oficial) — [RPI Design Lab: Arena software](https://designlab.eng.rpi.edu/edn/projects/capstone-support-dev/wiki/Arena_software)
- [Fato secundário] Rockwell, pacote de pesquisa: "There is no model size or functionality limit with this package." — [Rockwell: Arena Academic (es-es)](https://rockwellautomation.com/es-es/products/software/arena-simulation/academic.html)

### Inferences
- [Estimativa] Os exercícios típicos de ensino cabem em 30 a 150 objetos, porque é isso que as edições estudantis permitem. Premissa: os cursos usam majoritariamente essas edições. Um limite de 500 elementos dá folga de 3x a 15x sobre isso e fica no nível da licença Foundation (comercial de entrada) do Plant Simulation.
- [Estimativa] O Plant Simulation não conta arestas (conexões) para o limite; o Takt propõe limitar conexões em separado (2000 = 4 por elemento em média), o que é uma defesa técnica do motor, não algo copiado das ferramentas.
- Os limites de capacidade (10000), de tempo (7 dias) e de duração de cenário (720 h) não têm paralelo documentado nessas ferramentas; nenhuma das páginas lidas publica teto de capacidade ou de duração além do `Integer.MAX_VALUE` do AnyLogic.

### Gaps
- Limite do Simul8 estudante: não pesquisado com sucesso; nenhuma fonte encontrada.
- Número de módulos do Arena estudante: nenhuma fonte encontrada (só o de entidades, e em fonte não oficial).
- Não encontrei fonte publicada que justifique 720 h ou 7 dias como teto; são escolhas do produto.

## 3. Cenários e experimentos: variam só parâmetros ou também estrutura?

### Takeaway
Em todas as ferramentas pesquisadas, o mecanismo de cenário ou experimento varia valores de entradas já existentes no modelo (parâmetros, variáveis, propriedades de objetos, capacidades de recursos, distribuições, turnos); nenhuma documentação lida descreve um cenário que acrescente ou remova objetos ou conexões. Isso apoia a proposta (d) do Takt. Ressalva: a ausência de "adicionar objetos" é inferida da lista do que pode variar, não de uma frase que a proíba.

### Cited Findings
- [Fato] Simul8 Experiment Builder (substituto do Scenario Manager): "You are able to make changes to the following parameters:" Objects, Distributions, Global Variables, Spreadsheets, Shifts, Cycle Matrix, Jobs Matrix, Clock Properties. A página não diz se objetos podem ser adicionados ou removidos; a tabela de propriedades por objeto é uma imagem — [Simul8 Help: Experiment Builder](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/experiment-builder/)
- [Fato secundário] Simul8 Scenario Manager (em descontinuação): baseado em "decision factors", valores a variar como variáveis, propriedades de objetos ou células de planilha; "Simul8 will run every combination of decision factor value"; acesso "from the Advanced tab, or through the Results Manager on the Home tab" — [Simul8 Help: Scenario Manager](https://support.minitab.com/en-us/simul8/help-and-how-to/results-and-validation/scenario-manager/)
- [Fato secundário] AnyLogic Parameter Variation: executa várias rodadas "varying one or more root object parameters"; os parâmetros variáveis são os do agente de topo, com Min, Max e Step (trechos de busca; fetch bloqueado) — [AnyLogic Help: Parameter variation](https://anylogic.help/anylogic/experiments/parameter-variation.html); [AnyLogic API: ExperimentParamVariation](https://anylogic.help/api/com/anylogic/engine/ExperimentParamVariation.html)
- [Fato secundário] Arena Process Analyzer: controles são entradas como "variables, resource capacities, replication parameters"; respostas são saídas como contadores e estatísticas; um cenário é um modelo (.p) mais um conjunto de controles e respostas (resumo de busca do livro de Rossetti; página com 404 no fetch) — [Rossetti, Arena book: 8.1 Analyzing Multiple Systems](https://rossetti.github.io/RossettiArenaBook/ch7s5sb2.html)
- [Fato secundário] Simio: valores de cenário são dados a "referenced properties" criadas no modelo ("Set Referenced Property", "Create New Referenced Property"); o Scenario Generator gera fatorial completo a partir dos "controls" do modelo (fórum e boletim Simio, não o manual) — [Simio Forum: cumbersome model with experiments](https://forum.simio.com/topic/2094-cumbersome-model-with-experiments-and-objects/); [Simio Scoop 2024-10](https://simio.com/wp-content/uploads/2024/10/2024-10-Scoop.pdf)
- [Fato secundário] Plant Simulation: o ExperimentManager existe para gerir experimentos e há uma página de ajuda "Setting Parameters in the Model" que "provides a number of ways to enter parameters into your simulation model and to execute simulation runs with these parameters"; não encontrei o texto que descreve as entradas do ExperimentManager — [Siemens Plant Simulation 15.1 Help: Setting Parameters in the Model](https://docs.plm.automation.siemens.com/content/plant_sim_help/15.1/plant_sim_all_in_one_html/en_US/tecnomatix_plant_simulation_help/step_by_step_help/setting_parameters_in_the_model/setting_parameters_in_the_model.html); [Tutorial Plant Simulation, Mes, U. Twente, seção 9.2](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Arena: para mudar capacidade de recurso durante a rodada, "two of the simplest ways in ARENA of changing resource capacity are to use the `SCHEDULES' element or the `ALTER' block" (isto é lógica do modelo, não cenário) — [TLU: Arena c8-12](https://minitorn.tlu.ee/~jaagup/uk/ds/chp8/c8-12.htm)

### Inferences
- [Estimativa] O padrão comum é "o cenário aponta para entradas nomeadas do modelo e troca seus valores". A proposta (d) do Takt é mais restrita (só substitui valores inteiros de parâmetros de elementos existentes e o limite de retrabalho), mas no mesmo espírito. Premissa: Simul8 "Objects" no Experiment Builder significa propriedades de objetos existentes, como no Scenario Manager.
- [Estimativa] No Simio e no AnyLogic só varia o que o modelador expôs como propriedade ou parâmetro; no Takt qualquer parâmetro de elemento é variável sem marcação prévia. É uma diferença de produto, não um desvio do padrão.
- [Estimativa] Variar estrutura (comparar layouts) nessas ferramentas exige modelos ou versões separados; o equivalente no Takt seria outra planta ou versão, não um cenário.

### Gaps
- Nenhuma frase oficial encontrada que diga explicitamente "um cenário não pode adicionar objetos" em qualquer ferramenta.
- Texto literal do ExperimentManager do Plant Simulation e do manual de experimentos do Simio não foi acessado.

## 4. Replicações: padrões, recomendações, semente e duração de turno

### Takeaway
O Simul8 usa por padrão 5 rodadas por Trial, com 95% de confiança, e uma semana de coleta de resultados; os fluxos aleatórios partem de um conjunto base incrementado a cada rodada. Não encontrei fonte para o padrão de replicações do Arena nem para nenhuma ferramenta que use semente 42. As 30 replicações e a semente 42 do Takt são escolhas próprias sem respaldo publicado direto.

### Cited Findings
- [Fato] Simul8: "By default, the number of runs in a Trial are 5"; "confidence limits - i.e. the percent to which calculations are accurate - is set to 95%"; "The actual random number stream sets used for the first run in the trial is the base set" e "this is incremented for each run in the trial." — [Simul8 Help: Trials](https://support.minitab.com/en-us/simul8/help-and-how-to/simulation-key-concepts/trials/)
- [Fato] Simul8: "As default, Simul8 will run your simulation for one week." A página não fala de duração de dia ou turno — [Simul8 Help: Results Collection Period](https://support.minitab.com/en-us/simul8/help-and-how-to/simulation-key-concepts/results-collection-period/)
- [Fato secundário] Simul8: "the simulation will not start to collect results until the warm-up period is finished"; aquecimento "Sometimes you do not need a warm up time"; sem padrão numérico documentado — [Simul8 Help: Warm Up Period](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/clock/warm-up-period/)
- [Fato secundário] Arena (livro de Rossetti): exemplo com "30,000 minutes for the replication length and 10 replications on the Run > Setup > Replication Parameters" — valores do exemplo, não padrões — [Rossetti: 5.3 Replication-Deletion](https://rossetti.github.io/RossettiArenaBook/ch5-RepDeletion.html)
- [Fato secundário] Práticas de semente em outros simuladores: o ns-2 semeia o gerador com valor fixo (12345) e recomenda usar um subfluxo diferente por replicação; o KSL (de Rossetti) tem opção para avançar ao próximo subfluxo no início de cada replicação — [ns-2 manual: Seeding the RNG](https://www.isi.edu/nsnam/ns/doc/node268.html); [Rossetti, KSL Book 2.1](https://rossetti.github.io/KSLBook/ch2generator.html)

### Inferences
- [Estimativa] Semente fixa por padrão é prática documentada (ns-2 usa 12345; Simul8 usa um "base set" fixo), o que apoia o Takt ter semente padrão determinística. O valor 42 em si é arbitrário; nenhuma fonte o usa ou o recomenda.
- [Estimativa] 30 replicações estão 6x acima do padrão do Simul8 (5). Mais replicações estreitam o intervalo de confiança, mas custam tempo de execução no navegador. Premissa: o custo por replicação de um turno de 8 h com poucos elementos é pequeno; não medido.
- [Estimativa] O padrão de uma semana do Simul8 é mais longo que o turno de 8 h do Takt; para o ensino, 8 h corresponde a um turno, mas não achei fonte que defina "turno típico de 8 h" em exemplos de ensino.

### Gaps
- Padrão de "Number of Replications" e "Replication Length" do Arena: nenhuma fonte acessível. [Palpite, memória não verificada]: 1 replicação e duração infinita.
- Fluxos padrão do Arena (qual stream as distribuições usam por padrão): nenhuma fonte encontrada.
- Recomendações de livro texto (Law, Banks) sobre número de replicações: não pesquisadas com sucesso nesta rodada.
- Duração de turno em exemplos de ensino: nenhuma fonte encontrada.
- Semente 42: nenhuma fonte publicada encontrada; o valor deve ser tratado como convenção arbitrária.

## 5. Valores explícitos vs. padrões implícitos em arquivos de modelo versionados

### Takeaway
O JSON Schema declara que `default` é só anotação e não preenche valores na validação; o Zod, ao contrário, devolve o valor padrão quando a entrada é `undefined`. Logo, um documento que dependa de padrões implícitos muda de significado conforme quem o lê (validador JSON Schema vs. parser Zod) e conforme a versão do código que define o padrão. Isso apoia a proposta (b) do Takt: gravar todos os valores explicitamente e usar padrões só no editor.

### Cited Findings
- [Fato] JSON Schema: "The `default` keyword specifies a default value." e "This value is not used to fill in missing values during the validation process." — [Understanding JSON Schema: Annotations](https://json-schema.org/understanding-json-schema/reference/annotations)
- [Fato] Zod: "In Zod, setting a _default_ value will short-circuit the parsing process." "If the input is `undefined`, the default value is eagerly returned." "As such, the default value must be assignable to the _output type_ of the schema." — [Zod API: Defaults e Prefaults](https://zod.dev/api)
- [Fato] Zod `.prefault()`: "If the input is `undefined`, the prefault value will be parsed instead." "The parsing process is _not_ short circuited." — [Zod API: Prefaults](https://zod.dev/api)
- [Fato secundário] Zod: `.default()` "only applies to undefined values, not null or other invalid inputs" (espelho Mintlify da documentação) — [Mintlify: Zod default modifier](https://www.mintlify.com/colinhacks/zod/api/modifiers/default)

### Inferences
- [Estimativa] Com `.default()` no esquema de persistência, um campo ausente seria preenchido em silêncio pelo valor vigente no código; se o padrão mudar numa versão futura, plantas antigas mudariam de resultado sem migração. Gravar o valor explícito elimina esse risco. Premissa: os padrões do editor podem mudar entre versões do produto.
- [Estimativa] A diferença entre JSON Schema (`default` é anotação) e Zod (`default` preenche) é um argumento adicional para não depender de `default` em esquema de documento: o mesmo arquivo seria interpretado de formas diferentes por ferramentas diferentes.

### Gaps
- Não encontrei documentação de Plant Simulation, Simul8, FlexSim ou AnyLogic sobre se os arquivos de modelo gravam todos os valores ou só os alterados em relação ao padrão.
