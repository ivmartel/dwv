/**
 * Shared test double for loaders selected by IO orchestrators.
 * It captures calls and emits a deterministic successful lifecycle.
 */
export class MockIoLoader {
  static instances = [];
  static readAsType = 0;
  static initialLoadingState = false;
  static expected = '.ok';

  options = null;
  loading = false;
  abortCalled = false;
  loaded = [];

  /**
   * Reset static state between tests.
   */
  static reset() {
    this.instances = [];
    this.readAsType = 0;
    this.initialLoadingState = false;
    this.expected = '.ok';
  }

  /**
   * Create a mock loader instance and track it.
   */
  constructor() {
    this.loading = this.constructor.initialLoadingState;
    this.constructor.instances.push(this);
  }

  /**
   * Check if the file name matches the expected pattern.
   *
   * @param {File} file The file to check.
   * @returns {boolean} True if the file is loadable.
   */
  canLoadFile(file) {
    return file.name.endsWith(this.constructor.expected);
  }

  /**
   * Check if the URL matches the expected pattern.
   *
   * @param {string} url The URL to check.
   * @returns {boolean} True if the URL is loadable.
   */
  canLoadUrl(url) {
    return url.endsWith(this.constructor.expected);
  }

  /**
   * Store options passed by the orchestrator.
   *
   * @param {object} options Loader options.
   */
  setOptions(options) {
    this.options = options;
  }

  /**
   * Return the configured file read mode.
   *
   * @returns {number} One of `fileContentTypes`.
   */
  loadFileAs() {
    return this.constructor.readAsType;
  }

  /**
   * Return the configured URL read mode.
   *
   * @returns {number} One of `urlContentTypes`.
   */
  loadUrlAs() {
    return this.constructor.readAsType;
  }

  /**
   * Simulate a successful loader lifecycle for one source.
   *
   * @param {string|ArrayBuffer} data Loaded payload.
   * @param {File|string} origin The source element.
   * @param {number} index The source index in the batch.
   */
  load(data, origin, index) {
    this.loading = true;
    this.loaded.push({data, origin, index});
    this.onloaditem({data, source: origin});
    this.onload({source: origin});
    this.onloadend({source: origin});
    this.loading = false;
  }

  /**
   * Tell if this mock loader is currently loading.
   *
   * @returns {boolean} The loading flag.
   */
  isLoading() {
    return this.loading;
  }

  /**
   * Simulate aborting the current loader run.
   */
  abort() {
    this.abortCalled = true;
    this.loading = false;
  }
}
