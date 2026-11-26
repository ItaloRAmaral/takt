import type { LogEvent } from '../../replication/replication-result.js';

/**
 * The times parts left the line: the moves into one of the given sinks, in
 * log order.
 *
 * @param log - The replication log; `null` is an error of the test.
 * @param sinkIds - The ids of the sinks.
 * @returns The exit times, in seconds.
 *
 * @example
 * const times = exitTimesSec(result.log, ['snk1']);
 */
export function exitTimesSec(
  log: readonly LogEvent[] | null,
  sinkIds: readonly string[],
): number[] {
  return requireLog(log)
    .filter((event) => event.type === 'move' && sinkIds.includes(event.toId))
    .map(({ tSec }) => tSec);
}

/**
 * The events of one type, in log order.
 *
 * @param log - The replication log; `null` is an error of the test.
 * @param type - The event type to keep.
 * @returns The events of that type.
 *
 * @example
 * const starts = selectLogEvents(result.log, 'start');
 */
export function selectLogEvents(
  log: readonly LogEvent[] | null,
  type: LogEvent['type'],
): LogEvent[] {
  return requireLog(log).filter((event) => event.type === type);
}

/**
 * The part numbers of the events of one type, in log order.
 *
 * @param log - The replication log; `null` is an error of the test.
 * @param type - The event type to keep.
 * @returns The part numbers.
 *
 * @example
 * const lost = selectPartIds(result.log, 'lose');
 */
export function selectPartIds(
  log: readonly LogEvent[] | null,
  type: LogEvent['type'],
): number[] {
  return selectLogEvents(log, type).map(({ partId }) => partId);
}

/**
 * How many arrived parts are neither lost, out of the line nor still
 * inside: 0 when every part is accounted for.
 *
 * @param log - The replication log; `null` is an error of the test.
 * @param sinkIds - The ids of the sinks.
 * @param insideCount - How many parts the final state lists.
 * @returns Arrivals minus lost parts, exits and parts inside.
 *
 * @example
 * const count = countUnaccountedParts(log, ['snk1'], result.finalState.parts.length);
 */
export function countUnaccountedParts(
  log: readonly LogEvent[] | null,
  sinkIds: readonly string[],
  insideCount: number,
): number {
  return (
    selectLogEvents(log, 'arrive').length -
    selectLogEvents(log, 'lose').length -
    exitTimesSec(log, sinkIds).length -
    insideCount
  );
}

function requireLog(log: readonly LogEvent[] | null): readonly LogEvent[] {
  if (log === null) {
    throw new Error('The replication ran without a log; pass recordLog: true.');
  }

  return log;
}
