import type {
  Connection,
  Plant,
  PlantElement,
  TimeDistribution,
} from '@takt/plant-schema';
import fc from 'fast-check';
import {
  makeBuffer,
  makePlant,
  makeScenario,
  makeSink,
  makeSource,
  makeStation,
} from './make-plant.js';

/** The sink of every generated line. */
export const ARBITRARY_LINE_SINK_ID = 'snk1';

const timeDistribution: fc.Arbitrary<TimeDistribution> = fc.oneof(
  fc.record({
    dist: fc.constant<'fixed'>('fixed'),
    valueSec: fc.integer({ min: 1, max: 120 }),
  }),
  fc.record({
    dist: fc.constant<'exponential'>('exponential'),
    meanSec: fc.integer({ min: 1, max: 120 }),
  }),
  fc
    .tuple(
      fc.integer({ min: 0, max: 60 }),
      fc.integer({ min: 0, max: 60 }),
      fc.integer({ min: 1, max: 60 }),
    )
    .map(([minSec, toModeSec, toMaxSec]): TimeDistribution => ({
      dist: 'triangular',
      minSec,
      modeSec: minSec + toModeSec,
      maxSec: minSec + toModeSec + toMaxSec,
    })),
);

const sourceParams = fc.record({
  interarrival: timeDistribution,
  queueCapacity: fc.integer({ min: 0, max: 5 }),
});

const stage = fc.oneof(
  fc.record({
    kind: fc.constant<'station'>('station'),
    cycle: timeDistribution,
  }),
  fc.record({
    kind: fc.constant<'buffer'>('buffer'),
    capacity: fc.integer({ min: 1, max: 5 }),
  }),
);

/**
 * Generates lines the engine runs from sub-plan 4 on: one or two sources
 * that join at a station, then one to four stations or buffers, then a sink.
 * Times are fixed, exponential or triangular, source queues hold 0 to 5
 * parts, buffers 1 to 5, and the shift lasts 1 h. Every generated plant is
 * accepted by `validatePlant`.
 *
 * @returns The plant generator.
 *
 * @example
 * fc.assert(fc.property(arbitraryLine(), (plant) => { ... }), { seed: 42 });
 */
export function arbitraryLine(): fc.Arbitrary<Plant> {
  return fc
    .record({
      sources: fc.array(sourceParams, { minLength: 1, maxLength: 2 }),
      joinCycle: timeDistribution,
      stages: fc.array(stage, { minLength: 1, maxLength: 4 }),
    })
    .map(({ sources, joinCycle, stages }) => {
      const sourceElements = sources.map((params, i) =>
        makeSource({ id: `src${String(i + 1)}`, pos: [0, 2 * i], params }),
      );
      const join = makeStation({
        pos: [2, 0],
        params: { ...makeStation().params, cycle: joinCycle },
      });
      const stageElements = stages.map((params, i): PlantElement => {
        const id = `s${String(i + 1)}`;
        const pos: [number, number] = [4 + 2 * i, 0];

        return params.kind === 'station'
          ? makeStation({
              id,
              pos,
              params: { ...makeStation().params, cycle: params.cycle },
            })
          : makeBuffer({ id, pos, params: { capacity: params.capacity } });
      });
      const sink = makeSink({
        id: ARBITRARY_LINE_SINK_ID,
        pos: [4 + 2 * stages.length, 0],
      });
      const links = sourceElements.map((source): [string, string] => [
        source.id,
        join.id,
      ]);
      let previous: PlantElement = join;

      for (const element of [...stageElements, sink]) {
        links.push([previous.id, element.id]);
        previous = element;
      }

      const connections = links.map(([from, to], i): Connection => ({
        id: `c${String(i + 1)}`,
        from,
        to,
        kind: 'direct',
      }));

      return makePlant({
        elements: [...sourceElements, join, ...stageElements, sink],
        connections,
        scenarios: [makeScenario({ durationSec: 3600 })],
      });
    });
}
