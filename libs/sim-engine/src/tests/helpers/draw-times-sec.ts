import {
  drawTimeSec,
  type Variability,
} from '../../distributions/variability.js';
import type { RandomStream } from '../../rng/mrg32k3a.js';

/**
 * Draws a time several times in a row from a stream.
 *
 * @param variability - How the time varies.
 * @param stream - The stream to draw from; its state advances.
 * @param sampleCount - How many samples to draw.
 * @returns The samples, in seconds, in the order drawn.
 */
export function drawTimesSec(
  variability: Variability,
  stream: RandomStream,
  sampleCount: number,
): number[] {
  return Array.from({ length: sampleCount }, () =>
    drawTimeSec(variability, stream),
  );
}
