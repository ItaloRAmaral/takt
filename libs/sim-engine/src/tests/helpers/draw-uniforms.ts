import { nextUniform, type RandomStream } from '../../rng/mrg32k3a.js';

/**
 * Draws several uniform numbers in a row from a stream.
 *
 * @param stream - The stream to draw from; its state advances.
 * @param count - How many numbers to draw.
 * @returns The numbers, in the order drawn.
 */
export function drawUniforms(stream: RandomStream, count: number): number[] {
  return Array.from({ length: count }, () => nextUniform(stream));
}
