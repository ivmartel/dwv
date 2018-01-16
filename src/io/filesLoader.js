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
    var runningLoader = [];

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
    var nLoaded = 0;

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
        if ( runningLoader ) {
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
    };

    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     */
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            self.onloadend();
        }
    };

}; // class File

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.FilesLoader.prototype.onabort = function (/*event*/) {};

/**
 * Load a list of files.
 * @param {Array} ioArray The list of files to load.
 * @external FileReader
 */
dwv.io.FilesLoader.prototype.load = function (ioArray)
{
    // clear storage
    this.clearStoredReaders();
    this.clearStoredLoader();

    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
    mproghandler.setNToLoad( ioArray.length );

    // get loaders
    var loaders = [];
    for (var m = 0; m < dwv.io.loaderList.length; ++m) {
        loaders.push( new dwv.io[dwv.io.loaderList[m]]() );
    }

    // set loaders callbacks
    var loader = null;
    for (var k = 0; k < loaders.length; ++k) {
        loader = loaders[k];
        loader.onload = self.onload;
        loader.onloadend = self.addLoaded;
        loader.onerror = self.onerror;
        loader.onabort = self.onabort;
        loader.setOptions({
            'defaultCharacterSet': this.getDefaultCharacterSet()
        });
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
    }

    // request onerror handler
    var getReaderOnError = function (origin) {
        return function (event) {
            var message = "An error occurred while reading '" + origin + "'";
            if (typeof event.getMessage !== "undefined") {
                message += " (" + event.getMessage() + ")";
            }
            message += ".";
            self.onerror( {'name': "FileReaderError", 'message': message } );
        };
    };

    // request onabort handler
    var getReaderOnAbort = function (origin) {
        return function () {
            self.onabort( {'message': "Abort while reading '" + origin + "'" } );
        };
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
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
                // store loader
                this.storeLoader(loader);
                // set reader callbacks
                reader.onload = loader.getFileLoadHandler(file, i);
                reader.onerror = getReaderOnError(file.name);
                reader.onabort = getReaderOnAbort(file.name);
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
};
