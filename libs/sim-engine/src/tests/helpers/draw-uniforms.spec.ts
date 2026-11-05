import { createRandomStream, streamStart } from '../../rng/mrg32k3a.js';
import { drawUniforms } from './draw-uniforms.js';

describe('drawUniforms', () => {
  it('drawUniforms returns the requested count', () => {
    const stream = createRandomStream(streamStart(0n), 0);

    const values = drawUniforms(stream, 7);

    expect(values).toHaveLength(7);
  });
});
