import type {
  BufferElement,
  ConveyorElement,
  ScrapElement,
  SinkElement,
  SourceElement,
  StationElement,
} from '../../structure/elements.js';
import type { Plant } from '../../structure/plant.js';
import type { Scenario } from '../../structure/scenario.js';

function placement(): Pick<StationElement, 'zoneId' | 'rotDeg' | 'size'> {
  return { zoneId: 'z1', rotDeg: 0, size: [1, 1] };
}

/**
 * A source with fixed test data: exponential arrivals every 60 s, a queue of
 * 20 and no routing rule.
 *
 * @param changes - Fields to replace.
 * @returns The source.
 *
 * @example
 * const source = makeSource({ id: 'src2' });
 */
export function makeSource(
  changes: Partial<SourceElement> = {},
): SourceElement {
  return {
    ...placement(),
    id: 'src1',
    type: 'production.source',
    pos: [0, 0],
    params: {
      interarrival: { dist: 'exponential', meanSec: 60 },
      queueCapacity: 20,
    },
    routing: null,
    ...changes,
  };
}

/**
 * A station with fixed test data: fixed 50 s cycle, ideal cycle 50 s, no
 * defects, no failures, no routing rule.
 *
 * @param changes - Fields to replace.
 * @returns The station.
 *
 * @example
 * const station = makeStation({ id: 'm2', pos: [4, 0] });
 */
export function makeStation(
  changes: Partial<StationElement> = {},
): StationElement {
  return {
    ...placement(),
    id: 'm1',
    type: 'production.station',
    pos: [2, 0],
    params: {
      cycle: { dist: 'fixed', valueSec: 50 },
      idealCycleSec: 50,
      defectRate: 0,
      failure: null,
    },
    routing: null,
    ...changes,
  };
}

/**
 * A buffer of capacity 10 with no routing rule.
 *
 * @param changes - Fields to replace.
 * @returns The buffer.
 *
 * @example
 * const buffer = makeBuffer({ id: 'b2' });
 */
export function makeBuffer(
  changes: Partial<BufferElement> = {},
): BufferElement {
  return {
    ...placement(),
    id: 'b1',
    type: 'production.buffer',
    pos: [6, 0],
    params: { capacity: 10 },
    routing: null,
    ...changes,
  };
}

/**
 * A conveyor of 5 m at 10 m/min with capacity 5 and no routing rule.
 *
 * @param changes - Fields to replace.
 * @returns The conveyor.
 *
 * @example
 * const conveyor = makeConveyor({ id: 'cv2' });
 */
export function makeConveyor(
  changes: Partial<ConveyorElement> = {},
): ConveyorElement {
  return {
    ...placement(),
    id: 'cv1',
    type: 'production.conveyor',
    pos: [8, 0],
    params: { lengthM: 5, speedMPerMin: 10, capacity: 5 },
    routing: null,
    ...changes,
  };
}

/**
 * A sink.
 *
 * @param changes - Fields to replace.
 * @returns The sink.
 *
 * @example
 * const sink = makeSink({ id: 'snk2' });
 */
export function makeSink(changes: Partial<SinkElement> = {}): SinkElement {
  return {
    ...placement(),
    id: 'snk1',
    type: 'production.sink',
    pos: [4, 0],
    params: {},
    ...changes,
  };
}

/**
 * A scrap.
 *
 * @param changes - Fields to replace.
 * @returns The scrap.
 *
 * @example
 * const scrap = makeScrap({ id: 'scr2' });
 */
export function makeScrap(changes: Partial<ScrapElement> = {}): ScrapElement {
  return {
    ...placement(),
    id: 'scr1',
    type: 'production.scrap',
    pos: [4, 2],
    params: {},
    ...changes,
  };
}

/**
 * A scenario with fixed test data: one 8 h shift, 30 replications, seed 42,
 * no warm-up and no overrides.
 *
 * @param changes - Fields to replace.
 * @returns The scenario.
 *
 * @example
 * const scenario = makeScenario({ mode: 'steadyState', warmupMin: 300 });
 */
export function makeScenario(changes: Partial<Scenario> = {}): Scenario {
  return {
    id: 'base',
    name: 'Atual',
    mode: 'shift',
    durationH: 8,
    replicationCount: 30,
    seed: 42,
    warmupMin: null,
    overrides: [],
    ...changes,
  };
}

/**
 * The smallest valid plant: a source, a station and a sink in a line, in one
 * zone of a 20 by 12 grid, with one scenario.
 *
 * @param changes - Top-level fields to replace.
 * @returns The plant.
 *
 * @example
 * const plant = makePlant({ elements: [makeSource(), makeSink()] });
 */
export function makePlant(changes: Partial<Plant> = {}): Plant {
  return {
    schemaVersion: 1,
    id: 'plant_01',
    name: 'Linha de teste',
    grid: { cols: 20, rows: 12 },
    zones: [{ id: 'z1', name: 'Linha 1' }],
    elements: [makeSource(), makeStation(), makeSink()],
    connections: [
      { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
      { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
    ],
    settings: { reworkLimit: 2 },
    scenarios: [makeScenario()],
    ...changes,
  };
}
