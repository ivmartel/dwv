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
     * Input data.
     * @private
     * @type Array
     */
    var inputData = null;

    /**
     * Array of launched requests.
     * @private
     * @type Array
     */
    var requests = [];

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
        clearStoredRequests();
        clearStoredLoader();
    }

    /**
     * Store a launched request.
     * @param {Object} request The launched request.
     * @private
     */
    function storeRequest(request) {
        requests.push(request);
    }

    /**
     * Clear the stored requests.
     * @private
     */
    function clearStoredRequests() {
        requests = [];
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
     * Augment a callback event with a srouce.
     * @param {Object} callback The callback to augment its event.
     * @param {Object} source The source to add to the event.
     * @private
     */
    function augmentCallbackEvent(callback, source) {
        return function (event) {
            event.source = source;
            callback(event);
        };
    }

    /**
     * Load a list of URLs or a DICOMDIR.
     * @param {Array} data The list of urls to load.
     * @param {Object} options Load options.
     */
    this.load = function (data, options)
    {
        // check if DICOMDIR case
        if ( data.length === 1 &&
            (dwv.utils.endsWith(data[0], "DICOMDIR") ||
             dwv.utils.endsWith(data[0], ".dcmdir") ) ) {
            loadDicomDir(data[0], options);
        } else {
            loadUrls(data, options);
        }
    };

    /**
     * Load a list of urls.
     * @param {Array} data The list of urls to load.
     * @param {Object} options Load options.
     * @private
     */
    function loadUrls(data, options) {
        // check input
        if (typeof data === "undefined" || data.length === 0) {
            return;
        }
        storeInputData(data);

        // send start event
        self.onloadstart({
            source: data
        });

        // create prgress handler
        var mproghandler = new dwv.utils.MultiProgressHandler(self.onprogress);
        mproghandler.setNToLoad(data.length);

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
            if (loader.canLoadUrl(dataElement)) {
                foundLoader = true;
                // load options
                loader.setOptions({
                    'defaultCharacterSet': self.getDefaultCharacterSet()
                });
                // set loader callbacks
                // loader.onloadstart: nothing to do
                loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
                if (typeof loader.onloaditem === "undefined") {
                    // handle load-item locally
                    loader.onload = addLoadItem;
                } else {
                    loader.onloaditem = self.onloaditem;
                    loader.onload = addLoad;
                }
                // loader.onloadend: let the request handle it
                loader.onerror = self.onerror;
                loader.onabort = self.onabort;

                // store loader
                storeLoader(loader);
                // exit
                break;
            }
        }
        if (!foundLoader) {
            throw new Error("No loader found for url: "+dataElement);
        }

        var getLoadHandler = function (loader, dataElement, i) {
            return function (event) {
                // check response status
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
                // status 200: "OK"; status 0: "debug"
                var status = event.target.status;
                if (status !== 200 && status !== 0) {
                    self.onerror({
                        source: dataElement,
                        error: "GET " + event.target.responseURL +
                            " " + event.target.status +
                            " (" + event.target.statusText + ")",
                        target: event.target
                    });
                } else {
                    loader.load(event.target.response, dataElement, i);
                }
            };
        };

        // loop on I/O elements
        for (var i = 0; i < data.length; ++i) {
            dataElement = data[i];

            // check loader
            if (!loader.canLoadUrl(dataElement)) {
                throw new Error("Input url of different type: "+dataElement);
            }
            /**
             * The http request.
             * @external XMLHttpRequest
             * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
             */
            var request = new XMLHttpRequest();
            request.open('GET', dataElement, true);
            // store request
            storeRequest(request);

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
            // optional withCredentials
            if (typeof options.withCredentials !== "undefined") {
                request.withCredentials = options.withCredentials;
            }

            // set request callbacks
            // request.onloadstart: nothing to do
            request.onprogress = augmentCallbackEvent(
                mproghandler.getMonoProgressHandler(i, 0), dataElement);
            request.onload = getLoadHandler(loader, dataElement, i);
            request.onloadend = addLoadend;
            request.onerror = augmentCallbackEvent(self.onerror, dataElement);
            request.onabort = augmentCallbackEvent(self.onabort, dataElement);
            // response type (default is 'text')
            if (loader.loadUrlAs() === dwv.io.urlContentTypes.ArrayBuffer) {
                request.responseType = "arraybuffer";
            }
            // send request
            request.send(null);
        }
    }

    /**
     * Load a DICOMDIR.
     * @param {string} dicomDirUrl The DICOMDIR url.
     * @param {Object} options Load options.
     * @private
     */
    function loadDicomDir(dicomDirUrl, options) {
        // read DICOMDIR
        var request = new XMLHttpRequest();
        request.open('GET', dicomDirUrl, true);
        request.responseType = "arraybuffer";
        // request.onloadstart: nothing to do
        request.onload = function (event) {
            // get the file list
            var list = dwv.dicom.getFileListFromDicomDir(event.target.response);
            // use the first list
            var urls = list[0][0];
            // append root url
            var rootUrl = dwv.utils.getRootPath(dicomDirUrl);
            var fullUrls = [];
            for (var i = 0; i < urls.length; ++i) {
                fullUrls.push(rootUrl + "/" + urls[i]);
            }
            // load urls
            loadUrls(fullUrls, options);
        };
        request.onerror = function (event) {
            augmentCallbackEvent(self.onerror, dicomDirUrl)(event);
            self.onloadend();
        };
        request.onabort = function (event) {
            augmentCallbackEvent(self.onabort, dicomDirUrl)(event);
            self.onloadend();
        };
        // request.onloadend: nothing to do
        // send request
        request.send(null);
    }

    /**
     * Abort a load.
     */
    this.abort = function () {
        // abort requests
        for ( var i = 0; i < requests.length; ++i ) {
            // 0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED (send()), 3: LOADING, 4: DONE
            if ( requests[i].readyState !== 4 ) {
                requests[i].abort();
            }
        }
        // abort loader
        if (runningLoader && runningLoader.isLoading()) {
            runningLoader.abort();
        }
        // send load end
        this.onloadend({
            source: inputData
        });
    };

}; // class UrlsLoader

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
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
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
