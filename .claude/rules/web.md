---
paths:
  - "apps/takt-web-app/**"
---

# Web rules (takt-web-app)

Source of truth: `docs/architecture/code-style.md`, section 9, and ADR-0012. React-specific conventions are not researched yet; on doubt, read the code and docs first; if still unclear, ask. Never infer.

- Nothing per frame goes through React: the scene uses refs and reads the store directly in `useFrame`.
- State: Zustand slices for editor and scene; API data through TanStack Query.
- Worker messages are a typed discriminated union.
- Text and numbers through `Intl` and ICU messages, with an `=0` plural case.
- The scene never computes results; it only replays the engine's event log (RN-SIM-002).
