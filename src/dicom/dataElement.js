import {getTagFromKey} from './dicomTag.js';
import {getDicomTagInfo} from './dicomTagInfo.js';

/**
 * @import {Tag} from './dicomTag.js';
 */

/**
 * DICOM data element.
 */
export class DataElement {
  /**
   * The element Value Representation.
   *
   * @type {string}
   */
  vr;
  /**
   * The element value.
   *
   * @type {Array}
   */
  value;

  // [start] internal values
  // only present during parsing or writing otherwise not set

  /**
   * The element dicom tag.
   *
   * @type {Tag}
   */
  tag;

  /**
   * The element Value Length.
   *
   * @type {number}
   */
  vl;

  /**
   * Flag to know if defined or undefined sequence length.
   *
   * @type {boolean}
   */
  undefinedLength;

  /**
   * The element start offset.
   *
   * @type {number}
   */
  startOffset;

  /**
   * The element end offset.
   *
   * @type {number}
   */
  endOffset;

  /**
   * The sequence items.
   *
   * @type {Array}
   */
  items;

  // [end] internal values

  /**
   * @param {string} vr The element VR (Value Representation).
   */
  constructor(vr) {
    this.vr = vr;
  }
}

/**
 * Check an input data element, returns true if:
 * - the element is not undefined,
 * - the elements' value is not undefined,
 * - the elements' value has content.
 *
 * @param {DataElement} element The data element.
 * @returns {boolean} True if there is a value.
 */
function hasValue(element) {
  return typeof element !== 'undefined' &&
    typeof element.value !== 'undefined' &&
    element.value.length !== 0;
}

/**
 * Safely get an elements' first value from a list of elements.
 *
 * @param {Record<string, DataElement>} dataElements A list of data elements.
 * @param {string} key The tag key as for example '00100020'.
 * @returns {any|undefined} The elements' value or undefined.
 */
export function safeGet(dataElements, key) {
  let res;
  if (hasValue(dataElements[key])) {
    res = dataElements[key].value[0];
  }
  return res;
};

/**
 * Safely get all of an elements' values from a list of elements.
 *
 * @param {Record<string, DataElement>} dataElements A list of data elements.
 * @param {string} key The tag key as for example '00100020'.
 * @returns {any[]|undefined} The elements' values or undefined.
 */
export function safeGetAll(dataElements, key) {
  let res;
  if (hasValue(dataElements[key])) {
    res = dataElements[key].value;
  }
  return res;
};

/**
 * Check a DICOM data element: checks
 * - if the element is not undefined,
 * - if the elements' value is not undefined,
 * - if the elements' value is not empty,
 * - (optional) if the elements' values have specific values.
 *
 * @param {DataElement} element The element to check.
 * @param {string} name The element name.
 * @param {Array} [values] Optional list of expected values.
 * @returns {string} A warning if the element is not as expected.
 */
export function checkDataElement(element, name, values) {
  let warning = '';
  if (typeof element === 'undefined') {
    warning += ` ${name} is undefined,`;
  } else if (typeof element.value === 'undefined') {
    warning += ` ${name} has undefined value,`;
  } else if (element.value.length === 0) {
    warning += ` ${name} is empty,`;
  } else if (typeof values !== 'undefined') {
    for (let i = 0; i < values.length; ++i) {
      if (!element.value.includes(values[i])) {
        warning += ` ${name} does not contain ${ values[i]
        } (value: ${element.value}),`;
      }
    }
  }
  return warning;
}

/**
 * Get an array reducer to reduce an array of tag keys taken from
 *   the input dataElements and return as simple elements.
 *
 * @param {Record<string, DataElement>} dataElements The meta data
 *   index by tag keys.
 * @returns {any} An array reducer callbackFn.
 */
function getSimpleElementReducer(dataElements) {
  return function (accumulator, currentValue) {
    if (currentValue === 'mergeId') {
      return accumulator;
    }
    // get the tag name
    const tag = getTagFromKey(currentValue);
    const tagInfo = getDicomTagInfo(tag);
    let tagName = tagInfo?.getName();
    if (typeof tagName === 'undefined') {
      // add 'x' to list private at end
      tagName = `x${tag.getKey()}`;
    }
    const currentMeta = dataElements[currentValue];
    // remove undefined properties
    for (const property in currentMeta) {
      if (typeof currentMeta[property] === 'undefined') {
        delete currentMeta[property];
      }
    }
    let tagValue;
    // recurse for sequences
    if (currentMeta.vr === 'SQ') {
      tagValue = {value: []};
      // valid for 1D array, not for merged data elements
      for (let i = 0; i < currentMeta.value.length; ++i) {
        const item = currentMeta.value[i];
        tagValue.value.push(Object.keys(item).reduce(
          getSimpleElementReducer(item), {}));
      }
    } else if (currentMeta.value.length === 1) {
      tagValue = currentMeta.value[0];
    } else {
      tagValue = currentMeta.value;
    }
    accumulator[tagName] = tagValue;
    return accumulator;
  };
}

/**
 * Get the meta data as simple elements:
 * - indexed by tag names instead of tag keys,
 * - no element object, just value if not sequence nor merged item.
 *
 * @param {Record<string, DataElement>} metaData The meta data
 *   index by tag keys.
 * @returns {Record<string, any>} The simple elements.
 */
export function getAsSimpleElements(metaData) {
  const meta = structuredClone(metaData);
  return Object.keys(meta).reduce(getSimpleElementReducer(meta), {});
}
