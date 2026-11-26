import { idSchema } from './structure/ids.js';
import { parseStructure, type PlantIssue } from './structure/issues.js';
import { plantSchema, type Plant } from './structure/plant.js';
import { checkScenarios } from './semantics/scenarios.js';
import { validateSemantics } from './semantics/validate-semantics.js';

/** The plant document version this library reads and writes. */
export const CURRENT_SCHEMA_VERSION = 1;

/** The outcome of validating a plant document. */
export type PlantValidation =
  | { readonly valid: true; readonly plant: Plant }
  | { readonly valid: false; readonly issues: readonly PlantIssue[] };

/**
 * Validates a plant document of any origin (editor, imported file, test):
 *
 * 1. a `schemaVersion` that is a safe integer above the current version stops
 *    here, with only `UNSUPPORTED_SCHEMA_VERSION` (any other bad version is a
 *    shape problem); v1 has no migration step;
 * 2. the shape, with every problem at once; if there is any, the plant rules
 *    are not checked;
 * 3. the plant rules on the base plant;
 * 4. each scenario's overrides and the plant rules with them applied.
 *
 * A problem inside an element (or an override) carries the element's id,
 * when that id is valid and names an element of the document.
 *
 * @param document - Any value, typically a parsed JSON document.
 * @returns The plant in the current version, or every problem found.
 *
 * @example
 * const validation = validatePlant(JSON.parse(text));
 *
 * if (!validation.valid) showProblems(validation.issues);
 */
export function validatePlant(document: unknown): PlantValidation {
  if (isNewerVersion(property(document, 'schemaVersion'))) {
    return {
      valid: false,
      issues: [{ path: ['schemaVersion'], code: 'UNSUPPORTED_SCHEMA_VERSION' }],
    };
  }

  const structure = parseStructure(plantSchema, document);

  if (!structure.success) {
    const elementIds = elementIdsOf(document);

    return {
      valid: false,
      issues: structure.issues.map((issue) =>
        withElementId(issue, document, elementIds),
      ),
    };
  }

  const plant = structure.data;
  const baseIssues = validateSemantics(plant);
  const issues = [...baseIssues, ...checkScenarios(plant, baseIssues)];

  return issues.length === 0
    ? { valid: true, plant }
    : { valid: false, issues };
}

function isNewerVersion(version: unknown): boolean {
  return (
    typeof version === 'number' &&
    Number.isSafeInteger(version) &&
    version > CURRENT_SCHEMA_VERSION
  );
}

function withElementId(
  issue: PlantIssue,
  document: unknown,
  elementIds: ReadonlySet<string>,
): PlantIssue {
  const [first, i, third, k] = issue.path;

  const rawId =
    first === 'elements'
      ? dig(document, ['elements', i, 'id'])
      : first === 'scenarios' && third === 'overrides'
        ? dig(document, ['scenarios', i, 'overrides', k, 'elementId'])
        : undefined;

  return typeof rawId === 'string' && elementIds.has(rawId)
    ? { ...issue, elementId: rawId }
    : issue;
}

function elementIdsOf(document: unknown): Set<string> {
  const elements = property(document, 'elements');
  const ids = new Set<string>();

  if (Array.isArray(elements)) {
    for (const element of elements) {
      const id = idSchema.safeParse(property(element, 'id'));

      if (id.success) {
        ids.add(id.data);
      }
    }
  }

  return ids;
}

function dig(
  value: unknown,
  keys: readonly (string | number | undefined)[],
): unknown {
  return keys.reduce(property, value);
}

function property(value: unknown, key: string | number | undefined): unknown {
  if (typeof value !== 'object' || value === null || key === undefined) {
    return undefined;
  }

  return Object.getOwnPropertyDescriptor(value, key)?.value;
}
