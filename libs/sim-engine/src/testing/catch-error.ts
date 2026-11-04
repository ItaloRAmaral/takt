/**
 * Runs a call that is expected to throw and returns what it threw, so a test
 * can assert on the error separately from the call.
 *
 * @param act - The call under test.
 * @returns The value `act` threw.
 * @throws {Error} When `act` returns without throwing.
 *
 * @example
 * const error = catchError(() => engine.run(plant));
 *
 * expect(error).toMatchObject({ code: 'INVALID_PLANT' });
 */
export function catchError(act: () => unknown): unknown {
  try {
    act();
  } catch (error: unknown) {
    return error;
  }
  throw new Error('Expected the call to throw, but it returned normally.');
}
