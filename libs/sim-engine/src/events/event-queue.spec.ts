import fc from 'fast-check';
import { catchError } from '../tests/helpers/catch-error.js';
import {
  scheduleSlots,
  sortSlotsByEventOrder,
  takeAllSlots,
} from '../tests/helpers/scheduled-slots.js';
import {
  createEventQueue,
  scheduleSlot,
  slotTimeSec,
  takeNextSlot,
  type EventKind,
} from './event-queue.js';

describe('event queue', () => {
  it('takes events by time, then kind, then scheduling order', () => {
    const queue = scheduleSlots([
      { kind: 'arrival', tSec: 10 },
      { kind: 'finishProcessing', tSec: 10 },
      { kind: 'arrival', tSec: 5 },
      { kind: 'finishProcessing', tSec: 10 },
    ]);

    const slots = takeAllSlots(queue);

    expect(slots).toEqual([2, 1, 3, 0]);
  });

  it('takes no slot from an empty queue', () => {
    const queue = createEventQueue(['arrival']);

    const slot = takeNextSlot(queue);

    expect(slot).toBe(-1);
  });

  it('slotTimeSec gives the time a slot was scheduled at', () => {
    const queue = scheduleSlots([{ kind: 'arrival', tSec: 12.5 }]);

    const tSec = slotTimeSec(queue, 0);

    expect(tSec).toBe(12.5);
  });

  it('schedules a slot again after it was taken', () => {
    const queue = scheduleSlots([
      { kind: 'arrival', tSec: 10 },
      { kind: 'arrival', tSec: 20 },
    ]);
    takeNextSlot(queue);
    scheduleSlot(queue, 0, 30);

    const slots = takeAllSlots(queue);

    expect(slots).toEqual([1, 0]);
  });

  it.each([
    { label: 'Infinity', tSec: Infinity },
    { label: 'NaN', tSec: NaN },
  ])('refuses to schedule a time of $label with a defect', ({ tSec }) => {
    const queue = createEventQueue(['arrival']);

    const error = catchError(() => {
      scheduleSlot(queue, 0, tSec);
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('refuses to schedule a slot already scheduled with a defect', () => {
    const queue = scheduleSlots([{ kind: 'arrival', tSec: 10 }]);

    const error = catchError(() => {
      scheduleSlot(queue, 0, 20);
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('refuses to schedule a slot outside the queue with a defect', () => {
    const queue = createEventQueue(['arrival']);

    const error = catchError(() => {
      scheduleSlot(queue, 1, 10);
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('slotTimeSec refuses a slot outside the queue with a defect', () => {
    const queue = createEventQueue(['arrival']);

    const error = catchError(() => slotTimeSec(queue, 1));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });

  it('takes every scheduled event once, in (time, kind, sequence) order', () => {
    const events = fc.array(
      fc.record({
        kind: fc.constantFrom<EventKind>('finishProcessing', 'arrival'),
        tSec: fc.integer({ min: 0, max: 100 }),
      }),
      { maxLength: 60 },
    );

    fc.assert(
      fc.property(events, (scheduled) => {
        const slots = takeAllSlots(scheduleSlots(scheduled));

        expect(slots).toEqual(sortSlotsByEventOrder(scheduled));
      }),
      { seed: 42, numRuns: 200 },
    );
  });
});
