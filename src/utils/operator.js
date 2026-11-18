import {arrayEquals} from './array.js';

/**
 * Merge two similar objects.
 *
 * Objects need to be in the form of:
 * <code>
 * {
 *   idKey: {valueKey: ['0']},
 *   key0: {valueKey: ["abc"]},
 *   key1: {valueKey: [33]}
 * }
 * </code>.
 *
 * Merged objects will be in the form of:
 * <code>
 * {
 *   mergeId: ['0','1','2'],
 *   idKey: {valueKey: {
 *     0: ['0'],
 *     1: ['1'],
 *     2: ['2']
 *   }},
 *   key0: {valueKey: {
 *     0: ["abc"],
 *     1: ["def"],
 *     2: ["ghi"]
 *   }},
 *   key1: {valueKey: {
 *     0: [33],
 *     1: [44],
 *     2: [55]
 *   }}
 * }
 * </code>.
 *
 * @param {object} obj1 The first object, can be the result of a previous merge.
 * @param {object} obj2 The second object.
 * @param {string} idKey The key to use as index for duplicate values.
 * @param {string} valueKey The key to use to access object values.
 * @param {Function} [secondIdGetter] Function `(obj) => number|undefined`
 * called on each raw (not yet merged) object to get its second id, added
 * as a suffix to its base id to disambiguate objects that would
 * otherwise share the same base id (to differentiate time points for
 * example). Defaults to no second id.
 * @returns {object} The merged object.
 */
export function mergeObjects(
  obj1, obj2, idKey, valueKey, secondIdGetter = () => undefined) {
  const res = {};
  // check id key
  if (!idKey) {
    throw new Error(`Cannot merge object with an undefined id key: ${idKey}`);
  }
  if (obj1[idKey] === undefined) {
    throw new Error(`Id key not found in first object while merging: ${
      idKey }, obj: ${obj1}`);
  }
  if (obj2[idKey] === undefined) {
    throw new Error(`Id key not found in second object while merging: ${
      idKey }, obj: ${obj2}`);
  }
  // check value key
  if (!valueKey) {
    throw new Error(`Cannot merge object with an undefined value key: ${
      valueKey }`);
  }
  if (obj1[idKey][valueKey] === undefined) {
    throw new Error(`Id value not found in first object while merging: ${
      idKey }, valueKey: ${valueKey}, ojb: ${obj1}`);
  }
  if (obj2[idKey][valueKey] === undefined) {
    throw new Error(`Id value not found in second object while merging: ${
      idKey }, valueKey: ${valueKey}, ojb: ${obj2}`);
  }

  // check if obj1 is already a merged object
  const isMergedObj1 = obj1.mergeId !== undefined;

  // format the id suffix from the second id, no suffix if undefined
  const getIdSuffix = function (obj) {
    const secondId = secondIdGetter(obj);
    return typeof secondId !== 'undefined' ? `-${secondId}` : '';
  };

  // create the id for obj2: its own base value plus its own suffix
  const id2 = obj2[idKey][valueKey][0] + getIdSuffix(obj2);

  // build mergeId: the list of ids used as value-dict keys
  let id1;
  if (isMergedObj1) {
    // check if id2 is not in mergeId
    if (obj1.mergeId.includes(id2)) {
      throw new Error(`The first object already contains id2: ${
        id2 }, id1: ${obj1.mergeId}`);
    }
    id1 = obj1.mergeId;
    res.mergeId = [...obj1.mergeId, id2];
  } else {
    // create the id for obj1: its own base value plus its own suffix
    id1 = obj1[idKey][valueKey][0] + getIdSuffix(obj1);
    // check for id equality
    if (id1 === id2) {
      throw new Error(`Cannot merge object with same ids: ${
        id1 }, id2: ${id2}`);
    }
    res.mergeId = [id1, id2];
  }

  // get keys (excluding 'mergeId' which is built separately), no duplicates
  const keys1 = Object.keys(obj1).filter(k => k !== 'mergeId');
  const keys = [...new Set([...keys1, ...Object.keys(obj2)])];

  // loop through keys
  for (const key of keys) {
    // first
    const value1 = obj1[key];
    let subValue1;
    if (value1 !== undefined) {
      subValue1 = value1[valueKey];
    }
    // second
    const value2 = obj2[key];
    let subValue2;
    if (value2 !== undefined) {
      subValue2 = value2[valueKey];
    }
    // result value (own copy to avoid mutating input objects)
    let value;
    if (value1 !== undefined) {
      value = {...value1};
    } else if (value2 !== undefined) {
      value = {...value2};
    }
    // create merge object if different values
    if (!arrayEquals(subValue1, subValue2)) {
      // add to merged object or create new
      if (isMergedObj1) {
        if (Array.isArray(subValue1)) {
          // repeated value: expand to dict with all existing ids
          value[valueKey] = {};
          for (let j = 0; j < id1.length; ++j) {
            value[valueKey][id1[j]] = subValue1;
          }
        } else {
          value[valueKey] = {...subValue1};
        }
        // add obj2 value
        value[valueKey][id2] = subValue2;
      } else {
        value[valueKey] = {
          [id1]: subValue1,
          [id2]: subValue2
        };
      }
    }
    // store value in result object
    res[key] = value;
  }
  return res;
}
