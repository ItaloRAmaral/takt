import { catchError } from './catch-error.js';

describe('catchError', () => {
  it('catchError returns the thrown error', () => {
    const thrown = new Error('expected failure');

    const error = catchError(() => {
      throw thrown;
    });

    expect(error).toBe(thrown);
  });

  it('catchError fails when nothing is thrown', () => {
    const failure = catchError(() => catchError(() => 'no error'));

    expect(failure).toBeInstanceOf(Error);
  });
});
