import { itemAt } from '../collections/item-at.js';

/**
 * Chooses where an element pulls its next part from: among its inputs, the
 * one whose available part has waited longest, and on a tie the first in
 * connection order (RN-SIM-014, RN-SIM-018).
 *
 * @param inputIndices - The input elements, in connection order.
 * @param availableSinceSec - For every element, since when its next part is
 *   available, in seconds; `Infinity` when it has none.
 * @returns The index of the chosen element, or −1 when no input has a part.
 *
 * @example
 * const from = chooseInput(station.inputIndices, availableSinceSec);
 */
export function chooseInput(
  inputIndices: readonly number[],
  availableSinceSec: readonly number[],
): number {
  let chosen = -1;
  let oldestSec = Infinity;

  for (const index of inputIndices) {
    const sinceSec = itemAt(availableSinceSec, index);

    if (sinceSec < oldestSec) {
      chosen = index;
      oldestSec = sinceSec;
    }
  }

  return chosen;
}
