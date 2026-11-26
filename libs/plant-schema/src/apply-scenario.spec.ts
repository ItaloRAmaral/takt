import { applyScenario } from './apply-scenario.js';
import { catchError } from './tests/helpers/catch-error.js';
import {
  makePlant,
  makeScenario,
  makeSink,
  makeSource,
  makeStation,
} from './tests/helpers/make-plant.js';

const failingStation = makeStation({
  params: {
    ...makeStation().params,
    failure: {
      timeToFailure: { dist: 'exponential', meanSec: 14_400 },
      repairTime: { dist: 'exponential', meanSec: 900 },
    },
  },
});

describe('applyScenario', () => {
  it('applyScenario replaces a station cycle', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'cycle',
              value: { dist: 'fixed', valueSec: 46 },
            },
          ],
        }),
      ],
    });

    const applied = applyScenario(plant, 'base');

    expect(applied.elements[1]).toEqual(
      makeStation({
        params: {
          ...makeStation().params,
          cycle: { dist: 'fixed', valueSec: 46 },
        },
      }),
    );
  });

  it('applyScenario turns failures off with null', () => {
    const plant = makePlant({
      elements: [makeSource(), failingStation, makeSink()],
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'failure', value: null }],
        }),
      ],
    });

    const applied = applyScenario(plant, 'base');

    expect(applied.elements[1]).toEqual(makeStation());
  });

  it('applyScenario replaces a routing rule', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [
            {
              elementId: 'm1',
              param: 'routing',
              value: { rule: 'shortestQueue' },
            },
          ],
        }),
      ],
    });

    const applied = applyScenario(plant, 'base');

    expect(applied.elements[1]).toEqual(
      makeStation({ routing: { rule: 'shortestQueue' } }),
    );
  });

  it('applyScenario replaces the rework limit', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({ overrides: [{ param: 'reworkLimit', value: 0 }] }),
      ],
    });

    const applied = applyScenario(plant, 'base');

    expect(applied.settings).toEqual({ reworkLimit: 0 });
  });

  it('applyScenario leaves an element without the parameter unchanged', () => {
    const plant = makePlant({
      scenarios: [
        makeScenario({
          overrides: [{ elementId: 'm1', param: 'capacity', value: 5 }],
        }),
      ],
    });

    const applied = applyScenario(plant, 'base');

    expect(applied.elements[1]).toEqual(makeStation());
  });

  it('applyScenario does not change the base plant', () => {
    const plant = makePlant({
      elements: [makeSource(), failingStation, makeSink()],
      scenarios: [
        makeScenario({
          overrides: [
            { elementId: 'm1', param: 'failure', value: null },
            { param: 'reworkLimit', value: 0 },
          ],
        }),
      ],
    });

    applyScenario(plant, 'base');

    expect(plant).toEqual(
      makePlant({
        elements: [makeSource(), failingStation, makeSink()],
        scenarios: [
          makeScenario({
            overrides: [
              { elementId: 'm1', param: 'failure', value: null },
              { param: 'reworkLimit', value: 0 },
            ],
          }),
        ],
      }),
    );
  });

  it('applyScenario throws without a code for an unknown scenario', () => {
    const plant = makePlant();

    const error = catchError(() => applyScenario(plant, 'missing'));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });
});
