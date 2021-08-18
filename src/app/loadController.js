// namespaces
var dwv = dwv || {};
dwv.ctrl = dwv.ctrl || {};

/**
 * Load controller.
 *
 * @param {string} defaultCharacterSet The default character set.
 * @class
 */
dwv.ctrl.LoadController = function (defaultCharacterSet) {
  // closure to self
  var self = this;
  // current loaders
  var currentLoaders = {};

  // load counter
  var counter = -1;

  /**
   * Get the next load id.
   *
   * @returns {number} The next id.
   */
  function getNextLoadId() {
    ++counter;
    return counter;
  }

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {Array} files The list of files to load.
   */
  this.loadFiles = function (files) {
    // has been checked for emptiness.
    var ext = files[0].name.split('.').pop().toLowerCase();
    if (ext === 'json') {
      loadStateFile(files[0]);
    } else {
      loadImageFiles(files);
    }
  };

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} options The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   */
  this.loadURLs = function (urls, options) {
    // has been checked for emptiness.
    var ext = urls[0].split('.').pop().toLowerCase();
    if (ext === 'json') {
      loadStateUrl(urls[0], options);
    } else {
      loadImageUrls(urls, options);
    }
  };

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: "", filename: "", data: data}].
   */
  this.loadImageObject = function (data) {
    // create IO
    var memoryIO = new dwv.io.MemoryLoader();
    // load data
    loadData(data, memoryIO, 'image');
  };

  /**
   * Abort the current loaders.
   */
  this.abort = function () {
    var keys = Object.keys(currentLoaders);
    for (var i = 0; i < keys.length; ++i) {
      currentLoaders[i].loader.abort();
      delete currentLoaders[i];
    }
  };

  // private ----------------------------------------------------------------

  /**
   * Load a list of image files.
   *
   * @param {Array} files The list of image files to load.
   * @private
   */
  function loadImageFiles(files) {
    // create IO
    var fileIO = new dwv.io.FilesLoader();
    fileIO.setDefaultCharacterSet(defaultCharacterSet);
    // load data
    loadData(files, fileIO, 'image');
  }

  /**
   * Load a list of image URLs.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} options The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   * @private
   */
  function loadImageUrls(urls, options) {
    // create IO
    var urlIO = new dwv.io.UrlsLoader();
    urlIO.setDefaultCharacterSet(defaultCharacterSet);
    // load data
    loadData(urls, urlIO, 'image', options);
  }

  /**
   * Load a State file.
   *
   * @param {string} file The state file to load.
   * @private
   */
  function loadStateFile(file) {
    // create IO
    var fileIO = new dwv.io.FilesLoader();
    // load data
    loadData([file], fileIO, 'state');
  }

  /**
   * Load a State url.
   *
   * @param {string} url The state url to load.
   * @param {object} options The load options:
   * - requestHeaders: an array of {name, value} to use as request headers.
   * - withCredentials: credentials flag to pass to the request.
   * @private
   */
  function loadStateUrl(url, options) {
    // create IO
    var urlIO = new dwv.io.UrlsLoader();
    // load data
    loadData([url], urlIO, 'state', options);
  }

  /**
   * Load a list of data.
   *
   * @param {Array} data Array of data to load.
   * @param {object} loader The data loader.
   * @param {string} loadType The data load type: 'image' or 'state'.
   * @param {object} options Options passed to the final loader.
   * @private
   */
  function loadData(data, loader, loadType, options) {
    var loadId = getNextLoadId();
    var eventInfo = {
      loadtype: loadType,
      loadid: loadId
    };
    // set callbacks
    loader.onloadstart = function (event) {
      // store loader to allow abort
      currentLoaders[loadId] = {
        loader: loader,
        isFirstItem: true
      };
      // callback
      augmentCallbackEvent(self.onloadstart, eventInfo)(event);
    };
    loader.onprogress = augmentCallbackEvent(self.onprogress, eventInfo);
    loader.onloaditem = function (event) {
      var isFirstItem = currentLoaders[loadId].isFirstItem;
      var eventInfoItem = {
        loadtype: loadType,
        loadid: loadId,
        isfirstitem: isFirstItem
      };
      augmentCallbackEvent(self.onloaditem, eventInfoItem)(event);
      if (isFirstItem) {
        currentLoaders[loadId].isFirstItem = false;
      }
    };
    loader.onload = augmentCallbackEvent(self.onload, eventInfo);
    loader.onloadend = function (event) {
      // reset current loader
      delete currentLoaders[loadId];
      // callback
      augmentCallbackEvent(self.onloadend, eventInfo)(event);
    };
    loader.onerror = augmentCallbackEvent(self.onerror, eventInfo);
    loader.onabort = augmentCallbackEvent(self.onabort, eventInfo);
    // launch load
    try {
      loader.load(data, options);
    } catch (error) {
      self.onerror({
        error: error,
        loadId: loadId
      });
      self.onloadend({
        loadId: loadId
      });
      return;
    }
  }

  /**
   * Augment a callback event: adds loadtype to the event
   *  passed to a callback.
   *
   * @param {object} callback The callback to update.
   * @param {object} info Info object to append to the event.
   * @returns {object} A function representing the modified callback.
   */
  function augmentCallbackEvent(callback, info) {
    return function (event) {
      var keys = Object.keys(info);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        event[key] = info[key];
      }
      callback(event);
    };
  }

}; // class LoadController

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.ctrl.LoadController.prototype.onloadstart = function (_event) {};
/**
 * Handle a load progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.ctrl.LoadController.prototype.onprogress = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.ctrl.LoadController.prototype.onload = function (_event) {};
/**
 * Handle a load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.ctrl.LoadController.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.ctrl.LoadController.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.ctrl.LoadController.prototype.onabort = function (_event) {};
