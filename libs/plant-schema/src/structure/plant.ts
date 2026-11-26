import { z } from 'zod';
import { elementSchema } from './elements.js';
import { idSchema, nameSchema } from './ids.js';
import { PLANT_LIMITS } from '../limits.js';
import { scenarioSchema } from './scenario.js';
import { settingsSchema } from './settings.js';

const gridSize = z.int().min(1).max(PLANT_LIMITS.gridCells);

/**
 * A connection from one element's output to another element's input.
 * `kind` is reserved for future connection types; v1 has only `direct`.
 *
 * @example
 * connectionSchema.parse({ id: 'c1', from: 'src1', to: 'm1', kind: 'direct' });
 */
export const connectionSchema = z.strictObject({
  id: idSchema,
  from: idSchema,
  to: idSchema,
  kind: z.literal('direct'),
});

/** A connection, as a plant document stores it. */
export type Connection = z.infer<typeof connectionSchema>;

/**
 * The shape of a plant document, version 1: every object strict, every value
 * written out (no implicit defaults), and every list within
 * {@link PLANT_LIMITS}. Rules across fields (references, flow, grid,
 * routing) are checked after the shape.
 *
 * @example
 * plantSchema.safeParse(JSON.parse(text));
 */
export const plantSchema = z.strictObject({
  $schema: z.string().max(PLANT_LIMITS.schemaUrlLength).optional(),
  schemaVersion: z.literal(1),
  id: idSchema,
  name: nameSchema,
  grid: z.strictObject({ cols: gridSize, rows: gridSize }),
  zones: z
    .array(z.strictObject({ id: idSchema, name: nameSchema }))
    .min(1)
    .max(PLANT_LIMITS.zoneCount),
  elements: z.array(elementSchema).min(1).max(PLANT_LIMITS.elementCount),
  connections: z.array(connectionSchema).max(PLANT_LIMITS.connectionCount),
  settings: settingsSchema,
  scenarios: z.array(scenarioSchema).min(1).max(PLANT_LIMITS.scenarioCount),
});

/** A plant document in the current version. */
export type Plant = z.infer<typeof plantSchema>;
