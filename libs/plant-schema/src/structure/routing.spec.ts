import { parseStructure } from './issues.js';
import { routingSchema } from './routing.js';

describe('routing rules', () => {
  it.each([
    {
      routing: { rule: 'byQuality', good: 'b1', rework: 'rw1', scrap: 'scr1' },
    },
    { routing: { rule: 'byQuality', good: 'b1', rework: null, scrap: 'scr1' } },
    {
      routing: {
        rule: 'byPercentage',
        shares: [
          { to: 'a', sharePct: 70 },
          { to: 'b', sharePct: 30 },
        ],
      },
    },
    { routing: { rule: 'shortestQueue' } },
  ])('accepts $routing', ({ routing }) => {
    const result = parseStructure(routingSchema, routing);

    expect(result).toEqual({ success: true, data: routing });
  });

  it.each([{ sharePct: 0 }, { sharePct: 101 }, { sharePct: 1.5 }])(
    'RN-SIM-005: rejects a share of $sharePct percent with OUT_OF_RANGE',
    ({ sharePct }) => {
      const routing = {
        rule: 'byPercentage',
        shares: [
          { to: 'a', sharePct },
          { to: 'b', sharePct: 30 },
        ],
      };

      const result = parseStructure(routingSchema, routing);

      expect(result).toEqual({
        success: false,
        issues: [{ path: ['shares', 0, 'sharePct'], code: 'OUT_OF_RANGE' }],
      });
    },
  );

  it('rejects a byPercentage rule with a single share', () => {
    const routing = {
      rule: 'byPercentage',
      shares: [{ to: 'a', sharePct: 100 }],
    };

    const result = parseStructure(routingSchema, routing);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['shares'], code: 'TOO_FEW_ITEMS' }],
    });
  });

  it('rejects a byQuality rule without a scrap destination', () => {
    const routing = { rule: 'byQuality', good: 'b1', rework: null };

    const result = parseStructure(routingSchema, routing);

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['scrap'], code: 'REQUIRED' }],
    });
  });

  it('rejects an unknown rule with INVALID_VALUE', () => {
    const result = parseStructure(routingSchema, { rule: 'byPriority' });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['rule'], code: 'INVALID_VALUE' }],
    });
  });
});
