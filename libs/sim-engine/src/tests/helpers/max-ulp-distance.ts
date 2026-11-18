import type { FdlibmCase } from '../fixtures/fdlibm-case.js';
import { fromBits, ulpDistance } from './float-bits.js';

/**
 * Finds the largest distance, in units in the last place, between what a
 * function gives and the correctly rounded result, over the reference cases.
 *
 * @param fn - The function under test.
 * @param cases - The reference cases.
 * @returns The largest distance; 0 when there are no cases.
 *
 * @example
 * maxUlpDistance(log, fdlibmCases.log); // 1
 */
export function maxUlpDistance(
  fn: (x: number) => number,
  cases: readonly FdlibmCase[],
): number {
  let largest = 0;

  for (const entry of cases) {
    const result = fn(fromBits(entry.input));

    largest = Math.max(
      largest,
      ulpDistance(result, fromBits(entry.correctlyRounded)),
    );
  }

  return largest;
}
