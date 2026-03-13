import globals from 'globals';
import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin';

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
      // disallow implicit type conversions
      // https://eslint.org/docs/rules/no-implicit-coercion
      'no-implicit-coercion': 'error',
      // require parseInt radix argument
      // https://eslint.org/docs/rules/radix
      radix: 'error',
      // throw Error objects, not literals
      // https://eslint.org/docs/rules/no-throw-literal
      'no-throw-literal': 'error',
      // require default case in switch statements
      // https://eslint.org/docs/rules/default-case
      'default-case': 'error',
      // enforce default clauses to be last
      // https://eslint.org/docs/rules/default-case-last
      'default-case-last': 'error',
      // disallow unnecessary return statements
      // https://eslint.org/docs/rules/no-useless-return
      'no-useless-return': 'error',
      // disallow loops that can never iterate more than once
      // https://eslint.org/docs/rules/no-unreachable-loop
      'no-unreachable-loop': 'error',
      // allow for some unused args
      // https://eslint.org/docs/rules/no-unused-vars
      'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],

      // TODO activate
      // enforce consistent return values from functions
      // https://eslint.org/docs/rules/consistent-return
      //'consistent-return': 'error',

      // code quality / correctness

      // disallow reassigning function parameters
      // -> used when param in undefined
      // https://eslint.org/docs/rules/no-param-reassign
      //'no-param-reassign': 'warn',
      // disallow variable declarations that shadow outer scope variables
      // https://eslint.org/docs/rules/no-shadow
      'no-shadow': 'error',
      // disallow returning from Promise executors
      // https://eslint.org/docs/rules/no-promise-executor-return
      'no-promise-executor-return': 'error',
      // disallow await inside loops
      // https://eslint.org/docs/rules/no-await-in-loop
      'no-await-in-loop': 'error',
      // disallow useless string concatenation
      // https://eslint.org/docs/rules/no-useless-concat
      'no-useless-concat': 'error',

      // modern js idioms

      // prefer template literals over string concatenation
      // https://eslint.org/docs/rules/prefer-template
      'prefer-template': 'error',
      // require object literal shorthand syntax
      // https://eslint.org/docs/rules/object-shorthand
      'object-shorthand': 'error',
      // prefer rest params over arguments
      // https://eslint.org/docs/rules/prefer-rest-params
      'prefer-rest-params': 'error',
      // prefer spread over Function.prototype.apply
      // https://eslint.org/docs/rules/prefer-spread
      'prefer-spread': 'error',
      // require dot notation when possible
      // https://eslint.org/docs/rules/dot-notation
      'dot-notation': 'error',

      // flow clarity

      // disallow else after a return
      // https://eslint.org/docs/rules/no-else-return
      'no-else-return': 'error',
      // disallow if as the only statement in an else block
      // https://eslint.org/docs/rules/no-lonely-if
      'no-lonely-if': 'error',
      // disallow yoda conditions
      // https://eslint.org/docs/rules/yoda
      yoda: 'warn',

      // formatting rules

      // force semi colon
      // https://eslint.style/rules/js/semi
      '@stylistic/js/semi': ['error'],
      // force 2 space indent (default: 4)
      // https://eslint.style/rules/js/indent
      '@stylistic/js/indent': ['error', 2],
      // https://eslint.style/rules/js/indent-binary-ops
      '@stylistic/js/indent-binary-ops': ['error', 2],
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
      // one statement per line
      // https://eslint.style/rules/js/max-statements-per-line
      '@stylistic/js/max-statements-per-line': ['error', {max: 1}],
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
      '@stylistic/js/function-call-spacing': 'error',
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
      // disallow multiple consecutive empty lines (default {'max': 2})
      // https://eslint.style/rules/js/no-multiple-empty-lines
      '@stylistic/js/no-multiple-empty-lines': 'error',
      // linebreak after operator
      // https://eslint.style/rules/js/operator-linebreak
      '@stylistic/js/operator-linebreak': 'error',
      // quotes around object property names
      // https://eslint.style/rules/js/quote-props
      '@stylistic/js/quote-props': ['error', 'as-needed'],
      // disallow leading/trailing decimal points in numeric literals
      // https://eslint.style/rules/js/no-floating-decimal
      '@stylistic/js/no-floating-decimal': 'warn'
    },
  }
];