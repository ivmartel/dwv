import {getTagFromKey} from './dicomTag.js';
import {
  getDicomTagInfo,
  getTagFromDictionary,
} from './dicomTagInfo.js';
import {DataElement} from './dataElement.js';
import {logger} from '../utils/logger.js';

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

/**
 * Get the DICOM elements from a 'simple' DICOM tags object.
 * The input object is a simplified version of the oficial DICOM json with
 * tag names instead of keys and direct values (no value property) for
 * simple tags. See synthetic test data (in tests/dicom) for examples.
 *
 * @param {Record<string, any>} simpleTags The 'simple' DICOM
 *   tags object.
 * @returns {Record<string, DataElement>} The DICOM elements.
 */
export function getElementsFromJSONTags(simpleTags) {
  const keys = Object.keys(simpleTags);
  const dataElements = {};
  for (const key of keys) {
    // get the DICOM element definition from its name
    const tag = getTagFromDictionary(key);
    if (typeof tag === 'undefined') {
      continue;
    }
    const tagInfo = getDicomTagInfo(tag);
    const vr = tagInfo?.getVr();
    // tag value
    let value;
    let undefinedLength = false;
    const simpleTag = simpleTags[key];
    if (vr === 'SQ') {
      const items = [];
      if (typeof simpleTag.undefinedLength !== 'undefined') {
        undefinedLength = simpleTag.undefinedLength;
      }
      if (Array.isArray(simpleTag.value)) {
        for (const item of simpleTag.value) {
          items.push(getElementsFromJSONTags(item));
        }
      } else {
        logger.debug('Non array simpleTag SQ value');
      }
      value = items;
    } else if (Array.isArray(simpleTag)) {
      value = simpleTag;
    } else {
      value = [simpleTag];
    }
    // create element
    const dataElement = new DataElement(vr);
    dataElement.tag = tag;
    dataElement.value = value;
    if (undefinedLength) {
      dataElement.undefinedLength = undefinedLength;
    }
    // store
    dataElements[tag.getKey()] = dataElement;
  }
  // return
  // @ts-expect-error
  return dataElements;
}