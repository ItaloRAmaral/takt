// Wichura (1988), AS 241, PPND16
const SPLIT_NEAR_HALF = 0.425;
const SPLIT_TAIL = 5;
const NEAR_HALF_CONST = 0.180625;
const CENTRAL_CONST = 1.6;

const A = [
  2509.0809287301227, 33430.57558358813, 67265.7709270087, 45921.95393154987,
  13731.69376550946, 1971.5909503065513, 133.14166789178438, 3.3871328727963665,
] as const;
const B = [
  5226.495278852854, 28729.085735721943, 39307.89580009271, 21213.794301586597,
  5394.196021424751, 687.1870074920579, 42.31333070160091, 1,
] as const;
const C = [
  0.0007745450142783414, 0.022723844989269184, 0.2417807251774506,
  1.2704582524523684, 3.6478483247632045, 5.769497221460691, 4.630337846156546,
  1.4234371107496835,
] as const;
const D = [
  1.0507500716444169e-9, 0.0005475938084995345, 0.015198666563616457,
  0.14810397642748008, 0.6897673349851, 1.6763848301838038, 2.053191626637759,
  1,
] as const;
const E = [
  2.0103343992922881e-7, 2.7115555687434876e-5, 0.0012426609473880784,
  0.026532189526576124, 0.29656057182850487, 1.7848265399172913,
  5.463784911164114, 6.657904643501103,
] as const;
const F = [
  2.0442631033899397e-15, 1.421511758316446e-7, 1.8463183175100548e-5,
  0.0007868691311456133, 0.014875361290850615, 0.1369298809227358,
  0.599832206555888, 1,
] as const;

// Hart (1968), as given by West (2005), figure 2
const HART_NUMERATOR = [
  3.52624965998911e-2, 0.700383064443688, 6.37396220353165, 33.912866078383,
  112.079291497871, 221.213596169931, 220.206867912376,
] as const;
const HART_DENOMINATOR = [
  8.83883476483184e-2, 1.75566716318264, 16.064177579207, 86.7807322029461,
  296.564248779674, 637.333633378831, 793.826512519948, 440.413735824752,
] as const;
const HART_RATIONAL_LIMIT = 7.07106781186547;
const HART_ZERO_LIMIT = 37;
const SQRT_TWO_PI = 2.506628274631;

// Coefficients run from the highest power down, so Horner's rule reads them in order.
function evaluatePolynomial(
  coefficients: readonly number[],
  x: number,
): number {
  let sum = 0;

  for (const coefficient of coefficients) {
    sum = sum * x + coefficient;
  }

  return sum;
}

/**
 * Gives the standard normal deviate whose lower tail area is `p`: the
 * quantile function Φ⁻¹, accurate to about 16 digits.
 *
 * @param p - The lower tail area.
 * @returns The deviate z with Φ(z) = p; −∞ when `p` ≤ 0 and +∞ when `p` ≥ 1.
 *
 * @example
 * normalQuantile(0.975); // 1.9599639845400536
 */
export function normalQuantile(p: number): number {
  if (p <= 0) {
    return -Infinity;
  }

  if (p >= 1) {
    return Infinity;
  }

  const q = p - 0.5;

  if (Math.abs(q) <= SPLIT_NEAR_HALF) {
    const r = NEAR_HALF_CONST - q * q;

    return (q * evaluatePolynomial(A, r)) / evaluatePolynomial(B, r);
  }

  let r = Math.sqrt(-Math.log(q < 0 ? p : 1 - p));
  let z: number;

  if (r <= SPLIT_TAIL) {
    r -= CENTRAL_CONST;
    z = evaluatePolynomial(C, r) / evaluatePolynomial(D, r);
  } else {
    r -= SPLIT_TAIL;
    z = evaluatePolynomial(E, r) / evaluatePolynomial(F, r);
  }

  return q < 0 ? -z : z;
}

function lowerTail(xAbs: number): number {
  if (xAbs > HART_ZERO_LIMIT) {
    return 0;
  }

  const exponential = Math.exp(-(xAbs * xAbs) / 2);

  if (xAbs < HART_RATIONAL_LIMIT) {
    return (
      (exponential * evaluatePolynomial(HART_NUMERATOR, xAbs)) /
      evaluatePolynomial(HART_DENOMINATOR, xAbs)
    );
  }

  let fraction = xAbs + 0.65;

  for (let term = 4; term >= 1; term -= 1) {
    fraction = xAbs + term / fraction;
  }

  return exponential / fraction / SQRT_TWO_PI;
}

/**
 * Gives the standard normal distribution function Φ(x), the area below `x`.
 * Below 0 it is computed directly, so small values keep their relative
 * precision.
 *
 * @param x - The deviate.
 * @returns Φ(x), from 0 to 1.
 *
 * @example
 * normalCdf(0); // 0.5
 */
export function normalCdf(x: number): number {
  const tail = lowerTail(Math.abs(x));

  return x > 0 ? 1 - tail : tail;
}

/**
 * Gives the standard normal survival function Q(x) = Φ(−x), the area above
 * `x`. Above 0 it is computed directly, so small values keep their relative
 * precision.
 *
 * @param x - The deviate.
 * @returns Q(x), from 0 to 1.
 *
 * @example
 * normalSurvival(1); // 0.15865525393145702
 */
export function normalSurvival(x: number): number {
  return normalCdf(-x);
}
