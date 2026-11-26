import type { PlantElement } from '../structure/elements.js';
import type { PlantIssue, PlantIssueCode } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';

/**
 * A plant's elements by id, with each element's index in the document. When
 * an id repeats, the first element keeps it (the repeat is a reference
 * problem of its own).
 */
export interface PlantIndex {
  readonly elementsById: ReadonlyMap<string, IndexedElement>;
}

/** An element and its position in `plant.elements`. */
export interface IndexedElement {
  readonly element: PlantElement;
  readonly index: number;
}

/**
 * Indexes a plant's elements by id.
 *
 * @param plant - A plant with a valid shape.
 * @returns The index.
 *
 * @example
 * const { elementsById } = indexPlant(plant);
 */
export function indexPlant(plant: Plant): PlantIndex {
  const elementsById = new Map<string, IndexedElement>();

  plant.elements.forEach((element, index) => {
    if (!elementsById.has(element.id)) {
      elementsById.set(element.id, { element, index });
    }
  });

  return { elementsById };
}

/**
 * Builds a problem located inside an element.
 *
 * @param indexed - The element and its index.
 * @param rest - The path below the element.
 * @param code - Why it is a problem.
 * @returns The problem, with `elementId` set.
 *
 * @example
 * elementIssue({ element, index: 1 }, ['routing'], 'ROUTING_REQUIRED');
 */
export function elementIssue(
  indexed: IndexedElement,
  rest: readonly (string | number)[],
  code: PlantIssueCode,
): PlantIssue {
  return {
    elementId: indexed.element.id,
    path: ['elements', indexed.index, ...rest],
    code,
  };
}
