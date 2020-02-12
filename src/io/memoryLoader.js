// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Memory loader.
 * @constructor
 */
dwv.io.MemoryLoader = function ()
{
    /**
     * Closure to self.
     * @private
     * @type Object
     */
    var self = this;

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
     * Store a launched loader.
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
     * Abort a memory load.
     */
    this.abort = function () {
        // abort loader
        runningLoader.abort();
        this.clearStoredLoaders();
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
     * Increment the number of loaded data
     *   and call onload if loaded all data.
     * @param {Object} event The load data event.
     */
    this.addLoad = function (event) {
        self.onloaditem(event);
        nLoad++;
        // call self.onload when all is loaded
        // (can't use the input event since it is not the
        //   general load)
        if ( nLoad === nToLoad ) {
            self.onload({});
        }
    };

    /**
     * Increment the counter of load end events
     *   and run callbacks when all done, erroneus or not.
     * @param {Object} event The load end event.
     */
    this.addLoadend = function (event) {
        nLoadend++;
        // call self.onloadend when all is run
        // (can't use the input event since it is not the
        //   general load end)
        if ( nLoadend === nToLoad ) {
            self.onloadend({
                source: event.source
            });
        }
    };

}; // class MemoryLoader

/**
 * Load a list of buffers.
 * @param {Array} ioArray The list of buffers to load.
 */
dwv.io.MemoryLoader.prototype.load = function (ioArray)
{
    this.onloadstart({
        source: ioArray
    });

    // clear storage
    this.clearStoredLoader();

    // closure to self for handlers
    var self = this;

    // set the number of data to load
    this.setNToLoad( ioArray.length );

    var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
    mproghandler.setNToLoad( ioArray.length );
    mproghandler.setNumberOfDimensions(1);

    // create loaders
    var loaders = [];
    for (var m = 0; m < dwv.io.loaderList.length; ++m) {
        loaders.push( new dwv.io[dwv.io.loaderList[m]]() );
    }

    var augmentCallbackEvent = function (callback, source) {
        return function (event) {
            event.source = source;
            callback(event);
        };
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var iodata = ioArray[i];

        // find a loader
        var loader = null;
        var foundLoader = false;
        for (var l = 0; l < loaders.length; ++l) {
            loader = loaders[l];
            if (loader.canLoadFile(iodata.filename)) {
                foundLoader = true;
                loader.setOptions({
                    'defaultCharacterSet': this.getDefaultCharacterSet()
                });
                // set loaded callbacks
                // loader.onloadstart: nothing to do
                loader.onprogress = mproghandler.getMonoProgressHandler(i, 0, iodata.filename);
                loader.onload = augmentCallbackEvent(self.addLoad, iodata.filename);
                loader.onloadend = augmentCallbackEvent(self.addLoadend, ioArray);
                loader.onerror = augmentCallbackEvent(self.onerror, iodata.filename);
                loader.onabort = augmentCallbackEvent(self.onabort, iodata.filename);
                // store loader
                this.storeLoader(loader);
                // read
                loader.load(iodata.data, iodata.filename, i);
                // next file
                break;
            }
        }
        // TODO: throw?
        if (!foundLoader) {
            throw new Error("No loader found for file: "+iodata.filename);
        }
    }
}; // class Memory

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load item event.
 * @param {Object} event The load item event fired
 *   when a file item has been loaded successfully.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onloaditem = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.MemoryLoader.prototype.onabort = function (/*event*/) {};
