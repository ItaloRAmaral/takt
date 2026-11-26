import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import { checkFlowGraph } from './flow-graph.js';
import { checkGrid } from './grid.js';
import { checkRanges } from './ranges.js';
import { checkReferences } from './references.js';
import { checkRoutingRules } from './routing-rules.js';

/**
 * Checks the rules a plant must follow beyond its shape, all at once:
 * references, distribution ranges, flow graph, grid and routing, in that
 * order.
 *
 * @param plant - A plant with a valid shape.
 * @returns Every problem found; empty when the plant can run.
 *
 * @example
 * validateSemantics(plant); // []
 */
export function validateSemantics(plant: Plant): PlantIssue[] {
  return [
    ...checkReferences(plant),
    ...checkRanges(plant),
    ...checkFlowGraph(plant),
    ...checkGrid(plant),
    ...checkRoutingRules(plant),
  ];
}

/**
 * Checks only the rules a scenario override can break: references (a routing
 * override names destinations), distribution ranges and routing. The grid and
 * the flow graph depend on positions, sizes and connections, which no
 * override changes.
 *
 * @param plant - A plant with a valid shape, usually with a scenario applied.
 * @returns The problems of those rules, in that order.
 *
 * @example
 * validateOverridableRules(applyScenario(plant, 'faster'));
 */
export function validateOverridableRules(plant: Plant): PlantIssue[] {
  return [
    ...checkReferences(plant),
    ...checkRanges(plant),
    ...checkRoutingRules(plant),
  ];
}
