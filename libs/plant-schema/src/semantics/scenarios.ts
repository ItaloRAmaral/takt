import { applyOverrides, appliesTo } from '../apply-scenario.js';
import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import type { Scenario } from '../structure/scenario.js';
import { indexPlant, type PlantIndex } from './plant-index.js';
import { validateOverridableRules } from './validate-semantics.js';

/**
 * Checks each scenario: every override targets an element and a parameter
 * that exist, no override repeats, a warm-up appears only in steady state and
 * is shorter than the run, and the plant with the overrides applied still
 * follows the plant rules an override can break (references, ranges and
 * routing; grid and flow do not depend on any overridable field). A problem
 * the base plant already has is not repeated, unless it sits inside a field
 * an override replaced. A problem inside a field an override replaced points to that
 * override (`['scenarios', i, 'overrides', k, 'value', ...]`); any other
 * points to the scenario (`['scenarios', i]`), with its `elementId`.
 *
 * @param plant - A plant with a valid shape.
 * @param baseIssues - The problems of the base plant.
 * @returns The problems each scenario adds.
 *
 * @example
 * checkScenarios(plant, validateSemantics(plant));
 */
export function checkScenarios(
  plant: Plant,
  baseIssues: readonly PlantIssue[],
): PlantIssue[] {
  const known = new Set(baseIssues.map(issueKey));

  const { elementsById } = indexPlant(plant);

  return plant.scenarios.flatMap((scenario, i) => {
    const overrideIssues = checkOverrides(elementsById, scenario, i);
    const warmupIssues = checkWarmup(scenario, i);

    if (overrideIssues.length > 0) {
      return [...overrideIssues, ...warmupIssues];
    }

    const appliedIssues = validateOverridableRules(
      applyOverrides(plant, scenario),
    )
      .map((issue) => ({ issue, relocated: relocate(issue, scenario, i) }))
      .filter(
        ({ issue, relocated }) =>
          isInsideOverride(relocated) || !known.has(issueKey(issue)),
      )
      .map(({ relocated }) => relocated);

    return [...warmupIssues, ...appliedIssues];
  });
}

function checkOverrides(
  elementsById: PlantIndex['elementsById'],
  scenario: Scenario,
  i: number,
): PlantIssue[] {
  const issues: PlantIssue[] = [];
  const seen = new Set<string>();

  scenario.overrides.forEach((override, k) => {
    const path = ['scenarios', i, 'overrides', k];
    const key = `${'elementId' in override ? override.elementId : ''}\u0000${override.param}`;

    if (seen.has(key)) {
      issues.push({
        ...('elementId' in override && elementsById.has(override.elementId)
          ? { elementId: override.elementId }
          : {}),
        path,
        code: 'DUPLICATE_OVERRIDE',
      });
    }

    seen.add(key);

    if (override.param === 'reworkLimit') {
      return;
    }

    const target = elementsById.get(override.elementId);

    if (target === undefined) {
      issues.push({
        path: [...path, 'elementId'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      });
    } else if (!appliesTo(target.element, override)) {
      issues.push({
        elementId: override.elementId,
        path: [...path, 'param'],
        code: 'OVERRIDE_NOT_APPLICABLE',
      });
    }
  });

  return issues;
}

function checkWarmup(scenario: Scenario, i: number): PlantIssue[] {
  const isValid =
    scenario.warmupMin === null ||
    (scenario.mode === 'steadyState' &&
      scenario.warmupMin / 60 < scenario.durationH);

  return isValid
    ? []
    : [{ path: ['scenarios', i, 'warmupMin'], code: 'INVALID_WARMUP' }];
}

function relocate(
  issue: PlantIssue,
  scenario: Scenario,
  i: number,
): PlantIssue {
  const below = issue.path.slice(2);

  const k = scenario.overrides.findIndex(
    (override) =>
      override.param !== 'reworkLimit' &&
      override.elementId === issue.elementId &&
      startsWith(
        below,
        override.param === 'routing' ? ['routing'] : ['params', override.param],
      ),
  );

  if (k === -1) {
    return { ...issue, path: ['scenarios', i] };
  }

  const fieldDepth = scenario.overrides[k]?.param === 'routing' ? 1 : 2;

  return {
    ...issue,
    path: ['scenarios', i, 'overrides', k, 'value', ...below.slice(fieldDepth)],
  };
}

function isInsideOverride(issue: PlantIssue): boolean {
  return issue.path[2] === 'overrides';
}

function startsWith(
  path: readonly (string | number)[],
  prefix: readonly string[],
): boolean {
  return prefix.every((segment, j) => path[j] === segment);
}

function issueKey(issue: PlantIssue): string {
  return JSON.stringify([issue.code, issue.elementId ?? null, issue.path]);
}
