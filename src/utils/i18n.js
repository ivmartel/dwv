/**
 * Namespace for translation function
 *   (in a namespace to allow for override from client).
 */
export const i18n = {

  /**
   * Get the translated text.
   *
   * @param {string} key The key to the text entry.
   * @returns {string|undefined} The translated text.
   */
  t(key) {
    let res = key;
    const props = key.split('.');
    // default units look like 'unit.cm2'
    if (props.length === 2 &&
      props[0] === 'unit') {
      const units = {
        mm: 'mm',
        cm2: 'cm²',
        ml: 'ml',
        degree: '°',
        pixel: 'pixels'
      };
      res = units[props[1]];
    }
    return res;
  }

};
