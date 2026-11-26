import { parseStructure } from './issues.js';
import { scenarioSchema } from './scenario.js';
import { makeScenario } from '../tests/helpers/make-plant.js';

describe('scenarios', () => {
  it.each([{ replicationCount: 5 }, { replicationCount: 100 }])(
    'RN-SIM-003: accepts $replicationCount replications',
    ({ replicationCount }) => {
      const scenario = makeScenario({ replicationCount });

      const result = parseStructure(scenarioSchema, scenario);

      expect(result.success).toBe(true);
    },
  );

  it.each([{ replicationCount: 4 }, { replicationCount: 101 }])(
    'RN-SIM-003: rejects $replicationCount replications',
    ({ replicationCount }) => {
      const scenario = makeScenario({ replicationCount });

      const result = parseStructure(scenarioSchema, scenario);

      expect(result).toEqual({
        success: false,
        issues: [{ path: ['replicationCount'], code: 'OUT_OF_RANGE' }],
      });
    },
  );

  it.each([
    { field: 'durationH', value: 0 },
    { field: 'durationH', value: 721 },
    { field: 'seed', value: -1 },
    { field: 'seed', value: 4_294_967_296 },
    { field: 'seed', value: 1.5 },
    { field: 'warmupMin', value: -1 },
  ])('rejects $field = $value with OUT_OF_RANGE', ({ field, value }) => {
    const scenario = { ...makeScenario(), [field]: value };

    const result = parseStructure(scenarioSchema, scenario);

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'OUT_OF_RANGE' }],
    });
  });

  it('rejects an unknown mode with INVALID_VALUE', () => {
    const scenario = { ...makeScenario(), mode: 'week' };

    const result = parseStructure(scenarioSchema, scenario);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['mode'], code: 'INVALID_VALUE' }],
    });
  });

  it.each([
    {
      override: {
        elementId: 'm1',
        param: 'cycle',
        value: { dist: 'fixed', valueSec: 46 },
      },
    },
    {
      override: {
        elementId: 'm1',
        param: 'cycle',
        value: { dist: 'triangular', minSec: 40, modeSec: 46, maxSec: 60 },
      },
    },
    { override: { elementId: 'm1', param: 'failure', value: null } },
    {
      override: {
        elementId: 'm1',
        param: 'routing',
        value: { rule: 'shortestQueue' },
      },
    },
    { override: { elementId: 'b1', param: 'capacity', value: 20 } },
    { override: { param: 'reworkLimit', value: 0 } },
  ])('accepts the override $override', ({ override }) => {
    const scenario = { ...makeScenario(), overrides: [override] };

    const result = parseStructure(scenarioSchema, scenario);

    expect(result.success).toBe(true);
  });

  it.each([
    {
      override: {
        elementId: 'src1',
        param: 'interarrival',
        value: { dist: 'fixed', valueSec: 0 },
      },
      path: ['overrides', 0, 'value', 'valueSec'],
    },
    {
      override: { elementId: 'b1', param: 'capacity', value: 0 },
      path: ['overrides', 0, 'value'],
    },
    {
      override: { param: 'reworkLimit', value: 11 },
      path: ['overrides', 0, 'value'],
    },
  ])(
    'rejects the override $override with OUT_OF_RANGE, as the field itself would',
    ({ override, path }) => {
      const scenario = { ...makeScenario(), overrides: [override] };

      const result = parseStructure(scenarioSchema, scenario);

      expect(result).toEqual({
        success: false,
        issues: [{ path, code: 'OUT_OF_RANGE' }],
      });
    },
  );

  it('rejects a reworkLimit override bound to an element', () => {
    const scenario = {
      ...makeScenario(),
      overrides: [{ elementId: 'm1', param: 'reworkLimit', value: 1 }],
    };

    const result = parseStructure(scenarioSchema, scenario);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['overrides', 0, 'elementId'], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('rejects an override of an unknown parameter with INVALID_VALUE', () => {
    const scenario = {
      ...makeScenario(),
      overrides: [{ elementId: 'm1', param: 'colour', value: 'red' }],
    };

    const result = parseStructure(scenarioSchema, scenario);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['overrides', 0, 'param'], code: 'INVALID_VALUE' }],
    });
  });

  it('rejects more than 2000 overrides in a scenario', () => {
    const scenario = makeScenario({
      overrides: Array.from({ length: 2001 }, () => ({
        param: 'reworkLimit' as const,
        value: 1,
      })),
    });

    const result = parseStructure(scenarioSchema, scenario);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['overrides'], code: 'TOO_MANY_ITEMS' }],
    });
  });
});
