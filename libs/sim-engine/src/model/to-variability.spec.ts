import { toVariability } from './to-variability.js';

describe('toVariability', () => {
  it.each([
    {
      label: 'fixed',
      distribution: { dist: 'fixed', valueSec: 5 },
      variability: { kind: 'fixed', valueSec: 5 },
    },
    {
      label: 'exponential',
      distribution: { dist: 'exponential', meanSec: 30 },
      variability: { kind: 'exponential', meanSec: 30 },
    },
    {
      label: 'triangular',
      distribution: { dist: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
      variability: { kind: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
    },
    {
      label: 'truncated normal with a maximum',
      distribution: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: 60,
      },
      variability: {
        kind: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: 60,
      },
    },
    {
      label: 'truncated normal without a maximum',
      distribution: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: null,
      },
      variability: {
        kind: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: Infinity,
      },
    },
  ] as const)(
    'converts a $label time distribution to the engine variability',
    ({ distribution, variability }) => {
      const converted = toVariability(distribution);

      expect(converted).toEqual(variability);
    },
  );
});
