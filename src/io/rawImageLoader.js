// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Raw image loader.
 * @constructor
 */
dwv.io.RawImageLoader = function ()
{
    // closure to self
    var self = this;

    /**
     * if abort is triggered, all image.onload callbacks have to be cancelled
     * @type {boolean}
     */
    var aborted = false;

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
     */
    function createDataUri(response, dataType) {
        // image type
        var imageType = dataType;
        if (!imageType || imageType === "jpg") {
            imageType = "jpeg";
        }
        // create uri
        var file = new Blob([response], {type: 'image/' + imageType});
        return window.URL.createObjectURL(file);
    }

    /**
     * Load data.
     * @param {Object} dataUri The data URI.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function ( dataUri, origin, index ) {
        aborted = false;
        // create a DOM image
        var image = new Image();
        // triggered by ctx.drawImage
        image.onload = function (/*event*/) {
            try {
                if(!aborted){
                    self.onload( dwv.image.getViewFromDOMImage(this) );
                }
                self.onloadend();
            } catch (error) {
                self.onerror(error);
            }
            self.onprogress({'type': 'read-progress', 'lengthComputable': true,
                'loaded': 100, 'total': 100, 'index': index});
        };
        // storing values to pass them on
        image.origin = origin;
        image.index = index;
        image.src = dataUri;
    };

    /**
     * Abort load. TODO...
     */
    this.abort = function () {
        aborted = true;
        self.onabort();
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
    var hasImageExt = (ext === "jpeg") || (ext === "jpg") ||
            (ext === "png") || (ext === "gif");
    // wado url
    var isImageContentType = (url.indexOf("contentType=image/jpeg") !== -1) ||
        (url.indexOf("contentType=image/png") !== -1) ||
        (url.indexOf("contentType=image/gif") !== -1);

    return isImageContentType || hasImageExt;
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
 * Handle an load end event.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.RawImageLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "RawImageLoader" );
