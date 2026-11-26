import fc from 'fast-check';
import { compilePlant } from '../model/compile-plant.js';
import {
  ARBITRARY_LINE_SINK_ID,
  arbitraryLine,
} from '../tests/helpers/arbitrary-line.js';
import { countUnaccountedParts } from '../tests/helpers/log-queries.js';
import { testLimits } from '../tests/helpers/make-plant.js';
import type { RunOptions } from './run-options.js';
import { simulateReplication } from './simulate-replication.js';

const logged: RunOptions = { limits: testLimits, recordLog: true };

describe('replication properties', () => {
  it('arrivals = lost + exits + parts left inside, for any line', () => {
    const lines = arbitraryLine();

    fc.assert(
      fc.property(lines, (plant) => {
        const result = simulateReplication(
          compilePlant(plant, 'base', logged),
          0,
          logged,
        );

        expect(
          countUnaccountedParts(
            result.log,
            [ARBITRARY_LINE_SINK_ID],
            result.finalState.parts.length,
          ),
        ).toBe(0);
      }),
      { seed: 42, numRuns: 100 },
    );
  });

  it('RN-SIM-001: two runs of the same input give identical results', () => {
    const lines = arbitraryLine();

    fc.assert(
      fc.property(lines, (plant) => {
        const first = simulateReplication(
          compilePlant(plant, 'base', logged),
          0,
          logged,
        );

        const second = simulateReplication(
          compilePlant(plant, 'base', logged),
          0,
          logged,
        );

        expect(second).toEqual(first);
      }),
      { seed: 42, numRuns: 100 },
    );
  });
});
