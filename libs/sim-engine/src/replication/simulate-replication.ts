import { itemAt } from '../collections/item-at.js';
import { drawTimeSec } from '../distributions/variability.js';
import { SimulationError } from '../errors/simulation-error.js';
import {
  createEventQueue,
  scheduleSlot,
  slotTimeSec,
  takeNextSlot,
  type EventQueue,
} from '../events/event-queue.js';
import type {
  CompiledElement,
  CompiledPlant,
} from '../model/compiled-plant.js';
import { createRandomStream, type RandomStream } from '../rng/mrg32k3a.js';
import {
  addWipArea,
  createSeries,
  recordSeriesExit,
  summarizeSeries,
  type SeriesTotals,
} from '../stats/series.js';
import {
  changeTimeWeightedValue,
  createTimeWeightedValue,
  timeWeightedAverage,
  type TimeWeightedValue,
} from '../stats/time-weighted.js';
import { chooseInput } from './choose-input.js';
import type {
  FinalStation,
  FinalState,
  LogEvent,
  ReplicationIndicators,
  ReplicationResult,
  StationStatus,
} from './replication-result.js';
import type { RunOptions } from './run-options.js';

type Source = Extract<CompiledElement, { kind: 'source' }>;
type Station = Extract<CompiledElement, { kind: 'station' }>;

/** How long a station has been in each state, each as a 0 or 1 value. */
type StatusClock = Readonly<Record<StationStatus, TimeWeightedValue>>;

/** The counters of a replication. */
interface Counts {
  exitCount: number;
  leadTimeSumSec: number;
}

/** The mutable state of one replication, created once and never shared. */
interface Run {
  readonly plant: CompiledPlant;
  readonly queue: EventQueue;
  /** The element of each event slot: the sources and stations, in document order. */
  readonly slotElements: readonly (Source | Station)[];
  /** The random stream of each event slot. */
  readonly streams: readonly RandomStream[];
  /** The event slot of each element, or −1 for buffers and sinks. */
  readonly slotByElement: readonly number[];
  /** The parts each element holds, in queue order; sinks hold none. */
  readonly partsByElement: readonly number[][];
  /** Since when the next part of each element can move, in seconds; `Infinity` when none. */
  readonly availableSinceSec: number[];
  /** When part `n` arrived, at index `n − 1`, in seconds. */
  readonly arrivalSecByPart: number[];
  /** When part `n` entered the element that holds it, at index `n − 1`, in seconds. */
  readonly entrySecByPart: number[];
  /** The parts in the line. */
  readonly wip: TimeWeightedValue;
  /** The totals of each slice of 60 s. */
  readonly series: SeriesTotals;
  /** The arrivals of each element; only sources count. */
  readonly arrivalCountByElement: number[];
  /** The lost arrivals of each element; only sources count. */
  readonly lostCountByElement: number[];
  /** The state clock of each element; only stations change theirs. */
  readonly statusClockByElement: readonly StatusClock[];
  readonly counts: Counts;
  readonly log: LogEvent[] | null;
}

/**
 * Runs one replication of a shift: parts arrive at the sources, wait in
 * their queues, are processed one at a time by the stations, wait in the
 * buffers and leave at the sinks (RN-SIM-013, RN-SIM-014). Events at the
 * same instant run by kind, then by scheduling order; after each event the
 * elements with room pull, in document order, until a whole pass moves
 * nothing (RN-SIM-018). An event at or after the end of the shift is not
 * processed.
 *
 * @param plant - The plant, from `compilePlant`.
 * @param replication - The replication number, which picks the substream of
 *   every stream.
 * @param options - The run options: the event limit and whether to log.
 * @returns The indicators, the series of 60 s, the final state and, when
 *   asked, the log.
 * @throws {SimulationError} `SIMULATION_LIMIT_EXCEEDED` with `limit:
 *   'eventCount'` when the replication would process more events than the
 *   limit.
 * @throws {RangeError} When `replication` is outside 0 to 2^51 − 1.
 *
 * @example
 * const result = simulateReplication(compilePlant(plant, 'base', options), 0, options);
 */
export function simulateReplication(
  plant: CompiledPlant,
  replication: number,
  options: RunOptions,
): ReplicationResult {
  const run = createRun(plant, replication, options.recordLog);
  let eventCount = 0;

  run.slotElements.forEach((element, slot) => {
    if (element.kind === 'source') {
      scheduleArrival(run, element, slot, 0);
    }
  });

  // The sources always schedule their next arrival, so the queue is never
  // empty here; slotTimeSec would stop the run with a defect if it were.
  for (
    let slot = takeNextSlot(run.queue);
    slotTimeSec(run.queue, slot) < plant.durationSec;
    slot = takeNextSlot(run.queue)
  ) {
    eventCount += 1;

    if (eventCount > options.limits.eventCount) {
      throw new SimulationError(
        'SIMULATION_LIMIT_EXCEEDED',
        { limit: 'eventCount' },
        `The replication passed the limit of ${String(options.limits.eventCount)} events.`,
      );
    }

    handleEvent(run, slot, slotTimeSec(run.queue, slot));
  }

  addWipArea(run.series, run.wip.sinceSec, plant.durationSec, run.wip.value);

  return {
    replication,
    indicators: summarizeIndicators(run),
    series: summarizeSeries(run.series),
    finalState: describeFinalState(run),
    log: run.log,
  };
}

