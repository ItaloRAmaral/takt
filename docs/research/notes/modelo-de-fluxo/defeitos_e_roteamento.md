# Defeitos, retrabalho, refugo e regras de roteamento em simuladores de eventos discretos

Legenda: [Fato] = citação literal de fonte primária (manual/ajuda oficial ou o próprio autor); [Fato secundário] = fórum, resumo de terceiros, snippet de busca ou material didático não oficial; [Estimativa] = dedução com premissa declarada; [Palpite] = sem base publicada.

Observação de acesso: anylogic.help (403), docs.flexsim.com (sem página oficial retornada), academia.edu e core.ac.uk (403) não puderam ser lidos diretamente. Onde isso ocorreu, o rótulo é [Fato secundário].

## 1. Defeitos e retrabalho: como cada ferramenta modela probabilidade de defeito, desvio para retrabalho/refugo e contador de retrabalho

### Takeaway
Nenhuma das ferramentas pesquisadas tem um atributo "taxa de defeito" na estação nem um contador ou limite de retrabalho embutido: todas modelam o defeito como um ponto de decisão probabilística (Decide/SelectOutput/Routing Out Percent/Send To Port By Percentage/peso de link) colocado depois da estação, e qualquer contador de retrabalho é feito pelo modelador com label/atributo. A proposta do Takt (defectRate na estação + regra "por qualidade" + contador único com limite) é, portanto, uma abstração de mais alto nível que as ferramentas não oferecem pronta; não há fonte que a refute, mas também não há fonte que a valide como padrão de mercado.

