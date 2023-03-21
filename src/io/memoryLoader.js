import {MultiProgressHandler} from '../utils/progress';
import {LoaderList} from './loaderList';

/**
 * Memory loader.
 *
 * @class
 */
export class MemoryLoader {

  /**
   * Input data.
   *
   * @private
   * @type {Array}
   */
  #inputData = null;

  /**
   * Data loader.
   *
   * @private
   * @type {object}
   */
  #runningLoader = null;

  /**
   * Number of loaded data.
   *
   * @private
   * @type {number}
   */
  #nLoad = 0;

  /**
   * Number of load end events.
   *
   * @private
   * @type {number}
   */
  #nLoadend = 0;

  /**
   * The default character set (optional).
   *
   * @private
   * @type {string}
   */
  #defaultCharacterSet;

  /**
   * Get the default character set.
   *
   * @returns {string} The default character set.
   */
  getDefaultCharacterSet() {
    return this.#defaultCharacterSet;
  }

  /**
   * Set the default character set.
   *
   * @param {string} characterSet The character set.
   */
  setDefaultCharacterSet(characterSet) {
    this.#defaultCharacterSet = characterSet;
  }

  /**
   * Store the current input.
   *
   * @param {object} data The input data.
   * @private
   */
  #storeInputData(data) {
    this.#inputData = data;
    // reset counters
    this.#nLoad = 0;
    this.#nLoadend = 0;
    // clear storage
    this.#clearStoredLoader();
  }

  /**
   * Store the launched loader.
   *
   * @param {object} loader The launched loader.
   * @private
   */
  #storeLoader(loader) {
    this.#runningLoader = loader;
  }

  /**
   * Clear the stored loader.
   *
   * @private
   */
  #clearStoredLoader() {
    this.#runningLoader = null;
  }

  /**
   * Launch a load item event and call addLoad.
   *
   * @param {object} event The load data event.
   * @private
   */
  #addLoadItem(event) {
    this.onloaditem(event);
    this.#addLoad();
  }

  /**
   * Increment the number of loaded data
   *   and call onload if loaded all data.
   *
   * @param {object} _event The load data event.
   * @private
   */
  #addLoad = (_event) => {
    this.#nLoad++;
    // call onload when all is loaded
    // (not using the input event since it is not the
    //   general load)
    if (this.#nLoad === this.#inputData.length) {
      this.onload({
        source: this.#inputData
      });
    }
  };

  /**
   * Increment the counter of load end events
   *   and run callbacks when all done, erroneus or not.
   *
   * @param {object} _event The load end event.
   * @private
   */
  #addLoadend = (_event) => {
    this.#nLoadend++;
    // call onloadend when all is run
    // (not using the input event since it is not the
    //   general load end)
    if (this.#nLoadend === this.#inputData.length) {
      this.onloadend({
        source: this.#inputData
      });
    }
  };

  /**
   * Load a list of buffers.
   *
   * @param {Array} data The list of buffers to load.
   */
  load(data) {
    // check input
    if (typeof data === 'undefined' || data.length === 0) {
      return;
    }
    this.#storeInputData(data);

    // send start event
    this.onloadstart({
      source: data
    });

    // create prgress handler
    var mproghandler = new MultiProgressHandler(this.onprogress);
    mproghandler.setNToLoad(data.length);
    mproghandler.setNumberOfDimensions(1);

    // create loaders
    var loaders = [];
    for (var m = 0; m < LoaderList.length; ++m) {
      loaders.push(new LoaderList[m]());
    }

    // find an appropriate loader
    var dataElement = data[0];
    var loader = null;
    var foundLoader = false;
    for (var l = 0; l < loaders.length; ++l) {
      loader = loaders[l];
      if (loader.canLoadMemory(dataElement)) {
        foundLoader = true;
        // load options
        loader.setOptions({
          numberOfFiles: data.length,
          defaultCharacterSet: this.getDefaultCharacterSet()
        });
        // set loader callbacks
        // loader.onloadstart: nothing to do
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(0);
        if (typeof loader.onloaditem === 'undefined') {
          // handle loaditem locally
          loader.onload = this.#addLoadItem;
        } else {
          loader.onloaditem = this.onloaditem;
          loader.onload = this.#addLoad;
        }
        loader.onloadend = this.#addLoadend;
        loader.onerror = this.onerror;
        loader.onabort = this.onabort;

        // store loader
        this.#storeLoader(loader);
        // exit
        break;
      }
    }
    if (!foundLoader) {
      throw new Error('No loader found for data: ' + dataElement.filename);
    }

    // loop on I/O elements
    for (var i = 0; i < data.length; ++i) {
      dataElement = data[i];
      // check loader
      if (!loader.canLoadMemory(dataElement)) {
        throw new Error('Input data of different type: ' +
          dataElement.filename);
      }
      // read
      loader.load(dataElement.data, dataElement.filename, i);
    }
  }

  /**
   * Abort a load.
   */
  abort() {
    // abort loader
    if (this.#runningLoader && this.#runningLoader.isLoading()) {
      this.#runningLoader.abort();
    }
  }

  /**
   * Handle a load start event.
   * Default does nothing.
   *
   * @param {object} _event The load start event.
   */
  onloadstart(_event) {}

  /**
   * Handle a load progress event.
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
   * Handle a load end event.
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

} // class MemoryLoader
