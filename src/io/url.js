/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Request error handler.
 * @method onErrorRequest
 * @static
 * @param {Object} event An error event.
 */
dwv.io.onErrorRequest = function(event)
{
    alert("An error occurred while retrieving the file: (http) "+this.status);
};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function()
{
    this.onload = null;
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
    
    // DICOM request loader
    var onLoadDicomRequest = function(response)
    {
        // parse DICOM file
        var tmpdata = dwv.image.getDataFromDicomBuffer(response);
        // call listener
        onload(tmpdata);
    };

    // Image request loader
    var onLoadImageRequest = function(event)
    {
        // parse image data
        var tmpdata = dwv.image.getDataFromImage(this);
        // call listener
        onload(tmpdata);
    };

    // Request handler
    var onLoadRequest = function(event)
    {
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        if( isJpeg || isPng || isGif ) {
            // image data
            var theImage = new Image();

            var bytes = new Uint8Array(this.response);
            var binary = '';
            for (var i = 0; i < bytes.byteLength; ++i) {
                binary += String.fromCharCode(bytes[i]);
            }
            var imgStr = "unknown";
            if (isJpeg) imgStr = "jpeg";
            else if (isPng) imgStr = "png";
            else if (isGif) imgStr = "gif";
            theImage.src = "data:image/" + imgStr + ";base64," + window.btoa(binary);
            
            theImage.onload = onLoadImageRequest;
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
        request.onerror = dwv.io.onErrorRequest;
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
    }
};

//Add the loader to the loader list
dwv.io.loaders = dwv.io.loaders || {};
dwv.io.loaders.url = dwv.io.Url;
