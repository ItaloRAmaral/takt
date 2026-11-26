import { z } from 'zod';
import { elementParamSchemas } from './elements.js';
import { idSchema, nameSchema } from './ids.js';
import { PLANT_LIMITS } from '../limits.js';
import { routingSchema } from './routing.js';
import { reworkLimitSchema } from './settings.js';

const params = elementParamSchemas;

function elementOverride<const P extends string, V extends z.ZodType>(
  param: P,
  value: V,
) {
  return z.strictObject({
    elementId: idSchema,
    param: z.literal(param),
    value,
  });
}

/**
 * One change a scenario makes to the base plant: the whole value of one
 * parameter of one element, or the plant's rework limit. The value has the
 * same schema as the field it replaces. Whether the element has that
 * parameter is a plant rule.
 *
 * @example
 * overrideSchema.parse({ elementId: 'm3', param: 'cycle', value: { dist: 'fixed', valueSec: 46 } });
 */
export const overrideSchema = z.discriminatedUnion('param', [
  elementOverride('interarrival', params.interarrival),
  elementOverride('queueCapacity', params.queueCapacity),
  elementOverride('cycle', params.cycle),
  elementOverride('idealCycleSec', params.idealCycleSec),
  elementOverride('defectRate', params.defectRate),
  elementOverride('failure', params.failure),
  elementOverride('capacity', params.capacity),
  elementOverride('lengthM', params.lengthM),
  elementOverride('speedMPerMin', params.speedMPerMin),
  elementOverride('routing', routingSchema.nullable()),
  z.strictObject({
    param: z.literal('reworkLimit'),
    value: reworkLimitSchema,
  }),
]);

/** A scenario override, as a plant document stores it. */
export type Override = z.infer<typeof overrideSchema>;

/**
 * A scenario: how to run the plant (mode, duration, replications, seed,
 * warm-up) and the overrides it applies to the base plant. `warmupMin` is
 * `null` until a warm-up is chosen; only the steady-state mode uses one.
 *
 * @example
 * scenarioSchema.parse(scenario);
 */
export const scenarioSchema = z.strictObject({
  id: idSchema,
  name: nameSchema,
  mode: z.literal(['shift', 'continue', 'steadyState']),
  durationH: z.number().gt(0).max(PLANT_LIMITS.durationH),
  replicationCount: z
    .int()
    .min(PLANT_LIMITS.minReplicationCount)
    .max(PLANT_LIMITS.maxReplicationCount),
  seed: z.int().min(0).max(PLANT_LIMITS.seed),
  warmupMin: z
    .number()
    .min(0)
    .max(PLANT_LIMITS.durationH * 60)
    .nullable(),
  overrides: z.array(overrideSchema).max(PLANT_LIMITS.overrideCount),
});

/** A scenario, as a plant document stores it. */
export type Scenario = z.infer<typeof scenarioSchema>;
