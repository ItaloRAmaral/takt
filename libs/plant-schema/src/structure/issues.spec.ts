import { z } from 'zod';
import { parseStructure } from './issues.js';
import { catchError } from '../tests/helpers/catch-error.js';

const sample = z.strictObject({
  count: z.int().min(0).max(10),
  ratio: z.number().gt(0),
  name: z.string().min(1).max(3),
  tags: z.array(z.string()).min(1).max(2),
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  version: z.literal(1),
  angle: z.literal([0, 90]),
  shape: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('dot') }),
    z.strictObject({ kind: z.literal('box'), side: z.number() }),
  ]),
});

const valid = {
  count: 1,
  ratio: 0.5,
  name: 'abc',
  tags: ['x'],
  id: 'a_1',
  version: 1,
  angle: 90,
  shape: { kind: 'dot' },
};

describe('structural issues', () => {
  it('returns the parsed data when the input matches', () => {
    const result = parseStructure(sample, valid);

    expect(result).toEqual({ success: true, data: valid });
  });

  it('reports a missing field as REQUIRED', () => {
    const result = parseStructure(sample, { ...valid, count: undefined });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['count'], code: 'REQUIRED' }],
    });
  });

  it.each([
    { field: 'count', value: 'one' },
    { field: 'count', value: Number.NaN },
    { field: 'ratio', value: Number.POSITIVE_INFINITY },
    { field: 'name', value: 7 },
  ])('reports $field = $value as INVALID_TYPE', ({ field, value }) => {
    const result = parseStructure(sample, { ...valid, [field]: value });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'INVALID_TYPE' }],
    });
  });

  it.each([
    { field: 'count', value: 1.5 },
    { field: 'count', value: -1 },
    { field: 'count', value: 11 },
    { field: 'ratio', value: 0 },
  ])('reports $field = $value as OUT_OF_RANGE', ({ field, value }) => {
    const result = parseStructure(sample, { ...valid, [field]: value });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'OUT_OF_RANGE' }],
    });
  });

  it.each([
    { field: 'name', value: 'abcd' },
    { field: 'tags', value: ['x', 'y', 'z'] },
  ])('reports $field = $value as TOO_MANY_ITEMS', ({ field, value }) => {
    const result = parseStructure(sample, { ...valid, [field]: value });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it.each([
    { field: 'name', value: '' },
    { field: 'tags', value: [] },
  ])('reports $field = $value as TOO_FEW_ITEMS', ({ field, value }) => {
    const result = parseStructure(sample, { ...valid, [field]: value });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'TOO_FEW_ITEMS' }],
    });
  });

  it('reports a problem inside a list with its index in the path', () => {
    const result = parseStructure(sample, { ...valid, tags: ['x', 5] });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['tags', 1], code: 'INVALID_TYPE' }],
    });
  });

  it('reports an id outside the pattern as INVALID_FORMAT', () => {
    const result = parseStructure(sample, { ...valid, id: 'a:b' });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['id'], code: 'INVALID_FORMAT' }],
    });
  });

  it.each([
    { field: 'version', value: 2 },
    { field: 'angle', value: 45 },
  ])('reports $field = $value as INVALID_VALUE', ({ field, value }) => {
    const result = parseStructure(sample, { ...valid, [field]: value });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [field], code: 'INVALID_VALUE' }],
    });
  });

  it('reports an unknown discriminator as INVALID_VALUE', () => {
    const result = parseStructure(sample, {
      ...valid,
      shape: { kind: 'star' },
    });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['shape', 'kind'], code: 'INVALID_VALUE' }],
    });
  });

  it('reports a missing discriminator as REQUIRED', () => {
    const result = parseStructure(sample, { ...valid, shape: {} });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['shape', 'kind'], code: 'REQUIRED' }],
    });
  });

  it('reports each unknown key, including __proto__ from JSON', () => {
    const input: unknown = JSON.parse(
      '{"count":1,"ratio":0.5,"name":"abc","tags":["x"],"id":"a_1","version":1,"angle":90,"shape":{"kind":"dot"},"__proto__":{},"extra":2}',
    );

    const result = parseStructure(sample, input);

    expect(result).toEqual({
      success: false,
      issues: [
        { path: ['__proto__'], code: 'UNKNOWN_FIELD' },
        { path: ['extra'], code: 'UNKNOWN_FIELD' },
      ],
    });
  });

  it('cuts an unknown key longer than 64 characters from the path', () => {
    const result = parseStructure(sample, { ...valid, ['k'.repeat(65)]: 1 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('cuts an unknown key with a control character from the path', () => {
    const result = parseStructure(sample, { ...valid, 'a\nb': 1 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('reports a root that is not an object as INVALID_TYPE', () => {
    const result = parseStructure(sample, null);

    expect(result).toEqual({
      success: false,
      issues: [{ path: [], code: 'INVALID_TYPE' }],
    });
  });

  it('issues carry only path and code, never the received value', () => {
    const result = parseStructure(sample, { ...valid, name: 'secret-value' });

    expect(result).toStrictEqual({
      success: false,
      issues: [{ path: ['name'], code: 'TOO_MANY_ITEMS' }],
    });
  });

  it('throws without a code on an issue the plant schema never produces', () => {
    const refined = z.number().refine(() => false);

    const error = catchError(() => parseStructure(refined, 1));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('reports one problem per path and code', () => {
    const result = parseStructure(sample, { ...valid, count: 1e20 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: ['count'], code: 'OUT_OF_RANGE' }],
    });
  });

  it('reports one problem for several unknown keys cut from the path', () => {
    const result = parseStructure(sample, { ...valid, 'a b': 1, 'c d': 2 });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [], code: 'UNKNOWN_FIELD' }],
    });
  });

  it('cuts an unknown key that does not look like an identifier from the path', () => {
    const result = parseStructure(sample, {
      ...valid,
      'joao.silva@empresa.com': 1,
    });

    expect(result).toEqual({
      success: false,
      issues: [{ path: [], code: 'UNKNOWN_FIELD' }],
    });
  });
});
