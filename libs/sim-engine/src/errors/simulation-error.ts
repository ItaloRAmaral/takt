import type { SimulationLimit } from '../replication/run-options.js';

/**
 * Codes of the expected errors the engine throws.
 *
 * - `SIMULATION_LIMIT_EXCEEDED`: a run passed a safety limit.
 * - `INVALID_PLANT`: the plant or the scenario cannot run.
 */
export type SimulationErrorCode = 'SIMULATION_LIMIT_EXCEEDED' | 'INVALID_PLANT';

/**
 * Why a plant cannot run, found only when the engine prepares it:
 *
 * - `EMPTY_TRUNCATION`: a truncated normal holds no probability in double
 *   precision.
 * - `STREAM_COLLISION`: two random streams of the run share a stream number.
 */
export type RunIssueCode = 'EMPTY_TRUNCATION' | 'STREAM_COLLISION';

/**
 * One reason a plant cannot run, in the shape of the plant problems
 * (`{ elementId?, path, code }`), so the page shows both the same way.
 */
export interface RunIssue {
  /** The element the problem belongs to. */
  readonly elementId?: string;
  /** Keys and indices from the plant root to the field; empty for the plant. */
  readonly path: readonly (string | number)[];
  /** Why the plant cannot run. */
  readonly code: RunIssueCode;
}

/** What each error code carries for the caller, besides the code. */
export interface SimulationErrorDetails {
  /** Which safety limit the run passed. */
  readonly SIMULATION_LIMIT_EXCEEDED: { readonly limit: SimulationLimit };
  /** Every reason the plant cannot run. */
  readonly INVALID_PLANT: { readonly issues: readonly RunIssue[] };
}

/**
 * Expected error of the engine. Callers identify it by `code`, never by the
 * message, and read `details` in the shape declared for that code.
 *
 * @example
 * throw new SimulationError('SIMULATION_LIMIT_EXCEEDED', { limit: 'eventCount' }, 'too many events');
 */
export class SimulationError<
  C extends SimulationErrorCode = SimulationErrorCode,
> extends Error {
  /** Always `SimulationError`, so logs and stack traces name the class. */
  override readonly name = 'SimulationError';

  /** What went wrong, as a stable code for callers and the interface. */
  readonly code: C;

  /** What the caller needs to explain the error, by code. */
  readonly details: SimulationErrorDetails[C];

  /**
   * @param code - The error code.
   * @param details - The details declared for that code.
   * @param message - Description for the log; never shown to the user.
   */
  constructor(code: C, details: SimulationErrorDetails[C], message: string) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
