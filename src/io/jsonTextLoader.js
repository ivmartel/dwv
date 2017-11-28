// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * JSON text loader.
 */
dwv.io.JSONTextLoader = function ()
{
    // closure to self
    var self = this;

    /**
     * Loading flag.
     * @private
     * @type Boolean
     */
    var isLoading = false;

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function () {
        // does nothing
    };

    /**
     * Is the load ongoing?
     * @return {Boolean} True if loading.
     */
    this.isLoading = function () {
        return isLoading;
    };

    /**
     * Load data.
     * @param {Object} text The input text.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (text, origin, index) {
        // set loading flag
        isLoading = true;
        try {
            self.onload( text );
            // reset loading flag
            isLoading = false;
            // call listeners
            self.onloadend();
        } catch (error) {
            self.onerror(error);
        }
        self.onprogress({'type': 'read-progress', 'lengthComputable': true,
            'loaded': 100, 'total': 100, 'index': index});
    };

    /**
     * Abort load: pass to listeners.
     */
    this.abort = function () {
        // reset loading flag
        isLoading = false;
        // call listeners
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
                    " while loading '" + url + "' [JSONTextLoader]" });
                return;
            }
            // load
            self.load(this.responseText, url, index);
        };
    };

}; // class JSONTextLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadFile = function (file) {
    var ext = file.name.split('.').pop().toLowerCase();
    return (ext === "json");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadUrl = function (url) {
    var ext = url.split('.').pop().toLowerCase();
    return (ext === "json");
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.JSONTextLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.Text;
};

/**
 * Get the url content type needed by the loader.
 * @return One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.JSONTextLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.Text;
};

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an load end event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "JSONTextLoader" );
