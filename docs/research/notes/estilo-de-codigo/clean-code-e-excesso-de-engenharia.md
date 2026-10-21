# Clean code, design simples e excesso de engenharia: princípios, críticas e critérios para desviar

> Notas de pesquisa para o guia de estilo de código do Takt (TypeScript: API NestJS hexagonal, motor de simulação puro, front-end React). Data da pesquisa: 21/10/2026.
> Marcação: **[FATO]** = verificado na fonte citada (link ao lado); **[ESTIMATIVA]** = conclusão razoável a partir de fontes, mas não afirmada por elas; **[PALPITE]** = opinião do pesquisador, sem fonte.
> Quando a fonte é um resumo de terceiros (e não o texto do autor), isso é dito explicitamente. Citações literais estão em inglês, curtas, como aparecem na fonte.

## 1. O que dizem as fontes primárias

### Resumo
As fontes primárias concordam no objetivo (código fácil de entender e de mudar) e discordam no meio: Martin (Clean Code, 2008) defende funções muito curtas e evita comentários; Ousterhout (APOSD) defende módulos "profundos" e comentários como parte essencial da abstração; Beck/Fowler põem "revela a intenção" e "sem duplicação" juntos, abaixo de "passa nos testes"; Metz, Dodds e Abramov alertam que remover duplicação cedo demais cria abstrações erradas, mais caras que a duplicação.

### Achados citados

**Robert C. Martin, *Clean Code* (1ª ed. 2008; 2ª ed. 2025)**
- [FATO] A 2ª edição do *Clean Code* foi publicada pela Addison-Wesley, listada pela Pearson com data de 30/09/2025 (Pearson UK: 08/10/2025), e é descrita pela editora como "comprehensive rewrite" — [Pearson](https://www.pearson.com/en-us/subject-catalog/p/clean-code-a-handbook-of-agile-software-craftsmanship-2nd-edition/P200000013239/9780135398548). Não encontrei uma lista confiável do que mudou capítulo a capítulo (ver Lacunas).
- [FATO] Na discussão com Ousterhout (set/2024 a fev/2025), Martin reafirma: "While I do strongly recommend very short functions"; diz que os exemplos de 2 a 4 linhas vieram do applet Sparkle, não de um limite arbitrário; e defende a regra "One Thing": "If I can meaningfully extract one method from another, then the original method did more than one thing." — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Sobre comentários, o *Clean Code* é citado na mesma discussão com a frase "Comments are always failures"; Martin esclarece: "I'm not hostile to comments in general. I am very hostile to gratuitous comments", "I look at every comment as potential misinformation" e "I prefer long names to comments" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] No fechamento, Martin diz que os dois "share far more values than separate us" e que integrou "several of your better ideas" (de Ousterhout) na 2ª edição — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Martin admite, sobre o exemplo `PrimeGenerator` reescrito por Ousterhout num só método comentado: "your version is much better than either Knuth's or mine" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)

**Kent Beck, quatro regras do design simples (formuladas no fim dos anos 1990, no XP)**
- [FATO] As regras, em ordem de prioridade: "Passes the tests", "Reveals intention", "No duplication", "Fewest elements". Fowler (02/03/2015) aponta a 1ª edição de *Extreme Programming Explained* (p. 57, seção Simple Design) como formulação de referência — [Fowler, BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html)
- [FATO] Fowler considera pouco importante a ordem entre "sem duplicação" e "revela a intenção", porque uma alimenta a outra; diz que acrescentar duplicação por clareza é "often papering over a problem"; Beck acrescenta que, nos raros conflitos (por exemplo em testes), "empathy wins over some strictly technical metric" — [Fowler, BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html)
- [FATO] "Fewest elements" é a última regra: elementos (classes, métodos, camadas) só existem se servirem às três primeiras — [Fowler, BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html). Esta é a base canônica para "não criar abstração especulativa".

