import {FilesLoader} from '../io/filesLoader';
import {MemoryLoader} from '../io/memoryLoader';
import {UrlsLoader} from '../io/urlsLoader';

/**
 * Load controller.
 */
export class LoadController {

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
   * load counter.
   *
   * @type {number}
   */
  #counter = -1;

  /**
   * @param {string} defaultCharacterSet The default character set.
   */
  constructor(defaultCharacterSet) {
    this.#defaultCharacterSet = defaultCharacterSet;
  }

  /**
   * Get the next data id.
   *
   * @returns {string} The data id.
   */
  #getNextDataId() {
    ++this.#counter;
    return this.#counter.toString();
  }

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {FileList} files The list of files to load.
   */
  loadFiles(files) {
    // has been checked for emptiness.
    const ext = files[0].name.split('.').pop().toLowerCase();
    if (ext === 'json') {
      this.#loadStateFile(files[0]);
    } else {
      this.#loadImageFiles(files);
    }
  }

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  loadURLs(urls, options) {
    // has been checked for emptiness.
    const ext = urls[0].split('.').pop().toLowerCase();
    if (ext === 'json') {
      this.#loadStateUrl(urls[0], options);
    } else {
      this.#loadImageUrls(urls, options);
    }
  }

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: "", filename: "", data: data}].
   */
  loadImageObject(data) {
    // create IO
    const memoryIO = new MemoryLoader();
    // load data
    this.#loadData(data, memoryIO, 'image');
  }

  /**
   * Abort the current loaders.
   */
  abort() {
    const keys = Object.keys(this.#currentLoaders);
    for (let i = 0; i < keys.length; ++i) {
      this.#currentLoaders[i].loader.abort();
      delete this.#currentLoaders[i];
    }
  }

  // private ----------------------------------------------------------------

  /**
   * Load a list of image files.
   *
   * @param {FileList} files The list of image files to load.
   */
  #loadImageFiles(files) {
    // create IO
    const fileIO = new FilesLoader();
    fileIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(files, fileIO, 'image');
  }

  /**
   * Load a list of image URLs.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  #loadImageUrls(urls, options) {
    // create IO
    const urlIO = new UrlsLoader();
    urlIO.setDefaultCharacterSet(this.#defaultCharacterSet);
    // load data
    this.#loadData(urls, urlIO, 'image', options);
  }

  /**
   * Load a State file.
   *
   * @param {File} file The state file to load.
   */
  #loadStateFile(file) {
    // create IO
    const fileIO = new FilesLoader();
    // load data
    this.#loadData([file], fileIO, 'state');
  }

  /**
   * Load a State url.
   *
   * @param {string} url The state url to load.
   * @param {object} [options] The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  #loadStateUrl(url, options) {
    // create IO
    const urlIO = new UrlsLoader();
    // load data
    this.#loadData([url], urlIO, 'state', options);
  }

  /**
   * Load a list of data.
   *
   * @param {Array|FileList} data Array of data to load.
   * @param {object} loader The data loader.
   * @param {string} loadType The data load type: 'image' or 'state'.
   * @param {object} [options] Options passed to the final loader.
   */
  #loadData(data, loader, loadType, options) {
    const eventInfo = {
      loadtype: loadType,
    };

    // data id
    const dataId = this.#getNextDataId();
    eventInfo.dataid = dataId;

    // set callbacks
    loader.onloadstart = (event) => {
      // store loader to allow abort
      this.#currentLoaders[dataId] = {
        loader: loader,
        isFirstItem: true
      };
      // callback
      this.#augmentCallbackEvent(this.onloadstart, eventInfo)(event);
    };
    loader.onprogress = this.#augmentCallbackEvent(this.onprogress, eventInfo);
    loader.onloaditem = (event) => {
      const eventInfoItem = {
        loadtype: loadType,
        dataid: dataId
      };
      if (typeof this.#currentLoaders[dataId] !== 'undefined') {
        eventInfoItem.isfirstitem = this.#currentLoaders[dataId].isFirstItem;
      }
      // callback
      this.#augmentCallbackEvent(this.onloaditem, eventInfoItem)(event);
      // update loader
      if (typeof this.#currentLoaders[dataId] !== 'undefined' &&
        this.#currentLoaders[dataId].isFirstItem) {
        this.#currentLoaders[dataId].isFirstItem = false;
      }
    };
    loader.onload = this.#augmentCallbackEvent(this.onload, eventInfo);
    loader.onloadend = (event) => {
      // reset current loader
      delete this.#currentLoaders[dataId];
      // callback
      this.#augmentCallbackEvent(this.onloadend, eventInfo)(event);
    };
    loader.onerror = this.#augmentCallbackEvent(this.onerror, eventInfo);
    loader.onabort = this.#augmentCallbackEvent(this.onabort, eventInfo);
    // launch load
    try {
      loader.load(data, options);
    } catch (error) {
      this.onerror({
        error: error,
        dataid: dataId
      });
      this.onloadend({
        dataid: dataId
      });
      return;
    }
  }

  /**
   * Augment a callback event: adds loadtype to the event
   *  passed to a callback.
   *
   * @param {object} callback The callback to update.
   * @param {object} info Info object to append to the event.
   * @returns {object} A function representing the modified callback.
   */
  #augmentCallbackEvent(callback, info) {
    return function (event) {
      const keys = Object.keys(info);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        event[key] = info[key];
      }
      callback(event);
    };
  }

  /**
   * Handle a load start event.
   * Default does nothing.
   *
   * @param {object} _event The load start event.
   */
  onloadstart(_event) {}

  /**
   * Handle a load progress event.
   * Default does nothing.
   *
   * @param {object} _event The progress event.
   */
  onprogress(_event) {}

  /**
   * Handle a load event.
   * Default does nothing.
   *
   * @param {object} _event The load event fired
   *   when a file has been loaded successfully.
   */
  onload(_event) {}

  /**
   * Handle a load item event.
   * Default does nothing.
   *
   * @param {object} _event The load event fired
   *   when an item has been loaded successfully.
   */
  onloaditem(_event) {}

  /**
   * Handle a load end event.
   * Default does nothing.
   *
   * @param {object} _event The load end event fired
   *  when a file load has completed, successfully or not.
   */
  onloadend(_event) {}

  /**
   * Handle an error event.
   * Default does nothing.
   *
   * @param {object} _event The error event.
   */
  onerror(_event) {}

  /**
   * Handle an abort event.
   * Default does nothing.
   *
   * @param {object} _event The abort event.
   */
  onabort(_event) {}

} // class LoadController
