import { defineConfig } from 'eslint/config';
import baseConfig, { browserGlobals, noEnum } from '../../eslint.config.mjs';

const nondeterminism =
  'The engine must be deterministic: take time and randomness from the run input (ADR-0011).';

export default defineConfig(baseConfig, {
  rules: {
    'no-restricted-properties': [
      'error',
      { object: 'Math', property: 'random', message: nondeterminism },
      { object: 'Date', property: 'now', message: nondeterminism },
      { object: 'performance', property: 'now', message: nondeterminism },
    ],
    'no-restricted-syntax': [
      'error',
      noEnum,
      {
        selector: "NewExpression[callee.name='Date']",
        message: nondeterminism,
      },
      {
        selector: "CallExpression[callee.name='Date']",
        message: nondeterminism,
      },
      {
        selector:
          "MemberExpression[object.name='globalThis'][property.name=/^(Math|Date)$/]",
        message: nondeterminism,
      },
    ],
    'no-restricted-globals': ['error', ...browserGlobals],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            message: 'The engine never imports React (ADR-0011).',
          },
          {
            name: 'react-dom',
            message: 'The engine never imports React (ADR-0011).',
          },
          {
            name: 'three',
            message: 'The engine never imports Three.js (ADR-0011).',
          },
          {
            name: '@takt/plant-schema',
            allowTypeImports: true,
            message:
              'The engine depends only on the plant schema types (ADR-0011).',
          },
        ],
        patterns: [
          {
            group: ['@react-three/*'],
            message: 'The engine never imports React Three Fiber (ADR-0011).',
          },
        ],
      },
    ],
  },
});
