import { catchError } from '../tests/helpers/catch-error.js';
import { itemAt } from './item-at.js';

describe('itemAt', () => {
  it('gives the item at an index', () => {
    const item = itemAt(['a', 'b'], 1);

    expect(item).toBe('b');
  });

  it('gives the value at an index of a typed array', () => {
    const value = itemAt(Float64Array.of(1.5, 2.5), 0);

    expect(value).toBe(1.5);
  });

  it.each([
    { label: '-1', index: -1 },
    { label: 'the length', index: 2 },
  ])('refuses the index $label with a defect', ({ index }) => {
    const error = catchError(() => itemAt(['a', 'b'], index));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toHaveProperty('code');
  });
});
