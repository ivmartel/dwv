// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.io = dwv.io || {};

/**
 * File loader.
 * @constructor
 */
dwv.io.File = function ()
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
     * Flag to tell if the IO needs decoding.
     * @private
     * @type Boolean
     */
    var needDecoding = false;

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
     * Set the need decodign flag
     * @param {Boolean} flag True if the data needs decoding.
     */
    this.setNeedDecoding = function (flag) {
        needDecoding = flag;
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
            if ( needDecoding ) {
                sum += decodeProgresses[i];
            }
        }
        var percent = sum / nToLoad;
        // half loading, half decoding
        if ( needDecoding ) {
            percent = percent / 2;
        }
        return percent;
    }

}; // class File

/**
 * Handle a load event.
 * @param {Object} event The load event, event.target
 *  should be the loaded data.
 */
dwv.io.File.prototype.onload = function (/*event*/)
{
    // default does nothing.
};
/**
 * Handle a load end event.
 */
dwv.io.File.prototype.onloadend = function ()
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
dwv.io.File.prototype.onerror = function (/*event*/)
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @param {String} file The related file.
 * @param {String} text The text to insert in the message.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.File.createErrorHandler = function (file, text, baseHandler) {
    return function (event) {
        baseHandler( {'name': "RequestError",
            'message': "An error occurred while reading the " + text + " file: " + file +
            " ("+event.getMessage() + ")" } );
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
 * Load a list of files.
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function (ioArray)
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    // call the onload listener
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
    // reader callback
    var onLoadDicomBuffer = function (event)
    {
        self.setNeedDecoding(true);
        try {
            db2v.convert(event.target.result, onLoadView);
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
    var onLoadTextBuffer = function (event)
    {
        try {
            self.onload( event.target.result );
        } catch(error) {
            self.onerror(error);
        }
    };

    // raw image to DOM Image
    var onLoadRawImageBuffer = function (event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        // triggered by ctx.drawImage
        theImage.onload = onLoadDOMImageBuffer;
    };

    // loop on I/O elements
    // for (var i = 0; i < ioArray.length; ++i)
    var reader = new FileReader();
    (function readFile(i)
    {
        i++;
        if(i===ioArray.length){ return; }

        var file = ioArray[i];
        reader.onprogress = dwv.io.File.createLoadProgressHandler(i, self.onLoadProgress);
        if ( file.name.split('.').pop().toLowerCase() === "json" )
        {
            reader.onload = onLoadTextBuffer;
            reader.onerror = dwv.io.File.createErrorHandler(file, "text", self.onerror);
            reader.readAsText(file);
        }
        else if ( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            // callbacks
            reader.onload = onLoadRawImageBuffer;
            reader.onerror = dwv.io.File.createErrorHandler(file, "image", self.onerror);
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomBuffer;
            reader.onerror = dwv.io.File.createErrorHandler(file, "DICOM", self.onerror);
            reader.readAsArrayBuffer(file);
        }

        reader.onloadend = function(){ readFile(i); };
    }
    )(-1);
};
