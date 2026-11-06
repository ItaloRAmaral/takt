import { normalCdf, normalQuantile, normalSurvival } from './normal.js';

/**
 * Gives the time of a normal distribution truncated to [`minSec`, `maxSec`]
 * at a uniform number: the quantile function. When the whole interval lies at
 * or above the mean it works with upper tail areas, so an interval far in the
 * tail keeps its precision. The result is clamped to the interval, so rounding
 * never puts it outside.
 *
 * @param uniform - A uniform number in (0, 1).
 * @param meanSec - The mean of the normal before truncation, in seconds.
 * @param standardDeviationSec - Its standard deviation, in seconds, above 0.
 * @param minSec - The shortest time, in seconds.
 * @param maxSec - The longest time, in seconds, above `minSec`; may be
 *   `Infinity`.
 * @returns The time, in seconds, from `minSec` to `maxSec`.
 *
 * @example
 * truncatedNormalQuantile(0.5, 30, 5, 0, Infinity); // 30.00000000618252, the cut at 0 moves the median up
 */
export function truncatedNormalQuantile(
  uniform: number,
  meanSec: number,
  standardDeviationSec: number,
  minSec: number,
  maxSec: number,
): number {
  const lower = (minSec - meanSec) / standardDeviationSec;
  const upper = (maxSec - meanSec) / standardDeviationSec;
  let deviate: number;

  if (lower >= 0) {
    const lowerSurvival = normalSurvival(lower);

    deviate = -normalQuantile(
      lowerSurvival - uniform * (lowerSurvival - normalSurvival(upper)),
    );
  } else {
    const lowerCdf = normalCdf(lower);

    deviate = normalQuantile(
      lowerCdf + uniform * (normalCdf(upper) - lowerCdf),
    );
  }

  const timeSec = meanSec + standardDeviationSec * deviate;

  return Math.min(Math.max(timeSec, minSec), maxSec);
}
