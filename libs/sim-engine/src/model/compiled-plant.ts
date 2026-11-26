import type { Variability } from '../distributions/variability.js';
import type { StreamStart } from '../rng/mrg32k3a.js';

/**
 * One element as the engine runs it. `index` is its position in the plant
 * document, which every list of the run follows; inputs are element indices
 * in the order of the plant's connections.
 */
export type CompiledElement =
  | {
      /** A source of parts. */
      readonly kind: 'source';
      /** The element id. */
      readonly id: string;
      /** The position in the plant document. */
      readonly index: number;
      /** The time between arrivals, in seconds. */
      readonly interarrival: Variability;
      /** How many arrived parts may wait in the source, from 0. */
      readonly queueCapacity: number;
      /** Where the arrival stream of this source starts. */
      readonly streamStart: StreamStart;
      /** The element the parts go to. */
      readonly outputIndex: number;
    }
  | {
      /** A station that processes one part at a time. */
      readonly kind: 'station';
      /** The element id. */
      readonly id: string;
      /** The position in the plant document. */
      readonly index: number;
      /** The processing time, in seconds. */
      readonly cycle: Variability;
      /** Where the cycle stream of this station starts. */
      readonly streamStart: StreamStart;
      /** The elements the station pulls from, in connection order. */
      readonly inputIndices: readonly number[];
      /** The element the finished parts go to. */
      readonly outputIndex: number;
    }
  | {
      /** A buffer that holds parts in arrival order. */
      readonly kind: 'buffer';
      /** The element id. */
      readonly id: string;
      /** The position in the plant document. */
      readonly index: number;
      /** How many parts it holds, from 1. */
      readonly capacity: number;
      /** The elements the buffer pulls from, in connection order. */
      readonly inputIndices: readonly number[];
      /** The element the parts go to. */
      readonly outputIndex: number;
    }
  | {
      /** A sink, where good parts leave the plant. */
      readonly kind: 'sink';
      /** The element id. */
      readonly id: string;
      /** The position in the plant document. */
      readonly index: number;
      /** The elements the sink pulls from, in connection order. */
      readonly inputIndices: readonly number[];
    };

/**
 * A plant ready to run one scenario: the scenario's overrides applied, times
 * in seconds, the element graph built and the random streams assigned.
 */
export interface CompiledPlant {
  /** How long a replication runs, in whole seconds. */
  readonly durationSec: number;
  /** The elements, in the order of the plant document. */
  readonly elements: readonly CompiledElement[];
}
