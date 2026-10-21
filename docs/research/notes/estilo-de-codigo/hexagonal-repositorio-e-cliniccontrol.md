# Arquitetura hexagonal, repositório e DDD leve em NestJS + Prisma: convenções de código para o Takt

> **Resumo.** Notas de pesquisa (21/10/2026) para o guia de estilo do código da `takt-core-api` e do `@takt/sim-engine`. Cobrem as fontes primárias (Cockburn, Fowler, Evans via Fowler, Vernon), as críticas conhecidas, a prática atual com NestJS e Prisma (incluindo a mudança do Prisma 8, que afeta o ADR-0003), a revisão do `cliniccontrol` com referências a arquivos e o encaixe do motor puro ("núcleo funcional, casca imperativa"). Termina com a seção "Proposta para o Takt".
>
> Marcadores: **[FATO]** tem fonte (link ou caminho de arquivo); **[ESTIMATIVA]** é inferência razoável a partir de fatos citados; **[PALPITE]** é opinião sem fonte direta.
>
> Restrições respeitadas: ADR-0002, 0003, 0006, 0008, 0011, `CLAUDE.md` e `docs/architecture/takt-core-api.md`. Onde esta pesquisa diverge deles, o conflito está anotado; nada aqui substitui um registro aceito.
>
> Caminhos do `cliniccontrol` abaixo são relativos a `/home/italoamaral/cliniccontrol/apps/core-rest-api/src/app/`, salvo indicação.

## 1. O que dizem as fontes primárias (Cockburn, Fowler, Evans, Vernon)

### Takeaway
Cockburn define o hexágono pela **intenção**: a aplicação pode ser dirigida igualmente por usuários, programas, testes ou scripts, e roda isolada dos seus dispositivos. Porta é uma "conversa com propósito", e ele prefere **poucas portas (2 a 4)**. Fowler define o repositório como uma interface **de coleção** sobre objetos de domínio. A tradição DDD (Evans via Fowler, Vernon, guia da Microsoft) prende o repositório ao **agregado**, não à tabela, e a transação ao limite do agregado.

