import {getFileExtension} from '../utils/string.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * JSON text loader.
 */
export class JSONTextLoader extends LoaderBase {

  /**
   * Load data.
   *
   * @param {object} text The input text.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(text, origin, index) {
    // set loading flag
    this.setLoading(true);
    this.onloadstart({
      source: origin
    });

    try {
      this.onprogress({
        lengthComputable: true,
        loaded: 100,
        total: 100,
        index,
        source: origin
      });
      const data = {
        data: text,
        source: origin
      };
      // only expecting one item
      this.onloaditem(data);
      this.onload(data);
    } catch (error) {
      this.onerror({
        error,
        source: origin
      });
    } finally {
      // reset loading flag
      this.setLoading(false);
      this.onloadend({
        source: origin
      });
    }
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
   * Check if the loader can load the provided file.
   * True if the file has a 'json' extension.
   *
   * @param {File} file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(file) {
    const ext = getFileExtension(file.name);
    return this.canLoadExtension(ext);
  }

  /**
   * Check if the loader supports the input extension.
   *
   * @param {string} value The extensione.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadExtension(value) {
    return value === 'json';
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'json';
  }

  /**
   * Check if the loader supports the input accept header.
   *
   * @param {string} value The accept header value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadAcceptHeader(value) {
    return value === 'application/json' ||
      value === 'application/dicom+json';
  }

  /**
   * Check if the loader supports the input content type.
   *
   * @param {string} value The content type value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadContentType(value) {
    return value === 'application/json';
  }

  /**
   * Get the file content type needed by the loader.
   *
   * @returns {number} One of the 'fileContentTypes'.
   */
  loadFileAs() {
    return fileContentTypes.Text;
  }

  /**
   * Get the url content type needed by the loader.
   *
   * @returns {number} One of the 'urlContentTypes'.
   */
  loadUrlAs() {
    return urlContentTypes.Text;
  }

} // class JSONTextLoader
