import { fdlibmCases } from '../../src/tests/fixtures/fdlibm-cases.js';

/** How many values each set of a measurement with the `native` and `fdlibm` functions holds. */
export const expectedCounts: Readonly<Record<string, number>> = {
  uniforms: 100_000,
  'native.log.cases': fdlibmCases.log.length,
  'native.exp.cases': fdlibmCases.exp.length,
  'native.log.uniforms': 100_000,
  'native.log.complements': 100_000,
  'native.exp.hart': 100_000,
  'fdlibm.log.cases': fdlibmCases.log.length,
  'fdlibm.exp.cases': fdlibmCases.exp.length,
  'fdlibm.log.uniforms': 100_000,
  'fdlibm.log.complements': 100_000,
  'fdlibm.exp.hart': 100_000,
  'draws.exponential': 100_000,
  'draws.triangular': 100_000,
  'draws.truncatedNormal': 100_000,
};
