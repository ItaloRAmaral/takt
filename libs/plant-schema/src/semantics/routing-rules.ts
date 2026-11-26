import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import { flowingConnections } from './flow-graph.js';
import {
  elementIssue,
  indexPlant,
  type IndexedElement,
  type PlantIndex,
} from './plant-index.js';
import { routingDestinations } from './references.js';

/**
 * Checks each element's routing rule against its outgoing connections: more
 * than one connection needs a rule; the rule names exactly those destinations,
 * each once; percentages sum to 100; `byQuality` belongs to a station, sends
 * scrap to a scrap element, good parts not to a scrap, and rework neither to
 * a sink nor to a scrap; a station with defects needs `byQuality`. A rule
 * naming an unknown element is left to the reference check.
 *
 * @param plant - A plant with a valid shape.
 * @returns The routing problems, each inside its element.
 *
 * @example
 * checkRoutingRules(plant); // [] when every split has a complete rule
 */
export function checkRoutingRules(plant: Plant): PlantIssue[] {
  const index = indexPlant(plant);
  const outgoing = new Map<string, string[]>();

  for (const connection of flowingConnections(plant, index, [])) {
    outgoing.set(connection.from, [
      ...(outgoing.get(connection.from) ?? []),
      connection.to,
    ]);
  }

  return plant.elements.flatMap((element, i) =>
    checkElement({ element, index: i }, outgoing.get(element.id) ?? [], index),
  );
}

function checkElement(
  indexed: IndexedElement,
  destinations: readonly string[],
  index: PlantIndex,
): PlantIssue[] {
  const { element } = indexed;

  if (!('routing' in element)) {
    return [];
  }

  const routing = element.routing;
  const defective =
    element.type === 'production.station' && element.params.defectRate > 0;

  if (defective && routing?.rule !== 'byQuality') {
    return [elementIssue(indexed, ['routing'], 'QUALITY_ROUTING_REQUIRED')];
  }

  if (routing === null) {
    return destinations.length > 1
      ? [elementIssue(indexed, ['routing'], 'ROUTING_REQUIRED')]
      : [];
  }

  const named = routingDestinations(routing);

  if (named.some(([, id]) => !index.elementsById.has(id))) {
    return [];
  }

  const issues: PlantIssue[] = [];

  if (routing.rule === 'byQuality') {
    if (element.type !== 'production.station') {
      return [elementIssue(indexed, ['routing'], 'INVALID_ROUTING_RULE')];
    }

    const typeOf = (id: string) => index.elementsById.get(id)?.element.type;

    if (typeOf(routing.scrap) !== 'production.scrap') {
      issues.push(
        elementIssue(indexed, ['routing', 'scrap'], 'INVALID_ROUTING_RULE'),
      );
    }

    if (typeOf(routing.good) === 'production.scrap') {
      issues.push(
        elementIssue(indexed, ['routing', 'good'], 'INVALID_ROUTING_RULE'),
      );
    }

    const reworkType =
      routing.rework === null ? undefined : typeOf(routing.rework);

    if (reworkType === 'production.sink' || reworkType === 'production.scrap') {
      issues.push(
        elementIssue(indexed, ['routing', 'rework'], 'INVALID_ROUTING_RULE'),
      );
    }
  }

  if (
    routing.rule !== 'shortestQueue' &&
    !sameDestinations(
      named.map(([, id]) => id),
      destinations,
    )
  ) {
    issues.push(elementIssue(indexed, ['routing'], 'ROUTING_MISMATCH'));
  }

  if (
    routing.rule === 'byPercentage' &&
    routing.shares.reduce((sum, share) => sum + share.sharePct, 0) !== 100
  ) {
    issues.push(
      elementIssue(indexed, ['routing', 'shares'], 'PERCENTAGES_NOT_100'),
    );
  }

  return issues;
}

function sameDestinations(
  named: readonly string[],
  outgoing: readonly string[],
): boolean {
  const unique = new Set(named);

  return (
    unique.size === named.length &&
    unique.size === outgoing.length &&
    outgoing.every((id) => unique.has(id))
  );
}
