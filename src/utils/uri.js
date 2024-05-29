import {logger} from './logger';
import {splitKeyValueString} from './string';

/**
 * Get an full object URL from a string uri.
 *
 * @param {string} uri A string representing the url.
 * @returns {URL} A URL object.
 */
export function getUrlFromUri(uri) {
  // add base to allow for relative urls
  // (base is not used for absolute urls)
  return new URL(uri, window.location.origin);
}

/**
 * Split an input URI:
 * 'root?key0=val00&key0=val01&key1=val10' returns
 * { base : root, query : [ key0 : [val00, val01], key1 : val1 ] }
 * Returns an empty object if the input string is not correct (null, empty...)
 * or if it is not a query string (no question mark).
 *
 * @param {string} uri The string to split.
 * @returns {object} The split string.
 */
export function splitUri(uri) {
  // result
  const result = {};
  // check if query string
  let sepIndex = null;
  if (uri && (sepIndex = uri.indexOf('?')) !== -1) {
    // base: before the '?'
    result.base = uri.substring(0, sepIndex);
    // query : after the '?' and until possible '#'
    let hashIndex = uri.indexOf('#');
    if (hashIndex === -1) {
      hashIndex = uri.length;
    }
    const query = uri.substring(sepIndex + 1, hashIndex);
    // split key/value pairs of the query
    result.query = splitKeyValueString(query);
  }
  // return
  return result;
}

/**
 * Get the query part, split into an array, of an input URI.
 * The URI scheme is: `base?query#fragment`.
 *
 * @param {string} uri The input URI.
 * @returns {object} The query part, split into an array, of the input URI.
 */
export function getUriQuery(uri) {
  // split
  const parts = splitUri(uri);
  // check not empty
  if (Object.keys(parts).length === 0) {
    return null;
  }
  // return query
  return parts.query;
}

/**
 * Generic URI query decoder.
 * Supports manifest:
 *   `[dwv root]?input=encodeURIComponent('[manifest file]')&type=manifest`.
 * Or encoded URI with base and key value/pairs:
 *   `[dwv root]?input=encodeURIComponent([root]?key0=value0&key1=value1)`.
 *
 * @param {object} query The query part to the input URI.
 * @param {Function} callback The function to call with the decoded file urls.
 * @param {object} options Optional url request options.
 */
export function decodeQuery(query, callback, options) {
  // manifest
  if (query.type && query.type === 'manifest') {
    decodeManifestQuery(query, callback);
  } else {
    // default case: encoded URI with base and key/value pairs
    callback(
      decodeKeyValueUri(query.input, query.dwvReplaceMode),
      options);
  }
}

/**
 * Decode a Key/Value pair URI. If a key is repeated, the result
 *   be an array of base + each key.
 *
 * @param {string} uri The URI to decode.
 * @param {string} replaceMode The key replace mode. Can be:
 * - key (default): keep the key
 * - other than key: do not use the key
 *   'file' is a special case where the '?' of the query is not kept.
 * @returns {string[]} The list of input file urls.
 */
