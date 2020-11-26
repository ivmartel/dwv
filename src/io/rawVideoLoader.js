// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw video loader.
 * url example (cors enabled):
 *   https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4
 *
 * @class
 */
dwv.io.RawVideoLoader = function () {
  // closure to self
  var self = this;

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
    // image data as string
    var bytes = new Uint8Array(response);
    var videoDataStr = '';
    for (var i = 0; i < bytes.byteLength; ++i) {
      videoDataStr += String.fromCharCode(bytes[i]);
    }
    // create uri
    var uri = 'data:video/' + dataType + ';base64,' + window.btoa(videoDataStr);
    return uri;
  }

  /**
   * Internal Data URI load.
   *
   * @param {object} buffer The read data.
   * @param {string} origin The data origin.
   * @param {number} index The data index.
   */
  this.load = function (buffer, origin, index) {
    // create a DOM video
    var video = document.createElement('video');
    if (typeof origin === 'string') {
      // url case
      var ext = origin.split('.').pop().toLowerCase();
      video.src = createDataUri(buffer, ext);
    } else {
      video.src = buffer;
    }
    // storing values to pass them on
    video.file = origin;
    video.index = index;
    // onload handler
    video.onloadedmetadata = function (/*event*/) {
      try {
        dwv.image.getViewFromDOMVideo(this,
          self.onloaditem, self.onload,
          self.onprogress, self.onloadend,
          index, origin);
      } catch (error) {
        self.onerror({
          error: error,
          source: origin
        });
        self.onloadend({
          source: origin
        });
      }
    };
  };

  /**
   * Abort load.
   */
  this.abort = function () {
    self.onabort({});
    self.onloadend({});
  };

}; // class RawVideoLoader

/**
 * Check if the loader can load the provided file.
 *
 * @param {object} file The file to check.
 * @returns {boolean} True if the file can be loaded.
 */
dwv.io.RawVideoLoader.prototype.canLoadFile = function (file) {
  return file.type.match('video.*');
};

/**
 * Check if the loader can load the provided url.
 *
 * @param {string} url The url to check.
 * @returns {boolean} True if the url can be loaded.
 */
dwv.io.RawVideoLoader.prototype.canLoadUrl = function (url) {
  var urlObjext = dwv.utils.getUrlFromUri(url);
  var ext = dwv.utils.getFileExtension(urlObjext.pathname);
  return (ext === 'mp4') || (ext === 'ogg') ||
            (ext === 'webm');
};

/**
 * Get the file content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.RawVideoLoader.prototype.loadFileAs = function () {
  return dwv.io.fileContentTypes.DataURL;
};

/**
 * Get the url content type needed by the loader.
 *
 * @returns {number} One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.RawVideoLoader.prototype.loadUrlAs = function () {
  return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.io.RawVideoLoader.prototype.onloadstart = function (_event) {};
/**
 * Handle a progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.io.RawVideoLoader.prototype.onprogress = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event fired
 * when a file item has been loaded successfully.
 */
dwv.io.RawVideoLoader.prototype.onloaditem = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 * when a file has been loaded successfully.
 */
dwv.io.RawVideoLoader.prototype.onload = function (_event) {};
/**
 * Handle an load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.io.RawVideoLoader.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.io.RawVideoLoader.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.io.RawVideoLoader.prototype.onabort = function (_event) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push('RawVideoLoader');
