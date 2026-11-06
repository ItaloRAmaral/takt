import { applyMatrix, powerMatrix, type Matrix3 } from './jump.js';

// L'Ecuyer et al. (2002), MRG32k3a
const M1 = 4294967087;
const M2 = 4294944443;
const A12 = 1403580;
const A13N = 810728;
const A21 = 527612;
const A23N = 1370589;
const NORM = 1 / (M1 + 1);
const PACKAGE_SEED = 12345;
const SUBSTREAMS_PER_STREAM = 2 ** 51;

const M1_BIG = BigInt(M1);
const M2_BIG = BigInt(M2);

const A1: Matrix3 = {
  a00: 0n,
  a01: 1n,
  a02: 0n,
  a10: 0n,
  a11: 0n,
  a12: 1n,
  a20: M1_BIG - BigInt(A13N),
  a21: BigInt(A12),
  a22: 0n,
};
const A2: Matrix3 = {
  a00: 0n,
  a01: 1n,
  a02: 0n,
  a10: 0n,
  a11: 0n,
  a12: 1n,
  a20: M2_BIG - BigInt(A23N),
  a21: 0n,
  a22: BigInt(A21),
};

const A1_STREAM_JUMP = powerMatrix(A1, 2n ** 127n, M1_BIG);
const A2_STREAM_JUMP = powerMatrix(A2, 2n ** 127n, M2_BIG);
const A1_SUBSTREAM_JUMP = powerMatrix(A1, 2n ** 76n, M1_BIG);
const A2_SUBSTREAM_JUMP = powerMatrix(A2, 2n ** 76n, M2_BIG);

const PACKAGE_STATE: StreamStart = {
  s10: PACKAGE_SEED,
  s11: PACKAGE_SEED,
  s12: PACKAGE_SEED,
  s20: PACKAGE_SEED,
  s21: PACKAGE_SEED,
  s22: PACKAGE_SEED,
};

/** The state at the start of a stream: three values per component of the generator. */
export interface StreamStart {
  /** Component 1, the oldest of its three values, in [0, m1). */
  readonly s10: number;
  /** Component 1, the middle value, in [0, m1). */
  readonly s11: number;
  /** Component 1, the newest value, in [0, m1). */
  readonly s12: number;
  /** Component 2, the oldest of its three values, in [0, m2). */
  readonly s20: number;
  /** Component 2, the middle value, in [0, m2). */
  readonly s21: number;
  /** Component 2, the newest value, in [0, m2). */
  readonly s22: number;
}

/** The current state of a stream. Only {@link nextUniform} changes it. */
export interface RandomStream {
  /** Component 1, the oldest of its three values, in [0, m1). */
  s10: number;
  /** Component 1, the middle value, in [0, m1). */
  s11: number;
  /** Component 1, the newest value, in [0, m1). */
  s12: number;
  /** Component 2, the oldest of its three values, in [0, m2). */
  s20: number;
  /** Component 2, the middle value, in [0, m2). */
  s21: number;
  /** Component 2, the newest value, in [0, m2). */
  s22: number;
}

/**
 * Finds where a stream starts: `streamIndex` jumps of 2^127 steps from the
 * package seed, the same state the reference package gives its stream number
 * `streamIndex`.
 *
 * @param streamIndex - The stream number, from 0 to 2^64 − 1.
 * @returns The state at the start of that stream.
 */
export function findStreamStart(streamIndex: bigint): StreamStart {
  return jump(PACKAGE_STATE, A1_STREAM_JUMP, A2_STREAM_JUMP, streamIndex);
}

/**
 * Creates the stream a replication draws from: the substream number
 * `replication` of the stream that starts at `start`, 2^76 steps apart.
 *
 * @param start - Where the stream starts, from {@link findStreamStart}.
 * @param replication - The replication number, from 0 to 2^51 − 1 (the
 *   substreams of a stream).
 * @returns A stream ready for {@link nextUniform}.
 * @throws {RangeError} When `replication` is not an integer from 0 to
 *   2^51 − 1: a negative one or one from 2^51 up would silently reuse another
 *   substream; a fraction or `NaN` is refused by the conversion to `bigint`.
 */
export function createRandomStream(
  start: StreamStart,
  replication: number,
): RandomStream {
  if (replication < 0 || replication >= SUBSTREAMS_PER_STREAM) {
    throw new RangeError('The replication number must be from 0 to 2^51 - 1.');
  }

  return jump(start, A1_SUBSTREAM_JUMP, A2_SUBSTREAM_JUMP, BigInt(replication));
}

function jump(
  state: StreamStart,
  component1Jump: Matrix3,
  component2Jump: Matrix3,
  jumpCount: bigint,
): RandomStream {
  const component1 = applyMatrix(
    powerMatrix(component1Jump, jumpCount, M1_BIG),
    { x0: BigInt(state.s10), x1: BigInt(state.s11), x2: BigInt(state.s12) },
    M1_BIG,
  );

  const component2 = applyMatrix(
    powerMatrix(component2Jump, jumpCount, M2_BIG),
    { x0: BigInt(state.s20), x1: BigInt(state.s21), x2: BigInt(state.s22) },
    M2_BIG,
  );

  return {
    s10: Number(component1.x0),
    s11: Number(component1.x1),
    s12: Number(component1.x2),
    s20: Number(component2.x0),
    s21: Number(component2.x1),
    s22: Number(component2.x2),
  };
}

/**
 * Draws the next uniform number of a stream and advances its state.
 *
 * @param stream - The stream to draw from; its state changes.
 * @returns A number strictly between 0 and 1.
 */
export function nextUniform(stream: RandomStream): number {
  // Every product stays below 2^53 (A12 · s is at most about 6.0e15), so
  // this arithmetic on numbers is exact.
  let p1 = (A12 * stream.s11 - A13N * stream.s10) % M1;

  if (p1 < 0) {
    p1 += M1;
  }

  stream.s10 = stream.s11;
  stream.s11 = stream.s12;
  stream.s12 = p1;

  let p2 = (A21 * stream.s22 - A23N * stream.s20) % M2;

  if (p2 < 0) {
    p2 += M2;
  }

  stream.s20 = stream.s21;
  stream.s21 = stream.s22;
  stream.s22 = p2;

  return p1 > p2 ? (p1 - p2) * NORM : (p1 - p2 + M1) * NORM;
}
