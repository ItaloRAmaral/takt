/**
 * Gives the triangular time at a uniform number: the quantile function, in
 * closed form on each side of the mode.
 *
 * @param uniform - A uniform number in (0, 1).
 * @param minSec - The shortest time, in seconds.
 * @param modeSec - The most likely time, in seconds, from `minSec` to `maxSec`.
 * @param maxSec - The longest time, in seconds, above `minSec`.
 * @returns The time, in seconds, from `minSec` to `maxSec`.
 *
 * @example
 * triangularQuantile(0.25, 10, 20, 50); // 20, the mode
 */
export function triangularQuantile(
  uniform: number,
  minSec: number,
  modeSec: number,
  maxSec: number,
): number {
  const widthSec = maxSec - minSec;

  if (uniform <= (modeSec - minSec) / widthSec) {
    return minSec + Math.sqrt(uniform * widthSec * (modeSec - minSec));
  }

  return maxSec - Math.sqrt((1 - uniform) * widthSec * (maxSec - modeSec));
}
