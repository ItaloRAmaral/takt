/**
 * Gives the exponential time at a uniform number: the quantile function,
 * −mean · ln(1 − uniform).
 *
 * @param uniform - A uniform number in (0, 1).
 * @param meanSec - The mean time, in seconds.
 * @returns The time, in seconds.
 *
 * @example
 * exponentialQuantile(0.5, 30); // 30 · ln 2 ≈ 20.79
 */
export function exponentialQuantile(uniform: number, meanSec: number): number {
  return -meanSec * Math.log(1 - uniform);
}
