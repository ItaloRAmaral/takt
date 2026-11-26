import { elementSchema } from './elements.js';
import { parseStructure } from './issues.js';
import {
  makeBuffer,
  makeConveyor,
  makeScrap,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';

describe('plant elements', () => {
  it.each([
    { element: makeSource() },
    { element: makeStation() },
    { element: makeBuffer() },
    { element: makeConveyor() },
    { element: makeSink() },
    { element: makeScrap() },
  ])('accepts a $element.type', ({ element }) => {
    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({ success: true, data: element });
  });

  it('accepts a station with failures and a fixed repair of 0', () => {
    const element = makeStation({
      params: {
        ...makeStation().params,
        failure: {
          timeToFailure: { dist: 'exponential', meanSec: 14_400 },
          repairTime: { dist: 'fixed', valueSec: 0 },
        },
      },
    });

    const result = parseStructure(elementSchema, element);

    expect(result.success).toBe(true);
  });

  it('RN-SIM-013: accepts a source queue capacity of 0', () => {
    const element = makeSource({
      params: { ...makeSource().params, queueCapacity: 0 },
    });

    const result = parseStructure(elementSchema, element);

    expect(result.success).toBe(true);
  });

  it.each([
    {
      element: makeSource({
        params: { ...makeSource().params, queueCapacity: 10_001 },
      }),
      path: ['params', 'queueCapacity'],
    },
    {
      element: makeConveyor({
        params: { ...makeConveyor().params, speedMPerMin: 0 },
      }),
      path: ['params', 'speedMPerMin'],
    },
    {
      element: makeConveyor({
        params: { ...makeConveyor().params, lengthM: 10_001 },
      }),
      path: ['params', 'lengthM'],
    },
    {
      element: makeBuffer({ params: { capacity: 0 } }),
      path: ['params', 'capacity'],
    },
    {
      element: makeStation({
        params: { ...makeStation().params, defectRate: 1.5 },
      }),
      path: ['params', 'defectRate'],
    },
    {
      element: makeStation({
        params: { ...makeStation().params, idealCycleSec: 0 },
      }),
      path: ['params', 'idealCycleSec'],
    },
    {
      element: makeStation({ size: [0, 1] }),
      path: ['size', 0],
    },
    {
      element: makeStation({ pos: [200, 0] }),
      path: ['pos', 0],
    },
  ])('rejects $path out of range with OUT_OF_RANGE', ({ element, path }) => {
    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path, code: 'OUT_OF_RANGE' }],
    });
  });

  it('RN-SIM-015: rejects a fixed time to failure of 0', () => {
    const element = makeStation({
      params: {
        ...makeStation().params,
        failure: {
          timeToFailure: { dist: 'fixed', valueSec: 0 },
          repairTime: { dist: 'exponential', meanSec: 900 },
        },
      },
    });

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [
        {
          path: ['params', 'failure', 'timeToFailure', 'valueSec'],
          code: 'OUT_OF_RANGE',
        },
      ],
    });
  });

  it('RN-SIM-016: rejects a failure on a conveyor', () => {
    const element = {
      ...makeConveyor(),
      params: { ...makeConveyor().params, failure: null },
    };

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['params', 'failure'], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('rejects a routing rule on a sink', () => {
    const element = { ...makeSink(), routing: null };

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['routing'], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('rejects a __proto__ key parsed from JSON inside an element', () => {
    const element: unknown = JSON.parse(
      '{"id":"snk1","type":"production.sink","zoneId":"z1","pos":[0,0],"rotDeg":0,"size":[1,1],"params":{"__proto__":{"polluted":true}}}',
    );

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['params', '__proto__'], code: 'UNKNOWN_FIELD' }],
    });
  });

  it.each([
    { field: 'type', value: 'production.robot' },
    { field: 'rotDeg', value: 45 },
  ])('rejects $field = $value with INVALID_VALUE', ({ field, value }) => {
    const element = { ...makeStation(), [field]: value };

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'INVALID_VALUE' }],
    });
  });

  it.each([
    { id: 'a:b' },
    { id: 'máquina' },
    { id: 'm 1' },
    { id: 'm\n1' },
    { id: '' },
    { id: 'm'.repeat(65) },
  ])('rejects the id $id with INVALID_FORMAT', ({ id }) => {
    const element = makeStation({ id });

    const result = parseStructure(elementSchema, element);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['id'], code: 'INVALID_FORMAT' }],
    });
  });
});
