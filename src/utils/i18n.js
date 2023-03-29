/**
 * Get the translated text.
 *
 * @param {string} key The key to the text entry.
 * @param {object} _options The translation options such as plural, context...
 * @returns {string|undefined} The translated text.
 */
export function i18n(key, _options) {
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
