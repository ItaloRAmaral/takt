import { fromWords, highWord, lowWord } from './float-words.js';

describe('float words', () => {
  it.each([
    { label: '1', value: 1, high: 0x3ff00000 },
    { label: '-0', value: -0, high: -0x80000000 },
    { label: 'the smallest subnormal', value: 5e-324, high: 0 },
    { label: 'the largest double', value: Number.MAX_VALUE, high: 0x7fefffff },
  ])('highWord of $label is $high', ({ value, high }) => {
    const result = highWord(value);

    expect(result).toBe(high);
  });

  it.each([
    { label: '1', value: 1, low: 0 },
    { label: 'the smallest subnormal', value: 5e-324, low: 1 },
    { label: 'the largest double', value: Number.MAX_VALUE, low: 0xffffffff },
  ])('lowWord of $label is $low', ({ value, low }) => {
    const result = lowWord(value);

    expect(result).toBe(low);
  });

  it.each([
    { high: 0x3ff00000, low: 0, label: '1', value: 1 },
    { high: -0x80000000, low: 0, label: '-0', value: -0 },
    { high: 0x80000000, low: 0, label: '-0', value: -0 },
    { high: 0, low: 1, label: 'the smallest subnormal', value: 5e-324 },
    {
      high: 0x7fefffff,
      low: 0xffffffff,
      label: 'the largest double',
      value: Number.MAX_VALUE,
    },
  ])('fromWords($high, $low) is $label', ({ high, low, value }) => {
    const result = fromWords(high, low);

    expect(result).toBe(value);
  });
});
