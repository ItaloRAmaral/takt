# Ajuda contextual, divulgação progressiva e tooltips vs. painéis laterais vs. documentação (evidência HCI/UX para o Takt)

Convenções desta nota:
- **Cited Findings** contém só fatos ligados a uma fonte consultada nesta pesquisa (outubro de 2026). Quando a informação veio de resumo secundário, isso está indicado.
- Em **Inferences**, cada item vem marcado como **[Estimativa]** (dedução razoável a partir das fontes) ou **[Palpite]** (opinião de design com pouca base direta).
- O que não consegui verificar está em **Gaps**.

Design avaliado, com três camadas:
- **(1)** tooltip curto em termos, KPIs e campos;
- **(2)** painel lateral "Saiba mais", com explicação completa, fórmula e exemplo usando os números do próprio modelo do usuário;
- **(3)** explicação contextual de cada resultado.

---

## 1. O que NN/g e HCI dizem sobre tooltips, ajuda contextual, ajuda inline, painéis e divulgação progressiva (progressive disclosure)

### Takeaway
Tooltips servem para microconteúdo **curto e não essencial**, acionado pelo usuário por hover **e** foco. Informação necessária para concluir a tarefa não deve ficar escondida neles.

A NN/g recomenda ajuda contextual "puxada" pelo usuário (pull revelations) em vez de ajuda "empurrada" (push). Também recomenda divulgação progressiva com no máximo **dois níveis**. O desenho de 3 camadas do Takt está alinhado com isso, desde que:
- a camada 1 nunca carregue informação essencial;
- a passagem para a camada 2 seja óbvia;
- não se crie um terceiro nível de profundidade.

### Cited Findings

**Tooltips (NN/g, Kendrick 2019)**