### Cited Findings
- [FATO] Intenção do padrão: "Allow an application to equally be driven by users, programs, automated test or batch scripts", e desenvolvê-la e testá-la isolada dos dispositivos e bancos de execução. Artigo de 04/09/2005 (HaT Technical Report 2005.02). [Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [FATO] "A port identifies a purposeful conversation." Cada porta pode ter vários adaptadores, um por tecnologia. Há atores primários (dirigem a aplicação) e secundários (a aplicação os dirige "either to get answers from or to merely notify"). [Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [FATO] Adaptador de teste natural do lado secundário (banco): um *mock* em memória, que deixa a aplicação rodar isolada. [Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [FATO] Sobre quantas portas: escolher o número "errado" não causa grande dano, e a preferência dele "tends to favor a small number, two, three or four ports". [Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [FATO] Existe o livro *Hexagonal Architecture Explained* (Cockburn e Juan Manuel Garrido de Paz), Humans and Technology, ISBN 9781737519782, abril/maio de 2024, e uma "Updated 1st Edition" (ISBN 979-8-9985862-0-0, listada no Goodreads como 15/04/2025). [Wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)); [eBooks.com](https://www.ebooks.com/en-sd/book/211349066/hexagonal-architecture-explained/alistair-cockburn/); [Goodreads](https://www.goodreads.com/book/show/231700430). **Não li o livro**; nada do conteúdo dele está nestas notas.
- [FATO] Repositório (PoEAA): "Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects." Concentra a construção de consultas e mantém a dependência numa direção só, do domínio para o mapeamento. [Fowler, Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [FATO] Agregado: "A DDD aggregate is a cluster of domain objects that can be treated as a single unit"; "Aggregates are the basic element of transfer of data storage - you request to load or save whole aggregates"; "Transactions should not cross aggregate boundaries"; "Any references from outside the aggregate should only go to the aggregate root." (23/04/2013) [Fowler, DDD_Aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html)
- [FATO] Modelo anêmico: objetos que são "little more than bags of getters and setters". Fowler cita Evans sobre a camada de aplicação: "This layer is kept thin. It does not contain business rules or knowledge, but only coordinates tasks and delegates work to collaborations of domain objects in the next layer down." (25/11/2003) [Fowler, AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html)
- [FATO] Vernon, regras de desenho de agregados (títulos do capítulo 10 de *Implementing Domain-Driven Design*): "Model True Invariants in Consistency Boundaries", "Design Small Aggregates", "Reference Other Aggregates by Identity", "Use Eventual Consistency Outside the Boundary", e uma seção "Reasons to Break the Rules". [InformIT, trecho do livro](https://www.informit.com/articles/article.aspx?p=2020371). O ensaio original em PDF (DDD Community, 2011) é [Vernon_2011_1.pdf](https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf).
- [FATO] Guia da Microsoft (DDD + CQRS, 2018, atualizado em 2023): "For each aggregate or aggregate root, you should create one repository class"; "you should never create a repository for each table in the database"; atualizações só pelos repositórios e raízes; consultas podem ir por outros canais porque "queries don't change the state of the database". [Microsoft Learn, infrastructure persistence layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [FATO] O mesmo guia: "Repositories might be useful, but they are not critical for your DDD design in the way that the Aggregate pattern and a rich domain model are." [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)

### Inferences
- [ESTIMATIVA] O critério de Cockburn é "a aplicação roda sem os dispositivos reais" e "poucas portas, cada uma uma conversa". Daí: uma porta por **conversa** (persistir plantas, ler sessão, registrar auditoria, saber a hora), não uma por classe ou por tabela.
- [ESTIMATIVA] Juntando Fowler e Vernon: repositório por **raiz de agregado**, com interface de coleção (`get`, `save`, buscas com nome de negócio), recebendo e devolvendo a raiz inteira. Isso confirma o ADR-0002 ("portas recebem e devolvem entidades").
- [ESTIMATIVA] Vernon recomenda agregados pequenos e referência por ID. No Takt, isso se traduz em `Plant` com `organizationId` e `ownerId` (IDs), não objetos `Organization` aninhados.

### Gaps
- Não consegui extrair o texto dos PDFs de Evans (*DDD Reference*, 2015) e de Vernon (2011) com as ferramentas disponíveis. As frases de Evans sobre repositórios ("só para raízes que precisam de acesso direto", "deixe o controle de transação para o cliente") **não foram verificadas literalmente**. Uso Fowler e Microsoft como fontes secundárias da mesma ideia.
- A regra de Vernon "modificar uma instância de agregado por transação" aparece só em resumos secundários. Não confirmei a redação original.
- O conteúdo do livro de 2024 de Cockburn e Garrido de Paz não foi consultado.

## 2. Críticas conhecidas e modos de falha

### Takeaway
As críticas mais citadas vêm de pessoas de dentro da comunidade: abstração demais e camadas que servem só à minoria das requisições (Bogard), interface com uma só implementação como cheiro de código (Seemann), repositório que esconde o poder da persistência e ainda exige teste de integração (Bogard, citado pela Microsoft), lado de leitura que dispensa repositório (Microsoft, Sairyss, Fowler/CQRS) e o próprio domain-driven-hexagon avisando que não serve a CRUD simples.

### Cited Findings
- [FATO] **Excesso de camadas:** Bogard diz que a arquitetura em camadas, *onion* ou *clean* "is really only appropriate in a minority of the typical requests in a system", e que leva a "many abstractions around concepts that really shouldn't be abstracted". Propõe "Minimize coupling between slices, and maximize coupling in a slice"; cada fatia "can decide for itself how to best fulfill the request". Ressalva dele: a abordagem "does assume that your team understands code smells and refactoring". (19/04/2018) [Bogard, Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- [FATO] **Repositório que esconde a persistência:** Bogard, citado no guia da Microsoft: "I'm really not a fan of repositories, mainly because they hide the important details of the underlying persistence mechanism… I don't usually want to mock my repositories – I still need to have that integration test with the real thing. Going CQRS meant that we didn't really have a need for repositories any more." [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [FATO] **Interface com uma implementação:** "Having only one implementation of a given interface is a code smell"; "Interfaces are not abstractions"; isso viola o Reused Abstractions Principle. Seemann admite que boas abstrações continuam permitindo dublês de teste, e que um *Decorator* também conta como implementação. (02/12/2010) [Seemann, Interfaces are not abstractions](https://blog.ploeh.dk/2010/12/02/Interfacesarenotabstractions/). Há contestação nos comentários de um texto seguinte: programar para interfaces traz benefícios mesmo sem várias implementações. [Seemann, Towards better abstractions](https://blog.ploeh.dk/2010/12/03/Towardsbetterabstractions/)
- [FATO] **Portas em excesso:** "abusing ports/interfaces may lead to unnecessary abstractions and overcomplicate your application." [Sairyss, domain-driven-hexagon README](https://github.com/Sairyss/domain-driven-hexagon)
- [FATO] **CRUD simples:** o domain-driven-hexagon avisa que a arquitetura "is generally ill-suited to simple CRUD applications and could over-complicate such solutions"; que "separating domain and persistence models may be overkill for smaller applications"; e "Don't blindly follow practices, patterns and architectures just because books and articles say so." [Sairyss](https://github.com/Sairyss/domain-driven-hexagon)
- [FATO] **Repositório genérico/CRUD:** o boilerplate da Brocoders recomenda "Don't try to create universal methods in the repository because they are difficult to extend during the project's life", e prefere métodos com uma responsabilidade (`findByEmail`, `findByIds`). [brocoders/nestjs-boilerplate, docs/architecture.md](https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/architecture.md). Em sentido contrário, o domain-driven-hexagon tem uma classe abstrata de repositório com CRUD básico, que os repositórios específicos estendem. [Sairyss](https://github.com/Sairyss/domain-driven-hexagon). A Microsoft sugere um `IRepository<T>` restrito a `IAggregateRoot` para forçar repositório só por raiz. [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [FATO] **Leitura que dispensa repositório:** "in read model we can bypass a domain and repository layers completely and query database directly from a query handler" e "in a read model / query handlers it is not required to use a repository pattern" [Sairyss](https://github.com/Sairyss/domain-driven-hexagon). A Microsoft diz o mesmo: consultas por "simple SQL statements… much more flexible than repositories" [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design).
- [FATO] **Mas CQRS completo é risco:** "for most systems CQRS adds risky complexity" e "CQRS should only be used on specific portions of a system (a BoundedContext in DDD lingo)". (14/07/2011) [Fowler, CQRS](https://martinfowler.com/bliki/CQRS.html)
- [FATO] **Modelo anêmico** como antipadrão, com a camada de serviço engordando: [Fowler, AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html).
- [FATO] **Transação entre repositórios:** "Transactions should not cross aggregate boundaries" [Fowler](https://martinfowler.com/bliki/DDD_Aggregate.html). A Microsoft lembra que *Unit of Work* "can be implemented with or without using the Repository pattern" e que, no EF, o `DbContext` já faz as duas coisas [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design).
- [FATO] **Vazamento de tipos do ORM:** o domain-driven-hexagon pede modelo de persistência separado com *mapper* "to map from domain to persistence and back", e DTO de resposta para não entregar tudo o que a entidade tem ("prefer _whitelisting_ properties over _blacklisting_"). [Sairyss](https://github.com/Sairyss/domain-driven-hexagon)
- [FATO] **Comunicação entre módulos:** "Try to make every module independent and keep interactions between modules minimal"; evitar *imports* diretos; usar fachada pública, mediador ou mensagens (comandos ou eventos). [Sairyss](https://github.com/Sairyss/domain-driven-hexagon)

### Inferences
- [ESTIMATIVA] As críticas não negam o hexágono. Elas atacam três excessos: (a) portas para coisas que nunca variam nem precisam de dublê; (b) repositório usado como DAL genérico por tabela; (c) leitura obrigada a passar por entidade e repositório. Os três têm critério objetivo (ver "Proposta para o Takt").
- [ESTIMATIVA] Contra Seemann, a defesa de uma porta com um adaptador de produção no Takt é que ela tem **duas implementações reais**: a Prisma e a em memória, que é exigida pelo ADR-0002 e pelo ADR-0009. Pelo critério de Cockburn (rodar sem o dispositivo), isso justifica as portas de persistência, relógio e auditoria. Não justifica porta para código puro sem efeito colateral.
- [ESTIMATIVA] A crítica de Bogard (repositório *mockado* não dispensa teste com banco real) já está atendida no Takt: o ADR-0003 e a arquitetura exigem testes de integração dos repositórios Prisma, RLS e isolamento.

### Gaps
- Não achei o texto original de Oren Eini (Ayende) sobre repositórios ("the repository is the new singleton"); a busca não retornou o post. Fica de fora.
- Não achei estudo empírico que meça o custo ou o benefício da arquitetura hexagonal em projetos do tamanho do Takt. As críticas são opiniões de praticantes reconhecidos, não dados.

## 3. Como praticantes implementam hexagonal com NestJS e Prisma (estado em outubro de 2026)

### Takeaway
A injeção do NestJS resolve portas com **classe abstrata** ou ***token* explícito** e monta casos de uso com `useFactory`. Transação e contexto por requisição costumam ir para `nestjs-cls` com o plugin transacional. **Atenção:** o Prisma está trocando de geração. O Prisma 8 está em RC (GA prevista para outubro de 2026), **substitui `$extends` por *middleware*** e muda a API de transação. O ADR-0003 descreve o RLS como "extensão do cliente Prisma", então a versão do Prisma tem de ser fixada antes do marco 4.

### Cited Findings
**Repositórios de referência (dados da API do GitHub em 21/10/2026):**
- [FATO] `Sairyss/domain-driven-hexagon`: 14.988 estrelas, último *push* em 11/06/2024 (sem atividade há cerca de 2 anos e 4 meses). É guia e exemplo, não biblioteca. [GitHub](https://github.com/Sairyss/domain-driven-hexagon)
- [FATO] `brocoders/nestjs-boilerplate`: 4.418 estrelas, último *push* em 20/10/2026. Hexagonal por módulo: `domain/`, `dto/`, `infrastructure/persistence/{relational,document}/{entities,mappers,repositories}` e a porta `[PORT].repository.ts`; *mappers* entre entidade de persistência e de domínio. [docs/architecture.md](https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/architecture.md). Usa TypeORM e Mongoose, não Prisma ([ESTIMATIVA] pela estrutura `relational`/`document` descrita; não conferi o `package.json`).
- [FATO] `CodelyTV/typescript-ddd-example`: 1.478 estrelas, último *push* em 20/08/2024. [GitHub](https://github.com/CodelyTV/typescript-ddd-example)
- [FATO] `tim-hub/nestjs-hexagonal-example`: 124 estrelas, último *push* em 10/08/2022 (abandonado). `gmartins-dev/hexagonal-nestjs`: 0 estrelas (Prisma 7). Nenhum dos dois serve de referência. [GitHub tim-hub](https://github.com/tim-hub/nestjs-hexagonal-example); [awesome.ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fgmartins-dev%2Fhexagonal-nestjs)
- [FATO] `Papooch/nestjs-cls`: 706 estrelas, último *push* em 20/10/2026. `nestjs/cqrs`: 945 estrelas, último *push* em 21/10/2026. `prisma/prisma-client-extensions`: 228 estrelas, último *push* em 15/10/2026. (API do GitHub.)

**Injeção de dependência no NestJS:**
- [FATO] Interfaces não existem em tempo de execução; "Abstract classes, unlike interfaces, exist at runtime", então uma classe abstrata serve ao mesmo tempo de contrato e de *token*, sem `@Inject()`. *Tokens* em *string* ou *symbol* exigem `@Inject()`. Em `useFactory`, "Nest passes the instances from the `inject` list to the factory function as arguments, in the same order." `useClass` troca a implementação (o exemplo da documentação escolhe pelo `NODE_ENV`), e `useValue` substitui por *mock* em teste. [NestJS, Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [FATO] A receita oficial de Prisma do NestJS usa **Prisma ORM 7**, cria `PrismaService extends PrismaClient` e injeta esse serviço direto nos *services*, sem repositório. Avisa que a *tag* `latest` já apontava para um pré-lançamento do Prisma 8. [NestJS, recipes/prisma](https://docs.nestjs.com/recipes/prisma)

**Prisma 7 × Prisma 8:**
- [FATO] Situação: "Prisma ORM 8 is a **release candidate**"; GA "expected in October 2026"; o Prisma 7 "keeps receiving bug fixes and security updates for 18 months" depois do GA do 8; o Prisma 6 recebe só correções de segurança "until 19 November 2026". `$extends` ainda não existe no ORM 8. [Prisma, Release status](https://www.prisma.io/docs/prisma-orm/release-status); [Changelog 02/10/2026](https://www.prisma.io/changelog/2026-10-02)
- [FATO] A documentação de *client extensions* (v7) cita RLS como caso de uso ("each HTTP request has its own client with its own RLS extension") e avisa: "Prisma 8 replaces Client extensions with extensions that add database capabilities and middleware that wraps every query." [Prisma, Client extensions v7](https://www.prisma.io/docs/orm/prisma-client/client-extensions)
- [FATO] Transações no Prisma 8 (página atual da documentação): `db.transaction(async (tx) => …)`, "no `$transaction`", sem opções `isolationLevel`, `timeout` nem `maxWait`, isolamento padrão do banco (`READ COMMITTED` no PostgreSQL), sem *timeout* de transação (recomenda `idle_in_transaction_session_timeout` ou `transaction_timeout` no PostgreSQL 17+). Uma transação interna "does not nest"; o certo é passar `tx` adiante ("A helper that runs inside the caller's transaction takes `tx` as a parameter"). [Prisma, Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [FATO] Prisma 8 com NestJS (post do próprio fornecedor, 24/09/2026, testado com `prisma@8.0.0-rc.15` e NestJS 11): o cliente é um objeto simples exportado de `src/prisma/db.ts` ("there is no class to extend"); a lógica transversal vai para *middleware* passado na criação do cliente; recomenda "put `@Inject(Token)` on every injected constructor parameter", porque o `tsx` (esbuild) ignora `emitDecoratorMetadata`. O post não fala de RLS, de `set_config` nem de repositórios. [Prisma blog, Prisma ORM 8 in NestJS](https://www.prisma.io/blog/prisma-orm-8-nestjs)

**RLS com Prisma:**
- [FATO] O exemplo oficial de RLS (Prisma 7, `$extends`) envolve **cada consulta** numa transação em lote que começa com `SELECT set_config('app.current_company_id', …, TRUE)`. Avisos do próprio exemplo: chamadas explícitas a `$transaction()` "may not work as intended"; "This extension is provided as an example only. It is not intended to be used in production environments"; o usuário do banco não pode ser superusuário nem ter `BYPASSRLS`. [prisma-client-extensions/row-level-security](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security)

**Transação e contexto (Unit of Work):**
- [FATO] `@nestjs-cls/transactional` com o adaptador Prisma: o método do caso de uso (ou do *service*) recebe `@Transactional()`; os repositórios injetam `TransactionHost<TransactionalAdapterPrisma>` e usam `txHost.tx`, que é o cliente da transação (fora de transação, é o cliente normal). Aceita cliente estendido como genérico (`TransactionalAdapterPrisma<CustomPrismaClient>`). Transação aninhada é feita com `SAVEPOINT` e exige `sqlFlavor`. [nestjs-cls, Prisma adapter](https://papooch.github.io/nestjs-cls/plugins/available-plugins/transactional/prisma-adapter)

**Mapeamento e DTOs:**
- [FATO] O domain-driven-hexagon põe um *mapper* em cada adaptador "if it's needed"; o DTO de resposta pode ser montado "using a separate mapper or right in the constructor of a DTO class"; DTOs "should be data-oriented, not object-oriented". [Sairyss](https://github.com/Sairyss/domain-driven-hexagon)
- [FATO] Pasta por caso de uso dentro do módulo ("Each business use case inside that module gets its own folder") e "Group files by their behavior that changes together". [Sairyss](https://github.com/Sairyss/domain-driven-hexagon)

### Inferences
- [ESTIMATIVA] **Conflito com o ADR-0003, item 4.** O texto supõe "uma extensão do cliente Prisma" que envolve cada operação numa transação com `set_config`. Isso é o padrão do exemplo oficial do Prisma 7 (`$extends`), que o próprio Prisma diz não ser para produção e que conflita com transações explícitas. O ADR-0006 exige a checagem de limite do plano **dentro da transação de criação**, ou seja, uma transação com várias instruções. Então o desenho tem de ser: **uma transação interativa por caso de uso, que começa com `set_config`**, com o `tx` propagado aos repositórios. Não pode ser uma transação por consulta. No Prisma 8 não há `$extends`; o mecanismo seria o *middleware* ou o `db.transaction` com `tx` passado adiante.
- [ESTIMATIVA] Como o ADR-0003 deixou em aberto a versão do Prisma, decidir entre 7 (estável, `$extends` e `$transaction`, suporte até cerca de 18 meses depois do GA do 8) e 8 (GA iminente, API nova) cabe num ADR novo antes do marco 4. Seja qual for a escolha, o código que conhece a API do Prisma deve ficar em `shared/database` e em `modules/*/infra/prisma`, para que a migração 7 → 8 não toque `domain` nem `application`.
- [ESTIMATIVA] O `nestjs-cls` já está escolhido no ADR-0007 para o contexto da requisição. O plugin transacional dele dá o *Unit of Work* sem porta extra: o caso de uso não recebe `tx` e os repositórios leem `txHost.tx`. O porém: o adaptador oficial é para o cliente do Prisma 7 (`$transaction`). Não verifiquei suporte ao Prisma 8.
- [ESTIMATIVA] O decorador `@Transactional()` do `nestjs-cls` é do NestJS. Se o caso de uso for classe simples em `application/` (ADR-0002, domínio e aplicação sem `@nestjs/*`), o decorador não pode ficar nele. Alternativa compatível: uma porta `TransactionRunner` (ou `UnitOfWork`) em `application/ports`, implementada em `shared/database` com o `TransactionHost` ou com `db.transaction` + `set_config`.
- [ESTIMATIVA] Classe abstrata como porta resolve a injeção sem `@Inject` e não importa nada do Nest, então cabe em `application/ports`. Como o ADR-0002 já manda montar casos de uso com `useFactory` + `inject`, *tokens* explícitos funcionam também. Isso evita o problema de `emitDecoratorMetadata` com esbuild/tsx citado pelo Prisma.

### Gaps
- Não encontrei repositório de referência **mantido e popular** que una NestJS + Prisma + hexagonal + RLS. O mais popular (Sairyss) está parado desde 06/2024; o mais ativo (Brocoders) não usa Prisma.
- Não verifiquei a API do *middleware* do Prisma 8 nem se ele consegue rodar `set_config` no início de cada transação. A documentação lida não cobre isso.
- Não verifiquei se o `@nestjs-cls/transactional-adapter-prisma` suporta o Prisma 8.
- Não confirmei se `$transaction` interativo do Prisma 7 tem os limites padrão de `timeout` e `maxWait` (a página lida é a do Prisma 8).

## 4. Revisão do `cliniccontrol` (referência, não verdade)

### Takeaway
Os nove problemas listados no ADR-0002 estão **confirmados** no código. A revisão achou mais **oito** problemas, quatro deles de segurança: a resposta devolve o hash da senha; não há lista de campos permitidos na entrada, então o cliente escolhe papel e plano; mensagens internas do Prisma vão para o cliente; e há um *token* do Nx Cloud versionado. Vale manter: um caso de uso por pasta com o teste ao lado, porta como classe abstrata, implementação em memória para teste, *mapper* `toDomain`/`toPrisma`, fábricas de teste e *fakes* de criptografia.

### Cited Findings
**Estrutura** ([FATO], árvore de arquivos e `/home/italoamaral/cliniccontrol/docs/libs/core-rest-api/README.md`):
- Nx 17.2.5, NestJS 10.3, Prisma 5.7, `class-validator` 0.14 **e** Zod 3.22 juntos, Vitest 1.0 (`/home/italoamaral/cliniccontrol/package.json`). Último *commit*: 07/03/2024.
- Organização por camada: `core/domains/<domínio>/{entities,interfaces,repositories,use-cases}`, `adapters/controllers/api/use-cases/<domínio>/<caso>/`, `adapters/database/{repositories,mappers,infra/prisma}`. Uma funcionalidade (por exemplo, criar paciente) espalha-se por `core/domains/patient/use-cases/create-patient/`, `adapters/controllers/api/use-cases/patient/create-patient/`, `adapters/database/repositories/patient/` e `adapters/database/mappers/`.
- Cada rota tem pasta com `controller`, `input.dto`, `output.dto`, `docs.ts` (Swagger), `nestjs-*.service.ts` e `*.e2e-spec.ts`.

**Confirmação dos problemas do ADR-0002:**
1. [FATO] Domínio importa NestJS e `class-validator`: `core/domains/patient/use-cases/create-patient/create-patient.service.ts:2` (`ConflictException`), `:3` (`class-transformer`); `core/domains/patient/entities/patient/dto.ts:1` (`class-validator`); `core/domains/patient/repositories/database-in-memory-repository.ts:1`.
2. [FATO] `new` de infraestrutura no caso de uso: `core/domains/psychologist/use-cases/create-psychologist/create-psychologist.service.ts:11`, `update-psychologist.service.ts:11` e `authenticate-psychologist.service.ts:10` (`new BcryptHasherService()`); `core/domains/patient-appointment-registry/use-cases/create-appointment-registry/create-appointment-registry.service.ts:19` e `update-appointment-registry.service.ts:10` (`new DataEncrypterService()`). **Extensão:** já existe um *fake* pronto (`/home/italoamaral/cliniccontrol/apps/core-rest-api/tests/cryptography/fake-hasher.ts`), mas ele não pode ser injetado nesses casos de uso. Além disso, as implementações bcrypt e JWT ficam dentro de `core/shared/cryptography/use-cases/`, e as portas se chamam "repository" (`core/shared/cryptography/repository/hash-generator-repository.ts`).
3. [FATO] Entidade anêmica: `core/domains/patient/entities/patient/entity.ts:7-13` (`extends PatientDto`, `Object.assign(this, props)`) e linhas 15-89 (getter e setter para cada campo, inclusive `setClinicId`, `setPsychologistId` e `setCreatedAt`).
4. [FATO] Porta recebe DTO de caso de uso: `core/domains/patient/repositories/database-repository.ts:6` (`createPatient(patient: CreatePatientInputDto)`) e `:10`.
5. [FATO] Regra e validação duplicadas:
   - a checagem de e-mail duplicado aparece três vezes: no caso de uso (`create-patient.service.ts:23-29`), no repositório Prisma (`adapters/database/repositories/patient/postgres-prisma-orm-patient-repository.ts:16-20`) e no repositório em memória (`database-in-memory-repository.ts:12-16`);
   - a validação de formato também aparece três vezes: no `ValidationPipe` global (`/home/italoamaral/cliniccontrol/apps/core-rest-api/src/main.ts:34-40`), à mão no controller (`adapters/controllers/api/use-cases/psychologist/create-psychologist/create-psychologist.controller.ts:32-37`) e no caso de uso (`create-psychologist.service.ts:19-23`).
6. [FATO] Papel e plano no usuário (global): `core/domains/psychologist/entities/psychologist/dto.ts` (campos `role` e `plan` em `PsychologistDto`).
7. [FATO] Erros como frases: `shared/errors/error-messages.ts` (`'patient already exists'` etc.).
8. [FATO] Subclasse só para `@Injectable`: `adapters/controllers/api/use-cases/patient/create-patient/nestjs-create-patient.service.ts:6-11` (o mesmo padrão em cada caso de uso).
9. [FATO] Organização por camada: ver "Estrutura" acima.

**Problemas novos (não listados no ADR-0002):**
10. [FATO] **Hash da senha na resposta.** `adapters/controllers/api/use-cases/psychologist/create-psychologist/output.dto.ts:14-15` declara `password`, e o controller devolve a entidade direto (`create-psychologist.controller.ts:39-41`). O DTO de saída é só uma anotação de tipo, sem montagem campo a campo. O mesmo acontece em `create-patient.controller.ts:25-27`.
11. [FATO] **Atribuição em massa.** O `ValidationPipe` não tem `whitelist` nem `forbidNonWhitelisted` (`main.ts:34-40`), e `role` e `plan` vêm do corpo (`adapters/controllers/api/use-cases/psychologist/create-psychologist/input.dto.ts:15-18`). Isso concretiza o risco que o ADR-0002 descreve.
12. [FATO] **Detalhes internos na resposta de erro.** `shared/errors/globalAppHttpException.ts:44-69` concatena `error.message` do Prisma e o código do erro na mensagem HTTP. Contraria a regra de devolver "só códigos" (ADR-0002, riscos).
13. [FATO] **Log com dados potencialmente pessoais e `console.log` solto.** `shared/validators/validate-or-reject.ts:10` registra o objeto de erros do `class-validator` inteiro, que inclui o valor recebido ([ESTIMATIVA]: pelo formato conhecido do `ValidationError`; não conferi a versão). Há outros `console.log` em `adapters/auth/jwt-auth.guard.ts:14`, `adapters/controllers/api/guards/api-key.guard.ts:13-24` e `adapters/database/repositories/clinic/postgres-prisma-orm-clinic-repository.ts:69,118`.
14. [FATO] **Porta maior que o uso.** `postgres-prisma-orm-clinic-repository.ts:66-71` e `:113-119` implementam métodos da porta com `throw new Error('Method not implemented.')`. **Repositório com formato de resposta:** `deleteClinic` devolve `{ deletedClinic }` tipado como `DeletedClinicOutputDto` (mesmo arquivo, cerca das linhas 93-110).
15. [FATO] **Tipos do ORM vazando e *casts* inseguros.**
    - O DTO de saída HTTP importa `PaymentMethod` de `@prisma/client` (`adapters/controllers/api/use-cases/patient/create-patient/output.dto.ts:1`).
    - O *mapper* faz `as unknown as` entre os *enums* do domínio e os do Prisma e espalha o registro cru (`adapters/database/mappers/postgresql-prisma-patient-mapper.ts:14-38`); depende de DTOs de caso de uso (linhas 8-9).
    - O acesso ao Prisma é feito por colchetes (`this.postgresqlPrismaOrmService['patient']`).
16. [FATO] **Implementações em memória no código de produção**, dentro do domínio (`core/domains/*/repositories/database-in-memory-repository.ts`), reimplementando regra de negócio (conflito de e-mail) e lançando exceção do Nest.
17. [FATO] **Fronteiras sem verificação.**
    - O lint de fronteiras é permissivo: `/home/italoamaral/cliniccontrol/.eslintrc.json` tem `depConstraints` `"*" → "*"`.
    - Há `/* eslint-disable @nx/enforce-module-boundaries */` no topo de `create-patient.service.ts:1` e de `core/domains/appointment/use-cases/create-single-appointment/create-single-appointment.service.ts:1`.
    - Não há nenhuma transação (`$transaction` não aparece no código).
18. [FATO] **Testes não determinísticos e sem ID de regra.** `create-patient.spec.ts:11-19` e `tests/factories/make-patient.ts` usam `faker` aleatório sem semente fixa; os nomes são "should …"; o teste depende de `ConflictException` do Nest.
19. [FATO] **Segredo versionado.** `/home/italoamaral/cliniccontrol/nx.json` contém um `nxCloudAccessToken` (o valor não é reproduzido aqui). Os arquivos `.env` **não** estão versionados; só `.env.example` e `apps/core-rest-api/http/.env.http.example` (`git ls-files`). Não abri nenhum `.env`.

**O que vale manter** ([FATO] existência; [ESTIMATIVA] valor):
- Um caso de uso por pasta, com o `*.spec.ts` ao lado (`core/domains/*/use-cases/*/`), que o ADR-0002 já adota.
- Porta como classe abstrata usada como *token* do Nest (`core/domains/patient/repositories/database-repository.ts` + `adapters/database/repositories/repositories.module.ts:21-41`, `provide`/`useClass`), compatível com a documentação do Nest.
- *Mapper* estático `toDomain`/`toPrismaCreate`/`toPrismaUpdate` por agregado, como ideia: o Takt deve fazer o mapeamento entidade ↔ registro, não DTO ↔ registro.
- Fábricas de teste `makeX(override)` (`tests/factories/`) e *fakes* de criptografia (`tests/cryptography/fake-hasher.ts`, `fake-encrypter.ts`), com dados fixos em vez de `faker`.
- Pasta por rota com `e2e-spec` ao lado; documentação por biblioteca em `docs/libs/`.

### Inferences
- [ESTIMATIVA] A raiz comum dos problemas 3, 4, 5, 10, 11 e 15 é **um único formato de dado reaproveitado em todas as camadas**: o DTO com decoradores serve de entrada, de entidade, de saída e de base do *mapper*. A convenção mais importante para o Takt é: **cada fronteira tem o seu tipo** (esquema Zod de entrada, comando do caso de uso, entidade, registro do Prisma, DTO de saída) e as conversões são explícitas.
- [ESTIMATIVA] Os problemas 10 a 13 e 19 merecem entrar no checklist da skill de revisão como itens de segurança, além dos nove do ADR-0002.
- [ESTIMATIVA] O problema 14 (método "não implementado") vem da porta CRUD genérica desenhada antes do uso. Isso apoia a regra "a porta só ganha um método quando um caso de uso precisa dele".

### Gaps
- Não rodei os testes nem medi a cobertura do `cliniccontrol`; a análise é só estática.
- Não verifiquei o histórico do `nx.json` para saber desde quando o *token* está versionado nem se ele ainda é válido.

## 5. Motor de simulação puro e o estilo hexagonal

### Takeaway
As fontes apoiam tratar o `@takt/sim-engine` como **núcleo funcional**: código puro que recebe valores e devolve valores, testado sem dublês. A "casca imperativa" fica fora dele (o Web Worker e a interface no `takt-web-app`). Ele não precisa de portas, adaptadores nem repositórios. A única "porta" natural é a forma de rodar (`run`, `step`/`advanceUntil`, ADR-0011), que já é uma API de valores.

### Cited Findings
- [FATO] Bernhardt, *Functional Core, Imperative Shell* (12/07/2012): o núcleo funcional é cercado por uma casca imperativa que "manipulates stdin, stdout, the database, and the network, all based on values produced by the functional core"; testar o núcleo "often naturally allows isolated testing with no test doubles"; a casca fica com "few conditionals". [Destroy All Software](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)
- [FATO] Seemann (18/03/2016): "Functional architecture tends to fall into a pit of success that looks a lot like Ports and Adapters"; "Good Functional design is equivalent to the Ports and Adapters architecture"; descreve "a big core of pure functions, and a shell of IO code". Nos comentários, admite que não é "one-size-fits-all". [Seemann, Functional architecture is Ports and Adapters](https://blog.ploeh.dk/2016/03/18/functional-architecture-is-ports-and-adapters/)
- [FATO] A intenção de Cockburn inclui ser dirigido por "automated test or batch scripts" e rodar isolado dos dispositivos. [Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [FATO] Decisões do Takt que já tornam o motor puro: sem React, Three.js, DOM ou `Math.random`; entrada única pelo `@takt/plant-schema`, compilada para um modelo interno; gerador MRG32k3a próprio; `run` e `step`/`advanceUntil(t)`; roda num Web Worker. (`/home/italoamaral/virtual-factory/docs/adr/0011-motor-de-simulacao-e-esquema.md`, itens 1, 2, 5 e 9)

### Inferences
- [ESTIMATIVA] Pela leitura de Seemann, o motor **já é** o centro de um hexágono, mas sem portas secundárias: ele não busca nada fora de si. Relógio, aleatoriedade e entrada chegam como valores (a semente e a planta compilada). Criar `ClockPort` ou `RandomPort` com injeção seria cerimônia, porque o gerador é determinístico e parte do próprio domínio.
- [ESTIMATIVA] A "casca" do motor é o código do Worker no `takt-web-app`: receber a mensagem, chamar `run`/`step`, devolver resultados. Ela deve ter poucos condicionais e nenhuma regra de simulação.
- [PALPITE] Organizar o motor por conceito (`rng/`, `distributions/`, `events/`, `model/` compilado, `stats/`, `modes/`), não por camada `domain/application/infra`. Não há infraestrutura dentro dele.
- [ESTIMATIVA] Se no futuro o motor rodar no servidor (ADR-0011, "Consequências"), o adaptador será um módulo NestJS que chama a mesma API de valores. Nada muda no motor.

### Gaps
- Não achei fonte que trate especificamente de motores de simulação por eventos discretos com arquitetura hexagonal ou "núcleo funcional". A aplicação ao motor é inferência a partir de fontes gerais.
- A frase exata "functional core, imperative shell" vem de Bernhardt; a palestra *Boundaries* (2012) só foi vista em resumos secundários, não na fonte.

## Proposta para o Takt

> Tudo abaixo é **proposta** ([ESTIMATIVA] ou [PALPITE], salvo quando cita um ADR). Ela segue os ADR-0002, 0003, 0006, 0008 e 0011. Os conflitos e lacunas estão no fim, para decisão do fundador.

### Layout por módulo (confirma o ADR-0002, com nomes de arquivo)

```
modules/plants/
  domain/
    entities/plant.ts                 raiz do agregado; plant.spec.ts ao lado
    value-objects/plant-name.ts
    services/plan-limit-policy.ts
    errors.ts
  application/
    ports/plant-repository.ts         classe abstrata (contrato + token)
    ports/plant-read-model.ts         porta de leitura (ver conflito C2)
    use-cases/publish-plant-to-group/
      publish-plant-to-group.ts       classe simples, método execute(command, ctx)
      publish-plant-to-group.spec.ts  com adaptadores em memória
    public-api.ts                     o que outros módulos podem usar
  infra/
    prisma/prisma-plant-repository.ts
    prisma/plant.mapper.ts            entidade ↔ registro do Prisma
    in-memory/in-memory-plant-repository.ts
  http/
    controllers/plants.controller.ts
    schemas/publish-plant.schema.ts   Zod de entrada e de saída
    presenters/plant.presenter.ts     entidade → DTO de saída (se não couber no controller)
  plants.module.ts                    useFactory + inject
```

### Domínio (`domain/`)
- **Entidade** ([FATO] ADR-0002; [ESTIMATIVA] detalhes):
  - estado privado; construtor privado;
  - duas fábricas estáticas: `create(...)` valida as invariantes e devolve a entidade ou um erro de domínio; `restore(snapshot)` reidrata do banco, sem revalidar regra de criação nem gerar eventos;
  - métodos com nome de negócio (`publishTo`, `rename`), sem *setter*;
  - leitura por *getters* só onde alguém lê.
- **Raiz de agregado** é a única com repositório ([FATO] Fowler, Microsoft). Outros agregados são referenciados por **ID** ([FATO] Vernon); `organizationId` é um ID na entidade.
- **Objeto de valor** quando houver regra de formato ou de igualdade (`PlantName`, `GroupCode`). Um `string` simples sem regra não vira objeto de valor.
- **Serviço de domínio** só para regra que envolve mais de uma entidade e não pertence a nenhuma (`PlanLimitPolicy`). Recebe os dados prontos, sem portas, e é puro.
- **Erros:** classes com `code` da tabela de regras ([FATO] ADR-0002, takt-core-api.md). Sem mensagem em frase. Sem `HttpStatus`.
- **Sem dependências externas:** nem `@nestjs/*`, `@prisma/*`, `zod`, nem `crypto` do Node. ID e hora vêm de fora (porta `IdGenerator`/`Clock` na aplicação, ou passados como argumento).
- **Testes:** TDD, um teste por invariante, com o ID `RN-...` no nome; sem *mocks*.

### Aplicação (`application/`)
- **Caso de uso** = classe simples com um método público `execute(command, ctx)` ([FATO] ADR-0002: sem `@Injectable`, montado com `useFactory`). O `command` é um tipo TypeScript simples, sem decoradores e sem Zod; o `ctx` traz `organizationId`, `userId` e `role` vindos do contexto da requisição, nunca do corpo ([FATO] ADR-0008).
- **Roteiro fixo e fino** ([FATO] Evans via Fowler: "only coordinates tasks"): carregar pela porta → chamar o método do domínio → salvar pela porta → auditar se for sensível → devolver a **entidade** ou um resultado simples. Nenhum `if` de regra de negócio no caso de uso; se aparecer, a regra vai para a entidade ou para o serviço de domínio.
- **Retorno:** o caso de uso devolve entidade ou tipo de aplicação. Nunca um DTO HTTP e nunca um registro do Prisma.
- **Porta de repositório** (classe abstrata em `application/ports/`):
  - uma por raiz de agregado;
  - nome do agregado + `Repository`;
  - métodos de coleção: `findById(id)`, `save(entity)` e buscas com nome de negócio (`findByGroupCode`);
  - **um método só entra quando um caso de uso precisa dele** (ver cliniccontrol, problema 14);
  - sem `update(dto)`, sem `findAll()` genérico, sem `organizationId` como parâmetro (o RLS e o contexto filtram, ADR-0003);
  - recebe e devolve entidades ([FATO] ADR-0002).
- **Outras portas:** só para **efeito colateral ou não determinismo** (`Clock`, `IdGenerator`, `AuditLog`, `SessionReader`, `TransactionRunner`). Pelo critério de Cockburn, cada uma é uma conversa com o mundo de fora e tem duas implementações (real e em memória).
- **Transação** ([ESTIMATIVA], ver conflito C1): uma porta `TransactionRunner.run(ctx, fn)` em `application/ports`. O caso de uso que grava mais de uma coisa, ou que checa limite de plano (ADR-0006), roda dentro dela. A implementação em `shared/database` abre a transação interativa, executa `set_config('app.current_org_id', …, true)` primeiro e guarda o `tx` no CLS para os repositórios. Uma transação nunca cruza dois agregados que poderiam ser salvos separadamente ([FATO] Fowler); a exceção é a auditoria e o limite do plano, por exigência do ADR-0006.
- **Testes:** cada caso de uso com adaptadores em memória ([FATO] ADR-0002, ADR-0009); dados fixos e fábricas `makePlant(overrides)`; sem `faker` aleatório.

### Infraestrutura (`infra/`)
- **Repositório Prisma:**
  - implementa a porta;
  - usa o cliente transacional do contexto (`txHost.tx` ou o `tx` do CLS), nunca um cliente global;
  - não tem regra de negócio (sem checagem de duplicado: isso é `UNIQUE` no banco + tradução do erro de violação para erro de domínio dentro do adaptador);
  - nada de `@prisma/client` sai do arquivo.
- ***Mapper*:** funções puras `toDomain(record): Plant` (usa `Plant.restore`) e `toPersistence(plant)`, no mesmo arquivo ou ao lado do repositório. *Enums* convertidos por tabela explícita, sem `as unknown as`.
- **Em memória:**
  - em `infra/in-memory/`, fora do domínio;
  - guarda cópias (*snapshot*), para o teste não depender de mutação compartilhada;
  - **não reimplementa regra de negócio**; reproduz só as restrições do banco que o caso de uso precisa observar (unicidade), lançando o **mesmo** erro de domínio que o adaptador Prisma traduz.
- **Teste de contrato** ([PALPITE]): uma suíte por porta, rodada contra a implementação em memória (unitária) e contra a Prisma (integração, banco por *worker*, ADR-0009). Garante que as duas se comportam igual.
- **Leitura** (ver conflito C2): consultas de listagem e tela podem usar um *read model* em `infra/prisma/` que devolve DTO de leitura direto, sem passar pela entidade ([FATO] Microsoft, Sairyss), **sempre** pelo cliente com contexto de RLS.

### HTTP (`http/`)
- **Controller fino:**
  1. recebe a entrada já validada pelo *pipe* Zod em modo estrito ([FATO] ADR-0008);
  2. monta o `command` e o `ctx` (organização e usuário do contexto, nunca do corpo);
  3. chama o caso de uso;
  4. monta o **DTO de saída campo a campo** ([FATO] ADR-0008) e o valida contra o esquema de saída nos testes.
- **Um esquema Zod por rota** para entrada e saída, em `http/schemas/`; o tipo TypeScript vem de `z.infer`. Esses tipos não saem de `http/`.
- **Erros:** o filtro global traduz `DomainError.code` → status HTTP; o controller não tem `try/catch` (o contrário do `GlobalAppHttpException` do cliniccontrol).
- **Cada rota** tem `@RequirePermission` ou `@Public()` ([FATO] ADR-0006).
- **Teste de API** (`*.e2e-spec.ts`): matriz papel × rota, campo desconhecido → `VALIDATION_ERROR`, resposta sem campos internos.

### Montagem (`*.module.ts`)
- Portas resolvidas por classe abstrata (`provide: PlantRepository, useClass: PrismaPlantRepository`); casos de uso por `useFactory` com `inject: [PlantRepository, Clock, …]` ([FATO] documentação do Nest).
- Se for usado tsx ou esbuild (o Prisma 8 alerta que eles ignoram `emitDecoratorMetadata`), usar `@Inject(Token)` explícito em todo construtor de adaptador ([FATO] blog do Prisma).

### Entre módulos
- Um módulo só importa o `application/public-api.ts` de outro ([FATO] ADR-0002; [FATO] Sairyss: fachada pública). Nunca o `domain`, a `infra` nem as tabelas do outro.
- A `public-api` expõe casos de uso ou portas de consulta que devolvem tipos próprios da fronteira (ID e campos), não as entidades internas.
- Eventos entre módulos só quando houver necessidade de consistência eventual ([FATO] Vernon). [PALPITE] No MVP, chamada síncrona à `public-api` basta.

### Motor (`@takt/sim-engine`)
- Núcleo funcional ([FATO] Bernhardt, Seemann): entrada = planta compilada + semente + modo; saída = valores (indicadores, séries, estado final, log). Sem portas, adaptadores, injeção, classes de serviço nem `shared/` de infraestrutura.
- Estado mutável é permitido **dentro** de uma execução (*heap* de eventos, estações), por desempenho, mas não escapa: `run` é uma função determinística do ponto de vista de quem chama ([FATO] ADR-0011: determinismo testado).
- A casca imperativa (Worker, mensagens, cancelamento, progresso) fica no `takt-web-app`, com poucos condicionais.
- Pastas por conceito, não por camada ([PALPITE]).

### Quando não aplicar o padrão (com critério)

| Situação | Não fazer | Fazer | Critério |
| --- | --- | --- | --- |
| Código puro e determinístico (cálculo, política, formatação) | Porta + adaptador | Função ou serviço de domínio chamado direto | Só existe porta se houver efeito colateral, E/S ou não determinismo (Cockburn: a porta é uma conversa com o mundo de fora) |
| Dependência que nunca terá segunda implementação **nem** precisa de dublê no teste (por exemplo, a biblioteca de *hash* de ID) | Porta | Chamada direta, dentro de `infra/` ou `shared/` | Seemann: interface 1:1 é cheiro de código. Se o teste não precisa trocá-la, não há segunda implementação |
| Leitura para tela ou listagem, sem regra de negócio | Carregar entidade pelo repositório e mapear para DTO | *Read model*/consulta direta em `infra/`, devolvendo DTO de leitura (com RLS) | Microsoft, Sairyss: a leitura não muda estado nem precisa de invariantes. **Depende do conflito C2** |
| Formatos idênticos (registro do Prisma = DTO de leitura) | *Mapper* em várias etapas | *Select* do Prisma já no formato do DTO, num lugar só | O *mapper* só existe quando os formatos diferem ou quando a fronteira esconde um tipo do ORM (entidade ↔ registro sempre: ADR-0002) |
| Tabela de catálogo só de leitura (`plans`) | Repositório com `save` | Porta de leitura pequena ou configuração em código (RN-PLA-003) | Repositório é para raiz de agregado que muda (Fowler, Vernon) |
| Entidade filha do agregado (por exemplo, membros de um grupo) | Repositório próprio | Carregada e salva pela raiz | Microsoft: "never create a repository for each table" |
| Caso de uso que é só leitura de um item com autorização do guard | Caso de uso + porta + repositório + *mapper* | Consulta de leitura chamada pelo controller | Evans via Fowler: a aplicação coordena; sem coordenação, não há caso de uso. Revisar no fim do marco 4 (ADR-0002) |
| Operações transversais (log, *tracing*, RLS, autorização) | Porta em cada módulo | `shared/` uma vez | ADR-0002: transversal fica em `shared/` |
| Motor de simulação | Camadas `domain/application/infra`, portas e injeção | Núcleo funcional com API de valores | Bernhardt e Seemann; ADR-0011 |
| Método de repositório "para o futuro" | Declarar na porta | Só quando um caso de uso usa | cliniccontrol, problema 14 (`Method not implemented.`) |
| Regra que precisa de várias entidades no mesmo instante e dentro de uma transação (limite do plano) | Dividir em eventos ou consistência eventual | Serviço de domínio + `TransactionRunner` | ADR-0006 exige checar dentro da transação; Vernon aceita quebrar regras quando há motivo |

### Conflitos e lacunas para decisão do fundador
- **C1. Prisma e RLS (ADR-0003, item 4; versão em aberto).** "Extensão do cliente que envolve cada operação numa transação" é o padrão do exemplo oficial (Prisma 7 + `$extends`). O próprio Prisma diz que o exemplo não é para produção, e ele conflita com transações explícitas, que o ADR-0006 exige para o limite do plano. Além disso, o Prisma 8 (RC, GA prevista para outubro de 2026) **não tem `$extends`** e usa *middleware* e `db.transaction`. Sugestão: novo ADR antes do marco 4 que (a) fixe a versão do Prisma; (b) troque "transação por operação" por "transação interativa por caso de uso, com `set_config` no início e `tx` propagado pelo CLS"; (c) diga se usa `@nestjs-cls/transactional` (verificar suporte ao Prisma 8) ou uma implementação própria.
- **C2. Portas de leitura × "Portas recebem e devolvem entidades, nunca DTOs" (ADR-0002).** O texto aceito proíbe literalmente um *read model* que devolve DTO de leitura. As fontes (Microsoft, Sairyss) recomendam leitura direta. Opções: manter a regra e sempre passar pela entidade (mais arquivos), ou registrar num ADR novo que "porta de leitura devolve tipo de leitura da aplicação, não DTO HTTP". Não decidi; ADR aceito não se edita.
- **C3. `@Transactional()` é decorador do Nest.** Não pode ficar no caso de uso, que fica em `application/` sem `@nestjs/*`. Daí a porta `TransactionRunner` proposta acima.
- **C4. Onde fica a porta.** O ADR-0002 a põe em `application/ports`; a Microsoft põe as interfaces de repositório no modelo de domínio. O ADR prevalece; a diferença não muda a regra de dependência.
- **C5. `Result` × exceções** continua em aberto (ADR-0002). Esta pesquisa não cobriu o tema; a proposta acima funciona com os dois.
- **C6. Itens para o checklist da skill de revisão**, vindos do cliniccontrol (problemas 10 a 19):
  - DTO de saída montado campo a campo;
  - modo estrito na entrada;
  - nenhum detalhe do ORM na resposta de erro;
  - nenhum `console.log`;
  - porta sem método não usado;
  - nenhum tipo `@prisma/client` fora de `infra/` e `shared/database`;
  - em memória fora do domínio;
  - nenhum `eslint-disable` de fronteira;
  - testes com dados fixos;
  - nenhum *token* em arquivo de configuração versionado.
