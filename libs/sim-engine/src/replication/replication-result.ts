import type { SeriesSlice } from '../stats/series.js';

/**
 * One step of a replication, in the order it happened, for the 3D scene to
 * replay. Parts are numbered from 1 in arrival order, lost ones included.
 *
 * - `arrive`: a part arrives at a source.
 * - `lose`: the source queue was full, so the arrived part is lost.
 * - `move`: a part moves from one element to the next.
 * - `start`: a station starts processing a part.
 * - `finish`: a station finishes a part, which waits there until it moves.
 */
export type LogEvent =
  | {
      readonly tSec: number;
      readonly type: 'arrive' | 'lose';
      readonly sourceId: string;
      readonly partId: number;
    }
  | {
      readonly tSec: number;
      readonly type: 'move';
      readonly partId: number;
      readonly fromId: string;
      readonly toId: string;
    }
  | {
      readonly tSec: number;
      readonly type: 'start' | 'finish';
      readonly stationId: string;
      readonly partId: number;
    };

/**
 * What a station is doing: processing a part, holding a finished part that
 * cannot move on, or waiting for a part (RN-SIM-014).
 */
export type StationStatus = 'busy' | 'blocked' | 'starved';

/** A part still in the line at the end of the replication. */
export interface PartInLine {
  /** The part number. */
  readonly partId: number;
  /** The element that holds it. */
  readonly elementId: string;
  /** When it arrived at its source, in seconds. */
  readonly arrivalSec: number;
}

/** A station at the end of the replication. */
export interface FinalStation {
  /** The station id. */
  readonly elementId: string;
  /** What it is doing. */
  readonly status: StationStatus;
  /** How long the part in process still needs, in seconds; `null` unless busy. */
  readonly remainingSec: number | null;
}

/** A source at the end of the replication. */
export interface FinalSource {
  /** The source id. */
  readonly elementId: string;
  /** When its next part arrives, in seconds, at or after the end. */
  readonly nextArrivalSec: number;
}

/**
 * The line at the end of the replication, in the order of the plant
 * document and, within an element, in queue order.
 */
export interface FinalState {
  /** The parts still in the line. */
  readonly parts: readonly PartInLine[];
  /** Every station. */
  readonly stations: readonly FinalStation[];
  /** Every source. */
  readonly sources: readonly FinalSource[];
}

/** The time a station spent in each state, as ratios of the shift. */
export interface StationIndicators {
  /** The station id. */
  readonly elementId: string;
  /** Processing a part: the station's utilization. */
  readonly busyRatio: number;
  /** Holding a finished part that could not move on. */
  readonly blockedRatio: number;
  /** Waiting for a part. */
  readonly starvedRatio: number;
}

/** The arrivals of one source. */
export interface SourceIndicators {
  /** The source id. */
  readonly elementId: string;
  /** Every arrival, lost ones included. */
  readonly arrivalCount: number;
  /** The arrivals lost because the source queue was full (RN-SIM-013). */
  readonly lostArrivalCount: number;
}

/** The indicators of one replication, over the whole shift [0, T). */
export interface ReplicationIndicators {
  /** Parts that left at the sinks, per hour of shift. */
  readonly throughputPerHour: number;
  /**
   * The time-weighted average of the parts in the line: source queues,
   * buffers and stations, blocked ones included (RN-SIM-013).
   */
  readonly wipAverage: number;
  /**
   * The average time from arrival to exit of the parts that left, in
   * seconds; `null` when none left. Parts still inside are not counted.
   */
  readonly leadTimeAverageSec: number | null;
  /** Every arrival, lost ones included. */
  readonly arrivalCount: number;
  /** The arrivals lost at full source queues. */
  readonly lostArrivalCount: number;
  /** The parts that left at the sinks. */
  readonly exitCount: number;
  /** Every station, in document order. */
  readonly stations: readonly StationIndicators[];
  /** Every source, in document order. */
  readonly sources: readonly SourceIndicators[];
}

/** What one replication gives. */
export interface ReplicationResult {
  /** The replication number, which picks the substream of every stream. */
  readonly replication: number;
  /** The indicators over the whole shift. */
  readonly indicators: ReplicationIndicators;
  /** The indicators per slice of 60 s. */
  readonly series: readonly SeriesSlice[];
  /** The line at the end of the replication. */
  readonly finalState: FinalState;
  /** Every step, when the run asked for the log; `null` otherwise. */
  readonly log: readonly LogEvent[] | null;
}
