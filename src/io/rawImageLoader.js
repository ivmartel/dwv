import {startsWith, getFileExtension} from '../utils/string.js';
import {getUrlFromUri} from '../utils/uri.js';
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
          return this.canLoadAcceptHeader(acceptHeader.value);
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
    const hasImageContentType =
      hasContentType && this.canLoadContentType(contentType);

    return hasContentType ? hasImageContentType : hasImageExt;
  }


  /**
   * Check if the loader supports the input accept header.
   *
   * @param {string} value The accept header value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadAcceptHeader(value) {
    // starts with 'image/'
    return startsWith(value, 'image/');
  }

  /**
   * Check if the loader supports the input content type.
   *
   * @param {string} value The content type value.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadContentType(value) {
    return value === 'image/jpeg' ||
      value === 'image/png' ||
      value === 'image/gif';
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
