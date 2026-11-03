# Guia de estilo de código

> **Resumo.** Como escrever código no Takt: princípios de design, critérios para quebrar um princípio quando ele vira excesso de engenharia, convenções de TypeScript e convenções por projeto (API, motor, esquema, web, testes). O guia fica abaixo do `CLAUDE.md`, dos ADRs e PDRs aceitos e das regras `RN-...`. Cada regra diz se é imposta por **ferramenta** ou verificada na **revisão**.

Atualizado em 03/11/2026 · Base: pesquisa [Guia de estilo de código](../research/guia-de-estilo-de-codigo.md) · Decisões: [ADR-0001](../adr/0001-monorepo-nx-e-nomes.md), [ADR-0002](../adr/0002-arquitetura-hexagonal-por-contexto.md), [ADR-0008](../adr/0008-validacao-de-dados.md) a [ADR-0013](../adr/0013-erros-esperados.md).

Este guia tem uma versão curta para o Claude Code em [`.claude/rules/`](../../.claude/rules/), um arquivo por área. **O guia é a fonte da verdade.** Quando os dois divergirem, vale o guia, e os dois mudam no mesmo pull request.

## 1. Hierarquia de autoridade

1. **`CLAUDE.md`, ADRs e PDRs aceitos e regras `RN-...`.** Nenhum plano, revisão ou gosto pessoal os quebra. Quem achar que um deles atrapalha escreve um registro novo com status "Proposto", que cita o antigo no campo "Substitui".
2. **Este guia.** Seus princípios de estilo podem ser quebrados, mas só com o critério escrito no plano (seção 3).
3. **Gosto pessoal.** Não vale contra o guia.

**Na dúvida sobre uma regra:** primeiro procure a resposta no código e nos documentos (`docs/`, ADRs, PDRs, regras, este guia). Se não encontrar, pergunte. Nunca infira.

## 2. Princípios de design

A ordem de prioridade são as quatro regras do design simples de Kent Beck: **passa nos testes, revela a intenção, não duplica, tem o mínimo de elementos**. Um elemento (classe, método, camada, parâmetro) só existe se servir às três primeiras.

| Princípio | Regra no Takt | Verificação |
| --- | --- | --- |
| Nomes | Revelam a intenção, com palavras completas e consistentes. Grandeza física leva a unidade no nome (`cycleSec`, `mtbfMin`); contagem termina em `Count` (`partCount`); taxa de 0 a 1 termina em `Ratio`, de 0 a 100 em `Pct`. Siglas como palavras (`plantId`, não `plantID`). | Revisão |
| Abstração por função | Uma função trabalha num só nível de abstração. | Revisão |
| Tamanho de função | Sem limite fixo: nenhum estudo sustenta um número. Extraia quando houver uma **intenção que mereça nome**. Não extraia se o resultado for um método raso (só repassa a chamada) ou emaranhado (só se entende lendo o outro). Acima de cerca de 40 linhas, o revisor pergunta se há uma intenção nomeável; o número é gatilho de conversa, não regra. | Revisão |
| YAGNI | Não construa funcionalidade nem generalização para um requisito presumido. Exceção (Fowler): o que torna o código mais fácil de mudar, ou o que é barato agora, quase não aumenta a complexidade e reduz muito o custo depois. | Revisão |
| Duplicação | Conhecimento de negócio fica num só lugar, desde já (a regra `RN-...` mora no domínio). Código apenas parecido só vira abstração na **terceira** cópia. "Duplicação é muito mais barata que a abstração errada" (Sandi Metz). | Revisão |
| Abstração que deu errado | Se uma abstração acumula parâmetros e condicionais por chamador, desfaça-a em cada chamador e extraia de novo. | Revisão |
| Módulos profundos | Prefira interfaces simples que escondem bastante trabalho (Ousterhout). Método que só repassa a chamada é sinal de alerta, exceto onde o ADR-0002 impõe a camada. | Revisão |
| Padrões de projeto | Só para uma variação que existe hoje, ou que é barata agora e cara depois. Nunca "por precaução". | Revisão |
| Herança | Evite. Superclasse só com dois usos reais e nome de domínio (nada de `Base` ou `Abstract`). Portas como classes abstratas não contam: são contratos, não herança de comportamento. | Revisão |
| Comentários em produção | **O código deve se explicar sozinho.** Se um trecho precisa de comentário para ser entendido, primeiro deixe-o claro: um nome melhor, uma função extraída com nome de intenção, um tipo mais preciso. Comente só o que o código não consegue dizer: complexidade inerente (fórmula, algoritmo da literatura, com a fonte), invariantes e unidades que o tipo não expressa, e o porquê de uma escolha não óbvia (contorno de defeito, decisão de desempenho medida). **JSDoc é obrigatório** nos exports públicos das libs. Comentário que repete o código é proibido. Decisão do fundador em 21/10/2026. | Revisão |
| Comentários em testes | Proibidos, por decisão do ADR-0009 (AAA separado por linha em branco). | Revisão |

