// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * DICOM data loader.
 */
dwv.io.DicomDataLoader = function ()
{
    // closure to self
    var self = this;

    /**
     * Loader options.
     * @private
     * @type Object
     */
    var options = {};

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function (opt) {
        options = opt;
    };

    /**
     * DICOM buffer to dwv.image.View (asynchronous)
     */
    var db2v = new dwv.image.DicomBufferToView();

    /**
     * Load data.
     * @param {Object} buffer The DICOM buffer.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (buffer, origin, index) {
        // set character set
        if (typeof options.defaultCharacterSet !== "undefined") {
            db2v.setDefaultCharacterSet(options.defaultCharacterSet);
        }
        // connect handlers
        db2v.onload = self.onload;
        db2v.onloadend = self.onloadend;
        db2v.onprogress = self.onprogress;
        // convert
        try {
            db2v.convert( buffer, index );
        } catch (error) {
            self.onerror(error);
        }
    };

    /**
     * Abort load: pass to listeners.
     */
    this.abort = function () {
        db2v.abort();
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
                    " while loading '" + url + "' [DicomDataLoader]" });
                return;
            }
            // load
            self.load(this.response, url, index);
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
                "' (" + message + ") [DicomDataLoader]" } );
        };
    };

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadFile = function (file) {
    var split = file.name.split('.');
    var ext = "";
    if (split.length !== 1) {
        ext = split.pop().toLowerCase();
    }
    var hasExt = (ext.length !== 0);
    return !hasExt || (ext === "dcm");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadUrl = function (url) {
    var split = url.split('.');
    var ext = "";
    if (split.length !== 1) {
        ext = split.pop().toLowerCase();
    }
    var hasExt = (ext.length !== 0) && (ext.length < 5);
    // wado url
    var isDicomContentType = (url.indexOf("contentType=application/dicom") !== -1);

    return isDicomContentType || (ext === "dcm") || !hasExt;
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.DicomDataLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.ArrayBuffer;
};

/**
 * Get the url content type needed by the loader.
 * @return One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.DicomDataLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an load end event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event, 'event.message'
 *  should be the error message.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onabort = function () {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "DicomDataLoader" );
