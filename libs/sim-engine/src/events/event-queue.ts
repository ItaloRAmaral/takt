/**
 * The kinds of event of a replication. At the same instant an end of
 * processing comes before an arrival (RN-SIM-018).
 */
export type EventKind = 'finishProcessing' | 'arrival';

const KIND_PRIORITY: Readonly<Record<EventKind, number>> = {
  finishProcessing: 0,
  arrival: 1,
};

/**
 * The pending events of one replication: a binary heap of slots, one slot
 * per possible event (the next arrival of each source, the end of
 * processing of each station), over typed arrays, so no object is created
 * per event. Mutable and internal to a replication; change it only through
 * {@link scheduleSlot} and {@link takeNextSlot}.
 */
export interface EventQueue {
  /** The priority of each slot's kind; a lower one comes first. */
  readonly priorities: Uint8Array;
  /** The time each slot was last scheduled at, in seconds. */
  readonly timesSec: Float64Array;
  /** The scheduling order of each slot's pending event. */
  readonly sequences: Float64Array;
  /** Where each slot sits in the heap, or −1 when it is not scheduled. */
  readonly positions: Int32Array;
  /** The scheduled slots; the first `size` entries form the heap. */
  readonly heap: Int32Array;
  /** How many slots are scheduled. */
  size: number;
  /** The scheduling order the next scheduled event gets. */
  nextSequence: number;
}

/**
 * Creates an empty event queue with one slot per possible event.
 *
 * @param slotKinds - The kind of each slot; slot `i` has `slotKinds[i]`.
 * @returns The queue, with no slot scheduled.
 *
 * @example
 * const queue = createEventQueue(['arrival', 'finishProcessing']);
 */
export function createEventQueue(slotKinds: readonly EventKind[]): EventQueue {
  const slotCount = slotKinds.length;

  return {
    priorities: Uint8Array.from(slotKinds, (kind) => KIND_PRIORITY[kind]),
    timesSec: new Float64Array(slotCount),
    sequences: new Float64Array(slotCount),
    positions: new Int32Array(slotCount).fill(-1),
    heap: new Int32Array(slotCount),
    size: 0,
    nextSequence: 0,
  };
}

/**
 * Schedules a free slot at a time.
 *
 * @param queue - The queue; it changes.
 * @param slot - The slot to schedule.
 * @param tSec - When its event happens, in seconds.
 * @throws {Error} Without a code, a defect of the engine: a time that is not
 *   finite (a draw gone wrong), a slot outside the queue or a slot that is
 *   already scheduled.
 *
 * @example
 * scheduleSlot(queue, 0, 10);
 */
export function scheduleSlot(
  queue: EventQueue,
  slot: number,
  tSec: number,
): void {
  if (!Number.isFinite(tSec)) {
    throw new Error(
      `Slot ${String(slot)} cannot be scheduled at ${String(tSec)} s.`,
    );
  }

  if (valueAt(queue.positions, slot) !== -1) {
    throw new Error(`Slot ${String(slot)} is already scheduled.`);
  }

  queue.timesSec[slot] = tSec;
  queue.sequences[slot] = queue.nextSequence;
  queue.nextSequence += 1;
  queue.size += 1;
  siftUp(queue, slot, queue.size - 1);
}

/**
 * Takes the slot whose event comes first: the earliest time, then the
 * kind's priority, then the scheduling order. The slot becomes free and
 * keeps its time for {@link slotTimeSec}.
 *
 * @param queue - The queue; it changes.
 * @returns The slot taken, or −1 when no slot is scheduled.
 *
 * @example
 * const slot = takeNextSlot(queue);
 */
export function takeNextSlot(queue: EventQueue): number {
  if (queue.size === 0) {
    return -1;
  }

  const first = valueAt(queue.heap, 0);

  queue.positions[first] = -1;
  queue.size -= 1;

  if (queue.size > 0) {
    siftDown(queue, valueAt(queue.heap, queue.size), 0);
  }

  return first;
}

/**
 * The time a slot was last scheduled at.
 *
 * @param queue - The queue.
 * @param slot - The slot.
 * @returns The time, in seconds.
 * @throws {Error} Without a code, a defect of the engine: a slot outside the
 *   queue.
 *
 * @example
 * const tSec = slotTimeSec(queue, takeNextSlot(queue));
 */
export function slotTimeSec(queue: EventQueue, slot: number): number {
  return valueAt(queue.timesSec, slot);
}

// Reading a typed array outside its length gives undefined, and writing
// there is silently ignored; a slot outside the queue would corrupt the heap.
function valueAt(
  values: Uint8Array | Int32Array | Float64Array,
  index: number,
): number {
  const value = values[index];

  if (value === undefined) {
    throw new Error(`Index ${String(index)} is outside the event queue.`);
  }

  return value;
}

function comesBefore(queue: EventQueue, a: number, b: number): boolean {
  const timeA = valueAt(queue.timesSec, a);
  const timeB = valueAt(queue.timesSec, b);

  if (timeA !== timeB) {
    return timeA < timeB;
  }

  const priorityA = valueAt(queue.priorities, a);
  const priorityB = valueAt(queue.priorities, b);

  if (priorityA !== priorityB) {
    return priorityA < priorityB;
  }

  return valueAt(queue.sequences, a) < valueAt(queue.sequences, b);
}

function place(queue: EventQueue, slot: number, position: number): void {
  queue.heap[position] = slot;
  queue.positions[slot] = position;
}

function siftUp(queue: EventQueue, slot: number, start: number): void {
  let position = start;

  while (position > 0) {
    const parentPosition = (position - 1) >> 1;
    const parent = valueAt(queue.heap, parentPosition);

    if (!comesBefore(queue, slot, parent)) {
      break;
    }

    place(queue, parent, position);
    position = parentPosition;
  }

  place(queue, slot, position);
}

function siftDown(queue: EventQueue, slot: number, start: number): void {
  let position = start;

  for (
    let left = 2 * position + 1;
    left < queue.size;
    left = 2 * position + 1
  ) {
    const right = left + 1;
    const child =
      right < queue.size &&
      comesBefore(queue, valueAt(queue.heap, right), valueAt(queue.heap, left))
        ? right
        : left;
    const childSlot = valueAt(queue.heap, child);

    if (!comesBefore(queue, childSlot, slot)) {
      break;
    }

    place(queue, childSlot, position);
    position = child;
  }

  place(queue, slot, position);
}
