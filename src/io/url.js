/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function(ioArray) 
{
    // create closure to the class data
    var onload = this.onload;
    var onerror = this.onerror;
    
    // Request error
    var onErrorRequest = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while retrieving the file: (http) "+this.status } );
    };

    // DICOM request loader
    var onLoadDicomRequest = function(response)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(response);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image request loader
    var onLoadImageRequest = function(event)
    {
        // parse image data
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Request handler
    var onLoadRequest = function(event)
    {
        // find the image type
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        
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
            if(isJpeg) imageType = "jpeg";
            else if(isPng) imageType = "png";
            else if(isGif) imageType = "gif";
            // temporary image object
            var tmpImage = new Image();
            tmpImage.src = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
            tmpImage.onload = onLoadImageRequest;
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
        var request = new XMLHttpRequest();
        // TODO Verify URL...
        request.open('GET', url, true);
        request.responseType = "arraybuffer"; 
        request.onload = onLoadRequest;
        request.onerror = onErrorRequest;
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
    }
};
