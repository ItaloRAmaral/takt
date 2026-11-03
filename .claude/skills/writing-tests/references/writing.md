# Writing a test

## Contents

- Structure
- Names
- Expected values
- Data
- Doubles
- Levels
- Example

## Structure

- **Arrange, Act, Assert**, separated by one blank line, **with no comments** (ADR-0009).
- **One Act per test.** Two actions are two tests.
- **No logic in the test:** no `if`, loops or computed expectations deciding what to assert. Logic in a test is code without a test.
- **One behavior per test.** An "and" in the name means two tests.
- **Case tables (`it.each`)** are allowed for boundaries and variants, under four conditions: every row has the same behavior and assertion shape; the table holds only literals; the body has no `if`; the name starts with the ID and shows the varying value (Vitest fills `%i`, `%s` from the row). Success and error cases with different shapes go in separate tables. A table that needs an `if` in its body is two tests pretending to be one.
- Test through the public boundary (the seam), never private functions or internal state.

## Names

- Start with the ID of the rule or use case it proves: `RN-PLT-002: refuses to publish a real plant`. In English, like all code.
- After the ID, describe the behavior (what), not the mechanism (how).
- No ID available: see `scenarios.md`, "When a scenario has no rule".

## Expected values

- **Derive them independently:** a literal, a value worked out by hand, the example from the rule, or a published reference value (literature cases for the engine, with the source cited in the test data). Never compute the expected value with the code under test or its helpers: that test passes no matter what the code does.
- **No change detectors:** do not assert a constant's value, an exact message, or private structure. Assert the behavior that depends on it (not "`MAX_RETRIES` is 5" but "the sixth attempt never happens").
- Errors are asserted by **code** (`FORBIDDEN`), never by message.

## Data

- **Factories** with fixed data and overrides: `makePlant({ kind: 'real' })`. Each test creates its own data; no test depends on another's.
- **No randomness without a fixed seed.** Property tests (fast-check) use a fixed seed; engine tests use a fixed simulation seed.
- **Only fake data,** never real or production data (ADR-0009, security risks).

## Doubles

- **Prefer the real thing.** In the API, use the in-memory adapters of the ports (ADR-0002), not library mocks of your own classes.
- **Fake only at system boundaries:** time (`Clock`), IDs (`IdGenerator`), external services. Never mock code you own.
- **Never assert on a double** ("was called with"), unless the call itself is the contract (an audit entry written, an e-mail sent). Assert the outcome a caller sees.
- A fake that accepts anything verifies nothing: each branch (success, error) gets its own fixture.
- Cleanup used only by tests lives in test utilities, never in production classes.

## Levels

Choose the level from ADR-0009; do not invent others.

| Level | For | Notes |
| --- | --- | --- |
| unit | entities, value objects, domain services, use cases (with in-memory adapters), engine functions | milliseconds; no database |
| integration | Prisma repositories, RLS, isolation between organizations, policy catalog | real PostgreSQL, one database per Vitest worker, user `takt_app` |
| API | role × route matrix, validation, error format, canonical log line | response validated against the output Zod schema |
| property | invariants over generated input (engine: Little's law, conservation of parts) | fast-check with a fixed seed |
| end to end | demo story, login, import/export, multi-user rules | Playwright; the 3D scene is tested by the state it draws, never by pixels |

## Example

```ts
describe('Plant.publishTo', () => {
  it('RN-PLT-002: refuses to publish a real plant', () => {
    const plant = makePlant({ kind: 'real' });
    const group = makeGroup();

    const error = catchError(() => plant.publishTo(group.id));

    expect(error).toMatchObject({ code: 'FORBIDDEN' });
  });
});
```

Expected errors are exceptions with a `code` (ADR-0013). In sync code, `catchError` keeps the Act on its own line; in async code, the Act is the call (`const promise = useCase.execute(command);`) and the Assert is `await expect(promise).rejects.toMatchObject({ code: 'FORBIDDEN' })`. Never `expect(() => ...).toThrow()`, and never assert on the message.
