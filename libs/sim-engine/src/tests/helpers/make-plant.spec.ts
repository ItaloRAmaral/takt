import { createDefaultElement, validatePlant } from '@takt/plant-schema';
import {
  makeBuffer,
  makeConveyor,
  makeDefaultLinePlant,
  makeFixedSource,
  makeFixedStation,
  makeLinePlant,
  makePlant,
  makeScenario,
  makeScrap,
  makeSink,
  makeSource,
  makeStation,
} from './make-plant.js';

describe('engine test plants', () => {
  it('makePlant builds a valid plant', () => {
    const plant = makePlant();

    const validation = validatePlant(plant);

    expect(validation.valid).toBe(true);
  });

  it('makeLinePlant builds a valid line connected in the given order', () => {
    const plant = makeLinePlant([
      makeSource(),
      makeStation(),
      makeBuffer(),
      makeStation({ id: 'm2' }),
      makeSink(),
    ]);

    const validation = validatePlant(plant);

    expect(validation).toMatchObject({
      valid: true,
      plant: {
        connections: [
          { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
          { id: 'c2', from: 'm1', to: 'b1', kind: 'direct' },
          { id: 'c3', from: 'b1', to: 'm2', kind: 'direct' },
          { id: 'c4', from: 'm2', to: 'snk1', kind: 'direct' },
        ],
      },
    });
  });

  it.each([
    { element: makeSource(), type: 'production.source' },
    { element: makeStation(), type: 'production.station' },
    { element: makeBuffer(), type: 'production.buffer' },
    { element: makeConveyor(), type: 'production.conveyor' },
    { element: makeSink(), type: 'production.sink' },
    { element: makeScrap(), type: 'production.scrap' },
  ] as const)(
    'the test $type has the editor default parameters',
    ({ element, type }) => {
      const defaults = createDefaultElement(type, {
        id: element.id,
        zoneId: 'z1',
        pos: [0, 0],
      });

      expect(element.params).toEqual(defaults.params);
    },
  );

  it('makeScenario stores a duration given in seconds as hours', () => {
    const scenario = makeScenario({ durationSec: 300 });

    expect(scenario.durationH * 3600).toBe(300);
  });

  it('makeScenario keeps the 8 h shift without a duration', () => {
    const scenario = makeScenario();

    expect(scenario.durationH).toBe(8);
  });

  it('makeFixedSource builds a source with a fixed interval', () => {
    const source = makeFixedSource({
      id: 'src2',
      intervalSec: 10,
      queueCapacity: 0,
    });

    expect(source).toMatchObject({
      id: 'src2',
      params: {
        interarrival: { dist: 'fixed', valueSec: 10 },
        queueCapacity: 0,
      },
    });
  });

  it('makeFixedStation builds a station with a fixed cycle', () => {
    const station = makeFixedStation({ id: 'm2', cycleSec: 0 });

    expect(station).toMatchObject({
      id: 'm2',
      params: {
        cycle: { dist: 'fixed', valueSec: 0 },
        defectRate: 0,
        failure: null,
      },
    });
  });

  it('makeFixedSource and makeFixedStation default to the ids src1 and m1', () => {
    const ids = [
      makeFixedSource({ intervalSec: 10, queueCapacity: 0 }).id,
      makeFixedStation({ cycleSec: 10 }).id,
    ];

    expect(ids).toEqual(['src1', 'm1']);
  });

  it('makeDefaultLinePlant builds a valid plant', () => {
    const plant = makeDefaultLinePlant();

    const validation = validatePlant(plant);

    expect(validation.valid).toBe(true);
  });
});
