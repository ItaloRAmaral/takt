import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import type { Routing } from '../structure/routing.js';
import { elementIssue, indexPlant } from './plant-index.js';

/**
 * Checks that every id in the document is unique (zones, elements,
 * connections and scenarios share one namespace) and that every reference
 * (an element's zone, a connection's ends, a routing destination) points to
 * something that exists.
 *
 * @param plant - A plant with a valid shape.
 * @returns `DUPLICATE_ID` at each repeat and `UNKNOWN_REFERENCE` at each
 *   dangling reference.
 *
 * @example
 * checkReferences(plant); // [] when every reference resolves
 */
export function checkReferences(plant: Plant): PlantIssue[] {
  const index = indexPlant(plant);
  const zoneIds = new Set(plant.zones.map((zone) => zone.id));
  const issues: PlantIssue[] = [];

  const seen = new Set<string>();

  const claim = (id: string, issue: () => PlantIssue): void => {
    if (seen.has(id)) {
      issues.push(issue());
    }

    seen.add(id);
  };

  plant.zones.forEach((zone, i) => {
    claim(zone.id, () => ({ path: ['zones', i, 'id'], code: 'DUPLICATE_ID' }));
  });

  plant.elements.forEach((element, i) => {
    claim(element.id, () =>
      elementIssue({ element, index: i }, ['id'], 'DUPLICATE_ID'),
    );
  });

  plant.connections.forEach((connection, i) => {
    claim(connection.id, () => ({
      path: ['connections', i, 'id'],
      code: 'DUPLICATE_ID',
    }));
  });

  plant.scenarios.forEach((scenario, i) => {
    claim(scenario.id, () => ({
      path: ['scenarios', i, 'id'],
      code: 'DUPLICATE_ID',
    }));
  });

  plant.elements.forEach((element, i) => {
    const indexed = { element, index: i };

    if (!zoneIds.has(element.zoneId)) {
      issues.push(elementIssue(indexed, ['zoneId'], 'UNKNOWN_REFERENCE'));
    }

    if ('routing' in element && element.routing !== null) {
      for (const [path, id] of routingDestinations(element.routing)) {
        if (!index.elementsById.has(id)) {
          issues.push(
            elementIssue(indexed, ['routing', ...path], 'UNKNOWN_REFERENCE'),
          );
        }
      }
    }
  });

  plant.connections.forEach((connection, i) => {
    for (const end of ['from', 'to'] as const) {
      if (!index.elementsById.has(connection[end])) {
        issues.push({
          path: ['connections', i, end],
          code: 'UNKNOWN_REFERENCE',
        });
      }
    }
  });

  return issues;
}

/** A destination a routing rule names: its path inside the rule and the id. */
export type Destination = [readonly (string | number)[], string];

/**
 * Lists the destinations a routing rule names, each with its path inside the
 * rule.
 *
 * @param routing - A routing rule.
 * @returns Pairs of path and destination id, in the rule's order.
 *
 * @example
 * routingDestinations({ rule: 'byQuality', good: 'b1', rework: null, scrap: 'scr1' });
 * // [[['good'], 'b1'], [['scrap'], 'scr1']]
 */
export function routingDestinations(routing: Routing): Destination[] {
  switch (routing.rule) {
    case 'byQuality':
      return [
        [['good'], routing.good],
        ...(routing.rework === null
          ? []
          : [[['rework'], routing.rework] satisfies Destination]),
        [['scrap'], routing.scrap],
      ];
    case 'byPercentage':
      return routing.shares.map((share, i) => [['shares', i, 'to'], share.to]);
    case 'shortestQueue':
      return [];
  }
}
