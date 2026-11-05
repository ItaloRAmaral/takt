import { createRandomStream, findStreamStart } from '../../rng/mrg32k3a.js';
import { drawTimesSec } from './draw-times-sec.js';

describe('drawTimesSec', () => {
  it('drawTimesSec returns the requested count of samples', () => {
    const stream = createRandomStream(findStreamStart(0n), 0);

    const samples = drawTimesSec({ kind: 'fixed', valueSec: 40 }, stream, 3);

    expect(samples).toEqual([40, 40, 40]);
  });
});
