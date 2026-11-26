import type { LogEvent } from '../../replication/replication-result.js';
import { catchError } from './catch-error.js';
import { sumTimeInWindowSec } from './time-in-window.js';

const log: LogEvent[] = [
  { tSec: 10, type: 'arrive', sourceId: 'src1', partId: 1 },
  { tSec: 10, type: 'move', partId: 1, fromId: 'src1', toId: 'm1' },
  { tSec: 20, type: 'arrive', sourceId: 'src1', partId: 2 },
  { tSec: 20, type: 'lose', sourceId: 'src1', partId: 2 },
  { tSec: 30, type: 'move', partId: 1, fromId: 'm1', toId: 'snk1' },
  { tSec: 40, type: 'arrive', sourceId: 'src1', partId: 3 },
  { tSec: 40, type: 'move', partId: 3, fromId: 'src1', toId: 'm1' },
];

describe('sumTimeInWindowSec', () => {
  it('sums each accepted part from its arrival to its exit or the end of the shift', () => {
    const totalSec = sumTimeInWindowSec(log, ['snk1'], 100);

    expect(totalSec).toBe(80);
  });

  it('a part that never reaches one of the sinks stays until the end of the shift', () => {
    const totalSec = sumTimeInWindowSec(log, ['snk2'], 100);

    expect(totalSec).toBe(150);
  });

  it('throws for a replication that ran without a log', () => {
    const error = catchError(() => sumTimeInWindowSec(null, ['snk1'], 100));

    expect(error).toBeInstanceOf(Error);
  });
});
