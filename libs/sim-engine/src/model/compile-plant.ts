import type {
  Plant,
  PlantElement,
  Routing,
  TimeDistribution,
} from '@takt/plant-schema';
import { applyScenario } from '@takt/plant-schema/apply-scenario';
import { truncationMass } from '../distributions/truncated-normal.js';
import { SimulationError, type RunIssue } from '../errors/simulation-error.js';
import type { RunOptions } from '../replication/run-options.js';
import { findStreamStart } from '../rng/mrg32k3a.js';
import { assignStreamIndices, findStreamIndex } from '../rng/stream-index.js';
import type { CompiledElement, CompiledPlant } from './compiled-plant.js';
import { toVariability } from './to-variability.js';

/**
 * Prepares a validated plant to run one scenario: applies the scenario's
 * overrides field by field (`applyScenario`), converts the times to
 * the engine's variabilities, builds the element graph with inputs in
 * connection order, and assigns each random element its stream from the
 * scenario's seed (`<id>:interarrival`, `<id>:cycle`).
 *
 * @param plant - A plant accepted by `validatePlant`.
 * @param scenarioId - One of the plant's scenarios.
 * @param options - The run options; only the limits are read here.
 * @returns The plant as one replication of the scenario runs it.
 * @throws {SimulationError} `SIMULATION_LIMIT_EXCEEDED` when the plant has
 *   more elements, or the scenario a longer duration, than the limits;
 *   `INVALID_PLANT` with every `EMPTY_TRUNCATION`, or with a
 *   `STREAM_COLLISION`.
 * @throws {Error} Without a code, a defect of the caller: an unknown
 *   scenario, a mode other than the shift, an element without an output, or a
 *   feature that arrives in a later sub-plan (conveyor, scrap, defects,
 *   failures, routing rules).
 *
 * @example
 * const compiled = compilePlant(plant, 'base', { limits, recordLog: false });
 */
export function compilePlant(
  plant: Plant,
  scenarioId: string,
  options: RunOptions,
): CompiledPlant {
  const { limits } = options;

  if (plant.elements.length > limits.elementCount) {
    throw new SimulationError(
      'SIMULATION_LIMIT_EXCEEDED',
      { limit: 'elementCount' },
      `The plant has ${String(plant.elements.length)} elements, above the limit of ${String(limits.elementCount)}.`,
    );
  }

  const scenario = plant.scenarios.find(({ id }) => id === scenarioId);

  if (scenario === undefined) {
    throw new Error(`The plant has no scenario "${scenarioId}".`);
  }

  if (scenario.mode !== 'shift') {
    throw new Error(`The ${scenario.mode} mode runs from sub-plan 6 on.`);
  }

  const applied = applyScenario(plant, scenarioId);
  const durationSec = scenario.durationH * 3600;

  if (durationSec > limits.durationSec) {
    throw new SimulationError(
      'SIMULATION_LIMIT_EXCEEDED',
      { limit: 'durationSec' },
      `The scenario runs ${String(durationSec)} s, above the limit of ${String(limits.durationSec)} s.`,
    );
  }

  const issues = findEmptyTruncations(applied);

  if (issues.length > 0) {
    throw new SimulationError(
      'INVALID_PLANT',
      { issues },
      'A truncated normal of the plant holds no probability.',
    );
  }

  assignStreamIndices(scenario.seed, applied.elements.flatMap(streamKeysOf));

  const indexById = new Map(
    applied.elements.map((element, index) => [element.id, index]),
  );
  const graph = { plant: applied, indexById };

  return {
    durationSec,
    elements: applied.elements.map((element, index) =>
      compileElement(element, index, graph, scenario.seed),
    ),
  };
}

interface Graph {
  readonly plant: Plant;
  readonly indexById: ReadonlyMap<string, number>;
}

