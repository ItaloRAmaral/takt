import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// The same computation in Node and in each browser engine, each writing its
// own bits.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/sim-engine-measure',
  test: {
    watch: false,
    globals: true,
    reporters: ['default'],
    testTimeout: 300_000,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['measurements/**/*.node.measure.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['measurements/**/*.browser.measure.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
              { browser: 'firefox' },
              { browser: 'webkit' },
            ],
          },
        },
      },
    ],
  },
});
