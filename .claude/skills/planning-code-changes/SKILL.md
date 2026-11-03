---
name: planning-code-changes
description: Plans every code or configuration change in the Takt repository before it is written, from the user's request plus the docs that define it, from a small local change (a short plan in the conversation) up to a whole subsystem ("faça o motor"), producing a reviewed plan that covers both the code and its tests, with TDD tasks, interfaces between tasks, security, style-guide conformance and justified deviations. Use when the user asks to implement, build, make, create or change code (a feature, use case, module, endpoint, library, the engine, the API), or asks for an implementation plan. Not for executing an approved plan, for PDRs, ADRs or other prose docs, or for comment and formatting edits.
---

# Planning code changes

Write the plan an engineer needs to build the change without having seen this conversation: which files, which names and signatures, which values from the docs, which tests prove each task, which threats are handled, and which style principles are broken and why. Everything else the engineer can decide alone, so leave it out.

Every plan plans the tests as carefully as the code: which levels, which cases, which data, which targets. Code without planned tests is how untested edge cases and security holes reach production.

The plan is where mistakes are cheapest. A gap found here costs a line; found in code review it costs a rewrite; found in production it costs trust. That is why this skill is thorough about coverage and security, and strict about never guessing.

## References

| Open when you need to... | Read |
| --- | --- |
| write a short plan, a full plan or a roadmap (structure, task format, sections) | `references/plan-template.md` |
| run the self-review before showing the plan | `references/self-review.md` |
| decide on the reviewer, dispatch it, handle findings, record the measurement | `references/reviews.md` |

## Ground rules

- **Never infer.** On any doubt about a rule, scope, value, name or behavior: read the code and the docs first (`docs/PRODUCT.md`, `docs/product/`, rules, PDRs, ADRs, `docs/architecture/`, `CLAUDE.md`). If the answer is not there, ask the user. A guessed value in a plan becomes a guessed value in code, and nobody notices.
- Ask at most 3 questions per message; talk to the user in their language.
- Plans are written in pt-BR (they live in `docs/`); code identifiers stay in English.
- Follow `docs/architecture/code-style.md`. Its style principles may be broken only with the five items its section 3 requires, written in the plan. `CLAUDE.md`, accepted ADRs and PDRs, and `RN-...` rules are never broken by a plan; if one is in the way, propose a new record instead.
- Never run git commands that create commits or publish; each task lists a suggested commit message for the user.
- This skill only plans. Do not write production code or tests while planning.

## Step 1: Understand and size the request

1. **Get the context.** A plan needs two inputs from the user: the request (what to build) and the docs that define it (a use case, rule files, a section of `docs/product/`, an ADR). If the user sent only the request, search the docs for the likely definitions, show what you found and ask the user to confirm or send the right ones. Do not plan from the request alone: the definitions are where the values, rules and limits come from.
2. Read the request and the docs the user pointed to, then `docs/PRODUCT.md`, `docs/product/milestones.md`, the use cases and rules it touches, the ADRs of the area, `docs/architecture/code-style.md` and the existing code.
3. If the milestone has no written use cases yet, say so and ask whether to write them first (`CLAUDE.md`: each milestone starts with its use cases).
4. Size it:

| Size | Signal | What to produce |
| --- | --- | --- |
| no plan | only prose docs, comments or formatting, with no change in behavior | no plan; make the edit and say what changed |
| small | a small, local change, even one the user fully specified | a short plan in the conversation; the user approves it there |
| one deliverable | one feature, use case or component that ships working and tested on its own | a full plan in `docs/plans/` |
| several subsystems | parts that could each ship and be tested independently ("the engine", "the API") | a roadmap of sub-plans first; the user approves it; then one full plan per sub-plan, one at a time |

Even a change the user fully specified can leave gaps (an edge case, a rule it touches, a test it breaks); the short plan exists to catch them. When in doubt between small and one deliverable, write the full plan, and switch to a full plan when the short one shows the change is not small.

## Step 2: Resolve doubts before writing

1. List every open point: rules that do not cover a case, values not in the docs, names, limits, error codes, behavior on edge inputs.
2. For each, search the code and the docs. Record where the answer was found.
3. Ask the user what is left, at most 3 per message, and wait. Record each answer in the plan's "Decisões tomadas com o usuário" section.

Do not start the plan while a decision rests on a guess.

## Step 3: Write the plan

Read `references/plan-template.md`. For a small change, write the short plan in the conversation. Otherwise, write `docs/plans/AAAA-MM-DD-<nome>.md` with status "Proposto". The plan decides; it does not transcribe code.

## Step 4: Self-review

Read `references/self-review.md` and run every check. Fix what you find in the plan; count the fixes for the measurement.

## Step 5: Independent review when the plan is important

Full plans only. Read `references/reviews.md`. If any of its criteria applies, tell the user which one and run `plan-reviewer`, one pass. Verify every finding against the docs before accepting it, update the plan, and record the results in the plan and in `docs/plans/README.md`.

## Step 6: Hand over

For a short plan, the plan itself is the hand-over: end by asking the user to approve it.

For a full plan or roadmap, reply with:

1. **Plan:** the link, the goal in one sentence, and the number of tasks (or sub-plans, for a roadmap).
2. **Decisions with the user** and **questions still open**, if any.
3. **Deviations** from the style guide, one line each, and any **new record proposed** (PDR or ADR).
4. **Review:** self-review fixes, reviewer findings accepted and rejected, or why the reviewer did not run.
5. **Next step:** ask the user to review and approve the plan (status "Aprovado") before any code is written.
6. **Commit:** the plan files to stage and a Conventional Commits message with scope `docs`, ending with the `Co-Authored-By` trailer.
