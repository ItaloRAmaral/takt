import { server } from 'vitest/browser';
import { exp } from '../../src/math/exp.js';
import { log } from '../../src/math/log.js';
import { fdlibmCases } from '../../src/tests/fixtures/fdlibm-cases.js';
import { expectedCounts } from './expected-counts.js';
import { countValues, measureMath } from './measure-math.js';

it('records the bits of log, exp and the engine draws', async () => {
  const measurement = measureMath(
    `${server.browser}-${server.platform}`,
    navigator.userAgent,
    { native: { log: Math.log, exp: Math.exp }, fdlibm: { log, exp } },
    fdlibmCases,
  );

  await server.commands.writeFile(
    `test-output/math-measurement/${measurement.environment}.json`,
    JSON.stringify(measurement),
  );

  expect(countValues(measurement)).toEqual(expectedCounts);
});
