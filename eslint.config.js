const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['eslint.config.js', 'src/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      complexity: ['warn', 10],
      'max-depth': ['warn', 3],
      'max-params': ['warn', 4],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        bootstrap: 'readonly',
        mostrarAlerta: 'readonly',
      },
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      complexity: ['warn', 10],
      'max-depth': ['warn', 3],
      'max-params': ['warn', 4],
    },
  },
];