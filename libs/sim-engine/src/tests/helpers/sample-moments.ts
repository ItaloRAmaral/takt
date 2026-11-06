/**
 * Computes the mean of a sample.
 *
 * @param values - The sample, with at least one value.
 * @returns The sum of the values divided by their count.
 */
export function sampleMean(values: readonly number[]): number {
  let sum = 0;

  for (const value of values) {
    sum += value;
  }

  return sum / values.length;
}

/**
 * Computes the variance of a sample, with divisor n − 1.
 *
 * @param values - The sample, with at least two values.
 * @returns The sum of the squared deviations from the mean, divided by n − 1.
 */
export function sampleVariance(values: readonly number[]): number {
  const mean = sampleMean(values);
  let sumOfSquares = 0;

  for (const value of values) {
    sumOfSquares += (value - mean) ** 2;
  }

  return sumOfSquares / (values.length - 1);
}
