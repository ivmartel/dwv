// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.io = dwv.io || {};

// file content types
dwv.io.fileContentTypes = {
  'Text': 0,
  'ArrayBuffer': 1,
  'DataURL': 2
};

/**
 * Files loader.
 *
 * @class
 */
dwv.io.FilesLoader = function () {
  /**
   * Closure to self.
   *
   * @private
   * @type {object}
   */
  var self = this;

  /**
   * Input data.
   *
   * @private
   * @type {Array}
   */
  var inputData = null;

  /**
   * Array of launched file readers.
   *
   * @private
   * @type {Array}
   */
  var readers = [];

  /**
   * Data loader.
   *
   * @private
   * @type {object}
   */
  var runningLoader = null;

  /**
   * Number of loaded data.
   *
   * @private
   * @type {number}
   */
  var nLoad = 0;

  /**
   * Number of load end events.
   *
   * @private
   * @type {number}
   */
  var nLoadend = 0;

  /**
   * The default character set (optional).
   *
   * @private
   * @type {string}
   */
  var defaultCharacterSet;

  /**
   * Get the default character set.
   *
   * @returns {string} The default character set.
   */
  this.getDefaultCharacterSet = function () {
    return defaultCharacterSet;
  };

  /**
   * Set the default character set.
   *
   * @param {string} characterSet The character set.
   */
  this.setDefaultCharacterSet = function (characterSet) {
    defaultCharacterSet = characterSet;
  };

  /**
   * Store the current input.
   *
   * @param {object} data The input data.
   * @private
   */
  function storeInputData(data) {
    inputData = data;
    // reset counters
    nLoad = 0;
    nLoadend = 0;
    // clear storage
    clearStoredReaders();
    clearStoredLoader();
  }

  /**
   * Store a launched reader.
   *
   * @param {object} reader The launched reader.
   * @private
   */
  function storeReader(reader) {
    readers.push(reader);
  }

  /**
   * Clear the stored readers.
   *
   * @private
   */
  function clearStoredReaders() {
    readers = [];
  }

  /**
   * Store the launched loader.
   *
   * @param {object} loader The launched loader.
   * @private
   */
  function storeLoader(loader) {
    runningLoader = loader;
  }

  /**
   * Clear the stored loader.
   *
   * @private
   */
  function clearStoredLoader() {
    runningLoader = null;
  }

  /**
   * Launch a load item event and call addLoad.
   *
   * @param {object} event The load data event.
   * @private
   */
  function addLoadItem(event) {
    self.onloaditem(event);
    addLoad();
  }

  /**
   * Increment the number of loaded data
   *   and call onload if loaded all data.
   *
   * @param {object} _event The load data event.
   * @private
   */
  function addLoad(_event) {
    nLoad++;
    // call self.onload when all is loaded
    // (not using the input event since it is not the
    //   general load)
    if (nLoad === inputData.length) {
      self.onload({
        source: inputData
      });
    }
  }

  /**
   * Increment the counter of load end events
   *   and run callbacks when all done, erroneus or not.
   *
   * @param {object} _event The load end event.
   * @private
   */
  function addLoadend(_event) {
    nLoadend++;
    // call self.onloadend when all is run
    // (not using the input event since it is not the
    //   general load end)
    // x2 to count for reader + load
    if (nLoadend === 2 * inputData.length) {
      self.onloadend({
        source: inputData
      });
    }
  }

  /**
   * Augment a callback event with a srouce.
   *
   * @param {object} callback The callback to augment its event.
   * @param {object} source The source to add to the event.
   * @returns {Function} The augmented callback.
   * @private
   */
  function augmentCallbackEvent(callback, source) {
    return function (event) {
      event.source = source;
      callback(event);
    };
  }

  /**
   * Load a list of files.
   *
   * @param {Array} data The list of files to load.
   */
  this.load = function (data) {
    // check input
    if (typeof data === 'undefined' || data.length === 0) {
      return;
    }
    storeInputData(data);

    // send start event
    this.onloadstart({
      source: data
    });

    // create prgress handler
    var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
    mproghandler.setNToLoad(data.length);

    // create loaders
    var loaders = [];
    for (var m = 0; m < dwv.io.loaderList.length; ++m) {
      loaders.push(new dwv.io[dwv.io.loaderList[m]]());
    }

    // find an appropriate loader
    var dataElement = data[0];
    var loader = null;
    var foundLoader = false;
    for (var l = 0; l < loaders.length; ++l) {
      loader = loaders[l];
      if (loader.canLoadFile(dataElement)) {
        foundLoader = true;
        // load options
        loader.setOptions({
          'defaultCharacterSet': this.getDefaultCharacterSet()
        });
        // set loader callbacks
        // loader.onloadstart: nothing to do
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
        if (typeof loader.onloaditem === 'undefined') {
          // handle load-item locally
          loader.onload = addLoadItem;
        } else {
          loader.onloaditem = self.onloaditem;
          loader.onload = addLoad;
        }
        loader.onloadend = addLoadend;
        loader.onerror = self.onerror;
        loader.onabort = self.onabort;

        // store loader
        storeLoader(loader);
        // exit
        break;
      }
    }
    if (!foundLoader) {
      throw new Error('No loader found for file: ' + dataElement);
    }

    var getLoadHandler = function (loader, dataElement, i) {
      return function (event) {
        loader.load(event.target.result, dataElement, i);
      };
    };

    // loop on I/O elements
    for (var i = 0; i < data.length; ++i) {
      dataElement = data[i];

      // check loader
      if (!loader.canLoadFile(dataElement)) {
        throw new Error('Input file of different type: ' + dataElement);
      }

      /**
       * The file reader.
       *
       * @external FileReader
       * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
       */
      var reader = new FileReader();
      // store reader
      storeReader(reader);

      // set reader callbacks
      // reader.onloadstart: nothing to do
      reader.onprogress = augmentCallbackEvent(
        mproghandler.getMonoProgressHandler(i, 0), dataElement);
      reader.onload = getLoadHandler(loader, dataElement, i);
      reader.onloadend = addLoadend;
      reader.onerror = augmentCallbackEvent(self.onerror, dataElement);
      reader.onabort = augmentCallbackEvent(self.onabort, dataElement);
      // read
      if (loader.loadFileAs() === dwv.io.fileContentTypes.Text) {
        reader.readAsText(dataElement);
      } else if (loader.loadFileAs() === dwv.io.fileContentTypes.DataURL) {
        reader.readAsDataURL(dataElement);
      } else if (loader.loadFileAs() === dwv.io.fileContentTypes.ArrayBuffer) {
        reader.readAsArrayBuffer(dataElement);
      }
    }
  };

  /**
   * Abort a load.
   */
  this.abort = function () {
    // abort readers
    for (var i = 0; i < readers.length; ++i) {
      // 0: EMPTY, 1: LOADING, 2: DONE
      if (readers[i].readyState === 1) {
        readers[i].abort();
      }
    }
    // abort loader
    if (runningLoader && runningLoader.isLoading()) {
      runningLoader.abort();
    }
  };

}; // class FilesLoader

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.FilesLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a load progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.io.FilesLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event fired
 *   when a file item has been loaded successfully.
 */
dwv.io.FilesLoader.prototype.onloaditem = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.FilesLoader.prototype.onload = function (_event) {};
/**
 * Handle a load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.FilesLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.FilesLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.FilesLoader.prototype.onabort = function (_event) {};
