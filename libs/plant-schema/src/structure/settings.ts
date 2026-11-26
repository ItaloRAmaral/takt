import { z } from 'zod';
import { PLANT_LIMITS } from '../limits.js';

/**
 * How many reworks a part may use, summed over every station: 0 to 10.
 *
 * @example
 * reworkLimitSchema.parse(2);
 */
export const reworkLimitSchema = z.int().min(0).max(PLANT_LIMITS.reworkLimit);

/**
 * Settings that apply to the whole plant.
 *
 * @example
 * settingsSchema.parse({ reworkLimit: 2 });
 */
export const settingsSchema = z.strictObject({
  reworkLimit: reworkLimitSchema,
});

/** The plant-wide settings, as a plant document stores them. */
export type Settings = z.infer<typeof settingsSchema>;
