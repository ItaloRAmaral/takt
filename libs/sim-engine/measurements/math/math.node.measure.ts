import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { exp } from '../../src/math/exp.js';
import { log } from '../../src/math/log.js';
import { fdlibmCases } from '../../src/tests/fixtures/fdlibm-cases.js';
import { expectedCounts } from './expected-counts.js';
import { countValues, measureMath } from './measure-math.js';

const outputFolder = path.resolve(
  import.meta.dirname,
  '../../test-output/math-measurement',
);

it('records the bits of log, exp and the engine draws', () => {
  const measurement = measureMath(
    `node-${process.platform}`,
    `Node ${process.version}, V8 ${process.versions.v8}`,
    { native: { log: Math.log, exp: Math.exp }, fdlibm: { log, exp } },
    fdlibmCases,
  );

  mkdirSync(outputFolder, { recursive: true });
  writeFileSync(
    path.join(outputFolder, `${measurement.environment}.json`),
    JSON.stringify(measurement),
  );

  expect(countValues(measurement)).toEqual(expectedCounts);
});
