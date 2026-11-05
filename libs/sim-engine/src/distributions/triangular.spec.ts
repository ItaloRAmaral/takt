import { createRandomStream, findStreamStart } from '../rng/mrg32k3a.js';
import { drawTimesSec } from '../tests/helpers/draw-times-sec.js';
import { sampleMean, sampleVariance } from '../tests/helpers/sample-moments.js';
import { triangularQuantile } from './triangular.js';

describe('triangular', () => {
  it.each([
    { uniform: 0.0625, minSec: 10, modeSec: 20, maxSec: 50, expected: 15 },
    { uniform: 0.25, minSec: 10, modeSec: 20, maxSec: 50, expected: 20 },
    { uniform: 0.8125, minSec: 10, modeSec: 20, maxSec: 50, expected: 35 },
    { uniform: 0.75, minSec: 10, modeSec: 10, maxSec: 50, expected: 30 },
    { uniform: 0.25, minSec: 10, modeSec: 50, maxSec: 50, expected: 30 },
  ])(
    'triangular quantile of $uniform on ($minSec, $modeSec, $maxSec) is $expected',
    ({ uniform, minSec, modeSec, maxSec, expected }) => {
      const value = triangularQuantile(uniform, minSec, modeSec, maxSec);

      expect(value).toBe(expected);
    },
  );

  it('triangular samples match the theoretical mean', () => {
    const samples = drawTimesSec(
      { kind: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const mean = sampleMean(samples);

    expect(mean).toBeGreaterThan(26.6473);
    expect(mean).toBeLessThan(26.686);
  });

  it('triangular samples match the theoretical variance', () => {
    const samples = drawTimesSec(
      { kind: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const variance = sampleVariance(samples);

    expect(variance).toBeGreaterThan(9.6509);
    expect(variance).toBeLessThan(9.7936);
  });
});
