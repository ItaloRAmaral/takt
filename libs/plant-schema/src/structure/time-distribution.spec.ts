import { parseStructure } from './issues.js';
import { timeDistributionSchema } from './time-distribution.js';

const anyTime = timeDistributionSchema({ positive: false });
const positiveTime = timeDistributionSchema({ positive: true });

describe('time distribution', () => {
  it.each([
    { distribution: { dist: 'fixed', valueSec: 0 } },
    { distribution: { dist: 'fixed', valueSec: 31_536_000 } },
    { distribution: { dist: 'exponential', meanSec: 60 } },
    {
      distribution: { dist: 'triangular', minSec: 20, modeSec: 25, maxSec: 35 },
    },
    {
      distribution: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 0,
        maxSec: null,
      },
    },
    {
      distribution: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 10,
        maxSec: 50,
      },
    },
  ])('accepts $distribution', ({ distribution }) => {
    const result = parseStructure(anyTime, distribution);

    expect(result).toEqual({ success: true, data: distribution });
  });

  it.each([
    { distribution: { dist: 'fixed', valueSec: -1 }, field: 'valueSec' },
    {
      distribution: { dist: 'fixed', valueSec: 31_536_001 },
      field: 'valueSec',
    },
    { distribution: { dist: 'exponential', meanSec: 0 }, field: 'meanSec' },
    {
      distribution: { dist: 'triangular', minSec: -5, modeSec: 25, maxSec: 35 },
      field: 'minSec',
    },
    {
      distribution: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 0,
        minSec: 0,
        maxSec: null,
      },
      field: 'standardDeviationSec',
    },
  ])(
    'rejects $distribution with OUT_OF_RANGE on $field',
    ({ distribution, field }) => {
      const result = parseStructure(anyTime, distribution);

      expect(result).toEqual({
        success: false,
        issues: [{ path: [field], code: 'OUT_OF_RANGE' }],
      });
    },
  );

  it('rejects a fixed interarrival of 0', () => {
    const result = parseStructure(positiveTime, { dist: 'fixed', valueSec: 0 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['valueSec'], code: 'OUT_OF_RANGE' }],
    });
  });

  it('rejects an infinite mean with INVALID_TYPE', () => {
    const result = parseStructure(anyTime, {
      dist: 'exponential',
      meanSec: Number.POSITIVE_INFINITY,
    });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['meanSec'], code: 'INVALID_TYPE' }],
    });
  });

  it('rejects an unknown distribution with INVALID_VALUE', () => {
    const result = parseStructure(anyTime, { dist: 'uniform', minSec: 1 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['dist'], code: 'INVALID_VALUE' }],
    });
  });

  it('rejects a field of another distribution with UNKNOWN_FIELD', () => {
    const result = parseStructure(anyTime, {
      dist: 'fixed',
      valueSec: 10,
      meanSec: 10,
    });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['meanSec'], code: 'UNKNOWN_FIELD' }],
    });
  });
});
