import { validatePlant } from '@takt/plant-schema';
import fc from 'fast-check';
import { arbitraryLine } from './arbitrary-line.js';

describe('arbitrary line', () => {
  it('generates only plants that validatePlant accepts', () => {
    const line = arbitraryLine();

    fc.assert(
      fc.property(line, (plant) => {
        expect(validatePlant(plant).valid).toBe(true);
      }),
      { seed: 42, numRuns: 100 },
    );
  });
});
