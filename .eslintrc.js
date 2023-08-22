module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    sourceType: 'module'
  },
  settings: {
    jsdoc: {
      // 1. jsdoc gives an error for index signatures as type:
      // {[key: string]: {red: number[], green: number[], blue: number[]}}
      // -> ERROR: Unable to parse a tag's type expression for source file ...
      //    Invalid type expression
      // 2. in typescript mode, eslint/jsdoc 'check-types'
      // gives a warning when using: Object<>
      // -> Use object shorthand or index signatures instead of `Object`,
      //    e.g., `{[key: string]: string}`
      // => adding Object to preferredTypes removes the warning
      preferredTypes: {
        Object: 'Object'
      }
    }
  },
  rules: {
    // require triple equal
    // https://eslint.org/docs/rules/eqeqeq
    eqeqeq: 'error',
    // force semi colon
    // https://eslint.org/docs/rules/semi
    semi: ['error'],
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

    // force 2 space indent (default: 4)
    // https://eslint.org/docs/rules/indent
    indent: ['error', 2],
    // force single quotes (default 'double')
    // https://eslint.org/docs/rules/quotes
    quotes: ['error', 'single'],
    // no space for named functions (default 'always')
    // https://eslint.org/docs/rules/space-before-function-paren
    'space-before-function-paren': ['error', {named: 'never'}],
    // newline at object curly
    // https://eslint.org/docs/rules/object-curly-newline
    'object-curly-newline': ['error', {consistent: true}],
    // newline at object properties
    // https://eslint.org/docs/rules/object-property-newline
    'object-property-newline': [
      'error', {allowAllPropertiesOnSameLine: true}
    ],
    // newline at array brackets
    // https://eslint.org/docs/rules/array-bracket-newline
    'array-bracket-newline': ['error', 'consistent'],
    // newline at array elements (default: always)
    // https://eslint.org/docs/rules/array-element-newline
    'array-element-newline': ['error', 'consistent'],
    // force using curly braces
    // https://eslint.org/docs/rules/curly
    curly: 'error',
    // force 'one true brace style' (1tbs)
    // https://eslint.org/docs/rules/brace-style
    'brace-style': 'error',
    // give error for long lines (default: 80)
    // https://eslint.org/docs/rules/max-len
    'max-len': ['error',
      {ignoreRegExpLiterals: true, ignoreUrls: true}],
    // spaces in parenthesis (default: never)
    // https://eslint.org/docs/rules/space-in-parens
    'space-in-parens': 'error',
    // space before blocks
    // https://eslint.org/docs/rules/space-before-blocks
    'space-before-blocks': 'error',
    // spaces inside brackets (default: never)
    // https://eslint.org/docs/rules/array-bracket-spacing
    'array-bracket-spacing': 'error',
    // spaces in curly (default: never)
    // https://eslint.org/docs/rules/object-curly-spacing
    'object-curly-spacing': 'error',
    // no space in computed properties (default: never)
    // https://eslint.org/docs/rules/computed-property-spacing
    'computed-property-spacing': 'error',
    // spaces around comma (default: {"before": false, "after": true})
    // https://eslint.org/docs/rules/comma-spacing
    'comma-spacing': 'error',
    // space around unary operator
    // https://eslint.org/docs/rules/space-unary-ops
    'space-unary-ops': 'error',
    // space around operator
    // https://eslint.org/docs/rules/space-infix-ops
    'space-infix-ops': 'error',
    // space around keywords (default: {'before': true, 'after': true})
    // https://eslint.org/docs/rules/keyword-spacing
    'keyword-spacing': 'error',
    // no space before function call (default: never)
    // https://eslint.org/docs/rules/func-call-spacing
    'func-call-spacing': 'error',
    // spacing around colon
    // (default: {'beforeColon': false, 'afterColon': true})
    // https://eslint.org/docs/rules/key-spacing
    'key-spacing': 'error',
    // spacing around semi-colon
    // https://eslint.org/docs/rules/semi-spacing
    'semi-spacing': 'error',
    // no trailing spaces
    // https://eslint.org/docs/rules/no-trailing-spaces
    'no-trailing-spaces': 'error',
    // no multi spaces
    // https://eslint.org/docs/rules/no-multi-spaces
    'no-multi-spaces': 'error',
    // no space for named functions (default {'max': 2})
    // https://eslint.org/docs/rules/no-multiple-empty-lines
    'no-multiple-empty-lines': 'error',
    // linebreak after operator
    // https://eslint.org/docs/rules/operator-linebreak
    'operator-linebreak': 'error',
    // quotes around object property names
    // https://eslint.org/docs/rules/quote-props
    'quote-props': ['error', 'as-needed']
  }
};
