// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

// url content types
dwv.io.urlContentTypes = {
    'Text': 0,
    'ArrayBuffer': 1
};

/**
 * Urls loader.
 * @constructor
 */
dwv.io.UrlsLoader = function ()
{
    /**
     * Closure to self.
     * @private
     * @type Object
     */
    var self = this;

    /**
     * Array of launched requests (used in abort).
     * @private
     * @type Array
     */
    var requests = [];

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
     * Store a launched request.
     * @param {Object} request The launched request.
     */
    this.storeRequest = function (request) {
        requests.push(request);
    };

    /**
     * Clear the stored requests.
     */
    this.clearStoredRequests = function () {
        requests = [];
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
        // abort requests
        for ( var i = 0; i < requests.length; ++i ) {
            // 0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED (send()), 3: LOADING, 4: DONE
            if ( requests[i].readyState !== 4 ) {
                requests[i].abort();
            }
        }
        this.clearStoredRequests();
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
    this.addLoad = function (/*data*/) {
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

}; // class UrlsLoader

/**
 * Load a list of URLs.
 * @param {Array} ioArray The list of urls to load.
 * @param {Object} options Load options.
 */
dwv.io.UrlsLoader.prototype.load = function (ioArray, options)
{
    this.onloadstart({
        type: "load-start",
        source: ioArray
    });

    var augmentCallbackEvent = function (callback, source) {
        return function (event) {
            event.source = source;
            callback(event);
        };
    };

    var getLoadHandler = function (loader, url, i) {
        return function (event) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            var status = event.target.status;
            if (status !== 200 && status !== 0) {
                self.onerror({source: url});
                self.onloadend({source: url});
            } else {
                loader.load(event.target.response, url, i);
            }
        };
    };

    // clear storage
    this.clearStoredRequests();
    this.clearStoredLoader();

    // closure to self for handlers
    var self = this;

    // raw url load
    var internalUrlsLoad = function (urlsArray) {
        // set the number of data to load
        self.setNToLoad( urlsArray.length );

        var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
        mproghandler.setNToLoad( urlsArray.length );

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
                'defaultCharacterSet': self.getDefaultCharacterSet()
            });
            loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
        }

        // loop on I/O elements
        for (var i = 0; i < urlsArray.length; ++i)
        {
            var url = urlsArray[i];
            /**
             * The http request.
             * @external XMLHttpRequest
             * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
             */
            var request = new XMLHttpRequest();
            request.open('GET', url, true);

            // store request
            self.storeRequest(request);

            // optional request headers
            if ( typeof options.requestHeaders !== "undefined" ) {
                var requestHeaders = options.requestHeaders;
                for (var j = 0; j < requestHeaders.length; ++j) {
                    if ( typeof requestHeaders[j].name !== "undefined" &&
                        typeof requestHeaders[j].value !== "undefined" ) {
                        request.setRequestHeader(requestHeaders[j].name, requestHeaders[j].value);
                    }
                }
            }

            // bind reader progress
            request.onprogress = mproghandler.getMonoProgressHandler(i, 0);
            request.onloadend = mproghandler.getMonoOnLoadEndHandler(i, 0);

            // find a loader
            var foundLoader = false;
            for (var l = 0; l < loaders.length; ++l) {
                loader = loaders[l];
                if (loader.canLoadUrl(url)) {
                    foundLoader = true;

                    // set loader callacks
                    // loader.onloadstart: nothing to do
                    if (typeof loader.onloaditem === "undefined") {
                        // handle load-item locally
                        loader.onload = augmentCallbackEvent(self.addLoadItem, url);
                    } else {
                        loader.onloaditem = self.onloaditem;
                        loader.onload = augmentCallbackEvent(self.addLoad, url);
                    }
                    loader.onloadend = augmentCallbackEvent(self.addLoadend, ioArray);
                    loader.onerror = augmentCallbackEvent(self.onerror, url);
                    loader.onabort = augmentCallbackEvent(self.onabort, url);

                    // store loader
                    self.storeLoader(loader);

                    // set request callbacks
                    // request.onloadstart: nothing to do
                    request.onload = getLoadHandler(loader, url, i);
                    // request.onloadend: nothing to do
                    request.onerror = augmentCallbackEvent(self.onerror, url);
                    request.onabort = augmentCallbackEvent(self.onabort, url);
                    // response type (default is 'text')
                    if (loader.loadUrlAs() === dwv.io.urlContentTypes.ArrayBuffer) {
                        request.responseType = "arraybuffer";
                    }
                    // send request
                    request.send(null);
                    // next file
                    break;
                }
            }
            // TODO: throw?
            if (!foundLoader) {
                throw new Error("No loader found for url: "+url);
            }
        }
    };

    // DICOMDIR load
    var internalDicomDirLoad = function (dicomDirUrl) {
        console.log("UrlsLoader: using a DICOMDIR.");
        // read DICOMDIR
        var dirRequest = new XMLHttpRequest();
        dirRequest.open('GET', dicomDirUrl, true);
        dirRequest.responseType = "arraybuffer";
        dirRequest.onload = function (/*event*/) {
            // get the file list
            var list = dwv.dicom.getFileListFromDicomDir( this.response );
            // use the first list
            var urls = list[0][0];
            // append root url
            var rootUrl = dwv.utils.getRootPath(dicomDirUrl);
            var fullUrls = [];
            for ( var i = 0; i < urls.length; ++i ) {
                fullUrls.push( rootUrl + "/" + urls[i]);
            }
            internalUrlsLoad(fullUrls);
        };
        dirRequest.onerror = augmentCallbackEvent(self.onerror, dicomDirUrl);
        dirRequest.onabort = augmentCallbackEvent(self.onabort, dicomDirUrl);
        // send request
        dirRequest.send(null);
    };

    // check if DICOMDIR case
    if ( ioArray.length === 1 &&
        (dwv.utils.endsWith(ioArray[0], "DICOMDIR") ||
         dwv.utils.endsWith(ioArray[0], ".dcmdir") ) ) {
        internalDicomDirLoad(ioArray[0]);
    } else {
        internalUrlsLoad(ioArray);
    }
};

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle a load item event.
 * @param {Object} event The load item event fired
 *   when a file item has been loaded successfully.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onloaditem = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onabort = function (/*event*/) {};
