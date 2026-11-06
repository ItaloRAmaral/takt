import { nextUniform, type RandomStream } from '../rng/mrg32k3a.js';
import { exponentialQuantile } from './exponential.js';
import { triangularQuantile } from './triangular.js';
import { truncatedNormalQuantile } from './truncated-normal.js';

/**
 * How a time varies, as the engine runs it: every time in seconds.
 *
 * - `fixed`: always `valueSec`.
 * - `exponential`: exponential with mean `meanSec`.
 * - `triangular`: triangular from `minSec` to `maxSec`, most likely `modeSec`.
 * - `truncatedNormal`: normal with mean `meanSec` and standard deviation
 *   `standardDeviationSec`, truncated to [`minSec`, `maxSec`]; `maxSec` may be
 *   `Infinity`.
 */
export type Variability =
  | {
      readonly kind: 'fixed';
      /** The time, in seconds. */
      readonly valueSec: number;
    }
  | {
      readonly kind: 'exponential';
      /** The mean time, in seconds, above 0. */
      readonly meanSec: number;
    }
  | {
      readonly kind: 'triangular';
      /** The shortest time, in seconds. */
      readonly minSec: number;
      /** The most likely time, in seconds, from `minSec` to `maxSec`. */
      readonly modeSec: number;
      /** The longest time, in seconds, above `minSec`. */
      readonly maxSec: number;
    }
  | {
      readonly kind: 'truncatedNormal';
      /** The mean before truncation, in seconds. */
      readonly meanSec: number;
      /** The standard deviation before truncation, in seconds, above 0. */
      readonly standardDeviationSec: number;
      /** The shortest time, in seconds. */
      readonly minSec: number;
      /** The longest time, in seconds, above `minSec`; may be `Infinity`. */
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

    case 'truncatedNormal':
      return truncatedNormalQuantile(
        nextUniform(stream),
        variability.meanSec,
        variability.standardDeviationSec,
        variability.minSec,
        variability.maxSec,
      );
  }
}
