/**
 * Codes of the expected errors the engine throws.
 *
 * - `SIMULATION_LIMIT_EXCEEDED`: a run passed a safety limit.
 * - `INVALID_PLANT`: the plant or the scenario cannot run.
 */
export type SimulationErrorCode = 'SIMULATION_LIMIT_EXCEEDED' | 'INVALID_PLANT';

/**
 * Expected error of the engine. Callers identify it by `code`, never by the
 * message.
 *
 * @example
 * throw new SimulationError('INVALID_PLANT', 'steady-state scenario without warm-up');
 */
export class SimulationError extends Error {
  override readonly name = 'SimulationError';

  /** What went wrong, as a stable code for callers and the interface. */
  readonly code: SimulationErrorCode;

  /**
   * @param code - The error code.
   * @param message - Description for the log; never shown to the user.
   */
  constructor(code: SimulationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