## 3. Quando quebrar um princípio de estilo

Seguir um princípio às vezes custa mais do que ajuda. O plano pode quebrar um princípio da seção 2 ou das convenções das seções 4 a 10 se **pelo menos um** destes critérios for verdadeiro:

1. **Não haverá reuso real:** a abstração teria um só chamador, e nenhum caso de uso ou marco já escrito prevê outro.
2. **Interface com uma só implementação:** não existe segunda implementação nem dublê de teste necessário. As portas do ADR-0002 já têm duas (Prisma e em memória); fora delas, justifique.
3. **Indireção sem benefício:** a extração geraria método de repasse, método emaranhado ou classe rasa.
4. **Duplicação abaixo da regra de três:** duas cópias parecidas cujos chamadores podem divergir.
5. **Abstração existente virou errada:** o plano propõe desfazê-la e extrair de novo.
6. **Desempenho medido**, sobretudo no motor: a forma "limpa" custa tempo mensurável, e o plano cita a medição.
7. **Clareza local maior:** um algoritmo da literatura fica mais claro inteiro e comentado.
8. **Generalização barata agora e cara depois**, com o custo futuro descrito concretamente.
9. **Exigência de teste:** a forma escolhida é a que permite cumprir AAA, um único Act e as metas do ADR-0009 sem lógica no teste.

Para cada desvio, o plano registra **cinco coisas**:

1. **Princípio quebrado:** o nome exato do item deste guia.
2. **Critério e evidência:** qual critério acima e a prova concreta (quantos chamadores, quais implementações, a medição, o caso de uso).
3. **Alternativa descartada:** em uma frase, como ficaria seguindo o princípio.
4. **Gatilho de revisão:** o fato que faria voltar ao princípio ("terceiro chamador", "segunda implementação", "fim do marco 4").
5. **Impacto em testes:** cobertura e mutação continuam atendidas.

**Nunca se quebra por plano:** o `CLAUDE.md`, ADRs e PDRs aceitos e regras `RN-...`. Por exemplo: pular camada, porta ou validação do ADR-0002; trocar códigos de erro por frases; tirar `organization_id` ou RLS de uma tabela de negócio; usar `Math.random`, React, Three.js ou DOM no motor; comentar testes ou pôr lógica neles; validar a entrada em mais de um lugar.

**Cerimônia sem benefício** imposta por um ADR (caso de uso que só repassa, *mapper* trivial) não se contorna no código. Anote o caso na seção "Cerimônia observada" do plano; essas anotações alimentam a revisão do ADR-0002 prevista para o fim do marco 4.

## 4. TypeScript

