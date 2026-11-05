/** A 3 × 3 matrix of non-negative integers, with entries named by row and column. */
export interface Matrix3 {
  readonly a00: bigint;
  readonly a01: bigint;
  readonly a02: bigint;
  readonly a10: bigint;
  readonly a11: bigint;
  readonly a12: bigint;
  readonly a20: bigint;
  readonly a21: bigint;
  readonly a22: bigint;
}

/** A column vector of three non-negative integers. */
export interface Vector3 {
  readonly x0: bigint;
  readonly x1: bigint;
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
