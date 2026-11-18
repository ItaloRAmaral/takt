import type { FdlibmCase } from '../fixtures/fdlibm-case.js';
import { fromBits, toBits } from './float-bits.js';

/**
 * Finds the reference cases where a function does not give the same bits as
 * fdlibm 5.3. Every `NaN` counts as the same result.
 *
 * @param fn - The function under test.
 * @param cases - The reference cases.
 * @returns The inputs, in hexadecimal, whose result differs; empty when the
 *   function matches fdlibm on every case.
 *
 * @example
 * findFdlibmMismatches(log, fdlibmCases.log); // []
 */
export function findFdlibmMismatches(
  fn: (x: number) => number,
  cases: readonly FdlibmCase[],
): string[] {
  return cases
    .filter((entry) => toBits(fn(fromBits(entry.input))) !== entry.fdlibm)
    .map((entry) => entry.input);
}
