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
     * Input data.
     * @private
     * @type Array
     */
    var inputData = null;

    /**
     * Data loader.
     * @private
     * @type Object
     */
    var runningLoader = null;

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
     * Store the current input.
     * @param {Object} data The input data.
     * @private
     */
    function storeInputData(data) {
        inputData = data;
        // reset counters
        nLoad = 0;
        nLoadend = 0;
        // clear storage
        clearStoredLoader();
    }

    /**
     * Store the launched loader.
     * @param {Object} loader The launched loader.
     * @private
     */
    function storeLoader(loader) {
        runningLoader = loader;
    }

    /**
     * Clear the stored loader.
     * @private
     */
    function clearStoredLoader() {
        runningLoader = null;
    }

    /**
     * Launch a load item event and call addLoad.
     * @param {Object} event The load data event.
     * @private
     */
    function addLoadItem(event) {
        self.onloaditem(event);
        addLoad();
    }

    /**
     * Increment the number of loaded data
     *   and call onload if loaded all data.
     * @param {Object} event The load data event.
     * @private
     */
    function addLoad(/*event*/) {
        nLoad++;
        // call self.onload when all is loaded
        // (not using the input event since it is not the
        //   general load)
        if (nLoad === inputData.length) {
            self.onload({
                source: inputData
            });
        }
    }

    /**
     * Increment the counter of load end events
     *   and run callbacks when all done, erroneus or not.
     * @param {Object} event The load end event.
     * @private
     */
    function addLoadend(/*event*/) {
        nLoadend++;
        // call self.onloadend when all is run
        // (not using the input event since it is not the
        //   general load end)
        if (nLoadend === inputData.length) {
            self.onloadend({
                source: inputData
            });
        }
    }

    /**
     * Load a list of buffers.
     * @param {Array} data The list of buffers to load.
     */
    this.load = function (data)
    {
        // check input
        if (typeof data === "undefined" || data.length === 0) {
            return;
        }
        storeInputData(data);

        // send start event
        this.onloadstart({
            source: data
        });

        // create prgress handler
        var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
        mproghandler.setNToLoad(data.length);
        mproghandler.setNumberOfDimensions(1);

        // create loaders
        var loaders = [];
        for (var m = 0; m < dwv.io.loaderList.length; ++m) {
            loaders.push(new dwv.io[dwv.io.loaderList[m]]());
        }

        // find an appropriate loader
        var dataElement = data[0];
        var loader = null;
        var foundLoader = false;
        for (var l = 0; l < loaders.length; ++l) {
            loader = loaders[l];
            if (loader.canLoadUrl({name: dataElement.filename})) {
                foundLoader = true;
                // load options
                loader.setOptions({
                    'defaultCharacterSet': this.getDefaultCharacterSet()
                });
                // set loader callbacks
                // loader.onloadstart: nothing to do
                loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(0);
                if (typeof loader.onloaditem === "undefined") {
                    // handle load-item locally
                    loader.onload = addLoadItem;
                } else {
                    loader.onloaditem = self.onloaditem;
                    loader.onload = addLoad;
                }
                loader.onloadend = addLoadend;
                loader.onerror = self.onerror;
                loader.onabort = self.onabort;

                // store loader
                storeLoader(loader);
                // exit
                break;
            }
        }
        if (!foundLoader) {
            throw new Error("No loader found for data: "+dataElement.filename);
        }

        // loop on I/O elements
        for (var i = 0; i < data.length; ++i) {
            dataElement = data[i];
            // check loader
            if (!loader.canLoadFile({name: dataElement.filename})) {
                throw new Error("Input data of different type: "+dataElement.filename);
            }
            // read
            loader.load(dataElement.data, dataElement.filename, i);
        }
    };

    /**
     * Abort a load.
     */
    this.abort = function () {
        // abort loader
        if (runningLoader && runningLoader.isLoading()) {
            runningLoader.abort();
        }
    };

}; // class MemoryLoader

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
