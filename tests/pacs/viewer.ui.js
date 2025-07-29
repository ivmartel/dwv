import {ViewConfig} from '../../src/app/application.js';

/**
 * Layout protocol class.
 */
export class LayoutProtocol {
  /**
   * @type {string}
   */
  #id;
  /**
   * @type {object[]}
   */
  #displaySets;

  /**
   * @param {object} config As
   *   {id, displaySets: [{divId, dataSelector, orientation}]}.
   */
  constructor(config) {
    this.#id = config.id;
    this.#displaySets = config.displaySets;
  }

  /**
   * Get the layout id.
   *
   * @returns {string} The id.
   */
  getId() {
    return this.#id;
  }

  /**
   * Get the layer groups div ids from this layout.
   *
   * @returns {string[]} The ids.
   */
  getLayerGroupDivIds() {
    const ids = [];
    for (const set of this.#displaySets) {
      const id = set.divId;
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Convert a display set into a view config.
   *
   * @param {object} set The display set.
   * @returns {ViewConfig} The view config.
   */
  #displaySetToViewConfig(set) {
    const config = new ViewConfig(set.divId);
    config.orientation = set.orientation;
    return config;
  }
  /**
   * Get the first view config for the given div id.
   *
   * @param {string} divId The div id.
   * @returns {ViewConfig} The config.
   */
  getViewConfigsByDivId(divId) {
    const set = this.#displaySets.find((elem) => elem.divId === divId);
    return this.#displaySetToViewConfig(set);
  }

  /**
   * Get the view configs for the given data id.
   *
   * @param {string} dataId The data id.
   * @returns {ViewConfig[]} The view configs.
   */
  getViewConfigsByDataId(dataId) {
    const sets =
      this.#displaySets.filter((elem) => elem.dataSelector(dataId));
    if (sets.length === 0) {
      console.warn('Data not selected for display: ' + dataId);
    }
    const res = [];
    for (const set of sets) {
      res.push(this.#displaySetToViewConfig(set));
    }
    return res;
  }

  /**
   * Get the data view configs for the given data ids.
   *
   * @param {string[]} dataIds The data id.
   * @returns {Object<string, ViewConfig[]>} The data view configs.
   */
  getDataViewConfigs(dataIds) {
    const res = {};
    for (const dataId of dataIds) {
      res[dataId] = this.getViewConfigsByDataId(dataId);
    }
    return res;
  }
}

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
