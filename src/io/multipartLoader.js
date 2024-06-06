import {startsWith} from '../utils/string';
import {parseMultipart} from '../utils/array';
import {MemoryLoader} from './memoryLoader';
import {fileContentTypes} from './filesLoader';
import {urlContentTypes} from './urlsLoader';

/**
 * Multipart data loader.
 */
export class MultipartLoader {

  /**
   * Loading flag.
   *
   * @type {boolean}
   */
  #isLoading = false;

  /**
   * Set the loader options.
   *
   * @param {object} _opt The input options.
   */
  setOptions(_opt) {
    // does nothing
  }

  /**
   * Is the load ongoing?
   *
   * @returns {boolean} True if loading.
   */
  isLoading() {
    return this.#isLoading;
  }

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // send start event
    this.onloadstart({
      source: origin
    });
    // set loading flag
    this.#isLoading = true;

    const memoryIO = new MemoryLoader();
    // memoryIO.onloadstart: nothing to do
    memoryIO.onprogress = (progress) => {
      // add 50% to take into account the un-Multipartping
      progress.loaded = 50 + progress.loaded / 2;
      // set data index
      progress.index = index;
      this.onprogress(progress);
    };
    memoryIO.onloaditem = this.onloaditem;
    memoryIO.onload = this.onload;
    memoryIO.onloadend = (event) => {
      // reset loading flag
      this.#isLoading = false;
      // call listeners
      this.onloadend(event);
    };
    memoryIO.onerror = this.onerror;
    memoryIO.onabort = this.onabort;
    // launch
    memoryIO.load(parseMultipart(buffer));
  }

  /**
   * Abort load: pass to listeners.
   */
  abort() {
    // reset loading flag
    this.#isLoading = false;
    // call listeners
    this.onabort({});
    this.onloadend({});
  }

  /**
   * Check if the loader can load the provided file.
   * Always returns false.
   *
   * @param {File} _file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(_file) {
    return false;
  }

  /**
   * Check if the loader can load the provided url.
   * True if one of the folowing conditions is true:
   * - the `options.forceLoader` is 'multipart',
   * - the `options.requestHeaders` contains a 'Accept: multipart/related'.
   *
   * @param {string} url The url to check.
   * @param {object} [options] Optional url request options.
   * @returns {boolean} True if the url can be loaded.
   */
  canLoadUrl(url, options) {
    // check options
    if (typeof options !== 'undefined') {
      // check options.forceLoader
      if (typeof options.forceLoader !== 'undefined' &&
        options.forceLoader === 'multipart') {
        return true;
      }
      // check options.requestHeaders for 'Accept'
      if (typeof options.requestHeaders !== 'undefined') {
        const isNameAccept = function (element) {
          return element.name === 'Accept';
        };
        const acceptHeader = options.requestHeaders.find(isNameAccept);
        if (typeof acceptHeader !== 'undefined') {
          // starts with 'multipart/related'
          return startsWith(acceptHeader.value, 'multipart/related');
        }
      }
    }

    return false;
  }

  /**
   * Check if the loader can load the provided memory object.
   *
   * @param {object} _mem The memory object.
   * @returns {boolean} True if the url can be loaded.
   */
  canLoadMemory(_mem) {
    return false;
  }

  /**
   * Get the file content type needed by the loader.
   *
   * @returns {number} One of the 'fileContentTypes'.
   */
  loadFileAs() {
    return fileContentTypes.ArrayBuffer;
  }

  /**
   * Get the url content type needed by the loader.
   *
   * @returns {number} One of the 'urlContentTypes'.
   */
  loadUrlAs() {
    return urlContentTypes.ArrayBuffer;
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
   * Handle a load item event.
   * Default does nothing.
   *
   * @param {object} _event The load item event fired
   *   when a file item has been loaded successfully.
   */
  onloaditem(_event) {}

  /**
   * Handle a load event.
   * Default does nothing.
   *
   * @param {object} _event The load event fired
   *   when a file has been loaded successfully.
   */
  onload(_event) {}

  /**
   * Handle an load end event.
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

} // class MultipartLoader
