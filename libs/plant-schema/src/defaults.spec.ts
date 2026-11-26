import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  createDefaultElement,
  createDefaultFailure,
  createDefaultScenario,
  createDefaultSettings,
} from './defaults.js';
import { makePlant } from './tests/helpers/make-plant.js';
import { validatePlant } from './validate-plant.js';

const demoLine: unknown = JSON.parse(
  readFileSync(
    path.join(import.meta.dirname, '../examples/demo-line.json'),
    'utf8',
  ),
);

describe('editor defaults', () => {
  it('RN-EDT-003: a source, a station and a sink with the defaults are valid', () => {
    const plant = makePlant({
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
      settings: createDefaultSettings(),
      scenarios: [createDefaultScenario({ id: 'base', name: 'Atual' })],
    });

    const validation = validatePlant(plant);

    expect(validation.valid).toBe(true);
  });

  it('RN-EDT-003: a buffer and a conveyor with the defaults are valid in a line', () => {
    const plant = makePlant({
      elements: [
        createDefaultElement('production.source', {
          id: 'src1',
          zoneId: 'z1',
          pos: [0, 0],
        }),
        createDefaultElement('production.buffer', {
          id: 'b1',
          zoneId: 'z1',
          pos: [2, 0],
        }),
        createDefaultElement('production.conveyor', {
          id: 'cv1',
          zoneId: 'z1',
          pos: [4, 0],
        }),
        createDefaultElement('production.sink', {
          id: 'snk1',
          zoneId: 'z1',
          pos: [6, 0],
        }),
      ],
      connections: [
        { id: 'c1', from: 'src1', to: 'b1', kind: 'direct' },
        { id: 'c2', from: 'b1', to: 'cv1', kind: 'direct' },
        { id: 'c3', from: 'cv1', to: 'snk1', kind: 'direct' },
      ],
    });

    const validation = validatePlant(plant);

    expect(validation.valid).toBe(true);
  });

  it.each([
    {
      type: 'production.source',
      params: {
        interarrival: { dist: 'exponential', meanSec: 60 },
        queueCapacity: 20,
      },
    },
    {
      type: 'production.station',
      params: {
        cycle: { dist: 'fixed', valueSec: 50 },
        idealCycleSec: 50,
        defectRate: 0,
        failure: null,
      },
    },
    { type: 'production.buffer', params: { capacity: 10 } },
    {
      type: 'production.conveyor',
      params: { lengthM: 5, speedMPerMin: 10, capacity: 5 },
    },
    { type: 'production.sink', params: {} },
    { type: 'production.scrap', params: {} },
  ] as const)(
    'RN-EDT-003: a new $type starts with $params',
    ({ type, params }) => {
      const element = createDefaultElement(type, {
        id: 'e1',
        zoneId: 'z1',
        pos: [0, 0],
      });

      expect(element).toMatchObject({
        id: 'e1',
        type,
        rotDeg: 0,
        size: [1, 1],
        params,
      });
    },
  );

  it('RN-SIM-015: failures start at 240 min to failure and 15 min of repair', () => {
    const failure = createDefaultFailure();

    expect(failure).toEqual({
      timeToFailure: { dist: 'exponential', meanSec: 14_400 },
      repairTime: { dist: 'exponential', meanSec: 900 },
    });
  });

  it('RN-SIM-003: a new scenario is one 8 h shift with 30 replications and seed 42', () => {
    const scenario = createDefaultScenario({ id: 'base', name: 'Atual' });

    expect(scenario).toEqual({
      id: 'base',
      name: 'Atual',
      mode: 'shift',
      durationH: 8,
      replicationCount: 30,
      seed: 42,
      warmupMin: null,
      overrides: [],
    });
  });

  it('RN-SIM-006: a new plant allows 2 reworks', () => {
    const settings = createDefaultSettings();

    expect(settings).toEqual({ reworkLimit: 2 });
  });

  it('each call returns new objects, so editing one element never changes the next', () => {
    const first = createDefaultElement('production.station', {
      id: 'm1',
      zoneId: 'z1',
      pos: [0, 0],
    });

    const second = createDefaultElement('production.station', {
      id: 'm2',
      zoneId: 'z1',
      pos: [2, 0],
    });

    expect(first.params).not.toBe(second.params);
  });

  it('the demo plant is valid', () => {
    const validation = validatePlant(demoLine);

    expect(validation.valid).toBe(true);
  });
});
