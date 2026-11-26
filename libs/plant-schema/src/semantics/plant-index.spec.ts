import {
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { elementIssue, indexPlant } from './plant-index.js';

describe('plant index', () => {
  it('indexes each element with its position in the document', () => {
    const plant = makePlant();

    const { elementsById } = indexPlant(plant);

    expect(elementsById.get('m1')).toEqual({
      element: makeStation(),
      index: 1,
    });
  });

  it('keeps the first element when an id repeats', () => {
    const plant = makePlant({
      elements: [makeSource(), makeStation(), makeSink({ id: 'm1' })],
    });

    const { elementsById } = indexPlant(plant);

    expect(elementsById.get('m1')?.index).toBe(1);
  });

  it('elementIssue places a problem under its element', () => {
    const issue = elementIssue(
      { element: makeStation(), index: 3 },
      ['routing'],
      'ROUTING_REQUIRED',
    );

    expect(issue).toEqual({
      elementId: 'm1',
      path: ['elements', 3, 'routing'],
      code: 'ROUTING_REQUIRED',
    });
  });
});
