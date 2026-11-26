import { z } from 'zod';
import { PLANT_LIMITS } from '../limits.js';

/**
 * An identifier in a plant document: 1 to 64 ASCII letters, digits, `_` or
 * `-`. Colons are excluded because the engine joins an element id and a
 * purpose with one (`m1:cycle`); the pattern has no alternation or nested
 * quantifier, so it runs in linear time.
 *
 * @example
 * idSchema.parse('m1');
 */
export const idSchema = z
  .string()
  .regex(new RegExp(`^[A-Za-z0-9_-]{1,${String(PLANT_LIMITS.idLength)}}$`));

/**
 * A name shown to people (plant, zone, scenario): 1 to 120 characters.
 *
 * @example
 * nameSchema.parse('Linha 1');
 */
export const nameSchema = z.string().min(1).max(PLANT_LIMITS.nameLength);
