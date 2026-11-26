import {
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { checkGrid } from './grid.js';

describe('plant grid', () => {
  it('finds nothing wrong when elements fit and do not overlap', () => {
    const plant = makePlant();

    const issues = checkGrid(plant);

    expect(issues).toEqual([]);
  });

  it.each([{ rotDeg: 0 }, { rotDeg: 180 }] as const)(
    'RN-EDT-001: occupies size[0] by size[1] cells at $rotDeg degrees',
    ({ rotDeg }) => {
      const plant = makePlant({
        elements: [
          makeSource({ pos: [5, 5], size: [2, 1], rotDeg }),
          makeStation({ pos: [6, 5] }),
          makeSink({ pos: [5, 6] }),
        ],
      });

      const issues = checkGrid(plant);

      expect(issues).toEqual([
        { elementId: 'm1', path: ['elements', 1, 'pos'], code: 'OVERLAP' },
      ]);
    },
  );

  it.each([{ rotDeg: 90 }, { rotDeg: 270 }] as const)(
    'RN-EDT-001: swaps columns and rows at $rotDeg degrees',
    ({ rotDeg }) => {
      const plant = makePlant({
        elements: [
          makeSource({ pos: [5, 5], size: [2, 1], rotDeg }),
          makeStation({ pos: [6, 5] }),
          makeSink({ pos: [5, 6] }),
        ],
      });

      const issues = checkGrid(plant);

      expect(issues).toEqual([
        { elementId: 'snk1', path: ['elements', 2, 'pos'], code: 'OVERLAP' },
      ]);
    },
  );

  it('RN-EDT-001: rejects an element past the grid edge', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({ pos: [19, 0], size: [2, 1] }),
        makeSink(),
      ],
    });

    const issues = checkGrid(plant);

    expect(issues).toEqual([
      { elementId: 'm1', path: ['elements', 1, 'pos'], code: 'OUT_OF_GRID' },
    ]);
  });

  it('RN-EDT-001: rejects a rotated element past the bottom edge', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({ pos: [3, 11], size: [2, 1], rotDeg: 90 }),
        makeSink(),
      ],
    });

    const issues = checkGrid(plant);

    expect(issues).toEqual([
      { elementId: 'm1', path: ['elements', 1, 'pos'], code: 'OUT_OF_GRID' },
    ]);
  });
});
