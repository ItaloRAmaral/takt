import {
  makePlant,
  makeScenario,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { checkScenarios } from './scenarios.js';

const splitLine = makePlant({
  elements: [
    makeSource(),
    makeStation({ routing: { rule: 'shortestQueue' } }),
    makeSink(),
    makeSink({ id: 'snk2', pos: [4, 4] }),
  ],
  connections: [
    { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
    { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
    { id: 'c3', from: 'm1', to: 'snk2', kind: 'direct' },
  ],
});

describe('scenario rules', () => {
  it('finds nothing wrong in a scenario without overrides', () => {
    const plant = makePlant();

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([]);
  });

  it('RN-SIM-007: accepts a steady-state scenario without warm-up', () => {
    const plant = makePlant({
      scenarios: [makeScenario({ mode: 'steadyState', warmupMin: null })],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([]);
  });

  it('accepts a steady-state warm-up of 0', () => {
    const plant = makePlant({
      scenarios: [makeScenario({ mode: 'steadyState', warmupMin: 0 })],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([]);
  });

  it.each([
    { mode: 'shift', warmupMin: 30 },
    { mode: 'continue', warmupMin: 30 },
    { mode: 'steadyState', warmupMin: 480 },
  ] as const)(
    'rejects a warm-up of $warmupMin min in $mode mode over 8 h',
    ({ mode, warmupMin }) => {
      const plant = makePlant({
        scenarios: [makeScenario({ mode, warmupMin })],
      });

      const issues = checkScenarios(plant, []);

      expect(issues).toEqual([
        { path: ['scenarios', 0, 'warmupMin'], code: 'INVALID_WARMUP' },
      ]);
    },
  );

  it('rejects an override for an element that does not exist', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm9', param: 'defectRate', value: 0.1 }],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        path: ['scenarios', 0, 'overrides', 0, 'elementId'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      },
    ]);
  });

  it('rejects an override for a parameter the element does not have', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'capacity', value: 5 }],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0, 'overrides', 0, 'param'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      },
    ]);
  });

  it('rejects a routing override on a sink', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'snk1', param: 'routing', value: null }],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'snk1',
        path: ['scenarios', 0, 'overrides', 0, 'param'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      },
    ]);
  });

  it('rejects the same override twice', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            { elementId: 'm1', param: 'defectRate', value: 0 },
            { elementId: 'm1', param: 'defectRate', value: 0 },
          ],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0, 'overrides', 1],
        code: 'DUPLICATE_OVERRIDE',
      },
    ]);
  });

  it('omits elementId from a repeated override for an element that does not exist', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            { elementId: 'ghost', param: 'defectRate', value: 0 },
            { elementId: 'ghost', param: 'defectRate', value: 0 },
          ],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        path: ['scenarios', 0, 'overrides', 0, 'elementId'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      },
      { path: ['scenarios', 0, 'overrides', 1], code: 'DUPLICATE_OVERRIDE' },
      {
        path: ['scenarios', 0, 'overrides', 1, 'elementId'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      },
    ]);
  });

  it('RN-SIM-004: rejects a scenario that raises defectRate on a station without a quality rule', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'defectRate', value: 0.05 }],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0],
        code: 'QUALITY_ROUTING_REQUIRED',
      },
    ]);
  });

  it('reports a scenario problem at its override path', () => {
    const plant = makePlant({
      ...splitLine,
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'routing',
              value: {
                rule: 'byPercentage',
                shares: [
                  { to: 'snk1', sharePct: 70 },
                  { to: 'snk2', sharePct: 29 },
                ],
              },
            },
          ],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0, 'overrides', 0, 'value', 'shares'],
        code: 'PERCENTAGES_NOT_100',
      },
    ]);
  });

  it('reports an incoherent override value at its override path', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'cycle',
              value: {
                dist: 'triangular',
                minSec: 50,
                modeSec: 40,
                maxSec: 60,
              },
            },
          ],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0, 'overrides', 0, 'value'],
        code: 'INVALID_RANGE',
      },
    ]);
  });

  it('does not repeat a base problem in a scenario', () => {
    const plant = makePlant({
      elements: [makeSource({ zoneId: 'z9' }), makeStation(), makeSink()],
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'idealCycleSec', value: 40 }],
        }),
      ],
    });

    const issues = checkScenarios(plant, [
      {
        elementId: 'src1',
        path: ['elements', 0, 'zoneId'],
        code: 'UNKNOWN_REFERENCE',
      },
    ]);

    expect(issues).toEqual([]);
  });

  it('reports an override problem even when the base has the same problem at that field', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({
          params: {
            ...makeStation().params,
            cycle: { dist: 'triangular', minSec: 30, modeSec: 25, maxSec: 35 },
          },
        }),
        makeSink(),
      ],
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'cycle',
              value: {
                dist: 'triangular',
                minSec: 40,
                modeSec: 25,
                maxSec: 35,
              },
            },
          ],
        }),
      ],
    });

    const issues = checkScenarios(plant, [
      {
        elementId: 'm1',
        path: ['elements', 1, 'params', 'cycle'],
        code: 'INVALID_RANGE',
      },
    ]);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['scenarios', 0, 'overrides', 0, 'value'],
        code: 'INVALID_RANGE',
      },
    ]);
  });

  it('rejects a warm-up equal to a fractional duration, without rounding error', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({ mode: 'steadyState', durationH: 4.15, warmupMin: 249 }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      { path: ['scenarios', 0, 'warmupMin'], code: 'INVALID_WARMUP' },
    ]);
  });

  it('UC-SIM-001: reports a bad warm-up together with the problems of the overrides applied', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          mode: 'shift',
          warmupMin: 30,
          overrides: [{ elementId: 'm1', param: 'defectRate', value: 0.05 }],
        }),
      ],
    });

    const issues = checkScenarios(plant, []);

    expect(issues).toEqual([
      { path: ['scenarios', 0, 'warmupMin'], code: 'INVALID_WARMUP' },
      {
        elementId: 'm1',
        path: ['scenarios', 0],
        code: 'QUALITY_ROUTING_REQUIRED',
      },
    ]);
  });
});
