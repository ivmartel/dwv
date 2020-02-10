// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.io = dwv.io || {};

// file content types
dwv.io.fileContentTypes = {
    'Text': 0,
    'ArrayBuffer': 1,
    'DataURL': 2
};

/**
 * Files loader.
 * @constructor
 */
dwv.io.FilesLoader = function ()
{
    /**
     * Closure to self.
     * @private
     * @type Object
     */
    var self = this;

    /**
     * Array of launched readers (used in abort).
     * @private
     * @type Array
     */
    var readers = [];

    /**
     * Launched loader (used in abort).
     * @private
     * @type Object
     */
    var runningLoader = null;

    /**
     * Number of data to load.
     * @private
     * @type Number
     */
    var nToLoad = 0;
    /**
     * Number of loaded data.
     * @private
     * @type Number
     */
    var nLoad = 0;
    /**
     * Number of load end events.
     * @private
     * @type Number
     */
    var nLoadend = 0;

    /**
     * The default character set (optional).
     * @private
     * @type String
     */
    var defaultCharacterSet;

    /**
     * Get the default character set.
     * @return {String} The default character set.
     */
    this.getDefaultCharacterSet = function () {
        return defaultCharacterSet;
    };

    /**
     * Set the default character set.
     * @param {String} characterSet The character set.
     */
    this.setDefaultCharacterSet = function (characterSet) {
        defaultCharacterSet = characterSet;
    };

    /**
     * Store a launched reader.
     * @param {Object} request The launched reader.
     */
    this.storeReader = function (reader) {
        readers.push(reader);
    };

    /**
     * Clear the stored readers.
     */
    this.clearStoredReaders = function () {
        readers = [];
    };

    /**
     * Store the launched loader.
     * @param {Object} loader The launched loader.
     */
    this.storeLoader = function (loader) {
        runningLoader = loader;
    };

    /**
     * Clear the stored loader.
     */
    this.clearStoredLoader = function () {
        runningLoader = null;
    };

    /**
     * Abort a URLs load.
     */
    this.abort = function () {
        // abort readers
        for ( var i = 0; i < readers.length; ++i ) {
            // 0: EMPTY, 1: LOADING, 2: DONE
            if ( readers[i].readyState === 1 ) {
                readers[i].abort();
            }
        }
        this.clearStoredReaders();
        // abort loader
        if (runningLoader && runningLoader.isLoading()) {
            runningLoader.abort();
        }
        this.clearStoredLoader();
    };

    /**
     * Set the number of data to load.
     * @param {Number} n The number of data to load.
     */
    this.setNToLoad = function (n) {
        nToLoad = n;
        // reset counters
        nLoad = 0;
        nLoadend = 0;
    };

    /**
     * Launch a load item event and call addLoad.
     * @param {Object} data The load data.
     */
    this.addLoadItem = function (data) {
        self.onloaditem({
            type: "load-item",
            data: data,
            source: data.source
        });
        self.addLoad();
    };

    /**
     * Increment the number of loaded data
     *   and call onload if loaded all data.
     * @param {Object} data The load data.
     */
    this.addLoad = function (data) {
        nLoad++;
        // call onload when all is loaded
        if ( nLoad === nToLoad ) {
            self.onload({
                type: "load"
            });
        }
    };

    /**
     * Increment the counter of load end events
     * and run callbacks when all done, erroneus or not.
     * @param {Object} event The load end event.
     */
    this.addLoadend = function (event) {
        nLoadend++;
        // call onloadend when all is run
        if ( nLoadend === nToLoad ) {
            self.onloadend({
                type: "load-end",
                source: event.source
            });
        }
    };

}; // class FileLoader

/**
 * Load a list of files.
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.FilesLoader.prototype.load = function (ioArray)
{
    this.onloadstart({
        type: "load-start",
        source: ioArray
    });

    // clear storage
    this.clearStoredReaders();
    this.clearStoredLoader();

    // closure to self for handlers
    var self = this;

    // set the number of data to load
    this.setNToLoad( ioArray.length );

    var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
    mproghandler.setNToLoad( ioArray.length );

    // create loaders
    var loaders = [];
    for (var m = 0; m < dwv.io.loaderList.length; ++m) {
        loaders.push( new dwv.io[dwv.io.loaderList[m]]() );
    }

    // set loaders callbacks
    var loader = null;
    for (var k = 0; k < loaders.length; ++k) {
        loader = loaders[k];
        loader.setOptions({
            'defaultCharacterSet': this.getDefaultCharacterSet()
        });
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
    }

    var augmentCallbackEvent = function (callback, source) {
        return function (event) {
            event.source = source;
            callback(event);
        };
    };

    var getLoadHandler = function (loader, file, i) {
        return function (event) {
            loader.load(event.target.result, file, i);
        };
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        /**
         * The file reader.
         * @external FileReader
         * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
         */
        var reader = new FileReader();

        // store reader
        this.storeReader(reader);

        // bind reader progress
        reader.onprogress = mproghandler.getMonoProgressHandler(i, 0);

        // find a loader
        var foundLoader = false;
        for (var l = 0; l < loaders.length; ++l) {
            loader = loaders[l];
            if (loader.canLoadFile(file)) {
                foundLoader = true;

                // set loader callbacks
                // loader.onloadstart: nothing to do
                if (typeof loader.onloaditem === "undefined") {
                    // handle load-item locally
                    loader.onload = augmentCallbackEvent(self.addLoadItem, file);
                } else {
                    loader.onloaditem = self.onloaditem;
                    loader.onload = augmentCallbackEvent(self.addLoad, file);
                }
                loader.onloadend = augmentCallbackEvent(self.addLoadend, ioArray);
                loader.onerror = augmentCallbackEvent(self.onerror, file);
                loader.onabort = augmentCallbackEvent(self.onabort, file);

                // store loader
                this.storeLoader(loader);

                // set reader callbacks
                // reader.onloadstart: nothing to do
                reader.onload = getLoadHandler(loader, file, i);
                // reader.onloadend: nothing to do
                reader.onerror = augmentCallbackEvent(self.onerror, file);
                reader.onabort = augmentCallbackEvent(self.onabort, file);
                // read
                if (loader.loadFileAs() === dwv.io.fileContentTypes.Text) {
                    reader.readAsText(file);
                } else if (loader.loadFileAs() === dwv.io.fileContentTypes.DataURL) {
                    reader.readAsDataURL(file);
                } else if (loader.loadFileAs() === dwv.io.fileContentTypes.ArrayBuffer) {
                    reader.readAsArrayBuffer(file);
                }
                // next file
                break;
            }
        }
        // TODO: throw?
        if (!foundLoader) {
            throw new Error("No loader found for file: "+file);
        }
    }
}; // class FilesLoader

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load item event.
 * @param {Object} event The load item event fired
 *   when a file item has been loaded successfully.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onloaditem = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onabort = function (/*event*/) {};
