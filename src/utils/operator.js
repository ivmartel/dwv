// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};

/**
 * Check if the input is an object.
 * @param {Unknown} unknown The input to check.
 * @return {Boolean} True if the input is an object.
 * ref: https://github.com/jashkenas/underscore/blob/master/underscore.js#L1319-L1323
 */
dwv.utils.isObject = function (unknown) {
    var type = typeof unknown;
    return type === 'function' || type === 'object' && !!unknown;
};

/**
 * Merge two similar objects.
 * Objects need to be in the form of:
 * {idKey: {valueKey: 0}, key0: {valueKey: "abc"}, key1: {valueKey: 33}}
 * Merged objects will be in the form of:
 * { idKey: {valueKey: [0,1,2], merged: true},
 *   key0: {valueKey: {0: "abc", 1: "def", 2: "ghi"},
 *   key1: {valueKey: {0: 33, 1: 44, 2: 55}} }
 * @param {Object} obj1 The first object, can be the result of a previous merge.
 * @param {Object} obj2 The second object.
 * @param {String} idKey The key to use as index for duplicate values.
 * @param {String} valueKey The key to use to access object values.
 * @return {Object} The merged object.
 */
dwv.utils.mergeObjects = function (obj1, obj2, idKey, valueKey) {
    var res = {};
    // check id key
    if (!idKey) {
        throw new Error("Cannot merge object with an undefined id key: " + idKey);
    } else {
        if (!obj1.hasOwnProperty(idKey)) {
            throw new Error("Id key not found in first object while merging: " +
                idKey + ", obj: " + obj1);
        }
        if (!obj2.hasOwnProperty(idKey)) {
            throw new Error("Id key not found in second object while merging: " +
                idKey + ", obj: " + obj2);
        }
    }
    // check value key
    if (!valueKey) {
        throw new Error("Cannot merge object with an undefined value key: " + valueKey);
    }

    // check if merged object
    var mergedObj1 = false;
    if (obj1[idKey].hasOwnProperty("merged") && obj1[idKey].merged) {
        mergedObj1 = true;
    }
    // handle the id part
    if (!obj1[idKey].hasOwnProperty(valueKey)) {
        throw new Error("Id value not found in first object while merging: " +
            idKey + ", valueKey: " + valueKey + ", ojb: " + obj1);
    }
    if (!obj2[idKey].hasOwnProperty(valueKey)) {
        throw new Error("Id value not found in second object while merging: " +
            idKey + ", valueKey: " + valueKey + ", ojb: " + obj2);
    }
    var id1 = obj1[idKey][valueKey];
    var id2 = obj2[idKey][valueKey];
    // for merged object, id1 is an array
    if (mergedObj1) {
        // check if array does not include id2
        for ( var k = 0; k < id1.length; ++k ) {
            if (id1[k] === id2) {
                throw new Error("The first object already contains id2: " +
                    id2 + ", id1: " + id1);
            }
        }
        res[idKey] = obj1[idKey];
        res[idKey][valueKey].push(id2);
    } else {
        if (id1 === id2) {
            throw new Error("Cannot merge object with same ids: " +
                id1 + ", id2: " + id2);
        }
        // create merge object
        res[idKey] = {value: [id1, id2], merged: true};
    }

    // loop through object1
    var keys1 = Object.keys(obj1);
    for ( var i = 0, leni = keys1.length; i < leni; ++i ) {
        var key1 = keys1[i];
        if (key1 !== idKey) {
            var value1 = obj1[key1];
            // default result
            var value = value1;
            if (!value1.hasOwnProperty(valueKey)) {
                throw new Error("Value not found in first object while merging: " +
                    valueKey + ", value: " + value1);
            }
            var subValue1 = value1[valueKey];
            if (obj2.hasOwnProperty(key1)) {
                var value2 = obj2[key1];
                if (!value2.hasOwnProperty(valueKey)) {
                    throw new Error("Value not found in second object while merging: " +
                        valueKey + ", value: " + value2);
                }
                var subValue2 = value2[valueKey];
                // create merge object if different values
                if (subValue2 !== subValue1) {
                    // add to merged object or create new
                    if (mergedObj1) {
                        // merged object with repeated value
                        // copy it with the index list
                        if (!dwv.utils.isObject(subValue1)) {
                            value[valueKey] = {};
                            for (var j = 0; j < id1.length; j++) {
                                value[valueKey][id1[j]] = subValue1;
                            }
                        }
                        value[valueKey][id2] = subValue2;
                    } else {
                        // create merge object
                        var newValue = {};
                        newValue[id1] = subValue1;
                        newValue[id2] = subValue2;
                        value[valueKey] = newValue;
                    }
                }
            } else {
                throw new Error("Cannot find key1 in second object while merging.");
            }
            // store value in result object
            res[key1] = value;
        }
    }
    return res;
};
