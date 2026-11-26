import {
  createEventQueue,
  scheduleSlot,
  takeNextSlot,
  type EventKind,
  type EventQueue,
} from '../../events/event-queue.js';

/** An event a test schedules: its kind and its time. */
export interface ScheduledEvent {
  /** The kind of the event, which sets its priority within an instant. */
  readonly kind: EventKind;
  /** When the event happens, in seconds. */
  readonly tSec: number;
}

/**
 * Creates a queue with one slot per event and schedules slot `i` at the time
 * of event `i`, in the order of the list.
 *
 * @param events - The events, in scheduling order.
 * @returns The queue with every slot scheduled.
 *
 * @example
 * const queue = scheduleSlots([{ kind: 'arrival', tSec: 10 }]);
 */
export function scheduleSlots(events: readonly ScheduledEvent[]): EventQueue {
  const queue = createEventQueue(events.map(({ kind }) => kind));

  events.forEach(({ tSec }, slot) => {
    scheduleSlot(queue, slot, tSec);
  });

  return queue;
}

/**
 * Takes every slot left in a queue, in the order the queue gives them.
 *
 * @param queue - The queue; it ends empty.
 * @returns The slots taken.
 *
 * @example
 * const slots = takeAllSlots(queue);
 */
export function takeAllSlots(queue: EventQueue): number[] {
  const slots: number[] = [];

  for (
    let slot = takeNextSlot(queue);
    slot !== -1;
    slot = takeNextSlot(queue)
  ) {
    slots.push(slot);
  }

  return slots;
}

/**
 * The order a queue must give the slots of {@link scheduleSlots}, computed
 * without a heap: by time, then the end of processing before the arrival,
 * then scheduling order (the stable sort keeps the list order).
 *
 * @param events - The events, in scheduling order.
 * @returns The slots, in the order they must be taken.
 *
 * @example
 * const expected = sortSlotsByEventOrder(events);
 */
export function sortSlotsByEventOrder(
  events: readonly ScheduledEvent[],
): number[] {
  const rank = (kind: EventKind): number =>
    kind === 'finishProcessing' ? 0 : 1;

  return events
    .map((event, slot) => ({ ...event, slot }))
    .sort((a, b) => a.tSec - b.tSec || rank(a.kind) - rank(b.kind))
    .map(({ slot }) => slot);
}