**Base:** o [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), com as divergências desta seção. Versão do TypeScript: **6.0.3, fixada exata** no `package.json`, porque o `latest` do npm já é o 7 e o typescript-eslint (ADR-0010) só aceita versões abaixo de 6.1. Gatilho de revisão: migrar para o 7 quando o typescript-eslint lançar suporte estável ao 7.1 ([issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Decisão do fundador em 03/11/2026 (era a D5).

### Configuração (ferramenta)

- **tsconfig de todos os projetos:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (conferir com a versão do Zod antes de ligar), `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `forceConsistentCasingInFileNames`.
- **Só no motor e no esquema:** `erasableSyntaxOnly`, que recusa `enum`, `namespace` com código e *parameter properties*. A API não liga, porque o Nest injeta pelo construtor.
- **typescript-eslint:** presets `strict-type-checked` e `stylistic-type-checked`, com versão exata fixada (eles não seguem *semver*), mais as regras que nenhum preset liga: `switch-exhaustiveness-check`, `prefer-readonly`, `consistent-type-imports`, `no-import-type-side-effects`, `naming-convention`. Confira cada regra na documentação antes de fixar a configuração.

### Convenções

| Convenção | Ferramenta | Revisão |
| --- | --- | --- |
| Casos de nome: `UpperCamelCase` para tipos e classes, `lowerCamelCase` para valores e funções, `UPPER_SNAKE_CASE` para constantes globais e códigos de erro; sem prefixo `I`, sem `_` | `naming-convention` | Clareza, abreviações, unidade no nome |
| Arquivos em *kebab-case*. A pasta diz o papel (`domain/entities/plant.ts`); sufixo só onde o Nest ou o adaptador pedem (`plants.module.ts`, `plants.controller.ts`, `plant.mapper.ts`). `*.service.ts` nunca no domínio | `unicorn/filename-case` ou `check-file` (plugin a escolher) | Sufixos |
| Sem `any`; `unknown` e estreitamento | `no-explicit-any`, `no-unsafe-*` | `any` em dublê de teste, com supressão justificada |
| Sem `!`; `as` só com comentário justificando | `no-non-null-assertion`, `consistent-type-assertions` | A justificativa |
| `interface` para formato de objeto; `type` para união e tipos inferidos do Zod | `consistent-type-definitions` | — |
| Sem `enum`: união de literais ou objeto `as const` | `no-restricted-syntax` (`TSEnumDeclaration`) | — |
| `switch` sobre união é exaustivo e **sem `default`**, para o lint acusar um membro novo. Exceção: dado vindo de versão externa (JSON de versão futura) | `switch-exhaustiveness-check` | A exceção |
| `readonly` em campo não reatribuído | `prefer-readonly` | `readonly` nos tipos públicos do motor e das entidades |
| Só *named exports*; sem `export default`, `namespace` ou `export let` | `no-restricted-exports` | Exceção para arquivos de configuração |
| `import type` para tipos | `verbatimModuleSyntax`, `consistent-type-imports` | Classes injetadas pelo Nest (seção 6) |
| Promessas sempre tratadas | `no-floating-promises`, `no-misused-promises`, `await-thenable`, `return-await` | — |
| `===` sempre; `const` por padrão | `eqeqeq`, `prefer-const` | — |
| Sem `@ts-ignore`; `@ts-expect-error` só com descrição | `ban-ts-comment` | — |
| Nenhum `console.log` | `no-console` | — |

## 5. Erros

- **Dois tipos.** Erro **esperado** faz parte do fluxo de negócio (`PLAN_LIMIT`, `FORBIDDEN`, uma regra `RN-...`, `SIMULATION_LIMIT_EXCEEDED`) e tem um `code` literal da tabela de [regras](../product/rules/README.md). **Defeito** é bug: `throw new Error(...)`, pego pelo filtro global e registrado no log (ADR-0007).
- **Formato do erro esperado:** exceção com `code` literal, em todo o repositório ([ADR-0013](../adr/0013-erros-esperados.md)); sem tipo `Result`. Na API, estende `DomainError`; no motor, a classe-base de erro do próprio motor. A `message` é interna, para o log.
- **Ninguém captura erro esperado no meio do caminho**, só nas duas fronteiras que o traduzem: o filtro global da API (`code` → status) e a casca do Worker (`code` como dado para a página). Nunca dentro do callback de uma transação: lançar é o que faz o rollback. Efeitos externos (e-mail, notificação) só depois do *commit*.
- **Identifique pelo `code`**, nunca pela mensagem.
- **`throw` só de `Error`** e `catch (e: unknown)` (ferramenta: `only-throw-error`, `useUnknownInCatchVariables`).
- **Ao reembrulhar,** passe o original em `cause`. **Nunca** serialize `cause`, `message` de biblioteca ou erro do Prisma numa resposta: a resposta só leva o código.

## 6. API (`takt-core-api`)

O *layout* de pastas e a regra de dependência estão no [ADR-0002](../adr/0002-arquitetura-hexagonal-por-contexto.md). As convenções abaixo detalham como escrever cada camada.

### Domínio (`domain/`)

- **Nada de fora:** nem `@nestjs/*`, `@prisma/*`, `zod`, nem `crypto` do Node. ID e hora chegam prontos de fora. (Ferramenta: `eslint-plugin-boundaries`.)
- **Entidade:** estado e construtor privados; `create(...)` valida as invariantes; `restore(snapshot)` reidrata do banco sem revalidar regras de criação; métodos com nome de negócio (`publishTo`, `rename`); nenhum *setter*.
- **Agregado:** repositório só para a raiz. Outros agregados são referenciados por ID (`Plant` guarda `organizationId`, não um objeto `Organization`). Entidade filha é carregada e salva pela raiz.
- **Objeto de valor** só quando há regra de formato ou de igualdade.
- **Serviço de domínio** só para regra entre várias entidades; puro, recebe dados prontos.
- **Erro** com `code`, sem frase e sem status HTTP.

### Aplicação (`application/`)

- **Também sem NestJS.** Nenhum decorador, nenhum import do Nest.
- **Caso de uso:** classe simples com `execute(command, ctx)`, recebendo as portas pelo construtor. Quem monta é o `*.module.ts`, com `useFactory` e `inject`.
  - `command` é um tipo TypeScript simples, sem Zod.
  - `ctx` traz `organizationId`, `userId` e papel do contexto da requisição, **nunca do corpo**.
- **Roteiro fino:** carregar → chamar o domínio → salvar → auditar → devolver. Um `if` de regra de negócio no caso de uso indica que a regra está no lugar errado.
- **Porta:** classe abstrata, que é o contrato e o token de injeção ao mesmo tempo, sem import do Nest.
  - **Uma por conversa com o mundo de fora:** persistência, `Clock`, `IdGenerator`, `AuditLog`, `TransactionRunner`. Código puro e determinístico é chamado direto, sem porta.
  - **Repositório:** um por raiz de agregado; métodos de coleção (`findById`, `save`, buscas com nome de negócio). **Um método só entra quando um caso de uso o usa.** Sem `update(dto)`, sem `findAll()` genérico, sem `organizationId` como parâmetro (o RLS filtra).
- **Transação e RLS:** mecanismo **pendente (D1)**. Até a decisão, siga o ADR-0003.
- **Portas de leitura** que devolvem um tipo próprio em vez de entidade: **pendente (D2)**. Até a decisão, vale o ADR-0002: portas devolvem entidades.

### Infraestrutura (`infra/`)

- **Adaptador Prisma:** usa o cliente da transação do contexto, nunca um cliente global; sem regra de negócio (duplicidade é `UNIQUE` no banco, com a violação traduzida para erro de domínio dentro do adaptador); nenhum tipo de `@prisma/client` sai do arquivo.
- **Mapper:** funções puras `toDomain(record)` (via `restore`) e `toPersistence(entity)`. Conversão de valores por tabela explícita, sem `as unknown as`.
- **Em memória** (`infra/in-memory/`): guarda cópias; **não reimplementa regra de negócio**; reproduz só restrições do banco (unicidade), lançando o mesmo erro de domínio que o adaptador Prisma.
- **Injeção:** adaptadores e controllers usam `@Inject(Token)` **explícito** em todo parâmetro do construtor. Ferramentas como `tsx` e esbuild ignoram os metadados de decorador, e uma classe importada com `import type` some do JavaScript.

### HTTP (`http/`) e montagem

- **Controller fino:** recebe a entrada já validada pelo *pipe* Zod estrito → monta `command` e `ctx` → chama o caso de uso → monta o **DTO de saída campo a campo** (lista do que sai, nunca a entidade inteira).
- **Esquemas Zod** de entrada e de saída por rota, em `http/schemas/`. Os tipos inferidos não saem de `http/`.
- **Sem `try/catch` no controller:** o filtro global traduz `code` em status.
- **Autorização:** toda rota tem `@RequirePermission` ou `@Public()` (ADR-0006).
- **`*.module.ts`:** portas ligadas por `provide`/`useClass`; casos de uso por `useFactory` + `inject`.

### Entre módulos

- Um módulo só usa a aplicação pública de outro (um caso de uso ou uma porta exposta), nunca o `domain` nem a `infra` dele.
- Chamada síncrona basta no MVP; eventos só quando houver necessidade de consistência eventual.

### Quando não aplicar o padrão

| Situação | Em vez de | Faça | Critério |
| --- | --- | --- | --- |
| Código puro e determinístico | Porta + adaptador | Função ou serviço de domínio chamado direto | Porta só para efeito colateral, E/S ou não determinismo (Cockburn) |
| Dependência sem segunda implementação nem dublê | Porta | Chamada direta em `infra/` ou `shared/` | Interface 1:1 é cheiro de código (Seemann) |
| Registro do banco igual ao formato de saída | *Mapper* em várias etapas | `select` do Prisma já no formato | *Mapper* só onde os formatos diferem; entidade ↔ registro sempre tem |
| Catálogo só de leitura (planos) | Repositório com `save` | Porta de leitura pequena ou configuração em código | Repositório é para raiz que muda |
| Entidade filha do agregado | Repositório próprio | Carregada e salva pela raiz | Um repositório por raiz, nunca por tabela |
| Método "para o futuro" | Declarar na porta | Só quando um caso de uso usa | — |

## 7. Motor (`@takt/sim-engine`)

O motor é um **núcleo funcional**: recebe valores (planta compilada, semente, modo) e devolve valores (indicadores, séries, estado final, log). Não tem portas, injeção nem classes de serviço. A casca é o código do Worker no `takt-web-app` (ADR-0011).

- **Pastas por conceito** (por exemplo `rng/`, `distributions/`, `events/`, `model/`, `stats/`, `modes/`), não `domain/application/infra`.
- **Fontes de não determinismo proibidas** (ferramenta: `no-restricted-properties` e `no-restricted-syntax`): `Math.random`, `Date.now`, `new Date()`, `performance.now`.
- **Ordem determinística:** itere só `Map` ou arrays em ordem conhecida; nunca decida ordem de eventos por `Object.keys` de dado vindo do JSON; toda ordenação tem desempate explícito.
- **Laço quente:** objetos com todos os campos inicializados na criação, sempre na mesma ordem, sem `delete`; evite criar objeto por evento. Quebrar outro princípio por desempenho exige medição (seção 3, critério 6).
- **Imutabilidade na fronteira:** a API pública usa `readonly` e `ReadonlyArray`. Dentro de uma execução, mutação local é aceita, desde que não escape: `run` continua determinística para quem chama.
- **Comentários obrigatórios** onde há literatura: fórmula, fonte, hipótese e unidade (por exemplo, AS 241 de Wichura), com JSDoc nos exports públicos.
- **Reprodutibilidade entre navegadores:** **pendente (D4)**. Funções de `Math` podem dar resultados diferentes entre motores JavaScript; a medição no marco 1 decide se o limite é documentado ou se o motor usa funções próprias.

## 8. Esquema (`@takt/plant-schema`)

- **Zod é a fonte da verdade.** Tipos por `z.infer`; o JSON Schema é gerado (ADR-0008).
- **Dois níveis de validação:** estrutural (formato) e semântica (regras), com resultado `{ elementId?, path, code }`.
- **Migrações em cadeia,** uma por versão do formato.
- **Sem `enum`** e com `erasableSyntaxOnly`; unidade no nome de todo campo com grandeza física.

## 9. Web (`takt-web-app`)

Esta seção começa só com o que o [ADR-0012](../adr/0012-front-end.md) e o ADR-0011 já decidem; convenções de React serão pesquisadas quando o front-end começar.

- **Nada por quadro passa pelo React:** a cena usa *refs* e lê o *store* direto no `useFrame`.
- **Estado:** fatias do Zustand para o editor e a cena; dados da API pelo TanStack Query.
- **Worker:** mensagens do `postMessage` como união discriminada e tipada.
- **Textos e números:** `Intl` e mensagens ICU com caso `=0` para o plural.
- **A cena nunca calcula resultado:** ela só reproduz o log de eventos do motor (RN-SIM-002).

## 10. Testes

O [ADR-0009](../adr/0009-estrategia-de-testes.md) decide a estratégia; aqui ficam as convenções de escrita.

- **AAA** separado por linha em branco, **sem comentários**; um único Act; sem `if` nem laço para decidir o que verificar.
- **Erro esperado no teste** ([ADR-0013](../adr/0013-erros-esperados.md)): em código assíncrono, o Act é a chamada e o Assert usa `await expect(promise).rejects.toMatchObject({ code })`; em código síncrono, o helper `catchError(fn)` devolve o erro e o Assert verifica o `code`. Nunca `expect(() => ...).toThrow()`, que junta Act e Assert, e nunca pela mensagem.
- **Tabela de casos (`it.each`) é permitida** com quatro condições: todas as linhas têm o mesmo comportamento e a mesma forma de verificação; a tabela só tem valores literais; o corpo não tem `if`; o nome começa com o ID, quando houver, e mostra o valor que varia. Sucesso e erro com formatos diferentes ficam em tabelas separadas. Decisão do fundador em 03/11/2026.
- **Nome do teste começa com o ID** da regra ou do caso de uso: `RN-PLT-002: ...`. Sem regra nem caso de uso (ferramenta, invariante técnico), o nome é só a descrição do comportamento, sem ID inventado. Decisão do fundador em 03/11/2026.
- **TDD** no motor e nas regras `RN-...`: o teste é escrito e falha antes do código.
- **Dados:** fábricas `makePlant(overrides)` com dados fixos; nada de dado aleatório sem semente.
- **Casos de uso** testados com os adaptadores em memória, sem *mocks* de biblioteca.
- **Resposta da API** validada contra o esquema Zod de saída.
- **Arquivos:** unitário ao lado do código (`*.spec.ts`); API em `*.e2e-spec.ts`.

## 11. Checklist de revisão

O que nenhuma ferramenta pega:

- [ ] Nomes revelam a intenção e trazem a unidade quando há grandeza física.
- [ ] Nenhuma abstração, porta ou método "para o futuro"; cada desvio da seção 3 está registrado no plano.
- [ ] Regra de negócio no domínio, não no caso de uso, no controller, no adaptador ou no repositório em memória.
- [ ] Porta recebe e devolve entidades; nenhum tipo do Prisma fora do adaptador; nenhum `as unknown as` em *mapper*.
- [ ] `organizationId`, usuário e papel vêm do contexto, nunca do corpo da requisição.
- [ ] DTO de saída montado campo a campo, sem segredos (hash de senha, token) e validado contra o esquema de saída.
- [ ] Resposta de erro só com o código; detalhes internos (mensagem do Prisma, `cause`) só no log interno.
- [ ] Nenhum `console.log`; nenhum dado pessoal, senha, token ou *cookie* no log (ADR-0007).
- [ ] Nenhum segredo em arquivo versionado, inclusive arquivos de configuração de ferramentas.
- [ ] `@Inject(Token)` explícito nos construtores de adaptadores e controllers.
- [ ] Erro esperado tratado pelo chamador; `switch` sobre o código é exaustivo.
- [ ] Trecho que precisava de explicação foi primeiro deixado claro no código; os comentários que sobraram dizem só o que o código não consegue dizer; exports públicos das libs têm JSDoc; testes sem comentários.

## Decisões pendentes

Estes pontos conflitam com registros aceitos ou fecham um "Em aberto" deles, e cada um vira um registro novo. Detalhes e opções na [pesquisa](../research/guia-de-estilo-de-codigo.md#decisões-pendentes-para-o-fundador).

| # | Assunto | Antes de |
| --- | --- | --- |
| D1 | Versão do Prisma e transação do RLS (ADR-0003) | marco 4 |
| D2 | Portas de leitura que devolvem tipo próprio (ADR-0002) | revisão do fim do marco 4 |
| D4 | Precisão de `Math` entre navegadores (ADR-0011, RN-SIM-001) | marco 1 (medir) |
