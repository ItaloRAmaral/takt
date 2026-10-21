# Writing rules

## Contents

- Shape: simplest first
- Precision pass
- Keep or cut
- Match structure to fragility
- Explain the why
- Style
- Takt rules for content

## Shape: simplest first

Answer in order and stop at the first "yes":

1. Can one file of instructions handle most requests? → **inline**: `SKILL.md` only.
2. Is the complexity optional knowledge (only some requests need it)? → **reference-backed**: short `SKILL.md` routing to `references/`.
3. Is the hard part a fragile, repeatable operation (parsing, validation, checks)? → **script-backed**: add `scripts/`, run them, do not load them.
4. Only now consider: explicit arguments, an isolated fork (`context: fork`), a hook for enforcement, or delegation to agents.

Record the chosen shape and why each simpler one was not enough in `SOURCES.md`. Advanced shapes add files, tokens and failure points; they must replace an ambiguity, not add ceremony. A hook-backed shape needs a security note, because hooks run with the user's full permissions.

## Precision pass

Before adding any rule, section or file, try these in order:

| Action | Use when |
| --- | --- |
| replace | an existing rule is vague, stale or points at the wrong behavior |
| narrow | an existing rule is mostly right but over-triggers or invites extra work |
| move | the content belongs in `SOURCES.md`, `SPEC.md` or a reference |
| delete | it repeats another rule or no longer changes behavior |
| add | nothing above can cover the new behavior precisely |

Run the pass again after every change and say in the hand-over what was replaced, narrowed, moved, deleted or added.

## Keep or cut

| Keep | Cut |
| --- | --- |
| Takt conventions and decisions (cite the ADR, PDR or rule ID) | background Claude already knows |
| non-obvious gotchas | motivation and filler |
| exact commands, schemas, templates | the same rule said twice |
| branch logic and defaults | essays where a table works |
| one strong example | several weak examples |

The context window is shared with everything else Claude is doing; every line must help decide, do or verify something.

## Match structure to fragility

| How bad is a mistake? | Write | Avoid |
| --- | --- | --- |
| high (data loss, security, wrong verdict) | exact steps, strict templates, a validation gate | open-ended advice |
| medium | short checklist plus one example | long rationale |
| low | goal and constraints | over-specified playbooks |

## Explain the why

Give each important rule one sentence of reason. A model that knows why a rule exists applies it to cases the author did not foresee; a bare "MUST" is followed literally or not at all. Reserve all-caps for hard limits (security, irreversible actions), and still give the reason.

## Style

- Imperative voice: "Run the validator", not "The validator should be run".
- State the default path first, alternatives after.
- One term per concept; do not rotate synonyms.
- Each reference answers one lookup question, has a name that predicts its content, sits directly under `references/`, and is listed in `SKILL.md` with "open when...".
- Add a `## Contents` list to references over 100 lines.
- Use paths relative to the skill root inside the skill (`references/x.md`); use repository-relative paths for repository files; never use absolute host paths.

## Takt rules for content

- Files in English; `docs/` stays in pt-BR.
- Examples of code follow `CLAUDE.md`: AAA tests without comments, rule ID in the test name, units in field names, Zod at the edge.
- Point to the docs instead of copying them: cite `docs/adr/0009-...` rather than restating the testing strategy.
- No secrets, personal data, private URLs or long copied passages.
