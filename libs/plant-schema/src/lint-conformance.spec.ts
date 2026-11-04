import path from 'node:path';
import { ESLint, type Linter } from 'eslint';
import tseslint from 'typescript-eslint';

const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
const withoutTypeInformation = tseslint.configs.disableTypeChecked;
const eslint = new ESLint({
  cwd: workspaceRoot,
  overrideConfig: withoutTypeInformation,
});

async function lintSchemaFile(
  name: string,
  code: string,
): Promise<Linter.LintMessage[]> {
  const results = await eslint.lintText(code, {
    filePath: path.join(workspaceRoot, 'libs/plant-schema/src', name),
  });
  return results.flatMap((result) => result.messages);
}

describe('plant schema lint rules', () => {
  it('rejects importing the engine in the plant schema', async () => {
    const code = `import { run } from '@takt/sim-engine';\n\nexport const value = run;\n`;

    const messages = await lintSchemaFile('value.ts', code);

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
  ])(
    'rejects the browser global $name in the plant schema',
    async ({ name }) => {
      const code = `export const value = ${name};\n`;

      const messages = await lintSchemaFile('value.ts', code);

      expect(messages).toContainEqual(
        expect.objectContaining({ ruleId: 'no-restricted-globals', line: 1 }),
      );
    },
  );

  it('rejects enum declarations', async () => {
    const code = `export enum Kind {\n  Real,\n}\n`;

    const messages = await lintSchemaFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-restricted-syntax', line: 1 }),
    );
  });

  it('rejects default exports', async () => {
    const code = `const answer = 42;\n\nexport default answer;\n`;

    const messages = await lintSchemaFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-restricted-exports', line: 3 }),
    );
  });

  it('rejects console calls', async () => {
    const code = `console.log('value');\n`;

    const messages = await lintSchemaFile('value.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'no-console', line: 1 }),
    );
  });

  it('rejects file names that are not kebab-case', async () => {
    const code = `export const value = 1;\n`;

    const messages = await lintSchemaFile('plantDraft.ts', code);

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: 'check-file/filename-naming-convention',
      }),
    );
  });

  it('accepts a file that follows every rule', async () => {
    const code = `export interface StationDraft {\n  readonly id: string;\n  readonly cycleSec: number;\n}\n\nexport function hasPositiveCycle(station: StationDraft): boolean {\n  return station.cycleSec > 0;\n}\n`;

    const messages = await lintSchemaFile('station-draft.ts', code);

    expect(messages).toEqual([]);
  });

  it('accepts a default export in a config file', async () => {
    const code = `export default {};\n`;

    const messages = await lintSchemaFile('vite.config.ts', code);

    expect(messages).toEqual([]);
  });

  it.each([{ name: 'plant.spec.ts' }, { name: 'vite.config.ts' }])(
    'accepts $name as a file name',
    async ({ name }) => {
      const code = `export const value = 1;\n`;

      const messages = await lintSchemaFile(name, code);

      expect(messages).toEqual([]);
    },
  );
});
