// namespaces
var dwv = dwv || {};

/**
 * Load controller.
 * @param {String} defaultCharacterSet The default character set.
 * @constructor
 */
dwv.LoadController = function (defaultCharacterSet)
{
    // closure to self
    var self = this;
    // current loader
    var currentLoader = null;
    // Is the data mono-slice?
    var isMonoSliceData = null;

    /**
     * Load a list of files. Can be image files or a state file.
     * @param {Array} files The list of files to load.
     */
    this.loadFiles = function (files) {
        // has been checked for emptiness.
        var ext = files[0].name.split('.').pop().toLowerCase();
        if ( ext === "json" ) {
            loadStateFile(files[0]);
        } else {
            loadImageFiles(files);
        }
    };

    /**
     * Load a list of URLs. Can be image files or a state file.
     * @param {Array} urls The list of urls to load.
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
     */
    this.loadURLs = function (urls, requestHeaders) {
        // has been checked for emptiness.
        var ext = urls[0].split('.').pop().toLowerCase();
        if ( ext === "json" ) {
            loadStateUrl(urls[0], requestHeaders);
        } else {
            loadImageUrls(urls, requestHeaders);
        }
    };

    /**
     * Load a list of ArrayBuffers.
     * @param {Array} data The list of ArrayBuffers to load
     *   in the form of [{name: "", filename: "", data: data}].
     */
    this.loadImageObject = function (data) {
        // create IO
        var memoryIO = new dwv.io.MemoryLoader();
        // create options
        var options = {};
        // load data
        loadImageData(data, memoryIO, options);
    };

    /**
     * Abort the current load.
     */
    this.abort = function () {
        if ( currentLoader ) {
            currentLoader.abort();
            currentLoader = null;
        }
    };

    /**
     * Is the data mono-slice?
     * @return {Boolean} True if the data only contains one slice.
     */
    this.isMonoSliceData = function () {
         return isMonoSliceData;
    };

    // private ----------------------------------------------------------------

    /**
     * Load a list of image files.
     * @param {Array} files The list of image files to load.
     * @private
     */
    function loadImageFiles(files) {
        // create IO
        var fileIO = new dwv.io.FilesLoader();
        // load data
        loadImageData(files, fileIO);
    }

    /**
     * Load a list of image URLs.
     * @param {Array} urls The list of urls to load.
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
     * @private
     */
    function loadImageUrls(urls, requestHeaders) {
        // create IO
        var urlIO = new dwv.io.UrlsLoader();
        // create options
        var options = {'requestHeaders': requestHeaders};
        // load data
        loadImageData(urls, urlIO, options);
    }

    /**
     * Load a State file.
     * @param {String} file The state file to load.
     * @private
     */
    function loadStateFile(file) {
        // create IO
        var fileIO = new dwv.io.FilesLoader();
        // load data
        loadStateData([file], fileIO);
    }

    /**
     * Load a State url.
     * @param {String} url The state url to load.
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
     * @private
     */
    function loadStateUrl(url, requestHeaders) {
        // create IO
        var urlIO = new dwv.io.UrlsLoader();
        // create options
        var options = {'requestHeaders': requestHeaders};
        // load data
        loadStateData([url], urlIO, options);
    }

    /**
     * Load a list of image data.
     * @param {Array} data Array of data to load.
     * @param {Object} loader The data loader.
     * @param {Object} options Options passed to the final loader.
     * @private
     */
    function loadImageData(data, loader, options) {

        // allow to cancel
        var previousOnKeyDown = window.onkeydown;
        window.onkeydown = function (event) {
            if (event.ctrlKey && event.keyCode === 88 ) { // crtl-x
                console.log("crtl-x pressed!");
                self.abort();
            }
        };

        // first data name
        var firstName = "";
        if (typeof data[0].name !== "undefined") {
            firstName = data[0].name;
        } else {
            firstName = data[0];
        }

        // flag used by scroll to decide wether to activate or not
        // TODO: supposing multi-slice for zip files, could not be...
        isMonoSliceData = (data.length === 1 &&
            firstName.split('.').pop().toLowerCase() !== "zip" &&
            !dwv.utils.endsWith(firstName, "DICOMDIR") &&
            !dwv.utils.endsWith(firstName, ".dcmdir") );

        // set IO
        var loadtype = "image";
        loader.setDefaultCharacterSet(defaultCharacterSet);
        loader.onloadstart = function (event) {
            // store loader to allow abort
            currentLoader = loader;
            // callback
            augmentCallbackEvent(self.onloadstart, loadtype)(event);
        }
        loader.onprogress = augmentCallbackEvent(self.onprogress, loadtype);
        loader.onloaditem = augmentCallbackEvent(self.onloaditem, loadtype);
        loader.onload = augmentCallbackEvent(self.onload, loadtype);
        loader.onloadend = function (event) {
            window.onkeydown = previousOnKeyDown;
            // reset current loader
            currentLoader = null;
            // callback
            augmentCallbackEvent(self.onloadend, loadtype)(event);
        };
        loader.onerror = augmentCallbackEvent(self.onerror, loadtype);
        loader.onabort = augmentCallbackEvent(self.onabort, loadtype);
        // launch load
        loader.load(data, options);
    }

    /**
     * Load a State data.
     * @param {Array} data Array of data to load.
     * @param {Object} loader The data loader.
     * @param {Object} options Options passed to the final loader.
     * @private
     */
    function loadStateData(data, loader, options) {
        var loadtype = "state";
        // set callbacks
        loader.onloadstart = augmentCallbackEvent(self.onloadstart, loadtype);
        loader.onprogress = augmentCallbackEvent(self.onprogress, loadtype);
        loader.onloaditem = augmentCallbackEvent(self.onloaditem, loadtype);
        loader.onload = augmentCallbackEvent(self.onload, loadtype);
        loader.onloadend = augmentCallbackEvent(self.onloadend, loadtype);
        loader.onerror = augmentCallbackEvent(self.onerror, loadtype);
        loader.onabort = augmentCallbackEvent(self.onabort, loadtype);
        // launch load
        loader.load(data, options);
    }

    /**
     * Augment a callback event: adds loadtype to the event passed to a callback.
     * @param {Object} callback The callback to update.
     * @param {string} loadtype The loadtype property to add to the event.
     * @returns {Object} A function representing the modified callback.
     */
    function augmentCallbackEvent(callback, loadtype) {
        return function (event) {
            event.loadtype = loadtype;
            callback(event);
        };
    }

}; // class LoadController

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.LoadController.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.LoadController.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.LoadController.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.LoadController.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.LoadController.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.LoadController.prototype.onabort = function (/*event*/) {};
