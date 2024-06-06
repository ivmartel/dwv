module.exports = {
  plugins: [
    'jsdoc'
  ],
  extends: [
    '.eslintrc.js',
    'plugin:jsdoc/recommended-typescript-flavor',
  ],
  rules: {
    // tag lines
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/tag-lines.md
    'jsdoc/tag-lines': ['error', 'any', {'startLines': 1}],
    // require description complete sentence
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-description-complete-sentence.md
    'jsdoc/require-description-complete-sentence': ['error']
  }
};
