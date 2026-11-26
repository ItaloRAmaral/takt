import type { PlantElement } from '@takt/plant-schema';
import { compilePlant } from '../model/compile-plant.js';
import { catchError } from '../tests/helpers/catch-error.js';
import { relativeError } from '../tests/helpers/relative-error.js';
import { sumTimeInWindowSec } from '../tests/helpers/time-in-window.js';
import {
  exitTimesSec,
  selectLogEvents,
  selectPartIds,
} from '../tests/helpers/log-queries.js';
import {
  makeBuffer,
  makeDefaultLinePlant,
  makeFixedSource,
  makeFixedStation,
  makeLinePlant,
  makePlant,
  makeScenario,
  makeSink,
  makeSource,
  makeStation,
  testLimits,
} from '../tests/helpers/make-plant.js';
import type { RunOptions } from './run-options.js';
import { simulateReplication } from './simulate-replication.js';

const logged: RunOptions = { limits: testLimits, recordLog: true };

const plantA = makeLinePlant(
  [
    makeFixedSource({ intervalSec: 10, queueCapacity: 2 }),
    makeFixedStation({ cycleSec: 50 }),
    makeSink(),
  ],
  makeScenario({ durationSec: 300 }),
);

const plantB = makeLinePlant(
  [
    makeFixedSource({ intervalSec: 10, queueCapacity: 0 }),
    makeFixedStation({ cycleSec: 15 }),
    makeSink(),
  ],
  makeScenario({ durationSec: 100 }),
);

const plantC = makeLinePlant(
  [
    makeFixedSource({ intervalSec: 10, queueCapacity: 100 }),
    makeFixedStation({ id: 'm1', cycleSec: 10 }),
    makeFixedStation({ id: 'm2', cycleSec: 30 }),
    makeSink(),
  ],
  makeScenario({ durationSec: 300 }),
);

const joinElements: PlantElement[] = [
  {
    ...makeFixedSource({ id: 'src1', intervalSec: 20, queueCapacity: 5 }),
    pos: [0, 0],
  },
  {
    ...makeFixedSource({ id: 'src2', intervalSec: 30, queueCapacity: 5 }),
    pos: [0, 2],
  },
  { ...makeFixedStation({ cycleSec: 25 }), pos: [2, 0] },
  { ...makeSink(), pos: [4, 0] },
];