export function decodeKeyValueUri(uri, replaceMode) {
  const result = [];

  // repeat key replace mode (default to keep key)
  let repeatKeyReplaceMode = 'key';
  if (replaceMode) {
    repeatKeyReplaceMode = replaceMode;
  }

  // decode input URI
  const queryUri = decodeURIComponent(uri);
  // get key/value pairs from input URI
  const inputQueryPairs = splitUri(queryUri);
  if (Object.keys(inputQueryPairs).length === 0) {
    result.push(queryUri);
  } else {
    const keys = Object.keys(inputQueryPairs.query);
    // find repeat key
    let repeatKey = null;
    for (let i = 0; i < keys.length; ++i) {
      if (inputQueryPairs.query[keys[i]] instanceof Array) {
        repeatKey = keys[i];
        break;
      }
    }

    if (!repeatKey) {
      result.push(queryUri);
    } else {
      const repeatList = inputQueryPairs.query[repeatKey];
      // build base uri
      let baseUrl = inputQueryPairs.base;
      // add '?' when:
      // - base is not empty
      // - the repeatKey is not 'file'
      // root/path/to/?file=0.jpg&file=1.jpg
      if (baseUrl !== '' && repeatKey !== 'file') {
        baseUrl += '?';
      }
      let gotOneArg = false;
      for (let j = 0; j < keys.length; ++j) {
        if (keys[j] !== repeatKey) {
          if (gotOneArg) {
            baseUrl += '&';
          }
          baseUrl += keys[j] + '=' + inputQueryPairs.query[keys[j]];
          gotOneArg = true;
        }
      }
      // append built urls to result
      let url;
      for (let k = 0; k < repeatList.length; ++k) {
        url = baseUrl;
        if (gotOneArg) {
          url += '&';
        }
        if (repeatKeyReplaceMode === 'key') {
          url += repeatKey + '=';
        }
        // other than 'key' mode: do nothing
        url += repeatList[k];
        result.push(url);
      }
    }
  }
  // return
  return result;
}

/**
 * Decode a manifest query.
 *
 * @external XMLHttpRequest
 * @param {object} query The manifest query: {input, nslices},
 * with input the input URI and nslices the number of slices.
 * @param {Function} callback The function to call with the decoded urls.
 */
function decodeManifestQuery(query, callback) {
  let uri = '';
  if (query.input[0] === '/') {
    uri = window.location.protocol + '//' + window.location.host;
  }
  // TODO: needs to be decoded (decodeURIComponent?
  uri += query.input;

  /**
   * Handle error.
   *
   * @param {object} event The error event.
   */
  function onError(event) {
    logger.warn('RequestError while receiving manifest: ' +
      event.target.status);
  }

  /**
   * Handle load.
   *
   * @param {object} event The load event.
   */
  function onLoad(event) {
    callback(decodeManifest(event.target.responseXML, query.nslices));
  }

  const request = new XMLHttpRequest();
  request.open('GET', decodeURIComponent(uri), true);
  request.responseType = 'document';
  request.onload = onLoad;
  request.onerror = onError;
  request.send(null);
}

/**
 * Decode an XML manifest.
 *
 * @param {object} manifest The manifest to decode.
 * @param {number} nslices The number of slices to load.
 * @returns {string[]} The decoded manifest.
 */
export function decodeManifest(manifest, nslices) {
  const result = [];
  // wado url
  const wadoElement = manifest.getElementsByTagName('wado_query');
  const wadoURL = wadoElement[0].getAttribute('wadoURL');
  const rootURL = wadoURL + '?requestType=WADO&contentType=application/dicom&';
  // patient list
  const patientList = manifest.getElementsByTagName('Patient');
  if (patientList.length > 1) {
    logger.warn('More than one patient, loading first one.');
  }
  // study list
  const studyList = patientList[0].getElementsByTagName('Study');
  if (studyList.length > 1) {
    logger.warn('More than one study, loading first one.');
  }
  const studyUID = studyList[0].getAttribute('StudyInstanceUID');
  // series list
  const seriesList = studyList[0].getElementsByTagName('Series');
  if (seriesList.length > 1) {
    logger.warn('More than one series, loading first one.');
  }
  const seriesUID = seriesList[0].getAttribute('SeriesInstanceUID');
  // instance list
  const instanceList = seriesList[0].getElementsByTagName('Instance');
  // loop on instances and push links
  let max = instanceList.length;
  if (nslices < max) {
    max = nslices;
  }
  for (let i = 0; i < max; ++i) {
    const sopInstanceUID = instanceList[i].getAttribute('SOPInstanceUID');
    const link = rootURL +
        '&studyUID=' + studyUID +
        '&seriesUID=' + seriesUID +
        '&objectUID=' + sopInstanceUID;
    result.push(link);
  }
  // return
  return result;
}
