import type { TimeDistribution } from '@takt/plant-schema';
import type { Variability } from '../distributions/variability.js';

/**
 * Converts a time distribution of the plant document to the variability the
 * engine draws from: `dist` becomes `kind`, and a truncated normal without a
 * maximum gets `Infinity`.
 *
 * @param distribution - A validated time distribution, in seconds.
 * @returns The same distribution, in seconds.
 *
 * @example
 * toVariability({ dist: 'exponential', meanSec: 30 }); // { kind: 'exponential', meanSec: 30 }
 */
export function toVariability(distribution: TimeDistribution): Variability {
  switch (distribution.dist) {
    case 'fixed':
      return { kind: 'fixed', valueSec: distribution.valueSec };

    case 'exponential':
      return { kind: 'exponential', meanSec: distribution.meanSec };

    case 'triangular':
      return {
        kind: 'triangular',
        minSec: distribution.minSec,
        modeSec: distribution.modeSec,
        maxSec: distribution.maxSec,
      };

    case 'truncatedNormal':
      return {
        kind: 'truncatedNormal',
        meanSec: distribution.meanSec,
        standardDeviationSec: distribution.standardDeviationSec,
        minSec: distribution.minSec,
        maxSec: distribution.maxSec ?? Infinity,
      };
  }
}
