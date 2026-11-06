import { createRandomStream, findStreamStart } from '../rng/mrg32k3a.js';
import { drawTimeSec } from './variability.js';

const stateAfterOneDraw = {
  s10: 1310354410,
  s11: 2249465273,
  s12: 2190708468,
  s20: 2912484720,
  s21: 3876682925,
  s22: 3356750000,
};

describe('drawTimeSec', () => {
  it('RN-SIM-010: a fixed variability draws no random number', () => {
    const stream = createRandomStream(findStreamStart(2n), 0);

    const value = drawTimeSec({ kind: 'fixed', valueSec: 40 }, stream);

    expect(value).toBe(40);
    expect(stream).toEqual({
      s10: 1015873554,
      s11: 1310354410,
      s12: 2249465273,
      s20: 994084013,
      s21: 2912484720,
      s22: 3876682925,
    });
  });

  it('RN-SIM-010: an exponential variability inverts exactly one random number', () => {
    const stream = createRandomStream(findStreamStart(2n), 0);

    const value = drawTimeSec({ kind: 'exponential', meanSec: 30 }, stream);

    expect(value).toBeCloseTo(39.11487555541597, 10);
    expect(stream).toEqual(stateAfterOneDraw);
  });

  it('RN-SIM-010: a triangular variability inverts exactly one random number', () => {
    const stream = createRandomStream(findStreamStart(2n), 0);

    const value = drawTimeSec(
      { kind: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
      stream,
    );

    expect(value).toBe(28.618500797577347);
    expect(stream).toEqual(stateAfterOneDraw);
  });

  it('RN-SIM-010: a truncated normal variability inverts exactly one random number', () => {
    const stream = createRandomStream(findStreamStart(2n), 0);

    const value = drawTimeSec(
      {
        kind: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: 40,
      },
      stream,
    );

    expect(value).toBeCloseTo(32.79524840575249, 12);
    expect(stream).toEqual(stateAfterOneDraw);
  });
});
