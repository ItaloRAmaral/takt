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

## Geração de números aleatórios

Pesquisa rápida de 20/10/2026, para a escolha do gerador do motor.

| Obra | O que embasa | Lido |
| --- | --- | --- |
| L'Ecuyer, P. "Good Parameters and Implementations for Combined Multiple Recursive Random Number Generators". *Operations Research* 47(1), 1999 | Definição do MRG32k3a | Não (citado pelas fontes abaixo) |
| L'Ecuyer, P.; Simard, R.; Chen, E. J.; Kelton, W. D. "An Object-Oriented Random-Number Package with Many Long Streams and Substreams". *Operations Research* 50(6):1073–1075, 2002 (DOI [10.1287/opre.50.6.1073.358](https://pubsonline.informs.org/doi/suppl/10.1287/opre.50.6.1073.358)) | Pacote RngStreams: sequências e subsequências independentes; implementações de referência em C, C++ e Java | Resumo |
| L'Ecuyer, P. et al. Artigo da *Winter Simulation Conference* 2001 ([PDF](https://informs-sim.org/wsc01papers/012.PDF)) | O pacote de sequências foi implementado no Arena e no AutoMod | Trecho |
| MathWorks. "Creating and Controlling a Random Number Stream" ([documentação](https://www.mathworks.com/help/matlab/math/creating-and-controlling-a-random-number-stream.html)) | MRG32k3a no MATLAB: período 2^191, sequências e subsequências | Trecho |
| ns-3 / ns-2. Documentação de geração de números aleatórios ([ns-2](https://www.isi.edu/websites/nsnam/ns/doc/node267.html); [ns-3 RngStream](https://www.nsnam.org/docs/release/3.9/doxygen/classns3_1_1_rng_stream.html)) | MRG32k3a como gerador padrão de simuladores de rede | Trecho |
| Intel oneMKL, "mrg32k3a" ([documentação](https://www.intel.com/content/www/us/en/docs/onemkl/developer-reference-dpcpp/2025-2/mrg32k3a-001.html)); NVIDIA cuRAND, "Testing" ([documentação](https://docs.nvidia.com/cuda/archive/13.4.1/curand/testing.html)) | MRG32k3a em bibliotecas numéricas; resultados no BigCrush | Trecho |
| "Assessing the Stochastic Properties of Modern Pseudo-Random Generators for Parallel Computing". arXiv:2605.18227, 2026 ([PDF](https://arxiv.org/pdf/2605.18227)) | Qualidade do MRG32k3a com muitos estados iniciais (pré-publicação, sem revisão por pares) | Trecho |
| Vigna, S. Implementação de MRG32k3a sem testes condicionais ([repositório](https://awesome.ecosyste.ms/projects/github.com%2Fvigna%2Fmrg32k3a)) | Implementação alternativa de referência, com saída idêntica à original | Trecho |
| Schmeiser, B. W.; Kachitvichyanukul, V. "Correlation Induction without the Inverse Transformation". WSC 1986 | Métodos de rejeição dessincronizam os fluxos; inversão os mantém | Trecho |
| Glasserman, P.; Yao, D. D. "Some Guidelines and Guarantees for Common Random Numbers". *Management Science* 38(6):884–908, 1992 ([PDF](https://business.columbia.edu/sites/default/files-efs/pubfiles/4261/glasserman_yao_guidelines.pdf)) | Ganho dos números aleatórios comuns depende de monotonicidade | Sim (pesquisa anterior) |
| Haas, P. Notas de aula CS 590M, UMass ([slides](https://people.cs.umass.edu/~phaas/CS590M/slides/slecture11h.pdf)) | Sincronização e fluxos dedicados por variável aleatória | Trecho |
| Runuran (pacote R), "use.aux.urng" ([documentação](https://rdrr.io/cran/Runuran/man/use.aux.urng-method.html)) | Inversão cria fluxos correlacionados a partir dos mesmos uniformes | Trecho |
| Wichura, M. J. "Algorithm AS 241: The Percentage Points of the Normal Distribution". *Applied Statistics* 37(3):477–484, 1988 ([PDF](https://csg.sph.umich.edu/abecasis/gas_power_calculator/algorithm-as-241-the-percentage-points-of-the-normal-distribution.pdf)) | Inversa da normal com cerca de 16 dígitos de precisão | Trecho |
| R Core. `qnorm.c` ([código](https://svn.r-project.org/browse/R/trunk/src/nmath/qnorm.c?peg=11368)) | O R usa o AS 241, com melhorias nas caudas | Trecho |
| SAS. "The Inverse CDF Method" ([blog](https://blogs.sas.com/content/iml/2013/07/22/the-inverse-cdf-method.html)) | Normal truncada pela inversão em [F(a), F(b)] | Trecho |
| GNU Octave, `triinv` ([documentação](https://octave.sourceforge.io/statistics/function/triinv.html)) | Referência para conferir a inversa da triangular | Trecho |
| pure-rand (npm) ([README](https://cdn.jsdelivr.net/npm/pure-rand@8.4.0/README.md)) | Alternativa em JavaScript: xoroshiro128+, com saltos | Trecho |
| stdlib (npm), `@stdlib/random-base-mt19937` ([README](https://github.com/stdlib-js/random-base-mt19937/blob/umd/README.md)) | Alternativa em JavaScript: Mersenne Twister | Trecho |

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

## Front-end

Fonte: pesquisa [Escolhas técnicas do front-end](../research/escolhas-tecnicas-do-front-end.md) (20/10/2026), com a lista completa (cerca de 180 itens, entre documentação oficial, avisos de segurança, registros do npm e pesquisas de mercado). Abaixo, as fontes primárias que embasam as recomendações.

| Fonte | O que embasa |
| --- | --- |
| Next.js. "Next.js Security Update: October 14, 2026" ([blog](https://nextjs.org/blog/nextjs-security-update-october-14-2026)); NVD, CVE-2025-29927 ([nvd](https://nvd.nist.gov/vuln/detail/cve-2025-29927)); Datadog, CVE-2025-55182 ([artigo](https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/)) | Vulnerabilidades graves no servidor do framework |
| Next.js Docs. "Static Exports" e "rewrites" ([static](https://nextjs.org/docs/app/guides/static-exports); [rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)) | Exportação estática não tem rewrites nem proxy |
| TanStack. "Security update: CVE-2026-102989" ([blog](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989)); GitHub Advisory GHSA-2w69-qvjg-hvjx (React Router) | Vulnerabilidades nos servidores de outros frameworks |
| Vite. "Announcing Vite 8" ([blog](https://vite.dev/blog/announcing-vite8)); Vite Docs, "Server Options" e "Web Workers" | Vite 8, proxy de desenvolvimento, Workers |
| Remix. "React Router v8" ([blog](https://remix.run/blog/react-router-v8)); React Router Docs, "SPA Mode" | React Router 8 |
| Nx Docs. "React Router guide" ([docs](https://nx.dev/docs/technologies/react/guides/react-router)) | Suporte do Nx |
| Devographics. State of JS 2025 e State of React 2024–2025 ([JS](https://2025.stateofjs.com/en-US/libraries/); [React](https://2025.stateofreact.com/en-US/libraries/state-management/)) | Adoção e satisfação de frameworks e bibliotecas de estado |
| pmndrs. R3F "Scaling performance", "Performance pitfalls", "Testing" ([docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)) | Limite de chamadas de desenho, atualizações fora do React, testes |
| three.js Docs. BatchedMesh, Raycaster, TransformControls ([docs](https://threejs.org/docs/pages/TransformControls.html)) | Instâncias, seleção, encaixe e rotação |
| gpuweb. "Implementation Status" ([wiki](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)); caniuse, WebGPU | Suporte a WebGPU por navegador; necessidade de WebGL2 |
| Microsoft. "Announcing Babylon.js 9.0" ([blog](https://blogs.windows.com/windowsdeveloper/2026/03/26/announcing-babylon-js-9-0)) | Alternativa 3D |
| MDN. "Storage quotas and eviction criteria" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)); WebKit, "Full Third-Party Cookie Blocking and More" (2020) e "Updates to Storage Policy" (2023) | Safari apaga dados do site após 7 dias sem interação |
| Surma. "Is postMessage slow?" ([artigo](https://surma.dev/things/is-postmessage-slow/), 2019) | Custo de cópia entre Worker e página |
| Immer Docs. Patches; TanStack Query Docs. Comparison | Desfazer e dados do servidor |
| shadcn/ui. "Base UI as the Default" e "React Aria" ([changelog](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)) | Base de componentes |
| Base UI, React Aria e Radix. Documentação de Tooltip | Comportamento da dica no toque e no foco |
| next-intl Docs. "Core library (use-intl)" ([docs](https://next-intl.dev/docs/environments/core-library)); MDN, `Intl.NumberFormat` e `Intl.PluralRules` | i18n com mensagens ICU; plural do pt-BR |
| React. "Static React DOM APIs" ([docs](https://react.dev/reference/react-dom/static)) | Geração de HTML no build (`prerender`), sem servidor em execução |
| React Router Docs. "Pre-Rendering" ([docs](https://reactrouter.com/how-to/pre-rendering)) | `ssr: false` com `prerender` de páginas escolhidas e HTML de *fallback* |
| npm registry: react 19.3.1 (14/10/2026), @react-three/fiber 9.8.2 (aceita React ≥19 e <19.4), react-router 8.5.0 | Versões e compatibilidade, consultadas em 20/10/2026 |
| ECharts Handbook, "Aria" ([docs](https://echarts.apache.org/handbook/en/best-practices/aria/)); Recharts Docs, "Performance guide" | Gráficos acessíveis e com muitos pontos |

## Agentes, skills e hooks do Claude Code

Fonte: pesquisa [Agentes e skills da comunidade](../research/agentes-e-skills-da-comunidade.md) (20/10/2026), com estrelas e datas conferidas na API do GitHub e a lista completa de links.

| Fonte | O que embasa |
| --- | --- |
| Anthropic. Claude Code Docs: [memory](https://docs.claude.com/en/docs/claude-code/memory), [sub-agents](https://code.claude.com/docs/en/sub-agents), [skills](https://code.claude.com/docs/en/skills), [hooks guide](https://code.claude.com/docs/en/hooks-guide), [permissions](https://code.claude.com/docs/en/permissions), [plugin security](https://code.claude.com/docs/en/plugins/security) | Estrutura do `CLAUDE.md`, subagentes, skills, hooks e permissões; hook que bloqueia `git commit` |
| Anthropic. "Skill authoring best practices" ([docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)) | Como escrever skills: descrição, tamanho, referências, avaliação |
| Anthropic. Plugins oficiais [`code-review`](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-review/commands/code-review.md) e [`feature-dev`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) | Revisão com corte por confiança; agentes só de leitura |
| obra. [superpowers](https://github.com/obra/superpowers/tree/main/skills) (MIT) | Revisor com contexto novo, "Declined to judge", TDD estrito, testes de pressão de skills; skills `planning-code-changes` e `writing-tests` (ciclo vermelho-verde, "nomear a quebra", valores esperados independentes) |
| Sentry. [`security-review`](https://github.com/getsentry/skills/blob/main/skills/security-review/SKILL.md) | Revisão de segurança só com alta confiança |
| Sentry. [`skill-writer`](https://github.com/getsentry/skills/tree/main/skills/skill-writer) (Apache-2.0, lido em 21/10/2026) | Skill `writing-skills-and-agents`: substituir antes de acrescentar, formato mais simples primeiro, `SOURCES.md` e `SPEC.md`, validador de estrutura |
| Anthropic. [`skill-creator`](https://github.com/anthropics/skills) (Apache-2.0, lido em 21/10/2026) | Skill `writing-skills-and-agents`: perguntas de intenção, explicar o porquê, listas de pedidos que acionam ou não, teste com e sem a skill |
| Anthropic. [Issue #556 de `anthropics/skills`](https://github.com/anthropics/skills/issues/556) | Não usar o teste automático de acionamento via `claude -p` |
| Trail of Bits. [skills](https://github.com/trailofbits/skills) | Revisão diferencial, verificação de falsos positivos, cadeia de suprimentos |
| Matt Pocock. [`tdd`](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md) e [`improve-codebase-architecture`](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) | Valor esperado vindo da especificação; não rediscutir decisões aceitas; skill `writing-tests` (testar na fronteira pública, dublês só nas bordas do sistema) |
| wshobson. [`architecture-decision-records`](https://github.com/wshobson/agents/blob/main/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md) (MIT, lido em 03/11/2026) | Skill de ADR com modelos carregados sob demanda; skill `writing-decision-records` (checklist de revisão, contexto do registro que substitui outro) |
| Matt Pocock. [`domain-modeling`](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) (MIT, lido em 03/11/2026) | Skill `writing-decision-records`: registrar só quando a decisão é difícil de reverter, surpreendente sem contexto e fruto de troca real |
| Michael Nygard. ["Documenting Architecture Decisions"](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (2011) | Origem dos ADRs: decisões "arquiteturalmente significativas", contexto neutro, todas as consequências, registros substituídos mantidos |
| ADR org. [Template MADR](https://github.com/adr/madr/blob/main/template/adr-template.md) (MIT ou CC0) | Seção de confirmação (verificação automática da decisão), base da orientação para "Conformidade" |
| Test Double. "Keep your coding agent on task with mutation testing" ([artigo](https://testdouble.com/insights/keep-your-coding-agent-on-task-with-mutation-testing)) | Ciclo de mutação com agente |
| Playwright. "Test Agents" ([docs](https://playwright.dev/docs/test-agents)) | Agentes de planejamento, geração e correção de testes ponta a ponta |
| Anthropic. [`claude-code-action`](https://github.com/anthropics/claude-code-action) e [`claude-code-security-review`](https://github.com/anthropics/claude-code-security-review) | Revisão em pull request; a segunda está parada desde 02/2026 |
| Snyk ToxicSkills, NVIDIA SkillSpector e `snyk/agent-scan` (links no relatório) | Incidentes com skills de terceiros e ferramentas para verificá-las |

## Estilo de código

Fonte: pesquisa [Guia de estilo de código](../research/guia-de-estilo-de-codigo.md) (21/10/2026), com a lista completa de links, inclusive os estudos empíricos. Usada em [`code-style.md`](../architecture/code-style.md) e em `.claude/rules/`.

| Fonte | O que embasa |
| --- | --- |
| Ousterhout e Martin. ["aposd-vs-clean-code"](https://github.com/johnousterhout/aposd-vs-clean-code) (2024–2025); Ousterhout, *A Philosophy of Software Design* | Tamanho de função sem limite fixo, módulos profundos, comentários do porquê |
| Fowler. [BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html), [Yagni](https://martinfowler.com/bliki/Yagni.html), [FunctionLength](https://martinfowler.com/bliki/FunctionLength.html) | Ordem de prioridade do design, YAGNI e sua exceção, extrair por intenção |
| Metz. ["The Wrong Abstraction"](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction); Dodds, ["AHA Programming"](https://kentcdodds.com/blog/aha-programming); Abramov, ["Goodbye, Clean Code"](https://overreacted.io/goodbye-clean-code/) | Duplicação em vez da abstração errada; regra de três |
| Hofmeister, Siegmund e Holt. SANER 2017 ([PDF](https://www.se.cs.uni-saarland.de/publications/docs/HoSeHo17.pdf)) | Nomes por extenso lidos mais rápido |
| Google. [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html); [AIP-140](https://google.aip.dev/140) e [AIP-141](https://google.aip.dev/141) | Convenções de TypeScript; unidade como sufixo do nome |
| typescript-eslint. [Configs](https://typescript-eslint.io/users/configs) e [regras](https://typescript-eslint.io/rules/); TypeScript, [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) e [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) | O que a ferramenta impõe; proibição de `enum` |
| Microsoft. Anúncios do [TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) e do [7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) | Decisão pendente D5 |
| NestJS. [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers), [Exception filters](https://docs.nestjs.com/exception-filters); Prisma, ["Prisma ORM 8 in NestJS"](https://www.prisma.io/blog/prisma-orm-8-nestjs) | Portas como token, `@Inject` explícito, filtro global |
| Prisma. [Client extensions](https://www.prisma.io/docs/orm/prisma-client/client-extensions), [Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions), [exemplo de RLS](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security) | Decisão pendente D1 |
| Cockburn. ["Hexagonal Architecture"](https://alistair.cockburn.us/hexagonal-architecture/); Fowler, [Repository](https://martinfowler.com/eaaCatalog/repository.html) e [DDD_Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html); Microsoft, [persistence layer design](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design) | Uma porta por conversa, um repositório por raiz de agregado |
| Seemann. ["Interfaces are not abstractions"](https://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/) e ["Functional architecture is Ports and Adapters"](https://blog.ploeh.dk/2016/03/18/functional-architecture-is-ports-and-adapters/); Bernhardt, ["Functional Core, Imperative Shell"](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell) | Critério contra porta 1:1; motor como núcleo funcional |
| MDN. [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) e [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map); V8, ["Fast properties"](https://v8.dev/blog/fast-properties) | Ordem de iteração, forma estável no laço quente; decisão pendente D4 |
| Anthropic. Claude Code Docs, [path-specific rules](https://code.claude.com/docs/en/memory#path-specific-rules) | Arquivos de `.claude/rules/` com `paths` |
| Vitest. API, [`test.each`](https://vitest.dev/api/#test-each) (lido em 03/11/2026) | Tabela de casos permitida nos testes, com quatro condições |
| `cliniccontrol` (projeto anterior do fundador, referência, não padrão) | Problemas a não repetir e itens de segurança da checklist de revisão |

## Mercado

As fontes do levantamento de concorrência estão no [relatório inicial](../archive/2026-10-19-relatorio-inicial.md#fontes).

**Atenção:** algumas são de sites secundários (agregadores e espelhos) e devem ser trocadas pelas páginas oficiais dos fornecedores antes de qualquer uso público.

## A ler

- Os dois trabalhos de ensino com simulação, antes do marco 5, para aproveitar o que já foi aprendido.
