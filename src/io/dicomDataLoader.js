import {startsWith, getFileExtension} from '../utils/string.js';
import {getUrlFromUri} from '../utils/uri.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {DicomBufferToData} from '../image/dicomBufferToData.js';
import {LoaderBase} from './loaderBase.js';

/**
 * DICOM data loader.
 */
export class DicomDataLoader extends LoaderBase {

  /**
   * DICOM buffer to Data (asynchronous).
   *
   */
  #db2d = new DicomBufferToData();

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // setup db2d ony once
    if (!this.isLoading()) {
      // pass options
      this.#db2d.setOptions(this.getOptions());
      // connect handlers
      this.#db2d.onloadstart = this.onloadstart;
      this.#db2d.onprogress = this.onprogress;
      this.#db2d.onloaditem = this.onloaditem;
      this.#db2d.onload = this.onload;
      this.#db2d.onloadend = (event) => {
        // reset loading flag
        this.setLoading(false);
        // call listeners
        this.onloadend(event);
      };
      this.#db2d.onerror = (event) => {
        event.source = origin;
        this.onerror(event);
      };
      this.#db2d.onabort = this.onabort;
    }

    // set loading flag
    this.setLoading(true);
    // convert
    this.#db2d.convert(buffer, origin, index);
  }

  /**
   * Abort load.
   */
  abort() {
    // reset loading flag
    this.setLoading(false);
    // abort conversion, will trigger db2d.onabort
    this.#db2d.abort();
  }

  /**
   * Check if the loader can load the provided file.
   * True if one of the folowing conditions is true:
   * - the file has a 'dcm' extension,
   * - the file has no extension.
   *
   * @param {File} file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(file) {
    const ext = getFileExtension(file.name);
    return this.canLoadExtension(ext);
  }

  /**
   * Check if the loader can load the provided url.
   * True if one of the folowing conditions is true:
   * - the `options.forceLoader` is 'dicom',
   * - the `options.requestHeaders` contains a 'Accept: application/dicom',
   * - the url has a 'contentType' and it is 'application/dicom'
   *   (as in wado urls),
   * - the url has no 'contentType' and no extension or the extension is 'dcm'.
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
        this.isLoaderName(options.forceLoader)) {
        return true;
      }
      // check options.requestHeaders for 'Accept'
      if (typeof options.requestHeaders !== 'undefined') {
        const isNameAccept = function (element) {
          return element.name === 'Accept';
        };
        const acceptHeader = options.requestHeaders.find(isNameAccept);
        if (typeof acceptHeader !== 'undefined') {
          return this.canLoadAcceptHeader(acceptHeader.value);
        }
      }
    }

    const urlObjext = getUrlFromUri(url);
    // extension
    const ext = getFileExtension(urlObjext.pathname);
    const hasDcmExt = this.canLoadExtension(ext);
    // content type (for wado url)
    const contentType = urlObjext.searchParams.get('contentType');
    const hasContentType = contentType !== null &&
      typeof contentType !== 'undefined';
    const hasDicomContentType =
      hasContentType && this.canLoadContentType(contentType);

    return hasContentType ? hasDicomContentType : hasDcmExt;
  }

  /**
   * Check if the loader supports the input extension.
   *
   * @param {string} value The extensione.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadExtension(value) {
    return value === null ||
      value === 'dcm';
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'dicom';
  }

  /**
   * Check if the loader supports the input accept header.
   *
   * @param {string} value The accept header value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadAcceptHeader(value) {
    // starts with 'application/dicom' and no '+'
    const acceptValue = 'application/dicom';
    return startsWith(value, acceptValue) &&
      value[acceptValue.length] !== '+';
  }

  /**
   * Check if the loader supports the input content type.
   *
   * @param {string} value The content type value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadContentType(value) {
    return value.startsWith('application/dicom');
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

} // class DicomDataLoader
