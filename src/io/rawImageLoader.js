import {startsWith, getFileExtension} from '../utils/string';
import {getUrlFromUri} from '../utils/uri';
import {getViewFromDOMImage} from '../image/domReader';
import {fileContentTypes} from './filesLoader';
import {urlContentTypes} from './urlsLoader';

/**
 * Raw image loader.
 */
export class RawImageLoader {

  /**
   * If abort is triggered, all image.onload callbacks have to be cancelled.
   *
   * @type {boolean}
   */
  #aborted = false;

  /**
   * Set the loader options.
   *
   * @param {object} _opt The input options.
   */
  setOptions(_opt) {
    // does nothing
  }

  /**
   * Is the load ongoing? TODO...
   *
   * @returns {boolean} True if loading.
   */
  isLoading() {
    return true;
  }

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
    const file = new Blob([response], {type: 'image/' + imageType});
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
    this.#aborted = false;
    // create a DOM image
    const image = new Image();
    // triggered by ctx.drawImage
    image.onload = (/*event*/) => {
      try {
        if (!this.#aborted) {
          this.onprogress({
            lengthComputable: true,
            loaded: 100,
            total: 100,
            index: index,
            source: origin
          });
          const data = getViewFromDOMImage(image, origin, index);
          // only expecting one item
          this.onloaditem(data);
          this.onload(data);
        }
      } catch (error) {
        this.onerror({
          error: error,
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
    this.#aborted = true;
    this.onabort({});
    this.onloadend({});
  }

  /**
   * Check if the loader can load the provided file.
   * True for files with type 'image.*'.
   *
   * @param {File} file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(file) {
    return (typeof file.type !== 'undefined' &&
      file.type.match('image.*') !== null);
  }

  /**
   * Check if the loader can load the provided url.
   * True if one of the folowing conditions is true:
   * - the `options.forceLoader` is 'rawimage',
   * - the `options.requestHeaders` contains an item
   *   starting with 'Accept: image/'.
   * - the url has a 'contentType' and it is 'image/jpeg', 'image/png'
   *   or 'image/gif' (as in wado urls),
   * - the url has no 'contentType' and the extension is 'jpeg', 'jpg',
   *   'png' or 'gif'.
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
        options.forceLoader === 'rawimage') {
        return true;
      }
      // check options.requestHeaders for 'Accept'
      if (typeof options.requestHeaders !== 'undefined') {
        const isNameAccept = function (element) {
          return element.name === 'Accept';
        };
        const acceptHeader = options.requestHeaders.find(isNameAccept);
        if (typeof acceptHeader !== 'undefined') {
          // starts with 'image/'
          return startsWith(acceptHeader.value, 'image/');
        }
      }
    }

    const urlObjext = getUrlFromUri(url);
    // extension
    const ext = getFileExtension(urlObjext.pathname);
    const hasImageExt = (ext === 'jpeg') || (ext === 'jpg') ||
      (ext === 'png') || (ext === 'gif');
    // content type (for wado url)
    const contentType = urlObjext.searchParams.get('contentType');
    const hasContentType = contentType !== null &&
      typeof contentType !== 'undefined';
    const hasImageContentType = (contentType === 'image/jpeg') ||
      (contentType === 'image/png') ||
      (contentType === 'image/gif');

    return hasContentType ? hasImageContentType : hasImageExt;
  }

  /**
   * Check if the loader can load the provided memory object.
   *
   * @param {object} mem The memory object.
   * @returns {boolean} True if the object can be loaded.
   */
  canLoadMemory(mem) {
    if (typeof mem.filename !== 'undefined') {
      const tmpFile = new File(['from memory'], mem.filename);
      return this.canLoadFile(tmpFile);
    }
    return false;
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

} // class RawImageLoader