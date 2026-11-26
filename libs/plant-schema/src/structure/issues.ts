import type { z } from 'zod';
import { PLANT_LIMITS } from '../limits.js';

/**
 * Why a plant document is invalid. The codes are listed, with when each
 * applies, in the product rules ("Códigos de problema da planta").
 */
export type PlantIssueCode =
  | 'REQUIRED'
  | 'INVALID_TYPE'
  | 'INVALID_VALUE'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'TOO_MANY_ITEMS'
  | 'TOO_FEW_ITEMS'
  | 'UNKNOWN_FIELD'
  | 'UNSUPPORTED_SCHEMA_VERSION'
  | 'DUPLICATE_ID'
  | 'UNKNOWN_REFERENCE'
  | 'INVALID_RANGE'
  | 'NO_SOURCE'
  | 'NO_EXIT'
  | 'UNREACHABLE_ELEMENT'
  | 'INVALID_CONNECTION'
  | 'OUT_OF_GRID'
  | 'OVERLAP'
  | 'ROUTING_REQUIRED'
  | 'ROUTING_MISMATCH'
  | 'PERCENTAGES_NOT_100'
  | 'QUALITY_ROUTING_REQUIRED'
  | 'INVALID_ROUTING_RULE'
  | 'OVERRIDE_NOT_APPLICABLE'
  | 'DUPLICATE_OVERRIDE'
  | 'INVALID_WARMUP';

/**
 * One problem in a plant document: where it is and why. It never carries the
 * received value, so a problem list is safe to show or log.
 */
export interface PlantIssue {
  /** The element the problem belongs to, when the path goes through one. */
  readonly elementId?: string;
  /** Keys and indices from the document root to the field. */
  readonly path: readonly (string | number)[];
  /** Why the field is invalid. */
  readonly code: PlantIssueCode;
}

/** The outcome of checking a document's shape. */
export type StructureParse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly issues: PlantIssue[] };

const IDENTIFIER_KEY = new RegExp(
  `^[A-Za-z0-9_$-]{1,${String(PLANT_LIMITS.idLength)}}$`,
);

/**
 * Checks a value's shape against a schema and turns every Zod issue into a
 * {@link PlantIssue}, once per path and code. This is the only place that
 * parses with
 * `reportInput: true`, which tells a missing field from a wrong one; the
 * received input never leaves this function. An unknown key stays in the path
 * only when it looks like an identifier (letters, digits, `_`, `$` or `-`, up
 * to 64), so no arbitrary text the user typed reaches a log.
 *
 * @param schema - The shape to check.
 * @param input - Any value, typically a parsed JSON document.
 * @returns The typed data, or every shape problem found.
 * @throws {Error} On a Zod issue this schema never produces (a defect).
 *
 * @example
 * const result = parseStructure(plantSchema, JSON.parse(text));
 *
 * if (!result.success) showProblems(result.issues);
 */
export function parseStructure<T>(
  schema: z.ZodType<T>,
  input: unknown,
): StructureParse<T> {
  const result = schema.safeParse(input, { reportInput: true });

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    issues: withoutRepeats(result.error.issues.flatMap(toPlantIssues)),
  };
}

function toPlantIssues(issue: z.core.$ZodIssue): PlantIssue[] {
  const path = issue.path.map(toPathSegment);

  switch (issue.code) {
    case 'invalid_type':
      return [{ path, code: invalidTypeCode(issue) }];
    case 'too_big':
      return [
        {
          path,
          code: isSized(issue.origin) ? 'TOO_MANY_ITEMS' : 'OUT_OF_RANGE',
        },
      ];
    case 'too_small':
      return [
        {
          path,
          code: isSized(issue.origin) ? 'TOO_FEW_ITEMS' : 'OUT_OF_RANGE',
        },
      ];
    case 'invalid_format':
      return [{ path, code: 'INVALID_FORMAT' }];
    case 'invalid_value':
      return [{ path, code: 'INVALID_VALUE' }];
    case 'invalid_union':
      return [{ path, code: invalidUnionCode(issue) }];
    case 'unrecognized_keys':
      return issue.keys.map((key) => ({
        path: IDENTIFIER_KEY.test(key) ? [...path, key] : path,
        code: 'UNKNOWN_FIELD' as const,
      }));
    case 'not_multiple_of':
    case 'invalid_key':
    case 'invalid_element':
    case 'custom':
      throw new Error(
        `The plant schema produced an unexpected issue: ${issue.code}.`,
      );
  }
}

function withoutRepeats(issues: readonly PlantIssue[]): PlantIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = JSON.stringify([issue.code, issue.path]);
    const repeated = seen.has(key);

    seen.add(key);

    return !repeated;
  });
}

function toPathSegment(key: PropertyKey): string | number {
  return typeof key === 'number' ? key : String(key);
}

function invalidTypeCode(issue: z.core.$ZodIssueInvalidType): PlantIssueCode {
  if (issue.input === undefined) {
    return 'REQUIRED';
  }

  if (issue.expected === 'int' && Number.isFinite(issue.input)) {
    return 'OUT_OF_RANGE';
  }

  return 'INVALID_TYPE';
}

function invalidUnionCode(issue: z.core.$ZodIssueInvalidUnion): PlantIssueCode {
  const discriminator = issue.discriminator;
  const input = issue.input;

  if (
    discriminator !== undefined &&
    typeof input === 'object' &&
    input !== null &&
    !(discriminator in input)
  ) {
    return 'REQUIRED';
  }

  return 'INVALID_VALUE';
}

function isSized(origin: string): boolean {
  return origin === 'string' || origin === 'array';
}
