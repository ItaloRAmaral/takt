import nx from '@nx/eslint-plugin';
import checkFile from 'eslint-plugin-check-file';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'];
const configFiles = ['**/*.config.{ts,mts,mjs}'];

export const noEnum = {
  selector: 'TSEnumDeclaration',
  message:
    'Use a union of literals or an `as const` object (code-style section 4).',
};

export const browserGlobals = [
  'window',
  'document',
  'navigator',
  'fetch',
  'localStorage',
];

export default defineConfig(
  nx.configs['flat/base'],
  nx.configs['flat/typescript'],
  nx.configs['flat/javascript'],
  {
    ignores: [
      '.claude/**',
      '**/dist',
      '**/out-tsc',
      '**/coverage',
      '**/test-output',
      '**/reports',
      '**/.stryker-tmp',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: tsFiles,
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['camelCase', 'UPPER_CASE'],
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: ['camelCase', 'UPPER_CASE'],
        },
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          modifiers: ['requiresQuotes'],
          format: null,
        },
      ],
    },
  },
  {
    files: [...tsFiles, '**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: { 'check-file': checkFile },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            { sourceTag: 'type:app', notDependOnLibsWithTags: ['type:app'] },
            { sourceTag: 'type:lib', onlyDependOnLibsWithTags: ['type:lib'] },
          ],
        },
      ],
      'no-restricted-syntax': ['error', noEnum],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      'no-console': 'error',
      eqeqeq: 'error',
      'prefer-const': 'error',
      'check-file/filename-naming-convention': [
        'error',
        { '**/*': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { '**/': 'KEBAB_CASE' }],
    },
  },
  {
    files: configFiles,
    rules: {
      'no-restricted-exports': 'off',
    },
  },
);
