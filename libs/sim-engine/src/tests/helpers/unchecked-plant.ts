import type { Override, Plant } from '@takt/plant-schema';

/**
 * Gives every scenario of a plant one override parsed from JSON without
 * validation, for the tests that hand the engine an override no validated
 * plant can have (for example, one with a `__proto__` key).
 *
 * @param plant - The plant.
 * @param overrideJson - The override, as JSON text.
 * @returns A copy of the plant whose scenarios have only that override.
 *
 * @example
 * const plant = withUncheckedOverride(makePlant(), '{"elementId":"m1","param":"cycle","value":{"dist":"fixed","valueSec":5}}');
 */
export function withUncheckedOverride(
  plant: Plant,
  overrideJson: string,
): Plant {
  // Unvalidated on purpose: the tests use it to pass input the schema rejects.
  const override = JSON.parse(overrideJson) as Override;

  return {
    ...plant,
    scenarios: plant.scenarios.map((scenario) => ({
      ...scenario,
      overrides: [override],
    })),
  };
}
