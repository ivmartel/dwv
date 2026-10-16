import {i18n} from '../../src/utils/i18n.js';

/**
 * Quantification keys related to pixel values, other keys are
 *   considered as geometric (lowercase, compared case insensitive).
 */
const pixelValueKeys = [
  'min', 'max', 'mean', 'stddev', 'median', 'p25', 'p75'
];

/**
 * Specific quantification labels, others use the general rule
 *   of `getQuantificationLabel` (lowercase keys, compared case insensitive).
 */
const quantificationLabels = {
  stddev: 'standard deviation',
  surface: 'area'
};

/**
 * Get a readable label for a quantification key.
 *
 * @param {string} key The quantification key.
 * @returns {string} The label.
 */
function getQuantificationLabel(key) {
  const specific = quantificationLabels[key.toLowerCase()];
  if (typeof specific !== 'undefined') {
    return specific;
  }
  // percentile: 'p25' -> '25th percentile'
  const percentile = key.match(/^p(\d+)$/);
  if (percentile !== null) {
    return `${percentile[1]}th percentile`;
  }
  // general rule: 'someKey' -> 'some key'
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

/**
 * Format a quantification value with its unit.
 *
 * @param {number} value The value.
 * @param {string} [unit] The unit (translation key).
 * @returns {string} The formatted value.
 */
function formatQuantificationValue(value, unit) {
  const absValue = Math.abs(value);
  let digits = 2;
  if (absValue >= 100) {
    digits = 1;
  } else if (absValue !== 0 && absValue < 1) {
    digits = 3;
  }
  let res = value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  if (typeof unit !== 'undefined') {
    let unitStr = i18n.t(unit);
    if (typeof unitStr === 'undefined') {
      unitStr = unit;
    }
    // no space before degree symbol
    res += unitStr === '°' ? unitStr : ` ${unitStr}`;
  }
  return res;
}

/**
 * Quantification group: a title and label/value pairs.
 *
 * @typedef {object} QuantificationGroup
 * @property {string} title The group title.
 * @property {{label: string, value: string}[]} items The group items.
 */

/**
 * Get the quantification as groups of label and value pairs.
 *
 * @param {Record<string, object>|undefined} quantification The
 *   quantification.
 * @param {object} [titles] Optional group titles.
 * @param {string} [titles.geometry] The geometry group title.
 * @param {string} [titles.pixelValues] The pixel values group title.
 * @returns {QuantificationGroup[]} The non empty groups, empty if
 *   no quantification.
 */
export function getQuantificationGroups(quantification, titles) {
  if (typeof quantification === 'undefined') {
    return [];
  }
  const geometry = {
    title: titles?.geometry ?? 'Geometry',
    items: []
  };
  const pixelValues = {
    title: titles?.pixelValues ?? 'Pixel values',
    items: []
  };
  for (const key of Object.keys(quantification)) {
    const quant = quantification[key];
    // skip undefined values (for ex surface on non calibrated data)
    if (typeof quant === 'undefined' ||
      typeof quant.value !== 'number') {
      continue;
    }
    const item = {
      label: getQuantificationLabel(key),
      value: formatQuantificationValue(quant.value, quant.unit)
    };
    if (pixelValueKeys.includes(key.toLowerCase())) {
      pixelValues.items.push(item);
    } else {
      geometry.items.push(item);
    }
  }
  return [geometry, pixelValues].filter(group => group.items.length !== 0);
}

/**
 * Render quantification groups in a details element.
 *
 * @param {HTMLDivElement} detailsDiv The details element.
 * @param {QuantificationGroup[]} groups The quantification groups.
 */
export function renderQuantification(detailsDiv, groups) {
  if (groups.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'quantification-empty';
    emptyDiv.appendChild(document.createTextNode('No quantification.'));
    detailsDiv.replaceChildren(emptyDiv);
    return;
  }
  const elements = [];
  for (const group of groups) {
    const title = document.createElement('div');
    title.className = 'quantification-title';
    title.appendChild(document.createTextNode(group.title));
    const list = document.createElement('dl');
    list.className = 'quantification';
    for (const item of group.items) {
      const term = document.createElement('dt');
      term.appendChild(document.createTextNode(item.label));
      const value = document.createElement('dd');
      value.appendChild(document.createTextNode(item.value));
      // wrap pair to allow several per line
      const pair = document.createElement('div');
      pair.appendChild(term);
      pair.appendChild(value);
      list.appendChild(pair);
    }
    const groupDiv = document.createElement('div');
    groupDiv.className = 'quantification-group';
    groupDiv.appendChild(title);
    groupDiv.appendChild(list);
    elements.push(groupDiv);
  }
  detailsDiv.replaceChildren(...elements);
}
