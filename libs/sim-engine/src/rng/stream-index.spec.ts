import { catchError } from '../tests/helpers/catch-error.js';
import { assignStreamIndices, fnv1a64, streamIndex } from './stream-index.js';

describe('stream index', () => {
  it.each([
    { label: 'the empty string', input: '', hash: 0xcbf29ce484222325n },
    { label: '"a"', input: 'a', hash: 0xaf63dc4c8601ec8cn },
    { label: '"foobar"', input: 'foobar', hash: 0x85944171f73967e8n },
    { label: 'a NUL byte', input: '\u0000', hash: 0xaf63bd4c8601b7dfn },
    {
      label: '"a" and a NUL byte',
      input: 'a\u0000',
      hash: 0x089be207b544f1e4n,
    },
    {
      label: '"foobar" and a NUL byte',
      input: 'foobar\u0000',
      hash: 0x34531ca7168b8f38n,
    },
  ])('hashes $label to the reference value', ({ input, hash }) => {
    const result = fnv1a64(input);

    expect(result).toBe(hash);
  });

  it('hashes the last ASCII character', () => {
    const result = fnv1a64('\u007f');

    expect(result).toBe(12638211389811462638n);
  });

  it('rejects a key with a non-ASCII character', () => {
    const error = catchError(() => streamIndex(42, 'máquina:cycle'));

    expect(error).toBeInstanceOf(RangeError);
  });

  it('streamIndex hashes the seed, a colon and the key', () => {
    const result = streamIndex(42, 'm1:cycle');

    expect(result).toBe(4846866088661209389n);
  });

  it('assigns each key its stream index', () => {
    const indices = assignStreamIndices(42, ['m1:cycle', 'm1:failure']);

    expect(indices).toEqual(
      new Map([
        ['m1:cycle', 4846866088661209389n],
        ['m1:failure', 8946054050544757389n],
      ]),
    );
  });

  it('rejects repeated stream indices as an invalid plant', () => {
    const error = catchError(() =>
      assignStreamIndices(42, ['m1:cycle', 'm1:cycle']),
    );

    expect(error).toMatchObject({ code: 'INVALID_PLANT' });
  });
});
