/**
 * A value that changes at instants of a replication, kept with the area
 * under it so far, so its time-weighted average costs nothing to update.
 * Mutable and internal to a replication; change it only through
 * {@link changeTimeWeightedValue}.
 */
export interface TimeWeightedValue {
  /** The current value. */
  value: number;
  /** When the current value started, in seconds. */
  sinceSec: number;
  /** The area under the value from 0 to `sinceSec`, in value × seconds. */
  area: number;
}

/**
 * Creates a value that holds `initialValue` from 0 s.
 *
 * @param initialValue - The value at 0 s.
 * @returns The time-weighted value.
 *
 * @example
 * const wip = createTimeWeightedValue(0);
 */
export function createTimeWeightedValue(
  initialValue: number,
): TimeWeightedValue {
  return { value: initialValue, sinceSec: 0, area: 0 };
}

/**
 * Changes the value at an instant, adding the area of the value it replaces.
 *
 * @param weighted - The time-weighted value; it changes.
 * @param tSec - When the value changes, in seconds, at or after the last change.
 * @param value - The new value.
 *
 * @example
 * changeTimeWeightedValue(wip, 10, wip.value + 1);
 */
export function changeTimeWeightedValue(
  weighted: TimeWeightedValue,
  tSec: number,
  value: number,
): void {
  weighted.area += weighted.value * (tSec - weighted.sinceSec);
  weighted.value = value;
  weighted.sinceSec = tSec;
}

/**
 * The time-weighted average of the value over [0, end).
 *
 * @param weighted - The time-weighted value.
 * @param endSec - The end of the window, in seconds, at or after the last
 *   change and above 0.
 * @returns The area under the value divided by the window length.
 *
 * @example
 * const wipAverage = timeWeightedAverage(wip, 28_800);
 */
export function timeWeightedAverage(
  weighted: TimeWeightedValue,
  endSec: number,
): number {
  return (
    (weighted.area + weighted.value * (endSec - weighted.sinceSec)) / endSec
  );
}
