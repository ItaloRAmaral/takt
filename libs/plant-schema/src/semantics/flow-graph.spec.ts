import {
  makeBuffer,
  makePlant,
  makeSink,
  makeSource,
  makeStation,
} from '../tests/helpers/make-plant.js';
import { checkFlowGraph } from './flow-graph.js';

describe('plant flow graph', () => {
  it('finds nothing wrong in a source, a station and a sink in a line', () => {
    const plant = makePlant();

    const issues = checkFlowGraph(plant);

    expect(issues).toEqual([]);
  });

  it('RN-EDT-004: requires a source', () => {
    const plant = makePlant({
      elements: [makeStation(), makeSink()],
      connections: [{ id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' }],
    });

    const issues = checkFlowGraph(plant);

    expect(issues).toContainEqual({ path: ['elements'], code: 'NO_SOURCE' });
  });

  it('RN-EDT-004: requires an exit', () => {
    const plant = makePlant({
      elements: [makeSource(), makeStation()],
      connections: [{ id: 'c1', from: 'src1', to: 'm1', kind: 'direct' }],
    });

    const issues = checkFlowGraph(plant);

    expect(issues).toContainEqual({ path: ['elements'], code: 'NO_EXIT' });
  });

  it('RN-EDT-004: reports an element no source reaches', () => {
    const plant = makePlant({
      elements: [makeSource(), makeStation(), makeSink(), makeBuffer()],
    });

    const issues = checkFlowGraph(plant);

    expect(issues).toEqual([
      { elementId: 'b1', path: ['elements', 3], code: 'UNREACHABLE_ELEMENT' },
    ]);
  });

  it('RN-EDT-004: reports an element with no path to an exit', () => {
    const plant = makePlant({
      elements: [
        makeSource(),
        makeStation(),
        makeSink(),
        makeStation({ id: 'm2' }),
      ],
      connections: [
        { id: 'c1', from: 'src1', to: 'm1', kind: 'direct' },
        { id: 'c2', from: 'm1', to: 'snk1', kind: 'direct' },
        { id: 'c3', from: 'src1', to: 'm2', kind: 'direct' },
      ],
    });

    const issues = checkFlowGraph(plant);

    expect(issues).toEqual([
      { elementId: 'm2', path: ['elements', 3], code: 'UNREACHABLE_ELEMENT' },
    ]);
  });

  it.each([
    { connection: { id: 'c3', from: 'm1', to: 'm1', kind: 'direct' } },
    { connection: { id: 'c3', from: 'src1', to: 'm1', kind: 'direct' } },
    { connection: { id: 'c3', from: 'm1', to: 'src1', kind: 'direct' } },
    { connection: { id: 'c3', from: 'snk1', to: 'm1', kind: 'direct' } },
  ] as const)(
    'RN-EDT-004: rejects the connection $connection.from to $connection.to with INVALID_CONNECTION',
    ({ connection }) => {
      const plant = makePlant({
        connections: [...makePlant().connections, connection],
      });

      const issues = checkFlowGraph(plant);

      expect(issues).toEqual([
        { path: ['connections', 2], code: 'INVALID_CONNECTION' },
      ]);
    },
  );

  it('ignores a connection to an unknown element, already reported as a reference', () => {
    const plant = makePlant({
      connections: [
        ...makePlant().connections,
        { id: 'c3', from: 'm1', to: 'x', kind: 'direct' },
      ],
    });

    const issues = checkFlowGraph(plant);

    expect(issues).toEqual([]);
  });
});
