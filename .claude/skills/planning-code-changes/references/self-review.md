# Self-review

Run every check after the plan is written, with the request and the docs open, as if someone else wrote the plan. Fix each problem in the plan right away and count the fixes for the measurement in `references/reviews.md`.

1. **Coverage.** Each requirement in the request, each `RN-...` rule it touches and each use case step maps to a task whose test proves it. Add a task for any requirement without one.
2. **Assumptions.** Every value, name, limit, error code and behavior traces to a document, the existing code or a recorded answer from the user. Anything that traces to nothing becomes a question to the user, never a default you picked.
3. **Review focus.** For each input class or failure mode the request implies (empty, missing, duplicated, out of range, concurrent, malicious, limits, partial failure), a task's test exercises it, or it is in "Foco de revisão" with its test added to the owning task.
4. **Security.** Every threat in the "Riscos de segurança" tables of the ADRs this plan touches, and every applicable item of `code-style.md` section 11, has a row in "Segurança" with a task and test, or a reason it does not apply.
5. **Hard rules.** Nothing breaks `CLAUDE.md`, an accepted ADR or PDR, or an `RN-...` rule. Anything that would is a proposed new record, not a task.
6. **Style and deviations.** The design follows `code-style.md`. Every principle the plan breaks is in "Desvios do guia de estilo" with all five items, and its criterion really applies. Nothing is added "for the future".
7. **Interfaces.** Names, signatures and types match across tasks: what task 3 produces is exactly what task 7 consumes.
8. **Step scan.** Each step lets the implementer write exactly one reasonable thing. Remove lines that decide nothing; replace function bodies that the signature and tests already determine with the signature.
9. **Proportion.** If the plan is several times longer than the request and the code blocks are most of it, it transcribes the program; cut bodies down to signatures, test names and assertions.
10. **Tests are planned, not implied.** "Plano de testes" maps every requirement, rule, "Foco de revisão" line and "Segurança" row to a named test at the right ADR-0009 level, with its data and the coverage and mutation targets that apply. Each task is TDD (failing test first), names its tests with the rule or use case ID, and follows AAA with no comments and no logic.
11. **Context.** The "Contexto" field lists the docs that define the request, sent or confirmed by the user; every value in the plan comes from them, from other docs, from the code or from a recorded answer.

An empty "Foco de revisão", "Segurança", "Plano de testes" or "Desvios" section means you checked and found nothing, never that you skipped the check.
