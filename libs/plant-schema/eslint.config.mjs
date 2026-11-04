import { defineConfig } from 'eslint/config';
import baseConfig, { browserGlobals } from '../../eslint.config.mjs';

export default defineConfig(baseConfig, {
  rules: {
    'no-restricted-globals': ['error', ...browserGlobals],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@takt/sim-engine',
            message: 'The plant schema never depends on the engine (ADR-0001).',
          },
        ],
      },
    ],
  },
});
