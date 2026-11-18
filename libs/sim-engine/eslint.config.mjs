import { defineConfig } from 'eslint/config';
import baseConfig, { browserGlobals, noEnum } from '../../eslint.config.mjs';

const nondeterminism =
  'The engine must be deterministic: take time and randomness from the run input (ADR-0011).';

const forbiddenImportPaths = [
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
    message: 'The engine depends only on the plant schema types (ADR-0011).',
  },
];

const nondeterministicProperties = [
  { object: 'Math', property: 'random', message: nondeterminism },
  { object: 'Date', property: 'now', message: nondeterminism },
  { object: 'performance', property: 'now', message: nondeterminism },
];

const nondeterministicSyntax = [
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
];

const approximated =
  'Engines may give different bits for this: use log and exp from src/math, or a port with only the four operations (ADR-0014).';

// The Math functions the specification leaves "implementation-approximated".
const approximatedMathProperties = [
  'acos',
  'acosh',
  'asin',
  'asinh',
  'atan',
  'atanh',
  'atan2',
  'cbrt',
  'cos',
  'cosh',
  'exp',
  'expm1',
  'hypot',
  'log',
  'log1p',
  'log10',
  'log2',
  'pow',
  'sin',
  'sinh',
  'tan',
  'tanh',
].map((property) => ({ object: 'Math', property, message: approximated }));

const approximatedSyntax = [
  {
    selector: "BinaryExpression[operator='**']:not([left.bigint])",
    message: approximated,
  },
  {
    selector: "AssignmentExpression[operator='**=']",
    message: approximated,
  },
];

const forbiddenImportPatterns = [
  {
    group: ['@react-three/*'],
    message: 'The engine never imports React Three Fiber (ADR-0011).',
  },
];

// A rule set again in a later block replaces the earlier options, so the
// engine-code block repeats the lists above and adds its own: test helpers,
// approximated Math and ** on numbers, which specs and helpers may still use.
export default defineConfig(
  baseConfig,
  {
    rules: {
      'no-restricted-properties': ['error', ...nondeterministicProperties],
      'no-restricted-syntax': ['error', ...nondeterministicSyntax],
      'no-restricted-globals': ['error', ...browserGlobals],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { paths: forbiddenImportPaths, patterns: forbiddenImportPatterns },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/tests/**'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...nondeterministicProperties,
        ...approximatedMathProperties,
      ],
      'no-restricted-syntax': [
        'error',
        ...nondeterministicSyntax,
        ...approximatedSyntax,
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: forbiddenImportPaths,
          patterns: [
            ...forbiddenImportPatterns,
            {
              regex: '(^|/)tests/',
              message:
                'Test helpers are for specs only: they stay out of the build and of mutation.',
            },
          ],
        },
      ],
    },
  },
  {
    // The D4 measurement runs outside the engine, in Node and in browsers, and
    // reads the browser's user agent.
    files: ['measurements/**/*.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
);
