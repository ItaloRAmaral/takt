/**
 * Computes how far a value is from the expected one, relative to the size of
 * the expected one.
 *
 * @param actual - The value obtained.
 * @param expected - The reference value, not 0.
 * @returns |actual − expected| / |expected|.
 */
export function relativeError(actual: number, expected: number): number {
  return Math.abs(actual - expected) / Math.abs(expected);
}
