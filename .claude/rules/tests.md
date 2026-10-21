---
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/*.e2e-spec.ts"
---

# Test rules

Source of truth: `docs/architecture/code-style.md`, section 10, and ADR-0009.

- Arrange, Act, Assert separated by blank lines, with no comments; one Act per test; no `if` or loops deciding what to assert.
- The test name starts with the rule or use case ID: `RN-PLT-002: ...`.
- TDD for the engine and `RN-...` rules: write the test, watch it fail, then write the code.
- Factories such as `makePlant(overrides)` with fixed data; no random data without a seed.
- Use cases are tested with the in-memory adapters, not library mocks.
- API responses are validated against the output Zod schema.
- Unit tests sit next to the code (`*.spec.ts`); API tests are `*.e2e-spec.ts`.
