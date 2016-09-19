// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @constructor
 */
dwv.io.Url = function ()
{
    /**
     * CLosure to self.
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
     * List of load progresses.
     * @private
     * @type Array
     */
    var loadProgresses = [];
    /**
     * List of decode progresses.
     * @private
     * @type Array
     */
    var decodeProgresses = [];

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
        for ( var i = 0; i < nToLoad; ++i ) {
            loadProgresses[i] = 0;
            decodeProgresses[i] = 0;
        }
    };

    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     */
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            this.onloadend();
        }
    };

    /**
     * Handle a load progress.
     * @param {Number} n The number of the loaded data.
     * @param {Number} percent The percentage of data 'n' that has been loaded.
     */
    this.onLoadProgress = function (n, percent) {
        loadProgresses[n] = percent;
        self.onprogress({type: "load-progress", lengthComputable: true,
            loaded: getGlobalPercent(), total: 100});
    };

    /**
     * Handle a decode progress.
     * @param {Object} event The progress event.
     */
    this.onDecodeProgress = function (event) {
        // use the internal count as index
        decodeProgresses[nLoaded] = event.loaded;
        self.onprogress({type: "load-progress", lengthComputable: true,
            loaded: getGlobalPercent(), total: 100});
    };

    /**
     * Get the global load percent including the provided one.
     * @return {Number} The accumulated percentage.
     */
    function getGlobalPercent() {
        var sum = 0;
        for ( var i = 0; i < loadProgresses.length; ++i ) {
            sum += loadProgresses[i];
            sum += decodeProgresses[i];
        }
        // half loading, half decoding
        return sum / (2 * nToLoad);
    }
    
}; // class Url

/**
 * Handle a load event.
 * @param {Object} event The load event, event.target
 *  should be the loaded data.
 */
dwv.io.Url.prototype.onload = function (/*event*/)
{
    // default does nothing.
};
/**
 * Handle a load end event.
 */
dwv.io.Url.prototype.onloadend = function ()
{
    // default does nothing.
};
/**
 * Handle a progress event.
 */
dwv.io.File.prototype.onprogress = function ()
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @param {Object} event The error event, event.message
 *  should be the error message.
 */
dwv.io.Url.prototype.onerror = function (/*event*/)
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @param {String} url The related url.
 * @param {String} text The text to insert in the message.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.Url.createErrorHandler = function (url, text, baseHandler) {
    return function (/*event*/) {
        baseHandler( {'name': "RequestError",
            'message': "An error occurred while retrieving the " + text + " file (via http): " + url +
            " (status: "+this.status + ")" } );
    };
};

/**
 * Create a load progress event handler.
 * @param {Number} n The number of the loaded data.
 * @param {Function} loadProgressHandler A load progress percent handler.
 */
dwv.io.File.createLoadProgressHandler = function (n, loadProgressHandler) {
    return function (event) {
        if( event.lengthComputable )
        {
            var percent = Math.round((event.loaded / event.total) * 100);
            loadProgressHandler(n, percent);
        }
    };
};

/**
 * Load a list of URLs.
 * @param {Array} ioArray The list of urls to load.
 * @param {Array} requestHeaders An array of {name, value} to use as request headers.
 */
dwv.io.Url.prototype.load = function (ioArray, requestHeaders)
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    // call the listeners
    var onLoadView = function (data)
    {
        self.onload(data);
    };

    // DICOM buffer to dwv.image.View (asynchronous)
    var db2v = new dwv.image.DicomBufferToView();
    db2v.setDefaultCharacterSet(this.getDefaultCharacterSet());
    db2v.onload = function () {
        self.addLoaded();
    };
    db2v.onprogress = function (event) {
        self.onDecodeProgress(event);
    };
    // callback
    var onLoadDicomBuffer = function (response)
    {
        try {
            db2v.convert(response, onLoadView);
        } catch (error) {
            self.onerror(error);
        }
    };

    // DOM Image buffer to dwv.image.View
    var onLoadDOMImageBuffer = function (/*event*/)
    {
        try {
            onLoadView( dwv.image.getViewFromDOMImage(this) );
        } catch (error) {
            self.onerror(error);
        }
    };

    // load text buffer
    var onLoadTextBuffer = function (/*event*/)
    {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        // status 200: "OK"; status 0: "debug"
        if (this.status !== 200 && this.status !== 0) {
            this.onerror();
            return;
        }

        try {
            self.onload( this.responseText );
        } catch (error) {
            self.onerror(error);
        }
    };

    // load binary buffer
    var onLoadBinaryBuffer = function (/*event*/)
    {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        // status 200: "OK"; status 0: "debug"
        if (this.status !== 200 && this.status !== 0) {
            this.onerror();
            return;
        }
        
        // find the image type from its signature
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;

        // check possible extension
        // (responseURL is supported on major browsers but not IE...)
        if ( !isJpeg && !isPng && !isGif && this.responseURL )
        {
            var ext = this.responseURL.split('.').pop().toLowerCase();
            isJpeg = (ext === "jpg") || (ext === "jpeg");
            isPng = (ext === "png");
            isGif = (ext === "gif");
        }

        // non DICOM
        if( isJpeg || isPng || isGif )
        {
            // image data as string
            var bytes = new Uint8Array(this.response);
            var imageDataStr = '';
            for( var i = 0; i < bytes.byteLength; ++i ) {
                imageDataStr += String.fromCharCode(bytes[i]);
            }
            // image type
            var imageType = "unknown";
            if(isJpeg) {
                imageType = "jpeg";
            }
            else if(isPng) {
                imageType = "png";
            }
            else if(isGif) {
                imageType = "gif";
            }
            // temporary image object
            var tmpImage = new Image();
            tmpImage.src = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
            tmpImage.onload = onLoadDOMImageBuffer;
        }
        else
        {
            onLoadDicomBuffer(this.response);
        }
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var url = ioArray[i];
        // read as text according to extension
        var isText = ( url.split('.').pop().toLowerCase() === "json" );

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        if ( typeof requestHeaders !== "undefined" ) {
            for (var j = 0; j < requestHeaders.length; ++j) { 
                if ( typeof requestHeaders[j].name !== "undefined" &&
                    typeof requestHeaders[j].value !== "undefined" ) {
                    request.setRequestHeader(requestHeaders[j].name, requestHeaders[j].value);
                }
            }
        }
        if ( !isText ) {
            request.responseType = "arraybuffer";
            request.onload = onLoadBinaryBuffer;
            request.onerror = dwv.io.Url.createErrorHandler(url, "binary", self.onerror);
        }
        else {
            request.onload = onLoadTextBuffer;
            request.onerror = dwv.io.Url.createErrorHandler(url, "text", self.onerror);
        }
        request.onprogress = dwv.io.File.createLoadProgressHandler(i, self.onLoadProgress);
        request.send(null);
    }
};
