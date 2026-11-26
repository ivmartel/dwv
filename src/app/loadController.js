import {FilesLoader} from '../io/filesLoader.js';
import {MemoryLoader} from '../io/memoryLoader.js';
import {UrlsLoader} from '../io/urlsLoader.js';

/**
 * List of load event names.
 *
 * @type {string[]}
 */
export const loadEventNames = [
  'loadstart',
  'loadprogress',
  'loaditem',
  'load',
  'loadend',
  'error',
  'abort',
  'timeout'
];

/**
 * Load controller.
 */
export class LoadController extends EventTarget {

  /**
   * The default character set.
   *
   * @type {string}
   */
  #defaultCharacterSet;

  /**
   * List of current loaders.
   *
   * @type {object}
   */
  #currentLoaders = {};

  /**
   * Load counter.
   *
   * @type {number}
   */
  #loadIdCounter = -1;

  /**
   * @param {string} defaultCharacterSet The default character set.
   */
  constructor(defaultCharacterSet) {
    super();
    this.#defaultCharacterSet = defaultCharacterSet;
  }

  /**
   * Get the next load id.
   *
   * @returns {string} The load id.
   */
  getNextLoadId() {
    ++this.#loadIdCounter;
    return this.#loadIdCounter.toString();
  }

  /**
   * Load a list of image files.
   *
   * @param {File[]} files The list of files to load.
   * @param {string} loadId The load id.
   */
  loadFiles(files, loadId) {
    this.#loadImageFiles(files, loadId);
  }

  /**
   * Load a list of image URLs.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {string} loadId The load id.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  loadURLs(urls, loadId, options) {
    this.#loadImageUrls(urls, loadId, options);
  }

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: '', filename: '', data: data}].
   * @param {string} loadId The load id.
   */
  loadImageObject(data, loadId) {
    // create IO
    const memoryIO = new MemoryLoader();
    // load data
    this.#loadData(data, memoryIO, loadId);
  }

  /**
   * Get the ids of the current loads.
   *
   * @returns {string[]} The load ids.
   */
  getCurrentLoadIds() {
    return Object.keys(this.#currentLoaders);
  }

  /**
   * Abort an individual current loader.
   *
   * @param {string} loadId The load to stop.
   */
  abort(loadId) {
    if (typeof this.#currentLoaders[loadId] !== 'undefined') {
      this.#currentLoaders[loadId].abort();
      delete this.#currentLoaders[loadId];
    }
  }

  // private ----------------------------------------------------------------

  /**
   * Load a list of image files.
   *
   * @param {File[]} files The list of image files to load.
   * @param {string} loadId The load id.
   */
  #loadImageFiles(files, loadId) {
    // create IO
    const fileIO = new FilesLoader();
    fileIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(files, fileIO, loadId);
  }

  /**
   * Load a list of image URLs.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {string} loadId The load id.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  #loadImageUrls(urls, loadId, options) {
    // create IO
    const urlIO = new UrlsLoader();
    urlIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(urls, urlIO, loadId, options);
  }

  /**
   * Load a list of data.
   *
   * @param {string[]|File[]|Array} data Array of data to load.
   * @param {object} loader The data loader.
   * @param {string} loadId The load id.
   * @param {object} [options] Options passed to the final loader.
   */
  #loadData(data, loader, loadId, options) {
    const eventInfo = {
      loadid: loadId
    };

    // set callbacks
    loader.onloadstart = (event) => {
      // store loader to allow abort
      this.#currentLoaders[loadId] = loader;
      // callback
      this.#getFireEvent('loadstart', eventInfo)(event);
    };
    loader.onprogress = this.#getFireEvent('loadprogress', eventInfo);
    loader.onloaditem = this.#getFireEvent('loaditem', eventInfo);
    loader.onload = this.#getFireEvent('load', eventInfo);
    loader.onloadend = (event) => {
      // reset current loader
      delete this.#currentLoaders[loadId];
      // callback
      this.#getFireEvent('loadend', eventInfo)(event);
    };
    loader.onerror = this.#getFireEvent('error', eventInfo);
    loader.onabort = this.#getFireEvent('abort', eventInfo);
    if (typeof loader.ontimeout !== 'undefined') {
      loader.ontimeout = this.#getFireEvent('timeout', eventInfo);
    }
    // launch load
    try {
      loader.load(data, options);
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: {
          loadid: loadId,
          error
        }
      }));
      this.dispatchEvent(new CustomEvent('loadend', {
        detail: {
          loadid: loadId
        }
      }));
    }
  }

  /**
   * Get a fireEvent function that adds local information
   * to the event value.
   *
   * @param {string} type The event type to fire.
   * @param {object} detail Local information.
   * @returns {EventListener} A fireEvent function.
   */
  #getFireEvent(type, detail) {
    return ((/** @type {CustomEvent} */ event) => {
      const allDetail = Object.assign({}, event, detail);
      this.dispatchEvent(new CustomEvent(type, {detail: allDetail}));
    });
  }

} // class LoadController
