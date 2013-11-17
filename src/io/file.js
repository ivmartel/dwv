/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Image reader error handler.
 * @method onErrorImageReader
 * @static
 * @param {Object} event An error event.
 */
dwv.io.onErrorImageReader = function(event)
{
    alert("An error occurred while reading the image file: "+event.getMessage());
};

/**
 * DICOM reader error handler.
 * @method onErrorImageReader
 * @static
 * @param {Object} event An error event.
 */
dwv.io.onErrorDicomReader = function(event)
{
    alert("An error occurred while reading the DICOM file: "+event.getMessage());
};

/**
 * File loader.
 * @class File
 * @namespace dwv.io
 * @constructor
 */
dwv.io.File = function()
{
    this.onload = null;
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

    // DICOM reader loader
    var onLoadDicomReader = function(event)
    {
        // parse DICOM file
        var tmpdata = dwv.image.getDataFromDicomBuffer(event.target.result);
        // call listener
        onload(tmpdata);
    };

    // Image loader
    var onLoadImageFile = function(event)
    {
        // parse image file
        var tmpdata = dwv.image.getDataFromImage(this);
        // call listener
        onload(tmpdata);
    };

    // Image reader loader
    var onLoadImageReader = function(event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        theImage.onload = onLoadImageFile;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();
        if( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            reader.onload = onLoadImageReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = dwv.io.onErrorImageReader;
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = dwv.io.onErrorDicomReader;
            reader.readAsArrayBuffer(file);
        }
    }
};

//Add the loader to the loader list
dwv.io.loaders = dwv.io.loaders || {};
dwv.io.loaders.file = dwv.io.File;