function createRun(
  plant: CompiledPlant,
  replication: number,
  recordLog: boolean,
): Run {
  const slotElements = plant.elements.filter(
    (element): element is Source | Station =>
      element.kind === 'source' || element.kind === 'station',
  );

  return {
    plant,
    queue: createEventQueue(
      slotElements.map(({ kind }) =>
        kind === 'source' ? 'arrival' : 'finishProcessing',
      ),
    ),
    slotElements,
    streams: slotElements.map(({ streamStart }) =>
      createRandomStream(streamStart, replication),
    ),
    slotByElement: plant.elements.map((element) =>
      slotElements.findIndex(({ index }) => index === element.index),
    ),
    partsByElement: plant.elements.map(() => []),
    availableSinceSec: plant.elements.map(() => Infinity),
    arrivalSecByPart: [],
    entrySecByPart: [],
    wip: createTimeWeightedValue(0),
    series: createSeries(plant.durationSec),
    arrivalCountByElement: plant.elements.map(() => 0),
    lostCountByElement: plant.elements.map(() => 0),
    statusClockByElement: plant.elements.map(() => ({
      busy: createTimeWeightedValue(0),
      blocked: createTimeWeightedValue(0),
      starved: createTimeWeightedValue(1),
    })),
    counts: { exitCount: 0, leadTimeSumSec: 0 },
    log: recordLog ? [] : null,
  };
}

function handleEvent(run: Run, slot: number, tSec: number): void {
  const element = itemAt(run.slotElements, slot);

  if (element.kind === 'source') {
    const partId = arrive(run, element, slot, tSec);

    moveParts(run, tSec);
    loseOverflow(run, element, partId, tSec);

    return;
  }

  finishProcessing(run, element, tSec);
  moveParts(run, tSec);
}

function scheduleArrival(
  run: Run,
  source: Source,
  slot: number,
  tSec: number,
): void {
  scheduleSlot(
    run.queue,
    slot,
    tSec + drawTimeSec(source.interarrival, itemAt(run.streams, slot)),
  );
}

function arrive(run: Run, source: Source, slot: number, tSec: number): number {
  scheduleArrival(run, source, slot, tSec);
  run.arrivalSecByPart.push(tSec);
  run.entrySecByPart.push(tSec);

  const partId = run.arrivalSecByPart.length;

  itemAt(run.partsByElement, source.index).push(partId);
  run.arrivalCountByElement[source.index] =
    itemAt(run.arrivalCountByElement, source.index) + 1;
  changeWip(run, tSec, 1);
  record(run, { tSec, type: 'arrive', sourceId: source.id, partId });
  refreshHeadAvailability(run, source.index);

  return partId;
}

function loseOverflow(
  run: Run,
  source: Source,
  partId: number,
  tSec: number,
): void {
  const queued = itemAt(run.partsByElement, source.index);

  if (queued.length <= source.queueCapacity) {
    return;
  }

  queued.pop();
  run.lostCountByElement[source.index] =
    itemAt(run.lostCountByElement, source.index) + 1;
  changeWip(run, tSec, -1);
  record(run, { tSec, type: 'lose', sourceId: source.id, partId });
  refreshHeadAvailability(run, source.index);
}

function finishProcessing(run: Run, station: Station, tSec: number): void {
  run.availableSinceSec[station.index] = tSec;
  changeStatus(run, station, 'blocked', tSec);
  record(run, {
    tSec,
    type: 'finish',
    stationId: station.id,
    partId: itemAt(itemAt(run.partsByElement, station.index), 0),
  });
}

function moveParts(run: Run, tSec: number): void {
  let moved = true;

  while (moved) {
    moved = false;

    for (const element of run.plant.elements) {
      if (pullInto(run, element, tSec)) {
        moved = true;
      }
    }
  }
}

function pullInto(run: Run, element: CompiledElement, tSec: number): boolean {
  if (element.kind === 'source' || !hasRoom(run, element)) {
    return false;
  }

  const fromIndex = chooseInput(element.inputIndices, run.availableSinceSec);

  if (fromIndex === -1) {
    return false;
  }

  movePart(run, itemAt(run.plant.elements, fromIndex), element, tSec);

  return true;
}

function hasRoom(run: Run, element: Exclude<CompiledElement, Source>): boolean {
  const heldCount = itemAt(run.partsByElement, element.index).length;

  switch (element.kind) {
    case 'station':
      return heldCount === 0;

    case 'buffer':
      return heldCount < element.capacity;

    case 'sink':
      return true;
  }
}

