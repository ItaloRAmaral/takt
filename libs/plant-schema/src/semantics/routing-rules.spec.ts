import {
  makeBuffer,
  makePlant,
  makeScrap,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import type { Routing } from '../structure/routing.js';
import { checkRoutingRules } from './routing-rules.js';

type QualityRouting = Extract<Routing, { rule: 'byQuality' }>;

const qualityLine = makePlant({
  elements: [
    makeSource(),
    makeStation({
      params: { ...makeStation().params, defectRate: 0.1 },
      routing: {
        rule: 'byQuality',
        good: 'snk1',
        rework: 'rw1',
        scrap: 'scr1',
      },
    }),
    makeSink(),
    makeScrap(),
    makeStation({ id: 'rw1', pos: [2, 2] }),
  ],
  connections: [
    { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
    { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
    { id: 'c3', from: 'm1', to: 'scr1', kind: 'direct' },
    { id: 'c4', from: 'm1', to: 'rw1', kind: 'direct' },
    { id: 'c5', from: 'rw1', to: 'snk1', kind: 'direct' },
  ],
});

const splitLine = makePlant({
  elements: [
    makeSource(),
    makeStation(),
    makeSink(),
    makeSink({ id: 'snk2', pos: [4, 4] }),
  ],
  connections: [
    { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
    { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
    { id: 'c3', from: 'm1', to: 'snk2', kind: 'direct' },
  ],
});

describe('routing rules of a plant', () => {
  it('finds nothing wrong in a station routed by quality', () => {
    const issues = checkRoutingRules(qualityLine);

    expect(issues).toEqual([]);
  });

  it.each<{ routing: Routing }>([
    { routing: { rule: 'shortestQueue' } },
    {
      routing: {
        rule: 'byPercentage',
        shares: [
          { to: 'snk1', sharePct: 70 },
          { to: 'snk2', sharePct: 30 },
        ],
      },
    },
  ])('accepts a split by $routing.rule', ({ routing }) => {
    const plant = makePlant({
      ...splitLine,
      elements: [
        makeSource(),
        makeStation({ routing }),
        makeSink(),
        makeSink({ id: 'snk2', pos: [4, 4] }),
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toEqual([]);
  });

  it('RN-SIM-004: requires a routing rule for two outgoing connections', () => {
    const issues = checkRoutingRules(splitLine);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'routing'],
        code: 'ROUTING_REQUIRED',
      },
    ]);
  });

  it.each<{ routing: Routing }>([
    {
      routing: {
        rule: 'byPercentage',
        shares: [
          { to: 'snk1', sharePct: 50 },
          { to: 'snk1', sharePct: 50 },
        ],
      },
    },
    {
      routing: {
        rule: 'byPercentage',
        shares: [
          { to: 'snk1', sharePct: 50 },
          { to: 'snk2', sharePct: 25 },
          { to: 'src1', sharePct: 25 },
        ],
      },
    },
  ])(
    'RN-SIM-004: rejects a rule whose destinations differ from the outgoing connections: $routing.shares',
    ({ routing }) => {
      const plant = makePlant({
        ...splitLine,
        elements: [
          makeSource(),
          makeStation({ routing }),
          makeSink(),
          makeSink({ id: 'snk2', pos: [4, 4] }),
        ],
      });

      const issues = checkRoutingRules(plant);

      expect(issues).toEqual([
        {
          elementId: 'm1',
          path: ['elements', 1, 'routing'],
          code: 'ROUTING_MISMATCH',
        },
      ]);
    },
  );

  it('RN-SIM-004: rejects a byQuality rule with good equal to rework', () => {
    const plant = makePlant({
      ...qualityLine,
      elements: [
        makeSource(),
        makeStation({
          params: { ...makeStation().params, defectRate: 0.1 },
          routing: {
            rule: 'byQuality',
            good: 'snk1',
            rework: 'snk1',
            scrap: 'scr1',
          },
        }),
        makeSink(),
        makeScrap(),
        makeStation({ id: 'rw1', pos: [2, 2] }),
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toContainEqual({
      elementId: 'm1',
      path: ['elements', 1, 'routing'],
      code: 'ROUTING_MISMATCH',
    });
  });

  it('RN-SIM-005: rejects percentages summing to 99', () => {
    const plant = makePlant({
      ...splitLine,
      elements: [
        makeSource(),
        makeStation({
          routing: {
            rule: 'byPercentage',
            shares: [
              { to: 'snk1', sharePct: 70 },
              { to: 'snk2', sharePct: 29 },
            ],
          },
        }),
        makeSink(),
        makeSink({ id: 'snk2', pos: [4, 4] }),
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'routing', 'shares'],
        code: 'PERCENTAGES_NOT_100',
      },
    ]);
  });

  it('RN-SIM-004: requires byQuality for a station with defects', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation({ params: { ...makeStation().params, defectRate: 0.02 } }),
        makeSink(),
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toEqual([
      {
        elementId: 'm1',
        path: ['elements', 1, 'routing'],
        code: 'QUALITY_ROUTING_REQUIRED',
      },
    ]);
  });

  it('RN-SIM-006: rejects byQuality on a buffer', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeBuffer({
          routing: {
            rule: 'byQuality',
            good: 'snk1',
            rework: null,
            scrap: 'scr1',
          },
        }),
        makeSink(),
        makeScrap(),
      ],
      connections: [
        { id: 'c1', from: 'src1', to: 'b1', kind: 'direct' },
        { id: 'c2', from: 'b1', to: 'snk1', kind: 'direct' },
        { id: 'c3', from: 'b1', to: 'scr1', kind: 'direct' },
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toEqual([
      {
        elementId: 'b1',
        path: ['elements', 1, 'routing'],
        code: 'INVALID_ROUTING_RULE',
      },
    ]);
  });

  it.each<{ routing: QualityRouting & { rework: string }; field: string }>([
    {
      routing: {
        rule: 'byQuality',
        good: 'snk1',
        rework: 'rw1',
        scrap: 'snk2',
      },
      field: 'scrap',
    },
    {
      routing: {
        rule: 'byQuality',
        good: 'scr1',
        rework: 'rw1',
        scrap: 'scr2',
      },
      field: 'good',
    },
    {
      routing: {
        rule: 'byQuality',
        good: 'snk1',
        rework: 'snk2',
        scrap: 'scr1',
      },
      field: 'rework',
    },
  ])(
    'RN-SIM-006: rejects a byQuality $field destination of the wrong type',
    ({ routing, field }) => {
      const plant = makePlant({
        elements: [
          makeSource(),
          makeStation({
            params: { ...makeStation().params, defectRate: 0.1 },
            routing,
          }),
          makeSink(),
          makeSink({ id: 'snk2', pos: [4, 4] }),
          makeScrap(),
          makeScrap({ id: 'scr2', pos: [6, 4] }),
          makeStation({ id: 'rw1', pos: [2, 2] }),
        ],
        connections: [
          { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
          { id: 'c2', from: 'm1', to: routing.good, kind: 'direct' },
          { id: 'c3', from: 'm1', to: routing.rework, kind: 'direct' },
          { id: 'c4', from: 'm1', to: routing.scrap, kind: 'direct' },
          { id: 'c5', from: 'rw1', to: 'snk1', kind: 'direct' },
        ],
      });

      const issues = checkRoutingRules(plant);

      expect(issues).toEqual([
        {
          elementId: 'm1',
          path: ['elements', 1, 'routing', field],
          code: 'INVALID_ROUTING_RULE',
        },
      ]);
    },
  );

  it('leaves a rule with an unknown destination to the reference check', () => {
    const plant = makePlant({
      ...splitLine,
      elements: [
        makeSource(),
        makeStation({
          routing: {
            rule: 'byPercentage',
            shares: [
              { to: 'x', sharePct: 50 },
              { to: 'snk2', sharePct: 40 },
            ],
          },
        }),
        makeSink(),
        makeSink({ id: 'snk2', pos: [4, 4] }),
      ],
    });

    const issues = checkRoutingRules(plant);

    expect(issues).toEqual([]);
  });
});
