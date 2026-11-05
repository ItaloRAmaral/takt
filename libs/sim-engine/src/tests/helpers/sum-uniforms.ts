import { nextUniform, type RandomStream } from '../../rng/mrg32k3a.js';

/**
 * Draws several uniform numbers in a row from a stream and adds them, in the
 * order drawn, starting from 0.
 *
 * @param stream - The stream to draw from; its state advances.
 * @param count - How many numbers to draw.
 * @returns The sum of the numbers drawn.
 */
export function sumUniforms(stream: RandomStream, count: number): number {
  let total = 0;

  for (let drawn = 0; drawn < count; drawn += 1) {
    total += nextUniform(stream);
  }

  return total;
}
