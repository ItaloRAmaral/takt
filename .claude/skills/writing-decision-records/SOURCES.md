# Sources: writing-decision-records

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | Michael Nygard, ["Documenting Architecture Decisions"](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (2011-11-15) | community (origin of ADRs) | none stated | purpose (avoid blind acceptance or blind reversal); "architecturally significant" = structure, non-functional characteristics, dependencies, interfaces, construction techniques; value-neutral context; all consequences; one or two pages; numbers never reused; superseded records kept; "a conversation with a future developer" | 2026-11-03 |
| 2 | Matt Pocock, [`domain-modeling/ADR-FORMAT.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) and [`SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) | community | MIT | the three criteria (hard to reverse, surprising without context, real trade-off), all required; "offer ADRs sparingly"; list of what qualifies; next number = highest + 1 | 2026-11-03 |
| 3 | Matt Pocock, [`improve-codebase-architecture`](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) | community | MIT | accepted ADRs are not re-litigated; a contradiction is surfaced openly only when real | 2026-11-03 |
| 4 | wshobson, [`architecture-decision-records`](https://github.com/wshobson/agents/blob/main/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md) with `references/decision-templates.md` and `references/deprecation-rfc-templates.md` (repo pushed 2026-11-02, 42,150 stars) | community | MIT | references loaded on demand; write/skip table; review checklist (all viable options, honest pros and cons, security and reversibility); superseding record whose context says what changed since the old one | 2026-11-03 |
| 5 | [MADR template](https://github.com/adr/madr/blob/main/template/adr-template.md) | community | MIT OR CC0-1.0 | "Confirmation" section (prefer an automated fitness function) behind the "Conformidade" guidance; balanced pros and cons | 2026-11-03 |
| 6 | `docs/pdr/README.md`, `docs/adr/README.md`, both templates, `docs/product/rules/README.md`, `CLAUDE.md` "How we work", accepted records (ADR-0002 experimental status, PDR-0012) | Takt doc | n.a. | statuses, superseding rule, required ADR sections, rules live outside the PDR, header fields, file names | 2026-11-03 |
| 7 | User decisions, 2026-11-03 | Takt | n.a. | one skill for PDR and ADR; Claude may start it on its own, but only when a record makes sense ("fazer ADR para coisas simples não faz sentido"); acceptance also updates status, index, derived rules and living docs; no other reference links | 2026-11-03 |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Shape: reference-backed. Deciding whether to record, writing and the lifecycle are needed at different moments (a "no record" answer needs only the first); inline rejected because every use would load all three. | `writing-skills-and-agents` writing rules, #4 | estimate |
| One skill for PDR and ADR: same lifecycle, same superseding rule, templates differ only in a few sections. | #6, #7 | fact |
| The three criteria, all required, gate every new record; Takt's "always a record" cases (superseding, pending D1–D5, new intent) bypass them. | #2, #6, `docs/architecture/code-style.md` | fact |
| When Claude starts the skill on its own, it states the criteria and asks before creating a file. | #7 ("só se fizer sentido"), `CLAUDE.md` "Never infer" | estimate |
| "Data" is the drafting date and acceptance does not change it. | #6: PDRs dated 19/10/2026, accepted 20/10/2026 per `docs/pdr/README.md` | fact |
| Draft rule text is shown in the hand-over and written to the rules file only on acceptance. | #6 (rules come from an accepted PDR), #7 | estimate |
| Rejection and partial superseding: ask the user, because no Takt doc defines them. | #6 (silent) | fact |
| No script: numbering is one `ls` command; nothing else is mechanical enough to script. | `writing-skills-and-agents` writing rules | estimate |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #2 "When to offer an ADR" | `references/when-to-record.md`, "The three criteria" | adapted, MIT |
| #1 purpose, context and consequences guidance | `SKILL.md` intro, `references/writing.md` | paraphrased |
| #4 review checklist, superseding context | `references/writing.md` self-check, `references/lifecycle.md` | adapted, MIT |

## Open gaps

- Both behavior-test cases ran against a repository whose `CLAUDE.md` and READMEs already state the rules, so the baseline was strong; the case that should separate them (a decision needing research and labels, like D3) is untested.
- Trigger lists in `SPEC.md` pending the user's review.
- Rejected drafts and partial superseding are undefined in the Takt docs; the skill asks the user.

## Changelog

| Date | Change |
| --- | --- |
| 2026-11-03 | Created. Numbering commands run on the repository: `ls docs/adr \| grep -E '^[0-9]{4}-' \| sort \| tail -n 1` → `0012-front-end.md`; same for `docs/pdr` → `0021-explicacao-em-camadas.md` (templates and README excluded). |
| 2026-11-03 | Behavior test, 4 subagents. `skip-trivial` (Vitest patch bump): with and baseline both refused to create a record and said where the version goes; with cited the three criteria and the example table. `supersede-accepted` (ADR-0009 to 85%): both left ADR-0009 untouched and drafted ADR-0013 "Proposto" with "Substitui", all template sections, the reason marked pending instead of invented, and an index row; with asked 3 questions, baseline 7 (over the limit). Baseline also updated the ADR count in `docs/PRODUCT.md`, which the skill missed: added to `references/lifecycle.md` (draft and acceptance). Repository checksums unchanged after the runs. |
| 2026-11-03 | First real use (ADR-0013, D3). The security table grew to 11 rows, most of them threats already handled by ADR-0003, 0006 and 0007; the user questioned it. `references/writing.md`: list only threats the decision creates or changes, and name the others in one line with links (rule and self-check item 6). |
