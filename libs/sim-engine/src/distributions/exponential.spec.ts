import { createRandomStream, findStreamStart } from '../rng/mrg32k3a.js';
import { drawTimesSec } from '../tests/helpers/draw-times-sec.js';
import { sampleMean, sampleVariance } from '../tests/helpers/sample-moments.js';
import { exponentialQuantile } from './exponential.js';

describe('exponential', () => {
  it.each([
    { uniform: 0.5, expected: 20.79441541679836 },
    { uniform: 0.75, expected: 41.58883083359672 },
    { uniform: 0.9, expected: 69.07755278982137 },
  ])(
    'exponential quantile of $uniform is $expected',
    ({ uniform, expected }) => {
      const value = exponentialQuantile(uniform, 30);

      expect(value).toBeCloseTo(expected, 12);
    },
  );

  it('exponential samples match the theoretical mean', () => {
    const samples = drawTimesSec(
      { kind: 'exponential', meanSec: 30 },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const mean = sampleMean(samples);

    expect(mean).toBeGreaterThan(29.814);
    expect(mean).toBeLessThan(30.186);
  });

  it('exponential samples match the theoretical variance', () => {
    const samples = drawTimesSec(
      { kind: 'exponential', meanSec: 30 },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const variance = sampleVariance(samples);

    expect(variance).toBeGreaterThan(884.22);
    expect(variance).toBeLessThan(915.78);
  });
});
