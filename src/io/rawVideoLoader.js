// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw video loader.
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
     * Get a file load handler.
     * @param {Object} file The file to load.
     * @param {Number} index The index 'id' of the file.
     * @return {Function} A file load handler.
     */
    this.getFileLoadHandler = function (file, index) {
        return function (event) {
            // create a DOM video
            var video = document.createElement('video');
            video.src = event.target.result;
            // storing values to pass them on
            video.file = file;
            video.index = index;
            // onload handler
            video.onloadedmetadata = function (/*event*/) {
                try {
                    dwv.image.getViewFromDOMVideo(this, self.onload, self.onprogress, index);
                    self.addLoaded();
                } catch (error) {
                    self.onerror(error);
                }
            };
        };
    };

    /**
     * Get an error handler.
     * @param {String} origin The file.name/url at the origin of the error.
     * @return {Function} An error handler.
     */
    this.getErrorHandler = function (origin) {
        return function (event) {
            var message = "";
            if (typeof event.getMessage !== "undefined") {
                message = event.getMessage();
            } else if (typeof this.status !== "undefined") {
                message = "http status: " + this.status;
            }
            self.onerror( {'name': "RequestError",
                'message': "An error occurred while reading '" + origin +
                "' (" + message + ") [RawVideoLoader]" } );
        };
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
dwv.io.RawVideoLoader.prototype.canLoadUrl = function (/*url*/) {
    //var ext = url.split('.').pop().toLowerCase();
    //return (ext === "mp4") || (ext === "ogg") ||
    //        (ext === "webm");
    return false;
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.RawVideoLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.DataURL;
};

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an add loaded event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.addLoaded = function () {};
/**
 * Handle an error event.
 * @param {Object} event The error event, 'event.message'
 *  should be the error message.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.RawVideoLoader.prototype.onprogress = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "RawVideoLoader" );