**John Ousterhout, *A Philosophy of Software Design* (2ª ed. jul/2021)**
- [FATO] A 2ª edição saiu em julho de 2021; traz o capítulo novo "Decide What Matters", reescreve o cap. 6 "General-Purpose Modules are Deeper" e inclui subseções que comparam o livro ao *Clean Code* em tamanho de método e papel dos comentários — [página do livro, Stanford](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- [FATO] Objetivo do design segundo Ousterhout: "the fundamental goal of software design is to make it easy to understand and modify the system" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Módulo profundo: "The best methods are those that provide a lot of functionality but have a very simple interface"; interfaces rasas "don't help much in terms of reducing what the programmer needs to know" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Carga cognitiva: "The more information a developer needs to have, the harder it will be for them to work on the system" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] "Entanglement": dois métodos são emaranhados quando entender um exige ler o outro; "Entangled methods can usually be improved by combining them so that all the code is in one place" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Sobre comentários: "Comments are crucially important and add enormous value to software"; "the cost of missing comments is easily 10-100x the cost of incorrect comments" (opinião dele, sem dado) — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO, via resumos de terceiros, não o livro] Sinais de alerta ("red flags") do APOSD incluem módulo raso, vazamento de informação, decomposição temporal, *pass-through methods* (métodos que só repassam a chamada com assinatura parecida, sinal de camadas adjacentes com a mesma abstração) e "classitis" ("classes are good, so more classes are better") — [Dan Lebrero, notas do livro (2021)](https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/); [dev.to, red flags](https://dev.to/sportebois/software-design-red-flags-wisdom-nuggets-from-john-ousterhout-43i2). A redação exata e as páginas precisam ser conferidas no livro.

**Discussão Ousterhout × Martin (set/2024 a fev/2025)**
- [FATO] Ousterhout: a regra "One Thing" "lacks guardrails" e "is simply wrong in many cases"; o *Clean Code* dá conselho quantitativo para quebrar código e pouco para saber quando a decomposição foi longe demais — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Sobre o `PrimeGenerator`: "The code is chopped up so much (8 teeny-tiny methods) that it's difficult to read" (Ousterhout). Na reescrita de Martin, Ousterhout aponta uma regressão de desempenho ao separar laços e diz que ela "is unacceptable"; a versão final de Martin junta os laços de novo — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] TDD: Ousterhout "not a fan"; acha que TDD "discourages good design and can easily lead to very bad code" e propõe *bundling* (projetar e escrever unidades de algumas dezenas a centenas de linhas e testá-las logo depois). Ambos concordam que testes unitários são indispensáveis — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Fechamento de Ousterhout: o problema do *Clean Code* é "failure to focus on what is important, and failure to balance design tradeoffs", e o livro "fundamentally undervalues comments" — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)

