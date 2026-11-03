# Registros de decisão de arquitetura (ADR)

> **Resumo.** Cada ADR registra uma decisão técnica completa: contexto, decisão, alternativas, consequências e como verificar que ela está sendo seguida. Decisões de produto ficam nos PDRs, em [`../pdr/`](../pdr/README.md). O **como** o sistema funciona hoje fica nos documentos vivos de [`../architecture/`](../architecture/README.md).

Atualizado em 03/11/2026. Os registros 0001 a 0012 foram aceitos por Italo em 20/10/2026; o 0013, em 03/11/2026.

## Como funciona

- **Um ADR por decisão**, numerado em sequência (`NNNN-titulo.md`), a partir do [modelo](template.md).
- **Completos e enxutos:** decisão, alternativas, riscos e conformidade, com detalhe suficiente para implementar sem adivinhar. Estrutura de pastas, fluxos e exemplos de código vão para [`../architecture/`](../architecture/README.md). Os ADRs 0001 a 0007 foram escritos antes desta regra e mantêm parte desse detalhe.
- **Status:** **proposto** (rascunho, editável) → **aceito** (só depois da aprovação final de Italo; a partir daí não é editado) → **substituído** (uma mudança num ADR aceito vira um ADR novo, que cita o antigo no campo "Substitui"; o antigo recebe só a nota "Substituído por ADR-NNNN"). ADRs experimentais têm data de revisão.
- **Seção "Riscos de segurança"** obrigatória: ameaças que a decisão cria ou trata, com a mitigação; se não houver impacto, isso é dito explicitamente.
- **Seção "Conformidade"** obrigatória: lint, teste ou revisão que garante a decisão.
- **Seção "Em aberto"**: o que ainda não foi decidido, para não virar decisão silenciosa.

## Índice

| ADR | Decisão | Escopo | Status | Data |
| --- | --- | --- | --- | --- |
| [0001](0001-monorepo-nx-e-nomes.md) | Monorepo com Nx e nomes dos projetos | Repositório | Aceito | 20/10/2026 |
| [0002](0002-arquitetura-hexagonal-por-contexto.md) | Arquitetura hexagonal com módulos por contexto | `takt-core-api` | Aceito (experimental) | 20/10/2026 |
| [0003](0003-postgresql-prisma-e-rls.md) | PostgreSQL, Prisma e Row-Level Security | `takt-core-api` | Aceito | 20/10/2026 |
| [0004](0004-autenticacao-com-better-auth.md) | Autenticação com Better Auth dentro da API | `takt-core-api` | Aceito | 20/10/2026 |
| [0005](0005-sessao-no-banco-com-cookie.md) | Sessão no banco com cookie e proxy reverso no mesmo site | API, web, hospedagem | Aceito | 20/10/2026 |
| [0006](0006-autorizacao-por-organizacao.md) | Autorização por organização, papel e plano | `takt-core-api` | Aceito | 20/10/2026 |
| [0007](0007-observabilidade-log-canonico-e-tracing.md) | Observabilidade com log canônico, passos e tracing | `takt-core-api` | Aceito | 20/10/2026 |
| [0008](0008-validacao-de-dados.md) | Validação de dados com Zod | API, web, `plant-schema` | Aceito | 20/10/2026 |
| [0009](0009-estrategia-de-testes.md) | Estratégia de testes | Monorepo | Aceito | 20/10/2026 |
| [0010](0010-qualidade-e-ci.md) | Qualidade de código e integração contínua | Monorepo, GitHub | Aceito | 20/10/2026 |
| [0011](0011-motor-de-simulacao-e-esquema.md) | Motor de simulação e esquema da planta | `sim-engine`, `plant-schema`, web | Aceito | 20/10/2026 |
| [0012](0012-front-end.md) | Front-end estático com Vite, React e React Three Fiber | `takt-web-app`, hospedagem | Aceito | 20/10/2026 |
| [0013](0013-erros-esperados.md) | Erros esperados como exceções com código | `takt-core-api`, `sim-engine`, Worker, testes | Aceito | 03/11/2026 |

## Temas ainda sem ADR

- Hospedagem e ambientes (GCP como candidata, não decidida).
- Análise de segurança (pode rever o ADR-0003).
- `CLAUDE.md`, skills e agentes.
