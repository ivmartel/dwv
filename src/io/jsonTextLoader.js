// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * JSON text loader.
 * @constructor
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
            self.onload({
                data: text
            });
        } catch (error) {
            self.onerror(error);
        } finally {
            // reset loading flag
            isLoading = false;
            self.onloadend({});
        }
        self.onprogress({
            'lengthComputable': true,
            'loaded': 100,
            'total': 100,
            'index': index
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

}; // class JSONTextLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadFile = function (file) {
    var ext = dwv.utils.getFileExtension(file.name);
    return (ext === "json");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.JSONTextLoader.prototype.canLoadUrl = function (url) {
    var urlObjext = dwv.utils.getUrlFromUri(url);
    var ext = dwv.utils.getFileExtension(urlObjext.pathname);
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
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The load progress event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.JSONTextLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "JSONTextLoader" );
