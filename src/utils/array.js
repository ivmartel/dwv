// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Convert a Uint8Array to a string.
 *
 * @param {Uint8Array} arr The array to convert.
 * @returns {string} The array as string.
 */
dwv.utils.uint8ArrayToString = function (arr) {
  return String.fromCharCode.apply(String, arr);
};

/**
 * Array find in a subset of the input array.
 * Equivalent to: arr.slice(start, end).find(callbackFn)
 *
 * @param {Array} arr The input array to search.
 * @param {Function} callbackFn The find function.
 * @param {number} start The array start index.
 * @param {number} end The array end index.
 * @returns {number} The index where the element was found.
 */
dwv.utils.findInArraySubset = function (arr, callbackFn, start, end) {
  // check inputs
  if (typeof start === 'undefined' ||
    start < 0 ||
    start >= arr.length
  ) {
    start = 0;
  }
  if (typeof end === 'undefined' ||
    end <= start ||
    end > arr.length) {
    end = arr.length;
  }
  // run
  for (var i = start; i < end; ++i) {
    if (callbackFn(arr[i], i, arr)) {
      return i;
    }
  }
  return;
};

/**
 * Get a find in array callback.
 *
 * @param {Array} arr1 The array to find.
 * @returns {Function} The find callback function.
 */
dwv.utils.getFindArrayInArrayCallback = function (arr1) {
  return function (element, index, arr0) {
    for (var i = 0; i < arr1.length; ++i) {
      if (arr0[index + i] !== arr1[i]) {
        return false;
      }
    }
    return true;
  };
};

/**
 * Extract each element of a multipart ArrayBuffer.
 * https://en.wikipedia.org/wiki/MIME#Multipart_messages
 *
 * @param {ArrayBuffer} arr The multipart array.
 * @returns {Array} The multipart parts as an array of object as
 *  {'Content-Type', ..., data} (depending on header tags)
 */
dwv.utils.parseMultipart = function (arr) {
  var u8Array = new Uint8Array(arr);

  var parts = [];
  // check input
  if (u8Array.length === 0) {
    return parts;
  }

  // \r\n\r\n
  var doubleReturnNew = new Uint8Array([0x0d, 0x0a, 0x0d, 0x0a]);
  var partHeaderEndCb = dwv.utils.getFindArrayInArrayCallback(doubleReturnNew);

  // look for boundary in first part header
  var partHeaderEndIndex = dwv.utils.findInArraySubset(
    u8Array, partHeaderEndCb, 0
  );
  if (typeof partHeaderEndIndex === 'undefined') {
    throw new Error('Can\'t find the end of the first multipart header');
  }
  var firstPartHeader = u8Array.slice(0, partHeaderEndIndex);
  // switch to string to use split
  var lines = dwv.utils.uint8ArrayToString(firstPartHeader).split('\r\n');
  // boundary should start with '--'
  var boundaryStr;
  for (var i = 0; i < lines.length; ++i) {
    if (lines[i][0] === '-' && lines[i][1] === '-') {
      boundaryStr = lines[i];
      break;
    }
  }
  if (typeof boundaryStr === 'undefined') {
    throw new Error('Can\'t find the boundary between multi-parts');
  }
  var boundary = dwv.utils.stringToUint8Array(boundaryStr);
  var boundaryCb = dwv.utils.getFindArrayInArrayCallback(boundary);
  var boundaryLen = boundaryStr.length;

  // skip mime header
  var nextBoundaryIndex = dwv.utils.findInArraySubset(
    u8Array, boundaryCb, 0
  );

  // loop through content
  while (typeof partHeaderEndIndex !== 'undefined') {
    var part = {};

    // header
    var partHeader = u8Array.slice(
      nextBoundaryIndex + boundaryLen, partHeaderEndIndex);
    // split into object
    var partHeaderLines =
      dwv.utils.uint8ArrayToString(partHeader).split('\r\n');
    for (var l = 0; l < partHeaderLines.length; ++l) {
      var line = partHeaderLines[l];
      var semiColonIndex = line.indexOf(':');
      if (semiColonIndex !== -1) {
        var key = line.substring(0, semiColonIndex).trim();
        var val = line.substring(semiColonIndex + 1).trim();
        part[key] = val;
      }
    }

    // find next boundary
    nextBoundaryIndex = dwv.utils.findInArraySubset(
      u8Array, boundaryCb, partHeaderEndIndex
    );
    // exit if none
    if (typeof nextBoundaryIndex === 'undefined') {
      break;
    }

    // get part
    // (partHeaderEndIndex plus the size of the separator)
    part.data = u8Array.slice(partHeaderEndIndex + 4, nextBoundaryIndex);

    // store part
    parts.push(part);

    // find next part header end
    partHeaderEndIndex = dwv.utils.findInArraySubset(
      u8Array, partHeaderEndCb,
      nextBoundaryIndex + boundaryLen
    );
  }

  return parts;
};
