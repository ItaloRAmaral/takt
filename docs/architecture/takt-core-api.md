# takt-core-api

> **Resumo.** API NestJS com arquitetura hexagonal e módulos por contexto. Cada requisição passa por validação (Zod), autorização num guard único (sessão → organização → permissão → plano), caso de uso, banco com RLS e termina numa linha de log canônica. O domínio não conhece framework nem banco.

Atualizado em 20/10/2026 · Decisões: [ADR-0001](../adr/0001-monorepo-nx-e-nomes.md) a [ADR-0008](../adr/0008-validacao-de-dados.md).

## Responsabilidades

**Faz:** contas e sessões; organizações, associações, papéis e planos; grupos e códigos de entrada; registro, publicação, cópia, importação e exportação de plantas; auditoria de ações sensíveis.

**Não faz:** simular (o motor roda no navegador); renderizar interface.

## Estrutura

```
apps/takt-core-api/src/
  modules/
    identity/          contas e sessões (Better Auth)                 ADR-0004, 0005
    organizations/     organizações, associações, papéis, planos      ADR-0006
    groups/            grupos e códigos de entrada
    plants/            registro, publicação, cópia, importação, exportação
    audit/             registro de ações sensíveis
  shared/
    kernel/            Result, DomainError, identificadores
    authz/             guard, decoradores, mapa papel → permissões   ADR-0006
    database/          cliente Prisma, extensão de RLS               ADR-0003
    observability/     contexto por requisição, log canônico, tracing ADR-0007
    validation/        pipe Zod, tradução de erros                   ADR-0008
    config/            variáveis de ambiente validadas com Zod
  main.ts
```

Cada módulo:

```
modules/plants/
  domain/
    entities/          entidades com comportamento e invariantes
    value-objects/
    services/          regras entre várias entidades (ex.: PlanLimitPolicy)
    errors.ts          erros de domínio, cada um com um código
  application/
    use-cases/         um caso de uso por pasta, teste ao lado
    ports/             PlantRepository, AuditLog, Clock, StepRecorder
  infra/
    prisma/            implementações das portas e mappers
    in-memory/         implementações para testes
  http/
    controllers/       rotas, esquemas Zod de entrada e saída
  plants.module.ts     montagem (providers com useFactory)
```

## Camadas e dependências

```
http ──► application ──► domain
infra ──► application (implementa as portas)
```

- **domain:** não importa nada de fora (nem `@nestjs/*`, `@prisma/*`, `zod`).
- **application:** conhece o domínio e as próprias portas.
- **infra e http:** conhecem tudo, mas nunca a `infra` de outro módulo.
- **Entre módulos:** só pela aplicação pública do outro (um caso de uso ou porta exposta).

Verificado pelo eslint-plugin-boundaries ([ADR-0002](../adr/0002-arquitetura-hexagonal-por-contexto.md)).

| Tipo de "service" | Onde |
| --- | --- |
| Caso de uso | `application/use-cases/` |
| Serviço de domínio | `domain/services/` |
| Serviço de infraestrutura | porta em `application/ports/`, implementação em `infra/` |
| Transversal | `shared/` |

## Caminho de uma requisição

Exemplo: `POST /orgs/:orgId/plants/:plantId/publish`.

1. **Proxy:** o `takt-web-app` repassa `/api/...` para a API ([ADR-0005](../adr/0005-sessao-no-banco-com-cookie.md)).
2. **Contexto:** o interceptor de observabilidade cria o contexto da requisição (`requestId`, início, rota, módulo).
3. **Validação:** o pipe Zod valida parâmetros, *query* e corpo em modo estrito. Falha → `VALIDATION_ERROR`.
4. **Guard de autorização** ([ADR-0006](../adr/0006-autorizacao-por-organizacao.md)):
   1. sessão (`SessionReader`). Falha → 401;
   2. associação com `orgId`. Falha → `NOT_FOUND`;
   3. permissão da rota (`@RequirePermission('plant:publish')`). Falha → `FORBIDDEN`;
   4. plano. Falha → `PLAN_FEATURE_UNAVAILABLE` ou `PLAN_LIMIT`;
   5. usuário, organização e papel gravados no contexto. Cada passo vira um item em `steps`.
5. **Controller:** converte a entrada validada em comando e chama o caso de uso.
6. **Caso de uso:** carrega entidades pelas portas, chama o comportamento do domínio (`plant.publishTo(group)`), persiste, registra auditoria quando a ação é sensível.
7. **Repositório:** a extensão do Prisma abre transação com `set_config('app.current_org_id', ..., true)`; o RLS filtra as linhas ([ADR-0003](../adr/0003-postgresql-prisma-e-rls.md)).
8. **Resposta:** o controller monta o DTO de saída campo a campo.
9. **Erros:** o filtro de exceções traduz erros de domínio em HTTP + código.
10. **Log canônico:** o interceptor grava uma linha JSON com status, código, duração e `steps` ([ADR-0007](../adr/0007-observabilidade-log-canonico-e-tracing.md)).

