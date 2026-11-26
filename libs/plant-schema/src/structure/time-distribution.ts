import { z } from 'zod';
import { PLANT_LIMITS } from '../limits.js';

const timeSec = z.number().min(0).max(PLANT_LIMITS.timeSec);

const positiveTimeSec = z.number().gt(0).max(PLANT_LIMITS.timeSec);

/**
 * The shape of a time that varies, in seconds: fixed, exponential, triangular
 * or a normal truncated to an interval (`maxSec: null` means no upper limit).
 * Every time runs from 0 to one year; an exponential mean and a normal
 * standard deviation must be above 0. Consistency between fields (minimum,
 * mode, maximum) is a plant rule, checked after the shape.
 *
 * @param options.positive - Whether a fixed time must be above 0, for times
 *   where 0 would schedule endless events at one instant (arrivals, time to
 *   failure).
 * @returns The Zod schema, discriminated by `dist`.
 *
 * @example
 * const interarrival = timeDistributionSchema({ positive: true });
 */
export function timeDistributionSchema(options: {
  readonly positive: boolean;
}) {
  return z.discriminatedUnion('dist', [
    z.strictObject({
      dist: z.literal('fixed'),
      valueSec: options.positive ? positiveTimeSec : timeSec,
    }),
    z.strictObject({
      dist: z.literal('exponential'),
      meanSec: positiveTimeSec,
    }),
    z.strictObject({
      dist: z.literal('triangular'),
      minSec: timeSec,
      modeSec: timeSec,
      maxSec: timeSec,
    }),
    z.strictObject({
      dist: z.literal('truncatedNormal'),
      meanSec: timeSec,
      standardDeviationSec: positiveTimeSec,
      minSec: timeSec,
      maxSec: timeSec.nullable(),
    }),
  ]);
}

/** A time that varies, in seconds, as a plant document stores it. */
export type TimeDistribution = z.infer<
  ReturnType<typeof timeDistributionSchema>
>;
