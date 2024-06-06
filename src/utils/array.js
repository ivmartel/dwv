import {stringToUint8Array} from './string';

/**
 * Check if the first input array contains all the
 * elements of the second input array.
 *
 * @param {string[]} arr0 The test array.
 * @param {string[]} arr1 The elements to check in the first array.
 * @returns {boolean} True if all the elements of arr1 are included in arr0.
 */
export function arrayContains(arr0, arr1) {
  // check input
  if (arr0 === null ||
    arr1 === null ||
    typeof arr0 === 'undefined' ||
    typeof arr1 === 'undefined') {
    return false;
  }
  if (arr0.length === 0 ||
    arr1.length === 0 ||
    arr1.length > arr0.length) {
    return false;
  }
  // check values
  for (const itemArr1 of arr1) {
    if (!arr0.includes(itemArr1)) {
      return false;
    }
  }
  return true;
}

/**
 * Check for array equality after sorting.
 *
 * @param {Array} arr0 First array.
 * @param {Array} arr1 Second array.
 * @returns {boolean} True if both array are defined and contain same values.
 */
export function arraySortEquals(arr0, arr1) {
  if (arr0 === null ||
    arr1 === null ||
    typeof arr0 === 'undefined' ||
    typeof arr1 === 'undefined') {
    return false;
  }
  const arr0sorted = arr0.slice().sort();
  const arr1sorted = arr1.slice().sort();
  return arrayEquals(arr0sorted, arr1sorted);
}

/**
 * Check for array equality.
 *
 * @param {Array} arr0 First array.
 * @param {Array} arr1 Second array.
 * @returns {boolean} True if both array are defined and contain same values.
 */
export function arrayEquals(arr0, arr1) {
  if (arr0 === null ||
    arr1 === null ||
    typeof arr0 === 'undefined' ||
    typeof arr1 === 'undefined') {
    return false;
  }
  if (arr0.length !== arr1.length) {
    return false;
  }
  return arr0.every(function (element, index) {
    return element === arr1[index];
  });
}

/**
 * Convert a Uint8Array to a string.
 *
 * @param {Uint8Array} arr The array to convert.
 * @returns {string} The array as string.
 */
export function uint8ArrayToString(arr) {
  return String.fromCharCode.apply(String, arr);
}

/**
 * Array find in a subset of the input array.
 * Equivalent to: `arr.slice(start, end).find(callbackFn)`.
 *
 * @param {Uint8Array} arr The input array to search.
 * @param {Function} callbackFn The find function.
 * @param {number|undefined} start The array start index.
 * @param {number|undefined} [end] The array end index.
 * @returns {number|undefined} The index where the element was found.
 */
export function findInArraySubset(arr, callbackFn, start, end) {
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
  for (let i = start; i < end; ++i) {
    if (callbackFn(arr[i], i, arr)) {
      return i;
    }
  }
  return undefined;
}

/**
 * Get a find in array callback.
 *
 * @param {Uint8Array} arr1 The array to find.
 * @returns {Function} The find callback function.
 */