## Erros

Os códigos ficam na [tabela das regras](../product/rules/README.md#códigos-de-erro). O domínio lança erros com código; só a camada `http` conhece o status HTTP.

```ts
// domain/errors.ts
export class RealPlantNotPublishableError extends DomainError {
  readonly code = 'FORBIDDEN';
}
```

Resposta de erro:

```json
{ "code": "PLAN_LIMIT", "details": { "limit": "didacticPlants", "current": 10, "max": 10 }, "requestId": "01JB..." }
```

O `requestId` aparece na resposta para cruzar com o log.

**Em aberto:** `Result` tipado × exceções de domínio.

## Validação

Resumo do [ADR-0008](../adr/0008-validacao-de-dados.md):

| Camada | Ferramenta |
| --- | --- |
| Entrada HTTP | Zod, modo estrito, uma vez só, na borda |
| Regra de negócio | Domínio |
| Documento da planta | `@takt/plant-schema`: Zod (estrutural) + funções puras (semântica) |
| Banco | NOT NULL, FK, UNIQUE, CHECK |
| Ambiente | Zod na inicialização |

A saída de cada rota também tem esquema, validado nos testes.

## Autenticação e sessão

- Better Auth no módulo `identity`, atrás da porta `SessionReader` ([ADR-0004](../adr/0004-autenticacao-com-better-auth.md)).
- E-mail e senha, senhas com Argon2id.
- Sessão no banco; cookie `HttpOnly`, `Secure`, `SameSite=Lax`; 7 dias sem uso (1 dia nas contas demo); renovação no máximo uma vez por dia ([ADR-0005](../adr/0005-sessao-no-banco-com-cookie.md)).
- O cadastro cria a organização pessoal e a associação de administrador na mesma operação.

## Autorização

- Papéis: `admin` > `instructor` > `learner`, com herança.
- Permissões `resource:action`, num mapa tipado no código.
- Rota sem `@RequirePermission` nem `@Public()` impede a aplicação de subir.
- Limites do plano checados dentro da transação de criação.

## Banco

**Usuários:** `takt_migrator` (dono, só migrações) e `takt_app` (API, sem `BYPASSRLS`).

**Tabelas iniciais (proposta, a detalhar no marco 4):**

| Tabela | Organização? | RLS |
| --- | --- | --- |
| `users`, `sessions`, `accounts`, `verifications` (Better Auth) | Não | Não; acesso só pelo módulo `identity` |
| `organizations` | É a própria | Acesso pelo módulo `organizations` |
| `memberships` | Sim | Sim |
| `plans` | Não (catálogo) | Não; só leitura |
| `subscriptions` | Sim | Sim |
| `groups`, `group_members` | Sim | Sim |
| `plants` (registro + documento em JSONB) | Sim | Sim |
| `plant_publications` | Sim | Sim |
| `audit_events` | Sim | Sim |

**Isolamento:** organização no banco (RLS) e na aplicação; visibilidade por grupo só na aplicação ([ADR-0003](../adr/0003-postgresql-prisma-e-rls.md)).

## Observabilidade

- `nestjs-cls` guarda o contexto; `steps.run(nome, fn)` mede, registra o passo e abre um *span*.
- Passos automáticos no guard e nos repositórios; manuais nas decisões de negócio.
- Uma linha JSON por requisição (pino, stdout); campos por lista de permitidos; no máximo 50 passos.
- Desenvolvimento: Jaeger local no `docker-compose`.

## Segurança

Cada ADR tem a sua tabela de riscos. Os controles que atravessam o serviço:

| Controle | Onde |
| --- | --- |
| Validação estrita de entrada | `shared/validation` |
| Autorização centralizada e obrigatória | `shared/authz` |
| RLS por organização | `shared/database` + migrações |
| Erros sem detalhes internos | Filtro de exceções |
| Log sem dados pessoais | `shared/observability` |
| Auditoria de ações sensíveis | Módulo `audit` |
| Segredos só em variáveis de ambiente validadas | `shared/config` |

**Em aberto:** análise de segurança dedicada.

## Testes

Ver [ADR-0009](../adr/0009-estrategia-de-testes.md).

| Nível | O que cobre | Onde |
| --- | --- | --- |
| Unitário | Entidades e casos de uso, com repositórios em memória | Ao lado do código (`*.spec.ts`) |
| Integração | Repositórios Prisma, RLS, isolamento, catálogo de políticas | Um banco por *worker*, clonado do modelo migrado |
| API | Matriz papel × rota, validação, formato de erro, log canônico | `*.e2e-spec.ts` |

Padrões: AAA separado por linhas em branco, um único "Act", sem lógica no teste, ID da regra no nome. Cobertura mínima de 90% (linhas e ramificações); mutação mínima de 80% no domínio.

## Em aberto

- `Result` × exceções de domínio.
- Biblioteca de integração Zod + NestJS + OpenAPI.
- Tabelas finais (marco 4).
- Limites de elementos e conexões por planta.
- Hospedagem, coleta de logs e destino dos *traces*.
