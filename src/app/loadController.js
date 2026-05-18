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
   * @param {string} defaultCharacterSet The default character set.
   */
  constructor(defaultCharacterSet) {
    super();
    this.#defaultCharacterSet = defaultCharacterSet;
  }

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {File[]} files The list of files to load.
   * @param {string} dataId The data Id.
   */
  loadFiles(files, dataId) {
    // has been checked for emptiness.
    const ext = files[0].name.split('.').pop().toLowerCase();
    if (ext === 'json') {
      this.#loadStateFile(files[0], dataId);
    } else {
      this.#loadImageFiles(files, dataId);
    }
  }

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {string} dataId The data Id.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */

  loadURLs(urls, dataId, options) {
    // has been checked for emptiness.
    const ext = urls[0].split('.').pop().toLowerCase();
    if (ext === 'json') {
      this.#loadStateUrl(urls[0], dataId, options);
    } else {
      this.#loadImageUrls(urls, dataId, options);
    }
  }

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: '', filename: '', data: data}].
   * @param {string} dataId The data Id.
   */
  loadImageObject(data, dataId) {
    // create IO
    const memoryIO = new MemoryLoader();
    // load data
    this.#loadData(data, memoryIO, 'image', dataId);
  }

  /**
   * Get the currently loaded data ids.
   *
   * @returns {string[]} The data ids.
   */
  getLoadingDataIds() {
    return Object.keys(this.#currentLoaders);
  }

  /**
   * Abort an individual current loader.
   *
   * @param {string} dataId The data to stop loading.
   */
  abort(dataId) {
    if (typeof this.#currentLoaders[dataId] !== 'undefined') {
      this.#currentLoaders[dataId].loader.abort();
      delete this.#currentLoaders[dataId];
    }
  }

  // private ----------------------------------------------------------------

  /**
   * Load a list of image files.
   *
   * @param {File[]} files The list of image files to load.
   * @param {string} dataId The data Id.
   */
  #loadImageFiles(files, dataId) {
    // create IO
    const fileIO = new FilesLoader();
    fileIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(files, fileIO, 'image', dataId);
  }

  /**
   * Load a list of image URLs.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {string} [dataId] The data Id.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  #loadImageUrls(urls, dataId, options) {
    // create IO
    const urlIO = new UrlsLoader();
    urlIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(urls, urlIO, 'image', dataId, options);
  }

  /**
   * Load a State file.
   *
   * @param {File} file The state file to load.
   * @param {string} dataId The data Id.
   */
  #loadStateFile(file, dataId) {
    // create IO
    const fileIO = new FilesLoader();
    // load data
    this.#loadData([file], fileIO, 'state', dataId);
  }


  /**
   * Load a State url.
   *
   * @param {string} url The state url to load.
   * @param {string} [dataId] The data Id.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  #loadStateUrl(url, dataId, options) {
    // create IO
    const urlIO = new UrlsLoader();
    // load data
    this.#loadData([url], urlIO, 'state', dataId, options);
  }

  /**
   * Load a list of data.
   *
   * @param {string[]|File[]|Array} data Array of data to load.
   * @param {object} loader The data loader.
   * @param {string} loadType The data load type: 'image' or 'state'.
   * @param {string} dataId The data id.
   * @param {object} [options] Options passed to the final loader.
   */
  #loadData(data, loader, loadType, dataId, options) {
    const eventInfo = {
      dataid: dataId,
      loadtype: loadType
    };

    // set callbacks
    loader.onloadstart = (event) => {
      // store loader to allow abort
      this.#currentLoaders[dataId] = {
        loader,
        isFirstItem: true
      };
      // callback
      this.#getFireEvent('loadstart', eventInfo)(event);
    };
    loader.onprogress = this.#getFireEvent('loadprogress', eventInfo);
    loader.onloaditem = (event) => {
      const eventInfoItem = {
        dataid: dataId,
        loadtype: loadType
      };
      if (typeof this.#currentLoaders[dataId] !== 'undefined') {
        eventInfoItem.isfirstitem = this.#currentLoaders[dataId].isFirstItem;
      }
      // callback
      this.#getFireEvent('loaditem', eventInfoItem)(event);
      // update loader
      if (typeof this.#currentLoaders[dataId] !== 'undefined' &&
        this.#currentLoaders[dataId].isFirstItem) {
        this.#currentLoaders[dataId].isFirstItem = false;
      }
    };
    loader.onload = this.#getFireEvent('load', eventInfo);
    loader.onloadend = (event) => {
      // reset current loader
      delete this.#currentLoaders[dataId];
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
          dataid: dataId,
          loadtype: loadType,
          error
        }
      }));
      this.dispatchEvent(new CustomEvent('loadend', {
        detail: {
          dataid: dataId,
          loadtype: loadType,
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
