// Runs from the workspace root (see the `mutate` target): a sandbox of the
// project folder alone breaks the relative paths to tsconfig.base.json and
// to the root ESLint config used by the conformance spec.
export default {
  // Named explicitly: with pnpm, the default '@stryker-mutator/*' glob only
  // looks inside the core package's own folder and finds no plugins.
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],
  testRunner: 'vitest',
  // `related: false` so specs that import no source file (the lint
  // conformance spec) still run; with perTest coverage analysis each mutant
  // still runs only the tests that cover it.
  vitest: { configFile: 'libs/sim-engine/vitest.config.mts', related: false },
  checkers: ['typescript'],
  tsconfigFile: 'libs/sim-engine/tsconfig.lib.json',
  mutate: ['libs/sim-engine/src/**/*.ts', '!libs/sim-engine/src/**/*.spec.ts'],
  thresholds: { high: 90, low: 80, break: 80 },
  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: { fileName: 'reports/mutation/sim-engine.html' },
};
