import { createRandomStream, streamStart } from '../../rng/mrg32k3a.js';
import { sumUniforms } from './sum-uniforms.js';

describe('sumUniforms', () => {
  it('adds the drawn numbers in the order drawn', () => {
    const stream = createRandomStream(streamStart(2n), 0);

    const total = sumUniforms(stream, 3);

    expect(total).toBe(2.6902811989603777);
  });
});
