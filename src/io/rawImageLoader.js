// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw image loader.
 */
dwv.io.RawImageLoader = function ()
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
     * Create a Data URI from an HTTP request response.
     * @param {Object} response The HTTP request response.
     * @param {String} dataType The data type.
     */
    function createDataUri(response, dataType) {
        // image data as string
        var bytes = new Uint8Array(response);
        var imageDataStr = '';
        for( var i = 0; i < bytes.byteLength; ++i ) {
            imageDataStr += String.fromCharCode(bytes[i]);
        }
        // image type
        var imageType = dataType;
        if (imageType === "jpg") {
            imageType = "jpeg";
        }
        // create uri
        var uri = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
        return uri;
    }

    /**
     * Load data.
     * @param {Object} dataUri The data URI.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function ( dataUri, origin, index ) {
        // create a DOM image
        var image = new Image();
        image.src = dataUri;
        // storing values to pass them on
        image.origin = origin;
        image.index = index;
        // triggered by ctx.drawImage
        image.onload = function (/*event*/) {
            try {
                self.onload( dwv.image.getViewFromDOMImage(this) );
                self.addLoaded();
            } catch (error) {
                self.onerror(error);
            }
            self.onprogress({'type': 'read-progress', 'lengthComputable': true,
                'loaded': 100, 'total': 100, 'index': index});
        };
    };

    /**
     * Get a file load handler.
     * @param {Object} file The file to load.
     * @param {Number} index The index 'id' of the file.
     * @return {Function} A file load handler.
     */
    this.getFileLoadHandler = function (file, index) {
        return function (event) {
            self.load(event.target.result, file, index);
        };
    };

    /**
     * Get a url load handler.
     * @param {String} url The url to load.
     * @param {Number} index The index 'id' of the url.
     * @return {Function} A url load handler.
     */
    this.getUrlLoadHandler = function (url, index) {
        return function (/*event*/) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            if (this.status !== 200 && this.status !== 0) {
                self.onerror({'name': "RequestError",
                    'message': "Error status: " + this.status +
                    " while loading '" + url + "' [RawImageLoader]" });
                return;
            }
            // load
            var ext = url.split('.').pop().toLowerCase();
            self.load(createDataUri(this.response, ext), url, index);
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
                "' (" + message + ") [RawImageLoader]" } );
        };
    };

}; // class RawImageLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.RawImageLoader.prototype.canLoadFile = function (file) {
    return file.type.match("image.*");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.RawImageLoader.prototype.canLoadUrl = function (url) {
    var ext = url.split('.').pop().toLowerCase();
    return (ext === "jpeg") || (ext === "jpg") ||
            (ext === "png") || (ext === "gif");
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.RawImageLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.DataURL;
};

/**
 * Get the url content type needed by the loader.
 * @return One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.RawImageLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an add loaded event.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.addLoaded = function () {};
/**
 * Handle an error event.
 * @param {Object} event The error event, 'event.message'
 *  should be the error message.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onprogress = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "RawImageLoader" );
