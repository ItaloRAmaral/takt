import { parseStructure } from './issues.js';
import { plantSchema } from './plant.js';
import {
  makePlant,
  makeScenario,
  makeStation,
} from '../tests/helpers/make-plant.js';

describe('plant document shape', () => {
  it('accepts a minimal plant', () => {
    const plant = makePlant();

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({ success: true, data: plant });
  });

  it('accepts a $schema link', () => {
    const plant = makePlant({
      $schema: 'https://example.com/plant.schema.json',
    });

    const result = parseStructure(plantSchema, plant);

    expect(result.success).toBe(true);
  });

  it('rejects a schemaVersion other than 1 with INVALID_VALUE', () => {
    const plant = { ...makePlant(), schemaVersion: 2 };

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['schemaVersion'], code: 'INVALID_VALUE' }],
    });
  });

  it('rejects more than 500 elements', () => {
    const plant = makePlant({
      elements: Array.from({ length: 501 }, () => makeStation()),
    });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['elements'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it('rejects more than 2000 connections', () => {
    const plant = makePlant({
      connections: Array.from({ length: 2001 }, () => ({
        id: 'c',
        from: 'a',
        to: 'b',
        kind: 'direct' as const,
      })),
    });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['connections'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it('rejects more than 20 scenarios', () => {
    const plant = makePlant({
      scenarios: Array.from({ length: 21 }, () => makeScenario()),
    });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['scenarios'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it('rejects more than 50 zones', () => {
    const plant = makePlant({
      zones: Array.from({ length: 51 }, () => ({ id: 'z', name: 'Z' })),
    });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['zones'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it('rejects a name longer than 120 characters', () => {
    const plant = makePlant({ name: 'n'.repeat(121) });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['name'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it.each([{ field: 'elements' }, { field: 'zones' }, { field: 'scenarios' }])(
    'rejects an empty $field list with TOO_FEW_ITEMS',
    ({ field }) => {
      const plant = { ...makePlant(), [field]: [] };

      const result = parseStructure(plantSchema, plant);

      expect(result).toEqual({
        success: false,
        issues: [{ path: [field], code: 'TOO_FEW_ITEMS' }],
      });
    },
  );

  it('RN-SIM-006: rejects a rework limit above 10', () => {
    const plant = makePlant({ settings: { reworkLimit: 11 } });

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['settings', 'reworkLimit'], code: 'OUT_OF_RANGE' }],
    });
  });

  it('rejects a connection kind other than direct', () => {
    const plant = {
      ...makePlant(),
      connections: [{ id: 'c1', from: 'src1', to: 'm1', kind: 'belt' }],
    };

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['connections', 0, 'kind'], code: 'INVALID_VALUE' }],
    });
  });

  it('rejects a __proto__ key parsed from JSON at the root', () => {
    const plant: unknown = JSON.parse(
      `{"__proto__":{"polluted":true},${JSON.stringify(makePlant()).slice(1)}`,
    );

    const result = parseStructure(plantSchema, plant);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['__proto__'], code: 'UNKNOWN_FIELD' }],
    });
  });
});
