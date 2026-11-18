import { findFdlibmMismatches } from './find-fdlibm-mismatches.js';

describe('findFdlibmMismatches', () => {
  it('lists the inputs whose result differs from fdlibm', () => {
    const cases = [
      {
        input: '3ff0000000000000',
        fdlibm: '4000000000000000',
        correctlyRounded: '4000000000000000',
        nearMidpoint: false,
      },
      {
        input: '4000000000000000',
        fdlibm: '4000000000000000',
        correctlyRounded: '4010000000000000',
        nearMidpoint: false,
      },
    ];

    const mismatches = findFdlibmMismatches((x) => x * 2, cases);

    expect(mismatches).toEqual(['4000000000000000']);
  });

  it('treats every NaN as the same result', () => {
    const cases = [
      {
        input: 'bff0000000000000',
        fdlibm: '7ff8000000000000',
        correctlyRounded: '7ff8000000000000',
        nearMidpoint: false,
      },
    ];

    const mismatches = findFdlibmMismatches(() => NaN, cases);

    expect(mismatches).toEqual([]);
  });
});
