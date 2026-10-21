# Guia próprio vence guia pronto no Takt

**Resposta direta.** Nenhum guia de estilo pronto serve ao Takt sem ajustes. O caminho é um guia próprio, curto, em `docs/architecture/code-style.md`, montado sobre três bases e subordinado aos ADRs já aceitos:

- **Design:** as quatro regras do design simples de Kent Beck como ordem de prioridade, os módulos "profundos" de Ousterhout e a regra "prefira duplicação à abstração errada" de Sandi Metz. Do *Clean Code* ficam só as partes que nem os críticos contestam: nomes que revelam intenção e um nível de abstração por função. Saem o alvo de funções de 2 a 4 linhas e a ideia de que "comentário é sempre falha".
- **TypeScript:** o Google TypeScript Style Guide como base, com três divergências (arquivos em *kebab-case*, `switch` exaustivo sem `default` e nomes de unidade no campo). Quem impõe o estilo é a ferramenta: `strict` e mais seis *flags* no tsconfig, `strict-type-checked` + `stylistic-type-checked` do typescript-eslint e cerca de dez regras ligadas à mão. A revisão fica com o que nenhuma ferramenta julga: nomes, unidades, uso do `Result`, DTO montado campo a campo.
- **Arquitetura:** o hexágono do ADR-0002, com uma porta por **conversa com o mundo de fora** (persistência, relógio, auditoria, transação), um repositório por **raiz de agregado**, métodos de porta só quando um caso de uso os usa, e casos de uso finos. O motor fica de fora do hexágono: é um **núcleo funcional**, sem portas nem injeção.

**Por que importa.** O guia vai orientar pessoas e agentes do Claude Code, e as metas do ADR-0009 (90% de cobertura de linhas e ramificações, 80% de mutação no motor e no domínio) cobram caro por cada abstração especulativa. Um parâmetro "para o futuro" vira um ramo sem teste ou um mutante sobrevivente. A pesquisa também achou **três conflitos com registros aceitos** que não se resolvem no guia:

- o RLS "por operação" do ADR-0003 não convive com a transação de várias instruções que o ADR-0006 exige, e o Prisma 8 nem tem mais o mecanismo previsto;
- a regra "portas devolvem entidades, nunca DTOs" (ADR-0002) proíbe o modelo de leitura que as fontes recomendam;
- a precisão das funções de `Math` varia entre motores JavaScript, o que ameaça a promessa da RN-SIM-001 ("professor e aluno veem os mesmos números").

**Decisões que exigem confirmação.** Os três conflitos acima, mais o formato `Result` × exceções, que o ADR-0002 deixou em aberto, precisam de registros novos antes do marco 4 (API) ou do marco 1 (motor). As demais escolhas (banir `enum`, sufixos de arquivo, token das portas, banir `Date.now` no motor) cabem no guia. A lista completa está em "Decisões pendentes para o fundador".

> **Como ler este relatório.** **[Fato]** tem fonte citada, consultada pelos pesquisadores em 21/10/2026, ou caminho de arquivo verificado. **[Fato, fonte secundária]** tem fonte, mas não primária (resumo de terceiros). **[Estimativa]** é dedução a partir de fatos citados. **[Palpite]** é julgamento sem evidência direta. **[Conhecimento prévio]** é algo conhecido antes da pesquisa e **não verificado nesta rodada**: confira antes de levar a um ADR ou ao guia. Nada aqui substitui um registro aceito. Onde a pesquisa diverge de um ADR, o conflito está anotado e vai para decisão. O `cliniccontrol` é usado como referência do que funcionou e do que não funcionou, não como padrão.

## Clean code sobrevive nos nomes e perde no tamanho das funções

### As fontes concordam no objetivo e brigam no meio

Todas as fontes primárias querem o mesmo: código fácil de entender e de mudar. Ousterhout diz isso literalmente: "the fundamental goal of software design is to make it easy to understand and modify the system" [Fato] ([aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)). A discordância está em três pontos: **quanto decompor, quanto comentar e quando remover duplicação**.

O documento mais útil é a discussão pública entre Ousterhout e Robert C. Martin (set/2024 a fev/2025) [Fato] ([aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)):

- **Decomposição.** Martin mantém que "I do strongly recommend very short functions". Também defende a regra "One Thing": se dá para extrair um método de outro, o original fazia mais de uma coisa. Ousterhout responde que essa regra "lacks guardrails" e "is simply wrong in many cases". Para ele, o `PrimeGenerator` do livro, picado em "8 teeny-tiny methods", ficou difícil de ler.
- **O exemplo do livro.** O próprio Martin admitiu que a reescrita de Ousterhout, num só método comentado, "is much better than either Knuth's or mine". E a reescrita de Martin trouxe uma regressão de desempenho ao separar laços.
- **Comentários.** O *Clean Code* diz "Comments are always failures". Na discussão, Martin relativiza ("I'm not hostile to comments in general. I am very hostile to gratuitous comments"). Ousterhout vai no sentido oposto: "Comments are crucially important and add enormous value to software".
- **Fechamento.** Ousterhout resume o problema do livro como "failure to focus on what is important, and failure to balance design tradeoffs".

