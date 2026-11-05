import { sampleMean, sampleVariance } from './sample-moments.js';

describe('sample moments', () => {
  it.each([
    { values: [1, 2, 3, 4], expected: 2.5 },
    { values: [2, 4, 4, 4, 5, 5, 7, 9], expected: 5 },
  ])('sampleMean of $values is $expected', ({ values, expected }) => {
    const mean = sampleMean(values);

    expect(mean).toBe(expected);
  });

  it.each([
    { values: [1, 2, 3, 4], expected: 1.6666666666666667 },
    { values: [2, 4, 4, 4, 5, 5, 7, 9], expected: 4.571428571428571 },
  ])('sampleVariance of $values is $expected', ({ values, expected }) => {
    const variance = sampleVariance(values);

    expect(variance).toBe(expected);
  });
});
