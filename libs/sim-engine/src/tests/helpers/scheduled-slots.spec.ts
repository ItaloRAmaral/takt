import { slotTimeSec } from '../../events/event-queue.js';
import {
  scheduleSlots,
  sortSlotsByEventOrder,
  takeAllSlots,
} from './scheduled-slots.js';

describe('scheduled slots', () => {
  it('scheduleSlots schedules each slot at the time of its event', () => {
    const queue = scheduleSlots([
      { kind: 'arrival', tSec: 7 },
      { kind: 'finishProcessing', tSec: 3 },
    ]);

    const times = [slotTimeSec(queue, 0), slotTimeSec(queue, 1)];

    expect(times).toEqual([7, 3]);
  });

  it('takeAllSlots of an empty list is empty', () => {
    const queue = scheduleSlots([]);

    const slots = takeAllSlots(queue);

    expect(slots).toEqual([]);
  });

  it('takeAllSlots leaves the queue empty', () => {
    const queue = scheduleSlots([
      { kind: 'arrival', tSec: 2 },
      { kind: 'arrival', tSec: 1 },
    ]);
    takeAllSlots(queue);

    const slots = takeAllSlots(queue);

    expect(slots).toEqual([]);
  });

  it('sortSlotsByEventOrder orders by time, then kind, then list order', () => {
    const slots = sortSlotsByEventOrder([
      { kind: 'arrival', tSec: 4 },
      { kind: 'arrival', tSec: 4 },
      { kind: 'finishProcessing', tSec: 4 },
      { kind: 'arrival', tSec: 1 },
    ]);

    expect(slots).toEqual([3, 2, 0, 1]);
  });
});
