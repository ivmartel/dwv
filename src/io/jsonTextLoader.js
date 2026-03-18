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
   * Check if the loader supports the input media type.
   *
   * @param {string} value The media type.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(value) {
    return value === 'application/json' ||
      value === 'application/dicom+json';
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
