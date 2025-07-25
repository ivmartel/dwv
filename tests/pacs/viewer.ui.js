import {Orientation} from '../../src/math/orientation.js';

/**
 * Get the layer groups div ids from the data view configs.
 *
 * @param {object} dataViewConfigs The configs.
 * @returns {string[]} The list of ids.
 */
export function getLayerGroupDivIds(dataViewConfigs) {
  const divIds = [];
  const keys = Object.keys(dataViewConfigs);
  for (let i = 0; i < keys.length; ++i) {
    const dataViewConfig = dataViewConfigs[keys[i]];
    for (let j = 0; j < dataViewConfig.length; ++j) {
      const divId = dataViewConfig[j].divId;
      if (!divIds.includes(divId)) {
        divIds.push(divId);
      }
    }
  }
  return divIds;
};

/**
 * Get a full view for a given div id.
 *
 * @param {string} layout The layout.
 * @param {string} divId The div id.
 * @returns {object} The config.
 */
export function getViewConfig(layout, divId) {
  const config = {divId: divId};
  if (layout === 'mpr') {
    if (divId === 'layerGroup0') {
      config.orientation = Orientation.Axial;
    } else if (divId === 'layerGroup1') {
      config.orientation = Orientation.Coronal;
    } else if (divId === 'layerGroup2') {
      config.orientation = Orientation.Sagittal;
    }
  }
  return config;
};

/**
 * Get a HTML id from a prefix and root part.
 *
 * @param {string} prefix The id prefix.
 * @param {string} root The root.
 * @returns {string} The HTML id.
 */
export function getHtmlId(prefix, root) {
  return prefix + root;
};

/**
 * Get the root part from an HTML id.
 *
 * @param {string} prefix The id prefix.
 * @param {string} htmlId The HTML id.
 * @returns {string} The root.
 */
export function getRootFromHtmlId(prefix, htmlId) {
  return htmlId.substring(prefix.length);
};

/**
 * Get a control div: label, range and number field.
 *
 * @param {string} id The control id.
 * @param {string} name The control name.
 * @param {number} min The control minimum value.
 * @param {number} max The control maximum value.
 * @param {number} value The control value.
 * @param {Function} callback The callback on control value change.
 * @param {number} precision Number field float precision.
 * @param {number} step The control step.
 * @returns {HTMLDivElement} The control div.
 */
export function getControlDiv(
  id,
  name,
  min,
  max,
  value,
  callback,
  precision,
  step) {
  const range = document.createElement('input');
  range.id = id + '-range';
  range.className = 'ctrl-range';
  range.type = 'range';
  range.min = min.toPrecision(precision);
  range.max = max.toPrecision(precision);
  if (typeof step !== 'undefined') {
    range.step = step;
  } else {
    range.step = ((max - min) * 0.01).toPrecision(precision);
  }
  range.value = value.toString();

  const label = document.createElement('label');
  label.id = id + '-label';
  label.className = 'ctrl-label';
  label.htmlFor = range.id;
  label.appendChild(document.createTextNode(name));

  const number = document.createElement('input');
  number.id = id + '-number';
  number.className = 'ctrl-number';
  number.type = 'number';
  number.min = range.min;
  number.max = range.max;
  number.step = range.step;
  number.value = value.toPrecision(precision);

  // callback and bind range and number
  number.oninput = function (event) {
    const element = event.target;
    range.value = element.value;
    callback(element.value);
  };
  range.oninput = function (event) {
    const element = event.target;
    number.value = parseFloat(element.value).toPrecision(precision);
    callback(element.value);
  };

  const div = document.createElement('div');
  div.id = id + '-ctrl';
  div.className = 'ctrl';
  div.appendChild(label);
  div.appendChild(range);
  div.appendChild(number);

  return div;
};
