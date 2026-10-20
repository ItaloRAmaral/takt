# ADR-0006: Autorização por organização, papel e plano

| Campo | Valor |
| --- | --- |
| Status | Proposto |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api` (`shared/authz` e módulos) |

## Contexto

As decisões de produto definem que o papel vale por organização ([PDR-0009](../pdr/0009-acesso-no-mvp.md)), que papel e plano são coisas diferentes ([PDR-0010](../pdr/0010-papel-diferente-de-plano.md)) e que o papel mais alto herda os mais baixos ([PDR-0019](../pdr/0019-hierarquia-de-papeis.md)). Falta definir como isso é implementado e garantido.

## Decisão

### Ordem das checagens em toda rota

1. **Autenticação:** a porta `SessionReader` devolve o usuário ([ADR-0004](0004-autenticacao-com-better-auth.md)). Sem sessão: 401.
2. **Organização:** vem da rota (`/orgs/:orgId/...`). Sem associação, a resposta é `NOT_FOUND` (404), igual à de uma organização inexistente (RN-ACE-004).
3. **Contexto:** organização, usuário e papel vão para o contexto da requisição, que alimenta o RLS ([ADR-0003](0003-postgresql-prisma-e-rls.md)) e o log ([ADR-0007](0007-observabilidade-log-canonico-e-tracing.md)).
4. **Permissão:** o papel tem a permissão exigida pela rota? Senão, `FORBIDDEN`.
5. **Plano:** a organização tem o recurso e está dentro do limite? Senão, `PLAN_FEATURE_UNAVAILABLE` ou `PLAN_LIMIT` (RN-PLA-002).
6. **Recurso:** o caso de uso confere regras do próprio recurso (por exemplo, o aprendiz só exporta o que criou, RN-JSN-003).

Os passos 1 a 5 ficam num **guard único** em `shared/authz`. O passo 6 fica no domínio.

### Permissões e papéis

- **Permissões** no formato `resource:action`, em inglês: `plant:create`, `plant:publish`, `plant:export`, `group:manage`, `member:manage`...
- **Papéis** em código: `admin` > `instructor` > `learner`. Cada papel herda as permissões do anterior (RN-ACE-006).
- **O mapa papel → permissões fica no código** (constante tipada), não no banco. Papéis personalizados por cliente não estão no escopo.
- **Cada rota declara a permissão** com um decorador: `@RequirePermission('plant:publish')`. Uma rota sem permissão declarada e sem `@Public()` falha no início da aplicação.

### Plano

- O plano de cada organização é lido do banco; os limites e recursos de cada plano ficam em configuração (RN-PLA-003).
- **Checagem de limite dentro da transação** que cria o recurso, para dois pedidos simultâneos não passarem do limite juntos.

### Erros

- Os erros são códigos ([rules/README.md](../product/rules/README.md#códigos-de-erro)); a interface traduz.
- `PLAN_LIMIT` informa qual limite, o valor atual e o máximo (RN-PLA-004).

## Alternativas consideradas

- **Checagens espalhadas por cada controller:** fácil de esquecer uma; descartado.
- **Biblioteca de autorização (CASL e similares):** poderosa para regras por atributo; desnecessária para um mapa fixo de papéis no MVP.
- **Papéis e permissões no banco:** flexível, mas sem necessidade enquanto não houver papéis personalizados.
- **403 para organização alheia:** revela que a organização existe; descartado.

## Consequências

**Positivas:**
- Uma única porta de entrada para autorização, fácil de revisar e testar.
- Papéis e permissões tipados: um erro de digitação não compila.

**Negativas e custos:**
- O analista (fase futura) não cabe na hierarquia linear; quando ele entrar, o mapa vira conjuntos de permissões por papel, com um ADR novo.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **IDOR** (trocar o ID na URL para acessar recurso alheio) | Acesso a plantas, grupos e membros de outros | Todo recurso é buscado com a organização do contexto; RLS como segunda camada; teste por rota |
| **Rota sem permissão declarada** | Ação liberada para qualquer usuário logado | A aplicação não sobe se faltar `@RequirePermission` ou `@Public()` |
| **Escalada de privilégio** (alguém se promove ou promove outro acima do próprio papel) | Controle indevido da organização | Só o `admin` altera papéis; ninguém atribui papel acima do próprio; a organização nunca fica sem administrador |
| **Força bruta no código do grupo** | Entrada indevida em grupos | Códigos com entropia suficiente, limite de tentativas, regeneração e desativação (RN-GRP-004) |
| **Corrida no limite do plano** | Limite ultrapassado | Checagem dentro da transação de criação |
| **Enumeração de organizações** | Descobrir quais organizações existem | Organização alheia responde como inexistente (`NOT_FOUND`) |

## Conformidade

- **Matriz de testes papel × rota:** toda rota é testada com cada papel e sem sessão, e o resultado esperado fica numa tabela no próprio teste.
- **Teste de inicialização:** a aplicação não sobe se uma rota não declarar permissão nem `@Public()`.
- **Teste de herança:** o `admin` consegue tudo o que o `instructor` consegue, e o `instructor`, tudo o que o `learner` consegue.
- **Teste de concorrência do limite do plano.**

## Relacionados

- [PDR-0009](../pdr/0009-acesso-no-mvp.md), [PDR-0010](../pdr/0010-papel-diferente-de-plano.md), [PDR-0019](../pdr/0019-hierarquia-de-papeis.md).
- Regras: [access.md](../product/rules/access.md), [plans.md](../product/rules/plans.md).

## Em aberto

- Lista completa de permissões, definida com os casos de uso de cada marco.