Fonte única deste bloco: Alita Kendrick, "Tooltip Guidelines", Nielsen Norman Group, 27/01/2019 — [NN/g](https://www.nngroup.com/articles/tooltip-guidelines/).

- **Definição.** Tooltips são mensagens breves que aparecem quando o usuário interage com um elemento da interface. São acionadas pelo usuário e ficam presas a elementos ativos (ícones, links, botões). Dicas que aparecem sozinhas para anunciar recursos **não** são tooltips.
- **Quando usar.** Para explicar campos de formulário "unfamiliar to some users" e para ícones sem rótulo. Neste caso, um rótulo de texto visível é preferível, e o tooltip é "the least you can do".
- **Não usar sem conteúdo útil.** "If you can't think of particularly helpful content, don't offer a tooltip."
- **Informação essencial.** "Users shouldn't need to find a tooltip in order to complete their task." Informação essencial e acionável, como requisitos de senha ou de campo, não deve ir em tooltip, porque ele desaparece. Teste proposto: a informação é necessária para completar a tarefa? Se sim, mantenha-a na tela.
- **Tamanho.** Tooltips são "microcontent" ("short text fragments intended to be self-sufficient"). Conteúdo longo deixa de ser "tip". Uma ou várias linhas são aceitáveis se o texto for relevante e não cobrir conteúdo relacionado.
- **Redundância.** "Tooltips with obvious or redundant text are not beneficial to users." Tooltips inúteis criam "information pollution".
- **Gatilhos.** Devem aparecer em hover do mouse **e** em "keyboard hover" (foco mantido). "Tooltips that appear only on mouse hover are inaccessible for users that rely on keyboards."
- **Touch.** Tooltips "not normally available on touchscreens". A alternativa em touch são popup tips acionados por toque ou clique.
- **Descoberta e consistência.** Tooltips são difíceis de descobrir porque não têm pista visual. Devem ser aplicados de forma consistente a todos os elementos relevantes; uso inconsistente faz o usuário nunca descobri-los.
- **Visual.** Use setas quando houver vários elementos próximos. Garanta contraste: cinza-claro sobre branco é "especially difficult to read". Posicione o tooltip para não cobrir conteúdo relacionado.
- **Atraso.** O artigo não dá valores de atraso (delay) para exibir ou ocultar.

**Ajuda e documentação (heurística 10)**

Fonte única deste bloco: Alita Kendrick, "Help and Documentation (Usability Heuristic #10)", NN/g, 13/12/2020 — [NN/g](https://www.nngroup.com/articles/help-and-documentation/).

- **Ajuda proativa vs. reativa.** A ajuda proativa (proactive help) familiariza o usuário com a interface. A reativa (reactive help) responde dúvidas e oferece material detalhado: FAQ, documentação técnica, tutoriais.
- **Push vs. pull.** Push revelations são "assistance or help content that isn't relevant to the users' goals" e costumam ser ignoradas por interromper e não ter contexto. Pull revelations aparecem "when the mouse is near corresponding controls or when the user has started a corresponding flow", via tooltips, overlays contextuais ou wizards, e são menos ignoradas.
- **Recomendações.**
  - "Favor pull over push revelations."
  - A ajuda proativa deve ser curta, relevante e escrita na perspectiva do usuário.
  - A ajuda push deve ser fácil de dispensar e acessível depois, por exemplo via link na interface.
  - A documentação reativa deve ser completa, organizada em blocos (chunking), com títulos, listas numeradas e busca funcional.
  - Vídeo deve ser fonte secundária.

**Onboarding vs. ajuda contextual**

Fonte única deste bloco: Page Laubheimer, "Onboarding Tutorials vs. Contextual Help", NN/g, 12/02/2023 — [NN/g](https://www.nngroup.com/articles/onboarding-tutorials/).

- Tutoriais de onboarding: "users frequently skip them". Eles "don't result in better task performance" e não são memoráveis.
- Exemplos positivos citados:
  - Photoshop: tooltip com animação curta e opção "Learn how" para quem quer mais. É análogo direto da camada 1 → camada 2 do Takt.
  - Figma: dica sobre layout de texto mostrada só depois que o usuário cria uma caixa de texto.
  - ArcGIS: tutorial que fica disponível na barra lateral (sidebar) para revisão posterior.
- Recomendações do artigo:
  1. Ajuda fácil de dispensar e de recuperar.
  2. Divulgação progressiva: a existência da ajuda fica visível e os detalhes aparecem sob demanda.
  3. Não exigir memorização; mostrar a ajuda junto de cada passo.
  4. Não explicar padrões convencionais.
  5. Usar pesquisa com usuários e análise de tarefas para descobrir quando a ajuda é necessária.

**Divulgação progressiva**

Fonte única deste bloco: Jakob Nielsen, "Progressive Disclosure", NN/g, 03/12/2006 — [NN/g](https://www.nngroup.com/articles/progressive-disclosure/).

- **Definição.** Mostrar primeiro poucas opções importantes e oferecer o conjunto especializado sob demanda. Isso melhora 3 dos 5 componentes de usabilidade: aprendizado (learnability), eficiência e taxa de erro.
- **O que aparece primeiro sinaliza importância.** "the very fact that something appears on the initial display tells users that it's important."
- **Limite de níveis.** Designs com mais de dois níveis de divulgação "typically have low usability", porque o usuário se perde entre níveis.
- **Critérios de projeto.**
  - Dividir corretamente o que fica no nível inicial e o que fica no secundário.
  - Tornar a progressão óbvia: o botão ou link para o próximo nível deve ser visível e ter rótulo que diga o que o usuário vai encontrar.
- **Staged disclosure.** Wizards funcionam quando os passos são pouco interdependentes. Quando o usuário precisa ir e voltar entre passos, o modelo vira um problema.

**Ajuda inline (design systems)**

- **Carbon (IBM).**
  - Tooltips não devem conter informação essencial para a tarefa, como regras de campo obrigatório; use **helper text** sempre visível.
  - Existe um componente específico, o **definition tooltip**, para "define terms or give extra help within text".
  - Não há limite numérico de caracteres; o texto deve ser curto e sucinto.
  - Fonte: IBM Carbon Design System, "Tooltip – Usage" (acesso em 2026) — [Carbon](https://carbondesignsystem.com/components/tooltip/usage/).
- **GOV.UK, componente Details** (texto expansível).
  - "Do not use the details component to hide information that the majority of your users will need."
  - Serve para informação de que só parte dos usuários precisa.
  - Pesquisa do GOV.UK: alguns usuários evitam clicar no link expansível porque acham que ele os tirará da página.
  - Fonte: GOV.UK Design System, "Details" — [GOV.UK](https://design-system.service.gov.uk/components/details/).

### Inferences
- **[Estimativa] Camada 1, KPIs.** A camada 1 é adequada para *definição* de termos e KPIs, que equivale ao "definition tooltip" do Carbon. **Não** é adequada para regras de entrada de campos, como unidades, faixas válidas ou obrigatoriedade. Essas regras devem ficar em helper text visível.
- **[Estimativa] Camada 1, campos.** Para campos do modelo (tempo de ciclo, número de operadores etc.), o rótulo deve incluir unidade e restrição visíveis, e o tooltip deve só aprofundar.
- **[Estimativa] Encaixe no modelo de dois níveis.** O modelo tooltip → painel "Saiba mais" é exatamente o padrão de dois níveis de Nielsen e o padrão "tooltip + Learn how" do Photoshop citado pela NN/g. Um terceiro salto, como um link do painel para uma página de documentação longa, deve ser evitado ou tratado como saída opcional, não como caminho principal.
- **[Estimativa] Camada 3 como pull revelation.** A explicação contextual de resultados é uma "pull revelation", porque aparece quando o usuário está olhando aquele resultado. É o tipo de ajuda que a NN/g diz ser menos ignorada.
- **[Palpite] Descoberta.** Como tooltips não têm pista visual, os termos com ajuda precisam de marcação consistente, como sublinhado pontilhado ou ícone "i", aplicada a *todos* os KPIs. Isso responde ao problema de descoberta e consistência apontado por Kendrick.

### Gaps
- Não encontrei número oficial da NN/g para comprimento máximo de tooltip em caracteres ou palavras, nem para atraso (delay) de exibição. Valores como "até ~150 caracteres" ou "300–500 ms" circulam em design systems, mas não foram verificados aqui.
- Não encontrei artigo da NN/g dedicado especificamente a "side panels/drawers" como meio de ajuda. A busca não retornou nenhum.
- A página do Material Design 3 sobre tooltips (plain vs. rich tooltips, long-press em mobile) não carregou conteúdo no fetch. A orientação do Material não foi verificada.

---

## 2. Minimalismo de Carroll e "paradoxo do usuário ativo" (paradox of the active user): implicações para explicações dentro do produto

### Takeaway
Usuários não leem manuais. Eles começam a agir imediatamente, mesmo quando aprender antes os pouparia de tempo depois. Por isso a explicação precisa estar **embutida na tarefa** e **orientada à ação**, ser curta, apoiar a recuperação de erros e estar ancorada no domínio real do usuário.

Isso valida a ideia de explicar com os números do próprio modelo e de explicar resultados no contexto. Também desaconselha tours e documentação separada como meio principal.

### Cited Findings

**Paradoxo do usuário ativo**
- "Users never read manuals"; eles querem completar a tarefa imediata.
- É um paradoxo porque gastar tempo aprendendo pouparia tempo depois, mas as pessoas não fazem isso. Conclusão: "we must design for the way users actually behave".
- Referência original: Carroll, J.M. & Rosson, M.B. (1987), "The paradox of the active user", in J.M. Carroll (Ed.), *Interfacing Thought: Cognitive Aspects of Human-Computer Interaction*, MIT Press. Os autores estavam no IBM User Interface Institute.
- Fonte: Jakob Nielsen, "Paradox of the Active User", NN/g, 04/10/1998 — [NN/g](https://www.nngroup.com/articles/paradox-of-the-active-user/).

**Novick & Ward (2006)**
- Em 25 entrevistas em profundidade, usuários evitavam tanto manuais em papel quanto ajuda online.
- A ajuda online era mais consultada que o papel, mas as pessoas resolviam problemas com a mesma frequência perguntando a colegas ou experimentando.
- Achavam a ajuda difícil de navegar, sobretudo por não saberem quais termos de busca usar, e se decepcionavam com as explicações.
- Referência: David G. Novick & Karen Ward, "Why don't people read the manual?", *Proc. ACM SIGDOC 2006*, pp. 11–18, DOI 10.1145/1166324.1166329 — [UTEP ScholarWorks](https://scholarworks.utep.edu/cs_papers/15). Resumo obtido via página do repositório e do dblp; não li o texto completo.

**Minimalismo**
- **Obra-base:** Carroll, J.M. (1990), *The Nurnberg Funnel: Designing Minimalist Instruction for Practical Computer Skill*, MIT Press — [EduTechWiki](https://EduTechWiki.unige.ch/en/Minimalist_instruction).
- **Princípios** (resumo secundário) — [Wikipedia, "Minimalism (technical communication)"](https://en.wikipedia.org/wiki/Minimalism_(technical_communication)); [TECFA/Univ. Genève](https://tecfa.unige.ch/themes/sa2/act-app-dos2-fic-minimali.htm):
  1. tarefas de aprendizagem significativas e autocontidas;
  2. projetos realistas o quanto antes;
  3. espaço para raciocínio autodirigido e improvisação;
  4. apoio ao reconhecimento e à recuperação de erros;
  5. ligação estreita entre o treinamento e o sistema real.
- **O que Carroll observou nos aprendizes** (mesmas fontes secundárias): eles "jump the gun", evitam planejar, resistem a sequências detalhadas de passos, sofrem interferência de tarefas parecidas e têm dificuldade de reconhecer, diagnosticar e corrigir erros.
- **Heurísticas de Horn** (resumo da obra de Carroll), entre outras:
  - deixar o usuário escolher tarefas reais;
  - começar com pouca orientação inicial (front-end);
  - permitir leitura em qualquer ordem;
  - dar marcos (landmarks) para situações normais e de erro;
  - apoiar-se em conhecimento prévio.
  - Fonte: [EduTechWiki, "Minimalist instruction"](https://EduTechWiki.unige.ch/en/Minimalist_instruction).
- **Carroll contra o manual monolítico:** defendia treinamento em "short task-oriented chunks" em vez de documentação longa e monolítica (resumo secundário) — [Wikipedia](https://en.wikipedia.org/wiki/Minimalism_(technical_communication)).
- **Ressalva do próprio Carroll:** não existe teoria dedutiva do minimalismo; dos princípios não se "fabrica" um manual mecanicamente — [Wikipedia](https://en.wikipedia.org/wiki/Minimalism_(technical_communication)).
- **Heurísticas formais:** van der Meij, H. & Carroll, J.M. (1995), "Principles and heuristics for designing minimalist instruction", *Technical Communication* 42(2), 243–261. Reimpresso em Carroll (Ed.) (1998), *Minimalism Beyond the Nurnberg Funnel*, MIT Press, pp. 20–53.
  - Um artigo de 2021 descreve essas heurísticas como "based on solid empirical research" e observa que elas raramente são aplicadas na prática.
  - Fonte: Virtaluoto, Suojanen & Isohella (2021), Univ. Vaasa — [Osuva](https://osuva.uwasa.fi/bitstream/10024/12451/2/Osuva_Virtaluoto_Suojanen_Isohella_2021.pdf); citação bibliográfica em [STC](https://www.stc.org/techcomm/?p=52939).

### Inferences
- **[Estimativa] Números do modelo do usuário.** Usar os números do modelo do próprio usuário no exemplo do painel "Saiba mais" aplica diretamente os princípios "ancorar no domínio real" e "ligação estreita com o sistema real". Um exemplo genérico ("imagine uma fábrica com 3 estações…") obrigaria o usuário a fazer a transposição para o próprio caso.
- **[Estimativa] Camada 3 e recuperação de erros.** A explicação contextual de resultados é a camada mais alinhada ao minimalismo, porque responde ao "por que deu isso?" no momento em que o usuário age.
  - Em simulação, um resultado ruim, como um gargalo ou WIP explodindo, é um "erro" produtivo.
  - O minimalismo recomenda apoiar diagnóstico e recuperação, por exemplo: "o throughput caiu porque a estação 3 tem utilização de 98%; tente…".
- **[Estimativa] O que não fazer.** Documentação longa separada e tours obrigatórios contrariam o paradoxo do usuário ativo. A documentação pode existir como ajuda reativa (seção 1), mas não deve ser o meio principal.
- **[Palpite] Painel em blocos curtos.** O painel "Saiba mais" deve ser lido em pedaços curtos e independentes, por exemplo "O que é", "Fórmula", "No seu modelo", "O que fazer para melhorar". Isso permite leitura em qualquer ordem, como na heurística de Horn.

### Gaps
- Não consegui o texto original de Carroll & Rosson (1987). Os conceitos de "production bias" e "assimilation bias", associados a esse paper, **não foram verificados** nas fontes consultadas e não aparecem no artigo da NN/g.
- Não verifiquei números empíricos dos estudos do "Minimal Manual" da IBM, como redução percentual do tempo de aprendizagem. Os valores que circulam não foram confirmados aqui.
- Os princípios de Carroll vieram de resumos secundários (Wikipedia, wikis universitários), não do livro.

---

## 3. Acessibilidade: WCAG 2.2 SC 1.4.13, padrão de tooltip da WAI-ARIA (APG) e touch/mobile

### Takeaway
Qualquer conteúdo que aparece em hover ou foco precisa ser:
- **dispensável** (dismissible), com Esc sem mover o ponteiro;
- **sobrevoável** (hoverable);
- **persistente** (persistent).

Esse é o critério WCAG 1.4.13, nível AA. Também precisa aparecer por **foco de teclado**, e tooltips **não podem conter elementos interativos**.

Consequência direta para o Takt: o link "Saiba mais" **não pode ficar dentro do tooltip**. Ele deve ser um botão separado ou um "toggletip"/popover clicável.

Em touch, tooltips de hover não funcionam. É preciso um gatilho por toque ou clique.

### Cited Findings

**WCAG 2.2 SC 1.4.13 Content on Hover or Focus (nível AA)**

Fonte deste bloco: W3C, "Understanding SC 1.4.13: Content on Hover or Focus", WCAG 2.2 — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).

- **Dismissible:** "mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus". Exceções: o conteúdo comunica erro de entrada, ou não obscurece nem substitui outro conteúdo.
- **Hoverable:** "the pointer can be moved over the additional content without the additional content disappearing".
- **Persistent:** "The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid".
- **Exceção geral:** apresentação controlada pelo user agent e não modificada pelo autor, como o atributo `title` nativo.
- **Escopo:** inclui tooltips customizados, submenus e popups não modais. Diálogos modais ficam fora, porque tomam o foco.
- **Relação com 2.1.1:** conteúdo acionado por hover deve também ser acionável por foco de teclado (SC 2.1.1 Keyboard).
- **Motivação:** usuários de ampliação precisam navegar sem conteúdo cobrindo a página; usuários de ponteiro grande precisam alcançar o conteúdo; todos precisam de tempo para perceber o conteúdo.
- **Falha documentada:** F95, conteúdo em hover que não é sobrevoável.
- **Técnica suficiente:** SCR39.
- **Exemplo do documento:** tooltip dispensado por Esc sem mover ponteiro nem foco.
- **Touch:** a página Understanding **não trata** de touch.

**WAI-ARIA APG, padrão Tooltip**

Fonte deste bloco: W3C WAI, "Tooltip Pattern", ARIA Authoring Practices Guide — [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

- Popup que mostra informação sobre um elemento quando ele recebe foco de teclado ou hover. Aparece após um pequeno atraso e some com Esc ou quando o mouse sai.
- O tooltip **não recebe foco**; o foco fica no gatilho.
- Contêiner com `role="tooltip"`; o gatilho referencia o tooltip via `aria-describedby`.
- Aberto por foco, fecha quando o gatilho perde o foco. Aberto por hover, fica aberto enquanto o ponteiro está sobre o gatilho **ou** sobre o tooltip.
- Não permite elementos focáveis dentro do tooltip. Para conteúdo com interação, o APG sugere **diálogo não modal**.
- **Status:** o padrão está marcado como "work in progress", sem consenso da força-tarefa, e não tem exemplo oficial (issues 127/128).

**Heydon Pickering, "Tooltips & Toggletips"**

Fonte deste bloco: Heydon Pickering, "Tooltips & Toggletips", *Inclusive Components*, jul. 2017 — [Inclusive Components](https://inclusive-components.design/tooltips-toggletips/).

- **Tooltip vs. toggletip.** O tooltip esclarece um controle, por hover ou foco. O **toggletip** revela informação suplementar por **clique** e funciona para mouse, teclado e touch.
- **Touch.** Tooltips de hover ou foco falham em touch porque foco e estado ativo acontecem juntos; o tooltip só aparece enquanto o dedo está pressionando.
- **ARIA.**
  - `aria-labelledby` quando o texto do tooltip é o rótulo principal; `aria-describedby` quando é suplementar.
  - **Não** usar `aria-describedby` em toggletips, porque o leitor de tela anunciaria o conteúdo antes do clique e o botão pareceria inútil.
  - Em toggletips, preencher uma live region (`role="status"`) no clique.
  - Fechar com Esc, ao perder o foco (blur) ou com clique fora.
- **Outras regras.**
  - Evitar `title` para conteúdo de tooltip: não é acessível por teclado e é instável em leitores de tela.
  - Não colocar botões ou links dentro de tooltips ou toggletips; usar dialog para isso.
- **Necessidade de tooltip como sinal.** Precisar de tooltip costuma indicar falta de rótulos claros. Tooltips são último recurso, para quando "space really is at a premium".

**Carbon (IBM)**
- Proíbe elementos interativos (links, botões, imagens) dentro de tooltip, porque tooltips não recebem foco. Para conteúdo interativo, usar **toggletip**, aberto por clique ou Enter.
- Definition tooltips podem abrir por **clique**, útil quando o usuário precisa de mais tempo ou quando o hover dispara por acidente.
- Keyboard: Tab mostra, Esc dispensa.
- Fonte: [Carbon](https://carbondesignsystem.com/components/tooltip/usage/).

**NN/g sobre touch**
- Tooltips "not normally available on touchscreens"; usar popup tips acionados por toque — [NN/g, Kendrick 2019](https://www.nngroup.com/articles/tooltip-guidelines/).

### Inferences

**[Estimativa] Requisitos concretos de implementação para o Takt**, derivados das fontes acima:

1. **Termos e KPIs com definição.** Usar um botão real (`<button>`) como gatilho ou envolvendo o termo.
   - O tooltip aparece em `:hover` **e** `:focus-visible`.
   - Some com `Esc` sem mover o foco.
   - Permanece enquanto o ponteiro está sobre o gatilho ou o tooltip (sem gap que o feche).
   - Usa `role="tooltip"` + `aria-describedby` e não tem nada focável dentro.
2. **"Saiba mais" fora do tooltip.** Deve ser um controle **separado e sempre visível**, por exemplo um ícone "i" ou "?" ao lado do KPI, que abre o painel lateral. Alternativa: o próprio gatilho abre um toggletip ou popover clicável, que pode conter o link para o painel.
   - Colocar um link "Saiba mais" dentro de um `role="tooltip"` viola o APG, o Carbon e o Pickering.
3. **Mobile/touch.** O hover não existe, então o toque no ícone "i" deve abrir o conteúdo (padrão toggletip). Não depender de long-press, que é pouco descobrível — este último ponto é **[Palpite]**.
4. **Painel lateral.** Fica fora do 1.4.13 se for aberto por clique. Como diálogo não modal ou região complementar, deve:
   - mover o foco para o título do painel ao abrir;
   - devolver o foco ao gatilho ao fechar;
   - fechar com Esc.
   - Isso é **[Estimativa]** baseada em práticas gerais de diálogos do APG, cuja página não verifiquei nesta pesquisa.
5. **Não usar `title` nativo** como mecanismo de tooltip.
6. **Contraste.** Garantir contraste do tooltip; ver a NN/g sobre cinza-claro. Os valores 4.5:1 do SC 1.4.3 não foram verificados aqui.

### Gaps
- Não consultei a página do APG para "Dialog (Modal)" nem orientações APG sobre diálogos não modais. Os requisitos de foco do painel lateral são inferência.
- O padrão Tooltip do APG ainda está sem consenso, então pode mudar.
- Não verifiquei o SC 2.5.x (pointer gestures) nem orientação W3C específica para tooltips em touch.

---

## 4. Painel lateral vs. modal vs. página de ajuda separada para explicações longas (retenção de contexto, atenção dividida / split attention)

### Takeaway
Modais **bloqueiam e escondem o contexto** e são indicados para interrupções críticas, não para leitura de referência. Painéis não modais permitem consultar a explicação mantendo a tarefa visível. Uma página separada força alternar entre telas.

A teoria da carga cognitiva (efeito de atenção dividida / split-attention, contiguidade espacial) mostra, com meta-análises, que integrar espacialmente a explicação e o objeto explicado melhora a aprendizagem. Isso favorece o **painel lateral ao lado do modelo** em vez de modal ou página externa.

### Cited Findings

**Modais vs. não modais (NN/g, Fessenden 2017)**

Fonte deste bloco: Therese Fessenden, "Modal & Nonmodal Dialogs: When (& When Not) to Use Them", NN/g, 23/04/2017 — [NN/g](https://www.nngroup.com/articles/modal-nonmodal-dialog/).

- Modais "require immediate attention", interrompem o fluxo, adicionam custo de interação e "block the content in the background… can cover important content and remove context".
- Modais servem para avisos críticos, entrada obrigatória e fragmentação de fluxo complexo.
- Devem ser evitados para informação não essencial e para "complex decisions that need information the modal hides".
- Não modais servem quando a tarefa "not critical". Exemplo: o compose do Gmail permite "locate older emails or additional information" com o rascunho aberto.
- Ressalva: não modais ainda atrapalham se cobrirem conteúdo importante. No mobile, um popup não modal do desktop pode virar modal de tela cheia.

**Drawers e side panels**
- Um drawer pode ser não modal em telas largas, ao lado do conteúdo, e modal em telas estreitas, cobrindo o conteúdo — [Pattern Playground, "Modality"](https://pattern-playground.onrender.com/patterns/modality). **Fonte de baixa autoridade.**

**Efeito de atenção dividida**
- Referência original: Chandler, P. & Sweller, J. (1992), "The split-attention effect as a factor in the design of instruction", *British Journal of Educational Psychology*, 62(2), 233–246.
- A aprendizagem piora quando informações relacionadas estão separadas no espaço (texto longe do diagrama ou da fórmula). A explicação da teoria é a busca visual e a reorientação necessárias para integrar as partes na memória de trabalho. O remédio é o formato espacialmente integrado.
- Fonte: [Wikipedia, "Split attention effect"](https://en.wikipedia.org/wiki/Split_attention_effect); [e-teaching.org](https://www.e-teaching.org/materialien/literatur/chandler-sweller-1992).

**Meta-análises**
- Ginns, P. (2006), "Integrating information: A meta-analysis of the spatial contiguity and temporal contiguity effects", *Learning and Instruction* 16(6).
  - Uma fonte secundária reporta d = 0,85 (IC 95% 0,68–1,02) para o efeito de split-attention.
  - Outra reporta d = 0,89 para contiguidade.
  - As duas divergem levemente — [Frontiers in Education 2019, doi:10.3389/feduc.2019.00086](https://doi.org/10.3389/feduc.2019.00086); [ACU Inspire](https://inspire.acu.edu.au/articles/contiguity-present-words-and-pictures-in-the-same-place-and-at-the-same-time).
- Schroeder, N.L. & Cenkci, A.T. (2018), "Spatial Contiguity and Spatial Split-Attention Effects in Multimedia Learning Environments: a Meta-Analysis", *Educational Psychology Review* 30(3), 679–701.
  - Confirma Ginns: a contiguidade espacial melhora a aprendizagem em formatos estáticos e dinâmicos, com efeitos maiores para material complexo. A fonte secundária menciona ~60 tamanhos de efeito.
  - Fonte: [ACU Inspire](https://inspire.acu.edu.au/articles/contiguity-present-words-and-pictures-in-the-same-place-and-at-the-same-time); [TUM Clearinghouse](https://www.clearinghouse.edu.tum.de/wp-content/uploads/2019/06/CHU_KR-23_Schroeder-2018_Lernmaterial.pdf).
- **Ressalva sobre o mecanismo:** uma meta-análise constatou que a maioria dos estudos que mediram carga cognitiva **não** confirmou que o material com atenção dividida gera mais carga cognitiva extrínseca (extraneous load). O efeito na aprendizagem é robusto, mas o mecanismo é debatido — [Wikipedia, "Split attention effect"](https://en.wikipedia.org/wiki/Split_attention_effect). Resumo secundário; não identifiquei qual meta-análise.

**Outras fontes**
- NN/g cita positivamente o tutorial do ArcGIS que permanece "in the sidebar for later review" — [NN/g, Laubheimer 2023](https://www.nngroup.com/articles/onboarding-tutorials/).
- GOV.UK: usuários evitam expandir conteúdo porque acham que o link os levará para fora da página. É evidência de que sair da página é percebido como custo — [GOV.UK Details](https://design-system.service.gov.uk/components/details/).

### Inferences
- **[Estimativa] Painel lateral não modal é o formato correto** para a camada 2. Ele mantém o modelo e os KPIs visíveis, o que é coerente com Fessenden e com o caso do Gmail. Também permite que fórmula e números do usuário fiquem perto do objeto explicado, coerente com a contiguidade espacial.
- **[Estimativa] Modal não serve** para a camada 2. A explicação é informação de referência, não crítica, e o modal esconderia o modelo que o usuário quer comparar com a fórmula.
- **[Estimativa] Página de documentação separada** deve ser só ajuda reativa ou de aprofundamento, opcional.
- **[Palpite] Destacar a origem dos números.** Ao abrir o painel, destacar visualmente no modelo os elementos cujos números aparecem no exemplo (por exemplo, realçar a estação gargalo). Isso reduz a busca visual entre painel e modelo; é uma aplicação do split-attention, sem evidência direta em UI de software.
- **[Estimativa] Mobile.** Em telas estreitas o painel tende a virar modal ou tela cheia. Vale manter um resumo do contexto, como o KPI e o valor atual, no topo do painel para compensar.
- **[Palpite] Tamanho do efeito.** Os efeitos de contiguidade vêm de material instrucional (texto + diagrama), não de UI interativa com painéis. A transferência para o caso do Takt é plausível, mas não testada.

### Gaps
- Não encontrei estudo empírico de HCI comparando diretamente painel lateral vs. modal vs. página de ajuda para explicações em software. A recomendação se apoia em guidelines (NN/g) e em teoria instrucional (CLT).
- Não verifiquei os números exatos de Schroeder & Cenkci (2018), porque o texto completo é fechado.

---

## 5. Armadilhas: excesso de tooltips, tooltips redundantes, tours de onboarding interruptivos, conteúdo de ajuda desatualizado

### Takeaway
As armadilhas documentadas são:
- tooltips óbvios ou redundantes ("information pollution");
- tooltips usados para compensar rótulos ruins;
- tooltips aplicados de forma inconsistente;
- tours "push" que são pulados, esquecidos e não melhoram o desempenho.

Dados de fornecedor indicam que tours curtos e iniciados pelo usuário completam muito mais. Sobre conteúdo de ajuda desatualizado não encontrei evidência empírica.

### Cited Findings

**Excesso e redundância de tooltips**
- Tooltips óbvios ou redundantes "are not beneficial"; são "information pollution" e desperdiçam tempo — [NN/g, Kendrick 2019](https://www.nngroup.com/articles/tooltip-guidelines/).
- Uso inconsistente faz o usuário nunca descobrir os tooltips — [NN/g, Kendrick 2019](https://www.nngroup.com/articles/tooltip-guidelines/).
- Tooltip é "último recurso" e frequentemente sinal de interface sem rótulos claros. "Most toggletip content could instead sit in the document's prose" — [Pickering 2017](https://inclusive-components.design/tooltips-toggletips/).
- NN/g recomenda não oferecer ajuda para padrões convencionais (ex.: ícone de engrenagem = Configurações) — [NN/g, Laubheimer 2023](https://www.nngroup.com/articles/onboarding-tutorials/).

**Tours e push revelations**
- Usuários pulam tutoriais com frequência. Tutoriais "don't result in better task performance" e não são memoráveis.
- Um carrossel de novidades (deck-of-cards) do app Chase interrompeu uma tarefa estressante e não explicou como usar os recursos.
- O Clippy é citado como exemplo de fracasso por timing intrusivo e má adivinhação da intenção do usuário.
- Fonte: [NN/g, Laubheimer 2023](https://www.nngroup.com/articles/onboarding-tutorials/).
- Push revelations são frequentemente ignoradas por interromper e não ter contexto — [NN/g, Kendrick 2020](https://www.nngroup.com/articles/help-and-documentation/).

**Dados de fornecedor de tours (Chameleon) — fonte comercial, com conflito de interesse**

As médias variam entre relatórios.

- **Relatório de 2019:** conclusão média de 61%. Tour de 4 passos: 46%; de 5 passos: 23% (via resumo de busca do PDF). Tours iniciados pelo próprio usuário (self-serve) tiveram conclusão "123% higher". Tours acionados por checklist: "21% more likely" de conclusão. Amostra de mais de 15 milhões de interações em empresas SaaS.
  - Fontes: [Chameleon, "What We Learned Analyzing 15 Million Product Tour Interactions"](https://www.chameleon.io/blog/product-tour-benchmarks-highlights); [PDF 2019](https://www.chameleon.io/assets/chameleon-product-tour-benchmarks-report-2019.pdf).
- **Relatório de 2024** (dados de 2023): conclusão média de todos os tours de 33,5%; 64% quando o tour é lançado por escolha do usuário — [Chameleon Benchmark Report 2024](https://www.chameleon.io/benchmark-report-24) (via resumo de busca, não fetch direto).
- **Divergência:** outra versão da página cita média de 47% com dados de 2020. Os números conflitam (61% / 47% / 33,5%) por ano, amostra e tratamento de outliers.

### Inferences
- **[Estimativa] Tour inicial.** Um tour inicial obrigatório do Takt tende a ser pulado e esquecido. Se houver tour, ele deve ser:
  - curto (≤ 3–4 passos, segundo os dados do Chameleon);
  - opcional ou iniciado pelo usuário;
  - repetível a partir de um menu de ajuda.
- O modelo de 3 camadas sob demanda (pull) é o substituto recomendado pela NN/g.
- **[Estimativa] Regra editorial contra redundância.** Não criar tooltip para termos autoexplicativos ou cujo rótulo já diz tudo. Um tooltip "Throughput: o throughput do sistema" é poluição. Um bom teste é: o tooltip acrescenta definição, unidade de interpretação ou "por que importa"?
- **[Palpite] Conteúdo desatualizado.** No Takt, o risco de ajuda desatualizada é ao mesmo tempo **maior e menor**:
  - Menor, porque a camada 2 calcula o exemplo a partir dos números reais do modelo: o exemplo nunca fica desatualizado em relação ao modelo do usuário.
  - Maior, porque fórmula e texto precisam acompanhar mudanças no motor de simulação.
  - Sugestão: gerar a fórmula exibida e o exemplo a partir da **mesma fonte** de definição de KPI usada pelo cálculo (single source of truth) e cobrir isso com testes.
- **[Palpite] Fadiga visual.** Marcar todos os termos com ícone "i" pode causar fadiga visual. Um meio-termo é marcar só KPIs e termos técnicos de manufatura (takt time, WIP, OEE, utilização) e usar sublinhado discreto em vez de ícones.

### Gaps
- Não encontrei pesquisa empírica (CHI/SIGDOC) quantificando o impacto de conteúdo de ajuda desatualizado na confiança ou no desempenho do usuário.
- Não encontrei estudo controlado acadêmico sobre "tooltip overload" (densidade de tooltips vs. desempenho). As afirmações vêm de guidelines.
- Os dados do Chameleon são de fornecedor de ferramenta de tours. A metodologia não foi auditada e os números de 2024 e 2019 vieram parcialmente de resumos de busca, não da leitura completa dos PDFs.
- Não encontrei pesquisa específica sobre ajuda contextual em **simuladores educacionais** ou **ambientes de aprendizagem baseados em simulação**. Esse seria o recorte mais próximo do Takt e merece busca dedicada, por exemplo literatura de "guidance in simulation-based learning" / de Jong.
