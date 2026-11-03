# Verifying

## Contents

- Order of checks
- Coverage
- Mutation
- Reporting results

## Order of checks

1. **The new or changed tests**, alone: in Mode A, watch them fail first, then pass.
2. **The whole suite of the project.** A green file is not a green suite; every failure is reported by name, including ones you did not cause.
3. **Coverage** of the project (below).
4. **Mutation** on the changed files, where ADR-0009 requires it (below).

Take every command from `CLAUDE.md` "Commands". If one is missing, ask; do not guess Nx, Vitest or Stryker flags.

## Coverage

- Target: at least 90% of lines **and** branches in every project (ADR-0009). The threshold lives in the Vitest configuration and in CI, not in this skill; the run's own output is the evidence.
- Exclusions only from ADR-0009's reviewed list, each with its reason; adding one needs a justification in the pull request.
- An uncovered branch is a scenario to add (`scenarios.md`), or code nothing needs (tell the user), never a reason to add an exclusion.

## Mutation

Mutation testing changes the production code in small ways (a flipped condition, a removed call, a different constant) and reruns the tests. A mutant the tests do not notice ("survivor") marks behavior no test really checks. That is why it proves tests written after the code (Mode B), which never had a red step.

- **Where:** at least 80% mutation score in `@takt/sim-engine` and in the API domain (ADR-0009). Elsewhere, run it on a file when the user asks or when the coverage of a change looks weaker than its numbers.
- **Scope:** only the changed files, so feedback stays fast (the Test Double pattern: Stryker limited to changed files, after the coverage minimum passes).
- **For each survivor:**
  1. read the mutant: which line, what changed;
  2. if a test should have caught it, add or fix that test, and run again;
  3. if no input could tell the mutant apart from the original (an equivalent mutant), do not hide it: list it for the user with your reasoning, and the user decides.
- Never weaken an assertion, delete a test or lower a threshold to raise the score.

## Reporting results

- Paste the numbers as the tools printed them. An agent once reported 96.30% for a run that the author's rerun showed at 94.44% (Test Double, 2025); reported numbers are verified by the output, not by memory.
- List survivors and uncovered lines with file and line, and what you did about each.
