# Testing

## Contents

- Three levels of checking
- When to run behavior tests: the four criteria
- Trigger lists
- Behavior tests
- Reporting

## Three levels of checking

1. **Structural validator**, always: format, names, file links, required notes, hidden characters.
2. **Trigger lists**, whenever Claude may start the skill or delegate to the agent on its own.
3. **Behavior tests**, only when at least one criterion below applies, and only after the user agrees.

## When to run behavior tests: the four criteria

A behavior test opens fresh assistants that know nothing about the conversation and gives them real tasks, with and without the new skill or agent. It is the only check that shows whether the files work on their own: the author cannot test that, because the author fills gaps from memory without noticing. Each fresh assistant costs tokens and time, so run it only when a mistake would be expensive.

Run behavior tests when **at least one** applies:

1. **It judges whether work is good** (review, security, test quality). A badly written judge approves defects, and nobody notices because everyone trusts it. Mistakes here stay hidden, so they must be caught before use.
2. **It changes files or runs commands.** A skill that only reads produces, at worst, a bad opinion. One that writes or executes can overwrite code, delete files or run the wrong command. The damage is real.
3. **Claude decides when to use it** (no `disable-model-invocation: true`, or an agent Claude may delegate to). Claude reads the description and decides whether a request matches. A poor description means it is never used when it should be, or used where it gets in the way. When only the user starts it with `/name`, this risk does not exist.
4. **It has several files** (`references/`, `scripts/`). With one file, everything is read at once. With several, the main file must route to the right one; more files mean more chances to open the wrong one, miss the right one or get lost.

If none applies (for example, a single-file, read-only skill that only the user starts), the validator and, when relevant, the trigger lists are enough.

Before running, tell the user which criteria apply and the cost, then ask. Example: "This agent judges whether code is good (criterion 1). I recommend a behavior test: 2 tasks, with and without the agent, about 4 subagents. Shall I run it?"

## Trigger lists

Write 8 to 10 requests that **should** trigger and 8 to 10 that **should not**, and show both to the user for review.

- Make them realistic: the way the user actually writes, with paths, context, casual wording, even typos.
- Should-trigger: vary the wording; include requests that never name the skill but clearly need it.
- Should-not: use near-misses that share words with the skill but need something else. "Write a fibonacci function" tests nothing; "add a PreToolUse hook that blocks rm -rf" does, for a skill-writing skill.
- Tune the description until every listed request lands on the right side, then record both lists in `SPEC.md` (or in `SOURCES.md` when there is no `SPEC.md`).

Do not rely on automated trigger scripts that call `claude -p`; one known issue reports they never trigger skills (see `SOURCES.md`).

## Behavior tests

1. Write 2 or 3 realistic tasks and, for each, the checks a good output must pass (for example, "frontmatter name equals directory name", "reports only findings with a file and line"). Prefer checks a script or a quick read can decide.
2. For each task, start two general-purpose subagents in the same message:
   - **with**: "Read `<path>` and follow it to do this task: `<task>`. Write every output under `<scratchpad>/<name>-test/<case>/with/`, mirroring repository paths. Do not modify the repository. You cannot ask the user: write the questions you would ask to `questions.md` in that folder, state the assumption you made for each, and continue."
   - **baseline**: the same task and the same output and questions rules, without the skill or agent. For a new item the baseline is nothing; for an update, it is a copy of the previous version saved in the scratchpad before editing.
   For an agent, the "with" run follows the agent file's prompt; its tool limits are not enforced in this run, so check them by reading the frontmatter.
3. Check every output against its checks, and read how each subagent worked, not only the result: repeated wasted steps point to instructions that should be cut or a script worth adding.
4. Show the user the comparison table; change the files, generalizing from the failures instead of patching the specific test task; run again until the "with" runs pass and beat the baseline.

## Reporting

| Case | Check | With | Baseline | Note |
| --- | --- | --- | --- | --- |

Record the cases and checks in `SPEC.md` and the results and date in the `SOURCES.md` changelog.
