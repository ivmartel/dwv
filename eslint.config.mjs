import globals from 'globals';
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      // require triple equal
      // https://eslint.org/docs/rules/eqeqeq
      eqeqeq: 'error',
      // force using curly braces
      // https://eslint.org/docs/rules/curly
      curly: 'error',
      // no var
      // https://eslint.org/docs/rules/no-var
      'no-var': 'error',
      // prefer const
      // https://eslint.org/docs/rules/prefer-const
      'prefer-const': 'error',
      // allow for some unused args
      // https://eslint.org/docs/rules/no-unused-vars
      'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],

      // formatting rules

      // force semi colon
      // https://eslint.style/rules/js/semi
      '@stylistic/js/semi': ['error'],
      // force 2 space indent (default: 4)
      // https://eslint.style/rules/js/indent
      '@stylistic/js/indent': ['error', 2],
      // force single quotes (default 'double')
      // https://eslint.style/rules/js/quotes
      '@stylistic/js/quotes': ['error', 'single'],
      // no space for named functions (default 'always')
      // https://eslint.style/rules/js/space-before-function-paren
      '@stylistic/js/space-before-function-paren': ['error', {named: 'never'}],
      // newline at object curly
      // https://eslint.style/rules/js/object-curly-newline
      '@stylistic/js/object-curly-newline': ['error', {consistent: true}],
      // newline at object properties
      // https://eslint.style/rules/js/object-property-newline
      '@stylistic/js/object-property-newline': [
        'error', {allowAllPropertiesOnSameLine: true}
      ],
      // newline at array brackets
      // https://eslint.style/rules/js/array-bracket-newline
      '@stylistic/js/array-bracket-newline': ['error', 'consistent'],
      // newline at array elements (default: always)
      // https://eslint.style/rules/js/array-element-newline
      '@stylistic/js/array-element-newline': ['error', 'consistent'],
      // force 'one true brace style' (1tbs)
      // https://eslint.style/rules/js/brace-style
      '@stylistic/js/brace-style': 'error',
      // give error for long lines (default: 80)
      // https://eslint.style/rules/js/max-len
      '@stylistic/js/max-len': [
        'error', {ignoreRegExpLiterals: true, ignoreUrls: true}
      ],
      // spaces in parenthesis (default: never)
      // https://eslint.style/rules/js/space-in-parens
      '@stylistic/js/space-in-parens': 'error',
      // space before blocks
      // https://eslint.style/rules/js/space-before-blocks
      '@stylistic/js/space-before-blocks': 'error',
      // spaces inside brackets (default: never)
      // https://eslint.style/rules/js/array-bracket-spacing
      '@stylistic/js/array-bracket-spacing': 'error',
      // spaces in curly (default: never)
      // https://eslint.style/rules/js/object-curly-spacing
      '@stylistic/js/object-curly-spacing': 'error',
      // no space in computed properties (default: never)
      // https://eslint.style/rules/js/computed-property-spacing
      '@stylistic/js/computed-property-spacing': 'error',
      // spaces around comma (default: {"before": false, "after": true})
      // https://eslint.style/rules/js/comma-spacing
      '@stylistic/js/comma-spacing': 'error',
      // space around unary operator
      // https://eslint.style/rules/js/space-unary-ops
      '@stylistic/js/space-unary-ops': 'error',
      // space around operator
      // https://eslint.style/rules/js/space-infix-ops
      '@stylistic/js/space-infix-ops': 'error',
      // space around keywords (default: {'before': true, 'after': true})
      // https://eslint.style/rules/js/keyword-spacing
      '@stylistic/js/keyword-spacing': 'error',
      // no space before function call (default: never)
      // https://eslint.style/rules/js/function-call-spacing
      '@stylistic/js/func-call-spacing': 'error',
      // spacing around colon
      // (default: {'beforeColon': false, 'afterColon': true})
      // https://eslint.style/rules/js/key-spacing
      '@stylistic/js/key-spacing': 'error',
      // spacing around semi-colon
      // https://eslint.style/rules/js/semi-spacing
      '@stylistic/js/semi-spacing': 'error',
      // no trailing spaces
      // https://eslint.style/rules/js/no-trailing-spaces
      '@stylistic/js/no-trailing-spaces': 'error',
      // no multi spaces
      // https://eslint.style/rules/js/no-multi-spaces
      '@stylistic/js/no-multi-spaces': 'error',
      // no space for named functions (default {'max': 2})
      // https://eslint.style/rules/js/no-multiple-empty-lines
      '@stylistic/js/no-multiple-empty-lines': 'error',
      // linebreak after operator
      // https://eslint.style/rules/js/operator-linebreak
      '@stylistic/js/operator-linebreak': 'error',
      // quotes around object property names
      // https://eslint.style/rules/js/quote-props
      '@stylistic/js/quote-props': ['error', 'as-needed']
    },
  }
];