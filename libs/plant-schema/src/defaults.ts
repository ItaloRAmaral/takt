import type {
  ElementType,
  PlantElement,
  StationElement,
} from './structure/elements.js';
import type { Scenario } from './structure/scenario.js';
import type { Settings } from './structure/settings.js';

/** Where a new element goes: its id, its zone and its grid cell. */
export interface ElementPlacement {
  readonly id: string;
  readonly zoneId: string;
  readonly pos: readonly [number, number];
}

/**
 * Creates an element with the editor defaults, so that a line built without
 * any change already runs: a source with exponential arrivals every 60 s and
 * a queue of 20; a station with a fixed 50 s cycle (ideal cycle 50 s), no
 * defects and no failures; a buffer of 10; a conveyor of 5 m at 10 m/min
 * holding 5 parts. Every element starts unrotated on one cell. Each call
 * returns new objects.
 *
 * @param type - The kind of element.
 * @param placement - Its id, zone and cell.
 * @returns The element, with every value written out.
 *
 * @example
 * const station = createDefaultElement('production.station', { id: 'm1', zoneId: 'z1', pos: [2, 0] });
 */
export function createDefaultElement(
  type: ElementType,
  placement: ElementPlacement,
): PlantElement {
  const base: Pick<PlantElement, 'id' | 'zoneId' | 'pos' | 'rotDeg' | 'size'> =
    {
      id: placement.id,
      zoneId: placement.zoneId,
      pos: [placement.pos[0], placement.pos[1]],
      rotDeg: 0,
      size: [1, 1],
    };

  switch (type) {
    case 'production.source':
      return {
        ...base,
        type,
        params: {
          interarrival: { dist: 'exponential', meanSec: 60 },
          queueCapacity: 20,
        },
        routing: null,
      };
    case 'production.station':
      return {
        ...base,
        type,
        params: {
          cycle: { dist: 'fixed', valueSec: 50 },
          idealCycleSec: 50,
          defectRate: 0,
          failure: null,
        },
        routing: null,
      };
    case 'production.buffer':
      return { ...base, type, params: { capacity: 10 }, routing: null };
    case 'production.conveyor':
      return {
        ...base,
        type,
        params: { lengthM: 5, speedMPerMin: 10, capacity: 5 },
        routing: null,
      };
    case 'production.sink':
    case 'production.scrap':
      return { ...base, type, params: {} };
  }
}

/**
 * Creates the failure a station gets when the user turns failures on:
 * exponential, 240 min to failure and 15 min of repair.
 *
 * @returns The failure, in seconds.
 *
 * @example
 * station.params.failure = createDefaultFailure();
 */
export function createDefaultFailure(): NonNullable<
  StationElement['params']['failure']
> {
  return {
    timeToFailure: { dist: 'exponential', meanSec: 14_400 },
    repairTime: { dist: 'exponential', meanSec: 900 },
  };
}

/**
 * Creates a scenario with the editor defaults: one 8 h shift, 30
 * replications, seed 42, no warm-up and no overrides.
 *
 * @param identity - The scenario's id and name.
 * @returns The scenario.
 *
 * @example
 * const base = createDefaultScenario({ id: 'base', name: 'Atual' });
 */
export function createDefaultScenario(identity: {
  readonly id: string;
  readonly name: string;
}): Scenario {
  return {
    id: identity.id,
    name: identity.name,
    mode: 'shift',
    durationH: 8,
    replicationCount: 30,
    seed: 42,
    warmupMin: null,
    overrides: [],
  };
}

/**
 * Creates the plant-wide settings of a new plant: 2 reworks allowed.
 *
 * @returns The settings.
 *
 * @example
 * const settings = createDefaultSettings();
 */
export function createDefaultSettings(): Settings {
  return { reworkLimit: 2 };
}
