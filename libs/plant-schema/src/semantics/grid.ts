import type { PlantElement } from '../structure/elements.js';
import type { PlantIssue } from '../structure/issues.js';
import type { Plant } from '../structure/plant.js';
import { elementIssue } from './plant-index.js';

/**
 * Checks that every element fits inside the grid and that no two elements
 * share a cell. An element occupies `size[0]` columns by `size[1]` rows from
 * `pos` at 0° and 180°, and the two swap at 90° and 270°. The first element
 * keeps a contested cell; the later one gets the problem. Areas are compared
 * as rectangles, so the cost depends on the number of elements, not on their
 * size.
 *
 * @param plant - A plant with a valid shape.
 * @returns `OUT_OF_GRID` and `OVERLAP` problems, at each element's `pos`.
 *
 * @example
 * checkGrid(plant); // [] when everything fits
 */
export function checkGrid(plant: Plant): PlantIssue[] {
  const issues: PlantIssue[] = [];
  const placed: Rectangle[] = [];

  plant.elements.forEach((element, index) => {
    const [cols, rows] = footprint(element);
    const [col, row] = element.pos;
    const area = { col, row, cols, rows };

    if (col + cols > plant.grid.cols || row + rows > plant.grid.rows) {
      issues.push(elementIssue({ element, index }, ['pos'], 'OUT_OF_GRID'));

      return;
    }

    if (placed.some((other) => overlap(area, other))) {
      issues.push(elementIssue({ element, index }, ['pos'], 'OVERLAP'));

      return;
    }

    placed.push(area);
  });

  return issues;
}

interface Rectangle {
  readonly col: number;
  readonly row: number;
  readonly cols: number;
  readonly rows: number;
}

function overlap(a: Rectangle, b: Rectangle): boolean {
  return (
    a.col < b.col + b.cols &&
    b.col < a.col + a.cols &&
    a.row < b.row + b.rows &&
    b.row < a.row + a.rows
  );
}

function footprint(element: PlantElement): readonly [number, number] {
  const [cols, rows] = element.size;

  return element.rotDeg === 90 || element.rotDeg === 270
    ? [rows, cols]
    : [cols, rows];
}
