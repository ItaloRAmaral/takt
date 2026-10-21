# Convenções de código TypeScript, Node.js e NestJS para o Takt (outubro de 2026)

Notas de pesquisa para o guia de estilo. Marcação: **[FATO]** (com link), **[ESTIMATIVA]** (inferência razoável a partir de fontes) e **[PALPITE]** (opinião sem fonte). Pesquisa feita em 21/10/2026. Restrições vinculantes lidas: `CLAUDE.md` e ADR-0001, 0002, 0008, 0009, 0010, 0011.

**Versões de referência em 21/10/2026**

| Ferramenta | Versão | Fonte |
| --- | --- | --- |
| TypeScript 6.0 | lançado em 23/03/2026; "ponte" entre 5.9 e 7.0 | [FATO] [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) |
| TypeScript 7.0 (compilador nativo em Go) | lançado em 08/07/2026; tag v7.0.2 no GitHub | [FATO] [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/); [Releases](https://github.com/microsoft/typescript/releases) |
| typescript-eslint | v8.72.0 (cabeçalho do site) | [FATO] [typescript-eslint configs](https://typescript-eslint.io/users/configs) |
| NestJS | 12 (≈ fim de agosto de 2026), 12.1 depois | [FATO] [InfoQ, 19/10/2026](https://www.infoq.com/news/2026/10/nestjs-12-observability); [newreleases @nestjs/core 12.0.0](https://newreleases.io/project/npm/@nestjs/core/release/12.0.0) |
| Node.js | 24 LTS (24.22.0, ADR-0001); a documentação atual do site já está em v26.12.1 | [FATO] ADR-0001; [Node.js errors docs](https://nodejs.org/api/errors.html) |
| Effect | 4.0 ("Effect 4.0 is here") | [FATO] [Effect docs](https://effect.website/docs/error-management/two-error-types/) |
| neverthrow | 8.2.0, empacotado ≈ 21/02/2025 (data deduzida do metadado do npm) | [FATO] versão / [ESTIMATIVA] data — [npm registry](https://registry.npmjs.org/neverthrow/latest) |

---

## 1. O que o Google TypeScript Style Guide prescreve

### Takeaway
É o guia público mais completo e prescritivo para TypeScript, mas **não tem data nem versão** e foi escrito para o ecossistema interno do Google (Angular, Closure). Bate com o Takt em quase tudo (named exports, `unknown`, `===`, sem namespace, só `Error` em `throw`), e diverge em três pontos: nome de arquivo (`snake_case`), `default` obrigatório em todo `switch` e proibição de `#private`.

### Cited Findings
**Data e versão**
- [FATO] A página não mostra data de publicação nem de atualização; diz que a versão pública é "pushed on-demand by volunteers" e que foi adaptada do guia interno, removendo seções internas — [Google TS Style Guide](https://google.github.io/styleguide/tsguide.html)

**Nomes**
- [FATO] `UpperCamelCase`: classes, interfaces, tipos, enums, decoradores, parâmetros de tipo. `lowerCamelCase`: variáveis, parâmetros, funções, métodos, propriedades. `CONSTANT_CASE`: constantes globais (só símbolos de módulo e campos estáticos de classes de módulo) e valores de enum — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Siglas tratadas como palavras: `loadHttpUrl`, não `loadHTTPURL`; `customerId`, não `customerID` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Nomes descritivos; sem abreviações ambíguas ou feitas apagando letras; nome de uma letra só para escopo de até 10 linhas — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Sem prefixo `I` em interface; nomear pela razão de existir (`TodoItemStorage`) — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Sem `_` no início ou no fim (nem em membros privados), sem `opt_`, **sem notação húngara** (exemplo `kSecondsPerDay`); nomes não repetem informação que já está no tipo — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Arquivos em `snake_case` (`./foo_bar`) — [Google](https://google.github.io/styleguide/tsguide.html)

**Tipos**
- [FATO] Preferir `interface` a `type` para formas de objeto; `type` para primitivos, uniões e tuplas. Usar interface, não classe, para tipos estruturais. Anotar literais de objeto (`const foo: Foo = {...}`) — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Enums: proibido `const enum`, usar `enum` simples; não converter enum em booleano, comparar explicitamente. O guia **não** diz preferir enum ou união de literais — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Evitar `any`; usar `unknown` e estreitar com *type guards*; `any` legítimo (mocks de teste) só com supressão do lint e justificativa; evitar `{}` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Sem preferência geral entre `null` e `undefined`; *alias* de tipo não inclui `|null`/`|undefined`; preferir campos e parâmetros opcionais (`x?:`) a `|undefined` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Evitar `as` e `!`; se usar, comentar por que é seguro; dupla asserção via `unknown`, nunca `any`; sintaxe `as`, não `<T>` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Nunca usar `String`/`Number`/`Boolean` (wrappers) como tipo — [Google](https://google.github.io/styleguide/tsguide.html)

**Módulos**
- [FATO] **Sem `export default`**; sem `namespace` (exceto para código de terceiros); sem `require`; sem `export let` (estado mutável exportado via função *getter*); sem classes só com membros estáticos para agrupar; `import type` e `export type` para importações/reexportações só de tipo — [Google](https://google.github.io/styleguide/tsguide.html)

**Classes e funções**
- [FATO] **`#private` proibido**: usar a palavra-chave `private`. Marcar `readonly` o que não é reatribuído fora do construtor. Preferir *parameter properties*. Não escrever `public` (exceto em parameter property não-readonly). *Getters* puros; sem *getter/setter* de passagem — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Preferir funções de módulo a métodos estáticos privados — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Preferir declaração `function` a *arrow* para funções nomeadas; *arrow* para *callbacks*; não passar `parseInt` direto para `map` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] `const` por padrão, `let` se reatribuir, nunca `var`; `===` sempre (exceto `== null`); `for...of`; sem `for...in` em array; `Number()` para converter, checando `NaN` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] **Todo `switch` precisa de `default`, por último**; casos não vazios não caem no próximo — [Google](https://google.github.io/styleguide/tsguide.html)

**Erros**
- [FATO] `throw` só de `Error` ou subclasses, com `new Error(...)`; erros próprios quando o nativo não basta; `catch (e: unknown)` e estreitar; `catch` vazio raro e comentado; blocos `try` pequenos — [Google](https://google.github.io/styleguide/tsguide.html)

**Comentários e ferramenta**
- [FATO] `/** JSDoc */` para documentação de quem usa; `//` para comentário de implementação; JSDoc em Markdown — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Proibidos `@ts-ignore`, `@ts-expect-error` e `@ts-nocheck` (em teste, `@ts-expect-error` é desencorajado). Não criar decoradores novos; usar só os do framework — [Google](https://google.github.io/styleguide/tsguide.html)

### Inferences
- [ESTIMATIVA] "Unidade no nome" (`cycleSec`) não é notação húngara: a húngara codifica o **tipo** (`kSecondsPerDay`, prefixo `k`), o que o próprio tipo já diz; a unidade é informação que o tipo `number` não carrega. Portanto não há conflito com o Google.
- [ESTIMATIVA] O `snake_case` de arquivos do Google conflita com o padrão do NestJS (`app.controller.ts`) e com o ADR-0002 (`plants.module.ts`, `use-cases/`, `value-objects/`). Para o Takt, *kebab-case* com sufixo por ponto é o que já está nos ADRs.
- [ESTIMATIVA] A regra "todo `switch` tem `default`" conflita com a checagem de exaustividade do typescript-eslint (seção 2), que trata o `default` em união exaustiva como código morto que esconde membros novos.
- [ESTIMATIVA] A proibição de criar decoradores é compatível com o ADR-0002 (casos de uso sem `@Injectable`, montados por `useFactory`).

### Gaps
- A página foi lida até ~100 mil de ~110 mil caracteres; o resto é formatação (quebra de linha), coberta pelo Prettier (ADR-0010).
- Não há data ou versão; não é possível dizer quando cada regra mudou.

---

## 2. typescript-eslint (`strict-type-checked`, `stylistic-type-checked`) e tsconfig

### Takeaway
`strict-type-checked` + `stylistic-type-checked` são o ponto de partida certo para o ADR-0010, mas **não seguem semver** (fixar versão). Regras importantes como `switch-exhaustiveness-check`, `prefer-readonly`, `consistent-type-imports` e `naming-convention` **não estão em nenhum preset** e precisam ser ligadas à mão. No TypeScript 6/7, `strict` já é padrão; as flags extras valiosas são `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`. O TypeScript 7 não tem API programática: o typescript-eslint continua no TypeScript 6.

### Cited Findings
**Presets**
- [FATO] `recommended` (correção, quase sempre bug); `recommended-type-checked` (+ regras com tipos); `strict` (+ regras mais opinativas que pegam bugs); `strict-type-checked` (strict + recommended-type-checked + regras estritas com tipos); `stylistic`/`stylistic-type-checked` (consistência, somam-se aos anteriores); `all` ("many rules conflict"); `disable-type-checked` (para JS e afins) — [typescript-eslint configs](https://typescript-eslint.io/users/configs)
- [FATO] "This configuration is not considered 'stable' under Semantic Versioning" — regras e opções de `strict`, `strict-type-checked` e `all` podem mudar fora de versão maior — [typescript-eslint configs](https://typescript-eslint.io/users/configs)
- [FATO] Recomendado "only if a nontrivial percentage of its developers are highly proficient in TypeScript"; ativação em *flat config* com `extends: [tseslint.configs.strictTypeChecked]` e `parserOptions.projectService: true` — [typescript-eslint configs](https://typescript-eslint.io/users/configs)

**Regras e preset (v8.72.0)** — [FATO] [lista de regras](https://typescript-eslint.io/rules/) (tabela reconstruída do texto da página; conferir cada regra antes de configurar)

| Regra | Preset | Tipos? |
| --- | --- | --- |
| `no-explicit-any`, `no-namespace`, `ban-ts-comment`, `no-unsafe-function-type`, `no-unsafe-declaration-merging` | recommended | não |
| `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await`, `only-throw-error`, `prefer-promise-reject-errors`, `restrict-template-expressions`, `restrict-plus-operands`, `no-unsafe-argument/assignment/call/member-access/return/unary-minus`, `no-unsafe-enum-comparison`, `no-unnecessary-type-assertion` | recommended | sim |
| `no-non-null-assertion`, `no-extraneous-class`, `prefer-literal-enum-member` | strict | não |
| `return-await`, `use-unknown-in-catch-callback-variable`, `no-unnecessary-condition`, `no-unsafe-enum-assignment`, `no-mixed-enums`, `no-deprecated`, `no-unnecessary-type-parameters`, `no-confusing-void-expression`, `related-getter-setter-pairs` | strict | sim |
| `consistent-type-definitions`, `consistent-type-assertions`, `array-type`, `prefer-for-of` | stylistic | não |
| `prefer-nullish-coalescing`, `prefer-optional-chain` | stylistic | sim |
| **fora de preset:** `switch-exhaustiveness-check`, `prefer-readonly`, `prefer-readonly-parameter-types`, `strict-boolean-expressions`, `naming-convention` (congelada), `consistent-type-exports`, `no-unsafe-type-assertion`, `strict-void-return` | — | sim |
| **fora de preset:** `consistent-type-imports`, `no-import-type-side-effects`, `explicit-function-return-type`, `explicit-module-boundary-types`, `parameter-properties`, `member-ordering` (congelada), `method-signature-style`, `max-params`, `class-methods-use-this`, `no-magic-numbers` (congelada) | — | não |

- [FATO] Não existe regra `no-enum` no typescript-eslint; banir enum é feito com a regra do núcleo `no-restricted-syntax` (o Handbook aponta esse caminho para `const enum`) — [rules](https://typescript-eslint.io/rules/); [TS Handbook, Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [FATO] `switch-exhaustiveness-check`: `allowDefaultCaseForExhaustiveSwitch` (padrão `true`), `requireDefaultForNonUnion` (padrão `false`), `considerDefaultExhaustiveForUnions` (padrão `false`: cada membro da união precisa de `case` próprio), `defaultCaseCommentPattern` (`/^no default$/iu`). Um `default` em `switch` exaustivo "would be a form of dead code" e pode esconder membros novos; exceção legítima: valores vindos de versão mais nova (servidor mais novo que o cliente) — [switch-exhaustiveness-check](https://typescript-eslint.io/rules/switch-exhaustiveness-check/)

**tsconfig (referência oficial)** — [FATO] [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- `strict` liga `alwaysStrict`, `strictNullChecks`, `strictBindCallApply`, `strictBuiltinIteratorReturn`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `useUnknownInCatchVariables`; versões futuras podem acrescentar checagens a ele.
- Fora do `strict`: `noUncheckedIndexedAccess` (acesso por índice vira `T | undefined`; sem recomendação explícita), `exactOptionalPropertyTypes` (marcada **Recommended**: `x?: T` não aceita `undefined` explícito), `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters` (parâmetros com `_` isentos), `allowUnreachableCode`.
- `verbatimModuleSyntax`: importação sem `type` é mantida, com `type` é apagada; liga `isolatedModules`; substitui `importsNotUsedAsValues` e `preserveValueImports`.
- `erasableSyntaxOnly`: erro em `enum`, `namespace` com código, **parameter properties**, `import =`/`export =` e asserção `<T>`; pensado para executores que só apagam tipos (ts-blank-space, Amaro); sugerido com `verbatimModuleSyntax`.
- `isolatedDeclarations` (5.5): exige anotação suficiente nos exports para gerar `.d.ts` sem o checador.
- `experimentalDecorators` e `emitDecoratorMetadata`: experimentais, anteriores ao padrão TC39; o segundo emite `__metadata` para o `reflect-metadata`.
- `skipLibCheck` e `forceConsistentCasingInFileNames`: marcadas **Recommended**.

**Mudanças do TypeScript 6.0 e 7.0**
- [FATO] TS 6.0: `strict` passa a `true` por padrão; `module` padrão `esnext`; `target` padrão = ES mais recente (es2025); `noUncheckedSideEffectImports` `true`; `types` padrão `[]` (precisa de `"types": ["node"]`); `rootDir` = pasta do tsconfig; `esModuleInterop` não pode mais ser `false`; depreciados `target es5`, `downlevelIteration`, `moduleResolution node/node10`, `baseUrl`, `module amd/umd/systemjs/none`, palavra-chave `module` para namespace — [TS 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [FATO] TS 7.0 é compatível com a checagem do 6.0 (com `stableTypeOrdering`, agora sempre ligado); as depreciações do 6.0 viram erro; **"does not ship with an API"** — ferramentas como typescript-eslint devem ficar no 6.0 até a nova API (prevista para 7.1); o pacote `@typescript/typescript6` (`tsc6`) permite usar os dois lado a lado — [TS 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [FATO] O NestJS 12 gera projetos com `strict` ligado e, em projetos ESM, usa **oxlint** e Vitest por padrão; `nest upgrade` sobe o TypeScript para v6 — [NestJS First steps](https://docs.nestjs.com/first-steps); [InfoQ](https://www.infoq.com/news/2026/10/nestjs-12-observability)

### Inferences
- [ESTIMATIVA] Para o Takt em 10/2026: **TypeScript 6.x** como versão do monorepo (o typescript-eslint, exigido pelo ADR-0010, precisa da API do 6), com o 7 opcional só para `tsc --noEmit` mais rápido via `@typescript/typescript6`. Decisão a registrar em ADR.
- [ESTIMATIVA] Como `strict-type-checked` não segue semver, a atualização manual do ADR-0010 já é a mitigação certa; fixar a versão exata do typescript-eslint.
- [ESTIMATIVA] O padrão oxlint do NestJS 12 não muda o ADR-0010: o Takt depende de plugins do ESLint (fronteiras), mesmo motivo que descartou o Biome.
- [ESTIMATIVA] `exactOptionalPropertyTypes` interage com o Zod: esquemas com `.optional()` inferem `x?: T | undefined` ou `x?: T` conforme a versão/configuração do Zod; conferir antes de ligar (ver Gaps).
- [ESTIMATIVA] `erasableSyntaxOnly` serve ao `sim-engine` e ao `plant-schema` (sem enum, sem parameter properties, sem decoradores), mas não à `takt-core-api`, onde controllers do Nest usam injeção no construtor.
- [PALPITE] Com `verbatimModuleSyntax`/`consistent-type-imports`, uma classe injetada pelo Nest importada com `import type` some do JavaScript, e o `emitDecoratorMetadata` passa a emitir `Object`, quebrando a injeção. Precisa ser verificado na implementação; o ADR-0002 (casos de uso por `useFactory` com `inject` explícito) reduz o problema, mas controllers ainda injetam por classe.

### Gaps
- Não encontrei, na fonte oficial, se o TS 7.0 mantém `experimentalDecorators` e `emitDecoratorMetadata` (o anúncio não fala disso). O NestJS 12 "continues to rely on legacy TypeScript decorators" ([InfoQ](https://www.infoq.com/news/2026/10/nestjs-12-observability)). O ADR-0009 já usa SWC para os metadados nos testes.
- Versão atual do ESLint e do Zod 4 não foram pesquisadas.
- A tabela de regras foi reconstruída de texto achatado da página; conferir cada regra na própria página antes de fixar a configuração.
- Não verifiquei se a regra do núcleo `no-restricted-exports` com `restrictDefaultExports` está disponível na versão do ESLint que o Takt usará (é o caminho que conheço para banir `export default` sem plugin extra) — [ESTIMATIVA].

---

## 3. Tratamento de erros: exceções × tipos `Result`

### Takeaway
As fontes de autoridade dividem os erros em **esperados** (parte do fluxo de negócio, tipados no retorno) e **inesperados** (defeitos, exceções). Para o domínio do Takt, que não pode importar nada externo (ADR-0002), o encaixe é um `Result` pequeno e próprio em `shared/kernel/` (o ADR-0002 já prevê `Result` e `DomainError` ali) com erros discriminados por `code`; `throw` fica para defeitos. É uma questão aberta do ADR-0002 e precisa virar ADR.

### Cited Findings
- [FATO] Effect separa *expected errors* ("anticipate and expect as part of normal program execution", aparecem no tipo, como `Effect<string, HttpError, never>`) de *defects* (não previstos, fora do tipo, como exceções não checadas) — [Effect, two error types](https://effect.website/docs/error-management/two-error-types/)
- [FATO] Effect está na versão 4.0 e se apresenta como ecossistema ("One ecosystem. Zero dependencies.") — [Effect docs](https://effect.website/docs/error-management/two-error-types/)
- [FATO] neverthrow: `Result` = `Ok | Err`, `ResultAsync` para promessas; argumenta que `throw`/`catch` lembra `goto` e presume que o chamador trate o erro; admite que lançar exceção tem bons usos, "fewer than people might think"; recomenda `eslint-plugin-neverthrow` para obrigar o consumo do `Result` (análogo ao `must-use` do Rust); 7,8 mil estrelas, 50 *issues* e 33 PRs abertos — [neverthrow](https://github.com/supermacro/neverthrow)
- [FATO] Última versão do neverthrow no npm: 8.2.0 — [npm](https://registry.npmjs.org/neverthrow/latest). [ESTIMATIVA] empacotada em ≈ 21/02/2025 (deduzido do carimbo de tempo do metadado), ou seja, ≈ 20 meses sem versão nova em 10/2026.
- [FATO] Google: `throw` só de `Error`/subclasses; `catch (e: unknown)` — [Google](https://google.github.io/styleguide/tsguide.html)
- [FATO] Node.js: `error.message` "may be changed in any versions. Use `error.code` to identify an error instead"; todos os erros do Node herdam de `Error`; construtor aceita `cause` — [Node.js errors](https://nodejs.org/api/errors.html)
- [FATO] typescript-eslint impõe parte disso: `only-throw-error`, `prefer-promise-reject-errors` (recommended), `use-unknown-in-catch-callback-variable` (strict); `useUnknownInCatchVariables` faz parte do `strict` do tsconfig — [rules](https://typescript-eslint.io/rules/); [TSConfig](https://www.typescriptlang.org/tsconfig/)
- [FATO] NestJS: o filtro global devolve `{"statusCode":500,"message":"Internal server error"}` para erro desconhecido; `HttpException` e subclasses aceitam `errorCode` (serializado no corpo, "so clients can branch on it") e `cause` (nunca serializado); filtro próprio com `@Catch()` e `ExceptionFilter`; global com DI via `{ provide: APP_FILTER, useClass }`; a página não orienta como mapear erros de domínio — [NestJS exception filters](https://docs.nestjs.com/exception-filters)

### Inferences
- [ESTIMATIVA] neverthrow e Effect violam a regra "domínio não importa nada de fora" do ADR-0002; Effect é um modelo de programação inteiro, desproporcional ao MVP. O ADR-0010 ("preferir código próprio pequeno a dependência sem manutenção") e o ritmo de versões do neverthrow apontam para um `Result` próprio de ~30 linhas no `shared/kernel/`.
- [ESTIMATIVA] Divisão compatível com Effect, Google e Node: (a) falha de negócio esperada (`PLAN_LIMIT`, `FORBIDDEN`, RN-...) → `Result<T, DomainError>` com `code` literal, discriminado; (b) defeito (invariante interna violada, bug) → `throw new Error(...)`, capturado pelo filtro global e registrado no log (ADR-0007); (c) a camada `http` traduz `DomainError.code` para status e corpo com código (RN-I18-004) num filtro ou no controller.
- [ESTIMATIVA] Sem `eslint-plugin-neverthrow`, nada obriga a tratar um `Result` próprio; `no-floating-promises` não cobre isso. Parte fica para revisão; o `switch-exhaustiveness-check` sobre `error.code` garante tratamento exaustivo quando o código é uma união de literais.
- [ESTIMATIVA] No motor, os tetos de segurança (`SIMULATION_LIMIT_EXCEEDED`, ADR-0011) são falha esperada e cabem no mesmo padrão de resultado com código.

### Gaps
- Não encontrei recomendação oficial do time do TypeScript sobre `Result` × exceções.
- Não li a seção `error.code`/`error.cause` completa da documentação do Node (texto truncado).

---

## 4. Convenções do NestJS combinadas com o hexágono

### Takeaway
A documentação do Nest dá as ferramentas para manter o domínio livre do framework: **tokens de injeção que não são classes** (`Symbol` ou classe abstrata) e **`useFactory` com `inject`**. Não há guia oficial de arquitetura hexagonal; a combinação é decisão do Takt (ADR-0002) e está alinhada com o que a documentação permite.

### Cited Findings
- [FATO] Provedores: `useValue`, `useClass`, `useFactory` (com `inject`, na mesma ordem dos argumentos; pode marcar opcional), `useExisting` (alias) — [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [FATO] "TypeScript types and interfaces are erased during compilation, so Nest can't reference them at runtime"; soluções: token `string`/`Symbol` com `@Inject()` ou **classe abstrata** como contrato e token — [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [FATO] Símbolos têm "unique runtime identity" e evitam colisão; o Nest recomenda tokens num arquivo separado (por exemplo `constants.ts`); provedor próprio é escopado ao módulo e exportado pelo token — [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [FATO] Arquivos gerados: `app.controller.ts`, `app.controller.spec.ts`, `app.module.ts`, `app.service.ts`, `main.ts`; a CLI "encourages the convention of keeping each module in its own dedicated directory"; a página não declara regra de nome de arquivo — [First steps](https://docs.nestjs.com/first-steps)
- [FATO] NestJS 12: pacotes do núcleo em ESM (CJS continua via `require(esm)`, Node ≥ 20.19 ou ≥ 22.12); `@Body()`, `@Query()`, `@Param()` aceitam opção `schema` com qualquer objeto *Standard Schema* (Zod funciona sem *wrapper*); `class-validator` continua o padrão documentado; o Nest "continues to rely on legacy TypeScript decorators" — [InfoQ](https://www.infoq.com/news/2026/10/nestjs-12-observability)
- [FATO] Filtros de exceção: ver seção 3 — [Exception filters](https://docs.nestjs.com/exception-filters)

### Inferences
- [ESTIMATIVA] Porta = `interface` em `application/ports/` + `Symbol` exportado ao lado (ex.: `export const PLANT_REPOSITORY = Symbol('PlantRepository')`); o módulo liga com `{ provide: PLANT_REPOSITORY, useClass: PrismaPlantRepository }` e o caso de uso com `useFactory` + `inject: [PLANT_REPOSITORY, CLOCK]`. O caso de uso continua classe simples sem decorador (ADR-0002). Classe abstrata como token também resolve, mas é JavaScript em tempo de execução dentro de `application/` — [PALPITE] preferir `Symbol` + `interface` para manter as portas só de tipo.
- [ESTIMATIVA] A opção `schema` nativa do Nest 12 resolve o item "Em aberto" do ADR-0008 (integração Zod + Nest), mas o comentário citado pelo InfoQ diz que o tipo do parâmetro ainda é anotado à mão; conferir antes de decidir.
- [ESTIMATIVA] Sufixos de arquivo: `*.module.ts`, `*.controller.ts` na borda Nest; no domínio e na aplicação, sufixos pelo papel do hexágono (`*.entity.ts`, `*.use-case.ts`, `*.port.ts`, `*.repository.ts`, `*.mapper.ts`) — não há fonte para esses nomes; é proposta.
- [ESTIMATIVA] `*.service.ts` do Nest não deve aparecer no domínio: o ADR-0002 distingue caso de uso, serviço de domínio e serviço de infraestrutura.

### Gaps
- Não há guia oficial do NestJS para arquitetura hexagonal ou DDD.
- Nome do *pipe* de validação por esquema do Nest 12 e se ele gera OpenAPI não foram verificados.

---

## 5. Convenções para a biblioteca computacional (motor)

### Takeaway
As fontes cobrem pouco disso. O que é sólido: **ordem de iteração de `Map` é a de inserção** (determinística); a ordem de chaves de objeto é complexa e não deve ser usada; **funções de `Math` têm precisão dependente da implementação** (resultado pode variar entre navegadores, sistemas e arquiteturas), o que afeta a reprodutibilidade entre motores JavaScript; e objetos com forma estável são mais rápidos no V8.

### Cited Findings
- [FATO] `Map` itera em ordem de inserção; igualdade de chave por SameValueZero (`NaN` igual a `NaN`; objetos por identidade); performa melhor com muitas inserções e remoções que `Object` — [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [FATO] Ordem das chaves de `Object` "is complex. As a result, it's best not to rely on property order"; cada mecanismo (`for-in`, `Object.keys`) inclui subconjuntos diferentes — [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [FATO] "Many `Math` functions have a precision that's implementation-dependent... different browsers can give a different result. Even the same JavaScript engine on a different OS or architecture can give different results!" — [MDN Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [FATO] V8 (2017): objetos com as mesmas propriedades adicionadas na mesma ordem compartilham a *HiddenClass*; propriedades *in-object* são as mais rápidas; adicionar e remover propriedades com frequência pode levar ao modo dicionário, mais lento no acesso; arrays têm "elements kinds" (inteiros pequenos, *doubles*, genéricos) e buracos (*holey*) custam busca na cadeia de protótipos — [V8, Fast properties](https://v8.dev/blog/fast-properties)
- [FATO] O Handbook sugere `as const` no lugar de `enum` para ficar alinhado ao JavaScript; numéricos têm mapeamento reverso; `const enum` ambiente tem armadilhas com `isolatedModules` — [TS Handbook, Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [FATO] ADR-0011 já decide: tempo em segundos (`number`), desempate determinístico no *heap* (tempo, tipo, ordem de inserção), MRG32k3a próprio, `Math.random` proibido, distribuições por inversão (exponencial usa `ln`; normal usa AS 241).

### Inferences
- [ESTIMATIVA] Risco para o ADR-0011: `Math.log`, `Math.exp` e afins não têm resultado garantido igual entre Chrome, Firefox, Safari e Node. O teste de determinismo do ADR-0011 (mesma entrada, mesmo motor) continua válido, mas **"mesma semente → mesmo resultado" entre navegadores diferentes, ou entre navegador e um futuro `takt-sim-worker` em Node, não está garantido**. Opções: aceitar e documentar (reprodutível por motor JavaScript); ou implementar `ln`/`exp` próprios em aritmética básica (`+ − × ÷` e `Math.sqrt` são exatamente arredondados pelo IEEE 754 — [PALPITE], não verificado nesta pesquisa). Deve ser levado ao usuário.
- [ESTIMATIVA] Coleções indexadas por id no motor: `Map` (ordem de inserção) ou arrays indexados pela ordem compilada; nunca iterar `Object.keys` de dados vindos do JSON da planta para decidir ordem de eventos.
- [ESTIMATIVA] Imutabilidade: na API pública do motor (entrada compilada, resultados, estado final exportado) usar tipos `readonly`/`ReadonlyArray`; no laço interno de eventos, mutação local controlada é aceitável e é o que o V8 favorece (forma estável, sem criar objetos por evento). Não encontrei fonte que meça isso para simulação; é inferência a partir do post do V8.
- [ESTIMATIVA] Inicializar todos os campos de um objeto de estado no construtor/fábrica, sempre na mesma ordem, e nunca usar `delete` — decorre do post do V8.
- [PALPITE] Classes × funções: o motor pode usar classes para o estado mutável do laço (forma estável) e funções puras para cálculos (distribuições, MSER-5, estatística). Sem fonte específica.
- [PALPITE] `Date.now()` e `performance.now()` também quebram o determinismo se usados na lógica do motor; vale banir no lint do `sim-engine` como o `Math.random`.

### Gaps
- Não encontrei fonte de autoridade sobre *data-oriented design* em TypeScript/JavaScript, nem *benchmarks* recentes (2025–2026) de V8 para laços de simulação; o post do V8 é de 2017.
- Não verifiquei a especificação ECMAScript (cláusula de `Math` "implementation-approximated") nem quais funções são exatas; usei a MDN.

---

## 6. Unidades nos identificadores (`cycleSec`, `mtbfMin`)

### Takeaway
Há fonte de autoridade: as **Google AIPs** (guia de design de APIs do Google) exigem a unidade como **sufixo abreviado** em campos de quantidade (`distance_km`). O `CLAUDE.md` e o ADR-0011 já decidiram isso para o Takt; a AIP confirma a escolha e acrescenta: abreviação padrão, sem plural, e `Count` para contagens.

### Cited Findings
- [FATO] AIP-141: quantidades com unidade clara "must include the unit of measurement as the suffix"; "should use generally accepted abbreviations", sem plural (`distance_km`, não `distance_kilometers`); contagens com sufixo `_count`, não `num_`; tipos dedicados (como `Duration`, `Money`) são opcionais, úteis quando a unidade varia — [AIP-141](https://google.aip.dev/141). Datas: criada em 2019; *changelog* de 09/07/2025 sobre unidades compostas, abreviações e unidades inversas.
- [FATO] AIP-140: "well known abbreviations for units should be used in field names" (`width_px`); *changelog* de 23/10/2025 — [AIP-140](https://google.aip.dev/140)
- [FATO] Fontes secundárias (artigos e guias acadêmicos) recomendam sufixo de unidade quando ela não é óbvia, citando bugs de segundos × minutos; alternativa é comentário com a unidade — [Better Programming](https://betterprogramming.pub/useful-tips-for-naming-your-variables-8139cc8d44b5); [Boot.dev / dev.to](https://dev.to/qvault/naming-variables-the-right-way-81a); [Broad Institute](https://mitcommlab.mit.edu/broad/commkit/coding-and-comment-style/)
- [FATO] Já decidido no Takt: "Units go in field names (`cycleSec`, `mtbfMin`)" (`CLAUDE.md`); "a planta guarda a unidade no nome do campo (`meanSec`, `mtbfMin`); a compilação converte" (ADR-0011).

### Inferences
- [ESTIMATIVA] Tradução das AIPs para camelCase: sufixo `Sec`, `Min`, `H`, `Ms`, `Pct`/`Ratio` no fim do nome (`cycleSec`, `mtbfMin`, `defectRatio`); contagens com `Count` (`partCount`, não `numParts`). Taxas como `defectRate` (0–1, ADR-0008) não têm unidade física; [PALPITE] usar `Ratio` quando 0–1 e `Pct` quando 0–100, para não confundir.
- [ESTIMATIVA] O motor converte tudo para segundos na compilação (ADR-0011); dentro do motor o sufixo `Sec` continua útil nos campos (`nowSec`, `serviceSec`).
- [PALPITE] Tipos "marcados" (*branded types*, `Seconds`) dariam checagem pelo compilador, mas não há fonte consultada que os recomende; as AIPs tratam tipo dedicado como opcional. Ficaria para revisão, não para ferramenta.

### Gaps
- A regra `naming-convention` do typescript-eslint pode exigir sufixo por regex, mas não tem como saber se um `number` é uma grandeza física; verificar unidade é revisão.

---

## Proposta para o Takt

Cada item indica a origem (fonte ou ADR) e como é verificado. "Imposto por ferramenta" cita a regra ou flag exata. Itens marcados **(decidir)** precisam de confirmação do usuário antes de entrar no guia.

### Versões e configuração base
1. **TypeScript 6.x no monorepo**; TS 7 (`tsc`) opcional só para checagem rápida, com `@typescript/typescript6` servindo o typescript-eslint (TS 7 não tem API) **(decidir; vira ADR)** — imposto por ferramenta: versão fixada no `package.json`.
2. **typescript-eslint em versão exata** (presets `strict` não seguem semver) — imposto por ferramenta: lockfile + atualização manual (ADR-0010).
3. **tsconfig base** (todos os projetos) — imposto por ferramenta: `"strict": true` (explícito, mesmo sendo padrão no TS 6), `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true` (conferir com o Zod antes), `"noImplicitOverride": true`, `"noImplicitReturns": true`, `"noFallthroughCasesInSwitch": true`, `"noPropertyAccessFromIndexSignature": true`, `"verbatimModuleSyntax": true`, `"forceConsistentCasingInFileNames": true`, `"skipLibCheck": true`, `"types"` explícito (padrão `[]` no TS 6).
4. **`"erasableSyntaxOnly": true` em `sim-engine` e `plant-schema`** (sem enum, namespace, parameter properties) **(decidir)** — imposto por ferramenta: flag no tsconfig do projeto.
5. **ESLint**: `tseslint.configs.strictTypeChecked` + `stylisticTypeChecked`, `parserOptions.projectService: true` — imposto por ferramenta (ADR-0010).

### Tipos
6. **Sem `any`**; `unknown` + estreitamento — imposto por ferramenta: `@typescript-eslint/no-explicit-any` e `no-unsafe-*` (recommended-type-checked).
7. **Sem `!` e com `as` só justificado**; dupla asserção via `unknown` — imposto por ferramenta: `@typescript-eslint/no-non-null-assertion` (strict), `consistent-type-assertions` com `objectLiteralTypeAssertions: 'never'` (stylistic); justificativa do `as` verificada em revisão.
8. **`interface` para forma de objeto, `type` para união, tupla e tipos inferidos do Zod** (Google e time do TS; Matt Pocock discorda) — imposto por ferramenta: `@typescript-eslint/consistent-type-definitions: ['error', 'interface']` (stylistic).
9. **Sem `enum`; união de literais ou objeto `as const`** (Handbook; compatível com `erasableSyntaxOnly`) **(decidir)** — imposto por ferramenta: `no-restricted-syntax` com seletor `TSEnumDeclaration`.
10. **`switch` sobre união é exaustivo, sem `default`**; `default` só em `switch` sobre tipo aberto ou dado de versão externa — imposto por ferramenta: `@typescript-eslint/switch-exhaustiveness-check` com `considerDefaultExhaustiveForUnions: false`, `requireDefaultForNonUnion: true`, `allowDefaultCaseForExhaustiveSwitch: false`. Diverge do Google ("todo switch tem default").
11. **`readonly` em campos não reatribuídos; `ReadonlyArray`/`readonly` nos tipos públicos do motor e nas entidades** — imposto por ferramenta: `@typescript-eslint/prefer-readonly`; tipos públicos verificados em revisão (`prefer-readonly-parameter-types` é ruidosa; [PALPITE] não ligar).
12. **Opcional (`x?:`) em vez de `| undefined`; `null` só onde o dado externo usa `null` (Prisma, JSON)** — verificado em revisão (Google não tem regra de ferramenta; `exactOptionalPropertyTypes` ajuda).
13. **Sem `@ts-ignore`/`@ts-nocheck`; `@ts-expect-error` só com descrição** — imposto por ferramenta: `@typescript-eslint/ban-ts-comment` (recommended). O Google proíbe também `@ts-expect-error`; [PALPITE] aceitar com descrição em testes de tipo.

### Nomes
14. **Casos de nome do Google**: `UpperCamelCase` para tipos e classes, `lowerCamelCase` para valores e funções, `UPPER_CASE` só para constantes de módulo; siglas como palavra (`plantId`, `httpUrl`); sem prefixo `I`; sem `_` inicial — imposto por ferramenta: `@typescript-eslint/naming-convention` (regra congelada, mas funcional); clareza e abreviações verificadas em revisão.
15. **Unidade como sufixo abreviado e sem plural** (`cycleSec`, `mtbfMin`); contagens com `Count` (AIP-141; já decidido no `CLAUDE.md` e ADR-0011) — verificado em revisão.
16. **Códigos de erro em `UPPER_SNAKE_CASE`** como união de literais (`'PLAN_LIMIT' | 'FORBIDDEN'`) — já decidido (regras `RN`, ADR-0002); tipo verificado pelo compilador, catálogo em revisão.
17. **Arquivos em kebab-case com sufixo por ponto** (`plants.module.ts`, `publish-plant-to-group.use-case.ts`, `plant.entity.ts`); diverge do `snake_case` do Google, segue o Nest e o ADR-0002 **(decidir sufixos)** — imposto por ferramenta: `unicorn/filename-case` ou `check-file` (plugin extra; [ESTIMATIVA], não pesquisado) ou verificado em revisão.

### Módulos
18. **Só *named exports*; sem `export default`** (Google), exceto onde uma ferramenta exige (arquivos de configuração) — imposto por ferramenta: `no-restricted-exports` com `restrictDefaultExports` ([ESTIMATIVA] conferir versão do ESLint) com *override* para configs.
19. **Sem `namespace`; sem `require`** — imposto por ferramenta: `@typescript-eslint/no-namespace` (recommended), `@typescript-eslint/no-require-imports` ([ESTIMATIVA] presente no recommended; não conferido nesta pesquisa).
20. **`import type` para importação só de tipo** — imposto por ferramenta: `verbatimModuleSyntax` + `@typescript-eslint/consistent-type-imports` + `@typescript-eslint/no-import-type-side-effects`. Exceção a verificar: classes injetadas pelo Nest com `emitDecoratorMetadata` ([PALPITE], testar na implementação).
21. **Sem `export let`**; estado mutável exposto por função — verificado em revisão ([ESTIMATIVA] dá para impor com `no-restricted-syntax`).
22. **Fronteiras** (motor sem React/Three/DOM; domínio sem `@nestjs/*`, `@prisma/*`, `zod`) — já decidido; imposto por ferramenta: `@nx/enforce-module-boundaries` e `eslint-plugin-boundaries` (ADR-0001, ADR-0002).

### Erros e assíncrono
23. **Falha de negócio esperada → `Result<T, E>` próprio em `shared/kernel/`, com `E` discriminado por `code`; defeito → `throw new Error(...)`** (Effect, Google, Node; resolve o "Em aberto" do ADR-0002) **(decidir; vira ADR)** — tipo imposto pelo compilador; uso do `Result` verificado em revisão.
24. **`throw` só de `Error`/subclasses; rejeição de promessa só com `Error`** — imposto por ferramenta: `@typescript-eslint/only-throw-error`, `prefer-promise-reject-errors` (recommended).
25. **`catch` com `unknown`** — imposto por ferramenta: `useUnknownInCatchVariables` (no `strict`) e `@typescript-eslint/use-unknown-in-catch-callback-variable` (strict).
26. **Toda promessa aguardada ou tratada; nada de `async` em lugar que espera função síncrona** — imposto por ferramenta: `no-floating-promises`, `no-misused-promises`, `await-thenable`, `require-await` (recommended), `return-await` (strict).
27. **Erro com `cause` ao reembrulhar; nunca serializar `cause` nem mensagem para o cliente** (Node; Nest não serializa `cause`) — verificado em revisão e no teste de formato de erro (ADR-0009).
28. **Domínio → HTTP por um filtro global registrado com `APP_FILTER`**, que traduz `DomainError.code` em status e corpo `{ code }`; desconhecido vira 500 genérico e log (Nest exception filters, ADR-0007) — verificado em revisão e por teste de API.

### NestJS e hexágono
29. **Porta = `interface` + token `Symbol` no mesmo arquivo da porta; ligação no `*.module.ts`** com `useClass`/`useFactory` + `inject` (Nest custom providers; ADR-0002) — verificado em revisão.
30. **Casos de uso sem decorador, montados por `useFactory`** — já decidido (ADR-0002); verificado em revisão.

### Motor
31. **Sem `Math.random`** — já decidido; imposto por ferramenta: `no-restricted-properties` (`Math.random`) no `sim-engine` (ADR-0011). Proposta extra: banir também `Date.now`, `new Date()` e `performance.now` no motor **(decidir)**.
32. **Ordem determinística**: iterar só `Map`/arrays em ordem conhecida; nunca decidir ordem por chaves de `Object`; desempate explícito em toda ordenação (MDN; ADR-0011) — verificado em revisão e por teste de determinismo.
33. **Reprodutibilidade entre motores JavaScript não garantida por `Math.log`/`Math.exp`** (MDN) — **(decidir)**: documentar o limite ou implementar funções próprias; verificado por teste de referência entre Node e navegadores se for exigido.
34. **Laço quente com objetos de forma estável**: campos todos inicializados na criação, mesma ordem, sem `delete`, sem criar objetos por evento quando evitável (V8) — verificado em revisão e por teste de desempenho do marco 1.
35. **API pública do motor imutável (`readonly`), mutação só no estado interno** — tipos verificados pelo compilador; fronteira verificada em revisão.

### Comentários
36. **`/** JSDoc */` em todo export público das libs (`sim-engine`, `plant-schema`); `//` para implementação; comentário explica o porquê** (Google) — verificado em revisão ([ESTIMATIVA] `eslint-plugin-jsdoc` poderia impor; não pesquisado).
