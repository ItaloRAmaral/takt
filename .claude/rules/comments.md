---
paths:
  - "**/*.{ts,tsx}"
---

# Comment rules

Source of truth: `docs/architecture/code-style.md`, section 2 ("Comentários em produção").

- Code should explain itself. When a passage needs a comment to be understood, first make the code clear: a better name, an extracted function named after its intent, a more precise type.
- Comment only what the code cannot say: inherent complexity (a formula or literature algorithm, with its source), invariants and units the type does not express, and why a non-obvious choice was made (a workaround, a measured performance decision).
- JSDoc is required on public exports of the libs.
- Never write a comment that restates the code. Tests have no comments at all (ADR-0009).
