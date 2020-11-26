// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};
/**
 * The zip library.
 *
 * @external JSZip
 * @see https://github.com/Stuk/jszip
 */
var JSZip = JSZip || {};

/**
 * ZIP data loader.
 *
 * @class
 */
dwv.io.ZipLoader = function () {
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

  var filename = '';
  var files = [];
  var zobjs = null;

  /**
   * JSZip.async callback
   *
   * @param {ArrayBuffer} content unzipped file image
   * @param {object} origin The origin of the file.
   * @param {number} index The data index.
   * @private
   */
  function zipAsyncCallback(content, origin, index) {
    files.push({'filename': filename, 'data': content});

    // sent un-ziped progress with the data index
    // (max 50% to take into account the memory loading)
    var unzipPercent = files.length * 100 / zobjs.length;
    self.onprogress({
      lengthComputable: true,
      loaded: (unzipPercent / 2),
      total: 100,
      index: index,
      item: {
        loaded: unzipPercent,
        total: 100,
        source: origin
      }
    });

    // recursively call until we have all the files
    if (files.length < zobjs.length) {
      var num = files.length;
      filename = zobjs[num].name;
      zobjs[num].async('arrayBuffer').then(function (content) {
        zipAsyncCallback(content, origin, index);
      });
    } else {
      var memoryIO = new dwv.io.MemoryLoader();
      // memoryIO.onloadstart: nothing to do
      memoryIO.onprogress = function (progress) {
        // add 50% to take into account the un-zipping
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
      memoryIO.load(files);
    }
  }

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

    JSZip.loadAsync(buffer).then(function (zip) {
      files = [];
      zobjs = zip.file(/.*\.dcm/);
      // recursively load zip files into the files array
      var num = files.length;
      filename = zobjs[num].name;
      zobjs[num].async('arrayBuffer').then(function (content) {
        zipAsyncCallback(content, origin, index);
      });
    });
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

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadFile = function (file) {
  var ext = dwv.utils.getFileExtension(file.name);
  return (ext === 'zip');
};

/**
 * Check if the loader can load the provided url.
 *
 * @param {string} url The url to check.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadUrl = function (url) {
  var urlObjext = dwv.utils.getUrlFromUri(url);
  var ext = dwv.utils.getFileExtension(urlObjext.pathname);
  return (ext === 'zip');
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.ZipLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.ArrayBuffer;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.ZipLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.ZipLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a load progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.io.ZipLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event fired
 *   when a file item has been loaded successfully.
 */
dwv.io.ZipLoader.prototype.onloaditem = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.ZipLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.ZipLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.ZipLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.ZipLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('ZipLoader');
