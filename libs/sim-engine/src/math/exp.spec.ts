import { fdlibmCases } from '../tests/fixtures/fdlibm-cases.js';
import { findFdlibmMismatches } from '../tests/helpers/find-fdlibm-mismatches.js';
import { maxUlpDistance } from '../tests/helpers/max-ulp-distance.js';
import { exp } from './exp.js';

describe('exp', () => {
  it.each([
    { label: '0', x: 0, expected: 1 },
    { label: '-0', x: -0, expected: 1 },
    { label: 'Infinity', x: Infinity, expected: Infinity },
    { label: '-Infinity', x: -Infinity, expected: 0 },
    { label: 'NaN', x: NaN, expected: NaN },
    { label: '1', x: 1, expected: 2.7182818284590455 },
    { label: '-1', x: -1, expected: 0.36787944117144233 },
    { label: '1e-300', x: 1e-300, expected: 1 },
    {
      label: 'the overflow threshold',
      x: 709.782712893384,
      expected: 1.7976931348622732e308,
    },
    {
      label: 'just above the overflow threshold',
      x: 709.7827128933841,
      expected: Infinity,
    },
    {
      label: 'the underflow threshold',
      x: -745.1332191019411,
      expected: 5e-324,
    },
    {
      label: 'just below the underflow threshold',
      x: -745.1332191019412,
      expected: 0,
    },
    { label: '-708.5', x: -708.5, expected: 2.006132305331306e-308 },
  ])('exp of $label is $expected', ({ x, expected }) => {
    const result = exp(x);

    expect(result).toBe(expected);
  });

  it('exp matches fdlibm bit for bit on the reference cases', () => {
    const mismatches = findFdlibmMismatches(exp, fdlibmCases.exp);

    expect(mismatches).toEqual([]);
  });

  it('exp stays within 1 ulp of the correctly rounded value', () => {
    const distance = maxUlpDistance(exp, fdlibmCases.exp);

    expect(distance).toBeLessThanOrEqual(1);
  });
});
