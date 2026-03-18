import {startsWith} from '../utils/string.js';
import {parseMultipart} from '../utils/array.js';
import {MemoryLoader} from './memoryLoader.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * Multipart data loader.
 */
export class MultipartLoader extends LoaderBase {

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
    this.setLoading(true);

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
      this.setLoading(false);
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
    this.setLoading(false);
    // call listeners
    this.onabort({});
    this.onloadend({});
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

} // class MultipartLoader
