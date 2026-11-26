/**
 * The safety limits of a run. Passing one stops the run with
 * `SIMULATION_LIMIT_EXCEEDED`; a value equal to the limit is accepted.
 */
export interface SimulationLimits {
  /** The most elements a plant may have. */
  readonly elementCount: number;
  /** The longest simulated time of one replication, in seconds. */
  readonly durationSec: number;
  /** The most events a run may process. */
  readonly eventCount: number;
}

/** The name of one safety limit, as `SIMULATION_LIMIT_EXCEEDED` reports it. */
export type SimulationLimit = keyof SimulationLimits;

/** How to run, apart from the scenario the plant holds. */
export interface RunOptions {
  /** The safety limits, with no default until they are measured. */
  readonly limits: SimulationLimits;
  /** Whether the run records its event log. */
  readonly recordLog: boolean;
}
