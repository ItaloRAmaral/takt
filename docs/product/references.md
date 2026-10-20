# Referências

> **Resumo.** Bibliografia que embasa o Takt e o que cada obra sustenta. A literatura valida a engenharia do motor e a didática; ela não valida a demanda.

Atualizado em 20/10/2026.

**Regra:** toda referência usada no produto, nos PDRs ou nos ADRs entra neste arquivo, com o que ela embasa. Pesquisas completas ficam em [`../research/`](../research/README.md).

**Atenção:** edições, anos e páginas devem ser conferidos na obra antes de serem citados em material público.

## Engenharia e simulação

| Obra | O que embasa |
| --- | --- |
| Hopp, W. J.; Spearman, M. L. *Factory Physics*. 3. ed. | Vazão e gargalo em linhas em série, capacidade de estações paralelas, variabilidade e filas |
| Law, A. M. *Simulation Modeling and Analysis*. 5. ed. | Distribuições de entrada, número de replicações, intervalos de confiança, validação de modelos |
| Little, J. D. C. "A proof for the queuing formula L = λW". *Operations Research*, 1961 | Lei de Little (WIP = vazão × lead time) |
| Kleinrock, L. *Queueing Systems*, v. 1 | Fila M/M/1 (utilização, itens no sistema, tempo no sistema) |
| Nakajima, S. *Introduction to TPM* | Definição de OEE e de suas três perdas |

## Ensino com simulação