function compileElement(
  element: PlantElement,
  index: number,
  graph: Graph,
  seed: number,
): CompiledElement {
  const base = { id: element.id, index };

  switch (element.type) {
    case 'production.source':
      refuseRouting(element.id, element.routing);

      return {
        kind: 'source',
        ...base,
        interarrival: toVariability(element.params.interarrival),
        queueCapacity: element.params.queueCapacity,
        streamStart: findStreamStart(
          findStreamIndex(seed, `${element.id}:interarrival`),
        ),
        outputIndex: outputOf(element, graph),
      };

    case 'production.station':
      refuseRouting(element.id, element.routing);

      if (element.params.defectRate > 0 || element.params.failure !== null) {
        throw unsupported(element.id, 'defects and failures');
      }

      return {
        kind: 'station',
        ...base,
        cycle: toVariability(element.params.cycle),
        streamStart: findStreamStart(
          findStreamIndex(seed, `${element.id}:cycle`),
        ),
        inputIndices: inputsOf(element, graph),
        outputIndex: outputOf(element, graph),
      };

    case 'production.buffer':
      refuseRouting(element.id, element.routing);

      return {
        kind: 'buffer',
        ...base,
        capacity: element.params.capacity,
        inputIndices: inputsOf(element, graph),
        outputIndex: outputOf(element, graph),
      };

    case 'production.sink':
      return {
        kind: 'sink',
        ...base,
        inputIndices: inputsOf(element, graph),
      };

    case 'production.conveyor':
    case 'production.scrap':
      throw unsupported(element.id, 'conveyors and scraps');
  }
}

function inputsOf(element: PlantElement, graph: Graph): number[] {
  return graph.plant.connections
    .filter(({ to }) => to === element.id)
    .map(({ from }) => indexOf(graph.indexById, from));
}

function indexOf(indexById: ReadonlyMap<string, number>, id: string): number {
  const index = indexById.get(id);

  if (index === undefined) {
    throw new Error(`A connection names the unknown element ${id}.`);
  }

  return index;
}

function outputOf(element: PlantElement, graph: Graph): number {
  const output = graph.plant.connections.find(
    ({ from }) => from === element.id,
  );

  if (output === undefined) {
    throw new Error(`The element ${element.id} has no output.`);
  }

  return indexOf(graph.indexById, output.to);
}

function refuseRouting(id: string, routing: Routing | null): void {
  if (routing !== null) {
    throw unsupported(id, 'routing rules');
  }
}

function unsupported(id: string, feature: string): Error {
  return new Error(
    `The element ${id} uses ${feature}, which the engine runs from sub-plan 5 on.`,
  );
}

function findEmptyTruncations(plant: Plant): RunIssue[] {
  const issues: RunIssue[] = [];

  plant.elements.forEach((element, index) => {
    for (const [param, distribution] of timesOf(element)) {
      if (isEmptyTruncation(distribution)) {
        issues.push({
          elementId: element.id,
          path: ['elements', index, 'params', param],
          code: 'EMPTY_TRUNCATION',
        });
      }
    }
  });

  return issues;
}

function isEmptyTruncation(distribution: TimeDistribution): boolean {
  return (
    distribution.dist === 'truncatedNormal' &&
    truncationMass(
      distribution.meanSec,
      distribution.standardDeviationSec,
      distribution.minSec,
      distribution.maxSec ?? Infinity,
    ) === 0
  );
}

function timesOf(element: PlantElement): [string, TimeDistribution][] {
  switch (element.type) {
    case 'production.source':
      return [['interarrival', element.params.interarrival]];

    case 'production.station':
      return [['cycle', element.params.cycle]];

    case 'production.buffer':
    case 'production.conveyor':
    case 'production.sink':
    case 'production.scrap':
      return [];
  }
}

function streamKeysOf(element: PlantElement): string[] {
  switch (element.type) {
    case 'production.source':
      return [`${element.id}:interarrival`];

    case 'production.station':
      return [`${element.id}:cycle`];

    case 'production.buffer':
    case 'production.conveyor':
    case 'production.sink':
    case 'production.scrap':
      return [];
  }
}
