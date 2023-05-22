import {startsWith, getFileExtension} from '../utils/string';
import {getUrlFromUri} from '../utils/uri';
import {fileContentTypes} from './filesLoader';
import {urlContentTypes} from './urlsLoader';
import {DicomBufferToView} from '../image/dicomBufferToView';

/**
 * DICOM data loader.
 */
export class DicomDataLoader {

  /**
   * Loader options.
   *
   * @type {object}
   */
  #options = {};

  /**
   * Loading flag.
   *
   * @type {boolean}
   */
  #isLoading = false;

  /**
   * Set the loader options.
   *
   * @param {object} opt The input options.
   */
  setOptions(opt) {
    this.#options = opt;
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
   * DICOM buffer to View (asynchronous)
   *
   */
  #db2v = new DicomBufferToView();

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // setup db2v ony once
    if (!this.#isLoading) {
      // pass options
      this.#db2v.setOptions(this.#options);
      // connect handlers
      this.#db2v.onloadstart = this.onloadstart;
      this.#db2v.onprogress = this.onprogress;
      this.#db2v.onloaditem = this.onloaditem;
      this.#db2v.onload = this.onload;
      this.#db2v.onloadend = (event) => {
        // reset loading flag
        this.#isLoading = false;
        // call listeners
        this.onloadend(event);
      };
      this.#db2v.onerror = (event) => {
        event.source = origin;
        this.onerror(event);
      };
      this.#db2v.onabort = this.onabort;
    }

    // set loading flag
    this.#isLoading = true;
    // convert
    this.#db2v.convert(buffer, origin, index);
  }

  /**
   * Abort load.
   */
  abort() {
    // reset loading flag
    this.#isLoading = false;
    // abort conversion, will trigger db2v.onabort
    this.#db2v.abort();
  }

  /**
   * Check if the loader can load the provided file.
   *
   * @param {object} file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(file) {
    const ext = getFileExtension(file.name);
    const hasNoExt = (ext === null);
    const hasDcmExt = (ext === 'dcm');
    return hasNoExt || hasDcmExt;
  }

  /**
   * Check if the loader can load the provided url.
   * True if:
   *  - the url has a 'contentType' and it is 'application/dicom'
   *    (as in wado urls)
   *  - the url has no 'contentType' and no extension or the extension is 'dcm'
   *
   * @param {string} url The url to check.
   * @param {object} [options] Optional url request options.
   * @returns {boolean} True if the url can be loaded.
   */
  canLoadUrl(url, options) {
    // if there are options.requestHeaders, just base check on them
    if (typeof options !== 'undefined' &&
      typeof options.requestHeaders !== 'undefined') {
      // starts with 'application/dicom'
      const isDicom = function (element) {
        return element.name === 'Accept' &&
          startsWith(element.value, 'application/dicom') &&
          element.value[18] !== '+';
      };
      return typeof options.requestHeaders.find(isDicom) !== 'undefined';
    }

    const urlObjext = getUrlFromUri(url);
    // extension
    const ext = getFileExtension(urlObjext.pathname);
    const hasNoExt = (ext === null);
    const hasDcmExt = (ext === 'dcm');
    // content type (for wado url)
    const contentType = urlObjext.searchParams.get('contentType');
    const hasContentType = contentType !== null &&
      typeof contentType !== 'undefined';
    const hasDicomContentType = (contentType === 'application/dicom');

    return hasContentType ? hasDicomContentType : (hasNoExt || hasDcmExt);
  }

  /**
   * Check if the loader can load the provided memory object.
   *
   * @param {object} mem The memory object.
   * @returns {boolean} True if the object can be loaded.
   */
  canLoadMemory(mem) {
    if (typeof mem['Content-Type'] !== 'undefined' &&
      mem['Content-Type'] === 'application/dicom') {
      return true;
    }
    if (typeof mem.filename !== 'undefined') {
      return this.canLoadFile({name: mem.filename});
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

  /**
   * Handle a load start event.
   * Default does nothing.
   *
   * @param {object} _event The load start event.
   */
  onloadstart(_event) {}

  /**
   * Handle a progress event.
   * Default does nothing.
   *
   * @param {object} _event The load progress event.
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

} // class DicomDataLoader
