import { relativeError } from './relative-error.js';

describe('relativeError', () => {
  it.each([
    { actual: 101, expected: 100, error: 0.01 },
    { actual: -99, expected: -100, error: 0.01 },
  ])(
    'relativeError of $actual against $expected is $error',
    ({ actual, expected, error }) => {
      const result = relativeError(actual, expected);

      expect(result).toBe(error);
    },
  );
});
