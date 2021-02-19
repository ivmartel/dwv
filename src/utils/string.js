// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Capitalise the first letter of a string.
 *
 * @param {string} string The string to capitalise the first letter.
 * @returns {string} The new string.
 */
dwv.utils.capitaliseFirstLetter = function (string) {
  var res = string;
  if (string) {
    res = string.charAt(0).toUpperCase() + string.slice(1);
  }
  return res;
};

/**
 * Check if a string ends with the input element.
 *
 * @param {string} str The input string.
 * @param {string} end The searched ending.
 * @returns {boolean} True if the input string ends with the seached ending.
 */
dwv.utils.endsWith = function (str, end) {
  if (typeof str === 'undefined' || str === null ||
        typeof end === 'undefined' || end === null) {
    return false;
  }
  return str.substr(str.length - end.length) === end;
};

/**
 * Split key/value string:
 *  key0=val00&key0=val01&key1=val10 returns
 *  { key0 : [val00, val01], key1 : val1 }
 *
 * @param {string} inputStr The string to split.
 * @returns {object} The split string.
 */
dwv.utils.splitKeyValueString = function (inputStr) {
  // result
  var result = {};
  // check input string
  if (inputStr) {
    // split key/value pairs
    var pairs = inputStr.split('&');
    for (var i = 0; i < pairs.length; ++i) {
      var pair = pairs[i].split('=');
      // if the key does not exist, create it
      if (!result[pair[0]]) {
        result[pair[0]] = pair[1];
      } else {
        // make it an array
        if (!(result[pair[0]] instanceof Array)) {
          result[pair[0]] = [result[pair[0]]];
        }
        result[pair[0]].push(pair[1]);
      }
    }
  }
  return result;
};

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces.
 *
 * @param {string} inputStr The input string.
 * @param {object} values A object of {value, unit}.
 * @example
 *    var values = {"length": { "value": 33, "unit": "cm" } };
 *    var str = "The length is: {length}.";
 *    var res = dwv.utils.replaceFlags(str, values); // "The length is: 33 cm."
 * @returns {string} The result string.
 */
dwv.utils.replaceFlags = function (inputStr, values) {
  var res = '';
  // check input string
  if (inputStr === null || typeof inputStr === 'undefined') {
    return res;
  }
  res = inputStr;
  // check values
  if (values === null || typeof values === 'undefined') {
    return res;
  }
  // loop through values keys
  var keys = Object.keys(values);
  for (var i = 0; i < keys.length; ++i) {
    var valueObj = values[keys[i]];
    if (valueObj !== null && typeof valueObj !== 'undefined' &&
      valueObj.value !== null && typeof valueObj.value !== 'undefined') {
      // value string
      var valueStr = valueObj.value.toPrecision(4);
      // add unit if available
      // space or no space? Yes apart from degree...
      // check: https://en.wikipedia.org/wiki/Space_(punctuation)#Spaces_and_unit_symbols
      if (valueObj.unit !== null &&
        typeof valueObj.unit !== 'undefined' &&
        valueObj.unit.length !== 0) {
        if (valueObj.unit !== 'degree') {
          valueStr += ' ';
        }
        valueStr += valueObj.unit;
      }
      // flag to replace
      var flag = '{' + keys[i] + '}';
      // replace
      res = res.replace(flag, valueStr);
    }
  }
  // return
  return res;
};

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces.
 *
 * @param {string} inputStr The input string.
 * @param {Array} values An array of strings.
 * @example
 *    var values = ["a", "b"];
 *    var str = "The length is: {v0}. The size is: {v1}";
 *    var res = dwv.utils.replaceFlags2(str, values);
 *    // "The length is: a. The size is: b"
 * @returns {string} The result string.
 */
dwv.utils.replaceFlags2 = function (inputStr, values) {
  var res = inputStr;
  for (var j = 0; j < values.length; ++j) {
    res = res.replace('{v' + j + '}', values[j]);
  }
  return res;
};

dwv.utils.createDefaultReplaceFormat = function (values) {
  var res = '';
  for (var j = 0; j < values.length; ++j) {
    if (j !== 0) {
      res += ', ';
    }
    res += '{v' + j + '}';
  }
  return res;
};

/**
 * Get the root of an input path.
 * Splits using `/` as separator.
 *
 * @param {string} path The input path
 * @returns {string} The input path without its last part.
 */
dwv.utils.getRootPath = function (path) {
  return path.split('/').slice(0, -1).join('/');
};

/**
 * Get a file extension
 *
 * @param {string} filePath The file path containing the file name.
 * @returns {string} The lower case file extension or null for none.
 */
dwv.utils.getFileExtension = function (filePath) {
  var ext = null;
  if (typeof filePath !== 'undefined' && filePath) {
    var pathSplit = filePath.split('.');
    if (pathSplit.length !== 1) {
      ext = pathSplit.pop().toLowerCase();
    }
  }
  return ext;
};
