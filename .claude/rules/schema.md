---
paths:
  - "libs/plant-schema/**"
---

# Schema rules (@takt/plant-schema)

Source of truth: `docs/architecture/code-style.md`, section 8, and ADR-0008 and ADR-0011. On doubt, read the code and docs first; if still unclear, ask. Never infer.

- Zod is the source of truth: types come from `z.infer`; the JSON Schema is generated, never hand-written.
- Two validation levels: structural (shape) and semantic (rules). Each issue is `{ elementId?, path, code }` with a code from `docs/product/rules/`.
- One migration per format version, chained; never edit a released version's schema.
- No `enum` (use literal unions); `erasableSyntaxOnly` is on.
- Every field with a physical quantity carries its unit in the name (`cycleSec`, `mtbfMin`).
