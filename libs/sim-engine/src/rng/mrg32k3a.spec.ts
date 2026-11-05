import { catchError } from '../tests/helpers/catch-error.js';
import { drawUniforms } from '../tests/helpers/draw-uniforms.js';
import { summarizeUniforms } from '../tests/helpers/summarize-uniforms.js';
import { createRandomStream, nextUniform, streamStart } from './mrg32k3a.js';

describe('MRG32k3a', () => {
  it.each([
    {
      index: 0n,
      state: {
        s10: 12345,
        s11: 12345,
        s12: 12345,
        s20: 12345,
        s21: 12345,
        s22: 12345,
      },
    },
    {
      index: 1n,
      state: {
        s10: 3692455944,
        s11: 1366884236,
        s12: 2968912127,
        s20: 335948734,
        s21: 4161675175,
        s22: 475798818,
      },
    },
    {
      index: 2n,
      state: {
        s10: 1015873554,
        s11: 1310354410,
        s12: 2249465273,
        s20: 994084013,
        s21: 2912484720,
        s22: 3876682925,
      },
    },
  ])('stream $index starts at the reference state', ({ index, state }) => {
    const start = streamStart(index);

    expect(start).toEqual(state);
  });

  it.each([
    {
      replication: 0,
      uniforms: [
        0.7285097861965271, 0.9655872822837334, 0.9961841304801171,
        0.11498841618131628, 0.9731454191296938,
      ],
    },
    {
      replication: 4,
      uniforms: [
        0.17345453963581106, 0.03286351608941596, 0.26431691296815824,
        0.305940360211673, 0.5476303035177066,
      ],
    },
  ])(
    'stream 2, replication $replication gives the reference uniforms',
    ({ replication, uniforms }) => {
      const stream = createRandomStream(streamStart(2n), replication);

      const values = drawUniforms(stream, 5);

      expect(values).toEqual(uniforms);
    },
  );

  it.each([
    {
      replication: 0,
      state: {
        s10: 707992876,
        s11: 1968324725,
        s12: 399542788,
        s20: 492681029,
        s21: 837044917,
        s22: 650475204,
      },
    },
    {
      replication: 7,
      state: {
        s10: 2270161610,
        s11: 267622712,
        s12: 2316925539,
        s20: 3751391511,
        s21: 542911781,
        s22: 3304212386,
      },
    },
  ])(
    'stream 2^63 + 5, replication $replication starts at the independently computed state',
    ({ replication, state }) => {
      const start = streamStart(2n ** 63n + 5n);

      const stream = createRandomStream(start, replication);

      expect(stream).toEqual(state);
    },
  );

  it('uniforms stay strictly between 0 and 1', () => {
    const stream = createRandomStream(streamStart(0n), 0);

    const summary = summarizeUniforms(stream, 100_000);

    expect(summary.min).toBeGreaterThan(0);
    expect(summary.max).toBeLessThan(1);
  });

  it('stream 2 sums the 100 values after its first to the reference sum', () => {
    const stream = createRandomStream(streamStart(2n), 0);
    nextUniform(stream);

    const summary = summarizeUniforms(stream, 100);

    expect(summary.sum).toBe(53.98590159231507);
  });

  it('rejects a negative replication', () => {
    const start = streamStart(0n);

    const error = catchError(() => createRandomStream(start, -1));

    expect(error).toBeInstanceOf(RangeError);
  });

  it('equal components give m1 times norm, not zero', () => {
    const stream = { s10: 0, s11: 0, s12: 1, s20: 0, s21: 1, s22: 0 };

    const value = nextUniform(stream);

    expect(value).toBe(0.9999999997671695);
  });
});
