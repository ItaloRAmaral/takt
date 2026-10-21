---
paths:
  - "libs/sim-engine/**"
---

# Engine rules (@takt/sim-engine)

Source of truth: `docs/architecture/code-style.md`, section 7, and ADR-0011. On doubt, read the code and docs first; if still unclear, ask. Never infer.

- Functional core: values in (compiled plant, seed, mode), values out (indicators, series, final state, log). No ports, dependency injection or service classes. The Web Worker in `takt-web-app` is the shell.
- Folders by concept (`rng/`, `distributions/`, `events/`, `model/`, `stats/`, `modes/`), not `domain/application/infra`.
- Forbidden: `Math.random`, `Date.now`, `new Date()`, `performance.now`, React, Three.js, DOM APIs.
- Deterministic order: iterate only `Map` or arrays in a known order; never order events by `Object.keys` of JSON data; every sort has an explicit tie-break.
- Hot loops: initialize every field at creation in the same order, no `delete`, avoid allocating an object per event. Breaking another style rule for speed needs a measurement in the plan.
- Public API types are `readonly` / `ReadonlyArray`; local mutation inside a run is fine if it never escapes.
- No `enum`; `erasableSyntaxOnly` is on.
- Comment formulas with their source, assumptions and units (for example AS 241, Wichura 1988); JSDoc on public exports.
- TDD: the failing test comes first. Literature cases use a fixed seed and a tolerance from the confidence interval (ADR-0009).
- Cross-browser reproducibility of `Math` functions is pending (D4); do not promise identical numbers across JavaScript engines.
