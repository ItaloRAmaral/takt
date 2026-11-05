import { createRandomStream, findStreamStart } from '../../rng/mrg32k3a.js';
import { summarizeUniforms } from './summarize-uniforms.js';

describe('summarizeUniforms', () => {
  it('gives the smallest, the largest and the sum in the order drawn', () => {
    const stream = createRandomStream(findStreamStart(2n), 0);

    const summary = summarizeUniforms(stream, 3);

    expect(summary).toEqual({
      min: 0.7285097861965271,
      max: 0.9961841304801171,
      sum: 2.6902811989603777,
    });
  });
});
