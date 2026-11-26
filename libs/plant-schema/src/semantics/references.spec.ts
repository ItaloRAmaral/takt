import {
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { checkReferences } from './references.js';

describe('plant references', () => {
  it('finds nothing wrong in a plant whose references all exist', () => {
    const plant = makePlant();

    const issues = checkReferences(plant);

    expect(issues).toEqual([]);
  });

  it('rejects a duplicated id across elements', () => {
    const plant = makePlant({
      elements: [makeSource(), makeStation(), makeSink({ id: 'm1' })],
    });

    const issues = checkReferences(plant);

    expect(issues).toContainEqual({
      elementId: 'm1',
      path: ['elements', 2, 'id'],
      code: 'DUPLICATE_ID',
    });
  });

  it('rejects a duplicated id across elements and connections', () => {
    const plant = makePlant({
      connections: [
        { id: 'm1', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
      ],
    });

    const issues = checkReferences(plant);

    expect(issues).toEqual([
      { path: ['connections', 0, 'id'], code: 'DUPLICATE_ID' },
    ]);
  });

  it('rejects an element in a zone that does not exist', () => {
    const plant = makePlant({
      elements: [makeSource(), makeStation({ zoneId: 'z9' }), makeSink()],
    });

    const issues = checkReferences(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'zoneId'],
        code: 'UNKNOWN_REFERENCE',
      },
    ]);
  });

  it('rejects a connection to an unknown element', () => {
    const plant = makePlant({
      connections: [
        { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'm1', to: 'x', kind: 'direct' },
      ],
    });

    const issues = checkReferences(plant);

    expect(issues).toEqual([
      { path: ['connections', 1, 'to'], code: 'UNKNOWN_REFERENCE' },
    ]);
  });

  it('rejects a routing destination that does not exist', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({
          routing: {
            rule: 'byPercentage',
            shares: [
              { to: 'x', sharePct: 50 },
              { to: 'snk1', sharePct: 50 },
            ],
          },
        }),
        makeSink(),
      ],
    });

    const issues = checkReferences(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'routing', 'shares', 0, 'to'],
        code: 'UNKNOWN_REFERENCE',
      },
    ]);
  });
});
