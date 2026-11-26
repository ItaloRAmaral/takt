/** A 3 × 3 matrix of non-negative integers, with entries named by row and column. */
export interface Matrix3 {
  /** Row 0, column 0. */
  readonly a00: bigint;
  /** Row 0, column 1. */
  readonly a01: bigint;
  /** Row 0, column 2. */
  readonly a02: bigint;
  /** Row 1, column 0. */
  readonly a10: bigint;
  /** Row 1, column 1. */
  readonly a11: bigint;
  /** Row 1, column 2. */
  readonly a12: bigint;
  /** Row 2, column 0. */
  readonly a20: bigint;
  /** Row 2, column 1. */
  readonly a21: bigint;
  /** Row 2, column 2. */
  readonly a22: bigint;
}

/** A column vector of three non-negative integers. */
export interface Vector3 {
  /** Entry 0. */
  readonly x0: bigint;
  /** Entry 1. */
  readonly x1: bigint;
  /** Entry 2. */
  readonly x2: bigint;
}

const identity: Matrix3 = {
  a00: 1n,
  a01: 0n,
  a02: 0n,
  a10: 0n,
  a11: 1n,
  a12: 0n,
  a20: 0n,
  a21: 0n,
  a22: 1n,
};

function multiplyMatrices(
  left: Matrix3,
  right: Matrix3,
  modulus: bigint,
): Matrix3 {
  return {
    a00:
      (left.a00 * right.a00 + left.a01 * right.a10 + left.a02 * right.a20) %
      modulus,
    a01:
      (left.a00 * right.a01 + left.a01 * right.a11 + left.a02 * right.a21) %
      modulus,
    a02:
      (left.a00 * right.a02 + left.a01 * right.a12 + left.a02 * right.a22) %
      modulus,
    a10:
      (left.a10 * right.a00 + left.a11 * right.a10 + left.a12 * right.a20) %
      modulus,
    a11:
      (left.a10 * right.a01 + left.a11 * right.a11 + left.a12 * right.a21) %
      modulus,
    a12:
      (left.a10 * right.a02 + left.a11 * right.a12 + left.a12 * right.a22) %
      modulus,
    a20:
      (left.a20 * right.a00 + left.a21 * right.a10 + left.a22 * right.a20) %
      modulus,
    a21:
      (left.a20 * right.a01 + left.a21 * right.a11 + left.a22 * right.a21) %
      modulus,
    a22:
      (left.a20 * right.a02 + left.a21 * right.a12 + left.a22 * right.a22) %
      modulus,
  };
}

/**
 * Raises a matrix to a power modulo `modulus`, by binary exponentiation.
 *
 * @param matrix - The base, with entries in [0, modulus).
 * @param exponent - The power, zero or positive.
 * @param modulus - The modulus of every entry.
 * @returns `matrix` to the power `exponent`, modulo `modulus`.
 */
export function powerMatrix(
  matrix: Matrix3,
  exponent: bigint,
  modulus: bigint,
): Matrix3 {
  let result = identity;
  let base = matrix;
  let remaining = exponent;

  while (remaining > 0n) {
    if (remaining % 2n === 1n) {
      result = multiplyMatrices(result, base, modulus);
    }

    base = multiplyMatrices(base, base, modulus);
    remaining /= 2n;
  }

  return result;
}

/**
 * Multiplies a matrix by a column vector modulo `modulus`.
 *
 * @param matrix - The matrix, with entries in [0, modulus).
 * @param vector - The vector, with entries in [0, modulus).
 * @param modulus - The modulus of every entry.
 * @returns The product, modulo `modulus`.
 */
export function applyMatrix(
  matrix: Matrix3,
  vector: Vector3,
  modulus: bigint,
): Vector3 {
  return {
    x0:
      (matrix.a00 * vector.x0 +
        matrix.a01 * vector.x1 +
        matrix.a02 * vector.x2) %
      modulus,
    x1:
      (matrix.a10 * vector.x0 +
        matrix.a11 * vector.x1 +
        matrix.a12 * vector.x2) %
      modulus,
    x2:
      (matrix.a20 * vector.x0 +
        matrix.a21 * vector.x1 +
        matrix.a22 * vector.x2) %
      modulus,
  };
}

/**
 * Lists a matrix raised to the powers 2^0, 2^1, …, 2^(count − 1) modulo
 * `modulus`, so a jump by any exponent below 2^count needs only
 * matrix-by-vector products ({@link applyPowerTable}).
 *
 * @param matrix - The base, with entries in [0, modulus).
 * @param count - How many powers of two to list.
 * @param modulus - The modulus of every entry.
 * @returns The powers, the k-th being `matrix` to the power 2^k.
 *
 * @example
 * const table = powerOfTwoTable(a1StreamJump, 64, m1); // jumps of up to 2^64 − 1 streams
 */
export function powerOfTwoTable(
  matrix: Matrix3,
  count: number,
  modulus: bigint,
): Matrix3[] {
  const table: Matrix3[] = [];
  let power = matrix;

  for (let k = 0; k < count; k++) {
    table.push(power);
    power = multiplyMatrices(power, power, modulus);
  }

  return table;
}

/**
 * Multiplies a vector by a matrix raised to `exponent` modulo `modulus`,
 * applying one entry of a {@link powerOfTwoTable} for each bit set in the
 * exponent. The powers of one matrix commute, so the order of the bits does
 * not change the result.
 *
 * @param table - The matrix to the powers 2^0, 2^1, …, from {@link powerOfTwoTable}.
 * @param exponent - The power, from 0 to 2^(table length) − 1.
 * @param vector - The vector, with entries in [0, modulus).
 * @param modulus - The modulus of every entry.
 * @returns The product, modulo `modulus`.
 * @throws {RangeError} When the exponent has a bit beyond the table: a defect
 *   of the caller, which would otherwise jump by the wrong amount in silence.
 *
 * @example
 * applyPowerTable(table, 5n, state, m1); // the matrix to the power 5, applied to the state
 */
export function applyPowerTable(
  table: readonly Matrix3[],
  exponent: bigint,
  vector: Vector3,
  modulus: bigint,
): Vector3 {
  if (exponent >> BigInt(table.length) !== 0n) {
    throw new RangeError('The exponent has a bit beyond the power table.');
  }

  let result = vector;

  table.forEach((power, k) => {
    if (((exponent >> BigInt(k)) & 1n) !== 0n) {
      result = applyMatrix(power, result, modulus);
    }
  });

  return result;
}
