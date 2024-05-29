/**
 * Capitalise the first letter of a string.
 *
 * @param {string} string The string to capitalise the first letter.
 * @returns {string} The new string.
 */
export function capitaliseFirstLetter(string) {
  let res = string;
  if (string) {
    res = string.charAt(0).toUpperCase() + string.slice(1);
  }
  return res;
}

/**
 * Check if a string starts with the input element.
 *
 * @param {string} str The input string.
 * @param {string} search The searched start.
 * @param {number} [rawPos] The position in this string at which to begin
 *  searching for searchString. Defaults to 0.
 * @returns {boolean} True if the input string starts with the searched string.
 */
export function startsWith(str, search, rawPos) {
  if (typeof str === 'undefined' || str === null ||
    typeof search === 'undefined' || search === null) {
    return false;
  }
  const pos = rawPos > 0 ? rawPos | 0 : 0;
  return str.substring(pos, pos + search.length) === search;
}

/**
 * Check if a string ends with the input element.
 *
 * @param {string} str The input string.
 * @param {string} search The searched ending.
 * @returns {boolean} True if the input string ends with the searched string.
 */
export function endsWith(str, search) {
  if (typeof str === 'undefined' || str === null ||
    typeof search === 'undefined' || search === null) {
    return false;
  }
  return str.substring(str.length - search.length) === search;
}

/**
 * Split key/value string: `key0=val00&key0=val01&key1=val10
 *   will return `{key0 : [val00, val01], key1 : val1}`.
 *
 * @param {string} inputStr The string to split.
 * @returns {object} The split string.
 */
export function splitKeyValueString(inputStr) {
  // result
  const result = {};
  // check input string
  if (inputStr) {
    // split key/value pairs
    const pairs = inputStr.split('&');
    for (let i = 0; i < pairs.length; ++i) {
      const pair = pairs[i].split('=');
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
}

/**
 * Get flags from an input string. Flags are words surrounded with curly
 * braces.
 *
 * @param {string} inputStr The input string.
 * @returns {string[]} An array of found flags.
 */
export function getFlags(inputStr) {
  const flags = [];
  // check input string
  if (inputStr === null || typeof inputStr === 'undefined') {
    return flags;
  }

  // word surrounded by curly braces
  const regex = /{(\w+)}/g;

  let match = regex.exec(inputStr);
  while (match) {
    flags.push(match[1]); // first matching group
    match = regex.exec(inputStr);
  }
  return flags;
}

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces.
 *
 * @param {string} inputStr The input string.
 * @param {object} values A object of {value, unit}.
 * @returns {string} The result string.
 */
export function replaceFlags(inputStr, values) {
  let res = '';
  // check input string
  if (inputStr === null || typeof inputStr === 'undefined') {
    return res;
  }
  res = inputStr;
  // check values
  if (values === null || typeof values === 'undefined') {
    return res;
  }

  // loop through flags
  const keys = getFlags(inputStr);
  for (let i = 0; i < keys.length; ++i) {
    const valueObj = values[keys[i]];
    if (valueObj !== null && typeof valueObj !== 'undefined' &&
      valueObj.value !== null && typeof valueObj.value !== 'undefined') {
      // value string
      let valueStr = valueObj.value.toPrecision(4);
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
      const flag = '{' + keys[i] + '}';
      // replace
      res = res.replace(flag, valueStr);
    }
  }
  // return
  return res;
}

/**
 * Get the root of an input path.
 * Splits using `/` as separator.
 *
 * @param {string} path The input path.
 * @returns {string} The input path without its last part.
 */
export function getRootPath(path) {
  return path.split('/').slice(0, -1).join('/');
}

/**
 * Get a file extension: anything after the last dot.
 * File name starting with a dot are discarded.
 * Extensions are expected to contain at least one letter.
 *
 * @param {string} filePath The file path containing the file name.
 * @returns {string} The lower case file extension or null for none.
 */
export function getFileExtension(filePath) {
  let ext = null;
  if (typeof filePath !== 'undefined' &&
    filePath !== null &&
    filePath[0] !== '.') {
    const pathSplit = filePath.toLowerCase().split('.');
    if (pathSplit.length !== 1) {
      ext = pathSplit.pop();
      // extension should contain at least one letter and no slash
      const regExp = /[a-z]/;
      if (!regExp.test(ext) || ext.includes('/')) {
        ext = null;
      }
    }
  }
  return ext;
}

/**
 * Convert a string to a Uint8Array.
 *
 * @param {string} str The string to convert.
 * @returns {Uint8Array} The Uint8Array.
 */
export function stringToUint8Array(str) {
  const arr = new Uint8Array(str.length);
  for (let i = 0, leni = str.length; i < leni; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

/**
 * Round a float number to a given precision.
 *
 * Inspired from {@link https://stackoverflow.com/a/49729715/3639892}.
 *
 * Can be a solution to not have trailing zero as when
 *   using toFixed or toPrecision.
 * '+number.toFixed(precision)' does not pass all the tests...
 *
 * @param {number} number The number to round.
 * @param {number} precision The rounding precision.
 * @returns {number} The rounded number.
 */
export function precisionRound(number, precision) {
  const factor = Math.pow(10, precision);
  const delta = 0.01 / factor; // fixes precisionRound(1.005, 2)
  return Math.round(number * factor + delta) / factor;
}
