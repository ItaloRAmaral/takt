import { nextUniform, type RandomStream } from '../../rng/mrg32k3a.js';

/** The smallest, the largest and the sum of numbers drawn from a stream. */
export interface UniformSummary {
  /** The smallest number drawn. */
  readonly min: number;
  /** The largest number drawn. */
  readonly max: number;
  /** The sum, added in the order drawn, starting from 0. */
  readonly sum: number;
}

/**
 * Draws several uniform numbers in a row from a stream and summarizes them,
 * without keeping them all.
 *
 * @param stream - The stream to draw from; its state advances.
 * @param count - How many numbers to draw.
 * @returns The smallest, the largest and the sum of the numbers drawn.
 */
export function summarizeUniforms(
  stream: RandomStream,
  count: number,
): UniformSummary {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (let drawn = 0; drawn < count; drawn += 1) {
    const value = nextUniform(stream);

    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }

  return { min, max, sum };
}
