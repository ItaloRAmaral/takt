import { relativeError } from '../tests/helpers/relative-error.js';
import { normalCdf, normalQuantile, normalSurvival } from './normal.js';

describe('normal', () => {
  it.each([
    { p: 0.25, expected: -0.6744897501960817 },
    { p: 0.001, expected: -3.090232306167814 },
    { p: 1e-20, expected: -9.262340089798409 },
    { p: 0.5, expected: 0 },
    { p: 0.975, expected: 1.9599639845400536 },
    { p: 1e-10, expected: -6.361340902404056 },
    { p: 0.9999999999, expected: 6.361340889697421 },
  ])('normal quantile of $p matches the reference', ({ p, expected }) => {
    const quantile = normalQuantile(p);

    expect(quantile).toBeCloseTo(expected, 13);
  });

  it.each([
    { p: 0, expected: -Infinity },
    { p: 1, expected: Infinity },
  ])('normal quantile of $p is $expected', ({ p, expected }) => {
    const quantile = normalQuantile(p);

    expect(quantile).toBe(expected);
  });

  it.each([
    { x: -37, expected: 5.725571222524577e-300, maxRelativeError: 1e-12 },
    { x: -10, expected: 7.619853024160525e-24, maxRelativeError: 2e-8 },
    { x: -8, expected: 6.220960574271784e-16, maxRelativeError: 2e-8 },
    { x: -5, expected: 2.866515718791939e-7, maxRelativeError: 1e-10 },
    { x: -4, expected: 3.1671241833119924e-5, maxRelativeError: 1e-12 },
    { x: -3, expected: 0.0013498980316300946, maxRelativeError: 1e-13 },
    { x: -1, expected: 0.15865525393145705, maxRelativeError: 1e-13 },
    { x: 0, expected: 0.5, maxRelativeError: 1e-13 },
    { x: 1, expected: 0.8413447460685429, maxRelativeError: 1e-13 },
    { x: 3, expected: 0.9986501019683699, maxRelativeError: 1e-13 },
  ])(
    'normal cdf of $x matches the reference',
    ({ x, expected, maxRelativeError }) => {
      const cdf = normalCdf(x);

      expect(relativeError(cdf, expected)).toBeLessThan(maxRelativeError);
    },
  );

  it('normal cdf is 0 below -37, where the Hart approximation stops', () => {
    const cdf = normalCdf(-37.5);

    expect(cdf).toBe(0);
  });

  it.each([
    { x: 1, expected: 0.15865525393145705, maxRelativeError: 1e-13 },
    { x: 4, expected: 3.1671241833119924e-5, maxRelativeError: 1e-12 },
    { x: 8, expected: 6.220960574271784e-16, maxRelativeError: 2e-8 },
    { x: 10, expected: 7.619853024160525e-24, maxRelativeError: 2e-8 },
  ])(
    'normal survival of $x matches the reference',
    ({ x, expected, maxRelativeError }) => {
      const survival = normalSurvival(x);

      expect(relativeError(survival, expected)).toBeLessThan(maxRelativeError);
    },
  );
});
