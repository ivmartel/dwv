// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * DICOM data loader.
 *
 * @class
 */
dwv.io.DicomDataLoader = function () {
  // closure to self
  var self = this;

  /**
   * Loader options.
   *
   * @private
   * @type {object}
   */
  var options = {};

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
   * @param {object} opt The input options.
   */
  this.setOptions = function (opt) {
    options = opt;
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
   * DICOM buffer to dwv.image.View (asynchronous)
   *
   * @private
   */
  var db2v = new dwv.image.DicomBufferToView();

  /**
   * Load data.
   *
   * @param {object} buffer The DICOM buffer.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  this.load = function (buffer, origin, index) {
    // setup db2v ony once
    if (!isLoading) {
      // pass options
      db2v.setOptions(options);
      // connect handlers
      db2v.onloadstart = self.onloadstart;
      db2v.onprogress = self.onprogress;
      db2v.onloaditem = self.onloaditem;
      db2v.onload = self.onload;
      db2v.onloadend = function (event) {
        // reset loading flag
        isLoading = false;
        // call listeners
        self.onloadend(event);
      };
      db2v.onerror = self.onerror;
      db2v.onabort = self.onabort;
    }

    // set loading flag
    isLoading = true;
    // convert
    db2v.convert(buffer, origin, index);
  };

  /**
   * Abort load.
   */
  this.abort = function () {
    // reset loading flag
    isLoading = false;
    // abort conversion, will trigger db2v.onabort
    db2v.abort();
  };

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadFile = function (file) {
  var ext = dwv.utils.getFileExtension(file.name);
  var hasNoExt = (ext === null);
  var hasDcmExt = (ext === 'dcm');
  return hasNoExt || hasDcmExt;
};

/**
 * Check if the loader can load the provided url.
 * True if:
 *  - the url has a 'contentType' and it is 'application/dicom'
 *    (as in wado urls)
 *  - the url has no 'contentType' and no extension or the extension is 'dcm'
 *
 * @param {string} url The url to check.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadUrl = function (url) {
  var urlObjext = dwv.utils.getUrlFromUri(url);
  // extension
  var ext = dwv.utils.getFileExtension(urlObjext.pathname);
  var hasNoExt = (ext === null);
  var hasDcmExt = (ext === 'dcm');
  // content type (for wado url)
  var contentType = urlObjext.searchParams.get('contentType');
  var hasContentType = contentType !== null &&
        typeof contentType !== 'undefined';
  var hasDicomContentType = (contentType === 'application/dicom');

  return hasContentType ? hasDicomContentType : (hasNoExt || hasDcmExt);
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.DicomDataLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.ArrayBuffer;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.DicomDataLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.DicomDataLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a progress event.
 * Default does nothing.
 *
 * @param {object} _event The load progress event.
 */
dwv.io.DicomDataLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event fired
 *   when a file item has been loaded successfully.
 */
dwv.io.DicomDataLoader.prototype.onloaditem = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.DicomDataLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.DicomDataLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.DicomDataLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.DicomDataLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('DicomDataLoader');
