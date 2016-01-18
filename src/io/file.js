/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
/**
 * Namespace for I/O functions.
 * @class io
 * @namespace dwv
 * @static
 */
dwv.io = dwv.io || {};

/**
 * File loader.
 * @class File
 * @namespace dwv.io
 * @constructor
 */
dwv.io.File = function ()
{
    /**
     * Number of data to load.
     * @property nToLoad
     * @private
     * @type Number
     */
    var nToLoad = 0;
    /**
     * Number of loaded data.
     * @property nLoaded
     * @private
     * @type Number
     */
    var nLoaded = 0;
    /**
     * List of progresses.
     * @property progressList
     * @private
     * @type Array
     */
    var progressList = [];

    /**
     * Set the number of data to load.
     * @method setNToLoad
     */
    this.setNToLoad = function (n) {
        nToLoad = n;
        for ( var i = 0; i < nToLoad; ++i ) {
            progressList[i] = 0;
        }
    };

    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     * @method addLoaded
     */
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            this.onloadend();
        }
    };

    /**
     * Get the global load percent including the provided one.
     * @method getGlobalPercent
     * @param {Number} n The number of the loaded data.
     * @param {Number} percent The percentage of data 'n' that has been loaded.
     * @return {Number} The accumulated percentage.
     */
    this.getGlobalPercent = function (n, percent) {
        progressList[n] = percent/nToLoad;
        var totPercent = 0;
        for ( var i = 0; i < progressList.length; ++i ) {
            totPercent += progressList[i];
        }
        return totPercent;
    };
}; // class File

/**
 * Handle a load event.
 * @method onload
 * @param {Object} event The load event, event.target
 *  should be the loaded data.
 */
dwv.io.File.prototype.onload = function (/*event*/)
{
    // default does nothing.
};
/**
 * Handle a load end event.
 * @method onloadend
 */
dwv.io.File.prototype.onloadend = function ()
{
    // default does nothing.
};
/**
 * Handle a progress event.
 * @method onprogress
 */
dwv.io.File.prototype.onprogress = function ()
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @method onerror
 * @param {Object} event The error event, event.message
 *  should be the error message.
 */
dwv.io.File.prototype.onerror = function (/*event*/)
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @method createErrorHandler
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
 * Create an progress handler from a base one and locals.
 * @method createProgressHandler
 * @param {Number} n The number of the loaded data.
 * @param {Function} calculator The load progress accumulator.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.File.createProgressHandler = function (n, calculator, baseHandler) {
    return function (event) {
        if( event.lengthComputable )
        {
            var percent = Math.round((event.loaded / event.total) * 100);
            var ev = {type: "load-progress", lengthComputable: true,
                loaded: calculator(n, percent), total: 100};
            baseHandler(ev);
        }
    };
};

/**
 * Load a list of files.
 * @method load
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function (ioArray)
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    // call the listeners
    var onLoad = function (data)
    {
        self.onload(data);
        self.addLoaded();
    };

    // DICOM reader loader
    var onLoadDicomReader = function (event)
    {
        try {
            //onLoad( dwv.image.getDataFromDicomBuffer(event.target.result) );
            dwv.image.getDataFromDicomBuffer(event.target.result, onLoad);
        } catch(error) {
            self.onerror(error);
        }
    };

    // image loader
    var onLoadImage = function (/*event*/)
    {
        try {
            onLoad( dwv.image.getDataFromImage(this) );
        } catch(error) {
            self.onerror(error);
        }
    };

    // text reader loader
    var onLoadTextReader = function (event)
    {
        try {
            onLoad( event.target.result );
        } catch(error) {
            self.onerror(error);
        }
    };

    // image reader loader
    var onLoadImageReader = function (event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        // triggered by ctx.drawImage
        theImage.onload = onLoadImage;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();
        reader.onprogress = dwv.io.File.createProgressHandler(i,
                self.getGlobalPercent, self.onprogress);
        if ( file.name.split('.').pop().toLowerCase() === "json" )
        {
            reader.onload = onLoadTextReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "text", self.onerror);
            reader.readAsText(file);
        }
        else if ( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            // callbacks
            reader.onload = onLoadImageReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "image", self.onerror);
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "DICOM", self.onerror);
            reader.readAsArrayBuffer(file);
        }
    }
};
