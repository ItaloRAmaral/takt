const CANONICAL_NAN_BITS = '7ff8000000000000';
const SIGN_BIT = 1n << 63n;

const view = new DataView(new ArrayBuffer(8));

function toOrderedInteger(value: number): bigint {
  view.setFloat64(0, value);

  const bits = view.getBigUint64(0);

  return (bits & SIGN_BIT) === 0n ? bits : -(bits ^ SIGN_BIT);
}

/**
 * Gives the 64 bits of a double as 16 lowercase hexadecimal digits, most
 * significant first. Every `NaN` gives the same bits, because engines may
 * store `NaN` with any encoding.
 *
 * @param value - The double.
 * @returns Its bits, in hexadecimal.
 *
 * @example
 * toBits(1); // '3ff0000000000000'
 */
export function toBits(value: number): string {
  if (Number.isNaN(value)) {
    return CANONICAL_NAN_BITS;
  }

  view.setFloat64(0, value);

  return view.getBigUint64(0).toString(16).padStart(16, '0');
}

/**
 * Gives the double whose 64 bits are written in hexadecimal.
 *
 * @param bits - 16 hexadecimal digits, most significant first.
 * @returns The double.
 *
 * @example
 * fromBits('3ff0000000000000'); // 1
 */
export function fromBits(bits: string): number {
  view.setBigUint64(0, BigInt(`0x${bits}`));

  return view.getFloat64(0);
}

/**
 * Counts the doubles between two values, in the order of the number line:
 * neighbors are 1 apart, and 0 and −0 count as the same point.
 *
 * @param left - A double.
 * @param right - Another double.
 * @returns The distance in units in the last place; 0 for two `NaN`s and
 *   `Infinity` for `NaN` against a number.
 *
 * @example
 * ulpDistance(1, 1.0000000000000002); // 1
 */
export function ulpDistance(left: number, right: number): number {
  if (Number.isNaN(left) || Number.isNaN(right)) {
    return Number.isNaN(left) && Number.isNaN(right) ? 0 : Infinity;
  }

  const difference = toOrderedInteger(left) - toOrderedInteger(right);

  return Number(difference < 0n ? -difference : difference);
}
