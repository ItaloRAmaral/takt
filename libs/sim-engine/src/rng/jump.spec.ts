import { catchError } from '../tests/helpers/catch-error.js';
import {
  applyMatrix,
  applyPowerTable,
  powerMatrix,
  powerOfTwoTable,
  type Matrix3,
} from './jump.js';

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

describe('powerOfTwoTable', () => {
  it('lists the matrix to the powers 1, 2, 4 and 8 modulo the modulus', () => {
    const table = powerOfTwoTable(matrix, 4, 7n);

    expect(table).toEqual([
      {
        a00: 2n,
        a01: 3n,
        a02: 4n,
        a10: 5n,
        a11: 6n,
        a12: 2n,
        a20: 3n,
        a21: 4n,
        a22: 5n,
      },
      {
        a00: 3n,
        a01: 5n,
        a02: 6n,
        a10: 4n,
        a11: 3n,
        a12: 0n,
        a20: 6n,
        a21: 4n,
        a22: 3n,
      },
      {
        a00: 2n,
        a01: 5n,
        a02: 1n,
        a10: 3n,
        a11: 1n,
        a12: 3n,
        a20: 3n,
        a21: 5n,
        a22: 3n,
      },
      {
        a00: 1n,
        a01: 6n,
        a02: 6n,
        a10: 4n,
        a11: 3n,
        a12: 1n,
        a20: 2n,
        a21: 0n,
        a22: 6n,
      },
    ]);
  });
});

describe('applyPowerTable', () => {
  it.each([
    { exponent: 0n, result: { x0: 2n, x1: 3n, x2: 4n } },
    { exponent: 5n, result: { x0: 3n, x1: 6n, x2: 3n } },
    { exponent: 11n, result: { x0: 0n, x1: 4n, x2: 5n } },
    { exponent: 15n, result: { x0: 4n, x1: 5n, x2: 0n } },
  ])(
    'applies the matrix to the power $exponent by the set bits of the exponent',
    ({ exponent, result }) => {
      const table = powerOfTwoTable(matrix, 4, 7n);

      const vector = applyPowerTable(
        table,
        exponent,
        { x0: 2n, x1: 3n, x2: 4n },
        7n,
      );

      expect(vector).toEqual(result);
    },
  );

  it('refuses an exponent with a bit beyond its table', () => {
    const table = powerOfTwoTable(matrix, 4, 7n);

    const error = catchError(() =>
      applyPowerTable(table, 16n, { x0: 2n, x1: 3n, x2: 4n }, 7n),
    );

    expect(error).toBeInstanceOf(RangeError);
  });
});
