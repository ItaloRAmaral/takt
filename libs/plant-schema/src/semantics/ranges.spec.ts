import {
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { checkRanges } from './ranges.js';

describe('distribution ranges', () => {
  it.each([
    { cycle: { dist: 'triangular', minSec: 20, modeSec: 20, maxSec: 35 } },
    { cycle: { dist: 'triangular', minSec: 20, modeSec: 35, maxSec: 35 } },
    {
      cycle: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 10,
        maxSec: null,
      },
    },
  ] as const)('accepts the cycle $cycle', ({ cycle }) => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({ params: { ...makeStation().params, cycle } }),
        makeSink(),
      ],
    });

    const issues = checkRanges(plant);

    expect(issues).toEqual([]);
  });

  it.each([
    { cycle: { dist: 'triangular', minSec: 30, modeSec: 25, maxSec: 35 } },
    { cycle: { dist: 'triangular', minSec: 20, modeSec: 40, maxSec: 35 } },
    { cycle: { dist: 'triangular', minSec: 20, modeSec: 20, maxSec: 20 } },
    {
      cycle: {
        dist: 'truncatedNormal',
        meanSec: 30,
        standardDeviationSec: 5,
        minSec: 40,
        maxSec: 40,
      },
    },
  ] as const)('rejects the cycle $cycle with INVALID_RANGE', ({ cycle }) => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({ params: { ...makeStation().params, cycle } }),
        makeSink(),
      ],
    });

    const issues = checkRanges(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'params', 'cycle'],
        code: 'INVALID_RANGE',
      },
    ]);
  });

  it('rejects an incoherent repair time', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({
          params: {
            ...makeStation().params,
            failure: {
              timeToFailure: { dist: 'exponential', meanSec: 14_400 },
              repairTime: {
                dist: 'triangular',
                minSec: 900,
                modeSec: 600,
                maxSec: 1200,
              },
            },
          },
        }),
        makeSink(),
      ],
    });

    const issues = checkRanges(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'params', 'failure', 'repairTime'],
        code: 'INVALID_RANGE',
      },
    ]);
  });

  it('rejects an incoherent interarrival time', () => {
    const plant = makePlant({
      elements: [
        makeSource({
          params: {
            ...makeSource().params,
            interarrival: {
              dist: 'triangular',
              minSec: 70,
              modeSec: 60,
              maxSec: 80,
            },
          },
        }),
        makeStation(),
        makeSink(),
      ],
    });

    const issues = checkRanges(plant);

    expect(issues).toEqual([
      {
        elementId: 'src1',
        path: ['elements', 0, 'params', 'interarrival'],
        code: 'INVALID_RANGE',
      },
    ]);
  });
});
