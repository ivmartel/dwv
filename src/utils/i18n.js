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
    // defaut expects something like 'unit.cm2'
    const unit = {
      mm: 'mm',
      cm2: 'cm²',
      degree: '°'
    };
    const props = key.split('.');
    if (props.length !== 2) {
      throw new Error('Unexpected translation key length.');
    }
    if (props[0] !== 'unit') {
      throw new Error('Unexpected translation key prefix.');
    }
    return unit[props[1]];
  }

};
