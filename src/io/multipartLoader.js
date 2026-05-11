import {parseMultipart} from '../utils/array.js';
import {MemoryLoader} from './memoryLoader.js';
import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * Multipart data loader.
 *
 * Accumulates parsed parts from every `load()` call (one per URL) and
 * hands them all to a single {@link MemoryLoader} once the last expected
 * URL has arrived. This lets N multipart URLs – each containing M DICOM
 * slices – be assembled correctly with `numberOfFiles = N × M`.
 */
export class MultipartLoader extends LoaderBase {

  /**
   * Total number of `load()` calls expected (= number of URLs in the
   * batch, taken from `options.numberOfFiles` on the first call).
   *
   * @type {number}
   */
  #expectedCalls = 0;

  /**
   * Number of `load()` calls received so far in the current batch.
   *
   * @type {number}
   */
  #receivedCalls = 0;

  /**
   * Accumulated parts from every parsed multipart buffer.
   *
   * @type {object[]}
   */
  #allParts = [];

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // initialise on the first call of a new batch
    if (this.#receivedCalls === 0) {
      this.#expectedCalls = this.getOptions().numberOfFiles ?? 1;
      this.#allParts = [];
      this.setLoading(true);
      this.onloadstart({
        source: origin
      });
    }

    // parse and accumulate parts from this URL
    const parts = parseMultipart(buffer);
    this.#allParts.push(...parts);
    this.#receivedCalls++;

    // wait until every expected URL has been parsed
    if (this.#receivedCalls < this.#expectedCalls) {
      return;
    }

    // all buffers received – hand all parts to one MemoryLoader
    const memoryIO = new MemoryLoader();
    // memoryIO.onloadstart: nothing to do
    memoryIO.onprogress = (progress) => {
      // add 50% to take into account the un-Multipartping
      progress.loaded = 50 + progress.loaded / 2;
      // set data index
      progress.index = index;
      this.onprogress(progress);
    };
    memoryIO.onloaditem = this.onloaditem;
    memoryIO.onload = (event) => {
      // fire onload once per original URL so that the
      // orchestrator (UrlsLoader/FilesLoader)
      // gets the N completions it expects
      for (let i = 0; i < this.#expectedCalls; i++) {
        this.onload(event);
      }
    };
    memoryIO.onloadend = (event) => {
      // reset loading flag and batch state before firing callbacks
      this.setLoading(false);
      this.#receivedCalls = 0;
      // fire onloadend once per original URL so that the
      // orchestrator (UrlsLoader/FilesLoader)
      // gets the N completions it expects
      const count = this.#expectedCalls;
      for (let i = 0; i < count; i++) {
        this.onloadend(event);
      }
    };
    memoryIO.onerror = this.onerror;
    memoryIO.onabort = this.onabort;
    // launch
    memoryIO.load(this.#allParts);
  }

  /**
   * Abort load: pass to listeners.
   */
  abort() {
    // reset loading flag and batch state
    this.setLoading(false);
    this.#receivedCalls = 0;
    // call listeners
    this.onabort({});
    this.onloadend({});
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'multipart';
  }

  /**
   * Check if the loader supports the input media type.
   *
   * @param {string} value The media type.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(value) {
    return value === 'multipart/related';
  }

  /**
   * Get the file content type needed by the loader.
   *
   * @returns {number} One of the 'fileContentTypes'.
   */
  loadFileAs() {
    return fileContentTypes.ArrayBuffer;
  }

  /**
   * Get the url content type needed by the loader.
   *
   * @returns {number} One of the 'urlContentTypes'.
   */
  loadUrlAs() {
    return urlContentTypes.ArrayBuffer;
  }

} // class MultipartLoader
