# Reviews

## Contents

- When to run the reviewer
- How to dispatch it
- How to handle findings
- Measurement and switch-off rule

## When to run the reviewer

Self-review always runs. The `plan-reviewer` agent also runs when **at least one** of these applies, because a gap there is expensive and hard to see from inside the conversation:

1. **It is a roadmap** for several subsystems ("faça o motor", "a API").
2. **It touches the domain or an `RN-...` rule**: the rule must be right before code depends on it.
3. **It touches security**: authentication, authorization, organizations and roles, RLS, input validation, secrets, logs, anything a user can send.
4. **It touches the database**: schema, migrations, transactions.
5. **It touches the engine's determinism**: random numbers, event order, reproducibility.

Otherwise, self-review is enough. Tell the user which criterion applied (or that none did) in the hand-over; the decision to use the reviewer on these plans was made with the user on 2026-10-21, so do not ask again each time.

## How to dispatch it

One pass: do not send the plan back for a second review after fixing it, because a second loop doubles the time without a measured gain (superpowers, 2026-03).

Prompt: "Review the plan at `<path>`. It implements this request: `<the user's words>`. Context docs: `<paths>`. Rules and records the author believes it touches: `<IDs>`."

Give it the request in full: it has not seen the conversation, and that is why it is useful.

## How to handle findings

1. **Verify before accepting.** For each finding, open the document or code it cites and check that it is true for this plan. Reviewers can be wrong; agreeing without checking just moves the error.
2. **Accept** what is confirmed: fix the plan.
3. **Reject** what is not, with one line saying why (a document that contradicts it, a criterion that does not apply).
4. **Ask the user** about anything in "Assumptions to confirm with the user", and about findings you cannot settle from the docs.
5. Record every finding in the plan's "Revisão" table: the source (self-review or `plan-reviewer`), accepted or not, and why.
6. Copy "Ceremony observed" items into the plan's "Cerimônia observada" section.

## Measurement and switch-off rule

The reviewer stays only if it finds what self-review misses. After each reviewed plan, add a row to the table in `docs/plans/README.md`:

| Column | Meaning |
| --- | --- |
| Plano | link to the plan |
| Data | date of the review |
| Critério | which criterion above triggered the review |
| Autorrevisão | number of problems self-review fixed |
| Só o revisor (erros / sugestões) | accepted findings from `plan-reviewer` that self-review had not found |
| Rejeitados | findings rejected after verification |

After **5 reviewed plans** (a starting point agreed with the user on 2026-10-21, not a measured number), summarize the table for the user. If the reviewer produced no accepted error that self-review missed, propose switching it off; the user decides. If it did, keep it and say what kind of gap it caught, so self-review can learn to catch it too.
