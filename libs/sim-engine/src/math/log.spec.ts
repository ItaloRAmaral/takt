import { fdlibmCases } from '../tests/fixtures/fdlibm-cases.js';
import { findFdlibmMismatches } from '../tests/helpers/find-fdlibm-mismatches.js';
import { maxUlpDistance } from '../tests/helpers/max-ulp-distance.js';
import { log } from './log.js';

describe('log', () => {
  it.each([
    { label: '0', x: 0, expected: -Infinity },
    { label: '-0', x: -0, expected: -Infinity },
    { label: '-1', x: -1, expected: NaN },
    { label: '-Infinity', x: -Infinity, expected: NaN },
    { label: 'Infinity', x: Infinity, expected: Infinity },
    { label: 'NaN', x: NaN, expected: NaN },
    { label: '1', x: 1, expected: 0 },
    { label: '2', x: 2, expected: 0.6931471805599453 },
    {
      label: 'the smallest subnormal',
      x: 5e-324,
      expected: -744.4400719213812,
    },
  ])('log of $label is $expected', ({ x, expected }) => {
    const result = log(x);

    expect(result).toBe(expected);
  });

  it('log matches fdlibm bit for bit on the reference cases', () => {
    const mismatches = findFdlibmMismatches(log, fdlibmCases.log);

    expect(mismatches).toEqual([]);
  });

  it('log stays within 1 ulp of the correctly rounded value', () => {
    const distance = maxUlpDistance(log, fdlibmCases.log);

    expect(distance).toBeLessThanOrEqual(1);
  });
});
