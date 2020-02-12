// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw video loader.
 * url example (cors enabled):
 *   https://raw.githubusercontent.com/clappr/clappr/master/test/fixtures/SampleVideo_360x240_1mb.mp4
 * @constructor
 */
dwv.io.RawVideoLoader = function ()
{
    // closure to self
    var self = this;

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function () {
        // does nothing
    };

    /**
     * Is the load ongoing? TODO...
     * @return {Boolean} True if loading.
     */
    this.isLoading = function () {
        return true;
    };

    /**
     * Create a Data URI from an HTTP request response.
     * @param {Object} response The HTTP request response.
     * @param {String} dataType The data type.
     * @private
     */
    function createDataUri(response, dataType) {
        // image data as string
        var bytes = new Uint8Array(response);
        var videoDataStr = '';
        for( var i = 0; i < bytes.byteLength; ++i ) {
            videoDataStr += String.fromCharCode(bytes[i]);
        }
        // create uri
        var uri = "data:video/" + dataType + ";base64," + window.btoa(videoDataStr);
        return uri;
    }

    /**
     * Internal Data URI load.
     * @param {Object} buffer The read data.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (buffer, origin, index) {
        // create a DOM video
        var video = document.createElement('video');
        if (typeof origin === "string") {
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
                    self.onload, self.onprogress, self.onloadend, index);
            } catch (error) {
                self.onerror(error);
                self.onloadend({});
            }
        };
    };

    /**
     * Abort load. TODO...
     */
    this.abort = function () {
        self.onabort({});
        self.onloadend({});
    };

}; // class RawVideoLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.RawVideoLoader.prototype.canLoadFile = function (file) {
    return file.type.match("video.*");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.RawVideoLoader.prototype.canLoadUrl = function (url) {
    var urlObjext = dwv.utils.getUrlFromUri(url);
    var ext = dwv.utils.getFileExtension(urlObjext.pathname);
    return (ext === "mp4") || (ext === "ogg") ||
            (ext === "webm");
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.RawVideoLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.DataURL;
};

/**
 * Get the url content type needed by the loader.
 * @return One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.RawVideoLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onloadend = function () {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "RawVideoLoader" );
