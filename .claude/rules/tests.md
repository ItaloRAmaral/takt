---
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/*.e2e-spec.ts"
---

# Test rules

Source of truth: `docs/architecture/code-style.md`, section 10, and ADR-0009.

- Arrange, Act, Assert separated by blank lines, with no comments; one Act per test; no `if` or loops deciding what to assert.
- `it.each` tables are allowed only when every row has the same behavior and assertion shape, the table holds only literals, the body has no `if`, and the name starts with the ID (when there is one) and shows the varying value. Success and error cases with different shapes go in separate tables.
- Expected errors (ADR-0013): async code, the Act is the call and the Assert is `await expect(promise).rejects.toMatchObject({ code })`; sync code, `const error = catchError(() => ...)` then assert the `code`. Never `expect(() => ...).toThrow()` (it merges Act and Assert) and never assert on the message.
- The test name starts with the rule or use case ID: `RN-PLT-002: ...`. With neither (tooling, a technical invariant), the name is only a plain description; never invent an ID.
- TDD for the engine and `RN-...` rules: write the test, watch it fail, then write the code.
- Factories such as `makePlant(overrides)` with fixed data; no random data without a seed.
- Use cases are tested with the in-memory adapters, not library mocks.
- API responses are validated against the output Zod schema.
- Unit tests sit next to the code (`*.spec.ts`); API tests are `*.e2e-spec.ts`. Test-only helpers live in `src/tests/helpers/`, each with its spec beside it, excluded from the library build.
