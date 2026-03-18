/**
 * Base class for single data loaders.
 *
 * Provides shared state (#options, #isLoading) and the seven
 * event-handler stubs that the orchestrators (FilesLoader, UrlsLoader)
 * assign per-instance before calling load().
 */
export class LoaderBase {

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
   * Default returns false.
   *
   * @param {string} _url The url to check.
   * @param {object} [_options] Optional url request options.
   * @returns {boolean} True if the url can be loaded.
   */
  canLoadUrl(_url, _options) {
    return false;
  }

  /**
   * Check if the loader can load the provided memory object.
   * Default checks if the memory object has a filename that
   * this loader can handle via canLoadFile.
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
