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
