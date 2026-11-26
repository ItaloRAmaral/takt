import type { LogEvent } from '../../replication/replication-result.js';
import { selectLogEvents, selectPartIds } from './log-queries.js';

/**
 * The total time the accepted parts spent in the line during the shift,
 * computed from the log alone: for each part that arrived and was not lost,
 * min(exit, T) − arrival, where the exit is its move into one of the sinks.
 * By Little's law in a finite window (Little 2011, LL.2) it equals the area
 * under the WIP curve, `wipAverage × T`.
 *
 * @param log - The replication log; `null` is an error of the test.
 * @param sinkIds - The ids of the sinks.
 * @param durationSec - The shift length T, in seconds.
 * @returns The total time, in seconds.
 *
 * @example
 * const totalSec = sumTimeInWindowSec(result.log, ['snk1'], 28_800);
 */
export function sumTimeInWindowSec(
  log: readonly LogEvent[] | null,
  sinkIds: readonly string[],
  durationSec: number,
): number {
  const lostIds = new Set(selectPartIds(log, 'lose'));
  const exitSecById = new Map(
    selectLogEvents(log, 'move')
      .filter((event) => event.type === 'move' && sinkIds.includes(event.toId))
      .map(({ partId, tSec }) => [partId, tSec]),
  );

  return selectLogEvents(log, 'arrive')
    .filter(({ partId }) => !lostIds.has(partId))
    .reduce(
      (totalSec, { partId, tSec }) =>
        totalSec + (exitSecById.get(partId) ?? durationSec) - tSec,
      0,
    );
}
