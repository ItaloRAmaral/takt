import { defineConfig } from 'eslint/config';
import baseConfig, { browserGlobals } from '../../eslint.config.mjs';

const forbiddenImportPaths = [
  {
    name: '@takt/sim-engine',
    message: 'The plant schema never depends on the engine (ADR-0001).',
  },
];

export default defineConfig(
  baseConfig,
  {
    rules: {
      'no-restricted-globals': ['error', ...browserGlobals],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { paths: forbiddenImportPaths },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/tests/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: forbiddenImportPaths,
          patterns: [
            {
              regex: '(^|/)tests/',
              message:
                'Test helpers are for specs only: they stay out of the build.',
            },
          ],
        },
      ],
    },
  },
);
