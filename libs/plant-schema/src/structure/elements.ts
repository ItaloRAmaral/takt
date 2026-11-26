import { z } from 'zod';
import { idSchema } from './ids.js';
import { PLANT_LIMITS } from '../limits.js';
import { routingSchema } from './routing.js';
import { timeDistributionSchema } from './time-distribution.js';

const cell = z
  .int()
  .min(0)
  .max(PLANT_LIMITS.gridCells - 1);

const cellCount = z.int().min(1).max(PLANT_LIMITS.gridCells);

const failureSchema = z.strictObject({
  timeToFailure: timeDistributionSchema({ positive: true }),
  repairTime: timeDistributionSchema({ positive: false }),
});

/**
 * The schema of each element parameter, by name. A scenario override reuses
 * the same schema, so it has the same floors and ceilings as the field.
 *
 * - `interarrival`: time between arrivals at a source, above 0 when fixed.
 * - `queueCapacity`: parts a source queue holds, 0 to 10 000.
 * - `cycle`: processing time of a station.
 * - `idealCycleSec`: the station's ideal cycle time, the OEE performance
 *   reference, above 0.
 * - `defectRate`: chance that a processed part is defective, 0 to 1.
 * - `failure`: time to failure (from the end of the last repair) and repair
 *   time, or `null` for a station that never fails.
 * - `capacity`: parts a buffer or a conveyor holds, 1 to 10 000.
 * - `lengthM` and `speedMPerMin`: conveyor length and belt speed, above 0.
 */
export const elementParamSchemas = {
  interarrival: timeDistributionSchema({ positive: true }),
  queueCapacity: z.int().min(0).max(PLANT_LIMITS.capacity),
  cycle: timeDistributionSchema({ positive: false }),
  idealCycleSec: z.number().gt(0).max(PLANT_LIMITS.timeSec),
  defectRate: z.number().min(0).max(1),
  failure: failureSchema.nullable(),
  capacity: z.int().min(1).max(PLANT_LIMITS.capacity),
  lengthM: z.number().gt(0).max(PLANT_LIMITS.lengthM),
  speedMPerMin: z.number().gt(0).max(PLANT_LIMITS.speedMPerMin),
} as const;

const placement = {
  id: idSchema,
  zoneId: idSchema,
  pos: z.tuple([cell, cell]),
  rotDeg: z.literal([0, 90, 180, 270]),
  size: z.tuple([cellCount, cellCount]),
};

const params = elementParamSchemas;

/**
 * One element of a plant, discriminated by `type`. `pos` is the occupied cell
 * with the lowest column and row; `size` is columns by rows at 0° and 180°,
 * swapped at 90° and 270°. Sinks and scraps have no outputs, so no `routing`.
 *
 * @example
 * elementSchema.parse(element);
 */
export const elementSchema = z.discriminatedUnion('type', [
  z.strictObject({
    ...placement,
    type: z.literal('production.source'),
    params: z.strictObject({
      interarrival: params.interarrival,
      queueCapacity: params.queueCapacity,
    }),
    routing: routingSchema.nullable(),
  }),
  z.strictObject({
    ...placement,
    type: z.literal('production.station'),
    params: z.strictObject({
      cycle: params.cycle,
      idealCycleSec: params.idealCycleSec,
      defectRate: params.defectRate,
      failure: params.failure,
    }),
    routing: routingSchema.nullable(),
  }),
  z.strictObject({
    ...placement,
    type: z.literal('production.buffer'),
    params: z.strictObject({ capacity: params.capacity }),
    routing: routingSchema.nullable(),
  }),
  z.strictObject({
    ...placement,
    type: z.literal('production.conveyor'),
    params: z.strictObject({
      lengthM: params.lengthM,
      speedMPerMin: params.speedMPerMin,
      capacity: params.capacity,
    }),
    routing: routingSchema.nullable(),
  }),
  z.strictObject({
    ...placement,
    type: z.literal('production.sink'),
    params: z.strictObject({}),
  }),
  z.strictObject({
    ...placement,
    type: z.literal('production.scrap'),
    params: z.strictObject({}),
  }),
]);

/** An element of a plant, as a plant document stores it. */
export type PlantElement = z.infer<typeof elementSchema>;

/** The kind of an element (`production.station`, ...). */
export type ElementType = PlantElement['type'];

/** A source: where parts enter the plant. */
export type SourceElement = Extract<
  PlantElement,
  { type: 'production.source' }
>;

/** A station: processes one part at a time. */
export type StationElement = Extract<
  PlantElement,
  { type: 'production.station' }
>;

/** A buffer: a finite queue between elements. */
export type BufferElement = Extract<
  PlantElement,
  { type: 'production.buffer' }
>;

/** A conveyor: carries parts by length and speed. */
export type ConveyorElement = Extract<
  PlantElement,
  { type: 'production.conveyor' }
>;

/** A sink: where good parts leave the plant. */
export type SinkElement = Extract<PlantElement, { type: 'production.sink' }>;

/** A scrap: where scrapped parts leave the plant. */
export type ScrapElement = Extract<PlantElement, { type: 'production.scrap' }>;
