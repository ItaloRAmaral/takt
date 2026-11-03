# Lifecycle

## Contents

- Numbering
- Creating a draft
- Accepting
- Rejecting
- Superseding

Status flow (`docs/pdr/README.md`, `docs/adr/README.md`): **Proposto** (draft, editable) → **Aceito** (only after the user's final approval; never edited again) → **Substituído por PDR/ADR-NNNN** (when a newer record replaces it).

## Numbering

The next number is the highest existing one plus one, four digits. Numbers are never reused, not even after a draft is deleted. From the repository root:

```bash
ls docs/adr | grep -E '^[0-9]{4}-' | sort | tail -n 1
ls docs/pdr | grep -E '^[0-9]{4}-' | sort | tail -n 1
```

PDRs and ADRs are numbered separately.

## Creating a draft

1. Create `docs/<pdr|adr>/NNNN-titulo.md` from the template (`writing.md`).
2. Add the row to the index in the folder's `README.md`, with status "Proposto" and the record's date. Update the README's "Atualizado em" date, and keep its opening sentence true: today it says every record was accepted, which stops being true once a draft is listed.
3. Add every new external source to `docs/product/references.md`, in the section of its topic, with what it supports. A long study goes to `docs/research/` first, with the user's permission.

## Accepting

Only when the user accepts that record by its number. Then, in the same change:

1. **The record:** status `Aceito` (or, for an experimental ADR, `Aceito (experimental: revisar <quando>)`, as ADR-0002), "Aprovadores" filled in with who accepted. The date stays.
2. **The index:** status and, for the ADR README, the "Temas ainda sem ADR" list if the topic was there.
3. **PDR rules:** write each derived rule to its domain file in `docs/product/rules/`, in the README's format, with "Origem" pointing to the PDR. Update the range in the rules index (`docs/product/rules/README.md`) and the "Regras de negócio derivadas" table in `docs/pdr/README.md`. Check the IDs are still free.
4. **Living docs:** every doc that pointed to the decision as pending or that the record lists in "Reflete em" or "Relacionados": for example the pending table and the "pendente (Dn)" notes in `docs/architecture/code-style.md`, the matching line in `.claude/rules/`, and the area's doc in `docs/architecture/`. Change only what the decision changes.
5. **The record it supersedes,** if any: see below.

Show the user the list of files changed.

## Rejecting

Takt's docs do not yet say what happens to a rejected draft (deleted, or kept with a "Rejeitado" status). Ask the user, and suggest recording the answer in the READMEs so the question is asked once.

## Superseding

A change to an accepted record is always a new record; the old one is never edited.

1. The new record fills "Substitui" with the old one, and its "Contexto" says what changed since the old decision: new facts, new constraints, a measured problem.
2. The old record stays untouched while the new one is a draft.
3. When the new record is accepted, the old one gets only its status changed to `Substituído por PDR/ADR-NNNN`, and its index row the same status. Nothing else in it changes.
4. If the new record replaces only part of the old one, the docs do not yet say how to mark the old record. Ask the user before writing anything.
