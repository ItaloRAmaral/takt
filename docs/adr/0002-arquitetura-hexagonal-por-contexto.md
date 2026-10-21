# ADR-0002: Arquitetura hexagonal com módulos por contexto na takt-core-api

| Campo | Valor |
| --- | --- |
| Status | Aceito (experimental: revisar ao fim do marco 4) |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api` |

## Contexto

A API concentra regras de negócio sensíveis (papéis por organização, planos, isolamento entre organizações, plantas reais) e precisa ser testável sem banco nem framework. O projeto também é portfólio: a arquitetura deve ser legível e defensável numa entrevista.

O projeto anterior do fundador (`cliniccontrol`) já usava separação `core/` × `adapters/`, repositórios como portas com implementação em memória para testes, mappers e um caso de uso por pasta. A revisão desse código mostrou problemas a não repetir:

1. o domínio importava o NestJS (`ConflictException`) e `class-validator`;
2. casos de uso instanciavam dependências diretamente (`new BcryptHasherService()`), apesar de existir a porta;
3. entidades anêmicas: estendiam o DTO, recebiam tudo por `Object.assign` e tinham *getter* e *setter* para cada campo, sem proteger regras;
4. portas de repositório recebiam DTOs de caso de uso, e não entidades;
5. regras e validações duplicadas (no caso de uso e no repositório; no controller e no caso de uso);
6. papel e plano no usuário, ou seja, globais;
7. erros devolvidos como frases, não códigos;
8. uma classe extra por caso de uso só para aplicar `@Injectable`;
9. organização por camada: uma funcionalidade espalhada em três árvores de pastas.

## Decisão

### Módulos por contexto (fatias verticais)

```
apps/takt-core-api/src/
  modules/
    identity/          contas e sessões (Better Auth, ADR-0004)
    organizations/     organizações, associações, papéis, planos
    groups/            grupos e códigos de entrada
    plants/            registro, publicação, cópia, importação e exportação de plantas
    audit/             registro de ações sensíveis
  shared/
    kernel/            tipos-base: Result, DomainError, identificadores
    authz/             guard de autorização (ADR-0006)
    database/          cliente Prisma, contexto de RLS (ADR-0003)
    observability/     contexto por requisição, log canônico, tracing (ADR-0007)
  main.ts
```

### Camadas dentro de cada módulo

```
modules/plants/
  domain/
    entities/          entidades com comportamento e invariantes
    value-objects/
    services/          serviços de domínio (regras entre várias entidades)
    errors.ts          erros de domínio, cada um com um código
  application/
    use-cases/         um caso de uso por pasta, com o teste ao lado
    ports/             interfaces: repositórios, Clock, AuditLog, StepRecorder
  infra/
    prisma/            implementações das portas e mappers
    in-memory/         implementações em memória para testes
  http/
    controllers/       rotas, validação com Zod, tradução de erro para código
  plants.module.ts     montagem no NestJS (providers com factory)
