/**
 * The limits a plant document must respect: list sizes, text lengths and
 * value ceilings. They keep an imported or hand-made plant from overloading
 * the editor or the engine, and they live in one place so every check uses
 * the same numbers.
 *
 * Times are in seconds (`timeSec`, one year), lengths in metres, speeds in
 * metres per minute, the scenario duration in hours and text lengths
 * (`idLength`, `nameLength`, `schemaUrlLength`) in characters.
 *
 * @example
 * plant.elements.length <= PLANT_LIMITS.elementCount;
 */
export const PLANT_LIMITS = Object.freeze({
  elementCount: 500,
  connectionCount: 2000,
  zoneCount: 50,
  scenarioCount: 20,
  overrideCount: 2000,
  capacity: 10_000,
  timeSec: 31_536_000,
  durationH: 720,
  gridCells: 200,
  idLength: 64,
  nameLength: 120,
  reworkLimit: 10,
  lengthM: 10_000,
  speedMPerMin: 10_000,
  seed: 4_294_967_295,
  minReplicationCount: 5,
  maxReplicationCount: 100,
  schemaUrlLength: 2048,
} as const);
