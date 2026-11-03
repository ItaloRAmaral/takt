---
name: writing-decision-records
description: Writes and maintains Takt's decision records, product decisions as PDRs (docs/pdr/) and technical decisions as ADRs (docs/adr/), in pt-BR. First checks whether the decision deserves a record at all (hard to reverse, surprising without context, a real trade-off), then drafts it as "Proposto" from the template with sourced facts and labeled estimates, and on the user's acceptance updates status, index, derived RN rules and living docs; a change to an accepted record becomes a new record that supersedes it. Use when the user asks for a PDR or ADR, takes up a pending decision (the pending table of the style guide, an "Em aberto" item), accepts or rejects a draft, or when a plan or conversation hits a decision that is hard to reverse or contradicts an accepted record. Not for implementation details, style-guide deviations (they go in the plan), adjustments to a rule's detail (edit the rule file), research reports or other docs.
---

# Writing decision records

A record exists so that a future reader neither blindly accepts nor blindly reverses a decision: it keeps the forces, the options and the reason. A record nobody needed costs reading time and dilutes the ones that matter, so the first job is to decide whether there should be one at all.

## References

| Open when you need to... | Read |
| --- | --- |
| decide if a decision deserves a record, and whether it is a PDR or an ADR | `references/when-to-record.md` |
| write or check the sections of a draft | `references/writing.md` |
| number, index, accept, reject or supersede a record | `references/lifecycle.md` |

## Ground rules

- **The user decides; you propose.** Lay out the options and your recommendation; the record stays "Proposto" until the user accepts it by name.
- **Never infer.** Every fact in a record has a source: a Takt doc, the code, or a published reference. Label every claim as fato, estimativa or palpite. If a fact is missing, ask the user or ask permission to research it; never fill it from memory.
- **Accepted records are never edited.** The only change an accepted record ever gets is the status note "Substituído por PDR/ADR-NNNN" when its replacement is accepted. "Proposto" drafts may be edited freely.
- **Never re-litigate silently.** If the work at hand contradicts an accepted record, say which one and why, and propose a superseding record; neither follow the old one against the evidence nor break it quietly.
- Records, indexes and rules are written in pt-BR; code names stay in English, in backticks. Talk to the user in their language.
- Ask at most 3 questions per message. Never run git commands that create commits or publish.

## Workflow

1. **Should this be a record?** Apply `references/when-to-record.md`. If you started this skill on your own, tell the user in two or three lines which criteria hold, with the fact behind each, and ask before creating any file. If a criterion fails, say where the decision belongs instead and stop.
2. **Which record.** PDR or ADR, new or superseding, and its number (`references/lifecycle.md`).
3. **Read the context.** `docs/PRODUCT.md`, every PDR and ADR the decision touches (search `docs/pdr/` and `docs/adr/` for its terms), the rules and use cases involved, `docs/architecture/` (including the pending list in `code-style.md`) and `docs/research/`. Write down the constraints that accepted records already impose; the options must respect them or supersede them openly.
4. **Close the gaps.** For each fact the decision rests on: cite where it comes from, or ask permission to research it, or ask the user if it is a preference only they can state. Do not draft while the recommendation rests on a guess.
5. **Draft** the record from the template (`references/writing.md`), add its row to the index and every new external source to `docs/product/references.md`.
6. **Self-check** with the list at the end of `references/writing.md`.
7. **Hand over** (below).

Acceptance, rejection and superseding follow `references/lifecycle.md`; each runs only on the user's explicit word for that record.

## Hand over

Reply with:

1. **Record:** path, status, and the decision in one paragraph.
2. **Options:** the alternatives weighed and why the recommendation wins, one line each.
3. **Labels:** what rests on estimates or guesses, and what research was done or is still needed.
4. **Questions:** at most 3, the ones the user must answer before accepting.
5. **On acceptance:** the rules, docs and indexes that will change (`references/lifecycle.md`), so the user knows the reach of the yes.
6. **Commit:** the exact files to stage and a Conventional Commits message with type `docs` (for example `docs: propose ADR-0013 on expected errors`), ending with the `Co-Authored-By` trailer.
