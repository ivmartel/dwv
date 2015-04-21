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
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function ()
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
     * Set the number of data to load.
     * @method setNToLoad
     */ 
    this.setNToLoad = function (n) { nToLoad = n; };
    
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
}; // class Url

/**
 * Handle a load event.
 * @method onload
 * @param {Object} event The load event, event.target 
 *  should be the loaded data.
 */
dwv.io.Url.prototype.onload = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle a load end event.
 * @method onloadend
 */
dwv.io.Url.prototype.onloadend = function () 
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @method onerror
 * @param {Object} event The error event, event.message 
 *  should be the error message.
 */
dwv.io.Url.prototype.onerror = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @method createErrorHandler
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
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function (ioArray) 
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

    // DICOM request
    var onLoadDicomRequest = function (response)
    {
        try {
            onLoad( dwv.image.getDataFromDicomBuffer(response) );
        } catch (error) {
            self.onerror(error);
        }
    };

    // image request
    var onLoadImage = function (/*event*/)
    {
        try {
            onLoad( dwv.image.getDataFromImage(this) );
        } catch (error) {
            self.onerror(error);
        }
    };

    // text request
    var onLoadTextRequest = function (/*event*/)
    {
        try {
            onLoad( this.responseText );
        } catch (error) {
            self.onerror(error);
        }
    };
    
    // binary request
    var onLoadBinaryRequest = function (/*event*/)
    {
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
            tmpImage.onload = onLoadImage;
        }
        else
        {
            onLoadDicomRequest(this.response);
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
        if ( !isText ) {
            request.responseType = "arraybuffer"; 
            request.onload = onLoadBinaryRequest;
            request.onerror = dwv.io.Url.createErrorHandler(url, "binary", self.onerror);
        }
        else {
            request.onload = onLoadTextRequest;
            request.onerror = dwv.io.Url.createErrorHandler(url, "text", self.onerror);
        }
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
    }
};
