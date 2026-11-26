import { z } from 'zod';
import { idSchema } from './ids.js';
import { PLANT_LIMITS } from '../limits.js';

/**
 * Where a part goes when its element has more than one outgoing connection:
 *
 * - `byQuality`: a good part to `good`; a defective part to `rework` while it
 *   still has reworks left (`null` means no rework), then to `scrap`;
 * - `byPercentage`: each part draws a destination, with whole percentages
 *   from 1 to 100 that sum to 100 (the sum is a plant rule);
 * - `shortestQueue`: to the destination with the shortest queue.
 *
 * @example
 * routingSchema.parse({ rule: 'shortestQueue' });
 */
export const routingSchema = z.discriminatedUnion('rule', [
  z.strictObject({
    rule: z.literal('byQuality'),
    good: idSchema,
    rework: idSchema.nullable(),
    scrap: idSchema,
  }),
  z.strictObject({
    rule: z.literal('byPercentage'),
    shares: z
      .array(
        z.strictObject({
          to: idSchema,
          sharePct: z.int().min(1).max(100),
        }),
      )
      .min(2)
      .max(PLANT_LIMITS.connectionCount),
  }),
  z.strictObject({ rule: z.literal('shortestQueue') }),
]);

/** A routing rule, as a plant document stores it. */
export type Routing = z.infer<typeof routingSchema>;
