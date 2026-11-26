import { findStreamStart } from '../rng/mrg32k3a.js';
import { findStreamIndex } from '../rng/stream-index.js';
import { catchError } from '../tests/helpers/catch-error.js';
import {
  makeBuffer,
  makeConveyor,
  makeLinePlant,
  makePlant,
  makeScenario,
  makeScrap,
  makeSink,
  makeSource,
  makeStation,
  testLimits,
} from '../tests/helpers/make-plant.js';
import { withUncheckedOverride } from '../tests/helpers/unchecked-plant.js';
import { compilePlant } from './compile-plant.js';

const options = { limits: testLimits, recordLog: false };

describe('compilePlant', () => {
  it('UC-SIM-002: compiles each element with its parameters, its connections and its stream', () => {
    const plant = makePlant();

    const compiled = compilePlant(plant, 'base', options);

    expect(compiled).toEqual({
      durationSec: 28_800,
      elements: [
        {
          kind: 'source',
          id: 'src1',
          index: 0,
          interarrival: { kind: 'exponential', meanSec: 60 },
          queueCapacity: 20,
          streamStart: findStreamStart(
            findStreamIndex(42, 'src1:interarrival'),
          ),
          outputIndex: 1,
        },
        {
          kind: 'station',
          id: 'm1',
          index: 1,
          cycle: { kind: 'fixed', valueSec: 50 },
          streamStart: findStreamStart(findStreamIndex(42, 'm1:cycle')),
          inputIndices: [0],
          outputIndex: 2,
        },
        { kind: 'sink', id: 'snk1', index: 2, inputIndices: [1] },
      ],
    });
  });

  it('UC-SIM-002: compiles the plant with the scenario overrides applied', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'cycle',
              value: { dist: 'fixed', valueSec: 46 },
            },
          ],
        }),
      ],
    });

    const compiled = compilePlant(plant, 'base', options);

    expect(compiled.elements[1]).toMatchObject({
      cycle: { kind: 'fixed', valueSec: 46 },
    });
  });

  it('UC-SIM-002: compiles the scenario it is asked for', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({ durationSec: 300 }),
        makeScenario({
          id: 'longer',
          name: 'Mais longo',
          durationSec: 600,
          seed: 7,
        }),
      ],
    });

    const compiled = compilePlant(plant, 'longer', options);

    expect(compiled.durationSec).toBe(600);
    expect(compiled.elements[1]).toMatchObject({
      streamStart: findStreamStart(findStreamIndex(7, 'm1:cycle')),
    });
  });

  it('compiles a truncated normal that holds probability', () => {
    const plant = makeLinePlant([
      makeSource(),
      makeStation({
        params: {
          cycle: {
            dist: 'truncatedNormal',
            meanSec: 30,
            standardDeviationSec: 5,
            minSec: 0,
            maxSec: null,
          },
          idealCycleSec: 30,
          defectRate: 0,
          failure: null,
        },
      }),
      makeSink(),
    ]);

    const compiled = compilePlant(plant, 'base', options);

    expect(compiled.elements[1]).toMatchObject({
      cycle: {
        kind: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: Infinity,
      },
    });
  });

  it('compiles a buffer with its capacity', () => {
    const plant = makeLinePlant([
      makeSource(),
      makeStation(),
      makeBuffer({ params: { capacity: 3 } }),
      makeStation({ id: 'm2' }),
      makeSink(),
    ]);

    const compiled = compilePlant(plant, 'base', options);

    expect(compiled.elements[2]).toEqual({
      kind: 'buffer',
      id: 'b1',
      index: 2,
      capacity: 3,
      inputIndices: [1],
      outputIndex: 3,
    });
  });

  it('compiles inputs in connection order', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeSource({ id: 'src2', pos: [0, 2] }),
        makeStation(),
        makeSink(),
      ],
      connections: [
        { id: 'c1', from: 'src2', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c3', from: 'm1', to: 'snk1', kind: 'direct' },
      ],
    });

    const compiled = compilePlant(plant, 'base', options);

    expect(compiled.elements[2]).toMatchObject({ inputIndices: [1, 0] });
  });

  it('RN-SIM-010: the stream of a key does not depend on the other elements', () => {
    const alone = compilePlant(makePlant(), 'base', options);
    const plant = makeLinePlant([
      makeSource(),
      makeStation(),
      makeStation({ id: 'm2' }),
      makeSink(),
    ]);

    const withAnother = compilePlant(plant, 'base', options);

    expect(withAnother.elements[1]).toEqual(alone.elements[1]);
  });

  it('UC-SIM-002: refuses a plant whose truncated normals have no probability with INVALID_PLANT and one EMPTY_TRUNCATION each', () => {
    const plant = makePlant({
      elements: [
        makeSource({
          params: {
            interarrival: {
              dist: 'truncatedNormal',
              meanSec: 0,
              standardDeviationSec: 1,
              minSec: 40,
              maxSec: null,
            },
            queueCapacity: 20,
          },
        }),
        makeStation(),
        makeSink(),
      ],
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'cycle',
              value: {
                dist: 'truncatedNormal',
                meanSec: 0,
                standardDeviationSec: 1,
                minSec: 40,
                maxSec: 41,
              },
            },
          ],
        }),
      ],
    });

    const error = catchError(() => compilePlant(plant, 'base', options));

    expect(error).toMatchObject({
      code: 'INVALID_PLANT',
      details: {
        issues: [
          {
            elementId: 'src1',
            path: ['elements', 0, 'params', 'interarrival'],
            code: 'EMPTY_TRUNCATION',
          },
          {
            elementId: 'm1',
            path: ['elements', 1, 'params', 'cycle'],
            code: 'EMPTY_TRUNCATION',
          },
        ],
      },
    });
  });

  it('UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED before starting when the plant has more elements than the limit', () => {
    const limits = { ...testLimits, elementCount: 2 };

    const error = catchError(() =>
      compilePlant(makePlant(), 'base', { limits, recordLog: false }),
    );

    expect(error).toMatchObject({
      code: 'SIMULATION_LIMIT_EXCEEDED',
      details: { limit: 'elementCount' },
    });
  });

  it('UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED before starting when the duration is longer than the limit', () => {
    const plant = makePlant({
      scenarios: [makeScenario({ durationSec: 3600 })],
    });
    const limits = { ...testLimits, durationSec: 3599 };

    const error = catchError(() =>
      compilePlant(plant, 'base', { limits, recordLog: false }),
    );

    expect(error).toMatchObject({
      code: 'SIMULATION_LIMIT_EXCEEDED',
      details: { limit: 'durationSec' },
    });
  });

  it('UC-SIM-002: accepts a plant at exactly the element and duration limits', () => {
    const plant = makePlant({
      scenarios: [makeScenario({ durationSec: 3600 })],
    });
    const limits = { ...testLimits, elementCount: 3, durationSec: 3600 };

    const compiled = compilePlant(plant, 'base', { limits, recordLog: false });

    expect(compiled.durationSec).toBe(3600);
  });

  it('throws a defect for an unknown scenario', () => {
    const error = catchError(() => compilePlant(makePlant(), 'nope', options));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('throws a defect for an element with no output', () => {
    const plant = makePlant({
      connections: [{ id: 'c1', from: 'src1', to: 'm1', kind: 'direct' }],
    });

    const error = catchError(() => compilePlant(plant, 'base', options));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('throws a defect for a connection to an unknown element', () => {
    const plant = makePlant({
      connections: [
        { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'm1', to: 'ghost', kind: 'direct' },
      ],
    });

    const error = catchError(() => compilePlant(plant, 'base', options));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it.each([
    {
      feature: 'a conveyor',
      plant: makeLinePlant([makeSource(), makeConveyor(), makeSink()]),
    },
    {
      feature: 'a scrap',
      plant: makeLinePlant([makeSource(), makeStation(), makeScrap()]),
    },
    {
      feature: 'defects',
      plant: makeLinePlant([
        makeSource(),
        makeStation({
          params: {
            cycle: { dist: 'fixed', valueSec: 50 },
            idealCycleSec: 50,
            defectRate: 0.02,
            failure: null,
          },
        }),
        makeSink(),
      ]),
    },
    {
      feature: 'failures',
      plant: makeLinePlant([
        makeSource(),
        makeStation({
          params: {
            cycle: { dist: 'fixed', valueSec: 50 },
            idealCycleSec: 50,
            defectRate: 0,
            failure: {
              timeToFailure: { dist: 'exponential', meanSec: 14_400 },
              repairTime: { dist: 'exponential', meanSec: 900 },
            },
          },
        }),
        makeSink(),
      ]),
    },
    {
      feature: 'a routing rule on a station',
      plant: makeLinePlant([
        makeSource(),
        makeStation({ routing: { rule: 'shortestQueue' } }),
        makeSink(),
      ]),
    },
    {
      feature: 'a routing rule on a source',
      plant: makeLinePlant([
        makeSource({ routing: { rule: 'shortestQueue' } }),
        makeStation(),
        makeSink(),
      ]),
    },
    {
      feature: 'a routing rule on a buffer',
      plant: makeLinePlant([
        makeSource(),
        makeStation(),
        makeBuffer({ routing: { rule: 'shortestQueue' } }),
        makeStation({ id: 'm2' }),
        makeSink(),
      ]),
    },
    {
      feature: 'the continue mode',
      plant: makePlant({ scenarios: [makeScenario({ mode: 'continue' })] }),
    },
    {
      feature: 'the steady-state mode',
      plant: makePlant({
        scenarios: [makeScenario({ mode: 'steadyState', warmupMin: 30 })],
      }),
    },
  ])(
    'throws a defect for a plant with $feature until its sub-plan',
    ({ plant }) => {
      const error = catchError(() => compilePlant(plant, 'base', options));

      expect(error).toBeInstanceOf(Error);
      expect(error).not.toHaveProperty('code');
    },
  );

  it('applying a scenario with a __proto__ key changes no prototype', () => {
    const plant = withUncheckedOverride(
      makePlant(),
      '{"elementId":"m1","param":"cycle","value":{"dist":"fixed","valueSec":5,"__proto__":{"polluted":true}}}',
    );

    const compiled = compilePlant(plant, 'base', options);

    expect(Object.prototype).not.toHaveProperty('polluted');
    expect(compiled.elements[1]).toMatchObject({
      cycle: { kind: 'fixed', valueSec: 5 },
    });
  });
});