**Martin Fowler: YAGNI, tamanho de função, regra de três**
- [FATO] YAGNI (26/05/2015): custos de uma funcionalidade presumida: *cost of build*, *cost of delay*, *cost of carry* ("this complexity makes it harder to modify and debug that software") e *cost of repair* — [Fowler, Yagni](https://martinfowler.com/bliki/Yagni.html)
- [FATO] YAGNI não se aplica a refatorar nem a tornar o código mais fácil de mudar: "it does not apply to effort to make the software easier to modify"; e uma funcionalidade presumida é aceitável se "doesn't actually increase the complexity" ou se for "easy to do now, adds minimal complexity, yet significantly reduces the later cost" — [Fowler, Yagni](https://martinfowler.com/bliki/Yagni.html)
- [FATO] Tamanho de função (30/11/2016): critério é "the separation between intention and implementation"; extrair quando entender um trecho exige esforço e dar ao novo método o nome do propósito. Fowler diz que "Any function more than half-a-dozen lines of code starts to smell to me" (preferência pessoal, não regra) e que o custo de desempenho de chamadas é "very rare now" — [Fowler, FunctionLength](https://martinfowler.com/bliki/FunctionLength.html)
- [FATO, via fontes secundárias] Regra de três: popularizada por Fowler em *Refactoring*, atribuída a Don Roberts: na 1ª vez faz, na 2ª tolera a duplicação, na 3ª refatora ("three strikes and you refactor") — [Wikipedia, Rule of three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)); [CU Boulder, aula](https://home.cs.colorado.edu/~kena/classes/6448/s01/lectures/lecture28.pdf). Não consultei a página do livro.

**Sandi Metz, "The Wrong Abstraction" (20/01/2016)**
- [FATO] "duplication is far cheaper than the wrong abstraction"; "prefer duplication over the wrong abstraction" — [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [FATO] Mecanismo: extrai-se uma abstração; um requisito novo "quase" cabe; acrescentam-se parâmetros e condicionais; com o tempo "What was once a universal abstraction now behaves differently for different cases" — [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [FATO] Remédio: reintroduzir a duplicação (*inline* da abstração em cada chamador), apagar o que cada um não usa e reextrair; "the fastest way forward is back"; resistir ao "sunk cost fallacy" — [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)

**Kent C. Dodds, "AHA Programming" (22/06/2020)**
- [FATO] AHA = "Avoid Hasty Abstractions" (sigla creditada a Cher Scarlett); apoia-se em Metz ("prefer duplication over the wrong abstraction") e em "optimize for change first"; cita a regra de três de Conlin Durbin; o critério dele para abstrair é quando "feels" certo (subjetivo) — [Kent C. Dodds](https://kentcdodds.com/blog/aha-programming)

**Dan Abramov, "Goodbye, Clean Code" (11/01/2020)**
- [FATO] Relato: ele unificou métodos de redimensionamento duplicados num editor gráfico (código caiu pela metade) e o chefe pediu para reverter. Lições: "My code traded the ability to change requirements for reduced duplication, and it was not a good trade"; "Obsessing with 'clean code' and removing duplication is a phase many of us go through"; "Let clean code guide you. Then let it go." — [overreacted.io](https://overreacted.io/goodbye-clean-code/)

### Inferências
- [ESTIMATIVA] Todas as fontes acima se apresentam como heurísticas de julgamento, não como regras mecânicas; nenhuma delas oferece um número validado empiricamente (linhas por função, número de usos) como limite universal.
- [ESTIMATIVA] Há consenso amplo em que "nomes revelam intenção" e "não misturar níveis de abstração" são bons; o conflito está em quanto decompor, em comentários e no momento de remover duplicação.

### Lacunas
- Não verifiquei o texto do *Clean Code* 1ª ed. diretamente (páginas das regras "Functions should be small", "Use exceptions rather than return codes", número ideal de argumentos). Só uso as frases citadas na discussão com Ousterhout.
- Não encontrei lista confiável das mudanças da 2ª edição do *Clean Code* (2025) nem confirmação de quais ideias de Ousterhout entraram.
- Definições literais e páginas do APOSD (deep modules, pass-through, "define errors out of existence") não foram verificadas no livro; vieram da discussão pública (primária) ou de resumos (secundários).
- Kent Beck, *Tidy First?* (2023), não foi consultado.

## 2. Regras do clean code criticadas ou consideradas ultrapassadas

### Resumo
As críticas mais fortes e bem documentadas atingem (a) funções minúsculas e a regra "One Thing" sem limite, (b) a aversão a comentários, (c) DRY aplicado cedo demais e (d) a qualidade dos exemplos do livro. A crítica à herança profunda aparece em evidência empírica indireta (extrair superclasse piora legibilidade), não nas fontes de opinião lidas.

### Achados citados
- [FATO] Funções muito pequenas / decomposição excessiva: criticada por Ousterhout ("One Thing approach is simply wrong in many cases"; "8 teeny-tiny methods ... difficult to read"); os dois concordam que é possível decompor demais e que o *Clean Code* dá pouca orientação para detectar isso — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] Aversão a comentários: criticada por Ousterhout ("Clean Code fundamentally undervalues comments, which are essential and irreplaceable") — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code). O próprio Martin relativiza ("not hostile to comments in general") — mesma fonte.
- [FATO] Nomes longos como substitutos de comentário: Ousterhout considera estranhos nomes como `isLeastRelevantMultipleOfLargerPrimeFactor`; Martin prefere-os porque são mais difíceis de ignorar — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] DRY prematuro: Metz (2016), Dodds (2020) e Abramov (2020), citados na seção 1.
- [FATO] qntm, "It's probably time to stop recommending Clean Code" (28/06/2020): "a lot of the example code in the book is just dreadful"; reconhece como bons os conselhos de que funções "should not mix levels of abstraction" e de que nomes "should be descriptive, and consistent" — [espelho no Goodreads](https://www.goodreads.com/author_blog_posts/20045870-it-s-probably-time-to-stop-recommending-clean-code) (o original qntm.org/clean recusou acesso automático, HTTP 403; li só o trecho espelhado).
- [FATO, via resumo] Jonathan Frere sugere o APOSD como alternativa a recomendar no lugar do *Clean Code* — citado em resultado de busca; não li o texto dele (ver Lacunas).
- [FATO, via revisão secundária] Sellitto et al. (SANER 2022), 156 projetos open source: criar superclasses piorou a legibilidade por introduzir termos genéricos e ambíguos; reorganizar em componentes mais coesos melhorou; renomear nem sempre melhorou — [Never Work in Theory, 01/03/2023](https://neverworkintheory.org/2023/03/01/refactoring-and-program-comprehension.html)
- [FATO] Ousterhout também critica TDD como prática de design ("discourages good design"), ponto em que Martin discorda — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)

### Inferências
- [ESTIMATIVA] O que segue amplamente aceito do *Clean Code*: nomes descritivos e consistentes, um nível de abstração por função, evitar comentário redundante. O que é contestado: tamanho-alvo de 2 a 4 linhas, "comentário é sempre falha", extrair até não poder mais.
- [PALPITE] Para herança profunda, a fonte mais útil ao Takt é a própria arquitetura: ADR-0002 prefere entidades ricas e portas (composição), então herança tende a ser rara de qualquer forma.

### Lacunas
- Não li o texto integral de qntm (403) nem a resenha de Jonathan Frere; os argumentos específicos de qntm sobre efeitos colaterais e argumentos de saída não foram verificados.
- Não encontrei uma crítica primária e publicada focada em "herança profunda" dentro do corpus pedido; a recomendação clássica "prefira composição a herança" (Gang of Four, 1994) não foi verificada nesta pesquisa.

## 3. Critérios verificáveis para decidir se uma abstração, interface, camada, padrão ou generalização se justifica

### Resumo
As fontes oferecem poucos critérios numéricos e muitos qualitativos. Os mais verificáveis: regra de três (duplicação), número de implementações reais de uma interface, profundidade do módulo (interface simples × funcionalidade escondida), ausência de métodos de repasse, emaranhamento entre métodos, e o teste YAGNI (a generalização adiciona complexidade agora para um requisito presumido?).

### Achados citados
- [FATO] **Regra de três**: tolerar a 2ª cópia, abstrair na 3ª — [Wikipedia](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)) (fonte secundária sobre *Refactoring*). A justificativa citada lá: abstrair cedo arrisca escolher a abstração errada.
- [FATO] **Sinal de abstração errada** (Metz): a abstração recebe parâmetros e condicionais para atender casos que divergem; remédio é *inline* e reextrair — [Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
- [FATO] **Profundidade** (Ousterhout): bom módulo = muita funcionalidade atrás de interface simples; módulo raso não reduz o que o programador precisa saber — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO] **Emaranhamento** (Ousterhout): se entender um método exige ler o outro, juntá-los — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO, via resumos] **Pass-through methods** e camadas adjacentes com a mesma abstração são sinal de alerta; correções sugeridas: expor a classe de baixo, redistribuir responsabilidades ou fundir classes — [dev.to, red flags](https://dev.to/sportebois/software-design-red-flags-wisdom-nuggets-from-john-ousterhout-43i2); [Dan Lebrero](https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/)
- [FATO] **YAGNI**: generalização para requisito presumido tem custo de construção, atraso, carregamento e reparo; exceção quando não aumenta complexidade ou quando é barata agora e reduz muito o custo depois; refatorar para facilitar mudança não viola YAGNI — [Fowler, Yagni](https://martinfowler.com/bliki/Yagni.html)
- [FATO] **Extrair função**: quando entender o trecho exige esforço, extrair e nomear pela intenção — [Fowler, FunctionLength](https://martinfowler.com/bliki/FunctionLength.html)
- [FATO] **Fewest elements**: último critério de Beck; um elemento sem papel nos testes, na intenção ou na remoção de duplicação deve sair — [Fowler, BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html)
- [FATO] **Contraponto empírico (padrões de projeto)**: Prechelt, Unger, Tichy, Brössler e Votta (IEEE TSE, 2001), com profissionais em 9 tarefas de manutenção: na maioria, a versão com padrão teve efeito positivo (flexibilidade sem custo de tempo, ou menos tempo); em algumas, a versão simples foi melhor; um Observer foi negativo e um Decorator foi positivo apesar da flexibilidade supérflua. Os autores recomendam, sem razão clara para o simples, preferir a flexibilidade do padrão — [KIT, página do artigo](https://ps.ipd.kit.edu/english/176_778.php). O registro FORRT lista três replicações com resultados mistos ou não confirmatórios — [FORRT](https://forrt.org/flora-replication-atlas/doi/10.1109/32.988711/)
- [FATO] Fowler admite que construir algo presumido é aceitável se "adds minimal complexity, yet significantly reduces the later cost" — [Fowler, Yagni](https://martinfowler.com/bliki/Yagni.html). Ou seja, o próprio YAGNI tem exceção explícita.

### Inferências
- [ESTIMATIVA] O critério "número de implementações reais" não aparece com essa redação nas fontes lidas; deriva de "fewest elements" + YAGNI: uma interface com uma única implementação e sem segunda prevista concretamente é um elemento sem função. No Takt, portas da API têm duas implementações reais por decisão (Prisma e em memória, ADR-0002), o que satisfaz o critério.
- [ESTIMATIVA] A evidência de Prechelt (2001) impede afirmar que "padrão = excesso de engenharia". O critério defensável é contextual: o padrão resolve uma variação que existe hoje (ou que é barata de suportar e cara de adicionar depois)?
- [PALPITE] Critério de "frequência de mudança": as fontes falam em "optimize for change" (Dodds) e no custo de mudança (Fowler, Abramov), mas nenhuma dá um limiar mensurável.

### Lacunas
- Nenhuma fonte encontrada valida empiricamente o número "3" da regra de três; é heurística.
- Não encontrei estudo empírico sobre profundidade de módulo (no sentido de Ousterhout) e defeitos ou tempo de manutenção.

## 4. Orientações amplamente concordantes: nomes, tamanho de função, erros e comentários

### Resumo
Há concordância forte sobre nomes descritivos e consistentes e sobre não misturar níveis de abstração; concordância parcial sobre comentários (o "porquê" e o não óbvio merecem comentário; comentário redundante não); e não há consenso sobre tamanho de função nem sobre exceções × códigos de retorno nas fontes lidas.

### Achados citados
- [FATO] Nomes: qntm reconhece "function names should be descriptive, and consistent" como conselho válido do *Clean Code* — [Goodreads (espelho de qntm)](https://www.goodreads.com/author_blog_posts/20045870-it-s-probably-time-to-stop-recommending-clean-code). Beck: "Reveals intention" é a 2ª regra — [Fowler](https://martinfowler.com/bliki/BeckDesignRules.html). Fowler: nomear a função extraída pelo propósito — [FunctionLength](https://martinfowler.com/bliki/FunctionLength.html)
- [FATO] Nível de abstração: "functions should not mix levels of abstraction" (aceito por qntm, crítico do livro) — [Goodreads (espelho de qntm)](https://www.goodreads.com/author_blog_posts/20045870-it-s-probably-time-to-stop-recommending-clean-code)
- [FATO] Tamanho: Martin quer funções "very short"; Fowler sente cheiro acima de ~6 linhas mas usa o critério intenção × implementação; Ousterhout quer métodos profundos e aceita métodos longos se coesos — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code); [FunctionLength](https://martinfowler.com/bliki/FunctionLength.html). Não há consenso numérico.
- [FATO] Comentários: os dois concordam que comentários são necessários onde o código não é óbvio e que revisão por outras pessoas ajuda — [aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)
- [FATO, via resumos] Erros em Ousterhout: "define errors out of existence" (reduzir os casos de exceção pelo desenho da interface) aparece nos resumos do APOSD — [Dan Lebrero](https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/). Não verificado no livro.

### Inferências
- [ESTIMATIVA] Para o guia, a parte segura é: nomes por intenção, um nível de abstração por função, comentário para "por quê", restrição e unidade; o limite de tamanho deve ser um sinal de revisão, não uma regra.
- [ESTIMATIVA] Erros: o Takt já decidiu o essencial (códigos de erro, tradução só na borda HTTP, ADR-0002); o formato `Result` × exceção está em aberto no ADR-0002, e as fontes lidas não resolvem essa escolha.

### Lacunas
- Não verifiquei a orientação literal do *Clean Code* sobre tratamento de erros (exceções × códigos de retorno, não retornar `null`), nem a de Ousterhout no livro.

## 5. Evidência empírica (legibilidade, tamanho de função, defeitos)

### Resumo
A evidência é escassa e mista. Há bom apoio para nomes por palavras completas; apoio fraco e contraditório para limites de tamanho de função; evidência de que refatorar "para clean code" não traz ganho imediato garantido; e de que métricas de complexidade explicam só parcialmente a compreensão. Nenhum estudo encontrado valida os números do *Clean Code*.

### Achados citados
- [FATO] **Nomes**: Hofmeister, Siegmund e Holt (SANER 2017; versão em *Empirical Software Engineering* 24, 2019), 72 desenvolvedores profissionais de C#: nomes formados por palavras levaram a compreensão ~19% mais rápida que letras ou abreviações; sem diferença significativa entre letras e abreviações — [PDF Saarland](https://www.se.cs.uni-saarland.de/publications/docs/HoSeHo17.pdf). Nuance: outros experimentos citados pelo Never Work in Theory não acharam diferença na capacidade de modificar o código — [Never Work in Theory, 2021](https://neverworkintheory.org/2021/08/09/abbreviated-vs-full-names.html). Evidência: **moderada** para velocidade de leitura.
- [FATO] **Métricas de complexidade**: Peitek, Apel, Parnin, Brechmann e Siegmund (ICSE 2021, prêmio ACM SIGSOFT Distinguished Paper), fMRI com 19 participantes e mais de 41 métricas: métricas explicam a cognição só em parte; tamanho textual atrai atenção e tamanho do vocabulário (identificadores distintos) pesa na memória de trabalho — [replicação no GitHub](https://github.com/brains-on-code/fMRI-complexity-metrics-icse2021); [registro CPS-VO](https://archive.cps-vo.org/node/81592). Evidência: amostra pequena, trechos curtos.
- [FATO] **Tamanho de método**: Chowdhury, Uddin e Holmes, "An Empirical Study on Maintainable Method Size in Java" (arXiv, 04/05/2022), ~785 mil métodos Java: recomendam métodos com menos de 24 linhas e dizem que decompor métodos grandes reduz o esforço de manutenção — [arXiv 2205.01842](https://arxiv.org/abs/2205.01842). Não confirmei publicação revisada por pares; é preprint, de dados de Java, correlacional.
- [FATO] **Contraponto histórico**: análise de Derek Jones (blog shape-of-code, 10/09/2023) dos dados citados para "tamanho ótimo de função": a curva em U seria artefato matemático, e a maioria dos estudos antigos mostra densidade de defeitos caindo com o tamanho do módulo (Basili & Perricone 1984: "the larger the module, the less error-prone it was") — [shape-of-code](https://shape-of-code.com/2023/09/10/optimal-function-length-an-analysis-of-the-cited-data/). Fonte: blog de pesquisador, não artigo revisado.
- [FATO] **Tamanho como confundidor**: muitas métricas de código são fortemente correlacionadas com tamanho; El Emam et al. estudaram o efeito confundidor do tamanho de classe — mencionado em [Jureczko & Spinellis, DepCoS 2010](https://www2.dmst.aueb.gr/dds/pubs/conf/2010-DepCoS-RELCOMEX-ckjm-defects/html/JS10.pdf). Não li El Emam diretamente.
- [FATO] **Refatorar para clean code**: Ammerlaan, Veninga e Zaidman, "Old habits die hard: Why refactoring for understandability does not give immediate benefits" (SANER 2015, p. 504–507), sistema industrial legado: houve aumentos e quedas de compreensibilidade; ganho imediato não é garantido; pode haver perda de produtividade de curto prazo quando o estilo novo difere do habitual — [TU Delft, registro](https://research.tudelft.nl/en/publications/old-habits-die-hard-why-refactoring-for-understandability-does-no). Li só o resumo.
- [FATO] **Refatoração × legibilidade**: Sellitto et al. (SANER 2022), 156 projetos: refatoração afeta a maioria das métricas de legibilidade; coesão melhora; extrair superclasse piora — [Never Work in Theory](https://neverworkintheory.org/2023/03/01/refactoring-and-program-comprehension.html). Métricas automáticas de legibilidade, não pessoas.
- [FATO] **Opinião de praticantes**: Ljung e Gonzalez-Huerta (arXiv 2022, submetido à PROFES 2022), 39 praticantes: concordância geral com princípios de clean code; desenvolvedores costumam escrever código "bagunçado" para refatorar depois — [arXiv 2208.07056](https://arxiv.org/abs/2208.07056). Evidência: **fraca** (levantamento de opinião, amostra pequena).
- [FATO] **Padrões de projeto**: Prechelt et al. (TSE 2001), majoritariamente favorável aos padrões em manutenção, com exceções; replicações mistas — ver seção 3.

### Inferências
- [ESTIMATIVA] Não há base empírica para impor um limite fixo de linhas por função; há apoio fraco a "métodos Java abaixo de ~24 linhas" (preprint correlacional) e dados antigos em sentido contrário. Um limite no guia deve ser tratado como gatilho de revisão.
- [ESTIMATIVA] O achado de Peitek (vocabulário pesa na memória de trabalho) é compatível com a crítica de Ousterhout a muitos métodos pequenos com nomes novos, mas o estudo não testou isso diretamente.
- [ESTIMATIVA] A evidência para nomes por palavras completas é a mais sólida do conjunto e combina com a regra do Takt de unidades no nome (`cycleSec`).

### Lacunas
- Não encontrei estudo empírico sobre comentários e compreensão publicado recentemente que eu tenha verificado (o clássico Woodfield, Dunsmore e Shen, 1981, não foi verificado).
- Não encontrei estudos específicos de TypeScript, React ou NestJS.
- Não li os textos completos de Chowdhury, Ammerlaan ou Sellitto; números vêm de resumos/abstracts.

## Proposta para o Takt

### Relação com decisões já tomadas (vinculantes)
- [FATO] **Arquitetura hexagonal (ADR-0002)**: portas, casos de uso por pasta, mappers e camadas `domain/application/infra/http` são decisão aceita, não escolha de estilo. O próprio ADR lista como custo "Risco de cerimônia excessiva em fluxos simples (CRUD)", com revisão ao fim do marco 4 — [ADR-0002](../../../adr/0002-arquitetura-hexagonal-por-contexto.md). **O planejador não pode pular uma camada ou porta por critério de estilo**; desvio disso exige novo ADR. O guia de estilo deve, porém, mandar registrar casos de cerimônia sem benefício (método de repasse, mapper trivial) como insumo para essa revisão.
- [FATO] ADR-0002 já toma decisões anti-excesso: "Casos de uso são classes simples ... sem subclasse só para `@Injectable`"; entidades sem *setter* genérico; validação uma única vez — [ADR-0002](../../../adr/0002-arquitetura-hexagonal-por-contexto.md).
- [ESTIMATIVA] Portas da API passam no critério "mais de uma implementação real" (Prisma + em memória). Uma interface nova fora dessas portas (por exemplo no motor ou no front-end) não tem essa justificativa automática.
- [FATO] **Testes (ADR-0009)**: AAA sem comentários, um Act, sem lógica, TDD obrigatório no motor e nas regras `RN-...`, cobertura ≥ 90% de linhas e ramificações, mutação ≥ 80% no motor e no domínio — [ADR-0009](../../../adr/0009-estrategia-de-testes.md). A crítica de Ousterhout ao TDD **não reabre** essa decisão; o guia deve apenas exigir o passo de refatoração do ciclo (onde se corrige decomposição ruim).
- [FATO] A proibição de comentários vale **para testes** (ADR-0009, CLAUDE.md). Para código de produção, nada no repositório proíbe comentários; o guia pode adotar a posição de Ousterhout lá.
- [ESTIMATIVA] YAGNI conversa com as metas de cobertura e mutação: parâmetros, ramos e implementações especulativas geram ramificações sem teste real ou mutantes sobreviventes, ou exigem testes de código que ninguém usa. É um argumento prático a favor de "não generalizar antes do segundo uso" no Takt.
- [FATO] Nomes com unidade (`cycleSec`, `mtbfMin`) já são regra do CLAUDE.md; a evidência de Hofmeister et al. favorece palavras completas a abreviações.
- [FATO] Erros: códigos, nunca frases; tradução só em `http` (ADR-0002, CLAUDE.md). `Result` × exceção está em aberto no ADR-0002 — o guia não deve decidir isso; deve remeter ao ADR que vier.

### Princípios a adotar (sem ressalva)
1. **Nomes revelam intenção**, por palavras completas, consistentes no projeto, com unidade no nome quando houver grandeza física (Beck regra 2; Hofmeister et al.; CLAUDE.md).
2. **Um nível de abstração por função** (aceito até por críticos do *Clean Code*).
3. **YAGNI para funcionalidade e generalização presumidas**: sem parâmetro, opção, ponto de extensão ou interface para requisito que ainda não existe (Fowler 2015; Beck "fewest elements").
4. **Preferir duplicação à abstração errada**; **regra de três** como padrão para extrair código duplicado (Metz; Roberts/Fowler; Dodds).
5. **Abstração que acumula parâmetros e condicionais por chamador é sinal para desfazê-la** (*inline* e reextrair), sem apego ao custo já gasto (Metz).
6. **Testes passam primeiro** (Beck regra 1), já garantido pelo ADR-0009.

### Princípios a adotar com nuance
1. **Tamanho de função**: extrair quando o trecho exige esforço para entender e um nome por intenção o explica (Fowler). Não há limite fixo; acima de ~40 linhas [PALPITE: número de gatilho, sem base empírica] o revisor pergunta "há uma intenção nomeável aqui?". Não extrair se o resultado for método **emaranhado** (só se entende lendo o chamador) ou **raso** (Ousterhout).
2. **Comentários em produção**: obrigatório comentar o **porquê**, invariantes, restrições, unidades, referências da literatura (essencial no motor: fórmula, fonte, hipótese) e o contrato de interfaces públicas (porta, função exportada de lib). Proibido comentário que repete o código. Nos testes, sem comentários (ADR-0009).
3. **DRY**: vale de imediato para **conhecimento de negócio** (uma regra `RN-...` num só lugar: domínio; validação de entrada só na borda — ADR-0002). Para **forma de código parecida**, regra de três. [ESTIMATIVA: a distinção conhecimento × forma é interpretação; não verifiquei a definição original de DRY de Hunt e Thomas nesta pesquisa.]
4. **Módulos profundos**: preferir uma interface pequena com mais trabalho atrás a várias classes rasas; método que só repassa a chamada é sinal de alerta — **exceto** onde a camada é imposta pelo ADR-0002 (o caso de uso que só delega ao repositório num CRUD é custo aceito; registrar para a revisão do marco 4).
5. **Padrões de projeto**: permitidos quando resolvem uma variação que existe hoje no código, ou quando o custo de adicionar depois for claramente alto e o de adicionar agora for baixo (exceção do próprio YAGNI; Prechelt 2001). Não usar padrão "por precaução".
6. **Herança**: evitar hierarquias; preferir composição e funções. Extrair superclasse só com dois ou mais usos reais e nome de domínio (não genérico como `Base`/`Abstract`) [ESTIMATIVA baseada em Sellitto et al.].

### Checklist de critérios de desvio (quando o planejador pode quebrar um princípio de estilo)

O planejador **pode** quebrar um princípio deste guia (nunca uma regra do CLAUDE.md, um ADR ou PDR aceito, nem uma regra `RN-...`) se pelo menos um critério abaixo for verdadeiro e estiver escrito no plano:

- [ ] **Não haverá reuso real**: a abstração teria um só chamador, e não há segundo uso em use case ou marco já escrito.
- [ ] **Interface com uma só implementação**: não existe segunda implementação real nem dublê de teste necessário (as portas do ADR-0002 já têm duas; fora delas, justificar).
- [ ] **Indireção sem benefício**: a extração geraria método de repasse, método emaranhado (só se entende lendo outro) ou classe rasa (interface quase tão complexa quanto a implementação).
- [ ] **Duplicação abaixo da regra de três**: duas cópias parecidas, cujos chamadores podem divergir.
- [ ] **Abstração existente virou errada**: já acumula parâmetros/condicionais por chamador; o plano propõe *inline* e reextração.
- [ ] **Desempenho medido** (sobretudo no motor): a forma "limpa" custa tempo mensurável; o plano cita a medição.
- [ ] **Clareza local maior**: um algoritmo da literatura fica mais claro inteiro e comentado (o caso `PrimeGenerator`).
- [ ] **Generalização barata agora e cara depois**, com o custo de depois descrito concretamente (exceção do YAGNI, Fowler).
- [ ] **Exigência de teste**: a forma escolhida é a que permite cumprir AAA, um Act e as metas do ADR-0009 sem lógica no teste.

O plano deve registrar, para cada desvio:
1. **Princípio quebrado** (nome exato do item do guia).
2. **Critério do checklist** que justifica e a evidência concreta (quantos chamadores, quais implementações, medição, link para o use case).
3. **Alternativa descartada** em uma frase (como ficaria seguindo o princípio).
4. **Gatilho de revisão**: o fato que faria voltar ao princípio (por exemplo, "terceiro chamador", "segunda implementação", "marco 4").
5. **Impacto em testes**: confirmação de que cobertura e mutação continuam atendidas.

O planejador **não pode** usar este checklist para: pular camada, porta ou validação do ADR-0002; trocar códigos de erro por frases; remover `organization_id`/RLS; usar `Math.random` ou DOM no motor; comentar testes ou pôr lógica neles. Esses desvios exigem novo ADR/PDR com status "Proposto".

### Lacunas desta proposta
- Os gatilhos numéricos (~40 linhas) são palpites para revisão, não números com base empírica.
- Antes de citar no guia, conferir no próprio livro: regras literais do *Clean Code* (1ª e 2ª ed.), definições e páginas do APOSD, texto da regra de três em *Refactoring* e a definição original de DRY em *The Pragmatic Programmer*.
- As fontes usadas devem entrar em `docs/product/references.md` quando o guia for escrito (não alterado nesta pesquisa).