export function getFindArrayInArrayCallback(arr1) {
  return function (element, index, arr0) {
    for (let i = 0; i < arr1.length; ++i) {
      if (arr0[index + i] !== arr1[i]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Extract each element of a multipart ArrayBuffer.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/MIME#Multipart_messages}.
 *
 * @param {ArrayBuffer} arr The multipart array.
 * @returns {Array} The multipart parts as an array of object as
 *   {'Content-Type', ..., data} (depending on header tags).
 */
export function parseMultipart(arr) {
  const u8Array = new Uint8Array(arr);

  const parts = [];
  // check input
  if (u8Array.length === 0) {
    return parts;
  }

  // \r\n\r\n
  const doubleReturnNew = new Uint8Array([0x0d, 0x0a, 0x0d, 0x0a]);
  const partHeaderEndCb = getFindArrayInArrayCallback(doubleReturnNew);

  // look for boundary in first part header
  let partHeaderEndIndex = findInArraySubset(
    u8Array, partHeaderEndCb, 0
  );
  if (typeof partHeaderEndIndex === 'undefined') {
    throw new Error('Can\'t find the end of the first multipart header');
  }
  const firstPartHeader = u8Array.slice(0, partHeaderEndIndex);
  // switch to string to use split
  const lines = uint8ArrayToString(firstPartHeader).split('\r\n');
  // boundary should start with '--'
  let boundaryStr;
  for (let i = 0; i < lines.length; ++i) {
    if (lines[i][0] === '-' && lines[i][1] === '-') {
      boundaryStr = lines[i];
      break;
    }
  }
  if (typeof boundaryStr === 'undefined') {
    throw new Error('Can\'t find the boundary between multi-parts');
  }
  const boundary = stringToUint8Array(boundaryStr);
  const boundaryCb = getFindArrayInArrayCallback(boundary);
  const boundaryLen = boundaryStr.length;

  // skip mime header
  let nextBoundaryIndex = findInArraySubset(
    u8Array, boundaryCb, 0
  );

  // loop through content
  while (typeof partHeaderEndIndex !== 'undefined') {
    const part = {};

    // header
    const partHeader = u8Array.slice(
      nextBoundaryIndex + boundaryLen, partHeaderEndIndex);
    // split into object
    const partHeaderLines =
      uint8ArrayToString(partHeader).split('\r\n');
    for (let l = 0; l < partHeaderLines.length; ++l) {
      const line = partHeaderLines[l];
      const semiColonIndex = line.indexOf(':');
      if (semiColonIndex !== -1) {
        const key = line.substring(0, semiColonIndex).trim();
        const val = line.substring(semiColonIndex + 1).trim();
        part[key] = val;
      }
    }

    // find next boundary
    nextBoundaryIndex = findInArraySubset(
      u8Array, boundaryCb, partHeaderEndIndex
    );
    // exit if none
    if (typeof nextBoundaryIndex === 'undefined') {
      break;
    }

    // get part
    // partHeaderEndIndex plus the size of the '\r\n\r\n' separator
    const dataBeginIndex = partHeaderEndIndex + 4;
    // nextBoundaryIndex minus the previous '\r\n'
    const dataEndIndex = nextBoundaryIndex - 2;
    if (dataBeginIndex < dataEndIndex) {
      part.data = u8Array.slice(dataBeginIndex, dataEndIndex).buffer;
    } else {
      part.data = new Uint8Array();
    }

    // store part
    parts.push(part);

    // find next part header end
    partHeaderEndIndex = findInArraySubset(
      u8Array, partHeaderEndCb,
      nextBoundaryIndex + boundaryLen
    );
  }

  return parts;
}

/**
 * Build a multipart message.
 *
 * Ref:
 * - {@link https://en.wikipedia.org/wiki/MIME#Multipart_messages},
 * - {@link https://hg.orthanc-server.com/orthanc-dicomweb/file/tip/Resources/Samples/JavaScript/stow-rs.js}.
 *
 * @param {Array} parts The message parts as an array of object containing
 *   content headers and messages as the data property (as returned by parse).
 * @param {string} boundary The message boundary.
 * @returns {Uint8Array} The full multipart message.
 */
export function buildMultipart(parts, boundary) {
  const lineBreak = '\r\n';
  // build headers and calculate size
  let partsSize = 0;
  const headers = [];
  for (let i = 0; i < parts.length; ++i) {
    let headerStr = '';
    if (i !== 0) {
      headerStr += lineBreak;
    }
    headerStr += '--' + boundary + lineBreak;
    const partKeys = Object.keys(parts[i]);
    for (let k = 0; k < partKeys.length; ++k) {
      const key = partKeys[k];
      if (key !== 'data') {
        headerStr += key + ': ' + parts[i][key] + lineBreak;
      }
    }
    headerStr += lineBreak;
    const header = stringToUint8Array(headerStr);
    headers.push(header);
    partsSize += header.byteLength + parts[i].data.byteLength;
  }
  // build trailer
  const trailerStr = lineBreak + '--' + boundary + '--' + lineBreak;
  const trailer = stringToUint8Array(trailerStr);

  // final buffer
  const buffer = new Uint8Array(partsSize + trailer.byteLength);
  let offset = 0;
  // concatenate parts
  for (let j = 0; j < parts.length; ++j) {
    buffer.set(headers[j], offset);
    offset += headers[j].byteLength;
    buffer.set(new Uint8Array(parts[j].data), offset);
    offset += parts[j].data.byteLength;
  }
  // end buffer with trailer
  buffer.set(trailer, offset);

  // return
  return buffer;
}
