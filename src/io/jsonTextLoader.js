// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * JSON text loader.
 *
 * @class
 */
dwv.io.JSONTextLoader = function () {
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
   * @param {object} text The input text.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  this.load = function (text, origin, index) {
    // set loading flag
    isLoading = true;
    self.onloadstart({
      source: origin
    });

    try {
      self.onprogress({
        lengthComputable: true,
        loaded: 100,
        total: 100,
        index: index,
        source: origin
      });
      self.onload({
        data: text,
        source: origin
      });
    } catch (error) {
      self.onerror({
        error: error,
        source: origin
      });
    } finally {
      // reset loading flag
      isLoading = false;
      self.onloadend({
        source: origin
      });
    }
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

}; // class JSONTextLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadFile = function (file) {
  var ext = dwv.utils.getFileExtension(file.name);
  return (ext === 'json');
};

/**
 * Check if the loader can load the provided url.
 *
 * @param {string} url The url to check.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadUrl = function (url) {
  var urlObjext = dwv.utils.getUrlFromUri(url);
  var ext = dwv.utils.getFileExtension(urlObjext.pathname);
  return (ext === 'json');
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.JSONTextLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.Text;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.JSONTextLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.Text;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.JSONTextLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a progress event.
 * Default does nothing.
 *
 * @param {object} _event The load progress event.
 */
dwv.io.JSONTextLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.JSONTextLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.JSONTextLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.JSONTextLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.JSONTextLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('JSONTextLoader');
