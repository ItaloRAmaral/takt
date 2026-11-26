import { createDefaultElement } from '../../defaults.js';
import { parseStructure } from '../../structure/issues.js';
import { plantSchema } from '../../structure/plant.js';
import {
  makeBuffer,
  makeConveyor,
  makePlant,
  makeScenario,
  makeScrap,
  makeSink,
  makeSource,
  makeStation,
} from './make-plant.js';

describe('makePlant', () => {
  it('makePlant builds a plant with a valid shape', () => {
    const plant = makePlant();

    const result = parseStructure(plantSchema, plant);

    expect(result.success).toBe(true);
  });

  it('makePlant builds a source, a station and a sink connected in a line', () => {
    const plant = makePlant();

    expect(plant.connections).toEqual([
      { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
      { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
    ]);
  });

  it('makePlant replaces the fields it is given', () => {
    const plant = makePlant({ name: 'Outra' });

    expect(plant.name).toBe('Outra');
  });

  it.each([
    { element: makeSource({ id: 'a' }), type: 'production.source' },
    { element: makeStation({ id: 'a' }), type: 'production.station' },
    { element: makeBuffer({ id: 'a' }), type: 'production.buffer' },
    { element: makeConveyor({ id: 'a' }), type: 'production.conveyor' },
    { element: makeSink({ id: 'a' }), type: 'production.sink' },
    { element: makeScrap({ id: 'a' }), type: 'production.scrap' },
  ])(
    'the element factory for $type keeps the id it is given',
    ({ element, type }) => {
      expect(element).toMatchObject({ id: 'a', type });
    },
  );

  it('makeScenario replaces the fields it is given', () => {
    const scenario = makeScenario({ id: 'other' });

    expect(scenario).toMatchObject({ id: 'other', replicationCount: 30 });
  });

  it.each([
    { element: makeSource(), type: 'production.source' },
    { element: makeStation(), type: 'production.station' },
    { element: makeBuffer(), type: 'production.buffer' },
    { element: makeConveyor(), type: 'production.conveyor' },
    { element: makeSink(), type: 'production.sink' },
    { element: makeScrap(), type: 'production.scrap' },
  ] as const)(
    'the test $type matches the editor default',
    ({ element, type }) => {
      const expected = createDefaultElement(type, element);

      expect(element).toEqual(expected);
    },
  );
});
