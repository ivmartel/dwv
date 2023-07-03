// linting 'type {Object.<bla, bla>}' will give:
// warning  Use object shorthand or index signatures instead of `Object`,
//   e.g., `{[key: string]: string}` jsdoc/check-types
// pb: jsdoc does not support the object shorthand
//   and ignoring will give vscode warning since the doc linting is not
//   activated by default.

// Overridable default object.
export const defaults = {
  /**
   * List of default window level presets.
   *
   * @type {Object.<string, Object.<string, string>>}
   */
  labelText: {
    arrow: {
      '*': ''
    },
    circle: {
      '*': '{surface}'
    },
    ellipse: {
      '*': '{surface}'
    },
    freeHand: {
      '*': ''
    },
    protractor: {
      '*': '{angle}'
    },
    rectangle: {
      '*': '{surface}'
    },
    roi: {
      '*': ''
    },
    ruler: {
      '*': '{length}'
    }
  }
};
