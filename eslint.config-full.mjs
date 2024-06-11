import eslintConfig from './eslint.config.mjs';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  ...eslintConfig,
  jsdoc.configs['flat/recommended-typescript-flavor'],
  {
    plugins: {
      jsdoc
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
      // tag lines
      // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/tag-lines.md#readme
      'jsdoc/tag-lines': ['error', 'any', {startLines: 1}],
      // require description complete sentence
      // https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-description-complete-sentence.md
      'jsdoc/require-description-complete-sentence': ['error']
    }
  }
];
