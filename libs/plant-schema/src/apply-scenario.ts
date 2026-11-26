import type { PlantElement } from './structure/elements.js';
import type { Plant } from './structure/plant.js';
import type { Override, Scenario } from './structure/scenario.js';

/** An override bound to an element (every override but `reworkLimit`). */
export type ElementOverride = Exclude<Override, { param: 'reworkLimit' }>;

/**
 * Applies a scenario's overrides to the plant, field by field: each override
 * replaces the whole value of one parameter (or the rework limit) and nothing
 * else is merged. Neither the base plant nor any of its objects is changed;
 * unchanged objects are shared with the result. An override for a parameter
 * the element does not have is ignored (validation reports it).
 *
 * @param plant - A plant with a valid shape.
 * @param scenarioId - One of the plant's scenarios.
 * @returns The plant as that scenario runs it.
 * @throws {Error} When the plant has no such scenario: a defect of the caller.
 *
 * @example
 * const faster = applyScenario(plant, 'faster');
 */
export function applyScenario(plant: Plant, scenarioId: string): Plant {
  const scenario = plant.scenarios.find(({ id }) => id === scenarioId);

  if (scenario === undefined) {
    throw new Error(`The plant has no scenario "${scenarioId}".`);
  }

  return applyOverrides(plant, scenario);
}

/**
 * Applies one scenario's overrides to the plant; the scenario does not need a
 * unique id. See {@link applyScenario}.
 *
 * @param plant - A plant with a valid shape.
 * @param scenario - The scenario whose overrides apply.
 * @returns The plant as that scenario runs it.
 *
 * @example
 * const applied = applyOverrides(plant, plant.scenarios[0]);
 */
export function applyOverrides(plant: Plant, scenario: Scenario): Plant {
  let settings = plant.settings;
  const byElement = new Map<string, ElementOverride[]>();

  for (const override of scenario.overrides) {
    if (override.param === 'reworkLimit') {
      settings = { ...settings, reworkLimit: override.value };
    } else {
      byElement.set(override.elementId, [
        ...(byElement.get(override.elementId) ?? []),
        override,
      ]);
    }
  }

  return {
    ...plant,
    settings,
    elements: plant.elements.map((element) =>
      (byElement.get(element.id) ?? []).reduce(applyToElement, element),
    ),
  };
}

/**
 * Whether an element has the parameter an override replaces.
 *
 * @param element - An element of the plant.
 * @param override - An override bound to that element.
 * @returns `true` when applying the override changes a field the element has.
 *
 * @example
 * appliesTo(station, { elementId: 'm1', param: 'cycle', value }); // true
 */
export function appliesTo(
  element: PlantElement,
  override: ElementOverride,
): boolean {
  return override.param === 'routing'
    ? 'routing' in element
    : Object.hasOwn(element.params, override.param);
}

function applyToElement(
  element: PlantElement,
  override: ElementOverride,
): PlantElement {
  if (!appliesTo(element, override)) {
    return element;
  }

  // `appliesTo` holds, so the element has this field and the value has its
  // schema; TypeScript cannot tie the override's param to the element's type.
  if (override.param === 'routing') {
    return { ...element, routing: override.value } as PlantElement;
  }

  return {
    ...element,
    params: { ...element.params, [override.param]: override.value },
  } as PlantElement;
}
