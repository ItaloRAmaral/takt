import { makePlant } from './make-plant.js';
import { withUncheckedOverride } from './unchecked-plant.js';

describe('withUncheckedOverride', () => {
  it('gives the scenario the parsed override', () => {
    const plant = withUncheckedOverride(
      makePlant(),
      '{"elementId":"m1","param":"cycle","value":{"dist":"fixed","valueSec":5}}',
    );

    expect(plant.scenarios[0]?.overrides).toEqual([
      {
        elementId: 'm1',
        param: 'cycle',
        value: { dist: 'fixed', valueSec: 5 },
      },
    ]);
  });

  it('keeps a __proto__ key of the JSON as an own field', () => {
    const plant = withUncheckedOverride(
      makePlant(),
      '{"elementId":"m1","param":"cycle","value":{"__proto__":{"polluted":true}}}',
    );

    expect(JSON.stringify(plant.scenarios[0]?.overrides[0]?.value)).toBe(
      '{"__proto__":{"polluted":true}}',
    );
  });
});
