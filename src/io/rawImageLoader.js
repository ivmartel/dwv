import {getViewFromDOMImage} from '../image/domReader.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * Raw image loader.
 */
export class RawImageLoader extends LoaderBase {

  /**
   * Create a Data URI from an HTTP request response.
   *
   * @param {ArrayBuffer} response The HTTP request response.
   * @param {string} dataType The data type.
   * @returns {string} The data URI.
   */
  #createDataUri(response, dataType) {
    // image type
    let imageType = dataType;
    if (!imageType || imageType === 'jpg') {
      imageType = 'jpeg';
    }
    // create uri
    const file = new Blob([response], {type: `image/${imageType}`});
    return window.URL.createObjectURL(file);
  }

  /**
   * Load data.
   *
   * @param {ArrayBuffer|string} buffer The read data.
   * @param {string|File} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    this.setLoading(true);
    // create a DOM image
    const image = new Image();
    // triggered by ctx.drawImage
    image.onload = (/*event*/) => {
      try {
        if (this.isLoading()) {
          this.onprogress({
            lengthComputable: true,
            loaded: 100,
            total: 100,
            index,
            source: origin
          });
          const data = getViewFromDOMImage(image, origin, index);
          // only expecting one item
          this.onloaditem(data);
          this.onload(data);
        }
      } catch (error) {
        this.onerror({
          error,
          source: origin
        });
      } finally {
        this.onloadend({
          source: origin
        });
      }
    };
    // storing values to pass them on
    if (typeof buffer === 'string') {
      // file case
      image.src = buffer;
    } else if (typeof origin === 'string') {
      // url case
      const ext = origin.split('.').pop().toLowerCase();
      image.src = this.#createDataUri(buffer, ext);
    }
  }

  /**
   * Abort load.
   */
  abort() {
    this.setLoading(false);
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
    return value === 'jpeg' ||
      value === 'jpg' ||
      value === 'png' ||
      value === 'gif';
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'rawimage';
  }

  /**
   * Check if the loader supports the input media type.
   *
   * @param {string} value The media type.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(value) {
    return value.startsWith('image/');
  }

  /**
   * Get the file content type needed by the loader.
   *
   * @returns {number} One of the 'fileContentTypes'.
   */
  loadFileAs() {
    return fileContentTypes.DataURL;
  }

  /**
   * Get the url content type needed by the loader.
   *
   * @returns {number} One of the 'urlContentTypes'.
   */
  loadUrlAs() {
    return urlContentTypes.ArrayBuffer;
  }

} // class RawImageLoader
