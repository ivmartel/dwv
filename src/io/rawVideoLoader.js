import {startsWith, getFileExtension} from '../utils/string';
import {getUrlFromUri} from '../utils/uri';
import {getViewFromDOMVideo} from '../image/domReader';
import {fileContentTypes} from './filesLoader';
import {urlContentTypes} from './urlsLoader';

/**
 * Raw video loader.
 *
 * Url example (cors enabled):
 *   {@link https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4}.
 */
export class RawVideoLoader {

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
   * @param {object} response The HTTP request response.
   * @param {string} dataType The data type.
   * @returns {string} The data URI.
   */
  #createDataUri(response, dataType) {
    // image data as string
    const bytes = new Uint8Array(response);
    let videoDataStr = '';
    for (let i = 0; i < bytes.byteLength; ++i) {
      videoDataStr += String.fromCharCode(bytes[i]);
    }
    // create uri
    const uri = 'data:video/' + dataType +
      ';base64,' + window.btoa(videoDataStr);
    return uri;
  }

  /**
   * Internal Data URI load.
   *
   * @param {object} buffer The read data.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // create a DOM video
    const video = document.createElement('video');
    if (typeof origin === 'string') {
      // url case
      const ext = origin.split('.').pop().toLowerCase();
      video.src = this.#createDataUri(buffer, ext);
    } else {
      video.src = buffer;
    }
    // onload handler
    video.onloadedmetadata = (event) => {
      try {
        getViewFromDOMVideo(event.target,
          this.onloaditem, this.onload,
          this.onprogress, this.onloadend,
          origin, index);
      } catch (error) {
        this.onerror({
          error: error,
          source: origin
        });
        this.onloadend({
          source: origin
        });
      }
    };
  }

  /**
   * Abort load.
   */
  abort() {
    this.onabort({});
    this.onloadend({});
  }

  /**
   * Check if the loader can load the provided file.
   * True for files with type 'video.*'.
   *
   * @param {File} file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(file) {
    return (typeof file.type !== 'undefined' &&
      file.type.match('video.*') !== null);
  }

  /**
   * Check if the loader can load the provided url.
   * True if one of the folowing conditions is true:
   * - the `options.forceLoader` is 'rawvideo',
   * - the `options.requestHeaders` contains an item
   *   starting with 'Accept: video/'.
   * - the url has a 'mp4', 'ogg' or 'webm' extension.
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
        options.forceLoader === 'rawvideo') {
        return true;
      }
      // check options.requestHeaders for 'Accept'
      if (typeof options.requestHeaders !== 'undefined') {
        const isNameAccept = function (element) {
          return element.name === 'Accept';
        };
        const acceptHeader = options.requestHeaders.find(isNameAccept);
        if (typeof acceptHeader !== 'undefined') {
          // starts with 'video/'
          return startsWith(acceptHeader.value, 'video/');
        }
      }
    }

    const urlObjext = getUrlFromUri(url);
    const ext = getFileExtension(urlObjext.pathname);
    return (ext === 'mp4') ||
      (ext === 'ogg') ||
      (ext === 'webm');
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
   * when a file item has been loaded successfully.
   */
  onloaditem(_event) {}

  /**
   * Handle a load event.
   * Default does nothing.
   *
   * @param {object} _event The load event fired
   * when a file has been loaded successfully.
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

} // class RawVideoLoader
