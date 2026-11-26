/**
 * Reads the item at an index of an array or typed array the engine built,
 * where an index outside it is a defect. Reading outside a typed array gives
 * `undefined` and writing there is silently ignored, so an index gone wrong
 * would corrupt the run instead of stopping it.
 *
 * @param items - The array.
 * @param index - The index, from 0 to `items.length - 1`.
 * @returns The item.
 * @throws {Error} Without a code, a defect of the engine: an index outside
 *   the array.
 *
 * @example
 * const element = itemAt(plant.elements, outputIndex);
 */
export function itemAt<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index];

  if (item === undefined) {
    throw new Error(`Index ${String(index)} is outside the array.`);
  }

  return item;
}
