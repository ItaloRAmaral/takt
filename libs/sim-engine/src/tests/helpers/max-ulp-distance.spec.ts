import { maxUlpDistance } from './max-ulp-distance.js';

describe('maxUlpDistance', () => {
  it.each([
    {
      label: 'exact results',
      correctlyRounded: '3ff0000000000000',
      distance: 0,
    },
    {
      label: 'a result one double away',
      correctlyRounded: '3ff0000000000001',
      distance: 1,
    },
    {
      label: 'a result two doubles away',
      correctlyRounded: '3ff0000000000002',
      distance: 2,
    },
  ])(
    'maxUlpDistance of $label is $distance',
    ({ correctlyRounded, distance }) => {
      const cases = [
        {
          input: '3ff0000000000000',
          fdlibm: '3ff0000000000000',
          correctlyRounded,
          nearMidpoint: false,
        },
      ];

      const result = maxUlpDistance((x) => x, cases);

      expect(result).toBe(distance);
    },
  );

  it('maxUlpDistance of no cases is 0', () => {
    const result = maxUlpDistance((x) => x, []);

    expect(result).toBe(0);
  });
});