### Cited Findings
- [Fato] Arena, módulo Decide: "This module allows for decision-making processes in the system." Tipos: "There are two exit points out of the Decide module when its specified type is either 2-way by Chance or 2-way by Condition." Campo "Percent True": "Value that will be checked to determine the percentage of entities sent out a given True exit." Uso típico listado: "Dispatching a faulty part for rework". — [Rockwell Arena User's Guide, p. 42 (espelho manualsdir)](https://manualsdir.com/manuals/579995/rockwell-automation-arena-users-guide.html?page=42)
- [Fato] Arena, N-way: "When the N-way by Chance or by Condition type is specified, multiple exit points are shown for each condition or probability and a single "else" exit." Percentages: "Defines one or more percentages used to direct entities to different modules. Applies only when Type is N-way by Chance." — [Rockwell Arena User's Guide, p. 42](https://manualsdir.com/manuals/579995/rockwell-automation-arena-users-guide.html?page=42)
- [Fato secundário] Arena 2-way by Chance em material didático: um exemplo usa Percent True = 90, enviando 90% pela saída True e os 10% restantes pela False. — [Auckland OpsRes wiki, Editing Decide Modules](https://twiki.esc.auckland.ac.nz/do/view/OpsRes/EditingDecideModules)
- [Fato] Simul8, Routing Out "Label": "If a Label is missing from a Work Item type that goes through the Object, then the default routing rule (Circulate) will be used." Valores 1..N escolhem o destino; "If the value is > N, the Nth destination will be used."; valor 0 faz o item esperar. — [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)
- [Fato] Simul8, roteamento por label: "Therefore, a Label value of 1 will be directed to the Support Call Queue, as it is the first Queue in the list." A página não traz exemplo de defeito, retrabalho ou contagem de passagens. — [Simul8 Help, Routing Out with Labels](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out-with-labels/)
- [Fato secundário] FlexSim: "By Percentage" é uma opção da picklist Send To Port, na aba Flow do objeto ("a default option from the Send to Port picklist in the Flow tab of your Queue's properties. You simply select Random > By Percentage"); para condicionar por tipo, um contribuidor sugere partir do "By Percentage" e "wrap that code in an if-condition that checks the item's type". — [FlexSim Answers 27644](https://flexsim.cloud.answerhub.com/answers/27644/view.html); [Autodesk FlexSim forum, label e percentage](https://forums.autodesk.com/t5/flexsim-forum/how-to-send-item-by-label-and-by-percentage/td-p/13499419)
- [Fato secundário] AnyLogic SelectOutput5: recebe 5 probabilidades para 5 saídas; a página do AnyLogic 9 diz (segundo o snippet) que, se a soma não for 1, elas são normalizadas; e "The routing decision is made once by selecting the route according to the specified probabilities when the agent finishes its operation in the previous block." A página de referência mais nova descreve cada probabilidade no intervalo [0..1] sem falar em normalização. (Páginas retornaram 403; conteúdo vem do snippet de busca.) — [AnyLogic 9 Help, SelectOutput5](https://anylogic.help/9/libraries/process-modeling/selectoutput5.html); [AnyLogic Help, SelectOutput5](https://anylogic.help/library-reference-guides/process-modeling-library/selectoutput5.html)
- [Fato] Simio: o modelo usa "_Selection Weight_ property of Path objects" para a escolha de rota, e "the path's individual selection weight is divided by the sum of all path selection weights" do mesmo nó; instrução: "select the _Outbound Link Rule_ to be "By Link Weight" on the TransferNode". — [Simulation Modeling with Simio, 6th ed., cap. 4](https://textbook.simio.com/Workbook6/more-detailed-modeling-airport-revisited.html)
- [Fato secundário] Simio, rejeição condicional: um fórum mostra pesos de link como expressões (Math.If por horário), com o link para o Sink recebendo a probabilidade de rejeição; outro usa pesos `Entity.State` e `1-Entity.State` para rotear por estado da entidade (0/1). — [Simio forum 3072](https://forum.simio.com/topic/3072-state-variable-depending-routing-logic); [Simio forum 2423](https://forum.simio.com/topic/2423-routing-based-on-time-schedule)
- [Fato] Plant Simulation: o desvio é feito pelo objeto FlowControl ou por Method: "The FlowControl itself, however, does not hold/process a MU, but only ensures the distribution of the MUs to the subsequent stations."; "Set the Method Randomdest as Method for the Exit Strategy of your FlowControl."; o Method devolve "an integer indicating which outgoing connection should be used". O tutorial tem um exemplo "Scrapyard" na lista de exemplos, mas não modela retrabalho. — [Mes, A Plant Simulation Tutorial, versão 2404 (U. Twente), seções 3.9 e 7.2/7.5](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato secundário] Kim e Gershwin, "Integrated quality and quantity modeling of a production line", OR Spectrum 27, 287–314 (2005); Poffe e Gershwin descrevem que Kim e Gershwin "proposed a method for the evaluation of the performance of a production line that accounts for scrap and rework policies". Texto completo não lido. — [Springer, OR Spectrum](https://link.springer.com/doi/10.1007/s00291-005-0202-1); [MIT DSpace, tese de J. Kim](https://dspace.mit.edu/handle/1721.1/30338)

### Inferences
- [Estimativa] (premissa: as páginas lidas são representativas) Em todas as ferramentas, "defeito" é um desvio probabilístico de roteamento, não uma propriedade da estação. O `defectRate` do Takt equivale a um Decide 2-way by Chance (Arena) ou SelectOutput (AnyLogic) acoplado à saída da estação; para fins didáticos isso é mais simples e não contradiz nenhuma fonte.
- [Estimativa] O contador de retrabalho e o limite (padrão 2) não têm equivalente embutido em nenhuma ferramenta pesquisada; nelas, faria-se com label (Simul8), atributo (Arena), label + código (FlexSim) ou estado de entidade + peso de link (Simio). A escolha do Takt é uma decisão de produto própria; o padrão 2 não tem fonte publicada.
- [Estimativa] Contador único somado entre estações: não encontrei fonte que trate isso como padrão. Kim e Gershwin modelam "scrap and rework policies" por linha, mas sem acesso ao texto não se pode dizer se o contador é por estação ou global.

### Gaps
- Nenhum manual oficial lido de FlexSim (docs.flexsim.com não retornou), AnyLogic (403) ou Plant Simulation (ajuda oficial de "Exit Strategy" não encontrada) com exemplo explícito de defeito/retrabalho.
- Não encontrei nenhuma ferramenta com "rework counter" ou "rework limit" embutido; a ausência é uma constatação de busca, não uma prova.
- Texto completo de Kim e Gershwin (2005) não acessado; não confirmei como tratam o número máximo de retrabalhos.

## 2. Onde a regra de roteamento é configurada: no objeto (saída) ou na conexão/link

### Takeaway
Simul8, Arena, FlexSim, AnyLogic e Plant Simulation configuram a regra no objeto (diálogo Routing Out, módulo Decide, Send To Port do objeto, bloco SelectOutput, Exit Strategy/FlowControl). Simio é o caso misto: a regra ("Outbound Link Rule") fica no nó, mas o peso fica em cada link. A escolha do Takt (regra na saída do elemento, apontando apenas para destinos conectados) está alinhada com a maioria; Simio é a exceção a documentar.

### Cited Findings
- [Fato] Simul8: o diálogo Routing Out é aberto pelo botão Routing Out na aba Properties do objeto (Routing out é propriedade do objeto). — [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)
- [Fato secundário] Simul8 (ajuda antiga incorporada no PowerDesigner): a aba Simulation de uma rota lista "Name, Description, Routing out percent", ou seja, o percentual aparece associado à rota. — [Sybase PowerDesigner, SIMUL8 Route Properties](https://infocenter.sybase.com/help/topic/com.sybase.infocenter.dc38088.1600/doc/html/rad1232025925616.html)
- [Fato] Simul8 Visual Logic: "When Routing Out Percent Discipline is used this changes the percentage of Work Items that are sent to a particular destination." — [Simul8 Help, Set Route Out Percent](https://support.minitab.com/en-us/simul8/help-and-how-to/advanced/visual-logic/visual-logic-commands/functional-commands/set-route-out-percent/)
- [Fato] Simio: "select the _Outbound Link Rule_ to be "By Link Weight" on the TransferNode" e "_Selection Weight_ property of Path objects" — regra no nó, peso no link. — [Simulation Modeling with Simio, 6th ed.](https://textbook.simio.com/Workbook6/more-detailed-modeling-airport-revisited.html)
- [Fato secundário] Simio: pesos de seleção só valem se a entidade não tiver destino definido ("the Selection Weight is used by default unless the entity has a destination set"); um usuário resume: Destination/SetNode diz para onde ir, e o Link Selection Weight diz por qual link. — [Simio forum 3072](https://forum.simio.com/topic/3072-state-variable-depending-routing-logic)
- [Fato] Plant Simulation: regra na "Exit Strategy" do objeto (FlowControl), referindo-se aos conectores de saída por número: "The numbers of the outgoing connectors can be found by ... View Options > More > Successors." — [Mes, Plant Simulation Tutorial 2404](https://www.utwente.nl/en/bms/iebis/staff/mes/plantsimulation/tutorialplantsimulation2404-v20250502.pdf)
- [Fato] Arena: o Decide é um módulo (objeto) com saídas; percentuais e condições são campos do módulo. — [Rockwell Arena User's Guide, p. 42](https://manualsdir.com/manuals/579995/rockwell-automation-arena-users-guide.html?page=42)
- [Fato secundário] FlexSim: Send To Port fica na aba Flow das propriedades do objeto (Queue/Processor); o padrão é "First Available". — [FlexSim Answers 27644](https://flexsim.cloud.answerhub.com/answers/27644/view.html)

### Inferences
- [Estimativa] Regra no elemento com destinos restritos às conexões existentes reproduz Simul8 (lista "Routing Out From") e Plant Simulation (sucessores numerados). Em Simio, guardar o percentual na conexão seria o análogo; o Takt pode, se quiser, exibir o percentual sobre a conexão na UI e mantê-lo no elemento no esquema, sem conflito com as fontes.

### Gaps
- Não li a ajuda oficial da Exit Strategy do Plant Simulation (lista completa de opções, p. ex. percentual, conteúdo mínimo).
- Não confirmei na documentação oficial do FlexSim se a opção "By Percentage" guarda os percentuais na porta ou no objeto (a interface do picklist é no objeto).

## 3. Roteamento por percentual: amostragem independente ou proporção determinística? Precisa somar 100?

### Takeaway
Todas as fontes encontradas descrevem amostragem aleatória independente por item (não proporção determinística). Quanto à soma: Simul8 exige 100 mas ajusta proporcionalmente ("pro-rata") ao fechar o diálogo; AnyLogic normaliza; Simio usa peso/soma dos pesos (qualquer escala); Arena não diz. Nenhuma fonte encontrada trata soma diferente de 100 como erro bloqueante. A regra do Takt ("percentuais devem somar 100%") é mais rígida que o mercado, mas compatível com a mensagem de Simul8 "The Percentage must equal 100".

### Cited Findings
- [Fato] Simul8 Percent: "The destination Object is decided randomly (like "uniform") except that the exact percentage chance" de cada destino pode ser definida. "The Percentage must equal 100." "If the percentages do not add to 100 they will be pro-rata adjusted when you click OK to exit from the dialog box." Há um botão "=100" para ver os valores ajustados. — [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)
- [Fato] Simul8: o comando Set Route Out Percent recebe valor de 0 a 100; existe o comando "Percent Route Out Adjust to 100". — [Simul8 Help, Set Route Out Percent](https://support.minitab.com/en-us/simul8/help-and-how-to/advanced/visual-logic/visual-logic-commands/functional-commands/set-route-out-percent/); [Simul8 Help, adjust route in percent to 100](https://support.minitab.com/en-us/simul8/help-and-how-to/advanced/visual-logic/adjust-route-in-percent-to-100/)
- [Fato] Simul8 tem também "Route Out By Sequence", que é a alternativa determinística (sequência repetida). — [Simul8 Help, Route Out By Sequence](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/route-out-by-sequence/)
- [Fato secundário] FlexSim: "the By Percentage options don't guarantee that exactly a certain percent will go to each port. Instead it gives each item a certain probability of going to that port." — [FlexSim Answers 27644](https://flexsim.cloud.answerhub.com/answers/27644/view.html)
- [Fato secundário] AnyLogic SelectOutput5: soma diferente de 1 é normalizada (AnyLogic 9); exemplo em PedSelectOutput: pesos 5, 1, 4 resultam em 0,5, 0,1, 0,4. — [AnyLogic 9 Help, SelectOutput5](https://anylogic.help/9/libraries/process-modeling/selectoutput5.html); [AnyLogic 9 Help, PedSelectOutput](https://anylogic.help/9/libraries/pedestrian/pedselectoutput.html)
- [Fato] Simio: probabilidade = peso do link / soma dos pesos do nó. — [Simulation Modeling with Simio, 6th ed.](https://textbook.simio.com/Workbook6/more-detailed-modeling-airport-revisited.html)
- [Fato] Arena: "Percent True" é o percentual de entidades enviadas pela saída True; o manual não fala sobre soma 100 no N-way. — [Rockwell Arena User's Guide, p. 42](https://manualsdir.com/manuals/579995/rockwell-automation-arena-users-guide.html?page=42)

### Inferences
- [Estimativa] Amostragem independente por peça (Bernoulli/categórica) é o comportamento padrão de mercado; o Takt deve sortear por peça com o gerador semeado do motor, e documentar que em poucas peças a proporção observada diverge da configurada (é exatamente a dúvida relatada no fórum do FlexSim, bom ponto didático).
- [Estimativa] Exigir soma exatamente 100 com erro de validação (em vez de normalizar) é defensável em produto didático e na regra "validação na borda com Zod estrito"; Simul8 avisa que "must equal 100", mas corrige sozinho. Recomenda-se definir a tolerância (p. ex. inteiros ou décimos) para evitar falhas de ponto flutuante.

### Gaps
- Nenhuma fonte oficial do FlexSim lida diretamente; o comportamento de soma ≠ 100 no FlexSim não foi encontrado.
- Arena: comportamento quando os percentuais do N-way somam menos de 100 (o restante vai para "else"?) não está no trecho lido.

## 4. Menor fila (shortest queue): desempate e o que conta como fila

### Takeaway
Simul8 e FlexSim têm "Shortest Queue", mas nenhuma fonte lida documenta regra de desempate. FlexSim (fórum) diz "least currently in it" (conteúdo atual); Simul8 diz apenas "the Queue that is the shortest". Não há resposta publicada encontrada sobre "só espera" versus "espera + em processamento"; o Takt terá de decidir e documentar.

### Cited Findings
- [Fato] Simul8: "This routing method sends Work Items to the Queue that is the shortest." Para Conveyors, envia se "it can currently take more work." A página não traz desempate. — [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)
- [Fato] Simul8 Priority: "The Priority routing rule sends all Work Items to the first destination in the list, unless this is blocked." — [Simul8 Help, Routing Out](https://support.minitab.com/en-us/simul8/help-and-how-to/build-a-simulation/routing/routing-out/)
- [Fato secundário] FlexSim: a opção "Shortest Queue" envia o item para a fila "with the least currently in it"; com filas de capacidade 1, "this setting wouldn't actually do anything" porque filas cheias nunca estão disponíveis. — [Autodesk FlexSim forum, Queue logic](https://forums.autodesk.com/t5/flexsim-forum/queue-logic/m-p/13524908)
- [Fato secundário] SAS Simulation Studio tem um exemplo "Routing to Shortest Queue" (não lido em detalhe). — [SAS Simulation Studio, Routing to Shortest Queue](https://support.sas.com/documentation/cdl/en/simsug/63965/HTML/default/simsug_app7_sect003.htm)

### Inferences
- [Estimativa] Desempate determinístico pela ordem da lista de destinos (primeira conexão) é coerente com o espírito do Priority do Simul8 e com o requisito de determinismo do motor (sem sorteio extra). Isso é uma proposta, não algo documentado.
- [Palpite] Contar "fila de espera + peça em processamento" do destino reflete melhor a carga total quando os destinos são estações; contar só a espera reproduz literalmente "Queue that is the shortest". Precisa de decisão do usuário.

### Gaps
- Nenhuma fonte publicada encontrada com regra de desempate de shortest queue em Simul8, FlexSim, AnyLogic ou Plant Simulation.
- Nenhuma fonte publicada encontrada que defina se peças em processamento contam como fila.

## 5. Literatura: laços de retrabalho, número esperado de passagens e probabilidade de refugo

### Takeaway
Não encontrei texto publicado acessível que enuncie literalmente as fórmulas 1/(1−p), (1−p^(n+1))/(1−p) e p^(n+1). Elas são corretas por derivação direta sob a premissa de defeitos independentes com a mesma p em cada passagem. Factory Physics (Hopp e Spearman) tem a "Rework Law" qualitativa, confirmada apenas por fonte secundária.

### Cited Findings
- [Fato secundário] Factory Physics, Rework Law (via resumo): "for a given throughput level, rework increases both the mean and standard deviation of the cycle time of a process." Lei de conservação de material: "the rate out of a system will equal the rate in, less any yield loss, plus any parts production within the system." (Página original academia.edu deu 403; texto vem do snippet de busca.) — [Factory Physics Principles (academia.edu)](https://www.academia.edu/9095016/Factory_Physics_Principles)
- [Fato secundário] Little's Law com refugo: quando partes "are either scrapped (yield loss) or have become obsolete, the application becomes a bit more complex", citando Factory Physics para as equações generalizadas. — [Project Production Institute, Little's Law in Production Systems with Yield Loss](https://projectproduction.org/journal/littles-law-in-production-systems-with-yield-loss/)
- [Fato secundário] Poffe e Gershwin: "only few papers consider the intersection between quality control and system dynamics"; Kim e Gershwin propuseram avaliação de desempenho "that accounts for scrap and rework policies". — [MIT DSpace, Kim](https://dspace.mit.edu/handle/1721.1/30338); [Springer, OR Spectrum 27](https://link.springer.com/doi/10.1007/s00291-005-0202-1)

### Inferences
- [Estimativa] Premissas: cada passagem (original ou retrabalho) sai defeituosa com a mesma probabilidade p, independente das anteriores; a peça é refugada quando o contador de retrabalhos atinge n e ela sai defeituosa de novo. Seja N o número de passagens. P(N > k) = p^k para k = 0..n, então E[N] = Σ_{k=0..n} p^k = (1 − p^(n+1)) / (1 − p). P(refugo) = p^(n+1) (todas as n+1 passagens defeituosas). Sem limite (n → ∞), E[N] = 1/(1 − p) (média da geométrica com sucesso 1 − p). As três fórmulas do enunciado estão corretas sob essas premissas.
- [Estimativa] Exemplo com o padrão do Takt (n = 2) e p = 0,1: E[N] = (1 − 0,001)/0,9 = 1,11; P(refugo) = 0,001. Útil como teste de propriedade do motor (média de muitas réplicas converge para esses valores).
- [Estimativa] Atenção: as fórmulas valem para um único laço com p constante. No Takt, se a estação de retrabalho tiver seu próprio defectRate diferente, ou se o contador é somado entre várias estações com p distintas, a expressão muda (produto das probabilidades por passagem); o texto da regra deve dizer qual p vale na passagem de retrabalho.

### Gaps
- Factory Physics (capítulo sobre rework/yield) e Kim e Gershwin (2005) não lidos em texto completo; não confirmei que enunciem essas fórmulas. Nenhuma fonte acessível com as três fórmulas literais foi encontrada.

## 6. Fator qualidade do OEE: retrabalho conta como bom? Refugo entra?

### Takeaway
Segundo oee.com (Vorne), a Qualidade do OEE é first pass yield: peças retrabalhadas são perda de qualidade tanto quanto as refugadas. Logo, a escolha (c) do Takt ("refugo conta no fator qualidade") está correta mas incompleta: pela definição oee.com, peças que foram para retrabalho também deveriam reduzir a Qualidade. Nakajima e ISO 22400-2 não foram verificados.

### Cited Findings
- [Fato] "First Pass Yield means making a Good Part, ‘right first time’ without rejecting it to be scrapped or reworked." — [OEE.com Glossary](https://oee.com/oee-glossary)
- [Fato] "The quantity of Good Parts is referred to as Good Count which is used to calculate OEE Quality." — [OEE.com Glossary](https://oee.com/oee-glossary)
- [Fato] "Rework Parts are rejected parts that can be reworked and sold to the customer." e "OEE does not make a distinction between parts that can be reworked and parts that are scrapped." — [OEE.com Glossary](https://oee.com/oee-glossary)
- [Fato] "Quality is a measure of First Pass Yield and takes into account Process Defects and Reduced Yield." — [OEE.com Glossary](https://oee.com/oee-glossary)
- [Fato] "The losses that impact Quality include all forms of rejects that occur during the first manufacturing pass (including parts that can be reworked)." e "A Quality score of 100% means there are no defects (only good parts are produced)." — [OEE.com, Practical OEE](https://www.oee.com/practical-oee/)
- [Fato] Reject Parts: "It is calculated by subtracting Good Parts from Total Parts." Total Count "is used to calculate OEE Performance and OEE Quality." — [OEE.com Glossary](https://oee.com/oee-glossary)
- [Fato secundário] Fornecedor comercial: unidade retrabalhada fica no total count mas não no good count; Quality = Good Count / Total Count. — [Fabrico, rework good count OEE](https://www.fabrico.io/blog/rework-good-count-oee/)

### Inferences
- [Estimativa] Para o Takt: Good Count da estação = peças que saem sem defeito na primeira passagem; Total Count = todas as peças processadas. Uma passagem de retrabalho bem-sucedida não deve virar Good Count retroativamente. Também é preciso decidir se a passagem pela estação de retrabalho entra no Total Count da estação de retrabalho (o OEE é por equipamento) — ponto sem fonte específica.
- [Estimativa] Diferença didática útil: OEE Quality (first pass) versus rendimento final da linha (peças boas finais / peças iniciadas, que conta retrabalho bem-sucedido como bom). Mostrar as duas métricas separadas evita ambiguidade.

### Gaps
- Nakajima (Introduction to TPM, 1988) e ISO 22400-2 não lidos; não confirmei se definem qualidade como first pass yield ou permitem contar retrabalho como bom.
- oee.com é de um fornecedor (Vorne); é referência amplamente citada, mas não é norma.
