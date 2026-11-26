import {
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { validateSemantics } from './validate-semantics.js';

describe('plant semantics', () => {
  it('finds nothing wrong in a minimal plant', () => {
    const plant = makePlant();

    const issues = validateSemantics(plant);

    expect(issues).toEqual([]);
  });

  it('returns every semantic problem at once', () => {
    const plant = makePlant({
      elements: [
        makeSource({ zoneId: 'z9' }),
        makeStation({ params: { ...makeStation().params, defectRate: 0.1 } }),
        makeSink({ pos: [0, 0] }),
      ],
    });

    const issues = validateSemantics(plant);

    expect(issues).toEqual([
      {
        elementId: 'src1',
        path: ['elements', 0, 'zoneId'],
        code: 'UNKNOWN_REFERENCE',
      },
      { elementId: 'snk1', path: ['elements', 2, 'pos'], code: 'OVERLAP' },
      {
        elementId: 'm1',
        path: ['elements', 1, 'routing'],
        code: 'QUALITY_ROUTING_REQUIRED',
      },
    ]);
  });
});
