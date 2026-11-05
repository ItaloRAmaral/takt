import { SimulationError } from '../errors/simulation-error.js';

// Noll et al. (2026), RFC 9923, FNV-1a
const OFFSET_BASIS = 0xcbf29ce484222325n;
const PRIME = 0x100000001b3n;
const LAST_ASCII = 0x7f;

/**
 * Hashes an ASCII text with 64-bit FNV-1a, one byte per character.
 *
 * @param text - The text to hash; ASCII characters only.
 * @returns The hash, from 0 to 2^64 − 1.
 * @throws {RangeError} When `text` has a character outside ASCII.
 */
export function fnv1a64(text: string): bigint {
  let hash = OFFSET_BASIS;

  for (let position = 0; position < text.length; position += 1) {
    const code = text.charCodeAt(position);

    if (code > LAST_ASCII) {
      throw new RangeError('Stream keys must be ASCII.');
    }

    hash = BigInt.asUintN(64, (hash ^ BigInt(code)) * PRIME);
  }

  return hash;
}

/**
 * Finds the stream number of a key: the 64-bit FNV-1a hash of the seed, a
 * colon and the key.
 *
 * @param seed - The seed of the run.
 * @param key - What draws from the stream, as `<element id>:<purpose>`.
 * @returns The stream number, for `findStreamStart`.
 * @throws {RangeError} When `key` has a character outside ASCII.
 *
 * @example
 * findStreamIndex(42, 'm1:cycle'); // 4846866088661209389n
 */
export function findStreamIndex(seed: number, key: string): bigint {
  return fnv1a64(`${String(seed)}:${key}`);
}

/**
 * Finds the stream number of every key of a run, and refuses the plant when
 * two keys share a number.
 *
 * @param seed - The seed of the run.
 * @param keys - What draws from a stream, as `<element id>:<purpose>`.
 * @returns The stream number of each key.
 * @throws {SimulationError} `INVALID_PLANT` when two keys get the same stream
 * number, a repeated key included.
 * @throws {RangeError} When a key has a character outside ASCII.
 */
export function assignStreamIndices(
  seed: number,
  keys: readonly string[],
): ReadonlyMap<string, bigint> {
  const indices = new Map<string, bigint>();
  const keyByIndex = new Map<bigint, string>();

  for (const key of keys) {
    const index = findStreamIndex(seed, key);
    const otherKey = keyByIndex.get(index);

    if (otherKey !== undefined) {
      throw new SimulationError(
        'INVALID_PLANT',
        `Stream keys ${otherKey} and ${key} share a stream.`,
      );
    }

    keyByIndex.set(index, key);
    indices.set(key, index);
  }

  return indices;
}
