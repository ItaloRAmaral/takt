import type { ElementType } from '../structure/elements.js';
import type { PlantIssue } from '../structure/issues.js';
import type { Connection, Plant } from '../structure/plant.js';
import { elementIssue, indexPlant, type PlantIndex } from './plant-index.js';

const EXITS: ReadonlySet<ElementType> = new Set([
  'production.sink',
  'production.scrap',
]);

/**
 * Checks how parts can flow: the plant has a source and an exit (sink or
 * scrap); no connection loops to its own element, repeats a pair, enters a
 * source or leaves an exit; and every element lies on a path from a source to
 * an exit. Connections to unknown elements are skipped here, because the
 * reference check reports them.
 *
 * @param plant - A plant with a valid shape.
 * @returns `NO_SOURCE`, `NO_EXIT`, `INVALID_CONNECTION` and
 *   `UNREACHABLE_ELEMENT` problems.
 *
 * @example
 * checkFlowGraph(plant); // [] for source → station → sink
 */
export function checkFlowGraph(plant: Plant): PlantIssue[] {
  const index = indexPlant(plant);
  const issues: PlantIssue[] = [];

  if (!plant.elements.some((element) => element.type === 'production.source')) {
    issues.push({ path: ['elements'], code: 'NO_SOURCE' });
  }

  if (!plant.elements.some((element) => EXITS.has(element.type))) {
    issues.push({ path: ['elements'], code: 'NO_EXIT' });
  }

  const flowing = flowingConnections(plant, index, issues);
  const fromSources = reach(plant, flowing, 'forward');
  const toExits = reach(plant, flowing, 'backward');

  plant.elements.forEach((element, i) => {
    if (!fromSources.has(element.id) || !toExits.has(element.id)) {
      issues.push(
        elementIssue({ element, index: i }, [], 'UNREACHABLE_ELEMENT'),
      );
    }
  });

  return issues;
}

/**
 * Keeps the connections parts can travel and reports the invalid ones.
 *
 * @param plant - A plant with a valid shape.
 * @param index - The plant's elements by id.
 * @param issues - Receives an `INVALID_CONNECTION` per invalid connection.
 * @returns The connections between known elements that parts can travel.
 *
 * @example
 * const flowing = flowingConnections(plant, indexPlant(plant), issues);
 */
export function flowingConnections(
  plant: Plant,
  index: PlantIndex,
  issues: PlantIssue[],
): Connection[] {
  const pairs = new Set<string>();
  const flowing: Connection[] = [];

  plant.connections.forEach((connection, i) => {
    const from = index.elementsById.get(connection.from);
    const to = index.elementsById.get(connection.to);

    if (from === undefined || to === undefined) {
      return;
    }

    const pair = `${connection.from}\u0000${connection.to}`;
    const invalid =
      connection.from === connection.to ||
      pairs.has(pair) ||
      to.element.type === 'production.source' ||
      EXITS.has(from.element.type);

    pairs.add(pair);

    if (invalid) {
      issues.push({ path: ['connections', i], code: 'INVALID_CONNECTION' });

      return;
    }

    flowing.push(connection);
  });

  return flowing;
}

function reach(
  plant: Plant,
  connections: readonly Connection[],
  direction: 'forward' | 'backward',
): Set<string> {
  const next = new Map<string, string[]>();

  for (const connection of connections) {
    const [start, end] =
      direction === 'forward'
        ? [connection.from, connection.to]
        : [connection.to, connection.from];

    next.set(start, [...(next.get(start) ?? []), end]);
  }

  const queue = plant.elements
    .filter((element) =>
      direction === 'forward'
        ? element.type === 'production.source'
        : EXITS.has(element.type),
    )
    .map((element) => element.id);
  const reached = new Set(queue);

  for (const current of queue) {
    for (const id of next.get(current) ?? []) {
      if (!reached.has(id)) {
        reached.add(id);
        queue.push(id);
      }
    }
  }

  return reached;
}
