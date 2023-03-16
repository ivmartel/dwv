import {logger} from './logger';
import {splitKeyValueString} from './string';

/**
 * Get an full object URL from a string uri.
 *
 * @param {string} uri A string representing the url.
 * @returns {URL} A URL object.
 * WARNING: platform support dependent, see https://caniuse.com/#feat=url
 */
function getUrlFromUriFull(uri) {
  // add base to allow for relative urls
  // (base is not used for absolute urls)
  return new URL(uri, window.location.origin);
}

/**
 * Get an simple object URL from a string uri.
 *
 * @param {string} uri A string representing the url.
 * @returns {URL} A simple URL object that exposes 'pathname' and
 *   'searchParams.get()'
 * WARNING: limited functionality, simple nmock of the URL object.
 */
export function getUrlFromUriSimple(uri) {
  var url = {};
  // simple implementation (mainly for IE)
  // expecting only one '?'
  var urlSplit = uri.split('?');
  // pathname
  var fullPath = urlSplit[0];
  // remove host and domain
  var fullPathSplit = fullPath.split('//');
  var hostAndPath = fullPathSplit.pop();
  var hostAndPathSplit = hostAndPath.split('/');
  hostAndPathSplit.splice(0, 1);
  url.pathname = '/' + hostAndPathSplit.join('/');
  // search params
  var searchSplit = [];
  if (urlSplit.length === 2) {
    var search = urlSplit[1];
    searchSplit = search.split('&');
  }
  var searchParams = {};
  for (var i = 0; i < searchSplit.length; ++i) {
    var paramSplit = searchSplit[i].split('=');
    searchParams[paramSplit[0]] = paramSplit[1];
  }
  url.searchParams = {
    get: function (param) {
      return searchParams[param];
    }
  };

  return url;
}

/**
 * Get an object URL from a string uri.
 *
 * @param {string} uri A string representing the url.
 * @returns {URL} A URL object (full or simple depending upon platform).
 * WANRING: returns an official URL or a simple URL depending on platform,
 *   see https://caniuse.com/#feat=url
 */
export function getUrlFromUri(uri) {
  var url = null;
  // if (dwv.env.askModernizr('urlparser') &&
  //       dwv.env.askModernizr('urlsearchparams')) {
    url = getUrlFromUriFull(uri);
  // } else {
  //   url = getUrlFromUriSimple(uri);
  // }
  return url;
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
  var result = {};
  // check if query string
  var sepIndex = null;
  if (uri && (sepIndex = uri.indexOf('?')) !== -1) {
    // base: before the '?'
    result.base = uri.substring(0, sepIndex);
    // query : after the '?' and until possible '#'
    var hashIndex = uri.indexOf('#');
    if (hashIndex === -1) {
      hashIndex = uri.length;
    }
    var query = uri.substring(sepIndex + 1, hashIndex);
    // split key/value pairs of the query
    result.query = splitKeyValueString(query);
  }
  // return
  return result;
}

/**
 * Get the query part, split into an array, of an input URI.
 * The URI scheme is: 'base?query#fragment'
 *
 * @param {string} uri The input URI.
 * @returns {object} The query part, split into an array, of the input URI.
 */
