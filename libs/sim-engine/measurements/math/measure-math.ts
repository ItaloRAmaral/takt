import type { Variability } from '../../src/distributions/variability.js';
import {
  createRandomStream,
  findStreamStart,
  type RandomStream,
} from '../../src/rng/mrg32k3a.js';
import { findStreamIndex, fnv1a64 } from '../../src/rng/stream-index.js';
import type { FdlibmCases } from '../../src/tests/fixtures/fdlibm-case.js';
import { drawTimesSec } from '../../src/tests/helpers/draw-times-sec.js';
import { drawUniforms } from '../../src/tests/helpers/draw-uniforms.js';
import { fromBits, toBits } from '../../src/tests/helpers/float-bits.js';

/** A natural logarithm and an exponential to measure. */
export interface MathFunctions {
  /** The natural logarithm. */
  readonly log: (x: number) => number;
  /** The exponential. */
  readonly exp: (x: number) => number;
}

/** What one environment computed, as the bits of every result. */
export interface MathMeasurement {
  /** `<engine>-<platform>`, for example `firefox-win32`. */
  readonly environment: string;
  /** The exact versions: Node and V8, or the browser's user agent. */
  readonly details: string;
  /** {@link fixtureDigest} of the reference cases the measurement used. */
  readonly fixtureDigest: string;
  /** The results of each set, in input order, as 16 hexadecimal digits. */
  readonly sets: Readonly<Record<string, readonly string[]>>;
}

const SEED = 42;
const SAMPLE_COUNT = 100_000;
const HART_RANGE = 37;

const VARIABILITIES: Readonly<Record<string, Variability>> = {
  exponential: { kind: 'exponential', meanSec: 30 },
  triangular: { kind: 'triangular', minSec: 10, modeSec: 20, maxSec: 50 },
  truncatedNormal: {
    kind: 'truncatedNormal',
    meanSec: 30,
    standardDeviationSec: 5,
    minSec: 0,
    maxSec: Infinity,
  },
};

function openStream(key: string): RandomStream {
  return createRandomStream(findStreamStart(findStreamIndex(SEED, key)), 0);
}

function mapToBits(
  values: readonly number[],
  map: (value: number) => number,
): string[] {
  return values.map((value) => toBits(map(value)));
}

/**
 * Identifies the inputs of the reference cases, so a comparison can refuse a
 * measurement made against another version of them: the 64-bit FNV-1a hash of
 * the `log` inputs, a semicolon and the `exp` inputs, each list joined by
 * commas.
 *
 * @param cases - The reference cases of `log` and `exp`.
 * @returns The hash, as 16 hexadecimal digits.
 */
export function fixtureDigest(cases: FdlibmCases): string {
  const logInputs = cases.log.map((entry) => entry.input).join(',');
  const expInputs = cases.exp.map((entry) => entry.input).join(',');

  return fnv1a64(`${logInputs};${expInputs}`).toString(16).padStart(16, '0');
}

/**
 * Computes, in the running environment, every set the D4 measurement
 * compares: the generator's uniforms, `log` and `exp` of each function on the
 * reference cases and on inputs like the engine's, and draws of each
 * variability.
 *
 * @param environment - `<engine>-<platform>`.
 * @param details - The exact versions of the environment.
 * @param functions - The functions to measure, by name (`native`, `fdlibm`).
 * @param cases - The reference cases of `log` and `exp`.
 * @returns The bits of every result.
 */
export function measureMath(
  environment: string,
  details: string,
  functions: Readonly<Record<string, MathFunctions>>,
  cases: FdlibmCases,
): MathMeasurement {
  const uniforms = drawUniforms(openStream('d4:uniforms'), SAMPLE_COUNT);
  const logInputs = cases.log.map((entry) => fromBits(entry.input));
  const expInputs = cases.exp.map((entry) => fromBits(entry.input));
  const sets: Record<string, string[]> = {
    uniforms: uniforms.map((uniform) => toBits(uniform)),
  };

  for (const [name, { log, exp }] of Object.entries(functions)) {
    sets[`${name}.log.cases`] = mapToBits(logInputs, log);
    sets[`${name}.exp.cases`] = mapToBits(expInputs, exp);
    sets[`${name}.log.uniforms`] = mapToBits(uniforms, log);
    sets[`${name}.log.complements`] = mapToBits(uniforms, (uniform) =>
      log(1 - uniform),
    );
    sets[`${name}.exp.hart`] = mapToBits(uniforms, (uniform) => {
      const deviate = HART_RANGE * uniform;

      return exp(-(deviate * deviate) / 2);
    });
  }

  for (const [name, variability] of Object.entries(VARIABILITIES)) {
    const draws = drawTimesSec(
      variability,
      openStream(`d4:${name}`),
      SAMPLE_COUNT,
    );

    sets[`draws.${name}`] = draws.map((draw) => toBits(draw));
  }

  return { environment, details, fixtureDigest: fixtureDigest(cases), sets };
}

/**
 * Counts the values of each set of a measurement, for the measurement's own
 * check.
 *
 * @param measurement - A measurement.
 * @returns The number of values of each set, by name.
 */
export function countValues(
  measurement: MathMeasurement,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(measurement.sets).map(([name, values]) => [
      name,
      values.length,
    ]),
  );
}
