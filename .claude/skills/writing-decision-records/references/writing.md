# Writing a record

## Contents

- Shape and tone
- Header
- Sections common to both
- PDR only
- ADR only
- Self-check

## Shape and tone

- Start from the template: `docs/pdr/template.md` or `docs/adr/template.md`. Keep its sections and order; do not add sections of your own.
- One decision per record, one or two pages. Write it as a conversation with a future reader: full sentences in active voice, bullets only to list parallel items.
- The ADR must hold enough detail to implement without guessing (`docs/adr/README.md`), but folder layouts, flows and code examples go to `docs/architecture/`; the record links to them.
- Mark claims the way the accepted records do: **fato:** with a link to its source, **estimativa:** with what it is derived from, **palpite:** for a reasoned opinion without a source.
- Link every PDR, ADR, rule and doc you cite, with a relative path, as the accepted records do.

## Header

| Field | Value |
| --- | --- |
| Status | `Proposto` |
| Data | the date the draft is written, `DD/MM/AAAA`; acceptance does not change it |
| Relator | the user's name as it appears in the accepted records, unless the user says otherwise |
| Aprovadores | `pendente` until acceptance |
| Substitui | only in a superseding record: the record it replaces, linked; otherwise remove the row |
| Escopo (ADR only) | the Nx projects affected, by their names (`takt-core-api`, `@takt/sim-engine`), or "Repositório", "Monorepo" |

File name: `NNNN-` plus a short title in lower case, no accents, words joined by hyphens (`0012-tipo-de-planta-e-copia.md`). The title in the heading is a short phrase naming the decision.

## Sections common to both

- **Contexto:** the problem and the forces in tension: technical, product, cost, people, deadlines. Describe them neutrally, as facts; the argument for the choice belongs in "Decisão" and "Alternativas". Name the accepted records and rules that constrain the choice.
- **Decisão:** what is decided, numbered when there are several parts. For a draft, this is the recommended option; the record says "Proposto" until the user accepts it.
- **Alternativas consideradas:** every real option weighed, each with what it offered and why it lost. Include keeping things as they are when that was a real option. Do not invent weak options to make the choice look better; a reader can tell.
- **Consequências:** all of them, good and bad, including what it costs and what it leaves open. The consequences of one record often become the context of the next; say so when it is planned.

## PDR only

- **Regras derivadas:** each rule's ID and its intent in one line. The exact, testable text goes in `docs/product/rules/`, never in the PDR. Use the next free number of the domain; never reuse an ID. While the PDR is a draft, give the user the proposed rule text in the format of `docs/product/rules/README.md` in the hand-over; it is written to the rules file only on acceptance.
- **Reflete em:** the product docs where the decision appears.

## ADR only

- **Riscos de segurança** (required): only the threats this decision creates or changes, each with impact and mitigation, in the template's table. Check the threat tables of the related ADRs (for example ADR-0003, ADR-0006, ADR-0011): a threat already handled there, which this decision does not change, goes in one line after the table that names it and links the record, never as a row. A long table of threats the decision did not create makes it look riskier than it is and gives one threat two sources. With no security impact, say so in one line and why.
- **Conformidade** (required): how anyone can check that the decision is followed. Prefer a check a machine runs (a lint rule, a test, a CI step) over "code review", and name it precisely enough to implement.
- **Relacionados:** PDRs, rules and ADRs.
- **Em aberto:** what this record leaves undecided, so it does not become a silent decision.
- An experimental ADR states when it is reviewed in its status, as ADR-0002 does: `Aceito (experimental: revisar ao fim do marco 4)`.

## Self-check

Before the hand-over, check the draft against each item and fix what fails:

1. All three criteria of `when-to-record.md` hold, or an "always a record" case applies.
2. Every fact has a source a reader can open; every estimate says what it comes from; nothing is left unlabeled.
3. The options include every real alternative, and each has a real reason to lose.
4. No accepted record is contradicted without being named in "Substitui" or "Contexto".
5. The negative consequences are as concrete as the positive ones.
6. ADR: "Riscos de segurança" lists only threats this decision creates or changes, "Conformidade" is filled in, and the conformance check can be implemented as written.
7. PDR: no testable rule text in the PDR; every rule ID is free in its domain file.
8. The index row is added, and every new external source is in `docs/product/references.md`.
9. The record fits in one or two pages, and detail that describes how the code works is in `docs/architecture/` instead.
