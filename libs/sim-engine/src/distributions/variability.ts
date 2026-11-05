import { nextUniform, type RandomStream } from '../rng/mrg32k3a.js';
import { exponentialQuantile } from './exponential.js';
import { triangularQuantile } from './triangular.js';

/**
 * How a time varies, as the engine runs it: every time in seconds.
 *
 * - `fixed`: always `valueSec`.
 * - `exponential`: exponential with mean `meanSec`.
 * - `triangular`: triangular from `minSec` to `maxSec`, most likely `modeSec`.
 */
export type Variability =
  | { readonly kind: 'fixed'; readonly valueSec: number }
  | { readonly kind: 'exponential'; readonly meanSec: number }
  | {
      readonly kind: 'triangular';
      readonly minSec: number;
      readonly modeSec: number;
      readonly maxSec: number;
    };

/**
 * Draws a time. A fixed time draws no random number; every other kind
 * draws exactly one, so streams stay in step across scenarios.
 *
 * @param variability - How the time varies.
 * @param stream - The stream to draw from; it advances by at most one number.
 * @returns The time, in seconds.
 *
 * @example
 * drawTimeSec({ kind: 'exponential', meanSec: 30 }, stream);
 */
export function drawTimeSec(
  variability: Variability,
  stream: RandomStream,
): number {
  switch (variability.kind) {
    case 'fixed':
      return variability.valueSec;

    case 'exponential':
      return exponentialQuantile(nextUniform(stream), variability.meanSec);

    case 'triangular':
      return triangularQuantile(
        nextUniform(stream),
        variability.minSec,
        variability.modeSec,
        variability.maxSec,
      );
  }
}
