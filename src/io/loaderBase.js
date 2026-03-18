import {getUrlFromUri} from '../utils/uri.js';
import {getFileExtension} from '../utils/string.js';

/**
 * Base class for single data loaders.
 *
 * Provides shared state (#options, #isLoading) and the seven
 * event-handler stubs that the orchestrators (FilesLoader, UrlsLoader)
 * assign per-instance before calling load().
 */
export class LoaderBase {

  /**
   * Loader options: {numberOfFiles, defaultCharacterSet}.
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
   * Get the loader options.
   *
   * @returns {object} The loader options.
   */
  getOptions() {
    return this.#options;
  }

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
   * Set the loading flag.
   *
   * @param {boolean} flag The loading flag value.
   */
  setLoading(flag) {
    this.#isLoading = flag;
  }

  /**
   * Check if the loader can load the provided file.
   * Default returns false.
   *
   * @param {File} _file The file to check.
   * @returns {boolean} True if the file can be loaded.
   */
  canLoadFile(_file) {
    return false;
  }

  /**
   * Check if the loader can load the provided url.
   * True if one of the folowing conditions is true:
   * - the `options.forceLoader` is the name of the loader,
   * - the `options.requestHeaders` contains a 'Accept' with
   *   a compatible MIME type,
   * - the url has a 'contentType' and it is a compatible MIME type
   *   (as in wado urls),
   * - the url has no 'contentType' and it has a compatible file extention.
   *
   * @param {string} url The url to check.
   * @param {object} [options] Optional url request options.
   * @returns {boolean} True if the url can be loaded.
   */
  canLoadUrl(url, options) {
    // check options
    if (typeof options !== 'undefined') {
      // check options.forceLoader
      // -> pass through if false
      if (typeof options.forceLoader !== 'undefined' &&
        this.isLoaderName(options.forceLoader)) {
        return true;
      }
      // check options.requestHeaders for 'Accept'
      // -> fail if wrong header
      if (typeof options.requestHeaders !== 'undefined') {
        const acceptHeader = options.requestHeaders.find(
          (element) => element.name === 'Accept'
        );
        if (typeof acceptHeader !== 'undefined') {
          // split comma-separated media types,
          // strip parameters (e.g. ;q=0.9) and whitespace
          const mediaTypes = acceptHeader.value.split(',').map(
            (entry) => entry.split(';')[0].trim()
          );
          return mediaTypes.some(
            (mediaType) => this.canLoadMediaType(mediaType)
          );
        }
      }
    }

    const urlObjext = getUrlFromUri(url);
    // extension
    const ext = getFileExtension(urlObjext.pathname);
    const calLoadExt = this.canLoadExtension(ext);
    // content type (for wado url): strip parameters before testing
    const contentType = urlObjext.searchParams.get('contentType');
    const hasContentType = contentType !== null &&
      typeof contentType !== 'undefined';
    const mediaType = hasContentType
      ? contentType.split(';')[0].trim()
      : undefined;
    const canLoadContentType =
      hasContentType && this.canLoadMediaType(mediaType);

    return hasContentType ? canLoadContentType : calLoadExt;
  }

  /**
   * Check if the loader supports the input extension.
   * Default returns false.
   *
   * @param {string} _value The extensione.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadExtension(_value) {
    return false;
  }

  /**
   * Check if the input is the loader name.
   * Default returns false.
   *
   * @param {string} _value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(_value) {
    return false;
  }

  /**
   * Check if the loader supports the input media type.
   * Called for both the Accept request header and the Content-Type of the
   * response (or memory object), after parameters have been stripped.
   * Default returns false.
   *
   * @param {string} _value The media type (e.g. 'application/dicom').
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(_value) {
    return false;
  }

  /**
   * Check if the loader can load the provided memory object.
   * Default checks content type or filename.
   *
   * @param {object} mem The memory object.
   * @returns {boolean} True if the object can be loaded.
   */
  canLoadMemory(mem) {
    // content type: strip parameters (e.g. ; boundary=...) before testing
    const contentType = mem['Content-Type'];
    if (typeof contentType !== 'undefined') {
      const mediaType = contentType.split(';')[0].trim();
      if (this.canLoadMediaType(mediaType)) {
        return true;
      }
    }
    // file
    if (typeof mem.filename !== 'undefined') {
      const tmpFile = new File(['from memory'], mem.filename);
      return this.canLoadFile(tmpFile);
    }
    return false;
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

} // class LoaderBase
