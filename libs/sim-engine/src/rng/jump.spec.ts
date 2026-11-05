import { applyMatrix, powerMatrix, type Matrix3 } from './jump.js';

const matrix: Matrix3 = {
  a00: 2n,
  a01: 3n,
  a02: 4n,
  a10: 5n,
  a11: 6n,
  a12: 2n,
  a20: 3n,
  a21: 4n,
  a22: 5n,
};

describe('powerMatrix', () => {
  it('returns the identity for exponent 0', () => {
    const result = powerMatrix(matrix, 0n, 7n);

    expect(result).toEqual({
      a00: 1n,
      a01: 0n,
      a02: 0n,
      a10: 0n,
      a11: 1n,
      a12: 0n,
      a20: 0n,
      a21: 0n,
      a22: 1n,
    });
  });

  it('returns the matrix itself for exponent 1', () => {
    const result = powerMatrix(matrix, 1n, 7n);

    expect(result).toEqual(matrix);
  });

  it('raises the matrix to an odd power of several bits modulo the modulus', () => {
    const result = powerMatrix(matrix, 5n, 7n);

    expect(result).toEqual({
      a00: 4n,
      a01: 5n,
      a02: 2n,
      a10: 6n,
      a11: 6n,
      a12: 1n,
      a20: 5n,
      a21: 2n,
      a22: 2n,
    });
  });
});

describe('applyMatrix', () => {
  it('multiplies the matrix by the vector modulo the modulus', () => {
    const result = applyMatrix(matrix, { x0: 2n, x1: 3n, x2: 4n }, 7n);

    expect(result).toEqual({ x0: 1n, x1: 1n, x2: 3n });
  });
});