describe('simulateReplication', () => {
  it('RN-SIM-013: a full source queue loses arrivals until the station frees a place', () => {
    const plant = plantA;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(exitTimesSec(result.log, ['snk1'])).toEqual([
      60, 110, 160, 210, 260,
    ]);
    expect(selectPartIds(result.log, 'lose')).toEqual([
      4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28,
      29,
    ]);
  });

  it('RN-SIM-013: an arrival with a queue of 0 passes when the station is free', () => {
    const plant = plantB;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectPartIds(result.log, 'start')).toEqual([1, 3, 5, 7, 9]);
    expect(selectPartIds(result.log, 'lose')).toEqual([2, 4, 6, 8]);
    expect(exitTimesSec(result.log, ['snk1'])).toEqual([25, 45, 65, 85]);
  });

  it('RN-SIM-014: a station whose next station is busy stays blocked', () => {
    const plant = plantC;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.log).toEqual(
      expect.arrayContaining([
        { tSec: 30, type: 'finish', stationId: 'm1', partId: 2 },
        { tSec: 50, type: 'move', partId: 2, fromId: 'm1', toId: 'm2' },
      ]),
    );
    expect(exitTimesSec(result.log, ['snk1'])).toEqual([
      50, 80, 110, 140, 170, 200, 230, 260, 290,
    ]);
  });

  it('RN-SIM-014: a station before a full buffer stays blocked', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 100 }),
        makeFixedStation({ id: 'm1', cycleSec: 10 }),
        makeBuffer({ id: 'b1', params: { capacity: 1 } }),
        makeFixedStation({ id: 'm2', cycleSec: 30 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 60 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.log).toEqual(
      expect.arrayContaining([
        { tSec: 40, type: 'finish', stationId: 'm1', partId: 3 },
        { tSec: 50, type: 'move', partId: 3, fromId: 'm1', toId: 'b1' },
      ]),
    );
    expect(result.log).not.toContainEqual({
      tSec: 40,
      type: 'move',
      partId: 3,
      fromId: 'm1',
      toId: 'b1',
    });
  });

  it('RN-SIM-014: a station fed by two sources pulls the part that has waited longest, ties by connection order: src1 connected first', () => {
    const plant = makePlant({
      elements: joinElements,
      connections: [
        { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'src2', to: 'm1', kind: 'direct' },
        { id: 'c3', from: 'm1', to: 'snk1', kind: 'direct' },
      ],
      scenarios: [makeScenario({ durationSec: 120 })],
    });

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectLogEvents(result.log, 'start')).toEqual([
      { tSec: 20, type: 'start', stationId: 'm1', partId: 1 },
      { tSec: 45, type: 'start', stationId: 'm1', partId: 2 },
      { tSec: 70, type: 'start', stationId: 'm1', partId: 3 },
      { tSec: 95, type: 'start', stationId: 'm1', partId: 5 },
    ]);
  });

  it('RN-SIM-014: a station fed by two sources pulls the part that has waited longest, ties by connection order: src2 connected first', () => {
    const plant = makePlant({
      elements: joinElements,
      connections: [
        { id: 'c1', from: 'src2', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c3', from: 'm1', to: 'snk1', kind: 'direct' },
      ],
      scenarios: [makeScenario({ durationSec: 120 })],
    });

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectLogEvents(result.log, 'start')).toEqual([
      { tSec: 20, type: 'start', stationId: 'm1', partId: 1 },
      { tSec: 45, type: 'start', stationId: 'm1', partId: 2 },
      { tSec: 70, type: 'start', stationId: 'm1', partId: 3 },
      { tSec: 95, type: 'start', stationId: 'm1', partId: 4 },
    ]);
  });

  it('RN-SIM-018: parts that become available at the same instant go to an idle station by connection order', () => {
    const plant = makePlant({
      elements: [
        {
          ...makeFixedSource({ id: 'src1', intervalSec: 30, queueCapacity: 5 }),
          pos: [0, 0],
        },
        {
          ...makeFixedSource({ id: 'src2', intervalSec: 30, queueCapacity: 5 }),
          pos: [0, 2],
        },
        { ...makeFixedStation({ cycleSec: 10 }), pos: [2, 0] },
        { ...makeSink(), pos: [4, 0] },
      ],
      connections: [
        { id: 'c1', from: 'src2', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c3', from: 'm1', to: 'snk1', kind: 'direct' },
      ],
      scenarios: [makeScenario({ durationSec: 50 })],
    });

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectLogEvents(result.log, 'start')).toEqual([
      { tSec: 30, type: 'start', stationId: 'm1', partId: 2 },
      { tSec: 40, type: 'start', stationId: 'm1', partId: 1 },
    ]);
  });

  it('RN-SIM-018: an end of processing frees the place for an arrival at the same instant', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 30, queueCapacity: 0 }),
        makeFixedStation({ cycleSec: 30 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 100 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectPartIds(result.log, 'start')).toEqual([1, 2, 3]);
    expect(selectPartIds(result.log, 'lose')).toEqual([]);
  });

  it('RN-SIM-018: at the same instant, the log shows the end of processing before the arrival', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 30, queueCapacity: 0 }),
        makeFixedStation({ cycleSec: 30 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 61 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.log).toEqual([
      { tSec: 30, type: 'arrive', sourceId: 'src1', partId: 1 },
      { tSec: 30, type: 'move', partId: 1, fromId: 'src1', toId: 'm1' },
      { tSec: 30, type: 'start', stationId: 'm1', partId: 1 },
      { tSec: 60, type: 'finish', stationId: 'm1', partId: 1 },
      { tSec: 60, type: 'arrive', sourceId: 'src1', partId: 2 },
      { tSec: 60, type: 'move', partId: 1, fromId: 'm1', toId: 'snk1' },
      { tSec: 60, type: 'move', partId: 2, fromId: 'src1', toId: 'm1' },
      { tSec: 60, type: 'start', stationId: 'm1', partId: 2 },
    ]);
  });

  it('RN-SIM-018: the first arrival comes after the first interval', () => {
    const plant = plantA;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(selectLogEvents(result.log, 'arrive')[0]).toEqual({
      tSec: 10,
      type: 'arrive',
      sourceId: 'src1',
      partId: 1,
    });
  });

  it('RN-SIM-018: an exit exactly at the end of the shift is not counted', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 2 }),
        makeFixedStation({ cycleSec: 20 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 30 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(exitTimesSec(result.log, ['snk1'])).toEqual([]);
  });

  it('RN-SIM-018: a zero cycle finishes at the same instant', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 2 }),
        makeFixedStation({ cycleSec: 0 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 15 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.log).toEqual([
      { tSec: 10, type: 'arrive', sourceId: 'src1', partId: 1 },
      { tSec: 10, type: 'move', partId: 1, fromId: 'src1', toId: 'm1' },
      { tSec: 10, type: 'start', stationId: 'm1', partId: 1 },
      { tSec: 10, type: 'finish', stationId: 'm1', partId: 1 },
      { tSec: 10, type: 'move', partId: 1, fromId: 'm1', toId: 'snk1' },
    ]);
  });

  it('UC-SIM-002: the n-th part leaves a fixed serial line at a + Σt + (n − 1)·max(a, t_max): (i) a = 60 s, no buffers', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 60, queueCapacity: 1000 }),
        makeFixedStation({ id: 'm1', cycleSec: 40 }),
        makeFixedStation({ id: 'm2', cycleSec: 56 }),
        makeFixedStation({ id: 'm3', cycleSec: 44 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 28_800 }),
    );

    const exits = exitTimesSec(
      simulateReplication(compilePlant(plant, 'base', logged), 0, logged).log,
      ['snk1'],
    );

    expect([exits.length, exits[0], exits[1], exits.at(-1)]).toEqual([
      477, 200, 260, 28_760,
    ]);
  });

  it('UC-SIM-002: the n-th part leaves a fixed serial line at a + Σt + (n − 1)·max(a, t_max): (ii) a = 30 s, no buffers', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 30, queueCapacity: 1000 }),
        makeFixedStation({ id: 'm1', cycleSec: 40 }),
        makeFixedStation({ id: 'm2', cycleSec: 56 }),
        makeFixedStation({ id: 'm3', cycleSec: 44 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 28_800 }),
    );

    const exits = exitTimesSec(
      simulateReplication(compilePlant(plant, 'base', logged), 0, logged).log,
      ['snk1'],
    );

    expect([exits.length, exits[0], exits[1], exits.at(-1)]).toEqual([
      512, 170, 226, 28_786,
    ]);
  });

  it('UC-SIM-002: the n-th part leaves a fixed serial line at a + Σt + (n − 1)·max(a, t_max): (iii) a = 30 s, buffers of 2', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 30, queueCapacity: 1000 }),
        makeFixedStation({ id: 'm1', cycleSec: 40 }),
        makeBuffer({ id: 'b1', params: { capacity: 2 } }),
        makeFixedStation({ id: 'm2', cycleSec: 56 }),
        makeBuffer({ id: 'b2', params: { capacity: 2 } }),
        makeFixedStation({ id: 'm3', cycleSec: 44 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 28_800 }),
    );

    const exits = exitTimesSec(
      simulateReplication(compilePlant(plant, 'base', logged), 0, logged).log,
      ['snk1'],
    );

    expect([exits.length, exits[0], exits[1], exits.at(-1)]).toEqual([
      512, 170, 226, 28_786,
    ]);
  });

  it('UC-SIM-002: stops with SIMULATION_LIMIT_EXCEEDED when the run passes the event limit', () => {
    const options: RunOptions = {
      limits: { ...testLimits, eventCount: 33 },
      recordLog: false,
    };
    const compiled = compilePlant(plantA, 'base', options);

    const error = catchError(() => simulateReplication(compiled, 0, options));

    expect(error).toMatchObject({
      code: 'SIMULATION_LIMIT_EXCEEDED',
      details: { limit: 'eventCount' },
    });
  });

  it('UC-SIM-002: accepts a run with exactly the event limit', () => {
    const options: RunOptions = {
      limits: { ...testLimits, eventCount: 34 },
      recordLog: true,
    };
    const compiled = compilePlant(plantA, 'base', options);

    const result = simulateReplication(compiled, 0, options);

    expect(exitTimesSec(result.log, ['snk1'])).toHaveLength(5);
  });

  it('UC-SIM-002: records no log unless asked', () => {
    const options: RunOptions = { limits: testLimits, recordLog: false };
    const compiled = compilePlant(plantA, 'base', options);

    const result = simulateReplication(compiled, 0, options);

    expect(result.log).toBeNull();
  });

  it('UC-SIM-002: the final state lists the parts in the line, the station states and the next arrival', () => {
    const compiled = compilePlant(plantA, 'base', logged);

    const result = simulateReplication(compiled, 3, logged);

    expect(result).toMatchObject({
      replication: 3,
      finalState: {
        parts: [
          { partId: 21, elementId: 'src1', arrivalSec: 210 },
          { partId: 26, elementId: 'src1', arrivalSec: 260 },
          { partId: 16, elementId: 'm1', arrivalSec: 160 },
        ],
        stations: [{ elementId: 'm1', status: 'busy', remainingSec: 10 }],
        sources: [{ elementId: 'src1', nextArrivalSec: 300 }],
      },
    });
  });

  it('UC-SIM-002: the final state gives each station busy, blocked or starved', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 100 }),
        makeFixedStation({ id: 'm1', cycleSec: 10 }),
        makeFixedStation({ id: 'm2', cycleSec: 30 }),
        makeFixedStation({ id: 'm3', cycleSec: 1 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 305 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.finalState.stations).toEqual([
      { elementId: 'm1', status: 'blocked', remainingSec: null },
      { elementId: 'm2', status: 'busy', remainingSec: 15 },
      { elementId: 'm3', status: 'starved', remainingSec: null },
    ]);
  });

  it('RN-EDT-003: a source, a station and a sink with the editor defaults run', () => {
    const plant = makeDefaultLinePlant();

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(exitTimesSec(result.log, ['snk1']).length).toBeGreaterThan(0);
  });

  it('RN-SIM-013: WIP and lead time count the source queue: throughput 60 per hour, WIP 2.8, lead time 114 s', () => {
    const plant = plantA;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.indicators).toMatchObject({
      throughputPerHour: 60,
      wipAverage: 2.8,
      leadTimeAverageSec: 114,
      exitCount: 5,
    });
  });

  it('RN-SIM-013: counts 29 arrivals and 21 lost', () => {
    const plant = plantA;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.indicators).toMatchObject({
      arrivalCount: 29,
      lostArrivalCount: 21,
      sources: [{ elementId: 'src1', arrivalCount: 29, lostArrivalCount: 21 }],
    });
  });

  it('UC-SIM-002: series slices of 60 s give exits, WIP and lead time, with null when nothing left', () => {
    const plant = plantA;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.series).toEqual([
      {
        startSec: 0,
        endSec: 60,
        exitCount: 0,
        wipAverage: 2,
        leadTimeAverageSec: null,
      },
      {
        startSec: 60,
        endSec: 120,
        exitCount: 2,
        wipAverage: 3,
        leadTimeAverageSec: 70,
      },
      {
        startSec: 120,
        endSec: 180,
        exitCount: 1,
        wipAverage: 3,
        leadTimeAverageSec: 130,
      },
      {
        startSec: 180,
        endSec: 240,
        exitCount: 1,
        wipAverage: 3,
        leadTimeAverageSec: 150,
      },
      {
        startSec: 240,
        endSec: 300,
        exitCount: 1,
        wipAverage: 3,
        leadTimeAverageSec: 150,
      },
    ]);
  });

  it('UC-SIM-002: the last slice is shorter when the duration is not a multiple of 60 s', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 2 }),
        makeFixedStation({ cycleSec: 50 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 90 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.series).toEqual([
      {
        startSec: 0,
        endSec: 60,
        exitCount: 0,
        wipAverage: 2,
        leadTimeAverageSec: null,
      },
      {
        startSec: 60,
        endSec: 90,
        exitCount: 1,
        wipAverage: 3,
        leadTimeAverageSec: 50,
      },
    ]);
  });

  it('RN-SIM-014: busy, blocked and starved ratios of a blocked station', () => {
    const plant = plantC;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.indicators.stations).toEqual([
      {
        elementId: 'm1',
        busyRatio: 110 / 300,
        blockedRatio: 180 / 300,
        starvedRatio: 10 / 300,
      },
      {
        elementId: 'm2',
        busyRatio: 280 / 300,
        blockedRatio: 0,
        starvedRatio: 20 / 300,
      },
    ]);
  });

  it('RN-SIM-014: busy and starved ratios of a station that waits for parts', () => {
    const plant = plantB;

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.indicators.stations).toEqual([
      {
        elementId: 'm1',
        busyRatio: 70 / 100,
        blockedRatio: 0,
        starvedRatio: 30 / 100,
      },
    ]);
  });

  it('UC-SIM-002: lead time is null when no part leaves', () => {
    const plant = makeLinePlant(
      [
        makeFixedSource({ intervalSec: 10, queueCapacity: 2 }),
        makeFixedStation({ cycleSec: 400 }),
        makeSink(),
      ],
      makeScenario({ durationSec: 300 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(result.indicators).toMatchObject({
      throughputPerHour: 0,
      exitCount: 0,
      leadTimeAverageSec: null,
    });
    expect(result.series).toMatchObject([
      { leadTimeAverageSec: null },
      { leadTimeAverageSec: null },
      { leadTimeAverageSec: null },
      { leadTimeAverageSec: null },
      { leadTimeAverageSec: null },
    ]);
  });

  it('UC-SIM-002: the time of every part inside the shift equals the WIP area (Little 2011, LL.2)', () => {
    const plant = makeLinePlant(
      [
        makeSource(),
        makeStation({
          id: 'm1',
          params: {
            ...makeStation().params,
            cycle: { dist: 'exponential', meanSec: 50 },
          },
        }),
        makeBuffer({ id: 'b1', params: { capacity: 5 } }),
        makeStation({
          id: 'm2',
          params: {
            ...makeStation().params,
            cycle: { dist: 'triangular', minSec: 30, modeSec: 40, maxSec: 55 },
          },
        }),
        makeSink(),
      ],
      makeScenario({ durationSec: 28_800 }),
    );

    const result = simulateReplication(
      compilePlant(plant, 'base', logged),
      0,
      logged,
    );

    expect(
      relativeError(
        sumTimeInWindowSec(result.log, ['snk1'], 28_800),
        result.indicators.wipAverage * 28_800,
      ),
    ).toBeLessThan(1e-9);
  });
});
