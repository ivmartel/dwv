// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Multipart data loader.
 *
 * @class
 */
dwv.io.MultipartLoader = function () {
  // closure to self
  var self = this;

  /**
   * Loading flag.
   *
   * @private
   * @type {boolean}
   */
  var isLoading = false;

  /**
   * Set the loader options.
   *
   * @param {object} _opt The input options.
   */
  this.setOptions = function (_opt) {
    // does nothing
  };

  /**
   * Is the load ongoing?
   *
   * @returns {boolean} True if loading.
   */
  this.isLoading = function () {
    return isLoading;
  };

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  this.load = function (buffer, origin, index) {
    // send start event
    this.onloadstart({
      source: origin
    });
    // set loading flag
    isLoading = true;

    var memoryIO = new dwv.io.MemoryLoader();
    // memoryIO.onloadstart: nothing to do
    memoryIO.onprogress = function (progress) {
      // add 50% to take into account the un-Multipartping
      progress.loaded = 50 + progress.loaded / 2;
      // set data index
      progress.index = index;
      self.onprogress(progress);
    };
    memoryIO.onloaditem = self.onloaditem;
    memoryIO.onload = self.onload;
    memoryIO.onloadend = function (event) {
      // reset loading flag
      isLoading = false;
      // call listeners
      self.onloadend(event);
    };
    memoryIO.onerror = self.onerror;
    memoryIO.onabort = self.onabort;
    // launch
    memoryIO.load(dwv.utils.parseMultipart(buffer));
  };

  /**
   * Abort load: pass to listeners.
   */
  this.abort = function () {
    // reset loading flag
    isLoading = false;
    // call listeners
    self.onabort({});
    self.onloadend({});
  };

}; // class MultipartLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} _file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.MultipartLoader.prototype.canLoadFile = function (_file) {
  return false;
};

/**
 * Check if the loader can load the provided url.
 *
 * @param {string} url The url to check.
 * @param {object} options The url request options.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.MultipartLoader.prototype.canLoadUrl = function (url, options) {
  // if there are options.requestHeaders, just base check on them
  if (typeof options !== 'undefined' &&
    typeof options.requestHeaders !== 'undefined') {
    var isMultipart = function (element) {
      return element.name === 'Accept' &&
        dwv.utils.startsWith(element.value, 'multipart/related');
    };
    return typeof options.requestHeaders.find(isMultipart) !== 'undefined';
  }

  return false;
};

/**
 * Check if the loader can load the provided memory object.
 *
 * @param {object} _mem The memory object.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.MultipartLoader.prototype.canLoadMemory = function (_mem) {
  return false;
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.MultipartLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.ArrayBuffer;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.MultipartLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.MultipartLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a load progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.io.MultipartLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event fired
 *   when a file item has been loaded successfully.
 */
dwv.io.MultipartLoader.prototype.onloaditem = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.MultipartLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.MultipartLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.MultipartLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.MultipartLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('MultipartLoader');
