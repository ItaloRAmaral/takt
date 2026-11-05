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
  readonly s10: number;
  readonly s11: number;
  readonly s12: number;
  readonly s20: number;
  readonly s21: number;
  readonly s22: number;
}

/** The current state of a stream. Only {@link nextUniform} changes it. */
export interface RandomStream {
  s10: number;
  s11: number;
  s12: number;
  s20: number;
  s21: number;
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
export function streamStart(streamIndex: bigint): StreamStart {
  return jump(PACKAGE_STATE, A1_STREAM_JUMP, A2_STREAM_JUMP, streamIndex);
}

/**
 * Creates the stream a replication draws from: the substream number
 * `replication` of the stream that starts at `start`, 2^76 steps apart.
 *
 * @param start - Where the stream starts, from {@link streamStart}.
 * @param replication - The replication number, zero or positive.
 * @returns A stream ready for {@link nextUniform}.
 * @throws {RangeError} When `replication` is negative.
 */
export function createRandomStream(
  start: StreamStart,
  replication: number,
): RandomStream {
  if (replication < 0) {
    throw new RangeError('The replication number must be zero or positive.');
  }

  return jump(start, A1_SUBSTREAM_JUMP, A2_SUBSTREAM_JUMP, BigInt(replication));
}

function jump(
  state: StreamStart,
  firstJump: Matrix3,
  secondJump: Matrix3,
  times: bigint,
): RandomStream {
  const first = applyMatrix(
    powerMatrix(firstJump, times, M1_BIG),
    { x0: BigInt(state.s10), x1: BigInt(state.s11), x2: BigInt(state.s12) },
    M1_BIG,
  );

  const second = applyMatrix(
    powerMatrix(secondJump, times, M2_BIG),
    { x0: BigInt(state.s20), x1: BigInt(state.s21), x2: BigInt(state.s22) },
    M2_BIG,
  );

  return {
    s10: Number(first.x0),
    s11: Number(first.x1),
    s12: Number(first.x2),
    s20: Number(second.x0),
    s21: Number(second.x1),
    s22: Number(second.x2),
  };
}

/**
 * Draws the next uniform number of a stream and advances its state.
 *
 * @param stream - The stream to draw from; its state changes.
 * @returns A number strictly between 0 and 1.
 */
export function nextUniform(stream: RandomStream): number {
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
