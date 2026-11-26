import {
  addWipArea,
  createSeries,
  recordSeriesExit,
  summarizeSeries,
} from './series.js';

describe('series', () => {
  it('cuts the shift into slices of 60 s, the last one shorter', () => {
    const series = createSeries(150);

    const slices = summarizeSeries(series);

    expect(slices).toEqual([
      {
        startSec: 0,
        endSec: 60,
        exitCount: 0,
        wipAverage: 0,
        leadTimeAverageSec: null,
      },
      {
        startSec: 60,
        endSec: 120,
        exitCount: 0,
        wipAverage: 0,
        leadTimeAverageSec: null,
      },
      {
        startSec: 120,
        endSec: 150,
        exitCount: 0,
        wipAverage: 0,
        leadTimeAverageSec: null,
      },
    ]);
  });

  it('splits a WIP area across the slices it spans, each averaged over its own length', () => {
    const series = createSeries(150);
    addWipArea(series, 30, 135, 2);

    const slices = summarizeSeries(series);

    expect(slices).toMatchObject([
      { wipAverage: 1 },
      { wipAverage: 2 },
      { wipAverage: 1 },
    ]);
  });

  it('an exit belongs to the slice whose start it is at or after, and its lead time averages there', () => {
    const series = createSeries(150);
    recordSeriesExit(series, 60, 50);
    recordSeriesExit(series, 110, 90);

    const slices = summarizeSeries(series);

    expect(slices[1]).toMatchObject({ exitCount: 2, leadTimeAverageSec: 70 });
  });
});
