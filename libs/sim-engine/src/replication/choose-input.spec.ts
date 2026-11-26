import { chooseInput } from './choose-input.js';

describe('chooseInput', () => {
  it.each([
    { inputIndices: [0, 1], availableSinceSec: [20, 10], chosen: 1 },
    { inputIndices: [0, 1], availableSinceSec: [10, 10], chosen: 0 },
    { inputIndices: [1, 0], availableSinceSec: [10, 10], chosen: 1 },
    {
      inputIndices: [0, 1],
      availableSinceSec: [Infinity, Infinity],
      chosen: -1,
    },
  ])(
    'RN-SIM-014: a station chooses the input whose part has waited longest: inputs $inputIndices available since $availableSinceSec give $chosen',
    ({ inputIndices, availableSinceSec, chosen }) => {
      const result = chooseInput(inputIndices, availableSinceSec);

      expect(result).toBe(chosen);
    },
  );
});
