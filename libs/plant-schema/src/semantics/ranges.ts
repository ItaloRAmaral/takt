import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import type { TimeDistribution } from '../structure/time-distribution.js';
import { elementIssue } from './plant-index.js';

/**
 * Checks that every time distribution in the plant is coherent: a triangular
 * needs minimum ≤ mode ≤ maximum with minimum < maximum, and a truncated
 * normal with an upper limit needs minimum < maximum.
 *
 * @param plant - A plant with a valid shape.
 * @returns `INVALID_RANGE` at each incoherent distribution.
 *
 * @example
 * checkRanges(plant); // [] when every distribution is coherent
 */
export function checkRanges(plant: Plant): PlantIssue[] {
  const issues: PlantIssue[] = [];

  plant.elements.forEach((element, index) => {
    for (const [path, distribution] of distributionsOf(element)) {
      if (!isCoherent(distribution)) {
        issues.push(elementIssue({ element, index }, path, 'INVALID_RANGE'));
      }
    }
  });

  return issues;
}

function distributionsOf(
  element: Plant['elements'][number],
): [readonly string[], TimeDistribution][] {
  switch (element.type) {
    case 'production.source':
      return [[['params', 'interarrival'], element.params.interarrival]];
    case 'production.station':
      return [
        [['params', 'cycle'], element.params.cycle],
        ...(element.params.failure === null
          ? []
          : ([
              [
                ['params', 'failure', 'timeToFailure'],
                element.params.failure.timeToFailure,
              ],
              [
                ['params', 'failure', 'repairTime'],
                element.params.failure.repairTime,
              ],
            ] satisfies [readonly string[], TimeDistribution][])),
      ];
    case 'production.buffer':
    case 'production.conveyor':
    case 'production.sink':
    case 'production.scrap':
      return [];
  }
}

function isCoherent(distribution: TimeDistribution): boolean {
  switch (distribution.dist) {
    case 'triangular':
      return (
        distribution.minSec <= distribution.modeSec &&
        distribution.modeSec <= distribution.maxSec &&
        distribution.minSec < distribution.maxSec
      );
    case 'truncatedNormal':
      return (
        distribution.maxSec === null ||
        distribution.minSec < distribution.maxSec
      );
    case 'fixed':
    case 'exponential':
      return true;
  }
}
