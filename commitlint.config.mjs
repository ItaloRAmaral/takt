export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'sim-engine',
        'plant-schema',
        'takt-web-app',
        'takt-core-api',
        'docs',
        'repo',
        'ci',
      ],
    ],
  },
};