export function getUriQuery(uri) {
  // split
  var parts = splitUri(uri);
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
 *   [dwv root]?input=encodeURIComponent('[manifest file]')&type=manifest
 * or encoded URI with base and key value/pairs:
 *   [dwv root]?input=encodeURIComponent([root]?key0=value0&key1=value1)
 *
 * @param {string} query The query part to the input URI.
 * @param {Function} callback The function to call with the decoded file urls.
 * @param {object} options Optional url request options.
 */
function decodeQuery(query, callback, options) {
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
 * be an array of base + each key.
 *
 * @param {string} uri The URI to decode.
 * @param {string} replaceMode The key replace more.
 *   replaceMode can be:
 *   - key (default): keep the key
 *   - other than key: do not use the key
 *   'file' is a special case where the '?' of the query is not kept.
 * @returns {Array} The list of input file urls.
 */
export function decodeKeyValueUri(uri, replaceMode) {
  var result = [];

  // repeat key replace mode (default to keep key)
  var repeatKeyReplaceMode = 'key';
  if (replaceMode) {
    repeatKeyReplaceMode = replaceMode;
  }

  // decode input URI
  var queryUri = decodeURIComponent(uri);
  // get key/value pairs from input URI
  var inputQueryPairs = splitUri(queryUri);
  if (Object.keys(inputQueryPairs).length === 0) {
    result.push(queryUri);
  } else {
    var keys = Object.keys(inputQueryPairs.query);
    // find repeat key
    var repeatKey = null;
    for (var i = 0; i < keys.length; ++i) {
      if (inputQueryPairs.query[keys[i]] instanceof Array) {
        repeatKey = keys[i];
        break;
      }
    }

    if (!repeatKey) {
      result.push(queryUri);
    } else {
      var repeatList = inputQueryPairs.query[repeatKey];
      // build base uri
      var baseUrl = inputQueryPairs.base;
      // add '?' when:
      // - base is not empty
      // - the repeatKey is not 'file'
      // root/path/to/?file=0.jpg&file=1.jpg
      if (baseUrl !== '' && repeatKey !== 'file') {
        baseUrl += '?';
      }
      var gotOneArg = false;
      for (var j = 0; j < keys.length; ++j) {
        if (keys[j] !== repeatKey) {
          if (gotOneArg) {
            baseUrl += '&';
          }
          baseUrl += keys[j] + '=' + inputQueryPairs.query[keys[j]];
          gotOneArg = true;
        }
      }
      // append built urls to result
      var url;
      for (var k = 0; k < repeatList.length; ++k) {
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
  var uri = '';
  if (query.input[0] === '/') {
    uri = window.location.protocol + '//' + window.location.host;
  }
  // TODO: needs to be decoded (decodeURIComponent?
  uri += query.input;

  // handle error
  function onError(/*event*/) {
    logger.warn('RequestError while receiving manifest: ' + this.status);
  }

  // handle load
  function onLoad(/*event*/) {
    callback(decodeManifest(this.responseXML, query.nslices));
  }

  var request = new XMLHttpRequest();
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
 * @returns {Array} The decoded manifest.
 */
export function decodeManifest(manifest, nslices) {
  var result = [];
  // wado url
  var wadoElement = manifest.getElementsByTagName('wado_query');
  var wadoURL = wadoElement[0].getAttribute('wadoURL');
  var rootURL = wadoURL + '?requestType=WADO&contentType=application/dicom&';
  // patient list
  var patientList = manifest.getElementsByTagName('Patient');
  if (patientList.length > 1) {
    logger.warn('More than one patient, loading first one.');
  }
  // study list
  var studyList = patientList[0].getElementsByTagName('Study');
  if (studyList.length > 1) {
    logger.warn('More than one study, loading first one.');
  }
  var studyUID = studyList[0].getAttribute('StudyInstanceUID');
  // series list
  var seriesList = studyList[0].getElementsByTagName('Series');
  if (seriesList.length > 1) {
    logger.warn('More than one series, loading first one.');
  }
  var seriesUID = seriesList[0].getAttribute('SeriesInstanceUID');
  // instance list
  var instanceList = seriesList[0].getElementsByTagName('Instance');
  // loop on instances and push links
  var max = instanceList.length;
  if (nslices < max) {
    max = nslices;
  }
  for (var i = 0; i < max; ++i) {
    var sopInstanceUID = instanceList[i].getAttribute('SOPInstanceUID');
    var link = rootURL +
        '&studyUID=' + studyUID +
        '&seriesUID=' + seriesUID +
        '&objectUID=' + sopInstanceUID;
    result.push(link);
  }
  // return
  return result;
}

/**
 * Load from an input uri
 *
 * @param {string} uri The input uri, for example: 'window.location.href'.
 * @param {dwv.App} app The associated app that handles the load.
 * @param {object} options Optional url request options.
 */
export function loadFromUri(uri, app, options) {
  var query = getUriQuery(uri);
  // check query
  if (query && typeof query.input !== 'undefined') {
    loadFromQuery(query, app, options);
  }
  // no else to allow for empty uris
}

/**
 * Load from an input query
 *
 * @param {object} query A query derived from an uri.
 * @param {object} app The associated app that handles the load.
 * @param {object} options Optional url request options.
 */
function loadFromQuery(query, app, options) {
  function onLoadEnd(/*event*/) {
    app.removeEventListener('loadend', onLoadEnd);
    app.loadURLs([query.state]);
  }
  // load base
  decodeQuery(query, app.loadURLs, options);
  // optional display state
  if (typeof query.state !== 'undefined') {
    // queue after main data load
    app.addEventListener('loadend', onLoadEnd);
  }
}
