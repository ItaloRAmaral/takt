import {
  changeTimeWeightedValue,
  createTimeWeightedValue,
  timeWeightedAverage,
} from './time-weighted.js';

describe('time-weighted value', () => {
  it('the average of a value that never changes is that value', () => {
    const value = createTimeWeightedValue(1);

    const average = timeWeightedAverage(value, 100);

    expect(average).toBe(1);
  });

  it('weights each value by how long it held, up to the end', () => {
    const value = createTimeWeightedValue(0);
    changeTimeWeightedValue(value, 10, 2);
    changeTimeWeightedValue(value, 30, 1);

    const average = timeWeightedAverage(value, 50);

    expect(average).toBe(1.2);
  });

  it('a value that held for 0 s weighs nothing', () => {
    const value = createTimeWeightedValue(0);
    changeTimeWeightedValue(value, 10, 5);
    changeTimeWeightedValue(value, 10, 1);

    const average = timeWeightedAverage(value, 20);

    expect(average).toBe(0.5);
  });

  it('keeps the current value', () => {
    const value = createTimeWeightedValue(0);
    changeTimeWeightedValue(value, 10, 3);

    const current = value.value;

    expect(current).toBe(3);
  });
});
