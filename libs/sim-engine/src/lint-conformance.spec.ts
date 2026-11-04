import path from 'node:path';
import { ESLint, type Linter } from 'eslint';
import tseslint from 'typescript-eslint';

const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
const withoutTypeInformation = tseslint.configs.disableTypeChecked;
const eslint = new ESLint({
  cwd: workspaceRoot,
  overrideConfig: withoutTypeInformation,
});

async function lintEngineFile(
  name: string,
  code: string,
): Promise<Linter.LintMessage[]> {
  const results = await eslint.lintText(code, {
    filePath: path.join(workspaceRoot, 'libs/sim-engine/src', name),
  });
  return results.flatMap((result) => result.messages);
}

describe('engine lint rules', () => {
  it.each([
    { api: 'Math.random()', ruleId: 'no-restricted-properties' },
    { api: 'globalThis.Math.random()', ruleId: 'no-restricted-syntax' },
    { api: 'Date.now()', ruleId: 'no-restricted-properties' },
    { api: 'globalThis.Date.now()', ruleId: 'no-restricted-syntax' },
    { api: 'new Date()', ruleId: 'no-restricted-syntax' },
    { api: 'Date()', ruleId: 'no-restricted-syntax' },
    { api: 'performance.now()', ruleId: 'no-restricted-properties' },
  ])('rejects $api in the engine', async ({ api, ruleId }) => {
    const code = `export const value = ${api};\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId, line: 1 }),
    );
  });

  it.each([
    { specifier: 'react' },
    { specifier: 'react-dom' },
    { specifier: 'three' },
    { specifier: '@react-three/fiber' },
  ])('rejects importing $specifier in the engine', async ({ specifier }) => {
    const code = `import { thing } from '${specifier}';\n\nexport const value = thing;\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: '@typescript-eslint/no-restricted-imports',
        line: 1,
      }),
    );
  });

  it.each([
    { name: 'window' },
    { name: 'document' },
    { name: 'navigator' },
    { name: 'fetch' },
    { name: 'localStorage' },
  ])('rejects the browser global $name in the engine', async ({ name }) => {
    const code = `export const value = ${name};\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-restricted-globals', line: 1 }),
    );
  });

  it('allows a type import from the plant schema in the engine', async () => {
    const code = `import type { PlantDraft } from '@takt/plant-schema';\n\nexport type Draft = PlantDraft;\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toEqual([]);
  });

  it('rejects a value import from the plant schema in the engine', async () => {
    const code = `import { plantSchema } from '@takt/plant-schema';\n\nexport const schema = plantSchema;\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toEqual([
      expect.objectContaining({
        ruleId: '@typescript-eslint/no-restricted-imports',
        line: 1,
      }),
    ]);
  });

  it('rejects enum declarations', async () => {
    const code = `export enum Mode {\n  Run,\n}\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-restricted-syntax', line: 1 }),
    );
  });

  it('rejects default exports', async () => {
    const code = `const answer = 42;\n\nexport default answer;\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-restricted-exports', line: 3 }),
    );
  });

  it('rejects console calls', async () => {
    const code = `console.log('value');\n`;

    const messages = await lintEngineFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-console', line: 1 }),
    );
  });

  it('rejects file names that are not kebab-case', async () => {
    const code = `export const value = 1;\n`;

    const messages = await lintEngineFile('stationState.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: 'check-file/filename-naming-convention',
      }),
    );
  });

  it('accepts a file that follows every rule', async () => {
    const code = `export interface Station {\n  readonly cycleSec: number;\n}\n\nexport function totalCycleSec(stations: readonly Station[]): number {\n  return stations.reduce((sum, station) => sum + station.cycleSec, 0);\n}\n`;

    const messages = await lintEngineFile('station.ts', code);

    expect(messages).toEqual([]);
  });

  it('accepts a default export in a config file', async () => {
    const code = `export default {};\n`;

    const messages = await lintEngineFile('vite.config.ts', code);

    expect(messages).toEqual([]);
  });

  it.each([{ name: 'plant.spec.ts' }, { name: 'vite.config.ts' }])(
    'accepts $name as a file name',
    async ({ name }) => {
      const code = `export const value = 1;\n`;

      const messages = await lintEngineFile(name, code);

      expect(messages).toEqual([]);
    },
  );
});
