/*!
 * ====================================================
 * Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
 *
 * Permission to use, copy, modify, and distribute this
 * software is freely granted, provided that this notice
 * is preserved.
 * ====================================================
 */

// fdlibm 5.3, e_exp.c (1.6, 04/04/22)
import { fromWords, highWord, lowWord } from './float-words.js';

const HUGE = 1e300;
const TWOM1000 = 9.332636185032189e-302;
const O_THRESHOLD = 709.782712893384;
const U_THRESHOLD = -745.1332191019411;
const LN2_HI = 0.6931471803691238;
const LN2_LO = 1.9082149292705877e-10;
const INVLN2 = 1.4426950408889634;
const P1 = 0.16666666666666602;
const P2 = -0.0027777777777015593;
const P3 = 6.613756321437934e-5;
const P4 = -1.6533902205465252e-6;
const P5 = 4.1381367970572385e-8;

/**
 * Gives the exponential, with the same bits in every JavaScript engine: only
 * the four operations and bit operations, which the specification makes
 * exact, unlike `Math.exp`. Error below 1 ulp.
 *
 * @param x - The exponent.
 * @returns e^x; +∞ above about 709.78, 0 below about −745.13, `NaN` for
 *   `NaN`.
 *
 * @example
 * exp(1); // 2.7182818284590455
 */
export function exp(x: number): number {
  let value = x;
  let hx = highWord(value);
  const xsb = (hx >>> 31) & 1;
  hx &= 0x7fffffff;

  if (hx >= 0x40862e42) {
    if (hx >= 0x7ff00000) {
      if (((hx & 0xfffff) | lowWord(value)) !== 0) {
        return value + value;
      }

      return xsb === 0 ? value : 0;
    }

    if (value > O_THRESHOLD) {
      return HUGE * HUGE;
    }

    if (value < U_THRESHOLD) {
      return TWOM1000 * TWOM1000;
    }
  }

  // The C tables halF, ln2HI and ln2LO hold a value and its negation, picked
  // by the sign; choosing the signed value directly gives the same bits.
  let hi = 0;
  let lo = 0;
  let k = 0;

  if (hx > 0x3fd62e42) {
    if (hx < 0x3ff0a2b2) {
      hi = value - (xsb === 0 ? LN2_HI : -LN2_HI);
      lo = xsb === 0 ? LN2_LO : -LN2_LO;
      k = 1 - xsb - xsb;
    } else {
      k = (INVLN2 * value + (xsb === 0 ? 0.5 : -0.5)) | 0;
      hi = value - k * LN2_HI;
      lo = k * LN2_LO;
    }

    value = hi - lo;
  } else if (hx < 0x3e300000) {
    // C tests huge + x > one first, only to raise the inexact flag, which
    // JavaScript does not have; the result is the same.
    return 1 + value;
  }

  const t = value * value;
  const c = value - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));

  if (k === 0) {
    return 1 - ((value * c) / (c - 2) - value);
  }

  const y = 1 - (lo - (value * c) / (2 - c) - hi);

  if (k >= -1021) {
    return fromWords(highWord(y) + (k << 20), lowWord(y));
  }

  return fromWords(highWord(y) + ((k + 1000) << 20), lowWord(y)) * TWOM1000;
}
