import {getViewFromDOMVideo} from '../image/domReader.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * Raw video loader.
 *
 * Url example (cors enabled):
 *   {@link https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4}.
 */
export class RawVideoLoader extends LoaderBase {

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
    const uri = `data:video/${ dataType
    };base64,${window.btoa(videoDataStr)}`;
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
    this.setLoading(true);
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
        if (this.isLoading()) {
          getViewFromDOMVideo(event.target,
            this.onloaditem, this.onload,
            this.onprogress, this.onloadend,
            origin, index);
        }
      } catch (error) {
        this.onerror({
          error,
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
    return value === 'mp4' ||
      value === 'ogg' ||
      value === 'webm';
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'rawvideo';
  }

  /**
   * Check if the loader supports the input media type.
   *
   * @param {string} value The media type.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(value) {
    return value.startsWith('video/');
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

} // class RawVideoLoader
