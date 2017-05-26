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
 * @param {Object} event The error event, 'event.message'
 *  should be the error message.
 * Default does nothing.
 */
dwv.io.UrlsLoader.prototype.onerror = function (/*event*/) {};

/**
 * Load a list of URLs.
 * @param {Array} ioArray The list of urls to load.
 * @param {Object} options Load options.
 * @external XMLHttpRequest
 */
dwv.io.UrlsLoader.prototype.load = function (ioArray, options)
{
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
        loader.setOptions({
            'defaultCharacterSet': this.getDefaultCharacterSet()
        });
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
    }

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var url = ioArray[i];
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

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

        // find a loader
        var foundLoader = false;
        for (var l = 0; l < loaders.length; ++l) {
            loader = loaders[l];
            if (loader.canLoadUrl(url)) {
                foundLoader = true;
                // set reader callbacks
                request.onload = loader.getUrlLoadHandler(url, i);
                request.onerror = loader.getErrorHandler(url);
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