| Obra | O que embasa |
| --- | --- |
| Dessouky, M. et al. "Virtual Factory Teaching System". *IIE Transactions*, 2001 | Precedente de simulador web de fábrica para ensino; separação entre modelo e interface |
| Simulador web de fábrica virtual, *Winter Simulation Conference*, 2004 ([PDF](https://www.informs-sim.org/wsc04papers/282.pdf)) | Precedente de arquitetura web para simulação de fábrica |

## Análise de saída e aquecimento da simulação

Fonte: pesquisa [Aquecimento em simulação didática](../research/aquecimento-em-simulacao-didatica.md) (20/10/2026). A coluna "Lido" indica se o texto foi lido na íntegra, só pelo resumo ou de forma indireta.

| Obra | O que embasa | Lido |
| --- | --- | --- |
| Law, A. M. *Simulation Modeling and Analysis*. 5. ed. McGraw-Hill, 2015 (cap. 9) | Simulação terminante × regime estável, replicação/deleção | Indireto, pelos tutoriais da WSC |
| Law, A. M. "Design and Analysis of Simulation Experiments Using Three Simple Statistical Formulas". WSC 2023 ([PDF](https://www.informs-sim.org/wsc23papers/124.pdf)) | Exemplo da fábrica de 8 h/dia analisada em regime estável; intervalo de confiança por replicações | Sim |
| Law, A. M. "Statistical Analysis of Simulation Output Data: The Practical State of the Art". WSC 2004 ([PDF](https://www.informs-sim.org/wsc04papers/009.pdf)) | Análise de saída, viés de inicialização | Sim |
| Law, A. M.; McComas, M. G. "Simulation of Manufacturing Systems". WSC 1997 ([PDF](https://www.informs-sim.org/wsc97papers/0086.PDF)) | Manufatura costuma ser estudada em regime estável | Sim |
| Banks, J.; Carson, J. S.; Nelson, B. L.; Nicol, D. M. *Discrete-Event System Simulation*. 5. ed. Prentice-Hall, 2010 (cap. 11) | Classificação pelo objetivo do estudo; número de replicações; inicialização inteligente | Indireto, por slides do capítulo |
| Robinson, S. *Simulation: The Practice of Model Development and Use*. 2. ed. Palgrave Macmillan, 2014 (cap. 9) | Condições iniciais, aquecimento, replicações × corrida longa | Só o sumário |
| Robinson, S. "A Statistical Process Control Approach for Estimating the Warm-up Period". WSC 2002 ([PDF](https://www.informs-sim.org/wsc02papers/055.pdf)) | Duração da corrida ≥ 4× o aquecimento | Sim |
| Alexopoulos, C.; Goldsman, D. "To Batch or Not to Batch". WSC 2003 ([PDF](https://www.informs-sim.org/wsc03papers/059.pdf)) | Replicações × batch means | Sim |
| Alexopoulos, C.; Kim, S.-H. "Output Data Analysis for Simulations". WSC 2002 ([PDF](https://www.informs-sim.org/wsc02papers/012.pdf)) | Mais replicações não reduzem o viés inicial | Sim |
| Welch, P. D. "The Statistical Analysis of Simulation Results". In: *The Computer Performance Modeling Handbook*. Academic Press, 1983 | Procedimento gráfico de Welch | Não |
| White, K. P. "An Effective Truncation Heuristic for Bias Reduction in Simulation Output". *Simulation* 69(6), 1997 | Origem do MSER | Indireto |
| White, K. P.; Cobb, M. J.; Spratt, S. C. "A Comparison of Five Steady-State Truncation Heuristics for Simulation". WSC 2000 | MSER-5 | Indireto |
| Hoad, K.; Robinson, S.; Davies, R. "Automating Warm-up Length Estimation". *JORS* 61(9), 2010 (DOI 10.1057/jors.2009.87) e WSC 2008 ([PDF](https://www.informs-sim.org/wsc08papers/063.pdf)) | MSER-5 como único método robusto para automação (projeto AutoSimOA) | WSC na íntegra; JORS pelo resumo |
| Hoad, K.; Robinson, S.; Davies, R. "Automated Selection of the Number of Replications for a Discrete-Event Simulation". *JORS* 61(11), 2010 | Número automático de replicações | Resumo |
| Hoad, K.; Robinson, S. "Implementing MSER-5 in Commercial Simulation Software and Its Wider Implications". WSC 2011 ([PDF](https://www.informs-sim.org/wsc11papers/044.pdf)) | Requisitos práticos: séries desagregadas, média entre replicações | Sim |
| Franklin, W. W.; White, K. P. "Stationarity Tests and MSER-5". WSC 2008 ([PDF](https://www.informs-sim.org/wsc08papers/064.pdf)) | Intuição e limites do MSER-5 | Sim |
| Mahajan, P. S.; Ingalls, R. G. "Evaluation of Methods Used to Detect Warm-up Period in Steady State Simulation". WSC 2004 ([PDF](https://www.informs-sim.org/wsc04papers/080.pdf)) | Nenhum método funciona em alta utilização com corridas curtas | Sim |
| Pasupathy, R.; Schmeiser, B. "The Initial Transient in Steady-State Point Estimation". WSC 2010 ([PDF](https://www.informs-sim.org/wsc10papers/017.pdf)) | Fundamento do critério MSER | Sim |
| Sánchez, P. J.; White, K. P. "Interval Estimation Using Replication/Deletion and MSER Truncation". WSC 2011 ([PDF](https://www.informs-sim.org/wsc11papers/043.pdf)) | MSER com replicações | Sim |
| White, K. P.; Robinson, S. "The Problem of the Initial Transient (Again), or Why MSER Works". *Journal of Simulation* 4(4), 2010 | Defesa do MSER | Resumo |
| Wang, R. J.; Glynn, P. W. "On the Marginal Standard Error Rule...". *ACM TOMACS* 27(1), 2016 | Contraexemplos ao MSER | Resumo |
| Ni, E. C.; Henderson, S. G. "How Hard Are Steady-State Queueing Simulations?". *ACM TOMACS*, 2015 ([PDF](https://people.orie.cornell.edu/shane/pubs/howhard.pdf)) | Escala do viés e da variância com a utilização | Sim |
| Whitt, W. "Planning Queueing Simulations". *Management Science* 35(11), 1989 | Duração de corridas para validar filas | Não |
| Madansky, A. "Optimal Conditions for a Simulation of the M/M/1 Queue". *Operations Research* 24(3), 1976 | Começar vazio minimiza o erro quadrático para corridas longas | Resumo |
| Little, J. D. C. "Little's Law as Viewed on Its 50th Anniversary". *Operations Research* 59(3), 2011 (DOI 10.1287/opre.1110.0940) | Lei de Little exata em janelas finitas (LL.1 e LL.2): teste unitário exato do motor | Sim |
| Glasserman, P.; Yao, D. D. "Some Guidelines and Guarantees for Common Random Numbers". *Management Science* 38(6), 1992 | Números aleatórios comuns entre cenários | Sim |

Documentação de ferramentas consultada (aquecimento em produtos comerciais): ajuda do Simul8, fórum do Simio, fórum do FlexSim, ajuda do Siemens Plant Simulation v15 e do ProModel. Os links estão no relatório da pesquisa.

## Explicações na interface e aprendizagem

Fonte: pesquisa [Explicação em camadas na interface](../research/explicacao-em-camadas-na-interface.md) (20/10/2026), onde está a lista completa (68 itens). Abaixo, as obras que embasam decisões. "Prévio" = citado de conhecimento prévio do pesquisador, sem reabrir a fonte; conferir antes de uso público.

| Obra | O que embasa | Lido |
| --- | --- | --- |
| Nielsen, J. "Progressive Disclosure". NN/g, 2006 | No máximo dois níveis de revelação (dica → painel) | Sim |
| Kendrick, A. "Tooltip Guidelines". NN/g, 2019 | Dica curta, nunca com informação essencial; abrir por foco e toque | Sim |
| Laubheimer, P. "Onboarding Tutorials vs. Contextual Help". NN/g, 2023 | Ajuda que o usuário puxa, em vez de tours obrigatórios | Sim |
| Fessenden, T. "Modal & Nonmodal Dialogs". NN/g, 2017 | Painel lateral não modal, que mantém o contexto | Sim |
| Nielsen, J. "Paradox of the Active User". NN/g, 1998 (sobre Carroll e Rosson, 1987) | Usuários agem antes de ler; ajuda curta e ligada à tarefa | Sim |
| Carroll, J. M. *The Nurnberg Funnel*. MIT Press, 1990 | Instrução minimalista, ligada ao sistema real | Secundário |
| Novick, D. G.; Ward, K. "Why Don't People Read the Manual?". SIGDOC 2006 | Pessoas evitam manuais e ajuda online | Sim |
| W3C. WCAG 2.2, critério 1.4.13 "Content on Hover or Focus" | Dica dispensável com Esc, que aceita o ponteiro por cima e persiste | Sim |
| W3C WAI. ARIA Authoring Practices, "Tooltip Pattern" | Nada focável dentro da dica; `aria-describedby` | Sim |
| Pickering, H. "Tooltips & Toggletips". *Inclusive Components*, 2017 | "Saiba mais" como botão próprio (*toggletip*), que funciona no toque | Sim |
| IBM. Carbon Design System, "Tooltip" | Dica de definição para termos; regras de campo sempre visíveis | Sim |
| Chandler, P.; Sweller, J. "The Split-Attention Effect...". *Br. J. Educ. Psychol.*, 1992; Ginns, P. *Learning and Instruction*, 2006 | Explicação perto do que explica | Secundário |
| Mayer, R. E. *Multimedia Learning*. 3. ed. Cambridge, 2020 | Sinalização, segmentação, contiguidade, pré-treino | Secundário (tamanhos de efeito divergem entre edições) |
| de Jong, T.; van Joolingen, W. R. "Scientific Discovery Learning with Computer Simulations...". *RER* 68(2), 1998 | Dificuldades do aluno em simulações: hipóteses, experimentos, interpretação, regulação | Secundário |
| Alfieri, L. et al. "Does Discovery-Based Instruction Enhance Learning?". *J. Educ. Psychol.* 103(1), 2011 | Descoberta sem apoio perde; descoberta orientada ganha | Sim |
| Lazonder, A. W.; Harmsen, R. "Meta-Analysis of Inquiry-Based Learning: Effects of Guidance". *RER* 86(3), 2016 | Orientação melhora a aprendizagem em simulações | Sim |
| Podolefsky, N. S.; Moore, E. B.; Perkins, K. K. "Implicit Scaffolding in Interactive Simulations". 2013 (PhET) | Guiar pelo próprio desenho da simulação, não só por texto | Sim |
| Wieman, C. E.; Adams, W. K.; Perkins, K. K. "PhET: Simulations That Enhance Learning". *Science* 322, 2008 | Simulações interativas no ensino | Secundário |
| Barbieri, C. A. et al. "A Meta-Analysis of the Worked Examples Effect...". *Educ. Psychol. Rev.* 35, 2023 | Exemplos resolvidos | Sim |
| Fyfe, E. R. et al. "Concreteness Fading...". *Educ. Psychol. Rev.* 26, 2014 | Do concreto (a planta aberta) ao abstrato (a regra geral) | Sim |
| Walkington, C. A. "Using Adaptive Learning Technologies to Personalize Instruction...". *J. Educ. Psychol.* 105(4), 2013 | Personalização de contexto | Prévio |
| Sterman, J. D. "Modeling Managerial Behavior: Misperceptions of Feedback...". *Management Science* 35(3), 1989 | Intuição falha em sistemas com fluxo e atraso; justifica explicar resultados | Sim |
| Dobson, G.; Shumsky, R. A. "Web-Based Simulations for Teaching Queueing, Little's Law...". *INFORMS Trans. Educ.* 7(1), 2006 | Precedente de simulações web no ensino de operações | Sim |
| Hattie, J.; Timperley, H. "The Power of Feedback". *RER* 77(1), 2007 | Meta, situação atual e próximo passo no feedback | Prévio |
| Wisniewski, B.; Zierer, K.; Hattie, J. "The Power of Feedback Revisited". *Front. Psychol.* 10, 2020 | Feedback rico em informação tem o maior efeito | Sim |
| Shute, V. J. "Focus on Formative Feedback". *RER* 78(1), 2008 | Feedback específico e elaborado; evitar dicas que sempre terminam na resposta | Prévio |
| Van der Kleij, F. M. et al. "Effects of Feedback in a Computer-Based Learning Environment...". *RER* 85(4), 2015 | Feedback elaborado em ambientes digitais | Sim |
| Kluger, A. N.; DeNisi, A. "The Effects of Feedback Interventions on Performance". *Psychol. Bull.* 119(2), 1996 | Feedback mal desenhado pode piorar o desempenho | Prévio |
| Kalyuga, S. et al. "The Expertise Reversal Effect". *Educ. Psychologist* 38(1), 2003 | Explicação que ajuda o iniciante atrapalha o experiente | Resumo |
| Salden, R. J. C. M. et al. "The Expertise Reversal Effect and Worked Examples in Tutored Problem Solving". *Instr. Sci.* 38, 2010 | Retirar a explicação conforme o domínio | Prévio |
| Karich, A. C.; Burns, M. K.; Maki, K. E. "Updated Meta-Analysis of Learner Control...". *RER* 84(3), 2014 | Deixar o aluno escolher o nível de ajuda tem efeito quase nulo | Resumo |
| Aleven, V. et al. "Help Seeking and Help Design in Interactive Learning Environments". *RER* 73(3), 2003 | Alunos usam mal a ajuda sob demanda | Prévio |
| Koedinger, K. R.; Aleven, V. "Exploring the Assistance Dilemma...". *Educ. Psychol. Rev.* 19(3), 2007 | Dar ou reter informação: dilema sem solução única | Sim |
| Sinha, T.; Kapur, M. "When Problem Solving Followed by Instruction Works...". *RER* 91(5), 2021 | Tentar antes de receber a explicação (*productive failure*) | Secundário |
| Bansal, G. et al. "Does the Whole Exceed its Parts?". CHI 2021; Buçinca, Z. et al. "To Trust or to Think". CSCW 2021 | Explicações aumentam a aceitação cega; decidir antes de ver reduz | Sim |
| Belia, S. et al. "Researchers Misunderstand Confidence Intervals...". *Psychol. Methods* 10(4), 2005 | Intervalos de confiança são mal lidos | Sim |
| Hullman, J.; Resnick, P.; Adar, E. "Hypothetical Outcome Plots...". *PLOS ONE*, 2015; Padilla, L.; Kay, M.; Hullman, J. "Uncertainty Visualization", 2022 | Como mostrar incerteza a leigos | Sim |
| van der Bles, A. M. et al. "The Effects of Communicating Uncertainty on Public Trust...". *PNAS* 117(14), 2020 | Mostrar incerteza não reduz a confiança na fonte | Sim |

## Mercado

As fontes do levantamento de concorrência estão no [relatório inicial](../archive/2026-10-19-relatorio-inicial.md#fontes).

**Atenção:** algumas são de sites secundários (agregadores e espelhos) e devem ser trocadas pelas páginas oficiais dos fornecedores antes de qualquer uso público.

## A ler

- Os dois trabalhos de ensino com simulação, antes do marco 5, para aproveitar o que já foi aprendido.