```

### Regra de dependência

`http` → `application` → `domain`, e `infra` → `application` (implementa portas). **O domínio não importa nada de fora** (nem NestJS, nem Prisma, nem Zod). A aplicação só conhece o domínio e as próprias portas.

### Onde fica cada tipo de "service"

| Tipo | Lugar | Exemplo |
| --- | --- | --- |
| Caso de uso | `application/use-cases/` | `PublishPlantToGroup` |
| Serviço de domínio | `domain/services/` | `PlanLimitPolicy` |
| Serviço de infraestrutura | porta em `application/ports/`, implementação em `infra/` | `Clock`, `EmailSender`, `AuditLog` |
| Transversal | `shared/` | log, tracing, RLS, autorização |

### Práticas (correções em relação ao `cliniccontrol`)

- **Entidades ricas:** estado privado, criação por *factory* que valida invariantes, métodos com nome de negócio (`plant.publishTo(group)` recusa planta real, conforme RN-PLT-002). Sem *setter* genérico.
- **Portas recebem e devolvem entidades**, nunca DTOs.
- **Dependências injetadas** pelas portas; nada de `new` de infraestrutura dentro de caso de uso.
- **Validação de entrada uma única vez**, na borda HTTP, com Zod. Regras de negócio, uma única vez, no domínio.
- **Erros de domínio com código** (`PLAN_LIMIT`, `FORBIDDEN`...), traduzidos para HTTP só na camada `http` (RN-I18-004).
- **Casos de uso são classes simples**, registradas no módulo do Nest com `useFactory`, sem subclasse só para `@Injectable`.
- **Comunicação entre módulos** só pela aplicação pública do outro módulo (um caso de uso ou uma porta exposta), nunca pelo banco ou pelas entidades internas dele.

## Alternativas consideradas

- **Organização por camada** (como no `cliniccontrol`): uma funcionalidade fica espalhada em várias árvores; descartada para experimentar a organização por contexto.
- **NestJS "padrão"** (services com Prisma direto): mais rápido no início, mas mistura regra de negócio e banco e dificulta testes sem banco.
- **Um projeto Nx por contexto** (`libs/plants-domain`...): fronteiras ainda mais fortes, porém muita configuração para o tamanho do MVP.

## Consequências

**Positivas:**
- Casos de uso testáveis em milissegundos, com repositórios em memória.
- Cada funcionalidade fica numa pasta só.
- Trocar o ORM ou a autenticação afeta apenas `infra/`.

**Negativas e custos:**
- Mais arquivos e mappers do que um NestJS "padrão".
- Risco de cerimônia excessiva em fluxos simples (CRUD). Mitigação: revisão ao fim do marco 4.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Atribuição em massa** (o cliente envia campos que não deveria, como `role` ou `organizationId`). O `Object.assign` do `cliniccontrol` é exatamente esse risco | Escalada de privilégio, troca de dono de recurso | Validação com Zod em modo estrito (campo desconhecido é recusado); entidades sem *setter* genérico; `organizationId` e usuário vêm sempre do contexto da requisição, nunca do corpo |
| **Regra de segurança só no controller** | Outra rota ou outro módulo contorna a regra | Invariantes no domínio (por exemplo, `plant.publishTo` recusa planta real); um módulo só fala com outro pela aplicação pública dele |
| **Vazamento de detalhes internos em erros** | Exposição de estrutura do banco, caminhos, pilhas | Só códigos de erro na resposta; detalhes só no log interno |
| **Caso de uso chamado sem passar pelo guard** (por exemplo, por uma tarefa agendada) | Ação sem autorização | Tarefas internas usam um contexto explícito de sistema, registrado no log; nenhum caso de uso assume contexto implícito |

## Conformidade

- Lint de fronteiras dentro da API com **eslint-plugin-boundaries** (roda no mesmo ESLint do Nx, sem ferramenta extra): `domain` não importa `application`, `infra`, `http`, `@nestjs/*`, `@prisma/*` nem `zod`; `application` não importa `infra` nem `http`; um módulo não importa o `domain` ou a `infra` de outro.
- Revisão de código com checklist (a skill de revisão vai cobrar estes pontos).
- Todo caso de uso tem teste unitário com adaptadores em memória; o nome do teste cita o ID da regra (`RN-PLT-002: ...`).

## Relacionados

- [ADR-0001](0001-monorepo-nx-e-nomes.md), [ADR-0003](0003-postgresql-prisma-e-rls.md), [ADR-0004](0004-autenticacao-com-better-auth.md), [ADR-0006](0006-autorizacao-por-organizacao.md), [ADR-0007](0007-observabilidade-log-canonico-e-tracing.md).
- Regras: [docs/product/rules/](../product/rules/README.md).

## Em aberto

- Formato do `Result` (retorno de erro tipado) × exceções de domínio.
