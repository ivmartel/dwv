import {fileContentTypes} from './filesLoader.js';
import {urlContentTypes} from './urlsLoader.js';
import {MemoryLoader} from './memoryLoader.js';
import {LoaderBase} from './loaderBase.js';

/**
 * The zip library.
 *
 * Ref: {@link https://github.com/Stuk/jszip}.
 *
 * @external JSZip
 */
import JSZip from 'jszip';

/**
 * ZIP data loader.
 */
export class ZipLoader extends LoaderBase {

  /**
   * Current file name.
   *
   * @type {string}
   */
  #filename = '';

  /**
   * List of files.
   *
   * @type {object[]}
   */
  #files = [];

  /**
   * Zip file objects.
   *
   * @type {object[]}
   */
  #zobjs = null;

  /**
   * JSZip.async callback.
   *
   * @param {ArrayBuffer} content Unzipped file image.
   * @param {string} origin The origin of the file.
   * @param {number} index The data index.
   */
  #zipAsyncCallback(content, origin, index) {
    this.#files.push({filename: this.#filename, data: content});

    // sent un-ziped progress with the data index
    // (max 50% to take into account the memory loading)
    const unzipPercent = this.#files.length * 100 / this.#zobjs.length;
    this.onprogress({
      lengthComputable: true,
      loaded: (unzipPercent / 2),
      total: 100,
      index,
      item: {
        loaded: unzipPercent,
        total: 100,
        source: origin
      }
    });

    // recursively call until we have all the files
    if (this.#files.length < this.#zobjs.length) {
      const num = this.#files.length;
      this.#filename = this.#zobjs[num].name;
      this.#zobjs[num].async('arrayBuffer').then((bufContent) => {
        this.#zipAsyncCallback(bufContent, origin, index);
      }).catch((err) => {
        this.setLoading(false);
        this.onerror({error: err});
        this.onloadend({});
      });
    } else {
      const memoryIO = new MemoryLoader();
      // memoryIO.onloadstart: nothing to do
      memoryIO.onprogress = (progress) => {
        // add 50% to take into account the un-zipping
        progress.loaded = 50 + progress.loaded / 2;
        // set data index
        progress.index = index;
        this.onprogress(progress);
      };
      memoryIO.onloaditem = this.onloaditem;
      memoryIO.onload = this.onload;
      memoryIO.onloadend = (event) => {
        // reset loading flag
        this.setLoading(false);
        // call listeners
        this.onloadend(event);
      };
      memoryIO.onerror = this.onerror;
      memoryIO.onabort = this.onabort;
      // launch
      memoryIO.load(this.#files);
    }
  }

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  load(buffer, origin, index) {
    // send start event
    this.onloadstart({
      source: origin
    });
    // set loading flag
    this.setLoading(true);

    JSZip.loadAsync(buffer).then((zip) => {
      this.#files = [];
      this.#zobjs = zip.file(/.*\.dcm/);
      if (this.#zobjs.length === 0) {
        this.setLoading(false);
        this.onerror({
          error: new Error('No DICOM file found in ZIP')
        });
        this.onloadend({});
        return;
      }
      // recursively load zip files into the files array
      this.#filename = this.#zobjs[0].name;
      this.#zobjs[0].async('arrayBuffer').then((content) => {
        this.#zipAsyncCallback(content, origin, index);
      }).catch((err) => {
        this.setLoading(false);
        this.onerror({error: err});
        this.onloadend({});
      });
    }).catch((err) => {
      this.setLoading(false);
      this.onerror({error: err});
      this.onloadend({});
    });
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
    return value === 'zip';
  }

  /**
   * Check if the input is the loader name.
   *
   * @param {string} value The test name.
   * @returns {boolean} True if input is the loader name.
   */
  isLoaderName(value) {
    return value === 'zip';
  }

  /**
   * Check if the loader supports the input media type.
   *
   * @param {string} value The media type.
   * @returns {boolean} True if it can be loaded.
   */
  canLoadMediaType(value) {
    return value === 'application/zip';
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

} // class ZipLoader
