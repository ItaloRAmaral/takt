import { itemAt } from '../collections/item-at.js';

/** The length of a series slice, in seconds. */
export const SERIES_SLICE_SEC = 60;

/** One slice of the series of a replication, [start, end). */
export interface SeriesSlice {
  /** When the slice starts, in seconds. */
  readonly startSec: number;
  /** When the slice ends, in seconds; the last one may be shorter than 60 s. */
  readonly endSec: number;
  /** How many parts left the line in the slice. */
  readonly exitCount: number;
  /** The time-weighted average of the parts in the line during the slice. */
  readonly wipAverage: number;
  /**
   * The average lead time of the parts that left in the slice, in seconds;
   * `null` when none left.
   */
  readonly leadTimeAverageSec: number | null;
}

interface SliceTotals {
  readonly startSec: number;
  readonly endSec: number;
  exitCount: number;
  wipArea: number;
  leadTimeSumSec: number;
}

/**
 * The totals of every slice of a replication, created once. Mutable and
 * internal to a replication; change it only through {@link addWipArea} and
 * {@link recordSeriesExit}.
 */
export interface SeriesTotals {
  /** The totals of each slice, in time order. */
  readonly slices: readonly SliceTotals[];
}

/**
 * Creates the slices of a shift: 60 s each from 0, the last one ending at
 * the end of the shift.
 *
 * @param durationSec - The shift length, in seconds, above 0.
 * @returns The series totals, all zero.
 *
 * @example
 * const series = createSeries(28_800);
 */
export function createSeries(durationSec: number): SeriesTotals {
  const slices: SliceTotals[] = [];

  for (let startSec = 0; startSec < durationSec; startSec += SERIES_SLICE_SEC) {
    slices.push({
      startSec,
      endSec: Math.min(startSec + SERIES_SLICE_SEC, durationSec),
      exitCount: 0,
      wipArea: 0,
      leadTimeSumSec: 0,
    });
  }

  return { slices };
}

/**
 * Adds the area of a constant WIP over [from, to), split across the slices
 * it spans.
 *
 * @param series - The series totals; they change.
 * @param fromSec - When the WIP started, in seconds.
 * @param toSec - When it changed, in seconds, at most the end of the shift.
 * @param wipCount - The parts in the line during [from, to).
 *
 * @example
 * addWipArea(series, 30, 135, 2);
 */
export function addWipArea(
  series: SeriesTotals,
  fromSec: number,
  toSec: number,
  wipCount: number,
): void {
  let startSec = fromSec;

  while (startSec < toSec) {
    const slice = itemAt(
      series.slices,
      Math.floor(startSec / SERIES_SLICE_SEC),
    );
    const endSec = Math.min(toSec, slice.endSec);

    slice.wipArea += wipCount * (endSec - startSec);
    startSec = endSec;
  }
}

/**
 * Records a part leaving the line in the slice that holds the exit instant.
 *
 * @param series - The series totals; they change.
 * @param tSec - When the part left, in seconds, before the end of the shift.
 * @param leadTimeSec - Its time from arrival to exit, in seconds.
 *
 * @example
 * recordSeriesExit(series, 60, 50);
 */
export function recordSeriesExit(
  series: SeriesTotals,
  tSec: number,
  leadTimeSec: number,
): void {
  const slice = itemAt(series.slices, Math.floor(tSec / SERIES_SLICE_SEC));

  slice.exitCount += 1;
  slice.leadTimeSumSec += leadTimeSec;
}

/**
 * The series as a replication returns it.
 *
 * @param series - The series totals, with the WIP area added up to the end
 *   of the shift.
 * @returns The slices, in time order.
 *
 * @example
 * const slices = summarizeSeries(series);
 */
export function summarizeSeries(series: SeriesTotals): SeriesSlice[] {
  return series.slices.map(
    ({ startSec, endSec, exitCount, wipArea, leadTimeSumSec }) => ({
      startSec,
      endSec,
      exitCount,
      wipAverage: wipArea / (endSec - startSec),
      leadTimeAverageSec: exitCount === 0 ? null : leadTimeSumSec / exitCount,
    }),
  );
}
