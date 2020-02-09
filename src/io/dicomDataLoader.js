// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * DICOM data loader.
 * @constructor
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
     * Loading flag.
     * @private
     * @type Boolean
     */
    var isLoading = false;

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function (opt) {
        options = opt;
    };

    /**
     * Is the load ongoing?
     * @return {Boolean} True if loading.
     */
    this.isLoading = function () {
        return isLoading;
    };

    /**
     * DICOM buffer to dwv.image.View (asynchronous)
     * @private
     */
    var db2v = new dwv.image.DicomBufferToView();

    /**
     * Load data.
     * @param {Object} buffer The DICOM buffer.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (buffer, origin, index) {
        // set loading flag
        isLoading = true;
        // set character set
        if (typeof options.defaultCharacterSet !== "undefined") {
            db2v.setDefaultCharacterSet(options.defaultCharacterSet);
        }
        // connect handlers
        db2v.onloadstart = self.onloadstart;
        db2v.onprogress = self.onprogress;
        db2v.onload = self.onload;
        db2v.onloadend = function (event) {
            // reset loading flag
            isLoading = false;
            // call listeners
            self.onloadend(event);
        };
        db2v.onerror = self.onerror;
        db2v.onabort = self.onabort;
        // convert
        db2v.convert( buffer, index );
    };

    /**
     * Abort load.
     */
    this.abort = function () {
        // reset loading flag
        isLoading = false;
        // abort conversion, will trigger db2v.onabort
        db2v.abort();
    };

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadFile = function (file) {
    var ext = dwv.utils.getFileExtension(file.name);
    var hasNoExt = (ext === null);
    var hasDcmExt = (ext === "dcm");
    return hasNoExt || hasDcmExt;
};

/**
 * Check if the loader can load the provided url.
 * True if:
 *  - the url has a 'contentType' and it is 'application/dicom' (as in wado urls)
 *  - the url has no 'contentType' and no extension or the extension is 'dcm'
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.DicomDataLoader.prototype.canLoadUrl = function (url) {
    var urlObjext = dwv.utils.getUrlFromUri(url);
    // extension
    var ext = dwv.utils.getFileExtension(urlObjext.pathname);
    var hasNoExt = (ext === null);
    var hasDcmExt = (ext === "dcm");
    // content type (for wado url)
    var contentType = urlObjext.searchParams.get("contentType");
    var hasDicomContentType = (contentType === "application/dicom");

    return hasDicomContentType || hasNoExt || hasDcmExt;
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
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.DicomDataLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "DicomDataLoader" );
