import { fromBits, toBits, ulpDistance } from './float-bits.js';

describe('float bits', () => {
  it.each([
    { label: '1', value: 1, bits: '3ff0000000000000' },
    { label: '-0', value: -0, bits: '8000000000000000' },
    { label: '-Infinity', value: -Infinity, bits: 'fff0000000000000' },
    {
      label: 'the smallest subnormal',
      value: 5e-324,
      bits: '0000000000000001',
    },
    { label: 'NaN', value: NaN, bits: '7ff8000000000000' },
  ])('toBits of $label is $bits', ({ value, bits }) => {
    const result = toBits(value);

    expect(result).toBe(bits);
  });

  it.each([{ bits: 'fff8000000000000' }, { bits: '7ff0000000000001' }])(
    'toBits of the NaN encoded as $bits is the canonical NaN',
    ({ bits }) => {
      const result = toBits(fromBits(bits));

      expect(result).toBe('7ff8000000000000');
    },
  );

  it.each([
    { bits: '3ff0000000000000', label: '1', value: 1 },
    { bits: '8000000000000000', label: '-0', value: -0 },
    {
      bits: '0000000000000001',
      label: 'the smallest subnormal',
      value: 5e-324,
    },
    {
      bits: '7fefffffffffffff',
      label: 'the largest double',
      value: Number.MAX_VALUE,
    },
  ])('fromBits of $bits is $label', ({ bits, value }) => {
    const result = fromBits(bits);

    expect(result).toBe(value);
  });

  it.each([
    { label: '1 and 1', left: 1, right: 1, distance: 0 },
    {
      label: '1 and the next double',
      left: 1,
      right: 1.0000000000000002,
      distance: 1,
    },
    { label: '2 and 1', left: 2, right: 1, distance: 4503599627370496 },
    { label: '0 and -0', left: 0, right: -0, distance: 0 },
    {
      label: 'the smallest subnormals of each sign',
      left: 5e-324,
      right: -5e-324,
      distance: 2,
    },
    { label: 'two NaNs', left: NaN, right: NaN, distance: 0 },
    { label: 'NaN and 1', left: NaN, right: 1, distance: Infinity },
  ])('ulpDistance between $label is $distance', ({ left, right, distance }) => {
    const result = ulpDistance(left, right);

    expect(result).toBe(distance);
  });
});