A 2ª edição do *Clean Code* saiu em 2025, descrita pela editora como "comprehensive rewrite" [Fato] ([Pearson](https://www.pearson.com/en-us/subject-catalog/p/clean-code-a-handbook-of-agile-software-craftsmanship-2nd-edition/P200000013239/9780135398548)). Martin diz que incorporou "several of your better ideas" de Ousterhout, mas **não achamos lista confiável do que mudou**.

As quatro regras de Beck dão a ordem de prioridade que falta ao *Clean Code*: "Passes the tests", "Reveals intention", "No duplication", "Fewest elements" [Fato] ([Fowler, BeckDesignRules](https://martinfowler.com/bliki/BeckDesignRules.html)). Fowler acha pouco importante a ordem entre a 2ª e a 3ª regra, porque uma alimenta a outra. A última é a base canônica contra abstração especulativa: um elemento (classe, método, camada) só existe se servir às três primeiras.

Ousterhout acrescenta o critério da **profundidade**: "The best methods are those that provide a lot of functionality but have a very simple interface". E o do **emaranhamento**: se entender um método exige ler o outro, os dois devem ser juntados [Fato] ([aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code)). Os sinais de alerta do livro incluem métodos que só repassam a chamada (*pass-through*) e "classitis", a crença de que mais classes é sempre melhor [Fato, fonte secundária] ([Lebrero](https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/); [dev.to](https://dev.to/sportebois/software-design-red-flags-wisdom-nuggets-from-john-ousterhout-43i2)).

Sobre duplicação, três autores convergem:

- **Sandi Metz:** "duplication is far cheaper than the wrong abstraction". Ela descreve o mecanismo da abstração errada: um requisito novo "quase" cabe, a abstração ganha parâmetros e condicionais e passa a se comportar diferente para cada chamador. O remédio é desfazer a abstração em cada chamador e reextrair; "the fastest way forward is back" [Fato] ([Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)).
- **Dan Abramov** conta que unificou métodos duplicados e trocou "the ability to change requirements for reduced duplication" [Fato] ([overreacted.io](https://overreacted.io/goodbye-clean-code/)).
- **Kent C. Dodds** chama isso de AHA, "Avoid Hasty Abstractions" [Fato] ([kentcdodds.com](https://kentcdodds.com/blog/aha-programming)).

A regra de três (tolerar a segunda cópia, abstrair na terceira) é atribuída a Don Roberts e popularizada por Fowler [Fato, fonte secundária] ([Wikipedia](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming))).

O YAGNI de Fowler tem uma exceção explícita que o guia precisa citar inteira. Ele **não se aplica** a "effort to make the software easier to modify". E uma generalização presumida é aceitável se for "easy to do now, adds minimal complexity, yet significantly reduces the later cost" [Fato] ([Fowler, Yagni](https://martinfowler.com/bliki/Yagni.html)).

### A evidência empírica não sustenta nenhum número fixo

A evidência é escassa e mista:

- **Nomes: o resultado mais sólido.** Em 72 desenvolvedores profissionais, nomes formados por palavras deram compreensão **cerca de 19% mais rápida** que letras ou abreviações [Fato] ([Hofmeister et al., SANER 2017](https://www.se.cs.uni-saarland.de/publications/docs/HoSeHo17.pdf)). Outros experimentos não acharam diferença na capacidade de modificar o código [Fato, fonte secundária] ([Never Work in Theory](https://neverworkintheory.org/2021/08/09/abbreviated-vs-full-names.html)).
- **Tamanho de método: dados contraditórios.** Um *preprint* com cerca de 785 mil métodos Java recomenda menos de 24 linhas [Fato] ([arXiv 2205.01842](https://arxiv.org/abs/2205.01842)). Mas a revisão de Derek Jones sobre os dados citados para "tamanho ótimo" conclui que a curva em U é artefato. Lá, a maioria dos estudos antigos mostra densidade de defeitos **caindo** com o tamanho do módulo [Fato, fonte secundária] ([shape-of-code](https://shape-of-code.com/2023/09/10/optimal-function-length-an-analysis-of-the-cited-data/)).
- **Métricas de complexidade.** Um estudo com fMRI (19 participantes, mais de 41 métricas) mostrou que elas explicam a cognição só em parte, e que o **vocabulário** (identificadores distintos) pesa na memória de trabalho [Fato] ([Peitek et al., ICSE 2021](https://github.com/brains-on-code/fMRI-complexity-metrics-icse2021)).
- **Refatoração.** Refatorar "para clean code" não dá ganho imediato garantido [Fato] ([Ammerlaan et al., SANER 2015](https://research.tudelft.nl/en/publications/old-habits-die-hard-why-refactoring-for-understandability-does-no)). E extrair superclasse piorou a legibilidade em 156 projetos, por introduzir termos genéricos [Fato, fonte secundária] ([Never Work in Theory, sobre Sellitto et al. 2022](https://neverworkintheory.org/2023/03/01/refactoring-and-program-comprehension.html)).
- **Padrões de projeto.** O experimento de Prechelt et al. (IEEE TSE 2001) achou efeito majoritariamente **positivo** dos padrões na manutenção, com exceções [Fato] ([KIT](https://ps.ipd.kit.edu/english/176_778.php)). As replicações deram resultados mistos [Fato] ([FORRT](https://forrt.org/flora-replication-atlas/doi/10.1109/32.988711/)).

[Estimativa] Duas conclusões para o guia:

1. **"Padrão = excesso de engenharia" não se sustenta.** O critério defensável é contextual: o padrão resolve uma variação que existe hoje, ou é barato agora e caro depois?
2. **Limites numéricos são gatilhos de revisão, não regras.** O achado de Peitek sobre vocabulário é compatível com a crítica de Ousterhout a muitos métodos pequenos com nomes novos, mas o estudo não testou isso diretamente.

Ficou de fora: não há estudo específico de TypeScript, React ou NestJS. Também não verificamos o texto literal do *Clean Code* nem as páginas do APOSD.

### O que o Takt adota, adota com nuance e descarta

| Princípio | Posição | Fonte | Observação para o Takt |
| --- | --- | --- | --- |
| Nomes revelam intenção, por palavras completas, consistentes, com unidade quando há grandeza física | Adotar | Beck regra 2; Hofmeister et al.; `CLAUDE.md` | Já é regra (`cycleSec`, `mtbfMin`) |
| Um nível de abstração por função | Adotar | Aceito até por críticos ([qntm via Goodreads](https://www.goodreads.com/author_blog_posts/20045870-it-s-probably-time-to-stop-recommending-clean-code)) | — |
| YAGNI para funcionalidade e generalização presumidas | Adotar, com a exceção de Fowler | [Fowler](https://martinfowler.com/bliki/Yagni.html); Beck "fewest elements" | Reforçado pelas metas de cobertura e mutação [Estimativa] |
| Preferir duplicação à abstração errada; regra de três | Adotar | Metz; Roberts/Fowler; Dodds | Abstração que acumula parâmetros por chamador deve ser desfeita |
| Testes passam primeiro | Adotar | Beck regra 1 | Já garantido pelo ADR-0009 |
| Tamanho de função | Com nuance | Fowler (intenção × implementação); Ousterhout | Sem limite fixo. Acima de ~40 linhas, o revisor pergunta se há uma intenção nomeável [Palpite: número sem base empírica]. Não extrair se o resultado for método raso ou emaranhado |
| Comentários em produção | Com nuance (posição de Ousterhout) | APOSD; Google TS | Comentar o porquê, invariantes, unidades, fontes da literatura e contratos públicos. Proibido comentário que repete o código. **Testes sem comentários** (ADR-0009) |
| DRY | Com nuance | Metz; ADR-0002 | Conhecimento de negócio num só lugar, já (regra `RN-...` no domínio). Forma parecida de código só na terceira cópia [Estimativa: a distinção conhecimento × forma é interpretação; a definição original de Hunt e Thomas não foi verificada] |
| Módulos profundos; método de repasse é sinal de alerta | Com nuance | Ousterhout | Exceto onde a camada é imposta pelo ADR-0002; o caso de uso CRUD que só delega é custo aceito, a registrar para a revisão do marco 4 |
| Padrões de projeto | Com nuance | Prechelt 2001; YAGNI | Permitidos para variação que existe hoje, ou barata agora e cara depois. Nunca "por precaução" |
| Herança | Evitar | [Estimativa] a partir de Sellitto et al. | Superclasse só com dois usos reais e nome de domínio (nada de `Base` ou `Abstract`) |
| Funções de 2 a 4 linhas; "One Thing" sem limite | Descartar | Ousterhout; discussão com Martin | — |
| "Comentário é sempre falha" | Descartar em produção | Ousterhout; o próprio Martin relativiza | Nos testes, a proibição vale por decisão do ADR-0009, não por esse argumento |
| TDD como prática de design | Fora de discussão | ADR-0009 | A crítica de Ousterhout ao TDD **não reabre** a decisão; o guia exige o passo de refatoração do ciclo, onde se corrige decomposição ruim |

## Quebrar um princípio de estilo exige critério escrito no plano

As fontes dão poucos critérios numéricos e vários qualitativos verificáveis. O guia deve permitir que quem planeja uma mudança (pessoa ou agente) **quebre um princípio de estilo** quando segui-lo seria excesso de engenharia, mas só com justificativa escrita.

### Critérios de desvio

O plano pode quebrar um princípio do guia se **pelo menos um** dos critérios abaixo for verdadeiro e estiver escrito nele. A base vem das fontes citadas acima; a redação é proposta das notas [Estimativa].

1. **Não haverá reuso real.** A abstração teria um só chamador, e nenhum caso de uso ou marco já escrito prevê um segundo.
2. **Interface com uma só implementação.** Não existe segunda implementação nem dublê de teste necessário. Seemann chama interface 1:1 de cheiro de código ([Seemann](https://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/)). As portas do ADR-0002 já têm duas implementações (Prisma e em memória); fora delas, é preciso justificar.
3. **Indireção sem benefício.** A extração geraria método de repasse, método emaranhado ou classe rasa.
4. **Duplicação abaixo da regra de três.** São duas cópias parecidas cujos chamadores podem divergir.
5. **Abstração existente virou errada.** Ela já acumula parâmetros e condicionais por chamador; o plano propõe desfazê-la e reextrair (Metz).
6. **Desempenho medido**, sobretudo no motor. A forma "limpa" custa tempo mensurável, e o plano cita a medição.
7. **Clareza local maior.** Um algoritmo da literatura fica mais claro inteiro e comentado (o caso `PrimeGenerator`).
8. **Generalização barata agora e cara depois**, com o custo futuro descrito concretamente (a exceção do próprio YAGNI).
9. **Exigência de teste.** A forma escolhida é a que permite cumprir AAA, um único Act e as metas do ADR-0009 sem lógica no teste.

### As cinco coisas que o plano registra

Para cada desvio, o plano escreve:

1. **Princípio quebrado:** o nome exato do item do guia.
2. **Critério e evidência:** qual critério acima se aplica e a prova concreta (quantos chamadores, quais implementações, a medição, o link para o caso de uso).
3. **Alternativa descartada:** em uma frase, como ficaria seguindo o princípio.
4. **Gatilho de revisão:** o fato que faria voltar ao princípio ("terceiro chamador", "segunda implementação", "fim do marco 4").
5. **Impacto em testes:** a confirmação de que cobertura e mutação continuam atendidas.

### O que nenhum plano pode quebrar

O checklist vale **só para princípios de estilo**. Um plano **nunca** pode quebrar:

- **o `CLAUDE.md`;**
- **ADRs e PDRs aceitos;**
- **regras de negócio `RN-...`.**

Na prática, isso inclui: pular camada, porta ou validação do ADR-0002; trocar códigos de erro por frases; tirar `organization_id` ou RLS de uma tabela de negócio; usar `Math.random`, React, Three.js ou DOM no motor; comentar testes ou pôr lógica neles; validar a entrada em mais de um lugar.

Quem achar que uma dessas regras atrapalha **escreve um registro novo com status "Proposto"**, que, se aceito, substitui o antigo. Registro aceito não se edita.

O ADR-0002 já prevê a válvula certa: lista como custo o "risco de cerimônia excessiva em fluxos simples (CRUD)", com revisão ao fim do marco 4 [Fato] (`docs/adr/0002-arquitetura-hexagonal-por-contexto.md`). O guia deve mandar **anotar cada caso de cerimônia sem benefício** (caso de uso que só repassa, *mapper* trivial) como insumo dessa revisão, em vez de contorná-lo no código.

## A ferramenta impõe a maior parte do estilo TypeScript; a revisão julga o resto

### O guia do Google serve de base, com três divergências

O Google TypeScript Style Guide é o guia público mais completo e prescritivo. Mas **não tem data nem versão**: a versão pública é "pushed on-demand by volunteers" e foi adaptada do guia interno [Fato] ([Google TS Style Guide](https://google.github.io/styleguide/tsguide.html)).

Ele bate com o Takt em quase tudo [Fato] (mesma fonte):

- **nomes:** `UpperCamelCase` para tipos, `lowerCamelCase` para valores, siglas tratadas como palavras (`customerId`, não `customerID`); sem prefixo `I`, sem `_`, sem notação húngara;
- **exports:** só *named exports*, sem `export default`, sem `namespace`, sem `export let`;
- **tipos:** `unknown` no lugar de `any`; `as` e `!` só com justificativa comentada;
- **controle:** `===` sempre; `const` por padrão;
- **erros:** `throw` só de `Error`, `catch (e: unknown)`;
- **decoradores:** nenhum decorador novo, só os do framework.

As três divergências do Takt:

1. **Nome de arquivo.** O Google usa `snake_case`. O NestJS gera `app.controller.ts` [Fato] ([NestJS First steps](https://docs.nestjs.com/first-steps)), e o ADR-0002 já usa `plants.module.ts`, `use-cases/`, `value-objects/`. O Takt fica com *kebab-case* [Estimativa].
2. **`default` em todo `switch`.** O Google exige. O typescript-eslint trata o `default` num `switch` exaustivo sobre união como "a form of dead code", que esconde membros novos [Fato] ([switch-exhaustiveness-check](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)). O Takt prefere a checagem de exaustividade. A exceção é dado vindo de versão mais nova, como um JSON de planta de versão futura.
3. **Unidade no nome.** Não é conflito, embora pareça notação húngara [Estimativa]. A húngara codifica o **tipo** (`kSecondsPerDay`), que o compilador já conhece. A unidade é informação que `number` não carrega. As Google AIPs confirmam: quantidades "must include the unit of measurement as the suffix", com abreviação aceita, sem plural, e `_count` para contagens [Fato] ([AIP-141](https://google.aip.dev/141); [AIP-140](https://google.aip.dev/140)). Em camelCase: `cycleSec`, `mtbfMin`, `partCount` (não `numParts`). Para taxas sem unidade física, a proposta é `Ratio` quando o valor vai de 0 a 1 e `Pct` quando vai de 0 a 100 [Palpite].

O Google também proíbe `#private` em favor de `private`. Não há motivo no Takt para divergir; o guia pode seguir [Estimativa].

### TypeScript 6 no monorepo, TypeScript 7 só para checar

O cenário de versões em 21/10/2026 [Fato]:

- **TypeScript 6.0** saiu em 23/03/2026. Liga `strict` por padrão, troca padrões de `module` e `target` e passa o padrão de `types` para `[]` ([Announcing TS 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)).
- **TypeScript 7.0**, o compilador nativo em Go, saiu em 08/07/2026. É compatível com a checagem do 6.0, mas **"does not ship with an API"**. Ferramentas como o typescript-eslint devem ficar no 6.0 até a nova API, prevista para o 7.1. O pacote `@typescript/typescript6` permite usar os dois lado a lado ([Announcing TS 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)).
- **NestJS 12** gera projetos com `strict` ligado e usa **oxlint** e Vitest por padrão em projetos ESM ([NestJS First steps](https://docs.nestjs.com/first-steps); [InfoQ, 19/10/2026](https://www.infoq.com/news/2026/10/nestjs-12-observability)).

[Estimativa] Como o ADR-0010 exige typescript-eslint com tipos, o monorepo fica no **TypeScript 6.x**. O 7 serve, no máximo, para um `tsc --noEmit` mais rápido. O padrão oxlint do Nest 12 não muda o ADR-0010, pelo mesmo motivo que descartou o Biome: o Takt depende de plugins do ESLint para as fronteiras.

Um ponto não esclarecido: o anúncio do TS 7 não diz se `experimentalDecorators` e `emitDecoratorMetadata` continuam. O Nest 12 "continues to rely on legacy TypeScript decorators" [Fato] ([InfoQ](https://www.infoq.com/news/2026/10/nestjs-12-observability)).

### O que o tsconfig e o typescript-eslint impõem

Os presets `strict-type-checked` e `stylistic-type-checked` são o ponto de partida do ADR-0010. Dois cuidados:

- **Eles não seguem *semver*:** "This configuration is not considered 'stable' under Semantic Versioning" [Fato] ([typescript-eslint configs](https://typescript-eslint.io/users/configs)). Por isso, a versão exata fica fixada. A atualização manual do ADR-0010 já é a mitigação.
- **Várias regras importantes não estão em preset nenhum** e precisam ser ligadas à mão: `switch-exhaustiveness-check`, `prefer-readonly`, `consistent-type-imports`, `no-import-type-side-effects` e `naming-convention` [Fato] ([lista de regras](https://typescript-eslint.io/rules/)).

A tabela de regras das notas foi reconstruída do texto da página; **cada regra deve ser conferida antes de fixar a configuração**.

No tsconfig, além do `strict` (explícito, mesmo sendo padrão no 6.0), valem as *flags* que ficam fora dele [Fato] ([TSConfig Reference](https://www.typescriptlang.org/tsconfig/)):

- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes` (marcada "Recommended");
- `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`;
- `verbatimModuleSyntax`;
- `forceConsistentCasingInFileNames` e `skipLibCheck`.

A *flag* `erasableSyntaxOnly` dá erro em `enum`, `namespace` com código e *parameter properties*. Por isso serve ao `sim-engine` e ao `plant-schema`, mas não à `takt-core-api`, onde o Nest injeta pelo construtor [Estimativa].

### Ferramenta × revisão

| Convenção | Imposta por ferramenta | Fica para a revisão |
| --- | --- | --- |
| Sem `any`; `unknown` + estreitamento | `no-explicit-any`, `no-unsafe-*` | `any` legítimo em mock, com supressão justificada |
| Sem `!`; `as` só justificado | `no-non-null-assertion`, `consistent-type-assertions` | A justificativa do `as` |
| `interface` para objeto, `type` para união e tipos do Zod | `consistent-type-definitions: interface` | — |
| Sem `enum` (decidir) | `no-restricted-syntax` com `TSEnumDeclaration` (não existe regra `no-enum`) [Fato] ([TS Handbook](https://www.typescriptlang.org/docs/handbook/enums.html)) | — |
| `switch` exaustivo sem `default` sobre união | `switch-exhaustiveness-check` com `considerDefaultExhaustiveForUnions: false`, `requireDefaultForNonUnion: true`, `allowDefaultCaseForExhaustiveSwitch: false` | Exceção para dado de versão externa |
| `readonly` em campos não reatribuídos | `prefer-readonly` | Tipos públicos do motor e das entidades (`prefer-readonly-parameter-types` é ruidosa) [Palpite] |
| Sem `@ts-ignore` e `@ts-nocheck` | `ban-ts-comment` | `@ts-expect-error` com descrição em testes de tipo [Palpite] |
| Casos de nome do Google | `naming-convention` (congelada, mas funcional) | Clareza, abreviações, **unidade no nome** (a regra não sabe se um `number` é grandeza física) |
| Só *named exports* | `no-restricted-exports` com `restrictDefaultExports` [Estimativa: conferir a versão do ESLint], com exceção para configs | — |
| `import type` para tipos | `verbatimModuleSyntax` + `consistent-type-imports` + `no-import-type-side-effects` | Classes injetadas pelo Nest (ver abaixo) |
| Promessas sempre tratadas | `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`, `return-await` | — |
| `throw` só de `Error`; `catch` com `unknown` | `only-throw-error`, `prefer-promise-reject-errors`, `useUnknownInCatchVariables`, `use-unknown-in-catch-callback-variable` | `cause` ao reembrulhar; nunca serializar `cause` |
| Fronteiras entre projetos e camadas | `@nx/enforce-module-boundaries`, `eslint-plugin-boundaries` (ADR-0001, ADR-0002) | Nenhum `eslint-disable` de fronteira |
| `Math.random` proibido no motor | `no-restricted-properties` (ADR-0011) | — |
| Nome de arquivo em *kebab-case* | `unicorn/filename-case` ou `check-file` [Estimativa: plugin extra, não pesquisado] | Sufixos por papel |
| Comentário explica o porquê; JSDoc nos exports públicos das libs | `eslint-plugin-jsdoc` poderia impor [Estimativa: não pesquisado] | Qualidade e veracidade do comentário |

### Erros esperados vão no tipo; defeitos viram exceção

As fontes de autoridade dividem os erros em dois tipos:

- **esperados:** fazem parte do fluxo de negócio e aparecem no tipo;
- **inesperados:** são defeitos e viram exceção.

O Effect chama os primeiros de *expected errors* ("anticipate and expect as part of normal program execution") e os segundos de *defects* [Fato] ([Effect](https://effect.website/docs/error-management/two-error-types/)). O Node diz que `error.message` "may be changed in any versions. Use `error.code` to identify an error instead" [Fato] ([Node.js errors](https://nodejs.org/api/errors.html)).

As duas bibliotecas prontas não servem ao domínio do Takt, que não importa nada de fora (ADR-0002) [Estimativa]:

- **neverthrow:** última versão 8.2.0 [Fato] ([npm](https://registry.npmjs.org/neverthrow/latest)), empacotada por volta de 21/02/2025, ou seja, cerca de 20 meses sem versão nova [Estimativa, a partir do metadado do npm].
- **Effect:** é um modelo de programação inteiro, desproporcional ao MVP.

A proposta das notas segue o ADR-0010 ("código próprio pequeno"):

- um `Result` próprio de cerca de 30 linhas em `shared/kernel/`, onde o ADR-0002 já prevê `Result` e `DomainError`;
- falha de negócio esperada (`PLAN_LIMIT`, `FORBIDDEN`, regras `RN-...`, e no motor `SIMULATION_LIMIT_EXCEEDED`) vira `Result<T, DomainError>`, discriminado por um `code` literal;
- defeito vira `throw new Error(...)`, pego pelo filtro global e registrado no log (ADR-0007);
- a camada `http` traduz `code` em status por um filtro registrado com `APP_FILTER`. O filtro padrão do Nest devolve 500 genérico para erro desconhecido e nunca serializa `cause` [Fato] ([NestJS exception filters](https://docs.nestjs.com/exception-filters)).

O custo: **sem `eslint-plugin-neverthrow`, nada obriga o chamador a tratar um `Result` próprio**. Parte disso fica para a revisão; o `switch-exhaustiveness-check` sobre `error.code` cobre o tratamento exaustivo quando o código é uma união de literais [Estimativa].

Hoje, o doc vivo `docs/architecture/takt-core-api.md` mostra o domínio **lançando** `RealPlantNotPublishableError extends DomainError`. Ou seja, a escolha muda um exemplo já escrito [Fato] (`docs/architecture/takt-core-api.md`, seção "Erros").

### NestJS: portas, tokens e a armadilha dos metadados

Interfaces somem na compilação, então o Nest não as enxerga em tempo de execução. Há duas saídas documentadas [Fato] ([NestJS Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)):

- um **token** `string` ou `Symbol`, com `@Inject()`;
- uma **classe abstrata**, que existe em tempo de execução e serve ao mesmo tempo de contrato e de token.

Para os casos de uso, `useFactory` com `inject` passa as instâncias "in the same order". É o que o ADR-0002 já manda.

As notas divergem aqui:

- a de TypeScript prefere `interface` + `Symbol`, para manter as portas só de tipo [Palpite];
- a de arquitetura prefere a classe abstrata, que o `cliniccontrol` já usava (`core/domains/patient/repositories/database-repository.ts` com `provide`/`useClass` em `repositories.module.ts:21-41`) [Fato].

Dois fatos pesam a favor de **`@Inject(Token)` explícito em todo construtor de classe do Nest**, qualquer que seja o token:

1. O post do Prisma sobre Prisma 8 + NestJS recomenda "put `@Inject(Token)` on every injected constructor parameter", porque `tsx` e esbuild ignoram `emitDecoratorMetadata` [Fato] ([Prisma blog](https://www.prisma.io/blog/prisma-orm-8-nestjs)).
2. Com `verbatimModuleSyntax` e `consistent-type-imports`, uma classe importada com `import type` some do JavaScript, e o metadado vira `Object`, quebrando a injeção [Palpite: testar na implementação].

Há ainda uma possibilidade a conferir: o typescript-eslint teria opções de *parser* que fazem o `consistent-type-imports` respeitar metadados de decorador [Conhecimento prévio: não verificado].

Por último, o Nest 12 aceita a opção `schema` em `@Body()`, `@Query()` e `@Param()` com qualquer objeto *Standard Schema*, o que inclui o Zod sem *wrapper* [Fato] ([InfoQ](https://www.infoq.com/news/2026/10/nestjs-12-observability)). Isso pode resolver o "Em aberto" do ADR-0008 (integração Zod + Nest). Mas o tipo do parâmetro ainda seria anotado à mão, e a geração de OpenAPI não foi verificada.

## O hexágono do Takt é rígido na escrita e leve na leitura

As fontes primárias definem o padrão pela **intenção**, não pelo número de camadas:

- **Cockburn:** a aplicação deve poder ser dirigida "equally... by users, programs, automated test or batch scripts" e rodar isolada dos dispositivos. "A port identifies a purposeful conversation", e a preferência dele "tends to favor a small number, two, three or four ports" [Fato] ([Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)).
- **Fowler:** o repositório é uma interface "collection-like" sobre objetos de domínio [Fato] ([Fowler, Repository](https://martinfowler.com/eaaCatalog/repository.html)). Os agregados são a unidade de carga e gravação, e "Transactions should not cross aggregate boundaries" [Fato] ([Fowler, DDD_Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html)).
- **Microsoft:** "you should never create a repository for each table in the database". E: "Repositories might be useful, but they are not critical for your DDD design in the way that the Aggregate pattern and a rich domain model are" [Fato] ([Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)).

As críticas atacam três excessos, não o padrão em si:

- **Portas para o que nunca varia.** Seemann: "Having only one implementation of a given interface is a code smell" [Fato] ([Seemann](https://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/)).
- **Repositório usado como camada genérica por tabela.** A Brocoders: "Don't try to create universal methods in the repository" [Fato] ([brocoders/nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/architecture.md)).
- **Leitura obrigada a passar pela entidade.** Sairyss: "in a read model / query handlers it is not required to use a repository pattern" [Fato] ([domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon)).

O próprio domain-driven-hexagon avisa que o padrão "is generally ill-suited to simple CRUD applications". Bogard diz que as camadas servem "only... a minority of the typical requests" [Fato] ([Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)). Ao mesmo tempo, Fowler alerta que "for most systems CQRS adds risky complexity" [Fato] ([Fowler, CQRS](https://martinfowler.com/bliki/CQRS.html)).

[Estimativa] O equilíbrio para o Takt é este: o **lado de escrita** passa sempre pelo domínio rico, porque é onde estão as invariantes e a segurança. O **lado de leitura** pode ser direto, desde que pelo cliente com RLS. Mas isso esbarra no texto do ADR-0002 (ver decisão D2).

Não há repositório de referência **mantido e popular** que una NestJS + Prisma + hexagonal + RLS:

- o Sairyss tem 14.988 estrelas, mas está parado desde 11/06/2024;
- a Brocoders é ativa, mas não usa Prisma;
- a receita oficial do Nest usa Prisma 7 e injeta o cliente direto nos *services*, sem repositório.

[Fato] ([GitHub, via API em 21/10/2026](https://github.com/Sairyss/domain-driven-hexagon); [NestJS recipes/prisma](https://docs.nestjs.com/recipes/prisma)). As convenções abaixo são, portanto, síntese do Takt, ancorada nos ADRs.

### Domínio

- **Entidades:**
  - estado e construtor privados;
  - duas fábricas: `create(...)` valida as invariantes; `restore(snapshot)` reidrata do banco sem revalidar regra de criação;
  - métodos com nome de negócio (`publishTo`, `rename`) e nenhum *setter* [Fato: ADR-0002 para o núcleo; Estimativa para `restore`].
- **Repositório só para a raiz do agregado.** Outros agregados são referenciados por ID: "Reference Other Aggregates by Identity" [Fato] ([Vernon, via InformIT](https://www.informit.com/articles/article.aspx?p=2020371)). Ou seja, `Plant` guarda `organizationId`, e não um objeto `Organization`.
- **Objeto de valor** só quando há regra de formato ou de igualdade.
- **Serviço de domínio** (`PlanLimitPolicy`) só para regra entre várias entidades. Ele é puro e recebe dados prontos.
- **Erros** com `code` da tabela de regras, sem frase e sem `HttpStatus`.
- **Nada de fora:** nem `@nestjs/*`, `@prisma/*`, `zod`, nem `crypto` do Node. ID e hora chegam de fora.
- **Testes:** TDD, um teste por invariante, com o ID `RN-...` no nome e sem *mocks*.

### Aplicação

- **Caso de uso:** classe simples, com um método `execute(command, ctx)`, montada por `useFactory` [Fato: ADR-0002].
  - O `command` é um tipo TypeScript simples, sem Zod.
  - O `ctx` traz `organizationId`, `userId` e papel do contexto da requisição, nunca do corpo [Fato: ADR-0008].
- **Roteiro fino:** carregar → chamar o domínio → salvar → auditar → devolver. A justificativa é a citação de Evans via Fowler: "This layer is kept thin. It does not contain business rules" [Fato] ([Fowler, AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html)). **Um `if` de regra de negócio no caso de uso é sinal de que a regra está no lugar errado.**
- **Porta de repositório:**
  - uma por raiz de agregado;
  - métodos de coleção (`findById`, `save`, buscas com nome de negócio);
  - **um método só entra quando um caso de uso o usa**;
  - sem `update(dto)`, sem `findAll()` genérico, sem `organizationId` como parâmetro (o RLS filtra).
- **Outras portas** só para **efeito colateral ou não determinismo**: `Clock`, `IdGenerator`, `AuditLog`, `SessionReader`, `TransactionRunner`. Cada uma tem implementação real e em memória, o que passa no critério de Cockburn e responde à crítica de Seemann [Estimativa].
- **Transação:** uma porta `TransactionRunner` [Estimativa]. O decorador `@Transactional()` do `nestjs-cls` é do Nest e não pode ficar em `application/` [Fato] ([nestjs-cls Prisma adapter](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/prisma-adapter)). Ver D1.
- **Dados de teste:** fábricas `makePlant(overrides)` com dados fixos, sem `faker` aleatório.

### Infraestrutura

- **Repositório Prisma:**
  - usa o cliente da transação do contexto, nunca um cliente global;
  - não tem regra de negócio. Duplicidade é `UNIQUE` no banco, com a violação traduzida para erro de domínio dentro do adaptador;
  - nenhum tipo de `@prisma/client` sai do arquivo.
- ***Mapper*:** funções puras `toDomain(record)` (via `restore`) e `toPersistence(entity)`. *Enums* são convertidos por tabela explícita, sem `as unknown as`.
- **Em memória:**
  - fica em `infra/in-memory/`, fora do domínio;
  - guarda cópias;
  - **não reimplementa regra de negócio**. Reproduz só restrições do banco (unicidade), lançando o mesmo erro de domínio que o adaptador Prisma.
- **Teste de contrato:** uma suíte por porta, rodada contra as duas implementações [Palpite]. Garante que a implementação em memória não minta.

### HTTP e montagem

- **Controller fino:**
  1. recebe a entrada já validada pelo *pipe* Zod estrito;
  2. monta `command` e `ctx`;
  3. chama o caso de uso;
  4. monta o **DTO de saída campo a campo** [Fato: ADR-0008, itens 7 e 8].
- **Esquemas:** um esquema Zod de entrada e um de saída por rota, em `http/schemas/`. Os tipos inferidos não saem de `http/`.
- **Erros:** sem `try/catch` no controller; o filtro global traduz.
- **Autorização:** toda rota tem `@RequirePermission` ou `@Public()` [Fato: ADR-0006].
- **No `*.module.ts`:** portas ligadas por `provide`/`useClass`; casos de uso por `useFactory` + `inject`.

### Entre módulos

- Um módulo só importa a `public-api` da aplicação de outro, nunca o `domain` ou a `infra` dele [Fato: ADR-0002]. A fachada pública é a recomendação de Sairyss ([domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon)).
- No MVP, chamada síncrona basta. Eventos só quando houver necessidade de consistência eventual [Palpite].

### Quando não aplicar o padrão

| Situação | Não fazer | Fazer | Critério |
| --- | --- | --- | --- |
| Código puro e determinístico | Porta + adaptador | Função ou serviço de domínio chamado direto | Porta só para efeito colateral, E/S ou não determinismo (Cockburn) |
| Dependência sem segunda implementação nem dublê | Porta | Chamada direta em `infra/` ou `shared/` | Interface 1:1 é cheiro de código (Seemann) |
| Leitura para tela, sem regra | Entidade + repositório + *mapper* | Consulta de leitura em `infra/`, com RLS | Microsoft, Sairyss. **Depende da decisão D2** |
| Registro do banco igual ao DTO de leitura | *Mapper* em várias etapas | `select` do Prisma já no formato | *Mapper* só onde os formatos diferem (entidade ↔ registro sempre, ADR-0002) |
| Catálogo só de leitura (`plans`) | Repositório com `save` | Porta de leitura pequena ou configuração em código | Repositório é para raiz que muda (Fowler, Vernon) |
| Entidade filha do agregado | Repositório próprio | Carregada e salva pela raiz | "never create a repository for each table" (Microsoft) |
| Método "para o futuro" | Declarar na porta | Só quando um caso de uso usa | `cliniccontrol`: `throw new Error('Method not implemented.')` |
| Regra entre entidades dentro de uma transação (limite do plano) | Eventos ou consistência eventual | Serviço de domínio + `TransactionRunner` | ADR-0006 exige a checagem dentro da transação |
| Motor de simulação | Camadas, portas, injeção | Núcleo funcional | Bernhardt, Seemann, ADR-0011 |

## O motor é um núcleo funcional, sem portas

O `@takt/sim-engine` recebe valores (planta compilada, semente, modo) e devolve valores (indicadores, séries, estado final, log). Isso é exatamente o "functional core" de Bernhardt: uma casca imperativa cuida da E/S "based on values produced by the functional core", e o núcleo se testa "with no test doubles" [Fato] ([Destroy All Software](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)). Seemann argumenta que um bom desenho funcional "is equivalent to the Ports and Adapters architecture" [Fato] ([Seemann](https://blog.ploeh.dk/2016/03/18/functional-architecture-is-ports-and-adapters/)).

[Estimativa] O motor já é o centro de um hexágono, **sem portas secundárias**: ele não busca nada fora de si. Criar `ClockPort` ou `RandomPort` seria cerimônia, porque o gerador MRG32k3a é determinístico e parte do próprio domínio (ADR-0011). A casca é o código do Worker no `takt-web-app`, com poucos condicionais e nenhuma regra de simulação. A organização por conceito (`rng/`, `distributions/`, `events/`, `model/`, `stats/`, `modes/`) é a proposta, não camadas `domain/application/infra` [Palpite].

As convenções específicas vêm de fatos sobre o JavaScript:

- **Ordem de iteração.** O `Map` itera "in insertion order". A ordem de chaves de objeto "is complex. As a result, it's best not to rely on property order" [Fato] ([MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)). Portanto: iterar só `Map` ou arrays em ordem conhecida; nunca decidir ordem de eventos por `Object.keys` de dado vindo do JSON; desempate explícito em toda ordenação, como o *heap* do ADR-0011 já faz.
- **Forma estável dos objetos.** Objetos com as mesmas propriedades, adicionadas na mesma ordem, compartilham a *HiddenClass*. Adicionar e remover propriedades com frequência leva ao modo dicionário, mais lento [Fato] ([V8, Fast properties](https://v8.dev/blog/fast-properties), de 2017). [Estimativa] No laço quente: todos os campos inicializados na criação, sempre na mesma ordem, sem `delete`, sem criar objeto por evento quando evitável.
- **Imutabilidade só na fronteira.** A API pública (entrada compilada, resultados, estado final) usa `readonly` e `ReadonlyArray`. Dentro de uma execução, mutação local controlada é aceitável e é o que o V8 favorece, desde que não escape: `run` continua determinística para quem chama [Estimativa].
- **Sintaxe apagável.** `erasableSyntaxOnly` ligado (sem `enum`, `namespace` ou *parameter properties*), se o fundador aceitar (D8).
- **Comentários obrigatórios onde há literatura.** Fórmula, fonte, hipótese e unidade (por exemplo, AS 241 de Wichura, inversão da exponencial), com JSDoc nos exports públicos. É o caso em que o argumento de Ousterhout pesa mais [Estimativa].
- **Fontes de não determinismo proibidas.** `Math.random` já é proibido (ADR-0011). As notas propõem banir também `Date.now`, `new Date()` e `performance.now` no lint do motor [Palpite]. Ver D6.

O fato mais sério para o motor: **"Many `Math` functions have a precision that's implementation-dependent... different browsers can give a different result. Even the same JavaScript engine on a different OS or architecture can give different results!"** [Fato] ([MDN Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)).

O ADR-0011 usa `ln` na exponencial e o AS 241 na normal. O teste de determinismo do ADR-0011 (mesma entrada, mesmo motor) continua válido. Mas **"mesma semente → mesmo resultado" entre Chrome, Firefox, Safari e um futuro `takt-sim-worker` em Node não está garantido** [Estimativa].

A RN-SIM-001 promete resultados iguais com "a mesma versão do motor". O exemplo dela é "o professor e o aluno rodam a mesma planta com a semente 42 e veem os mesmos números" [Fato] (`docs/product/rules/simulation.md`). Professor e aluno em navegadores diferentes é o caso comum. Ver D4.

Lacunas: a cláusula de `Math` da especificação ECMAScript não foi lida (usamos a MDN). Também não há *benchmark* recente de V8 para laços de simulação.

## O cliniccontrol ensina mais pelos erros do que pelos acertos

O `cliniccontrol` usa Nx 17.2.5, NestJS 10.3, Prisma 5.7, `class-validator` e Zod juntos, e Vitest 1.0. O último *commit* é de 07/03/2024 [Fato] (`/home/italoamaral/cliniccontrol/package.json`).

**Os nove problemas listados no ADR-0002 estão confirmados no código**, com arquivo e linha [Fato]:

- o domínio importa `ConflictException` em `create-patient.service.ts:2`;
- há `new BcryptHasherService()` dentro de casos de uso;
- a entidade é anêmica, com `Object.assign` e um *setter* por campo;
- e assim por diante, item a item.

Há um detalhe revelador: **já existia um *fake* de *hash* pronto** (`tests/cryptography/fake-hasher.ts`), mas ele não podia ser injetado nos casos de uso que davam `new` na implementação real [Fato].

A revisão achou **dez problemas novos** (numerados de 10 a 19 nas notas). A raiz comum de vários deles é **um único formato de dado reaproveitado em todas as camadas**: o DTO com decoradores serve de entrada, de entidade, de saída e de base do *mapper* [Estimativa]. A convenção mais importante que o Takt herda disso é: **cada fronteira tem o seu tipo** (esquema Zod, comando, entidade, registro do Prisma, DTO de saída), com conversões explícitas.

### Achados de segurança, como lições para a revisão

Cinco achados tocam segurança ou privacidade. Nenhum valor secreto é reproduzido aqui.

1. **Hash da senha na resposta.** O DTO de saída de criação de psicólogo declara `password`, e o controller devolve a entidade direto. O DTO é só uma anotação de tipo, sem montagem campo a campo. O mesmo acontece na criação de paciente [Fato] (`create-psychologist/output.dto.ts:14-15`, `create-psychologist.controller.ts:39-41`, `create-patient.controller.ts:25-27`). **Lição:** DTO de saída montado campo a campo e validado contra o esquema de saída nos testes (ADR-0008, item 8). Lista de permissão, não de exclusão.
2. **Atribuição em massa.** O `ValidationPipe` global não tem `whitelist` nem `forbidNonWhitelisted`, e `role` e `plan` vêm do corpo [Fato] (`main.ts:34-40`; `create-psychologist/input.dto.ts:15-18`). É exatamente o risco que o ADR-0002 descreve. **Lição:** Zod estrito, e `organizationId`, usuário e papel sempre do contexto.
3. **Detalhes internos na resposta de erro.** O filtro global concatena `error.message` do Prisma e o código do erro na mensagem HTTP [Fato] (`shared/errors/globalAppHttpException.ts:44-69`). **Lição:** só códigos na resposta; detalhes só no log interno.
4. **Log com dados potencialmente pessoais e `console.log` solto.** Um validador registra o objeto de erros inteiro do `class-validator`, que inclui o valor recebido [Estimativa: pelo formato conhecido do `ValidationError`]. Há outros `console.log` em *guards* e repositórios [Fato] (`shared/validators/validate-or-reject.ts:10`; `jwt-auth.guard.ts:14`; `api-key.guard.ts:13-24`). **Lição:** nenhum `console.log`; só o log canônico do ADR-0007, sem dados pessoais.
5. **Segredo versionado.** O `nx.json` contém um token de acesso do Nx Cloud. Os arquivos `.env` **não** estão versionados; só os `.env.example` [Fato] (`git ls-files`; nenhum `.env` foi aberto). As notas não verificaram desde quando o token está lá nem se ainda é válido. **Lição:** nenhum token em arquivo de configuração versionado. O gitleaks do ADR-0010 é a barreira prevista, mas não verificamos se as regras padrão dele reconhecem esse formato de token. [Palpite] Vale o fundador conferir se o token ainda é válido e, se for, revogá-lo.

Os outros achados viram itens de revisão de arquitetura:

- **Porta maior que o uso:** métodos com `throw new Error('Method not implemented.')`.
- **Tipos do ORM vazando:** o DTO HTTP importa um *enum* de `@prisma/client`, e o *mapper* faz `as unknown as` entre *enums*.
- **Em memória no lugar errado:** implementações em memória dentro do domínio, reimplementando regra e lançando exceção do Nest.
- **Fronteiras desligadas:** `depConstraints` liberando `"*" → "*"` e `eslint-disable` de fronteira no topo de casos de uso.
- **Nenhuma transação** no código inteiro.
- **Testes fracos:** `faker` sem semente e nomes "should …" sem ID de regra.

[Fato] (arquivos citados nas notas, em `apps/core-rest-api/src/app/`).

### O que vale manter

[Fato: existência; Estimativa: valor]

- um caso de uso por pasta, com o teste ao lado (o ADR-0002 já adota);
- porta como classe abstrata usada como token;
- *mapper* `toDomain`/`toPrisma` por agregado, mas mapeando entidade ↔ registro, não DTO ↔ registro;
- fábricas `makeX(override)` e *fakes* de criptografia, trocando o `faker` por dados fixos;
- pasta por rota com o teste de API ao lado;
- documentação por biblioteca.

## Decisões pendentes para o fundador

Os itens se dividem em dois grupos:

- **Grupo A:** conflitam com um registro aceito ou fecham um "Em aberto" de registro aceito. Como registro aceito não se edita, **cada um precisa de um ADR (ou PDR) novo**, com status "Proposto".
- **Grupo B:** as notas marcam como "decidir", mas cabem no guia de estilo sem contrariar nenhum registro.

### Grupo A: exigem registro novo

| # | Conflito | Opções | Recomendação das notas | Registro novo? |
| --- | --- | --- | --- | --- |
| D1 | **Versão do Prisma e transação do RLS × ADR-0003, item 4.** O ADR descreve "uma extensão do cliente Prisma envolve cada operação numa transação" com `set_config`. É o padrão do exemplo oficial do Prisma 7 (`$extends`), que o próprio Prisma diz não ser para produção e com o qual "explicit `$transaction()` calls may not work as intended" [Fato] ([prisma-client-extensions/row-level-security](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security)). O ADR-0006 exige a checagem do limite do plano **dentro da transação de criação**, que tem várias instruções. E o Prisma 8 (RC, GA prevista para outubro de 2026) "replaces Client extensions" por *middleware* e troca `$transaction` por `db.transaction`, sem opções de isolamento nem *timeout* [Fato] ([Release status](https://www.prisma.io/docs/prisma-orm/release-status); [Client extensions](https://www.prisma.io/docs/orm/prisma-client/client-extensions); [Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)). O Prisma 7 recebe correções por 18 meses depois do GA do 8 | (a) Prisma 7, estável, com `$extends` e `$transaction` interativo. (b) Prisma 8, API nova, com *middleware*. Em ambos: trocar "transação por operação" por **"transação interativa por caso de uso, com `set_config` no início e `tx` propagado pelo CLS"**. Usar `@nestjs-cls/transactional` (suporte ao Prisma 8 não verificado) ou implementação própria | Novo ADR antes do marco 4, que fixe a versão, troque o mecanismo e defina a porta `TransactionRunner` (o `@Transactional()` é do Nest e não pode ficar em `application/`). O código que conhece a API do Prisma fica só em `shared/database` e `modules/*/infra/prisma`, para a migração 7 → 8 não tocar o domínio | **Sim.** Substitui o item 4 do ADR-0003 e fecha o "Em aberto" de versão. Exige atualizar `docs/architecture/takt-core-api.md` (passo 7 do fluxo) |
| D2 | **Portas de leitura × "Portas recebem e devolvem entidades, nunca DTOs" (ADR-0002).** O texto aceito proíbe literalmente um modelo de leitura que devolve DTO. Microsoft e Sairyss recomendam leitura direta, sem repositório | (a) Manter: toda leitura passa por entidade + *mapper* (mais arquivos, mais cerimônia). (b) Novo ADR: "porta de leitura devolve um **tipo de leitura da aplicação**, não DTO HTTP nem registro do Prisma", sempre pelo cliente com RLS | As notas não decidem. [Estimativa] A opção (b) responde ao risco de cerimônia que o próprio ADR-0002 registra; pode esperar a revisão do fim do marco 4, com os casos de cerimônia anotados | **Sim**, se escolher (b). Pode entrar no ADR da revisão do marco 4 |
| D3 | **`Result` × exceções (ADR-0002, "Em aberto").** Não é conflito, mas fecha uma lacuna de registro aceito | (a) `Result` próprio em `shared/kernel/`, erros esperados no tipo com `code` literal, `throw` só para defeito. (b) Exceções de domínio com `code` (o que o doc de arquitetura mostra hoje). (c) neverthrow ou Effect (descartados: violam a regra do domínio e o ADR-0010) | (a), com filtro global por `APP_FILTER` traduzindo `code` → status. Custo: nada obriga a consumir o `Result`; fica para a revisão e para o `switch` exaustivo | **Sim.** ADR novo, mais o ajuste do exemplo em `docs/architecture/takt-core-api.md` |
| D4 | **Precisão de `Math` entre motores JavaScript × ADR-0011 e RN-SIM-001.** `Math.log` e afins dão resultados que podem variar entre navegadores, sistemas e arquiteturas [Fato] ([MDN Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)). A RN-SIM-001 promete números iguais para "o professor e o aluno" | (a) Aceitar e documentar: "reprodutível por motor JavaScript", restringindo o enunciado da regra. (b) Implementar `ln`, `exp` e o que o AS 241 usar com aritmética básica, que seria exatamente arredondada pelo IEEE 754 [Palpite: não verificado]. (c) Medir primeiro: teste de referência entre Node, Chrome, Firefox e Safari com as funções usadas | As notas levam ao fundador sem escolher. [Estimativa] Fazer (c) no marco 1, antes de escolher entre (a) e (b), porque o custo de (b) depende de quantas funções divergem na prática | **Sim.** (a) muda a promessa de um PDR (PDR-0008) e o enunciado da RN-SIM-001: PDR novo. (b) é um ADR novo que complementa o ADR-0011 |
| D5 | **TypeScript 6 × 7.** O TS 7 é mais rápido, mas não tem API; o typescript-eslint (exigido pelo ADR-0010) precisa do 6 | (a) TS 6.x em tudo. (b) TS 6.x + `tsc` 7 só para checagem, via `@typescript/typescript6`. (c) Esperar o TS 7.1 | (a) ou (b); versão fixada | **Sim**, segundo as notas ("vira ADR"). [Estimativa] Cabe num ADR curto de versões da cadeia de ferramentas, junto com Prisma (D1) e PostgreSQL |

### Grupo B: cabem no guia, sem registro novo

| # | Item | Opções | Recomendação das notas | Registro novo? |
| --- | --- | --- | --- | --- |
| D6 | **Banir `Date.now`, `new Date()` e `performance.now` no motor** | Banir no lint (`no-restricted-properties`/`no-restricted-syntax`) ou deixar para a revisão | Banir [Palpite das notas] | [Estimativa] Não: reforça o ADR-0011 e a RN-SIM-001 sem contrariá-los. Entra no guia e no lint do `sim-engine`. Se o fundador preferir tratar como decisão técnica nova, um ADR curto |
| D7 | **Banir `enum`** (usar união de literais ou `as const`) | Banir com `no-restricted-syntax` em tudo; banir só no motor e no esquema (via `erasableSyntaxOnly`); permitir | Banir; o Handbook sugere `as const` "to stay aligned with JavaScript" [Fato] ([TS Handbook](https://www.typescriptlang.org/docs/handbook/enums.html)) | Não |
| D8 | **`erasableSyntaxOnly` no `sim-engine` e no `plant-schema`** | Ligar ou não | Ligar só nesses dois projetos | Não |
| D9 | **Sufixos de arquivo.** As duas notas divergem. A de TypeScript propõe sufixo por ponto em todas as camadas (`plant.entity.ts`, `*.use-case.ts`, `*.port.ts`). A de arquitetura usa a pasta como papel (`domain/entities/plant.ts`, `application/ports/plant-repository.ts`) e sufixo só onde o Nest ou o adaptador pedem (`plants.module.ts`, `plants.controller.ts`, `plant.mapper.ts`) | (a) Sufixo em tudo (redundante com a pasta, mas buscável). (b) Sufixo só na borda Nest e nos adaptadores | Ambas são propostas sem fonte. *Kebab-case* em todo caso. `*.service.ts` nunca no domínio | Não |
| D10 | **Token das portas: classe abstrata ou `interface` + `Symbol`** | Ver seção do NestJS | As notas divergem. [Estimativa] Classe abstrata (contrato e token, sem import do Nest, já testada no `cliniccontrol`) com `@Inject` explícito nos construtores de adaptadores e controllers. Confirmar se o fundador lê "interfaces" no ADR-0002 (`ports/  interfaces: ...`) como permitindo classe abstrata sem implementação | Não, se a leitura for aceita |
| D11 | **`exactOptionalPropertyTypes` × inferência do Zod** | Ligar e ajustar os esquemas; deixar desligado | Conferir com a versão do Zod antes de ligar (não verificado) | Não |
| D12 | **Opção `schema` nativa do Nest 12 para o Zod** | Usar a opção nativa; *pipe* próprio; biblioteca pronta | Avaliar: pode fechar o "Em aberto" do ADR-0008, mas a geração de OpenAPI não foi verificada | [Estimativa] O "Em aberto" do ADR-0008 diz "escolhida na implementação": registrar no doc de arquitetura basta, salvo se o fundador quiser ADR |
| D13 | **`switch` sem `default` (diverge do Google)** | Seguir o Google; seguir o typescript-eslint | typescript-eslint, com exceção para dado de versão externa | Não |
| D14 | **Sufixo para taxas sem unidade** (`Ratio` × `Pct`) | `Ratio` para 0–1 e `Pct` para 0–100; outro padrão | `Ratio`/`Pct` [Palpite] | Não. Atualizar `docs/product/glossary.md` se adotado |
| D15 | **Comentários em código de produção** (posição de Ousterhout) | Adotar; seguir o *Clean Code* | Adotar: porquê, invariantes, unidades, literatura e contratos. Testes continuam sem comentários | Não |
| D16 | **Gatilho de tamanho de função** (~40 linhas) | Número como gatilho de revisão; nenhum número | Gatilho de revisão, nunca regra de lint [Palpite] | Não |

## Esboço do guia

A proposta é um documento-fonte para pessoas, em pt-BR, e uma destilação curta em inglês para o Claude Code, dividida por área. O guia é a fonte da verdade. Quando divergirem, vale o guia, e os dois mudam no mesmo pull request. As fontes usadas entram em `docs/product/references.md` quando o guia for escrito.

### `docs/architecture/code-style.md` (pt-BR)

O documento começa com o resumo de uma linha, como os demais docs vivos, e segue este roteiro:

1. **Hierarquia de autoridade.** `CLAUDE.md`, ADRs e PDRs aceitos e regras `RN-...` estão acima do guia e não se quebram por plano. O guia está acima do gosto pessoal.
2. **Princípios de design.** A ordem de Beck, nomes por intenção, um nível de abstração, YAGNI com a exceção de Fowler, duplicação × abstração errada e regra de três, módulos profundos, comentários de produção (porquê, invariantes, unidades, literatura), herança evitada. Cada item com a fonte.
3. **Critérios de desvio.** Os nove critérios, as cinco coisas que o plano registra, o que nunca se quebra e como anotar cerimônia para a revisão do marco 4.
4. **TypeScript.**
   - versões;
   - tsconfig base e *flags* por projeto;
   - presets e regras extras do typescript-eslint;
   - nomes (casos, siglas, unidades, `Count`, códigos de erro em `UPPER_SNAKE_CASE`);
   - tipos (`interface` × `type`, sem `any`, sem `!`, `enum`, opcionais);
   - módulos (*named exports*, `import type`);
   - `switch` exaustivo;
   - assíncrono.

   Cada regra marcada como "ferramenta" (com o nome da regra ou *flag*) ou "revisão".
5. **Erros.** Esperados × defeitos, o formato decidido em D3, `cause`, filtro global, nunca detalhes internos na resposta.
6. **API (`takt-core-api`).** *Layout* do módulo; convenções de domínio, aplicação, infraestrutura e HTTP; montagem no `*.module.ts`; comunicação entre módulos; transação e RLS (conforme D1); tabela "quando não aplicar o padrão".
7. **Motor (`@takt/sim-engine`).** Núcleo funcional, pastas por conceito, determinismo (fontes proibidas, ordem de iteração, desempate), forma estável no laço quente, `readonly` na fronteira, comentários com a literatura, limite de reprodutibilidade (conforme D4).
8. **Esquema (`@takt/plant-schema`).** Zod como fonte da verdade, os dois níveis de validação com resultado `{ elementId?, path, code }`, migrações em cadeia, `erasableSyntaxOnly`, unidades no nome do campo.
9. **Web (`takt-web-app`).** As regras do ADR-0012 vistas como estilo: nada por quadro passa pelo React; fatias do Zustand; `postMessage` como união discriminada; `Intl` e mensagens ICU com caso `=0`; a cena só reproduz o log (RN-SIM-002). **As notas não pesquisaram convenções específicas de React**; esta seção começa só com o que os ADRs já decidem e cresce depois.
10. **Testes.** O resumo do ADR-0009 (AAA sem comentários, um Act, sem lógica, ID no nome, TDD no motor e nas `RN-...`, metas), fábricas com dados fixos, teste de contrato por porta (se adotado), nomes de arquivo de teste.
11. **Checklist de revisão.** Os nove pontos do ADR-0002, os itens de segurança vindos do `cliniccontrol` (seção anterior) e o que a ferramenta não pega (unidades, `Result` consumido, DTO campo a campo, `@Inject` explícito).

### `.claude/rules/` (inglês, curtos, por área)

O Claude Code descobre os arquivos `.md` de `.claude/rules/` (inclusive em subpastas). Um arquivo com o campo `paths` no *frontmatter* (lista de *globs*) só carrega quando o Claude lê ou edita um arquivo que casa com o padrão; sem `paths`, carrega no início da sessão [Fato] ([Claude Code, memory: path-specific rules](https://code.claude.com/docs/en/memory#path-specific-rules), consultado em 21/10/2026).

Cada arquivo traz só as regras acionáveis da área, no imperativo, com link para a seção do guia. Nada de justificativa longa: ela fica no guia. O que já está no `CLAUDE.md` não se repete.

| Arquivo | Caminhos | Conteúdo |
| --- | --- | --- |
| `api.md` | `apps/takt-core-api/**` | Pasta e papel de cada camada; o domínio não importa nada externo; caso de uso fino com `execute(command, ctx)`, sem decorador; uma porta por conversa, um repositório por raiz, método só quando usado; sem `organizationId` em parâmetro de porta; em memória sem regra de negócio; *mapper* sem `as unknown as`; DTO de saída campo a campo; sem `try/catch` no controller; `@RequirePermission` ou `@Public()` em toda rota; `@Inject` explícito; nenhum `console.log` |
| `engine.md` | `libs/sim-engine/**` | Núcleo funcional, sem portas, injeção ou classes de serviço; proibidos `Math.random` e, se D6 for aceito, `Date.now`, `new Date()` e `performance.now`; iterar só `Map` ou arrays; desempate explícito; campos inicializados na criação, sem `delete`; `readonly` na API pública; JSDoc com fórmula, fonte e unidade; TDD; limite de reprodutibilidade conforme D4 |
| `schema.md` | `libs/plant-schema/**` | Zod como fonte; tipos por `z.infer`; regra estrutural × semântica; resultado `{ elementId?, path, code }`; migração em cadeia; sem `enum`; unidade no nome do campo |
| `web.md` | `apps/takt-web-app/**` | Nada por quadro no React (refs e leitura direta do store em `useFrame`); fatias do Zustand; dados da API pelo TanStack Query; mensagens do Worker como união discriminada; números pelo `Intl`; plural com `=0`; a cena nunca calcula resultado |
| `tests.md` | arquivos de teste (`**/*.spec.ts`, `**/*.e2e-spec.ts`; confirmar o padrão de nome) | AAA com linhas em branco e sem comentários; um Act; sem lógica; ID `RN-...` no nome; fábricas com dados fixos; sem `faker` sem semente; casos de uso com adaptadores em memória; resposta validada contra o esquema de saída |

As regras transversais de TypeScript (nomes, tipos, erros) ficam no guia e no lint. [Estimativa] Repeti-las em cada arquivo de regra só gastaria contexto, e a ferramenta já as impõe.

## Conclusão

O achado mais útil não é qual guia seguir, e sim **onde mora cada regra**. Quase tudo que é mecânico (tipos, promessas, `switch`, fronteiras, `Math.random`) a ferramenta impõe melhor que qualquer texto, desde que alguém ligue à mão as regras que os presets deixam de fora. O que sobra para o guia e para a revisão é justamente o que as fontes discutem há décadas sem número fixo: quando abstrair, quanto decompor, o que comentar. A resposta honesta da literatura é critério com evidência, não limite. Por isso, o mecanismo central do guia é o desvio **escrito no plano**, com gatilho de revisão. Ele transforma "isso é excesso de engenharia" de opinião em registro verificável, e alimenta a revisão do marco 4 que o ADR-0002 já previu.

A segunda lição é que os riscos reais não estão no estilo, e sim em três premissas de registros aceitos que o ecossistema mudou ou que nunca foram testadas. O Prisma está trocando o mecanismo em que o RLS do ADR-0003 se apoiava, bem na janela antes do marco 4. A promessa de reprodutibilidade da RN-SIM-001 depende de uma propriedade do `Math` do JavaScript que a MDN diz não existir entre navegadores. E o `cliniccontrol` mostra o custo de não ter convenção de fronteira: um único DTO atravessando todas as camadas levou o hash da senha para a resposta. Resolver D1 e D4 antes de escrever código vale mais que qualquer item do guia.

## Referências

Todas acessadas em 21/10/2026, salvo indicação. A data entre parênteses é a de publicação ou da versão citada.

**Design, clean code e críticas**
- Ousterhout, J.; Martin, R. C. "aposd-vs-clean-code" (set/2024 a fev/2025). https://github.com/johnousterhout/aposd-vs-clean-code
- Ousterhout, J. *A Philosophy of Software Design*, 2ª ed. (07/2021). https://web.stanford.edu/~ouster/cgi-bin/book.php
- Pearson. *Clean Code*, 2ª ed. (2025). https://www.pearson.com/en-us/subject-catalog/p/clean-code-a-handbook-of-agile-software-craftsmanship-2nd-edition/P200000013239/9780135398548
- Fowler, M. "BeckDesignRules" (02/03/2015). https://martinfowler.com/bliki/BeckDesignRules.html
- Fowler, M. "Yagni" (26/05/2015). https://martinfowler.com/bliki/Yagni.html
- Fowler, M. "FunctionLength" (30/11/2016). https://martinfowler.com/bliki/FunctionLength.html
- Metz, S. "The Wrong Abstraction" (20/01/2016). https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction
- Dodds, K. C. "AHA Programming" (22/06/2020). https://kentcdodds.com/blog/aha-programming
- Abramov, D. "Goodbye, Clean Code" (11/01/2020). https://overreacted.io/goodbye-clean-code/
- qntm. "It's probably time to stop recommending Clean Code" (28/06/2020), espelho. https://www.goodreads.com/author_blog_posts/20045870-it-s-probably-time-to-stop-recommending-clean-code
- Wikipedia. "Rule of three (computer programming)". https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)
- Lebrero, D. Notas de *A Philosophy of Software Design* (2021). https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/
- dev.to. "Software design red flags". https://dev.to/sportebois/software-design-red-flags-wisdom-nuggets-from-john-ousterhout-43i2

**Evidência empírica**
- Hofmeister, Siegmund e Holt. SANER 2017. https://www.se.cs.uni-saarland.de/publications/docs/HoSeHo17.pdf
- Never Work in Theory. "Abbreviated vs. full names" (09/08/2021). https://neverworkintheory.org/2021/08/09/abbreviated-vs-full-names.html
- Peitek et al. ICSE 2021 (replicação). https://github.com/brains-on-code/fMRI-complexity-metrics-icse2021
- Chowdhury, Uddin e Holmes. arXiv 2205.01842 (2022). https://arxiv.org/abs/2205.01842
- Jones, D. "Optimal function length" (10/09/2023). https://shape-of-code.com/2023/09/10/optimal-function-length-an-analysis-of-the-cited-data/
- Ammerlaan, Veninga e Zaidman. SANER 2015. https://research.tudelft.nl/en/publications/old-habits-die-hard-why-refactoring-for-understandability-does-no
- Never Work in Theory. Sobre Sellitto et al. 2022 (01/03/2023). https://neverworkintheory.org/2023/03/01/refactoring-and-program-comprehension.html
- Prechelt et al. IEEE TSE 2001. https://ps.ipd.kit.edu/english/176_778.php
- FORRT. Replicações de Prechelt et al. https://forrt.org/flora-replication-atlas/doi/10.1109/32.988711/
- Ljung e Gonzalez-Huerta. arXiv 2208.07056 (2022). https://arxiv.org/abs/2208.07056

**TypeScript, Node e NestJS**
- Google TypeScript Style Guide (sem data). https://google.github.io/styleguide/tsguide.html
- typescript-eslint. Shared configs (v8.72.0). https://typescript-eslint.io/users/configs
- typescript-eslint. Rules. https://typescript-eslint.io/rules/
- typescript-eslint. switch-exhaustiveness-check. https://typescript-eslint.io/rules/switch-exhaustiveness-check/
- TypeScript. TSConfig Reference. https://www.typescriptlang.org/tsconfig/
- TypeScript Handbook. Enums. https://www.typescriptlang.org/docs/handbook/enums.html
- Microsoft. "Announcing TypeScript 6.0" (23/03/2026). https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- Microsoft. "Announcing TypeScript 7.0" (08/07/2026). https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- InfoQ. NestJS 12 (19/10/2026). https://www.infoq.com/news/2026/10/nestjs-12-observability
- NestJS. First steps. https://docs.nestjs.com/first-steps
- NestJS. Custom providers. https://docs.nestjs.com/fundamentals/custom-providers
- NestJS. Exception filters. https://docs.nestjs.com/exception-filters
- NestJS. Recipes: Prisma. https://docs.nestjs.com/recipes/prisma
- Node.js. Errors. https://nodejs.org/api/errors.html
- Effect. Two error types. https://effect.website/docs/error-management/two-error-types/
- neverthrow (GitHub). https://github.com/supermacro/neverthrow
- npm registry. neverthrow 8.2.0. https://registry.npmjs.org/neverthrow/latest
- Google AIP-141, Quantities. https://google.aip.dev/141
- Google AIP-140, Field names. https://google.aip.dev/140

**JavaScript e V8 (motor)**
- MDN. Map. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- MDN. Math. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- V8. "Fast properties in V8" (2017). https://v8.dev/blog/fast-properties

**Arquitetura hexagonal, repositório e DDD**
- Cockburn, A. "Hexagonal Architecture" (04/09/2005). https://alistair.cockburn.us/hexagonal-architecture/
- Fowler, M. "Repository" (PoEAA). https://martinfowler.com/eaaCatalog/repository.html
- Fowler, M. "DDD_Aggregate" (23/04/2013). https://martinfowler.com/bliki/DDD_Aggregate.html
- Fowler, M. "AnemicDomainModel" (25/11/2003). https://martinfowler.com/bliki/AnemicDomainModel.html
- Fowler, M. "CQRS" (14/07/2011). https://martinfowler.com/bliki/CQRS.html
- Vernon, V. *Implementing Domain-Driven Design*, cap. 10 (trecho). https://www.informit.com/articles/article.aspx?p=2020371
- Microsoft Learn. Infrastructure persistence layer design (2018, atualizado em 2023). https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design
- Bogard, J. "Vertical Slice Architecture" (19/04/2018). https://www.jimmybogard.com/vertical-slice-architecture/
- Seemann, M. "Interfaces are not abstractions" (02/12/2010). https://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/
- Seemann, M. "Functional architecture is Ports and Adapters" (18/03/2016). https://blog.ploeh.dk/2016/03/18/functional-architecture-is-ports-and-adapters/
- Bernhardt, G. "Functional Core, Imperative Shell" (12/07/2012). https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell
- Sairyss. domain-driven-hexagon (último *push* em 11/06/2024). https://github.com/Sairyss/domain-driven-hexagon
- Brocoders. nestjs-boilerplate, docs/architecture.md. https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/architecture.md

**Prisma, RLS e transações**
- Prisma. Release status. https://www.prisma.io/docs/prisma-orm/release-status
- Prisma. Changelog (02/10/2026). https://www.prisma.io/changelog/2026-10-02
- Prisma. Client extensions (v7). https://www.prisma.io/docs/orm/prisma-client/client-extensions
- Prisma. Transactions. https://www.prisma.io/docs/orm/prisma-client/queries/transactions
- Prisma. "Prisma ORM 8 in NestJS" (24/09/2026). https://www.prisma.io/blog/prisma-orm-8-nestjs
- Prisma. prisma-client-extensions/row-level-security. https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security
- nestjs-cls. Transactional, Prisma adapter. https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/prisma-adapter

**Documentos internos do Takt citados**
- `CLAUDE.md`.
- ADR-0001, "Monorepo com Nx e nomes". `docs/adr/0001-monorepo-nx-e-nomes.md`
- ADR-0002, "Arquitetura hexagonal com módulos por contexto". `docs/adr/0002-arquitetura-hexagonal-por-contexto.md`
- ADR-0003, "PostgreSQL, Prisma e Row-Level Security". `docs/adr/0003-postgresql-prisma-e-rls.md`
- ADR-0006, "Autorização por organização". `docs/adr/0006-autorizacao-por-organizacao.md`
- ADR-0007, "Observabilidade". `docs/adr/0007-observabilidade-log-canonico-e-tracing.md`
- ADR-0008, "Validação de dados com Zod". `docs/adr/0008-validacao-de-dados.md`
- ADR-0009, "Estratégia de testes". `docs/adr/0009-estrategia-de-testes.md`
- ADR-0010, "Qualidade de código e CI". `docs/adr/0010-qualidade-e-ci.md`
- ADR-0011, "Motor de simulação e esquema". `docs/adr/0011-motor-de-simulacao-e-esquema.md`
- ADR-0012, "Front-end". `docs/adr/0012-front-end.md`
- Regras de simulação, RN-SIM-001 e RN-SIM-002. `docs/product/rules/simulation.md`
- Arquitetura da `takt-core-api`. `docs/architecture/takt-core-api.md`
- Notas desta pesquisa: `docs/research/notes/estilo-de-codigo/` (`clean-code-e-excesso-de-engenharia.md`, `typescript-e-nestjs.md`, `hexagonal-repositorio-e-cliniccontrol.md`).
- Código do `cliniccontrol` (referência): `/home/italoamaral/cliniccontrol/`.
