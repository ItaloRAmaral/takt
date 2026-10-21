---
paths:
  - "apps/takt-core-api/**"
---

# API rules (takt-core-api)

Source of truth: `docs/architecture/code-style.md`, sections 3, 5 and 6. Layout and dependency rule: ADR-0002. On doubt, read the code and docs first; if still unclear, ask. Never infer.

## Domain (`domain/`)

- Imports nothing external: no `@nestjs/*`, `@prisma/*`, `zod`, Node `crypto`. IDs and time arrive from outside.
- Entities: private state and constructor; `create(...)` validates invariants; `restore(snapshot)` rehydrates without re-running creation rules; business-named methods; no setters.
- One repository per aggregate root; reference other aggregates by ID; child entities load and save through the root.
- Value objects only for format or equality rules. Domain services only for rules across entities; pure.
- Errors carry a `code` from `docs/product/rules/README.md`; no sentences, no HTTP status.

## Application (`application/`)

- No NestJS here either: no decorators, no Nest imports.
- Use case: plain class, `execute(command, ctx)`, ports via constructor; wired in `*.module.ts` with `useFactory` + `inject`. `command` is a plain type (no Zod); `ctx` holds `organizationId`, `userId` and role from the request context, never from the body.
- Thin script: load → call domain → save → audit → return. A business `if` here means the rule is in the wrong place.
- Ports are abstract classes (contract and DI token), one per conversation with the outside (persistence, `Clock`, `IdGenerator`, `AuditLog`, `TransactionRunner`). Pure deterministic code is called directly.
- Repository methods are collection-like and exist only when a use case calls them. No `update(dto)`, no generic `findAll()`, no `organizationId` parameter (RLS filters).
- Pending decisions: transaction/RLS mechanism (D1, follow ADR-0003 until decided), read ports (D2, ports return entities until decided), `Result` vs exceptions (D3, follow `docs/architecture/takt-core-api.md` until decided).

## Infra (`infra/`) and HTTP (`http/`)

- Prisma adapters use the transaction client from the context, never a global client; no business rules; no `@prisma/client` type leaves the file; translate unique violations into domain errors.
- Mappers are pure `toDomain` / `toPersistence`; explicit value tables, never `as unknown as`.
- In-memory adapters live in `infra/in-memory/`, store copies, reproduce only database constraints, never business rules.
- Adapters and controllers use explicit `@Inject(Token)` on every constructor parameter.
- Controllers: input already validated by the strict Zod pipe → build `command` and `ctx` → call the use case → build the output DTO field by field. No `try/catch`; the global filter maps `code` to status.
- Every route has `@RequirePermission` or `@Public()` (ADR-0006).
- Error responses carry only the code; internal details (Prisma messages, `cause`) go only to the internal log. No `console.log`.
