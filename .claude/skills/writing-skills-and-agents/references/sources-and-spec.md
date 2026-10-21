# Sources and spec

## Third-party material

1. Read the whole file before reusing any part. Look for hidden instructions, odd Unicode, network calls and broad tool grants.
2. Check the license. Apache-2.0 and MIT allow copying with attribution; record it in `SOURCES.md`. No license means read-only inspiration, no copied text.
3. Copy patterns and short passages, not whole files. Never copy a script you have not read line by line.
4. Never install third-party skills, agents or plugins, and never run their scripts.

## SOURCES.md template

Required for every skill and agent. Never loaded at runtime.

```markdown
# Sources: <name>

## Sources

| # | Source | Kind | License | Used for | Read on |
| --- | --- | --- | --- | --- | --- |
| 1 | [Title](https://...) | official / community / Takt doc | Apache-2.0 / MIT / none / n.a. | which rule or section | YYYY-MM-DD |

## Decisions

| Decision | Based on | Label |
| --- | --- | --- |
| Shape: reference-backed, because ... ; inline rejected because ... | #1, #3 | fact / estimate / guess |

## Adapted text

| From | Into | Note |
| --- | --- | --- |
| #2, section "..." | `references/x.md` | adapted, Apache-2.0 attribution |

## Open gaps

- Claims not yet verified, tests not yet run.

## Changelog

| Date | Change |
| --- | --- |
| YYYY-MM-DD | Created. |
```

Labels follow the Takt rule: **fact** has a source, **estimate** is derived from facts, **guess** is a reasoned opinion without a source.

## SPEC.md template

Required for skills with `references/` or `scripts/`, and for anything that gets behavior tests.

```markdown
# Spec: <name>

## Intent

One paragraph: the problem it solves and for whom.

## Scope

- In scope: ...
- Out of scope: ...

## Triggers

- Should trigger: (the reviewed list from testing)
- Should not trigger: (the reviewed near-misses)

## Runtime contract

- First actions: ...
- Output: ...
- Hard constraints: ...

## Files

| File | Loaded when |
| --- | --- |

## Validation

- Structural: the validator command.
- Behavior tests: cases with the checks each output must pass (see `testing.md` in writing-skills-and-agents).

## Maintenance

- What to update when the docs, the Takt rules or the cited sources change.
```
