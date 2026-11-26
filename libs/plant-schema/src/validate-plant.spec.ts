import {
  makePlant,
  makeScenario,
  makeSink,
  makeSource,
  makeStation,
} from './tests/helpers/make-plant.js';
import { validatePlant } from './validate-plant.js';

describe('validatePlant', () => {
  it('UC-SIM-001: accepts a valid plant and returns it', () => {
    const plant = makePlant();

    const validation = validatePlant(plant);

    expect(validation).toEqual({ valid: true, plant });
  });

  it('RN-JSN-005: reports UNSUPPORTED_SCHEMA_VERSION for a newer version', () => {
    const document = { ...makePlant(), schemaVersion: 2, elements: 'broken' };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [{ path: ['schemaVersion'], code: 'UNSUPPORTED_SCHEMA_VERSION' }],
    });
  });

  it('RN-JSN-005: treats version 1.5 as a shape problem', () => {
    const document = { ...makePlant(), schemaVersion: 1.5 };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [{ path: ['schemaVersion'], code: 'INVALID_VALUE' }],
    });
  });

  it.each([{ document: null }, { document: 7 }, { document: [] }])(
    'rejects $document at the root with INVALID_TYPE',
    ({ document }) => {
      const validation = validatePlant(document);

      expect(validation).toEqual({
        valid: false,
        issues: [{ path: [], code: 'INVALID_TYPE' }],
      });
    },
  );

  it('UC-SIM-001: returns structural problems without running the semantic rules', () => {
    const document = {
      ...makePlant(),
      name: '',
      elements: [makeSource({ zoneId: 'z9' }), makeStation(), makeSink()],
    };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [{ path: ['name'], code: 'TOO_FEW_ITEMS' }],
    });
  });

  it('RN-JSN-005: points a negative cycle to its element', () => {
    const document = {
      ...makePlant(),
      elements: [
        makeSource(),
        makeStation({
          params: {
            ...makeStation().params,
            cycle: { dist: 'fixed', valueSec: -1 },
          },
        }),
        makeSink(),
      ],
    };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [
        {
          elementId: 'm1',
          path: ['elements', 1, 'params', 'cycle', 'valueSec'],
          code: 'OUT_OF_RANGE',
        },
      ],
    });
  });

  it('omits elementId when the element id is invalid', () => {
    const document = {
      ...makePlant(),
      elements: [makeSource(), makeStation({ id: 'm:1' }), makeSink()],
    };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [{ path: ['elements', 1, 'id'], code: 'INVALID_FORMAT' }],
    });
  });

  it('fills elementId for a shape problem inside an override', () => {
    const document = {
      ...makePlant(),
      scenarios: [
        {
          ...makeScenario(),
          overrides: [{ elementId: 'm1', param: 'defectRate', value: 2 }],
        },
      ],
    };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [
        {
          elementId: 'm1',
          path: ['scenarios', 0, 'overrides', 0, 'value'],
          code: 'OUT_OF_RANGE',
        },
      ],
    });
  });

  it('UC-SIM-001: returns every problem at once', () => {
    const plant = makePlant({
      elements: [
        makeSource({ zoneId: 'z9' }),
        makeStation({ params: { ...makeStation().params, defectRate: 0.1 } }),
        makeSink({ pos: [0, 0] }),
      ],
      scenarios: [makeScenario({ warmupMin: 30 })],
    });

    const validation = validatePlant(plant);

    expect(validation).toEqual({
      valid: false,
      issues: [
        {
          elementId: 'src1',
          path: ['elements', 0, 'zoneId'],
          code: 'UNKNOWN_REFERENCE',
        },
        { elementId: 'snk1', path: ['elements', 2, 'pos'], code: 'OVERLAP' },
        {
          elementId: 'm1',
          path: ['elements', 1, 'routing'],
          code: 'QUALITY_ROUTING_REQUIRED',
        },
        { path: ['scenarios', 0, 'warmupMin'], code: 'INVALID_WARMUP' },
      ],
    });
  });

  it('RN-SIM-004: rejects a scenario that raises defectRate on a station without a quality rule', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'defectRate', value: 0.05 }],
        }),
      ],
    });

    const validation = validatePlant(plant);

    expect(validation).toEqual({
      valid: false,
      issues: [
        {
          elementId: 'm1',
          path: ['scenarios', 0],
          code: 'QUALITY_ROUTING_REQUIRED',
        },
      ],
    });
  });

  it('omits elementId for a shape problem in an override of an element that does not exist', () => {
    const document = {
      ...makePlant(),
      scenarios: [
        {
          ...makeScenario(),
          overrides: [{ elementId: 'ghost', param: 'defectRate', value: 2 }],
        },
      ],
    };

    const validation = validatePlant(document);

    expect(validation).toEqual({
      valid: false,
      issues: [
        {
          path: ['scenarios', 0, 'overrides', 0, 'value'],
          code: 'OUT_OF_RANGE',
        },
      ],
    });
  });
});
