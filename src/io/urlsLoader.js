// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

// url content types
dwv.io.urlContentTypes = {
    'Text': 0,
    'ArrayBuffer': 1,
    'oups': 2
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
     * Array of launched requests used in abort.
     * @private
     * @type Array
     */
    var requests = [];

    /**
     * Launched loader used in abort.
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
     * Abort a URLs load.
     */
    this.abort = function () {
        // abort requests
        for ( var i = 0; i < requests.length; ++i ) {
            // 0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED (send()), 3: LOADING, 4: DONE
            if ( requests[i].readyState === 2 || requests[i].readyState === 3 ) {
                requests[i].abort();
            }
        }
        this.clearStoredRequests();
        // abort loader
        if ( runningLoader && runningLoader.isLoading() ) {
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

}; // class Url

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle a load end event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onabort = function (/*event*/) {};

/**
 * Load a list of URLs.
 * @param {Array} ioArray The list of urls to load.
 * @param {Object} options Load options.
 * @external XMLHttpRequest
 */
dwv.io.UrlsLoader.prototype.load = function (ioArray, options)
{
    // request onerror handler
    var getRequestOnError = function (origin) {
        return function (/*event*/) {
            var message = "An error occurred while downloading '" + origin + "'";
            if (typeof this.status !== "undefined") {
                message += " (http status: " + this.status + ")";
            }
            message += ".";
            self.onerror( {'name': "RequestError", 'message': message } );
        };
    };

    // request onabort handler
    var getRequestOnAbort = function (origin) {
        return function () {
            self.onabort( {'message': "Abort while downloading '" + origin + "'." } );
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
                'defaultCharacterSet': self.getDefaultCharacterSet()
            });
            loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
        }

        // loop on I/O elements
        for (var i = 0; i < urlsArray.length; ++i)
        {
            var url = urlsArray[i];
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
                    // store loader
                    self.storeLoader(loader);
                    // set reader callbacks
                    request.onload = loader.getUrlLoadHandler(url, i);
                    request.onerror = getRequestOnError(url);
                    request.onabort = getRequestOnAbort(url);
                    // response type (default is 'text')
                    if (loader.loadUrlAs() === dwv.io.urlContentTypes.ArrayBuffer) {
                        request.responseType = "arraybuffer";
                    }
                    // read
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
            var rootUrl = dicomDirUrl.substr( 0, (dicomDirUrl.length - "DICOMDIR".length - 1 ) );
            var fullUrls = [];
            for ( var i = 0; i < urls.length; ++i ) {
                fullUrls.push( rootUrl + "/" + urls[i]);
            }
            internalUrlsLoad(fullUrls);
        };
        dirRequest.onerror = getRequestOnError(dicomDirUrl);
        dirRequest.onabort = getRequestOnAbort(dicomDirUrl);
        dirRequest.send(null);
    };

    // check if DICOMDIR case
    if ( ioArray.length === 1 && dwv.utils.endsWith(ioArray[0], "DICOMDIR") ) {
        internalDicomDirLoad(ioArray[0]);
    } else {
        internalUrlsLoad(ioArray);
    }
};
