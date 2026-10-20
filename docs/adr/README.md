# Registros de decisão de arquitetura (ADR)

> **Resumo.** Cada ADR registra uma decisão técnica completa: contexto, decisão, alternativas, consequências e como verificar que ela está sendo seguida. Decisões de produto ficam nos PDRs, em [`../pdr/`](../pdr/README.md).

Atualizado em 20/10/2026.

## Como funciona

- **Um ADR por decisão**, numerado em sequência (`NNNN-titulo.md`), a partir do [modelo](template.md).
- **Completos:** um ADR deve permitir implementar a decisão sem adivinhar. Não há limite de tamanho.
- **Status:** proposto, aceito ou substituído. Um ADR aceito **não é editado**; uma mudança vira um ADR novo que substitui o anterior. ADRs marcados como experimentais têm data de revisão.
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
| [0005](0005-sessao-no-banco-com-cookie.md) | Sessão no banco com cookie e proxy pelo front | API, web, hospedagem | Aceito | 20/10/2026 |
| [0006](0006-autorizacao-por-organizacao.md) | Autorização por organização, papel e plano | `takt-core-api` | Aceito | 20/10/2026 |
| [0007](0007-observabilidade-log-canonico-e-tracing.md) | Observabilidade com log canônico, passos e tracing | `takt-core-api` | Aceito | 20/10/2026 |
| [0008](0008-validacao-de-dados.md) | Validação de dados com Zod | API, web, `plant-schema` | Aceito | 20/10/2026 |

## Temas ainda sem ADR

- Arquitetura do `takt-web-app` (Next.js, cena 3D, estado, IndexedDB).
- Motor de simulação (`@takt/sim-engine`) e esquema da planta (`@takt/plant-schema`).
- Estratégia de testes.
- Qualidade e CI (lint, commits, pipeline).
- Hospedagem e ambientes (GCP como candidata, não decidida).
- Análise de segurança (pode rever o ADR-0003).
- `CLAUDE.md`, skills e agentes.
