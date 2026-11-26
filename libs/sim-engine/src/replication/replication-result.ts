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

/** What one replication gives. */
export interface ReplicationResult {
  /** The replication number, which picks the substream of every stream. */
  readonly replication: number;
  /** The line at the end of the replication. */
  readonly finalState: FinalState;
  /** Every step, when the run asked for the log; `null` otherwise. */
  readonly log: readonly LogEvent[] | null;
}
