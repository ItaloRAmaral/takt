# ADR-0003: PostgreSQL, Prisma e Row-Level Security

| Campo | Valor |
| --- | --- |
| Status | Aceito |
| Data | 20/10/2026 |
| Relator | Italo |
| Aprovadores | Italo |
| Escopo | `takt-core-api` |

## Contexto

O Takt é multiempresa: universidades e empresas no mesmo banco, com dados de alunos (LGPD) e, no futuro, plantas reais confidenciais. Um filtro `organizationId` esquecido numa consulta vaza dados entre organizações. Decidiu-se ter isolamento também no banco, como segunda camada, desde a primeira migração ([PDR-0009](../pdr/0009-acesso-no-mvp.md)).

**Fato:** no PostgreSQL, o RLS aplica políticas por linha com base em variáveis da sessão do banco. Cada requisição precisa informar a organização atual dentro de uma transação, e a aplicação não pode se conectar com um usuário que ignora o RLS (superusuário ou `BYPASSRLS`).

**Escolha do banco.** O RLS no MVP restringe as opções:

| Banco | RLS nativo | Relacional | JSON | Observação |
| --- | --- | --- | --- | --- |
| PostgreSQL | Sim | Sim | JSONB, indexável | Livre; suportado pelo Prisma; oferecido pelos principais provedores de nuvem |
| MySQL | Não | Sim | JSON mais limitado | O isolamento ficaria só na aplicação |
| SQL Server | Sim | Sim | Limitado | Licença paga |
| MongoDB | Não | Sem chaves entre coleções | Nativo | Organizações, associações e papéis são dados relacionais |

**Fato:** entre os bancos livres e comuns, só o PostgreSQL tem RLS nativo. O JSONB também serve para guardar o documento da planta.

O fundador tem experiência com Prisma. **Estimativa:** o Prisma é o ORM TypeScript mais consolidado; o Drizzle convive melhor com RLS (políticas declaradas no esquema).

## Decisão

1. **PostgreSQL** como banco.
2. **Prisma** como ORM, usado **só dentro de `infra/`** ([ADR-0002](0002-arquitetura-hexagonal-por-contexto.md)).
3. **RLS em toda tabela com dados de organização**, desde a primeira migração:
   - toda tabela de negócio tem `organization_id`;
   - `ENABLE` e `FORCE ROW LEVEL SECURITY`;
   - política: a linha só é visível se `organization_id = current_setting('app.current_org_id')`.
4. **Contexto por requisição:** uma extensão do cliente Prisma envolve cada operação numa transação que começa com `set_config('app.current_org_id', <org>, true)` (o `true` limita o valor à transação). A organização vem do contexto da requisição (`AsyncLocalStorage`, [ADR-0007](0007-observabilidade-log-canonico-e-tracing.md)), preenchido pelo guard de autorização.
5. **Dois usuários de banco:**
   - `takt_migrator`: dono das tabelas, usado só pelas migrações;
   - `takt_app`: usado pela API, sem `BYPASSRLS` e sem ser dono das tabelas.
6. **Políticas em SQL escrito à mão** dentro das migrações do Prisma (o Prisma permite editar o SQL gerado).
7. **Sem contexto, nada aparece:** se `app.current_org_id` não estiver definido, a política não retorna nenhuma linha.
8. **Tabelas sem organização** (usuários, sessões, planos) não usam a política por organização. Seu acesso fica restrito ao módulo `identity` e ao de `organizations`.
9. **Duas camadas com responsabilidades diferentes:**
   - **isolamento entre organizações:** no banco (RLS) e na aplicação;
   - **visibilidade dentro da organização** (o aprendiz só vê plantas dos próprios grupos, RN-GRP-002): só na aplicação, com testes.

   Motivo: o vazamento entre organizações é o mais grave; uma política de banco com junção de grupos é mais complexa e mais lenta.

## Alternativas consideradas

- **Drizzle:** políticas declaradas no esquema e transações mais simples; descartado porque o fundador conhece o Prisma, e o escopo já tem riscos suficientes.
- **MikroORM:** melhor encaixe com DDD, mas curva maior e menos documentação de RLS.
- **TypeORM:** entidades com decoradores misturam domínio e banco.
- **Só filtro na aplicação, sem RLS:** um esquecimento vira vazamento; descartado.
- **Um esquema ou banco por organização:** isolamento máximo, mas migrações e operação muito mais caras.

## Consequências

**Positivas:**
- Um filtro esquecido na aplicação não vaza dados: o banco recusa.
- Defesa em profundidade mostrável no portfólio, com teste automatizado.

**Negativas e custos:**
- Toda operação roda numa transação, com um pequeno custo de desempenho. **Estimativa:** irrelevante na escala do MVP.
- As políticas ficam em SQL manual, fora do `schema.prisma`; é preciso disciplina para cada tabela nova.
- Depuração mais difícil: uma consulta "vazia" pode ser contexto ausente.

## Riscos de segurança

| Ameaça | Impacto | Mitigação |
| --- | --- | --- |
| **Tabela nova sem política de RLS** | Vazamento entre organizações | Teste de catálogo falha se uma tabela com `organization_id` estiver sem RLS habilitado e forçado |
| **API conectada com usuário que ignora o RLS** | O RLS deixa de proteger | `takt_app` sem `BYPASSRLS` e sem ser dono das tabelas; `FORCE ROW LEVEL SECURITY`; credenciais do `takt_migrator` fora do ambiente da API |
| **Contexto de organização vazando entre requisições** pelo *pool* de conexões | Requisição de A executada com o contexto de B | `set_config(..., true)` vale só dentro da transação; sem contexto, nenhuma linha aparece; teste com requisições concorrentes de organizações diferentes |
| **Injeção de SQL** no `set_config` ou em consultas manuais | Leitura ou alteração de dados arbitrários | Sempre parâmetros (`$1`), nunca concatenação; consultas SQL cruas proibidas fora de `infra/` e revisadas |
| **Visibilidade por grupo só na aplicação** (decisão do item 9) | Um aprendiz vê plantas de outro grupo da mesma organização | Teste de visibilidade por grupo; reavaliação na análise de segurança |
| **JSON de planta muito grande ou malformado** | Negação de serviço, banco inchado | Limite de 1 MB (RN-JSN-005) e validação antes de gravar |
| **Backups e réplicas** | Dados de alunos expostos fora do banco | Criptografia em repouso e acesso restrito, a definir na hospedagem |

## Conformidade

- **Teste de isolamento:** com as organizações A e B no banco, toda rota e todo repositório executados no contexto de A nunca retornam dados de B.
- **Teste de contexto ausente:** uma consulta sem `app.current_org_id` retorna zero linhas.
- **Teste de visibilidade por grupo:** um aprendiz não vê plantas de grupos de que não participa, na mesma organização.
- **Teste de catálogo:** uma checagem automática lista as tabelas com `organization_id` e falha se alguma estiver sem RLS habilitado e forçado.
- A API em execução usa sempre `takt_app`; as credenciais de `takt_migrator` não ficam disponíveis para ela.

## Relacionados

- [PDR-0009](../pdr/0009-acesso-no-mvp.md), [PDR-0010](../pdr/0010-papel-diferente-de-plano.md).
- Regras: `RN-ACE-001`, `RN-ACE-004`, `RN-GRP-002`.
- [ADR-0006](0006-autorizacao-por-organizacao.md).

## Em aberto

- Análise de segurança dedicada, que pode rever a decisão do item 9.
- Versão do PostgreSQL e do Prisma, fixadas no início da implementação.
