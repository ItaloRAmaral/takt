import { server } from 'vitest/browser';
import { fdlibmCases } from '../../src/tests/fixtures/fdlibm-cases.js';
import { expectedNativeCounts } from './expected-counts.js';
import { countValues, measureMath } from './measure-math.js';

it('records the bits of log, exp and the engine draws', async () => {
  const measurement = measureMath(
    `${server.browser}-${server.platform}`,
    navigator.userAgent,
    { native: { log: Math.log, exp: Math.exp } },
    fdlibmCases,
  );

  await server.commands.writeFile(
    `test-output/math-measurement/${measurement.environment}.json`,
    JSON.stringify(measurement),
  );

  expect(countValues(measurement)).toEqual(expectedNativeCounts);
});
