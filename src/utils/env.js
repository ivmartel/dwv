// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.env = dwv.env || {};

/**
 * Local function to ask Modernizr if a property is supported.
 *
 * @param {string} property The property to test.
 * @returns {boolean} True if the env supports the input feature.
 */
dwv.env.askModernizr = function (property) {
  if (typeof dwv.Modernizr === 'undefined') {
    dwv.ModernizrInit(window, document);
  }
  var props = property.split('.');
  var prop = dwv.Modernizr;
  for (var i = 0; i < props.length; ++i) {
    prop = prop[props[i]];
  }
  return prop;
};

/**
 * Browser check for the FileAPI.
 * Assume support for Safari5.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasFileApi = function () {
  // regular test does not work on Safari 5
  var isSafari5 = (navigator.appVersion.indexOf('Safari') !== -1) &&
    (navigator.appVersion.indexOf('Chrome') === -1) &&
    ((navigator.appVersion.indexOf('5.0.') !== -1) ||
    (navigator.appVersion.indexOf('5.1.') !== -1));
  if (isSafari5) {
    dwv.logger.warn('Assuming FileAPI support for Safari5...');
    return true;
  }
  // regular test
  return dwv.env.askModernizr('filereader');
};

/**
 * Browser check for the XMLHttpRequest.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasXmlHttpRequest = function () {
  return dwv.env.askModernizr('xhrresponsetype') &&
    dwv.env.askModernizr('xhrresponsetypearraybuffer') &&
    dwv.env.askModernizr('xhrresponsetypetext') &&
    'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
};

/**
 * Browser check for typed array.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasTypedArray = function () {
  return dwv.env.askModernizr('dataview') &&
    dwv.env.askModernizr('typedarrays');
};

/**
 * Browser check for input with type='color'.
 * Missing in IE and Safari.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasInputColor = function () {
  return dwv.env.askModernizr('inputtypes.color');
};

/**
 * Browser check for input with type='files' and webkitdirectory flag.
 * Missing in IE and Safari.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasInputDirectory = function () {
  return dwv.env.askModernizr('fileinputdirectory');
};

// only check at startup (since we propose a replacement)
dwv.env._hasTypedArraySlice =
  (typeof Uint8Array.prototype.slice !== 'undefined');

/**
 * Browser check for typed array slice method.
 * Missing in Internet Explorer 11.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasTypedArraySlice = function () {
  return dwv.env._hasTypedArraySlice;
};

// only check at startup (since we propose a replacement)
dwv.env._hasFloat64Array = ('Float64Array' in window);

/**
 * Browser check for Float64Array array.
 * Missing in PhantomJS 1.9.20 (on Travis).
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasFloat64Array = function () {
  return dwv.env._hasFloat64Array;
};

// only check at startup (since we propose a replacement)
dwv.env._hasClampedArray = ('Uint8ClampedArray' in window);

/**
 * Browser check for clamped array.
 * Missing in:
 * - Safari 5.1.7 for Windows
 * - PhantomJS 1.9.20 (on Travis).
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasClampedArray = function () {
  return dwv.env._hasClampedArray;
};

// Check if the BigInt type is defined
dwv.env._hasBigint = (typeof BigInt !== 'undefined');

/**
 * Browser check for BigInt (associated typed arrays).
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasBigInt = function () {
  return dwv.env._hasBigint;
};

// Check if the TextDecoder is defined
dwv.env._hasTextDecoder = (typeof TextDecoder !== 'undefined');

/**
 * Does the environement provide TextDecoder.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasTextDecoder = function () {
  return dwv.env._hasTextDecoder;
};

// Check if the TextEncoder is defined
dwv.env._hasTextEncoder = (typeof TextEncoder !== 'undefined');

/**
 * Does the environement provide TextEncoder.
 *
 * @returns {boolean} True if the env supports the feature.
 */
dwv.env.hasTextEncoder = function () {
  return dwv.env._hasTextEncoder;
};

/**
 * Browser checks to see if it can run dwv. Throws an error if not.
 * Silently replaces basic functions.
 */
dwv.env.check = function () {

  // Required --------------

  var message = '';
  // Check for the File API support
  if (!dwv.env.hasFileApi()) {
    message = 'The File APIs are not supported in this browser. ';
    throw new Error(message);
  }
  // Check for XMLHttpRequest
  if (!dwv.env.hasXmlHttpRequest()) {
    message = 'The XMLHttpRequest is not supported in this browser. ';
    throw new Error(message);
  }
  // Check typed array
  if (!dwv.env.hasTypedArray()) {
    message = 'The Typed arrays are not supported in this browser. ';
    throw new Error(message);
  }
  // Check text encoding/decoding
  if (!dwv.env.hasTextDecoder() || !dwv.env.hasTextEncoder()) {
    message = 'Text decoding/encoding is not supported in this browser.';
    throw new Error(message);
  }

  // Check Float64
  if (!dwv.env.hasFloat64Array()) {
    dwv.logger.warn('Float64Array is not supported in this browser. ' +
      'Data including tags with Float64 VR is not supported. ');
  }
  // Check BigInt
  if (!dwv.env.hasBigInt()) {
    dwv.logger.warn('BigInt is not supported in this browser. ' +
      'Data including tags with Int64 and Uint64 VRs is not supported. ');
  }

  // Replaced if not present ------------

  // Check typed array slice
  if (!dwv.env.hasTypedArraySlice()) {
    // silent fail with warning
    dwv.logger.warn(
      'The TypedArray.slice method is not supported in this browser.' +
      ' This may impair performance. ');
    // basic Uint16Array implementation
    Uint16Array.prototype.slice = function (begin, end) {
      var size = end - begin;
      var cloned = new Uint16Array(size);
      for (var i = 0; i < size; i++) {
        cloned[i] = this[begin + i];
      }
      return cloned;
    };
    // basic Int16Array implementation
    Int16Array.prototype.slice = function (begin, end) {
      var size = end - begin;
      var cloned = new Int16Array(size);
      for (var i = 0; i < size; i++) {
        cloned[i] = this[begin + i];
      }
      return cloned;
    };
    // basic Uint8Array implementation
    Uint8Array.prototype.slice = function (begin, end) {
      var size = end - begin;
      var cloned = new Uint8Array(size);
      for (var i = 0; i < size; i++) {
        cloned[i] = this[begin + i];
      }
      return cloned;
    };
    // basic Int8Array implementation
    Int8Array.prototype.slice = function (begin, end) {
      var size = end - begin;
      var cloned = new Int8Array(size);
      for (var i = 0; i < size; i++) {
        cloned[i] = this[begin + i];
      }
      return cloned;
    };
  }
  // check clamped array
  if (!dwv.env.hasClampedArray()) {
    // silent fail with warning
    dwv.logger.warn(
      'The Uint8ClampedArray is not supported in this browser.' +
      ' This may impair performance. ');
    // Use Uint8Array instead... Not good
    // TODO Find better replacement!
    window.Uint8ClampedArray = window.Uint8Array;
  }

  // array Find
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this === null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T
        //    be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate,
          //    T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return undefined.
        return undefined;
      },
      configurable: true,
      writable: true
    });
  }

  // check string startsWith
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      value: function (search, rawPos) {
        return dwv.utils.startsWith(this, search, rawPos);
      }
    });
  }
};
