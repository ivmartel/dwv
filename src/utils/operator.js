import {arrayEquals} from './array';

/**
 * Merge two similar objects.
 *
 * Objects need to be in the form of:
 * <code>
 * {
 *   idKey: {valueKey: [0]},
 *   key0: {valueKey: ["abc"]},
 *   key1: {valueKey: [33]}
 * }
 * </code>.
 *
 * Merged objects will be in the form of:
 * <code>
 * {
 *   idKey: {valueKey: [0,1,2], merged: true},
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
 * @returns {object} The merged object.
 */
export function mergeObjects(obj1, obj2, idKey, valueKey) {
  const res = {};
  // check id key
  if (!idKey) {
    throw new Error('Cannot merge object with an undefined id key: ' + idKey);
  } else {
    if (!Object.prototype.hasOwnProperty.call(obj1, idKey)) {
      throw new Error('Id key not found in first object while merging: ' +
        idKey + ', obj: ' + obj1);
    }
    if (!Object.prototype.hasOwnProperty.call(obj2, idKey)) {
      throw new Error('Id key not found in second object while merging: ' +
        idKey + ', obj: ' + obj2);
    }
  }
  // check value key
  if (!valueKey) {
    throw new Error('Cannot merge object with an undefined value key: ' +
      valueKey);
  }

  // check if merged object
  let mergedObj1 = false;
  if (Object.prototype.hasOwnProperty.call(obj1[idKey], 'merged') &&
    obj1[idKey].merged) {
    mergedObj1 = true;
  }
  // handle the id part
  if (!Object.prototype.hasOwnProperty.call(obj1[idKey], valueKey)) {
    throw new Error('Id value not found in first object while merging: ' +
      idKey + ', valueKey: ' + valueKey + ', ojb: ' + obj1);
  }
  if (!Object.prototype.hasOwnProperty.call(obj2[idKey], valueKey)) {
    throw new Error('Id value not found in second object while merging: ' +
      idKey + ', valueKey: ' + valueKey + ', ojb: ' + obj2);
  }
  let id1 = obj1[idKey][valueKey];
  const id2 = obj2[idKey][valueKey][0];
  // update id key
  res[idKey] = obj1[idKey];
  if (mergedObj1) {
    // check if array does not include id2
    for (let k = 0; k < id1.length; ++k) {
      if (id1[k] === id2) {
        throw new Error('The first object already contains id2: ' +
          id2 + ', id1: ' + id1);
      }
    }
    res[idKey][valueKey].push(id2);
  } else {
    id1 = id1[0];
    if (id1 === id2) {
      throw new Error('Cannot merge object with same ids: ' +
        id1 + ', id2: ' + id2);
    }
    // update merge object
    res[idKey][valueKey].push(id2);
    res[idKey].merged = true;
  }

  // get keys
  const keys1 = Object.keys(obj1);
  // keys2 without duplicates of keys1
  const keys2 = Object.keys(obj2).filter(function (item) {
    return keys1.indexOf(item) < 0;
  });
  const keys = keys1.concat(keys2);

  // loop through keys
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if (key !== idKey) {
      // first
      let value1;
      let subValue1;
      if (Object.prototype.hasOwnProperty.call(obj1, key)) {
        value1 = obj1[key];
        if (Object.prototype.hasOwnProperty.call(value1, valueKey)) {
          subValue1 = value1[valueKey];
        }
      }
      // second
      let value2;
      let subValue2;
      if (Object.prototype.hasOwnProperty.call(obj2, key)) {
        value2 = obj2[key];
        if (Object.prototype.hasOwnProperty.call(value2, valueKey)) {
          subValue2 = value2[valueKey];
        }
      }
      // result value
      let value;
      // use existing to copy properties
      if (typeof value1 !== 'undefined') {
        value = value1;
      } else if (typeof value2 !== 'undefined') {
        value = value2;
      }
      // create merge object if different values
      if (!arrayEquals(subValue1, subValue2)) {
        // add to merged object or create new
        if (mergedObj1) {
          if (Array.isArray(subValue1)) {
            // merged object with repeated value
            // copy it with the index list
            value[valueKey] = {};
            for (let j = 0; j < id1.length; ++j) {
              value[valueKey][id1[j]] = subValue1;
            }
          } else {
            value[valueKey] = subValue1;
          }
          // add obj2 value
          value[valueKey][id2] = subValue2;
        } else {
          // create merge object
          const newValue = {};
          newValue[id1] = subValue1;
          newValue[id2] = subValue2;
          value[valueKey] = newValue;
        }
      }
      // store value in result object
      res[key] = value;
    }
  }
  return res;
}
