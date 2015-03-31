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
dwv.io.File = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of files.
 * @method load
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function(ioArray) 
{
    // create closure to the onload method
    var onload = this.onload;
    var onerror = this.onerror;

    // Request error
    var onErrorImageReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the image file: "+event.getMessage() } );
    };


    // Request error
    var onErrorDicomReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the DICOM file: "+event.getMessage() } );
    };
    
    // Request error
    var onErrorJSONReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the JSON file: "+event.getMessage() } );
    };

    // DICOM reader loader
    var onLoadDicomReader = function(event)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(event.target.result);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
        // force 100% progress (sometimes with firefox)
        var endEvent = {lengthComputable: true, loaded: 1, total: 1};
        dwv.gui.updateProgress(endEvent);
    };

    // JSON loader
    var onLoadJSONReader = function(event)
    {
        // parse image file
        try {
            // call listener
            onload(event.target.result);
        } catch(error) {
            onerror(error);
        }
    };

    // Image loader
    var onLoadImageFile = function(/*event*/)
    {
        // parse image file
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image reader loader
    var onLoadImageReader = function(event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        // triggered by ctx.drawImage
        theImage.onload = onLoadImageFile;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();
        if ( file.name.split('.').pop().toLowerCase() === "json" )
        {
            reader.onload = onLoadJSONReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorJSONReader;
            reader.readAsText(file);
        }
        else if ( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            // callbacks
            reader.onload = onLoadImageReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorImageReader;
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorDicomReader;
            reader.readAsArrayBuffer(file);
        }
    }
};