function movePart(
  run: Run,
  from: CompiledElement,
  to: CompiledElement,
  tSec: number,
): void {
  const fromParts = itemAt(run.partsByElement, from.index);
  const partId = itemAt(fromParts, 0);

  fromParts.shift();

  // A station holds one part, so after it moves the station has none.
  refreshHeadAvailability(run, from.index);

  if (from.kind === 'station') {
    changeStatus(run, from, 'starved', tSec);
  }

  record(run, { tSec, type: 'move', partId, fromId: from.id, toId: to.id });

  if (to.kind === 'sink') {
    leaveLine(run, partId, tSec);

    return;
  }

  itemAt(run.partsByElement, to.index).push(partId);
  run.entrySecByPart[partId - 1] = tSec;

  if (to.kind === 'station') {
    startProcessing(run, to, partId, tSec);
  } else {
    refreshHeadAvailability(run, to.index);
  }
}

function startProcessing(
  run: Run,
  station: Station,
  partId: number,
  tSec: number,
): void {
  const slot = itemAt(run.slotByElement, station.index);

  changeStatus(run, station, 'busy', tSec);
  record(run, { tSec, type: 'start', stationId: station.id, partId });
  scheduleSlot(
    run.queue,
    slot,
    tSec + drawTimeSec(station.cycle, itemAt(run.streams, slot)),
  );
}

function leaveLine(run: Run, partId: number, tSec: number): void {
  const leadTimeSec = tSec - itemAt(run.arrivalSecByPart, partId - 1);

  run.counts.exitCount += 1;
  run.counts.leadTimeSumSec += leadTimeSec;
  recordSeriesExit(run.series, tSec, leadTimeSec);
  changeWip(run, tSec, -1);
}

function changeWip(run: Run, tSec: number, change: number): void {
  addWipArea(run.series, run.wip.sinceSec, tSec, run.wip.value);
  changeTimeWeightedValue(run.wip, tSec, run.wip.value + change);
}

function changeStatus(
  run: Run,
  station: Station,
  status: StationStatus,
  tSec: number,
): void {
  const clock = itemAt(run.statusClockByElement, station.index);

  changeTimeWeightedValue(clock.busy, tSec, status === 'busy' ? 1 : 0);
  changeTimeWeightedValue(clock.blocked, tSec, status === 'blocked' ? 1 : 0);
  changeTimeWeightedValue(clock.starved, tSec, status === 'starved' ? 1 : 0);
}

function refreshHeadAvailability(run: Run, index: number): void {
  const [head] = itemAt(run.partsByElement, index);

  run.availableSinceSec[index] =
    head === undefined ? Infinity : itemAt(run.entrySecByPart, head - 1);
}

function record(run: Run, event: LogEvent): void {
  run.log?.push(event);
}

function describeFinalState(run: Run): FinalState {
  const { plant, queue } = run;

  return {
    parts: plant.elements.flatMap((element) =>
      itemAt(run.partsByElement, element.index).map((partId) => ({
        partId,
        elementId: element.id,
        arrivalSec: itemAt(run.arrivalSecByPart, partId - 1),
      })),
    ),
    stations: run.slotElements
      .filter((element) => element.kind === 'station')
      .map((station): FinalStation => {
        const slot = itemAt(run.slotByElement, station.index);

        if (itemAt(run.partsByElement, station.index).length === 0) {
          return {
            elementId: station.id,
            status: 'starved',
            remainingSec: null,
          };
        }

        if (itemAt(run.availableSinceSec, station.index) !== Infinity) {
          return {
            elementId: station.id,
            status: 'blocked',
            remainingSec: null,
          };
        }

        return {
          elementId: station.id,
          status: 'busy',
          remainingSec: slotTimeSec(queue, slot) - plant.durationSec,
        };
      }),
    sources: run.slotElements
      .filter((element) => element.kind === 'source')
      .map((source) => ({
        elementId: source.id,
        nextArrivalSec: slotTimeSec(
          queue,
          itemAt(run.slotByElement, source.index),
        ),
      })),
  };
}

function summarizeIndicators(run: Run): ReplicationIndicators {
  const { plant, counts } = run;
  const durationSec = plant.durationSec;
  const sources = run.slotElements
    .filter((element) => element.kind === 'source')
    .map((source) => ({
      elementId: source.id,
      arrivalCount: itemAt(run.arrivalCountByElement, source.index),
      lostArrivalCount: itemAt(run.lostCountByElement, source.index),
    }));

  return {
    throughputPerHour: (counts.exitCount * 3600) / durationSec,
    wipAverage: timeWeightedAverage(run.wip, durationSec),
    leadTimeAverageSec:
      counts.exitCount === 0 ? null : counts.leadTimeSumSec / counts.exitCount,
    arrivalCount: run.arrivalSecByPart.length,
    lostArrivalCount: sources.reduce(
      (total, { lostArrivalCount }) => total + lostArrivalCount,
      0,
    ),
    exitCount: counts.exitCount,
    stations: run.slotElements
      .filter((element) => element.kind === 'station')
      .map((station) => {
        const clock = itemAt(run.statusClockByElement, station.index);

        return {
          elementId: station.id,
          busyRatio: timeWeightedAverage(clock.busy, durationSec),
          blockedRatio: timeWeightedAverage(clock.blocked, durationSec),
          starvedRatio: timeWeightedAverage(clock.starved, durationSec),
        };
      }),
    sources,
  };
}
