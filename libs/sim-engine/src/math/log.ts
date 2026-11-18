/*!
 * ====================================================
 * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
 *
 * Developed at SunSoft, a Sun Microsystems, Inc. business.
 * Permission to use, copy, modify, and distribute this
 * software is freely granted, provided that this notice
 * is preserved.
 * ====================================================
 */

// fdlibm 5.3, e_log.c (1.3, 95/01/18)
import { fromWords, highWord, lowWord } from './float-words.js';

const LN2_HI = 0.6931471803691238;
const LN2_LO = 1.9082149292705877e-10;
const TWO54 = 18014398509481984;
const LG1 = 0.6666666666666735;
const LG2 = 0.3999999999940942;
const LG3 = 0.2857142874366239;
const LG4 = 0.22222198432149784;
const LG5 = 0.1818357216161805;
const LG6 = 0.15313837699209373;
const LG7 = 0.14798198605116586;

/**
 * Gives the natural logarithm, with the same bits in every JavaScript engine:
 * only the four operations and bit operations, which the specification makes
 * exact, unlike `Math.log`. Error below 1 ulp.
 *
 * @param x - The number.
 * @returns ln x; −∞ for ±0, `NaN` below 0 and for `NaN`, +∞ for +∞.
 *
 * @example
 * log(2); // 0.6931471805599453
 */
export function log(x: number): number {
  let value = x;
  let hx = highWord(value);
  let k = 0;

  if (hx < 0x00100000) {
    if (((hx & 0x7fffffff) | lowWord(value)) === 0) {
      return -TWO54 / 0;
    }

    if (hx < 0) {
      return (value - value) / 0;
    }

    k -= 54;
    value *= TWO54;
    hx = highWord(value);
  }

  if (hx >= 0x7ff00000) {
    return value + value;
  }

  k += (hx >> 20) - 1023;
  hx &= 0x000fffff;
  let i = (hx + 0x95f64) & 0x100000;
  value = fromWords(hx | (i ^ 0x3ff00000), lowWord(value));
  k += i >> 20;
  const f = value - 1;
  const dk = k;

  if ((0x000fffff & (2 + hx)) < 3) {
    if (f === 0) {
      return k === 0 ? 0 : dk * LN2_HI + dk * LN2_LO;
    }

    const r = f * f * (0.5 - 0.3333333333333333 * f);

    return k === 0 ? f - r : dk * LN2_HI - (r - dk * LN2_LO - f);
  }

  const s = f / (2 + f);
  const z = s * s;
  i = hx - 0x6147a;
  const w = z * z;
  const j = 0x6b851 - hx;
  const t1 = w * (LG2 + w * (LG4 + w * LG6));
  const t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7)));
  i |= j;
  const r = t2 + t1;

  if (i > 0) {
    const hfsq = 0.5 * f * f;

    return k === 0
      ? f - (hfsq - s * (hfsq + r))
      : dk * LN2_HI - (hfsq - (s * (hfsq + r) + dk * LN2_LO) - f);
  }

  return k === 0
    ? f - s * (f - r)
    : dk * LN2_HI - (s * (f - r) - dk * LN2_LO - f);
}
