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
     * Listener handler.
     * @type Object
     */
    var listenerHandler = new dwv.utils.ListenerHandler();

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
    this.abortLoad = function () {
        if ( currentLoader ) {
            currentLoader.abort();
            currentLoader = null;
        }
    };

    /**
     * Internal loader onload callback.
     * @param {Object} data The loaded data.
     */
    this.onload = function (/*data*/) {
        // default does nothing.
    };

    /**
     * Internal loader onloadend callback.
     */
    this.onloadend = function () {
        // default does nothing.
    };

    /**
     * Internal image data loader setup callback.
     */
    this.onLoadImageDataSetup = function () {
        // default does nothing.
    };

    /**
     * Internal loader state data callback.
     * @param {Object} data The state data.
     */
    this.onLoadStateData = function (/*data*/) {
        // default does nothing.
    };

    /**
     * Is the data mono-slice?
     * @return {Boolean} True if the data only contains one slice.
     */
    this.isMonoSliceData = function () {
         return isMonoSliceData;
    };

    /**
     * Add an event listener to this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.addEventListener = function (type, callback) {
        listenerHandler.add(type, callback);
    };
    /**
     * Remove an event listener from this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.removeEventListener = function (type, callback) {
        listenerHandler.remove(type, callback);
    };

    // private ----------------------------------------------------------------

    /**
     * Load a list of image files.
     * @private
     * @param {Array} files The list of image files to load.
     */
    function loadImageFiles(files) {
        // create IO
        var fileIO = new dwv.io.FilesLoader();
        // load data
        loadImageData(files, fileIO);
    }

    /**
     * Load a list of image URLs.
     * @private
     * @param {Array} urls The list of urls to load.
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
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
     * @private
     * @param {String} file The state file to load.
     */
    function loadStateFile(file) {
        // create IO
        var fileIO = new dwv.io.FilesLoader();
        // load data
        loadStateData([file], fileIO);
    }

    /**
     * Load a State url.
     * @private
     * @param {String} url The state url to load.
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
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
     * @private
     * @param {Array} data Array of data to load.
     * @param {Object} loader The data loader.
     * @param {Object} options Options passed to the final loader.
     */
    function loadImageData(data, loader, options) {
        // store loader to allow abort
        currentLoader = loader;

        // callback
        self.onLoadImageDataSetup();

        // allow to cancel
        var previousOnKeyDown = window.onkeydown;
        window.onkeydown = function (event) {
            if (event.ctrlKey && event.keyCode === 88 ) { // crtl-x
                console.log("crtl-x pressed!");
                self.abortLoad();
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
        loader.setDefaultCharacterSet(defaultCharacterSet);
        loader.onloaditemstart = function (event) {
            fireEvent({
                type: 'load-item-start',
                item: event.item,
                loader: event.loader
            });
        };
        loader.onload = function (data) {
            fireEvent({
                type: 'load-slice',
                data: data.info
            });
            // callback
            self.onload(data);
        };
        loader.onerror = handleLoadError;
        loader.onabort = handleLoadAbort;
        loader.onloadend = function (/*event*/) {
            window.onkeydown = previousOnKeyDown;
            fireEvent({
                type: "load-progress",
                lengthComputable: true,
                loaded: 100,
                total: 100
            });
            fireEvent({
                type: 'load-end'
            });
            // reset member
            currentLoader = null;
            // callback
            self.onloadend();
        };
        loader.onprogress = fireEvent;
        // main load (asynchronous)
        fireEvent({
            type: 'load-start'
        });
        loader.load(data, options);
    }

    /**
     * Load a State data.
     * @private
     * @param {Array} data Array of data to load.
     * @param {Object} loader The data loader.
     * @param {Object} options Options passed to the final loader.
     */
    function loadStateData(data, loader, options) {
        // set IO
        loader.onload = function (data) {
            self.onLoadStateData(data);
        };
        loader.onerror = handleLoadError;
        // main load (asynchronous)
        loader.load(data, options);
    }

    /**
     * Handle an error: display it to the user.
     * @private
     * @param {Object} error The error to handle.
     */
    function handleLoadError(error) {
        // log
        console.error(error);
        // event message
        var displayMessage = "";
        if ( error.name && error.message) {
            displayMessage = error.name + ": " + error.message;
        } else {
            displayMessage = "Error: " + error + ".";
        }
        // fire error event
        fireEvent({
            type: "load-error",
            message: displayMessage,
            error: error
        });
    }

    /**
     * Handle an abort: display it to the user.
     * @param {Object} error The error to handle.
     * @private
     */
    function handleLoadAbort(error) {
        // log
        console.warn(error);
        // event message
        var displayMessage = "";
        if ( error && error.message ) {
            displayMessage = error.message;
        } else {
            displayMessage = "Abort called.";
        }
        // fire error event
        fireEvent({
            type: "load-abort",
            message: displayMessage,
            error: error
        });
    }

    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     * @private
     */
    function fireEvent (event) {
        listenerHandler.fireEvent(event);
    }
};
