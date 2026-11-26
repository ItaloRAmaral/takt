import {
  createDefaultElement,
  createDefaultScenario,
} from '@takt/plant-schema';
import type {
  BufferElement,
  Connection,
  ConveyorElement,
  Plant,
  PlantElement,
  Scenario,
  ScrapElement,
  SinkElement,
  SourceElement,
  StationElement,
} from '@takt/plant-schema';
import type { SimulationLimits } from '../../replication/run-options.js';

/**
 * Limits high enough for every test plant: test values, not the engine
 * defaults, which sub-plan 9 measures.
 */
export const testLimits: SimulationLimits = {
  elementCount: 500,
  durationSec: 2_592_000,
  eventCount: 10_000_000,
};

function placement(): Pick<StationElement, 'zoneId' | 'rotDeg' | 'size'> {
  return { zoneId: 'z1', rotDeg: 0, size: [1, 1] };
}

/**
 * A source with the editor defaults: exponential arrivals every 60 s and a
 * queue of 20.
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
 * A station with the editor defaults: fixed 50 s cycle, ideal cycle 50 s, no
 * defects and no failures.
 *
 * @param changes - Fields to replace.
 * @returns The station.
 *
 * @example
 * const station = makeStation({ id: 'm2' });
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
 * A buffer with the editor default capacity of 10.
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
    pos: [4, 0],
    params: { capacity: 10 },
    routing: null,
    ...changes,
  };
}

/**
 * A conveyor with the editor defaults: 5 m at 10 m/min, capacity 5.
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
    pos: [6, 0],
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
    pos: [8, 0],
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
    pos: [8, 2],
    params: {},
    ...changes,
  };
}

/**
 * A scenario with the editor defaults: one 8 h shift, 30 replications, seed
 * 42, no warm-up and no overrides. `durationSec` sets the duration in
 * seconds, so a test can write it as a literal; it is stored as
 * `durationH = durationSec / 3600`.
 *
 * @param changes - Fields to replace, and the duration in seconds.
 * @returns The scenario.
 *
 * @example
 * const scenario = makeScenario({ durationSec: 300 });
 */
export function makeScenario(
  changes: Partial<Scenario> & { readonly durationSec?: number } = {},
): Scenario {
  const { durationSec, ...fields } = changes;

  return {
    id: 'base',
    name: 'Atual',
    mode: 'shift',
    durationH: durationSec === undefined ? 8 : durationSec / 3600,
    replicationCount: 30,
    seed: 42,
    warmupMin: null,
    overrides: [],
    ...fields,
  };
}

/**
 * A plant with fixed test data: by default a source, a station and a sink in
 * a line, in one zone of a 40 by 12 grid, with one scenario.
 *
 * @param changes - Top-level fields to replace.
 * @returns The plant.
 *
 * @example
 * const plant = makePlant({ scenarios: [makeScenario({ durationSec: 300 })] });
 */
export function makePlant(changes: Partial<Plant> = {}): Plant {
  return {
    schemaVersion: 1,
    id: 'plant_01',
    name: 'Linha de teste',
    grid: { cols: 40, rows: 12 },
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

/**
 * A plant whose elements form one line in the given order: each element is
 * placed two cells after the previous one and connected to the next.
 *
 * @param elements - The elements, from the source to the sink.
 * @param scenario - The plant's only scenario.
 * @returns The plant.
 *
 * @example
 * const plant = makeLinePlant([makeSource(), makeStation(), makeSink()], makeScenario({ durationSec: 300 }));
 */
export function makeLinePlant(
  elements: readonly PlantElement[],
  scenario: Scenario = makeScenario(),
): Plant {
  const connections: Connection[] = [];
  let previous: PlantElement | undefined;

  for (const element of elements) {
    if (previous !== undefined) {
      connections.push({
        id: `c${String(connections.length + 1)}`,
        from: previous.id,
        to: element.id,
        kind: 'direct',
      });
    }

    previous = element;
  }

  return makePlant({
    elements: elements.map((element, i) => ({ ...element, pos: [2 * i, 0] })),
    connections,
    scenarios: [scenario],
  });
}

/**
 * A source whose parts arrive at a fixed interval.
 *
 * @param fields - The interval, the queue capacity and, optionally, the id.
 * @returns The source.
 *
 * @example
 * const source = makeFixedSource({ intervalSec: 10, queueCapacity: 2 });
 */
export function makeFixedSource(fields: {
  readonly id?: string;
  readonly intervalSec: number;
  readonly queueCapacity: number;
}): SourceElement {
  return makeSource({
    id: fields.id ?? 'src1',
    params: {
      interarrival: { dist: 'fixed', valueSec: fields.intervalSec },
      queueCapacity: fields.queueCapacity,
    },
  });
}

/**
 * A station with a fixed cycle and the other editor defaults.
 *
 * @param fields - The cycle and, optionally, the id.
 * @returns The station.
 *
 * @example
 * const station = makeFixedStation({ id: 'm2', cycleSec: 30 });
 */
export function makeFixedStation(fields: {
  readonly id?: string;
  readonly cycleSec: number;
}): StationElement {
  const station = makeStation({ id: fields.id ?? 'm1' });

  return {
    ...station,
    params: {
      ...station.params,
      cycle: { dist: 'fixed', valueSec: fields.cycleSec },
    },
  };
}

/**
 * A source, a station and a sink in a line, built only from the editor
 * defaults of the plant schema (`createDefaultElement`,
 * `createDefaultScenario`).
 *
 * @returns The plant.
 *
 * @example
 * const plant = makeDefaultLinePlant();
 */
export function makeDefaultLinePlant(): Plant {
  return makePlant({
    elements: [
      createDefaultElement('production.source', {
        id: 'src1',
        zoneId: 'z1',
        pos: [0, 0],
      }),
      createDefaultElement('production.station', {
        id: 'm1',
        zoneId: 'z1',
        pos: [2, 0],
      }),
      createDefaultElement('production.sink', {
        id: 'snk1',
        zoneId: 'z1',
        pos: [4, 0],
      }),
    ],
    scenarios: [createDefaultScenario({ id: 'base', name: 'Atual' })],
  });
}
