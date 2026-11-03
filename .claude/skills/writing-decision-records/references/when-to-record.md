# When to record

## Contents

- The three criteria
- Always a record
- Not a record: where it goes instead
- PDR or ADR

## The three criteria

A decision deserves a record only when **all three** are true:

1. **Hard to reverse:** changing your mind later costs real work (many files, data already stored, a public contract, a rule already tested).
2. **Surprising without context:** a future reader of the code or the product would wonder "why on earth is it like this?", or would "fix" it.
3. **A real trade-off:** there were genuine alternatives and one was picked for specific reasons. "We did the obvious thing" needs no record.

For an ADR, the decision must also be "architecturally significant": it affects the structure, non-functional characteristics, dependencies, interfaces or construction techniques. For a PDR, it changes what the product offers, to whom, who may do what, its scope, its limits or its milestones.

Examples from Takt:

| Decision | Record? | Why |
| --- | --- | --- |
| `Result` or exceptions for expected errors (D3, became ADR-0013) | yes, ADR | every use case, port and test signature depends on it; both options are common; tests read differently with each |
| MRG32k3a as the engine's generator (ADR-0011) | yes, ADR | changing it changes every stored result; a reader would ask why not `Math.random` |
| a real plant is never published to a group (PDR-0012) | yes, PDR | a product limit users meet; produces rules |
| bump Vitest from one patch version to the next | no | easy to reverse, no trade-off |
| name of a private helper | no | implementation detail |

## Always a record

These skip the three criteria, because Takt's rules already require a record. A decision the docs only list as pending does not: check it against the three criteria with the facts known now.

- The change contradicts or changes an **accepted PDR or ADR**: a superseding record (`CLAUDE.md`, "How we work").
- A **new business intent** with no PDR behind it, such as a rule proposed by the `writing-tests` skill whose "Origem" has no PDR (`docs/product/rules/README.md`: a change of intent needs a new PDR).

## Not a record: where it goes instead

| Case | Where it goes |
| --- | --- |
| a style-guide principle broken in one place, with justification | the plan's deviation, with the five items of `code-style.md` section 3 |
| a rule's detail (a value, a wording) without changing its intent | the rule file, with its date (`docs/product/rules/README.md`) |
| how a module works today: folders, flows, code examples | `docs/architecture/` |
| a library or version easy to swap, a bug fix, a configuration | the plan or the commit message |
| findings of a study, before any decision | `docs/research/` |
| something an accepted record already decides | nothing new; cite that record |
| a decision the docs list as pending (the pending table of `code-style.md`, an "Em aberto" item) that fails the three criteria with what is known now | the living doc that listed it, with the decision, its date and a review trigger; ask the user first, since the docs once expected a record (as with the TypeScript version, D5) |

When unsure, show the user the three criteria with your reading of each and ask; do not create the file to find out.

## PDR or ADR

| PDR (`docs/pdr/`) | ADR (`docs/adr/`) |
| --- | --- |
| what the product does and for whom; the intent | how it is built: technology, structure, dependencies, interfaces, quality attributes |
| produces `RN-...` rules | produces conformance checks: lint, tests, review items |
| example: hierarchy of roles (PDR-0019) | example: authorization per organization (ADR-0006) |

A decision with both sides becomes two records: the PDR states the intent, and the ADR cites it in "Contexto" and "Relacionados". If you cannot tell which side a decision is on, ask.
