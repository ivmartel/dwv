// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw image loader.
 *
 * @class
 */
dwv.io.RawImageLoader = function () {
  // closure to self
  var self = this;

  /**
   * if abort is triggered, all image.onload callbacks have to be cancelled
   *
   * @type {boolean}
   * @private
   */
  var aborted = false;

  /**
   * Set the loader options.
   *
   * @param {object} _opt The input options.
   */
  this.setOptions = function (_opt) {
    // does nothing
  };

  /**
   * Is the load ongoing? TODO...
   *
   * @returns {boolean} True if loading.
   */
  this.isLoading = function () {
    return true;
  };

  /**
   * Create a Data URI from an HTTP request response.
   *
   * @param {object} response The HTTP request response.
   * @param {string} dataType The data type.
   * @returns {string} The data URI.
   * @private
   */
  function createDataUri(response, dataType) {
    // image type
    var imageType = dataType;
    if (!imageType || imageType === 'jpg') {
      imageType = 'jpeg';
    }
    // create uri
    var file = new Blob([response], {type: 'image/' + imageType});
    return window.URL.createObjectURL(file);
  }

  /**
   * Load data.
   *
   * @param {object} buffer The read data.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  this.load = function (buffer, origin, index) {
    aborted = false;
    // create a DOM image
    var image = new Image();
    // triggered by ctx.drawImage
    image.onload = function (/*event*/) {
      try {
        if (!aborted) {
          self.onprogress({
            lengthComputable: true,
            loaded: 100,
            total: 100,
            index: index,
            source: origin
          });
          self.onload(dwv.image.getViewFromDOMImage(this, origin));
        }
      } catch (error) {
        self.onerror({
          error: error,
          source: origin
        });
      } finally {
        self.onloadend({
          source: origin
        });
      }
    };
    // storing values to pass them on
    image.origin = origin;
    image.index = index;
    if (typeof origin === 'string') {
      // url case
      var ext = origin.split('.').pop().toLowerCase();
      image.src = createDataUri(buffer, ext);
    } else {
      image.src = buffer;
    }
  };

  /**
   * Abort load.
   */
  this.abort = function () {
    aborted = true;
    self.onabort({});
    self.onloadend({});
  };

}; // class RawImageLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.RawImageLoader.prototype.canLoadFile = function (file) {
  return file.type.match('image.*');
};

/**
 * Check if the loader can load the provided url.
 *
 * @param {string} url The url to check.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.RawImageLoader.prototype.canLoadUrl = function (url) {
  var urlObjext = dwv.utils.getUrlFromUri(url);
  // extension
  var ext = dwv.utils.getFileExtension(urlObjext.pathname);
  var hasImageExt = (ext === 'jpeg') || (ext === 'jpg') ||
            (ext === 'png') || (ext === 'gif');
    // content type (for wado url)
  var contentType = urlObjext.searchParams.get('contentType');
  var hasContentType = contentType !== null &&
        typeof contentType !== 'undefined';
  var hasImageContentType = (contentType === 'image/jpeg') ||
        (contentType === 'image/png') ||
        (contentType === 'image/gif');

  return hasContentType ? hasImageContentType : hasImageExt;
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.RawImageLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.DataURL;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.RawImageLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.RawImageLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.io.RawImageLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.io.RawImageLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.RawImageLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.RawImageLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.RawImageLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('RawImageLoader');
