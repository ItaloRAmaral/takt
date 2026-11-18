// The byte order is explicit (DataView reads and writes most significant byte
// first by default), so the words are the same on every platform.
const view = new DataView(new ArrayBuffer(8));

/**
 * Gives the high 32 bits of a double (sign, exponent and the top 20 bits of
 * the significand) as a signed integer, like fdlibm's `__HI(x)`.
 *
 * @param x - The double.
 * @returns The high word, from −2^31 to 2^31 − 1.
 *
 * @example
 * highWord(1); // 0x3ff00000
 */
export function highWord(x: number): number {
  view.setFloat64(0, x);

  return view.getInt32(0);
}

/**
 * Gives the low 32 bits of a double's significand as an unsigned integer,
 * like fdlibm's `__LO(x)`.
 *
 * @param x - The double.
 * @returns The low word, from 0 to 2^32 − 1.
 *
 * @example
 * lowWord(5e-324); // 1
 */
export function lowWord(x: number): number {
  view.setFloat64(0, x);

  return view.getUint32(4);
}

/**
 * Builds a double from its high and low 32-bit words.
 *
 * @param high - The high word, signed or unsigned; only its 32 bits count.
 * @param low - The low word; only its 32 bits count.
 * @returns The double.
 *
 * @example
 * fromWords(0x3ff00000, 0); // 1
 */
export function fromWords(high: number, low: number): number {
  view.setUint32(0, high);
  view.setUint32(4, low);

  return view.getFloat64(0);
}
