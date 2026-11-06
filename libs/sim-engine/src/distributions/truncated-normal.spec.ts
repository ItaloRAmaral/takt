import { createRandomStream, findStreamStart } from '../rng/mrg32k3a.js';
import { drawTimesSec } from '../tests/helpers/draw-times-sec.js';
import { sampleMean, sampleVariance } from '../tests/helpers/sample-moments.js';
import { truncatedNormalQuantile } from './truncated-normal.js';

describe('truncated normal', () => {
  it.each([
    {
      uniform: 0.3,
      lower: -1,
      upper: 1,
      expected: -0.34921993245688215,
      digits: 14,
    },
    {
      uniform: 0.5,
      lower: 0,
      upper: Infinity,
      expected: 0.6744897501960817,
      digits: 14,
    },
    {
      uniform: 0.999999999,
      lower: 0,
      upper: Infinity,
      expected: 6.109410209383449,
      digits: 14,
    },
    {
      uniform: 0.5,
      lower: 8,
      upper: 9,
      expected: 8.084888899018166,
      digits: 8,
    },
    {
      uniform: 0.1,
      lower: 8,
      upper: 9,
      expected: 8.012960571504209,
      digits: 8,
    },
    {
      uniform: 0.5,
      lower: 9,
      upper: 10,
      expected: 9.075779713738545,
      digits: 8,
    },
    {
      uniform: 0.5,
      lower: -9,
      upper: -8,
      expected: -8.084888899018166,
      digits: 8,
    },
  ])(
    'truncated normal on [$lower, $upper] matches the reference at u = $uniform',
    ({ uniform, lower, upper, expected, digits }) => {
      const value = truncatedNormalQuantile(uniform, 0, 1, lower, upper);

      expect(value).toBeCloseTo(expected, digits);
    },
  );

  it.each([
    { meanSec: 0, deviationSec: 1, minSec: 40, maxSec: 41, edge: 40 },
    { meanSec: 0, deviationSec: 1, minSec: -41, maxSec: -40, edge: -40 },
    { meanSec: 0, deviationSec: 1, minSec: 40, maxSec: Infinity, edge: 40 },
    { meanSec: 30, deviationSec: 5, minSec: 220, maxSec: Infinity, edge: 220 },
  ])(
    'puts a zero-mass truncation of mean $meanSec on [$minSec, $maxSec] at its edge $edge, the nearest to the mean',
    ({ meanSec, deviationSec, minSec, maxSec, edge }) => {
      const value = truncatedNormalQuantile(
        0.5,
        meanSec,
        deviationSec,
        minSec,
        maxSec,
      );

      expect(value).toBe(edge);
    },
  );

  it('truncated normal samples match the theoretical mean', () => {
    const samples = drawTimesSec(
      {
        kind: 'truncatedNormal',
        meanSec: 10,
        standardDeviationSec: 1,
        minSec: 9,
        maxSec: 11,
      },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const mean = sampleMean(samples);

    expect(mean).toBeGreaterThan(9.99665);
    expect(mean).toBeLessThan(10.00335);
  });

  it('truncated normal samples match the theoretical variance', () => {
    const samples = drawTimesSec(
      {
        kind: 'truncatedNormal',
        meanSec: 10,
        standardDeviationSec: 1,
        minSec: 9,
        maxSec: 11,
      },
      createRandomStream(findStreamStart(0n), 0),
      100_000,
    );

    const variance = sampleVariance(samples);

    expect(variance).toBeGreaterThan(0.28937);
    expect(variance).toBeLessThan(0.29288);
  });
});
