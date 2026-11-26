import { catchError } from './catch-error.js';
import type { LogEvent } from '../../replication/replication-result.js';
import {
  countUnaccountedParts,
  exitTimesSec,
  selectLogEvents,
  selectPartIds,
} from './log-queries.js';

const log: LogEvent[] = [
  { tSec: 10, type: 'arrive', sourceId: 'src1', partId: 1 },
  { tSec: 10, type: 'move', partId: 1, fromId: 'src1', toId: 'm1' },
  { tSec: 10, type: 'start', stationId: 'm1', partId: 1 },
  { tSec: 20, type: 'arrive', sourceId: 'src1', partId: 2 },
  { tSec: 20, type: 'lose', sourceId: 'src1', partId: 2 },
  { tSec: 30, type: 'finish', stationId: 'm1', partId: 1 },
  { tSec: 30, type: 'move', partId: 1, fromId: 'm1', toId: 'b1' },
  { tSec: 30, type: 'move', partId: 1, fromId: 'b1', toId: 'snk1' },
  { tSec: 40, type: 'arrive', sourceId: 'src1', partId: 3 },
  { tSec: 40, type: 'move', partId: 3, fromId: 'src1', toId: 'm1' },
  { tSec: 50, type: 'move', partId: 3, fromId: 'm1', toId: 'snk2' },
];

describe('log queries', () => {
  it('exitTimesSec gives the times of the moves into the sinks, in order', () => {
    const times = exitTimesSec(log, ['snk1', 'snk2']);

    expect(times).toEqual([30, 50]);
  });

  it('exitTimesSec leaves out the moves into other elements', () => {
    const times = exitTimesSec(log, ['b1']);

    expect(times).toEqual([30]);
  });

  it('selectLogEvents keeps the events of one type, in order', () => {
    const events = selectLogEvents(log, 'start');

    expect(events).toEqual([
      { tSec: 10, type: 'start', stationId: 'm1', partId: 1 },
    ]);
  });

  it('selectPartIds gives the parts of the events of one type, in order', () => {
    const partIds = selectPartIds(log, 'arrive');

    expect(partIds).toEqual([1, 2, 3]);
  });

  it('countUnaccountedParts is 0 when arrivals equal lost, exits and parts inside', () => {
    const count = countUnaccountedParts(log, ['snk1', 'snk2'], 0);

    expect(count).toBe(0);
  });

  it('countUnaccountedParts counts the arrivals that are neither lost, out nor inside', () => {
    const count = countUnaccountedParts(log, ['snk1'], 0);

    expect(count).toBe(1);
  });

  it('a query of a replication that ran without a log throws', () => {
    const error = catchError(() => exitTimesSec(null, ['snk1']));

    expect(error).toBeInstanceOf(Error);
  });
});
