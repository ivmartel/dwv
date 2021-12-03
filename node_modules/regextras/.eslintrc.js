'use strict';
module.exports = {
  extends: 'ash-nazg/sauron-node-overrides',
  settings: {
    polyfills: [
      'console',
      'document.body'
    ]
  },
  overrides: [{
    files: 'test/**.js',
    extends: [
      'plugin:chai-friendly/recommended',
      'plugin:chai-expect/recommended'
    ],
    env: {
      mocha: true
    },
    globals: {
      expect: true,
      assert: true
    },
    rules: {
      'node/no-unsupported-features/es-syntax': 0
    }
  }, {
    files: 'tests/**.js',
    rules: {
      'no-console': 0
    }
  }, {
    files: '*.md/*.js',
    globals: {
      require: false,
      RegExtras: false,
      condition: false,
      regex: false,
      str: false
    },
    rules: {
      'unicorn/no-array-callback-reference': 0,
      'node/no-unsupported-features/es-syntax': 0,
      'node/no-extraneous-require': ['error', {allowModules: ['regextras']}],
      'import/unambiguous': 0,
      'import/no-commonjs': 0,
      'import/no-extraneous-dependencies': 0,
      'import/no-unresolved': 0,
      'no-shadow': ['error', {allow: ['RegExtras']}],
      'no-unused-vars': ['error', {
        varsIgnorePattern: 'matches|RegExtras|piglatinArray',
        argsIgnorePattern: 'matches'
      }]
    }
  }],
  rules: {
    // Disable for now
    'prefer-named-capture-group': 0,
    'require-unicode-regexp': 0,
    'unicorn/prefer-spread': 0,
    'eslint-comments/require-description': 0
  }
};
